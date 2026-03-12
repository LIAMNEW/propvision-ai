import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CashFlowCalculator() {
  const [price, setPrice] = useState(850000);
  const [rent, setRent] = useState(900);
  const [rate, setRate] = useState(6.2);
  const [deposit, setDeposit] = useState(20);
  const [costs, setCosts] = useState(8000);

  const results = useMemo(() => {
    const loan = price * (1 - deposit / 100);
    const interest = loan * (rate / 100);
    const netAnnual = (rent * 52) - interest - costs;
    const netWeekly = netAnnual / 52;
    const grossYield = ((rent * 52) / price) * 100;
    const isPositive = netWeekly >= 0;

    return { grossYield, netWeekly, isPositive };
  }, [price, rent, rate, deposit, costs]);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <h3 className="text-base font-semibold text-white mb-4">Cash Flow Calculator</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="text-xs text-gray-400">Purchase Price</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-400">Weekly Rent</Label>
          <Input
            type="number"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
            className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-400">Interest Rate (%)</Label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            step="0.1"
            className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-400">Deposit (%)</Label>
          <Input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-gray-400">Annual Costs</Label>
          <Input
            type="number"
            value={costs}
            onChange={(e) => setCosts(Number(e.target.value))}
            className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Gross Yield</p>
          <p className="text-lg font-bold text-indigo-400">{results.grossYield.toFixed(2)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Net Weekly</p>
          <p className={`text-lg font-bold ${results.isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {results.isPositive ? "+" : ""}${results.netWeekly.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Gearing</p>
          <p className={`text-lg font-bold ${results.isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {results.isPositive ? "Positive ✓" : "Negative"}
          </p>
        </div>
      </div>
    </div>
  );
}