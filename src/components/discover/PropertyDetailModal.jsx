import React from "react";
import { X, Bed, Bath, Car, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const SCORE_CONFIG = {
  "A+": "gradient-emerald",
  "A": "gradient-indigo",
  "B+": "gradient-blue",
  "B": "gradient-amber",
  "C": "gradient-red",
  "D": "gradient-red",
  "F": "gradient-red",
};

export default function PropertyDetailModal({ property, isSaved, onToggleSave, onClose }) {
  if (!property) return null;

  const scoreClass = SCORE_CONFIG[property.investment_score] || "gradient-amber";
  const cashflow = property.weekly_cashflow || 0;
  const isPositive = cashflow >= 0;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl"
          style={{
            background: "rgba(13,18,35,0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-64">
            <img
              src={property.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"}
              alt={property.address}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4">
              <span className={`${scoreClass} px-3 py-1.5 rounded-lg text-white text-sm font-bold shadow-lg`}>
                {property.investment_score}
              </span>
            </div>
            <div className="absolute bottom-4 right-4">
              <p className="text-white font-bold text-2xl">${property.price?.toLocaleString()}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-white">{property.address}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {property.suburb}, {property.state} {property.postcode}
            </p>

            {/* Specs */}
            <div className="flex items-center gap-4 mt-4 text-gray-300">
              <span className="flex items-center gap-2">
                <Bed className="w-4 h-4" /> {property.bedrooms} bed
              </span>
              <span className="flex items-center gap-2">
                <Bath className="w-4 h-4" /> {property.bathrooms} bath
              </span>
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4" /> {property.car_spaces} car
              </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {[
                { label: "Rental Yield", value: `${property.rental_yield?.toFixed(1)}%`, color: "emerald" },
                { label: "5yr Growth", value: `${property.capital_growth_5yr?.toFixed(1)}%`, color: "indigo" },
                {
                  label: "Weekly Cash Flow",
                  value: `${isPositive ? "+" : ""}$${Math.abs(cashflow).toFixed(0)}`,
                  color: isPositive ? "emerald" : "red",
                },
                { label: "Vacancy Rate", value: `${property.vacancy_rate?.toFixed(1)}%`, color: "amber" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-lg font-bold text-${stat.color}-400`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* AI Analysis */}
            {property.ai_analysis && (
              <div
                className="mt-6 p-4 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <h3 className="text-sm font-semibold text-indigo-400 mb-2">AI Investment Analysis</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{property.ai_analysis}</p>
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={() => onToggleSave?.(property)}
              className={`w-full mt-6 h-12 rounded-xl font-semibold ${
                isSaved
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-white/[0.08] hover:bg-white/[0.12] text-gray-300"
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved to Portfolio" : "Save to Portfolio"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}