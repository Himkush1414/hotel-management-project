"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffForm } from "./StaffForm";
import { usePermissions } from "@/hooks/usePermissions";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Mail, Phone, MapPin, Calendar, Pencil } from "lucide-react";
import type { Staff } from "@/types/staff";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  manager: "bg-blue-100 text-blue-800",
  receptionist: "bg-green-100 text-green-800",
  housekeeping: "bg-yellow-100 text-yellow-800",
  maintenance: "bg-orange-100 text-orange-800",
  accountant: "bg-pink-100 text-pink-800",
};

interface Props {
  staff: Staff;
}

export function StaffCard({ staff }: Props) {
  const permissions = usePermissions();
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(staff);

  const initials = current.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-semibold">{current.full_name}</h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    ROLE_COLORS[current.role] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {current.role}
                </span>
                <Badge variant={current.is_active ? "default" : "secondary"}>
                  {current.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {current.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>{current.email}</span>
                  </div>
                )}
                {current.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{current.phone}</span>
                  </div>
                )}
                {current.date_of_joining && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Joined {formatDate(current.date_of_joining)}</span>
                  </div>
                )}
                {current.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{current.address}</span>
                  </div>
                )}
              </div>

              {permissions.can("EDIT_STAFF") && current.salary !== null && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Basic Salary:{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(current.salary ?? 0)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {permissions.can("EDIT_STAFF") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="shrink-0"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <StaffForm
        open={editing}
        onClose={() => setEditing(false)}
        staff={current}
        onSaved={(saved) => {
          setCurrent(saved);
          setEditing(false);
        }}
      />
    </>
  );
}
