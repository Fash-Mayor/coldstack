"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { InventoryActionState } from "@/types/inventory";

type InventoryModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  onSubmit: () => Promise<InventoryActionState>;
  submitLabel?: string;
  children: ReactNode;
  disableSubmit?: boolean;
};

export function InventoryModal({
  title,
  description,
  onClose,
  onSubmit,
  submitLabel = "Confirm",
  children,
  disableSubmit = false,
}: InventoryModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPending, onClose]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await onSubmit();
      if (result.error) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-modal-title"
    >
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        disabled={isPending}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="inventory-modal-title"
              className="text-lg font-semibold text-zinc-50"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <p
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          ) : null}

          {children}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || disableSubmit}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
