import { z } from "zod";

export const bookingSchema = z
  .object({
    guest_id: z.string().uuid("Invalid guest selected"),
    room_id: z.string().uuid("Invalid room selected"),
    check_in_date: z.string().min(1, "Check-in date is required"),
    check_out_date: z.string().min(1, "Check-out date is required"),
    room_rate: z
      .number({ invalid_type_error: "Room rate must be a number" })
      .positive("Room rate must be greater than 0"),
    adults: z
      .number({ invalid_type_error: "Number of adults must be a number" })
      .int("Adults must be a whole number")
      .min(1, "At least 1 adult is required")
      .max(10, "Maximum 10 adults allowed"),
    children: z
      .number({ invalid_type_error: "Number of children must be a number" })
      .int("Children must be a whole number")
      .min(0, "Children cannot be negative")
      .max(10, "Maximum 10 children allowed"),
    special_requests: z
      .string()
      .max(500, "Special requests must be at most 500 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.check_in_date);
      const checkOut = new Date(data.check_out_date);
      return checkOut > checkIn;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["check_out_date"],
    }
  );

export type BookingFormValues = z.infer<typeof bookingSchema>;
