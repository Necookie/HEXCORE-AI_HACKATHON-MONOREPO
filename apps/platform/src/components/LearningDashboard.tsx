// LearningDashboard.tsx – REQ-UI-2, REQ-4.1, REQ-5.x
// Two-column layout: Metrics panel (right) + Tab hub (left).

import { useState } from 'react';
import {
  Shield, Swords, Crown, Star, Lock, CheckCircle2, Circle,
  BookOpen, ClipboardList, TrendingUp, Zap, Clock,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
type Rank = 'Warrior' | 'Knight' | 'Champion' | 'Master' | 'Grandmaster' | 'Mythic';
type NodeStatus = 'completed' | 'active' | 'locked';

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: NodeStatus;
  estimatedMinutes: number;
}

interface DashboardData {
  playerName: string;
  combo: number;
  maxCombo: number;
  elo: number;
  maxElo: number;
  rank: Rank;
  roadmap: RoadmapNode[];
  studyWindowStart: string; // "20:00"
  studyWindowEnd: string;   // "22:00"
}

// ── Mock data – replace with Supabase query ────────────────────────────────
const MOCK: DashboardData = {
  playerName: 'Scholar',
  combo: 4,
  maxCombo: 7,
  elo: 1340,
  maxElo: 1600,
  rank: 'Knight',
  studyWindowStart: '20:00',
  studyWindowEnd: '22:00',
  roadmap: [
    { id: 'node-1', title: 'Introduction & Foundations', description: 'Core concepts and terminology.', status: 'completed', estimatedMinutes: 45 },
    { id: 'node-2', title: 'Core Principles (Active)', description: 'Deep dive into primary frameworks.', status: 'active', estimatedMinutes: 60 },
    { id: 'node-3', title: 'Applied Methods', description: 'Practical application exercises.', status: 'locked', estimatedMinutes: 90 },
    { id: 'node-4', title: 'Advanced Patterns', description: 'Edge cases and optimisation.', status: 'locked', estimatedMinutes: 75 },
    { id: 'node-5', title: 'Final Review & Assessment', description: 'Consolidated exam preparation.', status: 'locked', estimatedMinutes: 120 },
  ],
};

