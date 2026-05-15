export type MessengerCanonicalIdentityInput = {
  id?: string | null;
  userId?: string | null;
  peerUserId?: string | null;
  currentUserId?: string | null;
  chatId?: string | null;
  phone?: string | null;
  username?: string | null;
  name?: string | null;
  source?: string | null;
  roomType?: string | null;
};

function normalizeString(value?: string | null) {
  return String(value ?? "").trim();
}

export function normalizeMessengerIdentityPhone(value?: string | null) {
  const raw = normalizeString(value);
  if (!raw) return "";
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return `${hasPlus ? "+" : ""}${digits}`;
}

export function normalizeMessengerIdentityUsername(value?: string | null) {
  const raw = normalizeString(value).replace(/^@+/, "").toLowerCase();
  return raw ? `@${raw}` : "";
}

export function normalizeMessengerIdentityKeyPart(value?: string | null) {
  return normalizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9_+@.-]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeUserIdentity(value?: string | null) {
  return normalizeMessengerIdentityKeyPart(value);
}

function normalizeChatIdentity(value?: string | null) {
  return normalizeMessengerIdentityKeyPart(value);
}

function normalizeSourceIdentity(value?: string | null) {
  return normalizeMessengerIdentityKeyPart(value) || "unknown";
}

function normalizeNameIdentity(value?: string | null) {
  return normalizeMessengerIdentityKeyPart(value);
}

function firstNonEmpty(values: string[]) {
  return values.find((item) => item.trim().length > 0) || "";
}

export function resolveMessengerPeerUserIdentity(input: MessengerCanonicalIdentityInput) {
  const explicitPeer = normalizeUserIdentity(input.peerUserId);
  if (explicitPeer) return explicitPeer;

  const explicitUser = normalizeUserIdentity(input.userId);
  const currentUser = normalizeUserIdentity(input.currentUserId);
  if (explicitUser && explicitUser !== currentUser) return explicitUser;

  const source = normalizeSourceIdentity(input.source);
  const roomType = normalizeMessengerIdentityKeyPart(input.roomType);
  const id = normalizeUserIdentity(input.id);

  if (id && (source === "sabi" || source === "custom") && roomType !== "group" && !id.startsWith("custom_")) {
    return id;
  }

  return "";
}

export function buildMessengerCanonicalIdentityKey(input: MessengerCanonicalIdentityInput) {
  const userId = resolveMessengerPeerUserIdentity(input);
  if (userId) return `user:${userId}`;

  const phone = normalizeMessengerIdentityPhone(input.phone);
  if (phone) return `phone:${phone}`;

  const username = normalizeMessengerIdentityUsername(input.username);
  if (username) return `username:${username}`;

  const chatId = normalizeChatIdentity(input.chatId);
  if (chatId) return `chat:${chatId}`;

  const id = normalizeUserIdentity(input.id);
  if (id) return `id:${id}`;

  const name = normalizeNameIdentity(input.name);
  if (name) return `name:${normalizeSourceIdentity(input.source)}:${name}`;

  return "";
}

export function buildMessengerCanonicalContactId(input: MessengerCanonicalIdentityInput) {
  const canonicalKey = buildMessengerCanonicalIdentityKey(input);
  const normalized = normalizeMessengerIdentityKeyPart(canonicalKey);
  return normalized ? `custom-${normalized}` : "";
}

export function buildMessengerContactAliasKeys(input: MessengerCanonicalIdentityInput) {
  const keys = new Set<string>();

  const canonical = buildMessengerCanonicalIdentityKey(input);
  if (canonical) keys.add(canonical);

  const peerUserId = resolveMessengerPeerUserIdentity(input);
  if (peerUserId) keys.add(`user:${peerUserId}`);

  const phone = normalizeMessengerIdentityPhone(input.phone);
  if (phone) keys.add(`phone:${phone}`);

  const username = normalizeMessengerIdentityUsername(input.username);
  if (username) keys.add(`username:${username}`);

  const chatId = normalizeChatIdentity(input.chatId);
  if (chatId) keys.add(`chat:${chatId}`);

  const id = normalizeUserIdentity(input.id);
  if (id) keys.add(`id:${id}`);

  const name = normalizeNameIdentity(input.name);
  if (name) keys.add(`name:${normalizeSourceIdentity(input.source)}:${name}`);

  return Array.from(keys).filter(Boolean);
}

export function mergeMessengerCanonicalRecords<T extends MessengerCanonicalIdentityInput>(
  items: T[],
  merge: (previous: T, next: T) => T,
) {
  const itemByCanonicalKey = new Map<string, T>();
  const aliasToCanonicalKey = new Map<string, string>();

  for (const item of items) {
    const aliases = buildMessengerContactAliasKeys(item);
    const canonicalKey = firstNonEmpty(aliases);
    if (!canonicalKey) continue;

    const existingKey = aliases.map((alias) => aliasToCanonicalKey.get(alias)).find(Boolean) || canonicalKey;
    const previous = itemByCanonicalKey.get(existingKey);
    const nextItem = previous ? merge(previous, item) : item;

    itemByCanonicalKey.set(existingKey, nextItem);
    buildMessengerContactAliasKeys(nextItem).forEach((alias) => aliasToCanonicalKey.set(alias, existingKey));
    aliases.forEach((alias) => aliasToCanonicalKey.set(alias, existingKey));
  }

  return Array.from(itemByCanonicalKey.values());
}
