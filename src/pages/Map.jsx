import React from "react";
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

export default function MapPage() {
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => base44.entities.Property.list("-created_date", 200),
  });

  const { data: suburbs = [] } = useQuery({
    queryKey: ["suburbs"],
    queryFn: () => base44.entities.SuburbInsight.list(),
  });

  const propertiesWithCoords = properties.filter((p) => p.latitude && p.longitude);

  return (
    <div className="h-[calc(100vh-64px)]">
      <MapContainer
        center={[-33.8688, 151.2093]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />
        
        {propertiesWithCoords.map((property) => (
          <Marker key={property.id} position={[property.latitude, property.longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{property.address}</p>
                <p className="text-gray-600">${property.price?.toLocaleString()}</p>
                <p className="text-xs">Yield: {property.rental_yield}% | Score: {property.investment_score}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {suburbs.filter(s => s.latitude && s.longitude).map((suburb) => (
          <Circle
            key={suburb.id}
            center={[suburb.latitude, suburb.longitude]}
            radius={2000}
            pathOptions={{ color: "#6366f1", fillColor: "#6366f1", fillOpacity: 0.1 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{suburb.suburb}, {suburb.state}</p>
                <p className="text-xs">Score: {suburb.suburb_score}</p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}