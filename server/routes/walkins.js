const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/walkins
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM walkin_queue ORDER BY position ASC, check_in_time ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get walk-in queue error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/walkins/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM walkin_queue WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Walk-in not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get walk-in error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/walkins
router.post('/', async (req, res) => {
  try {
    const { client_name, phone, desired_service, preferred_artist, estimated_wait } = req.body;

    // Get the next position in queue
    const posResult = await pool.query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM walkin_queue WHERE status = 'waiting'"
    );
    const position = posResult.rows[0].next_pos;

    const result = await pool.query(
      `INSERT INTO walkin_queue (client_name, phone, desired_service, preferred_artist, estimated_wait, position, status, check_in_time)
       VALUES ($1, $2, $3, $4, $5, $6, 'waiting', NOW()) RETURNING *`,
      [client_name, phone, desired_service, preferred_artist, estimated_wait || 30, position]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create walk-in error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/walkins/:id
router.put('/:id', async (req, res) => {
  try {
    const { client_name, phone, desired_service, preferred_artist, estimated_wait, position, status } = req.body;
    const result = await pool.query(
      `UPDATE walkin_queue SET client_name = $1, phone = $2, desired_service = $3, preferred_artist = $4,
       estimated_wait = $5, position = $6, status = $7 WHERE id = $8 RETURNING *`,
      [client_name, phone, desired_service, preferred_artist, estimated_wait, position, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Walk-in not found' });
    }

    // If status changed to in_service or completed, reorder remaining queue
    if (status === 'in_service' || status === 'completed' || status === 'cancelled') {
      await pool.query(`
        WITH ranked AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY check_in_time ASC) AS new_pos
          FROM walkin_queue WHERE status = 'waiting'
        )
        UPDATE walkin_queue SET position = ranked.new_pos
        FROM ranked WHERE walkin_queue.id = ranked.id
      `);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update walk-in error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/walkins/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM walkin_queue WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Walk-in not found' });
    }

    // Reorder remaining queue
    await pool.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY check_in_time ASC) AS new_pos
        FROM walkin_queue WHERE status = 'waiting'
      )
      UPDATE walkin_queue SET position = ranked.new_pos
      FROM ranked WHERE walkin_queue.id = ranked.id
    `);

    res.json({ message: 'Walk-in removed from queue', walkin: result.rows[0] });
  } catch (err) {
    console.error('Delete walk-in error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
