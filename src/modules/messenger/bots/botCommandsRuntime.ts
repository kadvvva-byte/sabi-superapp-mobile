export type BotCommandItem = {
  id: string;
  botId: string;
  command: string;
  title: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrUpdateBotCommandInput = {
  id?: string;
  botId: string;
  command: string;
  title: string;
  description: string;
  enabled: boolean;
};

const BOT_COMMANDS_SEED: Record<string, BotCommandItem[]> = {
  "bot-sabi-assist": [
    {
      id: "cmd-sabi-assist-start",
      botId: "bot-sabi-assist",
      command: "/start",
      title: "Start",
      description: "Open the welcome flow and show the main help actions.",
      enabled: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cmd-sabi-assist-help",
      botId: "bot-sabi-assist",
      command: "/help",
      title: "Help",
      description: "Show available bot help and quick guidance.",
      enabled: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  "bot-sabi-market": [
    {
      id: "cmd-sabi-market-orders",
      botId: "bot-sabi-market",
      command: "/orders",
      title: "Orders",
      description: "Open order status and delivery tracking.",
      enabled: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

let BOT_COMMANDS_STORE: Record<string, BotCommandItem[]> = Object.fromEntries(
  Object.entries(BOT_COMMANDS_SEED).map(([botId, items]) => [
    botId,
    items.map((item) => ({ ...item })),
  ]),
);

function normalizeCommand(value?: string | null) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return raw ? `/${raw}` : "";
}

function cloneCommand(item: BotCommandItem): BotCommandItem {
  return { ...item };
}

function sortCommands(items: BotCommandItem[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function cloneCommands(items: BotCommandItem[]) {
  return sortCommands(items).map(cloneCommand);
}

function ensureBotBucket(botId: string) {
  if (!BOT_COMMANDS_STORE[botId]) {
    BOT_COMMANDS_STORE[botId] = [];
  }
  return BOT_COMMANDS_STORE[botId];
}

function makeCommandId(botId: string) {
  return `cmd-${botId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSortOrder(botId: string) {
  BOT_COMMANDS_STORE[botId] = sortCommands(ensureBotBucket(botId)).map((item, index) => ({
    ...item,
    sortOrder: index,
  }));
}

export async function listBotCommands(botId: string): Promise<BotCommandItem[]> {
  return cloneCommands(ensureBotBucket(botId));
}

export async function getBotCommandById(
  botId: string,
  commandId: string,
): Promise<BotCommandItem | null> {
  const found = ensureBotBucket(botId).find((item) => item.id === commandId);
  return found ? cloneCommand(found) : null;
}

export async function createOrUpdateBotCommand(
  input: CreateOrUpdateBotCommandInput,
): Promise<BotCommandItem> {
  const botId = String(input.botId ?? "").trim();
  const command = normalizeCommand(input.command);
  const title = String(input.title ?? "").trim();
  const description = String(input.description ?? "").trim();
  const now = new Date().toISOString();

  const bucket = ensureBotBucket(botId);

  const existingIndex = input.id
    ? bucket.findIndex((item) => item.id === input.id)
    : bucket.findIndex((item) => item.command === command);

  const nextItem: BotCommandItem = {
    id: existingIndex >= 0 ? bucket[existingIndex].id : makeCommandId(botId),
    botId,
    command,
    title,
    description,
    enabled: Boolean(input.enabled),
    sortOrder: existingIndex >= 0 ? bucket[existingIndex].sortOrder : bucket.length,
    createdAt: existingIndex >= 0 ? bucket[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    bucket[existingIndex] = nextItem;
  } else {
    bucket.push(nextItem);
  }

  normalizeSortOrder(botId);
  const saved = ensureBotBucket(botId).find((item) => item.id === nextItem.id)!;
  return cloneCommand(saved);
}

export async function deleteBotCommand(commandId: string): Promise<boolean> {
  for (const botId of Object.keys(BOT_COMMANDS_STORE)) {
    const bucket = ensureBotBucket(botId);
    const index = bucket.findIndex((item) => item.id === commandId);

    if (index >= 0) {
      bucket.splice(index, 1);
      normalizeSortOrder(botId);
      return true;
    }
  }

  return false;
}

export async function moveBotCommand(
  commandId: string,
  direction: "up" | "down",
): Promise<boolean> {
  for (const botId of Object.keys(BOT_COMMANDS_STORE)) {
    const bucket = sortCommands(ensureBotBucket(botId));
    const index = bucket.findIndex((item) => item.id === commandId);

    if (index < 0) continue;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bucket.length) {
      return false;
    }

    const reordered = [...bucket];
    const current = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = current;

    BOT_COMMANDS_STORE[botId] = reordered.map((item, order) => ({
      ...item,
      sortOrder: order,
      updatedAt: new Date().toISOString(),
    }));

    return true;
  }

  return false;
}

export async function setBotCommandEnabled(
  commandId: string,
  enabled: boolean,
): Promise<BotCommandItem | null> {
  for (const botId of Object.keys(BOT_COMMANDS_STORE)) {
    const bucket = ensureBotBucket(botId);
    const index = bucket.findIndex((item) => item.id === commandId);

    if (index >= 0) {
      bucket[index] = {
        ...bucket[index],
        enabled,
        updatedAt: new Date().toISOString(),
      };
      return cloneCommand(bucket[index]);
    }
  }

  return null;
}

export async function resetBotCommandsRuntime() {
  BOT_COMMANDS_STORE = Object.fromEntries(
    Object.entries(BOT_COMMANDS_SEED).map(([botId, items]) => [
      botId,
      items.map((item) => ({ ...item })),
    ]),
  );
}