import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, TrendingUp, DollarSign, Percent } from "lucide-react";
import PropertyCard from "../components/discover/PropertyCard";

export default function Portfolio() {
  const queryClient = useQueryClient();

  const { data: savedProperties = [], isLoading: loadingSaved } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: () => base44.entities.SavedProperty.list(),
  });

  const { data: allProperties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ["properties"],
    queryFn: () => base44.entities.Property.list("-created_date", 200),
  });

  const removeMutation = useMutation({
    mutationFn: async (property) => {
      const saved = savedProperties.find((s) => s.property_id === property.id);
      if (saved) await base44.entities.SavedProperty.delete(saved.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedProperties"] }),
  });

  const savedIds = useMemo(() => new Set(savedProperties.map((s) => s.property_id)), [savedProperties]);
  const portfolioProperties = useMemo(
    () => allProperties.filter((p) => savedIds.has(p.id)),
    [allProperties, savedIds]
  );

  const stats = useMemo(() => {
    if (portfolioProperties.length === 0) return null;
    const total = portfolioProperties.reduce((sum, p) => sum + (p.price || 0), 0);
    const avgYield = portfolioProperties.reduce((sum, p) => sum + (p.rental_yield || 0), 0) / portfolioProperties.length;
    const avgGrowth = portfolioProperties.reduce((sum, p) => sum + (p.capital_growth_5yr || 0), 0) / portfolioProperties.length;
    return { total, avgYield, avgGrowth, count: portfolioProperties.length };
  }, [portfolioProperties]);

  const isLoading = loadingSaved || loadingProperties;

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Properties", value: stats.count, icon: Briefcase, color: "indigo" },
            { label: "Total Value", value: `$${(stats.total / 1e6).toFixed(1)}M`, icon: DollarSign, color: "emerald" },
            { label: "Avg. Yield", value: `${stats.avgYield.toFixed(1)}%`, icon: Percent, color: "blue" },
            { label: "Avg. Growth", value: `${stats.avgGrowth.toFixed(1)}%`, icon: TrendingUp, color: "violet" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5"
              style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(13,18,35,0.9)" }}>
              <div className="h-42 bg-white/[0.04]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/[0.06] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : portfolioProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Briefcase className="w-7 h-7 text-gray-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-300">Your portfolio is empty</h3>
          <p className="text-sm text-gray-500 mt-1">Save properties from Discover to build your portfolio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {portfolioProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSaved={true}
              onToggleSave={() => removeMutation.mutate(property)}
            />
          ))}
        </div>
      )}
    </div>
  );
}