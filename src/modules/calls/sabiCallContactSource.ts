export type SabiCallInviteContact = {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  avatarLetter: string;
};

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = text(...value);
      if (nested) return nested;
      continue;
    }

    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return "";
}

export function isSabiCallInviteTarget(value: unknown): boolean {
  const raw = String(value || "").trim();
  if (!raw) return false;

  const digits = raw.replace(/\D/g, "");
  const phoneOnly = raw.startsWith("+") || (raw.replace(/[+\d\s().-]/g, "") === "" && digits.length >= 7);
  if (phoneOnly) return false;

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) return true;
  if (/^(user_|sabi_|usr_)/i.test(raw)) return true;

  return false;
}

function avatarLetter(name: string) {
  const match = String(name || "").match(/[A-Za-zА-Яа-яЁё0-9]/u);
  return String(match?.[0] || "S").toUpperCase();
}

function collect(value: unknown, depth = 0): Record<string, any>[] {
  if (depth > 7) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collect(item, depth + 1));

  const object = asObject(value);
  if (!Object.keys(object).length) return [];

  const out: Record<string, any>[] = [object];

  for (const key of [
    "data",
    "items",
    "results",
    "contacts",
    "users",
    "rows",
    "list",
    "payload",
    "body",
    "peer",
    "partner",
    "profile",
    "user",
    "contact",
  ]) {
    if (object[key]) out.push(...collect(object[key], depth + 1));
  }

  return out;
}

function mapRecord(
  room: Record<string, any>,
  profile: Record<string, any> | undefined,
  currentUserId: string,
  currentPeerId: string,
): SabiCallInviteContact | null {
  const peer = asObject(room.peer || room.partner || room.profile || room.user || room.contact);

  const userId = text(
    profile?.peerUserId,
    peer.peerUserId,
    peer.userId,
    peer.sabiUserId,
    peer.id,
    room.peerUserId,
    room.userId,
    room.sabiUserId,
    room.peerId,
    room.partnerId,
    room.targetUserId,
  );

  if (
    !isSabiCallInviteTarget(userId) ||
    userId === currentUserId ||
    userId === currentPeerId
  ) {
    return null;
  }

  const name =
    text(
      profile?.name,
      profile?.displayName,
      room.name,
      room.displayName,
      room.peerName,
      room.contactName,
      peer.displayName,
      peer.fullName,
      peer.name,
      peer.username,
    ) || userId;

  const phone = text(profile?.phone, room.phone, room.peerPhone, peer.phone, peer.peerPhone);

  return {
    id: userId,
    userId,
    name,
    phone,
    avatarLetter: text(profile?.avatarLetter, room.avatarLetter) || avatarLetter(name),
  };
}

async function fromKernel(currentUserId: string, currentPeerId: string) {
  try {
    const imported = require("../../core/kernel/messenger/facade");
    const facade = imported.messengerKernelFacade || imported.default;

    if (!facade?.listRoomSnapshots || !facade?.listRoomProfiles) return [];

    const rooms = await facade.listRoomSnapshots();
    const profiles = await facade.listRoomProfiles();
    const out: Record<string, SabiCallInviteContact> = {};

    for (const room of rooms || []) {
      const record = asObject(room);
      const chatId = text(record.chatId, record.id);
      const profile = asObject(profiles?.[chatId]);
      const contact = mapRecord(record, profile, currentUserId, currentPeerId);
      if (contact) out[contact.userId] = contact;
    }

    return Object.values(out);
  } catch {
    return [];
  }
}

async function fromPersisted(currentUserId: string, currentPeerId: string) {
  try {
    const realtime = require("../messenger/chat-room/services/chatRoomRealtime");
    const privateRuntime = require("../messenger/private/privateChatRuntime");

    const rooms =
      typeof realtime.listPersistedChatRooms === "function"
        ? await realtime.listPersistedChatRooms()
        : [];

    const profiles =
      typeof privateRuntime.getPrivateChatProfileMap === "function"
        ? await privateRuntime.getPrivateChatProfileMap()
        : {};

    const out: Record<string, SabiCallInviteContact> = {};

    for (const room of rooms || []) {
      const record = asObject(room);
      const chatId = text(record.chatId, record.id);
      const profile = asObject(profiles?.[chatId]);
      const contact = mapRecord(record, profile, currentUserId, currentPeerId);
      if (contact) out[contact.userId] = contact;
    }

    for (const [chatId, value] of Object.entries(profiles || {})) {
      const profile = asObject(value);
      const contact = mapRecord(
        {
          chatId,
          id: chatId,
          roomType: profile.roomType || "direct",
          name: profile.name,
          avatarLetter: profile.avatarLetter,
          peerUserId: profile.peerUserId,
          phone: profile.phone,
          peerPhone: profile.phone,
        },
        profile,
        currentUserId,
        currentPeerId,
      );
      if (contact) out[contact.userId] = contact;
    }

    return Object.values(out);
  } catch {
    return [];
  }
}

async function fromMessengerUsersApi(currentUserId: string, currentPeerId: string, query: string) {
  try {
    const api = require("../messenger/contacts/messengerContactsApi");
    const fetchMessengerUsers = api.fetchMessengerUsers;
    if (typeof fetchMessengerUsers !== "function") return [];

    const attempts: unknown[][] = [
      [{ query, search: query, currentUserId, userId: currentUserId, limit: 100 }],
      [{ q: query, currentUserId, userId: currentUserId, limit: 100 }],
      [query, currentUserId],
      [currentUserId, query],
      [query],
      [],
    ];

    const out: Record<string, SabiCallInviteContact> = {};

    for (const args of attempts) {
      try {
        const result = await fetchMessengerUsers(...args);

        for (const record of collect(result)) {
          const contact = mapRecord(record, undefined, currentUserId, currentPeerId);
          if (contact) out[contact.userId] = contact;
        }
      } catch {}
    }

    return Object.values(out);
  } catch {
    return [];
  }
}

export async function listSabiCallInviteContacts(input: {
  currentUserId: string;
  currentPeerId: string;
  query?: string;
}) {
  const query = String(input.query || "").trim();
  const merged: Record<string, SabiCallInviteContact> = {};

  const sources = await Promise.all([
    fromKernel(input.currentUserId, input.currentPeerId),
    fromPersisted(input.currentUserId, input.currentPeerId),
    fromMessengerUsersApi(input.currentUserId, input.currentPeerId, query),
  ]);

  for (const contact of sources.flat()) {
    if (isSabiCallInviteTarget(contact.userId)) {
      merged[contact.userId] = contact;
    }
  }

  return Object.values(merged);
}
