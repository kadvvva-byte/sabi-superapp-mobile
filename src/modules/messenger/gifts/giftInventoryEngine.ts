import {
  GiftCatalogItem,
  GiftInventoryItem,
  GiftInventoryStatus,
  GiftOwnershipType,
  GiftProgramScope,
  GiftRewardGrantResult,
  GiftRewardSource,
  GiftTransaction,
} from "./giftTypes";
import { DEFAULT_GIFT_INVENTORY_EXPIRATION_DAYS } from "./giftTierRules";

export type GiftInventoryCollection = GiftInventoryItem[];

export type GiftInventoryCreateParams = {
  ownerUserId: string;
  ownershipType: GiftOwnershipType;

  sourceRewardType: GiftRewardSource;
  sourceGameType?: GiftInventoryItem["sourceGameType"];
  sourceTransactionId?: string | null;
  sourceSpinId?: string | null;

  gift: GiftCatalogItem;

  quantity?: number;
  createdAt?: string;
  expiresInDays?: number;
};

export type GiftInventoryUseParams = {
  inventoryId: string;
  usedAt?: string;
};

export type GiftInventoryExpireParams = {
  nowIso?: string;
};

export type GiftInventoryFilter = {
  ownerUserId?: string;
  status?: GiftInventoryStatus;
  ownershipType?: GiftOwnershipType;
  sourceRewardType?: GiftRewardSource;
  sourceProgram?: GiftProgramScope;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function addDaysToIso(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function isExpired(expiresAt: string, nowIso: string): boolean {
  const expiresTime = new Date(expiresAt).getTime();
  const nowTime = new Date(nowIso).getTime();

  if (Number.isNaN(expiresTime) || Number.isNaN(nowTime)) {
    return false;
  }

  return nowTime > expiresTime;
}

function isGiftAvailableInProgram(
  gift: GiftCatalogItem,
  sourceProgram?: GiftProgramScope,
): boolean {
  if (!sourceProgram) return true;
  return gift.availableIn === "both" || gift.availableIn === sourceProgram;
}

export function createInventoryItem(params: GiftInventoryCreateParams): GiftInventoryItem {
  const createdAt = params.createdAt ?? new Date().toISOString();
  const expiresInDays = params.expiresInDays ?? DEFAULT_GIFT_INVENTORY_EXPIRATION_DAYS;

  return {
    inventoryId: createId("gift_inventory"),
    ownerUserId: params.ownerUserId,
    ownershipType: params.ownershipType,
    sourceRewardType: params.sourceRewardType,
    sourceGameType: params.sourceGameType ?? null,
    sourceTransactionId: params.sourceTransactionId ?? null,
    sourceSpinId: params.sourceSpinId ?? null,
    giftId: params.gift.id,
    giftTitleSnapshot: params.gift.title,
    giftShortLabelSnapshot: params.gift.shortLabel,
    giftTierSnapshot: params.gift.tier,
    giftCategorySnapshot: params.gift.category,
    rewardTierSnapshot: params.gift.rewardTier,
    quantity: params.quantity ?? 1,
    createdAt,
    expiresAt: addDaysToIso(createdAt, expiresInDays),
    usedAt: undefined,
    status: "available",
  };
}

export function grantWonGiftToInventory(params: {
  ownerUserId: string;
  sourceRewardType: Exclude<GiftRewardSource, "direct_purchase">;
  sourceGameType?: GiftInventoryItem["sourceGameType"];
  gift: GiftCatalogItem;
  sourceTransactionId?: string | null;
  sourceSpinId?: string | null;
  createdAt?: string;
}): GiftRewardGrantResult {
  const inventoryItem = createInventoryItem({
    ownerUserId: params.ownerUserId,
    ownershipType: "won",
    sourceRewardType: params.sourceRewardType,
    sourceGameType: params.sourceGameType,
    sourceTransactionId: params.sourceTransactionId ?? null,
    sourceSpinId: params.sourceSpinId ?? null,
    gift: params.gift,
    quantity: 1,
    createdAt: params.createdAt,
    expiresInDays: DEFAULT_GIFT_INVENTORY_EXPIRATION_DAYS,
  });

  return {
    inventoryItem,
    rewardGiftId: params.gift.id,
    rewardTier: params.gift.rewardTier,
    grantedAt: inventoryItem.createdAt,
  };
}

export function grantBoughtGiftToInventory(params: {
  ownerUserId: string;
  gift: GiftCatalogItem;
  sourceTransactionId?: string | null;
  createdAt?: string;
}): GiftInventoryItem {
  return createInventoryItem({
    ownerUserId: params.ownerUserId,
    ownershipType: "bought",
    sourceRewardType: "direct_purchase",
    sourceTransactionId: params.sourceTransactionId ?? null,
    gift: params.gift,
    quantity: 1,
    createdAt: params.createdAt,
    expiresInDays: DEFAULT_GIFT_INVENTORY_EXPIRATION_DAYS,
  });
}

export function appendInventoryItem(
  current: GiftInventoryCollection,
  item: GiftInventoryItem,
): GiftInventoryCollection {
  return [...current, item];
}

export function appendGrantedReward(
  current: GiftInventoryCollection,
  result: GiftRewardGrantResult,
): GiftInventoryCollection {
  return appendInventoryItem(current, result.inventoryItem);
}

export function markInventoryItemUsed(
  current: GiftInventoryCollection,
  params: GiftInventoryUseParams,
): GiftInventoryCollection {
  const usedAt = params.usedAt ?? new Date().toISOString();

  return current.map((item) => {
    if (item.inventoryId !== params.inventoryId) return item;
    if (item.status !== "available") return item;

    return {
      ...item,
      status: "used",
      usedAt,
    };
  });
}

export function expireInventoryItems(
  current: GiftInventoryCollection,
  params?: GiftInventoryExpireParams,
): GiftInventoryCollection {
  const nowIso = params?.nowIso ?? new Date().toISOString();

  return current.map((item) => {
    if (item.status !== "available") return item;
    if (!isExpired(item.expiresAt, nowIso)) return item;

    return {
      ...item,
      status: "expired",
    };
  });
}

export function getInventoryByOwner(
  current: GiftInventoryCollection,
  ownerUserId: string,
): GiftInventoryItem[] {
  return current.filter((item) => item.ownerUserId === ownerUserId);
}

export function filterInventory(
  current: GiftInventoryCollection,
  filter: GiftInventoryFilter,
): GiftInventoryItem[] {
  return current.filter((item) => {
    if (filter.ownerUserId && item.ownerUserId !== filter.ownerUserId) return false;
    if (filter.status && item.status !== filter.status) return false;
    if (filter.ownershipType && item.ownershipType !== filter.ownershipType) return false;
    if (filter.sourceRewardType && item.sourceRewardType !== filter.sourceRewardType) {
      return false;
    }
    return true;
  });
}

export function getAvailableInventory(
  current: GiftInventoryCollection,
  ownerUserId: string,
): GiftInventoryItem[] {
  return filterInventory(current, {
    ownerUserId,
    status: "available",
  });
}

export function getUsedInventory(
  current: GiftInventoryCollection,
  ownerUserId: string,
): GiftInventoryItem[] {
  return filterInventory(current, {
    ownerUserId,
    status: "used",
  });
}

export function getExpiredInventory(
  current: GiftInventoryCollection,
  ownerUserId: string,
): GiftInventoryItem[] {
  return filterInventory(current, {
    ownerUserId,
    status: "expired",
  });
}

export function getWonInventory(
  current: GiftInventoryCollection,
  ownerUserId: string,
): GiftInventoryItem[] {
  return filterInventory(current, {
    ownerUserId,
    ownershipType: "won",
  });
}

export function getBoughtInventory(
  current: GiftInventoryCollection,
  ownerUserId: string,
): GiftInventoryItem[] {
  return filterInventory(current, {
    ownerUserId,
    ownershipType: "bought",
  });
}

export function getInventorySummary(
  current: GiftInventoryCollection,
  ownerUserId: string,
): {
  total: number;
  available: number;
  used: number;
  expired: number;
  won: number;
  bought: number;
} {
  const userItems = getInventoryByOwner(current, ownerUserId);

  return {
    total: userItems.length,
    available: userItems.filter((item) => item.status === "available").length,
    used: userItems.filter((item) => item.status === "used").length,
    expired: userItems.filter((item) => item.status === "expired").length,
    won: userItems.filter((item) => item.ownershipType === "won").length,
    bought: userItems.filter((item) => item.ownershipType === "bought").length,
  };
}

export function canUseInventoryItem(params: {
  inventoryItem: GiftInventoryItem | null | undefined;
  giftCatalogItem?: GiftCatalogItem | null;
  sourceProgram?: GiftProgramScope;
  nowIso?: string;
}): {
  canUse: boolean;
  reason?: "not_found" | "not_available" | "expired" | "program_mismatch";
} {
  const inventoryItem = params.inventoryItem;
  if (!inventoryItem) {
    return { canUse: false, reason: "not_found" };
  }

  if (inventoryItem.status !== "available") {
    return {
      canUse: false,
      reason: inventoryItem.status === "expired" ? "expired" : "not_available",
    };
  }

  const nowIso = params.nowIso ?? new Date().toISOString();
  if (isExpired(inventoryItem.expiresAt, nowIso)) {
    return { canUse: false, reason: "expired" };
  }

  if (
    params.giftCatalogItem &&
    !isGiftAvailableInProgram(params.giftCatalogItem, params.sourceProgram)
  ) {
    return { canUse: false, reason: "program_mismatch" };
  }

  return { canUse: true };
}

export function findInventoryItemById(
  current: GiftInventoryCollection,
  inventoryId: string,
): GiftInventoryItem | null {
  return current.find((item) => item.inventoryId === inventoryId) ?? null;
}

export function removeInventoryItem(
  current: GiftInventoryCollection,
  inventoryId: string,
): GiftInventoryCollection {
  return current.filter((item) => item.inventoryId !== inventoryId);
}

export function mapGiftTransactionToBoughtInventory(params: {
  transaction: GiftTransaction;
  gift: GiftCatalogItem;
}): GiftInventoryItem {
  return grantBoughtGiftToInventory({
    ownerUserId: params.transaction.senderUserId,
    gift: params.gift,
    sourceTransactionId: params.transaction.transactionId,
    createdAt: params.transaction.completedAt ?? params.transaction.createdAt,
  });
}

export function groupInventoryByStatus(
  current: GiftInventoryCollection,
  ownerUserId: string,
): Record<GiftInventoryStatus, GiftInventoryItem[]> {
  const userItems = getInventoryByOwner(current, ownerUserId);

  return {
    available: userItems.filter((item) => item.status === "available"),
    used: userItems.filter((item) => item.status === "used"),
    expired: userItems.filter((item) => item.status === "expired"),
  };
}

export function groupInventoryByOwnership(
  current: GiftInventoryCollection,
  ownerUserId: string,
): Record<GiftOwnershipType, GiftInventoryItem[]> {
  const userItems = getInventoryByOwner(current, ownerUserId);

  return {
    bought: userItems.filter((item) => item.ownershipType === "bought"),
    won: userItems.filter((item) => item.ownershipType === "won"),
  };
}

export function sortInventoryNewestFirst(
  items: GiftInventoryItem[],
): GiftInventoryItem[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
}

export function sortInventoryByExpirySoonest(
  items: GiftInventoryItem[],
): GiftInventoryItem[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.expiresAt).getTime();
    const bTime = new Date(b.expiresAt).getTime();
    return aTime - bTime;
  });
}