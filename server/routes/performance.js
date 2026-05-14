const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const pool = require('../db');

const MODEL = 'anthropic/claude-3-5-sonnet-20241022';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user ? 'user:' + req.user.id : req.ip,
  message: { error: 'Too many AI requests. Limit: 20 per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function parseAIJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) {}
  const stripped = text.replace(/```json?/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (_) {}
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
  return null;
}

// GET /api/performance/:artist_id — artist performance dashboard
router.get('/:artist_id', async (req, res) => {
  try {
    const { artist_id } = req.params;
    const { period } = req.query; // e.g. '2024-01' or leave empty for all time

    // Artist info
    const artistResult = await pool.query(
      'SELECT id, name, specialties, experience_years, hourly_rate, rating, commission_rate FROM artists WHERE id = $1',
      [artist_id],
    );
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    const artist = artistResult.rows[0];

    // Total appointments and by status
    const apptStatsResult = await pool.query(
      `SELECT COUNT(*) AS total_appointments,
              COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_appointments,
              COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_appointments,
              AVG(CASE WHEN status = 'completed' THEN duration_minutes END) AS avg_session_minutes
       FROM appointments
       WHERE artist_id = $1 ${period ? "AND to_char(date, 'YYYY-MM') = $2" : ''}`,
      period ? [artist_id, period] : [artist_id],
    );
    const apptStats = apptStatsResult.rows[0];

    // Revenue from commissions
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(commission_amount), 0) AS total_commission,
              COALESCE(SUM(service_amount), 0) AS total_revenue,
              COALESCE(SUM(tip_amount), 0) AS total_tips,
              COUNT(*) AS commission_records
       FROM commissions
       WHERE artist_id = $1 ${period ? "AND pay_period = $2" : ''}`,
      period ? [artist_id, period] : [artist_id],
    );
    const revenue = revenueResult.rows[0];

    // Repeat client rate (clients with 2+ appointments)
    const repeatClientsResult = await pool.query(
      `SELECT COUNT(*) AS repeat_clients FROM (
         SELECT client_id FROM appointments WHERE artist_id = $1
         GROUP BY client_id HAVING COUNT(*) >= 2
       ) AS rc`,
      [artist_id],
    );
    const uniqueClientsResult = await pool.query(
      'SELECT COUNT(DISTINCT client_id) AS unique_clients FROM appointments WHERE artist_id = $1',
      [artist_id],
    );
    const repeatClients = parseInt(repeatClientsResult.rows[0].repeat_clients);
    const uniqueClients = parseInt(uniqueClientsResult.rows[0].unique_clients);
    const repeatRate = uniqueClients > 0 ? ((repeatClients / uniqueClients) * 100).toFixed(1) : 0;

    // Monthly breakdown (last 6 months)
    const monthlyResult = await pool.query(
      `SELECT to_char(date, 'YYYY-MM') AS month,
              COUNT(*) AS appointments,
              COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed
       FROM appointments WHERE artist_id = $1 AND date >= NOW() - INTERVAL '6 months'
       GROUP BY month ORDER BY month DESC`,
      [artist_id],
    );

    res.json({
      artist,
      period: period || 'all_time',
      stats: {
        total_appointments: parseInt(apptStats.total_appointments),
        completed_appointments: parseInt(apptStats.completed_appointments),
        cancelled_appointments: parseInt(apptStats.cancelled_appointments),
        avg_session_minutes: parseFloat(apptStats.avg_session_minutes || 0).toFixed(0),
        total_revenue: parseFloat(revenue.total_revenue).toFixed(2),
        total_commission: parseFloat(revenue.total_commission).toFixed(2),
        total_tips: parseFloat(revenue.total_tips).toFixed(2),
        unique_clients: uniqueClients,
        repeat_clients: repeatClients,
        repeat_client_rate_pct: parseFloat(repeatRate),
        rating: artist.rating,
      },
      monthly_breakdown: monthlyResult.rows,
    });
  } catch (err) {
    console.error('Artist performance error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/performance/:artist_id/coaching — AI monthly coaching summary
router.post('/:artist_id/coaching', aiRateLimiter, async (req, res) => {
  try {
    const { artist_id } = req.params;

    // Gather performance data
    const artistResult = await pool.query(
      'SELECT * FROM artists WHERE id = $1', [artist_id],
    );
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    const artist = artistResult.rows[0];

    const [apptResult, revenueResult, repeatResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,
                AVG(CASE WHEN status = 'completed' THEN total_price END) AS avg_ticket
         FROM appointments WHERE artist_id = $1 AND date >= NOW() - INTERVAL '30 days'`,
        [artist_id],
      ),
      pool.query(
        `SELECT COALESCE(SUM(commission_amount), 0) AS monthly_commission,
                COALESCE(SUM(tip_amount), 0) AS monthly_tips
         FROM commissions WHERE artist_id = $1 AND pay_period = to_char(NOW(), 'YYYY-MM')`,
        [artist_id],
      ),
      pool.query(
        `SELECT COUNT(DISTINCT client_id) AS repeat_this_month
         FROM appointments WHERE artist_id = $1 AND client_id IN (
           SELECT client_id FROM appointments WHERE artist_id = $1
           GROUP BY client_id HAVING COUNT(*) >= 2
         ) AND date >= NOW() - INTERVAL '30 days'`,
        [artist_id],
      ),
    ]);

    const stats = apptResult.rows[0];
    const rev = revenueResult.rows[0];

    const systemPrompt = 'You are an expert tattoo studio business coach. Always respond with valid JSON only.';
    const prompt = `Generate a monthly performance coaching summary for this tattoo artist and return ONLY valid JSON:

Artist: ${artist.name}
Specialties: ${artist.specialties}
Experience: ${artist.experience_years} years
Rating: ${artist.rating}/5

Last 30 Days Performance:
- Total appointments: ${stats.total}
- Completed: ${stats.completed}
- Cancelled: ${stats.cancelled}
- Average ticket value: $${parseFloat(stats.avg_ticket || 0).toFixed(2)}
- Monthly commission earned: $${parseFloat(rev.monthly_commission).toFixed(2)}
- Monthly tips: $${parseFloat(rev.monthly_tips).toFixed(2)}
- Returning clients this month: ${repeatResult.rows[0].repeat_this_month}

Return JSON with this exact structure:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "improvement_areas": ["area1", "area2"],
  "revenue_forecast": {
    "next_month_estimate": 3500.00,
    "growth_potential_pct": 15,
    "key_assumptions": "description"
  },
  "action_items": ["action1", "action2", "action3"],
  "client_retention_tip": "specific tip for this artist",
  "upsell_opportunities": ["opportunity1", "opportunity2"]
}`;

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(aiResponse);

    res.json({ coaching: parsed || { raw: aiResponse }, model: MODEL });
  } catch (err) {
    console.error('Coaching error:', err);
    res.status(500).json({ error: 'Failed to generate coaching: ' + err.message });
  }
});

module.exports = router;
