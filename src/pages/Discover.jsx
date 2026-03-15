import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";
import PersonalisationBanner from "../components/discover/PersonalisationBanner";
import MarketTicker from "../components/discover/MarketTicker";
import PropertyCard from "../components/discover/PropertyCard";
import PropertyDetailModal from "../components/discover/PropertyDetailModal";
import OnboardingFlow from "../components/onboarding/OnboardingFlow";

const SCORE_CHIPS = ["All", "A+", "A", "B+", "B"];
const RISK_CHIPS = ["All", "Low", "Medium"];
const STATES = ["All", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const TYPES = ["All", "House", "Apartment", "Townhouse", "Unit", "Land"];

export default function Discover() {
  const [user, setUser] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState([5000000]);
  const [minYield, setMinYield] = useState([0]);
  const [sortBy, setSortBy] = useState("score");
  const [selectedProperty, setSelectedProperty] = useState(null);

  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => base44.entities.Property.list("-created_date", 200),
  });

  const { data: savedProperties = [] } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: () => base44.entities.SavedProperty.list(),
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
      if (!u.onboarding_complete) {
        setNeedsOnboarding(true);
      }
    }).catch(() => {});
  }, []);

  const savedIds = useMemo(() => new Set(savedProperties.map((s) => s.property_id)), [savedProperties]);

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (search && !p.address?.toLowerCase().includes(search.toLowerCase()) &&
          !p.suburb?.toLowerCase().includes(search.toLowerCase()) &&
          !p.postcode?.includes(search)) return false;
      if (scoreFilter !== "All" && p.investment_score !== scoreFilter) return false;
      if (riskFilter !== "All" && p.risk_level !== riskFilter) return false;
      if (stateFilter !== "All" && p.state !== stateFilter) return false;
      if (typeFilter !== "All" && p.property_type !== typeFilter) return false;
      if (p.price > maxPrice[0]) return false;
      if ((p.rental_yield || 0) < minYield[0]) return false;
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
  }, [properties, search, scoreFilter, riskFilter, stateFilter, typeFilter, maxPrice, minYield, sortBy]);

  if (needsOnboarding) {
    return <OnboardingFlow onComplete={() => { setNeedsOnboarding(false); window.location.reload(); }} />;
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <PersonalisationBanner user={user} />
      <MarketTicker />

      <div className="flex gap-6">
        {/* Left Sidebar */}
        <div
          className="hidden lg:block w-64 shrink-0 rounded-2xl p-5 h-fit sticky top-6"
          style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">Filters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">State</label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1223] border-white/[0.08]">
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s} className="text-gray-300 focus:bg-white/[0.06]">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Property Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1223] border-white/[0.08]">
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-gray-300 focus:bg-white/[0.06]">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Max Price: ${maxPrice[0].toLocaleString()}</label>
              <Slider value={maxPrice} onValueChange={setMaxPrice} min={0} max={5000000} step={100000} />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Min Yield: {minYield[0]}%</label>
              <Slider value={minYield} onValueChange={setMinYield} min={0} max={10} step={0.5} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search + Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suburb, address, or postcode..."
                className="pl-12 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                {SCORE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setScoreFilter(chip)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      scoreFilter === chip
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                        : "bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    {chip === "All" ? "All Scores" : chip}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {RISK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setRiskFilter(chip)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      riskFilter === chip
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 bg-white/[0.04] border-white/[0.08] text-gray-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1223] border-white/[0.08]">
                  <SelectItem value="score" className="text-gray-300 focus:bg-white/[0.06]">Best Score</SelectItem>
                  <SelectItem value="yield" className="text-gray-300 focus:bg-white/[0.06]">Highest Yield</SelectItem>
                  <SelectItem value="growth" className="text-gray-300 focus:bg-white/[0.06]">Capital Growth</SelectItem>
                  <SelectItem value="price_asc" className="text-gray-300 focus:bg-white/[0.06]">Price ↑</SelectItem>
                  <SelectItem value="price_desc" className="text-gray-300 focus:bg-white/[0.06]">Price ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(13,18,35,0.9)" }}>
                  <div className="h-42 bg-white/[0.04]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                    <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSaved={savedIds.has(property.id)}
                  onToggleSave={() => saveMutation.mutate(property)}
                  onClick={() => setSelectedProperty(property)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          isSaved={savedIds.has(selectedProperty.id)}
          onToggleSave={() => saveMutation.mutate(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}