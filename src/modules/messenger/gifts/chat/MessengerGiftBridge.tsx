import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { GiftPlaybackQueue } from "../playback/GiftPlaybackQueue";
import { Gift } from "../types";
import {
  GiftRoomHistoryItem,
  mapGiftToRoomHistory,
} from "./giftRoomHistoryMapper";

type SendGiftArgs = {
  gift: Gift;
  quantity: number;
  senderName?: string;
  receiverName?: string;
  isOwn?: boolean;
};

type MessengerGiftBridgeContextValue = {
  history: GiftRoomHistoryItem[];
  sendGift: (args: SendGiftArgs) => GiftRoomHistoryItem;
  replayGift: (item: GiftRoomHistoryItem) => void;
  clearGiftHistory: () => void;
};

const MessengerGiftBridgeContext =
  createContext<MessengerGiftBridgeContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function MessengerGiftBridgeProvider({ children }: Props) {
  const [history, setHistory] = useState<GiftRoomHistoryItem[]>([]);

  const sendGift = useCallback((args: SendGiftArgs) => {
    const totalDiamonds = args.gift.price.diamonds * args.quantity;

    const entry = mapGiftToRoomHistory({
      id: `${args.gift.id}_${Date.now()}`,
      gift: args.gift,
      quantity: args.quantity,
      totalDiamonds,
      createdAt: Date.now(),
      senderName: args.senderName,
      receiverName: args.receiverName,
      isOwn: args.isOwn,
    });

    setHistory((prev) => [...prev, entry]);

    GiftPlaybackQueue.enqueue({
      id: entry.id,
      gift: entry.gift,
      quantity: entry.quantity,
      totalDiamonds: entry.totalDiamonds,
      senderName: entry.senderName,
      receiverName: entry.receiverName,
      createdAt: entry.createdAt,
    });

    return entry;
  }, []);

  const replayGift = useCallback((item: GiftRoomHistoryItem) => {
    GiftPlaybackQueue.enqueue({
      id: `${item.id}_replay_${Date.now()}`,
      gift: item.gift,
      quantity: item.quantity,
      totalDiamonds: item.totalDiamonds,
      senderName: item.senderName,
      receiverName: item.receiverName,
      createdAt: Date.now(),
    });
  }, []);

  const clearGiftHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const value = useMemo<MessengerGiftBridgeContextValue>(
    () => ({
      history,
      sendGift,
      replayGift,
      clearGiftHistory,
    }),
    [history, sendGift, replayGift, clearGiftHistory]
  );

  return (
    <MessengerGiftBridgeContext.Provider value={value}>
      {children}
    </MessengerGiftBridgeContext.Provider>
  );
}

export function useMessengerGiftBridge() {
  const context = useContext(MessengerGiftBridgeContext);

  if (!context) {
    throw new Error(
      "useMessengerGiftBridge must be used inside MessengerGiftBridgeProvider"
    );
  }

  return context;
}