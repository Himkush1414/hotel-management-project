import { z } from "zod";

export const roomSchema = z.object({
  room_number: z
    .string()
    .min(1, "Room number is required")
    .max(10, "Room number must be at most 10 characters"),
  floor: z
    .number({ message: "Floor must be a number" })
    .int("Floor must be a whole number")
    .min(0, "Floor cannot be negative")
    .max(100, "Floor must be at most 100"),
  room_type_id: z.string().uuid("Invalid room type selected"),
  status: z.enum(
    ["available", "occupied", "cleaning", "maintenance", "blocked"],
    { message: "Status is required" }
  ),
  notes: z
    .string()
    .max(500, "Notes must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
export type RoomFormData = z.infer<typeof roomSchema>;

export const roomTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional().or(z.literal("")),
  base_price: z.number({ message: "Base price must be a number" }).min(0),
  max_occupancy: z.number().int().min(1).max(100),
  amenities: z.array(z.string()).optional(),
});

export type RoomTypeFormData = z.infer<typeof roomTypeSchema>;
