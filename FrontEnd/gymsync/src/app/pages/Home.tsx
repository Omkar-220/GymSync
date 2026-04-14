import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Plus, Calendar, ChevronRight, Flame, Activity, Zap, GripVertical } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ITEM_TYPE = 'EXERCISE';

const INITIAL_EXERCISES = [
  { id: 1, name: 'Barbell Bench Press',    muscle: 'Chest',     target: '4 × 8-10' },
  { id: 2, name: 'Overhead Press',         muscle: 'Shoulders', target: '3 × 8-12' },
  { id: 3, name: 'Incline Dumbbell Press', muscle: 'Chest',     target: '3 × 10-12' },
  { id: 4, name: 'Tricep Pushdown',        muscle: 'Triceps',   target: '3 × 12-15' },
  { id: 5, name: 'Lateral Raises',         muscle: 'Shoulders', target: '4 × 15-20' },
];

const STATS = [
  { label: 'Streak',   value: '12',  unit: 'days', color: 'text-[#10B981]' },
  { label: 'Workouts', value: '142', unit: null,   color: 'text-[#818CF8]' },
  { label: 'Volume',   value: '34k', unit: 'kg',   color: 'text-[#F97316]' },
];

type Exercise = typeof INITIAL_EXERCISES[0];

function DraggableExercise({
  exercise, index, moveExercise, isDragging: externalDragging,
}: {
  exercise: Exercise;
  index: number;
  moveExercise: (from: number, to: number) => void;
  isDragging: boolean;
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
      className={`flex items-center border rounded-[14px] p-3 transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? 'opacity-40 bg-[#6366F1]/10 border-[#6366F1]/40 scale-[0.98]'
          : isOver
          ? 'bg-[#6366F1]/8 border-[#6366F1]/30'
          : 'bg-white/[0.025] border-white/[0.05] hover:bg-[#6366F1]/6 hover:border-[#6366F1]/20'
      }`}
    >
      {/* Drag indicator */}
      <GripVertical className="w-4 h-4 text-[#3A3A50] mr-2 shrink-0" />

      {/* Number badge */}
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
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);

  const moveExercise = (from: number, to: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
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
          <button
            onClick={() => navigate('/create')}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#8B8CA8] hover:text-[#818CF8] hover:border-[#6366F1]/50 hover:bg-[#6366F1]/10 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#8B8CA8] hover:text-white hover:border-white/15 transition-all"
          >
            <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </button>
        </div>
      </header>

      {/* Sub-header */}
      <div className="flex-shrink-0 flex gap-2 px-5 pt-2.5 pb-3 bg-[#0C0C10]/95 backdrop-blur-xl">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/create')}
          className="flex-1 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#6366F1]/15 to-[#818CF8]/8 border border-[#6366F1]/25 text-[#818CF8] hover:border-[#6366F1]/50 hover:text-[#a5b4fc] transition-all"
        >
          ✦ Custom Workout
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/history')}
          className="flex-1 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-white/[0.03] border border-white/[0.06] text-[#6B6C84] hover:text-[#8B8CA8] hover:bg-white/[0.06] transition-all"
        >
          Skip Workout
        </motion.button>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-[18px] pt-[18px] pb-2 flex flex-col gap-3.5">

          {/* Day Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] p-5 relative overflow-hidden border border-[#6366F1]/20"
            style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 60%, #12121f 100%)' }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#6366F1]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-5 left-5 w-20 h-20 rounded-full bg-[#10B981]/8 blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-3.5 relative z-10">
              <div>
                <p className="text-[10px] text-[#6366F1] font-extrabold uppercase tracking-[.1em] mb-1">Today's Workout</p>
                <h2 className="text-[26px] font-black text-white tracking-tight leading-none">Push Day</h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-gradient-to-r from-[#6366F1]/20 to-[#818CF8]/10 text-[#818CF8] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#6366F1]/25">
                  Hypertrophy
                </span>
                <button
                  onClick={() => navigate('/create')}
                  className="text-[11px] text-[#6B6C84] bg-white/[0.05] border border-white/[0.07] px-2.5 py-1 rounded-lg hover:text-white hover:border-white/15 transition-all"
                >
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
              <span>5 Exercises</span>
              <div className="w-1 h-1 rounded-full bg-[#3A3A50]" />
              <span>~65 mins</span>
              <div className="w-1 h-1 rounded-full bg-[#3A3A50]" />
              <span className="text-[#10B981] font-bold">+12% vol</span>
            </div>
          </motion.div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-2.5">
            {STATS.map(({ label, value, unit, color }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-[14px] py-3 flex flex-col items-center gap-1">
                <span className={`text-[18px] font-extrabold ${color}`}>
                  {value}{unit ? <span className="text-[11px] font-semibold text-[#6B6C84] ml-0.5">{unit}</span> : null}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#6B6C84]">{label}</span>
              </div>
            ))}
          </div>

          {/* Weekly Split */}
          <button
            onClick={() => navigate('/split')}
            className="w-full bg-white/[0.025] hover:bg-[#6366F1]/7 border border-white/[0.06] hover:border-[#6366F1]/25 rounded-[16px] p-3.5 flex items-center justify-between transition-all"
          >
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

          {/* Exercise list — draggable */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="text-[16px] font-extrabold text-white">Plan for today</h3>
              <span className="text-[12px] text-[#6B6C84] font-semibold">{exercises.length} exercises · drag to reorder</span>
            </div>
            <div className="flex flex-col gap-2">
              {exercises.map((ex, idx) => (
                <DraggableExercise
                  key={ex.id}
                  exercise={ex}
                  index={idx}
                  moveExercise={moveExercise}
                  isDragging={false}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* START WORKOUT CTA */}
      <div className="flex-shrink-0 px-[18px] pt-3 pb-4 bg-gradient-to-t from-[#0C0C10] via-[#0C0C10]/95 to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/workout', { state: { exercises } })}
          className="w-full relative overflow-hidden text-white font-black py-[17px] rounded-[18px] text-[16px] tracking-[.06em] transition-all"
          style={{
            background: 'linear-gradient(135deg, #5C5CFF 0%, #7C3AED 100%)',
            boxShadow: '0 4px 24px rgba(92,92,255,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
          START WORKOUT
        </motion.button>
      </div>

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
