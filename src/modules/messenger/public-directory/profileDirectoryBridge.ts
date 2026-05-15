import {
  syncSabiPublicDirectoryProfile,
  syncSabiPublicDirectoryProfilesBatch,
  type SabiPublicDirectoryItem,
  type SabiPublicDirectoryProfileSyncInput,
} from "./publicDirectoryClient";

type AnyRecord = Record<string, unknown>;

type SabiProfileDirectoryCollectionInput = {
  groups?: unknown[];
  channels?: unknown[];
  bots?: unknown[];
};

function readText(record: AnyRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function cleanUsername(value: string) {
  return value.trim().replace(/^@+/, "");
}

function slugFromName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function fallbackId(prefix: "group" | "channel" | "bot", record: AnyRecord, name: string) {
  const username = cleanUsername(readText(record, ["username", "handle"]));
  if (username) return `${prefix}:${username}`;

  const slug = slugFromName(name);
  if (slug) return `${prefix}:${slug}`;

  return `${prefix}:${Date.now()}`;
}

function hasGroupMediaPayload(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.length > 0 : value.trim() !== "[]";
    } catch {
      return value.trim() !== "[]";
    }
  }

  return false;
}

function pickGroupMediaPayload(primary: unknown, fallback: unknown): unknown {
  return hasGroupMediaPayload(primary) ? primary : fallback;
}

function normalizeGroupMediaPayload(value: unknown, kind: "photo" | "video") {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  return items
    .map((raw, index) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const uri = typeof item.uri === "string" ? item.uri.trim() : "";
      if (!uri) return null;

      return {
        ...item,
        id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `${kind}-${index}`,
        uri,
        mediaUri: typeof item.mediaUri === "string" && item.mediaUri.trim() ? item.mediaUri.trim() : uri,
        kind,
        type: kind,
      };
    })
    .filter(Boolean);
}

function asRecord(input: unknown): AnyRecord | null {
  return input && typeof input === "object" ? input as AnyRecord : null;
}

function readBoolean(record: AnyRecord, keys: string[], fallback = true) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const raw = value.trim().toLowerCase();
      if (["1", "true", "yes", "on", "public", "visible", "enabled"].includes(raw)) return true;
      if (["0", "false", "no", "off", "private", "hidden", "disabled"].includes(raw)) return false;
    }
  }

  return fallback;
}

function readVisibilityStatus(record: AnyRecord) {
  return readText(record, ["visibilityStatus", "visibility"]);
}

export function buildSabiProfileGroupPublicDirectoryPayload(input: unknown): SabiPublicDirectoryProfileSyncInput | null {
  const record = asRecord(input);
  if (!record) return null;

  const name = readText(record, ["groupName", "title", "name"]);
  if (!name) return null;

  const chatId =
    readText(record, ["linkedChatId", "chatId", "roomId"]) ||
    readText(record, ["groupId", "id"]) ||
    fallbackId("group", record, name);

  const publicationPhotos = normalizeGroupMediaPayload(pickGroupMediaPayload(record.publicationPhotos, record.publicPhotos), "photo");
  const publicationVideos = normalizeGroupMediaPayload(pickGroupMediaPayload(record.publicationVideos, record.publicVideos), "video");

  return {
    kind: "GROUP",
    id: chatId,
    chatId,
    roomId: chatId,
    groupId: chatId,
    title: name,
    name,
    groupName: name,
    username: cleanUsername(readText(record, ["username", "handle"])),
    description: readText(record, ["description", "subtitle", "bio"]),
    avatarUrl: readText(record, ["avatarUri", "avatarUrl", "photoUrl"]),
    photoUrl: readText(record, ["avatarUri", "avatarUrl", "photoUrl"]),
    coverUri: readText(record, ["coverUri", "coverUrl"]),
    coverUrl: readText(record, ["coverUrl", "coverUri"]),
    publicationPhotos,
    publicationVideos,
    publicPhotos: publicationPhotos,
    publicVideos: publicationVideos,
    likesCount: record.likesCount as number | string | null,
    publicGiftsCount: record.publicGiftsCount as number | string | null,
    inviteLink: readText(record, ["inviteLink"]),
    isPublic: readBoolean(record, ["isPublic", "public"], true),
    searchableInDirectory: readBoolean(record, ["searchableInDirectory", "visibleInDiscovery"], true),
    visibility: readVisibilityStatus(record),
    hidden: readBoolean(record, ["hidden", "isHidden"], false),
    isHidden: readBoolean(record, ["isHidden", "hidden"], false),
  };
}

