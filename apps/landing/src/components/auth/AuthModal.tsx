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

    if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        window.location.href = 'http://localhost:4322/';
      }
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        window.location.href = 'http://localhost:4322/';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`auth-modal-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setIsOpen(false)} aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="auth-card" style={{ margin: 0, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="glow-blob" aria-hidden="true"></div>
          
          <div className="auth-header">
            {mode === 'login' ? (
              <>
                <h1 className="auth-title">Welcome <span className="text-neon">Back</span></h1>
                <p className="auth-subtitle">Sign in to continue to your dashboard.</p>
              </>
            ) : (
              <>
                <h1 className="auth-title">Join <span className="text-neon">StudyBearer</span></h1>
                <p className="auth-subtitle">Eradicate the cognitive load of studying.</p>
              </>
            )}
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
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
                  <a href="/forgot-password" style={{ fontSize: '0.8rem', color: '#00f0ff', textDecoration: 'none', opacity: 0.8 }}>Forgot password?</a>
                )}
              </div>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
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
                  className="eye-toggle" 
                  onClick={() => setShowPassword(!showPassword)} 
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit">
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
            
            {mode === 'signup' && (
              <p className="terms-note">By creating an account, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy</a>.</p>
            )}
          </form>

          {mode === 'login' ? (
            <p className="auth-footer-link">
              Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }}>Create one free</a>
            </p>
          ) : (
            <p className="auth-footer-link">
              Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Sign in</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
