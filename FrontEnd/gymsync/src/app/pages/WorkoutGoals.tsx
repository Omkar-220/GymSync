import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Target, Trash2, X, Check, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

type Goal = {
  id: number;
  exerciseName: string;
  typeDisplayName: string;
  targetValue: number;
  targetReps: number | null;
  targetDate: string;
  isAchieved: boolean;
  progressPercentage: number | null;
  notes: string | null;
};

type Exercise = { id: number; name: string; muscleGroup: string };

export function WorkoutGoals() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [goals,     setGoals]     = useState<Goal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);

  // Form state
  const [exerciseId,   setExerciseId]   = useState('');
  const [targetValue,  setTargetValue]  = useState('');
  const [targetReps,   setTargetReps]   = useState('');
  const [targetDate,   setTargetDate]   = useState('');
  const [notes,        setNotes]        = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/workoutgoal/user/${user.id}`),
      api.get('/exercise'),
    ]).then(([goalsRes, exRes]) => {
      setGoals(goalsRes.data);
      setExercises(exRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    if (!user || !exerciseId || !targetValue || !targetDate) {
      toast.error('Exercise, target weight and date are required');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/workoutgoal', {
        userId:           user.id,
        targetExerciseId: parseInt(exerciseId),
        type:             0, // OneRepMax
        targetValue:      parseFloat(targetValue),
        targetReps:       targetReps ? parseInt(targetReps) : null,
        targetDate:       new Date(targetDate).toISOString(),
        notes:            notes || null,
      });
      setGoals(prev => [res.data, ...prev]);
      setShowForm(false);
      setExerciseId(''); setTargetValue(''); setTargetReps(''); setTargetDate(''); setNotes('');
      toast.success('Goal created!');
    } catch {
      toast.error('Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/workoutgoal/${id}`);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal removed');
    } catch {
      toast.error('Failed to remove goal');
    }
  };

  const activeGoals   = goals.filter(g => !g.isAchieved);
  const achievedGoals = goals.filter(g => g.isAchieved);

  return (
    <div className="h-full flex flex-col bg-[#0F0F12] text-white overflow-hidden">

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[#2A2A35]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center text-[#8B8CA8] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Fitness Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8] hover:bg-[#6366F1]/25 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-6">

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-[#1A1A24] rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Active Goals */}
            <div>
              <h2 className="text-sm font-bold text-[#8B8CA8] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#6366F1]" />
                Active Goals ({activeGoals.length})
              </h2>
              {activeGoals.length === 0 ? (
                <div className="text-center py-10 bg-[#1A1A24] rounded-2xl border border-[#2A2A35]">
                  <Target className="w-10 h-10 text-[#2A2A35] mx-auto mb-3" />
                  <p className="text-[#8B8CA8] text-sm font-medium">No active goals</p>
                  <button onClick={() => setShowForm(true)} className="mt-3 text-[#6366F1] text-xs font-bold uppercase tracking-wider">
                    Set a goal →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeGoals.map(goal => (
                    <motion.div key={goal.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-white text-base">{goal.exerciseName}</h3>
                          <p className="text-[#8B8CA8] text-xs mt-0.5">
                            Target: {goal.targetValue} kg{goal.targetReps ? ` × ${goal.targetReps} reps` : ''} · Due {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(goal.id)} className="text-[#8B8CA8] hover:text-[#EF4444] transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Progress bar */}
                      {goal.progressPercentage != null && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-[#8B8CA8] font-bold uppercase tracking-wider">Progress</span>
                            <span className="text-[10px] font-bold text-[#6366F1]">{Math.round(goal.progressPercentage)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#2A2A35] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full"
                            />
                          </div>
                        </div>
                      )}
                      {goal.notes && <p className="text-[#8B8CA8] text-xs mt-2 italic">{goal.notes}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Achieved Goals */}
            {achievedGoals.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-[#8B8CA8] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#EAB308]" />
                  Achieved ({achievedGoals.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {achievedGoals.map(goal => (
                    <div key={goal.id} className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">{goal.exerciseName}</h3>
                        <p className="text-[#10B981] text-xs mt-0.5 font-semibold">
                          ✓ {goal.targetValue} kg{goal.targetReps ? ` × ${goal.targetReps}` : ''} achieved
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#10B981]/15 flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#10B981]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-[#13131A] rounded-t-[32px] border-t border-[#2A2A35] px-6 pt-5 pb-8"
            >
              <div className="w-10 h-1 bg-[#2A2A35] rounded-full mx-auto mb-5" />
              <button onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[#8B8CA8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-black text-white mb-5">New Goal</h2>

              <div className="space-y-4">
                {/* Exercise picker */}
                <div>
                  <label className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider block mb-1.5">Exercise</label>
                  <select
                    value={exerciseId}
                    onChange={e => setExerciseId(e.target.value)}
                    className="w-full bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6366F1] transition-colors"
                  >
                    <option value="">Select exercise...</option>
                    {exercises.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Target weight */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider block mb-1.5">Target Weight (kg)</label>
                    <input
                      type="number" min={0} value={targetValue}
                      onChange={e => setTargetValue(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6366F1] transition-colors"
                    />
                  </div>
                  {/* Target reps */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider block mb-1.5">Reps (optional)</label>
                    <input
                      type="number" min={1} value={targetReps}
                      onChange={e => setTargetReps(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6366F1] transition-colors"
                    />
                  </div>
                </div>

                {/* Target date */}
                <div>
                  <label className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider block mb-1.5">Target Date</label>
                  <input
                    type="date" value={targetDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6366F1] transition-colors"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider block mb-1.5">Notes (optional)</label>
                  <input
                    type="text" value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Competition prep"
                    className="w-full bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6366F1] transition-colors"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="w-full py-4 rounded-2xl font-black text-white text-[15px] disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg, #5C5CFF 0%, #7C3AED 100%)', boxShadow: '0 4px 20px rgba(92,92,255,0.35)' }}
                >
                  {saving ? 'SAVING...' : 'CREATE GOAL'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
