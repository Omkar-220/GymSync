import React from "react";
import { User, Dumbbell, Play, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

const exercises = [
  { id: 1, name: "Barbell Bench Press", muscle: "Chest", sets: 3, reps: "8-12" },
  { id: 2, name: "Incline Dumbbell Press", muscle: "Chest", sets: 3, reps: "10-12" },
  { id: 3, name: "Overhead Press", muscle: "Shoulders", sets: 4, reps: "8-10" },
  { id: 4, name: "Lateral Raises", muscle: "Shoulders", sets: 3, reps: "15-20" },
  { id: 5, name: "Tricep Pushdowns", muscle: "Triceps", sets: 3, reps: "12-15" },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col p-6 pt-12 pb-32 min-h-full h-full relative overflow-y-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-300 bg-clip-text text-transparent">GymSync</h1>
          <p className="text-[#8B8CA8] text-sm mt-1">Ready to crush it?</p>
        </div>
        <button className="w-12 h-12 rounded-full bg-[#1A1A24] border border-white/5 flex items-center justify-center hover:bg-[#2A2A35] transition-colors">
          <User className="w-5 h-5 text-indigo-400" />
        </button>
      </header>

      {/* Day Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 shrink-0">
        <Card className="bg-gradient-to-br from-indigo-900/40 to-[#1A1A24] border-indigo-500/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 uppercase tracking-wider mb-3">
                Hypertrophy
              </span>
              <h2 className="text-2xl font-bold text-white mb-1">Push Day</h2>
              <p className="text-[#8B8CA8] text-sm flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4" /> 5 Exercises • 60 mins
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Exercise List */}
      <div className="flex-1 mb-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Today's Plan</h3>
          <button className="text-indigo-400 text-sm font-medium hover:text-indigo-300">Edit</button>
        </div>

        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <motion.div 
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4 flex items-center justify-between group hover:bg-[#2A2A35] transition-colors cursor-pointer border-transparent">
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[15px] leading-tight mb-1">{ex.name}</span>
                  <div className="flex items-center gap-2 text-xs text-[#8B8CA8]">
                    <span>{ex.muscle}</span>
                    <span className="w-1 h-1 rounded-full bg-[#8B8CA8]/30"></span>
                    <span>{ex.sets} sets x {ex.reps}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1A1A24] flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 text-[#8B8CA8] transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Button - Sticky Bottom */}
      <div className="absolute bottom-6 left-6 right-6 pt-4 bg-gradient-to-t from-[#0A0A0F] to-transparent">
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]"
          onClick={() => navigate("/workout")}
        >
          START WORKOUT
        </Button>
      </div>
    </div>
  );
}
