import { createClient } from "@/utils/supabase/server";
import type { Profile } from "@/types/auth";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase };
  }

  return { user, supabase };
}

export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  // const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}
