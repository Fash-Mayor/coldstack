import { NextResponse, type NextRequest } from "next/server";
import {
  getRoleFromPath,
  isPublicRoute,
  isRoleProtectedPath,
  ONBOARDING_ROUTE,
  ROLE_HOME_PATHS,
} from "@/lib/auth/constants";
import type { Profile, UserRole } from "@/types/auth";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);
  const pathname = request.nextUrl.pathname;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isPublicRoute(pathname)) {
      return supabaseResponse;
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single<Pick<Profile, "role" | "onboarding_completed">>();

  if (profileError || !profile) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  const role = profile.role as UserRole;
  const homePath = ROLE_HOME_PATHS[role];

  if (!profile.onboarding_completed) {
    if (pathname === ONBOARDING_ROUTE) {
      return supabaseResponse;
    }

    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = ONBOARDING_ROUTE;
    return NextResponse.redirect(onboardingUrl);
  }

  if (pathname === "/login" || pathname === ONBOARDING_ROUTE) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = homePath;
    return NextResponse.redirect(homeUrl);
  }

  if (pathname === "/") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = homePath;
    return NextResponse.redirect(homeUrl);
  }

  if (isRoleProtectedPath(pathname)) {
    const pathRole = getRoleFromPath(pathname);

    if (pathRole && pathRole !== role) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = homePath;
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
