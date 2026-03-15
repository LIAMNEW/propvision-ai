import React from "react";
import { Bed, Bath, Car, Heart, Flame, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const SCORE_COLORS = {
  "A+": "#10b981",
  "A": "#6366f1",
  "B+": "#3b82f6",
  "B": "#f59e0b",
  "C": "#ef4444",
  "D": "#ef4444",
  "F": "#ef4444",
};

function getVacancyColor(rate) {
  if (rate < 1.5) return "text-emerald-400";
  if (rate <= 2.5) return "text-amber-400";
  return "text-red-400";
}

export default function PropertyCard({ property, isSaved, onToggleSave, onClick }) {
  const scoreColor = SCORE_COLORS[property.investment_score] || "#ef4444";
  const isGem = (property.investment_score_numeric || 0) >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:transform hover:scale-[1.02]"
      style={{
        background: "rgba(13,18,35,0.9)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"}
          alt={property.address}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Score badge */}
        <div className="absolute top-3 left-3">
          <span
            className="px-3 py-1.5 rounded-xl text-white text-sm font-bold shadow-lg flex items-center gap-1.5"
            style={{ background: scoreColor }}
          >
            {property.investment_score || "C"}
            {isGem && <Flame className="w-4 h-4" />}
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
          <p className="text-white font-bold text-xl">
            ${property.price?.toLocaleString() || "N/A"}
          </p>
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

        {/* Data Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Yield", value: `${property.rental_yield?.toFixed(1) || "—"}%`, color: "text-emerald-400" },
            { label: "5yr Growth", value: `${property.capital_growth_5yr?.toFixed(1) || "—"}%`, color: "text-indigo-400" },
            { label: "Vacancy", value: `${property.vacancy_rate?.toFixed(1) || "—"}%`, color: getVacancyColor(property.vacancy_rate || 3) },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-[9px] text-gray-500 uppercase">{stat.label}</p>
              <p className={`text-xs font-semibold ${stat.color} mt-0.5`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {property.listing_url && (
            <a
              href={property.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
            >
              View <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(property);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              isSaved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]"
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}