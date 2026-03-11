import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, TrendingUp, DollarSign, Percent } from "lucide-react";
import PropertyCard from "../components/property/PropertyCard";
import LoadingGrid from "../components/shared/LoadingGrid";
import EmptyState from "../components/shared/EmptyState";

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

  const isLoading = loadingSaved || loadingProperties;

  // Stats
  const stats = useMemo(() => {
    if (portfolioProperties.length === 0) return null;
    const total = portfolioProperties.reduce((sum, p) => sum + (p.price || 0), 0);
    const avgYield = portfolioProperties.reduce((sum, p) => sum + (p.rental_yield || 0), 0) / portfolioProperties.length;
    const avgGrowth = portfolioProperties.reduce((sum, p) => sum + (p.capital_growth_5yr || 0), 0) / portfolioProperties.length;
    return { total, avgYield, avgGrowth, count: portfolioProperties.length };
  }, [portfolioProperties]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Properties", value: stats.count, icon: Briefcase, color: "text-indigo-400" },
            { label: "Total Value", value: `$${(stats.total / 1e6).toFixed(1)}M`, icon: DollarSign, color: "text-emerald-400" },
            { label: "Avg. Yield", value: `${stats.avgYield.toFixed(1)}%`, icon: Percent, color: "text-blue-400" },
            { label: "Avg. Growth", value: `${stats.avgGrowth.toFixed(1)}%`, icon: TrendingUp, color: "text-violet-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <LoadingGrid count={3} />
      ) : portfolioProperties.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Your portfolio is empty"
          description="Save properties from the Discover page to build your portfolio."
        />
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