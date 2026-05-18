"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isAllowedPublicSignupRole,
  ONBOARDING_ROUTE,
  ROLE_HOME_PATHS,
} from "@/lib/auth/constants";
import { getProfileForUser } from "@/lib/auth/profile";
import type { AuthActionState, PublicSignupRole } from "@/types/auth";
import { createClient } from "@/utils/supabase/server";

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectAfterAuth(profile: {
  onboarding_completed: boolean;
  role: keyof typeof ROLE_HOME_PATHS;
}): never {
  if (!profile.onboarding_completed) {
    redirect(ONBOARDING_ROUTE);
  }

  redirect(ROLE_HOME_PATHS[profile.role]);
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getStringField(formData, "email");
  const password = getStringField(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication failed. Please try again." };
  }

  const profile = await getProfileForUser(supabase, user.id);

  if (!profile) {
    return { error: "Profile not found. Contact support." };
  }

  revalidatePath("/", "layout");
  redirectAfterAuth(profile);
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getStringField(formData, "email");
  const password = getStringField(formData, "password");
  const confirmPassword = getStringField(formData, "confirmPassword");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return {
      success:
        "Check your email to confirm your account, then sign in.",
    };
  }

  const profile = await getProfileForUser(supabase, data.user.id);

  if (!profile) {
    return {
      success:
        "Account created. Check your email for confirmation, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirectAfterAuth(profile);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function completeOnboarding(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const fullName = getStringField(formData, "full_name");
  const phone = getStringField(formData, "phone");
  const submittedRole = getStringField(formData, "role");

  if (!fullName) {
    return { error: "Full name is required." };
  }

  if (!phone) {
    return { error: "Phone number is required." };
  }

  if (!isAllowedPublicSignupRole(submittedRole)) {
    return { error: "Invalid role selected." };
  }

  const role: PublicSignupRole = submittedRole;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to complete onboarding." };
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      role,
      onboarding_completed: true,
    })
    .eq("id", user.id)
    .select("role, onboarding_completed")
    .single();

  if (updateError || !updatedProfile) {
    return { error: updateError?.message ?? "Failed to update profile." };
  }

  if (updatedProfile.role === "admin") {
    await supabase
      .from("profiles")
      .update({ role: "shipper", onboarding_completed: false })
      .eq("id", user.id);

    return { error: "Invalid role. Admin accounts cannot be created via signup." };
  }

  revalidatePath("/", "layout");
  redirect(ROLE_HOME_PATHS[updatedProfile.role as keyof typeof ROLE_HOME_PATHS]);
}
