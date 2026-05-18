import type { TripStatus } from "@/types/operations";

const LABELS: Record<TripStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  en_route: "En Route",
  on_trip: "On Trip",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STYLES: Record<TripStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  assigned: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  en_route: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  on_trip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  completed: "border-zinc-500/30 bg-zinc-700/40 text-zinc-300",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function TripStatusBadge({ status }: { status: TripStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
