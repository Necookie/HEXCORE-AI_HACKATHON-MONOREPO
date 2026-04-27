import { Badge } from './ui';
import { useProjectIntake } from '../hooks/useProjectIntake';
import { StepIndicator } from './ProjectIntake/StepIndicator';
import { UploadStep } from './ProjectIntake/Steps/UploadStep';
import { ScheduleStep } from './ProjectIntake/Steps/ScheduleStep';
import { ProcessingStep } from './ProjectIntake/Steps/ProcessingStep';

const STEPS = ['Upload PDF', 'Set Schedule', 'AI Processing'];

export default function ProjectIntake() {
  const {
    step,
    setStep,
    file,
    setFile,
    schedule,
    setSchedule,
    procStep,
    error,
    setError,
    goToStep2,
    goToStep3,
  } = useProjectIntake();

  return (
    <div className="content-scroll fade-in" style={{ padding: '24px 40px', flex: 1, maxWidth: 640, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Badge color="purple" sm>New Subject</Badge>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginTop: 8, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Upload Study Material
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 13 }}>
          Drop your PDF and StudyBearer builds a personalized, AI-powered roadmap.
        </p>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} />

      {step === 1 && (
        <UploadStep 
          file={file} 
          onFileSelect={f => { setFile(f); setError(null); }} 
          error={error} 
          onNext={goToStep2} 
        />
      )}

      {step === 2 && (
        <ScheduleStep 
          schedule={schedule} 
          onUpdate={u => setSchedule(s => ({ ...s, ...u }))} 
          error={error} 
          onBack={() => setStep(1)} 
          onNext={goToStep3} 
        />
      )}

      {step === 3 && (
        <ProcessingStep procStep={procStep} />
      )}
    </div>
  );
}
