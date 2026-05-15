import { useRealtimeChannel } from "./use-realtime-channel"
import { RealtimeChannels, RealtimeEvents } from "./realtime.channels"

export function useNotificationRealtime(params: {
  userId?: string
  enabled?: boolean
  onRefresh?: () => void
}) {
  useRealtimeChannel({
    userId: params.userId,
    channel: params.userId ? RealtimeChannels.notificationUser(params.userId) : undefined,
    enabled: params.enabled,
    events: [RealtimeEvents.notificationNew, RealtimeEvents.notificationRead],
    onEvent: () => params.onRefresh?.(),
  })
}
