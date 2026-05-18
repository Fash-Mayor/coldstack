"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminPageTitle } from "@/lib/admin/navigation";
import type { Profile } from "@/types/auth";

type AdminShellProps = {
  profile: Pick<Profile, "full_name" | "email">;
  children: React.ReactNode;
};

export function AdminShell({ profile, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pageTitle = getAdminPageTitle(pathname);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-[#0b0f14] text-zinc-100">
      <AdminSidebar
        pathname={pathname}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="lg:pl-64">
        <AdminHeader
          title={pageTitle}
          profile={profile}
          onMenuOpen={() => setMobileNavOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
