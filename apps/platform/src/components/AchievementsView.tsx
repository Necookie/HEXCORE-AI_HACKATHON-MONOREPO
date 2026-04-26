import { Ic, Badge, Bar, Card, clr } from './ui';

const ranks = [
  { name: 'Bronze',  elo: 0,    color: '#CD7F32' },
  { name: 'Silver',  elo: 500,  color: '#C0C0C0' },
  { name: 'Gold',    elo: 1000, color: '#F0A030' },
  { name: 'Plat',    elo: 1500, color: '#60A5FA' },
  { name: 'Diamond', elo: 2000, color: '#9D82FF' },
  { name: 'Mythic',  elo: 2500, color: '#F56B6B' },
];

const badges = [
  { name: 'First Blood',      desc: 'Complete your first study block',       icon: 'droplets', unlocked: false, date: '',       color: 'red'    },
  { name: 'Flawless Victory', desc: 'Score 100% on a post-study quiz',       icon: 'sword',    unlocked: false, date: '',       color: 'purple' },
  { name: 'Week Warrior',     desc: 'Maintain a 7-day streak',               icon: 'shield',   unlocked: false, date: '',       color: 'amber'  },
  { name: 'Bookworm',         desc: 'Complete 10 study sessions',            icon: 'book',     unlocked: false, date: '',       color: 'blue'   },
  { name: 'Speed Demon',      desc: 'Finish a quiz in under 2 minutes',      icon: 'zap',      unlocked: false, date: '',       color: 'amber'  },
  { name: 'Mythic Scholar',   desc: 'Reach Mythic rank (2,500+ ELO)',        icon: 'sparkles', unlocked: false, date: '',       color: 'purple' },
  { name: 'Perfectionist',    desc: '100% on 5 consecutive quizzes',         icon: 'gem',      unlocked: false, date: '',       color: 'blue'   },
  { name: 'Grinder',          desc: 'Log 100+ total study hours',            icon: 'trophy',   unlocked: false, date: '',       color: 'amber'  },
];

const currentElo = 0;
const currentRankIdx = Math.max(0, ranks.findLastIndex(r => currentElo >= r.elo));
const unlockedCount = badges.filter(b => b.unlocked).length;

export default function AchievementsView() {
  return (
    <div className="content-scroll fade-in" style={{ padding: '22px 28px', flex: 1 }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3, color: 'var(--text-primary)' }}>
        Achievements
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16 }}>
        {unlockedCount} of {badges.length} unlocked · Iron Rank · {currentElo} ELO
      </p>

      {/* Competitive Ladder */}
      <Card sx={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Competitive Ladder
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: '#60A5FA', lineHeight: 1 }}>{currentElo}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>ELO</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Badge color="blue"><Ic n="medal" size={12} color="#60A5FA" /> Iron Rank</Badge>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>500 ELO to Bronze</div>
          </div>
        </div>

        {/* Rank bars */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', marginBottom: 8 }}>
          {ranks.map((r, i) => {
            const active = i === currentRankIdx && currentElo >= r.elo;
            const done   = i < currentRankIdx;
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: active ? 12 : done ? 8 : 6, borderRadius: 4, marginBottom: 7,
                  transition: 'all 0.3s ease',
                  background: done ? '#7B5CF5' : active ? r.color : 'var(--border)',
                  position: 'relative',
                }}>
                  {active && (
                    <div style={{ position: 'absolute', right: -5, top: -5, width: 16, height: 16, background: r.color, borderRadius: '50%', border: '2px solid var(--bg-card)' }} />
                  )}
                </div>
                <div style={{ fontSize: 10, color: i <= currentRankIdx ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: active ? 700 : 400 }}>
                  {r.name}
                </div>
              </div>
            );
          })}
        </div>
        <Bar val={0} color="#60A5FA" h={5} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 5, fontFamily: 'var(--font-mono)' }}>
          <span>0</span><span>Iron</span><span>500</span>
        </div>
      </Card>

      {/* Badges grid */}
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
        Badges
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
        {badges.map((b, i) => {
          const c = clr[b.color] ?? clr.purple;
          return (
            <Card key={i} sx={{
              display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 13px',
              opacity: b.unlocked ? 1 : 0.42,
              background: b.unlocked ? 'var(--bg-card)' : 'var(--bg-elevated)',
              border: b.unlocked ? `1px solid ${c.border}` : '1px solid var(--border)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: b.unlocked ? c.bg : 'var(--bg-input)', flexShrink: 0,
              }}>
                {b.unlocked
                  ? <Ic n={b.icon} size={18} color={c.text} />
                  : <Ic n="lock"   size={18} color="var(--text-muted)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, marginBottom: 2, color: 'var(--text-primary)' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{b.desc}</div>
                {b.unlocked && b.date && (
                  <div style={{ fontSize: 10, color: c.text, marginTop: 4 }}>Unlocked {b.date}</div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
