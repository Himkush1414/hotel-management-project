"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import type { Staff } from "@/types/staff";

interface AttendanceRecord {
  id: string;
  staff_id: string;
  date: string;
  status: "present" | "absent" | "late" | "half_day";
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
}

interface Props {
  attendance: AttendanceRecord[];
  staff: Staff;
}

const STATUS_CONFIG = {
  present: { color: "bg-green-500", label: "Present" },
  absent: { color: "bg-red-500", label: "Absent" },
  late: { color: "bg-yellow-500", label: "Late" },
  half_day: { color: "bg-blue-500", label: "Half Day" },
};

export function AttendanceSummary({ attendance }: Props) {
  const present = attendance.filter((a) => a.status === "present").length;
  const absent = attendance.filter((a) => a.status === "absent").length;
  const late = attendance.filter((a) => a.status === "late").length;
  const halfDay = attendance.filter((a) => a.status === "half_day").length;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const attendanceMap = new Map(
    attendance.map((a) => [new Date(a.date).getDate(), a.status])
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{late}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{halfDay}</p>
              <p className="text-xs text-muted-foreground">Half Day</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Attendance —{" "}
            {now.toLocaleString("default", { month: "long", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
            {Array.from({
              length: new Date(now.getFullYear(), now.getMonth(), 1).getDay(),
            }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map((day) => {
              const status = attendanceMap.get(day);
              const isToday = day === now.getDate();
              const isFuture = day > now.getDate();

              return (
                <div
                  key={day}
                  title={status ? STATUS_CONFIG[status].label : "No record"}
                  className={`
                    aspect-square flex items-center justify-center rounded-md text-xs font-medium cursor-default
                    ${isToday ? "ring-2 ring-primary" : ""}
                    ${isFuture ? "text-muted-foreground/40" : ""}
                    ${
                      status === "present"
                        ? "bg-green-100 text-green-800"
                        : status === "absent"
                        ? "bg-red-100 text-red-800"
                        : status === "late"
                        ? "bg-yellow-100 text-yellow-800"
                        : status === "half_day"
                        ? "bg-blue-100 text-blue-800"
                        : !isFuture
                        ? "bg-muted/50 text-muted-foreground"
                        : ""
                    }
                  `}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-sm ${val.color}`} />
                <span className="text-xs text-muted-foreground">{val.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {attendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendance.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-20">
                      {new Date(record.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`capitalize text-xs ${
                        record.status === "present"
                          ? "bg-green-100 text-green-800"
                          : record.status === "absent"
                          ? "bg-red-100 text-red-800"
                          : record.status === "late"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {record.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {record.check_in_time && <span>In: {record.check_in_time}</span>}
                    {record.check_out_time && <span>Out: {record.check_out_time}</span>}
                    {record.notes && <span className="italic">{record.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
