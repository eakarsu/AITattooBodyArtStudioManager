const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/appointments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone,
             ar.name AS artist_name, ar.specialties AS artist_specialties
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN artists ar ON a.artist_id = ar.id
      ORDER BY a.date DESC, a.time ASC
    `);
    res.json(result.rows);
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

// POST /api/appointments
router.post('/', async (req, res) => {
  try {
    const { client_id, artist_id, date, time, duration_minutes, service_type, body_placement, size, design_description, deposit_amount, total_price, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO appointments (client_id, artist_id, date, time, duration_minutes, service_type, body_placement, size, design_description, deposit_amount, total_price, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [client_id, artist_id, date, time, duration_minutes || 60, service_type, body_placement, size, design_description, deposit_amount || 0, total_price || 0, status || 'scheduled', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  try {
    const { client_id, artist_id, date, time, duration_minutes, service_type, body_placement, size, design_description, deposit_amount, total_price, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE appointments SET client_id = $1, artist_id = $2, date = $3, time = $4, duration_minutes = $5,
       service_type = $6, body_placement = $7, size = $8, design_description = $9, deposit_amount = $10,
       total_price = $11, status = $12, notes = $13 WHERE id = $14 RETURNING *`,
      [client_id, artist_id, date, time, duration_minutes, service_type, body_placement, size, design_description, deposit_amount, total_price, status, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(result.rows[0]);
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

module.exports = router;
