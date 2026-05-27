"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Truck } from "lucide-react";
import { AssignCarrierTripModal } from "@/components/admin/trips/assign-carrier-trip-modal";
import {
  startTelemetrySimulation,
  stopTelemetrySimulation,
  isTelemetrySimulationActive,
} from "@/app/actions/telemetry";
import type { CarrierOption } from "@/types/inventory";
import type { TripRow } from "@/types/operations";

type TripRowActionsProps = {
  trip: TripRow;
  carriers: CarrierOption[];
};

export function TripRowActions({ trip, carriers }: TripRowActionsProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const closeAssignModal = useCallback(() => setAssignOpen(false), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const active = await isTelemetrySimulationActive(trip.id);
        if (mounted) setIsSimulating(Boolean(active));
      } catch (err) {
        console.error("Failed to get simulation state:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [trip.id]);

  const handleToggleSimulation = useCallback(async () => {
    if (!isSimulating) {
      try {
        await startTelemetrySimulation(trip.id);
        setIsSimulating(true);
      } catch (err) {
        console.error("Failed to start simulation:", err);
      }
    } else {
      try {
        await stopTelemetrySimulation(trip.id);
        setIsSimulating(false);
      } catch (err) {
        console.error("Failed to stop simulation:", err);
      }
    }
  }, [isSimulating, trip.id]);

  if (trip.status === "pending") {
    return (
      <>
        <button
          type="button"
          onClick={() => setAssignOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
          Assign Carrier
        </button>

        {assignOpen ? (
          <AssignCarrierTripModal
            trip={trip}
            carriers={carriers}
            onClose={closeAssignModal}
          />
        ) : null}
      </>
    );
  }

  if (trip.status === "on_trip") {
    return (
      <button
        type="button"
        onClick={handleToggleSimulation}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
          isSimulating
            ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20"
            : "border border-indigo-500/30 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20"
        }`}
      >
        <Activity className="h-3.5 w-3.5" strokeWidth={1.75} />
        {isSimulating ? "Stop Simulation" : "Simulate Telemetry"}
      </button>
    );
  }

  return <span className="text-xs text-zinc-600">—</span>;
}
