"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  selectedDate: string;
  onDateChange: (date: string) => void;
  roleFilter: string;
  onRoleChange: (role: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function AttendanceFilters({
  selectedDate,
  onDateChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-40"
      />
      <Select value={roleFilter} onValueChange={onRoleChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="receptionist">Receptionist</SelectItem>
          <SelectItem value="housekeeping">Housekeeping</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="accountant">Accountant</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="present">Present</SelectItem>
          <SelectItem value="absent">Absent</SelectItem>
          <SelectItem value="late">Late</SelectItem>
          <SelectItem value="half_day">Half Day</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
