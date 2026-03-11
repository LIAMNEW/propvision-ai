import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

const STATES = ["All", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const TYPES = ["All", "House", "Apartment", "Townhouse", "Unit", "Land"];
const SCORES = ["All", "A+", "A", "B+", "B", "C", "D", "F"];

export default function PropertyFilters({ filters, onChange }) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value === "All" ? "" : value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline font-medium">Filters</span>
      </div>

      <Select value={filters.state || "All"} onValueChange={(v) => update("state", v)}>
        <SelectTrigger className="w-28 h-9 bg-white/[0.04] border-white/[0.08] text-gray-300 text-sm rounded-xl">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent className="bg-[#0f1219] border-white/[0.08]">
          {STATES.map((s) => (
            <SelectItem key={s} value={s} className="text-gray-300 focus:bg-white/[0.06] focus:text-white">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type || "All"} onValueChange={(v) => update("type", v)}>
        <SelectTrigger className="w-32 h-9 bg-white/[0.04] border-white/[0.08] text-gray-300 text-sm rounded-xl">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent className="bg-[#0f1219] border-white/[0.08]">
          {TYPES.map((t) => (
            <SelectItem key={t} value={t} className="text-gray-300 focus:bg-white/[0.06] focus:text-white">
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.score || "All"} onValueChange={(v) => update("score", v)}>
        <SelectTrigger className="w-28 h-9 bg-white/[0.04] border-white/[0.08] text-gray-300 text-sm rounded-xl">
          <SelectValue placeholder="Score" />
        </SelectTrigger>
        <SelectContent className="bg-[#0f1219] border-white/[0.08]">
          {SCORES.map((s) => (
            <SelectItem key={s} value={s} className="text-gray-300 focus:bg-white/[0.06] focus:text-white">
              {s === "All" ? "All Scores" : `Score ${s}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}