import { z } from "zod";

const indianPhoneRegex = /^[6-9]\d{9}$/;

export const staffSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  phone: z
    .string()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian phone number"),
  role: z.enum(
    ["admin", "manager", "receptionist", "housekeeping", "maintenance", "accountant"],
    { required_error: "Role is required" }
  ),
  date_of_joining: z
    .string()
    .min(1, "Date of joining is required"),
  basic_salary: z
    .number({ invalid_type_error: "Salary must be a number" })
    .positive("Salary must be greater than 0"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address must be at most 300 characters"),
  emergency_contact_name: z
    .string()
    .min(2, "Emergency contact name must be at least 2 characters")
    .max(100, "Emergency contact name must be at most 100 characters"),
  emergency_contact_phone: z
    .string()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian phone number for emergency contact"),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
