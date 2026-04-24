const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/commissions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cm.*, a.name AS artist_name, ap.date AS appointment_date, ap.service_type
      FROM commissions cm
      LEFT JOIN artists a ON cm.artist_id = a.id
      LEFT JOIN appointments ap ON cm.appointment_id = ap.id
      ORDER BY cm.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get commissions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/commissions/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cm.*, a.name AS artist_name, ap.date AS appointment_date, ap.service_type
      FROM commissions cm
      LEFT JOIN artists a ON cm.artist_id = a.id
      LEFT JOIN appointments ap ON cm.appointment_id = ap.id
      WHERE cm.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commission not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get commission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/commissions
router.post('/', async (req, res) => {
  try {
    const { artist_id, appointment_id, service_amount, commission_rate, commission_amount, tip_amount, payment_method, status, pay_period } = req.body;
    const calcCommission = commission_amount || (service_amount * (commission_rate / 100));
    const result = await pool.query(
      `INSERT INTO commissions (artist_id, appointment_id, service_amount, commission_rate, commission_amount, tip_amount, payment_method, status, pay_period)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [artist_id, appointment_id, service_amount || 0, commission_rate || 0, calcCommission, tip_amount || 0, payment_method, status || 'pending', pay_period]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create commission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/commissions/:id
router.put('/:id', async (req, res) => {
  try {
    const { artist_id, appointment_id, service_amount, commission_rate, commission_amount, tip_amount, payment_method, status, pay_period } = req.body;
    const result = await pool.query(
      `UPDATE commissions SET artist_id = $1, appointment_id = $2, service_amount = $3, commission_rate = $4,
       commission_amount = $5, tip_amount = $6, payment_method = $7, status = $8, pay_period = $9
       WHERE id = $10 RETURNING *`,
      [artist_id, appointment_id, service_amount, commission_rate, commission_amount, tip_amount, payment_method, status, pay_period, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commission not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update commission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/commissions/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM commissions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commission not found' });
    }
    res.json({ message: 'Commission deleted', commission: result.rows[0] });
  } catch (err) {
    console.error('Delete commission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
