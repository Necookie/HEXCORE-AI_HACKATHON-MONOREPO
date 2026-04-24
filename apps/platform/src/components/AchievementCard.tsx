import React, { useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { Lock, Trophy, Sword, Flame } from 'lucide-react';

interface AchievementCardProps {
  title: string;
  description: string;
  isLocked?: boolean;
  glowType?: 'golden' | 'neon';
  icon?: 'sword' | 'flame' | 'trophy';
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  title, 
  description, 
  isLocked = false, 
  glowType = 'neon',
  icon = 'trophy'
}) => {
  const [hovered, setHovered] = useState(false);

  const springProps = useSpring({
    transform: hovered ? 'scale(1.05) translateY(-10px)' : 'scale(1) translateY(0px)',
    boxShadow: hovered 
      ? (glowType === 'golden' 
          ? '0 20px 40px rgba(212, 175, 55, 0.3)' 
          : '0 20px 40px rgba(99, 102, 241, 0.3)')
      : '0 5px 15px rgba(0,0,0,0.3)',
    config: config.wobbly
  });

  const IconComponent = () => {
    switch (icon) {
      case 'sword': return <Sword className="w-8 h-8" />;
      case 'flame': return <Flame className="w-8 h-8" />;
      default: return <Trophy className="w-8 h-8" />;
    }
  };

  return (
    <animated.div 
      style={springProps}
      onMouseEnter={() => !isLocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden group ${
        isLocked 
          ? 'bg-black/40 border-white/5 grayscale blur-[2px]' 
          : (glowType === 'golden' 
              ? 'bg-[#1a1608] border-[#d4af37]/30' 
              : 'bg-[#0a0a0c] border-[#6366f1]/30')
      }`}
    >
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full blur-3xl bg-white/20"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div className={`p-4 rounded-full ${
          isLocked 
            ? 'bg-white/5 text-white/20' 
            : (glowType === 'golden' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-[#6366f1]/20 text-[#6366f1]')
        } shadow-inner`}>
          {isLocked ? <Lock className="w-8 h-8" /> : <IconComponent />}
        </div>

        <div>
          <h3 className={`text-xl font-black uppercase tracking-tighter ${
            isLocked ? 'text-white/30' : 'text-white'
          }`}>
            {title}
          </h3>
          <p className={`text-sm mt-2 font-medium leading-relaxed ${
            isLocked ? 'text-white/20' : 'text-muted-steel'
          }`}>
            {description}
          </p>
        </div>

        {!isLocked && (
          <div className={`mt-4 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
            glowType === 'golden' 
              ? 'border-[#d4af37]/50 text-[#d4af37] bg-[#d4af37]/5' 
              : 'border-[#6366f1]/50 text-[#6366f1] bg-[#6366f1]/5'
          }`}>
            Unlocked
          </div>
        )}
      </div>

      {/* Decorative border glow */}
      {!isLocked && (
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          glowType === 'golden' 
            ? 'shadow-[inset_0_0_20px_rgba(212,175,55,0.2)]' 
            : 'shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]'
        }`}></div>
      )}
    </animated.div>
  );
};

export default AchievementCard;
