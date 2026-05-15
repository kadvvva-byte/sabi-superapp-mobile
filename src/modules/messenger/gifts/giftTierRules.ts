import {
  GiftBetModifierRule,
  GiftBetMultiplier,
  GiftEffectiveProbabilityConfig,
  GiftProbabilityBoostWindow,
  GiftProbabilityDistribution,
  GiftRewardProbabilityProfile,
  GiftTier,
  GiftTierRule,
} from "./giftTypes";

export const GIFT_CURRENCY = "COIN" as const;

export const GIFT_TIER_RULES: readonly GiftTierRule[] = [
  {
    tier: "basic_3d",
    rewardTier: "basic",
    minCoin: 1,
    maxCoin: 5,
    minDurationSec: 1.5,
    maxDurationSec: 2.5,
    hasAudio: false,
    playbackType: "inline_3d",
  },
  {
    tier: "visual_plus",
    rewardTier: "fixed_20",
    minCoin: 10,
    maxCoin: 25,
    minDurationSec: 2,
    maxDurationSec: 3,
    hasAudio: false,
    playbackType: "expanded_3d",
  },
  {
    tier: "premium_audio",
    rewardTier: "medium",
    minCoin: 30,
    maxCoin: 50,
    minDurationSec: 3,
    maxDurationSec: 4,
    hasAudio: true,
    playbackType: "expanded_3d",
  },
  {
    tier: "near_fullscreen",
    rewardTier: "medium",
    minCoin: 60,
    maxCoin: 80,
    minDurationSec: 4,
    maxDurationSec: 5,
    hasAudio: true,
    playbackType: "near_fullscreen_3d",
  },
  {
    tier: "premium_fullscreen",
    rewardTier: "premium",
    minCoin: 90,
    maxCoin: 100,
    minDurationSec: 5,
    maxDurationSec: 7,
    hasAudio: true,
    playbackType: "fullscreen_3d",
  },
  {
    tier: "ultra_premium",
    rewardTier: "premium",
    minCoin: 150,
    maxCoin: 200,
    minDurationSec: 10,
    maxDurationSec: 15,
    hasAudio: true,
    playbackType: "ultra_fullscreen_3d",
  },
] as const;

export const DEFAULT_GIFT_REWARD_PROFILE: GiftRewardProbabilityProfile = {
  profileId: "default_gift_game_profile",
  title: "Default Gift Game Profile",
  basicRate: 0.85,
  fixed20Rate: 0.1,
  mediumRate: 0.04,
  premiumRate: 0.01,
  isDefault: true,
};

export const GIFT_BET_MODIFIER_RULES: readonly GiftBetModifierRule[] = [
  {
    multiplier: 1,
    distribution: {
      basicRate: 0.85,
      fixed20Rate: 0.1,
      mediumRate: 0.04,
      premiumRate: 0.01,
    },
  },
  {
    multiplier: 2,
    distribution: {
      basicRate: 0.825,
      fixed20Rate: 0.11,
      mediumRate: 0.05,
      premiumRate: 0.015,
    },
  },
  {
    multiplier: 3,
    distribution: {
      basicRate: 0.8,
      fixed20Rate: 0.12,
      mediumRate: 0.06,
      premiumRate: 0.02,
    },
  },
] as const;

export const DEFAULT_GIFT_FEE_RATE_BPS = 1500;
export const DEFAULT_GIFT_INVENTORY_EXPIRATION_DAYS = 30;
export const DEFAULT_GIFT_MONTHLY_TRANSFER_LIMIT = 1;

export const GIFT_MONTH_START_BOOST_TEMPLATE = {
  phase: "month_start" as const,
  durationDays: 2,
  premiumBonusRate: 0.003,
  mediumBonusRate: 0.01,
  fixed20BonusRate: 0.002,
};

export const GIFT_MID_MONTH_BOOST_TEMPLATE = {
  phase: "mid_month" as const,
  durationDays: 2,
  premiumBonusRate: 0.004,
  mediumBonusRate: 0.012,
  fixed20BonusRate: 0.002,
};

export function getGiftTierRule(tier: GiftTier): GiftTierRule {
  const match = GIFT_TIER_RULES.find((item) => item.tier === tier);
  if (!match) {
    throw new Error(`Unknown gift tier: ${tier}`);
  }
  return match;
}

export function getGiftTierByPrice(priceCoin: number): GiftTier {
  if (priceCoin >= 1 && priceCoin <= 5) return "basic_3d";
  if (priceCoin >= 10 && priceCoin <= 25) return "visual_plus";
  if (priceCoin >= 30 && priceCoin <= 50) return "premium_audio";
  if (priceCoin >= 60 && priceCoin <= 80) return "near_fullscreen";
  if (priceCoin >= 90 && priceCoin <= 100) return "premium_fullscreen";
  if (priceCoin >= 150 && priceCoin <= 200) return "ultra_premium";

  throw new Error(`Unsupported gift price: ${priceCoin}`);
}

