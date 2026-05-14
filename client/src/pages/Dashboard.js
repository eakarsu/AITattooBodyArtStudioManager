import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const featureSections = [
  {
    title: 'AI Features',
    badge: 'AI Powered',
    cards: [
      { icon: '\uD83C\uDFA8', title: 'Flash Design Generator', desc: 'AI-powered tattoo design concepts and descriptions', route: '/ai/generate-design', countKey: 'ai' },
      { icon: '\uD83D\uDCCB', title: 'Consent Customizer', desc: 'Auto-generate customized consent forms', route: '/ai/customize-consent', countKey: 'ai' },
      { icon: '\uD83D\uDC8A', title: 'Aftercare Personalizer', desc: 'Personalized aftercare instructions for every client', route: '/ai/personalize-aftercare', countKey: 'ai' },
      { icon: '\uD83D\uDCF8', title: 'Caption Generator', desc: 'Social media captions for portfolio posts', route: '/ai/generate-caption', countKey: 'ai' },
      { icon: '\uD83C\uDFAF', title: 'Style Matcher', desc: 'Match clients with the perfect artist', route: '/ai/match-style', countKey: 'ai' },
      { icon: '\uD83D\uDCAC', title: 'Message Drafter', desc: 'Professional booking & follow-up messages', route: '/ai/draft-message', countKey: 'ai' },
      { icon: '🎨', title: 'Portfolio Style Classifier', desc: 'Auto-tag artist work by style and technique', route: '/ai/portfolio-classify', countKey: 'ai' },
      { icon: '📈', title: 'Demand Forecast', desc: 'Predict peak hours and artist scheduling', route: '/ai/demand-forecast', countKey: 'ai' },
    ],
  },
  {
    title: 'Client Management',
    cards: [
      { icon: '\uD83D\uDC64', title: 'Artists & Portfolios', desc: 'Manage artists, specialties, and rates', route: '/artists', countKey: 'artists' },
      { icon: '\uD83D\uDCC5', title: 'Appointments', desc: 'Schedule and track all appointments', route: '/appointments', countKey: 'appointments' },
      { icon: '\uD83E\uDDD1', title: 'Client Profiles', desc: 'Client database with history and preferences', route: '/clients', countKey: 'clients' },
      { icon: '\uD83D\uDCDD', title: 'Consent & Waivers', desc: 'Digital consent form management', route: '/consent', countKey: 'consent' },
      { icon: '\uD83D\uDCA1', title: 'Design Consultations', desc: 'Pre-appointment design discussions', route: '/consultations', countKey: 'consultations' },
    ],
  },
  {
    title: 'Operations',
    cards: [
      { icon: '\uD83D\uDCE6', title: 'Supply Inventory', desc: 'Track inks, needles, and supplies', route: '/inventory', countKey: 'inventory' },
      { icon: '\uD83D\uDD2C', title: 'Sterilization Logs', desc: 'Equipment sterilization tracking', route: '/sterilization', countKey: 'sterilization' },
      { icon: '\uD83D\uDEB6', title: 'Walk-in Queue', desc: 'Manage walk-in clients', route: '/walkins', countKey: 'walkins' },
      { icon: '\uD83E\uDDF9', title: 'Cleaning Checklists', desc: 'Station & studio cleaning logs', route: '/cleaning', countKey: 'cleaning' },
      { icon: '\u26A1', title: 'Flash Designs', desc: 'Flash sheet gallery management', route: '/flash', countKey: 'flash' },
      { icon: '\uD83E\uDE79', title: 'Aftercare Tracking', desc: 'Client healing progress tracking', route: '/aftercare', countKey: 'aftercare' },
    ],
  },
  {
    title: 'Financial',
    cards: [
      { icon: '\uD83C\uDF81', title: 'Gift Certificates', desc: 'Create and redeem gift certificates', route: '/gifts', countKey: 'gifts' },
      { icon: '\u2B50', title: 'Loyalty Program', desc: 'Reward returning clients', route: '/loyalty', countKey: 'loyalty' },
      { icon: '\uD83D\uDCB0', title: 'Commission Tracking', desc: 'Artist earnings and payouts', route: '/commissions', countKey: 'commissions' },
      { icon: '\uD83D\uDCB2', title: 'Pricing Calculator', desc: 'Dynamic pricing estimates', route: '/pricing', countKey: 'pricing' },
    ],
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const endpoints = [
      'artists', 'appointments', 'clients', 'consent', 'consultations',
      'inventory', 'sterilization', 'walkins', 'cleaning', 'flash',
      'aftercare', 'gifts', 'loyalty', 'commissions', 'pricing',
    ];
    const newCounts = {};
    Promise.allSettled(
      endpoints.map((ep) =>
        api.get(`/${ep}`).then((r) => {
          newCounts[ep] = Array.isArray(r.data) ? r.data.length : 0;
        })
      )
    ).then(() => setCounts(newCounts));
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user.name || 'Studio Manager'}</h1>
        <p>Manage your tattoo studio with AI-powered tools</p>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card-label">Artists</div>
          <div className="stats-card-value">{counts.artists || 0}</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-label">Appointments</div>
          <div className="stats-card-value">{counts.appointments || 0}</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-label">Clients</div>
          <div className="stats-card-value">{counts.clients || 0}</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-label">Inventory Items</div>
          <div className="stats-card-value">{counts.inventory || 0}</div>
        </div>
      </div>

      {featureSections.map((section) => (
        <div className="dashboard-section" key={section.title}>
          <div className="dashboard-section-title">
            {section.title}
            {section.badge && <span className="section-badge">{section.badge}</span>}
          </div>
          <div className="feature-grid">
            {section.cards.map((card) => (
              <div
                key={card.route}
                className={`feature-card${card.countKey === 'ai' ? ' ai-card' : ''}`}
                onClick={() => navigate(card.route)}
              >
                <span className="feature-card-icon">{card.icon}</span>
                <div className="feature-card-title">{card.title}</div>
                <div className="feature-card-desc">{card.desc}</div>
                {card.countKey !== 'ai' && counts[card.countKey] !== undefined && (
                  <span className="feature-card-count">{counts[card.countKey]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
