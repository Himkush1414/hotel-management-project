"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseFilters } from "./ExpenseFilters";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Expense {
  id: string;
  hotel_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  expense_date: string;
  payment_mode: string;
  receipt_url: string | null;
  created_at: string;
  expense_categories?: Category | null;
}

interface Props {
  initialExpenses: Expense[];
  categories: Category[];
}

export function ExpenseTable({ initialExpenses, categories }: Props) {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [showForm, setShowForm] = useState(false);

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || e.category_id === categoryFilter;
    const matchesPayment = paymentFilter === "all" || e.payment_mode === paymentFilter;
    const matchesFrom = !dateRange.from || e.expense_date >= dateRange.from;
    const matchesTo = !dateRange.to || e.expense_date <= dateRange.to;
    return matchesSearch && matchesCategory && matchesPayment && matchesFrom && matchesTo;
  });

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <ExpenseFilters
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          paymentFilter={paymentFilter}
          onPaymentChange={setPaymentFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm">{formatDate(expense.expense_date)}</TableCell>
                  <TableCell>
                    {expense.expense_categories ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${expense.expense_categories.color ?? "#6b7280"}20`,
                          color: expense.expense_categories.color ?? "#6b7280",
                        }}
                      >
                        {expense.expense_categories.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {expense.payment_mode.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(expense.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            {filtered.length > 0 && (
              <TableRow className="bg-muted/30 font-medium">
                <TableCell colSpan={4} className="text-right">
                  Total
                </TableCell>
                <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ExpenseForm
        open={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
        onSaved={(saved) => {
          setExpenses((prev) => [saved, ...prev]);
          setShowForm(false);
        }}
      />
    </div>
  );
}
