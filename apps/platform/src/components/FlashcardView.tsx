import { useState, useEffect, useCallback } from 'react';
import { Ic, Badge, Btn, Bar } from './ui';
import type { Flashcard, FlashcardDeck } from '../pages/api/sessions/flashcards';

// ── Card status tracking ───────────────────────────────────────────────────────
type CardStatus = 'new' | 'mastered' | 'learning';

interface CardState {
  card: Flashcard;
  status: CardStatus;
  gotItCount: number;
  stillLearningCount: number;
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────
function cacheKey(sessionId: string | undefined) {
  return `sb_fc_${sessionId ?? 'unknown'}`;
}
function readCache(key: string): FlashcardDeck | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function writeCache(key: string, deck: FlashcardDeck) {
  try { localStorage.setItem(key, JSON.stringify(deck)); } catch { /* quota */ }
}

// ── Shimmer / loading ────────────────────────────────────────────────────────
function Shimmer({ w, h, r = 8 }: { w: string | number; h: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-card) 50%,var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function LoadingScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '40px 24px' }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <img src="/sb-take-quiz.png" alt="StudyBearer" style={{ width: 80, height: 80, objectFit: 'contain', opacity: 0.85 }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Generating flashcards…
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI is building your deck</div>
      </div>
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[80, 60, 72, 55].map((w, i) => <Shimmer key={i} w={`${w}%`} h={12} />)}
      </div>
    </div>
  );
}

// ── Intro screen ─────────────────────────────────────────────────────────────
function IntroScreen({ title, count, onStart }: { title: string; count: number; onStart: () => void }) {
  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '40px 32px', maxWidth: 520, margin: '0 auto', width: '100%' }}>
      <img src="/sb-take-quiz.png" alt="StudyBearer" style={{ width: 100, height: 100, objectFit: 'contain' }} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Flashcard Practice
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{title}</strong>
          <br />{count} cards · Click to flip · Track your mastery
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Badge color="green"  sm><Ic n="check"   size={11} color="#4ADE80" /> Got it → mastered</Badge>
        <Badge color="amber"  sm><Ic n="refresh" size={11} color="#F0A030" /> Still learning → review again</Badge>
      </div>
      <Btn v="primary" size="lg" onClick={onStart} sx={{ width: '100%', maxWidth: 280, justifyContent: 'center' }}>
        <Ic n="play" size={16} color="#fff" /> Start Deck
      </Btn>
    </div>
  );
}

// ── Flip card ─────────────────────────────────────────────────────────────────
function FlipCard({ card, flipped, onFlip }: { card: Flashcard; flipped: boolean; onFlip: () => void }) {
  return (
    <>
      <style>{`
        .fc-scene { perspective: 1200px; width: 100%; max-width: 560px; height: 280px; cursor: pointer; }
        .fc-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.48s cubic-bezier(0.4,0.2,0.2,1); }
        .fc-inner.flipped { transform: rotateY(180deg); }
        .fc-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px 32px; text-align: center; user-select: none; }
        .fc-front { background: var(--bg-card); border: 1.5px solid var(--border); }
        .fc-back  { background: linear-gradient(135deg,rgba(123,92,245,0.14) 0%,rgba(96,165,250,0.10) 100%); border: 1.5px solid rgba(123,92,245,0.32); transform: rotateY(180deg); }
        .fc-scene:hover .fc-inner:not(.flipped) { transform: rotateY(8deg); }
      `}</style>

      <div className="fc-scene" onClick={onFlip}>
        <div className={`fc-inner${flipped ? ' flipped' : ''}`}>
          {/* Front */}
          <div className="fc-face fc-front">
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
              Term / Question
            </div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, letterSpacing: '-0.01em', margin: 0 }}>
              {card.front}
            </p>
            {card.hint && !flipped && (
              <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Hint: {card.hint}
              </div>
            )}
            <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>Click to reveal →</div>
          </div>

          {/* Back */}
          <div className="fc-face fc-back">
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#9D82FF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
              Answer
            </div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>
              {card.back}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────
