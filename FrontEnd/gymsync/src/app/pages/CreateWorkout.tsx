import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, Trash2, Search, Dumbbell, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

const TRAINING_STYLES = [
  { label: 'Hypertrophy', value: 1 },
  { label: 'PowerLifting', value: 0 },
  { label: 'Endurance', value: 2 },
];

type SetRow  = { reps: number };
type Exercise = {
  id: string; refId: number; name: string; muscle: string;
  setRows: SetRow[]; expanded: boolean;
};
type ExerciseOption = { id: number; name: string; muscleGroup: string };

export function CreateWorkout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  // Route state from WeeklySplit
  const splitId: number | null   = location.state?.splitId ?? null;
  const dayName: string          = location.state?.dayName ?? '';
  const splitName: string        = location.state?.splitName ?? 'New Workout';
  const splitType: string        = location.state?.splitType ?? 'Hypertrophy';
  const returnTo: string         = location.state?.returnTo ?? 'split'; // 'home' | 'split'

  const [workoutName, setWorkoutName]     = useState(splitName !== 'Rest Day' ? splitName : 'New Workout');
  const [trainingStyle, setTrainingStyle] = useState(
    TRAINING_STYLES.find(s => s.label === splitType)?.value ?? 1
  );
  const [exercises, setExercises]         = useState<Exercise[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [saving, setSaving]               = useState(false);
  const [loading, setLoading]             = useState(true);

  // Fetch real exercises from DB + load existing split exercises if editing
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Always fetch the exercise library
        const exRes = await api.get('/exercise');
        setExerciseOptions(exRes.data);

        // If editing an existing split, load its exercises
        if (splitId) {
          const splitRes = await api.get(`/split/${splitId}`);
          const split = splitRes.data;
          setWorkoutName(split.tag || splitName);
          setTrainingStyle(split.trainingStyle);
          if (split.exercises?.length > 0) {
            setExercises(split.exercises.map((e: any) => ({
              id:      String(e.id),
              refId:   e.exerciseId,
              name:    e.exerciseName,
              muscle:  e.muscleGroup,
              expanded: false,
              setRows: Array.from({ length: e.defaultSets ?? 3 }, () => ({ reps: e.defaultReps ?? 10 })),
            })));
          }
        }
      } catch {
        toast.error('Failed to load exercises');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [splitId]);

  const addExercise = (ex: ExerciseOption) => {
    setExercises(prev => [...prev, {
      id:      Math.random().toString(),
      refId:   ex.id,
      name:    ex.name,
      muscle:  ex.muscleGroup,
      setRows: [{ reps: 10 }, { reps: 10 }, { reps: 10 }],
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
      if (delta > 0) rows.push({ reps: 10 });
      else if (rows.length > 1) rows.pop();
      return { ...e, setRows: rows };
    }));
  };

  const updateSetRow = (exId: string, i: number, delta: number) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId) return e;
      const rows = e.setRows.map((r, idx) =>
        idx === i ? { reps: Math.max(1, r.reps + delta) } : r
      );
      return { ...e, setRows: rows };
    }));
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      let targetSplitId = splitId;

      // 1. Create split if it doesn't exist yet
      if (!targetSplitId) {
        const dow = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
          .indexOf(dayName);
        const res = await api.post('/split', {
          userId:        user.id,
          dayOfWeek:     dow >= 0 ? dow : 1,
          tag:           workoutName,
          trainingStyle: trainingStyle,
        });
        targetSplitId = res.data.id;
      } else {
        // Update split name/style
        await api.put(`/split/${targetSplitId}`, {
          tag:           workoutName,
          trainingStyle: trainingStyle,
        });
        // Remove all existing exercises first
        const existing = await api.get(`/split/${targetSplitId}`);
        for (const ex of existing.data.exercises) {
          await api.delete(`/split/${targetSplitId}/exercises/${ex.id}`);
        }
      }

      // 2. Bulk add exercises
      if (exercises.length > 0) {
        await api.post(`/split/${targetSplitId}/exercises/bulk`, {
          exercises: exercises.map((ex, i) => ({
            exerciseId:  ex.refId,
            order:       i + 1,
            defaultSets: ex.setRows.length,
            defaultReps: ex.setRows[0]?.reps ?? 10,
          })),
        });
      }

      toast.success('Split saved!');
      navigate(returnTo === 'home' ? '/' : '/split');
    } catch {
      toast.error('Failed to save split');
    } finally {
      setSaving(false);
    }
  };

  const filteredOptions = exerciseOptions.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 w-full flex flex-col bg-[#0F0F12] relative overflow-hidden text-white h-full">
      <header className="flex justify-between items-center p-6 bg-[#0F0F12] z-20 shrink-0 border-b border-[#2A2A35]">
        <button onClick={() => navigate(-1)} className="text-[#8B8CA8] hover:text-white transition-colors p-2 -ml-2">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{dayName ? `Plan ${dayName}` : 'Plan Workout'}</h1>
        <button onClick={handleSave} disabled={saving}
          className="text-[#10B981] hover:text-[#34D399] disabled:opacity-50 transition-colors p-2 -mr-2 flex items-center gap-1 font-semibold">
          <Check className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-8 pb-24">
        {/* Workout name + training style */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-widest mb-2 block">Workout Name</label>
            <input type="text" value={workoutName} onChange={e => setWorkoutName(e.target.value)}
              className="w-full bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-4 py-4 text-white text-xl font-bold focus:outline-none focus:border-[#6366F1] transition-colors"
              placeholder="e.g. Pull Day" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-widest mb-2 block">Training Style</label>
            <div className="flex flex-wrap gap-2">
              {TRAINING_STYLES.map(style => (
                <button key={style.value} onClick={() => setTrainingStyle(style.value)}
                  className={clsx('px-4 py-2 rounded-full text-sm font-semibold transition-colors border',
                    trainingStyle === style.value
                      ? 'bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/50'
                      : 'bg-[#1A1A24] text-[#8B8CA8] border-[#2A2A35] hover:text-white'
                  )}>
                  {style.label}
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
                          <div className="rounded-xl overflow-hidden border border-[#2A2A35]/50">
                            <div className="grid grid-cols-[28px_1fr] bg-[#0B0B0F] px-3 py-2 border-b border-[#2A2A35]/50">
                              <span className="text-[9px] text-[#8B8CA8] font-bold uppercase">Set</span>
                              <span className="text-[9px] text-[#8B8CA8] font-bold uppercase text-center">Reps</span>
                            </div>
                            {ex.setRows.map((row, i) => (
                              <div key={i} className={clsx(
                                'grid grid-cols-[28px_1fr] items-center px-3 py-2 gap-2',
                                i % 2 === 0 ? 'bg-[#0F0F12]' : 'bg-[#111118]',
                                i < ex.setRows.length - 1 && 'border-b border-[#2A2A35]/30'
                              )}>
                                <span className="text-[#8B8CA8] font-bold text-xs">{i + 1}</span>
                                <div className="flex items-center justify-center gap-1.5">
                                  <button onClick={() => updateSetRow(ex.id, i, -1)} className="w-6 h-6 bg-[#2A2A35] rounded-md flex items-center justify-center active:scale-95 shrink-0"><Minus className="w-2.5 h-2.5" /></button>
                                  <span className="font-bold text-white text-sm w-8 text-center tabular-nums">{row.reps}</span>
                                  <button onClick={() => updateSetRow(ex.id, i, 1)} className="w-6 h-6 bg-[#2A2A35] rounded-md flex items-center justify-center active:scale-95 shrink-0"><Plus className="w-2.5 h-2.5" /></button>
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
                  className="w-full bg-[#0F0F12] border border-[#2A2A35] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#6366F1] transition-colors" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
              {loading ? (
                <div className="p-8 text-center text-[#8B8CA8]">Loading exercises...</div>
              ) : filteredOptions.length > 0 ? filteredOptions.map(e => (
                <button key={e.id} onClick={() => addExercise(e)}
                  className="w-full flex items-center justify-between p-4 border-b border-[#2A2A35]/50 hover:bg-[#1A1A24] transition-colors text-left">
                  <div>
                    <h4 className="font-bold text-white text-base">{e.name}</h4>
                    <p className="text-[#8B8CA8] text-xs mt-1 uppercase tracking-wider">{e.muscleGroup}</p>
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
