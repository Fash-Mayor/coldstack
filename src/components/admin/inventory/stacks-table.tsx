import { StackRowActions } from "@/components/admin/inventory/stack-row-actions";
import { StackStatusBadge } from "@/components/admin/inventory/status-badge";
import type {
  AvailableLoggerOption,
  CarrierOption,
  StackRow,
} from "@/types/inventory";

type StacksTableProps = {
  stacks: StackRow[];
  availableLoggers: AvailableLoggerOption[];
  carriers: CarrierOption[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StacksTable({
  stacks,
  availableLoggers,
  carriers,
}: StacksTableProps) {
  if (stacks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
        No stacks in inventory yet. Create your first stack to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-900/80">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Serial Number
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Carrier
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Paired Logger
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Created At
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Operations
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40">
          {stacks.map((stack) => (
            <tr key={stack.id} className="align-top hover:bg-zinc-900/40">
              <td className="px-4 py-3 font-mono text-zinc-100">{stack.serial}</td>
              <td className="px-4 py-3">
                <StackStatusBadge status={stack.status} />
              </td>
              <td className="px-4 py-3 text-zinc-400">
                {stack.carrier_label ?? "Unassigned"}
              </td>
              <td className="px-4 py-3 font-mono text-zinc-400">
                {stack.paired_logger_serial ?? "Unpaired"}
              </td>
              <td className="px-4 py-3 text-zinc-400">
                {formatDate(stack.created_at)}
              </td>
              <td className="px-4 py-3">
                <StackRowActions
                  stack={stack}
                  availableLoggers={availableLoggers}
                  carriers={carriers}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
