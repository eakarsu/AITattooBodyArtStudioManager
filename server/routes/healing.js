const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/healing');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `healing-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

// Ensure healing_photos table exists
async function ensureHealingTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS healing_photos (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id),
      appointment_id INTEGER REFERENCES appointments(id),
      photo_url VARCHAR(500),
      days_since_session INTEGER,
      service_type VARCHAR(100),
      ai_assessment JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

// POST /api/healing/:client_id/photos — upload healing photo
router.post('/:client_id/photos', upload.single('photo'), async (req, res) => {
  try {
    await ensureHealingTable();
    const { client_id } = req.params;
    const { appointment_id, days_since_session, service_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const photoUrl = `/uploads/healing/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO healing_photos (client_id, appointment_id, photo_url, days_since_session, service_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [client_id, appointment_id || null, photoUrl, days_since_session || null, service_type || 'Tattoo'],
    );

    res.status(201).json({ photo: result.rows[0], message: 'Photo uploaded. Use /api/ai/healing-check to assess.' });
  } catch (err) {
    console.error('Healing photo upload error:', err);
    res.status(500).json({ error: 'Failed to upload photo: ' + err.message });
  }
});

// GET /api/healing/:client_id/photos — get all healing photos for client
router.get('/:client_id/photos', async (req, res) => {
  try {
    await ensureHealingTable();
    const result = await pool.query(
      'SELECT * FROM healing_photos WHERE client_id = $1 ORDER BY created_at DESC',
      [req.params.client_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get healing photos error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/healing/photos/:photo_id/assessment — save AI assessment to photo record
router.put('/photos/:photo_id/assessment', async (req, res) => {
  try {
    await ensureHealingTable();
    const { assessment } = req.body;
    const result = await pool.query(
      'UPDATE healing_photos SET ai_assessment = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(assessment), req.params.photo_id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Save assessment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
