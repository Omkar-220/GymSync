import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Activity, Calendar, Beef, Wheat, Droplets, Leaf, Zap, Pill } from 'lucide-react';

export function LogNutrition() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-[#0B0B0F] text-white font-sans flex flex-col relative">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-6 bg-[#0B0B0F]/90 backdrop-blur-md z-10 border-b border-[#2A2A35]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#181820] flex items-center justify-center border border-[#2A2A35]">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">Log Nutrition</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-6 no-scrollbar">
        
        {/* Total Calories */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider mb-1">TOTAL CALORIES</div>
            <div className="text-3xl font-bold text-white flex items-baseline gap-1">
              0 <span className="text-sm font-normal text-[#8B8CA8]">kcal</span>
            </div>
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
          <div className="bg-[#181820] border border-[#2A2A35] rounded-xl flex items-center justify-between px-4 py-3">
            <input 
              type="text" 
              defaultValue="09-04-2026" 
              className="bg-transparent text-white font-medium outline-none w-full"
            />
            <Calendar className="w-5 h-5 text-[#8B8CA8]" />
          </div>
        </motion.div>

        {/* Macronutrients */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Macronutrients</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Beef className="w-3.5 h-3.5 text-[#EF4444]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">PROTEIN</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">g</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Wheat className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">CARBS</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">g</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Droplets className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">FATS</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">g</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Leaf className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">FIBER</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">g</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Micronutrients */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Micronutrients</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#8B8CA8]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">ZINC</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">mg</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#8B8CA8]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">MAGNESIUM</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">mg</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#8B8CA8]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">IRON</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">mg</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supplements */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Supplements</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Pill className="w-3.5 h-3.5 text-[#5C5CFF]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">CREATINE</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">g</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Pill className="w-3.5 h-3.5 text-[#5C5CFF]" />
                <span className="text-[10px] font-bold text-[#8B8CA8] uppercase tracking-wider">OMEGA-3</span>
              </div>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-xl flex items-center px-3 py-2">
                <input type="number" defaultValue={0} className="bg-transparent text-white font-bold w-full outline-none" />
                <span className="text-[#8B8CA8] text-sm font-medium">g</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="font-bold text-white text-sm mb-2">Notes</h3>
          <textarea 
            placeholder="Add any specific meals or notes here..."
            className="w-full bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 text-white placeholder:text-[#8B8CA8] outline-none min-h-[100px] resize-none"
          />
        </motion.div>

      </div>

      <div className="flex-shrink-0 p-6 bg-[#0B0B0F] border-t border-[#2A2A35]">
        <button className="w-full bg-[#5C5CFF] hover:bg-[#4B4BFF] text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(92,92,255,0.3)]">
          SAVE LOG
        </button>
      </div>

    </div>
  );
}
