import { redirect } from "next/navigation";
import { getAuthenticatedUser, getProfileForUser } from "@/lib/auth/profile";
import type { Profile } from "@/types/auth";

export async function requireAdmin(): Promise<{
  user: { id: string; email?: string };
  profile: Profile;
}> {
  const { user, supabase } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileForUser(supabase, user.id);

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  return { user, profile };
}
