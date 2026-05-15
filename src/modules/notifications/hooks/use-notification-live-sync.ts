import { useCallback, useState } from "react"
import { useNotificationRealtime } from "../../../shared/realtime/use-notification-realtime"

export function useNotificationLiveSync(params: {
  userId?: string
  enabled?: boolean
  onRefresh?: () => Promise<void> | void
}) {
  const [notificationSyncTick, setNotificationSyncTick] = useState(0)

  const refresh = useCallback(async () => {
    setNotificationSyncTick((value) => value + 1)
    await params.onRefresh?.()
  }, [params])

  useNotificationRealtime({
    userId: params.userId,
    enabled: params.enabled,
    onRefresh: refresh,
  })

  return {
    notificationSyncTick,
    refreshNotificationRealtime: refresh,
  }
}
