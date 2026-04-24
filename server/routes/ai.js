const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require('../db');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(prompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated';
}

async function saveGeneration(feature, prompt, response, model) {
  try {
    await pool.query(
      'INSERT INTO ai_generations (feature, prompt, response, model) VALUES ($1, $2, $3, $4)',
      [feature, prompt, response, model || process.env.OPENROUTER_MODEL]
    );
  } catch (err) {
    console.error('Error saving AI generation:', err);
  }
}

// POST /api/ai/generate-design
router.post('/generate-design', async (req, res) => {
  try {
    const { description, style, size, placement } = req.body;
    const prompt = `You are a professional tattoo artist and designer. Generate a detailed flash tattoo design description based on the following client input:

Description: ${description || 'Not specified'}
Style: ${style || 'Artist choice'}
Size: ${size || 'Medium'}
Placement: ${placement || 'Not specified'}

Provide: 1) A vivid visual description of the design, 2) Color palette recommendations, 3) Line work style suggestions, 4) Any placement-specific considerations, 5) Estimated session time.`;

    const aiResponse = await callOpenRouter(prompt);
    await saveGeneration('generate-design', prompt, aiResponse);
    res.json({ result: aiResponse });
  } catch (err) {
    console.error('Generate design error:', err);
    res.status(500).json({ error: 'Failed to generate design: ' + err.message });
  }
});

// POST /api/ai/customize-consent
router.post('/customize-consent', async (req, res) => {
  try {
    const { service_type, medical_conditions, allergies, special_considerations } = req.body;
    const prompt = `You are a legal compliance specialist for a tattoo and body art studio. Generate a customized consent form for the following service:

Service Type: ${service_type || 'Tattoo'}
Client Medical Conditions: ${medical_conditions || 'None reported'}
Known Allergies: ${allergies || 'None reported'}
Special Considerations: ${special_considerations || 'None'}

Generate a comprehensive consent form that includes: 1) Service description and risks, 2) Medical disclosure acknowledgment, 3) Allergy-specific warnings, 4) Aftercare commitment, 5) Photo/portfolio release option, 6) Age verification statement. Keep the language professional but accessible.`;

    const aiResponse = await callOpenRouter(prompt);
    await saveGeneration('customize-consent', prompt, aiResponse);
    res.json({ result: aiResponse });
  } catch (err) {
    console.error('Customize consent error:', err);
    res.status(500).json({ error: 'Failed to customize consent form: ' + err.message });
  }
});

// POST /api/ai/personalize-aftercare
router.post('/personalize-aftercare', async (req, res) => {
  try {
    const { service_type, skin_type, placement, size, medical_conditions, allergies } = req.body;
    const prompt = `You are an experienced tattoo aftercare specialist. Generate personalized aftercare instructions for:

Service: ${service_type || 'Tattoo'}
Skin Type: ${skin_type || 'Normal'}
Placement: ${placement || 'Not specified'}
Size: ${size || 'Medium'}
Medical Conditions: ${medical_conditions || 'None'}
Allergies: ${allergies || 'None'}

Provide detailed day-by-day aftercare instructions for the first 2 weeks, including: 1) Immediate post-session care, 2) Cleaning routine, 3) Moisturizing recommendations (considering allergies), 4) Activities to avoid, 5) Signs of normal healing vs. infection, 6) When to contact the studio. Personalize based on the placement and skin type.`;

    const aiResponse = await callOpenRouter(prompt);
    await saveGeneration('personalize-aftercare', prompt, aiResponse);
    res.json({ result: aiResponse });
  } catch (err) {
    console.error('Personalize aftercare error:', err);
    res.status(500).json({ error: 'Failed to personalize aftercare: ' + err.message });
  }
});

// POST /api/ai/generate-caption
router.post('/generate-caption', async (req, res) => {
  try {
    const { design_description, style, artist_name, platform } = req.body;
    const prompt = `You are a social media manager for a high-end tattoo studio. Generate an engaging ${platform || 'Instagram'} caption for a portfolio post:

Design: ${design_description || 'Custom tattoo piece'}
Style: ${style || 'Not specified'}
Artist: ${artist_name || 'Studio artist'}

Create: 1) An attention-grabbing caption (2-3 sentences), 2) Relevant hashtags (15-20), 3) A call-to-action for booking. Keep the tone professional yet approachable. Highlight the artistry and craftsmanship.`;

    const aiResponse = await callOpenRouter(prompt);
    await saveGeneration('generate-caption', prompt, aiResponse);
    res.json({ result: aiResponse });
  } catch (err) {
    console.error('Generate caption error:', err);
    res.status(500).json({ error: 'Failed to generate caption: ' + err.message });
  }
});

// POST /api/ai/match-style
router.post('/match-style', async (req, res) => {
  try {
    const { client_preferences, desired_style, budget, description } = req.body;

    // Fetch available artists
    const artistsResult = await pool.query(
      'SELECT id, name, specialties, experience_years, hourly_rate, rating, bio FROM artists WHERE available = true ORDER BY rating DESC'
    );
    const artists = artistsResult.rows;

    const prompt = `You are a tattoo studio concierge. Match the client with the best artist(s) from our roster.

Client Preferences:
- Style: ${desired_style || client_preferences || 'Open to suggestions'}
- Description: ${description || 'Not provided'}
- Budget: ${budget ? '$' + budget : 'Flexible'}

Available Artists:
${artists.map(a => `- ${a.name}: Specialties: ${a.specialties}, Experience: ${a.experience_years} years, Rate: $${a.hourly_rate}/hr, Rating: ${a.rating}/5`).join('\n')}

Recommend the top 3 artists with: 1) Why they are a good match, 2) Their relevant experience, 3) Expected price range, 4) Portfolio highlights to look at. If the budget is tight, suggest alternatives.`;

    const aiResponse = await callOpenRouter(prompt);
    await saveGeneration('match-style', prompt, aiResponse);
    res.json({ result: aiResponse, artists });
  } catch (err) {
    console.error('Match style error:', err);
    res.status(500).json({ error: 'Failed to match style: ' + err.message });
  }
});

// POST /api/ai/draft-message
router.post('/draft-message', async (req, res) => {
  try {
    const { message_type, client_name, appointment_date, appointment_time, artist_name, service_type, custom_details } = req.body;
    const prompt = `You are a professional receptionist at a premium tattoo studio called "Ink & Art Studio". Draft a ${message_type || 'booking confirmation'} message:

Client: ${client_name || 'Valued Client'}
Date: ${appointment_date || 'TBD'}
Time: ${appointment_time || 'TBD'}
Artist: ${artist_name || 'Your assigned artist'}
Service: ${service_type || 'Tattoo session'}
Additional Details: ${custom_details || 'None'}

Message types to handle: confirmation, reminder (24hr), reminder (day-of), rescheduling, cancellation, follow-up/aftercare check-in.

Keep the message warm, professional, and concise. Include any relevant preparation instructions (e.g., eat beforehand, stay hydrated, wear comfortable clothing). Include studio contact info placeholder.`;

    const aiResponse = await callOpenRouter(prompt);
    await saveGeneration('draft-message', prompt, aiResponse);
    res.json({ result: aiResponse });
  } catch (err) {
    console.error('Draft message error:', err);
    res.status(500).json({ error: 'Failed to draft message: ' + err.message });
  }
});

module.exports = router;
