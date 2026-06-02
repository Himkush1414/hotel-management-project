import { z } from "zod";

export const settingsSchema = z.object({
  name: z
    .string()
    .min(2, "Hotel name must be at least 2 characters")
    .max(150, "Hotel name must be at most 150 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(400, "Address must be at most 400 characters"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be at most 20 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  website: z
    .string()
    .url("Enter a valid website URL")
    .optional()
    .or(z.literal("")),
  tax_percentage: z
    .number({ message: "Tax percentage must be a number" })
    .min(0, "Tax percentage cannot be negative")
    .max(100, "Tax percentage cannot exceed 100"),
  currency: z
    .string()
    .min(1, "Currency is required")
    .max(10, "Currency code must be at most 10 characters"),
  logo_url: z
    .string()
    .url("Enter a valid URL for the logo")
    .optional()
    .or(z.literal("")),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export type SettingsFormData = z.infer<typeof settingsSchema>;
