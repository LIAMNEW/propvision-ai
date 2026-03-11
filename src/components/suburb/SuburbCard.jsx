import React from "react";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, Home, Percent } from "lucide-react";

function getScoreColor(score) {
  if (score >= 80) return { ring: "border-emerald-500/40", text: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (score >= 60) return { ring: "border-indigo-500/40", text: "text-indigo-400", bg: "bg-indigo-500/10" };
  if (score >= 40) return { ring: "border-blue-500/40", text: "text-blue-400", bg: "bg-blue-500/10" };
  return { ring: "border-amber-500/40", text: "text-amber-400", bg: "bg-amber-500/10" };
}

export default function SuburbCard({ suburb }) {
  const colors = getScoreColor(suburb.suburb_score || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card glass-card-hover rounded-2xl p-5 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">{suburb.suburb}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 ml-6">{suburb.state}</p>
        </div>

        {/* Score circle */}
        <div className={`w-14 h-14 rounded-full border-2 ${colors.ring} ${colors.bg} flex flex-col items-center justify-center`}>
          <span className={`text-lg font-bold leading-none ${colors.text}`}>{suburb.suburb_score || "—"}</span>
          <span className="text-[8px] text-gray-500 uppercase mt-0.5">Score</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <Home className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-white">
            ${suburb.median_house_price ? (suburb.median_house_price / 1000).toFixed(0) + "k" : "—"}
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5">Median Price</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <Percent className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-emerald-400">
            {suburb.gross_rental_yield ? `${suburb.gross_rental_yield}%` : "—"}
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5">Yield</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <TrendingUp className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-indigo-400">
            {suburb.population_growth ? `${suburb.population_growth}%` : "—"}
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5">Pop. Growth</p>
        </div>
      </div>

      {/* AI Summary */}
      {suburb.ai_suburb_summary && (
        <p className="text-xs text-gray-400 mt-4 leading-relaxed line-clamp-3">
          {suburb.ai_suburb_summary}
        </p>
      )}
    </motion.div>
  );
}