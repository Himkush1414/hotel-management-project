"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function DangerZone() {
  return (
    <Card className="border-destructive/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Destructive actions will be available here in a future update. These actions are permanent and cannot be undone. Please contact support if you need to reset or delete hotel data.
        </p>
        <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">Reset Hotel Data</p>
          <p className="text-xs text-muted-foreground mt-1">
            This feature is not yet available. It will allow clearing all bookings, staff records, and billing data.
          </p>
        </div>
        <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">Delete Hotel Account</p>
          <p className="text-xs text-muted-foreground mt-1">
            This feature is not yet available. Permanently removes all hotel data and cancels your subscription.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
