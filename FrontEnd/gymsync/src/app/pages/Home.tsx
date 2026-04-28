import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar, ChevronRight, Flame, Activity, Zap, GripVertical, CheckCircle2, Dumbbell, X } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import clsx from 'clsx';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

const ITEM_TYPE = 'EXERCISE';

type Exercise = {
  id: number;
  name: string;
  muscle: string;
  target: string;
  sets: number;
  defaultReps: number;
  splitExerciseId: number; // needed for reorder API
};

function DraggableExercise({
  exercise, index, moveExercise, onTap,
}: {
  exercise: Exercise;
  index: number;
  moveExercise: (from: number, to: number) => void;
  onTap: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item: { index: number }) {
      if (item.index === index) return;
      moveExercise(item.index, index);
      item.index = index;
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      onClick={onTap}
      className={`flex items-center border rounded-[14px] p-3 transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? 'opacity-40 bg-[#6366F1]/10 border-[#6366F1]/40 scale-[0.98]'
          : isOver
          ? 'bg-[#6366F1]/8 border-[#6366F1]/30'
          : 'bg-white/[0.025] border-white/[0.05] hover:bg-[#6366F1]/6 hover:border-[#6366F1]/20'
      }`}
    >
      <GripVertical className="w-4 h-4 text-[#3A3A50] mr-2 shrink-0" />
      <div className="w-[34px] h-[34px] bg-white/[0.04] border border-white/[0.06] rounded-[10px] flex items-center justify-center text-[#6B6C84] font-extrabold text-[13px] mr-3 shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#e8e8f0] truncate text-[14px]">{exercise.name}</h4>
        <p className="text-[#6B6C84] text-[11px] mt-0.5">{exercise.muscle} · {exercise.target}</p>
      </div>
    </div>
  );
}

