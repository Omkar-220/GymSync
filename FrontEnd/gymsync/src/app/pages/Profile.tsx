import React from 'react';
import { motion } from 'motion/react';
import { Settings, Award, Flame, Calendar, ChevronRight, Activity, LogOut, Bell, Shield, Moon, User } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const USER_AVATAR = "https://images.unsplash.com/photo-1582760415700-b46884ceab0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXQlMjBhdGhsZXRpYyUyMHBlcnNvbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzU2MjY2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const STATS = [
  { label: 'Workouts', value: '142', icon: Activity, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' },
  { label: 'Streak', value: '12 Days', icon: Flame, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' },
  { label: 'Hours', value: '185', icon: Calendar, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
];

const SETTINGS_GROUPS = [
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Personal Information', icon: User, color: 'text-white' },
      { id: 'goals', label: 'Fitness Goals', icon: Award, color: 'text-white' },
      { id: 'privacy', label: 'Privacy & Security', icon: Shield, color: 'text-white' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-white' },
      { id: 'theme', label: 'Dark Mode', icon: Moon, color: 'text-white', isToggle: true, toggleState: true },
    ]
  }
];

export function Profile() {
  return (
    <div className="relative min-h-full pb-24 text-white">
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
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-[#6366F1] p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1A24]">
                <ImageWithFallback 
                  src={USER_AVATAR} 
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#2A2A35] border-4 border-[#0F0F12] rounded-full flex items-center justify-center text-xs">
              👑
            </div>
          </div>
          
          <h2 className="text-2xl font-bold">Alex Johnson</h2>
          <p className="text-[#8B8CA8] text-sm mt-1">Joined January 2026</p>
          
          <div className="mt-4 px-4 py-1.5 bg-[#6366F1]/20 text-[#6366F1] rounded-full text-xs font-bold uppercase tracking-wider">
            Pro Member
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((stat, idx) => (
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

        {/* Settings Sections */}
        <div className="space-y-6">
          {SETTINGS_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <h3 className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider ml-2">{group.title}</h3>
              <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl overflow-hidden">
                {group.items.map((item, itemIdx) => (
                  <div key={item.id}>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-[#2A2A35]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-[#0F0F12] border border-[#2A2A35]/50 flex items-center justify-center text-[#8B8CA8]">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-white">{item.label}</span>
                      </div>
                      
                      {item.isToggle ? (
                        <div className="w-12 h-7 bg-[#6366F1] rounded-full relative">
                          <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm" />
                        </div>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#4A4A5C]" />
                      )}
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
          className="w-full py-4 rounded-2xl border border-[#EF4444]/30 text-[#EF4444] font-bold flex items-center justify-center gap-2 hover:bg-[#EF4444]/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          LOG OUT
        </motion.button>
      </div>
    </div>
  );
}
