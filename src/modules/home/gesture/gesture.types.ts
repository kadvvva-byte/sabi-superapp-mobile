export type GestureScreenKey =
  | "home"
  | "messenger"
  | "wallet"
  | "marketplace"
  | "miniapps";

export type GesturePosition = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
};

export type GestureScreenMap = Record<GestureScreenKey, GesturePosition>;