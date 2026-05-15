import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";

import MessengerGiftBridge from "./MessengerGiftBridge";
import { GiftHistoryCard } from "./GiftHistoryCard";
import {
  GiftChatMessage,
  GiftInventoryItem,
  GiftRoomHistoryCardViewModel,
  UnifiedUserIdentity,
} from "./giftTypes";
import { mapGiftMessagesToHistoryCards } from "./MessengerGiftBridge";

type Props = {
  /**
   * Управление открытием из Animated -> GIFT 3D PREMIUM
   */
  visible: boolean;

  /**
   * Chat room context
   */
  chatId: string;
  ownerUserId: string;
  currentUserIdentity: UnifiedUserIdentity;
  peerUserIdentity: UnifiedUserIdentity;

  /**
   * UI / theme
   */
  accent: string;
  accentSoft?: string;

  /**
   * Wallet / coin state snapshot
   */
  currentCoinBalance: number;
  visibleRevenueBalance?: number;
  activeSpendableBalance?: number;

  /**
   * Labels
   */
  receiverLabel?: string;

  /**
   * Existing room state
   */
  inventoryItems?: GiftInventoryItem[];
  existingMessages?: GiftChatMessage[];

  /**
   * Close overlay
   */
  onClose: () => void;

  /**
   * Sync results upward to current ChatRoomScreen state/store
   */
  onCoinBalanceChange?: (nextBalance: number) => void;
  onInventoryChange?: (nextInventory: GiftInventoryItem[]) => void;
  onMessagesChange?: (nextMessages: GiftChatMessage[]) => void;

  /**
   * Optional custom renderer placement toggle
   */
  renderHistoryInline?: boolean;
};

export type MessengerGiftChatAdapterState = {
  coinBalance: number;
  inventoryItems: GiftInventoryItem[];
  giftMessages: GiftChatMessage[];
  historyCards: GiftRoomHistoryCardViewModel[];
};

export function buildMessengerGiftChatAdapterState(params: {
  coinBalance: number;
  inventoryItems?: GiftInventoryItem[];
  giftMessages?: GiftChatMessage[];
}): MessengerGiftChatAdapterState {
  const giftMessages = params.giftMessages ?? [];

  return {
    coinBalance: params.coinBalance,
    inventoryItems: params.inventoryItems ?? [],
    giftMessages,
    historyCards: mapGiftMessagesToHistoryCards(giftMessages),
  };
}

export function mergeGiftMessagesIntoChatFeed<T extends { id: string }>(params: {
  existingFeed: T[];
  giftMessages: GiftChatMessage[];
  mapGiftMessageToFeedItem: (message: GiftChatMessage) => T;
}): T[] {
  const mappedGiftItems = params.giftMessages.map(params.mapGiftMessageToFeedItem);
  const deduped = new Map<string, T>();

  [...params.existingFeed, ...mappedGiftItems].forEach((item) => {
    deduped.set(item.id, item);
  });

  return [...deduped.values()];
}

export function mapGiftHistoryCardsFromMessages(
  messages: GiftChatMessage[],
): GiftRoomHistoryCardViewModel[] {
  return mapGiftMessagesToHistoryCards(messages);
}

export default function MessengerGiftChatAdapter({
  visible,
  chatId,
  ownerUserId,
  currentUserIdentity,
  peerUserIdentity,
  accent,
  accentSoft,
  currentCoinBalance,
  visibleRevenueBalance = 0,
  activeSpendableBalance = 0,
  receiverLabel = "Recipient",
  inventoryItems = [],
  existingMessages = [],
  onClose,
  onCoinBalanceChange,
  onInventoryChange,
  onMessagesChange,
  renderHistoryInline = false,
}: Props) {
  const [localCoinBalance, setLocalCoinBalance] = useState(currentCoinBalance);
  const [localInventory, setLocalInventory] = useState<GiftInventoryItem[]>(inventoryItems);
  const [localGiftMessages, setLocalGiftMessages] =
    useState<GiftChatMessage[]>(existingMessages);

  const historyCards = useMemo(
    () => mapGiftMessagesToHistoryCards(localGiftMessages),
    [localGiftMessages],
  );

  const handleCoinBalanceChange = (nextBalance: number) => {
    setLocalCoinBalance(nextBalance);
    onCoinBalanceChange?.(nextBalance);
  };

  const handleInventoryChange = (nextInventory: GiftInventoryItem[]) => {
    setLocalInventory(nextInventory);
    onInventoryChange?.(nextInventory);
  };

  const handleMessagesChange = (nextMessages: GiftChatMessage[]) => {
    setLocalGiftMessages(nextMessages);
    onMessagesChange?.(nextMessages);
  };

  return (
    <>
      <MessengerGiftBridge
        visible={visible}
        accent={accent}
        accentSoft={accentSoft}
        chatId={chatId}
        ownerUserId={ownerUserId}
        currentUserIdentity={currentUserIdentity}
        peerUserIdentity={peerUserIdentity}
        currentCoinBalance={localCoinBalance}
        receiverLabel={receiverLabel}
        inventoryItems={localInventory}
        visibleRevenueBalance={visibleRevenueBalance}
        activeSpendableBalance={activeSpendableBalance}
        existingMessages={localGiftMessages}
        onClose={onClose}
        onCoinBalanceChange={handleCoinBalanceChange}
        onInventoryChange={handleInventoryChange}
        onMessagesChange={handleMessagesChange}
      />

      {renderHistoryInline ? (
        <View style={styles.historyWrap}>
          {historyCards.map((item) => (
            <GiftHistoryCard
              key={item.messageId}
              item={item}
              accent={accent}
              isOwnMessage={item.senderUserId === ownerUserId}
              senderLabel={item.senderUserId === ownerUserId ? "You" : "Sender"}
              receiverLabel={
                item.receiverUserId === peerUserIdentity.userId ? receiverLabel : "Recipient"
              }
            />
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  historyWrap: {
    width: "100%",
  },
});