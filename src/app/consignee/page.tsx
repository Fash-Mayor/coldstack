import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Consignee | ColdStack",
};

export default function ConsigneePage() {
  return (
    <DashboardShell
      role="consignee"
      title="Consignee receiving"
      description="Monitor inbound trips, verify temperatures on delivery, and confirm proof of condition."
    />
  );
}
