import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare } from "lucide-react";

const ROW_DEFS = [
  { label: "Median House Price", key: "median_house_price", format: (v) => v ? `$${v.toLocaleString()}` : "—" },
  { label: "Median Weekly Rent", key: "median_weekly_rent", format: (v) => v ? `$${v}/wk` : "—" },
  { label: "Gross Rental Yield", key: "gross_rental_yield", format: (v) => v ? `${v.toFixed(2)}%` : "—" },
  { label: "Population Growth", key: "population_growth", format: (v) => v ? `${v.toFixed(2)}%` : "—" },
  { label: "Annual Capital Growth", key: "annual_capital_growth", format: (v) => v ? `${v.toFixed(2)}%` : "—" },
  { label: "Vacancy Rate", key: "vacancy_rate", format: (v) => v ? `${v.toFixed(2)}%` : "—" },
  { label: "Population", key: "population", format: (v) => v ? v.toLocaleString() : "—" },
  { label: "Median HH Income", key: "household_income", format: (v) => v ? `$${v.toLocaleString()}/yr` : "—" },
  { label: "Infrastructure Score", key: "infrastructure_score", format: (v) => v ?? "—" },
  { label: "Schools Score", key: "schools_score", format: (v) => v ?? "—" },
  { label: "Transport Score", key: "transport_score", format: (v) => v ?? "—" },
  { label: "Lifestyle Score", key: "lifestyle_score", format: (v) => v ?? "—" },
  { label: "Suburb Score", key: "suburb_score", format: (v) => v ?? "—" },
];

function ScoreBadge({ score }) {
  if (!score) return null;
  const color = score >= 85 ? "text-emerald-400" : score >= 70 ? "text-indigo-400" : "text-amber-400";
  return <span className={`text-2xl font-bold ${color}`}>{score}</span>;
}

export default function SuburbCompare() {
  const [suburbA, setSuburbA] = useState("");
  const [suburbB, setSuburbB] = useState("");

  const { data: suburbs = [] } = useQuery({
    queryKey: ["suburbs"],
    queryFn: () => base44.entities.SuburbInsight.list("-suburb_score", 200),
  });

  const dataA = useMemo(() => suburbs.find((s) => s.id === suburbA), [suburbs, suburbA]);
  const dataB = useMemo(() => suburbs.find((s) => s.id === suburbB), [suburbs, suburbB]);

  const winner = useMemo(() => {
    if (!dataA || !dataB) return null;
    const scoreA = dataA.suburb_score || 0;
    const scoreB = dataB.suburb_score || 0;
    if (scoreA > scoreB) return "A";
    if (scoreB > scoreA) return "B";
    return "tie";
  }, [dataA, dataB]);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <GitCompare className="w-5 h-5 text-indigo-400" />
        <h1 className="text-xl font-bold text-white">Suburb Comparison</h1>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "Suburb A", value: suburbA, set: setSuburbA },
          { label: "Suburb B", value: suburbB, set: setSuburbB },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <p className="text-xs text-gray-400 mb-2">{label}</p>
            <Select value={value} onValueChange={set}>
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue placeholder="Select suburb…" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1223] border-white/[0.08] max-h-64">
                {suburbs.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-gray-300 focus:bg-white/[0.06]">
                    {s.suburb}, {s.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {dataA && dataB ? (
        <>
          {/* Header */}
          <div
            className="grid grid-cols-3 gap-4 mb-2 rounded-2xl p-5"
            style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-center">
              <p className="text-lg font-bold text-white">{dataA.suburb}</p>
              <p className="text-xs text-gray-500">{dataA.state} {dataA.postcode}</p>
              <ScoreBadge score={dataA.suburb_score} />
              {winner === "A" && <p className="text-xs text-emerald-400 font-semibold mt-1">⭐ Winner</p>}
            </div>
            <div className="flex items-center justify-center text-gray-600 font-bold text-lg">VS</div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{dataB.suburb}</p>
              <p className="text-xs text-gray-500">{dataB.state} {dataB.postcode}</p>
              <ScoreBadge score={dataB.suburb_score} />
              {winner === "B" && <p className="text-xs text-emerald-400 font-semibold mt-1">⭐ Winner</p>}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {ROW_DEFS.map((row, i) => {
              const valA = row.format(dataA[row.key]);
              const valB = row.format(dataB[row.key]);
              const numA = typeof dataA[row.key] === "number" ? dataA[row.key] : null;
              const numB = typeof dataB[row.key] === "number" ? dataB[row.key] : null;
              const aBetter = numA !== null && numB !== null && numA > numB;
              const bBetter = numA !== null && numB !== null && numB > numA;

              return (
                <div
                  key={row.key}
                  className={`grid grid-cols-3 gap-4 px-5 py-3 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                >
                  <div className={`text-center text-sm font-semibold ${aBetter ? "text-emerald-400" : "text-gray-300"}`}>{valA}</div>
                  <div className="text-center text-xs text-gray-500 flex items-center justify-center">{row.label}</div>
                  <div className={`text-center text-sm font-semibold ${bBetter ? "text-emerald-400" : "text-gray-300"}`}>{valB}</div>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          {winner && (
            <div
              className="mt-4 p-5 rounded-2xl"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <h3 className="text-sm font-semibold text-indigo-400 mb-2">AI Recommendation</h3>
              {winner === "tie" ? (
                <p className="text-sm text-gray-300">Both suburbs are evenly matched — review individual metrics to find the best fit for your strategy.</p>
              ) : (
                <p className="text-sm text-gray-300">
                  <strong className="text-white">{winner === "A" ? dataA.suburb : dataB.suburb}</strong> scores higher overall.{" "}
                  {winner === "A" ? (dataA.ai_suburb_summary || "") : (dataB.ai_suburb_summary || "")}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GitCompare className="w-10 h-10 text-gray-600 mb-3" />
          <p className="text-gray-400">Select two suburbs above to compare them side by side</p>
        </div>
      )}
    </div>
  );
}