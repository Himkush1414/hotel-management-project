import { z } from "zod";

export const expenseSchema = z.object({
  category_id: z.string().uuid("Invalid category selected"),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(300, "Description must be at most 300 characters"),
  expense_date: z.string().min(1, "Expense date is required"),
  payment_mode: z.enum(["cash", "upi", "bank_transfer", "card", "cheque"], {
    message: "Payment mode is required",
  }),
  receipt_url: z
    .string()
    .url("Enter a valid URL for the receipt")
    .optional()
    .or(z.literal("")),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export type ExpenseFormData = z.infer<typeof expenseSchema>;
