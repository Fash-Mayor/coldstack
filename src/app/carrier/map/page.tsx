import MapViewShell, { type MapTrip } from "@/components/map/map-view-shell";
import { requireCarrier } from "@/lib/auth/carrier";
import { createClient } from "@/utils/supabase/server";

export default async function CarrierMapPage() {
  const { user } = await requireCarrier();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("carrier_id", user.id)
    .order("created_at", { ascending: false });

    if (error) console.error("Carrier trips error:", error);
    // setTrips(data || []);

  return (
    <MapViewShell
      initialTrips={(data ?? []) as MapTrip[]}
      title="Carrier Map"
    />
  );
}
