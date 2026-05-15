import { Gift } from "../types";

export type GiftRoomHistoryItem = {
  id: string;
  type: "gift";
  createdAt: number;
  senderName?: string;
  receiverName?: string;
  isOwn?: boolean;
  quantity: number;
  totalDiamonds: number;
  gift: Gift;
};

type Input = {
  id: string;
  gift: Gift;
  quantity: number;
  totalDiamonds: number;
  createdAt?: number;
  senderName?: string;
  receiverName?: string;
  isOwn?: boolean;
};

export function mapGiftToRoomHistory(input: Input): GiftRoomHistoryItem {
  return {
    id: input.id,
    type: "gift",
    createdAt: input.createdAt ?? Date.now(),
    senderName: input.senderName,
    receiverName: input.receiverName,
    isOwn: input.isOwn ?? false,
    quantity: input.quantity,
    totalDiamonds: input.totalDiamonds,
    gift: input.gift,
  };
}