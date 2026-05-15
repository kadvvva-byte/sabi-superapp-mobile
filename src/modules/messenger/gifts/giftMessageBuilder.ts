import {
  GiftCatalogItem,
  GiftChatMessage,
  GiftRoomHistoryCardViewModel,
  GiftTransaction,
} from "./giftTypes";

export type BuildGiftChatMessageParams = {
  transaction: GiftTransaction;
  gift: GiftCatalogItem;
  visibleToRoomUntil?: string;
  createdAt?: string;
};

export type BuildGiftRewardMessageParams = {
  chatId: string;
  senderUserId: string;
  receiverUserId?: string | null;
  gift: GiftCatalogItem;
  inventoryId: string;
  visibleToRoomUntil?: string;
  createdAt?: string;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function endOfMonthIsoFrom(inputIso: string): string {
  const date = new Date(inputIso);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  return end.toISOString();
}

export function getGiftRoomVisibleUntil(createdAtIso: string): string {
  return endOfMonthIsoFrom(createdAtIso);
}

export function buildGiftChatMessage(
  params: BuildGiftChatMessageParams,
): GiftChatMessage {
  const createdAt = params.createdAt ?? params.transaction.completedAt ?? params.transaction.createdAt;
  const visibleToRoomUntil =
    params.visibleToRoomUntil ?? getGiftRoomVisibleUntil(createdAt);

  return {
    messageId: createId("gift_msg"),
    kind: "gift_record_card",
    chatId: params.transaction.chatId ?? "",
    transactionId: params.transaction.transactionId,
    inventoryId: null,
    senderUserId: params.transaction.senderUserId,
    receiverUserId: params.transaction.receiverUserId,
    giftId: params.gift.id,
    giftTitleSnapshot: params.transaction.giftTitleSnapshot,
    giftShortLabelSnapshot: params.transaction.giftShortLabelSnapshot,
    giftCategorySnapshot: params.transaction.giftCategorySnapshot,
    giftTierSnapshot: params.transaction.giftTierSnapshot,
    rewardTierSnapshot: params.transaction.rewardTierSnapshot,
    priceCoinSnapshot: params.transaction.grossCoinAmount,
    currency: params.transaction.currency,
    previewAsset: params.gift.previewAsset,
    roomVisibility: "room_visible_until_month_end",
    visibleToRoomUntil,
    isPinnedVisual: true,
    isReplayableForSender: true,
    isReplayableForReceiver: true,
    createdAt,
  };
}

export function buildGiftRewardChatMessage(
  params: BuildGiftRewardMessageParams,
): GiftChatMessage {
  const createdAt = params.createdAt ?? new Date().toISOString();
  const visibleToRoomUntil =
    params.visibleToRoomUntil ?? getGiftRoomVisibleUntil(createdAt);

  return {
    messageId: createId("gift_reward_msg"),
    kind: "gift_reward_card",
    chatId: params.chatId,
    transactionId: null,
    inventoryId: params.inventoryId,
    senderUserId: params.senderUserId,
    receiverUserId: params.receiverUserId ?? null,
    giftId: params.gift.id,
    giftTitleSnapshot: params.gift.title,
    giftShortLabelSnapshot: params.gift.shortLabel,
    giftCategorySnapshot: params.gift.category,
    giftTierSnapshot: params.gift.tier,
    rewardTierSnapshot: params.gift.rewardTier,
    priceCoinSnapshot: params.gift.priceCoin,
    currency: params.gift.currency,
    previewAsset: params.gift.previewAsset,
    roomVisibility: "room_visible_until_month_end",
    visibleToRoomUntil,
    isPinnedVisual: true,
    isReplayableForSender: true,
    isReplayableForReceiver: true,
    createdAt,
  };
}

export function mapGiftChatMessageToRoomHistoryCard(
  message: GiftChatMessage,
): GiftRoomHistoryCardViewModel {
  return {
    messageId: message.messageId,
    chatId: message.chatId,
    senderUserId: message.senderUserId,
    receiverUserId: message.receiverUserId ?? null,
    giftId: message.giftId,
    title: message.giftTitleSnapshot,
    shortLabel: message.giftShortLabelSnapshot,
    previewAsset: message.previewAsset,
    tier: message.giftTierSnapshot,
    category: message.giftCategorySnapshot,
    rewardTier: message.rewardTierSnapshot,
    priceCoin: message.priceCoinSnapshot,
    visibleToRoomUntil: message.visibleToRoomUntil,
    isReplayableForSender: message.isReplayableForSender,
    isReplayableForReceiver: message.isReplayableForReceiver,
  };
}

export function isGiftChatMessageVisibleToRoom(
  message: GiftChatMessage,
  nowIso = new Date().toISOString(),
): boolean {
  if (message.roomVisibility !== "room_visible_until_month_end") {
    return false;
  }

  const now = new Date(nowIso).getTime();
  const until = new Date(message.visibleToRoomUntil).getTime();

  if (Number.isNaN(now) || Number.isNaN(until)) {
    return false;
  }

  return now <= until;
}

export function archiveGiftChatMessage(message: GiftChatMessage): GiftChatMessage {
  return {
    ...message,
    roomVisibility: "archived",
    isPinnedVisual: false,
  };
}

export function archiveExpiredGiftChatMessages(
  messages: GiftChatMessage[],
  nowIso = new Date().toISOString(),
): GiftChatMessage[] {
  return messages.map((message) => {
    if (isGiftChatMessageVisibleToRoom(message, nowIso)) {
      return message;
    }

    if (message.roomVisibility === "archived") {
      return message;
    }

    return archiveGiftChatMessage(message);
  });
}

export function filterVisibleGiftChatMessages(
  messages: GiftChatMessage[],
  nowIso = new Date().toISOString(),
): GiftChatMessage[] {
  return messages.filter((message) => isGiftChatMessageVisibleToRoom(message, nowIso));
}

export function sortGiftChatMessagesNewestFirst(
  messages: GiftChatMessage[],
): GiftChatMessage[] {
  return [...messages].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
}

export function buildGiftRecordText(message: GiftChatMessage): string {
  return `${message.giftTitleSnapshot} • ${message.priceCoinSnapshot} ${message.currency}`;
}