function ResultsScreen({
  states, title, onRetryLearning, onRetryAll, onBack,
}: {
  states: CardState[];
  title: string;
  onRetryLearning: () => void;
  onRetryAll: () => void;
  onBack: () => void;
}) {
  const mastered = states.filter(s => s.status === 'mastered').length;
  const learning = states.filter(s => s.status === 'learning' || s.status === 'new').length;
  const pct      = Math.round((mastered / states.length) * 100);
  const allDone  = learning === 0;

  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '40px 32px', maxWidth: 520, margin: '0 auto', width: '100%' }}>
      <img
        src={allDone ? '/sb-success.png' : '/sb-take-quiz.png'}
        alt="StudyBearer"
        style={{ width: 100, height: 100, objectFit: 'contain' }}
      />

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 8px' }}>
          {allDone ? 'Deck Complete! 🎉' : 'Round Complete'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {allDone
            ? `You mastered all ${states.length} cards in "${title}".`
            : `${mastered} mastered · ${learning} still need review`}
        </p>
      </div>

      {/* Stats */}
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Mastery</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: pct >= 80 ? '#4ADE80' : '#F0A030', fontWeight: 600 }}>{pct}%</span>
        </div>
        <Bar val={pct} color={pct >= 80 ? '#4ADE80' : '#F0A030'} h={8} />
      </div>

      {/* Card breakdown */}
      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {states.map(s => (
          <div key={s.card.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 13px', borderRadius: 10,
            background: s.status === 'mastered' ? 'rgba(74,222,128,0.07)' : 'rgba(240,160,48,0.07)',
            border: `1px solid ${s.status === 'mastered' ? 'rgba(74,222,128,0.22)' : 'rgba(240,160,48,0.22)'}`,
          }}>
            <Ic
              n={s.status === 'mastered' ? 'check' : 'refresh'}
              size={14}
              color={s.status === 'mastered' ? '#4ADE80' : '#F0A030'}
            />
            <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.card.front}
            </span>
            <Badge color={s.status === 'mastered' ? 'green' : 'amber'} sm>
              {s.status === 'mastered' ? 'Mastered' : 'Review'}
            </Badge>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 340 }}>
        {!allDone && (
          <Btn v="primary" size="md" onClick={onRetryLearning} sx={{ width: '100%', justifyContent: 'center' }}>
            <Ic n="refresh" size={14} color="#fff" /> Review {learning} remaining cards
          </Btn>
        )}
        <Btn v="ghost" size="md" onClick={onRetryAll} sx={{ width: '100%', justifyContent: 'center' }}>
          <Ic n="cards" size={14} /> Restart full deck
        </Btn>
        <Btn v="ghost" size="md" onClick={onBack} sx={{ width: '100%', justifyContent: 'center' }}>
          <Ic n="left" size={14} /> Back to Session
        </Btn>
      </div>
    </div>
  );
}

// ── Main FlashcardView ────────────────────────────────────────────────────────

type Phase = 'loading' | 'error' | 'intro' | 'review' | 'results';

