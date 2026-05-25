"use server";

import { createClient } from "@/utils/supabase/server";

const simulationIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

const generateRandomCoords = (lat: number, lng: number) => {
  return {
    lat: lat + (Math.random() - 0.5) * 0.01,  
    lng: lng + (Math.random() - 0.5) * 0.01,
  };
};

export async function simulateTelemetryPings(tripId: string) {
  const supabase = await createClient();

  const { lat, lng } = generateRandomCoords(6.5244, 3.3792); 
  const temp = parseFloat((Math.random() * 4 + 2).toFixed(1));

  // Call the Database Function (RPC) instead of a direct insert
  const { error } = await supabase.rpc("insert_telemetry", {
    p_trip_id: tripId,
    p_temp: temp,
    p_lat: lat,
    p_lng: lng,
  });

  if (error) {
    console.error("Telemetry Ping Failed (RPC Error):", error);
  }
}

export async function startTelemetrySimulation(tripId: string) {
  if (simulationIntervals.has(tripId)) return;

  const pingTelemetry = async () => {
    try {
      await simulateTelemetryPings(tripId);
    } catch (err) {
      console.error("Telemetry simulation failed:", err);
    }
  };

  // immediate ping then schedule
  await pingTelemetry();
  const handle = setInterval(pingTelemetry, 5000);
  simulationIntervals.set(tripId, handle);
}

export async function stopTelemetrySimulation(tripId: string) {
  const handle = simulationIntervals.get(tripId);
  if (!handle) return;
  clearInterval(handle);
  simulationIntervals.delete(tripId);
}

export async function isTelemetrySimulationActive(tripId: string) {
  return simulationIntervals.has(tripId);
}