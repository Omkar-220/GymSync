import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Calendar, Beef, Wheat, Droplets, Apple } from 'lucide-react';
import { Drawer } from 'vaul';
import { Link } from 'react-router';

// Dummy Data
const CALORIE_DATA = [
  { day: 'Sat', value: 1800 },
  { day: 'Sun', value: 1900 },
  { day: 'Mon', value: 1950 },
  { day: 'Tue', value: 1850 },
  { day: 'Wed', value: 1800 },
  { day: 'Thu', value: 1000 },
];

const PAST_LOGS = [
  { id: 1, date: 'Apr 9, 2026', cals: 0, p: 0, c: 0, f: 0 },
  { id: 2, date: 'Apr 8, 2026', cals: 2090, p: 158, c: 225, f: 65 },
  { id: 3, date: 'Apr 7, 2026', cals: 2297, p: 145, c: 238, f: 72 },
  { id: 4, date: 'Apr 6, 2026', cals: 2048, p: 158, c: 210, f: 60 },
  { id: 5, date: 'Apr 5, 2026', cals: 2471, p: 154, c: 286, f: 80 },
  { id: 6, date: 'Apr 4, 2026', cals: 2456, p: 148, c: 277, f: 75 },
];

const WEEK_DAYS = [
  { l: 'F', d: 3, logged: true },
  { l: 'S', d: 4, logged: true },
  { l: 'S', d: 5, logged: true },
  { l: 'M', d: 6, logged: true },
  { l: 'T', d: 7, logged: true },
  { l: 'W', d: 8, logged: true },
  { l: 'T', d: 9, logged: true },
];

export function Nutrition() {
  const [activeTab, setActiveTab] = useState<'statistics' | 'history'>('statistics');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  return (
    <div className="h-full flex flex-col bg-[#0B0B0F] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center p-6 bg-[#0B0B0F]/90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Nutrition</h1>
        <Link to="/nutrition/log" className="text-[#8B8CA8] hover:text-white transition-colors">
          <Calendar className="w-6 h-6" />
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex-shrink-0 px-6 mb-6">
        <div className="flex bg-[#181820] rounded-xl p-1 border border-[#2A2A35]">
          <button
            onClick={() => setActiveTab('statistics')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'statistics' ? 'bg-[#2A2A35] text-white' : 'text-[#8B8CA8]'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'history' ? 'bg-[#2A2A35] text-white' : 'text-[#8B8CA8]'
            }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'statistics' ? (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col"
            >
              {/* Chart — fixed */}
              <div className="flex-shrink-0 bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#5C5CFF]" />
                    <h3 className="font-bold text-white text-sm">Average Calories</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">1945 <span className="text-xs text-[#8B8CA8] font-normal">kcal</span></div>
                    <div className="text-xs text-[#10B981] font-semibold">+5% vs last</div>
                  </div>
                </div>
                <div className="h-[90px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CALORIE_DATA}>
                      <defs>
                        <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5C5CFF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5C5CFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8B8CA8', fontSize: 10 }} dy={6} />
                      <Area type="monotone" dataKey="value" stroke="#5C5CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorCals)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Macro Averages — fixed */}
              <div className="flex-shrink-0 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#F59E0B] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
                  </div>
                  <h3 className="font-bold text-white text-sm">Macro Averages</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-3 flex flex-col items-center justify-center">
                    <Beef className="w-4 h-4 text-[#EF4444] mb-1" />
                    <div className="text-lg font-bold text-white">130<span className="text-xs text-[#8B8CA8] font-normal">g</span></div>
                    <div className="text-[10px] text-[#8B8CA8] font-semibold tracking-wider">PROTEIN</div>
                  </div>
                  <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-3 flex flex-col items-center justify-center">
                    <Wheat className="w-4 h-4 text-[#F59E0B] mb-1" />
                    <div className="text-lg font-bold text-white">210<span className="text-xs text-[#8B8CA8] font-normal">g</span></div>
                    <div className="text-[10px] text-[#8B8CA8] font-semibold tracking-wider">CARBS</div>
                  </div>
                  <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-3 flex flex-col items-center justify-center">
                    <Droplets className="w-4 h-4 text-[#3B82F6] mb-1" />
                    <div className="text-lg font-bold text-white">65<span className="text-xs text-[#8B8CA8] font-normal">g</span></div>
                    <div className="text-[10px] text-[#8B8CA8] font-semibold tracking-wider">FATS</div>
                  </div>
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
                    { label: 'Zinc', val: 'NaN mg' },
                    { label: 'Magnesium', val: 'NaN mg' },
                    { label: 'Iron', val: 'NaN mg' },
                    { label: 'Omega-3', val: '2 g' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4">
                      <span className="font-semibold text-sm text-white">{item.label}</span>
                      <span className="text-sm text-[#8B8CA8] font-medium">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto no-scrollbar pb-6 space-y-6"
            >
              {/* This Week */}
              <div>
                <h3 className="font-bold text-white text-sm mb-3">This Week</h3>
                <div className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 flex justify-between items-center">
                  {WEEK_DAYS.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-[#8B8CA8]">{day.l}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        day.logged ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/10' : 'border-[#2A2A35] text-[#8B8CA8]'
                      }`}>
                        {day.d}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Past Logs */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <h3 className="flex-shrink-0 font-bold text-white text-sm mb-3">Past Logs</h3>
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                  {PAST_LOGS.map((log) => (
                    <div 
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#2A2A35]/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center">
                          <Apple className="w-5 h-5 text-[#8B8CA8]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">Nutrition Log</h4>
                          <p className="text-xs text-[#8B8CA8]">{log.date}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-bold text-white text-sm">{log.cals} <span className="text-xs font-normal">kcal</span></div>
                          <div className="text-[10px] text-[#8B8CA8]">{log.p}g P • {log.c}g C</div>
                        </div>
                        <span className="text-[#8B8CA8]">›</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  <Drawer.Description className="text-[#8B8CA8] mb-8">{selectedLog.date}</Drawer.Description>

                  <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-6 flex flex-col items-center mb-6">
                    <div className="text-4xl font-bold text-white mb-1">{selectedLog.cals}</div>
                    <div className="text-sm text-[#8B8CA8]">Total Calories</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 text-center">
                      <div className="text-lg font-bold text-white">{selectedLog.p}g</div>
                      <div className="text-[10px] text-[#EF4444] font-bold mt-1">PROTEIN</div>
                    </div>
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 text-center">
                      <div className="text-lg font-bold text-white">{selectedLog.c}g</div>
                      <div className="text-[10px] text-[#F59E0B] font-bold mt-1">CARBS</div>
                    </div>
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 text-center">
                      <div className="text-lg font-bold text-white">{selectedLog.f}g</div>
                      <div className="text-[10px] text-[#3B82F6] font-bold mt-1">FATS</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-white text-sm">Details</h3>
                    <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl overflow-hidden divide-y divide-[#2A2A35]">
                      {[
                        { label: 'Fiber', val: '0 g' },
                        { label: 'Zinc', val: '0 mg' },
                        { label: 'Magnesium', val: '0 mg' },
                        { label: 'Iron', val: '0 mg' },
                        { label: 'Omega-3', val: '0 g' },
                        { label: 'Creatine', val: '0 g' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4">
                          <span className="font-semibold text-sm text-[#8B8CA8]">{item.label}</span>
                          <span className="text-sm text-white font-medium">{item.val}</span>
                        </div>
                      ))}
                    </div>
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
