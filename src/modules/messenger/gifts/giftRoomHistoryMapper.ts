import {
  GiftCatalogItem,
  GiftChatMessage,
  GiftInventoryItem,
  GiftRoomHistoryCardViewModel,
  GiftTransaction,
} from "./giftTypes";
import {
  buildGiftChatMessage,
  buildGiftRewardChatMessage,
  mapGiftChatMessageToRoomHistoryCard,
  sortGiftChatMessagesNewestFirst,
} from "./giftMessageBuilder";

export type GiftRoomHistoryRecord =
  | {
      kind: "transaction";
      transaction: GiftTransaction;
      gift: GiftCatalogItem;
    }
  | {
      kind: "inventory_reward";
      inventoryItem: GiftInventoryItem;
      gift: GiftCatalogItem;
      chatId: string;
      senderUserId: string;
      receiverUserId?: string | null;
    }
  | {
      kind: "chat_message";
      message: GiftChatMessage;
    };

export type MapGiftRoomHistoryParams = {
  records: GiftRoomHistoryRecord[];
  nowIso?: string;
};

export type GiftRoomHistoryGroup = {
  dateKey: string;
  items: GiftRoomHistoryCardViewModel[];
};

function toDateKey(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createRewardMessageFromInventory(params: {
  inventoryItem: GiftInventoryItem;
  gift: GiftCatalogItem;
  chatId: string;
  senderUserId: string;
  receiverUserId?: string | null;
}): GiftChatMessage {
  return buildGiftRewardChatMessage({
    chatId: params.chatId,
    senderUserId: params.senderUserId,
    receiverUserId: params.receiverUserId ?? null,
    gift: params.gift,
    inventoryId: params.inventoryItem.inventoryId,
    createdAt: params.inventoryItem.createdAt,
  });
}

export function mapGiftRecordToChatMessage(record: GiftRoomHistoryRecord): GiftChatMessage {
  switch (record.kind) {
    case "transaction":
      return buildGiftChatMessage({
        transaction: record.transaction,
        gift: record.gift,
        createdAt: record.transaction.completedAt ?? record.transaction.createdAt,
      });

    case "inventory_reward":
      return createRewardMessageFromInventory({
        inventoryItem: record.inventoryItem,
        gift: record.gift,
        chatId: record.chatId,
        senderUserId: record.senderUserId,
        receiverUserId: record.receiverUserId ?? null,
      });

    case "chat_message":
      return record.message;

    default: {
      const exhaustiveCheck: never = record;
      throw new Error(`Unsupported gift room history record: ${String(exhaustiveCheck)}`);
    }
  }
}

export function mapGiftRecordsToChatMessages(
  records: GiftRoomHistoryRecord[],
): GiftChatMessage[] {
  return records.map(mapGiftRecordToChatMessage);
}

export function mapGiftRecordsToRoomHistoryCards(
  params: MapGiftRoomHistoryParams,
): GiftRoomHistoryCardViewModel[] {
  const chatMessages = mapGiftRecordsToChatMessages(params.records);
  const sortedMessages = sortGiftChatMessagesNewestFirst(chatMessages);

  return sortedMessages.map(mapGiftChatMessageToRoomHistoryCard);
}

export function groupGiftRoomHistoryCardsByDay(
  items: GiftRoomHistoryCardViewModel[],
): GiftRoomHistoryGroup[] {
  const groups = new Map<string, GiftRoomHistoryCardViewModel[]>();

  items.forEach((item) => {
    const dateKey = toDateKey(item.visibleToRoomUntil);
    const current = groups.get(dateKey) ?? [];
    current.push(item);
    groups.set(dateKey, current);
  });

  return [...groups.entries()]
    .map(([dateKey, groupItems]) => ({
      dateKey,
      items: groupItems,
    }))
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
}

export function sortGiftRoomHistoryCardsNewestFirst(
  items: GiftRoomHistoryCardViewModel[],
): GiftRoomHistoryCardViewModel[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.visibleToRoomUntil).getTime();
    const bTime = new Date(b.visibleToRoomUntil).getTime();
    return bTime - aTime;
  });
}

export function filterGiftRoomHistoryCardsForUser(params: {
  items: GiftRoomHistoryCardViewModel[];
  userId: string;
  mode: "all" | "sent" | "received";
}): GiftRoomHistoryCardViewModel[] {
  const { items, userId, mode } = params;

  if (mode === "all") return items;

  if (mode === "sent") {
    return items.filter((item) => item.senderUserId === userId);
  }

  return items.filter((item) => item.receiverUserId === userId);
}

export function countGiftRoomHistoryCardsByTier(
  items: GiftRoomHistoryCardViewModel[],
): Record<GiftRoomHistoryCardViewModel["tier"], number> {
  return items.reduce(
    (acc, item) => {
      acc[item.tier] += 1;
      return acc;
    },
    {
      basic_3d: 0,
      visual_plus: 0,
      premium_audio: 0,
      near_fullscreen: 0,
      premium_fullscreen: 0,
      ultra_premium: 0,
    } as Record<GiftRoomHistoryCardViewModel["tier"], number>,
  );
}

export function countGiftRoomHistoryCardsByCategory(
  items: GiftRoomHistoryCardViewModel[],
): Record<GiftRoomHistoryCardViewModel["category"], number> {
  return items.reduce(
    (acc, item) => {
      acc[item.category] += 1;
      return acc;
    },
    {
      love_romance: 0,
      cars_moto: 0,
      power_weapon: 0,
      fantasy_myth: 0,
      divine: 0,
      luxury_status: 0,
      wealth_money: 0,
      animals: 0,
      space_epic: 0,
      seasonal_event: 0,
    } as Record<GiftRoomHistoryCardViewModel["category"], number>,
  );
}

export function sumGiftRoomHistoryCoins(
  items: GiftRoomHistoryCardViewModel[],
): number {
  return items.reduce((sum, item) => sum + item.priceCoin, 0);
}

export function getGiftRoomHistorySummary(items: GiftRoomHistoryCardViewModel[]) {
  return {
    totalItems: items.length,
    totalCoins: sumGiftRoomHistoryCoins(items),
    byTier: countGiftRoomHistoryCardsByTier(items),
    byCategory: countGiftRoomHistoryCardsByCategory(items),
  };
}