import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Compass, Building2, Briefcase, Bell, Settings as SettingsIcon,
  LogOut, TrendingUp
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { name: "Discover", icon: Compass, page: "Discover" },
  { name: "Suburb Intel", icon: Building2, page: "SuburbIntelligence" },
  { name: "Portfolio", icon: Briefcase, page: "Portfolio" },
  { name: "Alerts", icon: Bell, page: "Alerts" },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.MarketAlert.list("-created_date", 100),
  });

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (!u.onboarding_complete && currentPageName !== "Onboarding") {
        navigate("/Onboarding");
      }
    }).catch(() => {});
  }, [currentPageName, navigate]);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  if (currentPageName === "Onboarding") {
    return children;
  }

  return (
    <div className="flex h-screen" style={{ background: "#050810" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 border-r"
        style={{
          background: "rgba(13,18,35,0.9)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">PropVision AI</h1>
              <p className="text-[10px] text-gray-500">Find Your Edge</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPageName === item.page;
            const showBadge = item.page === "Alerts" && unreadCount > 0;
            return (
              <Link
                key={item.page}
                to={`/${item.page}`}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "text-white bg-indigo-500/20 border border-indigo-500/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {showBadge && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.full_name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">{user?.full_name || "User"}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0d1223] border-white/[0.08]"
            >
              <DropdownMenuItem
                onClick={() => navigate("/Settings")}
                className="text-gray-300 focus:bg-white/[0.06] focus:text-white cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-gray-300 focus:bg-white/[0.06] focus:text-white cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-2 z-50"
        style={{
          background: "rgba(13,18,35,0.95)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = currentPageName === item.page;
          const showBadge = item.page === "Alerts" && unreadCount > 0;
          return (
            <Link
              key={item.page}
              to={`/${item.page}`}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive ? "text-indigo-400" : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
              {showBadge && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}