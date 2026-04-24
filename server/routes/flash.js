const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/flash
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, a.name AS artist_name
      FROM flash_designs f
      LEFT JOIN artists a ON f.artist_id = a.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get flash designs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/flash/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, a.name AS artist_name
      FROM flash_designs f
      LEFT JOIN artists a ON f.artist_id = a.id
      WHERE f.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flash design not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get flash design error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/flash
router.post('/', async (req, res) => {
  try {
    const { artist_id, name, description, style, size, placement_suggestion, price, available, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO flash_designs (artist_id, name, description, style, size, placement_suggestion, price, available, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [artist_id, name, description, style, size, placement_suggestion, price || 0, available !== false, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create flash design error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/flash/:id
router.put('/:id', async (req, res) => {
  try {
    const { artist_id, name, description, style, size, placement_suggestion, price, available, image_url } = req.body;
    const result = await pool.query(
      `UPDATE flash_designs SET artist_id = $1, name = $2, description = $3, style = $4, size = $5,
       placement_suggestion = $6, price = $7, available = $8, image_url = $9 WHERE id = $10 RETURNING *`,
      [artist_id, name, description, style, size, placement_suggestion, price, available, image_url, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flash design not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update flash design error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/flash/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM flash_designs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flash design not found' });
    }
    res.json({ message: 'Flash design deleted', design: result.rows[0] });
  } catch (err) {
    console.error('Delete flash design error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
