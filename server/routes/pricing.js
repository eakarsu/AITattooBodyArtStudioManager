const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/pricing - list all pricing records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pricing_records ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Pricing list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/pricing/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pricing_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/pricing - create pricing record
router.post('/', async (req, res) => {
  try {
    const { service_type, style, size, complexity, color_work, placement, base_price, hourly_rate, estimated_hours, total_estimate, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO pricing_records (service_type, style, size, complexity, color_work, placement, base_price, hourly_rate, estimated_hours, total_estimate, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [service_type, style, size, complexity, color_work, placement, base_price, hourly_rate, estimated_hours, total_estimate, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Pricing create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/pricing/:id
router.put('/:id', async (req, res) => {
  try {
    const { service_type, style, size, complexity, color_work, placement, base_price, hourly_rate, estimated_hours, total_estimate, notes } = req.body;
    const result = await pool.query(
      `UPDATE pricing_records SET service_type=$1, style=$2, size=$3, complexity=$4, color_work=$5, placement=$6, base_price=$7, hourly_rate=$8, estimated_hours=$9, total_estimate=$10, notes=$11
       WHERE id=$12 RETURNING *`,
      [service_type, style, size, complexity, color_work, placement, base_price, hourly_rate, estimated_hours, total_estimate, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/pricing/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pricing_records WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/pricing/calculate/estimate - calculator endpoint
router.get('/calculate/estimate', async (req, res) => {
  try {
    const { size, complexity, placement, artist_id } = req.query;

    const sizePrices = { tiny: 80, small: 150, medium: 350, large: 700, 'extra-large': 1200 };
    const complexityMultipliers = { simple: 1.0, moderate: 1.3, detailed: 1.6, complex: 2.0, 'ultra-complex': 2.5 };
    const placementMultipliers = {
      forearm: 1.0, 'upper arm': 1.0, calf: 1.0, thigh: 1.05, back: 1.1, chest: 1.15,
      shoulder: 1.0, ankle: 1.1, wrist: 1.05, ribcage: 1.25, sternum: 1.25, neck: 1.3,
      hand: 1.2, finger: 1.15, foot: 1.2, 'behind ear': 1.1, spine: 1.2, 'full sleeve': 1.3, 'full back': 1.4,
    };

    const sizeKey = (size || 'medium').toLowerCase();
    const complexityKey = (complexity || 'moderate').toLowerCase();
    const placementKey = (placement || 'forearm').toLowerCase();

    const basePrice = sizePrices[sizeKey] || 350;
    const complexityMult = complexityMultipliers[complexityKey] || 1.3;
    const placementMult = placementMultipliers[placementKey] || 1.0;

    let artistRate = 1.0;
    let artistName = null;
    if (artist_id) {
      const artistResult = await pool.query('SELECT name, hourly_rate FROM artists WHERE id = $1', [artist_id]);
      if (artistResult.rows.length > 0) {
        artistName = artistResult.rows[0].name;
        artistRate = artistResult.rows[0].hourly_rate / 180;
      }
    }

    const estimatedPrice = Math.round(basePrice * complexityMult * placementMult * artistRate);
    const depositAmount = Math.round(estimatedPrice * 0.2);
    const durationEstimates = { tiny: 30, small: 60, medium: 120, large: 240, 'extra-large': 360 };
    const estimatedDuration = Math.round((durationEstimates[sizeKey] || 120) * complexityMult);

    res.json({
      estimated_price: estimatedPrice,
      deposit_amount: depositAmount,
      estimated_duration_minutes: estimatedDuration,
      breakdown: {
        base_price: basePrice, size: sizeKey, complexity: complexityKey,
        complexity_multiplier: complexityMult, placement: placementKey,
        placement_multiplier: placementMult, artist_rate_multiplier: parseFloat(artistRate.toFixed(2)),
        artist_name: artistName,
      },
    });
  } catch (err) {
    console.error('Pricing calculation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
