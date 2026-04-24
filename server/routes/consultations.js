const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/consultations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT co.*, c.name AS client_name, c.email AS client_email,
             a.name AS artist_name, a.specialties AS artist_specialties
      FROM consultations co
      LEFT JOIN clients c ON co.client_id = c.id
      LEFT JOIN artists a ON co.artist_id = a.id
      ORDER BY co.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get consultations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/consultations/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT co.*, c.name AS client_name, c.email AS client_email,
             a.name AS artist_name, a.specialties AS artist_specialties
      FROM consultations co
      LEFT JOIN clients c ON co.client_id = c.id
      LEFT JOIN artists a ON co.artist_id = a.id
      WHERE co.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get consultation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/consultations
router.post('/', async (req, res) => {
  try {
    const { client_id, artist_id, date, design_description, style_preferences, reference_images, size_estimate, placement, budget, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO consultations (client_id, artist_id, date, design_description, style_preferences, reference_images, size_estimate, placement, budget, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [client_id, artist_id, date, design_description, style_preferences, reference_images, size_estimate, placement, budget, status || 'pending', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create consultation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/consultations/:id
router.put('/:id', async (req, res) => {
  try {
    const { client_id, artist_id, date, design_description, style_preferences, reference_images, size_estimate, placement, budget, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE consultations SET client_id = $1, artist_id = $2, date = $3, design_description = $4,
       style_preferences = $5, reference_images = $6, size_estimate = $7, placement = $8,
       budget = $9, status = $10, notes = $11 WHERE id = $12 RETURNING *`,
      [client_id, artist_id, date, design_description, style_preferences, reference_images, size_estimate, placement, budget, status, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update consultation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/consultations/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM consultations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json({ message: 'Consultation deleted', consultation: result.rows[0] });
  } catch (err) {
    console.error('Delete consultation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
