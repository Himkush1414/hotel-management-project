"use client";

import Link from "next/link";
import { LogIn, UserPlus, Receipt, BarChart3 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  variant: "default" | "outline" | "secondary";
}

const actions: QuickAction[] = [
  {
    label: "New Check-in",
    href: "/bookings/new",
    icon: LogIn,
    variant: "default",
  },
  {
    label: "Add Guest",
    href: "/guests/new",
    icon: UserPlus,
    variant: "outline",
  },
  {
    label: "Add Expense",
    href: "/expenses/new",
    icon: Receipt,
    variant: "outline",
  },
  {
    label: "View Reports",
    href: "/reports",
    icon: BarChart3,
    variant: "secondary",
  },
];

export function QuickActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={buttonVariants({ variant: action.variant, size: "sm" }) + " h-auto flex-col gap-1.5 py-3"}
            >
              <action.icon className="h-4 w-4" />
              <span className="text-xs">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
