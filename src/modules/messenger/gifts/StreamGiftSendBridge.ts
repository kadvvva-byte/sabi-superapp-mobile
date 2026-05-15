import { getGiftById } from "../../messenger/gifts/giftCatalog";
import {
  buildGiftChatMessage,
  buildGiftRewardChatMessage,
} from "../../messenger/gifts/giftMessageBuilder";
import {
  buildReceiverRevenueStateFromRecords,
  createGiftTransaction,
  GiftReceiverRevenueState,
  GiftSenderWalletState,
  markRevenueRecordsReleasable,
  transferMonthlyReleasableRevenueToActiveBalance,
  validateGiftSendRequest,
} from "../../messenger/gifts/giftTransactionEngine";
import {
  appendGrantedReward,
  GiftInventoryCollection,
  grantWonGiftToInventory,
} from "../../messenger/gifts/giftInventoryEngine";
import {
  createGiftRewardEngineContext,
  resolveGiftReward,
} from "../../messenger/gifts/giftRewardEngine";
import {
  GiftBetMultiplier,
  GiftCatalogItem,
  GiftChatMessage,
  GiftFishingAttemptTransaction,
  GiftGameType,
  GiftInventoryItem,
  GiftProgramScope,
  GiftRevenueRecord,
  GiftSendRequest,
  GiftTransaction,
  GiftWheelSpinTransaction,
  UnifiedUserIdentity,
} from "../../messenger/gifts/giftTypes";
import {
  GIFT_FISHING_GAME_CONFIG,
  GIFT_WHEEL_OF_FORTUNE_CONFIG,
  getGiftGameEntryCostByType,
} from "../../messenger/gifts/giftGameConfigs";

export type StreamGiftBridgeState = {
  senderWalletState: GiftSenderWalletState;
  receiverRevenueState: GiftReceiverRevenueState;
  revenueRecords: GiftRevenueRecord[];
  inventoryItems: GiftInventoryCollection;
  chatMessages: GiftChatMessage[];
};

export type StreamDirectGiftSendParams = {
  chatId: string;
  streamSessionId: string;
  senderIdentity: UnifiedUserIdentity;
  receiverIdentity: UnifiedUserIdentity;
  giftId: string;
  senderWalletState: GiftSenderWalletState;
  receiverRevenueState: GiftReceiverRevenueState;
};

export type StreamDirectGiftSendResult = {
  transaction: GiftTransaction;
  revenueRecord?: GiftRevenueRecord;
  chatMessage?: GiftChatMessage;
  senderWalletStateAfter: GiftSenderWalletState;
  receiverRevenueStateAfter: GiftReceiverRevenueState;
};

export type StreamRewardGamePlayParams = {
  gameType: GiftGameType;
  streamSessionId: string;
  chatId?: string | null;
  ownerIdentity: UnifiedUserIdentity;
  senderWalletState: GiftSenderWalletState;
  inventoryItems: GiftInventoryCollection;
  betMultiplier?: GiftBetMultiplier;
};

export type StreamRewardGamePlayResult = {
  selectedGift: GiftCatalogItem;
  inventoryItem: GiftInventoryItem;
  senderWalletStateAfter: GiftSenderWalletState;
  inventoryItemsAfter: GiftInventoryCollection;
  rewardMessage?: GiftChatMessage;
  wheelSpinTransaction?: GiftWheelSpinTransaction;
  fishingAttemptTransaction?: GiftFishingAttemptTransaction;
};

export type StreamMonthlySettlementParams = {
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
  activeSpendableBalance?: number;
  nowIso?: string;
};