export function getGiftBetModifierRule(multiplier: GiftBetMultiplier): GiftBetModifierRule {
  const match = GIFT_BET_MODIFIER_RULES.find((item) => item.multiplier === multiplier);
  if (!match) {
    throw new Error(`Unknown gift bet multiplier: ${multiplier}`);
  }
  return match;
}

export function normalizeDistribution(
  distribution: GiftProbabilityDistribution,
): GiftProbabilityDistribution {
  const values = [
    distribution.basicRate,
    distribution.fixed20Rate,
    distribution.mediumRate,
    distribution.premiumRate,
  ];

  const total = values.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    throw new Error("Gift probability distribution total must be greater than 0.");
  }

  return {
    basicRate: distribution.basicRate / total,
    fixed20Rate: distribution.fixed20Rate / total,
    mediumRate: distribution.mediumRate / total,
    premiumRate: distribution.premiumRate / total,
  };
}

export function applyBoostWindowToDistribution(
  base: GiftProbabilityDistribution,
  boostWindow?: GiftProbabilityBoostWindow | null,
): GiftProbabilityDistribution {
  if (!boostWindow) {
    return normalizeDistribution(base);
  }

  const boosted: GiftProbabilityDistribution = {
    basicRate:
      base.basicRate -
      (boostWindow.premiumBonusRate +
        boostWindow.mediumBonusRate +
        boostWindow.fixed20BonusRate),
    fixed20Rate: base.fixed20Rate + boostWindow.fixed20BonusRate,
    mediumRate: base.mediumRate + boostWindow.mediumBonusRate,
    premiumRate: base.premiumRate + boostWindow.premiumBonusRate,
  };

  return normalizeDistribution(boosted);
}

export function buildEffectiveProbabilityConfig(params: {
  betMultiplier: GiftBetMultiplier;
  boostWindow?: GiftProbabilityBoostWindow | null;
  baseProfile?: GiftRewardProbabilityProfile;
}): GiftEffectiveProbabilityConfig {
  const baseProfile = params.baseProfile ?? DEFAULT_GIFT_REWARD_PROFILE;
  const betRule = getGiftBetModifierRule(params.betMultiplier);

  const baseDistribution = normalizeDistribution({
    basicRate: baseProfile.basicRate,
    fixed20Rate: baseProfile.fixed20Rate,
    mediumRate: baseProfile.mediumRate,
    premiumRate: baseProfile.premiumRate,
  });

  const betDistribution = normalizeDistribution(betRule.distribution);
  const finalDistribution = applyBoostWindowToDistribution(
    betDistribution,
    params.boostWindow,
  );

  return {
    baseProfileId: baseProfile.profileId,
    baseDistribution,
    appliedBetMultiplier: params.betMultiplier,
    betDistribution,
    boostWindowApplied: Boolean(params.boostWindow),
    boostWindowId: params.boostWindow?.windowId,
    finalDistribution,
  };
}

export function getGiftFeeCoinAmount(grossCoinAmount: number, feeRateBps = DEFAULT_GIFT_FEE_RATE_BPS): number {
  if (grossCoinAmount <= 0) return 0;
  return Math.round((grossCoinAmount * feeRateBps) / 10000);
}

export function getGiftNetCoinAmount(grossCoinAmount: number, feeRateBps = DEFAULT_GIFT_FEE_RATE_BPS): number {
  const fee = getGiftFeeCoinAmount(grossCoinAmount, feeRateBps);
  return Math.max(0, grossCoinAmount - fee);
}

export function getGiftDurationRangeByPrice(priceCoin: number): {
  minDurationSec: number;
  maxDurationSec: number;
} {
  const tier = getGiftTierByPrice(priceCoin);
  const rule = getGiftTierRule(tier);

  return {
    minDurationSec: rule.minDurationSec,
    maxDurationSec: rule.maxDurationSec,
  };
}

export function hasGiftAudioByPrice(priceCoin: number): boolean {
  const tier = getGiftTierByPrice(priceCoin);
  const rule = getGiftTierRule(tier);
  return rule.hasAudio;
}

export function isGiftPriceValid(priceCoin: number): boolean {
  try {
    getGiftTierByPrice(priceCoin);
    return true;
  } catch {
    return false;
  }
}

export function createShiftedBoostWindow(params: {
  monthKey: string;
  phase: "month_start" | "mid_month";
  generatedShiftDays: 1 | 2 | 3;
}): GiftProbabilityBoostWindow {
  const template =
    params.phase === "month_start"
      ? GIFT_MONTH_START_BOOST_TEMPLATE
      : GIFT_MID_MONTH_BOOST_TEMPLATE;

  const baseStartDay = params.phase === "month_start" ? 3 : 14;
  const shiftedStartDay = baseStartDay + params.generatedShiftDays;

  return {
    windowId: `${params.phase}_${params.monthKey}`,
    phase: params.phase,
    monthKey: params.monthKey,
    startDay: shiftedStartDay,
    durationDays: template.durationDays,
    premiumBonusRate: template.premiumBonusRate,
    mediumBonusRate: template.mediumBonusRate,
    fixed20BonusRate: template.fixed20BonusRate,
    generatedShiftDays: params.generatedShiftDays,
  };
}