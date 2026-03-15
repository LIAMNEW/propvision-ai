import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Car, Heart, ExternalLink, ArrowLeft, Flame, TrendingUp, DollarSign } from "lucide-react";

const SCORE_COLORS = {
  "A+": "#10b981", "A": "#6366f1", "B+": "#3b82f6", "B": "#f59e0b", "C": "#ef4444", "D": "#ef4444", "F": "#ef4444",
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const all = await base44.entities.Property.list();
      return all.find((p) => p.id === id);
    },
  });

  const { data: savedProperties = [] } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: () => base44.entities.SavedProperty.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = savedProperties.find((s) => s.property_id === id);
      if (existing) {
        await base44.entities.SavedProperty.delete(existing.id);
      } else {
        await base44.entities.SavedProperty.create({ property_id: id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedProperties"] }),
  });

  const isSaved = useMemo(() => savedProperties.some((s) => s.property_id === id), [savedProperties, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-4">Property not found</p>
        <Button onClick={() => navigate("/Discover")} className="bg-indigo-600 hover:bg-indigo-700">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discover
        </Button>
      </div>
    );
  }

  const scoreColor = SCORE_COLORS[property.investment_score] || "#ef4444";
  const isGem = (property.investment_score_numeric || 0) >= 80;
  const demandPercent = ((property.demand_score || 0) / 100) * 100;

  return (
    <div className="min-h-screen pb-8">
      {/* Hero Image */}
      <div className="relative h-96">
        <img
          src={property.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"}
          alt={property.address}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <button
          onClick={() => navigate("/Discover")}
          className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-6 left-6">
          <span
            className="px-4 py-2 rounded-2xl text-white text-lg font-bold shadow-lg flex items-center gap-2"
            style={{ background: scoreColor }}
          >
            {property.investment_score}
            {isGem && <Flame className="w-5 h-5" />}
          </span>
          {property.investment_score_numeric && (
            <p className="text-white text-sm mt-2">GemScore: {property.investment_score_numeric}/100</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
        <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(13,18,35,0.95)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{property.address}</h1>
              <p className="text-gray-400">{property.suburb}, {property.state} {property.postcode}</p>
              <p className="text-3xl font-bold text-indigo-400 mt-4">${property.price?.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-lg">
              <span className="flex items-center gap-2"><Bed className="w-5 h-5" /> {property.bedrooms}</span>
              <span className="flex items-center gap-2"><Bath className="w-5 h-5" /> {property.bathrooms}</span>
              <span className="flex items-center gap-2"><Car className="w-5 h-5" /> {property.car_spaces}</span>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {property.ai_summary && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(16,185,129,0.2) 100%)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> AI Investment Analysis
            </h3>
            <p className="text-gray-200 leading-relaxed">{property.ai_summary}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Weekly Rent Estimate", value: `$${property.weekly_rent_estimate?.toLocaleString() || "—"}`, icon: DollarSign },
            { label: "Rental Yield", value: `${property.rental_yield?.toFixed(1) || "—"}%`, icon: TrendingUp },
            { label: "5yr Capital Growth", value: `${property.capital_growth_5yr?.toFixed(1) || "—"}%`, icon: TrendingUp },
            { label: "10yr Capital Growth", value: `${property.capital_growth_10yr?.toFixed(1) || "—"}%`, icon: TrendingUp },
            { label: "Vacancy Rate", value: `${property.vacancy_rate?.toFixed(1) || "—"}%`, icon: TrendingUp },
            { label: "Days on Market", value: `${property.days_on_market || "—"}`, icon: TrendingUp },
          ].map((metric, i) => (
            <div key={i} className="rounded-2xl p-5 text-center" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <metric.icon className="w-5 h-5 text-gray-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
              <p className="text-xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Suburb Median Comparison */}
        {property.suburb_median_price && property.price_vs_median_pct && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-sm font-semibold text-white mb-3">Price vs Suburb Median</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${Math.min(100, Math.abs(property.price_vs_median_pct))}%` }}
                  />
                </div>
              </div>
              <p className={`text-sm font-semibold ${property.price_vs_median_pct > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {property.price_vs_median_pct > 0 ? "+" : ""}{property.price_vs_median_pct}%
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Suburb median: ${property.suburb_median_price.toLocaleString()}</p>
          </div>
        )}

        {/* Demand Score */}
        {property.demand_score && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-sm font-semibold text-white mb-3">Demand Score</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500" style={{ width: `${demandPercent}%` }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{property.demand_score}/100</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {property.listing_url && (
            <a
              href={property.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              View Full Listing <ExternalLink className="w-5 h-5" />
            </a>
          )}
          <Button
            onClick={() => saveMutation.mutate()}
            className={`h-auto py-4 rounded-2xl text-base font-semibold ${
              isSaved
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.08]"
            }`}
          >
            <Heart className={`w-5 h-5 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved to Portfolio" : "Save Property"}
          </Button>
        </div>
      </div>
    </div>
  );
}