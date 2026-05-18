import type { TripStatus } from "@/types/operations";

export const TRIPS_PATH = "/admin/trips";

export const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  "pending",
  "assigned",
  "en_route",
  "on_trip",
  "cancelled",
];

export const COMPLETED_TRIP_STATUS: TripStatus = "completed";
