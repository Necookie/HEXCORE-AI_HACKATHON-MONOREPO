import React, { useState, useEffect } from 'react';
import { supabaseBrowserClient } from '../../lib/supabase-browser';
import '../../styles/auth.css';

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const customEvent = e as CustomEvent;
      setMode(customEvent.detail?.mode || 'login');
      setIsOpen(true);
      setError('');
      setEmail('');
      setPassword('');
    };

    window.addEventListener('open-auth', handleOpenAuth);
    return () => window.removeEventListener('open-auth', handleOpenAuth);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const supabase = supabaseBrowserClient();

    let platformUrl = import.meta.env.PUBLIC_PLATFORM_URL;

    if (!platformUrl && typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      platformUrl = isLocal ? 'http://localhost:4322' : 'https://app.sb.necookie.dev';
    }

    platformUrl = (platformUrl || 'http://localhost:4322').replace(/\/$/, '');

    const callbackUrl = platformUrl.includes('/auth/callback')
      ? platformUrl
      : `${platformUrl}/auth/callback`;

    if (mode === 'login') {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
      } else if (data?.session) {
        const { access_token, refresh_token } = data.session;
        const params = new URLSearchParams({ access_token, refresh_token });
        window.location.href = `${callbackUrl}?${params.toString()}`;
      }
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        alert('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`auth-modal-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close no-3d" onClick={() => setIsOpen(false)} aria-label="Close modal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-card">
          <div className="auth-logo">
            <img src="/sb_symbol_blk.png" width="28" height="28" alt="" aria-hidden="true" style={{ filter: 'invert(1)', objectFit: 'contain' }} />
            <span>StudyBearer</span>
          </div>

          <div className="auth-header">
            {mode === 'login' ? (
              <>
                <h1 className="auth-title">Welcome <span className="text-accent">Back</span></h1>
                <p className="auth-subtitle">Sign in to resume your pipeline.</p>
              </>
            ) : (
              <>
                <h1 className="auth-title">Join <span className="text-accent">StudyBearer</span></h1>
                <p className="auth-subtitle">Eradicate the cognitive load of studying.</p>
              </>
            )}
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field-group">
              <label htmlFor="email" className="field-label">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="field-input"
                />
              </div>
            </div>

            <div className="field-group">
              <div className="label-row">
                <label htmlFor="password" className="field-label">Password</label>
                {mode === 'login' && (
                  <a href="/forgot-password" className="forgot-link">Forgot password?</a>
                )}
              </div>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="field-input"
                />
                <button
                  type="button"
                  className="eye-toggle no-3d"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit">
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </button>

            {mode === 'signup' && (
              <p className="terms-note">By creating an account, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy</a>.</p>
            )}
          </form>

          <div className="auth-divider" />

          {mode === 'login' ? (
            <p className="auth-footer-link">
              No account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }}>Deploy for free</a>
            </p>
          ) : (
            <p className="auth-footer-link">
              Already deployed? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Sign in</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
