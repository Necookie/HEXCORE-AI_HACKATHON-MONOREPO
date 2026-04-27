import { Ic } from '../ui';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: currentStep > i + 1 ? 'var(--green)' : currentStep === i + 1 ? 'var(--purple)' : 'var(--bg-elevated)',
              color: currentStep > i + 1 ? '#061a0a' : currentStep === i + 1 ? '#fff' : 'var(--text-muted)',
              border: currentStep === i + 1 ? '2px solid rgba(123,92,245,0.5)' : '2px solid var(--border)',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, transition: 'all 0.3s ease',
            }}>
              {currentStep > i + 1 ? <Ic n="check" size={15} color="#061a0a" /> : i + 1}
            </div>
            <span style={{ fontSize: 10, color: currentStep === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: currentStep > i + 1 ? 'var(--purple)' : 'var(--border)', margin: '0 10px', marginBottom: 20, transition: 'background 0.4s ease' }} />
          )}
        </div>
      ))}
    </div>
  );
}
