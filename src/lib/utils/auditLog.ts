import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const getAdminClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export interface AuditLogParams {
  hotel_id: string;
  performed_by: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}

/**
 * Logs an action to the audit_logs table.
 * Never throws — all errors are caught and logged to console.
 */
export async function logAction(params: AuditLogParams): Promise<void> {
  try {
    const supabaseAdmin = getAdminClient();

    const { error } = await supabaseAdmin.from("audit_logs").insert(({
      hotel_id: params.hotel_id,
      performed_by: params.performed_by,
      action: params.action,
      table_name: params.entity_type,
      record_id: params.entity_id,
      old_value: params.old_value ?? null,
      new_value: params.new_value ?? null,
      created_at: new Date().toISOString(),
    }) as any);

    if (error) {
      console.error(
        `[AuditLog] Failed to insert audit log — action: ${params.action}, entity: ${params.entity_type}/${params.entity_id}`,
        error.message
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `[AuditLog] Unexpected error — action: ${params.action}, entity: ${params.entity_type}/${params.entity_id}`,
      message
    );
  }
}
