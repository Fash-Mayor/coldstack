"use client";

import { useCallback, useState } from "react";
import { Truck } from "lucide-react";
import { AssignCarrierTripModal } from "@/components/admin/trips/assign-carrier-trip-modal";
import type { CarrierOption } from "@/types/inventory";
import type { TripRow } from "@/types/operations";

type TripRowActionsProps = {
  trip: TripRow;
  carriers: CarrierOption[];
};

export function TripRowActions({ trip, carriers }: TripRowActionsProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const closeAssignModal = useCallback(() => setAssignOpen(false), []);

  if (trip.status !== "pending") {
    return <span className="text-xs text-zinc-600">—</span>;
  }

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
