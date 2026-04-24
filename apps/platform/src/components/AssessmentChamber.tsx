import React, { useState, useEffect } from 'react';
import { ArrowRight, Terminal } from 'lucide-react';

type QuestionType = 'multiple_choice' | 'identification' | 'enumeration';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  answer?: string; // For MC and identification
  answers?: string[]; // For enumeration
}

const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the primary mechanism that allows Transformer models to weigh the importance of different words in a sequence?',
    options: ['Recurrent Feedback', 'Self-Attention', 'Convolutional Pooling', 'Gradient Descent'],
    answer: 'Self-Attention'
  },
  {
    id: 'q2',
    type: 'identification',
    question: 'Name the algorithmic paradigm that solves problems by combining the solutions to overlapping subproblems.',
    answer: 'Dynamic Programming'
  },
  {
    id: 'q3',
    type: 'enumeration',
    question: 'List the three primary color channels in the standard digital display model.',
    answers: ['Red', 'Green', 'Blue']
  }
];

const AssessmentChamber: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | string[]>('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isFinished, setIsFinished] = useState(false);

  // Clear answer when question changes
  useEffect(() => {
    const currentQ = mockQuestions[currentIndex];
    if (currentQ?.type === 'enumeration') {
      setUserAnswer(new Array(currentQ.answers?.length || 3).fill(''));
    } else {
      setUserAnswer('');
    }
  }, [currentIndex]);

  const currentQ = mockQuestions[currentIndex];

  const handleMCSelect = (option: string) => {
    setUserAnswer(option);
  };

  const handleEnumChange = (index: number, value: string) => {
    setUserAnswer(prev => {
      const newAnswers = [...(prev as string[])];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const handleSubmit = () => {
    if (feedback !== 'idle') return;

    let isCorrect = false;

    if (currentQ.type === 'multiple_choice' || currentQ.type === 'identification') {
      // Basic string matching, case insensitive for identification
      const target = currentQ.answer?.trim().toLowerCase() || '';
      const provided = (userAnswer as string).trim().toLowerCase();
      isCorrect = target === provided;
    } else if (currentQ.type === 'enumeration') {
      // Check if all provided answers match the target answers (order agnostic for this simple demo)
      const targets = currentQ.answers?.map(a => a.toLowerCase().trim()) || [];
      const provided = (userAnswer as string[]).map(a => a.toLowerCase().trim());
      
      const correctCount = provided.filter(p => targets.includes(p)).length;
      isCorrect = correctCount === targets.length;
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setFeedback('idle');
      if (currentIndex < mockQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1200); // Wait for the flash animation to finish
  };

  const handleFinalize = () => {
    const sessionData = {
      timestamp: new Date().toISOString(),
      score: score,
      totalQuestions: mockQuestions.length,
      accuracy: (score / mockQuestions.length) * 100
    };
    console.log('[SYSTEM LOG] Session Finalized:', sessionData);
    alert(`Session logged to console. Score: ${score}/${mockQuestions.length}`);
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto py-20 animate-fade-in">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 text-gradient">Assessment Complete</h1>
        <p className="text-xl text-muted-steel mb-12 font-mono">Cognitive synchronization achieved.</p>
        
        <div className="flex items-center gap-12 mb-16">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-steel uppercase tracking-[0.3em] mb-2">Final Score</span>
            <span className="text-7xl font-black text-white">{score}<span className="text-2xl text-muted-steel">/{mockQuestions.length}</span></span>
          </div>
          <div className="h-20 w-[1px] bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-steel uppercase tracking-[0.3em] mb-2">Accuracy</span>
            <span className="text-7xl font-black text-neon-indigo">{Math.round((score / mockQuestions.length) * 100)}<span className="text-2xl">%</span></span>
          </div>
        </div>

        <button 
          onClick={handleFinalize}
          className="group relative px-8 py-4 bg-transparent border border-white/20 text-white font-mono text-sm tracking-widest uppercase hover:border-primary hover:text-primary transition-all duration-300"
        >
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
          <span className="relative z-10 flex items-center gap-3">
            <Terminal size={16} /> Finalize Session
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[600px] flex flex-col justify-center max-w-4xl mx-auto w-full px-4">
      {/* Cinematic Feedback Flash */}
      <div className={`fixed inset-0 pointer-events-none transition-all duration-700 mix-blend-screen z-0 ${
        feedback === 'correct' ? 'bg-green-500/10' : 
        feedback === 'incorrect' ? 'bg-red-500/15' : 'bg-transparent'
      }`}></div>

      {/* Progress */}
      <div className="absolute top-0 left-0 w-full flex items-center gap-4 z-10 opacity-50">
        <span className="text-[10px] font-mono text-muted-steel tracking-[0.2em]">SEQ: 0{currentIndex + 1}/0{mockQuestions.length}</span>
        <div className="h-[1px] flex-1 bg-white/10">
          <div 
            className="h-full bg-primary shadow-neon transition-all duration-500"
            style={{ width: `${((currentIndex) / mockQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className={`relative z-10 transition-all duration-500 ${feedback !== 'idle' ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        {/* Question Text */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1] mb-16">
          {currentQ.question}
        </h2>

        {/* Input Area */}
        <div className="min-h-[200px]">
          
          {/* Multiple Choice */}
          {currentQ.type === 'multiple_choice' && (
            <div className="flex flex-col gap-4">
              {currentQ.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMCSelect(option)}
                  className={`text-left text-2xl md:text-3xl font-medium tracking-tight py-2 transition-all duration-300 group ${
                    userAnswer === option 
                      ? 'text-primary' 
                      : 'text-muted-steel hover:text-white'
                  }`}
                >
                  <span className={`inline-block mr-6 font-mono text-sm align-middle opacity-50 transition-all ${userAnswer === option ? 'text-primary opacity-100' : ''}`}>0{idx + 1}</span>
                  <span className={`relative inline-block ${userAnswer === option ? 'drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''}`}>{option}</span>
                </button>
              ))}
            </div>
          )}

          {/* Identification */}
          {currentQ.type === 'identification' && (
            <div>
              <input
                type="text"
                autoFocus
                value={userAnswer as string}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Awaiting input..."
                className="w-full bg-transparent border-0 border-b border-white/20 text-3xl md:text-5xl font-medium text-white focus:ring-0 focus:border-primary py-4 px-0 transition-colors placeholder:text-white/10"
              />
            </div>
          )}

          {/* Enumeration */}
          {currentQ.type === 'enumeration' && (
            <div className="flex flex-col gap-6">
              {(userAnswer as string[]).map((val, idx) => (
                <div key={idx} className="flex items-center gap-6">
                  <span className="font-mono text-sm text-muted-steel opacity-50">0{idx + 1}</span>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleEnumChange(idx, e.target.value)}
                    className="flex-1 bg-transparent border-0 border-b border-white/20 text-3xl font-medium text-white focus:ring-0 focus:border-primary py-2 px-0 transition-colors"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Area */}
        <div className="mt-16 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!userAnswer || (Array.isArray(userAnswer) && userAnswer.some(a => !a))}
            className="flex items-center gap-4 text-xl font-bold tracking-widest uppercase text-muted-steel hover:text-primary transition-all disabled:opacity-20 disabled:hover:text-muted-steel group"
          >
            Submit <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentChamber;
