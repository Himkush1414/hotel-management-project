"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/client";

type TableRow = Record<string, unknown>;

export interface UseSupabaseRealtimeOptions<T extends TableRow> {
  table: string;
  filter?: string;
  onInsert?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: Partial<T>) => void;
  onData?: (payload: any) => void;
  enabled?: boolean;
}

export function useSupabaseRealtime<T extends TableRow>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onData,
  enabled = true,
}: UseSupabaseRealtimeOptions<T>): void {
  const supabase = createBrowserClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  const onDataRef = useRef(onData);
  onInsertRef.current = onInsert;
  onUpdateRef.current = onUpdate;
  onDeleteRef.current = onDelete;
  onDataRef.current = onData;

  useEffect(() => {
    if (!enabled) return;

    const channelName = filter ? `rt:${table}:${filter}` : `rt:${table}`;
    const channel = supabase.channel(channelName);

    const config: any = { event: "*", schema: "public", table };
    if (filter) config.filter = filter;

    channel
      .on("postgres_changes" as any, config, (payload: any) => {
        if (onDataRef.current) onDataRef.current(payload);
        if (payload.eventType === "INSERT" && onInsertRef.current) {
          onInsertRef.current(payload.new as T);
        }
        if (payload.eventType === "UPDATE" && onUpdateRef.current) {
          onUpdateRef.current(payload.new as T);
        }
        if (payload.eventType === "DELETE" && onDeleteRef.current) {
          onDeleteRef.current(payload.old as Partial<T>);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, table, filter, supabase]);
}
