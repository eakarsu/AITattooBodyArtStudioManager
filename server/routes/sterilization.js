const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/sterilization
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sterilization_logs ORDER BY log_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get sterilization logs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sterilization/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sterilization_logs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sterilization log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get sterilization log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sterilization
router.post('/', async (req, res) => {
  try {
    const { equipment_name, sterilization_type, cycle_number, temperature, duration_minutes, operator, result: logResult, notes, log_date } = req.body;
    const dbResult = await pool.query(
      `INSERT INTO sterilization_logs (equipment_name, sterilization_type, cycle_number, temperature, duration_minutes, operator, result, notes, log_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [equipment_name, sterilization_type, cycle_number, temperature, duration_minutes, operator, logResult, notes, log_date || new Date()]
    );
    res.status(201).json(dbResult.rows[0]);
  } catch (err) {
    console.error('Create sterilization log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/sterilization/:id
router.put('/:id', async (req, res) => {
  try {
    const { equipment_name, sterilization_type, cycle_number, temperature, duration_minutes, operator, result: logResult, notes, log_date } = req.body;
    const dbResult = await pool.query(
      `UPDATE sterilization_logs SET equipment_name = $1, sterilization_type = $2, cycle_number = $3,
       temperature = $4, duration_minutes = $5, operator = $6, result = $7, notes = $8, log_date = $9
       WHERE id = $10 RETURNING *`,
      [equipment_name, sterilization_type, cycle_number, temperature, duration_minutes, operator, logResult, notes, log_date, req.params.id]
    );
    if (dbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sterilization log not found' });
    }
    res.json(dbResult.rows[0]);
  } catch (err) {
    console.error('Update sterilization log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/sterilization/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM sterilization_logs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sterilization log not found' });
    }
    res.json({ message: 'Sterilization log deleted', log: result.rows[0] });
  } catch (err) {
    console.error('Delete sterilization log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
