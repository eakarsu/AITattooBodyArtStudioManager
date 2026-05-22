const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const pool = require('../db');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

// Rate limiter: 20 AI calls per hour per user
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user ? 'user:' + req.user.id : req.ip,
  message: { error: 'Too many AI requests. Limit: 20 per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Parse AI JSON response robustly
function parseAIJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {}
  // Strip markdown code fences
  const stripped = text.replace(/```json?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch (_) {}
  // Find first {...} block
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) {}
  }
  return null;
}

async function callOpenRouter(prompt, systemPrompt) {
  if (!process.env.OPENROUTER_API_KEY) {
    const e = new Error('LLM unavailable: OPENROUTER_API_KEY not configured');
    e.code = 'LLM_UNAVAILABLE';
    throw e;
  }
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated';
}

async function saveAIResult(userId, endpoint, inputData, result) {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(100),
        input_data JSONB,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
    );
    await pool.query(
      'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)',
      [userId, endpoint, JSON.stringify(inputData), JSON.stringify(result)],
    );
  } catch (err) {
    console.error('Error saving AI result:', err);
  }
}

async function saveGeneration(feature, prompt, response, model) {
  try {
    await pool.query(
      'INSERT INTO ai_generations (feature, prompt, response, model) VALUES ($1, $2, $3, $4)',
      [feature, prompt, response, model || MODEL],
    );
  } catch (err) {
    console.error('Error saving AI generation:', err);
  }
}

// POST /api/ai/generate-design
router.post('/generate-design', aiRateLimiter, async (req, res) => {
  try {
    const { description, style, size, placement } = req.body;

    const systemPrompt = 'You are a professional tattoo artist and designer. Always respond with valid JSON only.';
    const prompt = `Generate a detailed flash tattoo design concept based on the following client input and return ONLY valid JSON:

Description: ${description || 'Not specified'}
Style: ${style || 'Artist choice'}
Size: ${size || 'Medium'}
Placement: ${placement || 'Not specified'}

Return JSON with this exact structure:
{
  "design_concept": "vivid visual description of the design",
  "style": "specific style recommendation",
  "placement_tips": ["tip1", "tip2", "tip3"],
  "color_palette": ["color1", "color2", "color3"],
  "estimated_sessions": 2,
  "line_work": "description of line work approach",
  "estimated_hours": 4
}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);

    await saveGeneration('generate-design', prompt, aiResponse);
    await saveAIResult(req.user?.id, 'generate-design', { description, style, size, placement }, parsed || { raw: aiResponse });

    res.json({ result: aiResponse, parsed, model: MODEL });
  } catch (err) {
    console.error('Generate design error:', err);
    res.status(500).json({ error: 'Failed to generate design: ' + err.message });
  }
});

