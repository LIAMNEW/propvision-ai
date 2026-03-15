import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const OVERLAY_OPTIONS = [
  {
    key: "none",
    label: "None",
  },
  {
    key: "yield",
    label: "Gross Rental Yield",
    field: "gross_rental_yield",
    // Low yield = red, high yield = green
    getColor: (val, min, max) => {
      const t = max === min ? 0.5 : (val - min) / (max - min);
      // Red → Amber → Green
      if (t < 0.5) return interpolateColor([239, 68, 68], [251, 191, 36], t * 2);
      return interpolateColor([251, 191, 36], [16, 185, 129], (t - 0.5) * 2);
    },
    format: (v) => `${v?.toFixed(2)}%`,
    unit: "%",
  },
  {
    key: "growth",
    label: "Capital Growth",
    field: "population_growth", // best proxy in SuburbInsight
    getColor: (val, min, max) => {
      const t = max === min ? 0.5 : (val - min) / (max - min);
      if (t < 0.5) return interpolateColor([239, 68, 68], [99, 102, 241], t * 2);
      return interpolateColor([99, 102, 241], [16, 185, 129], (t - 0.5) * 2);
    },
    format: (v) => `${v?.toFixed(2)}%`,
    unit: "%",
  },
  {
    key: "demand",
    label: "Demand Score",
    field: "suburb_score",
    getColor: (val, min, max) => {
      const t = max === min ? 0.5 : (val - min) / (max - min);
      if (t < 0.5) return interpolateColor([239, 68, 68], [59, 130, 246], t * 2);
      return interpolateColor([59, 130, 246], [16, 185, 129], (t - 0.5) * 2);
    },
    format: (v) => `${v}`,
    unit: "",
  },
];

function interpolateColor(c1, c2, t) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

function toHex(rgbStr) {
  const m = rgbStr.match(/\d+/g);
  if (!m) return "#6366f1";
  return "#" + m.map((n) => parseInt(n).toString(16).padStart(2, "0")).join("");
}

export default function MapPage() {
  const [activeOverlay, setActiveOverlay] = useState("yield");
  const [showProperties, setShowProperties] = useState(true);

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => base44.entities.Property.list("-created_date", 200),
  });

  const { data: suburbs = [] } = useQuery({
    queryKey: ["suburbs"],
    queryFn: () => base44.entities.SuburbInsight.list(),
  });

  const propertiesWithCoords = properties.filter((p) => p.latitude && p.longitude);
  const suburbsWithCoords = suburbs.filter((s) => s.latitude && s.longitude);

  const overlayConfig = OVERLAY_OPTIONS.find((o) => o.key === activeOverlay);

  const { min, max } = useMemo(() => {
    if (!overlayConfig?.field) return { min: 0, max: 1 };
    const vals = suburbsWithCoords.map((s) => s[overlayConfig.field]).filter((v) => v != null);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [suburbsWithCoords, overlayConfig]);

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <MapContainer
        center={[-27.0, 134.0]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {/* Heatmap circles for SuburbInsight */}
        {overlayConfig?.key !== "none" &&
          suburbsWithCoords.map((suburb) => {
            const val = suburb[overlayConfig.field];
            if (val == null) return null;
            const rgbColor = overlayConfig.getColor(val, min, max);
            const hexColor = toHex(rgbColor);
            return (
              <Circle
                key={suburb.id}
                center={[suburb.latitude, suburb.longitude]}
                radius={12000}
                pathOptions={{
                  color: hexColor,
                  fillColor: hexColor,
                  fillOpacity: 0.45,
                  weight: 1,
                  opacity: 0.6,
                }}
              >
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>
                      {suburb.suburb}, {suburb.state}
                    </p>
                    <p style={{ fontSize: 12, color: "#555" }}>
                      {overlayConfig.label}: <strong>{overlayConfig.format(val)}</strong>
                    </p>
                    {suburb.median_house_price && (
                      <p style={{ fontSize: 12, color: "#555" }}>
                        Median: ${suburb.median_house_price.toLocaleString()}
                      </p>
                    )}
                    {suburb.suburb_score && (
                      <p style={{ fontSize: 12, color: "#555" }}>
                        Demand Score: {suburb.suburb_score}
                      </p>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          })}

        {/* Property Markers */}
        {showProperties &&
          propertiesWithCoords.map((property) => (
            <Marker key={property.id} position={[property.latitude, property.longitude]}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{property.address}</p>
                  <p style={{ fontSize: 12, color: "#555" }}>${property.price?.toLocaleString()}</p>
                  <p style={{ fontSize: 12, color: "#555" }}>
                    Yield: {property.rental_yield}% | Score: {property.investment_score}
                  </p>
                  <p style={{ fontSize: 12, color: "#555" }}>Risk: {property.risk_level}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Control Panel */}
      <div
        className="absolute top-4 left-4 z-[1000] rounded-2xl p-4 space-y-3"
        style={{
          background: "rgba(5,8,16,0.92)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          minWidth: 220,
        }}
      >
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Heatmap Layer</p>

        <div className="space-y-1">
          {OVERLAY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveOverlay(opt.key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeOverlay === opt.key
                  ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/40"
                  : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-3">
          <button
            onClick={() => setShowProperties((v) => !v)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showProperties
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-gray-500 hover:bg-white/[0.05] hover:text-gray-300"
            }`}
          >
            {showProperties ? "● " : "○ "}Property Pins
          </button>
        </div>

        {/* Legend */}
        {overlayConfig?.key !== "none" && (
          <div className="border-t border-white/[0.06] pt-3">
            <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">Legend</p>
            <div
              className="h-3 rounded-full mb-1"
              style={{
                background: "linear-gradient(to right, rgb(239,68,68), rgb(251,191,36), rgb(16,185,129))",
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}