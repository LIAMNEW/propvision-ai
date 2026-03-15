import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, MapPin, TrendingUp, Home, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getScoreColor(score) {
  if (score >= 85) return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" };
  if (score >= 70) return { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30" };
  if (score >= 55) return { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" };
  return { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" };
}

export default function SuburbIntelligence() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: suburbs = [], isLoading } = useQuery({
    queryKey: ["suburbs"],
    queryFn: () => base44.entities.SuburbInsight.list("-suburb_score", 200),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => base44.entities.Property.list("-created_date", 500),
  });

  const filtered = suburbs.filter((s) =>
    s.suburb?.toLowerCase().includes(search.toLowerCase()) ||
    s.state?.toLowerCase().includes(search.toLowerCase())
  );

  const [selectedSuburb, setSelectedSuburb] = useState(null);

  const suburbProperties = selectedSuburb
    ? properties.filter((p) => p.suburb?.toLowerCase() === selectedSuburb.suburb?.toLowerCase() && p.status === "Active")
    : [];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any suburb..."
          className="pl-12 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-2xl"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ background: "rgba(13,18,35,0.9)" }}>
              <div className="h-6 bg-white/[0.06] rounded w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-white/[0.04] rounded w-full" />
                <div className="h-4 bg-white/[0.04] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((suburb) => {
            const colors = getScoreColor(suburb.suburb_score || 0);
            return (
              <div
                key={suburb.id}
                onClick={() => setSelectedSuburb(selectedSuburb?.id === suburb.id ? null : suburb)}
                className="rounded-2xl p-6 cursor-pointer hover:transform hover:scale-[1.02] transition-all"
                style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-lg font-semibold text-white">{suburb.suburb}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{suburb.state}</p>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl border-2 ${colors.border} ${colors.bg} flex flex-col items-center justify-center`}>
                    <span className={`text-xl font-bold ${colors.text}`}>{suburb.suburb_score || "—"}</span>
                    <span className="text-[8px] text-gray-500 uppercase">Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Median House</p>
                    <p className="text-sm font-semibold text-white">
                      ${suburb.median_house_price ? (suburb.median_house_price / 1000).toFixed(0) + "k" : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Median Unit</p>
                    <p className="text-sm font-semibold text-white">
                      ${suburb.median_unit_price ? (suburb.median_unit_price / 1000).toFixed(0) + "k" : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Gross Yield</p>
                    <p className="text-sm font-semibold text-emerald-400">
                      {suburb.gross_rental_yield?.toFixed(1) || "—"}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Vacancy</p>
                    <p className="text-sm font-semibold text-amber-400">
                      {suburb.vacancy_rate?.toFixed(1) || "—"}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Annual Growth</p>
                    <p className="text-sm font-semibold text-indigo-400">
                      {suburb.annual_capital_growth?.toFixed(1) || "—"}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">5yr Growth</p>
                    <p className="text-sm font-semibold text-indigo-400">
                      {suburb.capital_growth_5yr?.toFixed(1) || "—"}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4 pt-4 border-t border-white/[0.06]">
                  {[
                    { label: "Infra", value: suburb.infrastructure_score || 0, icon: Home },
                    { label: "Schools", value: suburb.school_score || 0, icon: Users },
                    { label: "Transport", value: suburb.transport_score || 0, icon: TrendingUp },
                    { label: "Lifestyle", value: suburb.lifestyle_score || 0, icon: DollarSign },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <item.icon className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-gray-300">{item.value}/10</p>
                      <p className="text-[9px] text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>

                {suburb.ai_suburb_summary && (
                  <div className="p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <p className="text-xs text-gray-300 leading-relaxed">{suburb.ai_suburb_summary}</p>
                  </div>
                )}

                {selectedSuburb?.id === suburb.id && suburbProperties.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      {suburbProperties.length} Active Properties
                    </h4>
                    <div className="space-y-2">
                      {suburbProperties.slice(0, 3).map((prop) => (
                        <div
                          key={prop.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/PropertyDetail/${prop.id}`);
                          }}
                          className="p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all"
                          style={{ background: "rgba(255,255,255,0.02)" }}
                        >
                          <p className="text-sm font-medium text-white">{prop.address}</p>
                          <p className="text-xs text-gray-400">${prop.price?.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}