export default function FlashcardView({ sessionId }: { sessionId?: string }) {
  const [phase,      setPhase]      = useState<Phase>('loading');
  const [error,      setError]      = useState<string | null>(null);
  const [deck,       setDeck]       = useState<FlashcardDeck | null>(null);
  const [sessionTitle, setTitle]    = useState('');
  const [cardStates, setCardStates] = useState<CardState[]>([]);

  // Review state
  const [queue,      setQueue]      = useState<CardState[]>([]);
  const [current,   setCurrent]     = useState<CardState | null>(null);
  const [flipped,   setFlipped]     = useState(false);
  const [deckIdx,   setDeckIdx]     = useState(0); // total cards shown so far

  // ── Load session context + deck ───────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) { setError('No session ID provided. Go back and open a session first.'); setPhase('error'); return; }

    // 1. Fetch session context
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then(async (ctx: { error?: string; allSessions?: Array<{ id: string; title: string; summary?: string; learningObjectives?: string[]; subtopics?: string[] }> }) => {
        if (ctx.error) throw new Error(ctx.error);

        const sess = ctx.allSessions?.find(s => s.id === sessionId) ?? ctx.allSessions?.[0];
        if (!sess) throw new Error('Session not found.');
        setTitle(sess.title);

        // 2. Check localStorage cache
        const key = cacheKey(sessionId);
        const cached = readCache(key);
        if (cached) { setDeck(cached); setPhase('intro'); return; }

        // 3. Generate via API
        const res = await fetch('/api/sessions/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            title:               sess.title,
            summary:             sess.summary,
            learningObjectives:  sess.learningObjectives,
            subtopics:           sess.subtopics,
          }),
        });

        const data = await res.json() as { deck?: FlashcardDeck; error?: string };
        if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed.');

        writeCache(key, data.deck!);
        setDeck(data.deck!);
        setPhase('intro');
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
        setPhase('error');
      });
  }, [sessionId]);

  // ── Build initial card states ─────────────────────────────────────────────
  const buildStates = useCallback((cards: Flashcard[]): CardState[] =>
    cards.map(card => ({ card, status: 'new' as CardStatus, gotItCount: 0, stillLearningCount: 0 }))
  , []);

  // ── Start / restart ───────────────────────────────────────────────────────
  function startDeck(onlyLearning = false) {
    if (!deck) return;
    const states = cardStates.length > 0 && onlyLearning
      ? cardStates
      : buildStates(deck.cards);

    const source = onlyLearning
      ? states.filter(s => s.status !== 'mastered')
      : states;

    setCardStates(states);
    setQueue([...source]);
    setCurrent(source[0] ?? null);
    setDeckIdx(0);
    setFlipped(false);
    setPhase('review');
  }

  function handleFlip() {
    setFlipped(f => !f);
  }

  function handleAnswer(gotIt: boolean) {
    if (!current) return;

    // Update this card's state
    const updated: CardState = {
      ...current,
      gotItCount:        current.gotItCount        + (gotIt ? 1 : 0),
      stillLearningCount: current.stillLearningCount + (gotIt ? 0 : 1),
      status: gotIt ? 'mastered' : 'learning',
    };

    // Update master states list
    setCardStates(prev =>
      prev.map(s => s.card.id === updated.card.id ? updated : s)
    );

    // Build next queue: remaining cards + add back if still learning
    const remaining = queue.slice(1);
    const nextQueue = gotIt ? remaining : [...remaining, updated];

    if (nextQueue.length === 0) {
      // Round done — go to results
      const finalStates = cardStates.map(s => s.card.id === updated.card.id ? updated : s);
      setCardStates(finalStates);
      setPhase('results');
      return;
    }

    setQueue(nextQueue);
    setCurrent(nextQueue[0]);
    setDeckIdx(i => i + 1);
    setFlipped(false);
  }

  // ── Total "done this round" = cards no longer in queue (incl. current being answered)
  const totalInRound  = (deck?.cards.length ?? 0);
  const masteredCount = cardStates.filter(s => s.status === 'mastered').length;
  const pctMastered   = totalInRound > 0 ? Math.round((masteredCount / totalInRound) * 100) : 0;
  const queueRemaining = queue.length; // includes current

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="content-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <LoadingScreen />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="content-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, textAlign: 'center' }}>
        <Ic n="x" size={28} color="var(--red)" />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320 }}>{error}</p>
        <Btn v="ghost" size="sm" onClick={() => history.back()}>
          <Ic n="left" size={13} /> Go Back
        </Btn>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="content-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <IntroScreen
          title={sessionTitle}
          count={deck?.cards.length ?? 0}
          onStart={() => startDeck(false)}
        />
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="content-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ResultsScreen
          states={cardStates}
          title={sessionTitle}
          onRetryLearning={() => startDeck(true)}
          onRetryAll={() => startDeck(false)}
          onBack={() => sessionId ? window.location.href = `/platform/session?sessionId=${sessionId}` : history.back()}
        />
      </div>
    );
  }

  // ── Review phase ──────────────────────────────────────────────────────────
  return (
    <div className="content-scroll fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 24px', gap: 20 }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Btn v="ghost" size="sm" onClick={() => setPhase('intro')}>
          <Ic n="left" size={13} /> Deck
        </Btn>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {queueRemaining} left · {masteredCount} mastered
            </span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: pctMastered >= 80 ? '#4ADE80' : '#F0A030', fontWeight: 600 }}>
              {pctMastered}%
            </span>
          </div>
          <Bar val={pctMastered} color={pctMastered >= 80 ? '#4ADE80' : '#7B5CF5'} h={5} />
        </div>
      </div>

      {/* Mastery badge row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Badge color="green" sm>
          <Ic n="check" size={11} color="#4ADE80" /> {masteredCount} mastered
        </Badge>
        <Badge color="amber" sm>
          <Ic n="refresh" size={11} color="#F0A030" /> {queueRemaining - 1} in queue
        </Badge>
      </div>

      {/* Flip card */}
      {current && (
        <FlipCard
          key={current.card.id + '-' + deckIdx}
          card={current.card}
          flipped={flipped}
          onFlip={handleFlip}
        />
      )}

      {/* Action buttons — only show after flip */}
      <div style={{
        width: '100%', maxWidth: 560,
        opacity: flipped ? 1 : 0,
        pointerEvents: flipped ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        display: 'flex', gap: 12,
      }}>
        <button
          onClick={() => handleAnswer(false)}
          style={{
            flex: 1, padding: '13px 0',
            background: 'rgba(240,160,48,0.1)', border: '1.5px solid rgba(240,160,48,0.35)',
            borderRadius: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: '#F0A030', fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(240,160,48,0.18)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(240,160,48,0.1)'}
        >
          <Ic n="refresh" size={16} color="#F0A030" /> Still Learning
        </button>

        <button
          onClick={() => handleAnswer(true)}
          style={{
            flex: 1, padding: '13px 0',
            background: 'rgba(74,222,128,0.1)', border: '1.5px solid rgba(74,222,128,0.35)',
            borderRadius: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: '#4ADE80', fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(74,222,128,0.18)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(74,222,128,0.1)'}
        >
          <Ic n="check" size={16} color="#4ADE80" /> Got It
        </button>
      </div>

      {/* Tap hint — visible before flip */}
      {!flipped && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          Tap the card to reveal the answer
        </p>
      )}
    </div>
  );
}
