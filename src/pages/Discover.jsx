import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import PropertyCard from "../components/property/PropertyCard";
import PropertyFilters from "../components/property/PropertyFilters";
import LoadingGrid from "../components/shared/LoadingGrid";
import EmptyState from "../components/shared/EmptyState";

export default function Discover() {
  const [filters, setFilters] = useState({ state: "", type: "", score: "" });
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => base44.entities.Property.list("-created_date", 100),
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

  const savedIds = useMemo(() => new Set(savedProperties.map((s) => s.property_id)), [savedProperties]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (filters.state && p.state !== filters.state) return false;
      if (filters.type && p.property_type !== filters.type) return false;
      if (filters.score && p.investment_score !== filters.score) return false;
      return true;
    });
  }, [properties, filters]);

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
          </p>
        </div>
        <PropertyFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingGrid count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No properties found"
          description="Try adjusting your filters or check back later for new listings."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSaved={savedIds.has(property.id)}
              onToggleSave={() => saveMutation.mutate(property)}
            />
          ))}
        </div>
      )}
    </div>
  );
}