// ── Rank config ────────────────────────────────────────────────────────────
const RANK_META: Record<Rank, { color: string; Icon: typeof Shield }> = {
  Warrior:      { color: 'text-slate-400', Icon: Swords },
  Knight:       { color: 'text-blue-400',  Icon: Shield },
  Champion:     { color: 'text-violet-400', Icon: Star },
  Master:       { color: 'text-amber-400', Icon: TrendingUp },
  Grandmaster:  { color: 'text-orange-400', Icon: Crown },
  Mythic:       { color: 'text-cyan-400',  Icon: Zap },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function isWithinStudyWindow(start: string, end: string): boolean {
  const now = new Date();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  return nowMin >= startMin && nowMin < endMin;
}

function fmt12h(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function RoadmapTab({ nodes }: { nodes: RoadmapNode[] }) {
  return (
    <div className="space-y-3">
      {nodes.map((node, i) => {
        const isLast = i === nodes.length - 1;
        return (
          <div key={node.id} className="flex gap-4">
            {/* Spine */}
            <div className="flex flex-col items-center">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                node.status === 'completed' ? 'bg-cyan-400/20 border-cyan-400' :
                node.status === 'active'    ? 'bg-cyan-400/10 border-cyan-400' :
                                             'bg-slate-900 border-slate-700'
              }`}
              style={node.status === 'active' ? { animation: 'node-active-glow 2s ease-in-out infinite', boxShadow: '0 0 12px rgba(34,211,238,0.5)' } : undefined}>
                {node.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                {node.status === 'active'    && <Circle className="w-4 h-4 text-cyan-400 fill-cyan-400" />}
                {node.status === 'locked'    && <Lock className="w-3.5 h-3.5 text-slate-600" />}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 mt-1 ${
                  node.status === 'completed' ? 'bg-cyan-400/40' : 'bg-slate-800'
                }`} style={{ minHeight: '2rem' }} />
              )}
            </div>
            {/* Content */}
            <div className={`flex-1 pb-4 rounded-xl p-4 border transition-all duration-200 ${
              node.status === 'completed' ? 'border-cyan-400/20 bg-cyan-400/5' :
              node.status === 'active'    ? 'border-cyan-400/40 bg-cyan-400/8' :
                                           'border-slate-800 bg-slate-950/50'
            }`}>
              <p className={`text-sm font-semibold ${
                node.status === 'locked' ? 'text-slate-600' : 'text-slate-100'
              }`}>{node.title}</p>
              <p className={`text-xs mt-0.5 ${node.status === 'locked' ? 'text-slate-700' : 'text-slate-400'}`}>
                {node.description}
              </p>
              <p className={`text-xs mt-1.5 ${node.status === 'locked' ? 'text-slate-700' : 'text-slate-500'}`}>
                ~{node.estimatedMinutes} min
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssessmentTab({ windowStart, windowEnd }: { windowStart: string; windowEnd: string }) {
  const inWindow = isWithinStudyWindow(windowStart, windowEnd);
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
      <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
        inWindow ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-700 bg-slate-900'
      }`}
      style={inWindow ? { animation: 'pulse-glow 2s ease-in-out infinite' } : undefined}>
        <ClipboardList className={`w-9 h-9 ${inWindow ? 'text-cyan-400' : 'text-slate-600'}`} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-100">Daily Assessment</h3>
        {inWindow
          ? <p className="mt-1 text-sm text-slate-400">Your study window is active. Begin your session quiz.</p>
          : <><p className="mt-1 text-sm text-slate-400">Assessment unlocks during your study window.</p>
             <p className="mt-1 text-xs text-slate-500 flex items-center justify-center gap-1">
               <Clock className="w-3.5 h-3.5" />{fmt12h(windowStart)} – {fmt12h(windowEnd)}
             </p></>
        }
      </div>
      <button
        id="begin-quiz-btn"
        disabled={!inWindow}
        className={`px-8 py-3.5 rounded-xl text-base font-semibold tracking-wide transition-all duration-300 ${
          inWindow
            ? 'bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.5)] cursor-pointer'
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        Begin Quiz
      </button>
      {!inWindow && (
        <p className="text-xs text-slate-600">Come back during your scheduled window to unlock the quiz.</p>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function LearningDashboard({ data = MOCK }: { data?: DashboardData }) {
  const [tab, setTab] = useState<'roadmap' | 'assessment'>('roadmap');
  const { color: rankColor, Icon: RankIcon } = RANK_META[data.rank];

  const eloPercent = Math.round((data.elo / data.maxElo) * 100);
  const comboPercent = Math.round((data.combo / data.maxCombo) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Main Hub ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 w-fit">
            <button id="tab-roadmap" onClick={() => setTab('roadmap')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      tab === 'roadmap' ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30' : 'text-slate-500 hover:text-slate-300'
                    }`}>
              <BookOpen className="w-4 h-4" /> Roadmap
            </button>
            <button id="tab-assessment" onClick={() => setTab('assessment')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      tab === 'assessment' ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30' : 'text-slate-500 hover:text-slate-300'
                    }`}>
              <ClipboardList className="w-4 h-4" /> Assessment
            </button>
          </div>

          {/* Tab content */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            {tab === 'roadmap'
              ? <RoadmapTab nodes={data.roadmap} />
              : <AssessmentTab windowStart={data.studyWindowStart} windowEnd={data.studyWindowEnd} />
            }
          </div>
        </div>

        {/* ── RIGHT: Metrics Panel ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Player Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            {/* Rank badge */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Rank</p>
                <p className={`text-xl font-bold mt-0.5 ${rankColor}`}>{data.rank}</p>
              </div>
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${rankColor.replace('text-', 'border-')}`}
                   style={{ background: 'rgba(34,211,238,0.06)' }}>
                <RankIcon className={`w-6 h-6 ${rankColor}`} />
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* REQ-5.1: Consistency Combo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Consistency Combo
                </span>
                <span className="text-slate-300 font-semibold">{data.combo}
                  <span className="text-slate-600">/{data.maxCombo}</span>
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                     style={{ width: `${comboPercent}%`, boxShadow: '0 0 8px rgba(251,191,36,0.6)' }} />
              </div>
              <p className="text-xs text-slate-500">{data.combo} day streak — keep it up!</p>
            </div>

            {/* REQ-5.3: Elo Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Elo Rating
                </span>
                <span className="text-cyan-300 font-semibold">{data.elo}
                  <span className="text-slate-600">/{data.maxElo}</span>
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                     style={{ width: `${eloPercent}%`, boxShadow: '0 0 8px rgba(34,211,238,0.6)' }} />
              </div>
              <p className="text-xs text-slate-500">{data.maxElo - data.elo} Elo to next rank</p>
            </div>
          </div>

          {/* REQ-5.4: Rank Tiers */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Rank Tiers</p>
            <div className="space-y-1.5">
              {(Object.keys(RANK_META) as Rank[]).map(r => {
                const { color, Icon } = RANK_META[r];
                const isCurrent = r === data.rank;
                return (
                  <div key={r} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isCurrent ? 'bg-cyan-400/10 border border-cyan-400/20' : ''
                  }`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className={`text-xs font-medium ${isCurrent ? color : 'text-slate-600'}`}>{r}</span>
                    {isCurrent && <span className="ml-auto text-xs text-cyan-500">← Current</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
