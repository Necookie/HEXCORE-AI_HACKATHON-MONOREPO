import { useState, useMemo } from 'react';
import { Card, Btn, Ic } from '../ui';
import { userService } from '../../services/user.service';
import { Field, Alert, inputSx } from './Shared/Common';

export function SecurityTab() {
  const [pw,      setPw]      = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [status,  setStatus]  = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [saving,  setSaving]  = useState(false);

  const strength = useMemo(() => {
    if (!pw) return null;
    const len = pw.length;
    if (len < 8)  return { label: 'Too short', level: 0, color: 'var(--red)' };
    if (len < 12) return { label: 'Weak',      level: 1, color: 'var(--amber)' };
    if (len < 16) return { label: 'Fair',      level: 2, color: '#60A5FA' };
    if (len < 20) return { label: 'Strong',    level: 3, color: 'var(--green)' };
    return { label: 'Very strong', level: 4, color: 'var(--green)' };
  }, [pw]);

  const update = async () => {
    if (pw.length < 8) { setStatus({ type: 'error', msg: 'Password must be at least 8 characters.' }); return; }
    if (pw !== confirm)  { setStatus({ type: 'error', msg: 'Passwords do not match.' }); return; }
    
    setSaving(true);
    setStatus(null);
    try {
      await userService.updatePassword(pw);
      setStatus({ type: 'success', msg: 'Password updated. Use it on your next sign-in.' });
      setPw(''); setConfirm('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => show
    ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
    : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)',
        borderRadius: 'var(--radius-md)', padding: '12px 16px',
      }}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          Your new password must be at least 8 characters. You'll use it on your next sign-in.
        </span>
      </div>

      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.01em',
          paddingBottom: 12, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Ic n="lock" size={15} color="var(--purple-light)" />
          Change Password
        </div>

        <Field label="New Password">
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              style={{ ...inputSx, paddingRight: 42 }}
              onFocus={e => (e.target.style.borderColor = 'rgba(123,92,245,0.5)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="no-3d"
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 2, display: 'flex',
              }}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <EyeIcon show={showPw} />
            </button>
          </div>
        </Field>

        <Field label="Confirm New Password">
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              style={{
                ...inputSx, paddingRight: 42,
                borderColor: confirm && confirm !== pw ? 'rgba(245,107,107,0.5)' : undefined,
              }}
              onFocus={e => (e.target.style.borderColor = confirm !== pw ? 'rgba(245,107,107,0.5)' : 'rgba(123,92,245,0.5)')}
              onBlur={e  => (e.target.style.borderColor = confirm && confirm !== pw ? 'rgba(245,107,107,0.5)' : 'var(--border)')}
            />
            {confirm && (
              <span style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}>
                <Ic n={confirm === pw ? 'check' : 'x'} size={14}
                  color={confirm === pw ? 'var(--green)' : 'var(--red)'} />
              </span>
            )}
          </div>
        </Field>

        {strength && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4].map(level => (
                <div key={level} style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: strength.level >= level ? strength.color : 'var(--border)',
                  transition: 'background 0.2s ease',
                }} />
              ))}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{strength.label}</span>
          </div>
        )}

        {status && <Alert type={status.type} msg={status.msg} />}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn v="primary" onClick={update} disabled={saving || !pw || !confirm}>
            <Ic n="lock" size={14} color="#fff" />
            {saving ? 'Updating…' : 'Update Password'}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
