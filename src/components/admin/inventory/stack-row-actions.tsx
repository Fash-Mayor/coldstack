"use client";

import { useCallback, useState, useTransition } from "react";
import { Link2, Truck, Unlink } from "lucide-react";
import {
  unassignStackFromCarrier,
  unpairLoggerFromStack,
  updateStackStatus,
} from "@/app/actions/admin";
import { AssignCarrierModal } from "@/components/admin/inventory/assign-carrier-modal";
import { PairLoggerModal } from "@/components/admin/inventory/pair-logger-modal";
import { StatusUpdateSelect } from "@/components/admin/inventory/status-update-select";
import {
  STACK_STATUS_OPTIONS,
} from "@/components/admin/inventory/status-badge";
import type {
  AvailableLoggerOption,
  CarrierOption,
  StackRow,
} from "@/types/inventory";

type StackRowActionsProps = {
  stack: StackRow;
  availableLoggers: AvailableLoggerOption[];
  carriers: CarrierOption[];
};

export function StackRowActions({
  stack,
  availableLoggers,
  carriers,
}: StackRowActionsProps) {
  const [pairOpen, setPairOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const closePairModal = useCallback(() => setPairOpen(false), []);
  const closeAssignModal = useCallback(() => setAssignOpen(false), []);

  const isPaired = Boolean(stack.current_logger_id);
  const isCarrierAssigned = Boolean(stack.carrier_id);

  function handleUnpair() {
    if (!stack.current_logger_id) return;

    startTransition(async () => {
      await unpairLoggerFromStack(stack.id, stack.current_logger_id!);
    });
  }

  function handleUnassignCarrier() {
    startTransition(async () => {
      await unassignStackFromCarrier(stack.id);
    });
  }

  return (
    <>
      <div className="flex min-w-[220px] flex-col gap-2">
        <StatusUpdateSelect
          itemId={stack.id}
          currentStatus={stack.status}
          options={STACK_STATUS_OPTIONS}
          onUpdate={updateStackStatus}
        />

        {isPaired ? (
          <button
            type="button"
            onClick={handleUnpair}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
          >
            <Unlink className="h-3.5 w-3.5" strokeWidth={1.75} />
            Unpair {stack.paired_logger_serial ?? "logger"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPairOpen(true)}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-60"
          >
            <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Pair Logger
          </button>
        )}

        {isCarrierAssigned ? (
          <button
            type="button"
            onClick={handleUnassignCarrier}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-600 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-60"
          >
            <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
            Unassign Carrier
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-60"
          >
            <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
            Assign Carrier
          </button>
        )}
      </div>

      {pairOpen ? (
        <PairLoggerModal
          stack={stack}
          availableLoggers={availableLoggers}
          onClose={closePairModal}
        />
      ) : null}

      {assignOpen ? (
        <AssignCarrierModal
          stack={stack}
          carriers={carriers}
          onClose={closeAssignModal}
        />
      ) : null}
    </>
  );
}
