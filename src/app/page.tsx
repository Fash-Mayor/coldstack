import Link from "next/link";
import { ArrowRight, ShieldCheck, Snowflake, Thermometer } from "lucide-react";
import { getAuthenticatedUser, getProfileForUser } from "@/lib/auth/profile";
import { ROLE_HOME_PATHS } from "@/lib/auth/constants";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function HomePage() {
  const { user, supabase } = await getAuthenticatedUser();

  let dashboardHref: string | null = null;

  if (user) {
    const profile = await getProfileForUser(supabase, user.id);
    if (profile?.onboarding_completed) {
      dashboardHref = ROLE_HOME_PATHS[profile.role];
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.08),transparent_35%)]"
      />

      <header className="relative border-b border-zinc-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Snowflake className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-semibold tracking-wide text-zinc-100">
              ColdStack
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user && dashboardHref ? (
              <>
                <Link
                  href={dashboardHref}
                  className="hidden rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-900 sm:inline-flex"
                >
                  Dashboard
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
              >
                Sign in
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-16">
        <section className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-400/90">
            Cold-chain logistics
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-6xl">
            This is ColdStack
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            Industrial-grade visibility for temperature-sensitive freight. Monitor
            trips, verify proof of condition, and coordinate carriers, shippers,
            and consignees on one secure platform.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {dashboardHref ? (
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
              >
                Go to dashboard
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
              >
                Sign up / Sign in
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            )}
          </div>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={Thermometer}
            title="Live telemetry"
            description="High-frequency temperature and location data tied to every active trip."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Secure by design"
            description="Server-validated sessions, role-based routing, and database-enforced access control."
          />
          <FeatureCard
            icon={Snowflake}
            title="Proof of condition"
            description="Generate and verify POC certificates for compliant cold-chain handoffs."
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Thermometer;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900">
        <Icon className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
      </div>
      <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
    </article>
  );
}
