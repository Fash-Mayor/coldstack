export type UserRole = "admin" | "carrier" | "shipper" | "consignee";

export type PublicSignupRole = "carrier" | "shipper" | "consignee";

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  email: string | null;
  phone: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

export type AuthActionState = {
  error?: string;
  success?: string;
};
