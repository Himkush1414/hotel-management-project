"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

interface FeatureFlag {
  id: string;
  hotel_id: string;
  flag_name: string;
  is_enabled: boolean;
  description: string | null;
}

const FLAG_LABELS: Record<string, { label: string; description: string }> = {
  razorpay_payments: {
    label: "Razorpay Payments",
    description: "Enable online payment collection via Razorpay",
  },
  expense_tracking: {
    label: "Expense Tracking",
    description: "Allow tracking and categorizing hotel expenses",
  },
  staff_portal: {
    label: "Staff Portal",
    description: "Enable staff self-service portal for attendance and tasks",
  },
  analytics: {
    label: "Analytics Dashboard",
    description: "Show advanced analytics and reporting",
  },
  notifications: {
    label: "Notifications",
    description: "Enable real-time notifications for hotel events",
  },
  document_upload: {
    label: "Document Upload",
    description: "Allow uploading staff documents to cloud storage",
  },
};

interface Props {
  initialFlags: FeatureFlag[];
}

export function FeatureFlagsPanel({ initialFlags }: Props) {
  const supabase = createClient();
  const toast = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
  const [saving, setSaving] = useState<string | null>(null);

  const handleToggle = async (flag: FeatureFlag) => {
    setSaving(flag.id);
    const newValue = !flag.is_enabled;

    const { error } = await supabase
      .from("feature_flags")
      .update({ is_enabled: newValue })
      .eq("id", flag.id);

    if (error) {
      toast.error(error.message);
    } else {
      setFlags((prev) =>
        prev.map((f) => (f.id === flag.id ? { ...f, is_enabled: newValue } : f))
      );
      const meta = FLAG_LABELS[flag.flag_name];
      toast.success(`${meta?.label ?? flag.flag_name} ${newValue ? "enabled" : "disabled"}`);
    }
    setSaving(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No feature flags configured.</p>
        ) : (
          flags.map((flag) => {
            const meta = FLAG_LABELS[flag.flag_name];
            return (
              <div
                key={flag.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <Label className="text-sm font-medium">
                    {meta?.label ?? flag.flag_name}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {meta?.description ?? flag.description ?? "No description"}
                  </p>
                </div>
                <Switch
                  checked={flag.is_enabled}
                  onCheckedChange={() => handleToggle(flag)}
                  disabled={saving === flag.id}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
