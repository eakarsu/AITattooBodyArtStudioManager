import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

function HealingTrackerPage() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [formData, setFormData] = useState({ days_since_session: '', service_type: 'Tattoo' });
  const [assessment, setAssessment] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    api.get('/clients').then(res => {
      const data = res.data?.data || res.data || [];
      setClients(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadPhotos();
    }
  }, [selectedClient]);

  const loadPhotos = async () => {
    try {
      const res = await api.get(`/healing/${selectedClient}/photos`);
      setPhotos(res.data || []);
    } catch {
      setPhotos([]);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedClient || !fileInputRef.current?.files[0]) {
      return showToast('Please select a client and photo', 'error');
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', fileInputRef.current.files[0]);
      fd.append('days_since_session', formData.days_since_session);
      fd.append('service_type', formData.service_type);
      await api.post(`/healing/${selectedClient}/photos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Photo uploaded successfully');
      loadPhotos();
      fileInputRef.current.value = '';
      setPreviewUrl(null);
      setPhotoBase64(null);
    } catch (err) {
      showToast('Upload failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAIAssess = async () => {
    if (!photoBase64) {
      return showToast('Please select a photo first', 'error');
    }
    setAssessing(true);
    setAssessment(null);
    try {
      const res = await api.post('/ai/healing-check', {
        photo_base64: photoBase64,
        days_since_session: formData.days_since_session,
        service_type: formData.service_type,
        client_id: selectedClient,
      });
      setAssessment(res.data.parsed || { raw: res.data.result });
      showToast('AI assessment complete');
    } catch (err) {
      showToast('Assessment failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setAssessing(false);
    }
  };

  const serviceTypes = ['Tattoo', 'Piercing', 'Microblading', 'Permanent Makeup'];

  return (
    <div className="page-container">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <h1>Healing Tracker</h1>
        <span className="badge badge-ai">AI Powered</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Upload Panel */}
        <div className="ai-section">
          <div className="ai-section-header">
            <h2>Upload Healing Photo</h2>
          </div>
          <div className="ai-section-body">
            <div className="form-group">
              <label className="form-label">Select Client</label>
              <select
                className="form-select"
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
              >
                <option value="">Choose client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
                {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Days Since Session</label>
              <input
                type="number"
                className="form-input"
                value={formData.days_since_session}
                onChange={e => setFormData({ ...formData, days_since_session: e.target.value })}
                placeholder="e.g. 7"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Healing Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
              />
            </div>

            {previewUrl && (
              <div style={{ marginBottom: '16px' }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #333' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading || !selectedClient}
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
              <button
                className="btn btn-ai"
                onClick={handleAIAssess}
                disabled={assessing || !photoBase64}
              >
                {assessing ? 'Assessing...' : 'AI Healing Check'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Assessment Panel */}
        <div className="ai-section">
          <div className="ai-section-header">
            <h2>AI Assessment</h2>
          </div>
          <div className="ai-section-body">
            {assessing && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="loading-spinner" />
                <p style={{ color: '#777', marginTop: '16px' }}>Analyzing healing progress...</p>
              </div>
            )}

            {assessment && !assessing && (
              <div className="ai-output">
                <div style={{ display: 'grid', gap: '12px' }}>
                  {assessment.healing_stage && (
                    <div className="detail-item">
                      <label>Healing Stage</label>
                      <span className={`badge ${assessment.is_healing_normally ? 'badge-success' : 'badge-warning'}`}>
                        {assessment.healing_stage}
                      </span>
                    </div>
                  )}
                  {assessment.healing_progress_pct != null && (
                    <div className="detail-item">
                      <label>Healing Progress</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, background: '#222', borderRadius: '4px', height: '8px' }}>
                          <div style={{ width: `${assessment.healing_progress_pct}%`, background: '#7c3aed', height: '8px', borderRadius: '4px' }} />
                        </div>
                        <span>{assessment.healing_progress_pct}%</span>
                      </div>
                    </div>
                  )}
                  {assessment.concern_flags?.length > 0 && (
                    <div className="detail-item">
                      <label>Concern Flags</label>
                      <ul style={{ margin: 0, paddingLeft: '16px', color: '#f59e0b' }}>
                        {assessment.concern_flags.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {assessment.recommendations?.length > 0 && (
                    <div className="detail-item">
                      <label>Recommendations</label>
                      <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {assessment.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {assessment.estimated_days_to_complete != null && (
                    <div className="detail-item">
                      <label>Est. Days to Complete</label>
                      <span>{assessment.estimated_days_to_complete} days</span>
                    </div>
                  )}
                  {assessment.follow_up_needed != null && (
                    <div className="detail-item">
                      <label>Follow-up Needed</label>
                      <span className={`badge ${assessment.follow_up_needed ? 'badge-warning' : 'badge-success'}`}>
                        {assessment.follow_up_needed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {assessment.raw && (
                    <div className="detail-item">
                      <label>AI Notes</label>
                      <p style={{ fontSize: '0.85rem', color: '#b0b0b0', whiteSpace: 'pre-wrap' }}>{assessment.raw}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!assessment && !assessing && (
              <div className="empty-state">
                <p>Select a photo and click "AI Healing Check" to get an assessment</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo History */}
      {selectedClient && (
        <div className="ai-section" style={{ marginTop: '24px' }}>
          <div className="ai-section-header">
            <h2>Healing Photo Timeline</h2>
          </div>
          <div className="ai-section-body">
            {photos.length === 0 ? (
              <div className="empty-state"><p>No healing photos yet for this client</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {photos.map(photo => (
                  <div key={photo.id} style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                      src={photo.photo_url}
                      alt="Healing"
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        Day {photo.days_since_session || '?'} - {photo.service_type}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {new Date(photo.created_at).toLocaleDateString()}
                      </div>
                      {photo.ai_assessment && (
                        <span className="badge badge-success" style={{ marginTop: '4px', fontSize: '0.7rem' }}>AI Assessed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HealingTrackerPage;
