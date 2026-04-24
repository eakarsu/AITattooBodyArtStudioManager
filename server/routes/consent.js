const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/consent
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cf.*, c.name AS client_name, a.date AS appointment_date, a.service_type
      FROM consent_forms cf
      LEFT JOIN clients c ON cf.client_id = c.id
      LEFT JOIN appointments a ON cf.appointment_id = a.id
      ORDER BY cf.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get consent forms error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/consent/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cf.*, c.name AS client_name, a.date AS appointment_date, a.service_type
      FROM consent_forms cf
      LEFT JOIN clients c ON cf.client_id = c.id
      LEFT JOIN appointments a ON cf.appointment_id = a.id
      WHERE cf.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consent form not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get consent form error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/consent
router.post('/', async (req, res) => {
  try {
    const { client_id, appointment_id, form_type, content, signed, signed_date, witness_name } = req.body;
    const result = await pool.query(
      `INSERT INTO consent_forms (client_id, appointment_id, form_type, content, signed, signed_date, witness_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [client_id, appointment_id, form_type, content, signed || false, signed_date, witness_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create consent form error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/consent/:id
router.put('/:id', async (req, res) => {
  try {
    const { client_id, appointment_id, form_type, content, signed, signed_date, witness_name } = req.body;
    const result = await pool.query(
      `UPDATE consent_forms SET client_id = $1, appointment_id = $2, form_type = $3, content = $4,
       signed = $5, signed_date = $6, witness_name = $7 WHERE id = $8 RETURNING *`,
      [client_id, appointment_id, form_type, content, signed, signed_date, witness_name, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consent form not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update consent form error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/consent/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM consent_forms WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consent form not found' });
    }
    res.json({ message: 'Consent form deleted', consent_form: result.rows[0] });
  } catch (err) {
    console.error('Delete consent form error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
