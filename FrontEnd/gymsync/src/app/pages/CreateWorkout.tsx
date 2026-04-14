import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, Trash2, Search, Dumbbell, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

const EXERCISE_DB = [
  { id: 'e1', name: 'Barbell Bench Press', muscle: 'Chest' },
  { id: 'e2', name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { id: 'e3', name: 'Squat', muscle: 'Legs' },
  { id: 'e4', name: 'Leg Press', muscle: 'Legs' },
  { id: 'e5', name: 'Deadlift', muscle: 'Back' },
  { id: 'e6', name: 'Pull-ups', muscle: 'Back' },
  { id: 'e7', name: 'Overhead Press', muscle: 'Shoulders' },
  { id: 'e8', name: 'Lateral Raises', muscle: 'Shoulders' },
  { id: 'e9', name: 'Bicep Curls', muscle: 'Arms' },
  { id: 'e10', name: 'Tricep Pushdown', muscle: 'Arms' },
];

const TRAINING_STYLES = ['Hypertrophy', 'Strength', 'Endurance'];

type SetRow = { weight: number; reps: number };
type Exercise = {
  id: string; refId: string; name: string; muscle: string;
  setRows: SetRow[]; expanded: boolean;
};

export function CreateWorkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dayParam = searchParams.get('day');
  const splitParam = searchParams.get('split');
  const typeParam = searchParams.get('type');

  const [workoutName, setWorkoutName] = useState(
    splitParam && splitParam !== 'Rest Day' ? splitParam : 'New Split Day'
  );
  const [trainingStyle, setTrainingStyle] = useState(
    typeParam && typeParam !== '' ? typeParam : 'Hypertrophy'
  );
  const [exercises, setExercises] = useState<Exercise[]>([{
    id: '1', refId: 'e1', name: 'Barbell Bench Press', muscle: 'Chest',
    setRows: [{ weight: 60, reps: 10 }, { weight: 62.5, reps: 10 }, { weight: 65, reps: 10 }, { weight: 67.5, reps: 10 }],
    expanded: true,
  }]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const addExercise = (ex: typeof EXERCISE_DB[0]) => {
    setExercises(prev => [...prev, {
      id: Math.random().toString(), refId: ex.id, name: ex.name, muscle: ex.muscle,
      setRows: [{ weight: 20, reps: 10 }, { weight: 20, reps: 10 }, { weight: 20, reps: 10 }],
      expanded: true,
    }]);
    setIsAddingExercise(false);
    setSearchQuery('');
  };

  const removeExercise = (id: string) =>
    setExercises(prev => prev.filter(e => e.id !== id));

  const toggleExpanded = (id: string) =>
    setExercises(prev => prev.map(e => e.id === id ? { ...e, expanded: !e.expanded } : e));

  const changeSetCount = (id: string, delta: number) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== id) return e;
      const rows = [...e.setRows];
      if (delta > 0) {
        const lastW = rows.length ? rows[rows.length - 1].weight : 20;
        rows.push({ weight: lastW, reps: 10 });
      } else if (rows.length > 1) {
        rows.pop();
      }
      return { ...e, setRows: rows };
    }));
  };

  const updateSetRow = (exId: string, i: number, field: 'weight' | 'reps', delta: number) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId) return e;
      const step = field === 'weight' ? 2.5 : 1;
      const min  = field === 'weight' ? 0 : 1;
      const rows = e.setRows.map((r, idx) =>
        idx === i ? { ...r, [field]: Math.max(min, +(r[field] + delta * step).toFixed(1)) } : r
      );
      return { ...e, setRows: rows };
    }));
  };

  const filteredExercises = EXERCISE_DB.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 w-full flex flex-col bg-[#0F0F12] relative overflow-hidden text-white h-full">
      <header className="flex justify-between items-center p-6 bg-[#0F0F12] z-20 shrink-0 border-b border-[#2A2A35]">
        <button onClick={() => navigate(-1)} className="text-[#8B8CA8] hover:text-white transition-colors p-2 -ml-2">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{dayParam ? `Plan ${dayParam}` : 'Plan Workout'}</h1>
        <button onClick={() => navigate(-1)} className="text-[#10B981] hover:text-[#34D399] transition-colors p-2 -mr-2 flex items-center gap-1 font-semibold">
          <Check className="w-5 h-5" />
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-8 pb-24">
        {/* Workout name + training style */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-widest mb-2 block">Workout Name</label>
            <input
              type="text" value={workoutName} onChange={e => setWorkoutName(e.target.value)}
              className="w-full bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-4 py-4 text-white text-xl font-bold focus:outline-none focus:border-[#6366F1] transition-colors"
              placeholder="e.g. Pull Day"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-widest mb-2 block">Training Style</label>
            <div className="flex flex-wrap gap-2">
              {TRAINING_STYLES.map(style => (
                <button key={style} onClick={() => setTrainingStyle(style)}
                  className={clsx('px-4 py-2 rounded-full text-sm font-semibold transition-colors border',
                    trainingStyle === style
                      ? 'bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/50'
                      : 'bg-[#1A1A24] text-[#8B8CA8] border-[#2A2A35] hover:text-white'
                  )}>
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#6366F1]" />
              Exercises
            </h2>
            <span className="text-[#8B8CA8] text-sm">{exercises.length} total</span>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {exercises.map((ex, idx) => (
                <motion.div key={ex.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                  className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0F0F12] rounded-lg flex items-center justify-center text-[#8B8CA8] font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{ex.name}</h3>
                        <p className="text-[#8B8CA8] text-xs uppercase tracking-wider mt-0.5">{ex.muscle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Sets stepper */}
                      <div className="flex items-center gap-1.5 bg-[#0F0F12] border border-[#2A2A35]/60 rounded-lg px-2 py-1">
                        <button onClick={() => changeSetCount(ex.id, -1)} className="w-5 h-5 bg-[#2A2A35] rounded flex items-center justify-center hover:bg-[#3A3A45] active:scale-95">
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-white font-bold text-sm w-4 text-center tabular-nums">{ex.setRows.length}</span>
                        <button onClick={() => changeSetCount(ex.id, 1)} className="w-5 h-5 bg-[#2A2A35] rounded flex items-center justify-center hover:bg-[#3A3A45] active:scale-95">
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-[#8B8CA8] text-[10px] font-bold uppercase tracking-wider ml-0.5">sets</span>
                      </div>
                      <button onClick={() => toggleExpanded(ex.id)} className="text-[#8B8CA8] hover:text-white p-1 transition-colors">
                        {ex.expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      <button onClick={() => removeExercise(ex.id)} className="text-[#8B8CA8] hover:text-[#EF4444] p-1 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {ex.expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          {/* Per-set table */}
                          <div className="rounded-xl overflow-hidden border border-[#2A2A35]/50">
                            <div className="grid grid-cols-[28px_1fr_1fr] bg-[#0B0B0F] px-3 py-2 border-b border-[#2A2A35]/50">
                              <span className="text-[9px] text-[#8B8CA8] font-bold uppercase">Set</span>
                              <span className="text-[9px] text-[#8B8CA8] font-bold uppercase text-center">Weight (kg)</span>
                              <span className="text-[9px] text-[#8B8CA8] font-bold uppercase text-center">Reps</span>
                            </div>
                            {ex.setRows.map((row, i) => (
                              <div key={i}
                                className={clsx(
                                  'grid grid-cols-[28px_1fr_1fr] items-center px-3 py-2 gap-2',
                                  i % 2 === 0 ? 'bg-[#0F0F12]' : 'bg-[#111118]',
                                  i < ex.setRows.length - 1 && 'border-b border-[#2A2A35]/30'
                                )}>
                                <span className="text-[#8B8CA8] font-bold text-xs">{i + 1}</span>
                                <div className="flex items-center justify-center gap-1.5">
                                  <button onClick={() => updateSetRow(ex.id, i, 'weight', -1)}
                                    className="w-6 h-6 bg-[#2A2A35] rounded-md flex items-center justify-center active:scale-95 shrink-0">
                                    <Minus className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="font-bold text-white text-sm w-10 text-center tabular-nums">{row.weight}</span>
                                  <button onClick={() => updateSetRow(ex.id, i, 'weight', 1)}
                                    className="w-6 h-6 bg-[#2A2A35] rounded-md flex items-center justify-center active:scale-95 shrink-0">
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-center gap-1.5">
                                  <button onClick={() => updateSetRow(ex.id, i, 'reps', -1)}
                                    className="w-6 h-6 bg-[#2A2A35] rounded-md flex items-center justify-center active:scale-95 shrink-0">
                                    <Minus className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="font-bold text-white text-sm w-8 text-center tabular-nums">{row.reps}</span>
                                  <button onClick={() => updateSetRow(ex.id, i, 'reps', 1)}
                                    className="w-6 h-6 bg-[#2A2A35] rounded-md flex items-center justify-center active:scale-95 shrink-0">
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setIsAddingExercise(true)}
              className="w-full py-4 border-2 border-dashed border-[#2A2A35] hover:border-[#6366F1] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#8B8CA8] hover:text-[#6366F1] transition-colors">
              <Plus className="w-6 h-6" />
              <span className="font-bold text-sm uppercase tracking-wide">Add Exercise</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {isAddingExercise && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-[#0F0F12] z-50 flex flex-col"
          >
            <div className="p-5 border-b border-[#2A2A35] bg-[#1A1A24]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Select Exercise</h2>
                <button onClick={() => setIsAddingExercise(false)} className="p-2 bg-[#2A2A35] rounded-full text-white hover:bg-[#3A3A45]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8CA8]" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search exercises or muscle..."
                  className="w-full bg-[#0F0F12] border border-[#2A2A35] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
              {filteredExercises.length > 0 ? filteredExercises.map(e => (
                <button key={e.id} onClick={() => addExercise(e)}
                  className="w-full flex items-center justify-between p-4 border-b border-[#2A2A35]/50 hover:bg-[#1A1A24] transition-colors text-left">
                  <div>
                    <h4 className="font-bold text-white text-base">{e.name}</h4>
                    <p className="text-[#8B8CA8] text-xs mt-1 uppercase tracking-wider">{e.muscle}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#2A2A35] flex items-center justify-center text-[#10B981]">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              )) : (
                <div className="p-8 text-center text-[#8B8CA8]">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No exercises found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
