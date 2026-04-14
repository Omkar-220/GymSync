import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { BottomNav } from './BottomNav';

export function MobileWrapper() {
  const location = useLocation();
  const hideNav = location.pathname === '/workout' || location.pathname === '/complete' || location.pathname === '/create' || location.pathname === '/split' || location.pathname === '/nutrition/log';

  return (
    <div className="flex justify-center bg-black min-h-screen font-sans text-white sm:p-4">
      <div className="w-full max-w-[390px] bg-[#0B0B0F] sm:rounded-3xl sm:h-[844px] sm:overflow-hidden relative flex flex-col shadow-2xl overflow-hidden">
        <div className={`flex-1 overflow-y-auto no-scrollbar flex flex-col ${hideNav ? '' : 'pb-24'}`}>
          <Outlet />
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
