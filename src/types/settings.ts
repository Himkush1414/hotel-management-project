export type Hotel = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  logo_url: string | null;
  currency: string;
  timezone: string;
  check_in_time: string;
  check_out_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

import type { Database } from "./database";

export interface HotelSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  tax_percentage: number;
  currency: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type FeatureFlag = Database["public"]["Tables"]["feature_flags"]["Row"];
