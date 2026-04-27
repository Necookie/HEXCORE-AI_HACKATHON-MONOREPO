import { useState, useMemo } from 'react';
import { Card, Btn, Ic } from '../ui';
import { userService } from '../../services/user.service';
import { Field, Alert, inputSx } from './Shared/Common';

export function SecurityTab() {
  const [current, setCurrent] = useState('');
  const [pw,      setPw]      = useState('');
  const [confirm, setConfirm] = useState('');
  const [show,    setShow]    = useState<{ cur: boolean; next: boolean }>({ cur: false, next: false });
  const [status,  setStatus]  = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteVerify, setDeleteVerify] = useState('');
  const [deleting, setDeleting] = useState(false);

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
    if (!current) { setStatus({ type: 'error', msg: 'Current password is required.' }); return; }
    if (pw.length < 8) { setStatus({ type: 'error', msg: 'New password must be at least 8 characters.' }); return; }
    if (pw !== confirm)  { setStatus({ type: 'error', msg: 'Passwords do not match.' }); return; }
    
    setSaving(true);
    setStatus(null);
    try {
      await userService.updatePassword(current, pw);
      setStatus({ type: 'success', msg: 'Password updated successfully. Security level maintained.' });
      setCurrent(''); setPw(''); setConfirm('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteVerify !== 'DELETE') return;
    setDeleting(true);
    setStatus(null);
    try {
      await userService.deleteAccount();
      // On success, redirect to landing
      window.location.href = '/';
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const EyeIcon = ({ visible }: { visible: boolean }) => visible
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
          Security best practice: You must provide your current password to authorize a change. Ensure your new password is high-entropy.
        </span>
      </div>

      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.01em',
          paddingBottom: 12, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Ic n="lock" size={15} color="var(--purple-light)" />
          Authorization & Credentials
        </div>

        <Field label="Current Password" hint="Verify ownership to proceed">
          <div style={{ position: 'relative' }}>
            <input
              type={show.cur ? 'text' : 'password'}
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ ...inputSx, paddingRight: 42 }}
              onFocus={e => (e.target.style.borderColor = 'rgba(123,92,245,0.5)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              type="button"
              onClick={() => setShow(s => ({ ...s, cur: !s.cur }))}
              className="no-3d"
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 2, display: 'flex',
              }}
              aria-label={show.cur ? 'Hide password' : 'Show password'}
            >
              <EyeIcon visible={show.cur} />
            </button>
          </div>
        </Field>

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

        <Field label="New Password">
          <div style={{ position: 'relative' }}>
            <input
              type={show.next ? 'text' : 'password'}
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
              onClick={() => setShow(s => ({ ...s, next: !s.next }))}
              className="no-3d"
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 2, display: 'flex',
              }}
              aria-label={show.next ? 'Hide password' : 'Show password'}
            >
              <EyeIcon visible={show.next} />
            </button>
          </div>
        </Field>

        <Field label="Confirm New Password">
          <div style={{ position: 'relative' }}>
            <input
              type={show.next ? 'text' : 'password'}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: -4 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4].map(level => (
                <div key={level} style={{
                  flex: 1, height: 4, borderRadius: 99,
                  background: strength.level >= level ? strength.color : 'var(--border)',
                  transition: 'background 0.2s ease',
                }} />
              ))}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Strength: <span style={{ color: strength.color }}>{strength.label}</span>
            </span>
          </div>
        )}

        {status && <Alert type={status.type} msg={status.msg} />}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <Btn v="primary" onClick={update} disabled={saving || !current || !pw || !confirm || pw !== confirm} sx={{ width: '100%', justifyContent: 'center' }}>
            <Ic n="lock" size={14} color="#fff" />
            {saving ? 'Updating Credentials…' : 'Finalize Password Change'}
          </Btn>
        </div>
      </Card>

      <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />

      {/* Danger Zone */}
      <Card sx={{ 
        background: 'rgba(245,107,107,0.03)', 
        border: '1px solid rgba(245,107,107,0.15)',
        display: 'flex', flexDirection: 'column', gap: 16 
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700,
          color: 'var(--red)', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Ic n="zap" size={15} color="var(--red)" />
          Danger Zone
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Delete Account</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Permanently remove all data and access. This action cannot be undone.
            </div>
          </div>
          <Btn v="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Initiate Deletion
          </Btn>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <Card sx={{ 
            maxWidth: 400, width: '100%', gap: 24, display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)', border: '1px solid var(--red)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: '50%', background: 'rgba(245,107,107,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,107,107,0.2)'
              }}>
                <Ic n="zap" size={24} color="var(--red)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Are you absolutely sure?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Deleting your account will erase your <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Roadmap</span>, 
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}> streaks</span>, and all associated modules. 
                This is a tactical wipe — no recovery possible.
              </p>
            </div>

            <div style={{ 
              background: 'rgba(240,160,48,0.07)', border: '1px solid rgba(240,160,48,0.2)',
              borderRadius: 'var(--radius-md)', padding: 12, display: 'flex', gap: 10
            }}>
              <Ic n="flame" size={16} color="var(--amber)" sw={2} />
              <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 500, lineHeight: 1.4 }}>
                Verification required: Type <span style={{ fontWeight: 700 }}>DELETE</span> below to authorize the terminal command.
              </span>
            </div>

            <input
              type="text"
              value={deleteVerify}
              onChange={e => setDeleteVerify(e.target.value.toUpperCase())}
              placeholder="TYPE DELETE"
              style={{ ...inputSx, textAlign: 'center', letterSpacing: '0.1em', fontWeight: 700 }}
              disabled={deleting}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <Btn v="ghost" sx={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Abort
              </Btn>
              <Btn 
                v="danger" 
                sx={{ flex: 1, justifyContent: 'center' }} 
                disabled={deleteVerify !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? 'Executing Wipe…' : 'Confirm Deletion'}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