export function buildSabiProfileChannelPublicDirectoryPayload(input: unknown): SabiPublicDirectoryProfileSyncInput | null {
  const record = asRecord(input);
  if (!record) return null;

  const name = readText(record, ["channelName", "title", "name"]);
  if (!name) return null;

  const chatId =
    readText(record, ["linkedChatId", "chatId", "roomId"]) ||
    readText(record, ["channelId", "id"]) ||
    fallbackId("channel", record, name);

  const publicationPhotos = normalizeGroupMediaPayload(pickGroupMediaPayload(record.publicationPhotos, record.publicPhotos), "photo");
  const publicationVideos = normalizeGroupMediaPayload(pickGroupMediaPayload(record.publicationVideos, record.publicVideos), "video");

  return {
    kind: "CHANNEL",
    id: chatId,
    chatId,
    roomId: chatId,
    channelId: chatId,
    title: name,
    name,
    channelName: name,
    username: cleanUsername(readText(record, ["username", "handle"])),
    description: readText(record, ["description", "subtitle", "bio"]),
    avatarUrl: readText(record, ["avatarUri", "avatarUrl", "photoUrl"]),
    photoUrl: readText(record, ["avatarUri", "avatarUrl", "photoUrl"]),
    coverUri: readText(record, ["coverUri", "coverUrl"]),
    coverUrl: readText(record, ["coverUrl", "coverUri"]),
    publicationPhotos,
    publicationVideos,
    publicPhotos: publicationPhotos,
    publicVideos: publicationVideos,
    likesCount: record.likesCount as number | string | null,
    publicGiftsCount: record.publicGiftsCount as number | string | null,
    inviteLink: readText(record, ["inviteLink"]),
    isPublic: readBoolean(record, ["isPublic", "public"], true),
    searchableInDirectory: readBoolean(record, ["searchableInDirectory", "visibleInDiscovery"], true),
    visibility: readVisibilityStatus(record),
    hidden: readBoolean(record, ["hidden", "isHidden"], false),
    isHidden: readBoolean(record, ["isHidden", "hidden"], false),
  };
}

export function buildSabiProfileBotPublicDirectoryPayload(input: unknown): SabiPublicDirectoryProfileSyncInput | null {
  const record = asRecord(input);
  if (!record) return null;

  const name = readText(record, ["botName", "title", "name"]);
  if (!name) return null;

  const botId =
    readText(record, ["botId", "id", "linkedBotId"]) ||
    fallbackId("bot", record, name);

  return {
    kind: "BOT",
    id: botId,
    botId,
    title: name,
    name,
    botName: name,
    username: cleanUsername(readText(record, ["username", "handle"])),
    description: readText(record, ["description", "subtitle", "bio"]),
    avatarUrl: readText(record, ["avatarUri", "avatarUrl", "photoUrl"]),
    photoUrl: readText(record, ["avatarUri", "avatarUrl", "photoUrl"]),
    webhookUrl: readText(record, ["webhookUrl", "endpointUrl"]),
    isPublic: readBoolean(record, ["isPublic", "public"], true),
    searchableInDirectory: readBoolean(record, ["searchableInDirectory", "visibleInDiscovery"], true),
    visibility: readVisibilityStatus(record),
    hidden: readBoolean(record, ["hidden", "isHidden"], false),
    isHidden: readBoolean(record, ["isHidden", "hidden"], false),
  };
}

export async function syncSabiProfileGroupToPublicDirectory(input: unknown) {
  const payload = buildSabiProfileGroupPublicDirectoryPayload(input);
  return payload ? syncSabiPublicDirectoryProfile(payload) : null;
}

export async function syncSabiProfileChannelToPublicDirectory(input: unknown) {
  const payload = buildSabiProfileChannelPublicDirectoryPayload(input);
  return payload ? syncSabiPublicDirectoryProfile(payload) : null;
}

export async function syncSabiProfileBotToPublicDirectory(input: unknown) {
  const payload = buildSabiProfileBotPublicDirectoryPayload(input);
  return payload ? syncSabiPublicDirectoryProfile(payload) : null;
}

export async function syncSabiProfileCollectionToPublicDirectory(
  input: SabiProfileDirectoryCollectionInput,
): Promise<SabiPublicDirectoryItem[]> {
  const payloads = [
    ...(input.groups ?? []).map(buildSabiProfileGroupPublicDirectoryPayload),
    ...(input.channels ?? []).map(buildSabiProfileChannelPublicDirectoryPayload),
    ...(input.bots ?? []).map(buildSabiProfileBotPublicDirectoryPayload),
  ].filter((item): item is SabiPublicDirectoryProfileSyncInput => Boolean(item));

  const kinds = [
    Array.isArray(input.groups) ? "GROUP" : null,
    Array.isArray(input.channels) ? "CHANNEL" : null,
    Array.isArray(input.bots) ? "BOT" : null,
  ].filter((kind): kind is "GROUP" | "CHANNEL" | "BOT" => Boolean(kind));

  if (!payloads.length && !kinds.length) return [];

  return syncSabiPublicDirectoryProfilesBatch(payloads, {
    replaceForOwner: true,
    source: "profile",
    kinds,
  });
}

export async function syncSabiProfileGroupsCollectionToPublicDirectory(groups: unknown[]) {
  return syncSabiProfileCollectionToPublicDirectory({ groups });
}

export async function syncSabiProfileChannelsCollectionToPublicDirectory(channels: unknown[]) {
  return syncSabiProfileCollectionToPublicDirectory({ channels });
}

export async function syncSabiProfileBotsCollectionToPublicDirectory(bots: unknown[]) {
  return syncSabiProfileCollectionToPublicDirectory({ bots });
}
