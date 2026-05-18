"use client";

import { useState } from "react";
import { pairLoggerToStack } from "@/app/actions/admin";
import { InventoryModal } from "@/components/admin/inventory/inventory-modal";
import type { AvailableLoggerOption, StackRow } from "@/types/inventory";

type PairLoggerModalProps = {
  stack: StackRow;
  availableLoggers: AvailableLoggerOption[];
  onClose: () => void;
};

const selectClassName =
  "mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20";

export function PairLoggerModal({
  stack,
  availableLoggers,
  onClose,
}: PairLoggerModalProps) {
  const [loggerId, setLoggerId] = useState("");

  const hasAvailable = availableLoggers.length > 0;

  return (
    <InventoryModal
      title="Pair logger to stack"
      description={`Assign an available logger to stack ${stack.serial}.`}
      onClose={onClose}
      submitLabel="Pair logger"
      disableSubmit={!hasAvailable || !loggerId}
      onSubmit={async () => pairLoggerToStack(stack.id, loggerId)}
    >
      {!hasAvailable ? (
        <p className="rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-400">
          No available loggers to pair. Loggers must be in Ready status and not
          already linked to another stack.
        </p>
      ) : (
        <label className="block text-sm">
          <span className="font-medium text-zinc-300">Available logger</span>
          <select
            value={loggerId}
            onChange={(event) => setLoggerId(event.target.value)}
            required
            className={selectClassName}
          >
            <option value="">Select a logger</option>
            {availableLoggers.map((logger) => (
              <option key={logger.id} value={logger.id}>
                {logger.serial} (Ready)
              </option>
            ))}
          </select>
        </label>
      )}
    </InventoryModal>
  );
}
