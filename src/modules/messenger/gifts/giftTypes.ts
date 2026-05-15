export type GiftProgramScope = "messenger" | "stream" | "both";

export type GiftCategory =
  | "love_romance"
  | "cars_moto"
  | "power_weapon"
  | "fantasy_myth"
  | "divine"
  | "luxury_status"
  | "wealth_money"
  | "animals"
  | "space_epic"
  | "seasonal_event";

export type GiftTier =
  | "basic_3d"
  | "visual_plus"
  | "premium_audio"
  | "near_fullscreen"
  | "premium_fullscreen"
  | "ultra_premium";

export type GiftPlaybackType =
  | "inline_3d"
  | "expanded_3d"
  | "near_fullscreen_3d"
  | "fullscreen_3d"
  | "ultra_fullscreen_3d";

export type GiftRewardTier = "basic" | "fixed_20" | "medium" | "premium";

export type GiftRewardSource =
  | "direct_purchase"
  | "wheel_of_fortune"
  | "fishing_game"
  | "lucky_box"
  | "card_flip"
  | "treasure_chest"
  | "stream_event"
  | "event_reward";

export type GiftGameType =
  | "wheel_of_fortune"
  | "fishing_game"
  | "lucky_box"
  | "card_flip"
  | "treasure_chest";

export type GiftCatalogItemLifecycle = "active" | "hidden" | "retired";

export type GiftInventoryStatus = "available" | "used" | "expired";

export type GiftTransactionStatus =
  | "created"
  | "processing"
  | "completed"
  | "failed"
  | "reversed"
  | "blocked_identity_mismatch"
  | "blocked_balance_locked"
  | "blocked_policy";

export type GiftRevenueStatus =
  | "visible"
  | "locked"
  | "releasable"
  | "transferred"
  | "withdrawn";

export type GiftPlaybackStatus = "queued" | "playing" | "completed" | "dismissed";

export type GiftViewerRole = "sender" | "receiver" | "room_observer";

export type GiftRoomVisibility =
  | "room_visible_until_month_end"
  | "sender_receiver_only"
  | "archived";

export type GiftMessageKind = "gift_record_card" | "gift_reward_card";

export type GiftOwnershipType = "bought" | "won";

export type GiftBoostWindowPhase = "month_start" | "mid_month";

export type GiftCurrencyCode = "COIN";

export type UnifiedUserIdentity = {
  userId: string;
  messengerUserId: string;
  streamUserId: string;
  walletUserId?: string;
  coinWalletUserId?: string;
};

export type GiftIdentityValidation = {
  isUnifiedIdentityValid: boolean;
  reason?:
    | "messenger_stream_id_mismatch"
    | "wallet_identity_mismatch"
    | "missing_user_id"
    | "unknown";
};

export type GiftCatalogItem = {
  id: string;
  slug: string;

  title: string;
  subtitle?: string;
  shortLabel: string;

  category: GiftCategory;
  tier: GiftTier;
  rewardTier: GiftRewardTier;

  priceCoin: number;
  currency: GiftCurrencyCode;

  is3D: true;
  hasAudio: boolean;

  durationMinSec: number;
  durationMaxSec: number;

  playbackType: GiftPlaybackType;

  previewAsset: string;
  animationAsset: string;
  audioAsset?: string;
  coverImage?: string;

  badgeLabel?: string;
  tags?: string[];

  availableIn: GiftProgramScope;

  isEventGift: boolean;
  eventTag?: string;
  availableFrom?: string;
  availableUntil?: string;

  lifecycle: GiftCatalogItemLifecycle;
  sortOrder: number;
};

export type GiftTierRule = {
  tier: GiftTier;
  rewardTier: GiftRewardTier;

  minCoin: number;
  maxCoin: number;

  minDurationSec: number;
  maxDurationSec: number;

  hasAudio: boolean;
  playbackType: GiftPlaybackType;
};

export type GiftSendRequest = {
  requestId: string;

  sourceProgram: GiftProgramScope;
  sourceGameType?: GiftGameType | null;

  chatId?: string | null;
  streamSessionId?: string | null;

  senderUserId: string;
  receiverUserId: string;

  senderIdentity: UnifiedUserIdentity;
  receiverIdentity?: UnifiedUserIdentity | null;

  giftId: string;

  clientCreatedAt: string;
  messageTextFallback?: string;
};

export type GiftFeePolicy = {
  feeRateBps: number;
  feeLabel?: string;
  appliesToRewardSource?: GiftRewardSource | "all";
};

