"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

const schema = z.object({
  staff_id: z.string().min(1, "Select a staff member"),
  date: z.string().min(1, "Date is required"),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  status: z.enum(["present", "absent", "late", "half_day"]),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

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

interface Props {
  open: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  allStaff: StaffRef[];
  defaultDate: string;
  onSaved: (record: AttendanceRecord) => void;
}

export function MarkAttendanceForm({ open, onClose, record, allStaff, defaultDate, onSaved }: Props) {
  const supabase = createClient();
  const toast = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      staff_id: "",
      date: defaultDate,
      check_in: "",
      check_out: "",
      status: "present",
      notes: "",
    },
  });

  useEffect(() => {
    if (record) {
      form.reset({
        staff_id: record.staff_id,
        date: record.date,
        check_in: record.check_in ?? "",
        check_out: record.check_out ?? "",
        status: record.status as FormData["status"],
        notes: record.notes ?? "",
      });
    } else {
      form.reset({
        staff_id: "",
        date: defaultDate,
        check_in: "",
        check_out: "",
        status: "present",
        notes: "",
      });
    }
  }, [record, defaultDate, form]);

  const onSubmit = async (data: FormData) => {
    const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!;
    const payload = {
      hotel_id: hotelId,
      staff_id: data.staff_id,
      date: data.date,
      check_in: data.check_in || null,
      check_out: data.check_out || null,
      status: data.status,
      notes: data.notes || null,
    };

    let result;
    if (record) {
      result = await supabase
        .from("attendance")
        .update(payload)
        .eq("id", record.id)
        .select("*, staff(id, full_name, role)")
        .single();
    } else {
      result = await supabase
        .from("attendance")
        .insert(payload)
        .select("*, staff(id, full_name, role)")
        .single();
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(record ? "Attendance updated" : "Attendance marked");
      onSaved(result.data as unknown as AttendanceRecord);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Attendance" : "Mark Attendance"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staff_id"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Staff Member</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allStaff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name} ({s.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="check_in"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Check In Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="check_out"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Check Out Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional notes..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : record ? "Update" : "Mark Attendance"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
