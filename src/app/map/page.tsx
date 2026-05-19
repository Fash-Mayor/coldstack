"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/client";

const UnifiedMap = dynamic(() => import('@/components/map/live-map'), { ssr: false });

export default function MapPage() {
  const [selectedTrip, setSelectedTrip] = useState<{id: string, status: string} | null>(null);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    // Fetch trips based on user access
    // Admin: Select * from trips
    // Carrier: Select * from trips where carrier_id = user.id
    const fetchTrips = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("trips").select("*"); // Supabase RLS handles the rest!
      setTrips(data || []);
    };
    fetchTrips();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar Trip Selector */}
      <div className="w-80 border-r border-slate-200 overflow-y-auto">
        <h2 className="p-4 font-bold">Active & Past Trips</h2>
        {trips.map(trip => (
          <button 
            key={trip.id} 
            onClick={() => setSelectedTrip(trip)}
            className={`w-full p-4 border-b text-left ${selectedTrip?.id === trip.id ? 'bg-blue-50' : ''}`}
          >
            <p className="font-semibold">Trip to {trip.dest_name_snapshot}</p>
            <p className="text-xs text-slate-500 capitalize">{trip.status}</p>
          </button>
        ))}
      </div>

      {/* Main Map Panel */}
      <div className="flex-1">
        {selectedTrip ? (
           <UnifiedMap tripId={selectedTrip.id} status={selectedTrip.status} />
        ) : (
           <div className="h-full flex items-center justify-center text-slate-400">
             Select a trip from the sidebar to view details
           </div>
        )}
      </div>
    </div>
  );
}