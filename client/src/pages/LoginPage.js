import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async (credentialsEmail, credentialsPassword) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: credentialsEmail, password: credentialsPassword });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    return signIn(email, password);
  };

  const handleQuickLogin = () => {
    const demoEmail = process.env.REACT_APP_DEMO_EMAIL || '';
    const demoPassword = process.env.REACT_APP_DEMO_PASSWORD || '';
    if (!demoEmail || !demoPassword) {
      setError('Demo login is not configured. Enter your credentials to sign in.');
      return;
    }
    setEmail(demoEmail);
    setPassword(demoPassword);
    return signIn(demoEmail, demoPassword);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">{'\uD83D\uDD89'}</div>
          <h1>
            <span>Ink</span>Studio
          </h1>
          <p>AI Tattoo & Body Art Studio Manager</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-actions">
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="login-divider">or</div>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={handleQuickLogin}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Log In as Demo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
