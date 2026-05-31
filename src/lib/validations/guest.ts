import { z } from "zod";

const indianPhoneRegex = /^[6-9]\d{9}$/;

export const guestSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  phone: z
    .string()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian phone number"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  id_proof_type: z.enum(
    ["aadhaar", "passport", "driving_license", "voter_id", "pan_card"],
    { required_error: "ID proof type is required" }
  ),
  id_proof_number: z
    .string()
    .min(4, "ID proof number must be at least 4 characters")
    .max(30, "ID proof number must be at most 30 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address must be at most 300 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must be at most 100 characters"),
});

export type GuestFormValues = z.infer<typeof guestSchema>;
