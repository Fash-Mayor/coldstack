"use client";

import { useEffect, useState } from "react";
import {
  getConsigneeTrips,
  getTripDetails,
} from "@/app/actions/consignee";
import { TripCard } from "@/components/carrier/trip-card";
import { POCModal } from "@/components/carrier/poc-modal";
import type { ConsigneeTrip, TripPhotoRow } from "@/app/actions/consignee";

export default function ConsigneePage() {
  const [trips, setTrips] = useState<ConsigneeTrip[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<ConsigneeTrip | null>(null);
  const [tripPhotos, setTripPhotos] = useState<TripPhotoRow | null>(null);
  const [pocModalOpen, setPocModalOpen] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setError(null);
      const data = await getConsigneeTrips();

      // 🚨 DIAGNOSTIC CHECKPOINTS
      console.log("📊 [Dashboard Data Debug]:", data);
      if (data && data.length > 0) {
        console.log("🆔 First trip stakeholder columns:", {
          id: data[0].id,
          status: data[0].status,
          // shipper: data[0].shipper_id,
          // consignee: data[0].consignee_id
        });
      }

      setTrips(data);
    } catch (err) {
      console.error("❌ Dashboard Load Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load trips.");
    } finally {
      setIsInitialLoad(false);
    }
  }

  async function handleTripCardClick(trip: ConsigneeTrip) {
    if (trip.status === "completed" || trip.status === "cancelled") {
      try {
        setError(null);
        const { trip: fullTrip, photos } = await getTripDetails(trip.id);
        setSelectedTrip(fullTrip as ConsigneeTrip);
        setTripPhotos(photos);
        setPocModalOpen(true);
      } catch (err) {
        setError("Failed to load trip details");
      }
    }
  }

  function handleModalClose() {
    setPocModalOpen(false);
    setSelectedTrip(null);
    setTripPhotos(null);
  }

  // Filter trips into pending/active and completed
  const pendingActiveTrips = trips.filter(
    (t) => t.status === "on_trip" || t.status === "pending",
  );
  const completedTrips = trips.filter(
    (t) => t.status === "completed" || t.status === "cancelled",
  );

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
            {/* Pending & Active Trips Section */}
            <section className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                Pending & Active Trips
              </h2>
              {pendingActiveTrips.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                  <p className="text-slate-600 text-sm">
                    No pending or active trips yet. Your inbound deliveries
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="max-h-[36vh] sm:max-h-[30vh] overflow-y-auto px-4 py-4 space-y-4">
                    {pendingActiveTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={{
                          id: trip.id,
                          status: trip.status,
                          origin_name_snapshot: trip.origin_name_snapshot,
                          origin_address_snapshot: trip.origin_address_snapshot,
                          destination_address_snapshot:
                            trip.destination_address_snapshot,
                          dest_name_snapshot: trip.dest_name_snapshot,
                          target_temp: trip.target_temp,
                          type_of_goods: trip.type_of_goods,
                          created_at: trip.created_at,
                          started_at: trip.started_at,
                          completed_at: trip.completed_at,
                        }}
                        onStatusClick={() => {}}
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
                    No completed trips yet. Completed deliveries will appear
                    here after receipt.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="max-h-[28vh] sm:max-h-[22vh] overflow-y-auto px-4 py-4 space-y-4">
                    {completedTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={{
                          id: trip.id,
                          status: trip.status,
                          origin_name_snapshot: trip.origin_name_snapshot,
                          origin_address_snapshot: trip.origin_address_snapshot,
                          destination_address_snapshot:
                            trip.destination_address_snapshot,
                          dest_name_snapshot: trip.dest_name_snapshot,
                          target_temp: trip.target_temp,
                          type_of_goods: trip.type_of_goods,
                          created_at: trip.created_at,
                          started_at: trip.started_at,
                          completed_at: trip.completed_at,
                        }}
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

      {/* POC Modal */}
      {selectedTrip && (
        <POCModal
          trip={selectedTrip as any}
          photos={tripPhotos}
          isOpen={pocModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );


  // return (
  //   <div className="flex-1 overflow-y-auto bg-slate-50">
  //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
  //       {/* Error Alert */}
  //       {error && (
  //         <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
  //           {error}
  //         </div>
  //       )}

  //       {isInitialLoad ? (
  //         <div className="flex items-center justify-center py-12">
  //           <div className="text-center">
  //             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
  //               <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
  //             </div>
  //             <p className="text-slate-600">Loading trips...</p>
  //           </div>
  //         </div>
  //       ) : (
  //         <>
  //           {/* Pending & Active Trips Section */}
  //           <section className="mb-8">
  //             <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
  //               Pending & Active Trips
  //             </h2>
  //             {pendingActiveTrips.length === 0 ? (
  //               <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
  //                 <p className="text-slate-600 text-sm">
  //                   No pending or active trips yet. Your inbound deliveries will
  //                   appear here.
  //                 </p>
  //               </div>
  //             ) : (
  //               <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
  //                 <div className="max-h-[36vh] sm:max-h-[30vh] overflow-y-auto px-4 py-4 space-y-4">
  //                   {pendingActiveTrips.map((trip) => (
  //                     <TripCard
  //                       key={trip.id}
  //                       trip={{
  //                         id: trip.id,
  //                         status: trip.status,
  //                         origin_name_snapshot: trip.origin_name_snapshot,
  //                         origin_address_snapshot: trip.origin_address_snapshot,
  //                         destination_address_snapshot:
  //                           trip.destination_address_snapshot,
  //                         dest_name_snapshot: trip.dest_name_snapshot,
  //                         target_temp: trip.target_temp,
  //                         type_of_goods: trip.type_of_goods,
  //                         created_at: trip.created_at,
  //                         started_at: trip.started_at,
  //                         completed_at: trip.completed_at,
  //                       }}
  //                       onStatusClick={() => {}}
  //                     />
  //                   ))}
  //                 </div>
  //               </div>
  //             )}
  //           </section>

  //           {/* Completed Trips Section */}
  //           <section>
  //             <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
  //               Completed Trips
  //             </h2>
  //             {completedTrips.length === 0 ? (
  //               <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-10 text-center">
  //                 <p className="text-slate-600 text-sm">
  //                   No completed trips yet. Completed deliveries will appear
  //                   here after receipt.
  //                 </p>
  //               </div>
  //             ) : (
  //               <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
  //                 <div className="max-h-[28vh] sm:max-h-[22vh] overflow-y-auto px-4 py-4 space-y-4">
  //                   {completedTrips.map((trip) => (
  //                     <TripCard
  //                       key={trip.id}
  //                       trip={{
  //                         id: trip.id,
  //                         status: trip.status,
  //                         origin_name_snapshot: trip.origin_name_snapshot,
  //                         origin_address_snapshot: trip.origin_address_snapshot,
  //                         destination_address_snapshot:
  //                           trip.destination_address_snapshot,
  //                         dest_name_snapshot: trip.dest_name_snapshot,
  //                         target_temp: trip.target_temp,
  //                         type_of_goods: trip.type_of_goods,
  //                         created_at: trip.created_at,
  //                         started_at: trip.started_at,
  //                         completed_at: trip.completed_at,
  //                       }}
  //                       onStatusClick={() => {}}
  //                     />
  //                   ))}
  //                 </div>
  //               </div>
  //             )}
  //           </section>
  //         </>
  //       )}
  //     </div>
  //   </div>
  // );
}
