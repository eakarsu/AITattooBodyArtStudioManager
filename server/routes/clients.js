const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/clients
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get client error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/clients
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, dob, medical_history, allergies, skin_type, emergency_contact, emergency_phone, notes, loyalty_points } = req.body;
    const result = await pool.query(
      `INSERT INTO clients (name, email, phone, dob, medical_history, allergies, skin_type, emergency_contact, emergency_phone, notes, loyalty_points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, email, phone, dob, medical_history, allergies, skin_type, emergency_contact, emergency_phone, notes, loyalty_points || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/clients/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, dob, medical_history, allergies, skin_type, emergency_contact, emergency_phone, notes, loyalty_points } = req.body;
    const result = await pool.query(
      `UPDATE clients SET name = $1, email = $2, phone = $3, dob = $4, medical_history = $5, allergies = $6,
       skin_type = $7, emergency_contact = $8, emergency_phone = $9, notes = $10, loyalty_points = $11
       WHERE id = $12 RETURNING *`,
      [name, email, phone, dob, medical_history, allergies, skin_type, emergency_contact, emergency_phone, notes, loyalty_points, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted', client: result.rows[0] });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
