import { updateLoggerStatus } from "@/app/actions/admin";
import {
  LOGGER_STATUS_OPTIONS,
  LoggerStatusBadge,
} from "@/components/admin/inventory/status-badge";
import { StatusUpdateSelect } from "@/components/admin/inventory/status-update-select";
import type { LoggerRow } from "@/types/inventory";

type LoggersTableProps = {
  loggers: LoggerRow[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPairedStack(logger: LoggerRow): string {
  if (logger.paired_stack_serial) {
    return logger.paired_stack_serial;
  }
  if (logger.paired_stack_id) {
    return logger.paired_stack_id.slice(0, 8);
  }
  return "Unpaired";
}

export function LoggersTable({ loggers }: LoggersTableProps) {
  if (loggers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
        No loggers in inventory yet. Create your first logger to get started.
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
              Paired Stack ID
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Created At
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40">
          {loggers.map((logger) => (
            <tr key={logger.id} className="hover:bg-zinc-900/40">
              <td className="px-4 py-3 font-mono text-zinc-100">{logger.serial}</td>
              <td className="px-4 py-3">
                <LoggerStatusBadge status={logger.status} />
              </td>
              <td className="px-4 py-3 font-mono text-zinc-400">
                {formatPairedStack(logger)}
              </td>
              <td className="px-4 py-3 text-zinc-400">
                {formatDate(logger.created_at)}
              </td>
              <td className="px-4 py-3">
                <StatusUpdateSelect
                  itemId={logger.id}
                  currentStatus={logger.status}
                  options={LOGGER_STATUS_OPTIONS}
                  onUpdate={updateLoggerStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
