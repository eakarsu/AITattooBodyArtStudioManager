const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

// Ensure uploads directory
const uploadDir = path.join(__dirname, '../uploads/flash');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `flash-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

// GET /api/flash — paginated
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM flash_designs');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT f.*, a.name AS artist_name
      FROM flash_designs f
      LEFT JOIN artists a ON f.artist_id = a.id
      ORDER BY f.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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

// POST /api/flash — with optional image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { artist_id, name, description, style, size, placement_suggestion, price, available } = req.body;
    const image_url = req.file ? `/uploads/flash/${req.file.filename}` : (req.body.image_url || null);

    const result = await pool.query(
      `INSERT INTO flash_designs (artist_id, name, description, style, size, placement_suggestion, price, available, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [artist_id, name, description, style, size, placement_suggestion, price || 0, available !== false, image_url],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create flash design error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/flash/:id — with optional image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { artist_id, name, description, style, size, placement_suggestion, price, available } = req.body;
    const image_url = req.file ? `/uploads/flash/${req.file.filename}` : (req.body.image_url || null);

    const result = await pool.query(
      `UPDATE flash_designs SET artist_id = $1, name = $2, description = $3, style = $4, size = $5,
       placement_suggestion = $6, price = $7, available = $8, image_url = $9 WHERE id = $10 RETURNING *`,
      [artist_id, name, description, style, size, placement_suggestion, price, available !== 'false', image_url, req.params.id],
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
    // Clean up uploaded file if exists
    if (result.rows[0].image_url && result.rows[0].image_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', result.rows[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Flash design deleted', design: result.rows[0] });
  } catch (err) {
    console.error('Delete flash design error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
