import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StaffCard } from "@/components/staff/StaffCard";
import { AttendanceSummary } from "@/components/staff/AttendanceSummary";
import { DocumentUpload } from "@/components/staff/DocumentUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StaffDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
    .single();

  if (!staff) notFound();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("staff_id", id)
    .gte("date", startOfMonth)
    .order("date", { ascending: false });

  const { data: documents } = await supabase
    .from("staff_documents")
    .select("*")
    .eq("staff_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <StaffCard staff={staff} />
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="mt-4">
          <AttendanceSummary attendance={(attendance ?? []) as any} staff={staff} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentUpload staffId={id} initialDocuments={documents ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
