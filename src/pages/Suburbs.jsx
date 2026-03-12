import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin } from "lucide-react";

function getScoreColor(score) {
  if (score >= 85) return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" };
  if (score >= 70) return { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30" };
  if (score >= 55) return { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" };
  return { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" };
}

export default function Suburbs() {
  const { data: suburbs = [], isLoading } = useQuery({
    queryKey: ["suburbs"],
    queryFn: () => base44.entities.SuburbInsight.list("-suburb_score", 100),
  });

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ background: "rgba(13,18,35,0.9)" }}>
              <div className="h-6 bg-white/[0.06] rounded w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-white/[0.04] rounded w-full" />
                <div className="h-4 bg-white/[0.04] rounded w-2/3" />
              </div>
            </div>
          ))
        ) : (
          suburbs.map((suburb) => {
            const colors = getScoreColor(suburb.suburb_score || 0);
            return (
              <div
                key={suburb.id}
                className="rounded-2xl p-6"
                style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-base font-semibold text-white">{suburb.suburb}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{suburb.state} {suburb.postcode}</p>
                    {suburb.population && (
                      <p className="text-xs text-gray-600 mt-1">Pop: {suburb.population.toLocaleString()}</p>
                    )}
                  </div>
                  <div className={`w-14 h-14 rounded-xl border-2 ${colors.border} ${colors.bg} flex flex-col items-center justify-center`}>
                    <span className={`text-lg font-bold ${colors.text}`}>{suburb.suburb_score || "—"}</span>
                    <span className="text-[8px] text-gray-500 uppercase">Score</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Median Price</span>
                  <span className="text-sm font-semibold text-white">
                    ${suburb.median_house_price ? (suburb.median_house_price / 1000).toFixed(0) + "k" : "—"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Yield", value: `${suburb.gross_rental_yield?.toFixed(1) || "—"}%` },
                    { label: "Growth", value: `${suburb.population_growth?.toFixed(1) || "—"}%` },
                    { label: "Income", value: suburb.household_income ? `$${(suburb.household_income / 1000).toFixed(0)}k` : "—" },
                    { label: "Infra", value: suburb.infrastructure_score || "—" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[9px] text-gray-500 uppercase mb-1">{stat.label}</p>
                      <p className="text-xs font-semibold text-gray-300">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {suburb.ai_suburb_summary && (
                  <div
                    className="p-3 rounded-xl mb-3"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
                  >
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{suburb.ai_suburb_summary}</p>
                  </div>
                )}

                <p className="text-[9px] text-gray-600 text-right">ABS Census 2021</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}