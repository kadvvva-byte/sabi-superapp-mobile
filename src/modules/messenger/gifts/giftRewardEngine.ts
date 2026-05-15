import {
  GiftBetMultiplier,
  GiftCatalogItem,
  GiftEffectiveProbabilityConfig,
  GiftGameType,
  GiftProbabilityBoostWindow,
  GiftProbabilityDistribution,
  GiftProgramScope,
  GiftRewardEngineContext,
  GiftRewardTier,
} from "./giftTypes";
import {
  buildEffectiveProbabilityConfig,
  createShiftedBoostWindow,
  DEFAULT_GIFT_REWARD_PROFILE,
  GIFT_BET_MODIFIER_RULES,
} from "./giftTierRules";
import {
  getBasicRewardPool,
  getCurrentlyAvailableGiftCatalog,
  getFixed20RewardPool,
  getMediumRewardPool,
  getPremiumRewardPool,
} from "./giftCatalog";

export type GiftRewardEngineRandom = () => number;

export type GiftRewardEngineSelectedTier = {
  rewardTier: GiftRewardTier;
  roll: number;
  distribution: GiftProbabilityDistribution;
};

export type GiftRewardEngineSelectionResult = {
  rewardTier: GiftRewardTier;
  selectedGift: GiftCatalogItem;
  probabilityConfig: GiftEffectiveProbabilityConfig;
  boostWindow?: GiftProbabilityBoostWindow | null;
};

export type GiftRewardEngineGameConfig = {
  gameType: GiftGameType;
  sourceProgram: GiftProgramScope;
  entryCostCoin: number;
  allowBetMultiplier: boolean;
};

export const DEFAULT_GIFT_GAME_CONFIGS: Readonly<Record<GiftGameType, GiftRewardEngineGameConfig>> =
  Object.freeze({
    wheel_of_fortune: {
      gameType: "wheel_of_fortune",
      sourceProgram: "both",
      entryCostCoin: 10,
      allowBetMultiplier: true,
    },
    fishing_game: {
      gameType: "fishing_game",
      sourceProgram: "both",
      entryCostCoin: 10,
      allowBetMultiplier: true,
    },
    lucky_box: {
      gameType: "lucky_box",
      sourceProgram: "both",
      entryCostCoin: 10,
      allowBetMultiplier: true,
    },
    card_flip: {
      gameType: "card_flip",
      sourceProgram: "both",
      entryCostCoin: 10,
      allowBetMultiplier: true,
    },
    treasure_chest: {
      gameType: "treasure_chest",
      sourceProgram: "both",
      entryCostCoin: 10,
      allowBetMultiplier: true,
    },
  });

function defaultRandom(): number {
  return Math.random();
}

export function clampRandomValue(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  if (value <= 0) return 0;
  if (value >= 1) return 0.999999;
  return value;
}

export function getMonthKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export function hashStringToPositiveInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Смещение boost-window должно каждый месяц сдвигаться на 1–3 дня,
 * чтобы пользователи не могли зафиксировать редкий-drop день.
 */
export function generateMonthlyShiftDays(params: {
  monthKey: string;
  phase: "month_start" | "mid_month";
}): 1 | 2 | 3 {
  const hash = hashStringToPositiveInt(`${params.phase}_${params.monthKey}`);
  const normalized = (hash % 3) + 1;
  return normalized as 1 | 2 | 3;
}

export function buildMonthlyBoostWindows(monthKey: string): GiftProbabilityBoostWindow[] {
  return [
    createShiftedBoostWindow({
      monthKey,
      phase: "month_start",
      generatedShiftDays: generateMonthlyShiftDays({
        monthKey,
        phase: "month_start",
      }),
    }),
    createShiftedBoostWindow({
      monthKey,
      phase: "mid_month",
      generatedShiftDays: generateMonthlyShiftDays({
        monthKey,
        phase: "mid_month",
      }),
    }),
  ];
}

export function isDateInsideBoostWindow(params: {
  date: Date;
  boostWindow: GiftProbabilityBoostWindow;
}): boolean {
  const day = params.date.getUTCDate();
  const start = params.boostWindow.startDay;
  const end = start + params.boostWindow.durationDays - 1;

  return day >= start && day <= end;
}

export function getActiveBoostWindow(date = new Date()): GiftProbabilityBoostWindow | null {
  const monthKey = getMonthKey(date);
  const windows = buildMonthlyBoostWindows(monthKey);

  const match = windows.find((window) =>
    isDateInsideBoostWindow({
      date,
      boostWindow: window,
    }),
  );

  return match ?? null;
}

export function getRewardTierDistribution(params: {
  betMultiplier: GiftBetMultiplier;
  date?: Date;
}): GiftEffectiveProbabilityConfig {
  const boostWindow = getActiveBoostWindow(params.date ?? new Date());

  return buildEffectiveProbabilityConfig({
    betMultiplier: params.betMultiplier,
    boostWindow,
    baseProfile: DEFAULT_GIFT_REWARD_PROFILE,
  });
}

