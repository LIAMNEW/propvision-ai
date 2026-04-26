import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Compass, LineChart, Map, MapPin, Briefcase, Bell, Settings as SettingsIcon,
  LogOut, User as UserIcon, TrendingUp, GitCompare, Calculator, TrendingDown
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { name: "Discover", icon: Compass, page: "Discover" },
  { name: "Intelligence", icon: LineChart, page: "Intelligence" },
  { name: "Map", icon: Map, page: "Map" },
  { name: "Suburbs", icon: MapPin, page: "Suburbs" },
  { name: "Compare", icon: GitCompare, page: "SuburbCompare" },
  { name: "Portfolio", icon: Briefcase, page: "Portfolio" },
  { name: "Alerts", icon: Bell, page: "Alerts" },
];

const TOOLS_ITEMS = [
  { name: "Mortgage Calculator", icon: Calculator, page: "MortgageCalculator" },
  { name: "Depreciation Schedule", icon: TrendingDown, page: "DepreciationCalculator" },
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
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#050810" }}>
      {/* Top Nav */}
      <header
        className="h-16 border-b flex items-center px-6"
        style={{
          background: "rgba(13,18,35,0.85)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3 mr-8">
          <div className="w-9 h-9 rounded-xl gradient-indigo flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                PropVision AI
              </span>
            </h1>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
        </div>

        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPageName === item.page;
            const showBadge = item.page === "Alerts" && unreadCount > 0;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Tools dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className={`hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all mr-1 ${
            TOOLS_ITEMS.some(t => t.page === currentPageName)
              ? "text-indigo-400 bg-indigo-500/10"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
          }`}>
            <Calculator className="w-4 h-4" />
            <span>Tools</span>
            <ChevronDown className="w-3 h-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0d1223] border-white/[0.08] w-52">
            {TOOLS_ITEMS.map((item) => (
              <DropdownMenuItem key={item.page} asChild className="text-gray-300 focus:bg-white/[0.06] focus:text-white cursor-pointer">
                <Link to={createPageUrl(item.page)} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.full_name?.charAt(0) || "U"}
                </span>
              </div>
              <span className="text-sm text-gray-300 hidden sm:inline">{user?.full_name || "User"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0d1223] border-white/[0.08]"
            >
              <DropdownMenuItem
                onClick={() => navigate(createPageUrl("Settings"))}
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
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Mobile bottom nav — show first 6 core items */}
      <nav
        className="lg:hidden h-16 border-t flex items-center justify-around px-2"
        style={{
          background: "rgba(13,18,35,0.95)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {NAV_ITEMS.slice(0, 6).map((item) => {
          const isActive = currentPageName === item.page;
          const showBadge = item.page === "Alerts" && unreadCount > 0;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all ${
                isActive ? "text-indigo-400" : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.name}</span>
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