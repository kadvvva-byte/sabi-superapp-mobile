import { appStorage } from "../../../shared/storage/app-storage";
import {
  buildMessengerCanonicalContactId,
  buildMessengerContactAliasKeys,
  normalizeMessengerIdentityPhone,
  normalizeMessengerIdentityUsername,
} from "./messengerIdentityResolver";

export type MessengerCustomContactRoomType = "direct" | "business";
export type MessengerCustomContactSource = "sabi" | "phone" | "custom";

export type MessengerCustomContact = {
  id: string;
  chatId: string;
  name: string;
  phone?: string;
  username?: string;
  verified?: boolean;
  official?: boolean;
  avatarLetter: string;
  avatarUrl?: string;
  roomType: MessengerCustomContactRoomType;
  source?: MessengerCustomContactSource;
  currentUserId?: string;
  peerUserId?: string;
  deviceContactId?: string;
  createdAt: string;
  updatedAt: string;
};

type BuildChatIdArgs = {
  id?: string;
  phone?: string;
  username?: string;
  name?: string;
};

type BuildDirectMessengerChatIdArgs = {
  currentUserId?: string | null;
  peerUserId?: string | null;
  fallback?: string | null;
};

type UpsertCustomMessengerContactArgs = {
  id?: string;
  chatId?: string;
  name: string;
  phone?: string;
  username?: string;
  verified?: boolean;
  official?: boolean;
  avatarLetter?: string;
  avatarUrl?: string;
  roomType?: MessengerCustomContactRoomType;
  source?: MessengerCustomContactSource;
  currentUserId?: string;
  peerUserId?: string;
  deviceContactId?: string;
};

export type MessengerCustomContactDeletedKeys = {
  ids: string[];
  chatIds: string[];
};

type RemoveCustomMessengerContactTarget =
  | string
  | {
      id?: string | null;
      chatId?: string | null;
      phone?: string | null;
      username?: string | null;
      source?: MessengerCustomContactSource | string | null;
      currentUserId?: string | null;
      ownerUserId?: string | null;
    };

