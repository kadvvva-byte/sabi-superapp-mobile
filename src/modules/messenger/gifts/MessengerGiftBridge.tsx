import React, { useMemo, useState } from "react";

import GiftCenterOverlay from "./GiftCenterOverlay";
import { GiftHistoryCard } from "./GiftHistoryCard";

import { GIFT_CATALOG_BY_ID, getGiftById } from "./giftCatalog";
import {
  buildGiftChatMessage,
  buildGiftRewardChatMessage,
} from "./giftMessageBuilder";
import {
  appendGrantedReward,
  GiftInventoryCollection,
  grantWonGiftToInventory,
  mapGiftTransactionToBoughtInventory,
} from "./giftInventoryEngine";
import {
  createGiftTransaction,
  GiftReceiverRevenueState,
  GiftSenderWalletState,
} from "./giftTransactionEngine";
import {
  GiftCatalogItem,
  GiftChatMessage,
  GiftInventoryItem,
  GiftRoomHistoryCardViewModel,
  GiftSendRequest,
  UnifiedUserIdentity,
} from "./giftTypes";
import { mapGiftChatMessageToRoomHistoryCard } from "./giftMessageBuilder";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;

  chatId: string;
  ownerUserId: string;
  currentUserIdentity: UnifiedUserIdentity;
  peerUserIdentity: UnifiedUserIdentity;

  currentCoinBalance: number;
  receiverLabel?: string;

  inventoryItems?: GiftInventoryCollection;
  visibleRevenueBalance?: number;
  activeSpendableBalance?: number;

  onClose: () => void;

  onCoinBalanceChange?: (nextBalance: number) => void;
  onInventoryChange?: (nextInventory: GiftInventoryCollection) => void;
  onRevenueStateChange?: (nextState: GiftReceiverRevenueState) => void;
  onMessagesChange?: (nextMessages: GiftChatMessage[]) => void;

  existingMessages?: GiftChatMessage[];
};

