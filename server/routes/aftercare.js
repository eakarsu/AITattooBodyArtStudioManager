const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/aftercare
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM aftercare_instructions ORDER BY service_type');
    res.json(result.rows);
  } catch (err) {
    console.error('Get aftercare instructions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/aftercare/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM aftercare_instructions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aftercare instruction not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get aftercare instruction error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/aftercare
router.post('/', async (req, res) => {
  try {
    const { service_type, instructions, custom_notes } = req.body;
    const result = await pool.query(
      `INSERT INTO aftercare_instructions (service_type, instructions, custom_notes)
       VALUES ($1, $2, $3) RETURNING *`,
      [service_type, instructions, custom_notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create aftercare instruction error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/aftercare/:id
router.put('/:id', async (req, res) => {
  try {
    const { service_type, instructions, custom_notes } = req.body;
    const result = await pool.query(
      `UPDATE aftercare_instructions SET service_type = $1, instructions = $2, custom_notes = $3
       WHERE id = $4 RETURNING *`,
      [service_type, instructions, custom_notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aftercare instruction not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update aftercare instruction error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/aftercare/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM aftercare_instructions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aftercare instruction not found' });
    }
    res.json({ message: 'Aftercare instruction deleted', instruction: result.rows[0] });
  } catch (err) {
    console.error('Delete aftercare instruction error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
