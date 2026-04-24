const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/artists
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artists ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get artists error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/artists/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artists WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get artist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/artists
router.post('/', async (req, res) => {
  try {
    const { name, specialties, bio, experience_years, hourly_rate, commission_rate, portfolio_url, instagram, available, rating } = req.body;
    const result = await pool.query(
      `INSERT INTO artists (name, specialties, bio, experience_years, hourly_rate, commission_rate, portfolio_url, instagram, available, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, specialties, bio, experience_years || 0, hourly_rate || 0, commission_rate || 0, portfolio_url, instagram, available !== false, rating || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create artist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/artists/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, specialties, bio, experience_years, hourly_rate, commission_rate, portfolio_url, instagram, available, rating } = req.body;
    const result = await pool.query(
      `UPDATE artists SET name = $1, specialties = $2, bio = $3, experience_years = $4, hourly_rate = $5,
       commission_rate = $6, portfolio_url = $7, instagram = $8, available = $9, rating = $10
       WHERE id = $11 RETURNING *`,
      [name, specialties, bio, experience_years, hourly_rate, commission_rate, portfolio_url, instagram, available, rating, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update artist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/artists/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM artists WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json({ message: 'Artist deleted', artist: result.rows[0] });
  } catch (err) {
    console.error('Delete artist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
