import { PROC_STEPS } from '../../../types/project.types';
import { Ic, Badge, Card, Btn } from '../../ui';

interface ProcessingStepProps {
  procStep: number;
}

export function ProcessingStep({ procStep }: ProcessingStepProps) {
  const done = procStep >= PROC_STEPS.length;

  return (
    <div className="fade-in" style={{ textAlign: 'center', paddingTop: 20 }}>
      <div className="float-anim" style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
        <Ic n="bot" size={52} color="var(--purple-light)" />
      </div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
        Building your roadmap…
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Chunking content · Scheduling sessions · Syncing Google Calendar
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
              border: i === procStep ? '2px solid var(--purple)' : '2px solid var(--border)',
              transition: 'all 0.4s ease',
            }}>
              {i < procStep && <Ic n="check" size={12} color="#061a0a" />}
              {i === procStep && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', animation: 'spin 0.8s linear infinite' }} />
              )}
            </div>
            <span style={{ fontSize: 14, color: i < procStep ? 'var(--green)' : i === procStep ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'color 0.3s ease' }}>
              {item}
            </span>
            {i < procStep && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>done</span>}
            {i === procStep && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--purple-light)', opacity: 0.8 }}>working…</span>}
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
