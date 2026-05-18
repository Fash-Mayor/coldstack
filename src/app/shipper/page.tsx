import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Shipper | ColdStack",
};

export default function ShipperPage() {
  return (
    <DashboardShell
      role="shipper"
      title="Shipper workspace"
      description="Create and track outbound cold-chain shipments with live telemetry and proof of condition."
    />
  );
}
