"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/formatDate";

interface Staff {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  date_of_joining: string | null;
}

export default function MyProfilePage() {
  const supabase = createClient();
  const toast = useToast();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("staff").select("*").eq("profile_id", user.id).single();
      if (data) {
        setStaff(data as Staff);
        setPhone(data.phone ?? "");
      }
    };
    load();
  }, [supabase]);

  const handleSave = async () => {
    if (!staff) return;
    setSaving(true);
    const { error } = await supabase.from("staff").update({ phone }).eq("id", staff.id);
    if (error) {
      toast.error(error.message);
    } else {
      setStaff((prev) => prev ? { ...prev, phone } : prev);
      toast.success("Phone number updated");
    }
    setSaving(false);
  };

  const initials = staff?.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  if (!staff) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 p-4">
      <PageHeader title="My Profile" subtitle="Your staff profile information" />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{staff.full_name}</h2>
              <Badge variant="secondary" className="capitalize mt-1">
                {staff.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {staff.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{staff.email}</span>
            </div>
          )}
          {staff.address && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{staff.address}</span>
            </div>
          )}
          {staff.date_of_joining && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Joined {formatDate(staff.date_of_joining)}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9999999999"
              />
              <Button size="sm" onClick={handleSave} disabled={saving || phone === staff.phone}>
                {saving ? "Saving..." : "Update"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You can only update your phone number.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
