"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Expense {
  amount: number;
  category_id: string | null;
  expense_categories?: Category | null;
}

interface Props {
  expenses: Expense[];
  totalRevenue: number;
  categories: Category[];
}

const FALLBACK_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
];

export function ExpenseSummary({ expenses, totalRevenue, categories }: Props) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const isProfit = profit >= 0;

  const byCategory = categories.map((cat, idx) => {
    const total = expenses
      .filter((e) => e.category_id === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      name: cat.name,
      value: total,
      color: cat.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
    };
  }).filter((c) => c.value > 0);

  const uncategorized = expenses
    .filter((e) => !e.category_id)
    .reduce((sum, e) => sum + e.amount, 0);
  if (uncategorized > 0) {
    byCategory.push({ name: "Other", value: uncategorized, color: "#9ca3af" });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-50">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-50">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className={`p-3 rounded-full ${isProfit ? "bg-emerald-50" : "bg-red-50"}`}>
            <DollarSign className={`h-6 w-6 ${isProfit ? "text-emerald-600" : "text-red-600"}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isProfit ? "Net Profit" : "Net Loss"}</p>
            <p className={`text-2xl font-bold ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(Math.abs(profit))}
            </p>
          </div>
        </CardContent>
      </Card>

      {byCategory.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {byCategory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
