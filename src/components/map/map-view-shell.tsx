"use client";

import { useEffect, useState } from "react";
import UnifiedMap from "@/components/map/live-map";
import { createClient } from "@/utils/supabase/client";

export type MapTrip = {
  id: string;
  status: string;
  origin_label: string;
  destination_label: string;
};

type MapViewShellProps = {
  initialTrips?: MapTrip[];
  fetchAll?: boolean;
  title?: string;
};

export default function MapViewShell({
  initialTrips = [],
  fetchAll = false,
  title = "Trip map",
}: MapViewShellProps) {
  const [trips, setTrips] = useState<MapTrip[]>(initialTrips);
  const [selectedTrip, setSelectedTrip] = useState<MapTrip | null>(null);

  useEffect(() => {
    setTrips(initialTrips);
  }, [initialTrips]);

  useEffect(() => {
    if (!fetchAll || initialTrips.length > 0) {
      return;
    }

    const supabase = createClient();

    const loadTrips = async () => {
      const { data } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setTrips(data as MapTrip[]);
      }
    };

    loadTrips();
  }, [fetchAll, initialTrips]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-full max-w-sm shrink-0 border-r border-slate-800 bg-slate-900/95 p-5">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
            {title}
          </p>
          <h1 className="mt-2 text-xl font-semibold text-white">Trip map</h1>
          <p className="mt-2 text-sm text-slate-400">
            Select a trip to watch its live route and telemetry feed.
          </p>
        </div>

        <div className="space-y-3">
          {trips.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
              No trips available.
            </div>
          ) : (
            trips.map((trip) => {
              const isActive = selectedTrip?.id === trip.id;
              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setSelectedTrip(trip)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-cyan-500/60 bg-cyan-500/10 text-white"
                      : "border-slate-800 bg-slate-950/70 text-slate-200 hover:border-cyan-500/30 hover:bg-slate-900/80"
                  }`}
                >
                  <p className="font-semibold">{trip.origin_label}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    → {trip.destination_label}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {trip.status.replace("_", " ")}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 bg-slate-950">
        {selectedTrip ? (
          <div className="h-screen">
            <UnifiedMap tripId={selectedTrip.id} status={selectedTrip.status} />
          </div>
        ) : (
          <div className="flex h-screen items-center justify-center px-6 text-center text-slate-400">
            <div>
              <p className="text-lg font-semibold text-slate-100">
                Select a trip from the sidebar to view details
              </p>
              <p className="mt-2 text-sm text-slate-500">
                The map will zoom to the selected trip and render live telemetry
                updates when available.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