export type StreamMonthlySettlementResult = {
  updatedRevenueRecords: GiftRevenueRecord[];
  updatedReceiverState: GiftReceiverRevenueState;
  transferredNetAmount: number;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildBaseSendRequest(params: {
  chatId: string;
  streamSessionId: string;
  senderIdentity: UnifiedUserIdentity;
  receiverIdentity: UnifiedUserIdentity;
  giftId: string;
}): GiftSendRequest {
  return {
    requestId: createId("stream_gift_request"),
    sourceProgram: "stream",
    sourceGameType: null,
    chatId: params.chatId,
    streamSessionId: params.streamSessionId,
    senderUserId: params.senderIdentity.userId,
    receiverUserId: params.receiverIdentity.userId,
    senderIdentity: params.senderIdentity,
    receiverIdentity: params.receiverIdentity,
    giftId: params.giftId,
    clientCreatedAt: new Date().toISOString(),
    messageTextFallback: undefined,
  };
}

export function sendDirectGiftFromStream(
  params: StreamDirectGiftSendParams,
): StreamDirectGiftSendResult {
  const gift = getGiftById(params.giftId);

  const sendRequest = buildBaseSendRequest({
    chatId: params.chatId,
    streamSessionId: params.streamSessionId,
    senderIdentity: params.senderIdentity,
    receiverIdentity: params.receiverIdentity,
    giftId: params.giftId,
  });

  const validation = validateGiftSendRequest({
    sendRequest,
    gift,
    senderWalletState: params.senderWalletState,
  });

  if (!gift || !validation.canSend) {
    const failedResult = createGiftTransaction({
      sendRequest,
      gift:
        gift ??
        ({
          id: params.giftId,
          slug: "unknown-gift",
          title: "Unknown Gift",
          shortLabel: "Unknown Gift",
          category: "seasonal_event",
          tier: "basic_3d",
          rewardTier: "basic",
          priceCoin: 0,
          currency: "COIN",
          is3D: true,
          hasAudio: false,
          durationMinSec: 1.5,
          durationMaxSec: 2.5,
          playbackType: "inline_3d",
          previewAsset: "",
          animationAsset: "",
          availableIn: "both",
          isEventGift: false,
          lifecycle: "hidden",
          sortOrder: 0,
        } as GiftCatalogItem),
      senderWalletState: params.senderWalletState,
      receiverRevenueState: params.receiverRevenueState,
    });

    return {
      transaction: failedResult.transaction,
      revenueRecord: failedResult.revenueRecord,
      chatMessage: undefined,
      senderWalletStateAfter: failedResult.senderWalletStateAfter,
      receiverRevenueStateAfter: failedResult.receiverRevenueStateAfter,
    };
  }

  const txResult = createGiftTransaction({
    sendRequest,
    gift,
    senderWalletState: params.senderWalletState,
    receiverRevenueState: params.receiverRevenueState,
  });

  const chatMessage =
    txResult.transaction.status === "completed"
      ? buildGiftChatMessage({
          transaction: txResult.transaction,
          gift,
        })
      : undefined;

  return {
    transaction: txResult.transaction,
    revenueRecord: txResult.revenueRecord,
    chatMessage,
    senderWalletStateAfter: txResult.senderWalletStateAfter,
    receiverRevenueStateAfter: txResult.receiverRevenueStateAfter,
  };
}

function buildRewardGameGiftMessage(params: {
  chatId?: string | null;
  ownerUserId: string;
  inventoryItem: GiftInventoryItem;
  gift: GiftCatalogItem;
}): GiftChatMessage | undefined {
  if (!params.chatId) return undefined;

  return buildGiftRewardChatMessage({
    chatId: params.chatId,
    senderUserId: params.ownerUserId,
    receiverUserId: null,
    gift: params.gift,
    inventoryId: params.inventoryItem.inventoryId,
    createdAt: params.inventoryItem.createdAt,
  });
}

export function playRewardGameFromStream(
  params: StreamRewardGamePlayParams,
): StreamRewardGamePlayResult {
  const betMultiplier = params.betMultiplier ?? 1;
  const entryCost = getGiftGameEntryCostByType(params.gameType) * betMultiplier;

  if (params.senderWalletState.coinBalance < entryCost) {
    throw new Error("Not enough COIN for stream reward game.");
  }

  const context = createGiftRewardEngineContext({
    userId: params.ownerIdentity.userId,
    sourceProgram: "stream",
    betMultiplier,
  });

  const rewardResult = resolveGiftReward({
    context,
  });

  const senderWalletStateAfter: GiftSenderWalletState = {
    ...params.senderWalletState,
    coinBalance: params.senderWalletState.coinBalance - entryCost,
  };

  const sourceRewardType =
    params.gameType === "wheel_of_fortune"
      ? "wheel_of_fortune"
      : params.gameType === "fishing_game"
        ? "fishing_game"
        : params.gameType === "lucky_box"
          ? "lucky_box"
          : params.gameType === "card_flip"
            ? "card_flip"
            : "treasure_chest";

  const granted = grantWonGiftToInventory({
    ownerUserId: params.ownerIdentity.userId,
    sourceRewardType,
    sourceGameType: params.gameType,
    gift: rewardResult.selectedGift,
    sourceSpinId: createId("stream_reward_source"),
  });

  const inventoryItemsAfter = appendGrantedReward(params.inventoryItems, granted);

  const rewardMessage = buildRewardGameGiftMessage({
    chatId: params.chatId ?? null,
    ownerUserId: params.ownerIdentity.userId,
    inventoryItem: granted.inventoryItem,
    gift: rewardResult.selectedGift,
  });

  const wheelSpinTransaction =
    params.gameType === "wheel_of_fortune"
      ? {
          spinId: createId("stream_wheel_spin"),
          wheelId: GIFT_WHEEL_OF_FORTUNE_CONFIG.wheelId,
          userId: params.ownerIdentity.userId,
          sourceProgram: "stream" as GiftProgramScope,
          spinCostCoin: entryCost,
          currency: "COIN" as const,
          rewardGiftId: rewardResult.selectedGift.id,
          rewardGiftTier: rewardResult.selectedGift.tier,
          rewardTier: rewardResult.rewardTier,
          status: "completed" as const,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          failedAt: undefined,
        }
      : undefined;

  const fishingAttemptTransaction =
    params.gameType === "fishing_game"
      ? {
          attemptId: createId("stream_fishing_attempt"),
          gameId: GIFT_FISHING_GAME_CONFIG.gameId,
          userId: params.ownerIdentity.userId,
          sourceProgram: "stream" as GiftProgramScope,
          castCostCoin: entryCost,
          currency: "COIN" as const,
          rewardGiftId: rewardResult.selectedGift.id,
          rewardGiftTier: rewardResult.selectedGift.tier,
          rewardTier: rewardResult.rewardTier,
          status: "completed" as const,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          failedAt: undefined,
        }
      : undefined;

  return {
    selectedGift: rewardResult.selectedGift,
    inventoryItem: granted.inventoryItem,
    senderWalletStateAfter,
    inventoryItemsAfter,
    rewardMessage,
    wheelSpinTransaction,
    fishingAttemptTransaction,
  };
}

export function buildStreamGiftBridgeState(params: {
  senderWalletState: GiftSenderWalletState;
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
  inventoryItems: GiftInventoryCollection;
  activeSpendableBalance?: number;
  chatMessages?: GiftChatMessage[];
}): StreamGiftBridgeState {
  return {
    senderWalletState: params.senderWalletState,
    receiverRevenueState: buildReceiverRevenueStateFromRecords({
      receiverUserId: params.receiverUserId,
      revenueRecords: params.revenueRecords,
      activeSpendableBalance: params.activeSpendableBalance ?? 0,
    }),
    revenueRecords: params.revenueRecords,
    inventoryItems: params.inventoryItems,
    chatMessages: params.chatMessages ?? [],
  };
}

export function settleMonthlyGiftRevenueFromStream(
  params: StreamMonthlySettlementParams,
): StreamMonthlySettlementResult {
  const nowIso = params.nowIso ?? new Date().toISOString();

  const releasableRecords = markRevenueRecordsReleasable({
    revenueRecords: params.revenueRecords,
    nowIso,
  });

  const receiverState = buildReceiverRevenueStateFromRecords({
    receiverUserId: params.receiverUserId,
    revenueRecords: releasableRecords,
    activeSpendableBalance: params.activeSpendableBalance ?? 0,
  });

  const transferWindow = {
    userId: params.receiverUserId,
    monthKey: nowIso.slice(0, 7),
    isTransferAllowed: true,
    openedAt: nowIso,
    closedAt: undefined,
    transferCountUsed: 0,
    transferCountMax: 1 as const,
  };

  return transferMonthlyReleasableRevenueToActiveBalance({
    receiverState,
    revenueRecords: releasableRecords,
    transferWindow,
    nowIso,
  });
}