function HomeContent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exercises, setExercises]               = useState<Exercise[]>([]);
  const [splitId, setSplitId]                   = useState<number | null>(null);
  const [splitTag, setSplitTag]                 = useState("Today's Workout");
  const [trainingStyle, setTrainingStyle]       = useState('Hypertrophy');
  const [showDoneModal, setShowDoneModal]       = useState(false);
  const [workoutDoneToday, setWorkoutDoneToday] = useState(false);
  const [checking, setChecking]                 = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [stats, setStats] = useState({ streak: 0, workouts: 0, volume: 0 });

  const todayDow: number = new Date().getDay();
  const todayDayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][todayDow];

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const splitsRes = await api.get(`/split/user/${user.id}`);
        const todaySplit = splitsRes.data.find((s: any) => s.dayOfWeek === todayDow);

        if (todaySplit) {
          setSplitId(todaySplit.id);
          setSplitTag(todaySplit.tag || "Today's Workout");
          setTrainingStyle(
            todaySplit.trainingStyle === 0 ? 'PowerLifting' :
            todaySplit.trainingStyle === 1 ? 'Hypertrophy' : 'Endurance'
          );
          const mapped: Exercise[] = todaySplit.exercises.map((e: any) => ({
            id:              e.exerciseId,
            splitExerciseId: e.id,
            name:            e.exerciseName,
            muscle:          e.muscleGroup,
            target:          `${e.defaultSets ?? 3} × ${e.defaultReps ?? 10}`,
            sets:            e.defaultSets ?? 3,
            defaultReps:     e.defaultReps ?? 10,
          }));
          setExercises(mapped);
        }

        const workoutsRes = await api.get(`/workout/user/${user.id}`);
        const today = new Date().toDateString();
        const done = workoutsRes.data.some((w: any) =>
          w.isCompleted && !w.isSkipped && new Date(w.workoutDate).toDateString() === today
        );
        setWorkoutDoneToday(done);

        // Fetch real stats
        const userRes = await api.get(`/user/${user.id}`);
        const s = userRes.data.statistics;
        setStats({
          streak:   s.currentStreak,
          workouts: s.totalWorkouts,
          volume:   s.totalVolume,
        });
      } catch {
        // silently fall through
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleStartWorkout = async (allowDuplicate = false) => {
    if (workoutDoneToday && !allowDuplicate) { setShowDoneModal(true); return; }
    if (!user) return;
    setChecking(true);
    try {
      const res = await api.post('/workout/start', {
        day: todayDow,
        allowDuplicate,
      });
      navigate('/workout', { state: { exercises, workoutId: res.data.id } });
    } catch (err: any) {
      if (err.response?.status === 400) {
        try {
          const currentRes = await api.get(`/workout/current/${user.id}`);
          navigate('/workout', { state: { exercises, workoutId: currentRes.data.id } });
        } catch {
          navigate('/workout', { state: { exercises, workoutId: null } });
        }
      } else {
        console.error('Start workout failed:', err.response?.data ?? err.message);
      }
    } finally {
      setChecking(false);
    }
  };

  const handleSkipWorkout = () => navigate('/skip');

  const moveExercise = async (from: number, to: number) => {
    const updated = [...exercises];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setExercises(updated);

    // Persist new order to DB
    if (splitId) {
      try {
        await api.put(`/split/${splitId}/exercises/reorder`, {
          exerciseOrders: updated.map((ex, i) => ({
            splitExerciseId: ex.splitExerciseId,
            newOrder: i + 1,
          })),
        });
      } catch {
        // reorder failed silently — UI already updated
      }
    }
  };

  const navigateToTodaySplit = () => {
    navigate('/create', {
      state: {
        splitId,
        dayName:   todayDayName,
        splitName: splitTag,
        splitType: trainingStyle,
        returnTo:  'home',
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0C0C10] overflow-hidden">

      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center px-6 pt-5 pb-4 bg-[#0C0C10]/95 backdrop-blur-xl relative after:absolute after:bottom-0 after:left-6 after:right-6 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#6366F1]/30 after:to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.45)]">
            <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.4 14.4 9.6 9.6"/>
              <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/>
              <path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/>
              <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>
            </svg>
          </div>
          <h1 className="text-[21px] font-extrabold tracking-tight text-white">GymSync</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#8B8CA8] hover:text-white hover:border-white/15 transition-all">
            <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </button>
        </div>
      </header>

      {/* Sub-header */}
      <div className="flex-shrink-0 px-5 pt-2.5 pb-3 bg-[#0C0C10]/95 backdrop-blur-xl">
        <motion.button
          whileTap={{ scale: workoutDoneToday ? 1 : 0.97 }}
          onClick={workoutDoneToday ? undefined : handleSkipWorkout}
          disabled={workoutDoneToday}
          className={clsx(
            'w-full py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all',
            workoutDoneToday
              ? 'bg-white/[0.02] border border-white/[0.03] text-[#3A3A50] cursor-not-allowed'
              : 'bg-white/[0.03] border border-white/[0.06] text-[#6B6C84] hover:text-[#8B8CA8] hover:bg-white/[0.06]'
          )}
        >
          {workoutDoneToday ? 'Workout Already Logged' : 'Skip Today\'s Workout'}
        </motion.button>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-[18px] pt-[18px] pb-2 flex flex-col gap-3.5">

          {/* Day Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] p-5 relative overflow-hidden border border-[#6366F1]/20"
            style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 60%, #12121f 100%)' }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#6366F1]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-5 left-5 w-20 h-20 rounded-full bg-[#10B981]/8 blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-3.5 relative z-10">
              <div>
                <p className="text-[10px] text-[#6366F1] font-extrabold uppercase tracking-[.1em] mb-1">Today's Workout</p>
                <h2 className="text-[26px] font-black text-white tracking-tight leading-none">
                  {loading ? '...' : splitTag || 'No Split'}
                </h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-gradient-to-r from-[#6366F1]/20 to-[#818CF8]/10 text-[#818CF8] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#6366F1]/25">
                  {trainingStyle}
                </span>
                {/* Edit navigates to today's split config */}
                <button onClick={navigateToTodaySplit} className="text-[11px] text-[#6B6C84] bg-white/[0.05] border border-white/[0.07] px-2.5 py-1 rounded-lg hover:text-white hover:border-white/15 transition-all">
                  Edit
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-[#6B6C84] relative z-10">
              <svg className="w-3.5 h-3.5 text-[#6366F1] opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.4 14.4 9.6 9.6"/>
                <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/>
                <path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/>
                <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>
              </svg>
              <span>{exercises.length} Exercises</span>
            </div>
          </motion.div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Streak',   value: String(stats.streak),   unit: 'days', color: 'text-[#10B981]' },
              { label: 'Workouts', value: String(stats.workouts),  unit: null,   color: 'text-[#818CF8]' },
              { label: 'Volume',   value: stats.volume >= 1000 ? `${(stats.volume / 1000).toFixed(1)}k` : String(Math.round(stats.volume)), unit: 'kg', color: 'text-[#F97316]' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-[14px] py-3 flex flex-col items-center gap-1">
                <span className={`text-[18px] font-extrabold ${color}`}>
                  {value}{unit ? <span className="text-[11px] font-semibold text-[#6B6C84] ml-0.5">{unit}</span> : null}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#6B6C84]">{label}</span>
              </div>
            ))}
          </div>

          {/* Weekly Split */}
          <button onClick={() => navigate('/split')}
            className="w-full bg-white/[0.025] hover:bg-[#6366F1]/7 border border-white/[0.06] hover:border-[#6366F1]/25 rounded-[16px] p-3.5 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-[#6366F1]/18 to-[#6366F1]/6 border border-[#6366F1]/20 flex items-center justify-center text-[#818CF8]">
                <Calendar className="w-[19px] h-[19px]" />
              </div>
              <div className="text-left">
                <div className="text-[14px] font-bold text-white">Manage Weekly Split</div>
                <div className="text-[12px] text-[#6B6C84] mt-0.5">Configure your 7-day routine</div>
              </div>
            </div>
            <ChevronRight className="w-[17px] h-[17px] text-[#3A3A50]" />
          </button>

          {/* Exercise list */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="text-[16px] font-extrabold text-white">Plan for today</h3>
              <span className="text-[12px] text-[#6B6C84] font-semibold">
                {exercises.length} exercises · drag to reorder
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-[52px] bg-white/[0.03] rounded-[14px] animate-pulse" />
                ))}
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-8 bg-white/[0.02] border border-white/[0.05] rounded-[14px]">
                <Dumbbell className="w-8 h-8 text-[#2A2A35] mx-auto mb-2" />
                <p className="text-[#8B8CA8] text-sm font-medium">No split configured for today</p>
                <button onClick={() => navigate('/split')} className="mt-3 text-[#6366F1] text-xs font-bold uppercase tracking-wider">
                  Set up your split →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {exercises.map((ex, idx) => (
                  <DraggableExercise
                    key={ex.id}
                    exercise={ex}
                    index={idx}
                    moveExercise={moveExercise}
                    onTap={navigateToTodaySplit}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* START WORKOUT CTA */}
      <div className="flex-shrink-0 px-[18px] pt-3 pb-4 bg-gradient-to-t from-[#0C0C10] via-[#0C0C10]/95 to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleStartWorkout()}
          disabled={checking || loading}
          className="w-full relative overflow-hidden text-white font-black py-[17px] rounded-[18px] text-[16px] tracking-[.06em] transition-all disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #5C5CFF 0%, #7C3AED 100%)',
            boxShadow: '0 4px 24px rgba(92,92,255,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
          {checking ? 'STARTING...' : 'START WORKOUT'}
        </motion.button>
      </div>

      {/* Workout already done modal */}
      <AnimatePresence>
        {showDoneModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDoneModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-[#13131A] rounded-t-[32px] border-t border-[#2A2A35] px-6 pt-5 pb-8"
            >
              <div className="w-10 h-1 bg-[#2A2A35] rounded-full mx-auto mb-6" />
              <button onClick={() => setShowDoneModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[#8B8CA8] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                </div>
                <h2 className="text-[22px] font-black text-white tracking-tight mb-2">Workout Done!</h2>
                <p className="text-[#8B8CA8] text-sm leading-relaxed max-w-[260px]">
                  You already crushed today's session. Your muscles are growing — rest up and come back stronger.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setShowDoneModal(false); handleStartWorkout(true); }}
                  className="w-full flex items-center gap-4 bg-[#1A1A28] border border-[#2A2A35] hover:border-[#6366F1]/40 rounded-2xl p-4 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/25 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-[#818CF8]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-white">Start today's workout again</div>
                    <div className="text-[12px] text-[#8B8CA8] mt-0.5">Continue with your configured {splitTag}</div>
                  </div>
                </button>
                <button
                  onClick={() => { setShowDoneModal(false); navigateToTodaySplit(); }}
                  className="w-full flex items-center gap-4 bg-[#1A1A28] border border-[#2A2A35] hover:border-[#6366F1]/40 rounded-2xl p-4 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#818CF8]/15 border border-[#818CF8]/25 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 text-[#a5b4fc]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-white">Start a new workout</div>
                    <div className="text-[12px] text-[#8B8CA8] mt-0.5">Configure a custom session from scratch</div>
                  </div>
                </button>
                <button onClick={() => setShowDoneModal(false)} className="w-full py-3.5 rounded-2xl text-[#8B8CA8] text-sm font-bold hover:text-white transition-colors">
                  I'll rest today 💤
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export function Home() {
  return (
    <DndProvider backend={HTML5Backend}>
      <HomeContent />
    </DndProvider>
  );
}
