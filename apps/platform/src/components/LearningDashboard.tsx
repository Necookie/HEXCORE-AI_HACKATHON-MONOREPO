import { useState, useEffect } from 'react';
import { Ic, Badge, Bar, Card, Btn } from './ui';
import { projectService } from '../services/project.service';
import type { DocumentSummary, TodaySession, DashboardStats } from '../types/project.types';

// ── Bear rank thresholds ──────────────────────────────────────────────────────
export const BEAR_RANKS = [
  { name: 'Cub',         img: '/sb-rank-cub.png',     min: 0,    max: 199,      color: '#C89B7B' },
  { name: 'Panda',       img: '/sb-rank-panda.png',   min: 200,  max: 499,      color: '#4ADE80' },
  { name: 'Grizzly',     img: '/sb-rank-grizzly.png', min: 500,  max: 999,      color: '#CD7F32' },
  { name: 'Polar',       img: '/sb-rank-polar.png',   min: 1000, max: 2999,     color: '#60A5FA' },
  { name: 'Spirit Bear', img: '/sb-rank-spirit.png',  min: 3000, max: Infinity,  color: '#F0A030' },
] as const;

function getRank(elo: number) {
  return BEAR_RANKS.find(r => elo >= r.min && elo <= r.max) ?? BEAR_RANKS[0];
}

function getNextRank(elo: number) {
  const idx = BEAR_RANKS.findIndex(r => elo >= r.min && elo <= r.max);
  return idx < BEAR_RANKS.length - 1 ? BEAR_RANKS[idx + 1] : null;
}

// ── Colour palette for subject cards ─────────────────────────────────────────
const PALETTE = ['#7B5CF5', '#60A5FA', '#4ADE80', '#F0A030', '#F472B6', '#9D82FF'];

function subjectColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

