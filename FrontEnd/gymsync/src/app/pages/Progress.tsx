import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router';
import { TrendingUp, Activity, Target, Shield, Zap, Medal, Star, Flame, Award, ChevronDown, Trophy, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

function iconForHint(hint: string): { icon: React.ElementType; color: string; bg: string } {
  switch (hint) {
    case 'flame':       return { icon: Flame,    color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' };
    case 'medal':       return { icon: Medal,    color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' };
    case 'shield':      return { icon: Shield,   color: 'text-[#5C5CFF]', bg: 'bg-[#5C5CFF]/10' };
    case 'star':        return { icon: Star,     color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
    case 'zap':         return { icon: Zap,      color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' };
    case 'trending-up': return { icon: TrendingUp, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' };
    case 'activity':    return { icon: Activity, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
    case 'trophy':      return { icon: Trophy,   color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' };
    case 'target':      return { icon: Target,   color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
    default:            return { icon: Award,    color: 'text-[#8B8CA8]', bg: 'bg-[#8B8CA8]/10' };
  }
}

export function Progress() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<{ id: number; name: string }[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<{ id: number; name: string } | null>(null);
  const [strengthData, setStrengthData] = useState<{ date: string; weight: number }[]>([]);
  const [stats, setStats] = useState<{ totalWorkouts: number; totalWorkoutSets: number; totalVolume: number } | null>(null);
  const [achievements, setAchievements] = useState<{ key: string; label: string; description: string; iconHint: string; achievedAt: string }[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<{ w: string; val: string; diff: string | null; pct: number; color?: string }[]>([]);
  const [mostImproved, setMostImproved] = useState<{ name: string; previous: string; current: string; inc: string }[]>([]);
  const [trainingStyle, setTrainingStyle] = useState<{ label: string; pct: number; color: string }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Load exercises + user stats + achievements + workouts + PRs
  useEffect(() => {
    api.get('/exercise').then(res => {
      setExercises(res.data);
      if (res.data.length > 0) setSelectedExercise(res.data[0]);
    }).catch(() => {});
    if (!user) return;
    api.get(`/user/${user.id}`).then(res => setStats(res.data.statistics)).catch(() => {});
    api.get(`/achievement/user/${user.id}`).then(res => setAchievements(res.data)).catch(() => {});

    // Workouts → weekly volume + training style
    api.get(`/workout/user/${user.id}`).then(res => {
      const completed = res.data.filter((w: any) => w.isCompleted && !w.isSkipped);

      // Weekly volume — last 4 ISO weeks
      const weekMap = new Map<string, number>();
      completed.forEach((w: any) => {
        const d = new Date(w.workoutDate);
        const jan1 = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
        const key = `W${week}`;
        weekMap.set(key, (weekMap.get(key) ?? 0) + Number(w.totalVolume));
      });
      const weeks = Array.from(weekMap.entries()).slice(-4);
      const volumeRows = weeks.map(([w, vol], i) => {
        const prev = i > 0 ? weeks[i - 1][1] : null;
        const diff = prev ? ((vol - prev) / prev) * 100 : null;
        return {
          w,
          val: vol >= 1000 ? `${(vol / 1000).toFixed(1)}k kg` : `${Math.round(vol)} kg`,
          pct: vol,
          diff: diff !== null ? `${diff >= 0 ? '▲' : '▼'} ${diff >= 0 ? '+' : ''}${diff.toFixed(0)}%` : null,
          color: diff === null ? undefined : diff >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]',
        };
      });
      setWeeklyVolume(volumeRows);

      // Training style — trainingStyle is serialized as string enum name
      const styleCounts: Record<string, number> = {};
      completed.forEach((w: any) => {
        const s = String(w.trainingStyle);
        styleCounts[s] = (styleCounts[s] ?? 0) + 1;
      });
      const total = completed.length || 1;
      const styleMap: Record<string, { label: string; color: string }> = {
        'PowerLifting': { label: 'Powerlifting', color: 'text-[#F59E0B]' },
        'Hypertrophy':  { label: 'Hypertrophy',  color: 'text-[#5C5CFF]' },
        'Endurance':    { label: 'Endurance',     color: 'text-[#10B981]' },
        // numeric fallbacks in case serializer sends ints
        '0': { label: 'Powerlifting', color: 'text-[#F59E0B]' },
        '1': { label: 'Hypertrophy',  color: 'text-[#5C5CFF]' },
        '2': { label: 'Endurance',    color: 'text-[#10B981]' },
      };
      const seen = new Set<string>();
      const styleRows = Object.entries(styleCounts)
        .map(([key, count]) => {
          const meta = styleMap[key];
          if (!meta || seen.has(meta.label)) return null;
          seen.add(meta.label);
          return { label: meta.label, pct: Math.round((count / total) * 100), color: meta.color };
        })
        .filter(Boolean) as { label: string; pct: number; color: string }[];
      setTrainingStyle(styleRows);
    }).catch(() => {});

    // PRs → most improved (exercises with a previousRecord)
    api.get(`/personalrecord/user/${user.id}`).then(res => {
      const withPrev = res.data.filter((pr: any) => pr.previousRecord != null && pr.type === 0); // type 0 = OneRepMax
      const byExercise = new Map<number, any>();
      withPrev.forEach((pr: any) => {
        const existing = byExercise.get(pr.exerciseId);
        const imp = Number(pr.value) - Number(pr.previousRecord);
        if (!existing || imp > (Number(existing.value) - Number(existing.previousRecord))) {
          byExercise.set(pr.exerciseId, pr);
        }
      });
      const top = Array.from(byExercise.values())
        .sort((a, b) => (Number(b.value) - Number(b.previousRecord)) - (Number(a.value) - Number(a.previousRecord)))
        .slice(0, 3)
        .map(pr => {
          const impPct = ((Number(pr.value) - Number(pr.previousRecord)) / Number(pr.previousRecord) * 100).toFixed(0);
          return {
            name: pr.exerciseName,
            previous: `${Number(pr.previousRecord).toFixed(1)} kg`,
            current: `${Number(pr.value).toFixed(1)} kg`,
            inc: `+${impPct}%`,
          };
        });
      setMostImproved(top);
    }).catch(() => {});
  }, [user]);

  // Load progress data when exercise changes
  useEffect(() => {
    if (!user || !selectedExercise) return;
    setChartLoading(true);
    api.get(`/workout/progress/${user.id}/${selectedExercise.id}`)
      .then(res => {
        setStrengthData(
          res.data.progressData.map((d: any) => ({
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: Number(d.maxWeight),
          }))
        );
      })
      .catch(() => setStrengthData([]))
      .finally(() => setChartLoading(false));
  }, [user, selectedExercise]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative min-h-full pb-24 bg-[#0B0B0F] text-white font-sans overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex justify-between items-center p-6 sticky top-0 bg-[#0B0B0F]/90 backdrop-blur-md z-10 border-b border-[#2A2A35]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#5C5CFF]" />
          <h1 className="text-xl font-bold tracking-tight text-white">Statistics</h1>
        </div>
      </header>

      <div className="px-5 py-6 space-y-8">
        
        {/* Lifetime Stats */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#10B981]" />
            Lifetime Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Workouts', value: stats ? String(stats.totalWorkouts) : '—' },
              { label: 'Sets', value: stats ? (stats.totalWorkoutSets >= 1000 ? `${(stats.totalWorkoutSets/1000).toFixed(1)}k` : String(stats.totalWorkoutSets)) : '—' },
              { label: 'Volume', value: stats ? (stats.totalVolume >= 1000 ? `${(stats.totalVolume/1000).toFixed(1)}k` : String(Math.round(stats.totalVolume))) : '—' },
            ].map(s => (
              <div key={s.label} className="bg-[#181820] border border-[#2A2A35] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-[10px] text-[#8B8CA8] font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Badges / Achievements */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F59E0B]" />
              Achievements
            </h2>
            <button onClick={() => navigate('/achievements')} className="flex items-center gap-1 text-xs text-[#5C5CFF] font-bold">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {achievements.length === 0 ? (
            <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-6 text-center text-[#8B8CA8] text-sm">Complete a workout to earn your first achievement!</div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
              {achievements.map(a => {
                const { icon: Icon, color, bg } = iconForHint(a.iconHint);
                return (
                  <div key={a.key} className="snap-center shrink-0 w-28 bg-[#181820] border border-[#2A2A35] p-4 rounded-2xl flex flex-col items-center text-center">
                    <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center mb-3', bg)}>
                      <Icon className={clsx('w-6 h-6', color)} />
                    </div>
                    <h3 className="font-bold text-sm text-white leading-tight">{a.label}</h3>
                    <p className="text-[10px] text-[#8B8CA8] mt-1">{new Date(a.achievedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Strength Progression */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#5C5CFF]" />
              Strength Progression
            </h2>
            <div ref={dropdownRef} className="relative">
              <div
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-1 bg-[#181820] border border-[#2A2A35] px-3 py-1.5 rounded-lg cursor-pointer hover:border-[#5C5CFF] transition-colors"
              >
                <span className="text-xs font-bold">{selectedExercise?.name ?? '—'}</span>
                <ChevronDown className={clsx('w-3 h-3 text-[#8B8CA8] transition-transform', dropdownOpen && 'rotate-180')} />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1A1A24] border border-[#2A2A35] rounded-xl overflow-hidden shadow-xl z-20">
                  <div className="overflow-y-auto max-h-[200px] no-scrollbar">
                    {exercises.map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => { setSelectedExercise(ex); setDropdownOpen(false); }}
                        className={clsx(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors',
                          ex.id === selectedExercise?.id
                            ? 'bg-[#5C5CFF]/20 text-[#818CF8] font-bold'
                            : 'text-[#8B8CA8] hover:bg-[#2A2A35] hover:text-white'
                        )}
                      >
                        {ex.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 mb-4">
            <h3 className="text-xs text-[#8B8CA8] font-bold uppercase tracking-widest mb-4">Max Weight (kg)</h3>
            <div className="h-[180px] w-full">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center text-[#8B8CA8] text-sm">Loading...</div>
              ) : strengthData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#8B8CA8] text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strengthData}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8B8CA8', fontSize: 10 }} dy={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#181820', border: '1px solid #2A2A35', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="weight" stroke="#5C5CFF" strokeWidth={3} dot={{ fill: '#5C5CFF', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#818CF8' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* Weekly Volume Trends */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#10B981]" />
            Weekly Volume Trends
          </h2>
          <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 font-mono text-sm space-y-3">
            {weeklyVolume.length === 0 ? (
              <p className="text-[#8B8CA8] text-center text-sm">No workout data yet</p>
            ) : (() => {
              const maxVol = Math.max(...weeklyVolume.map(w => w.pct));
              return weeklyVolume.map((wk, i) => {
                const blocks = Math.round((wk.pct / maxVol) * 12);
                return (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="w-10 text-[#8B8CA8] shrink-0">{wk.w}</span>
                    <span className="text-[#5C5CFF] tracking-tighter flex-1 overflow-hidden">{'█'.repeat(blocks)}</span>
                    <span className="w-20 text-right font-bold text-white shrink-0">{wk.val}</span>
                    <span className={clsx('w-16 text-right text-xs font-bold shrink-0', wk.color)}>{wk.diff}</span>
                  </div>
                );
              });
            })()}
          </div>
        </section>

        {/* Most Improved & Training Style */}
        <div className="grid grid-cols-1 gap-6">
          <section>
            <h2 className="text-lg font-bold mb-4">Most Improved</h2>
            <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 divide-y divide-[#2A2A35]">
              {mostImproved.length === 0 ? (
                <p className="text-[#8B8CA8] text-sm text-center py-2">Set more PRs to see improvements</p>
              ) : mostImproved.map((ex, i) => (
                <div key={i} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="font-bold text-sm text-white">{ex.name}</div>
                  <div className="text-right">
                    <div className="text-[#8B8CA8] text-xs mb-0.5">{ex.previous} → {ex.current}</div>
                    <div className="text-[#10B981] font-bold text-xs">{ex.inc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4">Training Style</h2>
            <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 font-mono text-sm space-y-3">
              {trainingStyle.length === 0 ? (
                <p className="text-[#8B8CA8] text-sm text-center">No workout data yet</p>
              ) : trainingStyle.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="w-28 text-[#8B8CA8] shrink-0">{s.label}</span>
                  <span className={clsx('tracking-tighter flex-1 overflow-hidden', s.color)}>{'█'.repeat(Math.round(s.pct / 100 * 12))}</span>
                  <span className="w-10 text-right font-bold shrink-0">{s.pct}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}