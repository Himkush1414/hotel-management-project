"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface AttendanceRecord {
  status: string;
}

interface Props {
  attendance: AttendanceRecord[];
  totalStaff: number;
}

export function AttendanceStats({ attendance, totalStaff }: Props) {
  const present = attendance.filter((a) => a.status === "present").length;
  const absent = attendance.filter((a) => a.status === "absent").length;
  const late = attendance.filter((a) => a.status === "late").length;

  const stats = [
    {
      label: "Total Staff",
      value: totalStaff,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Present Today",
      value: present,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Absent Today",
      value: absent,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Late Arrivals",
      value: late,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
