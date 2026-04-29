import { useState, useEffect } from 'react';
import { Ic, Badge, Bar, Card, Btn } from './ui';
import StudyNotes from './StudyNotes';
import type { StudySession, RoadmapDocument } from '../types/project.types';
import type { SessionContext } from '../pages/api/sessions/[id]';

// ── Date helpers ──────────────────────────────────────────────────────────────

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function isToday(iso: string) { return localDateStr(new Date(iso)) === localDateStr(new Date()); }

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

// ── Loading skeleton ──────────────────────────────────────────────────────────

function SessionSkeleton() {
  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div className="content-scroll" style={{ flex: 1, padding: '32px 40px' }}>
        <div style={{ width: 80, height: 13, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 28 }} />
        <div style={{ width: 160, height: 14, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 12 }} />
        <div style={{ width: 340, height: 26, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 10 }} />
        <div style={{ width: '70%', height: 14, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 32 }} />
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 52, borderRadius: 10, background: 'var(--bg-elevated)', marginBottom: 8, opacity: 1 - i * 0.2 }} />
        ))}
      </div>
      <aside style={{ width: 300, borderLeft: '1px solid var(--border)', background: 'var(--bg-card)' }} />
    </div>
  );
}

function SessionError({ message }: { message: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, textAlign: 'center' }}>
      <Ic n="x" size={28} color="var(--red)" />
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320 }}>{message}</p>
      <Btn v="ghost" size="sm" onClick={() => window.location.href = '/platform/dashboard'}>
        <Ic n="left" size={13} color="var(--text-secondary)" /> Back to Dashboard
      </Btn>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  sessionId?: string | null;
}

