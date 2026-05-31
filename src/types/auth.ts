import type { User } from "@supabase/supabase-js";
import type { Database, StaffRole } from "./database";

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UserWithProfile {
  user: User;
  profile: UserProfile;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: StaffRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
