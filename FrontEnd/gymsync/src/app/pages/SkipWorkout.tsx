import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Moon, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

export function SkipWorkout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const todayDow: number = new Date().getDay();

  // Stats fetched from API
  const [streak,       setStreak]       = useState(0);
  const [totalSkipped, setTotalSkipped] = useState(0);
  const [totalWorkouts,setTotalWorkouts]= useState(0);
  const [loading,      setLoading]      = useState(true);
  const [confirmed,    setConfirmed]    = useState(false); // show confirmation screen
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/workout/user/${user.id}`).then(res => {
      const workouts = res.data;
      const skipped  = workouts.filter((w: any) => w.isSkipped).length;
      const done     = workouts.filter((w: any) => w.isCompleted && !w.isSkipped).length;

      // Calculate current streak — consecutive completed (non-skipped) days going back from yesterday
      let s = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      for (let i = 1; i <= 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toDateString();
        const hit = workouts.find((w: any) =>
          w.isCompleted && !w.isSkipped &&
          new Date(w.workoutDate).toDateString() === dateStr
        );
        if (hit) s++;
        else break;
      }

      setStreak(s);
      setTotalSkipped(skipped);
      setTotalWorkouts(done);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleConfirmSkip = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const startRes = await api.post('/workout/start', { userId: user.id, day: todayDow });
      await api.post(`/workout/${startRes.data.id}/complete`, {
        workoutId:       startRes.data.id,
        durationMinutes: 0,
        isSkipped:       true,
      });
    } catch {
      // no split or already active — skip still acknowledged
    } finally {
      setSaving(false);
      setConfirmed(true);
    }
  };

  // ── Confirmed / done screen ──────────────────────────────
  if (confirmed) {
    return (
      <div className="flex-1 w-full flex flex-col bg-[#0F0F12] text-white items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-[#818CF8] to-transparent pointer-events-none blur-3xl"
        />

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-[#818CF8]/15 border border-[#818CF8]/30 flex items-center justify-center mb-6"
        >
          <Moon className="w-10 h-10 text-[#818CF8]" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-3xl font-black text-white tracking-tight mb-2 text-center"
        >
          Rest Day Logged
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-[#8B8CA8] text-center max-w-[260px] mb-10 leading-relaxed"
        >
          Recovery is where the gains happen. Come back stronger tomorrow.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 w-full max-w-[320px] mb-10"
        >
          {[
            { label: 'Workouts',  value: totalWorkouts, color: 'text-[#10B981]' },
            { label: 'Skipped',   value: totalSkipped + 1, color: 'text-[#818CF8]' },
            { label: 'Streak',    value: streak, color: 'text-[#F97316]' },
          ].map((s, i) => (
            <motion.div key={i}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 flex flex-col items-center"
            >
              <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-[#8B8CA8] font-bold uppercase tracking-widest mt-1">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="w-full max-w-[320px] bg-[#5C5CFF] hover:bg-[#4F46E5] text-white font-black py-4 rounded-2xl text-[16px] transition-colors"
        >
          BACK TO HOME
        </motion.button>
      </div>
    );
  }

  // ── Confirmation / warning screen ───────────────────────
  return (
    <div className="flex-1 w-full flex flex-col bg-[#0F0F12] text-white relative overflow-hidden">

      {/* Header */}
      <header className="flex items-center p-6 border-b border-[#2A2A35]">
        <button onClick={() => navigate(-1)} className="text-[#8B8CA8] hover:text-white transition-colors p-2 -ml-2">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold ml-2">Skip Today's Workout?</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">

        {/* Warning icon */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-20 h-20 rounded-full bg-[#F97316]/15 border border-[#F97316]/30 flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-9 h-9 text-[#F97316]" />
        </motion.div>

        {loading ? (
          <div className="w-full max-w-[320px] space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-[#181820] rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-[320px] space-y-3"
          >
            {/* Streak warning */}
            {streak > 0 && (
              <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    You'll lose your {streak}-day streak
                  </div>
                  <div className="text-[#8B8CA8] text-xs mt-0.5">
                    Skipping breaks your current run
                  </div>
                </div>
              </div>
            )}

            {/* Stats info cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4">
                <div className="text-2xl font-black text-[#10B981]">{totalWorkouts}</div>
                <div className="text-[10px] text-[#8B8CA8] font-bold uppercase tracking-widest mt-1">Workouts Done</div>
              </div>
              <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4">
                <div className="text-2xl font-black text-[#818CF8]">{totalSkipped}</div>
                <div className="text-[10px] text-[#8B8CA8] font-bold uppercase tracking-widest mt-1">Times Skipped</div>
              </div>
            </div>

            {/* Skip rate */}
            {totalWorkouts + totalSkipped > 0 && (
              <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider">Consistency</span>
                  <span className="text-sm font-bold text-white">
                    {Math.round((totalWorkouts / (totalWorkouts + totalSkipped)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#2A2A35] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((totalWorkouts / (totalWorkouts + totalSkipped)) * 100)}%` }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#6366F1] rounded-full"
                  />
                </div>
                <div className="text-[11px] text-[#8B8CA8] mt-2">
                  {totalWorkouts} completed · {totalSkipped} skipped
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 px-6 pb-8 space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirmSkip}
          disabled={saving}
          className="w-full py-4 rounded-2xl font-black text-[16px] bg-[#2A2A35] hover:bg-[#3A3A45] text-[#8B8CA8] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Moon className="w-5 h-5" />
          {saving ? 'LOGGING...' : 'YES, SKIP TODAY'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl font-black text-[16px] transition-all relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #5C5CFF 0%, #7C3AED 100%)',
            boxShadow: '0 4px 24px rgba(92,92,255,0.4)',
          }}
        >
          KEEP MY STREAK — WORK OUT
        </motion.button>
      </div>
    </div>
  );
}
