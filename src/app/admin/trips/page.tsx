import { getOperationsData } from "@/app/actions/admin-operations";
import { TripsPanel } from "@/components/admin/trips/trips-panel";

export const metadata = {
  title: "Trips | ColdStack Admin",
};

export default async function AdminTripsPage() {
  const data = await getOperationsData();

  return <TripsPanel data={data} />;
}
