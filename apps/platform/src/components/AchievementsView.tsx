import { useState, useEffect } from 'react';
import { Ic, Badge, Bar } from './ui';
import type { DashboardStats } from '../types/project.types';

// ── Bear rank system ──────────────────────────────────────────────────────────

const BEAR_RANKS = [
  { name: 'Cub',         img: '/sb-rank-cub.png',     min: 0,    max: 199,     color: '#C89B7B', bg: 'rgba(200,155,123,0.10)', border: 'rgba(200,155,123,0.25)', desc: 'Just getting started'    },
  { name: 'Panda',       img: '/sb-rank-panda.png',   min: 200,  max: 499,     color: '#4ADE80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.25)',  desc: 'Building good habits'    },
  { name: 'Grizzly',     img: '/sb-rank-grizzly.png', min: 500,  max: 999,     color: '#CD7F32', bg: 'rgba(205,127,50,0.10)', border: 'rgba(205,127,50,0.25)',  desc: 'Serious scholar'         },
  { name: 'Polar',       img: '/sb-rank-polar.png',   min: 1000, max: 2999,    color: '#60A5FA', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.25)',  desc: 'Cool under pressure'     },
  { name: 'Spirit Bear', img: '/sb-rank-spirit.png',  min: 3000, max: Infinity, color: '#F0A030', bg: 'rgba(240,160,48,0.10)', border: 'rgba(240,160,48,0.25)', desc: 'Legendary status'        },
] as const;

function getRank(elo: number) {
  return BEAR_RANKS.find(r => elo >= r.min && elo <= r.max) ?? BEAR_RANKS[0];
}
function getNextRank(elo: number) {
  const idx = BEAR_RANKS.findIndex(r => elo >= r.min && elo <= r.max);
  return idx < BEAR_RANKS.length - 1 ? BEAR_RANKS[idx + 1] : null;
}

// ── Badge definitions ─────────────────────────────────────────────────────────

interface BadgeDef {
  name: string;
  desc: string;
  icon: string;
  color: string;
  colorHex: string;
  category: 'milestone' | 'streak' | 'rank' | 'mastery';
  check:    (s: DashboardStats) => boolean;
  progress: (s: DashboardStats) => { current: number; target: number } | null;
}