const STORAGE_KEY = "sabi.messenger.custom_contacts";
const DELETED_KEYS_STORAGE_KEY = "sabi.messenger.custom_contacts.deleted_keys";

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeParse<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function readAllCustomContacts(): Promise<MessengerCustomContact[]> {
  try {
    const raw = await appStorage.getString(STORAGE_KEY);
    const parsed = safeParse<MessengerCustomContact[]>(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAllCustomContacts(items: MessengerCustomContact[]) {
  await appStorage.setString(STORAGE_KEY, JSON.stringify(items));
}

async function readDeletedKeys(): Promise<MessengerCustomContactDeletedKeys> {
  try {
    const raw = await appStorage.getString(DELETED_KEYS_STORAGE_KEY);
    const parsed = safeParse<MessengerCustomContactDeletedKeys>(raw, {
      ids: [],
      chatIds: [],
    });

    return {
      ids: Array.isArray(parsed.ids)
        ? parsed.ids.map((item) => String(item ?? "").trim()).filter(Boolean)
        : [],
      chatIds: Array.isArray(parsed.chatIds)
        ? parsed.chatIds.map((item) => String(item ?? "").trim()).filter(Boolean)
        : [],
    };
  } catch {
    return { ids: [], chatIds: [] };
  }
}

async function writeDeletedKeys(value: MessengerCustomContactDeletedKeys) {
  await appStorage.setString(DELETED_KEYS_STORAGE_KEY, JSON.stringify(value));
}

function uniqueStrings(items: Array<string | undefined | null>) {
  return Array.from(
    new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean)),
  );
}

function normalizePhone(value?: string | null) {
  return normalizeMessengerIdentityPhone(value);
}

function normalizeUsername(value?: string | null) {
  return normalizeMessengerIdentityUsername(value);
}

function normalizeKeyPart(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_+]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeDirectRoomIdentity(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_+@.-]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeStoredIdentity(value?: string | null) {
  return String(value ?? "").trim() || undefined;
}

function normalizeStoredOwnerUserId(value?: string | null) {
  return String(value ?? "").trim();
}

function getContactOwnerUserId(contact: Partial<MessengerCustomContact> & { ownerUserId?: string | null }) {
  return normalizeStoredOwnerUserId(contact.currentUserId) || normalizeStoredOwnerUserId(contact.ownerUserId);
}

function isSameContactOwner(
  contact: Partial<MessengerCustomContact> & { ownerUserId?: string | null },
  ownerUserId?: string | null,
) {
  const normalizedOwnerUserId = normalizeStoredOwnerUserId(ownerUserId);
  if (!normalizedOwnerUserId) return true;
  return getContactOwnerUserId(contact) === normalizedOwnerUserId;
}

function isSameWritableContactScope(
  left: Partial<MessengerCustomContact> & { ownerUserId?: string | null },
  right: Partial<MessengerCustomContact> & { ownerUserId?: string | null },
) {
  const leftOwnerUserId = getContactOwnerUserId(left);
  const rightOwnerUserId = getContactOwnerUserId(right);

  if (leftOwnerUserId || rightOwnerUserId) {
    return Boolean(leftOwnerUserId && rightOwnerUserId && leftOwnerUserId === rightOwnerUserId);
  }

  return true;
}

function filterWritableContactsForOwnerScope(
  contacts: MessengerCustomContact[],
  input: Partial<UpsertCustomMessengerContactArgs> & { ownerUserId?: string | null },
) {
  return contacts.filter((item) => isSameWritableContactScope(input, item));
}

function contactAliasKeys(input: Partial<UpsertCustomMessengerContactArgs> | MessengerCustomContact) {
  return buildMessengerContactAliasKeys({
    id: input.id,
    chatId: input.chatId,
    phone: input.phone,
    username: input.username,
    name: input.name,
    source: input.source,
    roomType: input.roomType,
    currentUserId: input.currentUserId,
    peerUserId: input.peerUserId,
  });
}

function contactsShareIdentity(
  left: Partial<UpsertCustomMessengerContactArgs> | MessengerCustomContact,
  right: Partial<UpsertCustomMessengerContactArgs> | MessengerCustomContact,
) {
  const leftKeys = new Set(contactAliasKeys(left));
  return contactAliasKeys(right).some((key) => leftKeys.has(key));
}

function getRemovalIdentity(target: RemoveCustomMessengerContactTarget) {
  if (typeof target === "string") {
    const normalized = String(target ?? "").trim();
    return {
      id: normalized,
      chatId: "",
      phone: "",
      username: "",
      currentUserId: "",
    };
  }

  return {
    id: String(target.id ?? "").trim(),
    chatId: String(target.chatId ?? "").trim(),
    phone: normalizePhone(target.phone),
    username: normalizeUsername(target.username),
    currentUserId: normalizeStoredOwnerUserId(target.currentUserId) || normalizeStoredOwnerUserId(target.ownerUserId),
  };
}

export function buildDirectMessengerChatId(args: BuildDirectMessengerChatIdArgs) {
  const currentUserId = normalizeDirectRoomIdentity(args.currentUserId);
  const peerUserId = normalizeDirectRoomIdentity(args.peerUserId);
  const fallback = String(args.fallback ?? "").trim();

  if (currentUserId && peerUserId && currentUserId !== peerUserId) {
    return `direct-${[currentUserId, peerUserId].sort().join("__")}`;
  }

  if (fallback) return fallback;
  if (peerUserId) return `direct-${peerUserId}`;
  if (currentUserId) return `direct-${currentUserId}`;

  return randomId("direct");
}

export function getAvatarLetter(name?: string | null, phone?: string | null) {
  const cleanedName = String(name ?? "")
    .trim()
    .replace(/^[^A-Za-zА-Яа-яЁё0-9]+/u, "");

  if (cleanedName) {
    return cleanedName.charAt(0).toUpperCase();
  }

  const digits = normalizePhone(phone);
  if (digits) {
    return digits.replace(/^\+/, "").charAt(0) || "S";
  }

  return "S";
}

export function buildChatId(args: BuildChatIdArgs) {
  const explicitId = String(args.id ?? "").trim();
  if (
    explicitId.startsWith("custom-") ||
    explicitId.startsWith("contact-") ||
    explicitId.startsWith("phone-") ||
    explicitId.startsWith("sabi-") ||
    explicitId.startsWith("direct-")
  ) {
    return explicitId;
  }

  const phone = normalizePhone(args.phone);
  const username = normalizeUsername(args.username);
  const name = normalizeKeyPart(args.name);

  const normalized =
    normalizeKeyPart(phone) ||
    normalizeKeyPart(username) ||
    name ||
    normalizeKeyPart(explicitId) ||
    randomId("contact");

  return `custom-${normalized}`;
}

export async function listCustomMessengerContacts(ownerUserId?: string | null) {
  const contacts = (await readAllCustomContacts()).sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
  );

  // SABI_OWNER_SCOPED_CUSTOM_CONTACTS:
  // Saved contacts are personal. Do not leak contacts saved by another user.
  // Legacy records without currentUserId/ownerUserId are hidden when ownerUserId is provided.
  const normalizedOwnerUserId = typeof ownerUserId === "string" ? ownerUserId.trim() : "";
  if (!normalizedOwnerUserId) {
    return contacts;
  }

  return contacts.filter((contact) => isSameContactOwner(contact, normalizedOwnerUserId));
}

