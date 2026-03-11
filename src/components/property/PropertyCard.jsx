import React from "react";
import { Bed, Bath, TrendingUp, Percent, Building2, Heart } from "lucide-react";
import InvestmentScoreBadge from "./InvestmentScoreBadge";
import { motion } from "framer-motion";

export default function PropertyCard({ property, isSaved, onToggleSave }) {
  const fallbackImg = `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card glass-card-hover rounded-2xl overflow-hidden group transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image_url || fallbackImg}
          alt={property.address}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Score badge */}
        <div className="absolute top-3 left-3">
          <InvestmentScoreBadge score={property.investment_score || "C"} />
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(property); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-white/70"}`} />
        </button>

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-lg">
            ${property.price?.toLocaleString() || "N/A"}
          </p>
        </div>

        {/* Risk badge */}
        {property.risk_level && (
          <div className="absolute bottom-3 right-3">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              property.risk_level === "Low" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
              property.risk_level === "Medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
              "bg-red-500/15 text-red-400 border-red-500/30"
            }`}>
              {property.risk_level} Risk
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate">{property.address}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{property.suburb}, {property.state}</p>

        {/* Beds/Baths */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.bedrooms || "—"}</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms || "—"}</span>
          {property.property_type && (
            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {property.property_type}</span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.06]">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Yield</p>
            <p className="text-sm font-semibold text-emerald-400">{property.rental_yield ? `${property.rental_yield}%` : "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Growth</p>
            <p className="text-sm font-semibold text-indigo-400">{property.capital_growth_5yr ? `${property.capital_growth_5yr}%` : "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Vacancy</p>
            <p className="text-sm font-semibold text-gray-300">{property.vacancy_rate ? `${property.vacancy_rate}%` : "—"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}