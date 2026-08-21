'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      // Store token for subsequent API calls
      sessionStorage.setItem('admin_token', data.token);
      router.push('/admin/dashboard');
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="form-header">
          <span className="form-header-icon" aria-hidden="true">🔐</span>
          <h1 className="form-title">Admin Access</h1>
          <p className="form-subtitle">Sign in to the admin panel</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" aria-live="polite">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label="Admin login form">
          <div className="form-group">
            <label htmlFor="admin-username" className="form-label">
              Username <span aria-label="required">*</span>
            </label>
            <input
              id="admin-username"
              type="text"
              className="form-input"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={isLoading}
              aria-label="Admin username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">
              Password <span aria-label="required">*</span>
            </label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              aria-label="Admin password"
            />
          </div>

          <button
            type="submit"
            id="btn-admin-login"
            className={`form-submit-btn ${isLoading ? 'loading' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #a50e2d, #DC143C)',
              boxShadow: '0 8px 30px rgba(220, 20, 60, 0.4)',
            }}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          Are you a student? <a href="/" style={{ color: 'var(--accent-gold)' }}>Go to home page</a>
        </p>
      </div>
    </div>
  );
}
