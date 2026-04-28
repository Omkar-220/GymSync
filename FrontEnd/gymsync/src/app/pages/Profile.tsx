import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Settings, Award, Flame, Calendar, ChevronRight, Activity, LogOut, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get(`/user/${user.id}`)
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const stats = [
    {
      label: 'Workouts',
      value: loading ? '—' : String(profile?.statistics?.totalWorkouts ?? 0),
      icon: Activity,
      color: 'text-[#6366F1]',
      bg: 'bg-[#6366F1]/10',
    },
    {
      label: 'Streak',
      value: loading ? '—' : `${profile?.statistics?.currentStreak ?? 0}d`,
      icon: Flame,
      color: 'text-[#F97316]',
      bg: 'bg-[#F97316]/10',
    },
    {
      label: 'Volume',
      value: loading ? '—' : (() => {
        const v = profile?.statistics?.totalVolume ?? 0;
        return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v));
      })(),
      icon: Calendar,
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/10',
    },
  ];

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'
    : user?.username?.[0]?.toUpperCase() || '?';

  const handleExportCSV = async () => {
    if (!user) return;
    try {
      const [workoutsRes, nutritionRes, prsRes] = await Promise.all([
        api.get(`/workout/user/${user.id}`),
        api.get(`/nutrition/user/${user.id}`),
        api.get(`/personalrecord/user/${user.id}`),
      ]);

      // Fetch full workout details (sets) for each completed workout
      const completedWorkouts = workoutsRes.data.filter((w: any) => !w.isSkipped && w.isCompleted);
      const detailResults = await Promise.all(
        completedWorkouts.map((w: any) => api.get(`/workout/${w.id}`))
      );

      // Workouts summary CSV
      const wRows = ['Date,Split,Volume (kg),Duration (min),Sets']
        .concat(completedWorkouts.map((w: any) =>
          `${new Date(w.workoutDate).toLocaleDateString()},${w.splitTag},${w.totalVolume},${w.durationMinutes},${w.totalSets}`
        ));

      // Workout sets CSV (exercise-level detail)
      const sRows = ['Date,Split,Exercise,Muscle Group,Set #,Weight (kg),Reps,Form Quality,Perceived Exertion,Estimated 1RM'];
      detailResults.forEach(res => {
        const wo = res.data;
        const date = new Date(wo.workoutDate).toLocaleDateString();
        wo.sets?.forEach((s: any) => {
          sRows.push(`${date},${wo.splitTag},${s.exerciseName},${s.muscleGroup},${s.setNumber},${s.weight},${s.reps},${s.formQuality},${s.perceivedExertion ?? ''},${s.estimatedOneRepMax?.toFixed(1) ?? ''}`);
        });
      });

      // Personal Records CSV
      const prRows = ['Exercise,Type,Value (kg),Reps,Achieved At,Previous Record (kg)']
        .concat(prsRes.data.map((pr: any) =>
          `${pr.exerciseName},${pr.typeDisplayName},${pr.value},${pr.reps},${new Date(pr.achievedAt).toLocaleDateString()},${pr.previousRecord ?? ''}`
        ));

      // Nutrition CSV
      const nRows = ['Date,Calories,Protein (g),Carbs (g),Fats (g),Fiber (g),Zinc (mg),Magnesium (mg),Iron (mg),Omega-3 (g),Creatine (g),Notes']
        .concat(nutritionRes.data.map((n: any) =>
          `${new Date(n.logDate).toLocaleDateString()},${Math.round(n.calories)},${n.protein},${n.carbs},${n.fats},${n.fiber},${n.zinc},${n.magnesium},${n.iron},${n.omega3},${n.creatine},${n.notes ?? ''}`
        ));

      const csv = [
        'WORKOUT SUMMARY', wRows.join('\n'),
        '', 'WORKOUT SETS (DETAILED)', sRows.join('\n'),
        '', 'PERSONAL RECORDS', prRows.join('\n'),
        '', 'NUTRITION LOGS', nRows.join('\n'),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `gymsync-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch { toast.error('Export failed'); }
  };

  const SETTINGS_GROUPS = [
    {
      title: 'Data',
      items: [
        { id: 'export', label: 'Export Logs (CSV)', icon: Download, action: handleExportCSV },
        { id: 'goals',  label: 'Fitness Goals',     icon: Award,    action: () => navigate('/goals') },
      ],
    },
  ];

  return (
    <div className="relative text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6 sticky top-0 bg-[#0F0F12]/90 backdrop-blur-md z-10 border-b border-[#2A2A35]">
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
        <button className="text-[#8B8CA8] hover:text-white transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <div className="px-5 py-6 space-y-8">

        {/* User Info Card */}
        <div className="flex flex-col items-center">
          {/* Avatar — initials fallback */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-[#6366F1] p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center">
                <span className="text-2xl font-black text-white">{initials}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-7 w-40 bg-[#1A1A24] rounded-xl animate-pulse" />
              <div className="h-4 w-28 bg-[#1A1A24] rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">
                {profile?.fullName || user?.username || 'User'}
              </h2>
              <p className="text-[#8B8CA8] text-sm mt-1">
                @{user?.username}
              </p>
              {joinedDate && (
                <p className="text-[#8B8CA8] text-xs mt-0.5">Joined {joinedDate}</p>
              )}
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-4 flex flex-col items-center justify-center text-center"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold text-white leading-tight">{stat.value}</p>
              <p className="text-[10px] text-[#8B8CA8] uppercase font-bold tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* BMI card if available */}
        {profile?.bmi && (
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-1">BMI</p>
              <p className="text-2xl font-bold text-white">{profile.bmi}</p>
            </div>
            <div className="text-right">
              {profile.weight && <p className="text-sm text-[#8B8CA8]">{profile.weight} kg</p>}
              {profile.height && <p className="text-sm text-[#8B8CA8]">{profile.height} cm</p>}
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {SETTINGS_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <h3 className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider ml-2">{group.title}</h3>
              <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl overflow-hidden">
                {group.items.map((item, itemIdx) => (
                  <div key={item.id}>
                    <button
                      onClick={(item as any).action}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#2A2A35]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-[#0F0F12] border border-[#2A2A35]/50 flex items-center justify-center text-[#8B8CA8]">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-white">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#4A4A5C]" />
                    </button>
                    {itemIdx < group.items.length - 1 && (
                      <div className="h-[1px] bg-[#2A2A35] ml-16" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border border-[#EF4444]/30 text-[#EF4444] font-bold flex items-center justify-center gap-2 hover:bg-[#EF4444]/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          LOG OUT
        </motion.button>

      </div>
    </div>
  );
}
