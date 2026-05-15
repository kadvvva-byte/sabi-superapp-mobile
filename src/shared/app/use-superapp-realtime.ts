import { useAuthRealtime } from "../realtime/use-auth-realtime"
import { useUserRealtime } from "../realtime/use-user-realtime"
import { useNotificationRealtime } from "../realtime/use-notification-realtime"
import { useWalletRealtime } from "../realtime/use-wallet-realtime"

export function useSuperAppRealtime(params: {
  userId?: string
  walletId?: string
  enabled?: boolean
  onAuthRefresh?: () => Promise<void> | void
  onUserRefresh?: () => Promise<void> | void
  onNotificationRefresh?: () => Promise<void> | void
  onWalletRefresh?: () => Promise<void> | void
}) {
  useAuthRealtime({
    userId: params.userId,
    enabled: params.enabled,
    onRefresh: params.onAuthRefresh,
  })

  useUserRealtime({
    userId: params.userId,
    enabled: params.enabled,
    onRefresh: params.onUserRefresh,
  })

  useNotificationRealtime({
    userId: params.userId,
    enabled: params.enabled,
    onRefresh: params.onNotificationRefresh,
  })

  useWalletRealtime({
    userId: params.userId,
    walletId: params.walletId,
    enabled: params.enabled,
    onRefresh: params.onWalletRefresh,
  })
}
