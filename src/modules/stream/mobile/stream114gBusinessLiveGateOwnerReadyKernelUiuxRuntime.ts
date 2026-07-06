import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114FBusinessPreflightUiuxEvidence } from "./stream114fBusinessPreflightReadinessKernelUiuxRuntime";

export type Stream114GBusinessLiveGateSectionId =
  | "business_live_gate_surface"
  | "owner_ready_handoff"
  | "kernel_launch_gate"
  | "live_surface_preview"
  | "business_profile_context_locked"
  | "moderation_compliance_locked"
  | "merchant_wallet_order_payment_blocked"
  | "no_fake_business_live"
  | "gifts_end_stage_boundary"
  | "next_stream_profile_screen";

export type Stream114GBusinessLiveGateStatus = "ready" | "needs_owner_check";

export type Stream114GBusinessLiveGateSection = {
  readonly id: Stream114GBusinessLiveGateSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114GBusinessLiveGateStatus;
};

export type Stream114GBusinessLiveGateUiuxState = {
  readonly version: "STREAM-114G";
  readonly selectedSectionId: Stream114GBusinessLiveGateSectionId;
  readonly readySectionIds: readonly Stream114GBusinessLiveGateSectionId[];
  readonly lastAction: string;
  readonly businessLiveGateSurfaceReadyLocal: boolean;
  readonly ownerReadyHandoffReadyLocal: boolean;
  readonly kernelLaunchGateReadyLocal: boolean;
  readonly liveSurfacePreviewReadyLocal: boolean;
  readonly businessProfileContextLockedLocal: boolean;
  readonly moderationComplianceLockedLocal: boolean;
  readonly merchantWalletOrderPaymentBlockedLocal: boolean;
  readonly noFakeBusinessLiveLocal: boolean;
  readonly giftsEndStageBoundaryLocal: boolean;
  readonly nextStreamProfileScreenReadyLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directBusinessProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directMerchantConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly scatteredBusinessServiceAllowed: false;
  readonly businessProviderStartedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly fakeBusinessLiveAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114GBusinessLiveGateUiuxEvidence = {
  readonly version: "STREAM-114G";
  readonly selectedSectionId: Stream114GBusinessLiveGateSectionId;
  readonly businessLiveGateScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114GBusinessLiveGateSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly previousBusinessPreflightReady: boolean;
  readonly businessLiveGateSurfaceReady: boolean;
  readonly ownerReadyHandoffReady: boolean;
  readonly kernelLaunchGateReady: boolean;
  readonly liveSurfacePreviewReady: boolean;
  readonly businessProfileContextLocked: boolean;
  readonly moderationComplianceLocked: boolean;
  readonly merchantWalletOrderPaymentBlocked: boolean;
  readonly noFakeBusinessLive: boolean;
  readonly giftsDeferredCorrectly: boolean;
  readonly nextStreamProfileScreenReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directBusinessProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directMerchantConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly scatteredBusinessServiceAllowed: false;
  readonly businessProviderStartedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly fakeBusinessLiveAllowed: false;
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114GBusinessLiveGateSectionId[] = [
  "business_live_gate_surface",
  "owner_ready_handoff",
  "kernel_launch_gate",
  "live_surface_preview",
  "business_profile_context_locked",
  "moderation_compliance_locked",
  "merchant_wallet_order_payment_blocked",
  "no_fake_business_live",
  "gifts_end_stage_boundary",
  "next_stream_profile_screen",
];

const SECTION_TITLES: Record<Stream114GBusinessLiveGateSectionId, string> = {
  business_live_gate_surface: "Business live gate",
  owner_ready_handoff: "Owner-ready handoff",
  kernel_launch_gate: "Kernel launch gate",
  live_surface_preview: "Business live preview",
  business_profile_context_locked: "Business context закрыт",
  moderation_compliance_locked: "Модерация закрыта",
  merchant_wallet_order_payment_blocked: "Коммерция закрыта",
  no_fake_business_live: "Без fake Business live",
  gifts_end_stage_boundary: "Подарки в конце",
  next_stream_profile_screen: "Следующий Stream profile",
};

const SECTION_DESCRIPTIONS: Record<Stream114GBusinessLiveGateSectionId, string> = {
  business_live_gate_surface: "Business Stream gets a final live-gate surface that shows readiness without pretending the provider/backend is running.",
  owner_ready_handoff: "The owner sees what is ready, what remains blocked, and why real Business live needs kernel/backend/provider gates later.",
  kernel_launch_gate: "Every future Business live start, sync, product event, lead and moderation event must pass through Stream kernel contracts/facades/events.",
  live_surface_preview: "The UI can preview the Business live room surface, showcase and contact path without fake on-air state or fake commerce.",
  business_profile_context_locked: "Business profile/context from 114E stays connected on time, but a separate profile screen is still a later Stream step.",
  moderation_compliance_locked: "18+, profanity, insults, reports and Sabi AI review remain inherited from Live/Business controls.",
  merchant_wallet_order_payment_blocked: "Merchant, Wallet, order, checkout, invoice, payout, delivery and stock success remain blocked until their real stages.",
  no_fake_business_live: "No fake Business live, no direct provider, no direct realtime, no fake launch, no fake backend success.",
  gifts_end_stage_boundary: "Gift sending is mandatory later and must be correct, but it remains end-stage and is not implemented now.",
  next_stream_profile_screen: "After Business live gate, continue Stream overall with streamer/profile UI/UX, not payments or gifts.",
};

function uniqueReady(items: readonly Stream114GBusinessLiveGateSectionId[]): readonly Stream114GBusinessLiveGateSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114GBusinessLiveGateUiuxState(): Stream114GBusinessLiveGateUiuxState {
  return {
    version: "STREAM-114G",
    selectedSectionId: "business_live_gate_surface",
    readySectionIds: ["kernel_launch_gate", "merchant_wallet_order_payment_blocked", "no_fake_business_live", "gifts_end_stage_boundary"],
    lastAction: "114G starts Business live gate: owner-ready UI/kernel handoff only, no fake provider, commerce or gifts.",
    businessLiveGateSurfaceReadyLocal: false,
    ownerReadyHandoffReadyLocal: false,
    kernelLaunchGateReadyLocal: true,
    liveSurfacePreviewReadyLocal: false,
    businessProfileContextLockedLocal: false,
    moderationComplianceLockedLocal: false,
    merchantWalletOrderPaymentBlockedLocal: true,
    noFakeBusinessLiveLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextStreamProfileScreenReadyLocal: false,
    allConnectionsThroughKernel: true,
    directBusinessProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directMerchantConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    scatteredBusinessServiceAllowed: false,
    businessProviderStartedNow: false,
    businessBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    fakeBusinessLiveAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

function setReadyFlag(state: Stream114GBusinessLiveGateUiuxState, sectionId: Stream114GBusinessLiveGateSectionId): Stream114GBusinessLiveGateUiuxState {
  return {
    ...state,
    businessLiveGateSurfaceReadyLocal: state.businessLiveGateSurfaceReadyLocal || sectionId === "business_live_gate_surface",
    ownerReadyHandoffReadyLocal: state.ownerReadyHandoffReadyLocal || sectionId === "owner_ready_handoff",
    kernelLaunchGateReadyLocal: state.kernelLaunchGateReadyLocal || sectionId === "kernel_launch_gate",
    liveSurfacePreviewReadyLocal: state.liveSurfacePreviewReadyLocal || sectionId === "live_surface_preview",
    businessProfileContextLockedLocal: state.businessProfileContextLockedLocal || sectionId === "business_profile_context_locked",
    moderationComplianceLockedLocal: state.moderationComplianceLockedLocal || sectionId === "moderation_compliance_locked",
    merchantWalletOrderPaymentBlockedLocal: state.merchantWalletOrderPaymentBlockedLocal || sectionId === "merchant_wallet_order_payment_blocked",
    noFakeBusinessLiveLocal: state.noFakeBusinessLiveLocal || sectionId === "no_fake_business_live",
    giftsEndStageBoundaryLocal: state.giftsEndStageBoundaryLocal || sectionId === "gifts_end_stage_boundary",
    nextStreamProfileScreenReadyLocal: state.nextStreamProfileScreenReadyLocal || sectionId === "next_stream_profile_screen",
  };
}

export function selectStream114GBusinessLiveGateSection(state: Stream114GBusinessLiveGateUiuxState, sectionId: Stream114GBusinessLiveGateSectionId): Stream114GBusinessLiveGateUiuxState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `114G выбран раздел ${SECTION_TITLES[sectionId]} for Business live gate.`
  };
}

export function markStream114GBusinessLiveGateSectionReady(state: Stream114GBusinessLiveGateUiuxState, sectionId: Stream114GBusinessLiveGateSectionId, action: string): Stream114GBusinessLiveGateUiuxState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream114GBusinessLiveGateAllReady(state: Stream114GBusinessLiveGateUiuxState, action: string): Stream114GBusinessLiveGateUiuxState {
  return {
    ...state,
    selectedSectionId: "next_stream_profile_screen",
    readySectionIds: SECTION_ORDER,
    businessLiveGateSurfaceReadyLocal: true,
    ownerReadyHandoffReadyLocal: true,
    kernelLaunchGateReadyLocal: true,
    liveSurfacePreviewReadyLocal: true,
    businessProfileContextLockedLocal: true,
    moderationComplianceLockedLocal: true,
    merchantWalletOrderPaymentBlockedLocal: true,
    noFakeBusinessLiveLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextStreamProfileScreenReadyLocal: true,
    lastAction: action,
  };
}

export function buildStream114GBusinessLiveGateUiuxEvidence(
  state: Stream114GBusinessLiveGateUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  businessPreflightEvidence: Stream114FBusinessPreflightUiuxEvidence,
): Stream114GBusinessLiveGateUiuxEvidence {
  const readySections = uniqueReady(state.readySectionIds);
  const previousBusinessPreflightReady = businessPreflightEvidence.businessModeReady
    && businessPreflightEvidence.brandProfileContextReady
    && businessPreflightEvidence.showcaseRailReady
    && businessPreflightEvidence.contactLeadReady
    && businessPreflightEvidence.kernelPreflightContractReady
    && businessPreflightEvidence.merchantWalletBlocked
    && businessPreflightEvidence.orderPaymentBlocked
    && businessPreflightEvidence.giftsDeferredCorrectly;
  const totalSections = SECTION_ORDER.length;
  const safeFlagsPassed = [
    state.allConnectionsThroughKernel,
    state.directBusinessProviderAllowed === false,
    state.directRealtimeConnectionAllowed === false,
    state.directMerchantConnectionAllowed === false,
    state.directWalletConnectionAllowed === false,
    state.directGiftPaymentAllowed === false,
    state.scatteredBusinessServiceAllowed === false,
    state.businessProviderStartedNow === false,
    state.businessBackendTouchedNow === false,
    state.merchantBackendTouchedNow === false,
    state.walletTouchedNow === false,
    state.fakeBusinessLiveAllowed === false,
    state.fakeBusinessLaunchAllowed === false,
    state.fakeOrderAllowed === false,
    state.fakeCheckoutAllowed === false,
    state.fakePaymentAllowed === false,
    state.fakeGiftSendingAllowed === false,
    state.giftSendingImplementedNow === false,
  ].filter(Boolean).length;
  const businessLiveGateScore = Math.min(99, Math.round(((readySections.length + safeFlagsPassed + (previousBusinessPreflightReady ? 1 : 0)) / (totalSections + 19)) * 100));
  const sectionItems = SECTION_ORDER.map((id): Stream114GBusinessLiveGateSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySections.includes(id) ? "ready" : "needs_owner_check",
  }));
  const selectedTitle = SECTION_TITLES[state.selectedSectionId];

  return {
    version: "STREAM-114G",
    selectedSectionId: state.selectedSectionId,
    businessLiveGateScore,
    readySections: readySections.length,
    totalSections,
    sectionItems,
    heroTitle: "Business Stream live gate owner-ready и kernel-bound",
    heroSubtitle: "Business Stream можно показать как чистый product flow, а real live launch, Merchant, Wallet, order, payment и gifts честно закрыты до своих этапов.",
    phoneStatus: `${room.title || "Business live"} · ${stage.layout} · owner-ready gate`,
    primaryAction: `Complete ${selectedTitle} as a UI/kernel readiness step only — no fake Business live, provider, order, payment or gift sending.`,
    secondaryAction: state.lastAction,
    previousBusinessPreflightReady,
    businessLiveGateSurfaceReady: state.businessLiveGateSurfaceReadyLocal,
    ownerReadyHandoffReady: state.ownerReadyHandoffReadyLocal,
    kernelLaunchGateReady: state.kernelLaunchGateReadyLocal,
    liveSurfacePreviewReady: state.liveSurfacePreviewReadyLocal,
    businessProfileContextLocked: state.businessProfileContextLockedLocal,
    moderationComplianceLocked: state.moderationComplianceLockedLocal,
    merchantWalletOrderPaymentBlocked: state.merchantWalletOrderPaymentBlockedLocal,
    noFakeBusinessLive: state.noFakeBusinessLiveLocal,
    giftsDeferredCorrectly: state.giftsEndStageBoundaryLocal && state.giftSendingImplementedNow === false,
    nextStreamProfileScreenReady: state.nextStreamProfileScreenReadyLocal,
    allConnectionsThroughKernel: true,
    directBusinessProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directMerchantConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    scatteredBusinessServiceAllowed: false,
    businessProviderStartedNow: false,
    businessBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    fakeBusinessLiveAllowed: false,
    fakeBusinessLaunchAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
