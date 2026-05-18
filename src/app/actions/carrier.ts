"use server";

import { revalidatePath } from "next/cache";
import { requireCarrier } from "@/lib/auth/carrier";
import type { TripStatus } from "@/types/operations";
import { createClient } from "@/utils/supabase/server";

export type CarrierTrip = {
  id: string;
  status: TripStatus;
  origin_name_snapshot: string | null;
  origin_address_snapshot: string | null;
  destination_address_snapshot: string | null;
  dest_name_snapshot: string | null;
  target_temp: number;
  type_of_goods: string;
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

export async function getCarrierTrips() {
  const { user } = await requireCarrier();
  const supabase = await createClient();

  const { data: trips, error } = await supabase
    .from("trips")
    .select(
      "id, status, origin_name_snapshot, origin_address_snapshot, destination_address_snapshot, dest_name_snapshot, target_temp, type_of_goods, created_at, started_at, completed_at"
    )
    .eq("carrier_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return trips as CarrierTrip[];
}

export async function updateTripStatus(tripId: string, newStatus: TripStatus) {
  const { user } = await requireCarrier();
  const supabase = await createClient();

  // Verify the trip belongs to the carrier
  const { data: trip, error: fetchError } = await supabase
    .from("trips")
    .select("id, carrier_id, status, started_at")
    .eq("id", tripId)
    .eq("carrier_id", user.id)
    .single();

  if (fetchError || !trip) {
    throw new Error("Trip not found or unauthorized");
  }

  const updateData: Record<string, any> = { status: newStatus };

  // Set started_at when transitioning to on_trip
  if (newStatus === "on_trip" && !trip.started_at) {
    updateData.started_at = new Date().toISOString();
  }

  // Set completed_at when transitioning to completed
  if (newStatus === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("trips")
    .update(updateData)
    .eq("id", tripId)
    .eq("carrier_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/carrier");
}

export async function uploadTripPhoto(
  tripId: string,
  photoType: "start" | "end",
  formData: FormData // Changed from File to FormData to prevent Next.js fetch failures
) {
  const { user } = await requireCarrier();
  const supabase = await createClient();

  // Extract the file safely from FormData container
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded or file missing from request.");
  }

  // Verify the trip belongs to the carrier
  const { data: trip, error: fetchError } = await supabase
    .from("trips")
    .select("id, carrier_id")
    .eq("id", tripId)
    .eq("carrier_id", user.id)
    .single();

  if (fetchError || !trip) {
    throw new Error("Trip not found or unauthorized");
  }

  // Generate storage path
  const timestamp = Date.now();
  const fileName = `${tripId}/${photoType}_${timestamp}_${file.name}`;
  const bucketName = "trip-photos";

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(uploadData.path);

  const photoUrl = urlData.publicUrl;
  const capturedAt = new Date().toISOString();

  // Update trip_photos table
  const photoFieldUrl = photoType === "start" ? "start_photo_url" : "end_photo_url";
  const photoFieldTime = photoType === "start" ? "start_captured_at" : "end_captured_at";

  // Changed from .update() to .upsert() so it creates the row if it's missing!
  const { error: updateError } = await supabase
    .from("trip_photos")
    .upsert(
      {
        trip_id: tripId,
        [photoFieldUrl]: photoUrl,
        [photoFieldTime]: capturedAt,
      },
      { onConflict: "trip_id" } // Directs Postgres to update existing fields if trip_id matches
    );

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/carrier");

  return { url: photoUrl, capturedAt };
}

export async function getTripDetails(tripId: string) {
  const { user } = await requireCarrier();
  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("carrier_id", user.id)
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
