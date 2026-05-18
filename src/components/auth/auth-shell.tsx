import { Snowflake } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_45%),linear-gradient(to_bottom,rgba(15,23,42,0.6),#0b0f14)]"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
            <Snowflake className="h-5 w-5 text-cyan-400" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/80">
              ColdStack
            </p>
            <p className="text-sm text-zinc-500">Cold-chain logistics platform</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
