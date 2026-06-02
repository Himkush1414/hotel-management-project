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
  salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  month: string;
  year: number;
}

export type AttendanceRecord = {
  id: string;
  hotel_id: string;
  staff_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
  staff?: { full_name: string; role: string } | null;
}
