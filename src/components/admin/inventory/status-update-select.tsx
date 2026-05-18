"use client";

import { useTransition } from "react";
import type { InventoryActionState } from "@/types/inventory";

type StatusUpdateSelectProps<T extends string> = {
  itemId: string;
  currentStatus: T;
  options: T[];
  onUpdate: (id: string, status: string) => Promise<InventoryActionState>;
};

export function StatusUpdateSelect<T extends string>({
  itemId,
  currentStatus,
  options,
  onUpdate,
}: StatusUpdateSelectProps<T>) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(event) => {
        const nextStatus = event.target.value;
        if (nextStatus === currentStatus) return;

        startTransition(async () => {
          await onUpdate(itemId, nextStatus);
        });
      }}
      className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Change status"
    >
      {options.map((status) => (
        <option key={status} value={status}>
          Set: {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
}
