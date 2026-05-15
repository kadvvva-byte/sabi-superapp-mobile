import { GiftCatalogSection, GiftProgramScope } from "./giftTypes";

export type GiftIntegrationPhase =
  | "core_domain"
  | "catalog_ui"
  | "send_flow"
  | "chat_history"
  | "game_modes"
  | "inventory_ui"
  | "stream_integration"
  | "wallet_linking";

export type GiftModuleFilePlanItem = {
  filePath: string;
  phase: GiftIntegrationPhase;
  purpose: string;
  required: boolean;
};

export type GiftModuleEntryPoint = {
  id: string;
  title: string;
  sourceProgram: GiftProgramScope;
  section: GiftCatalogSection;
  description: string;
  enabledByDefault: boolean;
};

export type GiftModulePolicySummary = {
  gift3dOnly: true;
  animatedEmojiIsSeparateMonthlyPack: true;
  animatedEmojiPriceCoin: 2;
  animatedEmojiHasAudio: false;
  animeStickersAreSeparate: true;

  rewardGamesUseUnifiedEngine: true;
  rewardProbabilityBaseProfile: "85_10_4_1";
  rewardGamesEntryCostCoin: 10;

  wonGiftInventoryExpiresInDays: 30;
  visibleGiftRevenueIsLockedInitially: true;
  transferToActiveBalanceOncePerMonth: true;

  topUpRequiresVerifiedNameMatch: true;
  streamPublicNameMayDiffer: true;

  unifiedUserIdRequiredAcrossPrograms: true;
  blockGiftSendOnMessengerStreamMismatch: true;

  roomHistoryVisibleUntilMonthEnd: true;
  fullPlaybackOnlyForSenderAndReceiver: true;
};

export type GiftModulePlan = {
  version: string;
  title: string;
  description: string;

  phasesInOrder: GiftIntegrationPhase[];
  filePlan: GiftModuleFilePlanItem[];
  entryPoints: GiftModuleEntryPoint[];
  policySummary: GiftModulePolicySummary;
};

export const GIFT_MODULE_PHASES_IN_ORDER: readonly GiftIntegrationPhase[] = [
  "core_domain",
  "catalog_ui",
  "send_flow",
  "chat_history",
  "game_modes",
  "inventory_ui",
  "stream_integration",
  "wallet_linking",
] as const;

