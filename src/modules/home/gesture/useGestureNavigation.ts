import { useMemo, useState } from "react";
import { GESTURE_SCREENS } from "./gesture.constants";
import { GestureScreenKey } from "./gesture.types";

export function useGestureNavigation() {
  const [activeScreen, setActiveScreen] = useState<GestureScreenKey>("home");

  const activePosition = useMemo(() => {
    return GESTURE_SCREENS[activeScreen];
  }, [activeScreen]);

  const moveLeft = () => {
    if (activeScreen === "home") setActiveScreen("wallet");
    else if (activeScreen === "messenger") setActiveScreen("home");
  };

  const moveRight = () => {
    if (activeScreen === "home") setActiveScreen("messenger");
    else if (activeScreen === "wallet") setActiveScreen("home");
  };

  const moveUp = () => {
    if (activeScreen === "home") setActiveScreen("marketplace");
    else if (activeScreen === "miniapps") setActiveScreen("home");
  };

  const moveDown = () => {
    if (activeScreen === "home") setActiveScreen("miniapps");
    else if (activeScreen === "marketplace") setActiveScreen("home");
  };

  const resetToHome = () => {
    setActiveScreen("home");
  };

  return {
    activeScreen,
    activePosition,
    setActiveScreen,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    resetToHome,
  };
}