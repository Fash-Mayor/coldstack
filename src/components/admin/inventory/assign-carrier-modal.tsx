"use client";

import { useState } from "react";
import { assignStackToCarrier } from "@/app/actions/admin";
import { InventoryModal } from "@/components/admin/inventory/inventory-modal";
import type { CarrierOption, StackRow } from "@/types/inventory";

type AssignCarrierModalProps = {
  stack: StackRow;
  carriers: CarrierOption[];
  onClose: () => void;
};

const selectClassName =
  "mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20";

export function AssignCarrierModal({
  stack,
  carriers,
  onClose,
}: AssignCarrierModalProps) {
  const [carrierId, setCarrierId] = useState("");
  const hasCarriers = carriers.length > 0;

  return (
    <InventoryModal
      title="Assign carrier to stack"
      description={`Assign a carrier profile to stack ${stack.serial}. Status will be set to Active.`}
      onClose={onClose}
      submitLabel="Assign carrier"
      disableSubmit={!hasCarriers || !carrierId}
      onSubmit={async () => assignStackToCarrier(stack.id, carrierId)}
    >
      {!hasCarriers ? (
        <p className="rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-400">
          No carrier profiles found. Create carrier accounts via onboarding first.
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
        </label>
      )}
    </InventoryModal>
  );
}
