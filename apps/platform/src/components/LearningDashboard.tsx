import { Ic, Badge, Bar, Card, Btn, clr } from './ui';

// ── Mock data ─────────────────────────────────────────────────────────────────
const subjects = [
  { name: 'Data Structures',  topic: 'Binary Trees',        pct: 65, color: '#7B5CF5', next: 'Today, 3 PM',    streak: 7  },
  { name: 'Algorithms',       topic: 'Dynamic Programming', pct: 38, color: '#60A5FA', next: 'Tomorrow, 9 AM', streak: 3  },
  { name: 'OS Concepts',      topic: 'Process Scheduling',  pct: 82, color: '#4ADE80', next: 'Today, 6 PM',    streak: 14 },
];

const stats = [
  { label: 'Current Streak', val: '0',  icon: 'flame',       color: '#F0A030' },
  { label: 'ELO Rating',     val: '0',  icon: 'zap',         color: '#60A5FA' },
  { label: 'Quizzes Passed', val: '0',  icon: 'checkCircle', color: '#4ADE80' },
  { label: 'Study Hours',    val: '0',  icon: 'book',        color: '#9D82FF' },
];

const sessions = [
  { time: '3:00 PM', topic: 'Binary Trees — Ch. 4', sub: 'Data Structures', color: '#7B5CF5' },
  { time: '6:00 PM', topic: 'Process Scheduling',   sub: 'OS Concepts',     color: '#4ADE80' },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function LearningDashboard() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="content-scroll fade-in" style={{ padding: '22px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>{today}</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
            Welcome back, <span style={{ color: 'var(--purple-light)' }}>Scholar</span>
          </h1>
        </div>
        <Btn onClick={() => window.location.href = '/platform'} sx={{ flexShrink: 0 }}>
          <Ic n="upload" size={15} color="#fff" /> Upload PDF
        </Btn>
      </div>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '11px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Ic n={s.icon} size={20} color={s.color} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, flex: 1, minHeight: 0 }}>

        {/* Subjects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Active Subjects
          </div>
          {subjects.map((s, i) => (
            <Card key={i} hover onClick={() => window.location.href = '/platform/roadmap'}
              sx={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 13px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}18`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic n="book" size={15} color={s.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{s.name}</span>
                  <Badge color="amber" sm><Ic n="flame" size={10} color="#F0A030" /> {s.streak}</Badge>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Currently: {s.topic}</div>
                <Bar val={s.pct} color={s.color} h={4} />
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: s.color }}>{s.pct}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{s.next}</div>
              </div>
              <Ic n="right" size={13} color="var(--text-muted)" />
            </Card>
          ))}

          {subjects.length === 0 && (
            <Card sx={{ textAlign: 'center', padding: '40px 20px' }}>
              <Ic n="book" size={36} color="var(--text-muted)" />
              <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 14 }}>No subjects yet.</p>
              <Btn v="primary" size="sm" onClick={() => window.location.href = '/platform'} sx={{ marginTop: 12 }}>
                <Ic n="upload" size={13} color="#fff" /> Upload PDF
              </Btn>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Today's sessions */}
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Today's Sessions
            </div>
            <Card sx={{ padding: 0, overflow: 'hidden' }}>
              {sessions.map((s, i) => (
                <div key={i} style={{ padding: '10px 13px', borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2, width: 44, flexShrink: 0 }}>{s.time}</div>
                  <div style={{ width: 2, alignSelf: 'stretch', background: s.color, borderRadius: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, color: 'var(--text-primary)' }}>{s.topic}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 13px', display: 'flex', gap: 8 }}>
                <Btn v="primary" size="sm" onClick={() => window.location.href = '/platform/quiz'} sx={{ flex: 1, justifyContent: 'center' }}>
                  <Ic n="quiz" size={14} color="#fff" /> Take Quiz
                </Btn>
                <Btn v="ghost" size="sm" onClick={() => window.location.href = '/platform/roadmap'}>
                  <Ic n="calendar" size={14} />
                </Btn>
              </div>
            </Card>
          </div>

          {/* Rank card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Ic n="medal" size={22} color="#F0A030" />
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Iron Rank</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>500 ELO to Bronze</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge color="amber" sm>Top —</Badge>
              </div>
            </div>
            <Bar val={0} color="#F0A030" h={8} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, color: 'var(--text-secondary)' }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>0</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>500</span>
            </div>
          </Card>

          {/* Achievement teaser */}
          <Card hover onClick={() => window.location.href = '/platform/achievements'}
            sx={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px' }}>
            <Ic n="trophy" size={18} color="#9D82FF" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, marginBottom: 2, color: 'var(--text-primary)' }}>Achievements</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>View your badges & rank</div>
            </div>
            <Ic n="right" size={13} color="var(--text-muted)" />
          </Card>
        </div>
      </div>
    </div>
  );
}
