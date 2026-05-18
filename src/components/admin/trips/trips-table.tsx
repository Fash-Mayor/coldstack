import { TripRowActions } from "@/components/admin/trips/trip-row-actions";
import { TripStatusBadge } from "@/components/admin/trips/trip-status-badge";
import type { CarrierOption } from "@/types/inventory";
import type { TripRow } from "@/types/operations";

type TripsTableProps = {
  trips: TripRow[];
  carriers: CarrierOption[];
  showPocColumn?: boolean;
  emptyMessage: string;
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TripsTable({
  trips,
  carriers,
  showPocColumn = false,
  emptyMessage,
}: TripsTableProps) {
  if (trips.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-900/80">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Origin</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Destination
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Target Temp
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Type of Goods
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Carrier
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Stack
            </th>
            {showPocColumn ? (
              <th className="px-4 py-3 text-left font-medium text-zinc-400">
                POC Certificate
              </th>
            ) : null}
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40">
          {trips.map((trip) => (
            <tr key={trip.id} className="align-top hover:bg-zinc-900/40">
              <td className="px-4 py-3">
                <TripStatusBadge status={trip.status} />
              </td>
              <td className="max-w-[200px] px-4 py-3 text-zinc-300">
                {trip.origin_label}
              </td>
              <td className="max-w-[200px] px-4 py-3 text-zinc-300">
                {trip.destination_label}
              </td>
              <td className="px-4 py-3 font-mono text-zinc-300">
                {trip.target_temp}°C
              </td>
              <td className="px-4 py-3 text-zinc-400">{trip.type_of_goods}</td>
              <td className="px-4 py-3 text-zinc-400">
                {trip.carrier_name ?? "Unassigned"}
              </td>
              <td className="px-4 py-3 font-mono text-zinc-400">
                {trip.stack_serial ?? "—"}
              </td>
              {showPocColumn ? (
                <td className="px-4 py-3">
                  {trip.poc ? (
                    <div className="space-y-1">
                      <a
                        href={trip.poc.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                      >
                        View PDF
                      </a>
                      <p className="text-[10px] text-zinc-500">
                        {trip.poc.verified_by_receiver
                          ? "Verified"
                          : "Awaiting verification"}
                        {" · "}
                        {formatDate(trip.poc.generated_at)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600">No POC yet</span>
                  )}
                </td>
              ) : null}
              <td className="px-4 py-3">
                <TripRowActions trip={trip} carriers={carriers} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
