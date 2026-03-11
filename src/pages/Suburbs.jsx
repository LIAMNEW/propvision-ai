import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SuburbCard from "../components/suburb/SuburbCard";
import EmptyState from "../components/shared/EmptyState";

const STATES = ["All", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export default function Suburbs() {
  const [stateFilter, setStateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score");

  const { data: suburbs = [], isLoading } = useQuery({
    queryKey: ["suburbs"],
    queryFn: () => base44.entities.SuburbInsight.list("-created_date", 100),
  });

  const filtered = useMemo(() => {
    let result = suburbs.filter((s) => {
      if (stateFilter !== "All" && s.state !== stateFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "score") return (b.suburb_score || 0) - (a.suburb_score || 0);
      if (sortBy === "price") return (b.median_house_price || 0) - (a.median_house_price || 0);
      if (sortBy === "yield") return (b.gross_rental_yield || 0) - (a.gross_rental_yield || 0);
      return 0;
    });

    return result;
  }, [suburbs, stateFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? "suburb" : "suburbs"} analysed
        </p>

        <div className="flex items-center gap-3">
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-28 h-9 bg-white/[0.04] border-white/[0.08] text-gray-300 text-sm rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1219] border-white/[0.08]">
              {STATES.map((s) => (
                <SelectItem key={s} value={s} className="text-gray-300 focus:bg-white/[0.06] focus:text-white">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-9 bg-white/[0.04] border-white/[0.08] text-gray-300 text-sm rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1219] border-white/[0.08]">
              <SelectItem value="score" className="text-gray-300 focus:bg-white/[0.06] focus:text-white">Top Score</SelectItem>
              <SelectItem value="yield" className="text-gray-300 focus:bg-white/[0.06] focus:text-white">Highest Yield</SelectItem>
              <SelectItem value="price" className="text-gray-300 focus:bg-white/[0.06] focus:text-white">Highest Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-white/[0.06] rounded w-32" />
                  <div className="h-3 bg-white/[0.04] rounded w-16" />
                </div>
                <div className="w-14 h-14 rounded-full bg-white/[0.04]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 bg-white/[0.04] rounded-xl" />
                <div className="h-16 bg-white/[0.04] rounded-xl" />
                <div className="h-16 bg-white/[0.04] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No suburb insights"
          description="Suburb analysis data will appear here once available."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((suburb) => (
            <SuburbCard key={suburb.id} suburb={suburb} />
          ))}
        </div>
      )}
    </div>
  );
}