import { useState, useEffect, useCallback } from 'react';
import type { ScheduleConfig, UploadPhase } from '../types/project.types';
import { PROC_STEPS } from '../types/project.types';
import { projectService } from '../services/project.service';

export function useProjectIntake() {
  const [step,        setStep]        = useState(1);
  const [file,        setFile]        = useState<File | null>(null);
  const [schedule,    setSchedule]    = useState<ScheduleConfig>({
    subjectName: '', targetDate: '', hoursPerDay: 2, studyDays: ['Mon', 'Wed', 'Fri'],
  });
  const [procStep,    setProcStep]    = useState(0);
  const [error,       setError]       = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Real upload effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;

    (async () => {
      setUploadPhase('pending');

      try {
        // Real upload — step 0 ("Uploading PDF") stays active until this resolves
        await projectService.uploadPDF(file!, schedule);

        if (cancelled) return;
        setUploadPhase('done');
        setProcStep(1); // "Uploading PDF" turns green

        // Simulate remaining AI pipeline steps at 950ms each
        for (let i = 2; i <= PROC_STEPS.length; i++) {
          await new Promise<void>(r => setTimeout(r, 950));
          if (cancelled) return;
          setProcStep(i);
        }
        // procStep === PROC_STEPS.length → done = true → CTA appears
      } catch (err: unknown) {
        if (!cancelled) {
          setUploadPhase('failed');
          setUploadError(
            err instanceof Error ? err.message : 'Upload failed. Please try again.',
          );
        }
      }
    })();

    return () => { cancelled = true; };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ───────────────────────────────────────────────────────────
  const goToStep2 = useCallback(() => {
    if (!file) { setError('Upload a PDF first.'); return; }
    setError(null);
    setStep(2);
  }, [file]);

  const goToStep3 = useCallback(() => {
    if (!schedule.subjectName.trim()) { setError('Subject name is required.'); return; }
    if (!schedule.targetDate)          { setError('Select a target completion date.'); return; }
    if (!schedule.studyDays.length)    { setError('Select at least one study day.'); return; }
    setError(null);
    setUploadError(null);
    setUploadPhase('idle');
    setProcStep(0);
    setStep(3); // optimistic — UI advances immediately
  }, [schedule]);

  const retryUpload = useCallback(() => {
    setUploadError(null);
    setUploadPhase('idle');
    setProcStep(0);
    // Flip 3 → 2 → 3 via microtask to re-trigger the useEffect
    setStep(2);
    Promise.resolve().then(() => setStep(3));
  }, []);

  return {
    step,
    setStep,
    file,
    setFile,
    schedule,
    setSchedule,
    procStep,
    error,
    setError,
    uploadPhase,
    uploadError,
    goToStep2,
    goToStep3,
    retryUpload,
  };
}
