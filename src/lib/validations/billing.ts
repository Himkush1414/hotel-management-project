import { z } from "zod";

export const extraChargeSchema = z.object({
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(200, "Description must be at most 200 characters"),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  category: z.enum(
    ["food", "laundry", "transport", "spa", "minibar", "damage", "other"],
    { message: "Category is required" }
  ),
});

export type ExtraChargeFormValues = z.infer<typeof extraChargeSchema>;

export const discountSchema = z
  .object({
    discount_type: z.enum(["percentage", "flat"], {
      message: "Discount type is required",
    }),
    discount_value: z
      .number({ message: "Discount value must be a number" })
      .positive("Discount value must be greater than 0"),
    reason: z
      .string()
      .min(2, "Reason must be at least 2 characters")
      .max(200, "Reason must be at most 200 characters"),
  })
  .refine(
    (data) => {
      if (data.discount_type === "percentage") {
        return data.discount_value <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discount_value"],
    }
  );

export type DiscountFormValues = z.infer<typeof discountSchema>;
