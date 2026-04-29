import { useState } from 'react';
import { Ic, Badge, Bar, Card, Btn } from './ui';

// ── Mock data (replace with real API call later) ──────────────────────────────

const MOCK_SUBJECT = {
  name: 'Topic 1 - SIPP',
  totalSessions: 4,
  completedSessions: 0,
  hoursPerDay: 2,
  targetDate: 'May 4',
};

const MOCK_SESSIONS = [
  {
    id: 'session-1',
    moduleNumber: 1,
    title: 'Common Social Issues Related to Computing',
    summary:
      'Delving into data privacy, cybersecurity threats, digital divide, online behavior, and job displacement caused by rapid technological change.',
    learningObjectives: [
      'Understand the concept of data privacy and its implications in the digital age',
      'Identify common cybersecurity threats and best practices for protection',
      'Analyze the digital divide and its socioeconomic impact on communities',
      'Evaluate the ethical dimensions of online behavior and digital citizenship',
      'Assess how computing contributes to job displacement and societal shifts',
    ],
    subtopics: [
      'Data privacy',
      'Cybersecurity threats',
      'Digital divide',
      'Online behavior and digital citizenship',
      'Job displacement',
    ],
    estimatedMinutes: 120,
    startTime: '2026-04-29T11:00:00.000Z',
    status: 'scheduled',
    isToday: true,
  },
  {
    id: 'session-2',
    moduleNumber: 2,
    title: 'The Importance of Ethics in Computer Science',
    summary:
      'Understanding the role of ethics in computer science and its profound impact on society, decision-making, and professional responsibility.',
    learningObjectives: [
      'Define ethics in the context of computer science and technology',
      'Describe the power and responsibility that comes with computing knowledge',
      'Analyze ethical decision-making frameworks applied to real-world CS scenarios',
      'Examine consequences of unethical computing practices',
    ],
    subtopics: [
      'Ethics in computing',
      'Power and responsibility of CS',
      'Ethical decision-making',
      'Consequences of unethical practices',
    ],
    estimatedMinutes: 120,
    startTime: '2026-04-29T13:00:00.000Z',
    status: 'scheduled',
    isToday: true,
  },
  {
    id: 'session-3',
    moduleNumber: 3,
    title: 'Introduction to Social Issues in the Digital Age',
    summary:
      'Understanding the impact of technology on individuals, communities, and society at large.',
    learningObjectives: [
      'Describe the digital age and its influence on daily life',
      "Analyze technology's positive and negative effects on individuals",
      'Evaluate social and cultural changes driven by digital transformation',
    ],
    subtopics: [
      'The digital age and daily life',
      "Technology's influence on communities",
      'Cultural shifts in the digital era',
    ],
    estimatedMinutes: 120,
    startTime: '2026-05-01T11:00:00.000Z',
    status: 'scheduled',
    isToday: false,
  },
  {
    id: 'session-4',
    moduleNumber: 4,
    title: 'Social Issues in the Digital Age',
    summary:
      'Exploring the problems, challenges, and ethical concerns arising from technology use across human rights, privacy, and social equality.',
    learningObjectives: [
      'Identify human rights concerns in the digital space',
      'Analyze privacy and personal security challenges online',
      'Evaluate fairness and equality issues in algorithmic systems',
      'Discuss the role of public trust in maintaining social harmony online',
    ],
    subtopics: [
      'Human rights and dignity',
      'Privacy and personal security',
      'Fairness and equality',
      'Public trust and social harmony',
    ],
    estimatedMinutes: 120,
    startTime: '2026-05-04T11:00:00.000Z',
    status: 'scheduled',
    isToday: false,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDay(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function formatDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ── Action buttons config ─────────────────────────────────────────────────────

const ACTIONS = [
  {
    icon: 'cards',
    label: 'Flashcard Practice',
    desc: 'Drill key concepts with spaced repetition',
    color: '#7B5CF5',
    bg: 'rgba(123,92,245,0.08)',
    border: 'rgba(123,92,245,0.22)',
    href: '/platform/flashcards',
  },
  {
    icon: 'quiz',
    label: 'Take a Quiz',
    desc: 'Test your understanding with AI questions',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.22)',
    href: '/platform/quiz',
  },
  {
    icon: 'sparkles',
    label: 'Generate Mind Map',
    desc: 'Visualise how all topics connect',
    color: '#4ADE80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.22)',
    href: '/platform/mindmap',
  },
];

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  sessionId?: string | null;
}

export default function SessionView({ sessionId }: Props) {
  // Find the session (fallback to first if no match)
  const initialIdx = sessionId
    ? Math.max(0, MOCK_SESSIONS.findIndex(s => s.id === sessionId))
    : 0;

  const [currentIdx,       setCurrentIdx]       = useState(initialIdx);
  const [objectivesOpen,   setObjectivesOpen]   = useState(true);
  const session = MOCK_SESSIONS[currentIdx];
  const subject = MOCK_SUBJECT;

  const progressPct = Math.round((subject.completedSessions / subject.totalSessions) * 100);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < MOCK_SESSIONS.length - 1;

  return (
    <div
      className="fade-in"
      style={{
        flex: 1,
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div
        className="content-scroll"
        style={{
          flex: 1,
          padding: '32px 40px',
          overflowY: 'auto',
          minWidth: 0,
        }}
      >
        {/* Back nav */}
        <a
          href="/platform/roadmap"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            color: 'var(--text-muted)', fontSize: 12,
            textDecoration: 'none', marginBottom: 22,
            fontFamily: 'var(--font-heading)',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Ic n="left" size={13} color="currentColor" />
          Roadmap
        </a>

        {/* Session header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <Badge color="blue">{subject.name}</Badge>
            <Badge color="purple" sm>Module {session.moduleNumber}</Badge>
            {session.isToday && <Badge color="amber" sm>Today</Badge>}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700,
            letterSpacing: '-0.025em', color: 'var(--text-primary)',
            lineHeight: 1.25, marginBottom: 10,
          }}>
            {session.title}
          </h1>

          <p style={{
            fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: 640,
          }}>
            {session.summary}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 28 }} />

        {/* Learning objectives — collapsible accordion */}
        <section style={{ marginBottom: 32 }}>
          {/* Header row — click to toggle */}
          <button
            onClick={() => setObjectivesOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', background: 'none', border: 'none',
              padding: 0, cursor: 'pointer', marginBottom: objectivesOpen ? 14 : 0,
              transition: 'margin 0.25s',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(123,92,245,0.12)',
              border: '1.5px solid rgba(123,92,245,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Ic n="target" size={14} color="#9D82FF" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
              color: 'var(--text-primary)', flex: 1, textAlign: 'left',
            }}>
              Learning Objectives
            </h2>
            <span style={{
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', marginRight: 4,
            }}>
              {session.learningObjectives.length}
            </span>
            <div style={{
              transition: 'transform 0.25s ease',
              transform: objectivesOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              display: 'flex',
            }}>
              <Ic n="chevronDown" size={16} color="var(--text-muted)" />
            </div>
          </button>

          {/* Collapsible body */}
          <div style={{
            overflow: 'hidden',
            maxHeight: objectivesOpen ? 1000 : 0,
            opacity: objectivesOpen ? 1 : 0,
            transition: 'max-height 0.3s ease, opacity 0.2s ease',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {session.learningObjectives.map((obj, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    background: 'rgba(123,92,245,0.14)',
                    border: '1.5px solid rgba(123,92,245,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: '#9D82FF',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {obj}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topics covered */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(96,165,250,0.12)',
              border: '1.5px solid rgba(96,165,250,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Ic n="book" size={14} color="#60A5FA" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              Topics Covered
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {session.subtopics.map((topic, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12, color: 'var(--text-secondary)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  padding: '5px 12px', borderRadius: 99,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </section>

        {/* Study notes placeholder */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(74,222,128,0.12)',
              border: '1.5px solid rgba(74,222,128,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Ic n="file" size={14} color="#4ADE80" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              Study Notes
            </h2>
          </div>

          <div style={{
            padding: '32px 24px',
            background: 'var(--bg-card)',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ic n="sparkles" size={20} color="var(--text-muted)" />
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              AI-generated study notes for this session are coming soon.
              <br />
              Use the actions on the right to start practising now.
            </p>
          </div>
        </section>

        {/* Mobile session navigation (hidden on wide screens via inline style, visible on narrow) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 16, borderTop: '1px solid var(--border-subtle)',
        }}>
          <Btn v="ghost" size="sm" onClick={() => hasPrev && setCurrentIdx(i => i - 1)}
            sx={{ opacity: hasPrev ? 1 : 0.3, pointerEvents: hasPrev ? 'auto' : 'none' }}>
            <Ic n="left" size={14} color="var(--text-secondary)" /> Previous
          </Btn>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {currentIdx + 1} / {MOCK_SESSIONS.length}
          </span>
          <Btn v="ghost" size="sm" onClick={() => hasNext && setCurrentIdx(i => i + 1)}
            sx={{ opacity: hasNext ? 1 : 0.3, pointerEvents: hasNext ? 'auto' : 'none' }}>
            Next <Ic n="right" size={14} color="var(--text-secondary)" />
          </Btn>
        </div>
      </div>

      {/* ── Right sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: 300,
        flexShrink: 0,
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg-card)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>

        {/* ── Progress block ────────────────────────────────────────────── */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
            Overall Progress
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {subject.completedSessions} of {subject.totalSessions} sessions
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7B5CF5', fontWeight: 600 }}>
              {progressPct}%
            </span>
          </div>
          <Bar val={progressPct} color="#7B5CF5" h={6} />

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 4, alignItems: 'center' }}>
            <Ic n="calendar" size={12} color="var(--text-muted)" />
            Target: {subject.targetDate}
          </div>
        </div>

        {/* ── Schedule block ────────────────────────────────────────────── */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
            This Session
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'rgba(123,92,245,0.1)', border: '1px solid rgba(123,92,245,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ic n="calendar" size={13} color="#9D82FF" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {formatDay(session.startTime)}
                </div>
                {session.isToday && (
                  <div style={{ fontSize: 10, color: '#F0A030' }}>Today</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ic n="clock" size={13} color="#60A5FA" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {formatTime(session.startTime)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {formatDur(session.estimatedMinutes)} session
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ic n="book" size={13} color="#4ADE80" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                  Module {session.moduleNumber} of {MOCK_SESSIONS.length}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Current module</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
            Practice Tools
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => window.location.href = action.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '11px 13px',
                  background: action.bg,
                  border: `1px solid ${action.border}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '0.85';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `color-mix(in srgb, ${action.color} 18%, transparent)`,
                  border: `1.5px solid color-mix(in srgb, ${action.color} 35%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ic n={action.icon} size={16} color={action.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 1 }}>
                    {action.desc}
                  </div>
                </div>
                <Ic n="right" size={13} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Session navigation ─────────────────────────────────────────── */}
        <div style={{ padding: '18px 0 8px' }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            fontFamily: 'var(--font-heading)', marginBottom: 6,
            padding: '0 20px',
          }}>
            Sessions
          </div>

          <div>
            {MOCK_SESSIONS.map((s, i) => {
              const active = i === currentIdx;
              return (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentIdx(i)}
                  onKeyDown={e => e.key === 'Enter' && setCurrentIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 20px 9px 17px',
                    borderLeft: `3px solid ${active ? '#7B5CF5' : 'transparent'}`,
                    background: active ? 'rgba(123,92,245,0.07)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s, border-color 0.12s',
                    outline: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Number dot */}
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? 'rgba(123,92,245,0.2)' : 'transparent',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: active ? '#9D82FF' : 'var(--text-muted)',
                    transition: 'all 0.12s',
                  }}>
                    {i + 1}
                  </span>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      lineHeight: 1.4,
                    }}>
                      {s.title}
                    </div>
                    {s.isToday && (
                      <span style={{ fontSize: 10, color: '#F0A030' }}>Today</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
