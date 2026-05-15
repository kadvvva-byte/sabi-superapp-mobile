export type BotKind = "assistant" | "service" | "business";
export type BotStatus = "active" | "paused" | "draft";
export type FilterMode = "all" | "private";
export type BotModule = "market" | "delivery" | "store" | "support";

export type MessengerBot = {
  id: string;
  name: string;
  username: string;
  description: string;
  avatarLetter: string;
  kind: BotKind;
  verified: boolean;
  official: boolean;
  builtIn?: boolean;
  status: BotStatus;
  commandsCount: number;
  unread: number;
  preview: string;
  time: string;
  updatedAt: string;
  muted: boolean;
  pinned: boolean;
  hiddenFromMain: boolean;
  deleted: boolean;
  linkedModules: BotModule[];
};

export type CreateOrUpdateBotInput = {
  id?: string;
  name: string;
  username: string;
  description: string;
  kind: BotKind;
  commandsCount: number;
  verified: boolean;
  hiddenFromMain: boolean;
  linkedModules: BotModule[];
};

const BOT_SEED: MessengerBot[] = [];

let BOT_STORE: MessengerBot[] = [...BOT_SEED];

const DEFAULT_LINKED_MODULES: BotModule[] = ["market"];

function normalizeLinkedModules(
  modules?: readonly BotModule[] | null,
): BotModule[] {
  const unique = Array.from(new Set((modules ?? []).filter(Boolean))) as BotModule[];
  return unique.length ? unique : [...DEFAULT_LINKED_MODULES];
}


function normalizeHandle(value?: string | null) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return raw ? `@${raw}` : "";
}

function getAvatarLetter(name?: string | null) {
  const source = String(name ?? "").trim();
  const match = source.replace(/^[^A-Za-zА-Яа-я0-9]+/u, "").charAt(0);
  return String(match || "B").toUpperCase();
}

function makeId() {
  return `bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatClock(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function cloneBot(bot: MessengerBot): MessengerBot {
  return {
    ...bot,
    linkedModules: [...bot.linkedModules],
  };
}

function sortBots(items: MessengerBot[]) {
  return [...items].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.official && !b.official) return -1;
    if (!a.official && b.official) return 1;
    return String(b.updatedAt).localeCompare(String(a.updatedAt));
  });
}

export async function listMessengerBots(
  filterMode: FilterMode = "all",
): Promise<MessengerBot[]> {
  const visible = BOT_STORE.filter((item) => !item.deleted).filter((item) =>
    filterMode === "private" ? item.hiddenFromMain : !item.hiddenFromMain,
  );

  return sortBots(visible).map(cloneBot);
}

export async function listAllMessengerBots(): Promise<MessengerBot[]> {
  return sortBots(BOT_STORE.filter((item) => !item.deleted)).map(cloneBot);
}

export async function searchMessengerBots(query: string, filterMode: FilterMode = "all") {
  const normalized = query.trim().toLowerCase();
  const items = await listMessengerBots(filterMode);

  if (!normalized) return items;

  return items.filter((item) => {
    return (
      item.name.toLowerCase().includes(normalized) ||
      item.username.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized) ||
      item.linkedModules.some((module) => module.includes(normalized))
    );
  });
}

export async function getMessengerBotById(id: string): Promise<MessengerBot | null> {
  const found = BOT_STORE.find((item) => item.id === id && !item.deleted);
  return found ? cloneBot(found) : null;
}

export async function createOrUpdateMessengerBot(
  input: CreateOrUpdateBotInput,
): Promise<MessengerBot> {
  const now = new Date().toISOString();
  const normalizedUsername = normalizeHandle(input.username);
  const linkedModules = normalizeLinkedModules(input.linkedModules);

  const existingIndex = input.id
    ? BOT_STORE.findIndex((item) => item.id === input.id)
    : -1;

  const payload: MessengerBot = {
    id: input.id || makeId(),
    name: input.name.trim(),
    username: normalizedUsername,
    description: input.description.trim(),
    avatarLetter: getAvatarLetter(input.name),
    kind: input.kind,
    verified: input.verified,
    official: existingIndex >= 0 ? BOT_STORE[existingIndex].official : false,
    builtIn: existingIndex >= 0 ? BOT_STORE[existingIndex].builtIn : false,
    status: existingIndex >= 0 ? BOT_STORE[existingIndex].status : "active",
    commandsCount: Math.max(0, input.commandsCount),
    unread: existingIndex >= 0 ? BOT_STORE[existingIndex].unread : 0,
    preview:
      existingIndex >= 0
        ? BOT_STORE[existingIndex].preview
        : input.description.trim() || "Bot",
    time: formatClock(now),
    updatedAt: now,
    muted: existingIndex >= 0 ? BOT_STORE[existingIndex].muted : false,
    pinned: existingIndex >= 0 ? BOT_STORE[existingIndex].pinned : false,
    hiddenFromMain: input.hiddenFromMain,
    deleted: false,
    linkedModules,
  };

  if (existingIndex >= 0) {
    BOT_STORE[existingIndex] = {
      ...BOT_STORE[existingIndex],
      ...payload,
    };
    return cloneBot(BOT_STORE[existingIndex]);
  }

  BOT_STORE = [payload, ...BOT_STORE];
  return cloneBot(payload);
}

export async function patchMessengerBot(
  id: string,
  patch: Partial<MessengerBot>,
): Promise<MessengerBot | null> {
  const index = BOT_STORE.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const next: MessengerBot = {
    ...BOT_STORE[index],
    ...patch,
    linkedModules: patch.linkedModules
      ? normalizeLinkedModules(patch.linkedModules)
      : [...BOT_STORE[index].linkedModules],
    updatedAt: patch.updatedAt ?? BOT_STORE[index].updatedAt,
    time: patch.time ?? BOT_STORE[index].time,
  };

  BOT_STORE[index] = next;
  return cloneBot(next);
}

export async function setMessengerBotMuted(id: string, muted: boolean) {
  return patchMessengerBot(id, { muted });
}

export async function setMessengerBotPinned(id: string, pinned: boolean) {
  return patchMessengerBot(id, { pinned });
}

export async function setMessengerBotHiddenFromMain(
  id: string,
  hiddenFromMain: boolean,
) {
  return patchMessengerBot(id, { hiddenFromMain });
}

export async function setMessengerBotDeleted(id: string, deleted: boolean) {
  return patchMessengerBot(id, { deleted });
}

export async function setMessengerBotStatus(id: string, status: BotStatus) {
  return patchMessengerBot(id, {
    status,
    updatedAt: new Date().toISOString(),
    time: formatClock(),
  });
}

export async function setMessengerBotUnread(id: string, unread: number) {
  return patchMessengerBot(id, { unread: Math.max(0, unread) });
}

export async function incrementMessengerBotUnread(id: string, step = 1) {
  const found = BOT_STORE.find((item) => item.id === id);
  if (!found) return null;

  return patchMessengerBot(id, {
    unread: Math.max(0, found.unread + step),
  });
}

export async function setMessengerBotPreview(
  id: string,
  preview: string,
  updatedAt?: string,
) {
  const at = updatedAt || new Date().toISOString();
  return patchMessengerBot(id, {
    preview: preview.trim() || "",
    updatedAt: at,
    time: formatClock(at),
  });
}

export async function markMessengerBotRead(id: string) {
  return patchMessengerBot(id, { unread: 0 });
}

export async function markMessengerBotUnread(id: string, unread = 1) {
  return patchMessengerBot(id, { unread: Math.max(1, unread) });
}

export async function resetMessengerBotsRuntime() {
  BOT_STORE = [...BOT_SEED];
}