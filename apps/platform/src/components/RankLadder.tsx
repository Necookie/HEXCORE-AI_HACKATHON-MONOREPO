import React from 'react';

const RANKS = [
  { name: 'Warrior', color: '#a1a1aa' },
  { name: 'Knight', color: '#6366f1' },
  { name: 'Elite', color: '#8b5cf6' },
  { name: 'Master', color: '#ec4899' },
  { name: 'Legend', color: '#f59e0b' },
  { name: 'Mythic', color: '#ef4444' }
];

const RankLadder: React.FC = () => {
  const currentRankIndex = 1; // 'Knight'
  const progressToNext = 65; // %

  return (
    <div className="w-full py-12">
      <div className="flex justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-steel">Path of the Bearer</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6366f1]">Current: {RANKS[currentRankIndex].name}</span>
      </div>

      <div className="relative h-12 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-[2px] bg-white/5 top-1/2 -translate-y-1/2"></div>
        
        {/* Progress Fill */}
        <div 
          className="absolute h-[2px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] top-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
          style={{ width: `${(currentRankIndex / (RANKS.length - 1)) * 100 + (progressToNext / (RANKS.length - 1))}%` }}
        ></div>

        {/* Nodes */}
        <div className="relative w-full flex justify-between px-2">
          {RANKS.map((rank, index) => {
            const isActive = index <= currentRankIndex;
            const isTarget = index === currentRankIndex + 1;

            return (
              <div key={rank.name} className="flex flex-col items-center gap-4 group">
                <div 
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-500 relative z-10 ${
                    isActive 
                      ? 'bg-black border-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                      : (isTarget ? 'bg-black border-white/20' : 'bg-black border-white/5')
                  }`}
                >
                  {isActive && <div className="absolute inset-1 bg-[#6366f1] rounded-full animate-pulse"></div>}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                  isActive ? 'text-white' : 'text-white/20'
                }`}>
                  {rank.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="text-center">
          <p className="text-[10px] font-mono text-muted-steel uppercase tracking-tighter mb-2">Cognitive Synchronization: {progressToNext}% to {RANKS[currentRankIndex + 1].name}</p>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-primary shadow-neon transition-all duration-1000" 
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankLadder;