export const GIFT_MODULE_FILE_PLAN: readonly GiftModuleFilePlanItem[] = [
  {
    filePath: "src/modules/messenger/gifts/giftTypes.ts",
    phase: "core_domain",
    purpose: "Base entities, enums, identity, transaction, inventory, playback and policy types.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/giftTierRules.ts",
    phase: "core_domain",
    purpose: "Price tiers, duration rules, audio rules, probability profiles and fee constants.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/giftCatalog.ts",
    phase: "core_domain",
    purpose: "Catalog dataset, categories, event gifts and reward pools.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/giftRewardEngine.ts",
    phase: "core_domain",
    purpose: "Unified reward engine for Wheel, Fishing and future reward games.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/giftGameConfigs.ts",
    phase: "core_domain",
    purpose: "Reward-game configs for Wheel, Fishing, Lucky Box, Card Flip and Treasure Chest.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/giftInventoryEngine.ts",
    phase: "core_domain",
    purpose: "Shared gift storage/inventory logic with 30-day expiration.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/giftTransactionEngine.ts",
    phase: "core_domain",
    purpose: "Gift sending, fee/net calculation, locked revenue and monthly transfer rules.",
    required: true,
  },

  {
    filePath: "src/modules/messenger/gifts/GiftCatalogSheet.tsx",
    phase: "catalog_ui",
    purpose: "Main in-chat GIFT 3D PREMIUM catalog entry layer opened from Animated.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/GiftCategoryTabs.tsx",
    phase: "catalog_ui",
    purpose: "Category navigation for GIFT 3D PREMIUM sections.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/GiftCard3D.tsx",
    phase: "catalog_ui",
    purpose: "Premium gift item card with tier, price and preview metadata.",
    required: true,
  },

  {
    filePath: "src/modules/messenger/gifts/GiftSendConfirmSheet.tsx",
    phase: "send_flow",
    purpose: "Gift confirmation, balance check, fee summary and send action.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/giftMessageBuilder.ts",
    phase: "send_flow",
    purpose: "Creates gift chat messages after successful transaction.",
    required: true,
  },

  {
    filePath: "src/modules/messenger/gifts/GiftHistoryCard.tsx",
    phase: "chat_history",
    purpose: "Gift record card visible in room history until month end.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/giftRoomHistoryMapper.ts",
    phase: "chat_history",
    purpose: "Maps transactions and inventory rewards into chat history card view models.",
    required: true,
  },

  {
    filePath: "src/modules/messenger/gifts/GiftWheelScreen.tsx",
    phase: "game_modes",
    purpose: "Wheel of Fortune screen inside GIFT 3D PREMIUM.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/GiftFishingScreen.tsx",
    phase: "game_modes",
    purpose: "Fishing game screen inside GIFT 3D PREMIUM.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/GiftLuckyBoxScreen.tsx",
    phase: "game_modes",
    purpose: "Lucky Box mini-game screen.",
    required: false,
  },
  {
    filePath: "src/modules/messenger/gifts/GiftCardFlipScreen.tsx",
    phase: "game_modes",
    purpose: "Card Flip mini-game screen.",
    required: false,
  },
  {
    filePath: "src/modules/messenger/gifts/GiftTreasureChestScreen.tsx",
    phase: "game_modes",
    purpose: "Treasure Chest mini-game screen.",
    required: false,
  },

  {
    filePath: "src/modules/messenger/gifts/GiftInventoryScreen.tsx",
    phase: "inventory_ui",
    purpose: "Shared won/bought gift inventory UI.",
    required: true,
  },
  {
    filePath: "src/modules/messenger/gifts/GiftInventoryCard.tsx",
    phase: "inventory_ui",
    purpose: "Inventory item card with remaining days and status.",
    required: true,
  },

  {
    filePath: "src/modules/stream/gifts/StreamGiftEntrySheet.tsx",
    phase: "stream_integration",
    purpose: "Stream-side entry into shared GIFT 3D PREMIUM engine.",
    required: true,
  },
  {
    filePath: "src/modules/stream/gifts/StreamGiftSendBridge.ts",
    phase: "stream_integration",
    purpose: "Shared bridge between Stream actions and gift transaction engine.",
    required: true,
  },

  {
    filePath: "src/modules/wallet/coin/giftRevenueBridge.ts",
    phase: "wallet_linking",
    purpose: "Moves gift revenue into Coin / Earnings / monthly transfer flow.",
    required: true,
  },
  {
    filePath: "src/modules/wallet/coin/coinGiftSettlementPolicy.ts",
    phase: "wallet_linking",
    purpose: "Enforces locked revenue and once-per-month transfer policy.",
    required: true,
  },
] as const;

