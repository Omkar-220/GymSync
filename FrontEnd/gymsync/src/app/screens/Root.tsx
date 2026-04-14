import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, History as HistoryIcon, BarChart2, User } from "lucide-react";
import { clsx } from "clsx";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();

  const isWorkoutActive = location.pathname.includes("workout") || location.pathname.includes("summary");

  return (
    <div className="bg-[#0A0A0F] text-white font-sans min-h-screen flex flex-col items-center justify-center sm:bg-black/50">
      <div className="w-full max-w-[390px] h-[844px] max-h-screen bg-[#0A0A0F] relative flex flex-col shadow-2xl overflow-hidden sm:rounded-[40px] sm:border-[8px] sm:border-[#1A1A24]">
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative">
          <Outlet />
        </main>

        {!isWorkoutActive && (
          <nav className="h-20 bg-[#1A1A24]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 pb-4 pt-2 shrink-0 z-50 rounded-t-3xl sm:rounded-b-[32px]">
            <NavItem icon={Home} label="Home" active={location.pathname === "/"} onClick={() => navigate("/")} />
            <NavItem icon={HistoryIcon} label="History" active={location.pathname === "/history"} onClick={() => navigate("/history")} />
            <NavItem icon={BarChart2} label="Progress" active={location.pathname === "/progress"} onClick={() => {}} />
            <NavItem icon={User} label="Profile" active={location.pathname === "/profile"} onClick={() => {}} />
          </nav>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 w-16 p-2 rounded-xl transition-all">
      <Icon className={clsx("w-6 h-6 transition-colors", active ? "text-indigo-500" : "text-[#8B8CA8]")} strokeWidth={active ? 2.5 : 2} />
      <span className={clsx("text-[10px] font-medium transition-colors", active ? "text-indigo-500" : "text-[#8B8CA8]")}>{label}</span>
    </button>
  );
}
