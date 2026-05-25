"use client";

import { useState } from "react";
import { assignCarrierToTrip } from "@/app/actions/admin-operations";
import { InventoryModal } from "@/components/admin/inventory/inventory-modal";
import type { CarrierOption } from "@/types/inventory";
import type { TripRow } from "@/types/operations";

type AssignCarrierTripModalProps = {
  trip: TripRow;
  carriers: CarrierOption[];
  onClose: () => void;
};

const selectClassName =
  "mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20";

export function AssignCarrierTripModal({
  trip,
  carriers,
  onClose,
}: AssignCarrierTripModalProps) {
  const [carrierId, setCarrierId] = useState("");
  const hasCarriers = carriers.length > 0;

  return (
    <InventoryModal
      title="Assign carrier to trip"
      description={`Bind a carrier and their assigned stack to trip ${trip.origin_label?.split(" — ")[0] ?? "trip"}.`}      onClose={onClose}
      submitLabel="Assign carrier"
      disableSubmit={!hasCarriers || !carrierId}
      onSubmit={async () => assignCarrierToTrip(trip.id, carrierId)}
    >
      {!hasCarriers ? (
        <p className="rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-400">
          No carrier profiles available. Onboard carriers before assigning trips.
        </p>
      ) : (
        <label className="block text-sm">
          <span className="font-medium text-zinc-300">Carrier</span>
          <select
            value={carrierId}
            onChange={(event) => setCarrierId(event.target.value)}
            required
            className={selectClassName}
          >
            <option value="">Select a carrier</option>
            {carriers.map((carrier) => (
              <option key={carrier.id} value={carrier.id}>
                {carrier.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-zinc-500">
            The carrier&apos;s currently assigned stack from Inventory will be
            bound to this trip automatically.
          </p>
        </label>
      )}
    </InventoryModal>
  );
}
