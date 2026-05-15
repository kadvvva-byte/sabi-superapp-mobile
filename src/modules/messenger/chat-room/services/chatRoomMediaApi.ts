import { buildChatApiUrl } from "./chatRoomApiConfig"
import type { RemoteMessage } from "./chatRoomMessageApi"

export type UploadMediaMessageInput = {
  chatId: string
  userId: string
  uri: string
  name: string
  mimeType: string
  replyToMessageId?: string | null
  forwardedFromMessageId?: string | null
}

function buildFilePart(input: UploadMediaMessageInput) {
  return {
    uri: input.uri,
    name: input.name,
    type: input.mimeType,
  } as any
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

async function uploadMediaMessage(
  path: string,
  input: UploadMediaMessageInput,
): Promise<RemoteMessage> {
  const formData = new FormData()
  formData.append("file", buildFilePart(input))
  formData.append("chatId", input.chatId)
  formData.append("userId", input.userId)

  if (input.replyToMessageId) {
    formData.append("replyToMessageId", input.replyToMessageId)
  }

  if (input.forwardedFromMessageId) {
    formData.append("forwardedFromMessageId", input.forwardedFromMessageId)
  }

  const response = await fetch(buildChatApiUrl(path), {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const payload = await parseJsonSafe(response)
    throw new Error(
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as any).error)
        : "upload_media_message_failed",
    )
  }

  return response.json()
}

export async function uploadVoiceMessage(input: UploadMediaMessageInput) {
  return uploadMediaMessage("/api/v2/messenger/messages/voice/upload", input)
}

export async function uploadVideoMessage(input: UploadMediaMessageInput) {
  return uploadMediaMessage("/api/v2/messenger/messages/video/upload", input)
}