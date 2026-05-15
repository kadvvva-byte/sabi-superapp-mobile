import { useCallback, useState } from "react"
import { useUserRealtime } from "../../../shared/realtime/use-user-realtime"

export function useUserLiveSync(params: {
  userId?: string
  enabled?: boolean
  onRefresh?: () => Promise<void> | void
}) {
  const [userSyncTick, setUserSyncTick] = useState(0)

  const refresh = useCallback(async () => {
    setUserSyncTick((value) => value + 1)
    await params.onRefresh?.()
  }, [params])

  useUserRealtime({
    userId: params.userId,
    enabled: params.enabled,
    onRefresh: refresh,
  })

  return {
    userSyncTick,
    refreshUserRealtime: refresh,
  }
}
