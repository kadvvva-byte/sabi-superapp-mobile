import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114HBusinessFinalCleanupEvidence } from "./stream114hBusinessFinalVisualCleanupKernelUiuxRuntime";

export type Stream114IBusinessAcceptanceSectionId =
  | "business_acceptance_summary"
  | "clean_owner_screen_ready"
  | "showcase_lead_gate_ready"
  | "compliance_safety_locked"
  | "profile_creator_next_ready"
  | "kernel_boundary_verified"
  | "commerce_blocked_verified"
  | "gifts_deferred_verified"
  | "no_fake_runtime_asserted"
  | "stream_overall_next_step";

export type Stream114IBusinessAcceptanceStatus = "accepted" | "needs_owner_check";

export type Stream114IBusinessAcceptanceSection = {
  readonly id: Stream114IBusinessAcceptanceSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114IBusinessAcceptanceStatus;
};

export type Stream114IBusinessAcceptanceState = {
  readonly version: "STREAM-114I";
  readonly selectedSectionId: Stream114IBusinessAcceptanceSectionId;
  readonly acceptedSectionIds: readonly Stream114IBusinessAcceptanceSectionId[];
  readonly lastAction: string;
  readonly businessAcceptanceSummaryLocal: boolean;
  readonly cleanOwnerScreenReadyLocal: boolean;
  readonly showcaseLeadGateReadyLocal: boolean;
  readonly complianceSafetyLockedLocal: boolean;
  readonly profileCreatorNextReadyLocal: boolean;
  readonly kernelBoundaryVerifiedLocal: boolean;
  readonly commerceBlockedVerifiedLocal: boolean;
  readonly giftsDeferredVerifiedLocal: boolean;
  readonly noFakeRuntimeAssertedLocal: boolean;
  readonly streamOverallNextStepLocal: boolean;
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
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeBusinessLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114IBusinessAcceptanceEvidence = {
  readonly version: "STREAM-114I";
  readonly selectedSectionId: Stream114IBusinessAcceptanceSectionId;
  readonly businessAcceptanceScore: number;
  readonly acceptedSections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114IBusinessAcceptanceSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly previousBusinessCleanupReady: boolean;
  readonly businessAcceptanceSummaryReady: boolean;
  readonly cleanOwnerScreenReady: boolean;
  readonly showcaseLeadGateReady: boolean;
  readonly complianceSafetyLocked: boolean;
  readonly profileCreatorNextReady: boolean;
  readonly kernelBoundaryVerified: boolean;
  readonly commerceBlockedVerified: boolean;
  readonly giftsDeferredVerified: boolean;
  readonly noFakeRuntimeAsserted: boolean;
  readonly streamOverallNextStepReady: boolean;
  readonly businessStreamUiuxAccepted: boolean;
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
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeBusinessLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114IBusinessAcceptanceSectionId[] = [
  "business_acceptance_summary",
  "clean_owner_screen_ready",
  "showcase_lead_gate_ready",
  "compliance_safety_locked",
  "profile_creator_next_ready",
  "kernel_boundary_verified",
  "commerce_blocked_verified",
  "gifts_deferred_verified",
  "no_fake_runtime_asserted",
  "stream_overall_next_step",
];

const SECTION_TITLES: Record<Stream114IBusinessAcceptanceSectionId, string> = {
  business_acceptance_summary: "Business acceptance",
  clean_owner_screen_ready: "Чистый owner screen",
  showcase_lead_gate_ready: "Витрина + leads",
  compliance_safety_locked: "Safety закрыта",
  profile_creator_next_ready: "Profile next",
  kernel_boundary_verified: "Kernel verified",
  commerce_blocked_verified: "Коммерция закрыта",
  gifts_deferred_verified: "Подарки позже",
  no_fake_runtime_asserted: "Без fake runtime",
  stream_overall_next_step: "Следующий Stream step",
};

const SECTION_DESCRIPTIONS: Record<Stream114IBusinessAcceptanceSectionId, string> = {
  business_acceptance_summary: "Business Stream is accepted as UI/UX and kernel-intent, not as live commerce/backend execution.",
  clean_owner_screen_ready: "Owner sees a clean product path without debug, smoke, QA or evidence wording in the normal screen.",
  showcase_lead_gate_ready: "Витрина, запрос цены, контакт и lead review — понятные UI intents без видимости order success.",
  compliance_safety_locked: "18+, profanity, insult, reports and Sabi AI moderation remain visible and inherited from Live.",
  profile_creator_next_ready: "The next ordered stage is Stream profile/creator UI/UX; hooks were added on time inside Live/Business Stream.",
  kernel_boundary_verified: "Business Stream connections must use Stream core/kernel contracts, facades and events only.",
  commerce_blocked_verified: "Merchant, Wallet, order, checkout, invoice, stock, delivery, payout and payment stay blocked until real stages.",
  gifts_deferred_verified: "Gift sending is mandatory later and must be correct, but no gift send/payment exists in this Business stage.",
  no_fake_runtime_asserted: "No fake Business live, fake realtime, fake provider, fake order, fake payment or fake gift sending is allowed.",
  stream_overall_next_step: "After Business acceptance, continue Stream profile/creator UI/UX before Shorts final and gifts/monetization.",
};

function uniqueAccepted(items: readonly Stream114IBusinessAcceptanceSectionId[]): readonly Stream114IBusinessAcceptanceSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114IBusinessAcceptanceState(): Stream114IBusinessAcceptanceState {
  return {
    version: "STREAM-114I",
    selectedSectionId: "business_acceptance_summary",
    acceptedSectionIds: ["kernel_boundary_verified", "commerce_blocked_verified", "gifts_deferred_verified", "no_fake_runtime_asserted"],
    lastAction: "114I starts Business Stream acceptance: UI/UX only, kernel-only, no fake commerce/gifts.",
    businessAcceptanceSummaryLocal: false,
    cleanOwnerScreenReadyLocal: false,
    showcaseLeadGateReadyLocal: false,
    complianceSafetyLockedLocal: false,
    profileCreatorNextReadyLocal: false,
    kernelBoundaryVerifiedLocal: true,
    commerceBlockedVerifiedLocal: true,
    giftsDeferredVerifiedLocal: true,
    noFakeRuntimeAssertedLocal: true,
    streamOverallNextStepLocal: false,
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
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
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

function setAcceptedFlag(state: Stream114IBusinessAcceptanceState, sectionId: Stream114IBusinessAcceptanceSectionId): Stream114IBusinessAcceptanceState {
  return {
    ...state,
    businessAcceptanceSummaryLocal: state.businessAcceptanceSummaryLocal || sectionId === "business_acceptance_summary",
    cleanOwnerScreenReadyLocal: state.cleanOwnerScreenReadyLocal || sectionId === "clean_owner_screen_ready",
    showcaseLeadGateReadyLocal: state.showcaseLeadGateReadyLocal || sectionId === "showcase_lead_gate_ready",
    complianceSafetyLockedLocal: state.complianceSafetyLockedLocal || sectionId === "compliance_safety_locked",
    profileCreatorNextReadyLocal: state.profileCreatorNextReadyLocal || sectionId === "profile_creator_next_ready",
    kernelBoundaryVerifiedLocal: state.kernelBoundaryVerifiedLocal || sectionId === "kernel_boundary_verified",
    commerceBlockedVerifiedLocal: state.commerceBlockedVerifiedLocal || sectionId === "commerce_blocked_verified",
    giftsDeferredVerifiedLocal: state.giftsDeferredVerifiedLocal || sectionId === "gifts_deferred_verified",
    noFakeRuntimeAssertedLocal: state.noFakeRuntimeAssertedLocal || sectionId === "no_fake_runtime_asserted",
    streamOverallNextStepLocal: state.streamOverallNextStepLocal || sectionId === "stream_overall_next_step",
  };
}

export function selectStream114IBusinessAcceptanceSection(state: Stream114IBusinessAcceptanceState, sectionId: Stream114IBusinessAcceptanceSectionId): Stream114IBusinessAcceptanceState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `114I выбран раздел ${SECTION_TITLES[sectionId]} for Business Stream acceptance.`,
  };
}

export function markStream114IBusinessAcceptanceSectionReady(state: Stream114IBusinessAcceptanceState, sectionId: Stream114IBusinessAcceptanceSectionId, action: string): Stream114IBusinessAcceptanceState {
  const next = setAcceptedFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    acceptedSectionIds: uniqueAccepted([...next.acceptedSectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream114IBusinessAcceptanceAllReady(state: Stream114IBusinessAcceptanceState, action: string): Stream114IBusinessAcceptanceState {
  return {
    ...state,
    selectedSectionId: "stream_overall_next_step",
    acceptedSectionIds: SECTION_ORDER,
    businessAcceptanceSummaryLocal: true,
    cleanOwnerScreenReadyLocal: true,
    showcaseLeadGateReadyLocal: true,
    complianceSafetyLockedLocal: true,
    profileCreatorNextReadyLocal: true,
    kernelBoundaryVerifiedLocal: true,
    commerceBlockedVerifiedLocal: true,
    giftsDeferredVerifiedLocal: true,
    noFakeRuntimeAssertedLocal: true,
    streamOverallNextStepLocal: true,
    lastAction: action,
  };
}

export function buildStream114IBusinessAcceptanceEvidence(
  state: Stream114IBusinessAcceptanceState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  businessCleanupEvidence: Stream114HBusinessFinalCleanupEvidence,
): Stream114IBusinessAcceptanceEvidence {
  const acceptedSectionIds = uniqueAccepted(state.acceptedSectionIds);
  const previousBusinessCleanupReady = businessCleanupEvidence.businessProductSurfaceReady
    && businessCleanupEvidence.singleOwnerPathReady
    && businessCleanupEvidence.showcaseLeadsControlsUnified
    && businessCleanupEvidence.profileBusinessHooksOnTime
    && businessCleanupEvidence.moderationComplianceVisible
    && businessCleanupEvidence.kernelBoundaryLocked
    && businessCleanupEvidence.merchantWalletCommerceBlocked
    && businessCleanupEvidence.debugCopyRemoved
    && businessCleanupEvidence.giftsDeferredPlain
    && businessCleanupEvidence.nextStreamProfileStepReady;

  const businessAcceptanceSummaryReady = state.businessAcceptanceSummaryLocal && previousBusinessCleanupReady;
  const cleanOwnerScreenReady = state.cleanOwnerScreenReadyLocal && businessCleanupEvidence.debugCopyRemoved;
  const showcaseLeadGateReady = state.showcaseLeadGateReadyLocal && businessCleanupEvidence.showcaseLeadsControlsUnified;
  const complianceSafetyLocked = state.complianceSafetyLockedLocal && businessCleanupEvidence.moderationComplianceVisible;
  const profileCreatorNextReady = state.profileCreatorNextReadyLocal && businessCleanupEvidence.nextStreamProfileStepReady;
  const kernelBoundaryVerified = state.kernelBoundaryVerifiedLocal && businessCleanupEvidence.kernelBoundaryLocked && state.allConnectionsThroughKernel;
  const commerceBlockedVerified = state.commerceBlockedVerifiedLocal && businessCleanupEvidence.merchantWalletCommerceBlocked;
  const giftsDeferredVerified = state.giftsDeferredVerifiedLocal && businessCleanupEvidence.giftsDeferredPlain;
  const noFakeRuntimeAsserted = state.noFakeRuntimeAssertedLocal
    && state.fakeBusinessLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeOrderAllowed === false
    && state.fakeCheckoutAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false;
  const streamOverallNextStepReady = state.streamOverallNextStepLocal && profileCreatorNextReady;
  const readyFlags = [
    businessAcceptanceSummaryReady,
    cleanOwnerScreenReady,
    showcaseLeadGateReady,
    complianceSafetyLocked,
    profileCreatorNextReady,
    kernelBoundaryVerified,
    commerceBlockedVerified,
    giftsDeferredVerified,
    noFakeRuntimeAsserted,
    streamOverallNextStepReady,
  ];
  const acceptedSections = readyFlags.filter(Boolean).length;
  const businessStreamUiuxAccepted = readyFlags.every(Boolean);
  const sectionItems = SECTION_ORDER.map((id): Stream114IBusinessAcceptanceSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: acceptedSectionIds.includes(id) ? "accepted" : "needs_owner_check",
  }));
  const roomTitle = room.title || "Business Stream";
  const launchBlocked = stage.status === "broadcast_handoff_blocked" || businessCleanupEvidence.fakeBusinessLiveAllowed === false;
  return {
    version: "STREAM-114I",
    selectedSectionId: state.selectedSectionId,
    businessAcceptanceScore: Math.round((acceptedSections / SECTION_ORDER.length) * 100),
    acceptedSections,
    totalSections: SECTION_ORDER.length,
    sectionItems,
    heroTitle: businessStreamUiuxAccepted ? "Business Stream UI/UX принят как продуктовый этап" : "Закрой Business Stream acceptance перед профилем",
    heroSubtitle: `${roomTitle}: Business path accepted as UI/kernel-intent only. Commerce, provider and gifts stay blocked until real stages.`,
    phoneStatus: launchBlocked ? "Business принят · real launch закрыт kernel/provider" : "Business acceptance review",
    primaryAction: "Зафиксировать Business Stream как clean UI/UX handoff без fake order/payment/gifts.",
    secondaryAction: streamOverallNextStepReady ? "Следующий этап: Stream profile / creator UI/UX." : "Прими все Business Stream пункты, затем переходи к профилю/creator.",
    previousBusinessCleanupReady,
    businessAcceptanceSummaryReady,
    cleanOwnerScreenReady,
    showcaseLeadGateReady,
    complianceSafetyLocked,
    profileCreatorNextReady,
    kernelBoundaryVerified,
    commerceBlockedVerified,
    giftsDeferredVerified,
    noFakeRuntimeAsserted,
    streamOverallNextStepReady,
    businessStreamUiuxAccepted,
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
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
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
