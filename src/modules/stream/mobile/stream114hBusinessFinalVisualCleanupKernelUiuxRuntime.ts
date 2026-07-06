import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114GBusinessLiveGateUiuxEvidence } from "./stream114gBusinessLiveGateOwnerReadyKernelUiuxRuntime";

export type Stream114HBusinessFinalCleanupSectionId =
  | "business_product_surface"
  | "single_owner_path"
  | "showcase_leads_controls_unified"
  | "profile_business_hooks_on_time"
  | "moderation_compliance_visible"
  | "kernel_boundary_locked"
  | "merchant_wallet_commerce_blocked"
  | "debug_copy_removed"
  | "gifts_deferred_plain"
  | "next_stream_profile_step";

export type Stream114HBusinessFinalCleanupStatus = "ready" | "needs_visual_check";

export type Stream114HBusinessFinalCleanupSection = {
  readonly id: Stream114HBusinessFinalCleanupSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114HBusinessFinalCleanupStatus;
};

export type Stream114HBusinessFinalCleanupState = {
  readonly version: "STREAM-114H";
  readonly selectedSectionId: Stream114HBusinessFinalCleanupSectionId;
  readonly readySectionIds: readonly Stream114HBusinessFinalCleanupSectionId[];
  readonly lastAction: string;
  readonly businessProductSurfaceReadyLocal: boolean;
  readonly singleOwnerPathReadyLocal: boolean;
  readonly showcaseLeadsControlsUnifiedLocal: boolean;
  readonly profileBusinessHooksOnTimeLocal: boolean;
  readonly moderationComplianceVisibleLocal: boolean;
  readonly kernelBoundaryLockedLocal: boolean;
  readonly merchantWalletCommerceBlockedLocal: boolean;
  readonly debugCopyRemovedLocal: boolean;
  readonly giftsDeferredPlainLocal: boolean;
  readonly nextStreamProfileStepReadyLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directBusinessProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directMerchantConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly scatteredBusinessServiceAllowed: false;
  readonly businessBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly fakeBusinessLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114HBusinessFinalCleanupEvidence = {
  readonly version: "STREAM-114H";
  readonly selectedSectionId: Stream114HBusinessFinalCleanupSectionId;
  readonly businessCleanupScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114HBusinessFinalCleanupSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly previousBusinessGateReady: boolean;
  readonly businessProductSurfaceReady: boolean;
  readonly singleOwnerPathReady: boolean;
  readonly showcaseLeadsControlsUnified: boolean;
  readonly profileBusinessHooksOnTime: boolean;
  readonly moderationComplianceVisible: boolean;
  readonly kernelBoundaryLocked: boolean;
  readonly merchantWalletCommerceBlocked: boolean;
  readonly debugCopyRemoved: boolean;
  readonly giftsDeferredPlain: boolean;
  readonly nextStreamProfileStepReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directBusinessProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directMerchantConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly scatteredBusinessServiceAllowed: false;
  readonly businessBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly fakeBusinessLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114HBusinessFinalCleanupSectionId[] = [
  "business_product_surface",
  "single_owner_path",
  "showcase_leads_controls_unified",
  "profile_business_hooks_on_time",
  "moderation_compliance_visible",
  "kernel_boundary_locked",
  "merchant_wallet_commerce_blocked",
  "debug_copy_removed",
  "gifts_deferred_plain",
  "next_stream_profile_step",
];

const SECTION_TITLES: Record<Stream114HBusinessFinalCleanupSectionId, string> = {
  business_product_surface: "Business product surface",
  single_owner_path: "Единый owner path",
  showcase_leads_controls_unified: "Витрина + leads + controls",
  profile_business_hooks_on_time: "Profile/Business hooks",
  moderation_compliance_visible: "Safety видна",
  kernel_boundary_locked: "Kernel boundary",
  merchant_wallet_commerce_blocked: "Коммерция закрыта",
  debug_copy_removed: "Без debug copy",
  gifts_deferred_plain: "Подарки позже",
  next_stream_profile_step: "Следующий profile step",
};

const SECTION_DESCRIPTIONS: Record<Stream114HBusinessFinalCleanupSectionId, string> = {
  business_product_surface: "Business Stream must look like a clean product screen, not a stack of test cards or technical proof blocks.",
  single_owner_path: "The owner sees one path: brand context, showcase, lead/contact, host controls, compliance, live gate, next step.",
  showcase_leads_controls_unified: "Showcase, request-price, contact, lead queue and host controls read as one Business Stream flow.",
  profile_business_hooks_on_time: "Profile and Business hooks are named in Live/Business Stream now, but full profile screen remains the next ordered stage.",
  moderation_compliance_visible: "18+, profanity, insults, reports and Sabi AI review stay visible enough for trust without cluttering the phone screen.",
  kernel_boundary_locked: "Business launch, lead, product, moderation and future gift edges must go only through Stream core/kernel contracts/facades/events.",
  merchant_wallet_commerce_blocked: "Merchant, Wallet, order, checkout, invoice, payout, delivery and stock success remain blocked until their real stages.",
  debug_copy_removed: "Ordinary Business Stream UX must not show debug, smoke, QA or evidence wording outside hidden technical mode.",
  gifts_deferred_plain: "Gift sending is mandatory later and must be implemented correctly, but remains an end-stage boundary for now.",
  next_stream_profile_step: "After this cleanup the correct next ordered step is Stream profile/creator UI/UX, not payments or gifts.",
};

function uniqueReady(items: readonly Stream114HBusinessFinalCleanupSectionId[]): readonly Stream114HBusinessFinalCleanupSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114HBusinessFinalCleanupState(): Stream114HBusinessFinalCleanupState {
  return {
    version: "STREAM-114H",
    selectedSectionId: "business_product_surface",
    readySectionIds: ["kernel_boundary_locked", "merchant_wallet_commerce_blocked", "gifts_deferred_plain"],
    lastAction: "114H starts final Business Stream product cleanup: kernel-only, no fake commerce or gifts.",
    businessProductSurfaceReadyLocal: false,
    singleOwnerPathReadyLocal: false,
    showcaseLeadsControlsUnifiedLocal: false,
    profileBusinessHooksOnTimeLocal: false,
    moderationComplianceVisibleLocal: false,
    kernelBoundaryLockedLocal: true,
    merchantWalletCommerceBlockedLocal: true,
    debugCopyRemovedLocal: false,
    giftsDeferredPlainLocal: true,
    nextStreamProfileStepReadyLocal: false,
    allConnectionsThroughKernel: true,
    directBusinessProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directMerchantConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    scatteredBusinessServiceAllowed: false,
    businessBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    fakeBusinessLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

function setReadyFlag(state: Stream114HBusinessFinalCleanupState, sectionId: Stream114HBusinessFinalCleanupSectionId): Stream114HBusinessFinalCleanupState {
  return {
    ...state,
    businessProductSurfaceReadyLocal: state.businessProductSurfaceReadyLocal || sectionId === "business_product_surface",
    singleOwnerPathReadyLocal: state.singleOwnerPathReadyLocal || sectionId === "single_owner_path",
    showcaseLeadsControlsUnifiedLocal: state.showcaseLeadsControlsUnifiedLocal || sectionId === "showcase_leads_controls_unified",
    profileBusinessHooksOnTimeLocal: state.profileBusinessHooksOnTimeLocal || sectionId === "profile_business_hooks_on_time",
    moderationComplianceVisibleLocal: state.moderationComplianceVisibleLocal || sectionId === "moderation_compliance_visible",
    kernelBoundaryLockedLocal: state.kernelBoundaryLockedLocal || sectionId === "kernel_boundary_locked",
    merchantWalletCommerceBlockedLocal: state.merchantWalletCommerceBlockedLocal || sectionId === "merchant_wallet_commerce_blocked",
    debugCopyRemovedLocal: state.debugCopyRemovedLocal || sectionId === "debug_copy_removed",
    giftsDeferredPlainLocal: state.giftsDeferredPlainLocal || sectionId === "gifts_deferred_plain",
    nextStreamProfileStepReadyLocal: state.nextStreamProfileStepReadyLocal || sectionId === "next_stream_profile_step",
  };
}

export function selectStream114HBusinessFinalCleanupSection(state: Stream114HBusinessFinalCleanupState, sectionId: Stream114HBusinessFinalCleanupSectionId): Stream114HBusinessFinalCleanupState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `114H выбран раздел ${SECTION_TITLES[sectionId]} for Business Stream cleanup.`,
  };
}

export function markStream114HBusinessFinalCleanupSectionReady(state: Stream114HBusinessFinalCleanupState, sectionId: Stream114HBusinessFinalCleanupSectionId, action: string): Stream114HBusinessFinalCleanupState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream114HBusinessFinalCleanupAllReady(state: Stream114HBusinessFinalCleanupState, action: string): Stream114HBusinessFinalCleanupState {
  return {
    ...state,
    selectedSectionId: "next_stream_profile_step",
    readySectionIds: SECTION_ORDER,
    businessProductSurfaceReadyLocal: true,
    singleOwnerPathReadyLocal: true,
    showcaseLeadsControlsUnifiedLocal: true,
    profileBusinessHooksOnTimeLocal: true,
    moderationComplianceVisibleLocal: true,
    kernelBoundaryLockedLocal: true,
    merchantWalletCommerceBlockedLocal: true,
    debugCopyRemovedLocal: true,
    giftsDeferredPlainLocal: true,
    nextStreamProfileStepReadyLocal: true,
    lastAction: action,
  };
}

export function buildStream114HBusinessFinalCleanupEvidence(
  state: Stream114HBusinessFinalCleanupState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  businessLiveGateEvidence: Stream114GBusinessLiveGateUiuxEvidence,
): Stream114HBusinessFinalCleanupEvidence {
  const readySectionIds = uniqueReady(state.readySectionIds);
  const previousBusinessGateReady = businessLiveGateEvidence.businessLiveGateSurfaceReady
    && businessLiveGateEvidence.ownerReadyHandoffReady
    && businessLiveGateEvidence.kernelLaunchGateReady
    && businessLiveGateEvidence.businessProfileContextLocked
    && businessLiveGateEvidence.moderationComplianceLocked
    && businessLiveGateEvidence.merchantWalletOrderPaymentBlocked
    && businessLiveGateEvidence.noFakeBusinessLive
    && businessLiveGateEvidence.giftsDeferredCorrectly;
  const businessProductSurfaceReady = state.businessProductSurfaceReadyLocal && previousBusinessGateReady;
  const singleOwnerPathReady = state.singleOwnerPathReadyLocal && businessProductSurfaceReady;
  const showcaseLeadsControlsUnified = state.showcaseLeadsControlsUnifiedLocal && previousBusinessGateReady;
  const profileBusinessHooksOnTime = state.profileBusinessHooksOnTimeLocal && businessLiveGateEvidence.businessProfileContextLocked;
  const moderationComplianceVisible = state.moderationComplianceVisibleLocal && businessLiveGateEvidence.moderationComplianceLocked;
  const kernelBoundaryLocked = state.kernelBoundaryLockedLocal && businessLiveGateEvidence.kernelLaunchGateReady && state.allConnectionsThroughKernel;
  const merchantWalletCommerceBlocked = state.merchantWalletCommerceBlockedLocal && businessLiveGateEvidence.merchantWalletOrderPaymentBlocked;
  const debugCopyRemoved = state.debugCopyRemovedLocal;
  const giftsDeferredPlain = state.giftsDeferredPlainLocal && businessLiveGateEvidence.giftsDeferredCorrectly;
  const nextStreamProfileStepReady = state.nextStreamProfileStepReadyLocal && businessLiveGateEvidence.nextStreamProfileScreenReady;
  const readyFlags = [
    businessProductSurfaceReady,
    singleOwnerPathReady,
    showcaseLeadsControlsUnified,
    profileBusinessHooksOnTime,
    moderationComplianceVisible,
    kernelBoundaryLocked,
    merchantWalletCommerceBlocked,
    debugCopyRemoved,
    giftsDeferredPlain,
    nextStreamProfileStepReady,
  ];
  const readySections = readyFlags.filter(Boolean).length;
  const sectionItems = SECTION_ORDER.map((id): Stream114HBusinessFinalCleanupSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySectionIds.includes(id) ? "ready" : "needs_visual_check",
  }));
  const roomTitle = room.title || "Business Stream";
  const stageBlocked = stage.status === "broadcast_handoff_blocked";
  return {
    version: "STREAM-114H",
    selectedSectionId: state.selectedSectionId,
    businessCleanupScore: Math.round((readySections / SECTION_ORDER.length) * 100),
    readySections,
    totalSections: SECTION_ORDER.length,
    sectionItems,
    heroTitle: previousBusinessGateReady ? "Business Stream выглядит как цельный продуктовый экран" : "Сначала закрой 114G Business live gate",
    heroSubtitle: `${roomTitle}: brand → showcase → lead → controls → compliance → kernel gate. Без fake order/payment/gifts.`,
    phoneStatus: stageBlocked ? "Business preview · запуск закрыт kernel/provider" : "Business Stream product cleanup",
    primaryAction: "Показать owner-ready Business Stream без техмусора и без ложного запуска.",
    secondaryAction: nextStreamProfileStepReady ? "Следующий правильный этап: Stream profile / creator UI/UX." : "Закрой финальную чистку Business Stream, затем переходи к профилю Stream.",
    previousBusinessGateReady,
    businessProductSurfaceReady,
    singleOwnerPathReady,
    showcaseLeadsControlsUnified,
    profileBusinessHooksOnTime,
    moderationComplianceVisible,
    kernelBoundaryLocked,
    merchantWalletCommerceBlocked,
    debugCopyRemoved,
    giftsDeferredPlain,
    nextStreamProfileStepReady,
    allConnectionsThroughKernel: true,
    directBusinessProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directMerchantConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    scatteredBusinessServiceAllowed: false,
    businessBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    fakeBusinessLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
