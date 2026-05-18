import { getInventoryData } from "@/app/actions/admin";
import { InventoryPanel } from "@/components/admin/inventory/inventory-panel";

export const metadata = {
  title: "Stacks & Loggers | ColdStack Admin",
};

export default async function AdminStacksLoggersPage() {
  const data = await getInventoryData();

  return <InventoryPanel data={data} />;
}
