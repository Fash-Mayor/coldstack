"use server";

import { createClient } from "@/utils/supabase/server";

export async function simulateTelemetryPings(tripId: string) {
  const supabase = await createClient();

  // Helper to generate a random coordinate near a start point
  const generateRandomCoords = (lat: number, lng: number) => {
    return {
      lat: lat + (Math.random() - 0.5) * 0.01,
      lng: lng + (Math.random() - 0.5) * 0.01,
    };
  };

  // Logic: Insert a fake row
  const { lat, lng } = generateRandomCoords(6.5244, 3.3792); // Base: Lagos coords

  const { error } = await supabase.from("telemetry").insert({
    trip_id: tripId,
    temperature: (Math.random() * 4 + 2).toFixed(1), // Random temp between 2.0 and 6.0
    coords: `POINT(${lng} ${lat})`, // WKT format for geography
    logged_at: new Date().toISOString(),
  });

  if (error) console.error("Telemetry Ping Failed:", error);
}