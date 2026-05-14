import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function SmartBookingPage() {
  const [artists, setArtists] = useState([]);
  const [formData, setFormData] = useState({
    artist_id: '',
    service_type: 'Tattoo',
    duration_minutes: 60,
    preferred_date: '',
    budget: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conflictCheck, setConflictCheck] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/artists').then(res => {
      const data = res.data?.data || res.data || [];
      setArtists(data.filter(a => a.available !== false));
    }).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSmartBook = async () => {
    if (!formData.artist_id || !formData.preferred_date) {
      return showToast('Please select an artist and date', 'error');
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/smart-book', {
        artist_id: parseInt(formData.artist_id),
        service_type: formData.service_type,
        duration_minutes: parseInt(formData.duration_minutes),
        preferred_date: formData.preferred_date,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      });
      setResult(res.data);
    } catch (err) {
      showToast('Smart booking failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConflictCheck = async () => {
    if (!formData.artist_id || !formData.preferred_date) {
      return showToast('Select artist and date for conflict check', 'error');
    }
    if (!conflictCheck?.time) {
      return showToast('Enter a time for conflict check', 'error');
    }
    try {
      const params = new URLSearchParams({
        artist_id: formData.artist_id,
        date: formData.preferred_date,
        time: conflictCheck.time,
        duration_minutes: formData.duration_minutes,
      });
      const res = await api.get(`/appointments/check-conflict?${params}`);
      setConflictCheck(prev => ({ ...prev, result: res.data }));
    } catch (err) {
      showToast('Conflict check failed', 'error');
    }
  };

  return (
    <div className="page-container">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <h1>Smart Booking Engine</h1>
        <span className="badge badge-success">Conflict Detection</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Smart Book Form */}
        <div className="ai-section">
          <div className="ai-section-header"><h2>Find Available Slots</h2></div>
          <div className="ai-section-body">
            <div className="form-group">
              <label className="form-label">Select Artist</label>
              <select
                className="form-select"
                value={formData.artist_id}
                onChange={e => setFormData({ ...formData, artist_id: e.target.value })}
              >
                <option value="">Choose artist...</option>
                {artists.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.specialties} (${a.hourly_rate}/hr)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select
                className="form-select"
                value={formData.service_type}
                onChange={e => setFormData({ ...formData, service_type: e.target.value })}
              >
                {['Tattoo', 'Piercing', 'Microblading', 'Touch-Up', 'Cover-Up', 'Flash'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <select
                className="form-select"
                value={formData.duration_minutes}
                onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
              >
                {[30, 60, 90, 120, 180, 240, 300, 360].map(d => (
                  <option key={d} value={d}>{d >= 60 ? `${d / 60}h` : `${d}min`}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.preferred_date}
                onChange={e => setFormData({ ...formData, preferred_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Budget ($) — Optional</label>
              <input
                type="number"
                className="form-input"
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. 500"
                min="0"
              />
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleSmartBook}
              disabled={loading}
            >
              {loading ? 'Finding slots...' : 'Find Available Slots'}
            </button>
          </div>
        </div>

        {/* Conflict Check */}
        <div className="ai-section">
          <div className="ai-section-header"><h2>Conflict Checker</h2></div>
          <div className="ai-section-body">
            <p style={{ color: '#999', marginBottom: '16px', fontSize: '0.9rem' }}>
              Check if a specific time has a scheduling conflict for the selected artist.
            </p>
            <div className="form-group">
              <label className="form-label">Specific Time (HH:MM)</label>
              <input
                type="time"
                className="form-input"
                value={conflictCheck?.time || ''}
                onChange={e => setConflictCheck(prev => ({ ...prev, time: e.target.value, result: null }))}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleConflictCheck}
            >
              Check for Conflicts
            </button>

            {conflictCheck?.result && (
              <div style={{ marginTop: '16px' }}>
                {conflictCheck.result.conflict ? (
                  <div style={{ background: '#7f1d1d', padding: '12px', borderRadius: '8px', border: '1px solid #ef4444' }}>
                    <strong style={{ color: '#ef4444' }}>Conflict Detected</strong>
                    <p style={{ color: '#fca5a5', marginTop: '4px' }}>
                      Appointment #{conflictCheck.result.conflicting_appointment_id} overlaps with this time slot.
                    </p>
                  </div>
                ) : (
                  <div style={{ background: '#14532d', padding: '12px', borderRadius: '8px', border: '1px solid #10b981' }}>
                    <strong style={{ color: '#10b981' }}>No Conflict</strong>
                    <p style={{ color: '#6ee7b7', marginTop: '4px' }}>This time slot is available.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="ai-section" style={{ marginTop: '24px' }}>
          <div className="ai-section-header">
            <h2>Available Slots — {result.artist?.name}</h2>
            <span style={{ color: '#999', fontSize: '0.9rem' }}>{result.preferred_date}</span>
          </div>
          <div className="ai-section-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#1a1a2e', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7c3aed' }}>{result.available_slots?.length || 0}</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Available Slots</div>
              </div>
              <div style={{ background: '#1a1a2e', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>{result.booked_slots?.length || 0}</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Booked Slots</div>
              </div>
              <div style={{ background: '#1a1a2e', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>${result.deposit_amount}</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Deposit Required</div>
              </div>
            </div>

            {result.estimated_total && (
              <p style={{ color: '#999', marginBottom: '16px' }}>
                Estimated total: <strong style={{ color: '#06b6d4' }}>${result.estimated_total}</strong>
              </p>
            )}

            <p style={{ color: '#10b981', marginBottom: '16px' }}>{result.recommendation}</p>

            {result.available_slots?.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px' }}>Available Time Slots</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.available_slots.map(slot => (
                    <span
                      key={slot}
                      style={{
                        background: '#7c3aed',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.booked_slots?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '8px', color: '#ef4444' }}>Already Booked</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.booked_slots.map((slot, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#3f1212',
                        color: '#fca5a5',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                      }}
                    >
                      {slot.time} ({slot.duration}min)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartBookingPage;
