import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronLeft, Calendar, Trophy, Dumbbell, TrendingUp, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';

const VOLUME_DATA = [
  { name: 'Mon', volume: 3000 },
  { name: 'Tue', volume: 4200 },
  { name: 'Wed', volume: 3800 },
  { name: 'Thu', volume: 0 },
  { name: 'Fri', volume: 4500 },
  { name: 'Sat', volume: 5100 },
  { name: 'Sun', volume: 4800 },
];

const RECENT_PRS = [
  { id: 1, title: 'Bench Press', metric: '100 kg x 5', date: 'Today' },
  { id: 2, title: 'Squat',       metric: '140 kg x 3', date: '2 days ago' },
  { id: 3, title: 'Deadlift',    metric: '160 kg x 1', date: 'Last week' },
];

const PAST_WORKOUTS_DB = [
  {
    id: 1, name: 'Push Day', date: '2026-04-10', displayDate: 'Friday, 8:00 AM',
    badge: 'Hypertrophy', volume: '4.5k kg', time: '45m',
    exercises: [
      { name: 'Bench Press',   sets: '4 × 100kg' },
      { name: 'OHP',           sets: '3 × 60kg'  },
      { name: 'Incline DB',    sets: '3 × 30kg'  },
      { name: 'Lateral Raise', sets: '4 × 12kg'  },
    ],
  },
  {
    id: 2, name: 'Pull Day', date: '2026-04-09', displayDate: 'Thursday, 6:30 PM',
    badge: 'Hypertrophy', volume: '5.1k kg', time: '55m',
    exercises: [
      { name: 'Pull-ups',    sets: '4 × BW'   },
      { name: 'Barbell Rows', sets: '4 × 80kg' },
      { name: 'Face Pulls',  sets: '3 × 25kg' },
    ],
  },
  {
    id: 3, name: 'Leg Day', date: '2026-04-06', displayDate: 'Monday, 7:15 AM',
    badge: 'Strength', volume: '6.2k kg', time: '60m',
    exercises: [
      { name: 'Squats',      sets: '5 × 120kg' },
      { name: 'Leg Press',   sets: '4 × 200kg' },
      { name: 'Romanian DL', sets: '3 × 80kg'  },
    ],
  },
];

export function History() {
  const [activeTab, setActiveTab]     = useState<'calendar' | 'stats'>('stats');
  const [weekStart, setWeekStart]     = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`;

  const filteredWorkouts = PAST_WORKOUTS_DB.filter(w =>
    isSameDay(new Date(w.date), selectedDate)
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
          <button
            onClick={() => setActiveTab('stats')}
            className={clsx('flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              activeTab === 'stats' ? 'bg-[#2A2A35] text-white shadow-md' : 'text-[#8B8CA8]')}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={clsx('flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              activeTab === 'calendar' ? 'bg-[#2A2A35] text-white shadow-md' : 'text-[#8B8CA8]')}
          >
            History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── Statistics tab ── */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
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
                    <p className="text-lg font-bold text-white">25.4k</p>
                    <p className="text-[#10B981] text-xs font-bold">+12% vs last</p>
                  </div>
                </div>
                <div className="h-[100px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={VOLUME_DATA}>
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
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                  {RECENT_PRS.map((pr, idx) => (
                    <motion.div
                      key={pr.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex-shrink-0 bg-[#1A1A24]/50 border border-[#2A2A35] p-4 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#EAB308]/10 rounded-full flex items-center justify-center text-[#EAB308]">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{pr.title}</h4>
                          <p className="text-[#8B8CA8] text-sm mt-0.5">{pr.date}</p>
                        </div>
                      </div>
                      <span className="bg-[#2A2A35] text-[#10B981] text-sm font-bold px-3 py-1.5 rounded-lg">
                        {pr.metric}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── History tab ── */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="h-full overflow-y-auto no-scrollbar px-5 pb-6 space-y-4"
            >
              {/* Calendar Navigator */}
              <div className="bg-[#181820] rounded-2xl p-5 border border-[#2A2A35] shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setWeekStart(w => subWeeks(w, 1))}
                    className="p-1.5 rounded-lg hover:bg-[#2A2A35] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#8B8CA8]" />
                  </button>
                  <span className="text-white font-bold text-sm">{weekLabel}</span>
                  <button
                    onClick={() => setWeekStart(w => addWeeks(w, 1))}
                    className="p-1.5 rounded-lg hover:bg-[#2A2A35] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#8B8CA8]" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const hasWorkout = PAST_WORKOUTS_DB.some(w => w.date === dateStr);
                    const isSelected = isSameDay(day, selectedDate);
                    const todayDay  = isToday(day);
                    return (
                      <button key={i} onClick={() => setSelectedDate(day)}
                        className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
                      >
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
              {filteredWorkouts.length === 0 ? (
                <div className="text-center py-10 bg-[#181820] rounded-2xl border border-[#2A2A35]">
                  <Dumbbell className="w-10 h-10 text-[#2A2A35] mx-auto mb-3" />
                  <p className="text-[#8B8CA8] font-medium text-sm">No workouts recorded on this day.</p>
                </div>
              ) : (
                filteredWorkouts.map((wo, i) => (
                  <div key={i} className="bg-[#181820] border border-[#2A2A35] rounded-2xl overflow-hidden">

                    {/* Name + time + badge */}
                    <div className="flex justify-between items-start p-4 border-b border-[#2A2A35]/60">
                      <div>
                        <h4 className="text-[19px] font-black text-white tracking-tight leading-none">{wo.name}</h4>
                        <p className="text-[#8B8CA8] text-xs mt-1.5">{wo.displayDate}</p>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-[#6366F1]/20 to-[#818CF8]/10 text-[#818CF8] border border-[#6366F1]/25 whitespace-nowrap ml-2 flex-shrink-0">
                        {wo.badge}
                      </span>
                    </div>

                    {/* Volume + Duration */}
                    <div className="flex border-b border-[#2A2A35]/60">
                      <div className="flex-1 px-4 py-3">
                        <div className="text-[16px] font-bold text-[#818CF8]">{wo.volume}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B8CA8] mt-0.5">Volume</div>
                      </div>
                      <div className="flex-1 px-4 py-3 border-l border-[#2A2A35]/60">
                        <div className="text-[16px] font-bold text-[#F97316]">{wo.time}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B8CA8] mt-0.5">Duration</div>
                      </div>
                    </div>

                    {/* Exercises inline */}
                    <div className="p-3 flex flex-col gap-2">
                      {wo.exercises.map((ex, j) => (
                        <div key={j} className="flex items-center gap-2.5 bg-white/[0.025] border border-white/[0.05] rounded-xl px-3 py-2">
                          <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[11px] font-extrabold text-[#6B6C84] flex-shrink-0">
                            {j + 1}
                          </div>
                          <span className="flex-1 text-[13px] font-bold text-[#e8e8f0] truncate">{ex.name}</span>
                          <span className="text-[11px] text-[#8B8CA8] font-semibold flex-shrink-0">{ex.sets}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                ))
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
