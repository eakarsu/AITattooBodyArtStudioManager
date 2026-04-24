const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/cleaning
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cleaning_checklists ORDER BY checklist_date DESC, shift, area');
    res.json(result.rows);
  } catch (err) {
    console.error('Get cleaning checklists error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cleaning/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cleaning_checklists WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cleaning checklist item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get cleaning checklist item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cleaning
router.post('/', async (req, res) => {
  try {
    const { area, task, assigned_to, completed, completed_by, shift, checklist_date, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO cleaning_checklists (area, task, assigned_to, completed, completed_by, shift, checklist_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [area, task, assigned_to, completed || false, completed_by, shift, checklist_date || new Date(), notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create cleaning checklist item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/cleaning/:id
router.put('/:id', async (req, res) => {
  try {
    const { area, task, assigned_to, completed, completed_by, shift, checklist_date, notes } = req.body;
    const result = await pool.query(
      `UPDATE cleaning_checklists SET area = $1, task = $2, assigned_to = $3, completed = $4,
       completed_by = $5, shift = $6, checklist_date = $7, notes = $8 WHERE id = $9 RETURNING *`,
      [area, task, assigned_to, completed, completed_by, shift, checklist_date, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cleaning checklist item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update cleaning checklist item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cleaning/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cleaning_checklists WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cleaning checklist item not found' });
    }
    res.json({ message: 'Cleaning checklist item deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete cleaning checklist item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
