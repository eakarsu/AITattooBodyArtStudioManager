const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/gifts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gift_certificates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get gift certificates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gifts/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gift_certificates WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gift certificate not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get gift certificate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gifts
router.post('/', async (req, res) => {
  try {
    const { code, purchaser_name, recipient_name, amount, expiry_date, notes } = req.body;
    const generatedCode = code || `GIFT-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO gift_certificates (code, purchaser_name, recipient_name, amount, balance, expiry_date, status, notes)
       VALUES ($1, $2, $3, $4, $4, $5, 'active', $6) RETURNING *`,
      [generatedCode, purchaser_name, recipient_name, amount, expiry_date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create gift certificate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/gifts/:id
router.put('/:id', async (req, res) => {
  try {
    const { code, purchaser_name, recipient_name, amount, balance, expiry_date, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE gift_certificates SET code = $1, purchaser_name = $2, recipient_name = $3, amount = $4,
       balance = $5, expiry_date = $6, status = $7, notes = $8 WHERE id = $9 RETURNING *`,
      [code, purchaser_name, recipient_name, amount, balance, expiry_date, status, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gift certificate not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update gift certificate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gifts/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM gift_certificates WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gift certificate not found' });
    }
    res.json({ message: 'Gift certificate deleted', gift_certificate: result.rows[0] });
  } catch (err) {
    console.error('Delete gift certificate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
