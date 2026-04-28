import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Activity, Calendar, Beef, Wheat, Droplets, Leaf, Zap, Pill, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

export function LogNutrition() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  const [logDate,    setLogDate]    = useState(today);
  const [protein,    setProtein]    = useState(0);
  const [carbs,      setCarbs]      = useState(0);
  const [fats,       setFats]       = useState(0);
  const [fiber,      setFiber]      = useState(0);
  const [zinc,       setZinc]       = useState(0);
  const [magnesium,  setMagnesium]  = useState(0);
  const [iron,       setIron]       = useState(0);
  const [creatine,   setCreatine]   = useState(0);
  const [omega3,     setOmega3]     = useState(0);
  const [notes,      setNotes]      = useState('');
  const [saving,     setSaving]     = useState(false);

  // Existing log state
  const [existingLogId, setExistingLogId] = useState<number | null>(null);
  const [isUpdate,      setIsUpdate]      = useState(false);
  const [checking,      setChecking]      = useState(false);

  const calories = Math.round(protein * 4 + carbs * 4 + fats * 9);

  // Check for existing log whenever date changes
  useEffect(() => {
    if (!user || !logDate) return;
    setChecking(true);
    api.get(`/nutrition/user/${user.id}/date/${logDate}`)
      .then(res => {
        const log = res.data;
        // Pre-fill form with existing values
        setExistingLogId(log.id);
        setIsUpdate(true);
        setProtein(log.protein);
        setCarbs(log.carbs);
        setFats(log.fats);
        setFiber(log.fiber);
        setZinc(log.zinc);
        setMagnesium(log.magnesium);
        setIron(log.iron);
        setCreatine(log.creatine);
        setOmega3(log.omega3);
        setNotes(log.notes ?? '');
      })
      .catch(() => {
        // 404 = no log for this date, reset to blank
        setExistingLogId(null);
        setIsUpdate(false);
        setProtein(0); setCarbs(0); setFats(0); setFiber(0);
        setZinc(0); setMagnesium(0); setIron(0); setCreatine(0);
        setOmega3(0); setNotes('');
      })
      .finally(() => setChecking(false));
  }, [logDate, user]);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const payload = {
        logDate:   `${logDate}T12:00:00.000Z`,
        protein, carbs, fats, fiber,
        zinc, magnesium, iron, creatine, omega3,
        notes: notes || null,
      };

      if (isUpdate && existingLogId) {
        await api.put(`/nutrition/${existingLogId}`, payload);
        toast.success('Nutrition log updated!');
      } else {
        await api.post('/nutrition/log', payload);
        toast.success('Nutrition logged!');
      }
      navigate('/nutrition');
    } catch (err: any) {
      const msg = err.response?.data ?? err.message ?? 'Unknown error';
      toast.error(`Failed to save: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    } finally {
      setSaving(false);
    }
  };

  const numInput = (
    val: number,
    setter: (v: number) => void,
    unit: string,
    label: string,
    icon: React.ReactNode
  ) => (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">{label}</span>
      </div>
      <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
        <input
          type="number"
          min={0}
          value={val}
          onChange={e => setter(Math.max(0, parseFloat(e.target.value) || 0))}
          className="bg-transparent text-white font-bold w-full outline-none"
        />
        <span className="text-[#8B8CA8] text-sm font-medium">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-[#0B0B0F] text-white font-sans flex flex-col relative">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-6 bg-[#0B0B0F]/90 backdrop-blur-md z-10 border-b border-[#2A2A35]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#181820] flex items-center justify-center border border-[#2A2A35]">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">
          {isUpdate ? 'Update Nutrition' : 'Log Nutrition'}
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-6 no-scrollbar">

        {/* Update banner */}
        {isUpdate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-2xl px-4 py-3">
            <RefreshCw className="w-4 h-4 text-[#818CF8] flex-shrink-0" />
            <p className="text-[#818CF8] text-sm font-semibold">
              You already logged this day. Saving will update the existing entry.
            </p>
          </motion.div>
        )}

        {/* Total Calories */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider mb-1">TOTAL CALORIES</div>
            <div className="text-3xl font-bold text-white flex items-baseline gap-1">
              {checking ? <span className="text-[#8B8CA8] text-2xl">...</span> : calories}
              <span className="text-sm font-normal text-[#8B8CA8]">kcal</span>
            </div>
            <div className="text-[10px] text-[#8B8CA8] mt-1">Auto-calculated from macros</div>
          </div>
          <div className="w-12 h-12 rounded-full border border-[#2A2A35] flex items-center justify-center bg-[#5C5CFF]/10">
            <Activity className="w-6 h-6 text-[#5C5CFF]" />
          </div>
        </motion.div>

        {/* Date */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#5C5CFF]" />
            <h3 className="font-bold text-white text-sm">Date</h3>
          </div>
          <div className="bg-[#181820] border border-[#2A2A35] rounded-xl flex items-center px-4 py-3">
            <input
              type="date"
              value={logDate}
              max={today}
              onChange={e => setLogDate(e.target.value)}
              className="bg-transparent text-white font-medium outline-none w-full"
            />
          </div>
        </motion.div>

        {/* Macronutrients */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Macronutrients</h3>
          <div className="grid grid-cols-2 gap-4">
            {numInput(protein,   setProtein,  'g',  'PROTEIN',   <Beef     className="w-3.5 h-3.5 text-[#EF4444]" />)}
            {numInput(carbs,     setCarbs,    'g',  'CARBS',     <Wheat    className="w-3.5 h-3.5 text-[#F59E0B]" />)}
            {numInput(fats,      setFats,     'g',  'FATS',      <Droplets className="w-3.5 h-3.5 text-[#3B82F6]" />)}
            {numInput(fiber,     setFiber,    'g',  'FIBER',     <Leaf     className="w-3.5 h-3.5 text-[#10B981]" />)}
          </div>
        </motion.div>

        {/* Micronutrients */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Micronutrients</h3>
          <div className="grid grid-cols-2 gap-4">
            {numInput(zinc,      setZinc,      'mg', 'ZINC',      <Zap className="w-3.5 h-3.5 text-[#8B8CA8]" />)}
            {numInput(magnesium, setMagnesium, 'mg', 'MAGNESIUM', <Zap className="w-3.5 h-3.5 text-[#8B8CA8]" />)}
            {numInput(iron,      setIron,      'mg', 'IRON',      <Zap className="w-3.5 h-3.5 text-[#8B8CA8]" />)}
          </div>
        </motion.div>

        {/* Supplements */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Supplements</h3>
          <div className="grid grid-cols-2 gap-4">
            {numInput(creatine, setCreatine, 'g', 'CREATINE', <Pill className="w-3.5 h-3.5 text-[#5C5CFF]" />)}
            {numInput(omega3,   setOmega3,   'g', 'OMEGA-3',  <Pill className="w-3.5 h-3.5 text-[#5C5CFF]" />)}
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="font-bold text-white text-sm mb-2">Notes</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add any specific meals or notes here..."
            className="w-full bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 text-white placeholder:text-[#8B8CA8] outline-none min-h-[100px] resize-none focus:border-[#6366F1] transition-colors"
          />
        </motion.div>

      </div>

      <div className="flex-shrink-0 p-6 bg-[#0B0B0F] border-t border-[#2A2A35]">
        <button
          onClick={handleSave}
          disabled={saving || checking}
          className="w-full bg-[#5C5CFF] hover:bg-[#4B4BFF] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(92,92,255,0.3)]"
        >
          {saving ? 'SAVING...' : isUpdate ? 'UPDATE LOG' : 'SAVE LOG'}
        </button>
      </div>
    </div>
  );
}
