"use client";

import { useCallback, useState } from "react";
import { Layers, Plus, Radio } from "lucide-react";
import {
  createLogger,
  createStack,
} from "@/app/actions/admin";
import { CreateItemModal } from "@/components/admin/inventory/create-item-modal";
import { LoggersTable } from "@/components/admin/inventory/loggers-table";
import { StacksTable } from "@/components/admin/inventory/stacks-table";
import type { InventoryData } from "@/types/inventory";

type InventoryTab = "stacks" | "loggers";

type InventoryPanelProps = {
  data: InventoryData;
};

export function InventoryPanel({ data }: InventoryPanelProps) {
  const [activeTab, setActiveTab] = useState<InventoryTab>("stacks");
  const [createStackOpen, setCreateStackOpen] = useState(false);
  const [createLoggerOpen, setCreateLoggerOpen] = useState(false);

  const closeStackModal = useCallback(() => setCreateStackOpen(false), []);
  const closeLoggerModal = useCallback(() => setCreateLoggerOpen(false), []);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
          Inventory management
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          Stacks &amp; Loggers
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          View hardware inventory, pair loggers to stacks, and assign carriers to
          active units.
        </p>
      </section>

      <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-1.5">
        <TabButton
          active={activeTab === "stacks"}
          onClick={() => setActiveTab("stacks")}
          icon={Layers}
          label={`Stacks (${data.stacks.length})`}
        />
        <TabButton
          active={activeTab === "loggers"}
          onClick={() => setActiveTab("loggers")}
          icon={Radio}
          label={`Loggers (${data.loggers.length})`}
        />
      </div>

      {activeTab === "stacks" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Stacks</h3>
              <p className="text-sm text-zinc-500">
                Physical cold-chain units tracked in the field.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateStackOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Create Stack
            </button>
          </div>
          <StacksTable
            stacks={data.stacks}
            availableLoggers={data.availableLoggers}
            carriers={data.carriers}
          />
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Loggers</h3>
              <p className="text-sm text-zinc-500">
                Temperature monitoring devices assigned to stacks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateLoggerOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Create Logger
            </button>
          </div>
          <LoggersTable loggers={data.loggers} />
        </section>
      )}

      {createStackOpen ? (
        <CreateItemModal
          title="Create Stack"
          label="Serial number"
          placeholder="e.g. STK-2026-001"
          onClose={closeStackModal}
          onSubmit={createStack}
        />
      ) : null}

      {createLoggerOpen ? (
        <CreateItemModal
          title="Create Logger"
          label="Serial number"
          placeholder="e.g. LOG-2026-001"
          onClose={closeLoggerModal}
          onSubmit={createLogger}
        />
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Layers;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/25"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}