export async function listDeletedCustomMessengerContactKeys() {
  return readDeletedKeys();
}

export async function getCustomMessengerContactById(id: string, ownerUserId?: string | null) {
  const normalized = String(id ?? "").trim();
  return (
    (await listCustomMessengerContacts(ownerUserId)).find((item) => item.id === normalized) ??
    null
  );
}

export async function upsertCustomMessengerContact(
  input: UpsertCustomMessengerContactArgs,
): Promise<MessengerCustomContact> {
  const name = String(input.name ?? "").trim();
  const phone = normalizePhone(input.phone);
  const username = normalizeUsername(input.username);

  if (!name) {
    throw new Error("Custom contact name is required.");
  }

  const existing = await readAllCustomContacts();
  const normalizedInputId = String(input.id ?? "").trim();
  const normalizedInputChatId = String(input.chatId ?? "").trim();
  const normalizedInputOwnerUserId = normalizeStoredOwnerUserId(input.currentUserId);
  const ownerScopedExisting = filterWritableContactsForOwnerScope(existing, input);

  const matched =
    ownerScopedExisting.find((item) => contactsShareIdentity(input, item)) ||
    (normalizedInputId
      ? ownerScopedExisting.find((item) => item.id === normalizedInputId) || null
      : null) ||
    (normalizedInputChatId
      ? ownerScopedExisting.find((item) => item.chatId === normalizedInputChatId) || null
      : null) ||
    (input.peerUserId
      ? ownerScopedExisting.find((item) => normalizeStoredIdentity(item.peerUserId) === normalizeStoredIdentity(input.peerUserId)) || null
      : null) ||
    (phone
      ? ownerScopedExisting.find((item) => normalizePhone(item.phone) === phone) || null
      : null) ||
    (username
      ? ownerScopedExisting.find((item) => normalizeUsername(item.username).toLowerCase() === username.toLowerCase()) || null
      : null);

  const canonicalId = buildMessengerCanonicalContactId({
    id: normalizedInputId,
    chatId: normalizedInputChatId,
    phone,
    username,
    name,
    source: input.source,
    roomType: input.roomType,
    currentUserId: input.currentUserId,
    peerUserId: input.peerUserId,
  });
  const fallbackIdentity =
    canonicalId || normalizedInputId || normalizedInputChatId || input.peerUserId || phone || username || name;
  const generatedId = canonicalId || `custom-${normalizeKeyPart(fallbackIdentity) || randomId("contact")}`;
  const nextId = matched?.id || (normalizedInputId.startsWith("custom-") ? normalizedInputId : generatedId);
  const chatId =
    normalizedInputChatId ||
    matched?.chatId ||
    buildChatId({
      id: nextId,
      phone,
      username,
      name,
    });

  const nextItem: MessengerCustomContact = {
    id: nextId,
    chatId,
    name,
    phone: phone || undefined,
    username: username || undefined,
    verified: Boolean(input.verified ?? matched?.verified),
    official: Boolean(input.official ?? matched?.official),
    avatarLetter:
      String(input.avatarLetter ?? "").trim() ||
      matched?.avatarLetter ||
      getAvatarLetter(name, phone),
    avatarUrl: normalizeStoredIdentity(input.avatarUrl) || matched?.avatarUrl,
    roomType: input.roomType ?? matched?.roomType ?? "direct",
    source: input.source ?? matched?.source ?? "custom",
    currentUserId:
      normalizeStoredIdentity(input.currentUserId) || matched?.currentUserId,
    peerUserId: normalizeStoredIdentity(input.peerUserId) || matched?.peerUserId,
    deviceContactId:
      normalizeStoredIdentity(input.deviceContactId) || matched?.deviceContactId,
    createdAt: matched?.createdAt || nowIso(),
    updatedAt: nowIso(),
  };

  const next = [
    nextItem,
    ...existing.filter((item) => {
      if (!isSameWritableContactScope(nextItem, item)) return true;
      if (item.id === nextItem.id) return false;
      if (item.chatId === nextItem.chatId) return false;
      return !contactsShareIdentity(nextItem, item);
    }),
  ].sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
  );

  await writeAllCustomContacts(next);

  const deleted = await readDeletedKeys();
  await writeDeletedKeys({
    ids: deleted.ids.filter((item) => item !== nextItem.id),
    chatIds: deleted.chatIds.filter((item) => item !== nextItem.chatId),
  });

  return nextItem;
}