// POST /api/ai/customize-consent
router.post('/customize-consent', aiRateLimiter, async (req, res) => {
  try {
    const { service_type, medical_conditions, allergies, special_considerations } = req.body;

    const systemPrompt = 'You are a legal compliance specialist for a tattoo and body art studio. Always respond with valid JSON only.';
    const prompt = `Generate a customized consent form for the following service and return ONLY valid JSON:

Service Type: ${service_type || 'Tattoo'}
Client Medical Conditions: ${medical_conditions || 'None reported'}
Known Allergies: ${allergies || 'None reported'}
Special Considerations: ${special_considerations || 'None'}

Return JSON with this exact structure:
{
  "form_title": "Consent Form title",
  "service_description": "description of service and risks",
  "medical_disclosure": "medical disclosure section text",
  "allergy_warnings": ["warning1", "warning2"],
  "aftercare_commitment": "aftercare commitment text",
  "photo_release": "photo/portfolio release text",
  "age_verification": "age verification statement",
  "signature_block": "signature block text",
  "special_clauses": ["clause1 based on conditions"]
}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);

    await saveGeneration('customize-consent', prompt, aiResponse);
    await saveAIResult(req.user?.id, 'customize-consent', { service_type, medical_conditions, allergies, special_considerations }, parsed || { raw: aiResponse });

    res.json({ result: aiResponse, parsed, model: MODEL });
  } catch (err) {
    console.error('Customize consent error:', err);
    res.status(500).json({ error: 'Failed to customize consent form: ' + err.message });
  }
});

// POST /api/ai/personalize-aftercare
router.post('/personalize-aftercare', aiRateLimiter, async (req, res) => {
  try {
    const { service_type, skin_type, placement, size, medical_conditions, allergies } = req.body;

    const systemPrompt = 'You are an experienced tattoo aftercare specialist. Always respond with valid JSON only.';
    const prompt = `Generate personalized aftercare instructions and return ONLY valid JSON:

Service: ${service_type || 'Tattoo'}
Skin Type: ${skin_type || 'Normal'}
Placement: ${placement || 'Not specified'}
Size: ${size || 'Medium'}
Medical Conditions: ${medical_conditions || 'None'}
Allergies: ${allergies || 'None'}

Return JSON with this exact structure:
{
  "immediate_care": "first 2 hours instructions",
  "day_by_day": [
    {"day": "Day 1-3", "instructions": "instructions"},
    {"day": "Day 4-7", "instructions": "instructions"},
    {"day": "Day 8-14", "instructions": "instructions"}
  ],
  "cleaning_routine": "cleaning routine description",
  "moisturizer_recommendations": ["product1", "product2"],
  "activities_to_avoid": ["activity1", "activity2"],
  "healing_signs": {"normal": ["sign1", "sign2"], "concerning": ["sign1", "sign2"]},
  "contact_studio_if": ["condition1", "condition2"],
  "placement_specific_tips": ["tip based on placement"]
}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);

    await saveGeneration('personalize-aftercare', prompt, aiResponse);
    await saveAIResult(req.user?.id, 'personalize-aftercare', { service_type, skin_type, placement, size, medical_conditions, allergies }, parsed || { raw: aiResponse });

    res.json({ result: aiResponse, parsed, model: MODEL });
  } catch (err) {
    console.error('Personalize aftercare error:', err);
    res.status(500).json({ error: 'Failed to personalize aftercare: ' + err.message });
  }
});

// POST /api/ai/generate-caption
router.post('/generate-caption', aiRateLimiter, async (req, res) => {
  try {
    const { design_description, style, artist_name, platform } = req.body;
    const prompt = `You are a social media manager for a high-end tattoo studio. Generate an engaging ${platform || 'Instagram'} caption for a portfolio post:

Design: ${design_description || 'Custom tattoo piece'}
Style: ${style || 'Not specified'}
Artist: ${artist_name || 'Studio artist'}

Create: 1) An attention-grabbing caption (2-3 sentences), 2) Relevant hashtags (15-20), 3) A call-to-action for booking. Keep the tone professional yet approachable.`;

    const aiResponse = await callOpenRouter(prompt);
    await saveGeneration('generate-caption', prompt, aiResponse);
    await saveAIResult(req.user?.id, 'generate-caption', { design_description, style, artist_name, platform }, { raw: aiResponse });

    res.json({ result: aiResponse, model: MODEL });
  } catch (err) {
    console.error('Generate caption error:', err);
    res.status(500).json({ error: 'Failed to generate caption: ' + err.message });
  }
});

