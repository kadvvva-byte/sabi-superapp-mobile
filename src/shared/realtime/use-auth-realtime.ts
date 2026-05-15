import { useCallback } from "react";
import { useRealtimeChannel } from "./use-realtime-channel";
import { RealtimeChannels, RealtimeEvents } from "./realtime.channels";

export function useAuthRealtime(params: {
  userId?: string;
  enabled?: boolean;
  onRefresh?: () => void;
}) {
  const handleEvent = useCallback(() => {
    params.onRefresh?.();
  }, [params.onRefresh]);

  useRealtimeChannel({
    userId: params.userId,
    channel: params.userId
      ? RealtimeChannels.authUser(params.userId)
      : undefined,
    enabled: Boolean(params.enabled && params.userId),
    events: [
      RealtimeEvents.authSessionChanged,
      RealtimeEvents.authAccountUpdated,
    ],
    onEvent: handleEvent,
  });
}