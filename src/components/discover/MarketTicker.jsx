import React from "react";

const TICKER_DATA = [
  "RBA Cash Rate 3.85% (Cut 4 Feb 2026)",
  "Brisbane Vacancy 0.8%",
  "Perth Vacancy 0.4%",
  "National Growth 2025 +9.0%",
  "Perth Growth +11.4%",
  "Brisbane Growth +8.2%",
  "Borrowing Power Delta +$42K",
  "National Vacancy 1.2%",
];

export default function MarketTicker() {
  const tickerContent = [...TICKER_DATA, ...TICKER_DATA].join(" · ");

  return (
    <div
      className="overflow-hidden mb-6 py-3 px-4 rounded-xl"
      style={{
        background: "rgba(13,18,35,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex whitespace-nowrap animate-scroll-ticker">
        <span className="text-sm font-medium text-gray-300">
          {tickerContent}
        </span>
        <span className="text-sm font-medium text-gray-300 ml-16">
          {tickerContent}
        </span>
      </div>
    </div>
  );
}