import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Bell, BellOff, Check, Minus, Plus, ChevronLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { clsx } from "clsx";

export function ActiveWorkout() {
  const navigate = useNavigate();
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(90); // 90 seconds default
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const [currentSet, setCurrentSet] = useState(1);
  const totalSets = 3;
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Global elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rest countdown
  useEffect(() => {
    let timer: number;
    if (isResting && restTime > 0) {
      timer = window.setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setIsResting(false);
            if (soundEnabled) {
              // Simulated sound beep
              try {
                const ctx = new window.AudioContext();
                const osc = ctx.createOscillator();
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
              } catch (e) {}
            }
            return 90; // Reset
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, restTime, soundEnabled]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleLogSet = () => {
    if (currentSet < totalSets) {
      setIsResting(true);
      setRestTime(90);
      setCurrentSet(prev => prev + 1);
    } else {
      navigate("/summary");
    }
  };

  const circumference = 2 * Math.PI * 120; // For SVG circle
  const strokeDashoffset = isResting ? circumference - ((90 - restTime) / 90) * circumference : 0;

  return (
    <div className="flex-1 flex flex-col min-h-full h-full p-6 pt-12 pb-8 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 relative z-10">
        <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A1A24] text-[#8B8CA8] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {/* Timer / Rest Indicator */}
        <div className="flex flex-col items-center">
          <motion.div 
            className={clsx(
              "font-mono text-3xl font-bold tracking-tighter",
              isResting ? "text-orange-500" : "text-white"
            )}
            animate={isResting ? { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {isResting ? formatTime(restTime) : formatTime(timeElapsed)}
          </motion.div>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8B8CA8] mt-1">
            {isResting ? "Resting" : "Active"}
          </span>
        </div>

        <button 
          onClick={() => setSoundEnabled(!soundEnabled)} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A1A24] text-[#8B8CA8] hover:text-white transition-colors"
        >
          {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Exercise View */}
      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-[28px] font-bold text-white text-center leading-tight mb-2">Barbell Bench Press</h2>
        <p className="text-[#8B8CA8] text-sm mb-8 font-medium">Chest • Set {currentSet} of {totalSets}</p>

        {/* Set Progress Indicators */}
        <div className="flex gap-3 mb-12">
          {Array.from({ length: totalSets }).map((_, i) => (
            <div 
              key={i} 
              className={clsx(
                "h-1.5 rounded-full transition-all duration-300",
                i + 1 < currentSet ? "w-8 bg-emerald-500" :
                i + 1 === currentSet ? "w-12 bg-indigo-500" : "w-8 bg-[#1A1A24]"
              )}
            />
          ))}
        </div>

        {/* Inputs */}
        <div className="w-full space-y-4 max-w-sm">
          {/* Weight */}
          <Card className="flex items-center justify-between py-6 px-6 relative overflow-hidden group">
            <span className="text-[#8B8CA8] font-medium text-sm w-16">Weight</span>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setWeight(Math.max(0, weight - 2.5))}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2A2A35] text-white hover:bg-indigo-500/20 hover:text-indigo-400 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="flex items-baseline w-16 justify-center">
                <span className="text-3xl font-bold text-white">{weight}</span>
                <span className="text-xs text-[#8B8CA8] ml-1">kg</span>
              </div>
              <button 
                onClick={() => setWeight(weight + 2.5)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2A2A35] text-white hover:bg-indigo-500/20 hover:text-indigo-400 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </Card>

          {/* Reps */}
          <Card className="flex items-center justify-between py-6 px-6 relative overflow-hidden">
            <span className="text-[#8B8CA8] font-medium text-sm w-16">Reps</span>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setReps(Math.max(0, reps - 1))}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2A2A35] text-white hover:bg-indigo-500/20 hover:text-indigo-400 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="flex items-baseline w-16 justify-center">
                <span className="text-3xl font-bold text-white">{reps}</span>
              </div>
              <button 
                onClick={() => setReps(reps + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2A2A35] text-white hover:bg-indigo-500/20 hover:text-indigo-400 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 pt-4 pb-4 bg-gradient-to-t from-[#0A0A0F] to-transparent">
        <Button 
          variant="secondary" 
          size="lg" 
          className="flex-1 shrink-0"
          onClick={() => navigate("/summary")}
        >
          FINISH
        </Button>
        <Button 
          variant={isResting ? "danger" : "success"}
          size="lg" 
          className="flex-[2] shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]"
          onClick={handleLogSet}
        >
          {isResting ? "SKIP REST" : (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5" strokeWidth={3} />
              LOG SET
            </span>
          )}
        </Button>
      </div>

      {/* Background Rest Animation (Pulse) */}
      <AnimatePresence>
        {isResting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-[-1]"
          >
             <div className="w-[300px] h-[300px] rounded-full border-[10px] border-orange-500/10 blur-xl opacity-50 absolute" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