export function pickRewardTierByDistribution(params: {
  distribution: GiftProbabilityDistribution;
  random?: GiftRewardEngineRandom;
}): GiftRewardEngineSelectedTier {
  const randomValue = clampRandomValue((params.random ?? defaultRandom)());

  const basicEnd = params.distribution.basicRate;
  const fixed20End = basicEnd + params.distribution.fixed20Rate;
  const mediumEnd = fixed20End + params.distribution.mediumRate;

  if (randomValue < basicEnd) {
    return {
      rewardTier: "basic",
      roll: randomValue,
      distribution: params.distribution,
    };
  }

  if (randomValue < fixed20End) {
    return {
      rewardTier: "fixed_20",
      roll: randomValue,
      distribution: params.distribution,
    };
  }

  if (randomValue < mediumEnd) {
    return {
      rewardTier: "medium",
      roll: randomValue,
      distribution: params.distribution,
    };
  }

  return {
    rewardTier: "premium",
    roll: randomValue,
    distribution: params.distribution,
  };
}

export function getRewardPoolByTier(params: {
  rewardTier: GiftRewardTier;
  sourceProgram?: GiftProgramScope;
  nowIso?: string;
}): GiftCatalogItem[] {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const sourceProgram = params.sourceProgram ?? "both";

  const availableCatalog = getCurrentlyAvailableGiftCatalog(sourceProgram, nowIso);
  const idSet = new Set(availableCatalog.map((item) => item.id));

  const rawPool =
    params.rewardTier === "basic"
      ? getBasicRewardPool()
      : params.rewardTier === "fixed_20"
        ? getFixed20RewardPool()
        : params.rewardTier === "medium"
          ? getMediumRewardPool()
          : getPremiumRewardPool();

  return rawPool.filter((item) => idSet.has(item.id));
}

export function pickGiftFromRewardPool(params: {
  rewardTier: GiftRewardTier;
  sourceProgram?: GiftProgramScope;
  nowIso?: string;
  random?: GiftRewardEngineRandom;
}): GiftCatalogItem {
  const pool = getRewardPoolByTier({
    rewardTier: params.rewardTier,
    sourceProgram: params.sourceProgram,
    nowIso: params.nowIso,
  });

  if (!pool.length) {
    throw new Error(`No available gifts in reward tier: ${params.rewardTier}`);
  }

  const randomValue = clampRandomValue((params.random ?? defaultRandom)());
  const index = Math.floor(randomValue * pool.length);

  return pool[Math.min(index, pool.length - 1)];
}

export function resolveGiftReward(params: {
  context: GiftRewardEngineContext;
  random?: GiftRewardEngineRandom;
  now?: Date;
}): GiftRewardEngineSelectionResult {
  const now = params.now ?? new Date();
  const boostWindow = getActiveBoostWindow(now);

  const probabilityConfig = buildEffectiveProbabilityConfig({
    betMultiplier: params.context.betMultiplier,
    boostWindow,
    baseProfile: DEFAULT_GIFT_REWARD_PROFILE,
  });

  const tierSelection = pickRewardTierByDistribution({
    distribution: probabilityConfig.finalDistribution,
    random: params.random,
  });

  const selectedGift = pickGiftFromRewardPool({
    rewardTier: tierSelection.rewardTier,
    sourceProgram: params.context.sourceProgram,
    nowIso: now.toISOString(),
    random: params.random,
  });

  return {
    rewardTier: tierSelection.rewardTier,
    selectedGift,
    probabilityConfig,
    boostWindow,
  };
}

export function validateGiftGameConfig(gameType: GiftGameType): GiftRewardEngineGameConfig {
  const config = DEFAULT_GIFT_GAME_CONFIGS[gameType];
  if (!config) {
    throw new Error(`Unknown gift game type: ${gameType}`);
  }
  return config;
}

export function getAllowedBetMultipliers(gameType: GiftGameType): GiftBetMultiplier[] {
  const config = validateGiftGameConfig(gameType);
  if (!config.allowBetMultiplier) return [1];
  return GIFT_BET_MODIFIER_RULES.map((item) => item.multiplier);
}

export function createGiftRewardEngineContext(params: {
  userId: string;
  sourceProgram: GiftProgramScope;
  betMultiplier?: GiftBetMultiplier;
  date?: Date;
}): GiftRewardEngineContext {
  const date = params.date ?? new Date();

  return {
    userId: params.userId,
    sourceProgram: params.sourceProgram,
    baseProbabilityProfileId: DEFAULT_GIFT_REWARD_PROFILE.profileId,
    betMultiplier: params.betMultiplier ?? 1,
    currentMonthKey: getMonthKey(date),
  };
}

export function simulateRewardTierRolls(params: {
  distribution: GiftProbabilityDistribution;
  iterations: number;
  random?: GiftRewardEngineRandom;
}): Record<GiftRewardTier, number> {
  const result: Record<GiftRewardTier, number> = {
    basic: 0,
    fixed_20: 0,
    medium: 0,
    premium: 0,
  };

  const random = params.random ?? defaultRandom;

  for (let index = 0; index < params.iterations; index += 1) {
    const selection = pickRewardTierByDistribution({
      distribution: params.distribution,
      random,
    });
    result[selection.rewardTier] += 1;
  }

  return result;
}

export function getRewardTierLabel(rewardTier: GiftRewardTier): string {
  switch (rewardTier) {
    case "basic":
      return "Basic Reward";
    case "fixed_20":
      return "20 Coin Reward";
    case "medium":
      return "Medium Reward";
    case "premium":
      return "Premium Reward";
    default:
      return "Reward";
  }
}

export function isRareRewardTier(rewardTier: GiftRewardTier): boolean {
  return rewardTier === "medium" || rewardTier === "premium";
}

export function isPremiumRewardTier(rewardTier: GiftRewardTier): boolean {
  return rewardTier === "premium";
}