export async function removeCustomMessengerContact(target: RemoveCustomMessengerContactTarget) {
  const identity = getRemovalIdentity(target);
  const hasAnyIdentity = Boolean(
    identity.id || identity.chatId || identity.phone || identity.username,
  );

  if (!hasAnyIdentity) return;

  const current = await readAllCustomContacts();
  const ownerScopedCurrent = identity.currentUserId
    ? current.filter((item) => isSameContactOwner(item, identity.currentUserId))
    : current.filter((item) => !getContactOwnerUserId(item));
  const matched =
    ownerScopedCurrent.find((item) => identity.id && item.id === identity.id) ||
    ownerScopedCurrent.find((item) => identity.chatId && item.chatId === identity.chatId) ||
    ownerScopedCurrent.find((item) => contactsShareIdentity(identity, item)) ||
    ownerScopedCurrent.find((item) => identity.phone && normalizePhone(item.phone) === identity.phone) ||
    ownerScopedCurrent.find((item) => identity.username && normalizeUsername(item.username).toLowerCase() === identity.username.toLowerCase()) ||
    null;

  const next = matched
    ? current.filter((item) => item.id !== matched.id)
    : current;

  if (matched) {
    await writeAllCustomContacts(next);
  }

  const deleted = await readDeletedKeys();
  await writeDeletedKeys({
    ids: uniqueStrings([
      ...deleted.ids,
      identity.id,
      matched?.id,
      identity.phone,
      identity.username,
    ]),
    chatIds: uniqueStrings([
      ...deleted.chatIds,
      identity.chatId,
      matched?.chatId,
    ]),
  });
}

export async function clearAllCustomMessengerContacts() {
  await writeAllCustomContacts([]);
  await writeDeletedKeys({ ids: [], chatIds: [] });
}
