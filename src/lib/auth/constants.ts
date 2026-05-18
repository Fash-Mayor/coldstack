import type { PublicSignupRole, UserRole } from "@/types/auth";

export const PUBLIC_SIGNUP_ROLES: PublicSignupRole[] = [
  "carrier",
  "shipper",
  "consignee",
];

export const ROLE_HOME_PATHS: Record<UserRole, string> = {
  admin: "/admin",
  carrier: "/carrier",
  shipper: "/shipper",
  consignee: "/consignee",
};

export const ROLE_ROUTE_PREFIXES: Record<UserRole, string> = {
  admin: "/admin",
  carrier: "/carrier",
  shipper: "/shipper",
  consignee: "/consignee",
};

export const PUBLIC_ROUTES = ["/", "/login"] as const;

export const ONBOARDING_ROUTE = "/onboarding";

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isRoleProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/carrier") ||
    pathname.startsWith("/shipper") ||
    pathname.startsWith("/consignee")
  );
}

export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/carrier")) return "carrier";
  if (pathname.startsWith("/shipper")) return "shipper";
  if (pathname.startsWith("/consignee")) return "consignee";
  return null;
}

export function isAllowedPublicSignupRole(
  role: string
): role is PublicSignupRole {
  return PUBLIC_SIGNUP_ROLES.includes(role as PublicSignupRole);
}
