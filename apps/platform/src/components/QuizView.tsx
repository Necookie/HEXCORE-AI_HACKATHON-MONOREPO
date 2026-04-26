import { useState } from 'react';
import { Ic, Badge, Bar, Btn } from './ui';

const QUESTIONS = [
  {
    type: 'MCQ',
    q: 'What is the average time complexity of searching in a Hash Table?',
    opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    ans: 2,
    explain: 'Hash tables achieve O(1) average-case lookup via direct index computation.',
  },
  {
    type: 'MCQ',
    q: 'Which traversal visits nodes in Left → Root → Right order?',
    opts: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
    ans: 1,
    explain: 'In-order traversal (L → Root → R) produces sorted output for a BST.',
  },
  {
    type: 'MCQ',
    q: 'What is the worst-case time complexity of QuickSort?',
    opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
    ans: 2,
    explain: 'QuickSort degrades to O(n²) when the pivot is always the smallest or largest element.',
  },
];

export default function QuizView() {
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[qi];
  const correct = sel === q.ans;

  const check = () => {
    setConfirmed(true);
    if (correct) { setScore(s => s + 1); setCombo(c => c + 1); }
    else setCombo(0);
  };

  const next = () => {
    if (qi < QUESTIONS.length - 1) { setQi(i => i + 1); setSel(null); setConfirmed(false); }
    else setDone(true);
  };

  const retry = () => { setQi(0); setSel(null); setConfirmed(false); setScore(0); setCombo(0); setDone(false); };

  // ── Results screen ──
  if (done) {
    const perfect = score === QUESTIONS.length;
    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: 40 }}>
        <div className="float-anim" style={{ display: 'flex', justifyContent: 'center' }}>
          {perfect  ? <Ic n="trophy" size={56} color="#F0A030" /> :
           score >= 2 ? <Ic n="star"   size={56} color="#9D82FF" /> :
                        <Ic n="book"   size={52} color="#60A5FA" />}
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', textAlign: 'center', color: 'var(--text-primary)' }}>
          {perfect ? 'Flawless Victory!' : score >= 2 ? 'Great Job!' : 'Keep Grinding!'}
        </h2>
        <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700, color: '#4ADE80', lineHeight: 1 }}>{score}/{QUESTIONS.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>Score</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700, color: '#F0A030', lineHeight: 1 }}>+{score * 45}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>ELO Gained</div>
          </div>
        </div>
        {perfect && (
          <Badge color="amber"><Ic n="trophy" size={12} color="#F0A030" /> Flawless Victory — Achievement Unlocked!</Badge>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn v="ghost" onClick={retry}>Retry Quiz</Btn>
          <Btn v="primary" size="lg" onClick={() => window.location.href = '/platform/achievements'}>
            <Ic n="trophy" size={16} color="#fff" /> Achievements
          </Btn>
        </div>
      </div>
    );
  }

  // ── Quiz screen ──
  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 600, margin: '0 auto', padding: '22px 32px', width: '100%' }}>

      {/* Progress bar + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <Bar val={(qi / QUESTIONS.length) * 100} color="#7B5CF5" h={8} />
        </div>
        <Badge color="amber" sm><Ic n="flame" size={10} color="#F0A030" /> {combo}</Badge>
        <Badge color="red" sm><Ic n="heart" size={10} color="#F56B6B" /> 5</Badge>
      </div>

      <div key={qi} className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Question header */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
          <Badge color="purple" sm>{q.type}</Badge>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{qi + 1} / {QUESTIONS.length}</span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 18, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
          {q.q}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {q.opts.map((opt, i) => {
            let bg     = 'var(--bg-elevated)';
            let border = 'var(--border)';
            let color  = 'var(--text-primary)';
            let iconBg = 'var(--bg-input)';

            if (!confirmed && sel === i) { bg = 'rgba(123,92,245,0.12)'; border = 'rgba(123,92,245,0.5)'; }
            if (confirmed && i === q.ans) { bg = 'rgba(74,222,128,0.12)'; border = 'rgba(74,222,128,0.5)'; color = '#4ADE80'; iconBg = 'rgba(74,222,128,0.2)'; }
            if (confirmed && sel === i && i !== q.ans) { bg = 'rgba(245,107,107,0.12)'; border = 'rgba(245,107,107,0.5)'; color = '#F56B6B'; iconBg = 'rgba(245,107,107,0.2)'; }

            return (
              <button key={i} disabled={confirmed} onClick={() => setSel(i)}
                className={confirmed ? '' : 'option-btn option-3d'}
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
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
                  {confirmed && i === q.ans ? <Ic n="check" size={13} color="#4ADE80" /> :
                   confirmed && sel === i   ? <Ic n="x"     size={13} color="#F56B6B" /> :
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
            background: correct ? 'rgba(74,222,128,0.10)' : 'rgba(245,107,107,0.10)',
            border: `1px solid ${correct ? 'rgba(74,222,128,0.32)' : 'rgba(245,107,107,0.32)'}`,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ flexShrink: 0 }}>
              {correct ? <Ic n="check" size={16} color="#4ADE80" /> : <Ic n="x" size={16} color="#F56B6B" />}
            </span>
            <div>
              <div style={{ fontWeight: 600, color: correct ? '#4ADE80' : '#F56B6B', fontFamily: 'var(--font-heading)', fontSize: 14, marginBottom: 3 }}>
                {correct ? `Nice! +${45 + combo * 15} ELO` : `Correct: ${q.opts[q.ans]}`}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{q.explain}</div>
            </div>
          </div>
        )}

        {/* Action button */}
        <div style={{ marginTop: 18 }}>
          {!confirmed
            ? <Btn v="primary" size="lg" disabled={sel === null} onClick={check} sx={{ width: '100%', justifyContent: 'center' }}>Check Answer</Btn>
            : <Btn v="success" size="lg" onClick={next} sx={{ width: '100%', justifyContent: 'center' }}>
                {qi < QUESTIONS.length - 1 ? 'Next Question' : 'See Results'} <Ic n="right" size={16} color="#061a0a" />
              </Btn>
          }
        </div>
      </div>
    </div>
  );
}
