import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import MacroCard from "../components/intelligence/MacroCard";
import CashFlowCalculator from "../components/intelligence/CashFlowCalculator";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const VACANCY_DATA = {
  labels: ["Perth", "Hobart", "Brisbane", "Adelaide", "Sydney", "Melbourne", "Balanced"],
  datasets: [{
    label: "Vacancy Rate %",
    data: [0.4, 0.72, 0.8, 1.0, 1.4, 1.5, 2.5],
    backgroundColor: ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#3b82f6", "#3b82f6", "#6b7280"],
  }],
};

const RBA_DATA = {
  labels: ["Jan20", "Jan21", "Jan22", "Jun22", "Nov22", "Mar23", "Jun23", "Nov23", "Feb24", "Nov24", "Feb25", "Aug25", "Feb26"],
  datasets: [{
    label: "Cash Rate %",
    data: [0.75, 0.10, 0.10, 1.35, 2.85, 3.60, 4.10, 4.35, 4.35, 4.35, 4.10, 3.85, 3.85],
    borderColor: "#6366f1",
    backgroundColor: "rgba(99,102,241,0.2)",
    fill: true,
    tension: 0.3,
  }],
};

const GROWTH_DATA = {
  labels: ["Perth", "Brisbane", "Adelaide", "Sydney", "Hobart", "Melbourne"],
  datasets: [{
    label: "Growth %",
    data: [11.4, 8.2, 7.1, 6.1, 4.8, 3.2],
    backgroundColor: ["#10b981", "#10b981", "#6366f1", "#6366f1", "#f59e0b", "#f59e0b"],
  }],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#9ca3af" } },
    y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#9ca3af" } },
  },
};

export default function Intelligence() {
  return (
    <div className="min-h-screen p-4 lg:p-8 space-y-6">
      {/* Macro Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard title="RBA Cash Rate" value="3.85%" subtitle="Cut 4 Feb 2026" color="emerald" progress={35} />
        <MacroCard title="National Vacancy" value="1.2%" subtitle="vs 2.5% balanced" color="amber" progress={48} />
        <MacroCard title="Price Growth 2025" value="+9.0%" subtitle="Forecast +5% 2026" color="indigo" progress={75} />
        <MacroCard title="Borrowing Power" value="+$42K" subtitle="since cuts began" color="emerald" progress={60} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-base font-semibold text-white mb-4">Rental Vacancy by City</h3>
          <div className="h-64"><Bar data={VACANCY_DATA} options={chartOptions} /></div>
          <p className="text-xs text-gray-500 mt-3">Source: SQM Research Jan 2026</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-base font-semibold text-white mb-4">RBA Cash Rate 2020–2026</h3>
          <div className="h-64"><Line data={RBA_DATA} options={chartOptions} /></div>
          <p className="text-xs text-gray-500 mt-3">4 cuts since Feb 2025. Avg borrowing capacity +$42K.</p>
        </div>
      </div>

      {/* Growth + Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-base font-semibold text-white mb-4">Capital Growth by City 2025</h3>
          <div className="h-64"><Bar data={GROWTH_DATA} options={chartOptions} /></div>
        </div>

        <CashFlowCalculator />
      </div>

      {/* City Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { city: "Brisbane", score: 91, label: "STRONG BUY", color: "emerald", vacancy: "0.8%", growth: "+8.2%", yield: "5.0%" },
          { city: "Perth", score: 88, label: "STRONG BUY", color: "emerald", vacancy: "0.4%", growth: "+11.4%", yield: "5.8%" },
          { city: "Sydney", score: 74, label: "BUY", color: "indigo", vacancy: "1.4%", growth: "+6.1%", yield: "3.8%" },
          { city: "Melbourne", score: 65, label: "HOLD", color: "amber", vacancy: "1.5%", growth: "+3.2%", yield: "4.1%" },
        ].map((item) => (
          <div
            key={item.city}
            className="rounded-2xl p-5"
            style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white">{item.city}</h3>
              <span className={`text-2xl font-bold text-${item.color}-400`}>{item.score}</span>
            </div>
            <p className={`text-xs font-semibold text-${item.color}-400 mb-3`}>{item.label}</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>Vacancy: {item.vacancy}</p>
              <p>Growth: {item.growth}</p>
              <p>Yield: {item.yield}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Market Thesis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "📉", title: "Rate Tailwinds", text: "RBA cut 4 times since Feb 2025 to 3.85%. Each 25bp cut = ~$10,500 more borrowing capacity. 1-2 more cuts expected in 2026." },
          { icon: "🏠", title: "Supply Squeeze", text: "National vacancy 1.2%, half the 2.5% balanced market. Brisbane 0.8%, Perth 0.4%. Dwelling completions 40K/yr below demand." },
          { icon: "🏆", title: "Best Opportunities", text: "Brisbane inner suburbs: 5%+ yields, sub-1% vacancy, Olympics 2032. Perth Fremantle undervalued 35% vs Sydney equivalents." },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="text-sm font-semibold text-indigo-400 mb-2">{item.title}</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}