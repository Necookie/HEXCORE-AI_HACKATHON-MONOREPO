import { Ic, Badge, Bar, Card, Btn } from './ui';

const weeks = [
  {
    label: 'Week 1 — Foundations',
    sessions: [
      { day: 'Mon Apr 28', topic: 'Arrays & Linked Lists', dur: '2h', done: true,  quiz: true,  elo: 120 },
      { day: 'Tue Apr 29', topic: 'Stacks & Queues',       dur: '2h', done: true,  quiz: true,  elo: 140 },
      { day: 'Wed Apr 30', topic: 'Hash Tables',           dur: '2h', today: true                        },
      { day: 'Thu May 1',  topic: 'Trees — Introduction',  dur: '2h'                                     },
      { day: 'Fri May 2',  topic: 'Binary Search Trees',   dur: '2h'                                     },
    ],
  },
  {
    label: 'Week 2 — Trees & Graphs',
    sessions: [
      { day: 'Mon May 5', topic: 'AVL Trees',     dur: '2h', locked: true },
      { day: 'Tue May 6', topic: 'Red-Black Trees', dur: '2h', locked: true },
      { day: 'Wed May 7', topic: 'Graph Basics',  dur: '2h', locked: true },
      { day: 'Thu May 8', topic: 'BFS & DFS',     dur: '2h', locked: true },
      { day: 'Fri May 9', topic: 'Shortest Path', dur: '2h', locked: true },
    ],
  },
];

export default function RoadmapView() {
  return (
    <div className="content-scroll fade-in" style={{ padding: '32px 40px', flex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <Badge color="blue">Data Structures</Badge>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginTop: 9, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Study Roadmap
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            10 sessions · 2h / day · Target: May 30
          </p>
        </div>
        <div style={{ textAlign: 'right', minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>
            <span>Overall Progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#7B5CF5' }}>2 / 10</span>
          </div>
          <Bar val={20} color="#7B5CF5" h={8} />
        </div>
      </div>

      {/* Weeks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {weeks.map((wk, wi) => (
          <div key={wi}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: 'var(--font-heading)' }}>
              {wk.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {wk.sessions.map((s: any, si) => {
                const borderColor = s.today ? 'rgba(123,92,245,0.38)' : s.done ? 'rgba(74,222,128,0.22)' : 'var(--border)';
                const bg = s.today ? 'rgba(123,92,245,0.09)' : s.done ? 'rgba(74,222,128,0.04)' : s.locked ? 'rgba(0,0,0,0.12)' : 'var(--bg-card)';
                return (
                  <div key={si} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: bg, border: `1px solid ${borderColor}`,
                    borderRadius: 'var(--radius-md)', opacity: s.locked ? 0.45 : 1,
                    transition: 'all 0.2s ease',
                  }}>
                    {/* Status icon */}
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: s.done ? 'rgba(74,222,128,0.18)' : s.today ? 'rgba(123,92,245,0.18)' : 'var(--bg-elevated)',
                      border: `2px solid ${s.done ? 'rgba(74,222,128,0.4)' : s.today ? 'rgba(123,92,245,0.5)' : 'var(--border)'}`,
                    }}>
                      {s.locked ? <Ic n="lock"  size={14} color="var(--text-muted)" /> :
                       s.done   ? <Ic n="check" size={14} color="#4ADE80" /> :
                                  <Ic n="book"  size={14} color={s.today ? '#9D82FF' : 'var(--text-secondary)'} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, color: s.locked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {s.topic}
                        </span>
                        {s.today && <Badge color="purple" sm>Today</Badge>}
                        {s.done && s.quiz && <Badge color="green" sm><Ic n="check" size={10} color="#4ADE80" /> Quiz</Badge>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {s.day} · {s.dur}
                      </div>
                    </div>

                    {s.today && (
                      <Btn v="primary" size="sm" onClick={() => window.location.href = '/platform/quiz'}>
                        <Ic n="quiz" size={13} color="#fff" /> Start Quiz
                      </Btn>
                    )}
                    {s.done && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4ADE80', whiteSpace: 'nowrap' }}>
                        +{s.elo} ELO
                      </div>
                    )}
                    {!s.today && !s.done && !s.locked && (
                      <Ic n="right" size={14} color="var(--text-muted)" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
