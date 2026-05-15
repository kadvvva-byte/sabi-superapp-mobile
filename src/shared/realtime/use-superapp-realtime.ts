import { useEffect, useMemo, useRef } from "react";
import {
  messengerKernelFacade,
  type MessengerRealtimeIncomingEvent,
} from "../../core/kernel/messenger";

type RealtimeEventConfig = {
  event: string;
  handler: (...args: any[]) => void;
};

type EmitOnMountConfig = {
  event: string;
  payload?: unknown;
};

type UseSuperAppRealtimeParams = {
  userId?: string;
  enabled?: boolean;
  connectOnMount?: boolean;
  events?: RealtimeEventConfig[];
  emitOnMount?: EmitOnMountConfig[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: unknown) => void;
};

function normalizeUserId(userId?: string) {
  const normalized = userId?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

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

export default function useSuperAppRealtime(
  params: UseSuperAppRealtimeParams = {},
) {
  const {
    userId,
    enabled = true,
    connectOnMount = true,
    events = [],
    emitOnMount = [],
    onConnect,
    onDisconnect,
    onError,
  } = params;

  const normalizedUserId = useMemo(() => normalizeUserId(userId), [userId]);
  const realtimeAllowed = Boolean(enabled && normalizedUserId);
  const mountEventsEmittedRef = useRef(false);

  const normalizedEvents = useMemo(
    () =>
      events.filter(
        (item): item is RealtimeEventConfig =>
          Boolean(item?.event) && typeof item.handler === "function",
      ),
    [events],
  );

  const normalizedEmitOnMount = useMemo(
    () =>
      emitOnMount.filter(
        (item): item is EmitOnMountConfig => Boolean(item?.event),
      ),
    [emitOnMount],
  );

  useEffect(() => {
    if (!realtimeAllowed || !normalizedUserId) {
      mountEventsEmittedRef.current = false;
      return;
    }

    const emitMountEvents = async () => {
      if (mountEventsEmittedRef.current) {
        return;
      }

      mountEventsEmittedRef.current = true;

      for (const item of normalizedEmitOnMount) {
        try {
          if (item.event === "typing:update") {
            const payload =
              item.payload && typeof item.payload === "object"
                ? (item.payload as Record<string, unknown>)
                : null;

            const chatId =
              typeof payload?.chatId === "string" ? payload.chatId.trim() : "";
            const isTyping = Boolean(payload?.isTyping);

            if (chatId) {
              await messengerKernelFacade.emitTyping({ chatId, isTyping });
            }
            continue;
          }

          if (item.event === "presence:update") {
            const payload =
              item.payload && typeof item.payload === "object"
                ? (item.payload as Record<string, unknown>)
                : null;

            const targetUserId =
              typeof payload?.userId === "string" && payload.userId.trim()
                ? payload.userId.trim()
                : normalizedUserId;

            const status =
              payload?.status === "offline" ? "offline" : "online";
            const lastSeenAt =
              typeof payload?.lastSeenAt === "string"
                ? payload.lastSeenAt
                : null;

            await messengerKernelFacade.setPresence({
              userId: targetUserId,
              status,
              lastSeenAt,
            });
          }
        } catch (error) {
          onError?.(error);
        }
      }
    };

    const notifyConfiguredHandlers = (
      eventName: string,
      payload: unknown,
    ) => {
      normalizedEvents.forEach(({ event, handler }) => {
        if (event === eventName) {
          handler(payload);
        }
      });
    };

    if (
      connectOnMount &&
      messengerKernelFacade.selectors.realtimeStatus() === "connected"
    ) {
      onConnect?.();
      void emitMountEvents();
      notifyConfiguredHandlers("connect", {
        type: "connection",
        status: "connected",
        error: null,
        at: new Date().toISOString(),
      });
    }

    const unsubscribe = messengerKernelFacade.on("realtimeEvent", (rawEvent) => {
      if (!isRealtimeEvent(rawEvent)) {
        return;
      }

      const event = rawEvent;

      if (event.type === "connection") {
        if (event.status === "connected") {
          onConnect?.();
          void emitMountEvents();
          notifyConfiguredHandlers("connect", event);
          notifyConfiguredHandlers("connection", event);
          return;
        }

        if (event.status === "disconnected") {
          onDisconnect?.();
          mountEventsEmittedRef.current = false;
          notifyConfiguredHandlers("disconnect", event);
          notifyConfiguredHandlers("connection", event);
          return;
        }

        if (event.status === "reconnecting") {
          mountEventsEmittedRef.current = false;
          notifyConfiguredHandlers("reconnect", event);
          notifyConfiguredHandlers("connection", event);
          return;
        }

        if (event.status === "error") {
          onError?.(event.error ?? "Realtime connection error");
          notifyConfiguredHandlers("connect_error", event);
          notifyConfiguredHandlers("error", event);
          notifyConfiguredHandlers("connection", event);
        }

        return;
      }

      if (event.type === "presence") {
        notifyConfiguredHandlers("presence:update", event.payload);

        if (event.payload.status === "online") {
          notifyConfiguredHandlers("user_online", event.payload);
        }

        if (event.payload.status === "offline") {
          notifyConfiguredHandlers("user_offline", event.payload);
        }

        return;
      }

      if (event.type === "typing") {
        notifyConfiguredHandlers("typing:update", event.payload);

        if (event.payload.entry.isTyping) {
          notifyConfiguredHandlers("typing_start", event.payload);
        } else {
          notifyConfiguredHandlers("typing_stop", event.payload);
        }

        return;
      }

      if (event.type === "custom") {
        if (typeof event.eventName === "string" && event.eventName.length > 0) { notifyConfiguredHandlers(event.eventName, event.payload); }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    connectOnMount,
    normalizedEmitOnMount,
    normalizedEvents,
    normalizedUserId,
    onConnect,
    onDisconnect,
    onError,
    realtimeAllowed,
  ]);
}

export type {
  EmitOnMountConfig,
  RealtimeEventConfig,
  UseSuperAppRealtimeParams,
};
