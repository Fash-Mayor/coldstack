"use client";

import Link from "next/link";
import { LogOut, Snowflake, X } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import {
  ADMIN_NAV_ITEMS,
  isAdminNavActive,
} from "@/lib/admin/navigation";

type AdminSidebarProps = {
  pathname: string;
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ pathname, open, onClose }: AdminSidebarProps) {
  return (
    <>
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Snowflake className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">ColdStack</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                Operations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Navigation
          </p>
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isAdminNavActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/25"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
