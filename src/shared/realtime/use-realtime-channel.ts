import { useEffect, useMemo } from "react";
import {
  messengerKernelFacade,
  sendMessengerRealtimeClientEvent,
  type MessengerRealtimeIncomingEvent,
} from "../../core/kernel/messenger";

function isRealtimeEvent(value: unknown): value is MessengerRealtimeIncomingEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as { type?: unknown };

  return (
    event.type === "connection" ||
    event.type === "presence" ||
    event.type === "typing" ||
    event.type === "custom"
  );
}

function normalizeString(value?: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function resolveEventChannel(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  return normalizeString(record.channel as string | null) ?? normalizeString(record.roomId as string | null) ?? normalizeString(record.chatId as string | null);
}

function matchesChannel(channel: string, eventName: string, payload: unknown) {
  const payloadChannel = resolveEventChannel(payload);
  if (!payloadChannel) return true;
  if (payloadChannel === channel) return true;
  if (eventName.includes("presence") && payloadChannel.startsWith("user:")) return true;
  return false;
}

export function useRealtimeChannel(params: {
  userId?: string;
  channel?: string;
  walletCore?: boolean;
  events: string[];
  enabled?: boolean;
  onEvent?: (eventName: string, payload: unknown) => void;
}) {
  const {
    channel,
    events,
    enabled = true,
    onEvent,
    userId,
    walletCore = false,
  } = params;

  const normalizedChannel = useMemo(() => normalizeString(channel), [channel]);
  const normalizedUserId = useMemo(() => normalizeString(userId), [userId]);

  const normalizedEvents = useMemo(
    () => Array.from(new Set(events.filter(Boolean))),
    [events],
  );

  useEffect(() => {
    if (!enabled || !normalizedChannel || !normalizedUserId) {
      return;
    }

    const eventName = walletCore ? "wallet:core:join" : "realtime:channel:join";
    const leaveEventName = walletCore ? "wallet:core:leave" : "realtime:channel:leave";

    sendMessengerRealtimeClientEvent({
      eventName,
      payload: {
        channel: normalizedChannel,
        userId: normalizedUserId,
        at: new Date().toISOString(),
      },
    });

    return () => {
      sendMessengerRealtimeClientEvent({
        eventName: leaveEventName,
        payload: {
          channel: normalizedChannel,
          userId: normalizedUserId,
          at: new Date().toISOString(),
        },
      });
    };
  }, [enabled, normalizedChannel, normalizedUserId, walletCore]);

  useEffect(() => {
    if (!enabled || !normalizedChannel || normalizedEvents.length === 0 || !onEvent) {
      return;
    }

    const unsubscribe = messengerKernelFacade.on("realtimeEvent", (rawEvent) => {
      if (!isRealtimeEvent(rawEvent)) {
        return;
      }

      const event = rawEvent;

      if (event.type === "custom") {
        const eventName = typeof event.eventName === "string" ? event.eventName : ""; if (eventName && normalizedEvents.includes(eventName) && matchesChannel(normalizedChannel, eventName, event.payload)) {
          onEvent(eventName, event.payload);
        }
        return;
      }

      if (event.type === "presence") {
        if (normalizedEvents.includes("presence:update")) {
          onEvent("presence:update", event.payload);
        }

        if (
          normalizedEvents.includes("user_online") &&
          event.payload.status === "online"
        ) {
          onEvent("user_online", event.payload);
        }

        if (
          normalizedEvents.includes("user_offline") &&
          event.payload.status === "offline"
        ) {
          onEvent("user_offline", event.payload);
        }

        return;
      }

      if (event.type === "typing") {
        if (!matchesChannel(normalizedChannel, "typing:update", event.payload)) {
          return;
        }

        if (normalizedEvents.includes("typing:update")) {
          onEvent("typing:update", event.payload);
        }

        if (
          normalizedEvents.includes("typing_start") &&
          event.payload.entry.isTyping
        ) {
          onEvent("typing_start", event.payload);
        }

        if (
          normalizedEvents.includes("typing_stop") &&
          !event.payload.entry.isTyping
        ) {
          onEvent("typing_stop", event.payload);
        }

        return;
      }

      if (event.type === "connection") {
        if (
          event.status === "connected" &&
          normalizedEvents.includes("connect")
        ) {
          onEvent("connect", event);
          return;
        }

        if (
          event.status === "disconnected" &&
          normalizedEvents.includes("disconnect")
        ) {
          onEvent("disconnect", event);
          return;
        }

        if (
          event.status === "reconnecting" &&
          normalizedEvents.includes("reconnect")
        ) {
          onEvent("reconnect", event);
          return;
        }

        if (
          event.status === "error" &&
          normalizedEvents.includes("connect_error")
        ) {
          onEvent("connect_error", event);
          return;
        }

        if (normalizedEvents.includes("connection")) {
          onEvent("connection", event);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, normalizedChannel, normalizedEvents, onEvent]);
}


