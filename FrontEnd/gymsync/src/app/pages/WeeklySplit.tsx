import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Dumbbell, Coffee, Settings, X } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

const DAYS = [
  { id: 'sun', name: 'Sunday',    dow: 0 },
  { id: 'mon', name: 'Monday',    dow: 1 },
  { id: 'tue', name: 'Tuesday',   dow: 2 },
  { id: 'wed', name: 'Wednesday', dow: 3 },
  { id: 'thu', name: 'Thursday',  dow: 4 },
  { id: 'fri', name: 'Friday',    dow: 5 },
  { id: 'sat', name: 'Saturday',  dow: 6 },
];

type DayState = {
  id: string;
  name: string;
  dow: number;
  splitId: number | null;
  split: string;
  type: string;
  exercises: number;
  isRest: boolean;
};

export function WeeklySplit() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [weekDays, setWeekDays]           = useState<DayState[]>(
    DAYS.map(d => ({ ...d, splitId: null, split: 'Rest Day', type: '', exercises: 0, isRest: true }))
  );
  const [loading, setLoading]             = useState(true);
  const [showSettings, setShowSettings]   = useState(false);
  const [defaultWeightIncrease, setDefaultWeightIncrease] = useState(2.5);
  const [defaultSets, setDefaultSets]     = useState(3);

  useEffect(() => {
    if (!user) return;
    api.get(`/split/user/${user.id}`).then(res => {
      setWeekDays(DAYS.map(d => {
        const split = res.data.find((s: any) => s.dayOfWeek === d.dow);
        if (split) {
          return {
            ...d,
            splitId:   split.id,
            split:     split.tag || 'Workout',
            type:      split.trainingStyle === 0 ? 'PowerLifting' : split.trainingStyle === 1 ? 'Hypertrophy' : 'Endurance',
            exercises: split.exercises?.length ?? 0,
            isRest:    false,
          };
        }
        return { ...d, splitId: null, split: 'Rest Day', type: '', exercises: 0, isRest: true };
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const toggleRestDay = async (day: DayState, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (!day.isRest && day.splitId) {
      // Mark as rest — soft delete the split
      await api.put(`/split/${day.splitId}`, { isActive: false });
      setWeekDays(prev => prev.map(d =>
        d.dow === day.dow
          ? { ...d, splitId: null, split: 'Rest Day', type: '', exercises: 0, isRest: true }
          : d
      ));
    } else {
      // Create a new split for this day
      const res = await api.post('/split', {
        userId:        user.id,
        dayOfWeek:     day.dow,
        tag:           'New Workout',
        trainingStyle: 1, // Hypertrophy default
      });
      setWeekDays(prev => prev.map(d =>
        d.dow === day.dow
          ? { ...d, splitId: res.data.id, split: 'New Workout', type: 'Hypertrophy', exercises: 0, isRest: false }
          : d
      ));
    }
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
        <p className="text-[#8B8CA8] text-sm mb-4">Tap a day to configure its workout or set it as a rest day.</p>

        {loading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[76px] bg-[#181820] rounded-2xl animate-pulse" />
          ))
        ) : (
          weekDays.map((day, idx) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => !day.isRest && navigate('/create', {
                state: {
                  splitId:   day.splitId,
                  dayName:   day.name,
                  splitName: day.split,
                  splitType: day.type,
                }
              })}
              className="w-full bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 flex items-center justify-between hover:border-[#5C5CFF] transition-colors cursor-pointer"
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
                  onClick={(e) => toggleRestDay(day, e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    day.isRest
                      ? 'bg-[#2A2A35] text-white hover:bg-[#3A3A45]'
                      : 'bg-[#181820] border border-[#2A2A35] text-[#8B8CA8] hover:text-white'
                  }`}
                >
                  {day.isRest ? 'MAKE WORKOUT' : 'SET REST'}
                </button>
                {!day.isRest && <ChevronRight className="w-5 h-5 text-[#4A4A5C]" />}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#181820] w-full max-w-sm rounded-3xl p-6 border border-[#2A2A35] shadow-2xl relative"
            >
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 p-2 text-[#8B8CA8] hover:text-white rounded-full bg-[#2A2A35]/50">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">Split Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#8B8CA8] uppercase tracking-wider mb-3">Default Weight Increase (kg)</label>
                  <div className="flex items-center bg-[#0B0B0F] border border-[#2A2A35] rounded-xl p-1">
                    {[1.25, 2.5, 5, 10].map(val => (
                      <button key={val} onClick={() => setDefaultWeightIncrease(val)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${defaultWeightIncrease === val ? 'bg-[#5C5CFF] text-white' : 'text-[#8B8CA8] hover:text-white'}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#8B8CA8] uppercase tracking-wider mb-3">Default Sets per Exercise</label>
                  <div className="flex items-center bg-[#0B0B0F] border border-[#2A2A35] rounded-xl p-1">
                    {[2, 3, 4, 5].map(val => (
                      <button key={val} onClick={() => setDefaultSets(val)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${defaultSets === val ? 'bg-[#5C5CFF] text-white' : 'text-[#8B8CA8] hover:text-white'}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowSettings(false)}
                  className="w-full bg-[#5C5CFF] hover:bg-[#4F46E5] text-white font-bold py-3.5 rounded-xl transition-colors">
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