// POST /api/ai/match-style
router.post('/match-style', aiRateLimiter, async (req, res) => {
  try {
    const { client_preferences, desired_style, budget, description, client_id } = req.body;

    // Fetch available artists
    const artistsResult = await pool.query(
      'SELECT id, name, specialties, experience_years, hourly_rate, rating, bio FROM artists WHERE available = true ORDER BY rating DESC',
    );
    const artists = artistsResult.rows;

    // Fetch client appointment history for personalization
    let appointmentHistory = [];
    if (client_id) {
      const histResult = await pool.query(
        'SELECT service_type, body_placement, style, size FROM appointments WHERE client_id = $1 ORDER BY date DESC LIMIT 10',
        [client_id],
      );
      appointmentHistory = histResult.rows;
    }

    const systemPrompt = 'You are a tattoo studio concierge. Always respond with valid JSON only.';
    const prompt = `Match the client with the best artist(s) from our roster and return ONLY valid JSON.

Client Preferences:
- Style: ${desired_style || client_preferences || 'Open to suggestions'}
- Description: ${description || 'Not provided'}
- Budget: ${budget ? '$' + budget : 'Flexible'}
${appointmentHistory.length > 0 ? `- Past Tattoo History: ${appointmentHistory.map(a => `${a.service_type} (${a.body_placement})`).join(', ')}` : ''}

Available Artists:
${artists.map(a => `ID:${a.id} - ${a.name}: Specialties: ${a.specialties}, Experience: ${a.experience_years} years, Rate: $${a.hourly_rate}/hr, Rating: ${a.rating}/5`).join('\n')}

Return JSON with this exact structure:
{
  "top_artists": [
    {
      "id": 1,
      "name": "Artist Name",
      "match_score": 95,
      "reasons": ["reason1", "reason2"],
      "expected_price_range": "$500-$800",
      "portfolio_focus": "what to look for in their portfolio"
    }
  ],
  "style_notes": "general notes about the requested style",
  "budget_assessment": "assessment of budget vs. expectations"
}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);

    await saveGeneration('match-style', prompt, aiResponse);
    await saveAIResult(req.user?.id, 'match-style', { client_preferences, desired_style, budget, description, client_id }, parsed || { raw: aiResponse });

    res.json({ result: aiResponse, parsed, artists, model: MODEL });
  } catch (err) {
    console.error('Match style error:', err);
    res.status(500).json({ error: 'Failed to match style: ' + err.message });
  }
});

// POST /api/ai/draft-message
router.post('/draft-message', aiRateLimiter, async (req, res) => {
  try {
    const { message_type, client_name, appointment_date, appointment_time, artist_name, service_type, custom_details } = req.body;
    const prompt = `You are a professional receptionist at a premium tattoo studio called "Ink & Art Studio". Draft a ${message_type || 'booking confirmation'} message:

Client: ${client_name || 'Valued Client'}
Date: ${appointment_date || 'TBD'}
Time: ${appointment_time || 'TBD'}
Artist: ${artist_name || 'Your assigned artist'}
Service: ${service_type || 'Tattoo session'}
Additional Details: ${custom_details || 'None'}

Keep the message warm, professional, and concise. Include relevant preparation instructions and studio contact info placeholder.`;

    const aiResponse = await callOpenRouter(prompt);
    await saveGeneration('draft-message', prompt, aiResponse);
    await saveAIResult(req.user?.id, 'draft-message', { message_type, client_name, appointment_date, service_type }, { raw: aiResponse });

    res.json({ result: aiResponse, model: MODEL });
  } catch (err) {
    console.error('Draft message error:', err);
    res.status(500).json({ error: 'Failed to draft message: ' + err.message });
  }
});

// POST /api/ai/healing-check — vision-based healing assessment
router.post('/healing-check', aiRateLimiter, async (req, res) => {
  try {
    const { photo_base64, photo_url, days_since_session, service_type, client_id } = req.body;

    if (!photo_base64 && !photo_url) {
      return res.status(400).json({ error: 'photo_base64 or photo_url is required' });
    }

    const systemPrompt = 'You are a professional tattoo healing assessment specialist. Always respond with valid JSON only.';
    const prompt = `Assess the healing stage of this tattoo/body art from the photo and return ONLY valid JSON.

Days since session: ${days_since_session || 'Unknown'}
Service type: ${service_type || 'Tattoo'}

Return JSON with this exact structure:
{
  "healing_stage": "Early/Mid/Late/Complete",
  "healing_progress_pct": 65,
  "concern_flags": ["flag1 if any", "flag2 if any"],
  "is_healing_normally": true,
  "recommendations": ["recommendation1", "recommendation2"],
  "follow_up_needed": false,
  "estimated_days_to_complete": 10
}`;

    const messageContent = photo_base64
      ? [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${photo_base64}` } },
        ]
      : [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: photo_url } },
        ];

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
          { role: 'user', content: messageContent },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(aiResponse);

    await saveAIResult(req.user?.id, 'healing-check', { days_since_session, service_type, client_id }, parsed || { raw: aiResponse });

    res.json({ result: aiResponse, parsed, model: MODEL });
  } catch (err) {
    console.error('Healing check error:', err);
    res.status(500).json({ error: 'Failed to assess healing: ' + err.message });
  }
});