export type GiftTransaction = {
  transactionId: string;

  sourceProgram: GiftProgramScope;
  sourceRewardType: GiftRewardSource;
  sourceGameType?: GiftGameType | null;

  chatId?: string | null;
  streamSessionId?: string | null;

  senderUserId: string;
  receiverUserId: string;

  senderIdentityUserId: string;
  receiverIdentityUserId: string;

  giftId: string;
  giftTitleSnapshot: string;
  giftShortLabelSnapshot: string;
  giftTierSnapshot: GiftTier;
  giftCategorySnapshot: GiftCategory;
  rewardTierSnapshot: GiftRewardTier;

  currency: GiftCurrencyCode;

  grossCoinAmount: number;
  feeCoinAmount: number;
  netCoinAmount: number;

  feeRateBps: number;

  senderBalanceBefore?: number;
  senderBalanceAfter?: number;

  receiverVisibleBalanceBefore?: number;
  receiverVisibleBalanceAfter?: number;

  status: GiftTransactionStatus;

  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  reversedAt?: string;

  failureReason?: string;
};

export type GiftPlaybackEvent = {
  playbackId: string;

  transactionId: string;
  giftId: string;

  viewerUserId: string;
  viewerRole: GiftViewerRole;

  playbackType: GiftPlaybackType;
  durationSec: number;
  hasAudio: boolean;

  autoPlay: boolean;
  replayAllowed: boolean;

  status: GiftPlaybackStatus;

  startedAt?: string;
  completedAt?: string;
  dismissedAt?: string;
};

export type GiftChatMessage = {
  messageId: string;

  kind: GiftMessageKind;

  chatId: string;
  transactionId?: string | null;
  inventoryId?: string | null;

  senderUserId: string;
  receiverUserId?: string | null;

  giftId: string;
  giftTitleSnapshot: string;
  giftShortLabelSnapshot: string;
  giftCategorySnapshot: GiftCategory;
  giftTierSnapshot: GiftTier;
  rewardTierSnapshot: GiftRewardTier;

  priceCoinSnapshot: number;
  currency: GiftCurrencyCode;

  previewAsset: string;

  roomVisibility: GiftRoomVisibility;
  visibleToRoomUntil: string;

  isPinnedVisual: boolean;
  isReplayableForSender: boolean;
  isReplayableForReceiver: boolean;

  createdAt: string;
};

export type GiftRevenueRecord = {
  revenueId: string;

  transactionId: string;
  receiverUserId: string;

  sourceType: "gift";
  sourceGiftId: string;

  currency: GiftCurrencyCode;

  grossCoinAmount: number;
  feeCoinAmount: number;
  netCoinAmount: number;

  /**
   * Доход сразу виден, но не может быть использован моментально.
   * Перевод в активный баланс допускается только 1 раз в месяц.
   */
  status: GiftRevenueStatus;

  receivedAt: string;
  visibleAt: string;
  lockedUntilMonthlyTransferAt?: string;
  releasableAt?: string;
  transferredAt?: string;
  withdrawnAt?: string;
};

export type GiftInventoryItem = {
  inventoryId: string;

  ownerUserId: string;
  ownershipType: GiftOwnershipType;

  sourceRewardType: GiftRewardSource;
  sourceGameType?: GiftGameType | null;
  sourceTransactionId?: string | null;
  sourceSpinId?: string | null;

  giftId: string;
  giftTitleSnapshot: string;
  giftShortLabelSnapshot: string;
  giftTierSnapshot: GiftTier;
  giftCategorySnapshot: GiftCategory;
  rewardTierSnapshot: GiftRewardTier;

  quantity: number;

  createdAt: string;
  expiresAt: string;
  usedAt?: string;

  status: GiftInventoryStatus;
};

export type GiftRewardProbabilityProfile = {
  profileId: string;
  title: string;

  basicRate: number; // 0.85
  fixed20Rate: number; // 0.10
  mediumRate: number; // 0.04
  premiumRate: number; // 0.01

  isDefault: boolean;
};

export type GiftBetMultiplier = 1 | 2 | 3;

export type GiftProbabilityDistribution = {
  basicRate: number;
  fixed20Rate: number;
  mediumRate: number;
  premiumRate: number;
};

export type GiftBetModifierRule = {
  multiplier: GiftBetMultiplier;
  distribution: GiftProbabilityDistribution;
};

export type GiftProbabilityBoostWindow = {
  windowId: string;
  phase: GiftBoostWindowPhase;

  monthKey: string;
  startDay: number;
  durationDays: number;

  premiumBonusRate: number;
  mediumBonusRate: number;
  fixed20BonusRate: number;

  generatedShiftDays: number;
};

export type GiftEffectiveProbabilityConfig = {
  baseProfileId: string;
  baseDistribution: GiftProbabilityDistribution;

  appliedBetMultiplier: GiftBetMultiplier;
  betDistribution: GiftProbabilityDistribution;

  boostWindowApplied: boolean;
  boostWindowId?: string;

  finalDistribution: GiftProbabilityDistribution;
};

export type GiftWheelSlot = {
  slotId: string;
  giftId: string;
  rewardTier: GiftRewardTier;
  weight: number;
};

