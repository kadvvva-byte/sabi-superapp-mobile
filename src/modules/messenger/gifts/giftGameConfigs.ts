import {
  GiftCatalogItem,
  GiftFishingGameConfig,
  GiftFishingRewardPoolItem,
  GiftGameType,
  GiftProgramScope,
  GiftWheelConfig,
  GiftWheelSlot,
} from "./giftTypes";
import {
  getBasicRewardPool,
  getFixed20RewardPool,
  getMediumRewardPool,
  getPremiumRewardPool,
} from "./giftCatalog";

const DEFAULT_SOURCE_PROGRAM: GiftProgramScope = "both";
const DEFAULT_ENTRY_COST_COIN = 10;
const DEFAULT_PROBABILITY_PROFILE_ID = "default_gift_game_profile";

function pickFirstGiftId(pool: GiftCatalogItem[], fallbackId: string): string {
  return pool[0]?.id ?? fallbackId;
}

function pickPoolIds(pool: GiftCatalogItem[], count: number): string[] {
  return pool.slice(0, count).map((item) => item.id);
}

function buildWheelSlots(): GiftWheelSlot[] {
  const basicPool = getBasicRewardPool();
  const fixed20Pool = getFixed20RewardPool();
  const mediumPool = getMediumRewardPool();
  const premiumPool = getPremiumRewardPool();

  const basicIds = pickPoolIds(basicPool, 7);

  const slots: GiftWheelSlot[] = [
    {
      slotId: "wheel_slot_premium_01",
      giftId: pickFirstGiftId(premiumPool, "gift_archangel_3d"),
      rewardTier: "premium",
      weight: 1,
    },
    {
      slotId: "wheel_slot_medium_01",
      giftId: pickFirstGiftId(mediumPool, "gift_supercar_drive_3d"),
      rewardTier: "medium",
      weight: 4,
    },
    {
      slotId: "wheel_slot_fixed20_01",
      giftId: pickFirstGiftId(fixed20Pool, "gift_classic_ring_3d"),
      rewardTier: "fixed_20",
      weight: 10,
    },
  ];

  basicIds.forEach((giftId, index) => {
    slots.push({
      slotId: `wheel_slot_basic_${index + 1}`,
      giftId,
      rewardTier: "basic",
      weight: 85,
    });
  });

  return slots;
}

function buildFishingRewardPool(): GiftFishingRewardPoolItem[] {
  const basicPool = getBasicRewardPool();
  const fixed20Pool = getFixed20RewardPool();
  const mediumPool = getMediumRewardPool();
  const premiumPool = getPremiumRewardPool();

  const rewardPool: GiftFishingRewardPoolItem[] = [];

  pickPoolIds(basicPool, 7).forEach((giftId, index) => {
    rewardPool.push({
      poolItemId: `fishing_basic_${index + 1}`,
      giftId,
      rewardTier: "basic",
      weight: 85,
    });
  });

  rewardPool.push({
    poolItemId: "fishing_fixed20_01",
    giftId: pickFirstGiftId(fixed20Pool, "gift_classic_ring_3d"),
    rewardTier: "fixed_20",
    weight: 10,
  });

  rewardPool.push({
    poolItemId: "fishing_medium_01",
    giftId: pickFirstGiftId(mediumPool, "gift_supercar_drive_3d"),
    rewardTier: "medium",
    weight: 4,
  });

  rewardPool.push({
    poolItemId: "fishing_premium_01",
    giftId: pickFirstGiftId(premiumPool, "gift_archangel_3d"),
    rewardTier: "premium",
    weight: 1,
  });

  return rewardPool;
}

