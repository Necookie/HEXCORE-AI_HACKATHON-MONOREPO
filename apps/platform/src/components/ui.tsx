import type { CSSProperties, ReactNode } from 'react';

// ── Icon system (Lucide-compatible paths) ─────────────────────────────────────
const iconPaths: Record<string, string[]> = {
  home:        ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  upload:      ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
  map:         ["M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z","M9 3v15","M15 6v15"],
  zap:         ["M13 2L3 14h9l-1 8 10-12h-9z"],
  trophy:      ["M6 9H4.5a2.5 2.5 0 000 5H6","M18 9h1.5a2.5 2.5 0 010 5H18","M4 2h16v7a8 8 0 01-16 0z","M12 17v5","M8 22h8"],
  flame:       ["M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"],
  check:       ["M20 6L9 17l-5-5"],
  x:           ["M18 6L6 18","M6 6l12 12"],
  right:       ["M9 18l6-6-6-6"],
  book:        ["M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z","M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"],
  calendar:    ["M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z","M16 2v4","M8 2v4","M3 10h18"],
  lock:        ["M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z","M7 11V7a5 5 0 0110 0v4"],
  quiz:        ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M9 9a3 3 0 015.83 1c0 2-3 3-3 3","M12 17h.01"],
  medal:       ["M12 15a7 7 0 100-14 7 7 0 000 14z","M8.21 13.89L7 23l5-3 5 3-1.21-9.12"],
  sword:       ["M14.5 17.5L3 6V3h3l11.5 11.5","M13 19l6-6","M2 2l6 6","M20 16.5l.5.5-2 2.5-2.5-.5"],
  shield:      ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  droplets:    ["M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z","M12.56 6.6A10.97 10.97 0 0014 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 01-11.91 4.97"],
  sparkles:    ["M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z","M20 3v4","M22 5h-4","M4 17v2","M5 18H3"],
  gem:         ["M6 3h12l4 6-10 13L2 9z","M11 3L8 9l4 13 4-13-3-6","M2 9h20"],
  bot:         ["M12 8V4H8","M3 8h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2z","M10 12h4","M10 16h4","M6 8V4a2 2 0 012-2h8a2 2 0 012 2v4"],
  file:        ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  checkCircle: ["M22 11.08V12a10 10 0 11-5.93-9.14","M22 4L12 14.01l-3-3"],
  heart:       ["M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"],
  star:        ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"],
  clock:       ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 6v6l4 2"],
  chevronUp:   ["M18 15l-6-6-6 6"],
  chevronDown: ["M6 9l6 6 6-6"],
  trash:       ["M3 6h18","M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6","M10 11v6","M14 11v6","M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"],
  cards:       ["M2 8a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z","M6 4a2 2 0 012-2h12a2 2 0 012 2v8"],
  brain:       ["M12 5a3 3 0 10-5.997.125 4 4 0 00-2.526 5.77 4 4 0 00.556 6.588 4 4 0 006.357 3.346 4 4 0 006.357-3.346 4 4 0 00.556-6.588 4 4 0 00-2.526-5.77A3 3 0 0012 5","M9 13h.01","M15 13h.01","M10 17c.667.333 1.333.333 2 0"],
  target:      ["M12 22a10 10 0 100-20 10 10 0 000 20z","M12 18a6 6 0 100-12 6 6 0 000 12z","M12 14a2 2 0 100-4 2 2 0 000 4z"],
  left:        ["M15 18l-6-6 6-6"],
  refresh:     ["M23 4v6h-6","M1 20v-6h6","M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"],
};

export const Ic = ({
  n, size = 20, color = 'currentColor', sw = 1.75,
}: { n: string; size?: number; color?: string; sw?: number }) => {
  const ps = iconPaths[n];
  if (!ps) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      {ps.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
};

// ── Color palette for badges ───────────────────────────────────────────────────
export const clr: Record<string, { bg: string; text: string; border: string }> = {
  purple: { bg: 'rgba(123,92,245,0.14)', text: '#9D82FF', border: 'rgba(123,92,245,0.32)' },
  amber:  { bg: 'rgba(240,160,48,0.14)', text: '#F0A030', border: 'rgba(240,160,48,0.32)' },
  green:  { bg: 'rgba(74,222,128,0.14)', text: '#4ADE80', border: 'rgba(74,222,128,0.32)' },
  red:    { bg: 'rgba(245,107,107,0.14)', text: '#F56B6B', border: 'rgba(245,107,107,0.32)' },
  blue:   { bg: 'rgba(96,165,250,0.14)', text: '#60A5FA', border: 'rgba(96,165,250,0.32)' },
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({
  children, color = 'purple', sm,
}: { children: ReactNode; color?: string; sm?: boolean }) => {
  const c = clr[color] ?? clr.purple;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 99, padding: sm ? '2px 9px' : '4px 12px',
      fontSize: sm ? 11 : 12, fontWeight: 600, fontFamily: 'var(--font-heading)',
      letterSpacing: '0.01em', display: 'inline-flex', alignItems: 'center',
      gap: 4, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────────
export const Bar = ({ val, color = '#7B5CF5', h = 6 }: { val: number; color?: string; h?: number }) => (
  <div style={{ height: h, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', width: '100%' }}>
    <div style={{
      height: '100%', width: `${Math.min(val, 100)}%`, borderRadius: 99,
      background: color, transition: 'width 0.7s cubic-bezier(.4,0,.2,1)',
    }} />
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({
  children, sx = {}, hover, onClick,
}: { children: ReactNode; sx?: CSSProperties; hover?: boolean; onClick?: () => void }) => (
  <div onClick={onClick} className={hover || onClick ? 'card-hover' : ''}
    style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 20, ...sx,
    }}>
    {children}
  </div>
);

// ── Button ────────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
type BtnSize    = 'sm' | 'md' | 'lg';

export const Btn = ({
  children, v = 'primary', size = 'md', onClick, disabled, sx = {},
}: {
  children: ReactNode; v?: BtnVariant; size?: BtnSize;
  onClick?: () => void; disabled?: boolean; sx?: CSSProperties;
}) => {
  const variants: Record<BtnVariant, CSSProperties> = {
    primary:   { background: '#7B5CF5', color: '#fff',                   border: '1px solid #9D82FF',               borderBottom: '1px solid #4A2DB0' },
    secondary: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid #2A3050',      borderBottom: '1px solid #0C0F1C' },
    ghost:     { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid #252A3E',        borderBottom: '1px solid #0E1120' },
    success:   { background: '#4ADE80', color: '#061a0a',                border: '1px solid #6EE7A0',               borderBottom: '1px solid #105528' },
    danger:    { background: 'rgba(245,107,107,0.14)', color: '#F56B6B', border: '1px solid rgba(245,107,107,0.4)', borderBottom: '1px solid #4d0e0e' },
  };
  const cls3d: Record<BtnVariant, string> = {
    primary: 'btn-3d-primary', secondary: 'btn-3d-secondary',
    ghost: 'btn-3d-ghost', success: 'btn-3d-success', danger: 'btn-3d-danger',
  };
  const sizes: Record<BtnSize, CSSProperties> = {
    sm: { padding: '5px 13px', fontSize: 12 },
    md: { padding: '8px 18px', fontSize: 13 },
    lg: { padding: '11px 24px', fontSize: 14 },
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`btn-hover ${cls3d[v]}`}
      style={{
        ...variants[v], ...sizes[size],
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-heading)', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 7,
        whiteSpace: 'nowrap', ...sx,
      }}
    >{children}</button>
  );
};
