import type { LoggerStatus, StackStatus } from "@/types/inventory";

const STACK_LABELS: Record<StackStatus, string> = {
  active: "Active",
  ready: "Ready",
  warehouse: "Warehouse",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
};

const LOGGER_LABELS: Record<LoggerStatus, string> = {
  warehouse: "Warehouse",
  maintenance: "Maintenance",
  active: "Active",
  ready: "Ready",
};

const STACK_STYLES: Record<StackStatus, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ready: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  warehouse: "border-zinc-600/40 bg-zinc-800/60 text-zinc-400",
  cleaning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  maintenance: "border-red-500/30 bg-red-500/10 text-red-400",
};

const LOGGER_STYLES: Record<LoggerStatus, string> = {
  warehouse: "border-zinc-600/40 bg-zinc-800/60 text-zinc-400",
  maintenance: "border-red-500/30 bg-red-500/10 text-red-400",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ready: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

type StackStatusBadgeProps = {
  status: StackStatus;
};

type LoggerStatusBadgeProps = {
  status: LoggerStatus;
};

export function StackStatusBadge({ status }: StackStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STACK_STYLES[status]}`}
    >
      {STACK_LABELS[status]}
    </span>
  );
}

export function LoggerStatusBadge({ status }: LoggerStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LOGGER_STYLES[status]}`}
    >
      {LOGGER_LABELS[status]}
    </span>
  );
}

export const STACK_STATUS_OPTIONS: StackStatus[] = [
  "active",
  "ready",
  "warehouse",
  "cleaning",
  "maintenance",
];

export const LOGGER_STATUS_OPTIONS: LoggerStatus[] = [
  "warehouse",
  "maintenance",
  "active",
  "ready",
];
