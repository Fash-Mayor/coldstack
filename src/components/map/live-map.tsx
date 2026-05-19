"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { createClient } from "@/utils/supabase/client";

// Leaflet default icon asset fix for Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Structural controller to shift focus to updated pins
function MapController({ coords, path }: { coords: [number, number] | null, path: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, map.getZoom(), { animate: true });
  }, [coords, map]);
  
  return path.length > 0 ? <Polyline positions={path} color="#3b82f6" weight={4} /> : null;
}

// 🛡️ Enhanced Multi-Format Coordinates Decoder
function parseCoordinates(rawCoords: any): [number, number] | null {
  if (!rawCoords) return null;

  try {
    if (typeof rawCoords === "string" && /^[0-9a-fA-F]+$/.test(rawCoords)) {
      const bytes = new Uint8Array(rawCoords.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(rawCoords.substring(i * 2, i * 2 + 2), 16);
      }
      const view = new DataView(bytes.buffer);
      const isLittleEndian = bytes[0] === 1;
      const geomType = view.getUint32(1, isLittleEndian);
      const hasSRID = (geomType & 0x20000000) !== 0;
      let offset = 5; 
      if (hasSRID) offset += 4; 
      const lng = view.getFloat64(offset, isLittleEndian);
      const lat = view.getFloat64(offset + 8, isLittleEndian);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }

    if (typeof rawCoords === "string") {
      const match = rawCoords.match(/POINT\(([-\d.]+) ([-\d.]+)\)/i);
      if (match) {
        const lng = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
      }
    } 

    if (typeof rawCoords === "object" && rawCoords.type === "Point" && Array.isArray(rawCoords.coordinates)) {
      const lng = parseFloat(rawCoords.coordinates[0]);
      const lat = parseFloat(rawCoords.coordinates[1]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
  } catch (err) {
    console.error("Decoder failed parsing coordinates record:", err, rawCoords);
  }
  
  return null;
}

export default function UnifiedMap({ tripId, status }: { tripId: string, status: string }) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null); // 🌡️ Track temperature state
  const [path, setPath] = useState<[number, number][]>([]);
  const supabase = createClient();

  useEffect(() => {
    setPath([]); 
    setCoords(null);
    setCurrentTemp(null);
    
    // Fetch initial trace points history
    const loadData = async () => {
      const { data, error } = await supabase
        .from("telemetry")
        .select("coords, temperature, logged_at") // 🌡️ Make sure to fetch temperature!
        .eq("trip_id", tripId)
        .order("logged_at", { ascending: true });

      if (error) console.error("Telemetry history database error:", error);

      if (data && data.length > 0) {
        const points = data
          .map((d: any) => parseCoordinates(d.coords))
          .filter(Boolean) as [number, number][];

        setPath(points);
        if (points.length > 0) {
          setCoords(points[points.length - 1]);
          // Set the temperature from the last recorded point
          const lastValidTemp = data[data.length - 1]?.temperature;
          setCurrentTemp(lastValidTemp !== undefined ? parseFloat(lastValidTemp) : null);
        }
      }
    };

    loadData();

    // Stream live adjustments 
    if (status === "on_trip") {
      const channel = supabase
        .channel(`trip-${tripId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "telemetry", filter: `trip_id=eq.${tripId}` }, 
          (payload) => {
            const newPoint = parseCoordinates(payload.new.coords);
            if (newPoint) {
              setCoords(newPoint);
              setPath((prev) => [...prev, newPoint]);
              
              // 🌡️ Update temperature dynamically on live ping
              if (payload.new.temperature !== undefined) {
                setCurrentTemp(parseFloat(payload.new.temperature));
              }
            }
          })
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
    }
  }, [tripId, status, supabase]);

  if (!coords) {
    return (
      <div className="h-125 w-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-medium">
        Connecting to telemetry positioning system...
      </div>
    );
  }

  // Determine temperature alert styling context (e.g., alert colors if it gets too hot)
  const isTooWarm = currentTemp !== null && currentTemp > 8; // Adjust threshold as needed for your goods

  return (
    <div className="relative w-full z-0 rounded-xl overflow-hidden shadow-sm border border-slate-200" style={{ height: '600px' }}>
      <MapContainer 
        center={coords} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        <Marker position={coords} icon={icon}>
          {/* 🌡️ Permanent floating message box above the marker */}
          <Tooltip 
            permanent 
            direction="top" 
            offset={[0, -40]} 
            className="bg-transparent! border-none! shadow-none!"
          >
            <div className={`px-2 py-1 rounded-md shadow-md border text-xs font-bold flex items-center gap-1 text-white animate-bounce
              ${isTooWarm 
                ? 'bg-red-600 border-red-700 ring-2 ring-red-300' 
                : 'bg-emerald-600 border-emerald-700'
              }`}
            >
              <span className="text-[10px]">🌡️</span>
              {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : "N/A"}
            </div>
          </Tooltip>

          <Popup>
            <div className="text-xs font-semibold p-1">
              <p className="border-b pb-1 mb-1 font-bold text-slate-700">Active Cargo</p>
              <p>Current Temp: {currentTemp !== null ? `${currentTemp}°C` : "No data"}</p>
            </div>
          </Popup>
        </Marker>
        
        <MapController coords={coords} path={path} />
      </MapContainer>
    </div>
  );
}