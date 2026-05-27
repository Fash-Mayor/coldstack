"use server";

import { requireConsignee } from "@/lib/auth/consignee";
import type { TripStatus } from "@/types/operations";
import { createClient } from "@/utils/supabase/server";

export type ConsigneeTrip = {
  id: string;
  status: TripStatus;
  origin_name_snapshot: string | null;
  origin_address_snapshot: string | null;
  destination_address_snapshot: string | null;
  dest_name_snapshot: string | null;
  target_temp: number;
  type_of_goods: string;
  carrier_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type TripPhotoRow = {
  id: string;
  trip_id: string;
  start_photo_url: string | null;
  end_photo_url: string | null;
  start_captured_at: string | null;
  end_captured_at: string | null;
};

export async function getConsigneeTrips() {
  const { user } = await requireConsignee();
  const supabase = await createClient();
  try {
    console.log("getConsigneeTrips: userId=", user.id);

    const { data: trips, error } = await supabase
      .from("trips")
      .select("*")
      .eq("consignee_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getConsigneeTrips db error:", error);
      return [] as ConsigneeTrip[];
    }

    console.log("getConsigneeTrips: rows=", Array.isArray(trips) ? trips.length : 0);
    return (trips ?? []) as ConsigneeTrip[];
  } catch (err) {
    console.error("getConsigneeTrips unexpected error:", err);
    return [] as ConsigneeTrip[];
  }
}

export async function getTripDetails(tripId: string) {
  const { user } = await requireConsignee();
  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("consignee_id", user.id)
    .single();

  if (tripError || !trip) {
    throw new Error("Trip not found or unauthorized");
  }

  const { data: photos, error: photoError } = await supabase
    .from("trip_photos")
    .select("*")
    .eq("trip_id", tripId)
    .single();

  if (photoError && photoError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    throw new Error(photoError.message);
  }

  return { trip, photos: photos as TripPhotoRow | null };
}
