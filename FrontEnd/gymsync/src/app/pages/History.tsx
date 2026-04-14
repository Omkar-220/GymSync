import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronRight, ChevronLeft, Calendar, Trophy, Dumbbell, TrendingUp, ChevronDown } from 'lucide-react';
import { Drawer } from 'vaul';
import clsx from 'clsx';

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
  { id: 2, title: 'Squat', metric: '140 kg x 3', date: '2 days ago' },
  { id: 3, title: 'Deadlift', metric: '160 kg x 1', date: 'Last week' },
];

const PAST_WORKOUTS_DB = [
  { id: 1, name: 'Push Day', date: '2026-04-10', displayDate: 'Today, 8:00 AM', volume: '4.5k kg', time: '45m', exercises: [{ name: 'Bench Press', sets: '4 sets x 100kg' }, { name: 'OHP', sets: '3 sets x 60kg' }] },
  { id: 2, name: 'Pull Day', date: '2026-04-09', displayDate: 'Yesterday, 6:30 PM', volume: '5.1k kg', time: '55m', exercises: [{ name: 'Pull-ups', sets: '4 sets' }, { name: 'Rows', sets: '4 sets x 80kg' }] },
  { id: 3, name: 'Leg Day', date: '2026-04-06', displayDate: 'Monday, 7:15 AM', volume: '6.2k kg', time: '60m', exercises: [{ name: 'Squats', sets: '5 sets x 120kg' }, { name: 'Leg Press', sets: '4 sets x 200kg' }] },
];

