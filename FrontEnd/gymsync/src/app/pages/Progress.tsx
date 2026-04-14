import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, Target, Shield, Zap, Medal, Star, Flame, Award, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

// Fake Data for Charts
const STRENGTH_DATA = [
  { date: 'Jan', weight: 80, volume: 2000 },
  { date: 'Feb', weight: 85, volume: 2200 },
  { date: 'Mar', weight: 90, volume: 2300 },
  { date: 'Apr', weight: 100, volume: 2500 },
];

const WEIGHT_TREND_DATA = [
  { date: 'Jan', bodyweight: 75 },
  { date: 'Feb', bodyweight: 75.5 },
  { date: 'Mar', bodyweight: 76.2 },
  { date: 'Apr', bodyweight: 77 },
];

// TODO: replace with GET api/exercise when wired up
const EXERCISE_LIST = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press',
  'Pull-ups', 'Barbell Row', 'Incline Press', 'Leg Press',
  'Bicep Curl', 'Tricep Pushdown', 'Lateral Raises',
];

export function Progress() {
  const [exerciseSelect, setExerciseSelect] = useState('Bench Press');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <div className="bg-[#181820] border border-[#2A2A35] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold text-white mb-1">142</div>
              <div className="text-[10px] text-[#8B8CA8] font-bold uppercase tracking-widest">Workouts</div>
            </div>
            <div className="bg-[#181820] border border-[#2A2A35] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold text-white mb-1">3.2k</div>
              <div className="text-[10px] text-[#8B8CA8] font-bold uppercase tracking-widest">Sets</div>
            </div>
            <div className="bg-[#181820] border border-[#2A2A35] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold text-white mb-1">34k</div>
              <div className="text-[10px] text-[#8B8CA8] font-bold uppercase tracking-widest">Reps</div>
            </div>
          </div>
        </section>

        {/* Badges / Achievements */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F59E0B]" />
            Achievements
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
            {[
              { id: 1, icon: Medal, label: '100 Club', sub: 'Workouts', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
              { id: 2, icon: Flame, label: 'Streak', sub: '14 Days', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
              { id: 3, icon: Shield, label: 'Volume', sub: '1M kg Total', color: 'text-[#5C5CFF]', bg: 'bg-[#5C5CFF]/10' },
              { id: 4, icon: Star, label: 'First PR', sub: 'Squat', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
            ].map(badge => (
              <div key={badge.id} className="snap-center shrink-0 w-28 bg-[#181820] border border-[#2A2A35] p-4 rounded-2xl flex flex-col items-center text-center">
                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center mb-3", badge.bg)}>
                  <badge.icon className={clsx("w-6 h-6", badge.color)} />
                </div>
                <h3 className="font-bold text-sm text-white">{badge.label}</h3>
                <p className="text-[10px] text-[#8B8CA8] mt-1">{badge.sub}</p>
              </div>
            ))}
          </div>
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
                <span className="text-xs font-bold">{exerciseSelect}</span>
                <ChevronDown className={clsx('w-3 h-3 text-[#8B8CA8] transition-transform', dropdownOpen && 'rotate-180')} />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1A1A24] border border-[#2A2A35] rounded-xl overflow-hidden shadow-xl z-20">
                  <div className="overflow-y-auto max-h-[200px] no-scrollbar">
                    {EXERCISE_LIST.map(ex => (
                      <button
                        key={ex}
                        onClick={() => { setExerciseSelect(ex); setDropdownOpen(false); }}
                        className={clsx(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors',
                          ex === exerciseSelect
                            ? 'bg-[#5C5CFF]/20 text-[#818CF8] font-bold'
                            : 'text-[#8B8CA8] hover:bg-[#2A2A35] hover:text-white'
                        )}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 mb-4">
            <h3 className="text-xs text-[#8B8CA8] font-bold uppercase tracking-widest mb-4">1RM Weight (kg)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={STRENGTH_DATA}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8B8CA8', fontSize: 10 }} dy={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#181820', border: '1px solid #2A2A35', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="weight" stroke="#5C5CFF" strokeWidth={3} dot={{ fill: '#5C5CFF', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#818CF8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Weekly Volume Text Trends */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#10B981]" />
            Weekly Volume Trends
          </h2>
          <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 font-mono text-sm space-y-3">
            {[
              { w: 'Week 1', blocks: '████████', val: '2,500kg', diff: null },
              { w: 'Week 2', blocks: '██████████', val: '3,100kg', diff: '▲ +24%', color: 'text-[#10B981]' },
              { w: 'Week 3', blocks: '███████', val: '2,200kg', diff: '▼ -29%', color: 'text-[#EF4444]' },
              { w: 'Week 4', blocks: '███████████', val: '3,400kg', diff: '▲ +55%', color: 'text-[#10B981]' },
            ].map((wk, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="w-16 text-[#8B8CA8]">{wk.w}</span>
                <span className="text-[#5C5CFF] tracking-tighter flex-1 mx-2 overflow-hidden">{wk.blocks}</span>
                <span className="w-16 text-right font-bold text-white">{wk.val}</span>
                <span className={clsx("w-16 text-right text-xs font-bold", wk.color)}>{wk.diff}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Most Improved & Training Style */}
        <div className="grid grid-cols-1 gap-6">
          <section>
            <h2 className="text-lg font-bold mb-4">Most Improved</h2>
            <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 divide-y divide-[#2A2A35]">
              {[
                { name: 'Bench Press', start: '60kg', current: '100kg', inc: '+66%' },
                { name: 'Squat', start: '80kg', current: '120kg', inc: '+50%' },
              ].map((ex, i) => (
                <div key={i} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="font-bold text-sm text-white">{ex.name}</div>
                  <div className="text-right">
                    <div className="text-[#8B8CA8] text-xs mb-0.5">{ex.start} → {ex.current}</div>
                    <div className="text-[#10B981] font-bold text-xs">{ex.inc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4">Training Style</h2>
            <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 font-mono text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-28 text-[#8B8CA8]">Hypertrophy</span>
                <span className="text-[#5C5CFF] tracking-tighter flex-1 mx-2">████████████</span>
                <span className="w-10 text-right font-bold">60%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="w-28 text-[#8B8CA8]">Powerlifting</span>
                <span className="text-[#F59E0B] tracking-tighter flex-1 mx-2">██████</span>
                <span className="w-10 text-right font-bold">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="w-28 text-[#8B8CA8]">Endurance</span>
                <span className="text-[#10B981] tracking-tighter flex-1 mx-2">██</span>
                <span className="w-10 text-right font-bold">10%</span>
              </div>
            </div>
          </section>
        </div>

        {/* Bodyweight Trend */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#F97316]" />
            Weight Trend
          </h2>
          <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 mb-4">
            <h3 className="text-xs text-[#8B8CA8] font-bold uppercase tracking-widest mb-4">Bodyweight (kg)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEIGHT_TREND_DATA}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8B8CA8', fontSize: 10 }} dy={10} />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ backgroundColor: '#181820', border: '1px solid #2A2A35', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="bodyweight" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}