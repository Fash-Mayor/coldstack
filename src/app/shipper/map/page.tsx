import MapViewShell, { type MapTrip } from "@/components/map/map-view-shell";
import { requireShipper } from "@/lib/auth/shipper";
import { createClient } from "@/utils/supabase/server";

export default async function ShipperMapPage() {
  const { user } = await requireShipper();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("shipper_id", user.id)
    .order("created_at", { ascending: false });

  if (error) console.error("Shipper trips error:", error);

  return (
    <MapViewShell
      initialTrips={(data ?? []) as MapTrip[]}
      title="Shipper Map"
    />
  );
}
