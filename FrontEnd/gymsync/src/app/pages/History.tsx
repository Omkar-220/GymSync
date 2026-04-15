import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronLeft, Calendar, Trophy, Dumbbell, TrendingUp, ChevronRight, Search } from 'lucide-react';
import clsx from 'clsx';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

type WorkoutSummary = {
  id: number;
  workoutDate: string;
  splitTag: string;
  totalVolume: number;
  durationMinutes: number;
  isCompleted: boolean;
  isSkipped: boolean;
};

type WorkoutDetail = {
  id: number;
  splitTag: string;
  trainingStyle: number;
  totalVolume: number;
  durationMinutes: number;
  sets: {
    exerciseId: number;
    exerciseName: string;
    setNumber: number;
    weight: number;
    reps: number;
  }[];
};

type ExerciseSummary = { name: string; sets: string };

const TRAINING_STYLE_LABEL: Record<number, string> = {
  0: 'PowerLifting',
  1: 'Hypertrophy',
  2: 'Endurance',
};

function groupSets(detail: WorkoutDetail): ExerciseSummary[] {
  const map = new Map<number, { name: string; count: number; maxWeight: number }>();
  for (const s of detail.sets) {
    if (!map.has(s.exerciseId)) {
      map.set(s.exerciseId, { name: s.exerciseName, count: 0, maxWeight: 0 });
    }
    const entry = map.get(s.exerciseId)!;
    entry.count++;
    if (s.weight > entry.maxWeight) entry.maxWeight = s.weight;
  }
  return Array.from(map.values()).map(e => ({
    name: e.name,
    sets: `${e.count} × ${e.maxWeight > 0 ? `${e.maxWeight}kg` : 'BW'}`,
  }));
}

