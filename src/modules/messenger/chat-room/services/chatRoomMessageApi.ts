import { buildChatApiUrl } from "./chatRoomApiConfig"

export type RemoteMessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "VOICE"
  | "FILE"
  | "LOCATION"

export type RemoteMediaType =
  | "IMAGE"
  | "VIDEO"
  | "FILE"
  | "VOICE"
  | null

export type RemoteMessage = {
  id: string
  chatId: string
  userId: string
  type: RemoteMessageType
  content: string | null
  mediaUrl: string | null
  mediaType: RemoteMediaType
  fileName: string | null
  fileSize: number | null
  latitude: number | null
  longitude: number | null
  replyToMessageId: string | null
  forwardedFromMessageId: string | null
  deliveredAt: string | null
  readAt: string | null
  editedAt: string | null
  deletedAt: string | null
  createdAt: string
}

async function parseJsonSafe(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function fetchChatMessages(chatId: string): Promise<RemoteMessage[]> {
  const response = await fetch(
    buildChatApiUrl(`/api/v2/messenger/chats/${encodeURIComponent(chatId)}/messages`),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  )

  if (!response.ok) {
    const payload = await parseJsonSafe(response)
    throw new Error(
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as any).error)
        : "fetch_chat_messages_failed",
    )
  }

  const payload = await response.json()
  return Array.isArray(payload) ? payload : []
}