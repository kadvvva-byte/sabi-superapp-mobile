import { useEffect } from "react"
import { getSuperAppSocket, joinWalletCoreChannel, leaveWalletCoreChannel } from "./superapp-socket"
import { RealtimeChannels, RealtimeEvents } from "./realtime.channels"

const WALLET_EVENTS = [
  RealtimeEvents.walletBalanceUpdated,
  RealtimeEvents.walletHistoryChanged,
  RealtimeEvents.walletOperationUpdated,
  RealtimeEvents.walletCoreEvent,
  RealtimeEvents.realtimeEvent,
  "wallet.business.transfer.completed",
  "wallet.business.transfer.received",
  "wallet.merchant.payment.completed",
  "wallet.merchant.settlement.completed",
  "wallet.operation.completed",
] as const

export function useWalletRealtime(params: {
  userId?: string
  walletId?: string
  operationId?: string
  enabled?: boolean
  onRefresh?: () => void
}) {
  const { userId, walletId, operationId, enabled = true, onRefresh } = params

  useEffect(() => {
    if (!enabled || (!userId && !walletId && !operationId)) return

    const socket = getSuperAppSocket(userId)
    const channels: string[] = []

    if (userId) channels.push(RealtimeChannels.walletUser(userId))
    if (walletId) channels.push(RealtimeChannels.wallet(walletId))
    if (operationId) channels.push(RealtimeChannels.walletOperation(operationId))

    channels.forEach((channel) => joinWalletCoreChannel(channel, userId))

    const handlers = WALLET_EVENTS.map((eventName) => {
      const handler = () => onRefresh?.()
      socket.on(eventName, handler)
      return { eventName, handler }
    })

    return () => {
      handlers.forEach(({ eventName, handler }) => socket.off(eventName, handler))
      channels.forEach((channel) => leaveWalletCoreChannel(channel))
    }
  }, [userId, walletId, operationId, enabled, onRefresh])
}
