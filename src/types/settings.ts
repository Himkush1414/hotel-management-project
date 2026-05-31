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
