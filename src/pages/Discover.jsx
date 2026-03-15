import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/discover/PropertyCard";

const SCORE_CHIPS = ["All", "A+", "A", "B+", "B"];
const TYPES = ["All", "House", "Apartment"];
const STATES = ["All", "QLD", "NSW", "VIC", "WA", "SA", "TAS", "ACT", "NT"];
const SORT_OPTIONS = [
  { value: "score", label: "Best Score" },
  { value: "price_asc", label: "Price Low-High" },
  { value: "price_desc", label: "Price High-Low" },
  { value: "yield", label: "Highest Yield" },
  { value: "growth", label: "Capital Growth" },
];

export default function Discover() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score");

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => base44.entities.Property.list("-created_date", 500),
  });

  const { data: savedProperties = [] } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: () => base44.entities.SavedProperty.list(),
  });

  const { data: hiddenGemAlerts = [] } = useQuery({
    queryKey: ["hiddenGemAlerts"],
    queryFn: async () => {
      const all = await base44.entities.MarketAlert.list("-created_date", 100);
      return all.filter((a) => a.alert_type === "hidden_gem" && !a.is_read);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (property) => {
      const existing = savedProperties.find((s) => s.property_id === property.id);
      if (existing) {
        await base44.entities.SavedProperty.delete(existing.id);
      } else {
        await base44.entities.SavedProperty.create({ property_id: property.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedProperties"] }),
  });

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u.preferred_states?.length > 0 && stateFilter === "All") {
        // Auto-set user's preferred state if available
      }
    }).catch(() => {});
  }, []);

  const savedIds = useMemo(() => new Set(savedProperties.map((s) => s.property_id)), [savedProperties]);

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (p.status !== "Active") return false;
      if (search && !p.address?.toLowerCase().includes(search.toLowerCase()) &&
          !p.suburb?.toLowerCase().includes(search.toLowerCase()) &&
          !p.postcode?.includes(search)) return false;
      if (scoreFilter !== "All" && p.investment_score !== scoreFilter) return false;
      if (typeFilter !== "All" && p.property_type !== typeFilter) return false;
      if (stateFilter !== "All" && p.state !== stateFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "score") {
        const scores = { "A+": 6, "A": 5, "B+": 4, "B": 3, "C": 2, "D": 1, "F": 0 };
        return (scores[b.investment_score] || 0) - (scores[a.investment_score] || 0);
      }
      if (sortBy === "yield") return (b.rental_yield || 0) - (a.rental_yield || 0);
      if (sortBy === "growth") return (b.capital_growth_5yr || 0) - (a.capital_growth_5yr || 0);
      if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      return 0;
    });

    return result;
  }, [properties, search, scoreFilter, typeFilter, stateFilter, sortBy]);

  const firstName = user?.full_name?.split(" ")[0] || "Investor";
  const timeOfDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";

  return (
    <div className="min-h-screen p-4 lg:p-8 pb-24 lg:pb-8">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(16,185,129,0.2) 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          Good {timeOfDay}, {firstName}. Here are today's top picks for you.
        </h1>
        <p className="text-sm text-gray-300">
          {filtered.length} active properties • {user?.preferred_states?.join(", ") || "All states"}
        </p>
      </div>

      {/* Hidden Gem Alert */}
      {hiddenGemAlerts.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-all"
          onClick={() => navigate("/Alerts")}
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-400">
              {hiddenGemAlerts.length} Hidden Gem{hiddenGemAlerts.length > 1 ? "s" : ""} Found
            </p>
            <p className="text-xs text-gray-400">Click to view premium opportunities</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suburb, address, or postcode..."
            className="pl-12 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-2xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {SCORE_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setScoreFilter(chip)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  scoreFilter === chip
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]"
                }`}
              >
                {chip === "All" ? "All Scores" : chip}
              </button>
            ))}
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 bg-white/[0.04] border-white/[0.08] text-gray-300 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1223] border-white/[0.08]">
              {TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-gray-300 focus:bg-white/[0.06]">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-28 bg-white/[0.04] border-white/[0.08] text-gray-300 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1223] border-white/[0.08]">
              {STATES.map((s) => (
                <SelectItem key={s} value={s} className="text-gray-300 focus:bg-white/[0.06]">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 bg-white/[0.04] border-white/[0.08] text-gray-300 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1223] border-white/[0.08]">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-gray-300 focus:bg-white/[0.06]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="h-48 bg-white/[0.04]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400">No properties match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSaved={savedIds.has(property.id)}
              onToggleSave={() => saveMutation.mutate(property)}
              onClick={() => navigate(`/PropertyDetail/${property.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}