// POST /api/ai/smart-book — intelligent booking with conflict detection and deposit calc
router.post('/smart-book', aiRateLimiter, async (req, res) => {
  try {
    const { artist_id, service_type, duration_minutes, preferred_date, budget } = req.body;

    if (!artist_id || !preferred_date) {
      return res.status(400).json({ error: 'artist_id and preferred_date are required' });
    }

    // Get artist info and existing appointments to find available slots
    const artistResult = await pool.query(
      'SELECT id, name, specialties, hourly_rate, commission_rate FROM artists WHERE id = $1',
      [artist_id],
    );
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    const artist = artistResult.rows[0];

    const bookedResult = await pool.query(
      `SELECT date, time, duration_minutes FROM appointments
       WHERE artist_id = $1 AND date = $2 AND status != 'cancelled'
       ORDER BY time ASC`,
      [artist_id, preferred_date],
    );
    const bookedSlots = bookedResult.rows;

    // Calculate deposit from pricing table
    const pricingResult = await pool.query(
      'SELECT * FROM pricing WHERE service_type ILIKE $1 LIMIT 1',
      [`%${service_type || 'tattoo'}%`],
    );
    const pricing = pricingResult.rows[0];
    const depositAmount = pricing ? pricing.deposit_amount : Math.round((artist.hourly_rate || 100) * 0.5);

    // Generate available time slots (9am-6pm, 1hr blocks)
    const duration = duration_minutes || 60;
    const workingHours = [];
    for (let h = 9; h <= 17; h++) {
      workingHours.push(`${String(h).padStart(2, '0')}:00`);
    }

    const availableSlots = workingHours.filter(slot => {
      const slotStart = parseInt(slot.split(':')[0]) * 60;
      const slotEnd = slotStart + duration;
      return !bookedSlots.some(booked => {
        const bookedStart = parseInt(booked.time.split(':')[0]) * 60;
        const bookedEnd = bookedStart + (booked.duration_minutes || 60);
        return slotStart < bookedEnd && slotEnd > bookedStart;
      });
    });

    res.json({
      artist: { id: artist.id, name: artist.name, hourly_rate: artist.hourly_rate },
      preferred_date,
      available_slots: availableSlots,
      booked_slots: bookedSlots.map(b => ({ time: b.time, duration: b.duration_minutes })),
      deposit_amount: depositAmount,
      estimated_total: artist.hourly_rate ? (artist.hourly_rate * (duration / 60)).toFixed(2) : null,
      recommendation: availableSlots.length > 0
        ? `${availableSlots.length} slots available. Earliest: ${availableSlots[0]}`
        : 'No slots available on this date. Try another date.',
    });
  } catch (err) {
    console.error('Smart book error:', err);
    res.status(500).json({ error: 'Failed to get booking options: ' + err.message });
  }
});