export default function SessionView({ sessionId }: Props) {
  const [allSessions,    setAllSessions]    = useState<StudySession[]>([]);
  const [document,       setDocument]       = useState<RoadmapDocument | null>(null);
  const [currentIdx,     setCurrentIdx]     = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState<string | null>(null);
  const [objectivesOpen, setObjectivesOpen] = useState(true);
  const [quizGateOpen,   setQuizGateOpen]   = useState(false);

  useEffect(() => {
    if (!sessionId) { setFetchError('No session ID provided.'); setLoading(false); return; }

    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then((ctx: SessionContext & { error?: string }) => {
        if (ctx.error) { setFetchError(ctx.error); return; }
        setAllSessions(ctx.allSessions);
        setDocument(ctx.document);
        // Set index to the requested session
        const idx = ctx.allSessions.findIndex(s => s.id === sessionId);
        setCurrentIdx(idx >= 0 ? idx : 0);
      })
      .catch(() => setFetchError('Failed to load session. Check your connection.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Reset objectives accordion when switching sessions
  useEffect(() => { setObjectivesOpen(true); }, [currentIdx]);

  if (loading)     return <SessionSkeleton />;
  if (fetchError)  return <SessionError message={fetchError} />;
  if (!document || allSessions.length === 0) return <SessionError message="Session data not found." />;

  const session    = allSessions[currentIdx];
  const subject    = {
    name:              document.subjectName ?? 'Study Session',
    totalSessions:     allSessions.length,
    completedSessions: allSessions.filter(s => s.status === 'completed').length,
    hoursPerDay:       document.hoursPerDay,
    targetDate:        new Date(document.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
  };

  const progressPct = Math.round((subject.completedSessions / subject.totalSessions) * 100);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allSessions.length - 1;

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
            {isToday(session.startTime) && <Badge color="amber" sm>Today</Badge>}
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => setObjectivesOpen(o => !o)}
            onKeyDown={e => e.key === 'Enter' && setObjectivesOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', cursor: 'pointer',
              marginBottom: objectivesOpen ? 14 : 0,
              transition: 'margin 0.25s',
              userSelect: 'none',
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
          </div>

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

        {/* Study notes — AI generated */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(74,222,128,0.12)',
              border: '1.5px solid rgba(74,222,128,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Ic n="sparkles" size={14} color="#4ADE80" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
              color: 'var(--text-primary)', flex: 1,
            }}>
              Study Notes
            </h2>
            <Badge color="green" sm>AI</Badge>
          </div>

          <StudyNotes
            key={session.id}
            sessionId={session.id}
            title={session.title}
            summary={session.summary}
            learningObjectives={session.learningObjectives}
            subtopics={session.subtopics}
          />
        </section>

        {/* ── Complete session CTA ───────────────────────────────────────── */}
        {session.status !== 'completed' ? (
          <div style={{
            margin: '8px 0 24px',
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(123,92,245,0.06)',
            border: '1px solid rgba(123,92,245,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 3,
              }}>
                Done studying this session?
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Pass the quiz to mark it complete and update your progress.
              </p>
            </div>
            <button
              onClick={() => setQuizGateOpen(true)}
              style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 18px',
                background: '#7B5CF5',
                border: '1px solid #9D82FF',
                borderBottom: '2px solid #4A2DB0',
                borderRadius: 'var(--radius-md)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-heading)', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Ic n="trophy" size={14} color="#fff" />
              Complete Session
            </button>
          </div>
        ) : (
          <div style={{
            margin: '8px 0 24px',
            padding: '14px 20px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(74,222,128,0.07)',
            border: '1px solid rgba(74,222,128,0.22)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(74,222,128,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ic n="check" size={14} color="#4ADE80" sw={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: '#4ADE80' }}>
                Session Completed
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                You passed the quiz for this session.
              </div>
            </div>
          </div>
        )}

        {/* ── Prev / Next nav ────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 16, borderTop: '1px solid var(--border-subtle)',
        }}>
          <Btn v="ghost" size="sm" onClick={() => hasPrev && setCurrentIdx(i => i - 1)}
            sx={{ opacity: hasPrev ? 1 : 0.3, pointerEvents: hasPrev ? 'auto' : 'none' }}>
            <Ic n="left" size={14} color="var(--text-secondary)" /> Previous
          </Btn>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {currentIdx + 1} / {allSessions.length}
          </span>
          <Btn v="ghost" size="sm" onClick={() => hasNext && setCurrentIdx(i => i + 1)}
            sx={{ opacity: hasNext ? 1 : 0.3, pointerEvents: hasNext ? 'auto' : 'none' }}>
            Next <Ic n="right" size={14} color="var(--text-secondary)" />
          </Btn>
        </div>
      </div>

      {/* ── Quiz gate modal ───────────────────────────────────────────────────── */}
      {quizGateOpen && (
        <div
          onClick={() => setQuizGateOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(4,6,20,0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          {/* Card — stop propagation so clicking inside doesn't close */}
          <div
            onClick={e => e.stopPropagation()}
            className="fade-in"
            style={{
              width: '100%', maxWidth: 420,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 28px 24px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Mascot */}
            <img
              src="/sb-take-quiz.png"
              alt="StudyBearer mascot"
              style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 16 }}
            />

            {/* Heading */}
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.02em',
            }}>
              Quiz Required
            </h2>

            <p style={{
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
              marginBottom: 8, maxWidth: 320,
            }}>
              To mark <strong style={{ color: 'var(--text-primary)' }}>"{session.title}"</strong> as complete
              and update your progress, you need to <strong style={{ color: 'var(--text-primary)' }}>pass the quiz</strong> for this session first.
            </p>

            {/* Info row */}
            <div style={{
              display: 'flex', gap: 16, margin: '16px 0 24px',
              padding: '12px 20px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              width: '100%',
            }}>
              {[
                { icon: 'quiz',   color: '#60A5FA', label: 'Answer questions' },
                { icon: 'check',  color: '#4ADE80', label: 'Pass the quiz'    },
                { icon: 'trophy', color: '#9D82FF', label: 'Session complete' },
              ].map((step, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                  {i < 2 && (
                    <div style={{
                      position: 'absolute', top: 10, left: 'calc(50% + 14px)',
                      width: 'calc(100% - 28px)', height: 1,
                      borderTop: '1px dashed var(--border)',
                    }} />
                  )}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', zIndex: 1,
                    background: `color-mix(in srgb, ${step.color} 14%, transparent)`,
                    border: `1.5px solid color-mix(in srgb, ${step.color} 30%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ic n={step.icon} size={13} color={step.color} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', textAlign: 'center', lineHeight: 1.3 }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <Btn v="ghost" size="md" onClick={() => setQuizGateOpen(false)}
                sx={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </Btn>
              <Btn v="primary" size="md"
                onClick={() => window.location.href = `/platform/quiz?sessionId=${session.id}`}
                sx={{ flex: 2, justifyContent: 'center' }}>
                <Ic n="quiz" size={14} color="#fff" /> Take the Quiz
              </Btn>
            </div>
          </div>
        </div>
      )}

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
                {isToday(session.startTime) && (
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
                  Module {session.moduleNumber} of {allSessions.length}
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
            {allSessions.map((s, i) => {
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
