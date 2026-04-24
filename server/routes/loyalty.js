const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/loyalty
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lr.*, c.name AS client_name, c.email AS client_email, c.loyalty_points AS total_points
      FROM loyalty_rewards lr
      LEFT JOIN clients c ON lr.client_id = c.id
      ORDER BY lr.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get loyalty rewards error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/loyalty/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lr.*, c.name AS client_name, c.email AS client_email, c.loyalty_points AS total_points
      FROM loyalty_rewards lr
      LEFT JOIN clients c ON lr.client_id = c.id
      WHERE lr.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loyalty reward not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get loyalty reward error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/loyalty
router.post('/', async (req, res) => {
  try {
    const { client_id, points, action, description, date } = req.body;
    const result = await pool.query(
      `INSERT INTO loyalty_rewards (client_id, points, action, description, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [client_id, points, action, description, date || new Date()]
    );

    // Update client's total loyalty points
    if (client_id && points) {
      await pool.query(
        'UPDATE clients SET loyalty_points = loyalty_points + $1 WHERE id = $2',
        [points, client_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create loyalty reward error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/loyalty/:id
router.put('/:id', async (req, res) => {
  try {
    const { client_id, points, action, description, date } = req.body;
    const result = await pool.query(
      `UPDATE loyalty_rewards SET client_id = $1, points = $2, action = $3, description = $4, date = $5
       WHERE id = $6 RETURNING *`,
      [client_id, points, action, description, date, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loyalty reward not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update loyalty reward error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/loyalty/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM loyalty_rewards WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loyalty reward not found' });
    }
    res.json({ message: 'Loyalty reward deleted', reward: result.rows[0] });
  } catch (err) {
    console.error('Delete loyalty reward error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
