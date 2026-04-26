import React, { useState, useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState(680000);
  const [rate, setRate] = useState(6.2);
  const [term, setTerm] = useState(30);
  const [extra, setExtra] = useState(0);

  const results = useMemo(() => {
    const r = rate / 100 / 12;
    const n = term * 12;
    if (r === 0) return null;

    const payment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = payment * n;
    const totalInterest = totalPaid - loanAmount;

    // Amortisation schedule (yearly)
    const years = [];
    let balance = loanAmount;
    for (let y = 1; y <= term; y++) {
      let principal = 0, interest = 0;
      for (let m = 0; m < 12; m++) {
        const intPay = balance * r;
        const prinPay = payment - intPay + extra;
        interest += intPay;
        principal += prinPay;
        balance -= prinPay;
        if (balance <= 0) break;
      }
      years.push({ year: y, principal: Math.max(0, principal), interest: Math.max(0, interest) });
      if (balance <= 0) break;
    }

    const monthlyWithExtra = payment + extra;
    return { payment, monthlyWithExtra, totalPaid, totalInterest, years };
  }, [loanAmount, rate, term, extra]);

  const chartData = results ? {
    labels: results.years.map((y) => `Yr ${y.year}`),
    datasets: [
      {
        label: "Principal",
        data: results.years.map((y) => Math.round(y.principal)),
        backgroundColor: "#6366f1",
      },
      {
        label: "Interest",
        data: results.years.map((y) => Math.round(y.interest)),
        backgroundColor: "rgba(239,68,68,0.6)",
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#9ca3af" } } },
    scales: {
      x: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#9ca3af" } },
      y: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#9ca3af" } },
    },
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-5 h-5 text-indigo-400" />
        <h1 className="text-xl font-bold text-white">Mortgage Repayment Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-semibold text-white mb-2">Loan Details</h2>
          {[
            { label: "Loan Amount ($)", value: loanAmount, set: setLoanAmount, step: 10000 },
            { label: "Interest Rate (% p.a.)", value: rate, set: setRate, step: 0.05 },
            { label: "Loan Term (years)", value: term, set: setTerm, step: 1 },
            { label: "Extra Monthly Repayment ($)", value: extra, set: setExtra, step: 100 },
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

          {results && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06]">
              {[
                { label: "Monthly Repayment", value: `$${results.payment.toFixed(0)}`, color: "indigo" },
                { label: "With Extra", value: `$${results.monthlyWithExtra.toFixed(0)}`, color: "emerald" },
                { label: "Total Interest", value: `$${(results.totalInterest / 1000).toFixed(0)}K`, color: "red" },
                { label: "Total Paid", value: `$${(results.totalPaid / 1000).toFixed(0)}K`, color: "amber" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-[10px] text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-base font-bold text-${stat.color}-400`}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-semibold text-white mb-4">Amortisation Chart</h2>
          {chartData && <div className="h-80"><Bar data={chartData} options={chartOptions} /></div>}
          <p className="text-xs text-gray-500 mt-3">Purple = Principal repaid · Red = Interest paid per year</p>
        </div>
      </div>
    </div>
  );
}