const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/inventory
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY category, item_name');
    res.json(result.rows);
  } catch (err) {
    console.error('Get inventory error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/inventory/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get inventory item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/inventory
router.post('/', async (req, res) => {
  try {
    const { item_name, category, brand, quantity, unit, reorder_level, cost_per_unit, supplier, expiry_date, last_restocked } = req.body;
    const result = await pool.query(
      `INSERT INTO inventory (item_name, category, brand, quantity, unit, reorder_level, cost_per_unit, supplier, expiry_date, last_restocked)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [item_name, category, brand, quantity || 0, unit, reorder_level || 5, cost_per_unit || 0, supplier, expiry_date, last_restocked]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create inventory item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/inventory/:id
router.put('/:id', async (req, res) => {
  try {
    const { item_name, category, brand, quantity, unit, reorder_level, cost_per_unit, supplier, expiry_date, last_restocked } = req.body;
    const result = await pool.query(
      `UPDATE inventory SET item_name = $1, category = $2, brand = $3, quantity = $4, unit = $5,
       reorder_level = $6, cost_per_unit = $7, supplier = $8, expiry_date = $9, last_restocked = $10
       WHERE id = $11 RETURNING *`,
      [item_name, category, brand, quantity, unit, reorder_level, cost_per_unit, supplier, expiry_date, last_restocked, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update inventory item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item deleted', item: result.rows[0] });
  } catch (err) {
    console.error('Delete inventory item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