// Portfolio style classification — auto-tag artist work
router.post('/portfolio-classify', aiRateLimiter, async (req, res) => {
  try {
    const { artistId, works } = req.body;
    let artist = null;
    if (artistId) {
      const r = await pool.query('SELECT * FROM artists WHERE id = $1', [artistId]).catch(() => ({ rows: [] }));
      artist = r.rows[0] || null;
    }
    const systemPrompt = 'You are a tattoo style classification expert. Always respond with valid JSON only.';
    const prompt = `Classify these portfolio works by style/theme/technique.
Artist: ${JSON.stringify(artist || {})}
Works descriptions or titles: ${JSON.stringify(works || [])}

Return JSON:
{
  "items": [{"index": <number>, "primary_style": "...", "sub_styles": ["..."], "themes": ["..."], "techniques": ["..."], "confidence": <0-100>}],
  "artist_signature_styles": ["..."],
  "recommended_tags": ["..."],
  "summary": "..."
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await saveAIResult(req.user?.id, 'portfolio-classify', { artistId, count: (works || []).length }, parsed);
    await saveGeneration('portfolio-classify', prompt, text, MODEL);
    res.json({ classification: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Studio demand forecast — predict peak hours / artist scheduling
router.post('/demand-forecast', aiRateLimiter, async (req, res) => {
  try {
    const { weeksAhead } = req.body;
    const appts = await pool.query('SELECT artist_id, appointment_date, duration_minutes, status FROM appointments ORDER BY appointment_date DESC LIMIT 200').catch(() => ({ rows: [] }));
    const artists = await pool.query('SELECT id, name, specialty, hourly_rate FROM artists').catch(() => ({ rows: [] }));

    const systemPrompt = 'You are a tattoo studio scheduling forecaster. Always respond with valid JSON only.';
    const prompt = `Forecast studio demand for the next ${weeksAhead || 4} weeks based on history. Recommend artist scheduling.
Recent appointments: ${JSON.stringify(appts.rows.slice(0, 80))}
Artists: ${JSON.stringify(artists.rows)}

Return JSON:
{
  "weekly_demand": [{"week_start": "YYYY-MM-DD", "expected_appointments": <number>, "expected_revenue_usd": <number>, "peak_days": ["..."]}],
  "peak_hours": ["..."],
  "artist_scheduling_recommendations": [{"artist_id": <id>, "recommended_hours_per_week": <number>, "rationale": "..."}],
  "stocking_alerts": ["..."],
  "summary": "..."
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await saveAIResult(req.user?.id, 'demand-forecast', { weeksAhead }, parsed);
    await saveGeneration('demand-forecast', prompt, text, MODEL);
    res.json({ forecast: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/healing-outcome — predict probable healing outcome from client/session metadata (no photo required)
router.post('/healing-outcome', aiRateLimiter, async (req, res) => {
  try {
    const { client_id, service_type, placement, size_inches, skin_type, age, medical_conditions, allergies, smoker, sun_exposure, aftercare_compliance, prior_healing_history } = req.body;

    let client = null;
    if (client_id) {
      const r = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]).catch(() => ({ rows: [] }));
      client = r.rows[0] || null;
    }

    const systemPrompt = 'You are a tattoo / body-art healing prognosis specialist. Always respond with valid JSON only.';
    const prompt = `Predict the most probable healing outcome for the following client and session. Use evidence-based reasoning, not photos.

Client: ${JSON.stringify(client || {})}

Session / context: ${JSON.stringify({ service_type, placement, size_inches, skin_type, age, medical_conditions, allergies, smoker, sun_exposure, aftercare_compliance, prior_healing_history })}

Return JSON:
{
  "predicted_outcome": "excellent|good|fair|poor",
  "outcome_confidence": <0-100>,
  "estimated_full_heal_days": <number>,
  "key_risk_factors": ["..."],
  "protective_factors": ["..."],
  "color_retention_outlook": "excellent|good|fair|poor",
  "scarring_risk": "low|medium|high",
  "follow_up_schedule_days": [<number>],
  "personalized_aftercare_focus": ["..."],
  "summary": "..."
}`;

    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await saveAIResult(req.user?.id, 'healing-outcome', { client_id, service_type, placement, size_inches }, parsed);
    await saveGeneration('healing-outcome', prompt, text, MODEL);
    res.json({ outcome: parsed });
  } catch (err) {
    if (err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/infection-risk — assess infection risk based on session + post-session factors
router.post('/infection-risk', aiRateLimiter, async (req, res) => {
  try {
    const { client_id, service_type, placement, days_since_session, signs_observed, environmental_factors, hygiene_compliance, medical_conditions, allergies, immunocompromised } = req.body;

    let client = null;
    if (client_id) {
      const r = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]).catch(() => ({ rows: [] }));
      client = r.rows[0] || null;
    }

    const systemPrompt = 'You are an infection-control specialist for tattoo / body-art studios. Always respond with valid JSON only. This output is decision-support only and does not replace medical advice.';
    const prompt = `Assess the infection risk for this client/session and recommend escalation steps.

Client: ${JSON.stringify(client || {})}

Context: ${JSON.stringify({ service_type, placement, days_since_session, signs_observed, environmental_factors, hygiene_compliance, medical_conditions, allergies, immunocompromised })}

Return JSON:
{
  "risk_level": "low|moderate|elevated|high|urgent",
  "risk_score": <0-100>,
  "primary_concerns": ["..."],
  "red_flags_requiring_medical_review": ["..."],
  "recommended_actions": ["..."],
  "client_self_care_steps": ["..."],
  "studio_followup_steps": ["..."],
  "refer_to_medical_provider": true|false,
  "summary": "...",
  "disclaimer": "AI assessment only — does not replace medical advice."
}`;

    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await saveAIResult(req.user?.id, 'infection-risk', { client_id, service_type, days_since_session }, parsed);
    await saveGeneration('infection-risk', prompt, text, MODEL);
    res.json({ assessment: parsed });
  } catch (err) {
    if (err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/healing-outcome-prediction — structured healing outcome prediction (tattoo + client + aftercare)
router.post('/healing-outcome-prediction', aiRateLimiter, async (req, res) => {
  try {
    const { tattoo = {}, client = {}, aftercare_plan } = req.body || {};

    const systemPrompt = 'You are a tattoo healing prognosis specialist. Use evidence-based reasoning. Always respond with valid JSON only.';
    const prompt = `Predict the healing outcome for the following tattoo session.

Tattoo: ${JSON.stringify(tattoo)}

Client: ${JSON.stringify(client)}

Aftercare plan: ${JSON.stringify(aftercare_plan || null)}

Return JSON exactly matching:
{
  "predicted_healing_days": <number>,
  "complications_risk": "low|medium|high",
  "watchpoints": ["..."],
  "aftercare_recommendations": ["..."],
  "followup_schedule": [{"day": <number>, "check": "..."}]
}`;

    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await saveAIResult(req.user?.id, 'healing-outcome-prediction', { tattoo, client, aftercare_plan }, parsed);
    await saveGeneration('healing-outcome-prediction', prompt, text, MODEL);
    res.json({ prediction: parsed });
  } catch (err) {
    if (err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/infection-risk-assessment — structured infection risk assessment with urgency triage
router.post('/infection-risk-assessment', aiRateLimiter, async (req, res) => {
  try {
    const { symptoms, client_history, site_image_description, days_since_session, current_aftercare } = req.body || {};

    const systemPrompt = 'You are an infection-control specialist for tattoo / body-art studios. Always respond with valid JSON only. Output is decision-support only and does not replace medical advice.';
    const prompt = `Assess infection risk and recommend an urgency tier for the following case.

Symptoms: ${JSON.stringify(symptoms || [])}
Client history: ${JSON.stringify(client_history || null)}
Site image description: ${JSON.stringify(site_image_description || null)}
Days since session: ${JSON.stringify(days_since_session ?? null)}
Current aftercare: ${JSON.stringify(current_aftercare || null)}

Return JSON exactly matching:
{
  "risk_level": "low|moderate|elevated|high|urgent",
  "urgency": "self_care|contact_studio|see_doctor|emergency",
  "indicators_present": ["..."],
  "recommended_immediate_actions": ["..."],
  "escalation_threshold": "..."
}`;

    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await saveAIResult(req.user?.id, 'infection-risk-assessment', { symptoms, days_since_session }, parsed);
    await saveGeneration('infection-risk-assessment', prompt, text, MODEL);
    res.json({ assessment: parsed });
  } catch (err) {
    if (err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
