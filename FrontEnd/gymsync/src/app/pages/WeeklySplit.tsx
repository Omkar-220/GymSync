import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Dumbbell, Coffee, Settings, X } from 'lucide-react';

const INITIAL_WEEK_DAYS = [
  { id: 'mon', name: 'Monday', split: 'Push Day', type: 'Hypertrophy', exercises: 5, isRest: false },
  { id: 'tue', name: 'Tuesday', split: 'Pull Day', type: 'Hypertrophy', exercises: 6, isRest: false },
  { id: 'wed', name: 'Wednesday', split: 'Legs', type: 'Strength', exercises: 4, isRest: false },
  { id: 'thu', name: 'Thursday', split: 'Rest Day', type: '', exercises: 0, isRest: true },
  { id: 'fri', name: 'Friday', split: 'Upper Body', type: 'Endurance', exercises: 8, isRest: false },
  { id: 'sat', name: 'Saturday', split: 'Lower Body', type: 'Hypertrophy', exercises: 5, isRest: false },
  { id: 'sun', name: 'Sunday', split: 'Rest Day', type: '', exercises: 0, isRest: true },
];

export function WeeklySplit() {
  const navigate = useNavigate();
  const [weekDays, setWeekDays] = useState(INITIAL_WEEK_DAYS);
  const [showSettings, setShowSettings] = useState(false);
  const [defaultWeightIncrease, setDefaultWeightIncrease] = useState(2.5);
  const [defaultSets, setDefaultSets] = useState(3);

  const toggleRestDay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWeekDays(days => days.map(day => {
      if (day.id === id) {
        const isRest = !day.isRest;
        return {
          ...day,
          isRest,
          split: isRest ? 'Rest Day' : 'Custom Day',
          type: isRest ? '' : 'Hypertrophy',
          exercises: isRest ? 0 : 4
        };
      }
      return day;
    }));
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-[#0B0B0F] relative overflow-hidden text-white h-full">
      <header className="flex items-center p-6 bg-[#0B0B0F] z-20 shrink-0 border-b border-[#2A2A35]">
        <button onClick={() => navigate(-1)} className="text-[#8B8CA8] hover:text-white transition-colors p-2 -ml-2 mr-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">Weekly Split</h1>
        <button onClick={() => setShowSettings(true)} className="text-[#8B8CA8] hover:text-white transition-colors p-2 -mr-2">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 pb-24">
        <p className="text-[#8B8CA8] text-sm mb-4">Tap on a day to configure its workout split or set it as a rest day.</p>
        
        {weekDays.map((day, idx) => (
          <motion.div
            key={day.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => !day.isRest && navigate(`/create?day=${day.name}&split=${encodeURIComponent(day.split)}&type=${day.type}`)}
            className="w-full bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 flex items-center justify-between hover:border-[#5C5CFF] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${day.isRest ? 'bg-[#2A2A35] text-[#8B8CA8]' : 'bg-[#5C5CFF]/10 text-[#5C5CFF]'}`}>
                {day.isRest ? <Coffee className="w-6 h-6" /> : <Dumbbell className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-base">{day.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm ${day.isRest ? 'text-[#8B8CA8]' : 'text-[#10B981] font-medium'}`}>
                    {day.split}
                  </span>
                  {!day.isRest && (
                    <>
                      <div className="w-1 h-1 bg-[#4A4A5C] rounded-full" />
                      <span className="text-xs text-[#8B8CA8]">{day.exercises} exercises</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => toggleRestDay(day.id, e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${day.isRest ? 'bg-[#2A2A35] text-white hover:bg-[#3A3A45]' : 'bg-[#181820] border border-[#2A2A35] text-[#8B8CA8] hover:text-white'}`}
              >
                {day.isRest ? 'MAKE WORKOUT' : 'SET REST'}
              </button>
              {!day.isRest && <ChevronRight className="w-5 h-5 text-[#4A4A5C]" />}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#181820] w-full max-w-sm rounded-3xl p-6 border border-[#2A2A35] shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 p-2 text-[#8B8CA8] hover:text-white rounded-full bg-[#2A2A35]/50"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">Split Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#8B8CA8] uppercase tracking-wider mb-3">
                    Default Weight Increase (kg)
                  </label>
                  <div className="flex items-center bg-[#0B0B0F] border border-[#2A2A35] rounded-xl p-1">
                    {[1.25, 2.5, 5, 10].map(val => (
                      <button
                        key={val}
                        onClick={() => setDefaultWeightIncrease(val)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${defaultWeightIncrease === val ? 'bg-[#5C5CFF] text-white shadow-md' : 'text-[#8B8CA8] hover:text-white'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#8B8CA8] uppercase tracking-wider mb-3">
                    Default Sets per Exercise
                  </label>
                  <div className="flex items-center bg-[#0B0B0F] border border-[#2A2A35] rounded-xl p-1">
                    {[2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        onClick={() => setDefaultSets(val)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${defaultSets === val ? 'bg-[#5C5CFF] text-white shadow-md' : 'text-[#8B8CA8] hover:text-white'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-[#5C5CFF] hover:bg-[#4F46E5] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg mt-4"
                >
                  SAVE SETTINGS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
