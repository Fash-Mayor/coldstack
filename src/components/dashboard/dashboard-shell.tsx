import { Snowflake } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import type { UserRole } from "@/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  carrier: "Carrier",
  shipper: "Shipper",
  consignee: "Consignee",
};

type DashboardShellProps = {
  role: UserRole;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function DashboardShell({
  role,
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Snowflake className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">ColdStack</p>
              <p className="text-xs text-zinc-500">{ROLE_LABELS[role]} portal</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-400/80">
            {ROLE_LABELS[role]}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </main>
    </div>
  );
}
