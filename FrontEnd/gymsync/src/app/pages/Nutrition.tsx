import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Beef, Wheat, Droplets, Apple, ChevronLeft, ChevronRight } from 'lucide-react';
import { Drawer } from 'vaul';
import { Link } from 'react-router';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import clsx from 'clsx';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

type NutritionLog = {
  id: number;
  logDate: string;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  zinc: number;
  magnesium: number;
  iron: number;
  creatine: number;
  omega3: number;
  calories: number;
  notes: string | null;
};

type Summary = {
  avgProtein:   number;
  avgCarbs:     number;
  avgFats:      number;
  avgCalories:  number;
  avgZinc:      number;
  avgMagnesium: number;
  avgIron:      number;
  daysLogged:   number;
};

export function Nutrition() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'statistics' | 'history'>('statistics');
  const [selectedLog, setSelectedLog] = useState<NutritionLog | null>(null);

  // Real data
  const [logs,    setLogs]    = useState<NutritionLog[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [logsRes, summaryRes] = await Promise.all([
          api.get(`/nutrition/user/${user.id}`),
          api.get(`/nutrition/user/${user.id}/summary?days=30`),
        ]);
        setLogs(logsRes.data ?? []);
        setSummary(summaryRes.data);
      } catch {
        // silently fall through
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  // Calendar bounds from real log dates
  const logDateSet = new Set(logs.map(l => format(new Date(l.logDate), 'yyyy-MM-dd')));
  const minWeekStart = logs.length > 0
    ? startOfWeek(new Date(logs[logs.length - 1].logDate), { weekStartsOn: 1 })
    : weekStart;
  const maxWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const canGoPrev = weekStart > minWeekStart;
  const canGoNext = weekStart < maxWeekStart;

  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`;

  // Logs for selected date
  const selectedDayLogs = logs.filter(l => isSameDay(new Date(l.logDate), selectedDate));

  // Build weekly calorie chart from real logs
  const volumeData = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayLog = logs.find(l => format(new Date(l.logDate), 'yyyy-MM-dd') === dayStr);
    return { day: format(day, 'EEE'), value: dayLog?.calories ?? 0 };
  });

  const fmt = (v: number, dec = 0) => v.toFixed(dec);

  return (
    <div className="h-full flex flex-col bg-[#0B0B0F] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center p-6 bg-[#0B0B0F]/90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Nutrition</h1>
        <Link to="/nutrition/log">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden text-white font-black px-4 py-2 rounded-xl text-[12px] tracking-[.06em] transition-all"
            style={{
              background: 'linear-gradient(135deg, #5C5CFF 0%, #7C3AED 100%)',
              boxShadow: '0 4px 16px rgba(92,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
            LOG NUTRITION
          </motion.button>
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex-shrink-0 px-6 mb-6">
        <div className="flex bg-[#181820] rounded-xl p-1 border border-[#2A2A35]">
          <button onClick={() => setActiveTab('statistics')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'statistics' ? 'bg-[#2A2A35] text-white' : 'text-[#8B8CA8]'}`}>
            Statistics
          </button>
          <button onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'history' ? 'bg-[#2A2A35] text-white' : 'text-[#8B8CA8]'}`}>
            History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <AnimatePresence mode="wait">

          {/* ── Statistics tab ── */}
          {activeTab === 'statistics' && (
            <motion.div key="statistics"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col"
            >
              {/* Chart — fixed */}
              <div className="flex-shrink-0 bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#5C5CFF]" />
                    <h3 className="font-bold text-white text-sm">Daily Calories</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {summary ? Math.round(summary.avgCalories) : '—'}
                      <span className="text-xs text-[#8B8CA8] font-normal ml-1">kcal avg</span>
                    </div>
                    <div className="text-xs text-[#8B8CA8]">{summary?.daysLogged ?? 0} days logged</div>
                  </div>
                </div>
                <div className="h-[90px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeData}>
                      <defs>
                        <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5C5CFF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5C5CFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8B8CA8', fontSize: 10 }} dy={6} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181820', border: '1px solid #2A2A35', borderRadius: '8px' }}
                        itemStyle={{ color: '#5C5CFF', fontWeight: 'bold' }}
                        labelStyle={{ color: '#8B8CA8' }}
                        formatter={(v: number) => [`${v} kcal`, 'Calories']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#5C5CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorCals)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Macro Averages — fixed */}
              <div className="flex-shrink-0 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#F59E0B] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  </div>
                  <h3 className="font-bold text-white text-sm">Macro Averages</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-20 bg-[#181820] rounded-2xl animate-pulse" />)
                  ) : (
                    <>
                      <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-3 flex flex-col items-center justify-center">
                        <Beef className="w-4 h-4 text-[#EF4444] mb-1" />
                        <div className="text-lg font-bold text-white">{summary ? fmt(summary.avgProtein) : '—'}<span className="text-xs text-[#8B8CA8] font-normal">g</span></div>
                        <div className="text-[10px] text-[#8B8CA8] font-semibold tracking-wider">PROTEIN</div>
                      </div>
                      <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-3 flex flex-col items-center justify-center">
                        <Wheat className="w-4 h-4 text-[#F59E0B] mb-1" />
                        <div className="text-lg font-bold text-white">{summary ? fmt(summary.avgCarbs) : '—'}<span className="text-xs text-[#8B8CA8] font-normal">g</span></div>
                        <div className="text-[10px] text-[#8B8CA8] font-semibold tracking-wider">CARBS</div>
                      </div>
                      <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-3 flex flex-col items-center justify-center">
                        <Wheat className="w-4 h-4 text-[#3B82F6] mb-1" />
                        <div className="text-lg font-bold text-white">{summary ? fmt(summary.avgFats) : '—'}<span className="text-xs text-[#8B8CA8] font-normal">g</span></div>
                        <div className="text-[10px] text-[#8B8CA8] font-semibold tracking-wider">FATS</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Micronutrients — flex-1, scrollable */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 pb-6">
                <div className="flex-shrink-0 flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                  <h3 className="font-bold text-white text-sm">Micronutrients & Supplements</h3>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#181820] border border-[#2A2A35] rounded-2xl divide-y divide-[#2A2A35]">
                  {[
                    { label: 'Zinc',      val: summary ? `${fmt(summary.avgZinc, 1)} mg`      : '— mg' },
                    { label: 'Magnesium', val: summary ? `${fmt(summary.avgMagnesium, 0)} mg`  : '— mg' },
                    { label: 'Iron',      val: summary ? `${fmt(summary.avgIron, 1)} mg`       : '— mg' },
                    { label: 'Omega-3',   val: '— g' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4">
                      <span className="font-semibold text-sm text-white">{item.label}</span>
                      <span className="text-sm text-[#8B8CA8] font-medium">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── History tab ── */}
          {activeTab === 'history' && (
            <motion.div key="history"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto no-scrollbar pb-6 space-y-4"
            >
              {/* Calendar Navigator */}
              <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => canGoPrev && setWeekStart(w => subWeeks(w, 1))}
                    disabled={!canGoPrev}
                    className={clsx('p-1.5 rounded-lg transition-colors', canGoPrev ? 'hover:bg-[#2A2A35] text-[#8B8CA8]' : 'text-[#3A3A45] cursor-not-allowed')}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white font-bold text-sm">{weekLabel}</span>
                  <button
                    onClick={() => canGoNext && setWeekStart(w => addWeeks(w, 1))}
                    disabled={!canGoNext}
                    className={clsx('p-1.5 rounded-lg transition-colors', canGoNext ? 'hover:bg-[#2A2A35] text-[#8B8CA8]' : 'text-[#3A3A45] cursor-not-allowed')}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, i) => {
                    const dateStr    = format(day, 'yyyy-MM-dd');
                    const hasLog     = logDateSet.has(dateStr);
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
                            : hasLog
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

              {/* Logs for selected date */}
              {loading ? (
                <div className="h-24 bg-[#181820] rounded-2xl animate-pulse" />
              ) : selectedDayLogs.length === 0 ? (
                <div className="text-center py-10 bg-[#181820] rounded-2xl border border-[#2A2A35]">
                  <Apple className="w-10 h-10 text-[#2A2A35] mx-auto mb-3" />
                  <p className="text-[#8B8CA8] font-medium text-sm">No nutrition logged on this day.</p>
                </div>
              ) : (
                selectedDayLogs.map(log => (
                  <div key={log.id} onClick={() => setSelectedLog(log)}
                    className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#2A2A35]/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center">
                        <Apple className="w-5 h-5 text-[#8B8CA8]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Nutrition Log</h4>
                        <p className="text-xs text-[#8B8CA8]">{format(new Date(log.logDate), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-bold text-white text-sm">{Math.round(log.calories)} <span className="text-xs font-normal">kcal</span></div>
                        <div className="text-[10px] text-[#8B8CA8]">{Math.round(log.protein)}g P • {Math.round(log.carbs)}g C</div>
                      </div>
                      <span className="text-[#8B8CA8]">›</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Log Details Drawer */}
      <Drawer.Root open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <Drawer.Content className="bg-[#181820] flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] mx-auto w-full max-w-[390px] border-t border-[#2A2A35]">
            <div className="p-4 bg-[#181820] rounded-t-[32px] flex-1 overflow-y-auto no-scrollbar pb-10">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#2A2A35] mb-8" />
              {selectedLog && (
                <div className="px-2">
                  <Drawer.Title className="text-2xl font-bold text-white mb-1">Nutrition Log</Drawer.Title>
                  <Drawer.Description className="text-[#8B8CA8] mb-8">
                    {format(new Date(selectedLog.logDate), 'EEEE, MMM d, yyyy')}
                  </Drawer.Description>
                  <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-6 flex flex-col items-center mb-6">
                    <div className="text-4xl font-bold text-white mb-1">{Math.round(selectedLog.calories)}</div>
                    <div className="text-sm text-[#8B8CA8]">Total Calories</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 text-center">
                      <div className="text-lg font-bold text-white">{Math.round(selectedLog.protein)}g</div>
                      <div className="text-[10px] text-[#EF4444] font-bold mt-1">PROTEIN</div>
                    </div>
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 text-center">
                      <div className="text-lg font-bold text-white">{Math.round(selectedLog.carbs)}g</div>
                      <div className="text-[10px] text-[#F59E0B] font-bold mt-1">CARBS</div>
                    </div>
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 text-center">
                      <div className="text-lg font-bold text-white">{Math.round(selectedLog.fats)}g</div>
                      <div className="text-[10px] text-[#3B82F6] font-bold mt-1">FATS</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-white text-sm">Details</h3>
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl overflow-hidden divide-y divide-[#2A2A35]">
                      {[
                        { label: 'Fiber',     val: `${selectedLog.fiber} g`     },
                        { label: 'Zinc',      val: `${selectedLog.zinc} mg`      },
                        { label: 'Magnesium', val: `${selectedLog.magnesium} mg` },
                        { label: 'Iron',      val: `${selectedLog.iron} mg`      },
                        { label: 'Omega-3',   val: `${selectedLog.omega3} g`     },
                        { label: 'Creatine',  val: `${selectedLog.creatine} g`   },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4">
                          <span className="font-semibold text-sm text-[#8B8CA8]">{item.label}</span>
                          <span className="text-sm text-white font-medium">{item.val}</span>
                        </div>
                      ))}
                    </div>
                    {selectedLog.notes && (
                      <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4">
                        <p className="text-xs text-[#8B8CA8] font-bold uppercase tracking-wider mb-2">Notes</p>
                        <p className="text-sm text-white">{selectedLog.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
