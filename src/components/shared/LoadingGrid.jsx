import React from "react";

export default function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
          <div className="h-48 bg-white/[0.04]" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-white/[0.06] rounded w-3/4" />
            <div className="h-3 bg-white/[0.04] rounded w-1/2" />
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06]">
              <div className="h-8 bg-white/[0.04] rounded" />
              <div className="h-8 bg-white/[0.04] rounded" />
              <div className="h-8 bg-white/[0.04] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}