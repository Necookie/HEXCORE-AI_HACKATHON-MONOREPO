import { useState } from 'react';
import { Ic } from './ui';
import { PROFILE_TABS, type ProfileTabId } from '../types/user.types';
import { ProfileTab } from './Profile/ProfileTab';
import { SecurityTab } from './Profile/SecurityTab';

export default function ProfileView({
  userName, userEmail, userBio, avatarUrl,
}: {
  userName: string; userEmail: string; userBio: string; avatarUrl: string;
}) {
  const [tab, setTab] = useState<ProfileTabId>('profile');

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
        {PROFILE_TABS.map(t => {
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
        {tab === 'profile'  && (
          <ProfileTab  
            userName={userName} 
            userEmail={userEmail} 
            userBio={userBio} 
            avatarUrl={avatarUrl} 
          />
        )}
        {tab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}
