import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import Confetti from 'react-confetti';
import { Trophy, Timer, Dumbbell, Activity, CheckCircle2, Flame } from 'lucide-react';
import clsx from 'clsx';

export function WorkoutComplete() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [rpe, setRpe] = useState(7);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Volume', value: '4,520 kg', icon: Dumbbell, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' },
    { label: 'Sets Done', value: '18', icon: Activity, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
    { label: 'Time', value: '45m 20s', icon: Timer, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' },
    { label: 'New PRs', value: '2', icon: Trophy, color: 'text-[#EAB308]', bg: 'bg-[#EAB308]/10' },
  ];

  return (
    <div className="flex-1 w-full flex flex-col bg-[#0F0F12] relative overflow-hidden text-white">
      {/* Confetti Container - restricted to mobile wrapper bounds */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {showConfetti && <Confetti width={390} height={844} recycle={false} numberOfPieces={200} gravity={0.15} />}
      </div>

      {/* Header Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative mt-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
          className="w-24 h-24 bg-[#10B981]/20 rounded-full flex items-center justify-center mb-6"
        >
          <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold mb-2 text-center"
        >
          Workout Complete!
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#8B8CA8] text-center max-w-[250px] mb-12"
        >
          Great job! You crushed your Push Day workout. Keep up the momentum.
        </motion.p>

        {/* Stats Grid */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4 w-full max-w-[320px] mb-8"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
              className="bg-[#181820] border border-[#2A2A35] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg"
            >
              <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center mb-3", stat.bg)}>
                <stat.icon className={clsx("w-5 h-5", stat.color)} />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-xs text-[#8B8CA8] font-bold uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Perceived Exertion (RPE) Slider */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="w-full max-w-[320px] bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 mb-4"
        >
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Flame className="w-4 h-4 text-[#F97316]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#8B8CA8]">Workout Exertion (RPE)</h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-white mb-4">{rpe} <span className="text-sm font-normal text-[#8B8CA8]">/ 10</span></div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full accent-[#5C5CFF]"
            />
            <div className="flex justify-between w-full mt-2 text-xs text-[#8B8CA8] font-medium">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Max Effort</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Done Button */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="p-6 z-10 shrink-0"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/')}
          className="w-full bg-[#5C5CFF] hover:bg-[#4F46E5] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg transition-colors shadow-lg"
        >
          FINISH & SAVE
        </motion.button>
      </motion.div>
      
      {/* Background glow for celebration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-t from-[#10B981] to-transparent pointer-events-none blur-3xl"
      />
    </div>
  );
}
