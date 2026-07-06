import React, { useMemo, useState } from "react";

import GiftCatalogSheet from "./GiftCatalogSheet";
import GiftSendConfirmSheet from "./GiftSendConfirmSheet";
import GiftWheelScreen from "./GiftWheelScreen";
import GiftFishingScreen from "./GiftFishingScreen";
import GiftInventoryScreen from "./GiftInventoryScreen";

import { GIFT_CATALOG_BY_ID } from "./giftCatalog";
import { GiftCatalogItem, GiftCatalogSection, GiftInventoryItem, GiftProgramScope } from "./giftTypes";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;

  sourceProgram?: GiftProgramScope;
  currentCoinBalance?: number;
  ownerUserId: string;
  receiverLabel?: string;
  creatorLabel?: string;

  inventoryItems?: GiftInventoryItem[];

  onClose: () => void;

  onConfirmDirectSend?: (gift: GiftCatalogItem) => void;
  onRewardWon?: (gift: GiftCatalogItem) => void;
  onOpenInventoryItem?: (item: GiftInventoryItem) => void;
};

type OverlayRoute =
  | "catalog"
  | "send_confirm"
  | "wheel"
  | "fishing"
  | "inventory"
  | "event_gifts";

export default function GiftCenterOverlay({
  visible,
  accent,
  accentSoft,
  sourceProgram = "messenger",
  currentCoinBalance = 0,
  ownerUserId,
  receiverLabel = "Recipient",
  creatorLabel = "Creator",
  inventoryItems = [],
  onClose,
  onConfirmDirectSend,
  onRewardWon,
  onOpenInventoryItem,
}: Props) {
  const [route, setRoute] = useState<OverlayRoute>("catalog");
  const [selectedGift, setSelectedGift] = useState<GiftCatalogItem | null>(null);

  const catalogById = useMemo(
    () => GIFT_CATALOG_BY_ID as Record<string, GiftCatalogItem>,
    [],
  );

  const resetAndClose = () => {
    setRoute("catalog");
    setSelectedGift(null);
    onClose();
  };

  const handleOpenSection = (section: GiftCatalogSection) => {
    switch (section) {
      case "shop":
        setRoute("catalog");
        return;
      case "wheel_of_fortune":
        setRoute("wheel");
        return;
      case "fishing":
        setRoute("fishing");
        return;
      case "inventory":
        setRoute("inventory");
        return;
      case "event_gifts":
        setRoute("event_gifts");
        return;
      default:
        setRoute("catalog");
    }
  };

  const handleSelectGift = (gift: GiftCatalogItem) => {
    setSelectedGift(gift);
    setRoute("send_confirm");
  };

  const handleBackToCatalog = () => {
    setRoute("catalog");
    setSelectedGift(null);
  };

  const handleConfirmDirectSend = (gift: GiftCatalogItem) => {
    onConfirmDirectSend?.(gift);
    setRoute("catalog");
    setSelectedGift(null);
  };

  const handleRewardWon = (gift: GiftCatalogItem) => {
    onRewardWon?.(gift);
  };

  return (
    <>
      <GiftCatalogSheet
        visible={visible && route === "catalog"}
        accent={accent}
        accentSoft={accentSoft}
        sourceProgram={sourceProgram}
        currentCoinBalance={currentCoinBalance}
        onClose={resetAndClose}
        onSelectGift={handleSelectGift}
        onOpenSection={handleOpenSection}
      />

      <GiftSendConfirmSheet
        visible={visible && route === "send_confirm"}
        accent={accent}
        accentSoft={accentSoft}
        gift={selectedGift}
        currentCoinBalance={currentCoinBalance}
        receiverLabel={sourceProgram === "stream" ? creatorLabel : receiverLabel}
        onClose={handleBackToCatalog}
        sendRuntimeEnabled={false}
        onConfirmSend={handleConfirmDirectSend}
      />

      <GiftWheelScreen
        visible={visible && route === "wheel"}
        accent={accent}
        accentSoft={accentSoft}
        currentCoinBalance={currentCoinBalance}
        sourceProgram={sourceProgram}
        ownerUserId={ownerUserId}
        onClose={handleBackToCatalog}
        onSpinComplete={(gift) => handleRewardWon(gift)}
      />

      <GiftFishingScreen
        visible={visible && route === "fishing"}
        accent={accent}
        accentSoft={accentSoft}
        currentCoinBalance={currentCoinBalance}
        sourceProgram={sourceProgram}
        ownerUserId={ownerUserId}
        onClose={handleBackToCatalog}
        onCatchComplete={(gift) => handleRewardWon(gift)}
      />

      <GiftInventoryScreen
        visible={visible && route === "inventory"}
        accent={accent}
        accentSoft={accentSoft}
        ownerUserId={ownerUserId}
        inventoryItems={inventoryItems}
        catalogById={catalogById}
        onClose={handleBackToCatalog}
        onSelectInventoryItem={onOpenInventoryItem}
      />

      <GiftCatalogSheet
        visible={visible && route === "event_gifts"}
        accent={accent}
        accentSoft={accentSoft}
        sourceProgram={sourceProgram}
        currentCoinBalance={currentCoinBalance}
        onClose={handleBackToCatalog}
        onSelectGift={handleSelectGift}
        onOpenSection={handleOpenSection}
      />
    </>
  );
}