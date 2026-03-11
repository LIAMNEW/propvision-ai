import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search, Compass, MapPin, Briefcase, Bell,
  ChevronLeft, ChevronRight, TrendingUp, LogOut, Menu, X
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAV_ITEMS = [
  { name: "Discover", icon: Compass, page: "Discover" },
  { name: "Suburbs", icon: MapPin, page: "Suburbs" },
  { name: "Portfolio", icon: Briefcase, page: "Portfolio" },
  { name: "Alerts", icon: Bell, page: "Alerts" },
];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#050810" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 h-full flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          ${mobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
              PropVision <span className="text-indigo-400">AI</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-indigo-400" : ""}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-12 border-t border-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8"
          style={{
            background: "rgba(5,8,16,0.8)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">{currentPageName}</h1>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}