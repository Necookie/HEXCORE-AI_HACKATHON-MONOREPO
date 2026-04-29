import { useState, useEffect } from 'react';
import { Ic, Badge, Btn, Bar } from './ui';
import { projectService } from '../services/project.service';
import type { DocumentSummary, StudySession } from '../types/project.types';

// ── Palette (mirrors dashboard) ───────────────────────────────────────────────
const PALETTE = ['#7B5CF5', '#60A5FA', '#4ADE80', '#F0A030', '#F472B6', '#9D82FF'];
const subjectColor = (i: number) => PALETTE[i % PALETTE.length];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const todayStr = now.toDateString();
  const tomorrowStr = new Date(now.getTime() + 86_400_000).toDateString();
  if (d.toDateString() === todayStr)    return 'Today';
  if (d.toDateString() === tomorrowStr) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Subject grid (step 1) ─────────────────────────────────────────────────────
function SubjectGrid({
  subjects, loading, onPick,
}: {
  subjects: DocumentSummary[];
  loading: boolean;
  onPick: (s: DocumentSummary, colorIdx: number) => void;
}) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 88, borderRadius: 14, background: 'var(--bg-elevated)', opacity: 1 - i * 0.25 }} />
        ))}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 16, gap: 16,
      }}>
        <img src="/sb-no-subjects.png" alt="No subjects" style={{ width: 100, objectFit: 'contain' }} />
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
          No subjects yet
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
          Upload a PDF to create a study plan, then come back here to quiz yourself.
        </p>
        <Btn v="primary" onClick={() => window.location.href = '/platform'}>
          <Ic n="upload" size={14} color="#fff" /> Upload PDF
        </Btn>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
      {subjects.map((s, i) => {
        const color = subjectColor(i);
        const pct   = s.totalSessions > 0
          ? Math.round((s.completedSessions / s.totalSessions) * 100) : 0;
        return (
          <button
            key={s.id}
            onClick={() => onPick(s, i)}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
              textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10,
              transition: 'border-color 0.18s, transform 0.12s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = color;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic n="book" size={16} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.subjectName ?? 'Untitled'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {s.totalSessions} sessions · {pct}% done
                </div>
              </div>
              <Ic n="right" size={14} color="var(--text-muted)" />
            </div>
            <Bar val={pct} color={color} h={4} />
          </button>
        );
      })}
    </div>
  );
}

// ── Session list (step 2) ─────────────────────────────────────────────────────
function SessionList({
  subject, colorIdx, sessions, loading, onBack,
}: {
  subject: DocumentSummary;
  colorIdx: number;
  sessions: StudySession[];
  loading: boolean;
  onBack: () => void;
}) {
  const color = subjectColor(colorIdx);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Back + subject header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Btn v="ghost" size="sm" onClick={onBack}>
          <Ic n="left" size={14} /> Back
        </Btn>
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ic n="book" size={13} color={color} />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
          {subject.subjectName ?? 'Untitled'}
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 64, borderRadius: 12, background: 'var(--bg-elevated)', opacity: 1 - i * 0.25 }} />
          ))}
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No sessions found for this subject.
        </div>
      )}

      {!loading && sessions.map((s, i) => {
        const isCompleted = s.status === 'completed';
        const isSkipped   = s.status === 'skipped';
        const sessionDate = fmtDate(s.startTime);

        return (
          <div key={s.id} style={{
            background: 'var(--bg-card)', border: `1px solid ${isCompleted ? 'rgba(74,222,128,0.22)' : 'var(--border)'}`,
            borderRadius: 12, padding: '13px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
            opacity: isSkipped ? 0.55 : 1,
          }}>
            {/* Module number */}
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: isCompleted ? 'rgba(74,222,128,0.12)' : `${color}12`,
              border: `1px solid ${isCompleted ? 'rgba(74,222,128,0.3)' : `${color}28`}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
              color: isCompleted ? '#4ADE80' : color,
            }}>
              {isCompleted ? <Ic n="check" size={14} color="#4ADE80" sw={2.5} /> : s.moduleNumber}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                {s.title}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {sessionDate}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {s.estimatedMinutes} min
                </span>
                {isCompleted && (
                  <Badge color="green" sm>Completed</Badge>
                )}
                {isSkipped && (
                  <Badge color="red" sm>Skipped</Badge>
                )}
              </div>
            </div>

            {/* Quiz button */}
            <Btn
              v={isCompleted ? 'ghost' : 'primary'}
              size="sm"
              onClick={() => window.location.href = `/platform/quiz?sessionId=${s.id}`}
              sx={{ flexShrink: 0 }}
            >
              <Ic n={isCompleted ? 'refresh' : 'zap'} size={13} color={isCompleted ? 'currentColor' : '#fff'} />
              {isCompleted ? 'Retake' : 'Quiz'}
            </Btn>
          </div>
        );
      })}
    </div>
  );
}

// ── Quiz Hub ──────────────────────────────────────────────────────────────────
export default function QuizHub() {
  const [subjects,       setSubjects]       = useState<DocumentSummary[]>([]);
  const [loadingSubj,    setLoadingSubj]    = useState(true);
  const [selected,       setSelected]       = useState<DocumentSummary | null>(null);
  const [selectedIdx,    setSelectedIdx]    = useState(0);
  const [sessions,       setSessions]       = useState<StudySession[]>([]);
  const [loadingSess,    setLoadingSess]    = useState(false);

  useEffect(() => {
    projectService.fetchDocuments()
      .then(docs => setSubjects(docs.filter(d => d.status === 'ready')))
      .catch(() => {})
      .finally(() => setLoadingSubj(false));
  }, []);

  function handlePick(s: DocumentSummary, colorIdx: number) {
    setSelected(s);
    setSelectedIdx(colorIdx);
    setLoadingSess(true);
    setSessions([]);
    projectService.fetchRoadmap(s.id)
      .then(r => setSessions(r.sessions))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSess(false));
  }

  return (
    <div className="content-scroll fade-in" style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 780, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img
          src="/sb-take-quiz.png"
          alt="StudyBearer"
          style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0 }}
        />
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
            Quiz Practice
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '5px 0 0', lineHeight: 1.5 }}>
            {selected
              ? 'Pick a session below to test yourself.'
              : 'Pick a subject, then choose a session to quiz on.'}
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { icon: 'book',        color: '#7B5CF5', label: `${subjects.length} Subjects` },
          { icon: 'checkCircle', color: '#4ADE80', label: `${subjects.reduce((a, s) => a + s.completedSessions, 0)} Completed` },
          { icon: 'zap',        color: '#F0A030', label: `${subjects.reduce((a, s) => a + s.totalSessions, 0)} Total Sessions` },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 13px' }}>
            <Ic n={item.icon} size={14} color={item.color} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      {!selected ? (
        <SubjectGrid
          subjects={subjects}
          loading={loadingSubj}
          onPick={handlePick}
        />
      ) : (
        <SessionList
          subject={selected}
          colorIdx={selectedIdx}
          sessions={sessions}
          loading={loadingSess}
          onBack={() => { setSelected(null); setSessions([]); }}
        />
      )}
    </div>
  );
}
