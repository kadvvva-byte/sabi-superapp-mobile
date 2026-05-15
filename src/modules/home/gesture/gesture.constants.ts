import { GestureScreenMap } from "./gesture.types";

export const GESTURE_SCREENS: GestureScreenMap = {
  home: { x: 0, y: 0 },
  messenger: { x: -1, y: 0 },
  wallet: { x: 1, y: 0 },
  marketplace: { x: 0, y: -1 },
  miniapps: { x: 0, y: 1 },
};

export const SWIPE_THRESHOLD = 60;