export type MessengerGiftBridgeState = {
  senderWalletState: GiftSenderWalletState;
  receiverRevenueState: GiftReceiverRevenueState;
  inventoryItems: GiftInventoryCollection;
  messages: GiftChatMessage[];
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildDirectSendRequest(params: {
  chatId: string;
  currentUserIdentity: UnifiedUserIdentity;
  peerUserIdentity: UnifiedUserIdentity;
  giftId: string;
}): GiftSendRequest {
  return {
    requestId: createId("msg_gift_request"),
    sourceProgram: "messenger",
    sourceGameType: null,
    chatId: params.chatId,
    streamSessionId: null,
    senderUserId: params.currentUserIdentity.userId,
    receiverUserId: params.peerUserIdentity.userId,
    senderIdentity: params.currentUserIdentity,
    receiverIdentity: params.peerUserIdentity,
    giftId: params.giftId,
    clientCreatedAt: new Date().toISOString(),
    messageTextFallback: undefined,
  };
}

function buildInitialBridgeState(params: {
  ownerUserId: string;
  currentCoinBalance: number;
  visibleRevenueBalance?: number;
  activeSpendableBalance?: number;
  inventoryItems?: GiftInventoryCollection;
  existingMessages?: GiftChatMessage[];
}): MessengerGiftBridgeState {
  return {
    senderWalletState: {
      userId: params.ownerUserId,
      coinBalance: params.currentCoinBalance,
    },
    receiverRevenueState: {
      userId: params.ownerUserId,
      visibleRevenueBalance: params.visibleRevenueBalance ?? 0,
      activeSpendableBalance: params.activeSpendableBalance ?? 0,
    },
    inventoryItems: params.inventoryItems ?? [],
    messages: params.existingMessages ?? [],
  };
}

export function mapGiftMessagesToHistoryCards(
  messages: GiftChatMessage[],
): GiftRoomHistoryCardViewModel[] {
  return messages.map(mapGiftChatMessageToRoomHistoryCard);
}

export default function MessengerGiftBridge({
  visible,
  accent,
  accentSoft,
  chatId,
  ownerUserId,
  currentUserIdentity,
  peerUserIdentity,
  currentCoinBalance,
  receiverLabel = "Recipient",
  inventoryItems = [],
  visibleRevenueBalance = 0,
  activeSpendableBalance = 0,
  onClose,
  onCoinBalanceChange,
  onInventoryChange,
  onRevenueStateChange,
  onMessagesChange,
  existingMessages = [],
}: Props) {
  const [bridgeState, setBridgeState] = useState<MessengerGiftBridgeState>(() =>
    buildInitialBridgeState({
      ownerUserId,
      currentCoinBalance,
      visibleRevenueBalance,
      activeSpendableBalance,
      inventoryItems,
      existingMessages,
    }),
  );

  const catalogById = useMemo(
    () => GIFT_CATALOG_BY_ID as Record<string, GiftCatalogItem>,
    [],
  );

  const historyCards = useMemo(
    () => mapGiftMessagesToHistoryCards(bridgeState.messages),
    [bridgeState.messages],
  );

  const syncState = (nextState: MessengerGiftBridgeState) => {
    setBridgeState(nextState);
    onCoinBalanceChange?.(nextState.senderWalletState.coinBalance);
    onInventoryChange?.(nextState.inventoryItems);
    onRevenueStateChange?.(nextState.receiverRevenueState);
    onMessagesChange?.(nextState.messages);
  };

  const handleConfirmDirectSend = (gift: GiftCatalogItem) => {
    const sendRequest = buildDirectSendRequest({
      chatId,
      currentUserIdentity,
      peerUserIdentity,
      giftId: gift.id,
    });

    const result = createGiftTransaction({
      sendRequest,
      gift,
      senderWalletState: bridgeState.senderWalletState,
      receiverRevenueState: bridgeState.receiverRevenueState,
    });

    if (result.transaction.status !== "completed") {
      return;
    }

    const chatMessage = buildGiftChatMessage({
      transaction: result.transaction,
      gift,
    });

    const boughtInventoryItem = mapGiftTransactionToBoughtInventory({
      transaction: result.transaction,
      gift,
    });

    const nextInventory = [...bridgeState.inventoryItems, boughtInventoryItem];
    const nextMessages = [...bridgeState.messages, chatMessage];

    syncState({
      senderWalletState: result.senderWalletStateAfter,
      receiverRevenueState: result.receiverRevenueStateAfter,
      inventoryItems: nextInventory,
      messages: nextMessages,
    });
  };

  const handleRewardWon = (gift: GiftCatalogItem) => {
    const granted = grantWonGiftToInventory({
      ownerUserId,
      sourceRewardType: "wheel_of_fortune",
      sourceGameType: undefined,
      gift,
      sourceSpinId: createId("messenger_reward"),
    });

    const rewardMessage = buildGiftRewardChatMessage({
      chatId,
      senderUserId: ownerUserId,
      receiverUserId: null,
      gift,
      inventoryId: granted.inventoryItem.inventoryId,
      createdAt: granted.inventoryItem.createdAt,
    });

    const nextInventory = appendGrantedReward(bridgeState.inventoryItems, granted);
    const nextMessages = [...bridgeState.messages, rewardMessage];

    syncState({
      ...bridgeState,
      inventoryItems: nextInventory,
      messages: nextMessages,
    });
  };

  const handleOpenInventoryItem = (item: GiftInventoryItem) => {
    const gift = getGiftById(item.giftId) ?? catalogById[item.giftId];
    if (!gift) return;

    const rewardMessage = buildGiftRewardChatMessage({
      chatId,
      senderUserId: ownerUserId,
      receiverUserId: peerUserIdentity.userId,
      gift,
      inventoryId: item.inventoryId,
      createdAt: new Date().toISOString(),
    });

    const nextMessages = [...bridgeState.messages, rewardMessage];

    syncState({
      ...bridgeState,
      messages: nextMessages,
    });
  };

  return (
    <>
      <GiftCenterOverlay
        visible={visible}
        accent={accent}
        accentSoft={accentSoft}
        sourceProgram="messenger"
        currentCoinBalance={bridgeState.senderWalletState.coinBalance}
        ownerUserId={ownerUserId}
        receiverLabel={receiverLabel}
        inventoryItems={bridgeState.inventoryItems}
        onClose={onClose}
        onConfirmDirectSend={handleConfirmDirectSend}
        onRewardWon={handleRewardWon}
        onOpenInventoryItem={handleOpenInventoryItem}
      />
    </>
  );
}

export { GiftHistoryCard };