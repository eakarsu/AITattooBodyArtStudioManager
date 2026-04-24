import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import AIOutput from '../components/AIOutput';

const AI_FEATURES = {
  'generate-design': {
    title: 'Flash Design Generator',
    icon: '\uD83C\uDFA8',
    description: 'Generate detailed tattoo design concepts using AI',
    fields: [
      { key: 'description', label: 'Design Description', type: 'textarea', placeholder: 'Describe the tattoo design you want (e.g., a phoenix rising from flames with cherry blossoms)' },
      { key: 'style', label: 'Style', type: 'select', options: [
        { value: '', label: 'Artist Choice' },
        { value: 'traditional', label: 'Traditional / Old School' },
        { value: 'neo-traditional', label: 'Neo-Traditional' },
        { value: 'japanese', label: 'Japanese / Irezumi' },
        { value: 'realism', label: 'Realism' },
        { value: 'blackwork', label: 'Blackwork' },
        { value: 'watercolor', label: 'Watercolor' },
        { value: 'geometric', label: 'Geometric' },
        { value: 'minimalist', label: 'Minimalist' },
        { value: 'dotwork', label: 'Dotwork' },
        { value: 'tribal', label: 'Tribal' },
        { value: 'chicano', label: 'Chicano' },
        { value: 'surrealism', label: 'Surrealism' },
      ]},
      { key: 'size', label: 'Size', type: 'select', options: [
        { value: '', label: 'Not Specified' },
        { value: 'tiny', label: 'Tiny (< 2 inches)' },
        { value: 'small', label: 'Small (2-4 inches)' },
        { value: 'medium', label: 'Medium (4-6 inches)' },
        { value: 'large', label: 'Large (6-10 inches)' },
        { value: 'extra-large', label: 'Extra Large (10+ inches)' },
        { value: 'full-sleeve', label: 'Full Sleeve' },
        { value: 'half-sleeve', label: 'Half Sleeve' },
        { value: 'back-piece', label: 'Back Piece' },
      ]},
      { key: 'placement', label: 'Body Placement', placeholder: 'e.g., inner forearm, upper back, ribs' },
    ],
  },
  'customize-consent': {
    title: 'Consent Form Customizer',
    icon: '\uD83D\uDCCB',
    description: 'Auto-generate customized consent forms based on service and client details',
    fields: [
      { key: 'service_type', label: 'Service Type', type: 'select', options: [
        { value: 'tattoo', label: 'Tattoo' },
        { value: 'piercing', label: 'Piercing' },
        { value: 'microblading', label: 'Microblading' },
        { value: 'permanent-makeup', label: 'Permanent Makeup' },
        { value: 'scarification', label: 'Scarification' },
        { value: 'tooth-gem', label: 'Tooth Gem' },
      ]},
      { key: 'medical_conditions', label: 'Medical Conditions', type: 'textarea', placeholder: 'e.g., diabetes, blood disorders, skin conditions' },
      { key: 'allergies', label: 'Known Allergies', type: 'textarea', placeholder: 'e.g., latex, certain ink pigments, antibiotics' },
      { key: 'special_considerations', label: 'Special Considerations', type: 'textarea', placeholder: 'e.g., first tattoo, pregnancy, keloid scarring history' },
    ],
  },
  'personalize-aftercare': {
    title: 'Aftercare Personalizer',
    icon: '\uD83D\uDC8A',
    description: 'Generate personalized aftercare instructions tailored to each client',
    fields: [
      { key: 'service_type', label: 'Service Type', type: 'select', options: [
        { value: 'tattoo', label: 'Tattoo' },
        { value: 'piercing', label: 'Piercing' },
        { value: 'microblading', label: 'Microblading' },
      ]},
      { key: 'skin_type', label: 'Skin Type', type: 'select', options: [
        { value: 'normal', label: 'Normal' },
        { value: 'sensitive', label: 'Sensitive' },
        { value: 'dry', label: 'Dry' },
        { value: 'oily', label: 'Oily' },
        { value: 'combination', label: 'Combination' },
        { value: 'eczema-prone', label: 'Eczema-Prone' },
      ]},
      { key: 'placement', label: 'Placement', placeholder: 'e.g., inner wrist, behind ear' },
      { key: 'size', label: 'Size', placeholder: 'e.g., 3x4 inches' },
      { key: 'medical_conditions', label: 'Medical Conditions', type: 'textarea', placeholder: 'Any relevant medical conditions' },
      { key: 'allergies', label: 'Allergies', type: 'textarea', placeholder: 'Allergies to ointments, fragrances, etc.' },
    ],
  },
  'generate-caption': {
    title: 'Social Media Caption Generator',
    icon: '\uD83D\uDCF8',
    description: 'Create engaging social media captions for your portfolio posts',
    fields: [
      { key: 'design_description', label: 'Design Description', type: 'textarea', placeholder: 'Describe the piece you want to post about' },
      { key: 'style', label: 'Tattoo Style', placeholder: 'e.g., Japanese, Realism, Traditional' },
      { key: 'artist_name', label: 'Artist Name', placeholder: 'Artist who created the piece' },
      { key: 'platform', label: 'Platform', type: 'select', options: [
        { value: 'Instagram', label: 'Instagram' },
        { value: 'TikTok', label: 'TikTok' },
        { value: 'Facebook', label: 'Facebook' },
        { value: 'Twitter', label: 'Twitter / X' },
        { value: 'Pinterest', label: 'Pinterest' },
      ]},
    ],
  },
  'match-style': {
    title: 'Style Matcher',
    icon: '\uD83C\uDFAF',
    description: 'Match clients with the best artist based on style preferences and budget',
    fields: [
      { key: 'client_preferences', label: 'Client Preferences', type: 'textarea', placeholder: 'What is the client looking for? Describe their vision.' },
      { key: 'desired_style', label: 'Desired Style', placeholder: 'e.g., Japanese sleeve, realistic portrait' },
      { key: 'description', label: 'Design Description', type: 'textarea', placeholder: 'Detailed description of the desired tattoo' },
      { key: 'budget', label: 'Budget ($)', type: 'number', placeholder: '500' },
    ],
  },
  'draft-message': {
    title: 'Message Drafter',
    icon: '\uD83D\uDCAC',
    description: 'Draft professional booking confirmations, reminders, and follow-up messages',
    fields: [
      { key: 'message_type', label: 'Message Type', type: 'select', options: [
        { value: 'booking confirmation', label: 'Booking Confirmation' },
        { value: '24-hour reminder', label: '24-Hour Reminder' },
        { value: 'day-of reminder', label: 'Day-of Reminder' },
        { value: 'rescheduling', label: 'Rescheduling Notice' },
        { value: 'cancellation', label: 'Cancellation' },
        { value: 'aftercare follow-up', label: 'Aftercare Follow-up' },
        { value: 'thank you', label: 'Thank You' },
      ]},
      { key: 'client_name', label: 'Client Name', placeholder: 'Client name' },
      { key: 'appointment_date', label: 'Appointment Date', type: 'date' },
      { key: 'appointment_time', label: 'Appointment Time', type: 'time' },
      { key: 'artist_name', label: 'Artist Name', placeholder: 'Assigned artist' },
      { key: 'service_type', label: 'Service Type', placeholder: 'e.g., full color sleeve session' },
      { key: 'custom_details', label: 'Additional Details', type: 'textarea', placeholder: 'Any custom info to include in the message' },
    ],
  },
};

