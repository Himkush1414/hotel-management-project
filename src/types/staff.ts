import type { Database, StaffRole } from "./database";

export type Staff = Database["public"]["Tables"]["staff"]["Row"];
export type StaffDocument = Database["public"]["Tables"]["staff_documents"]["Row"];

export interface StaffWithProfile extends Staff {
  profile: {
    id: string;
    avatar_url: string | null;
    is_active: boolean;
  } | null;
  documents: StaffDocument[];
}

export interface SalaryStructure {
  staff_id: string;
  full_name: string;
  role: StaffRole;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  month: string;
  year: number;
}
