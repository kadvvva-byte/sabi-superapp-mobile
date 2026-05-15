import {
  setMessengerKernelError,
  setMessengerKernelRuntimeStatus,
  upsertMessengerKernelMessages,
  upsertMessengerKernelParticipants,
  upsertMessengerKernelRooms,
} from "../core/store";
import type { MessengerKernelMessageRecord } from "../core/types";
import { getMessengerKernelSession } from "../session/service";
import type {
  MessengerKernelDeleteMessageInput,
  MessengerKernelHydrateRoomGraphInput,
  MessengerKernelRuntimeConfig,
  MessengerKernelSendMessageInput,
  MessengerKernelUpdateMessageInput,
  MessengerKernelUploadMediaInput,
  MessengerKernelUploadMediaResult,
} from "./types";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Messenger kernel runtime error";
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeMessageRecord(value: unknown, fallbackChatId?: string | null): MessengerKernelMessageRecord | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const id = normalizeString(source.id) ?? normalizeString(source.messageId) ?? normalizeString(source.clientId);
  const chatId =
    normalizeString(source.chatId) ??
    normalizeString(source.roomId) ??
    normalizeString(fallbackChatId) ??
    null;
  if (!id || !chatId) return null;
  return {
    ...(source as MessengerKernelMessageRecord),
    id,
    chatId,
  };
}

function extractMessageCollection(value: unknown, fallbackChatId?: string | null): MessengerKernelMessageRecord[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeMessageRecord(item, fallbackChatId))
      .filter((item): item is MessengerKernelMessageRecord => Boolean(item));
  }
  const direct = normalizeMessageRecord(value, fallbackChatId);
  return direct ? [direct] : [];
}

function assertConfigured<T extends keyof MessengerKernelRuntimeConfig>(
  config: MessengerKernelRuntimeConfig,
  key: T,
): NonNullable<MessengerKernelRuntimeConfig[T]> {
  const handler = config[key];
  if (!handler) {
    throw new Error(`Messenger kernel runtime handler not configured: ${String(key)}`);
  }
  return handler as NonNullable<MessengerKernelRuntimeConfig[T]>;
}

export type MessengerKernelRuntime = {
  configure(config: MessengerKernelRuntimeConfig): void;
  getConfig(): MessengerKernelRuntimeConfig;
  hydrateRoomGraph(input: MessengerKernelHydrateRoomGraphInput): Promise<unknown>;
  sendMessage(input: MessengerKernelSendMessageInput): Promise<unknown>;
  updateMessage(input: MessengerKernelUpdateMessageInput): Promise<unknown>;
  deleteMessage(input: MessengerKernelDeleteMessageInput): Promise<unknown>;
  markMessageRead(messageId: string): Promise<unknown>;
  uploadMedia(input: MessengerKernelUploadMediaInput): Promise<MessengerKernelUploadMediaResult | unknown>;
};

export function createMessengerKernelRuntime(): MessengerKernelRuntime {
  let config: MessengerKernelRuntimeConfig = {};

  async function execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      setMessengerKernelRuntimeStatus("ready");
      return await fn();
    } catch (error) {
      setMessengerKernelRuntimeStatus("error");
      setMessengerKernelError(toErrorMessage(error));
      throw error;
    }
  }

  return {
    configure(nextConfig) {
      config = { ...nextConfig };
      setMessengerKernelRuntimeStatus("ready");
    },

    getConfig() {
      return { ...config };
    },

    async hydrateRoomGraph(input) {
      const session = getMessengerKernelSession();
      const handler = assertConfigured(config, "hydrateRoomGraph");
      return execute(async () => {
        const graph = await handler(input, { session });
        if (graph?.room) {
          upsertMessengerKernelRooms([
            {
              ...graph.room,
              id: normalizeString(graph.room.id) ?? input.chatId,
              messageIds: graph.room.messageIds ?? [],
              participantIds: graph.room.participantIds ?? [],
            },
          ]);
        }
        if (graph?.participants?.length) {
          upsertMessengerKernelParticipants(graph.participants);
        }
        if (graph?.messages?.length) {
          upsertMessengerKernelMessages(graph.messages);
        }
        return graph;
      });
    },

    async sendMessage(input) {
      const session = getMessengerKernelSession();
      const handler = assertConfigured(config, "sendMessage");
      return execute(async () => {
        const result = await handler(input, { session });
        const messages = extractMessageCollection(
          result && typeof result === "object" && "message" in (result as Record<string, unknown>)
            ? (result as Record<string, unknown>).message
            : result,
          input.chatId,
        );
        if (messages.length) {
          upsertMessengerKernelMessages(messages);
        }
        return result;
      });
    },

    async updateMessage(input) {
      const session = getMessengerKernelSession();
      const handler = assertConfigured(config, "updateMessage");
      return execute(async () => {
        const result = await handler(input, { session });
        const messages = extractMessageCollection(
          result && typeof result === "object" && "message" in (result as Record<string, unknown>)
            ? (result as Record<string, unknown>).message
            : result,
          normalizeString(input.chatId),
        );
        if (messages.length) {
          upsertMessengerKernelMessages(messages);
        }
        return result;
      });
    },

    async deleteMessage(input) {
      const session = getMessengerKernelSession();
      const handler = assertConfigured(config, "deleteMessage");
      return execute(async () => handler(input, { session }));
    },

    async markMessageRead(messageId) {
      const session = getMessengerKernelSession();
      const handler = assertConfigured(config, "markMessageRead");
      return execute(async () => handler(messageId, { session }));
    },

    async uploadMedia(input) {
      const session = getMessengerKernelSession();
      const handler = assertConfigured(config, "uploadMedia");
      return execute(async () => {
        const result = await handler(input, { session });
        return result as MessengerKernelUploadMediaResult | unknown;
      });
    },
  };
}