function formatNextSession(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const todayStr = now.toDateString();
  const tomorrowStr = new Date(now.getTime() + 86_400_000).toDateString();
  if (d.toDateString() === todayStr)     return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (d.toDateString() === tomorrowStr)  return `Tomorrow, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatSessionTime(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function LearningDashboard({ userName = 'Scholar' }: { userName?: string }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [subjects,       setSubjects]       = useState<DocumentSummary[]>([]);
  const [todaySessions,  setTodaySessions]  = useState<TodaySession[]>([]);
  const [dashStats,      setDashStats]      = useState<DashboardStats | null>(null);
  const [loadingSubj,    setLoadingSubj]    = useState(true);
  const [loadingToday,   setLoadingToday]   = useState(true);
  const [loadingStats,   setLoadingStats]   = useState(true);
  const [confirmingId,   setConfirmingId]   = useState<string | null>(null);
  const [deletingId,     setDeletingId]     = useState<string | null>(null);
  const [deleteError,    setDeleteError]    = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    projectService.fetchDocuments()
      .then(docs => { if (!cancelled) setSubjects(docs.filter(d => d.status === 'ready')); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingSubj(false); });

    projectService.fetchTodaySessions()
      .then(sess => { if (!cancelled) setTodaySessions(sess); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingToday(false); });

    projectService.fetchDashboardStats()
      .then(s => { if (!cancelled) setDashStats(s); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingStats(false); });

    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await projectService.deleteDocument(id);
      // Optimistically remove from list
      setSubjects(prev => prev.filter(s => s.id !== id));
      setTodaySessions(prev => prev.filter(s => s.documentId !== id));
      setConfirmingId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  const loading = loadingSubj || loadingToday || loadingStats;

  return (
    <div className="content-scroll fade-in" style={{ padding: '22px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>{today}</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
            Welcome back, <span style={{ color: 'var(--purple-light)' }}>{userName}</span>
          </h1>
        </div>
        <Btn onClick={() => window.location.href = '/platform'} sx={{ flexShrink: 0 }}>
          <Ic n="upload" size={15} color="#fff" /> Upload PDF
        </Btn>
      </div>

      {/* Stat strip */}
      {(() => {
        const statItems = [
          { label: 'Current Streak', val: dashStats ? `${dashStats.streak}d`  : '—', icon: 'flame',       color: '#F0A030' },
          { label: 'ELO Rating',     val: dashStats ? `${dashStats.elo}`       : '—', icon: 'zap',         color: '#60A5FA' },
          { label: 'Quizzes Passed', val: dashStats ? `${dashStats.quizzesPassed}` : '—', icon: 'checkCircle', color: '#4ADE80' },
          { label: 'Study Hours',    val: dashStats ? `${dashStats.studyHours}h` : '—', icon: 'book',        color: '#9D82FF' },
        ];
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {statItems.map((s, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '11px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: loadingStats ? 0.5 : 1,
                transition: 'opacity 0.3s ease',
              }}>
                <Ic n={s.icon} size={20} color={s.color} />
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, flex: 1, minHeight: 0 }}>

        {/* Subjects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Active Subjects
          </div>

          {loadingSubj && [1, 2, 3].map(i => (
            <div key={i} style={{ height: 68, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', opacity: 1 - i * 0.2 }} />
          ))}

          {!loadingSubj && subjects.map((s, i) => {
            const color        = subjectColor(i);
            const pct          = s.totalSessions > 0 ? Math.round((s.completedSessions / s.totalSessions) * 100) : 0;
            const next         = formatNextSession(s.nextSessionDate);
            const topic        = s.nextSessionTitle ?? 'No upcoming sessions';
            const isConfirming = confirmingId === s.id;
            const isDeleting   = deletingId   === s.id;

            return (
              <Card key={s.id} sx={{ padding: '10px 13px', position: 'relative', overflow: 'hidden' }}>

                {/* ── Confirm-delete overlay ────────────────────────────── */}
                {isConfirming && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    {/* Red warning badge */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(245,107,107,0.12)',
                      border: '1px solid rgba(245,107,107,0.28)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ic n="trash" size={14} color="var(--red)" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>
                        Delete &ldquo;{s.subjectName ?? 'Untitled'}&rdquo;?
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        Removes the PDF, all sessions &amp; calendar events.
                      </div>
                      {deleteError && deletingId === null && (
                        <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{deleteError}</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <Btn v="ghost" size="sm"
                        onClick={() => { setConfirmingId(null); setDeleteError(null); }}>
                        Cancel
                      </Btn>
                      <Btn v="danger" size="sm"
                        onClick={() => handleDelete(s.id)}
                        sx={isDeleting ? { opacity: 0.6, pointerEvents: 'none' } : {}}>
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </Btn>
                    </div>
                  </div>
                )}

                {/* ── Normal card row ───────────────────────────────────── */}
                {!isConfirming && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Book icon */}
                    <div
                      onClick={() => window.location.href = `/platform/roadmap?documentId=${s.id}`}
                      style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                      <Ic n="book" size={15} color={color} />
                    </div>

                    {/* Main content — clickable */}
                    <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                      onClick={() => window.location.href = `/platform/roadmap?documentId=${s.id}`}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.subjectName ?? 'Untitled'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {topic}
                      </div>
                      <Bar val={pct} color={color} h={4} />
                    </div>

                    {/* Progress + next session — clickable */}
                    <div style={{ textAlign: 'right', flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => window.location.href = `/platform/roadmap?documentId=${s.id}`}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{next}</div>
                    </div>

                    {/* Arrow — clickable */}
                    <div style={{ cursor: 'pointer' }}
                      onClick={() => window.location.href = `/platform/roadmap?documentId=${s.id}`}>
                      <Ic n="right" size={13} color="var(--text-muted)" />
                    </div>

                    {/* Trash button — does NOT navigate */}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setConfirmingId(s.id); setDeleteError(null); }}
                      title="Delete subject"
                      style={{
                        flexShrink: 0, background: 'none', border: 'none',
                        padding: '4px 5px', borderRadius: 6, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0.45, transition: 'opacity 0.15s ease, background 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,107,107,0.1)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '0.45';
                        (e.currentTarget as HTMLButtonElement).style.background = 'none';
                      }}
                    >
                      <Ic n="trash" size={13} color="var(--red)" />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}

          {!loadingSubj && subjects.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 24px',
              flex: 1,
            }}>
              <img
                src="/sb-no-subjects.png"
                alt="No subjects"
                style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 16 }}
              />
              <div style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17,
                color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6,
              }}>
                Nothing to study yet
              </div>
              <p style={{
                fontSize: 13, color: 'var(--text-secondary)',
                lineHeight: 1.6, marginBottom: 20, maxWidth: 280,
              }}>
                Upload a PDF — StudyBearer reads it, schedules sessions, and syncs everything to your calendar.
              </p>
              <Btn v="primary" size="md" onClick={() => window.location.href = '/platform'}
                sx={{ justifyContent: 'center' }}>
                <Ic n="upload" size={14} color="#fff" /> Upload PDF
              </Btn>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                Supports PDFs up to 25 MB
              </span>
            </div>
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
              {loadingToday && (
                <div style={{ padding: '16px 13px' }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ height: 40, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 8, opacity: 1 - i * 0.3 }} />
                  ))}
                </div>
              )}

              {!loadingToday && todaySessions.length === 0 && (
                <div style={{ padding: '16px 13px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No sessions today.</p>
                </div>
              )}

              {!loadingToday && todaySessions.map((s, i) => {
                const color = subjectColor(subjects.findIndex(d => d.id === s.documentId));
                return (
                  <div key={s.id} style={{ padding: '10px 13px', borderBottom: i < todaySessions.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2, width: 44, flexShrink: 0 }}>
                      {formatSessionTime(s.startTime)}
                    </div>
                    <div style={{ width: 2, alignSelf: 'stretch', background: color, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.subjectName ?? 'Study Session'}</div>
                    </div>
                  </div>
                );
              })}

              {(() => {
                // First scheduled (not completed/skipped) session today
                const nextSession = todaySessions.find(s => s.status === 'scheduled');
                const anyCompleted = todaySessions.some(s => s.status === 'completed');
                const label = nextSession
                  ? (anyCompleted ? 'Resume Session' : 'Start Session')
                  : 'View Roadmap';
                const icon  = nextSession ? 'play' : 'calendar';
                const href  = nextSession
                  ? `/platform/session?sessionId=${nextSession.id}`
                  : '/platform/roadmap';
                return (
                  <div style={{ padding: '10px 13px', display: 'flex', gap: 8 }}>
                    <Btn v="primary" size="sm" onClick={() => window.location.href = href} sx={{ flex: 1, justifyContent: 'center' }}>
                      <Ic n={icon} size={14} color="#fff" /> {label}
                    </Btn>
                    <Btn v="ghost" size="sm" onClick={() => window.location.href = '/platform/roadmap'}>
                      <Ic n="calendar" size={14} />
                    </Btn>
                  </div>
                );
              })()}
            </Card>
          </div>

          {/* Rank card */}
          {(() => {
            const elo      = dashStats?.elo ?? 0;
            const rank     = getRank(elo);
            const next     = getNextRank(elo);
            const barPct   = next
              ? Math.round(((elo - rank.min) / (next.min - rank.min)) * 100)
              : 100;
            const eloToNext = next ? next.min - elo : 0;
            return (
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <img src={rank.img} alt={rank.name} style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{rank.name} Rank</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {next ? `${eloToNext} ELO to ${next.name}` : 'Max rank reached!'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Badge color="amber" sm>{elo} ELO</Badge>
                  </div>
                </div>
                <Bar val={barPct} color={rank.color} h={8} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{rank.min}</span>
                  {next && <span style={{ fontFamily: 'var(--font-mono)' }}>{next.min}</span>}
                </div>
              </Card>
            );
          })()}

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