export const GIFT_MODULE_ENTRY_POINTS: readonly GiftModuleEntryPoint[] = [
  {
    id: "messenger_gift_shop",
    title: "GIFT 3D PREMIUM",
    sourceProgram: "messenger",
    section: "shop",
    description: "Main in-chat gift catalog with paid 3D gifts by category.",
    enabledByDefault: true,
  },
  {
    id: "messenger_gift_wheel",
    title: "Wheel of Fortune",
    sourceProgram: "messenger",
    section: "wheel_of_fortune",
    description: "Messenger entry into Wheel of Fortune reward mode.",
    enabledByDefault: true,
  },
  {
    id: "messenger_gift_fishing",
    title: "Fishing",
    sourceProgram: "messenger",
    section: "fishing",
    description: "Messenger entry into Fishing reward mode.",
    enabledByDefault: true,
  },
  {
    id: "messenger_gift_inventory",
    title: "Gift Storage",
    sourceProgram: "messenger",
    section: "inventory",
    description: "Shared storage for bought and won gifts.",
    enabledByDefault: true,
  },
  {
    id: "messenger_event_gifts",
    title: "Event Gifts",
    sourceProgram: "messenger",
    section: "event_gifts",
    description: "Seasonal and event gifts inside Messenger gift platform.",
    enabledByDefault: true,
  },

  {
    id: "stream_gift_shop",
    title: "GIFT 3D PREMIUM",
    sourceProgram: "stream",
    section: "shop",
    description: "Stream entry into shared paid 3D gift platform.",
    enabledByDefault: true,
  },
  {
    id: "stream_gift_wheel",
    title: "Wheel of Fortune",
    sourceProgram: "stream",
    section: "wheel_of_fortune",
    description: "Stream entry into Wheel of Fortune reward mode.",
    enabledByDefault: true,
  },
  {
    id: "stream_gift_fishing",
    title: "Fishing",
    sourceProgram: "stream",
    section: "fishing",
    description: "Stream entry into Fishing reward mode.",
    enabledByDefault: true,
  },
  {
    id: "stream_gift_inventory",
    title: "Gift Storage",
    sourceProgram: "stream",
    section: "inventory",
    description: "Shared storage available from Stream side.",
    enabledByDefault: true,
  },
  {
    id: "stream_event_gifts",
    title: "Event Gifts",
    sourceProgram: "stream",
    section: "event_gifts",
    description: "Seasonal and event gifts inside Stream gift platform.",
    enabledByDefault: true,
  },
] as const;

export const GIFT_MODULE_POLICY_SUMMARY: GiftModulePolicySummary = {
  gift3dOnly: true,
  animatedEmojiIsSeparateMonthlyPack: true,
  animatedEmojiPriceCoin: 2,
  animatedEmojiHasAudio: false,
  animeStickersAreSeparate: true,

  rewardGamesUseUnifiedEngine: true,
  rewardProbabilityBaseProfile: "85_10_4_1",
  rewardGamesEntryCostCoin: 10,

  wonGiftInventoryExpiresInDays: 30,
  visibleGiftRevenueIsLockedInitially: true,
  transferToActiveBalanceOncePerMonth: true,

  topUpRequiresVerifiedNameMatch: true,
  streamPublicNameMayDiffer: true,

  unifiedUserIdRequiredAcrossPrograms: true,
  blockGiftSendOnMessengerStreamMismatch: true,

  roomHistoryVisibleUntilMonthEnd: true,
  fullPlaybackOnlyForSenderAndReceiver: true,
};

export const GIFT_MODULE_PLAN: GiftModulePlan = {
  version: "1.0.0",
  title: "Messenger / Stream Gift Platform Plan",
  description:
    "Implementation order for GIFT 3D PREMIUM, reward games, inventory, chat history, stream linking and wallet settlement.",
  phasesInOrder: [...GIFT_MODULE_PHASES_IN_ORDER],
  filePlan: [...GIFT_MODULE_FILE_PLAN],
  entryPoints: [...GIFT_MODULE_ENTRY_POINTS],
  policySummary: GIFT_MODULE_POLICY_SUMMARY,
};

export function getGiftPlanFilesByPhase(
  phase: GiftIntegrationPhase,
): GiftModuleFilePlanItem[] {
  return GIFT_MODULE_FILE_PLAN.filter((item) => item.phase === phase);
}

export function getRequiredGiftPlanFiles(): GiftModuleFilePlanItem[] {
  return GIFT_MODULE_FILE_PLAN.filter((item) => item.required);
}

export function getGiftEntryPointsByProgram(
  sourceProgram: GiftProgramScope,
): GiftModuleEntryPoint[] {
  return GIFT_MODULE_ENTRY_POINTS.filter(
    (item) => item.sourceProgram === sourceProgram,
  );
}

export function getGiftEnabledEntryPoints(
  sourceProgram: GiftProgramScope,
): GiftModuleEntryPoint[] {
  return getGiftEntryPointsByProgram(sourceProgram).filter(
    (item) => item.enabledByDefault,
  );
}