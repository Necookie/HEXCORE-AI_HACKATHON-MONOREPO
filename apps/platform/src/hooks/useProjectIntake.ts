import { useState, useEffect, useCallback, useRef } from 'react';
import type { ScheduleConfig, UploadPhase } from '../types/project.types';
import { PROC_STEPS } from '../types/project.types';
import { projectService } from '../services/project.service';

const POLL_INTERVAL_MS  = 3_000;   // check n8n status every 3 s
const VISUAL_STEP_MS    = 8_000;   // advance progress visually every 8 s
const MAX_POLL_ATTEMPTS = 60;      // ~3 min timeout (was 10 min)
const STALE_AFTER       = 20;      // 60 s of polling → show "taking longer" warning

export function useProjectIntake() {
  const [step,        setStep]        = useState(1);
  const [file,        setFile]        = useState<File | null>(null);
  const [schedule,    setSchedule]    = useState<ScheduleConfig>({
    subjectName: '', targetDate: '', hoursPerDay: 2, studyDays: ['Mon', 'Wed', 'Fri'],
    startTime: '19:00', timezoneOffset: 0,
  });
  const [procStep,    setProcStep]    = useState(0);
  const [error,       setError]       = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documentId,  setDocumentId]  = useState<string | null>(null);
  const [isStale,     setIsStale]     = useState(false);
  // 'upload' = file send failed, 'processing' = n8n/AI failed, 'timeout' = gave up waiting
  const [errorKind,   setErrorKind]   = useState<'upload' | 'processing' | 'timeout'>('processing');

  // Refs used inside intervals so closures always see latest values
  const pollAttemptsRef = useRef(0);
  const pollTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const visualTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (pollTimerRef.current)   { clearInterval(pollTimerRef.current);   pollTimerRef.current   = null; }
    if (visualTimerRef.current) { clearInterval(visualTimerRef.current); visualTimerRef.current = null; }
  }, []);

  // ── Upload + polling effect ──────────────────────────────────────────────
  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;

    (async () => {
      setUploadPhase('pending');
      setProcStep(0);
      setIsStale(false);
      pollAttemptsRef.current = 0;

      try {
        // Step 0 stays active during the actual file upload
        const { documentId: docId } = await projectService.uploadPDF(file!, schedule);

        if (cancelled) return;
        setDocumentId(docId);
        setUploadPhase('done');
        setProcStep(1); // "Uploading PDF" turns green

        // ── Visual progress ticker (cosmetic, keeps UI alive during AI work) ──
        visualTimerRef.current = setInterval(() => {
          setProcStep(prev => {
            const cap = PROC_STEPS.length - 1; // never auto-complete — wait for DB signal
            return prev < cap ? prev + 1 : prev;
          });
        }, VISUAL_STEP_MS);

        // ── Real status polling ──────────────────────────────────────────────
        pollTimerRef.current = setInterval(async () => {
          if (cancelled) { clearTimers(); return; }

          pollAttemptsRef.current += 1;

          // Show "taking longer than expected" warning after STALE_AFTER polls
          if (pollAttemptsRef.current >= STALE_AFTER && !cancelled) {
            setIsStale(true);
          }

          if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
            clearTimers();
            if (!cancelled) {
              setIsStale(false);
              setErrorKind('timeout');
              setUploadPhase('failed');
              setUploadError('Processing timed out — the AI workflow may have encountered an error. Please try again.');
            }
            return;
          }

          try {
            const { status, errorMessage } = await projectService.pollDocumentStatus(docId);

            if (status === 'ready') {
              clearTimers();
              if (!cancelled) {
                setIsStale(false);
                setProcStep(PROC_STEPS.length); // all steps → done
              }
            } else if (status === 'error') {
              clearTimers();
              if (!cancelled) {
                setIsStale(false);
                setErrorKind('processing');
                setUploadPhase('failed');
                setUploadError(errorMessage ?? 'AI processing failed. Please try again.');
              }
            }
            // 'processing' → keep polling
          } catch {
            // transient network error — keep polling
          }
        }, POLL_INTERVAL_MS);

      } catch (err: unknown) {
        if (!cancelled) {
          setIsStale(false);
          setErrorKind('upload');
          setUploadPhase('failed');
          setUploadError(
            err instanceof Error ? err.message : 'Upload failed. Please try again.',
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimers();
    };
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
    setDocumentId(null);
    setStep(3); // optimistic — UI advances immediately
  }, [schedule]);

  const retryUpload = useCallback(() => {
    clearTimers();
    setUploadError(null);
    setUploadPhase('idle');
    setProcStep(0);
    setIsStale(false);
    setErrorKind('processing');
    setDocumentId(null);
    // Flip 3 → 2 → 3 via microtask to re-trigger the useEffect
    setStep(2);
    Promise.resolve().then(() => setStep(3));
  }, [clearTimers]);

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
    documentId,
    isStale,
    errorKind,
    goToStep2,
    goToStep3,
    retryUpload,
  };
}
