import { useState } from 'react';
import { Card, Btn, Ic } from './ui';

// ── tiny field wrapper ────────────────────────────────────────────────────────
function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 600,
        color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>{label}</label>
      {children}
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{hint}</span>
      )}
    </div>
  );
}

// ── shared input style ────────────────────────────────────────────────────────
const inputSx: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  color: 'var(--text-primary)',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.18s ease',
  boxSizing: 'border-box',
};

// ── alert banner ─────────────────────────────────────────────────────────────
function Alert({ type, msg }: { type: 'error' | 'success'; msg: string }) {
  const ok = type === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: ok ? 'rgba(74,222,128,0.08)' : 'rgba(245,107,107,0.08)',
      border: `1px solid ${ok ? 'rgba(74,222,128,0.25)' : 'rgba(245,107,107,0.25)'}`,
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      fontSize: 13, color: ok ? 'var(--green)' : 'var(--red)',
      fontFamily: 'var(--font-body)',
    }}>
      <Ic n={ok ? 'check' : 'x'} size={15} color={ok ? 'var(--green)' : 'var(--red)'} />
      {msg}
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({
  userName, userEmail, userBio, avatarUrl,
}: { userName: string; userEmail: string; userBio: string; avatarUrl: string }) {
  const [name, setName]     = useState(userName);
  const [bio,  setBio]      = useState(userBio);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) { setStatus({ type: 'error', msg: 'Display name is required.' }); return; }
    if (bio.length > 280) { setStatus({ type: 'error', msg: 'Bio must be 280 characters or fewer.' }); return; }
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong.');
      setStatus({ type: 'success', msg: 'Profile updated successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Avatar preview */}
      <Card sx={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--bg-elevated)', overflow: 'hidden',
          border: '3px solid rgba(123,92,245,0.3)', flexShrink: 0,
        }}>
          <img src={avatarUrl} alt={name} width={72} height={72}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700,
            color: 'var(--text-primary)', letterSpacing: '-0.02em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{name || 'Scholar'}</div>
          <div style={{
            fontSize: 12, color: 'var(--text-secondary)', marginTop: 3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{userEmail}</div>
          <div style={{
            marginTop: 8, fontSize: 11, color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Ic n="bot" size={12} color="var(--text-muted)" />
            Auto-generated avatar · unique to your account
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.01em',
          paddingBottom: 12, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Ic n="sparkles" size={15} color="var(--purple-light)" />
          Account Info
        </div>

        <Field label="Display Name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={64}
            placeholder="Your display name"
            style={inputSx}
            onFocus={e => (e.target.style.borderColor = 'rgba(123,92,245,0.5)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
        </Field>

        <Field label="Email Address" hint="Your email address cannot be changed here.">
          <div style={{ position: 'relative' }}>
            <input
              value={userEmail}
              readOnly
              style={{ ...inputSx, paddingRight: 40, color: 'var(--text-secondary)', cursor: 'not-allowed' }}
            />
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }}>
              <Ic n="lock" size={14} color="var(--text-muted)" />
            </span>
          </div>
        </Field>

        <Field label="Bio" hint={`${bio.length} / 280 characters`}>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="A short bio — what are you studying? what's your goal?"
            style={{
              ...inputSx,
              resize: 'vertical',
              minHeight: 80,
              lineHeight: 1.5,
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(123,92,245,0.5)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
        </Field>

        {status && <Alert type={status.type} msg={status.msg} />}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn v="primary" onClick={save} disabled={saving}>
            <Ic n="check" size={14} color="#fff" />
            {saving ? 'Saving…' : 'Save Changes'}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Security tab ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const [pw,      setPw]      = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [status,  setStatus]  = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [saving,  setSaving]  = useState(false);

  async function update() {
    if (pw.length < 8) { setStatus({ type: 'error', msg: 'Password must be at least 8 characters.' }); return; }
    if (pw !== confirm)  { setStatus({ type: 'error', msg: 'Passwords do not match.' }); return; }
    setSaving(true);
    setStatus(null);
    try {
      const res  = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong.');
      setStatus({ type: 'success', msg: 'Password updated. Use it on your next sign-in.' });
      setPw(''); setConfirm('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  const EyeIcon = ({ show }: { show: boolean }) => show
    ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
    : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Info banner */}
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

        {/* Strength indicator */}
        {pw && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[8, 12, 16, 20].map(thresh => (
                <div key={thresh} style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: pw.length >= thresh
                    ? thresh <= 8  ? 'var(--red)'
                    : thresh <= 12 ? 'var(--amber)'
                    : thresh <= 16 ? '#60A5FA'
                    : 'var(--green)'
                    : 'var(--border)',
                  transition: 'background 0.2s ease',
                }} />
              ))}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {pw.length < 8  ? 'Too short'
               : pw.length < 12 ? 'Weak'
               : pw.length < 16 ? 'Fair'
               : pw.length < 20 ? 'Strong'
               : 'Very strong'}
            </span>
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

// ── Main ──────────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'security';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile',  label: 'Profile',  icon: 'sparkles' },
  { id: 'security', label: 'Security', icon: 'lock'     },
];

export default function ProfileView({
  userName, userEmail, userBio, avatarUrl,
}: {
  userName: string; userEmail: string; userBio: string; avatarUrl: string;
}) {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="content-scroll fade-in" style={{
      flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24,
      alignItems: 'center',
    }}>

      {/* Page header */}
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.025em',
        }}>Profile</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Manage your identity and account security.
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content',
        maxWidth: 560,
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="no-3d"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 18px', borderRadius: 'calc(var(--radius-md) - 2px)',
                background: active ? 'var(--bg-elevated)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: active ? 600 : 500,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              <Ic n={t.icon} size={14} color={active ? 'var(--purple-light)' : 'currentColor'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        {tab === 'profile'  && <ProfileTab  userName={userName} userEmail={userEmail} userBio={userBio} avatarUrl={avatarUrl} />}
        {tab === 'security' && <SecurityTab />}
      </div>

    </div>
  );
}
