"use client";

import { Menu } from "lucide-react";
import type { Profile } from "@/types/auth";

type AdminHeaderProps = {
  title: string;
  profile: Pick<Profile, "full_name" | "email">;
  onMenuOpen: () => void;
};

function getInitials(fullName: string | null, email: string | null): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0]?.slice(0, 2).toUpperCase() ?? "AD";
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "AD";
}

export function AdminHeader({ title, profile, onMenuOpen }: AdminHeaderProps) {
  const displayName = profile.full_name?.trim() || "Administrator";
  const displayEmail = profile.email ?? "No email on file";
  const initials = getInitials(profile.full_name, profile.email);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-800 bg-[#0b0f14]/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-md border border-zinc-800 bg-zinc-950 p-2 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
            Admin console
          </p>
          <h1 className="truncate text-lg font-semibold text-zinc-50 sm:text-xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2">
        <div className="hidden text-right sm:block">
          <p className="max-w-[180px] truncate text-sm font-medium text-zinc-100">
            {displayName}
          </p>
          <p className="max-w-[180px] truncate text-xs text-zinc-500">
            {displayEmail}
          </p>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-300"
          aria-hidden
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