export type GiftWheelConfig = {
  wheelId: string;
  title: string;

  sourceProgram: GiftProgramScope;
  isActive: boolean;

  spinCostCoin: number;
  currency: GiftCurrencyCode;

  slots: GiftWheelSlot[];
  probabilityProfileId: string;

  createdAt: string;
  updatedAt: string;
};

export type GiftWheelSpinTransaction = {
  spinId: string;
  wheelId: string;
  userId: string;

  sourceProgram: GiftProgramScope;

  spinCostCoin: number;
  currency: GiftCurrencyCode;

  rewardGiftId: string;
  rewardGiftTier: GiftTier;
  rewardTier: GiftRewardTier;

  status: "created" | "processing" | "completed" | "failed";

  createdAt: string;
  completedAt?: string;
  failedAt?: string;
};

export type GiftFishingRewardPoolItem = {
  poolItemId: string;
  giftId: string;
  rewardTier: GiftRewardTier;
  weight: number;
};

export type GiftFishingGameConfig = {
  gameId: string;
  title: string;

  sourceProgram: GiftProgramScope;
  isActive: boolean;

  castCostCoin: number;
  currency: GiftCurrencyCode;

  probabilityProfileId: string;
  rewardPool: GiftFishingRewardPoolItem[];

  createdAt: string;
  updatedAt: string;
};

export type GiftFishingAttemptTransaction = {
  attemptId: string;
  gameId: string;
  userId: string;

  sourceProgram: GiftProgramScope;

  castCostCoin: number;
  currency: GiftCurrencyCode;

  rewardGiftId: string;
  rewardGiftTier: GiftTier;
  rewardTier: GiftRewardTier;

  status: "created" | "processing" | "completed" | "failed";

  createdAt: string;
  completedAt?: string;
  failedAt?: string;
};

export type GiftTopUpNameMatchPolicy = {
  requiresVerifiedNameMatch: true;
  blockOnMismatch: true;
  streamPublicNameMayDiffer: true;
};

export type GiftMonthlySettlementPolicy = {
  receivedIncomeVisibleImmediately: true;
  spendableImmediately: false;
  transferableToActiveBalanceOncePerMonth: true;
};

export type GiftIdentityPolicy = {
  primaryIdentityKey: "userId";
  requireUnifiedUserIdAcrossPrograms: true;
  blockGiftSendOnMessengerStreamMismatch: true;
};

export type GiftVisibilityPolicy = {
  senderCanFullReplay: true;
  receiverCanFullReplay: true;
  roomSeesHistoryCard: true;
  roomHistoryVisibleUntilMonthEnd: true;
  roomCanPlayFullscreen: false;
};

export type GiftPlatformPolicies = {
  identity: GiftIdentityPolicy;
  settlement: GiftMonthlySettlementPolicy;
  topUpNameMatch: GiftTopUpNameMatchPolicy;
  visibility: GiftVisibilityPolicy;
};

export type GiftRewardGrantResult = {
  inventoryItem: GiftInventoryItem;
  rewardGiftId: string;
  rewardTier: GiftRewardTier;
  grantedAt: string;
};

export type GiftSendValidationResult = {
  canSend: boolean;
  reason?:
    | "identity_mismatch"
    | "insufficient_balance"
    | "gift_not_active"
    | "gift_not_available_in_program"
    | "receiver_missing"
    | "policy_blocked";
};

export type GiftCatalogSection =
  | "shop"
  | "wheel_of_fortune"
  | "fishing"
  | "inventory"
  | "event_gifts";

export type GiftCatalogEntryPoint = {
  entryId: string;
  section: GiftCatalogSection;
  title: string;
  subtitle?: string;
  sourceProgram: GiftProgramScope;
  isEnabled: boolean;
  sortOrder: number;
};

export type GiftEventWindow = {
  eventId: string;
  eventTag: string;
  title: string;

  availableFrom: string;
  availableUntil: string;

  sourceProgram: GiftProgramScope;
  isActive: boolean;
};

export type GiftMonthlyTransferWindow = {
  userId: string;
  monthKey: string;

  isTransferAllowed: boolean;
  openedAt?: string;
  closedAt?: string;

  transferCountUsed: number;
  transferCountMax: 1;
};

export type GiftRewardEngineContext = {
  userId: string;
  sourceProgram: GiftProgramScope;
  baseProbabilityProfileId: string;
  betMultiplier: GiftBetMultiplier;
  currentMonthKey: string;
};

export type GiftRoomHistoryCardViewModel = {
  messageId: string;
  chatId: string;

  senderUserId: string;
  receiverUserId?: string | null;

  giftId: string;
  title: string;
  shortLabel: string;
  previewAsset: string;

  tier: GiftTier;
  category: GiftCategory;
  rewardTier: GiftRewardTier;

  priceCoin: number;

  visibleToRoomUntil: string;
  isReplayableForSender: boolean;
  isReplayableForReceiver: boolean;
};