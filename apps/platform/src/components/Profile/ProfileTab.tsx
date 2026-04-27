import { useState } from 'react';
import { Card, Btn, Ic } from '../ui';
import { userService } from '../../services/user.service';
import { Field, Alert, inputSx } from './Shared/Common';

interface ProfileTabProps {
  userName: string;
  userEmail: string;
  userBio: string;
  avatarUrl: string;
}

export function ProfileTab({ userName, userEmail, userBio, avatarUrl }: ProfileTabProps) {
  const [name, setName]     = useState(userName);
  const [bio,  setBio]      = useState(userBio);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { setStatus({ type: 'error', msg: 'Display name is required.' }); return; }
    if (bio.length > 280) { setStatus({ type: 'error', msg: 'Bio must be 280 characters or fewer.' }); return; }
    
    setSaving(true);
    setStatus(null);
    try {
      await userService.updateProfile(name.trim(), bio.trim());
      setStatus({ type: 'success', msg: 'Profile updated successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
