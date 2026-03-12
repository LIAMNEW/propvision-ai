import React from "react";
import { Target, MapPin, DollarSign } from "lucide-react";

export default function PersonalisationBanner({ user }) {
  if (!user || !user.onboarding_complete) return null;

  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{
        background: "rgba(13,18,35,0.9)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">
            Welcome back, {user.full_name?.split(" ")[0] || "Investor"}
          </h2>
          <p className="text-sm text-gray-400">Your personalised investment dashboard</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.budget_range && (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
              style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}
            >
              <DollarSign className="w-3.5 h-3.5" />
              {user.budget_range}
            </span>
          )}
          {user.risk_appetite && (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
              style={{ background: "rgba(16,185,129,0.15)", color: "#6ee7b7" }}
            >
              <Target className="w-3.5 h-3.5" />
              {user.risk_appetite}
            </span>
          )}
          {user.preferred_states?.length > 0 && (
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
              style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}
            >
              <MapPin className="w-3.5 h-3.5" />
              {user.preferred_states.join(", ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}