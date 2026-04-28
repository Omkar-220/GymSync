import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Award, Flame, Medal, Shield, Star, Zap, TrendingUp, Activity, Trophy, Target, Lock } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

type Achievement = { key: string; label: string; description: string; iconHint: string; achievedAt: string };

const ALL_ACHIEVEMENTS: { key: string; label: string; description: string; iconHint: string }[] = [
  { key: 'FirstWorkout',     label: 'First Step',        description: 'Complete your first workout',          iconHint: 'activity'    },
  { key: 'Workouts10',       label: 'Getting Serious',   description: 'Complete 10 workouts',                 iconHint: 'trending-up' },
  { key: 'Workouts50',       label: 'Dedicated',         description: 'Complete 50 workouts',                 iconHint: 'shield'      },
  { key: 'Workouts100',      label: 'Century Club',      description: 'Complete 100 workouts',                iconHint: 'medal'       },
  { key: 'Streak7',          label: 'Week Warrior',      description: 'Maintain a 7-day streak',              iconHint: 'flame'       },
  { key: 'Streak30',         label: 'Iron Discipline',   description: 'Maintain a 30-day streak',             iconHint: 'zap'         },
  { key: 'Volume1K',         label: '1K Club',           description: 'Lift 1,000 kg total',                  iconHint: 'award'       },
  { key: 'Volume10K',        label: '10K Club',          description: 'Lift 10,000 kg total',                 iconHint: 'award'       },
  { key: 'Volume100K',       label: '100K Club',         description: 'Lift 100,000 kg total',                iconHint: 'star'        },
  { key: 'FirstPR',          label: 'First PR',          description: 'Set your first personal record',       iconHint: 'star'        },
  { key: 'PRs10',            label: 'PR Machine',        description: 'Set 10 personal records',              iconHint: 'trophy'      },
  { key: 'NutritionStreak7', label: 'Nutrition Streak',  description: 'Log nutrition 7 days in a row',        iconHint: 'target'      },
];

function iconForHint(hint: string): { icon: React.ElementType; color: string; bg: string } {
  switch (hint) {
    case 'flame':       return { icon: Flame,      color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' };
    case 'medal':       return { icon: Medal,      color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' };
    case 'shield':      return { icon: Shield,     color: 'text-[#5C5CFF]', bg: 'bg-[#5C5CFF]/10' };
    case 'star':        return { icon: Star,       color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
    case 'zap':         return { icon: Zap,        color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' };
    case 'trending-up': return { icon: TrendingUp, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' };
    case 'activity':    return { icon: Activity,   color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
    case 'trophy':      return { icon: Trophy,     color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' };
    case 'target':      return { icon: Target,     color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
    default:            return { icon: Award,      color: 'text-[#8B8CA8]', bg: 'bg-[#8B8CA8]/10' };
  }
}

export function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [earned, setEarned] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get(`/achievement/user/${user.id}`)
      .then(res => setEarned(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const earnedKeys = new Set(earned.map(a => a.key));

  const earnedList = ALL_ACHIEVEMENTS.filter(a => earnedKeys.has(a.key)).map(a => ({
    ...a,
    achievedAt: earned.find(e => e.key === a.key)!.achievedAt,
  }));
  const lockedList = ALL_ACHIEVEMENTS.filter(a => !earnedKeys.has(a.key));

  return (
    <div className="relative text-white">
      <header className="flex items-center gap-3 p-6 sticky top-0 bg-[#0F0F12]/90 backdrop-blur-md z-10 border-b border-[#2A2A35]">
        <button onClick={() => navigate(-1)} className="text-[#8B8CA8] hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Achievements</h1>
        <span className="ml-auto text-xs text-[#8B8CA8] font-bold">{earnedList.length}/{ALL_ACHIEVEMENTS.length}</span>
      </header>

      <div className="px-5 py-6 space-y-8">

        {/* Earned */}
        {earnedList.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-3">Earned</h2>
            <div className="space-y-3">
              {earnedList.map(a => {
                const { icon: Icon, color, bg } = iconForHint(a.iconHint);
                return (
                  <div key={a.key} className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 flex items-center gap-4">
                    <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center shrink-0', bg)}>
                      <Icon className={clsx('w-6 h-6', color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white">{a.label}</p>
                      <p className="text-xs text-[#8B8CA8] mt-0.5">{a.description}</p>
                    </div>
                    <p className="text-[10px] text-[#8B8CA8] shrink-0">
                      {new Date(a.achievedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Locked */}
        {lockedList.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-3">Locked</h2>
            <div className="space-y-3">
              {lockedList.map(a => (
                <div key={a.key} className="bg-[#181820] border border-[#2A2A35] rounded-2xl p-4 flex items-center gap-4 opacity-50">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#2A2A35]">
                    <Lock className="w-5 h-5 text-[#8B8CA8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white">{a.label}</p>
                    <p className="text-xs text-[#8B8CA8] mt-0.5">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-[#181820] rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