function buildLuckyBoxRewardPool(): GiftFishingRewardPoolItem[] {
  const basicPool = getBasicRewardPool();
  const fixed20Pool = getFixed20RewardPool();
  const mediumPool = getMediumRewardPool();
  const premiumPool = getPremiumRewardPool();

  return [
    ...pickPoolIds(basicPool, 6).map((giftId, index) => ({
      poolItemId: `lucky_box_basic_${index + 1}`,
      giftId,
      rewardTier: "basic" as const,
      weight: 85,
    })),
    {
      poolItemId: "lucky_box_fixed20_01",
      giftId: pickFirstGiftId(fixed20Pool, "gift_classic_ring_3d"),
      rewardTier: "fixed_20",
      weight: 10,
    },
    {
      poolItemId: "lucky_box_medium_01",
      giftId: pickFirstGiftId(mediumPool, "gift_supercar_drive_3d"),
      rewardTier: "medium",
      weight: 4,
    },
    {
      poolItemId: "lucky_box_premium_01",
      giftId: pickFirstGiftId(premiumPool, "gift_archangel_3d"),
      rewardTier: "premium",
      weight: 1,
    },
  ];
}

function buildCardFlipRewardPool(): GiftFishingRewardPoolItem[] {
  const basicPool = getBasicRewardPool();
  const fixed20Pool = getFixed20RewardPool();
  const mediumPool = getMediumRewardPool();
  const premiumPool = getPremiumRewardPool();

  return [
    ...pickPoolIds(basicPool, 6).map((giftId, index) => ({
      poolItemId: `card_flip_basic_${index + 1}`,
      giftId,
      rewardTier: "basic" as const,
      weight: 85,
    })),
    {
      poolItemId: "card_flip_fixed20_01",
      giftId: pickFirstGiftId(fixed20Pool, "gift_classic_ring_3d"),
      rewardTier: "fixed_20",
      weight: 10,
    },
    {
      poolItemId: "card_flip_medium_01",
      giftId: pickFirstGiftId(mediumPool, "gift_supercar_drive_3d"),
      rewardTier: "medium",
      weight: 4,
    },
    {
      poolItemId: "card_flip_premium_01",
      giftId: pickFirstGiftId(premiumPool, "gift_archangel_3d"),
      rewardTier: "premium",
      weight: 1,
    },
  ];
}

function buildTreasureChestRewardPool(): GiftFishingRewardPoolItem[] {
  const basicPool = getBasicRewardPool();
  const fixed20Pool = getFixed20RewardPool();
  const mediumPool = getMediumRewardPool();
  const premiumPool = getPremiumRewardPool();

  return [
    ...pickPoolIds(basicPool, 7).map((giftId, index) => ({
      poolItemId: `treasure_basic_${index + 1}`,
      giftId,
      rewardTier: "basic" as const,
      weight: 85,
    })),
    {
      poolItemId: "treasure_fixed20_01",
      giftId: pickFirstGiftId(fixed20Pool, "gift_classic_ring_3d"),
      rewardTier: "fixed_20",
      weight: 10,
    },
    {
      poolItemId: "treasure_medium_01",
      giftId: pickFirstGiftId(mediumPool, "gift_supercar_drive_3d"),
      rewardTier: "medium",
      weight: 4,
    },
    {
      poolItemId: "treasure_premium_01",
      giftId: pickFirstGiftId(premiumPool, "gift_archangel_3d"),
      rewardTier: "premium",
      weight: 1,
    },
  ];
}

export const GIFT_WHEEL_OF_FORTUNE_CONFIG: GiftWheelConfig = {
  wheelId: "gift_wheel_of_fortune_main",
  title: "Wheel of Fortune",
  sourceProgram: DEFAULT_SOURCE_PROGRAM,
  isActive: true,
  spinCostCoin: DEFAULT_ENTRY_COST_COIN,
  currency: "COIN",
  slots: buildWheelSlots(),
  probabilityProfileId: DEFAULT_PROBABILITY_PROFILE_ID,
  createdAt: "2026-03-29T00:00:00.000Z",
  updatedAt: "2026-03-29T00:00:00.000Z",
};

export const GIFT_FISHING_GAME_CONFIG: GiftFishingGameConfig = {
  gameId: "gift_fishing_game_main",
  title: "Fishing",
  sourceProgram: DEFAULT_SOURCE_PROGRAM,
  isActive: true,
  castCostCoin: DEFAULT_ENTRY_COST_COIN,
  currency: "COIN",
  probabilityProfileId: DEFAULT_PROBABILITY_PROFILE_ID,
  rewardPool: buildFishingRewardPool(),
  createdAt: "2026-03-29T00:00:00.000Z",
  updatedAt: "2026-03-29T00:00:00.000Z",
};

