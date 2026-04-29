import { useState, useEffect } from 'react';
import { Ic, Badge } from './ui';
import type { NotesRequest, NotesResult, NoteConcept } from '../pages/api/sessions/notes';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Shimmer({ w, h, radius = 8 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-card) 50%, var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function NotesSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {/* TL;DR skeleton */}
      <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Shimmer w={60} h={14} />
        <Shimmer w="90%" h={13} />
        <Shimmer w="75%" h={13} />
      </div>
      {/* Concept skeletons */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{ padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Shimmer w={120} h={14} />
          <Shimmer w="95%" h={12} />
          <Shimmer w="80%" h={12} />
          <div style={{ marginTop: 4, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Shimmer w={80} h={11} />
            <Shimmer w="85%" h={11} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TL;DR card ────────────────────────────────────────────────────────────────

function TldrCard({ text }: { text: string }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(123,92,245,0.07)',
      borderLeft: '3px solid #7B5CF5',
      border: '1px solid rgba(123,92,245,0.18)',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: '#9D82FF',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        fontFamily: 'var(--font-heading)', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Ic n="zap" size={11} color="#9D82FF" /> TL;DR
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

// ── Concept card ──────────────────────────────────────────────────────────────

function ConceptCard({ concept, index }: { concept: NoteConcept; index: number }) {
  const [exOpen, setExOpen] = useState(false);

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      background: 'var(--bg-card)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(123,92,245,0.14)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: '#9D82FF',
          }}>
            {index + 1}
          </span>
          <h4 style={{
            fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
          }}>
            {concept.title}
          </h4>
        </div>
        <p style={{
          fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
          margin: '0 0 12px',
        }}>
          {concept.explanation}
        </p>
      </div>

      {/* Example toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExOpen(o => !o)}
        onKeyDown={e => e.key === 'Enter' && setExOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px',
          background: exOpen ? 'rgba(240,160,48,0.06)' : 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-subtle)',
          cursor: 'pointer', userSelect: 'none',
          transition: 'background 0.15s',
        }}
      >
        <Ic n="sparkles" size={13} color="#F0A030" />
        <span style={{
          fontSize: 12, fontWeight: 600, color: '#F0A030',
          fontFamily: 'var(--font-heading)', flex: 1,
        }}>
          See example
        </span>
        <div style={{
          transition: 'transform 0.2s',
          transform: exOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
          display: 'flex',
        }}>
          <Ic n="chevronDown" size={13} color="var(--text-muted)" />
        </div>
      </div>

      {/* Example body */}
      <div style={{
        overflow: 'hidden',
        maxHeight: exOpen ? 300 : 0,
        opacity: exOpen ? 1 : 0,
        transition: 'max-height 0.3s ease, opacity 0.2s ease',
      }}>
        <div style={{
          padding: '12px 18px 14px',
          background: 'rgba(240,160,48,0.05)',
          borderTop: '1px solid rgba(240,160,48,0.14)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {concept.example}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Key takeaways ─────────────────────────────────────────────────────────────

function Takeaways({ items }: { items: string[] }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(74,222,128,0.12)',
          border: '1.5px solid rgba(74,222,128,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Ic n="check" size={13} color="#4ADE80" />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
          color: 'var(--text-primary)', margin: 0,
        }}>
          Key Takeaways
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '9px 14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: 'rgba(74,222,128,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ic n="check" size={10} color="#4ADE80" sw={2.5} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Remember This ─────────────────────────────────────────────────────────────

function RememberCard({ text }: { text: string }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(240,160,48,0.07)',
      border: '1px solid rgba(240,160,48,0.2)',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: '#F0A030',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        fontFamily: 'var(--font-heading)', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Ic n="star" size={11} color="#F0A030" /> Remember This
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
        "{text}"
      </p>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function NotesError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(245,107,107,0.06)',
      border: '1px solid rgba(245,107,107,0.22)',
      textAlign: 'center',
    }}>
      <Ic n="x" size={20} color="var(--red)" />
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '10px 0 16px', lineHeight: 1.6 }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 16px', borderRadius: 'var(--radius-md)',
          background: 'rgba(123,92,245,0.12)', border: '1px solid rgba(123,92,245,0.3)',
          color: '#9D82FF', fontSize: 12, fontWeight: 600,
          fontFamily: 'var(--font-heading)', cursor: 'pointer',
        }}
      >
        <Ic n="refresh" size={13} color="#9D82FF" /> Try again
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface StudyNotesProps {
  sessionId?: string;
  title: string;
  summary?: string;
  learningObjectives?: string[];
  subtopics?: string[];
}

export default function StudyNotes({
  sessionId, title, summary, learningObjectives, subtopics,
}: StudyNotesProps) {
  const [notes,   setNotes]   = useState<NotesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [retryN,  setRetryN]  = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch('/api/sessions/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, title, summary, learningObjectives, subtopics } satisfies NotesRequest),
        });

        const data = await res.json() as { notes?: NotesResult; error?: string };
        if (!cancelled) {
          if (!res.ok || data.error) {
            setError(data.error ?? 'Failed to generate notes.');
          } else {
            setNotes(data.notes!);
          }
        }
      } catch {
        if (!cancelled) setError('Network error — check your connection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [sessionId, title, retryN]); // re-run when session changes or user retries

  if (loading) return <NotesSkeleton />;

  if (error) return (
    <NotesError
      message={error}
      onRetry={() => { setNotes(null); setRetryN(n => n + 1); }}
    />
  );

  if (!notes) return null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* TL;DR */}
      <TldrCard text={notes.tldr} />

      {/* Core Concepts */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(96,165,250,0.12)',
            border: '1.5px solid rgba(96,165,250,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Ic n="book" size={13} color="#60A5FA" />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
            color: 'var(--text-primary)', margin: 0, flex: 1,
          }}>
            Core Concepts
          </h3>
          <span style={{
            fontSize: 11, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
            {notes.concepts.length} topics
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.concepts.map((concept, i) => (
            <ConceptCard key={i} concept={concept} index={i} />
          ))}
        </div>
      </div>

      {/* Key Takeaways */}
      <Takeaways items={notes.keyTakeaways} />

      {/* Remember This */}
      <RememberCard text={notes.remember} />

      {/* Footer hint */}
      <p style={{
        fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
        fontFamily: 'var(--font-mono)', lineHeight: 1.5,
      }}>
        AI-generated · always verify against your course material
      </p>
    </div>
  );
}
