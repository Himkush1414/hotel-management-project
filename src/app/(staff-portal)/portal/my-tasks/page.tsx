import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, UserCheck, UserX } from "lucide-react";
import { formatDate } from "@/lib/utils/formatDate";

export default async function MyTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!staff) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  let tasks: React.ReactNode = null;

  if (staff.role === "housekeeping") {
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, room_number, floor, room_types(name)")
      .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
      .eq("status", "cleaning");

    tasks = (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            Rooms to Clean ({rooms?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!rooms || rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms assigned for cleaning.</p>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Room {room.room_number}</p>
                    <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Needs Cleaning
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  } else if (staff.role === "receptionist") {
    const { data: checkIns } = await supabase
      .from("bookings")
      .select("id, guests(full_name), rooms(room_number), check_in_date, check_out_date")
      .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
      .eq("check_in_date", today)
      .eq("status", "confirmed");

    const { data: checkOuts } = await supabase
      .from("bookings")
      .select("id, guests(full_name), rooms(room_number), check_in_date, check_out_date")
      .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
      .eq("check_out_date", today)
      .eq("status", "checked_in");

    tasks = (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Pending Check-ins ({checkIns?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!checkIns || checkIns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No check-ins today.</p>
            ) : (
              <div className="space-y-2">
                {checkIns.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">
                        {Array.isArray(b.guests) ? b.guests[0]?.full_name : (b.guests as { full_name: string } | null)?.full_name ?? "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Room {Array.isArray(b.rooms) ? b.rooms[0]?.room_number : (b.rooms as { room_number: string } | null)?.room_number}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Check In</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserX className="h-5 w-5 text-blue-600" />
              Pending Check-outs ({checkOuts?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!checkOuts || checkOuts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No check-outs today.</p>
            ) : (
              <div className="space-y-2">
                {checkOuts.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">
                        {Array.isArray(b.guests) ? b.guests[0]?.full_name : (b.guests as { full_name: string } | null)?.full_name ?? "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Room {Array.isArray(b.rooms) ? b.rooms[0]?.room_number : (b.rooms as { room_number: string } | null)?.room_number}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Check Out</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } else {
    tasks = (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No tasks assigned for your role today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <PageHeader title="My Tasks" subtitle={`Tasks for ${formatDate(today)}`} />
      {tasks}
    </div>
  );
}
