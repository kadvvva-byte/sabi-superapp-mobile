export type GiftTier = "t1" | "t2" | "t3" | "t4" | "t5";

export type GiftCategory =
  | "love"
  | "birthday"
  | "dragon"
  | "angel"
  | "cosmos"
  | "wedding"
  | "new_year"
  | "womens_day"
  | "ramadan"
  | "holi";

export type Gift = {
  id: string;
  name: string;
  category: GiftCategory;
  tier: GiftTier;
  price: {
    diamonds: number;
  };
  assets: {
    icon: string;
    animation?: string;
    preview?: string;
  };
  audio?: {
    src: string;
    duration: number;
  };
  tags?: string[];
};

export type GiftPlaybackItem = {
  id: string;
  gift: Gift;
  quantity: number;
  totalDiamonds: number;
  senderName?: string;
  receiverName?: string;
  createdAt: number;
};

export type GiftPlaybackMode = "inline" | "overlay";