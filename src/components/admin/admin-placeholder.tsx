type AdminPlaceholderProps = {
  page: string;
};

export function AdminPlaceholder({ page }: AdminPlaceholderProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-8 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
        Operations module
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
        Admin {page} Coming Soon
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
        This workspace is wired into the admin shell. Inventory, delivery, and
        operational controls will be added in the next build steps.
      </p>
    </section>
  );
}
