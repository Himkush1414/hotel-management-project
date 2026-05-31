"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

type TableChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseSupabaseRealtimeOptions<T extends Record<string, unknown>> {
  table: string;
  event?: TableChangeEvent;
  filter?: string;
  onData: (payload: RealtimePostgresChangesPayload<T>) => void;
  enabled?: boolean;
}

export function useSupabaseRealtime<T extends Record<string, unknown>>({
  table,
  event = "*",
  filter,
  onData,
  enabled = true,
}: UseSupabaseRealtimeOptions<T>): void {
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDataRef = useRef(onData);

  onDataRef.current = onData;

  const subscribe = useCallback(() => {
    if (!enabled) return;

    const channelName = filter
      ? `realtime:${table}:${filter}`
      : `realtime:${table}`;

    const channel = supabase.channel(channelName);

    const changesConfig: Parameters<typeof channel.on>[1] = {
      event,
      schema: "public",
      table,
      ...(filter ? { filter } : {}),
    };

    channel
      .on(
        "postgres_changes" as Parameters<typeof channel.on>[0],
        changesConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          onDataRef.current(payload);
        }
      )
      .on("system" as Parameters<typeof channel.on>[0], {}, (status: { status: string }) => {
        if (status.status === "CHANNEL_ERROR" || status.status === "TIMED_OUT") {
          toast({
            title: "Reconnecting...",
            description: "Live updates connection lost. Reconnecting.",
            variant: "destructive",
          });

          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
          }

          reconnectTimerRef.current = setTimeout(() => {
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
            subscribe();
          }, 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;
  }, [enabled, table, event, filter, supabase, toast]);

  useEffect(() => {
    subscribe();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [subscribe, supabase]);
}