const BADGES: BadgeDef[] = [
  {
    name: 'First Step',
    desc: 'Pass your first quiz',
    icon: 'checkCircle', color: 'green', colorHex: '#4ADE80',
    category: 'milestone',
    check:    s => s.quizzesPassed >= 1,
    progress: s => ({ current: Math.min(s.quizzesPassed, 1), target: 1 }),
  },
  {
    name: 'Hot Streak',
    desc: 'Study 3 days in a row',
    icon: 'flame', color: 'amber', colorHex: '#F0A030',
    category: 'streak',
    check:    s => s.streak >= 3,
    progress: s => ({ current: Math.min(s.streak, 3), target: 3 }),
  },
  {
    name: 'Panda Rank',
    desc: 'Reach Panda rank (200 ELO)',
    icon: 'star', color: 'green', colorHex: '#4ADE80',
    category: 'rank',
    check:    s => s.elo >= 200,
    progress: s => ({ current: Math.min(s.elo, 200), target: 200 }),
  },
  {
    name: 'Quiz Hunter',
    desc: 'Pass 5 quizzes',
    icon: 'zap', color: 'blue', colorHex: '#60A5FA',
    category: 'milestone',
    check:    s => s.quizzesPassed >= 5,
    progress: s => ({ current: Math.min(s.quizzesPassed, 5), target: 5 }),
  },
  {
    name: 'Study Bug',
    desc: 'Log 5 total study hours',
    icon: 'book', color: 'purple', colorHex: '#9D82FF',
    category: 'mastery',
    check:    s => s.studyHours >= 5,
    progress: s => ({ current: Math.min(s.studyHours, 5), target: 5 }),
  },
  {
    name: 'Week Warrior',
    desc: 'Maintain a 7-day streak',
    icon: 'shield', color: 'amber', colorHex: '#F0A030',
    category: 'streak',
    check:    s => s.streak >= 7,
    progress: s => ({ current: Math.min(s.streak, 7), target: 7 }),
  },
  {
    name: 'Grizzly Rank',
    desc: 'Reach Grizzly rank (500 ELO)',
    icon: 'sword', color: 'amber', colorHex: '#CD7F32',
    category: 'rank',
    check:    s => s.elo >= 500,
    progress: s => ({ current: Math.min(s.elo, 500), target: 500 }),
  },
  {
    name: 'Quiz Master',
    desc: 'Pass 15 quizzes',
    icon: 'trophy', color: 'amber', colorHex: '#F0A030',
    category: 'milestone',
    check:    s => s.quizzesPassed >= 15,
    progress: s => ({ current: Math.min(s.quizzesPassed, 15), target: 15 }),
  },
  {
    name: 'Deep Learner',
    desc: 'Log 20 total study hours',
    icon: 'brain', color: 'purple', colorHex: '#9D82FF',
    category: 'mastery',
    check:    s => s.studyHours >= 20,
    progress: s => ({ current: Math.min(s.studyHours, 20), target: 20 }),
  },
  {
    name: 'Polar Rank',
    desc: 'Reach Polar rank (1,000 ELO)',
    icon: 'droplets', color: 'blue', colorHex: '#60A5FA',
    category: 'rank',
    check:    s => s.elo >= 1000,
    progress: s => ({ current: Math.min(s.elo, 1000), target: 1000 }),
  },
  {
    name: 'Grinder',
    desc: 'Log 50 total study hours',
    icon: 'gem', color: 'purple', colorHex: '#9D82FF',
    category: 'mastery',
    check:    s => s.studyHours >= 50,
    progress: s => ({ current: Math.min(s.studyHours, 50), target: 50 }),
  },
  {
    name: 'Spirit Bear',
    desc: 'Reach Spirit Bear rank (3,000 ELO)',
    icon: 'sparkles', color: 'amber', colorHex: '#F0A030',
    category: 'rank',
    check:    s => s.elo >= 3000,
    progress: s => ({ current: Math.min(s.elo, 3000), target: 3000 }),
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  milestone: 'Milestone',
  streak:    'Streak',
  rank:      'Rank',
  mastery:   'Mastery',
};
const CATEGORY_COLORS: Record<string, string> = {
  milestone: '#4ADE80',
  streak:    '#F0A030',
  rank:      '#60A5FA',
  mastery:   '#9D82FF',
};

// ── Shimmer ───────────────────────────────────────────────────────────────────

function Shimmer({ w, h, r = 8 }: { w: string | number; h: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-card) 50%,var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AchievementsView() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then((s: DashboardStats) => setStats(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const elo           = stats?.elo ?? 0;
  const rank          = getRank(elo);
  const nextRank      = getNextRank(elo);
  const barPct        = nextRank
    ? Math.round(((elo - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;
  const eloToNext     = nextRank ? nextRank.min - elo : 0;

  const unlockedBadges = stats ? BADGES.filter(b => b.check(stats)) : [];
  const unlockedCount  = unlockedBadges.length;

  return (
    <div className="content-scroll fade-in" style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
          Achievements
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          {loading ? 'Loading…' : `${unlockedCount} of ${BADGES.length} badges unlocked · ${rank.name} · ${elo} ELO`}
        </p>
      </div>

      {/* ── Hero rank card ────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--border)`,
        borderTop: `3px solid ${rank.color}`,
        borderRadius: 14,
        padding: '24px 28px',
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        {/* Rank badge image */}
        <img
          src={rank.img}
          alt={rank.name}
          style={{ width: 96, height: 96, objectFit: 'contain', flexShrink: 0, imageRendering: 'auto' }}
        />

        {/* Divider */}
        <div style={{ width: 1, height: 76, background: 'var(--border)', flexShrink: 0 }} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: rank.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
            Current Rank
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 3 }}>
            {rank.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {rank.desc}
          </div>

          {nextRank ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {loading ? '—' : `${elo.toLocaleString()} ELO`}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {nextRank.name} at {nextRank.min.toLocaleString()} ELO
                </span>
              </div>
              <Bar val={loading ? 0 : barPct} color={rank.color} h={6} />
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
                {loading ? '…' : `${eloToNext.toLocaleString()} ELO until ${nextRank.name}`}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: rank.color, fontWeight: 700 }}>Maximum rank achieved</div>
          )}
        </div>

        {/* ELO badge */}
        <div style={{
          flexShrink: 0, textAlign: 'center',
          background: 'var(--bg-elevated)', border: `1px solid var(--border)`,
          borderRadius: 12, padding: '14px 20px',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 800, color: rank.color, lineHeight: 1 }}>
            {loading ? '—' : elo.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ELO Rating</div>
        </div>
      </div>

      {/* ── Rank progression track ────────────────────────────────────────────── */}
      {(() => {
        const n          = BEAR_RANKS.length;
        const rankIdx    = BEAR_RANKS.findIndex(r => getRank(elo).name === r.name);
        const rankBarPct = nextRank ? (elo - rank.min) / (nextRank.min - rank.min) : 1;
        const fillFrac   = Math.min((rankIdx + rankBarPct) / (n - 1), 1);
        // Line spans between centers of first and last grid cells: 1/(2n) → (2n-1)/(2n)
        const lineLeftPct  = 100 / (2 * n);
        const lineTotalPct = 100 - 2 * lineLeftPct;
        const fillWidthPct = fillFrac * lineTotalPct;
        // YOU-pill reserved area (20px) + gap (10px) + half node (26px) = 56
        const lineTopPx = 56;

        return (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '20px 24px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Rank Progression
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {loading ? '—' : `${elo.toLocaleString()} ELO`}
              </span>
            </div>

            {/* Track */}
            <div style={{ position: 'relative' }}>
              {/* Base line */}
              <div style={{
                position: 'absolute', top: lineTopPx, height: 2, borderRadius: 2,
                left: `${lineLeftPct}%`, right: `${lineLeftPct}%`,
                background: 'var(--border)',
              }} />
              {/* Fill line */}
              <div style={{
                position: 'absolute', top: lineTopPx, height: 2, borderRadius: 2,
                left: `${lineLeftPct}%`, width: `${fillWidthPct}%`,
                background: rank.color, transition: 'width 0.5s ease',
              }} />

              {/* Rank nodes — equal-width grid so no overflow */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, position: 'relative', zIndex: 1 }}>
                {BEAR_RANKS.map((r, i) => {
                  const reached   = elo >= r.min;
                  const isCurrent = rankIdx === i;
                  return (
                    <div key={r.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      {/* YOU pill — reserved height so grid rows stay aligned */}
                      <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isCurrent && (
                          <span style={{
                            background: r.color, color: '#0a0b18',
                            fontSize: 8, fontFamily: 'var(--font-heading)', fontWeight: 800,
                            padding: '2px 8px', borderRadius: 5, letterSpacing: '0.1em',
                          }}>YOU</span>
                        )}
                      </div>

                      {/* Badge image */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 13,
                        border: `${isCurrent ? 2 : 1}px solid ${reached ? (isCurrent ? r.color : r.border) : 'var(--border)'}`,
                        background: reached ? r.bg : 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 7, flexShrink: 0,
                      }}>
                        <img
                          src={r.img}
                          alt={r.name}
                          style={{
                            width: '100%', height: '100%', objectFit: 'contain',
                            opacity: reached ? 1 : 0.2,
                            filter: reached ? 'none' : 'grayscale(1)',
                          }}
                        />
                      </div>

                      {/* Labels */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: 10, fontFamily: 'var(--font-heading)',
                          fontWeight: isCurrent ? 700 : 500,
                          color: reached ? (isCurrent ? r.color : 'var(--text-secondary)') : 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {r.min === 0 ? '0' : r.min.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Quick stats ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Day Streak',     icon: 'flame',       color: '#F0A030', val: loading ? '—' : `${stats?.streak ?? 0}d`         },
          { label: 'Quizzes Passed', icon: 'checkCircle', color: '#4ADE80', val: loading ? '—' : `${stats?.quizzesPassed ?? 0}`   },
          { label: 'Study Hours',    icon: 'book',        color: '#9D82FF', val: loading ? '—' : `${stats?.studyHours ?? 0}h`     },
          { label: 'Badges Earned',  icon: 'trophy',      color: '#60A5FA', val: loading ? '—' : `${unlockedCount}/${BADGES.length}` },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `color-mix(in srgb, ${item.color} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${item.color} 28%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ic n={item.icon} size={17} color={item.color} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: item.color, lineHeight: 1 }}>
                {loading ? <Shimmer w={40} h={16} /> : item.val}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Badges ────────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Badges — {unlockedCount} / {BADGES.length} Earned
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
          {BADGES.map((b, i) => {
            const unlocked = stats ? b.check(stats) : false;
            const prog     = stats ? b.progress(stats) : null;
            const progPct  = prog ? Math.round((prog.current / prog.target) * 100) : 0;
            const catColor = CATEGORY_COLORS[b.category];

            return (
              <div key={i} style={{
                background:   'var(--bg-card)',
                border:       `1px solid ${unlocked ? `color-mix(in srgb, ${b.colorHex} 22%, transparent)` : 'var(--border)'}`,
                borderLeft:   `3px solid ${unlocked ? b.colorHex : 'var(--border)'}`,
                borderRadius: 10,
                padding:      '11px 13px',
                display:      'flex',
                alignItems:   'center',
                gap:          11,
                opacity:      unlocked ? 1 : 0.55,
                transition:   'opacity 0.2s',
              }}>

                {/* Icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: unlocked ? `color-mix(in srgb, ${b.colorHex} 12%, transparent)` : 'var(--bg-elevated)',
                  border: `1px solid ${unlocked ? `color-mix(in srgb, ${b.colorHex} 22%, transparent)` : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unlocked
                    ? <Ic n={b.icon} size={16} color={b.colorHex} />
                    : <Ic n="lock"   size={14} color="var(--text-muted)" />}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12,
                      color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {b.name}
                    </span>
                    <span style={{
                      fontSize: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, flexShrink: 0,
                      padding: '1px 5px', borderRadius: 4,
                      background: `color-mix(in srgb, ${catColor} 12%, transparent)`,
                      color: catColor, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      {CATEGORY_LABELS[b.category]}
                    </span>
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: prog ? 7 : 0 }}>
                    {b.desc}
                  </div>

                  {/* Progress */}
                  {!loading && prog && (
                    <div>
                      <Bar val={progPct} color={unlocked ? '#4ADE80' : b.colorHex} h={3} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {unlocked
                            ? 'Completed'
                            : `${typeof prog.current === 'number' && prog.current % 1 !== 0 ? prog.current.toFixed(1) : prog.current} / ${prog.target}`}
                        </span>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600, color: unlocked ? '#4ADE80' : b.colorHex }}>
                          {progPct}%
                        </span>
                      </div>
                    </div>
                  )}
                  {loading && <Shimmer w="100%" h={3} r={4} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
