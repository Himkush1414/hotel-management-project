"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  change: number;
  format?: "currency" | "number";
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  format = "number",
  subtitle,
}: StatsCardProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;
  const Icon = (LucideIcons as any)[icon] as React.ElementType;

  const formattedValue =
    format === "currency" ? formatCurrency(value) : value.toString();

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight">{formattedValue}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1">
          {isPositive && (
            <>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600">
                +{change}%
              </span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                {change}%
              </span>
            </>
          )}
          {isNeutral && (
            <>
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">No change</span>
            </>
          )}
          <span
            className={cn(
              "text-sm text-muted-foreground",
              (isPositive || isNegative) && "ml-1"
            )}
          >
            {!isNeutral && "vs yesterday"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
