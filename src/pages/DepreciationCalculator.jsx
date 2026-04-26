import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingDown } from "lucide-react";

export default function DepreciationCalculator() {
  const [price, setPrice] = useState(850000);
  const [buildingPct, setBuildingPct] = useState(40);
  const [deprRate, setDeprRate] = useState(2.5);
  const [holdYears, setHoldYears] = useState(10);
  const [marginalRate, setMarginalRate] = useState(37);

  const results = useMemo(() => {
    const buildingValue = price * (buildingPct / 100);
    const annualDepr = buildingValue * (deprRate / 100);
    const totalDepr = annualDepr * holdYears;
    const buildingRemaining = buildingValue - totalDepr;
    const taxBenefit = annualDepr * (marginalRate / 100);
    const totalTaxBenefit = totalDepr * (marginalRate / 100);

    const schedule = Array.from({ length: holdYears }, (_, i) => ({
      year: i + 1,
      depr: annualDepr,
      remaining: buildingValue - annualDepr * (i + 1),
      taxSaving: taxBenefit,
    }));

    return { buildingValue, annualDepr, totalDepr, buildingRemaining, taxBenefit, totalTaxBenefit, schedule };
  }, [price, buildingPct, deprRate, holdYears, marginalRate]);

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <TrendingDown className="w-5 h-5 text-indigo-400" />
        <h1 className="text-xl font-bold text-white">Depreciation Schedule</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs + Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-sm font-semibold text-white mb-2">Property Details</h2>
            {[
              { label: "Purchase Price ($)", value: price, set: setPrice, step: 10000 },
              { label: "Building Value (%)", value: buildingPct, set: setBuildingPct, step: 1 },
              { label: "Depreciation Rate (% p.a.)", value: deprRate, set: setDeprRate, step: 0.5 },
              { label: "Holding Period (years)", value: holdYears, set: setHoldYears, step: 1 },
              { label: "Marginal Tax Rate (%)", value: marginalRate, set: setMarginalRate, step: 1 },
            ].map(({ label, value, set, step }) => (
              <div key={label}>
                <Label className="text-xs text-gray-400">{label}</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  step={step}
                  className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 grid grid-cols-2 gap-3" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-sm font-semibold text-white col-span-2 mb-2">Summary</h2>
            {[
              { label: "Building Value", value: `$${results.buildingValue.toLocaleString()}`, color: "indigo" },
              { label: "Annual Depreciation", value: `$${results.annualDepr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "emerald" },
              { label: "Annual Tax Saving", value: `$${results.taxBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "emerald" },
              { label: `Total Depr (${holdYears}yr)`, value: `$${results.totalDepr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "blue" },
              { label: `Total Tax Benefit`, value: `$${results.totalTaxBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "amber" },
              { label: "Building Remaining", value: `$${Math.max(0, results.buildingRemaining).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "gray" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-sm font-bold text-${stat.color}-400`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="p-5 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Year-by-Year Schedule</h2>
          </div>
          <div className="overflow-auto max-h-[480px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0" style={{ background: "rgba(13,18,35,0.98)" }}>
                <tr className="text-gray-500 text-left">
                  <th className="px-5 py-3">Year</th>
                  <th className="px-5 py-3">Depreciation</th>
                  <th className="px-5 py-3">Tax Saving</th>
                  <th className="px-5 py-3">Bldg Value</th>
                </tr>
              </thead>
              <tbody>
                {results.schedule.map((row) => (
                  <tr key={row.year} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-gray-400">Yr {row.year}</td>
                    <td className="px-5 py-3 text-emerald-400">${row.depr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-5 py-3 text-amber-400">${row.taxSaving.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-5 py-3 text-gray-300">${Math.max(0, row.remaining).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}