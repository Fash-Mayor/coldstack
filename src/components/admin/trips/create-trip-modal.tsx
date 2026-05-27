"use client";

import { useState } from "react";
import { createTrip } from "@/app/actions/admin-operations";
import { InventoryModal } from "@/components/admin/inventory/inventory-modal";
import type {
  ConsigneeOption,
  CreateTripInput,
  ShipperOption,
} from "@/types/operations";

type CreateTripModalProps = {
  shippers: ShipperOption[];
  consignees: ConsigneeOption[];
  onClose: () => void;
};

const selectClassName =
  "mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20";

const inputClassName =
  "mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20";

export function CreateTripModal({
  shippers,
  consignees,
  onClose,
}: CreateTripModalProps) {
  const [shipperId, setShipperId] = useState("");
  const [consigneeId, setConsigneeId] = useState("");
  const [targetTemp, setTargetTemp] = useState("");
  const [tolerance, setTolerance] = useState("");
  const [typeOfGoods, setTypeOfGoods] = useState("");

  const canSubmit =
    shipperId &&
    consigneeId &&
    typeOfGoods.trim() &&
    targetTemp !== "" &&
    tolerance !== "" &&
    !Number.isNaN(Number.parseFloat(targetTemp)) &&
    !Number.isNaN(Number.parseFloat(tolerance));

  return (
    <InventoryModal
      title="Create new trip"
      description="Origin and destination coordinates are snapshotted from the selected shipper and consignee records."
      onClose={onClose}
      submitLabel="Create trip"
      disableSubmit={!canSubmit}
      onSubmit={async () => {
        const payload: CreateTripInput = {
          shipperId,
          consigneeId,
          targetTemp: Number.parseFloat(targetTemp),
          tolerance: Number.parseFloat(tolerance),
          typeOfGoods: typeOfGoods.trim(),
        };
        return createTrip(payload);
      }}
    >
      <div className="space-y-4">
        {shippers.length === 0 ? (
          <p className="rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-400">
            No shippers found. Add shipper records in the database first.
          </p>
        ) : (
          <label className="block text-sm">
            <span className="font-medium text-zinc-300">Origin (Shipper)</span>
            <select
              value={shipperId}
              onChange={(event) => setShipperId(event.target.value)}
              required
              className={selectClassName}
            >
              <option value="">Select origin</option>
              {shippers.map((shipper) => (
                <option key={shipper.id} value={shipper.id}>
                  {shipper.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {consignees.length === 0 ? (
          <p className="rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-400">
            No consignees found. Add consignee records in the database first.
          </p>
        ) : (
          <label className="block text-sm">
            <span className="font-medium text-zinc-300">
              Destination (Consignee)
            </span>
            <select
              value={consigneeId}
              onChange={(event) => setConsigneeId(event.target.value)}
              required
              className={selectClassName}
            >
              <option value="">Select destination</option>
              {consignees.map((consignee) => (
                <option key={consignee.id} value={consignee.id}>
                  {consignee.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-sm">
          <span className="font-medium text-zinc-300">
            Target temperature (°C)
          </span>
          <input
            type="number"
            step="0.1"
            value={targetTemp}
            onChange={(event) => setTargetTemp(event.target.value)}
            required
            placeholder="e.g. 2.5"
            className={inputClassName}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-zinc-300">Tolerance (°C)</span>
          <input
            type="number"
            step="0.1"
            value={tolerance}
            onChange={(event) => setTolerance(event.target.value)}
            required
            placeholder="e.g. 1.0"
            className={inputClassName}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-zinc-300">Type of goods</span>
          <input
            type="text"
            value={typeOfGoods}
            onChange={(event) => setTypeOfGoods(event.target.value)}
            required
            placeholder="e.g. Vaccines, seafood, produce"
            className={inputClassName}
          />
        </label>
      </div>
    </InventoryModal>
  );
}
