import { router } from "expo-router";

import { messengerKernelFacade } from "../../../core/kernel/messenger/facade";

type MessengerRoomRouteValue = string | number | boolean | null | undefined;

export type OpenMessengerRoomParams = Record<string, unknown> & {
  id?: string | null;
  chatId?: string | null;
  roomId?: string | null;
  name?: string | null;
  title?: string | null;
  subtitle?: string | null;
  roomType?: string | null;
  verified?: boolean | string | null;
  avatarLetter?: string | null;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  coverUrl?: string | null;
  currentUserId?: string | null;
  peerUserId?: string | null;
  peerId?: string | null;
  targetUserId?: string | null;
  partnerId?: string | null;
  contactId?: string | null;
  phone?: string | null;
  peerPhone?: string | null;
  username?: string | null;
  peerUsername?: string | null;
  peerEmail?: string | null;
  markRead?: boolean | null;
};

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function normalizeRoomType(value: unknown): string {
  const raw = normalizeString(value).toLowerCase();
  if (raw === "group" || raw === "channel" || raw === "bot" || raw === "business") return raw;
  return "direct";
}

function toRouteValue(value: unknown): string | undefined {
  if (typeof value === "undefined" || value === null) return undefined;
  if (typeof value === "boolean") return value ? "1" : "0";
  const normalized = String(value).trim();
  return normalized ? normalized : undefined;
}

function buildRouteParams(params: OpenMessengerRoomParams, chatId: string, roomType: string) {
  const routeParams: Record<string, string> = {
    id: chatId,
    chatId,
    roomId: chatId,
    roomType,
  };

  Object.entries(params).forEach(([key, value]) => {
    const normalized = toRouteValue(value as MessengerRoomRouteValue);
    if (normalized) routeParams[key] = normalized;
  });

  routeParams.id = chatId;
  routeParams.chatId = chatId;
  routeParams.roomId = chatId;
  routeParams.roomType = roomType;

  return routeParams;
}

async function safeEnsureRoomSnapshot(params: OpenMessengerRoomParams, chatId: string, roomType: string) {
  try {
    const ensure = (messengerKernelFacade as any)?.ensureRoomSnapshot;
    if (typeof ensure !== "function") return;

    await ensure({
      ...params,
      chatId,
      roomId: chatId,
      name: normalizeString(params.name) || normalizeString(params.title) || chatId,
      subtitle: normalizeString(params.subtitle) || undefined,
      roomType,
      verified: Boolean(params.verified),
      avatarLetter: normalizeString(params.avatarLetter) || undefined,
      avatarUrl: normalizeString(params.avatarUrl) || normalizeString(params.photoUrl) || undefined,
      photoUrl: normalizeString(params.photoUrl) || normalizeString(params.avatarUrl) || undefined,
      coverUrl: normalizeString(params.coverUrl) || undefined,
      currentUserId: normalizeString(params.currentUserId) || undefined,
      peerUserId:
        normalizeString(params.peerUserId) ||
        normalizeString(params.peerId) ||
        normalizeString(params.targetUserId) ||
        normalizeString(params.partnerId) ||
        normalizeString(params.contactId) ||
        undefined,
      phone: normalizeString(params.phone) || normalizeString(params.peerPhone) || undefined,
      username: normalizeString(params.username) || normalizeString(params.peerUsername) || undefined,
      peerPhone: normalizeString(params.peerPhone) || normalizeString(params.phone) || undefined,
      peerUsername: normalizeString(params.peerUsername) || normalizeString(params.username) || undefined,
      peerEmail: normalizeString(params.peerEmail) || undefined,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Opening the room must not be blocked by a local snapshot refresh failure.
  }
}

async function safeMarkRoomRead(chatId: string) {
  try {
    const markRead = (messengerKernelFacade as any)?.rooms?.markRead;
    if (typeof markRead === "function") await markRead(chatId);
  } catch {
    // Keep navigation stable even if local profile state cannot be updated.
  }
}

export async function openMessengerRoom(params: OpenMessengerRoomParams) {
  const chatId =
    normalizeString(params.chatId) ||
    normalizeString(params.roomId) ||
    normalizeString(params.id);

  if (!chatId) return;

  const roomType = normalizeRoomType(params.roomType);
  await safeEnsureRoomSnapshot(params, chatId, roomType);

  if (params.markRead) {
    await safeMarkRoomRead(chatId);
  }

  router.push({
    pathname: "/tabs/chat/[id]" as never,
    params: buildRouteParams(params, chatId, roomType),
  } as never);
}
