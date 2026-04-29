import { useState, useEffect } from 'react';
import { Ic, Badge, Bar } from './ui';
import type { DashboardStats } from '../types/project.types';

// ── Bear rank system ──────────────────────────────────────────────────────────

const BEAR_RANKS = [
  { name: 'Cub',         emoji: '🐾', min: 0,    max: 199,     color: '#C89B7B', bg: 'rgba(200,155,123,0.14)', border: 'rgba(200,155,123,0.3)',  desc: 'Just getting started'    },
  { name: 'Panda',       emoji: '🐼', min: 200,  max: 499,     color: '#4ADE80', bg: 'rgba(74,222,128,0.14)',  border: 'rgba(74,222,128,0.3)',   desc: 'Building good habits'    },
  { name: 'Grizzly',     emoji: '🐻', min: 500,  max: 999,     color: '#CD7F32', bg: 'rgba(205,127,50,0.14)', border: 'rgba(205,127,50,0.3)',   desc: 'Serious scholar'         },
  { name: 'Polar',       emoji: '❄️', min: 1000, max: 1749,    color: '#60A5FA', bg: 'rgba(96,165,250,0.14)', border: 'rgba(96,165,250,0.3)',   desc: 'Cool under pressure'     },
  { name: 'Kodiak',      emoji: '🏔️', min: 1750, max: 2999,    color: '#9D82FF', bg: 'rgba(157,130,255,0.14)',border: 'rgba(157,130,255,0.3)', desc: 'Formidable student'      },
  { name: 'Spirit Bear', emoji: '✨', min: 3000, max: Infinity, color: '#F0A030', bg: 'rgba(240,160,48,0.14)', border: 'rgba(240,160,48,0.3)',  desc: 'Legendary status'        },
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
          {loading ? 'Loading…' : `${unlockedCount} of ${BADGES.length} badges unlocked · ${rank.emoji} ${rank.name} · ${elo} ELO`}
        </p>
      </div>

      {/* ── Hero rank card ────────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 20,
        background: `linear-gradient(135deg, ${rank.bg} 0%, var(--bg-card) 60%)`,
        border: `1.5px solid ${rank.border}`,
        padding: '28px 32px',
        display: 'flex', alignItems: 'center', gap: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: rank.color, opacity: 0.06, pointerEvents: 'none',
        }} />

        {/* Rank emoji */}
        <div style={{
          width: 88, height: 88, borderRadius: 22, flexShrink: 0,
          background: rank.bg, border: `2px solid ${rank.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 42,
        }}>
          {rank.emoji}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: rank.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            Current Rank
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>
            {rank.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {rank.desc}
          </div>

          {/* Progress to next */}
          {nextRank ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {loading ? '—' : `${elo} ELO`}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {nextRank.emoji} {nextRank.name} at {nextRank.min.toLocaleString()} ELO
                </span>
              </div>
              <Bar val={loading ? 0 : barPct} color={rank.color} h={8} />
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 7 }}>
                {loading ? '…' : `${eloToNext.toLocaleString()} ELO to ${nextRank.emoji} ${nextRank.name}`}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: rank.color, fontWeight: 700 }}>✨ Maximum rank achieved!</div>
          )}
        </div>

        {/* ELO number */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 800, color: rank.color, lineHeight: 1 }}>
            {loading ? '—' : elo.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>ELO Rating</div>
        </div>
      </div>

      {/* ── Rank progression track ────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '20px 24px',
      }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          Bear Rank Journey
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {BEAR_RANKS.map((r, i) => {
            const reached  = elo >= r.min;
            const isCurrent = getRank(elo).name === r.name;
            const isLast   = i === BEAR_RANKS.length - 1;
            return (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
                {/* Node */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
                  <div style={{
                    width: isCurrent ? 52 : 40, height: isCurrent ? 52 : 40,
                    borderRadius: isCurrent ? 14 : 12,
                    background: reached ? r.bg : 'var(--bg-elevated)',
                    border: `${isCurrent ? 2.5 : 1.5}px solid ${reached ? r.border : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isCurrent ? 26 : 20,
                    transition: 'all 0.3s ease',
                    boxShadow: isCurrent ? `0 0 20px ${r.color}40` : 'none',
                    flexShrink: 0,
                  }}>
                    {reached ? r.emoji : <span style={{ fontSize: isCurrent ? 20 : 14, filter: 'grayscale(1)', opacity: 0.35 }}>{r.emoji}</span>}
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: isCurrent ? 700 : 500, color: reached ? r.color : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                      {r.min === 0 ? '0' : `${r.min.toLocaleString()}`}
                    </div>
                  </div>
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', top: -8,
                      background: r.color, color: '#fff',
                      fontSize: 8, fontFamily: 'var(--font-heading)', fontWeight: 700,
                      padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap',
                      letterSpacing: '0.05em',
                    }}>YOU</div>
                  )}
                </div>
                {/* Connector */}
                {!isLast && (
                  <div style={{
                    flex: 1, height: 3, borderRadius: 3, margin: '0 4px', marginBottom: 26,
                    background: elo >= BEAR_RANKS[i + 1].min
                      ? `linear-gradient(90deg, ${r.color}, ${BEAR_RANKS[i + 1].color})`
                      : elo > r.min
                        ? `linear-gradient(90deg, ${r.color}, var(--border))`
                        : 'var(--border)',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

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
        <div style={{ fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          Badges — {unlockedCount} / {BADGES.length} Earned
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {BADGES.map((b, i) => {
            const unlocked  = stats ? b.check(stats) : false;
            const prog      = stats ? b.progress(stats) : null;
            const progPct   = prog ? Math.round((prog.current / prog.target) * 100) : 0;
            const catColor  = CATEGORY_COLORS[b.category];

            return (
              <div key={i} style={{
                background:   unlocked ? `color-mix(in srgb, ${b.colorHex} 6%, var(--bg-card))` : 'var(--bg-card)',
                border:       `1.5px solid ${unlocked ? `color-mix(in srgb, ${b.colorHex} 35%, transparent)` : 'var(--border)'}`,
                borderRadius: 16,
                padding:      '16px',
                display:      'flex', flexDirection: 'column', gap: 12,
                position:     'relative', overflow: 'hidden',
                transition:   'border-color 0.2s, background 0.2s',
                boxShadow:    unlocked ? `0 0 24px ${b.colorHex}18` : 'none',
              }}>
                {/* Glow blob behind icon */}
                {unlocked && (
                  <div style={{
                    position: 'absolute', top: -20, left: -20,
                    width: 80, height: 80, borderRadius: '50%',
                    background: b.colorHex, opacity: 0.08, pointerEvents: 'none',
                  }} />
                )}

                {/* Top row: icon + category + unlock checkmark */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: unlocked
                      ? `color-mix(in srgb, ${b.colorHex} 18%, transparent)`
                      : 'var(--bg-elevated)',
                    border: `1.5px solid ${unlocked ? `color-mix(in srgb, ${b.colorHex} 35%, transparent)` : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {unlocked
                      ? <Ic n={b.icon} size={20} color={b.colorHex} />
                      : <Ic n="lock"   size={18} color="var(--text-muted)" />}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{
                      fontSize: 9, fontFamily: 'var(--font-heading)', fontWeight: 700,
                      padding: '2px 7px', borderRadius: 6,
                      background: `color-mix(in srgb, ${catColor} 14%, transparent)`,
                      color: catColor, letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>
                      {CATEGORY_LABELS[b.category]}
                    </span>
                    {unlocked && (
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(74,222,128,0.18)',
                        border: '1.5px solid rgba(74,222,128,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Ic n="check" size={11} color="#4ADE80" sw={2.5} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge name + description */}
                <div>
                  <div style={{
                    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
                    color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
                    marginBottom: 4,
                  }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {b.desc}
                  </div>
                </div>

                {/* Progress bar */}
                {!loading && prog && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {unlocked ? 'Completed' : `${typeof prog.current === 'number' && prog.current % 1 !== 0 ? prog.current.toFixed(1) : prog.current} / ${prog.target}`}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: unlocked ? '#4ADE80' : b.colorHex, fontWeight: 600 }}>
                        {progPct}%
                      </span>
                    </div>
                    <Bar val={progPct} color={unlocked ? '#4ADE80' : b.colorHex} h={4} />
                  </div>
                )}
                {loading && <Shimmer w="100%" h={4} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
