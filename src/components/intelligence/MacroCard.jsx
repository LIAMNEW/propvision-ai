import React from "react";

export default function MacroCard({ title, value, subtitle, color, progress }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <h3 className="text-xs text-gray-400 mb-2">{title}</h3>
      <p className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</p>
      <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
      {progress !== undefined && (
        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div className={`h-full bg-${color}-500`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}