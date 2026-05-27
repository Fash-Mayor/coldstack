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
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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

  const handleTripSelect = (trip: MapTrip) => {
    setSelectedTrip(trip);
    setIsPanelOpen(false);
  };

  const hasTrips = trips.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 md:flex-row">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-full max-w-sm overflow-y-auto border-r border-slate-800 bg-slate-900/95 p-5 shadow-2xl transition-transform duration-300 ease-out md:static md:translate-x-0 md:shadow-none md:bg-slate-900/95 ${
          isPanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
              {title}
            </p>
            <h1 className="mt-2 text-xl font-semibold text-white">Trip map</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:text-white md:hidden"
            onClick={() => setIsPanelOpen(false)}
          >
            Close
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-400">
          Select a trip to watch its live route and telemetry feed.
        </p>

        <div className="space-y-3 pb-8">
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
                  onClick={() => handleTripSelect(trip)}
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

      {isPanelOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/70 transition-opacity duration-300 md:hidden"
          aria-label="Close trip list"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      <main className="relative flex-1">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 md:hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-400/80">
              {title}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {selectedTrip
                ? "Tap to change the active trip."
                : "Open the trip list to choose a route."}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:text-white"
            onClick={() => setIsPanelOpen(true)}
          >
            {hasTrips
              ? selectedTrip
                ? "Change trip"
                : "Choose trip"
              : "Trips"}
          </button>
        </div>

        <div className="h-[calc(100vh-64px)] md:h-screen">
          {selectedTrip ? (
            <UnifiedMap tripId={selectedTrip.id} status={selectedTrip.status} />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-slate-400">
              <div>
                <p className="text-lg font-semibold text-slate-100">
                  Select a trip from the list to view the live map.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  On mobile, use the button above to open and change trips.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
