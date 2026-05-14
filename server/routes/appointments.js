const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const nodemailer = require('nodemailer');

// Email transporter (uses env vars, gracefully skips if not configured)
function getTransporter() {
  if (!process.env.EMAIL_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendConfirmationEmail(appointment, clientEmail, clientName, artistName) {
  const transporter = getTransporter();
  if (!transporter || !clientEmail) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@inkstudio.com',
      to: clientEmail,
      subject: 'Appointment Confirmation - Ink Studio',
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Hi ${clientName},</p>
        <p>Your appointment has been booked successfully.</p>
        <ul>
          <li><strong>Date:</strong> ${appointment.date}</li>
          <li><strong>Time:</strong> ${appointment.time}</li>
          <li><strong>Artist:</strong> ${artistName}</li>
          <li><strong>Service:</strong> ${appointment.service_type}</li>
          <li><strong>Deposit:</strong> $${appointment.deposit_amount}</li>
        </ul>
        <p>Please arrive 15 minutes early. Eat a full meal beforehand and stay hydrated.</p>
        <p>Questions? Contact us at the studio.</p>
      `,
    });
  } catch (err) {
    console.error('Email send error:', err);
  }
}

async function checkConflict(artistId, date, time, durationMinutes, excludeId) {
  const newStart = timeToMinutes(time);
  const newEnd = newStart + (durationMinutes || 60);

  const query = excludeId
    ? `SELECT id, time, duration_minutes FROM appointments WHERE artist_id = $1 AND date = $2 AND status != 'cancelled' AND id != $3`
    : `SELECT id, time, duration_minutes FROM appointments WHERE artist_id = $1 AND date = $2 AND status != 'cancelled'`;

  const params = excludeId ? [artistId, date, excludeId] : [artistId, date];
  const result = await pool.query(query, params);

  for (const appt of result.rows) {
    const existStart = timeToMinutes(appt.time);
    const existEnd = existStart + (appt.duration_minutes || 60);
    if (newStart < existEnd && newEnd > existStart) {
      return { conflict: true, conflicting_appointment_id: appt.id };
    }
  }
  return { conflict: false };
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// GET /api/appointments — paginated
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM appointments');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT a.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone,
             ar.name AS artist_name, ar.specialties AS artist_specialties
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN artists ar ON a.artist_id = ar.id
      ORDER BY a.date DESC, a.time ASC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone,
             ar.name AS artist_name, ar.specialties AS artist_specialties
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/appointments — with conflict detection + email notification
router.post('/',
  [
    body('client_id').isInt({ min: 1 }).withMessage('Valid client_id required'),
    body('artist_id').isInt({ min: 1 }).withMessage('Valid artist_id required'),
    body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
    body('time').matches(/^\d{2}:\d{2}/).withMessage('Valid time required (HH:MM)'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        client_id, artist_id, date, time, duration_minutes,
        service_type, body_placement, size, design_description,
        deposit_amount, total_price, status, notes,
      } = req.body;

      // Conflict detection
      const conflictCheck = await checkConflict(artist_id, date, time, duration_minutes);
      if (conflictCheck.conflict) {
        return res.status(409).json({
          error: 'Scheduling conflict: artist already has an appointment at this time',
          conflicting_appointment_id: conflictCheck.conflicting_appointment_id,
        });
      }

      const result = await pool.query(
        `INSERT INTO appointments (client_id, artist_id, date, time, duration_minutes, service_type,
         body_placement, size, design_description, deposit_amount, total_price, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [client_id, artist_id, date, time, duration_minutes || 60, service_type,
         body_placement, size, design_description, deposit_amount || 0,
         total_price || 0, status || 'scheduled', notes],
      );

      const appt = result.rows[0];

      // Fetch client and artist info for email
      const [clientResult, artistResult] = await Promise.all([
        pool.query('SELECT name, email FROM clients WHERE id = $1', [client_id]),
        pool.query('SELECT name FROM artists WHERE id = $1', [artist_id]),
      ]);

      const client = clientResult.rows[0];
      const artist = artistResult.rows[0];

      // Send confirmation email (non-blocking)
      if (client) {
        sendConfirmationEmail(appt, client.email, client.name, artist?.name || 'Your artist');
      }

      res.status(201).json(appt);
    } catch (err) {
      console.error('Create appointment error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },
);

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      client_id, artist_id, date, time, duration_minutes,
      service_type, body_placement, size, design_description,
      deposit_amount, total_price, status, notes,
    } = req.body;

    // Conflict detection (exclude current appointment)
    if (artist_id && date && time) {
      const conflictCheck = await checkConflict(artist_id, date, time, duration_minutes, parseInt(req.params.id));
      if (conflictCheck.conflict) {
        return res.status(409).json({
          error: 'Scheduling conflict: artist already has an appointment at this time',
          conflicting_appointment_id: conflictCheck.conflicting_appointment_id,
        });
      }
    }

    const result = await pool.query(
      `UPDATE appointments SET client_id = $1, artist_id = $2, date = $3, time = $4,
       duration_minutes = $5, service_type = $6, body_placement = $7, size = $8,
       design_description = $9, deposit_amount = $10, total_price = $11, status = $12,
       notes = $13 WHERE id = $14 RETURNING *`,
      [client_id, artist_id, date, time, duration_minutes, service_type,
       body_placement, size, design_description, deposit_amount, total_price,
       status, notes, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appt = result.rows[0];

    // Auto-accrue commission when appointment is marked completed
    if (status === 'completed' && appt.total_price > 0) {
      try {
        const artistResult = await pool.query(
          'SELECT commission_rate FROM artists WHERE id = $1', [artist_id],
        );
        const commissionRate = artistResult.rows[0]?.commission_rate || 50;
        const commissionAmount = (appt.total_price * commissionRate) / 100;

        // Only create if commission doesn't already exist for this appointment
        const existingCommission = await pool.query(
          'SELECT id FROM commissions WHERE appointment_id = $1', [appt.id],
        );
        if (existingCommission.rows.length === 0) {
          await pool.query(
            `INSERT INTO commissions (artist_id, appointment_id, service_amount, commission_rate,
             commission_amount, status, pay_period)
             VALUES ($1, $2, $3, $4, $5, 'pending', to_char(NOW(), 'YYYY-MM'))`,
            [artist_id, appt.id, appt.total_price, commissionRate, commissionAmount],
          );
        }
      } catch (commErr) {
        console.error('Commission auto-accrual error:', commErr);
      }
    }

    res.json(appt);
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted', appointment: result.rows[0] });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/appointments/check-conflict — deterministic conflict checker
router.get('/check-conflict', async (req, res) => {
  try {
    const { artist_id, date, time, duration_minutes, exclude_id } = req.query;
    if (!artist_id || !date || !time) {
      return res.status(400).json({ error: 'artist_id, date, and time are required' });
    }
    const result = await checkConflict(artist_id, date, time, parseInt(duration_minutes) || 60, exclude_id);
    res.json(result);
  } catch (err) {
    console.error('Conflict check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
