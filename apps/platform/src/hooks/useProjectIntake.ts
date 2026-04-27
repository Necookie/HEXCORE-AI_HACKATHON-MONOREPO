import { useState, useEffect, useCallback } from 'react';
import type { ScheduleConfig } from '../types/project.types';
import { PROC_STEPS } from '../types/project.types';
import { projectService } from '../services/project.service';

export function useProjectIntake() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    subjectName: '',
    targetDate: '',
    hoursPerDay: 2,
    studyDays: ['Mon', 'Wed', 'Fri'],
  });
  const [procStep, setProcStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 3) return;

    let cancelled = false;
    const runProcessing = async () => {
      try {
        const pdfUrl = await projectService.uploadPDF(file!);
        if (cancelled) return;

        await Promise.all([
          projectService.triggerN8N({ pdfUrl, schedule }),
          new Promise<void>(res => {
            let i = 0;
            const t = setInterval(() => {
              i++;
              if (!cancelled) setProcStep(i);
              if (i >= PROC_STEPS.length) {
                clearInterval(t);
                res();
              }
            }, 900);
          }),
        ]);
      } catch (err) {
        // stay on step 3 with all steps shown or handle error
        console.error('Processing failed', err);
      }
    };

    runProcessing();
    return () => { cancelled = true; };
  }, [step, file, schedule]);

  const goToStep2 = useCallback(() => {
    if (!file) {
      setError('Upload a PDF first.');
      return;
    }
    setError(null);
    setStep(2);
  }, [file]);

  const goToStep3 = useCallback(() => {
    if (!schedule.targetDate) {
      setError('Select a target completion date.');
      return;
    }
    if (!schedule.studyDays.length) {
      setError('Select at least one study day.');
      return;
    }
    setError(null);
    setStep(3);
  }, [schedule]);

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
    goToStep2,
    goToStep3,
  };
}
