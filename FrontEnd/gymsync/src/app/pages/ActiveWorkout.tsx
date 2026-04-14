import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Minus, Plus, VolumeX, Volume2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const FALLBACK_PLAN = [
  { id: 1, name: 'Barbell Bench Press', muscle: 'Chest', sets: 4 },
  { id: 2, name: 'Overhead Press', muscle: 'Shoulders', sets: 3 },
];

export function ActiveWorkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Use the ordered exercises passed from Home, mapped to workout plan shape
  const WORKOUT_PLAN = (location.state?.exercises ?? FALLBACK_PLAN).map((ex: any) => ({
    id: ex.id,
    name: ex.name,
    muscle: ex.muscle,
    sets: ex.sets ?? 3,
  }));
  
  // Workout State
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(10);
  const [rir, setRir] = useState(2);
  const [formQuality, setFormQuality] = useState<'Poor' | 'Good' | 'Excellent'>('Good');
  
  // Timer State
  const [mode, setMode] = useState<'workout' | 'rest'>('workout'); // workout or rest
  const [time, setTime] = useState(0); // overall or rest time
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCheck, setShowCheck] = useState(false);

  const currentExercise = WORKOUT_PLAN[exerciseIdx];
  const isLastExercise = exerciseIdx === WORKOUT_PLAN.length - 1;
  const isLastSet = currentSet === currentExercise.sets;
  const isFinished = isLastExercise && isLastSet;

  const REST_DURATION = 60; // 60s rest

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (mode === 'rest') {
          if (prev <= 1) {
            handleRestComplete();
            return 0;
          }
          return prev - 1;
        }
        return prev + 1; // workout mode counts up
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const handleRestComplete = () => {
    // Rest complete logic
    setMode('workout');
    setTime(0); // Reset timer for the next set or keep overall time
    // Optionally play sound here
  };

  const handleLogSet = () => {
    // Haptic feedback simulation & check animation
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 1000);

    if (isFinished) {
      setTimeout(() => navigate('/complete'), 1000);
      return;
    }

    // Go to rest mode
    setMode('rest');
    setTime(REST_DURATION);
    
    // Advance logic
    setTimeout(() => {
      if (isLastSet) {
        setExerciseIdx((prev) => prev + 1);
        setCurrentSet(1);
      } else {
        setCurrentSet((prev) => prev + 1);
      }
    }, 1000); // Advance after check animation
  };

  const skipRest = () => {
    setMode('workout');
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressCircle = mode === 'rest' ? (time / REST_DURATION) * 100 : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressCircle / 100) * circumference;

  return (
    <div className="flex-1 w-full flex flex-col bg-[#0F0F12] relative overflow-hidden text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6 z-10">
        <button onClick={() => navigate('/')} className="text-[#8B8CA8] hover:text-white transition-colors p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <div className="text-sm font-semibold tracking-widest uppercase text-[#8B8CA8]">
          {mode === 'rest' ? 'Resting' : 'Active'}
        </div>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-[#8B8CA8] hover:text-white transition-colors p-2 -mr-2">
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </header>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center pt-4 px-6 z-10">
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          {/* Background Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke={mode === 'rest' ? '#2A1810' : '#1A1A24'}
              strokeWidth="12"
              fill="none"
            />
            {mode === 'rest' && (
              <motion.circle
                cx="96"
                cy="96"
                r={radius}
                stroke="#F97316"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'linear' }}
                style={{ strokeDasharray: circumference }}
              />
            )}
          </svg>

          {/* Time Text */}
          <div className="relative z-10 text-center">
            <motion.h2 
              key={mode + formatTime(time)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={clsx(
                "text-5xl font-mono font-bold tracking-tighter",
                mode === 'rest' ? 'text-[#F97316]' : 'text-white'
              )}
            >
              {formatTime(time)}
            </motion.h2>
          </div>
        </div>

        {/* Exercise Info */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentExercise.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">{currentExercise.name}</h1>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-[#8B8CA8] uppercase tracking-wider">{currentExercise.muscle}</span>
              <span className="w-1 h-1 bg-[#2A2A35] rounded-full" />
              <span className="text-[#6366F1] font-bold uppercase tracking-wider">
                Set {currentSet} of {currentExercise.sets}
              </span>
            </div>
            
            {/* Set Dots */}
            <div className="flex gap-2 justify-center mt-4">
              {Array.from({ length: currentExercise.sets }).map((_, i) => (
                <div 
                  key={i} 
                  className={clsx(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    i < currentSet - 1 ? "bg-[#10B981]" : 
                    i === currentSet - 1 ? "bg-[#6366F1]" : "bg-[#2A2A35]"
                  )} 
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Inputs */}
        {mode === 'workout' ? (
          <div className="w-full flex flex-col gap-4 mt-auto mb-8">
            <div className="flex gap-4 w-full">
              {/* Weight Input */}
              <div className="flex-1 bg-[#181820] rounded-2xl p-4 flex flex-col items-center border border-[#2A2A35]">
                <span className="text-[#8B8CA8] text-xs font-bold uppercase tracking-widest mb-3">Weight (kg)</span>
                <div className="flex items-center justify-between w-full">
                  <button 
                    onClick={() => setWeight(w => Math.max(0, w - 2.5))}
                    className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center text-white active:scale-90 transition-transform"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-3xl font-bold">{weight}</span>
                  <button 
                    onClick={() => setWeight(w => w + 2.5)}
                    className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center text-white active:scale-90 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Reps Input */}
              <div className="flex-1 bg-[#181820] rounded-2xl p-4 flex flex-col items-center border border-[#2A2A35]">
                <span className="text-[#8B8CA8] text-xs font-bold uppercase tracking-widest mb-3">Reps</span>
                <div className="flex items-center justify-between w-full">
                  <button 
                    onClick={() => setReps(r => Math.max(0, r - 1))}
                    className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center text-white active:scale-90 transition-transform"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-3xl font-bold">{reps}</span>
                  <button 
                    onClick={() => setReps(r => r + 1)}
                    className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center text-white active:scale-90 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIR & Form */}
            <div className="flex gap-4 w-full">
              {/* RIR Input */}
              <div className="flex-[0.4] bg-[#181820] rounded-2xl p-3 flex flex-col items-center border border-[#2A2A35]">
                <span className="text-[#8B8CA8] text-[10px] font-bold uppercase tracking-widest mb-2">RIR</span>
                <div className="flex items-center justify-between w-full gap-2">
                  <button onClick={() => setRir(r => Math.max(0, r - 1))} className="w-8 h-8 rounded-full bg-[#2A2A35] flex items-center justify-center">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold">{rir}</span>
                  <button onClick={() => setRir(r => r + 1)} className="w-8 h-8 rounded-full bg-[#2A2A35] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Form Quality */}
              <div className="flex-[0.6] bg-[#181820] rounded-2xl p-3 flex flex-col items-center border border-[#2A2A35]">
                <span className="text-[#8B8CA8] text-[10px] font-bold uppercase tracking-widest mb-2">Form Quality</span>
                <div className="flex items-center justify-between w-full h-8 bg-[#0B0B0F] rounded-lg p-0.5">
                  {['Poor', 'Good', 'Excellent'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFormQuality(f as any)}
                      className={`flex-1 h-full text-[10px] font-bold rounded-md transition-colors ${formQuality === f ? 'bg-[#5C5CFF] text-white' : 'text-[#8B8CA8]'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full mt-auto mb-8 flex flex-col items-center text-center px-4">
            <p className="text-[#8B8CA8] text-lg mb-6 max-w-[250px]">
              Take a breather. Getting ready for Set {currentSet} of {currentExercise.name}.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={skipRest}
              className="px-8 py-3 bg-[#2A2A35] text-white rounded-full font-semibold text-sm tracking-wide border border-[#3A3A45] shadow-sm"
            >
              SKIP REST
            </motion.button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8 space-y-3 z-10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogSet}
          disabled={mode === 'rest'}
          className={clsx(
            "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg transition-all relative overflow-hidden shadow-[0_4px_20px_rgba(16,185,129,0.2)]",
            mode === 'rest' ? 'bg-[#2A2A35] text-[#8B8CA8] opacity-50 cursor-not-allowed' : 'bg-[#10B981] text-white hover:bg-[#0EA5E9]'
          )}
          style={{ backgroundColor: mode !== 'rest' ? '#10B981' : undefined }}
        >
          {showCheck ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" /> Logged!
            </motion.div>
          ) : (
             isFinished ? 'FINISH WORKOUT' : 'LOG SET'
          )}
        </motion.button>
        
        {mode === 'workout' && (
          <button 
            onClick={() => navigate('/complete')}
            className="w-full py-4 rounded-2xl font-bold text-[#8B8CA8] bg-transparent hover:bg-[#1A1A24] transition-colors"
          >
            END WORKOUT EARLY
          </button>
        )}
      </div>
      
      {/* Rest Mode Background glow */}
      {mode === 'rest' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute inset-0 bg-[#F97316] pointer-events-none blur-[100px]"
        />
      )}
    </div>
  );
}
