import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#1a1a2e',
      border: `1px solid ${color || '#333'}`,
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: color || '#7c3aed' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

function ArtistPerformancePage() {
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [period, setPeriod] = useState('');
  const [performance, setPerformance] = useState(null);
  const [coaching, setCoaching] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coachingLoading, setCoachingLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/artists').then(res => {
      const data = res.data?.data || res.data || [];
      setArtists(data);
    }).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPerformance = async () => {
    if (!selectedArtist) return;
    setLoading(true);
    setPerformance(null);
    setCoaching(null);
    try {
      const params = period ? `?period=${period}` : '';
      const res = await api.get(`/performance/${selectedArtist}${params}`);
      setPerformance(res.data);
    } catch (err) {
      showToast('Failed to load performance: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCoaching = async () => {
    if (!selectedArtist) return;
    setCoachingLoading(true);
    setCoaching(null);
    try {
      const res = await api.post(`/performance/${selectedArtist}/coaching`);
      setCoaching(res.data.coaching);
      showToast('AI coaching summary generated');
    } catch (err) {
      showToast('Coaching failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setCoachingLoading(false);
    }
  };

  const stats = performance?.stats;

  return (
    <div className="page-container">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <h1>Artist Performance Dashboard</h1>
        <span className="badge badge-ai">AI Coaching Available</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select
          className="form-select"
          style={{ minWidth: '200px' }}
          value={selectedArtist}
          onChange={e => setSelectedArtist(e.target.value)}
        >
          <option value="">Select Artist...</option>
          {artists.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <input
          type="month"
          className="form-input"
          style={{ minWidth: '160px' }}
          value={period}
          onChange={e => setPeriod(e.target.value)}
          placeholder="Filter by month"
        />

        <button
          className="btn btn-primary"
          onClick={loadPerformance}
          disabled={loading || !selectedArtist}
        >
          {loading ? 'Loading...' : 'Load Performance'}
        </button>

        {performance && (
          <button
            className="btn btn-ai"
            onClick={loadCoaching}
            disabled={coachingLoading}
          >
            {coachingLoading ? 'Generating...' : 'AI Coaching Summary'}
          </button>
        )}
      </div>

      {performance && (
        <>
          {/* Artist Info */}
          <div className="ai-section" style={{ marginBottom: '24px' }}>
            <div className="ai-section-header">
              <h2>{performance.artist.name}</h2>
              <span style={{ color: '#999', fontSize: '0.9rem' }}>
                {performance.artist.specialties} | {performance.artist.experience_years} years experience
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard label="Total Appointments" value={stats.total_appointments} color="#7c3aed" />
            <StatCard label="Completed" value={stats.completed_appointments} color="#10b981" />
            <StatCard label="Cancelled" value={stats.cancelled_appointments} color="#ef4444" />
            <StatCard label="Avg Session" value={`${stats.avg_session_minutes}m`} color="#f59e0b" />
            <StatCard label="Total Revenue" value={`$${parseFloat(stats.total_revenue).toLocaleString()}`} color="#06b6d4" />
            <StatCard label="Commission Earned" value={`$${parseFloat(stats.total_commission).toLocaleString()}`} color="#8b5cf6" />
            <StatCard label="Tips" value={`$${parseFloat(stats.total_tips).toLocaleString()}`} color="#ec4899" />
            <StatCard label="Unique Clients" value={stats.unique_clients} color="#14b8a6" />
            <StatCard label="Repeat Rate" value={`${stats.repeat_client_rate_pct}%`} sub="2+ visits" color="#f97316" />
            <StatCard label="Rating" value={stats.rating ? `${stats.rating}/5` : 'N/A'} color="#eab308" />
          </div>

          {/* Monthly Breakdown */}
          {performance.monthly_breakdown?.length > 0 && (
            <div className="ai-section" style={{ marginBottom: '24px' }}>
              <div className="ai-section-header"><h2>Monthly Breakdown</h2></div>
              <div className="ai-section-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Appointments</th>
                      <th>Completed</th>
                      <th>Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.monthly_breakdown.map(m => (
                      <tr key={m.month}>
                        <td>{m.month}</td>
                        <td>{m.appointments}</td>
                        <td>{m.completed}</td>
                        <td>
                          <span className={`badge ${parseInt(m.appointments) > 0 && parseInt(m.completed) / parseInt(m.appointments) >= 0.8 ? 'badge-success' : 'badge-warning'}`}>
                            {m.appointments > 0 ? `${Math.round((m.completed / m.appointments) * 100)}%` : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* AI Coaching Panel */}
      {(coachingLoading || coaching) && (
        <div className="ai-section">
          <div className="ai-section-header">
            <h2>AI Coaching Summary</h2>
            <span className="badge badge-ai">AI Generated</span>
          </div>
          <div className="ai-section-body">
            {coachingLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="loading-spinner" />
                <p style={{ color: '#777', marginTop: '16px' }}>Generating personalized coaching insights...</p>
              </div>
            )}

            {coaching && !coachingLoading && (
              <div style={{ display: 'grid', gap: '16px' }}>
                {coaching.strengths?.length > 0 && (
                  <div>
                    <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Strengths</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {coaching.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {coaching.improvement_areas?.length > 0 && (
                  <div>
                    <h4 style={{ color: '#f59e0b', marginBottom: '8px' }}>Areas for Improvement</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {coaching.improvement_areas.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                {coaching.revenue_forecast && (
                  <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ color: '#06b6d4', marginBottom: '8px' }}>Revenue Forecast</h4>
                    <p>Next month estimate: <strong>${coaching.revenue_forecast.next_month_estimate?.toLocaleString()}</strong></p>
                    <p>Growth potential: <strong>{coaching.revenue_forecast.growth_potential_pct}%</strong></p>
                    <p style={{ color: '#999', fontSize: '0.85rem' }}>{coaching.revenue_forecast.key_assumptions}</p>
                  </div>
                )}
                {coaching.action_items?.length > 0 && (
                  <div>
                    <h4 style={{ color: '#7c3aed', marginBottom: '8px' }}>Action Items</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {coaching.action_items.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                {coaching.client_retention_tip && (
                  <div style={{ background: '#1a1a2e', padding: '12px', borderRadius: '8px', border: '1px solid #7c3aed' }}>
                    <h4 style={{ color: '#7c3aed', marginBottom: '4px' }}>Retention Tip</h4>
                    <p>{coaching.client_retention_tip}</p>
                  </div>
                )}
                {coaching.raw && (
                  <p style={{ color: '#b0b0b0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{coaching.raw}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!performance && !loading && (
        <div className="empty-state">
          <p>Select an artist and click "Load Performance" to view their dashboard</p>
        </div>
      )}
    </div>
  );
}

export default ArtistPerformancePage;
