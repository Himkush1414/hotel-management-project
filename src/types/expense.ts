import type { Database } from "./database";

export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseCategory = Database["public"]["Tables"]["expense_categories"]["Row"];

export interface ExpenseWithCategory extends Expense {
  category: ExpenseCategory;
}

export interface ProfitLossSummary {
  period: string;
  total_revenue: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  expense_breakdown: {
    category_name: string;
    amount: number;
    percentage: number;
  }[];
  revenue_breakdown: {
    source: string;
    amount: number;
    percentage: number;
  }[];
}

export type Category = {
  id: string;
  hotel_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}
