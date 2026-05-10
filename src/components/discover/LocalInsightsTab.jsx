import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, MapPin, Building2, TrendingUp, ShoppingCart, Train, TreePine, School, AlertTriangle } from "lucide-react";

const AMENITY_ICONS = {
  "Schools": School,
  "Transport": Train,
  "Shopping": ShoppingCart,
  "Parks": TreePine,
  "Healthcare": Building2,
};

export default function LocalInsightsTab({ property }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchInsights = async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert Australian property analyst. Generate hyper-local insights for this property:

Address: ${property.address}, ${property.suburb}, ${property.state} ${property.postcode}
Property Type: ${property.property_type}
Price: $${property.price?.toLocaleString()}
Suburb: ${property.suburb}

Provide realistic, data-driven local insights specific to this suburb and area of Australia. Include:
1. Street-level price trends (recent median changes, price per sqm estimates, comparable recent sales)
2. Local amenities ratings (schools, transport, shopping, parks, healthcare) with specific nearby examples
3. Future development plans (infrastructure projects, rezoning, council plans that could affect property values)
4. Key risks and opportunities specific to this micro-location

Be specific to Australian geography, councils, and property market dynamics.`,
        response_json_schema: {
          type: "object",
          properties: {
            price_trends: {
              type: "object",
              properties: {
                median_price_change_12m: { type: "string" },
                price_per_sqm: { type: "string" },
                recent_sales_summary: { type: "string" },
                days_on_market: { type: "string" },
                auction_clearance: { type: "string" },
              }
            },
            amenities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  rating: { type: "number" },
                  examples: { type: "string" },
                  distance: { type: "string" },
                }
              }
            },
            developments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  timeline: { type: "string" },
                }
              }
            },
            opportunities: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
          }
        }
      });
      setInsights(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  // Auto-fetch on mount
  React.useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-gray-400">Analysing local area data...</p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-5">
      {/* Street-Level Price Trends */}
      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">Street-Level Price Trends</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "12-Month Change", value: insights.price_trends?.median_price_change_12m },
            { label: "Price per m²", value: insights.price_trends?.price_per_sqm },
            { label: "Avg. Days on Market", value: insights.price_trends?.days_on_market },
            { label: "Auction Clearance", value: insights.price_trends?.auction_clearance },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[10px] text-gray-500 uppercase mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-white">{item.value || "—"}</p>
            </div>
          ))}
        </div>
        {insights.price_trends?.recent_sales_summary && (
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">{insights.price_trends.recent_sales_summary}</p>
        )}
      </div>

      {/* Local Amenities */}
      {insights.amenities?.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-white">Local Amenities</h4>
          </div>
          <div className="space-y-3">
            {insights.amenities.map((amenity, i) => {
              const Icon = AMENITY_ICONS[amenity.category] || MapPin;
              const ratingPct = ((amenity.rating || 0) / 10) * 100;
              const color = amenity.rating >= 7 ? "#10b981" : amenity.rating >= 5 ? "#6366f1" : "#f59e0b";
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-300 font-medium">{amenity.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{amenity.distance}</span>
                      <span className="text-xs font-bold" style={{ color }}>{amenity.rating}/10</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] mb-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${ratingPct}%`, background: color }} />
                  </div>
                  <p className="text-[10px] text-gray-500">{amenity.examples}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Future Development Plans */}
      {insights.developments?.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-violet-400" />
            <h4 className="text-sm font-semibold text-white">Future Development Plans</h4>
          </div>
          <div className="space-y-3">
            {insights.developments.map((dev, i) => {
              const impactColor = dev.impact?.toLowerCase().includes("positive") ? "text-emerald-400" : dev.impact?.toLowerCase().includes("negative") ? "text-red-400" : "text-amber-400";
              return (
                <div key={i} className="p-3 rounded-lg" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-white">{dev.title}</p>
                    <span className="text-[10px] text-gray-500 shrink-0">{dev.timeline}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-1.5 leading-relaxed">{dev.description}</p>
                  <p className={`text-[10px] font-medium ${impactColor}`}>Impact: {dev.impact}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Opportunities & Risks */}
      <div className="grid grid-cols-2 gap-4">
        {insights.opportunities?.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <p className="text-xs font-semibold text-emerald-400 mb-2">Opportunities</p>
            <ul className="space-y-1.5">
              {insights.opportunities.map((o, i) => (
                <li key={i} className="text-[11px] text-gray-300 flex gap-1.5">
                  <span className="text-emerald-500 mt-0.5">+</span> {o}
                </li>
              ))}
            </ul>
          </div>
        )}
        {insights.risks?.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <div className="flex items-center gap-1 mb-2">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <p className="text-xs font-semibold text-red-400">Risks</p>
            </div>
            <ul className="space-y-1.5">
              {insights.risks.map((r, i) => (
                <li key={i} className="text-[11px] text-gray-300 flex gap-1.5">
                  <span className="text-red-500 mt-0.5">−</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-600 text-center">AI-generated insights based on suburb data. Verify with local council and agents.</p>
    </div>
  );
}