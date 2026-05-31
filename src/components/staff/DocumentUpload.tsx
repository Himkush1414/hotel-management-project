"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { formatDate } from "@/lib/utils/formatDate";

interface StaffDocument {
  id: string;
  staff_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

const DOC_TYPES = [
  { value: "id_proof", label: "ID Proof" },
  { value: "contract", label: "Contract" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];

interface Props {
  staffId: string;
  initialDocuments: StaffDocument[];
}

export function DocumentUpload({ staffId, initialDocuments }: Props) {
  const supabase = createClient();
  const { toast } = useToast();
  const { isAdmin } = usePermissions();
  const [documents, setDocuments] = useState<StaffDocument[]>(initialDocuments);
  const [docType, setDocType] = useState("id_proof");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `staff-documents/${staffId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("hotel-files")
      .upload(path, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("hotel-files").getPublicUrl(path);

    const { data, error } = await supabase
      .from("staff_documents")
      .insert({
        staff_id: staffId,
        document_type: docType,
        file_name: file.name,
        file_url: publicUrl.publicUrl,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error saving document", description: error.message, variant: "destructive" });
    } else {
      setDocuments((prev) => [data as StaffDocument, ...prev]);
      toast({ title: "Document uploaded", description: `${file.name} uploaded successfully.` });
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDelete = async (doc: StaffDocument) => {
    const { error } = await supabase.from("staff_documents").delete().eq("id", doc.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast({ title: "Document deleted" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div
            className="flex-1 border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {uploading ? "Uploading..." : "Drop file here or click to upload"}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </div>

        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {DOC_TYPES.find((t) => t.value === doc.document_type)?.label ?? doc.document_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
