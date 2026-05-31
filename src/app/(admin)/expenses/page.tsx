import { createClient } from "@/lib/supabase/server";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, expense_categories(id, name, color)")
    .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
    .gte("expense_date", startOfMonth)
    .order("expense_date", { ascending: false });

  const { data: categories } = await supabase
    .from("expense_categories")
    .select("*")
    .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!);

  const { data: revenueData } = await supabase
    .from("invoices")
    .select("total_amount")
    .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
    .gte("created_at", startOfMonth)
    .eq("status", "paid");

  const totalRevenue = (revenueData ?? []).reduce(
    (sum, inv) => sum + (inv.total_amount ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Tracking"
        subtitle="Monitor and manage hotel expenses"
      />
      <ExpenseSummary
        expenses={expenses ?? []}
        totalRevenue={totalRevenue}
        categories={categories ?? []}
      />
      <ExpenseTable
        initialExpenses={expenses ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}
