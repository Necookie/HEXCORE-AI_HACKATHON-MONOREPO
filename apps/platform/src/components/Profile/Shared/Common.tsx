import { Ic } from '../../ui';

export function Field({
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

export function Alert({ type, msg }: { type: 'error' | 'success'; msg: string }) {
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

export const inputSx: React.CSSProperties = {
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
