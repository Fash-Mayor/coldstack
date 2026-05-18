"use client";

import { useEffect, useState } from "react";
import {
  getCarrierTrips,
  getTripDetails,
  updateTripStatus,
} from "@/app/actions/carrier";
import { TripCard } from "@/components/carrier/trip-card";
import { BeginTripModal } from "@/components/carrier/begin-trip-modal";
import { EndTripModal } from "@/components/carrier/end-trip-modal";
import { POCModal } from "@/components/carrier/poc-modal";
import type { CarrierTrip, TripPhotoRow } from "@/app/actions/carrier";

type ModalType = null | "begin" | "end" | "poc";

export default function CarrierPage() {
  const [trips, setTrips] = useState<CarrierTrip[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedTrip, setSelectedTrip] = useState<CarrierTrip | null>(null);
  const [tripPhotos, setTripPhotos] = useState<TripPhotoRow | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setError(null);
      const data = await getCarrierTrips();
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips.");
    } finally {
      setIsInitialLoad(false); // Only end the global load, don't trigger it again
    }
  }

  async function handleTripCardClick(trip: CarrierTrip) {
    if (trip.status === "assigned" || trip.status === "pending") {
      try {
        setError(null);
        setUpdatingTripId(trip.id); // Trigger ONLY this specific button's spinner

        // Optimistic UI update
        setTrips((current) =>
          current.map((t) =>
            t.id === trip.id ? { ...t, status: "en_route" } : t,
          ),
        );

        await updateTripStatus(trip.id, "en_route");
        await loadTrips();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update trip status.",
        );
        await loadTrips(); // Revert on failure
      } finally {
        setUpdatingTripId(null);
      }
      return;
    }

    if (trip.status === "en_route") {
      setSelectedTrip(trip);
      setActiveModal("begin");
    } else if (trip.status === "on_trip") {
      setSelectedTrip(trip);
      setActiveModal("end");
    } else if (trip.status === "completed") {
      // ... (keep your existing completed logic)
      try {
        const { trip: fullTrip, photos } = await getTripDetails(trip.id);
        setSelectedTrip(fullTrip as CarrierTrip);
        setTripPhotos(photos);
        setActiveModal("poc");
      } catch (err) {
        setError("Failed to load trip details");
      }
    }
  }

  function handleModalClose() {
    setActiveModal(null);
    setSelectedTrip(null);
    setTripPhotos(null);
    loadTrips(); // Reload trips to reflect any status changes
  }

  // Filter trips
  const pendingActivateTrips = trips.filter((t) => t.status !== "completed");
  const completedTrips = trips.filter((t) => t.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isInitialLoad ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-slate-600">Loading trips...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pending/Active Trips Section */}
            <section className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                Pending & Active Trips
              </h2>
              {pendingActivateTrips.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                  <p className="text-slate-600 text-sm">
                    No assigned or active trips yet, wait for admin to assign or
                    contact admin@coldstack.com
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="max-h-[36vh] sm:max-h-[30vh] overflow-y-auto px-4 py-4 space-y-4">
                    {pendingActivateTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        isLoading={updatingTripId === trip.id}
                        onStatusClick={() => handleTripCardClick(trip)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Completed Trips Section */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                Completed Trips
              </h2>
              {completedTrips.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-10 text-center">
                  <p className="text-slate-600 text-sm">
                    No completed trips yet. Trips will appear here after you
                    finish them.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="max-h-[28vh] sm:max-h-[22vh] overflow-y-auto px-4 py-4 space-y-4">
                    {completedTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onStatusClick={() => handleTripCardClick(trip)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Modals */}
      {selectedTrip && (
        <>
          <BeginTripModal
            tripId={selectedTrip.id}
            isOpen={activeModal === "begin"}
            onClose={handleModalClose}
          />
          <EndTripModal
            tripId={selectedTrip.id}
            isOpen={activeModal === "end"}
            onClose={handleModalClose}
          />
          <POCModal
            trip={selectedTrip}
            photos={tripPhotos}
            isOpen={activeModal === "poc"}
            onClose={handleModalClose}
          />
        </>
      )}
    </div>
  );
}
