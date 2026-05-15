import { useRealtimeChannel } from "./use-realtime-channel"
import { RealtimeChannels, RealtimeEvents } from "./realtime.channels"

export function useUserRealtime(params: {
  userId?: string
  enabled?: boolean
  onRefresh?: () => void
}) {
  useRealtimeChannel({
    userId: params.userId,
    channel: params.userId ? RealtimeChannels.userProfile(params.userId) : undefined,
    enabled: params.enabled,
    events: [RealtimeEvents.userUpdated, RealtimeEvents.userProfileUpdated],
    onEvent: () => params.onRefresh?.(),
  })
}
