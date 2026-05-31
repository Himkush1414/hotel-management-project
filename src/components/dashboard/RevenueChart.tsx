"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface DataPoint {
  date: string;
  revenue: number;
  expenses: number;
}

interface Props {
  data: DataPoint[];
}

type GroupBy = "daily" | "weekly" | "monthly";

function groupData(data: DataPoint[], groupBy: GroupBy): DataPoint[] {
  if (groupBy === "daily") return data;

  const groups: Record<string, DataPoint> = {};
  data.forEach((point) => {
    let key: string;
    if (groupBy === "weekly") {
      const idx = data.indexOf(point);
      key = `Week ${Math.floor(idx / 7) + 1}`;
    } else {
      key = point.date.split(" ")[1] ?? point.date;
    }
    if (!groups[key]) {
      groups[key] = { date: key, revenue: 0, expenses: 0 };
    }
    groups[key].revenue += point.revenue;
    groups[key].expenses += point.expenses;
  });
  return Object.values(groups);
}

export function RevenueChart({ data }: Props) {
  const [groupBy, setGroupBy] = useState<GroupBy>("daily");
  const grouped = groupData(data, groupBy);

  const maxVal = Math.max(
    ...grouped.map((d) => Math.max(d.revenue, d.expenses))
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(["daily", "weekly", "monthly"] as GroupBy[]).map((g) => (
          <Button
            key={g}
            size="sm"
            variant={groupBy === g ? "default" : "ghost"}
            onClick={() => setGroupBy(g)}
            className="h-7 text-xs capitalize"
          >
            {g}
          </Button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={grouped} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            width={50}
            domain={[0, maxVal * 1.1]}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
