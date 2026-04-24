import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ title, sidebarCollapsed }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className={`header${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="header-left">
        <h1 className="header-title">{title || 'Dashboard'}</h1>
      </div>
      <div className="header-right">
        <div className="header-user">
          <div className="header-user-avatar">{initials}</div>
          <span>{user.name || user.email || 'User'}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
