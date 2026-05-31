import { z } from "zod";

export const roomSchema = z.object({
  room_number: z
    .string()
    .min(1, "Room number is required")
    .max(10, "Room number must be at most 10 characters"),
  floor: z
    .number({ invalid_type_error: "Floor must be a number" })
    .int("Floor must be a whole number")
    .min(0, "Floor cannot be negative")
    .max(100, "Floor must be at most 100"),
  room_type_id: z.string().uuid("Invalid room type selected"),
  status: z.enum(
    ["available", "occupied", "cleaning", "maintenance", "blocked"],
    { required_error: "Status is required" }
  ),
  notes: z
    .string()
    .max(500, "Notes must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
