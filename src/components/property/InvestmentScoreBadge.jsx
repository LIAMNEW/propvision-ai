import React from "react";

const SCORE_CONFIG = {
  "A+": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", glow: "shadow-emerald-500/10" },
  "A":  { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30", glow: "shadow-indigo-500/10" },
  "B+": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", glow: "shadow-blue-500/10" },
  "B":  { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/30", glow: "shadow-sky-500/10" },
  "C":  { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", glow: "shadow-amber-500/10" },
  "D":  { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", glow: "shadow-orange-500/10" },
  "F":  { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", glow: "shadow-red-500/10" },
};

export default function InvestmentScoreBadge({ score, size = "md" }) {
  const config = SCORE_CONFIG[score] || SCORE_CONFIG["C"];
  const sizeClasses = size === "lg"
    ? "px-3 py-1.5 text-sm font-bold"
    : "px-2 py-0.5 text-xs font-semibold";

  return (
    <span className={`
      inline-flex items-center rounded-lg border
      ${config.bg} ${config.text} ${config.border} ${config.glow}
      shadow-lg ${sizeClasses}
    `}>
      {score}
    </span>
  );
}