function formatVolume(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k kg` : `${v} kg`;
}

export function History() {
  const { user } = useAuth();

  const [activeTab, setActiveTab]       = useState<'calendar' | 'stats'>('stats');
  const [weekStart, setWeekStart]       = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // All workouts (lightweight list)
  const [workouts, setWorkouts]         = useState<WorkoutSummary[]>([]);
  const [loadingList, setLoadingList]   = useState(true);

  // Detail for selected date's workouts (lazy loaded)
  const [detailMap, setDetailMap]       = useState<Record<number, WorkoutDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);

  // PRs
  const [recentPRs, setRecentPRs]       = useState<any[]>([]);
  const [prSearch, setPrSearch]         = useState('');

  // Volume chart data derived from real workouts
  const [volumeData, setVolumeData]     = useState<{ name: string; volume: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoadingList(true);
      try {
        const [workoutsRes, prsRes] = await Promise.all([
          api.get(`/workout/user/${user.id}`),
          api.get(`/personalrecord/user/${user.id}/latest?limit=50`),
        ]);

        const ws: WorkoutSummary[] = workoutsRes.data.filter((w: any) => !w.isSkipped && w.isCompleted);
        setWorkouts(ws);

        // Build weekly volume chart for current week
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i));
        const vData = weekDays.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayWorkouts = ws.filter(w => format(new Date(w.workoutDate), 'yyyy-MM-dd') === dayStr);
          return {
            name: format(day, 'EEE'),
            volume: dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0),
          };
        });
        setVolumeData(vData);

        setRecentPRs(prsRes.data ?? []);
        // Deduplicate — keep only the best (highest value) PR per exercise
        const raw: any[] = prsRes.data ?? [];
        const bestByExercise = Object.values(
          raw.reduce((acc: Record<number, any>, pr: any) => {
            if (!acc[pr.exerciseId] || pr.value > acc[pr.exerciseId].value) {
              acc[pr.exerciseId] = pr;
            }
            return acc;
          }, {})
        ).sort((a: any, b: any) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
        setRecentPRs(bestByExercise);
      } catch {
        // silently fall through
      } finally {
        setLoadingList(false);
      }
    };
    fetch();
  }, [user]);

  // When selected date changes, lazy load detail for workouts on that day
  useEffect(() => {
    const dayWorkouts = workouts.filter(w => isSameDay(new Date(w.workoutDate), selectedDate));
    if (dayWorkouts.length === 0) return;

    const unloaded = dayWorkouts.filter(w => !detailMap[w.id]);
    if (unloaded.length === 0) return;

    setLoadingDetail(true);
    Promise.all(unloaded.map(w => api.get(`/workout/${w.id}`))).then(results => {
      const newEntries: Record<number, WorkoutDetail> = {};
      results.forEach(r => { newEntries[r.data.id] = r.data; });
      setDetailMap(prev => ({ ...prev, ...newEntries }));
    }).catch(() => {}).finally(() => setLoadingDetail(false));
  }, [selectedDate, workouts]);

  const weekDays   = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel  = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`;
  const workoutDateSet = new Set(workouts.map(w => format(new Date(w.workoutDate), 'yyyy-MM-dd')));
  const selectedDayWorkouts = workouts.filter(w => isSameDay(new Date(w.workoutDate), selectedDate));
  const totalWeekVolume = volumeData.reduce((s, d) => s + d.volume, 0);

  // Calendar bounds — derived from first and last workout dates
  const minWeekStart = workouts.length > 0
    ? startOfWeek(new Date(workouts[workouts.length - 1].workoutDate), { weekStartsOn: 1 })
    : weekStart;
  const maxWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const canGoPrev = weekStart > minWeekStart;
  const canGoNext = weekStart < maxWeekStart;

  // Filtered PRs by search
  const filteredPRs = prSearch.trim() === ''
    ? recentPRs
    : recentPRs.filter((pr: any) =>
        pr.exerciseName.toLowerCase().includes(prSearch.toLowerCase())
      );

  return (
    <div className="h-full flex flex-col text-white bg-[#0F0F12] overflow-hidden">

      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center p-6 bg-[#0F0F12]/90 backdrop-blur-md z-10 border-b border-[#2A2A35]/50">
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <button className="text-[#8B8CA8] hover:text-white transition-colors">
          <Calendar className="w-6 h-6" />
        </button>
      </header>

      {/* Segmented Control */}
      <div className="flex-shrink-0 px-5 mt-4 mb-6">
        <div className="bg-[#1A1A24] p-1 rounded-xl flex items-center shadow-inner border border-[#2A2A35]">
          <button onClick={() => setActiveTab('stats')}
            className={clsx('flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              activeTab === 'stats' ? 'bg-[#2A2A35] text-white shadow-md' : 'text-[#8B8CA8]')}>
            Statistics
          </button>
          <button onClick={() => setActiveTab('calendar')}
            className={clsx('flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              activeTab === 'calendar' ? 'bg-[#2A2A35] text-white shadow-md' : 'text-[#8B8CA8]')}>
            History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── Statistics tab ── */}
          {activeTab === 'stats' && (
            <motion.div key="stats"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="h-full flex flex-col px-5"
            >
              {/* Chart — fixed */}
              <div className="flex-shrink-0 bg-[#1A1A24] rounded-2xl p-4 border border-[#2A2A35] shadow-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-white font-bold mb-0.5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#6366F1]" />
                      Weekly Volume
                    </h3>
                    <p className="text-[#8B8CA8] text-xs">Total weight moved (kg)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatVolume(totalWeekVolume)}</p>
                  </div>
                </div>
                <div className="h-[100px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8B8CA8', fontSize: 11 }} dy={6} />
                      <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid #2A2A35', borderRadius: '8px' }}
                        itemStyle={{ color: '#6366F1', fontWeight: 'bold' }}
                        labelStyle={{ color: '#8B8CA8' }}
                        formatter={(value: number) => [`${formatVolume(value)}`, 'Volume']}
                      />
                      <Area type="monotone" dataKey="volume" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* PRs — scrollable */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 pb-6">
                <h3 className="flex-shrink-0 text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#EAB308]" />
                  Recent PRs
                </h3>
                {loadingList ? (
                  <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-[#1A1A24] rounded-xl animate-pulse" />)}
                  </div>
                ) : recentPRs.length === 0 ? (
                  <div className="text-center py-8 text-[#8B8CA8] text-sm">No PRs yet — start lifting!</div>
                ) : (
                  <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                    {recentPRs.map((pr: any, idx: number) => (
                      <motion.div key={pr.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex-shrink-0 bg-[#1A1A24]/50 border border-[#2A2A35] p-4 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#EAB308]/10 rounded-full flex items-center justify-center text-[#EAB308]">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base">{pr.exerciseName}</h4>
                            <p className="text-[#8B8CA8] text-sm mt-0.5">{format(new Date(pr.achievedAt), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <span className="bg-[#2A2A35] text-[#10B981] text-sm font-bold px-3 py-1.5 rounded-lg">
                          {pr.value.toFixed(1)} kg × {pr.reps}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── History tab ── */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="h-full overflow-y-auto no-scrollbar px-5 pb-6 space-y-4"
            >
              {/* Calendar Navigator */}
              <div className="bg-[#181820] rounded-2xl p-5 border border-[#2A2A35] shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setWeekStart(w => subWeeks(w, 1))}
                    className="p-1.5 rounded-lg hover:bg-[#2A2A35] transition-colors">
                    <ChevronLeft className="w-5 h-5 text-[#8B8CA8]" />
                  </button>
                  <span className="text-white font-bold text-sm">{weekLabel}</span>
                  <button onClick={() => setWeekStart(w => addWeeks(w, 1))}
                    className="p-1.5 rounded-lg hover:bg-[#2A2A35] transition-colors">
                    <ChevronRight className="w-5 h-5 text-[#8B8CA8]" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, i) => {
                    const dateStr    = format(day, 'yyyy-MM-dd');
                    const hasWorkout = workoutDateSet.has(dateStr);
                    const isSelected = isSameDay(day, selectedDate);
                    const todayDay   = isToday(day);
                    return (
                      <button key={i} onClick={() => setSelectedDate(day)}
                        className="flex flex-col items-center gap-2 transition-transform hover:scale-105">
                        <span className="text-xs text-[#8B8CA8] font-semibold">{format(day, 'EEEEE')}</span>
                        <div className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors relative',
                          isSelected
                            ? 'bg-[#5C5CFF] text-white shadow-[0_0_10px_rgba(92,92,255,0.4)]'
                            : hasWorkout
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50'
                            : 'bg-[#2A2A35] text-[#8B8CA8] hover:bg-[#3A3A45]'
                        )}>
                          {format(day, 'd')}
                          {todayDay && !isSelected && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5C5CFF]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workout cards */}
              {loadingList ? (
                <div className="flex flex-col gap-3">
                  {[1,2].map(i => <div key={i} className="h-32 bg-[#181820] rounded-2xl animate-pulse" />)}
                </div>
              ) : selectedDayWorkouts.length === 0 ? (
                <div className="text-center py-10 bg-[#181820] rounded-2xl border border-[#2A2A35]">
                  <Dumbbell className="w-10 h-10 text-[#2A2A35] mx-auto mb-3" />
                  <p className="text-[#8B8CA8] font-medium text-sm">No workouts recorded on this day.</p>
                </div>
              ) : (
                selectedDayWorkouts.map((wo, i) => {
                  const detail   = detailMap[wo.id];
                  const exercises = detail ? groupSets(detail) : [];
                  const badge    = detail ? (TRAINING_STYLE_LABEL[detail.trainingStyle] ?? 'Workout') : '...';

                  return (
                    <div key={i} className="bg-[#181820] border border-[#2A2A35] rounded-2xl overflow-hidden">

                      {/* Name + time + badge */}
                      <div className="flex justify-between items-start p-4 border-b border-[#2A2A35]/60">
                        <div>
                          <h4 className="text-[19px] font-black text-white tracking-tight leading-none">{wo.splitTag || 'Workout'}</h4>
                          <p className="text-[#8B8CA8] text-xs mt-1.5">
                            {format(new Date(wo.workoutDate), 'EEEE, h:mm a')}
                          </p>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-[#6366F1]/20 to-[#818CF8]/10 text-[#818CF8] border border-[#6366F1]/25 whitespace-nowrap ml-2 flex-shrink-0">
                          {badge}
                        </span>
                      </div>

                      {/* Volume + Duration */}
                      <div className="flex border-b border-[#2A2A35]/60">
                        <div className="flex-1 px-4 py-3">
                          <div className="text-[16px] font-bold text-[#818CF8]">{formatVolume(wo.totalVolume)}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B8CA8] mt-0.5">Volume</div>
                        </div>
                        <div className="flex-1 px-4 py-3 border-l border-[#2A2A35]/60">
                          <div className="text-[16px] font-bold text-[#F97316]">{wo.durationMinutes}m</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B8CA8] mt-0.5">Duration</div>
                        </div>
                      </div>

                      {/* Exercises inline */}
                      <div className="p-3 flex flex-col gap-2">
                        {loadingDetail && !detail ? (
                          <div className="h-8 bg-white/[0.03] rounded-xl animate-pulse" />
                        ) : exercises.length === 0 ? (
                          <p className="text-[#8B8CA8] text-xs px-2">No sets logged</p>
                        ) : (
                          exercises.map((ex, j) => (
                            <div key={j} className="flex items-center gap-2.5 bg-white/[0.025] border border-white/[0.05] rounded-xl px-3 py-2">
                              <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[11px] font-extrabold text-[#6B6C84] flex-shrink-0">
                                {j + 1}
                              </div>
                              <span className="flex-1 text-[13px] font-bold text-[#e8e8f0] truncate">{ex.name}</span>
                              <span className="text-[11px] text-[#8B8CA8] font-semibold flex-shrink-0">{ex.sets}</span>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
