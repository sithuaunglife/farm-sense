"use client";

import { CircleMarker, MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { useState } from "react";
import { apiUrl } from "@/services/farm-sense-api";

interface SatelliteMapProps {
  center: [number, number];
  date: string;
  layer: "true_color_terra" | "true_color_aqua";
  label: string;
}

export default function SatelliteMap({ center, date, layer, label }: SatelliteMapProps) {
  const [tileError, setTileError] = useState(false);
  return (
    <div className="satellite-map-wrap">
      <MapContainer
        center={center}
        zoom={6}
        minZoom={0}
        maxZoom={9}
        zoomControl={false}
        scrollWheelZoom
        className="satellite-map"
        aria-label={`${label} NASA satellite imagery, ${date}`}
      >
        <TileLayer
          url={apiUrl(`/api/v1/tiles/${layer}/${date}/{z}/{x}/{y}.jpg`)}
          maxNativeZoom={9}
          maxZoom={9}
          attribution="Imagery served by Farm Sense · NASA"
          eventHandlers={{ tileerror: () => setTileError(true), load: () => setTileError(false) }}
        />
        <CircleMarker center={center} radius={7} pathOptions={{ color: "#ffc24d", fillColor: "#ffc24d", fillOpacity: 0.9, weight: 2 }} />
        <ZoomControl position="bottomright" />
      </MapContainer>
      {tileError && <div className="tile-error" role="alert">Satellite imagery could not be loaded. Check network access and backend CORS settings.</div>}
    </div>
  );
}