export function History() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats'>('stats');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string>('2026-04-10'); // "Today" dummy
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  
  // Fake calendar generation for navigation
  const currentDateLabel = viewMode === 'week' ? "Apr 6 - Apr 12, 2026" : "April 2026";
  const calendarDays = [
    { day: 'M', date: '2026-04-06', num: 6, hasWorkout: true },
    { day: 'T', date: '2026-04-07', num: 7, hasWorkout: false },
    { day: 'W', date: '2026-04-08', num: 8, hasWorkout: false },
    { day: 'T', date: '2026-04-09', num: 9, hasWorkout: true },
    { day: 'F', date: '2026-04-10', num: 10, hasWorkout: true },
    { day: 'S', date: '2026-04-11', num: 11, hasWorkout: false },
    { day: 'S', date: '2026-04-12', num: 12, hasWorkout: false },
  ];

  const filteredWorkouts = PAST_WORKOUTS_DB.filter(w => w.date === selectedDate);
  const lastWorkoutDay = PAST_WORKOUTS_DB.find(w => w.date < selectedDate);

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
            className={clsx(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              activeTab === 'stats' ? "bg-[#2A2A35] text-white shadow-md" : "text-[#8B8CA8]"
            )}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={clsx(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              activeTab === 'calendar' ? "bg-[#2A2A35] text-white shadow-md" : "text-[#8B8CA8]"
            )}
          >
            History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full flex flex-col px-5"
            >
              {/* Volume Trend Chart — fixed, does not scroll */}
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
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
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

              {/* PRs — flex-1, scrollable */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 pb-6">
                <h3 className="flex-shrink-0 text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#EAB308]" />
                  Recent PRs
                </h3>
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                  {RECENT_PRS.map((pr, idx) => (
                    <motion.div
                      key={pr.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
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
                      <div className="text-right">
                        <span className="bg-[#2A2A35] text-[#10B981] text-sm font-bold px-3 py-1.5 rounded-lg">
                          {pr.metric}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full overflow-y-auto no-scrollbar px-5 pb-6 space-y-6"
            >
              {/* Calendar Navigator */}
              <div className="bg-[#181820] rounded-2xl p-5 border border-[#2A2A35] shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <button className="p-1.5 rounded-lg hover:bg-[#2A2A35] transition-colors"><ChevronLeft className="w-5 h-5 text-[#8B8CA8]" /></button>
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-white font-bold group-hover:text-[#5C5CFF] transition-colors">{currentDateLabel}</span>
                    <ChevronDown className="w-4 h-4 text-[#8B8CA8]" />
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-[#2A2A35] transition-colors"><ChevronRight className="w-5 h-5 text-[#8B8CA8]" /></button>
                </div>

                <div className="grid grid-cols-7 gap-2 mt-4">
                  {calendarDays.map((d, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedDate(d.date)}
                      className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
                    >
                      <span className="text-xs text-[#8B8CA8] font-semibold">{d.day}</span>
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        selectedDate === d.date ? "bg-[#5C5CFF] text-white shadow-[0_0_10px_rgba(92,92,255,0.4)]" :
                        d.hasWorkout ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50" : 
                        "bg-[#2A2A35] text-[#8B8CA8] hover:bg-[#3A3A45]"
                      )}>
                        {d.num}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout List for Selected Date */}
              <div className="space-y-3">
                <div className="flex justify-between items-end mb-2 mt-4">
                  <h3 className="text-lg font-bold text-white">Workouts on {selectedDate}</h3>
                  {lastWorkoutDay && (
                    <span className="text-xs text-[#8B8CA8] font-medium">Last workout: {lastWorkoutDay.date}</span>
                  )}
                </div>
                
                {filteredWorkouts.length === 0 ? (
                  <div className="text-center py-10 bg-[#181820] rounded-2xl border border-[#2A2A35] shadow-inner">
                    <Dumbbell className="w-10 h-10 text-[#2A2A35] mx-auto mb-3" />
                    <p className="text-[#8B8CA8] font-medium text-sm">No workouts recorded on this day.</p>
                  </div>
                ) : (
                  filteredWorkouts.map((wo, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedWorkout(wo)}
                      className="bg-[#181820] border border-[#2A2A35] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#2A2A35] hover:border-[#5C5CFF] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#2A2A35] rounded-full flex items-center justify-center text-[#8B8CA8]">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{wo.name}</h4>
                          <p className="text-[#8B8CA8] text-xs mt-1">{wo.displayDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-white text-sm font-bold">{wo.volume}</span>
                          <span className="text-[#8B8CA8] text-xs">{wo.time}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#8B8CA8]" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Drawer.Root open={!!selectedWorkout} onOpenChange={(open) => !open && setSelectedWorkout(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <Drawer.Content className="bg-[#181820] flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] mx-auto w-full max-w-[390px] border-t border-[#2A2A35]">
            <div className="p-4 bg-[#181820] rounded-t-[32px] flex-1 overflow-y-auto no-scrollbar pb-10 text-white">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#2A2A35] mb-8" />
              
              {selectedWorkout && (
                <div className="px-2">
                  <Drawer.Title className="text-2xl font-bold mb-1">{selectedWorkout.name}</Drawer.Title>
                  <Drawer.Description className="text-[#8B8CA8] mb-6">{selectedWorkout.displayDate}</Drawer.Description>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 text-center">
                      <div className="text-xl font-bold">{selectedWorkout.volume}</div>
                      <div className="text-[10px] text-[#5C5CFF] font-bold mt-1 tracking-widest uppercase">Volume</div>
                    </div>
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 text-center">
                      <div className="text-xl font-bold">{selectedWorkout.time}</div>
                      <div className="text-[10px] text-[#F97316] font-bold mt-1 tracking-widest uppercase">Duration</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-sm">Exercises</h3>
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl overflow-hidden divide-y divide-[#2A2A35]">
                      {selectedWorkout.exercises.map((ex: any, i: number) => (
                        <div key={i} className="flex flex-col p-4">
                          <span className="font-bold text-base mb-1">{ex.name}</span>
                          <span className="text-sm text-[#8B8CA8] font-medium">{ex.sets}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {lastWorkoutDay && (
                     <div className="mt-6 p-4 rounded-xl bg-[#5C5CFF]/10 border border-[#5C5CFF]/30">
                        <p className="text-xs text-[#8B8CA8] mb-1">Comparison with last workout ({lastWorkoutDay.date}):</p>
                        <p className="text-sm font-bold text-[#10B981]">+5% Volume</p>
                     </div>
                  )}
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
