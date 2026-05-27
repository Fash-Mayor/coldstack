import MapViewShell, { type MapTrip } from "@/components/map/map-view-shell";
import { requireConsignee } from "@/lib/auth/consignee";
import { createClient } from "@/utils/supabase/server";

export default async function ConsigneeMapPage() {
  const { user } = await requireConsignee();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("consignee_id", user.id)
    .order("created_at", { ascending: false });

  if (error) console.error("Consignee trips error:", error);

  return (
    <MapViewShell
      initialTrips={(data ?? []) as MapTrip[]}
      title="Consignee Map"
    />
  );
}
