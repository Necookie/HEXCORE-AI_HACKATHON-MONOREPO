import { PROC_STEPS, type UploadPhase } from '../../../types/project.types';
import { Ic, Badge, Card, Btn } from '../../ui';

interface ProcessingStepProps {
  procStep:    number;
  uploadPhase: UploadPhase;
  uploadError: string | null;
  onRetry:     () => void;
  onBack:      () => void;
}

export function ProcessingStep({ procStep, uploadPhase, uploadError, onRetry, onBack }: ProcessingStepProps) {
  const done = procStep >= PROC_STEPS.length;

  // ── Error state ────────────────────────────────────────────────────────────
  if (uploadPhase === 'failed') {
    return (
      <div className="fade-in" style={{ textAlign: 'center', paddingTop: 20 }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(245,107,107,0.12)',
            border: '2px solid rgba(245,107,107,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ic n="x" size={32} color="var(--red)" />
          </div>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700,
          marginBottom: 8, color: 'var(--text-primary)',
        }}>
          Upload Failed
        </h3>

        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: 'rgba(245,107,107,0.08)',
          border: '1px solid rgba(245,107,107,0.28)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 24, textAlign: 'left',
        }}>
          <Ic n="x" size={14} color="var(--red)" />
          <span style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
            {uploadError ?? 'Something went wrong. Please try again.'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn v="ghost" onClick={onBack}>
            <Ic n="left" size={14} color="var(--text-secondary)" /> Back
          </Btn>
          <Btn v="primary" size="md" onClick={onRetry} sx={{ flex: 1, justifyContent: 'center' }}>
            <Ic n="refresh" size={14} color="#fff" /> Retry Upload
          </Btn>
        </div>
      </div>
    );
  }

  // ── Normal / processing state ──────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ textAlign: 'center', paddingTop: 20 }}>
      <div className="float-anim" style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
        <Ic n="bot" size={52} color="var(--purple-light)" />
      </div>
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700,
        marginBottom: 8, color: 'var(--text-primary)',
      }}>
        {done ? 'Roadmap built.' : 'Building your roadmap…'}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        {done
          ? 'Your personalised study plan is ready.'
          : uploadPhase === 'pending'
            ? 'Uploading your PDF securely…'
            : 'Chunking content · Scheduling sessions · Building quizzes'}
      </p>

      <Card sx={{ textAlign: 'left', marginBottom: 24 }}>
        {PROC_STEPS.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderBottom: i < PROC_STEPS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < procStep ? 'var(--green)' : i === procStep ? 'rgba(123,92,245,0.2)' : 'var(--bg-elevated)',
              border: i === procStep && !done ? '2px solid var(--purple)' : '2px solid var(--border)',
              transition: 'all 0.4s ease',
            }}>
              {i < procStep && <Ic n="check" size={12} color="#061a0a" />}
              {i === procStep && !done && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', animation: 'spin 0.8s linear infinite' }} />
              )}
            </div>
            <span style={{
              fontSize: 14,
              color: i < procStep ? 'var(--green)' : i === procStep && !done ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'color 0.3s ease',
            }}>
              {item}
            </span>
            {i < procStep && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>done</span>}
            {i === procStep && !done && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--purple-light)', opacity: 0.8 }}>working…</span>}
          </div>
        ))}
      </Card>

      {done && (
        <div className="slide-up">
          <div style={{ marginBottom: 16 }}>
            <Badge color="green"><Ic n="check" size={12} color="#4ADE80" /> Roadmap Ready</Badge>
          </div>
          <Btn v="primary" size="lg" onClick={() => window.location.href = '/platform/dashboard'} sx={{ justifyContent: 'center' }}>
            View Dashboard <Ic n="right" size={16} color="#fff" />
          </Btn>
        </div>
      )}
    </div>
  );
}
