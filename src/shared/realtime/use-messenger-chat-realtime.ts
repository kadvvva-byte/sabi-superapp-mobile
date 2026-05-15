import { useCallback, useEffect } from "react";
import {
  emitMessengerKernelPresenceSnapshotRequest,
  messengerKernelFacade,
  subscribeMessengerKernelRoom,
  type MessengerRealtimeIncomingEvent,
} from "../../core/kernel/messenger";
import { RealtimeEvents } from "./realtime.channels";

const CHAT_EVENTS = [
  RealtimeEvents.messageNew,
  "new_message",
  RealtimeEvents.messageEdited,
  RealtimeEvents.messageDeleted,
  RealtimeEvents.messageDelivered,
  "message_delivered",
  RealtimeEvents.messageRead,
  "message_read",
  RealtimeEvents.typingStart,
  "typing_start",
  RealtimeEvents.typingStop,
  "typing_stop",
  "typing:update",
  "presence:update",
  "user_online",
  "user_offline",
] as const;

function normalizeString(value?: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function isRealtimeEvent(value: unknown): value is MessengerRealtimeIncomingEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as { type?: unknown };
  return event.type === "connection" || event.type === "presence" || event.type === "typing" || event.type === "custom";
}

function eventMatchesChat(chatId: string, payload: unknown) {
  if (!payload || typeof payload !== "object") return true;
  const record = payload as Record<string, unknown>;
  const eventChatId = normalizeString(record.chatId as string | null) ?? normalizeString(record.roomId as string | null);
  if (!eventChatId) return true;
  return eventChatId === chatId;
}

export function useMessengerChatRealtime(params: {
  chatId?: string;
  userId?: string;
  enabled?: boolean;
  onRefresh?: () => void;
}) {
  const { chatId, userId, enabled = true, onRefresh } = params;

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  useEffect(() => {
    const normalizedChatId = normalizeString(chatId);
    if (!enabled || !normalizedChatId) return;

    const unsubscribeRoom = subscribeMessengerKernelRoom(
      normalizedChatId,
      {
        onSnapshot: handleRefresh,
      },
      {
        currentUserId: normalizeString(userId),
      },
    );

    emitMessengerKernelPresenceSnapshotRequest(normalizedChatId, userId);

    const unsubscribeRealtime = messengerKernelFacade.on("realtimeEvent", (rawEvent) => {
      if (!isRealtimeEvent(rawEvent)) return;

      if (rawEvent.type === "custom") {
        if (!CHAT_EVENTS.includes(rawEvent.eventName as (typeof CHAT_EVENTS)[number])) return;
        if (!eventMatchesChat(normalizedChatId, rawEvent.payload)) return;
        handleRefresh();
        return;
      }

      if (rawEvent.type === "typing") {
        if (rawEvent.payload.chatId !== normalizedChatId) return;
        handleRefresh();
        return;
      }

      if (rawEvent.type === "presence") {
        handleRefresh();
      }
    });

    return () => {
      unsubscribeRealtime();
      unsubscribeRoom?.();
    };
  }, [chatId, userId, enabled, handleRefresh]);
}
