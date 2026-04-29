import { useState, useEffect } from 'react';
import { Ic, Badge, Bar, Card, Btn } from './ui';
import { projectService } from '../services/project.service';
import type { RoadmapData, StudySession } from '../types/project.types';

// ── Empty / error states ───────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  { icon: 'upload',   color: '#7B5CF5', label: 'Upload a PDF',        desc: 'Drop any textbook, notes, or syllabus.'        },
  { icon: 'bot',      color: '#60A5FA', label: 'AI builds your plan',  desc: 'StudyBearer chunks content into daily sessions.' },
  { icon: 'calendar', color: '#4ADE80', label: 'Follow the roadmap',   desc: 'Study at your pace, track every session.'       },
];

function EmptyRoadmap() {
  return (
    <div className="content-scroll fade-in" style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 40px', textAlign: 'center',
    }}>
      {/* Mascot */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <div style={{
          position: 'absolute', inset: -16, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,92,245,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <img
          src="/sb-404.png"
          alt="StudyBearer mascot"
          style={{ width: 180, height: 180, objectFit: 'contain', position: 'relative' }}
        />
      </div>

      {/* Heading */}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700,
        letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: 10,
      }}>
        No roadmap yet
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 340, lineHeight: 1.6, marginBottom: 28 }}>
        Upload a PDF and let the AI build a personalised, calendar-synced study plan in seconds.
      </p>

      {/* CTA */}
      <Btn v="primary" size="lg" onClick={() => window.location.href = '/platform'}
        sx={{ justifyContent: 'center', marginBottom: 40 }}>
        <Ic n="upload" size={15} color="#fff" /> Upload your first PDF
      </Btn>

      {/* How it works strip */}
      <div style={{
        display: 'flex', gap: 12, width: '100%', maxWidth: 560,
        padding: '20px 24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        {HOW_IT_WORKS.map((step, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
            {/* connector */}
            {i < HOW_IT_WORKS.length - 1 && (
              <div style={{
                position: 'absolute', top: 18, left: 'calc(50% + 18px)',
                width: 'calc(100% - 36px)', height: 1,
                borderTop: '1px dashed var(--border)',
              }} />
            )}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `color-mix(in srgb, ${step.color} 14%, transparent)`,
              border: `1.5px solid color-mix(in srgb, ${step.color} 35%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, zIndex: 1,
            }}>
              <Ic n={step.icon} size={16} color={step.color} />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 11, color: 'var(--text-primary)' }}>
              {step.label}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4, textAlign: 'center' }}>
              {step.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="content-scroll fade-in" style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 40px', textAlign: 'center',
    }}>
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <div style={{
          position: 'absolute', inset: -16, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,107,107,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <img
          src="/sb-404.png"
          alt="StudyBearer mascot"
          style={{ width: 150, height: 150, objectFit: 'contain', position: 'relative', opacity: 0.85 }}
        />
      </div>

      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700,
        letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 8,
      }}>
        Something went wrong
      </h2>

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        background: 'rgba(245,107,107,0.08)',
        border: '1px solid rgba(245,107,107,0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px', marginBottom: 24,
        maxWidth: 360, textAlign: 'left',
      }}>
        <Ic n="x" size={13} color="var(--red)" style={{ marginTop: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>{message}</span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn v="ghost" onClick={() => window.location.href = '/platform/dashboard'}>
          <Ic n="left" size={14} color="var(--text-secondary)" /> Dashboard
        </Btn>
        <Btn v="primary" size="md" onClick={onRetry} sx={{ justifyContent: 'center' }}>
          <Ic n="refresh" size={14} color="#fff" /> Try again
        </Btn>
      </div>
    </div>
  );
}

function NoSessionsYet() {
  return (
    <Card sx={{ textAlign: 'center', padding: '40px 24px', marginTop: 8 }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 4 }}>
        <div style={{
          position: 'absolute', inset: -12, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,92,245,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <img
          src="/sb-404.png"
          alt="StudyBearer mascot"
          style={{ width: 100, height: 100, objectFit: 'contain', position: 'relative', opacity: 0.75 }}
        />
      </div>
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16,
        color: 'var(--text-primary)', marginBottom: 6,
      }}>
        Sessions are being built
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 300, margin: '0 auto 16px' }}>
        The AI is chunking your PDF and scheduling study sessions. This usually takes under a minute.
      </p>
      <Btn v="ghost" size="sm" onClick={() => window.location.reload()}>
        <Ic n="refresh" size={13} color="var(--text-secondary)" /> Refresh
      </Btn>
    </Card>
  );
}

interface Props {
  documentId?: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay(); // 0=Sun
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().slice(0, 10); // YYYY-MM-DD
}

function groupByWeek(sessions: StudySession[]): { label: string; weekStart: string; sessions: StudySession[] }[] {
  const map = new Map<string, StudySession[]>();
  for (const s of sessions) {
    const ws = getWeekStart(s.startTime);
    if (!map.has(ws)) map.set(ws, []);
    map.get(ws)!.push(s);
  }

  const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  return sorted.map(([ws, sArr], i) => ({
    label: `Week ${i + 1}`,
    weekStart: ws,
    sessions: sArr,
  }));
}

function formatDay(isoStr: string): string {
  const d = new Date(isoStr);
  // No timeZone override — display in the user's local timezone
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDur(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Returns a date as YYYY-MM-DD in the user's local timezone. */
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns today as YYYY-MM-DD in the user's local timezone. */
function localToday(): string {
  return localDateStr(new Date());
}

/**
 * Converts an ISO string to its local-timezone date string (YYYY-MM-DD).
 * Critical: slicing the raw ISO string gives the UTC date, which is wrong
 * for users east of UTC (e.g. Manila UTC+8 — 19:00 UTC = 03:00 next day local).
 */
function localDateOf(isoStr: string): string {
  return localDateStr(new Date(isoStr));
}

function isToday(isoStr: string): boolean {
  return localDateOf(isoStr) === localToday();
}

function isPast(isoStr: string): boolean {
  return localDateOf(isoStr) < localToday();
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="content-scroll fade-in" style={{ padding: '32px 40px', flex: 1 }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ width: 120, height: 22, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 12 }} />
        <div style={{ width: 200, height: 28, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 8 }} />
        <div style={{ width: 240, height: 16, borderRadius: 6, background: 'var(--bg-elevated)' }} />
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ height: 56, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', marginBottom: 8, opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function RoadmapView({ documentId }: Props) {
  const [data,      setData]      = useState<RoadmapData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [retryKey,  setRetryKey]  = useState(0);

  const retry = () => { setError(null); setData(null); setRetryKey(k => k + 1); };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // Resolve documentId: use prop if provided, otherwise fallback from URL
        let docId = documentId ?? null;
        if (!docId && typeof window !== 'undefined') {
          docId = new URLSearchParams(window.location.search).get('documentId');
        }

        if (!docId) {
          // No document specified — fetch first ready document from list
          const docs = await projectService.fetchDocuments();
          const first = docs.find(d => d.status === 'ready');
          if (!first) {
            if (!cancelled) { setLoading(false); setData(null); }
            return;
          }
          docId = first.id;
        }

        const roadmap = await projectService.fetchRoadmap(docId);
        if (!cancelled) setData(roadmap);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load roadmap.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [documentId, retryKey]);

  if (loading) return <Skeleton />;

  if (error) return <ErrorState message={error} onRetry={retry} />;

  if (!data)  return <EmptyRoadmap />;

  const { document: doc, sessions } = data;
  const totalSessions     = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const progressPct       = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const weeks             = groupByWeek(sessions);

  return (
    <div className="content-scroll fade-in" style={{ padding: '32px 40px', flex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <Badge color="blue">{doc.subjectName ?? 'Study Roadmap'}</Badge>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginTop: 9, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Study Roadmap
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            {totalSessions} sessions · {doc.hoursPerDay}h / day · Target: {new Date(doc.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
          </p>
        </div>
        <div style={{ textAlign: 'right', minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 7 }}>
            <span>Overall Progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#7B5CF5' }}>{completedSessions} / {totalSessions}</span>
          </div>
          <Bar val={progressPct} color="#7B5CF5" h={8} />
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
              {wk.sessions.map((s, si) => {
                const done    = s.status === 'completed';
                const skipped = s.status === 'skipped';
                const today   = isToday(s.startTime);
                const past    = isPast(s.startTime) && !done && !skipped;

                const borderColor = today   ? 'rgba(123,92,245,0.38)'
                                  : done    ? 'rgba(74,222,128,0.22)'
                                  : skipped ? 'rgba(245,107,107,0.22)'
                                  : 'var(--border)';
                const bg          = today   ? 'rgba(123,92,245,0.09)'
                                  : done    ? 'rgba(74,222,128,0.04)'
                                  : past    ? 'rgba(0,0,0,0.06)'
                                  : 'var(--bg-card)';

                return (
                  <div key={si} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px',
                    background: bg, border: `1px solid ${borderColor}`,
                    borderRadius: 'var(--radius-md)',
                    opacity: skipped ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                  }}>
                    {/* Status icon */}
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? 'rgba(74,222,128,0.18)' : today ? 'rgba(123,92,245,0.18)' : 'var(--bg-elevated)',
                      border: `2px solid ${done ? 'rgba(74,222,128,0.4)' : today ? 'rgba(123,92,245,0.5)' : 'var(--border)'}`,
                    }}>
                      {done    ? <Ic n="check" size={14} color="#4ADE80" /> :
                       skipped ? <Ic n="x"     size={14} color="var(--red)" /> :
                                 <Ic n="book"  size={14} color={today ? '#9D82FF' : 'var(--text-secondary)'} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                          {s.title}
                        </span>
                        {today   && <Badge color="purple" sm>Today</Badge>}
                        {done    && <Badge color="green"  sm><Ic n="check" size={10} color="#4ADE80" /> Done</Badge>}
                        {skipped && <Badge color="red"    sm>Skipped</Badge>}
                      </div>

                      {s.summary && (
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.5 }}>
                          {s.summary}
                        </p>
                      )}

                      {s.subtopics.length > 0 && (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 4 }}>
                          {s.subtopics.slice(0, 4).map((t, ti) => (
                            <span key={ti} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 7px', borderRadius: 99, border: '1px solid var(--border)' }}>
                              {t}
                            </span>
                          ))}
                          {s.subtopics.length > 4 && (
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{s.subtopics.length - 4} more</span>
                          )}
                        </div>
                      )}

                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {formatDay(s.startTime)} · {formatDur(s.estimatedMinutes)}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      {(today || (!done && !skipped)) && (
                        <Btn
                          v={today ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => window.location.href = `/platform/session?sessionId=${s.id}`}
                        >
                          {today
                            ? <><Ic n="book" size={13} color="#fff" /> Start</>
                            : <Ic n="right" size={14} color="var(--text-muted)" />
                          }
                        </Btn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {weeks.length === 0 && <NoSessionsYet />}
      </div>
    </div>
  );
}
