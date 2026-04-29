import { useState, useEffect, useRef } from 'react';
import { Ic, Badge, Bar, Btn } from './ui';
import type { QuizResult, QuizQuestion, MultipleChoiceQuestion, IdentificationQuestion } from '../pages/api/sessions/quiz';
import type { SessionContext } from '../pages/api/sessions/[id]';

// ── localStorage cache ────────────────────────────────────────────────────────

function quizCacheKey(id: string | undefined, t: string) {
  return `sb_quiz_${id ?? t.slice(0, 60)}`;
}
function readQuizCache(key: string): QuizResult | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}
function writeQuizCache(key: string, quiz: QuizResult) {
  try { localStorage.setItem(key, JSON.stringify(quiz)); } catch { /* quota */ }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeAnswer(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function checkIdentification(userAnswer: string, correctAnswer: string): boolean {
  const u = normalizeAnswer(userAnswer);
  const c = normalizeAnswer(correctAnswer);
  return u === c || c.includes(u) || u.includes(c);
}

/**
 * The AI sometimes returns correctAnswer as a letter ("B") instead of the
 * full option text. Resolve it to the actual option string so comparisons work.
 */
function resolveCorrectAnswer(correctAnswer: string, options: string[]): string {
  const LETTER_MAP: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  const upper = correctAnswer.trim().toUpperCase();
  if (upper in LETTER_MAP) {
    const resolved = options[LETTER_MAP[upper]];
    if (resolved !== undefined) return resolved;
  }
  return correctAnswer;
}

function friendlyError(raw: string) {
  if (raw.includes('429') || raw.toLowerCase().includes('rate limit'))
    return 'AI rate limit hit — wait a moment then retry.';
  if (raw.includes('N8N_QUIZ_WEBHOOK_URL'))
    return 'Quiz webhook not configured. Contact support.';
  if (raw.includes('no questions') || raw.includes('unexpected response'))
    return 'The AI returned an incomplete quiz — please retry.';
  if (raw.toLowerCase().includes('timeout') || raw.includes('AbortError'))
    return 'Quiz generation timed out — the AI is busy. Please retry in a moment.';
  return raw;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Shimmer({ w, h, radius = 8 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-card) 50%, var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function QuizSkeleton() {
  return (
    <div style={{ flex: 1, maxWidth: 620, margin: '0 auto', padding: '24px 32px', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Shimmer w="60%" h={10} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>AI generating quiz…</span>
      </div>
      <div style={{ height: 8, borderRadius: 8, background: 'var(--bg-elevated)', overflow: 'hidden' }}><Shimmer w="40%" h={8} /></div>
      <Shimmer w="85%" h={22} />
      <Shimmer w="70%" h={22} />
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shimmer w={24} h={24} radius={12} />
          <Shimmer w="70%" h={12} />
        </div>
      ))}
    </div>
  );
}

// ── Intro screen ──────────────────────────────────────────────────────────────

function QuizIntro({ title, questionCount, onStart }: {
  title: string; questionCount: number; onStart: () => void;
}) {
  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '40px 32px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
      <img src="/sb-take-quiz.png" alt="StudyBearer" style={{ width: 100, height: 100, objectFit: 'contain' }} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Ready to test your knowledge?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{title}</strong>
          <br />
          {questionCount} questions · Pass with 70% or higher
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Badge color="purple" sm><Ic n="book" size={11} color="#9D82FF" /> Multiple Choice</Badge>
          <Badge color="amber" sm><Ic n="target" size={11} color="#F0A030" /> Identification</Badge>
        </div>
        <Btn v="primary" size="lg" onClick={onStart} sx={{ width: '100%', justifyContent: 'center' }}>
          <Ic n="zap" size={16} color="#fff" /> Start Quiz
        </Btn>
      </div>
    </div>
  );
}

// ── MCQ card ──────────────────────────────────────────────────────────────────

function MCQCard({ q, qi, total, confirmed, selected, combo, onSelect }: {
  q: MultipleChoiceQuestion;
  qi: number; total: number;
  confirmed: boolean; selected: string | null; combo: number;
  onSelect: (opt: string) => void;
}) {
  // Resolve correctAnswer: AI sometimes returns a letter ("B") instead of full text
  const correctText = resolveCorrectAnswer(q.correctAnswer, q.options);
  const isCorrect   = selected === correctText;

  return (
    <div key={qi} className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Badge + counter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
        <Badge color="purple" sm>Multiple Choice</Badge>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{qi + 1} / {total}</span>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, lineHeight: 1.45, marginBottom: 18, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
        {q.question}
      </h3>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {q.options.map((opt, i) => {
          let bg     = 'var(--bg-elevated)';
          let border = 'var(--border)';
          let color  = 'var(--text-primary)';
          let iconBg = 'var(--bg-input)';

          if (!confirmed && selected === opt) { bg = 'rgba(123,92,245,0.12)'; border = 'rgba(123,92,245,0.5)'; }
          if (confirmed && opt === correctText) { bg = 'rgba(74,222,128,0.12)'; border = 'rgba(74,222,128,0.5)'; color = '#4ADE80'; iconBg = 'rgba(74,222,128,0.2)'; }
          if (confirmed && selected === opt && opt !== correctText) { bg = 'rgba(245,107,107,0.12)'; border = 'rgba(245,107,107,0.5)'; color = '#F56B6B'; iconBg = 'rgba(245,107,107,0.2)'; }

          return (
            <button key={i} disabled={confirmed} onClick={() => onSelect(opt)}
              className={confirmed ? '' : 'option-btn option-3d'}
              style={{
                background: bg, border: `1px solid ${border}`,
                borderBottom: confirmed ? `1px solid ${border}` : '1px solid #0C0F1C',
                borderRadius: 'var(--radius-md)', padding: '10px 13px',
                color, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                cursor: confirmed ? 'default' : 'pointer',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 11,
                transition: 'border 0.18s ease, background 0.18s ease',
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: iconBg, border: `1px solid ${border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11, color,
              }}>
                {confirmed && opt === correctText ? <Ic n="check" size={13} color="#4ADE80" /> :
                 confirmed && selected === opt     ? <Ic n="x"     size={13} color="#F56B6B" /> :
                 String.fromCharCode(65 + i)}
              </div>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {confirmed && (
        <div className="slide-up" style={{
          marginTop: 16, padding: '13px 16px', borderRadius: 'var(--radius-md)',
          background: isCorrect ? 'rgba(74,222,128,0.10)' : 'rgba(245,107,107,0.10)',
          border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.32)' : 'rgba(245,107,107,0.32)'}`,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}>
            {isCorrect ? <Ic n="check" size={15} color="#4ADE80" /> : <Ic n="x" size={15} color="#F56B6B" />}
          </span>
          <div>
            <div style={{ fontWeight: 600, color: isCorrect ? '#4ADE80' : '#F56B6B', fontFamily: 'var(--font-heading)', fontSize: 14, marginBottom: 4 }}>
              {isCorrect ? `Correct! +${45 + combo * 15} ELO` : `Correct answer: ${correctText}`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.explanation}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Identification card ───────────────────────────────────────────────────────

function IdentCard({ q, qi, total, confirmed, userAnswer, combo, onChange }: {
  q: IdentificationQuestion;
  qi: number; total: number;
  confirmed: boolean; userAnswer: string; combo: number;
  onChange: (v: string) => void;
}) {
  const isCorrect = confirmed && checkIdentification(userAnswer, q.correctAnswer);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!confirmed) inputRef.current?.focus();
  }, [qi, confirmed]);

  return (
    <div key={qi} className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
        <Badge color="amber" sm>Identification</Badge>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{qi + 1} / {total}</span>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, lineHeight: 1.45, marginBottom: 20, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
        {q.question}
      </h3>

      {/* Text input */}
      <div style={{ flex: 1 }}>
        <input
          ref={inputRef}
          disabled={confirmed}
          value={userAnswer}
          onChange={e => onChange(e.target.value)}
          placeholder="Type your answer here…"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: confirmed
              ? isCorrect ? 'rgba(74,222,128,0.06)' : 'rgba(245,107,107,0.06)'
              : 'var(--bg-elevated)',
            border: `1.5px solid ${confirmed
              ? isCorrect ? 'rgba(74,222,128,0.4)' : 'rgba(245,107,107,0.4)'
              : 'var(--border)'}`,
            color: 'var(--text-primary)', fontSize: 15,
            fontFamily: 'var(--font-body)',
            outline: 'none', transition: 'border 0.18s',
          }}
        />
        {q.hint && !confirmed && (
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <span style={{ color: '#F0A030' }}>Hint:</span> {q.hint}
          </p>
        )}
      </div>

      {/* Feedback */}
      {confirmed && (
        <div className="slide-up" style={{
          marginTop: 16, padding: '13px 16px', borderRadius: 'var(--radius-md)',
          background: isCorrect ? 'rgba(74,222,128,0.10)' : 'rgba(245,107,107,0.10)',
          border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.32)' : 'rgba(245,107,107,0.32)'}`,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}>
            {isCorrect ? <Ic n="check" size={15} color="#4ADE80" /> : <Ic n="x" size={15} color="#F56B6B" />}
          </span>
          <div>
            <div style={{ fontWeight: 600, color: isCorrect ? '#4ADE80' : '#F56B6B', fontFamily: 'var(--font-heading)', fontSize: 14, marginBottom: 4 }}>
              {isCorrect ? `Correct! +${45 + combo * 15} ELO` : `Correct answer: "${q.correctAnswer}"`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.explanation}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────

function QuizResults({ score, total, passingScore, sessionId, onRetry }: {
  score: number; total: number; passingScore: number;
  sessionId?: string; onRetry: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= passingScore;
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completeErr, setCompleteErr] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!sessionId) {
      window.location.href = '/platform/dashboard';
      return;
    }
    setCompleting(true);
    setCompleteErr(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!res.ok) throw new Error('Failed to mark session complete');
      setCompleted(true);
    } catch (e) {
      setCompleteErr(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setCompleting(false);
    }
  };

  if (completed) {
    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/sb-success.png" alt="StudyBearer" style={{ width: 100, height: 100, objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', textAlign: 'center', color: 'var(--text-primary)', margin: 0 }}>
          Session Complete!
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
          Great work — this module is now marked as completed.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn v="ghost" onClick={() => window.location.href = sessionId ? `/platform/session?sessionId=${sessionId}` : '/platform/dashboard'}>
            Back to Session
          </Btn>
          <Btn v="primary" size="lg" onClick={() => window.location.href = '/platform/dashboard'}>
            <Ic n="home" size={15} color="#fff" /> Dashboard
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: 40, maxWidth: 560, margin: '0 auto', width: '100%' }}>
      {/* Mascot */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img
          src={passed ? '/sb-success.png' : '/sb-failed.png'}
          alt={passed ? 'Success' : 'Failed'}
          style={{ width: 100, height: 100, objectFit: 'contain' }}
        />
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: '0 0 8px' }}>
          {passed
            ? pct === 100 ? 'Flawless Victory!' : 'You Passed!'
            : 'Almost There!'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
          {passed
            ? `You scored ${pct}% — well above the ${passingScore}% passing mark.`
            : `You scored ${pct}% — need ${passingScore}% to pass. Review and try again!`}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, textAlign: 'center', padding: '16px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', width: '100%', justifyContent: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: passed ? '#4ADE80' : '#F56B6B', lineHeight: 1 }}>{score}/{total}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>Questions</div>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: passed ? '#4ADE80' : '#F56B6B', lineHeight: 1 }}>{pct}%</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>Score</div>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: '#F0A030', lineHeight: 1 }}>+{score * 45}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>ELO</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%' }}>
        <Bar val={pct} color={passed ? '#4ADE80' : '#F56B6B'} h={10} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>0%</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{passingScore}% pass mark</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>100%</span>
        </div>
      </div>

      {completeErr && (
        <p style={{ fontSize: 12, color: '#F56B6B', textAlign: 'center', margin: 0 }}>{completeErr}</p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
        <Btn v="ghost" onClick={onRetry}>Retry Quiz</Btn>
        {passed ? (
          <Btn v="success" size="lg" disabled={completing} onClick={handleComplete} sx={{ minWidth: 180, justifyContent: 'center' }}>
            {completing ? 'Saving…' : <><Ic n="check" size={16} color="#061a0a" /> Complete Session</>}
          </Btn>
        ) : (
          <Btn v="primary" size="lg" onClick={() => window.location.href = sessionId ? `/platform/session?sessionId=${sessionId}` : '/platform/dashboard'} sx={{ justifyContent: 'center' }}>
            <Ic n="book" size={16} color="#fff" /> Back to Session
          </Btn>
        )}
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function QuizError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
      <Ic n="x" size={32} color="var(--red)" />
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, maxWidth: 360, margin: 0 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Btn v="ghost" onClick={() => window.history.back()}>Go Back</Btn>
        <Btn v="primary" onClick={onRetry}><Ic n="refresh" size={14} color="#fff" /> Try Again</Btn>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface QuizViewProps {
  sessionId?: string;
}

type Phase = 'loading' | 'error' | 'intro' | 'answering' | 'results';

export default function QuizView({ sessionId }: QuizViewProps) {
  const [phase,       setPhase]       = useState<Phase>('loading');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [ctx,         setCtx]         = useState<SessionContext | null>(null);
  const [quiz,        setQuiz]        = useState<QuizResult | null>(null);
  const [qi,          setQi]          = useState(0);
  const [answers,     setAnswers]     = useState<Record<string, string>>({});  // questionId → chosen
  const [inputVal,    setInputVal]    = useState('');   // live value for identification
  const [confirmed,   setConfirmed]   = useState(false);
  const [score,       setScore]       = useState(0);
  const [combo,       setCombo]       = useState(0);
  const [retryN,      setRetryN]      = useState(0);

  // ── Load session context + quiz ───────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) {
      setErrorMsg('No session ID provided. Go back and try again.');
      setPhase('error');
      return;
    }

    let cancelled = false;
    setPhase('loading');
    setErrorMsg('');

    (async () => {
      try {
        // 1. Fetch session context
        const ctxRes = await fetch(`/api/sessions/${sessionId}`);
        if (!ctxRes.ok) throw new Error('Session not found.');
        const ctxData = await ctxRes.json() as SessionContext;
        if (cancelled) return;
        setCtx(ctxData);

        const { session } = ctxData;
        const cacheKey = quizCacheKey(sessionId, session.title);

        // 2. Check localStorage cache
        const cached = readQuizCache(cacheKey);
        if (cached) {
          if (!cancelled) { setQuiz(cached); setPhase('intro'); }
          return;
        }

        // 3. Fetch quiz from API
        const quizRes = await fetch('/api/sessions/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            title: session.title,
            summary: session.summary ?? undefined,
            learningObjectives: session.learningObjectives,
            subtopics: session.subtopics,
          }),
        });
        const quizData = await quizRes.json() as { quiz?: QuizResult; error?: string };
        if (cancelled) return;

        if (!quizRes.ok || quizData.error) {
          throw new Error(friendlyError(quizData.error ?? 'Failed to generate quiz.'));
        }

        writeQuizCache(cacheKey, quizData.quiz!);
        setQuiz(quizData.quiz!);
        setPhase('intro');
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : 'Something went wrong.');
          setPhase('error');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [sessionId, retryN]);

  // Reset quiz state when restarting
  const resetQuiz = () => {
    setQi(0);
    setAnswers({});
    setInputVal('');
    setConfirmed(false);
    setScore(0);
    setCombo(0);
    setPhase('intro');
  };

  const handleRetry = () => {
    if (quiz) {
      resetQuiz();
    } else {
      // Retry fetch: clear cache and re-fetch
      if (ctx) {
        try { localStorage.removeItem(quizCacheKey(sessionId, ctx.session.title)); } catch {}
      }
      setRetryN(n => n + 1);
    }
  };

  const startQuiz = () => {
    resetQuiz();
    setPhase('answering');
  };

  // ── Per-question logic ────────────────────────────────────────────────────
  const currentQ = quiz?.questions[qi];

  const selectedAnswer = currentQ ? (answers[currentQ.id] ?? null) : null;
  const currentInput   = currentQ?.type === 'identification' ? inputVal : '';

  const canCheck = currentQ?.type === 'multiple_choice'
    ? selectedAnswer !== null
    : currentInput.trim().length > 0;

  const handleSelect = (opt: string) => {
    if (confirmed || !currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleCheck = () => {
    if (!currentQ || confirmed) return;
    setConfirmed(true);

    let correct = false;
    if (currentQ.type === 'multiple_choice') {
      const resolvedCorrect = resolveCorrectAnswer(
        currentQ.correctAnswer,
        (currentQ as MultipleChoiceQuestion).options,
      );
      correct = selectedAnswer === resolvedCorrect;
    } else {
      correct = checkIdentification(inputVal, currentQ.correctAnswer);
      setAnswers(prev => ({ ...prev, [currentQ.id]: inputVal }));
    }

    if (correct) { setScore(s => s + 1); setCombo(c => c + 1); }
    else setCombo(0);
  };

  const handleNext = () => {
    if (!quiz) return;
    const isLast = qi >= quiz.questions.length - 1;
    if (isLast) {
      setPhase('results');
    } else {
      setQi(i => i + 1);
      setConfirmed(false);
      setInputVal('');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === 'loading') return <QuizSkeleton />;
  if (phase === 'error')   return <QuizError message={errorMsg} onRetry={handleRetry} />;

  if (phase === 'intro' && quiz && ctx) {
    return (
      <QuizIntro
        title={ctx.session.title}
        questionCount={quiz.questions.length}
        onStart={startQuiz}
      />
    );
  }

  if (phase === 'results' && quiz) {
    return (
      <QuizResults
        score={score}
        total={quiz.questions.length}
        passingScore={quiz.passingScore}
        sessionId={sessionId}
        onRetry={handleRetry}
      />
    );
  }

  if (phase === 'answering' && quiz && currentQ) {
    const total = quiz.questions.length;
    const progress = (qi / total) * 100;

    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 620, margin: '0 auto', padding: '22px 32px', width: '100%' }}>

        {/* Progress + badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <Bar val={progress} color="#7B5CF5" h={8} />
          </div>
          <Badge color="amber" sm><Ic n="flame" size={10} color="#F0A030" /> {combo}</Badge>
          <Badge color="purple" sm><Ic n="star" size={10} color="#9D82FF" /> {score}</Badge>
        </div>

        {/* Question card */}
        {currentQ.type === 'multiple_choice' ? (
          <MCQCard
            q={currentQ as MultipleChoiceQuestion}
            qi={qi} total={total}
            confirmed={confirmed}
            selected={selectedAnswer}
            combo={combo}
            onSelect={handleSelect}
          />
        ) : (
          <IdentCard
            q={currentQ as IdentificationQuestion}
            qi={qi} total={total}
            confirmed={confirmed}
            userAnswer={inputVal}
            combo={combo}
            onChange={setInputVal}
          />
        )}

        {/* Action button */}
        <div style={{ marginTop: 18 }}>
          {!confirmed ? (
            <Btn v="primary" size="lg" disabled={!canCheck} onClick={handleCheck} sx={{ width: '100%', justifyContent: 'center' }}>
              Check Answer
            </Btn>
          ) : (
            <Btn v="success" size="lg" onClick={handleNext} sx={{ width: '100%', justifyContent: 'center' }}>
              {qi < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
              <Ic n="right" size={16} color="#061a0a" />
            </Btn>
          )}
        </div>
      </div>
    );
  }

  return null;
}
