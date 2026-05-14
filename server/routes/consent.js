const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const pool = require('../db');

// GET /api/consent — paginated
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM consent_forms');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT cf.*, c.name AS client_name, a.date AS appointment_date, a.service_type
      FROM consent_forms cf
      LEFT JOIN clients c ON cf.client_id = c.id
      LEFT JOIN appointments a ON cf.appointment_id = a.id
      ORDER BY cf.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get consent forms error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/consent/:id
router.get('/:id', async (req, res) => {
  try {
    if (req.params.id === 'check-conflict') return res.status(400).json({ error: 'Invalid id' });
    const result = await pool.query(`
      SELECT cf.*, c.name AS client_name, a.date AS appointment_date, a.service_type
      FROM consent_forms cf
      LEFT JOIN clients c ON cf.client_id = c.id
      LEFT JOIN appointments a ON cf.appointment_id = a.id
      WHERE cf.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consent form not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get consent form error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/consent/:id/pdf — generate PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cf.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone,
             c.date_of_birth, a.date AS appointment_date, a.service_type, a.time AS appointment_time,
             ar.name AS artist_name
      FROM consent_forms cf
      LEFT JOIN clients c ON cf.client_id = c.id
      LEFT JOIN appointments a ON cf.appointment_id = a.id
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE cf.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consent form not found' });
    }

    const form = result.rows[0];
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="consent-form-${form.id}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('INK STUDIO', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Tattoo & Body Art Studio', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').text('CONSENT & WAIVER FORM', { align: 'center' });
    doc.moveDown();

    // Form type badge
    doc.fontSize(12).font('Helvetica-Bold').text(`Form Type: ${form.form_type || 'Tattoo Consent'}`, { align: 'center' });
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Client Info
    doc.fontSize(13).font('Helvetica-Bold').text('CLIENT INFORMATION');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Name: ${form.client_name || 'N/A'}`);
    doc.text(`Email: ${form.client_email || 'N/A'}`);
    doc.text(`Phone: ${form.client_phone || 'N/A'}`);
    if (form.date_of_birth) doc.text(`Date of Birth: ${new Date(form.date_of_birth).toLocaleDateString()}`);
    doc.moveDown();

    // Appointment Info
    if (form.appointment_date) {
      doc.fontSize(13).font('Helvetica-Bold').text('APPOINTMENT DETAILS');
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Date: ${new Date(form.appointment_date).toLocaleDateString()}`);
      if (form.appointment_time) doc.text(`Time: ${form.appointment_time}`);
      if (form.service_type) doc.text(`Service: ${form.service_type}`);
      if (form.artist_name) doc.text(`Artist: ${form.artist_name}`);
      doc.moveDown();
    }

    // Consent Content
    doc.fontSize(13).font('Helvetica-Bold').text('CONSENT CONTENT');
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').text(form.content || 'Standard consent terms apply.', { align: 'justify' });
    doc.moveDown();

    // Signature Section
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(13).font('Helvetica-Bold').text('SIGNATURE');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Signed: ${form.signed ? 'YES' : 'NOT YET SIGNED'}`);
    if (form.signed_date) doc.text(`Date Signed: ${new Date(form.signed_date).toLocaleDateString()}`);
    if (form.witness_name) doc.text(`Witness: ${form.witness_name}`);
    doc.moveDown(2);
    doc.text('Client Signature: _______________________________');
    doc.moveDown();
    doc.text('Date: _______________________________');
    doc.moveDown();
    doc.text('Witness Signature: _______________________________');
    doc.moveDown(2);

    // Footer
    doc.fontSize(9).font('Helvetica').fillColor('gray')
      .text(`Generated: ${new Date().toLocaleString()} | Form ID: ${form.id}`, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
  }
});

// POST /api/consent
router.post('/', async (req, res) => {
  try {
    const { client_id, appointment_id, form_type, content, signed, signed_date, witness_name } = req.body;
    const result = await pool.query(
      `INSERT INTO consent_forms (client_id, appointment_id, form_type, content, signed, signed_date, witness_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [client_id, appointment_id, form_type, content, signed || false, signed_date, witness_name],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create consent form error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/consent/:id
router.put('/:id', async (req, res) => {
  try {
    const { client_id, appointment_id, form_type, content, signed, signed_date, witness_name } = req.body;
    const result = await pool.query(
      `UPDATE consent_forms SET client_id = $1, appointment_id = $2, form_type = $3, content = $4,
       signed = $5, signed_date = $6, witness_name = $7 WHERE id = $8 RETURNING *`,
      [client_id, appointment_id, form_type, content, signed, signed_date, witness_name, req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consent form not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update consent form error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/consent/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM consent_forms WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consent form not found' });
    }
    res.json({ message: 'Consent form deleted', consent_form: result.rows[0] });
  } catch (err) {
    console.error('Delete consent form error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
