import type { MessengerKernelMessageRecord } from "../core/types"

export type KernelMessengerMessageKind =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "contact"
  | "system"
  | "unknown"

export type KernelMessengerMessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "deleted"
  | "unknown"

export type KernelMessengerMessageDirection =
  | "incoming"
  | "outgoing"
  | "system"

export type KernelMessengerMessage = MessengerKernelMessageRecord & {
  id: string
  roomId: string
  senderUserId: string | null
  kind: KernelMessengerMessageKind
  direction: KernelMessengerMessageDirection
  status: KernelMessengerMessageStatus
  text: string | null
  previewText: string | null
  mediaUrl: string | null
  thumbnailUrl: string | null
  fileName: string | null
  mimeType: string | null
  replyToMessageId: string | null
  forwardedFromMessageId: string | null
  clientMessageId: string | null
  isEdited: boolean
  isDeleted: boolean
  sentAt: string | null
  deliveredAt: string | null
  readAt: string | null
  createdAt: string | null
  updatedAt: string | null
  metadata: Record<string, unknown>
}

export type KernelMessengerMessagesQuery = {
  roomId: string
  cursor?: string | null
  limit?: number
  beforeMessageId?: string | null
  afterMessageId?: string | null
}

export type KernelMessengerMessagesResponse = {
  roomId: string
  items: KernelMessengerMessage[]
  nextCursor: string | null
  totalCount: number | null
}

export type KernelMessengerCreateMessageInput = {
  roomId: string
  text?: string | null
  kind?: KernelMessengerMessageKind
  replyToMessageId?: string | null
  clientMessageId?: string | null
  metadata?: Record<string, unknown>
}

export type KernelMessengerUpdateMessageInput = {
  messageId: string
  text?: string | null
  metadata?: Record<string, unknown>
}

export type KernelMessengerMessagesState = {
  items: KernelMessengerMessage[]
  byId: Record<string, KernelMessengerMessage>
  messageIdsByRoomId: Record<string, string[]>
  selectedRoomId: string | null
  isLoading: boolean
  isRefreshing: boolean
  isSending: boolean
  isHydrated: boolean
  errorMessage: string | null
  nextCursorByRoomId: Record<string, string | null>
  totalCountByRoomId: Record<string, number | null>
  lastFetchedAtByRoomId: Record<string, string | null>
}