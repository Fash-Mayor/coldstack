"use client";

import { useCallback, useMemo, useState } from "react";
import { ClipboardList, FileCheck, Plus } from "lucide-react";
import { CreateTripModal } from "@/components/admin/trips/create-trip-modal";
import { TripsTable } from "@/components/admin/trips/trips-table";
import {
  ACTIVE_TRIP_STATUSES,
  COMPLETED_TRIP_STATUS,
} from "@/lib/operations/constants";
import type { OperationsData } from "@/types/operations";

type TripsView = "active" | "completed";

type TripsPanelProps = {
  data: OperationsData;
};

export function TripsPanel({ data }: TripsPanelProps) {
  const [activeView, setActiveView] = useState<TripsView>("active");
  const [createOpen, setCreateOpen] = useState(false);
  const closeCreateModal = useCallback(() => setCreateOpen(false), []);

  const activeTrips = useMemo(
    () => data.trips.filter((trip) => ACTIVE_TRIP_STATUSES.includes(trip.status)),
    [data.trips]
  );

  const completedTrips = useMemo(
    () => data.trips.filter((trip) => trip.status === COMPLETED_TRIP_STATUS),
    [data.trips]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
          Trip operations
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          Delivery tracking
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Create cold-chain trips from shipper origins to consignee destinations.
          Assign carriers and bind their inventory stacks when ready to dispatch.
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-1.5">
          <ViewTab
            active={activeView === "active"}
            onClick={() => setActiveView("active")}
            icon={ClipboardList}
            label={`Active / Pending (${activeTrips.length})`}
          />
          <ViewTab
            active={activeView === "completed"}
            onClick={() => setActiveView("completed")}
            icon={FileCheck}
            label={`Completed & POC (${completedTrips.length})`}
          />
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Create New Trip
        </button>
      </div>

      {activeView === "active" ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              Active / Pending Trips
            </h3>
            <p className="text-sm text-zinc-500">
              Pending, assigned, in-transit, and cancelled shipments.
            </p>
          </div>
          <TripsTable
            trips={activeTrips}
            carriers={data.carriers}
            emptyMessage="No active or pending trips. Create a new trip to get started."
          />
        </section>
      ) : (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              Completed Trips &amp; POC Certs
            </h3>
            <p className="text-sm text-zinc-500">
              Delivered trips with proof-of-condition certificate links.
            </p>
          </div>
          <TripsTable
            trips={completedTrips}
            carriers={data.carriers}
            showPocColumn
            emptyMessage="No completed trips yet."
          />
        </section>
      )}

      {createOpen ? (
        <CreateTripModal
          shippers={data.shippers}
          consignees={data.consignees}
          onClose={closeCreateModal}
        />
      ) : null}
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ClipboardList;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/25"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}
