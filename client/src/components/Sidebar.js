import React from 'react';
import { NavLink } from 'react-router-dom';

const navSections = [
  {
    title: 'AI Features',
    links: [
      { to: '/ai/generate-design', icon: '\uD83C\uDFA8', text: 'Flash Design Generator' },
      { to: '/ai/customize-consent', icon: '\uD83D\uDCCB', text: 'Consent Customizer' },
      { to: '/ai/personalize-aftercare', icon: '\uD83D\uDC8A', text: 'Aftercare Personalizer' },
      { to: '/ai/generate-caption', icon: '\uD83D\uDCF8', text: 'Caption Generator' },
      { to: '/ai/match-style', icon: '\uD83C\uDFAF', text: 'Style Matcher' },
      { to: '/ai/draft-message', icon: '\uD83D\uDCAC', text: 'Message Drafter' },
    ],
  },
  {
    title: 'Client Management',
    links: [
      { to: '/artists', icon: '\uD83D\uDC64', text: 'Artists & Portfolios' },
      { to: '/appointments', icon: '\uD83D\uDCC5', text: 'Appointments' },
      { to: '/clients', icon: '\uD83E\uDDD1', text: 'Client Profiles' },
      { to: '/consent', icon: '\uD83D\uDCDD', text: 'Consent & Waivers' },
      { to: '/consultations', icon: '\uD83D\uDCA1', text: 'Consultations' },
    ],
  },
  {
    title: 'Operations',
    links: [
      { to: '/inventory', icon: '\uD83D\uDCE6', text: 'Supply Inventory' },
      { to: '/sterilization', icon: '\uD83D\uDD2C', text: 'Sterilization Logs' },
      { to: '/walkins', icon: '\uD83D\uDEB6', text: 'Walk-in Queue' },
      { to: '/cleaning', icon: '\uD83E\uDDF9', text: 'Cleaning Checklists' },
      { to: '/flash', icon: '\u26A1', text: 'Flash Designs' },
      { to: '/aftercare', icon: '\uD83E\uDE79', text: 'Aftercare Tracking' },
    ],
  },
  {
    title: 'Financial',
    links: [
      { to: '/gifts', icon: '\uD83C\uDF81', text: 'Gift Certificates' },
      { to: '/loyalty', icon: '\u2B50', text: 'Loyalty Program' },
      { to: '/commissions', icon: '\uD83D\uDCB0', text: 'Commission Tracking' },
      { to: '/pricing', icon: '\uD83D\uDCB2', text: 'Pricing Calculator' },
    ],
  },
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-brand" onClick={() => (window.location.href = '/')}>
        <div className="sidebar-brand-icon">{'\uD83D\uDD89'}</div>
        <div className="sidebar-brand-text">
          <span>Ink</span>Studio
        </div>
      </div>
      <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
        {collapsed ? '\u25B6' : '\u25C0'}
      </button>
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link-icon">{'\uD83C\uDFE0'}</span>
            <span className="sidebar-link-text">Dashboard</span>
          </NavLink>
        </div>
        {navSections.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span className="sidebar-link-text">{link.text}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