export const GIFT_LUCKY_BOX_CONFIG: GiftFishingGameConfig = {
  gameId: "gift_lucky_box_main",
  title: "Lucky Box",
  sourceProgram: DEFAULT_SOURCE_PROGRAM,
  isActive: true,
  castCostCoin: DEFAULT_ENTRY_COST_COIN,
  currency: "COIN",
  probabilityProfileId: DEFAULT_PROBABILITY_PROFILE_ID,
  rewardPool: buildLuckyBoxRewardPool(),
  createdAt: "2026-03-29T00:00:00.000Z",
  updatedAt: "2026-03-29T00:00:00.000Z",
};

export const GIFT_CARD_FLIP_CONFIG: GiftFishingGameConfig = {
  gameId: "gift_card_flip_main",
  title: "Card Flip",
  sourceProgram: DEFAULT_SOURCE_PROGRAM,
  isActive: true,
  castCostCoin: DEFAULT_ENTRY_COST_COIN,
  currency: "COIN",
  probabilityProfileId: DEFAULT_PROBABILITY_PROFILE_ID,
  rewardPool: buildCardFlipRewardPool(),
  createdAt: "2026-03-29T00:00:00.000Z",
  updatedAt: "2026-03-29T00:00:00.000Z",
};

export const GIFT_TREASURE_CHEST_CONFIG: GiftFishingGameConfig = {
  gameId: "gift_treasure_chest_main",
  title: "Treasure Chest",
  sourceProgram: DEFAULT_SOURCE_PROGRAM,
  isActive: true,
  castCostCoin: DEFAULT_ENTRY_COST_COIN,
  currency: "COIN",
  probabilityProfileId: DEFAULT_PROBABILITY_PROFILE_ID,
  rewardPool: buildTreasureChestRewardPool(),
  createdAt: "2026-03-29T00:00:00.000Z",
  updatedAt: "2026-03-29T00:00:00.000Z",
};

export const GIFT_GAME_TYPE_ORDER: readonly GiftGameType[] = [
  "wheel_of_fortune",
  "fishing_game",
  "lucky_box",
  "card_flip",
  "treasure_chest",
] as const;

export const GIFT_GAME_CONFIGS_BY_TYPE: Readonly<Record<GiftGameType, GiftWheelConfig | GiftFishingGameConfig>> =
  Object.freeze({
    wheel_of_fortune: GIFT_WHEEL_OF_FORTUNE_CONFIG,
    fishing_game: GIFT_FISHING_GAME_CONFIG,
    lucky_box: GIFT_LUCKY_BOX_CONFIG,
    card_flip: GIFT_CARD_FLIP_CONFIG,
    treasure_chest: GIFT_TREASURE_CHEST_CONFIG,
  });

export function getGiftGameConfigByType(
  gameType: GiftGameType,
): GiftWheelConfig | GiftFishingGameConfig {
  const config = GIFT_GAME_CONFIGS_BY_TYPE[gameType];
  if (!config) {
    throw new Error(`Unknown gift game config type: ${gameType}`);
  }
  return config;
}

export function getActiveGiftGameConfigs(
  sourceProgram: GiftProgramScope = "both",
): Array<GiftWheelConfig | GiftFishingGameConfig> {
  return GIFT_GAME_TYPE_ORDER.map((gameType) => getGiftGameConfigByType(gameType)).filter(
    (config) =>
      config.isActive &&
      (config.sourceProgram === "both" || config.sourceProgram === sourceProgram),
  );
}

export function getGiftGameEntryCostByType(gameType: GiftGameType): number {
  const config = getGiftGameConfigByType(gameType);

  if ("spinCostCoin" in config) {
    return config.spinCostCoin;
  }

  return config.castCostCoin;
}

export function isGiftGameAvailableInProgram(
  gameType: GiftGameType,
  sourceProgram: GiftProgramScope,
): boolean {
  const config = getGiftGameConfigByType(gameType);
  return config.sourceProgram === "both" || config.sourceProgram === sourceProgram;
}