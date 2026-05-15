import { useCallback, useState } from "react"
import {
  emitMessageDelivered,
  emitMessageRead,
  emitTypingStart,
  emitTypingStop,
} from "../../../shared/realtime/superapp-socket"
import { useMessengerChatRealtime } from "../../../shared/realtime/use-messenger-chat-realtime"

export function useChatRoomLiveSync(params: {
  chatId?: string
  userId?: string
  enabled?: boolean
  onRefresh?: () => Promise<void> | void
}) {
  const [chatSyncTick, setChatSyncTick] = useState(0)

  const refresh = useCallback(async () => {
    setChatSyncTick((value) => value + 1)
    await params.onRefresh?.()
  }, [params])

  useMessengerChatRealtime({
    chatId: params.chatId,
    userId: params.userId,
    enabled: params.enabled,
    onRefresh: refresh,
  })

  return {
    chatSyncTick,
    refreshChatRealtime: refresh,
    startTyping: () => {
      if (!params.chatId || !params.userId) return
      emitTypingStart(params.chatId, params.userId)
    },
    stopTyping: () => {
      if (!params.chatId || !params.userId) return
      emitTypingStop(params.chatId, params.userId)
    },
    markDelivered: (messageId: string) => {
      if (!params.chatId) return
      emitMessageDelivered(params.chatId, messageId, params.userId)
    },
    markRead: (messageId: string) => {
      if (!params.chatId) return
      emitMessageRead(params.chatId, messageId, params.userId)
    },
  }
}
