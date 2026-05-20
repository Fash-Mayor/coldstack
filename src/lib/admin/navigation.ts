import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LayoutDashboard,
  Layers,
  Truck,
  Users,
  MapPin,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/stacks-loggers", label: "Stacks & Loggers", icon: Layers },
  { href: "/admin/trips", label: "Trips", icon: Truck },
  { href: "/admin/map", label: "Map View", icon: MapPin },
  { href: "/admin/carriers", label: "Carriers", icon: Users },
  { href: "/admin/metrics", label: "Metrics", icon: BarChart3 },
];

export function getAdminPageTitle(pathname: string): string {
  const exact = ADMIN_NAV_ITEMS.find((item) => item.href === pathname);
  if (exact) return exact.label;

  const nested = ADMIN_NAV_ITEMS.find(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href)
  );
  if (nested) return nested.label;

  return "Dashboard";
}

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
