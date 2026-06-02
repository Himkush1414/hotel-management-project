"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AttendanceFilters } from "./AttendanceFilters";
import { MarkAttendanceForm } from "./MarkAttendanceForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Printer, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";

interface StaffRef {
  id: string;
  full_name: string;
  role: string;
}

interface AttendanceRecord {
  id: string;
  staff_id: string;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  notes: string | null;
  staff?: StaffRef | null;
}

const STATUS_STYLES: Record<string, string> = {
  present: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-yellow-100 text-yellow-800",
  half_day: "bg-blue-100 text-blue-800",
};

interface Props {
  initialAttendance: AttendanceRecord[];
  allStaff: StaffRef[];
}

export function AttendanceTable({ initialAttendance, allStaff }: Props) {
  const supabase = createClient();
  const permissions = usePermissions();
  const [attendance, setAttendance] = useState(initialAttendance);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    const { data } = await supabase
      .from("attendance")
      .select("*, staff(id, full_name, role)")
      .eq("date", date)
      .order("created_at", { ascending: false });
    setAttendance(data ?? []);
  };

  const filtered = attendance.filter((a) => {
    const matchesRole = roleFilter === "all" || a.staff?.role === roleFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesRole && matchesStatus;
  });

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <AttendanceFilters
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          {permissions.can("EDIT_STAFF") && (
            <Button
              size="sm"
              onClick={() => {
                setEditingRecord(null);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Mark Attendance
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              {permissions.can("EDIT_STAFF") && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No attendance records for this date.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {record.staff ? getInitials(record.staff.full_name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {record.staff?.full_name ?? "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {record.staff?.role ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {record.check_in ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {record.check_out ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        STATUS_STYLES[record.status] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.notes ?? "—"}
                  </TableCell>
                  {permissions.can("EDIT_STAFF") && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingRecord(record);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MarkAttendanceForm
        open={showForm}
        onClose={() => setShowForm(false)}
        record={editingRecord}
        allStaff={allStaff}
        defaultDate={selectedDate}
        onSaved={(saved) => {
          setAttendance((prev) => {
            const idx = prev.findIndex((r) => r.id === saved.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = saved;
              return next;
            }
            return [saved, ...prev];
          });
          setShowForm(false);
        }}
      />
    </div>
  );
}
