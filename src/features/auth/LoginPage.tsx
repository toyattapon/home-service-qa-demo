import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../../api/client';
import { useAuth } from '../../auth/useAuth';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin/dashboard' : '/tech/jobs'}
        replace
      />
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setBusy(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(
        loggedInUser.role === 'admin' ? '/admin/dashboard' : '/tech/jobs',
        { replace: true },
      );
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? caught.message
          : 'Unable to connect to the service',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand light">
          <span className="brand-mark">HS</span>
          <span>
            <strong>Home Service</strong>
            <small>QA Demo</small>
          </span>
        </div>
        <div>
          <p className="eyebrow">Field service, made testable</p>
          <h1>A realistic workflow for serious QA practice.</h1>
          <p>
            Explore role access, scheduling rules, state transitions, inventory
            side effects, and invoice calculations in one deterministic system.
          </p>
        </div>
        <p className="login-note">Fictional data · Local environment · THB</p>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Sign in to continue</h2>
            <p>Use one of the documented demo accounts.</p>
          </div>
          <label>
            Email
            <input
              data-testid="login-email-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              data-testid="login-password-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && (
            <div
              data-testid="login-error-message"
              className="feedback feedback-error"
              role="alert"
            >
              {error}
            </div>
          )}
          <button
            data-testid="login-submit-button"
            className="button primary wide"
            type="submit"
            disabled={busy}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="demo-accounts">
            <strong>Demo access</strong>
            <span>Admin: admin@demo.com</span>
            <span>Technician: tech@demo.com</span>
            <span>Password: password123</span>
          </div>
        </form>
      </section>
    </main>
  );
}
