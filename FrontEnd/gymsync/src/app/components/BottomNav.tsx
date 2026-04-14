import React from 'react';
import { NavLink } from 'react-router';
import { Activity, History, TrendingUp, User } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { icon: Activity, label: 'Home', path: '/' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Activity, label: 'Nutrition', path: '/nutrition' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#181820]/95 backdrop-blur-md border-t border-[#2A2A35] flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${
              isActive ? 'text-[#5C5CFF]' : 'text-[#8B8CA8] hover:text-white'
            }`
          }
        >
          <item.icon size={24} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