function AIPage() {
  const { feature } = useParams();
  const config = AI_FEATURES[feature];
  const [formData, setFormData] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!config) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">{'\u2753'}</div>
          <div className="empty-state-title">AI Feature Not Found</div>
          <div className="empty-state-desc">The requested AI feature does not exist.</div>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const res = await api.post(`/ai/${feature}`, formData);
      setResponse({
        ...res.data,
        timestamp: new Date().toISOString(),
        model: 'AI Assistant',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page-container">
      <div className="ai-section">
        <div className="ai-section-header">
          <h2>
            <span>{config.icon}</span> {config.title}
          </h2>
          <span className="badge badge-ai">{'\u2728'} AI Powered</span>
        </div>
        <div className="ai-section-body">
          <p style={{ color: '#b0b0b0', marginBottom: '24px', fontSize: '0.92rem' }}>
            {config.description}
          </p>

          {/* Input Form */}
          <div style={{ marginBottom: '24px' }}>
            {config.fields.map((field) => (
              <div className="form-group" key={field.key}>
                <label className="form-label">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="form-textarea"
                    value={formData[field.key] || ''}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder || ''}
                    rows={3}
                  />
                ) : field.type === 'select' ? (
                  <select
                    className="form-select"
                    value={formData[field.key] || ''}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  >
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    className="form-input"
                    value={formData[field.key] || ''}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </div>
            ))}

            {error && <div className="login-error" style={{ marginBottom: '16px' }}>{error}</div>}

            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerate}
              disabled={loading}
              style={{ minWidth: '200px' }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner loading-spinner-sm loading-spinner-inline" />
                  Generating...
                </>
              ) : (
                <>{'\u2728'} Generate</>
              )}
            </button>
          </div>

          {/* AI Output */}
          {loading && !response && (
            <div className="ai-output">
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="loading-spinner" />
                <p style={{ color: '#777', marginTop: '16px' }}>AI is thinking...</p>
              </div>
            </div>
          )}

          <AIOutput response={response} feature={feature} onRegenerate={handleRegenerate} />
        </div>
      </div>
    </div>
  );
}

export default AIPage;
