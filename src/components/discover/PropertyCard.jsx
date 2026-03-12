import React from "react";
import { Bed, Bath, Car, Heart } from "lucide-react";
import { motion } from "framer-motion";

const SCORE_CONFIG = {
  "A+": "gradient-emerald",
  "A": "gradient-indigo",
  "B+": "gradient-blue",
  "B": "gradient-amber",
  "C": "gradient-red",
  "D": "gradient-red",
  "F": "gradient-red",
};

export default function PropertyCard({ property, isSaved, onToggleSave, onClick }) {
  const scoreClass = SCORE_CONFIG[property.investment_score] || "gradient-amber";
  const cashflow = property.weekly_cashflow || 0;
  const isPositive = cashflow >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="card-hover rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "rgba(13,18,35,0.9)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Image */}
      <div className="relative h-42 overflow-hidden">
        <img
          src={property.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"}
          alt={property.address}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Score badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`${scoreClass} px-3 py-1 rounded-lg text-white text-xs font-bold shadow-lg`}
          >
            {property.investment_score || "C"}
          </span>
        </div>

        {/* Risk */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
              property.risk_level === "Low"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : property.risk_level === "Medium"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {property.risk_level || "Medium"} Risk
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-lg">
            ${property.price?.toLocaleString() || "N/A"}
          </p>
        </div>

        {/* Gearing */}
        <div className="absolute bottom-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
              isPositive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isPositive ? "+ve Cash Flow" : "-ve Geared"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate">{property.address}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {property.suburb}, {property.state} {property.postcode}
        </p>

        {/* Beds/Baths/Cars */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" /> {property.bedrooms || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" /> {property.bathrooms || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Car className="w-3.5 h-3.5" /> {property.car_spaces || "—"}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "Yield", value: `${property.rental_yield?.toFixed(1) || "—"}%`, color: "text-emerald-400" },
            { label: "5yr Growth", value: `${property.capital_growth_5yr?.toFixed(1) || "—"}%`, color: "text-indigo-400" },
            { label: "Vacancy", value: `${property.vacancy_rate?.toFixed(1) || "—"}%`, color: "text-amber-400" },
            {
              label: "Weekly",
              value: `${isPositive ? "+" : ""}$${Math.abs(cashflow).toFixed(0)}`,
              color: isPositive ? "text-emerald-400" : "text-red-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-[9px] text-gray-500 uppercase">{stat.label}</p>
              <p className={`text-xs font-semibold ${stat.color} mt-0.5`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        {property.ai_summary && (
          <div
            className="mt-3 p-3 rounded-lg"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
          >
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{property.ai_summary}</p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(property);
          }}
          className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isSaved
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]"
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
          {isSaved ? "Saved" : "Save to Portfolio"}
        </button>
      </div>
    </motion.div>
  );
}