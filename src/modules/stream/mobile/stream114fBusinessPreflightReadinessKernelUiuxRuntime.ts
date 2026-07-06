import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114EBusinessProfileContextUiuxEvidence } from "./stream114eBusinessProfileContextKernelUiuxRuntime";

export type Stream114FBusinessPreflightSectionId =
  | "business_mode_ready"
  | "brand_profile_context_ready"
  | "showcase_rail_ready"
  | "contact_lead_ready"
  | "host_controls_ready"
  | "compliance_guard_ready"
  | "kernel_preflight_contract"
  | "merchant_wallet_blocked"
  | "order_payment_blocked"
  | "gifts_deferred_boundary"
  | "next_business_live_gate";

export type Stream114FBusinessPreflightStatus = "ready" | "needs_check";

export type Stream114FBusinessPreflightSection = {
  readonly id: Stream114FBusinessPreflightSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114FBusinessPreflightStatus;
};

export type Stream114FBusinessPreflightUiuxState = {
  readonly version: "STREAM-114F";
  readonly selectedSectionId: Stream114FBusinessPreflightSectionId;
  readonly readySectionIds: readonly Stream114FBusinessPreflightSectionId[];
  readonly lastAction: string;
  readonly businessModeReadyLocal: boolean;
  readonly brandProfileContextReadyLocal: boolean;
  readonly showcaseRailReadyLocal: boolean;
  readonly contactLeadReadyLocal: boolean;
  readonly hostControlsReadyLocal: boolean;
  readonly complianceGuardReadyLocal: boolean;
  readonly kernelPreflightContractReadyLocal: boolean;
  readonly merchantWalletBlockedLocal: boolean;
  readonly orderPaymentBlockedLocal: boolean;
  readonly giftsDeferredBoundaryLocal: boolean;
  readonly nextBusinessLiveGateReadyLocal: boolean;
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
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114FBusinessPreflightUiuxEvidence = {
  readonly version: "STREAM-114F";
  readonly selectedSectionId: Stream114FBusinessPreflightSectionId;
  readonly businessPreflightScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114FBusinessPreflightSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly previousBusinessProfileReady: boolean;
  readonly businessModeReady: boolean;
  readonly brandProfileContextReady: boolean;
  readonly showcaseRailReady: boolean;
  readonly contactLeadReady: boolean;
  readonly hostControlsReady: boolean;
  readonly complianceGuardReady: boolean;
  readonly kernelPreflightContractReady: boolean;
  readonly merchantWalletBlocked: boolean;
  readonly orderPaymentBlocked: boolean;
  readonly giftsDeferredCorrectly: boolean;
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
  readonly fakeBusinessLaunchAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114FBusinessPreflightSectionId[] = [
  "business_mode_ready",
  "brand_profile_context_ready",
  "showcase_rail_ready",
  "contact_lead_ready",
  "host_controls_ready",
  "compliance_guard_ready",
  "kernel_preflight_contract",
  "merchant_wallet_blocked",
  "order_payment_blocked",
  "gifts_deferred_boundary",
  "next_business_live_gate",
];

const SECTION_TITLES: Record<Stream114FBusinessPreflightSectionId, string> = {
  business_mode_ready: "Business режим готов",
  brand_profile_context_ready: "Контекст бренда/профиля",
  showcase_rail_ready: "Витрина",
  contact_lead_ready: "Contact / lead path",
  host_controls_ready: "Host controls",
  compliance_guard_ready: "Compliance guard",
  kernel_preflight_contract: "Kernel preflight contract",
  merchant_wallet_blocked: "Merchant / Wallet закрыты",
  order_payment_blocked: "Order / payment blocked",
  gifts_deferred_boundary: "Подарки в конце",
  next_business_live_gate: "Следующий Business live gate",
};

const SECTION_DESCRIPTIONS: Record<Stream114FBusinessPreflightSectionId, string> = {
  business_mode_ready: "Business Stream can be selected as a UI mode without pretending that provider/backend launch is already active.",
  brand_profile_context_ready: "Business identity, category, owner role and contact context from 114E are required before Business Stream launch readiness.",
  showcase_rail_ready: "Products/services appear as a clean preview rail with request/contact intents, not fake stock, checkout or delivery.",
  contact_lead_ready: "Запрос цены и контактные flows подготовлены как kernel intents без fake Messenger/backend send success.",
  host_controls_ready: "Host can pin, hide, hold and moderate Business Stream content as local UI/kernel intent only.",
  compliance_guard_ready: "Business Q&A, regulated content and audience safety inherit Live AI moderation and 18+ guard copy.",
  kernel_preflight_contract: "Every Business Stream edge must go through Stream core/kernel contracts/facades/events before provider or backend execution.",
  merchant_wallet_blocked: "Merchant, Wallet, invoices, settlement and payouts stay blocked until their real stages.",
  order_payment_blocked: "Order, checkout, payment, fake success and delivery promises stay blocked from this UI stage.",
  gifts_deferred_boundary: "Gift sending is mandatory later and must be implemented correctly at the end of Stream, not in Business preflight.",
  next_business_live_gate: "After preflight, continue with Business live gate/readiness UI/UX, still without fake commerce or direct provider calls.",
};

function uniqueReady(items: readonly Stream114FBusinessPreflightSectionId[]): readonly Stream114FBusinessPreflightSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114FBusinessPreflightUiuxState(): Stream114FBusinessPreflightUiuxState {
  return {
    version: "STREAM-114F",
    selectedSectionId: "business_mode_ready",
    readySectionIds: ["kernel_preflight_contract", "merchant_wallet_blocked", "order_payment_blocked", "gifts_deferred_boundary"],
    lastAction: "114F starts Business Stream preflight: kernel-only, no fake order/payment/gift sending.",
    businessModeReadyLocal: false,
    brandProfileContextReadyLocal: false,
    showcaseRailReadyLocal: false,
    contactLeadReadyLocal: false,
    hostControlsReadyLocal: false,
    complianceGuardReadyLocal: false,
    kernelPreflightContractReadyLocal: true,
    merchantWalletBlockedLocal: true,
    orderPaymentBlockedLocal: true,
    giftsDeferredBoundaryLocal: true,
    nextBusinessLiveGateReadyLocal: false,
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
    fakeBusinessLaunchAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

function setReadyFlag(state: Stream114FBusinessPreflightUiuxState, sectionId: Stream114FBusinessPreflightSectionId): Stream114FBusinessPreflightUiuxState {
  return {
    ...state,
    businessModeReadyLocal: state.businessModeReadyLocal || sectionId === "business_mode_ready",
    brandProfileContextReadyLocal: state.brandProfileContextReadyLocal || sectionId === "brand_profile_context_ready",
    showcaseRailReadyLocal: state.showcaseRailReadyLocal || sectionId === "showcase_rail_ready",
    contactLeadReadyLocal: state.contactLeadReadyLocal || sectionId === "contact_lead_ready",
    hostControlsReadyLocal: state.hostControlsReadyLocal || sectionId === "host_controls_ready",
    complianceGuardReadyLocal: state.complianceGuardReadyLocal || sectionId === "compliance_guard_ready",
    kernelPreflightContractReadyLocal: state.kernelPreflightContractReadyLocal || sectionId === "kernel_preflight_contract",
    merchantWalletBlockedLocal: state.merchantWalletBlockedLocal || sectionId === "merchant_wallet_blocked",
    orderPaymentBlockedLocal: state.orderPaymentBlockedLocal || sectionId === "order_payment_blocked",
    giftsDeferredBoundaryLocal: state.giftsDeferredBoundaryLocal || sectionId === "gifts_deferred_boundary",
    nextBusinessLiveGateReadyLocal: state.nextBusinessLiveGateReadyLocal || sectionId === "next_business_live_gate",
  };
}

export function selectStream114FBusinessPreflightSection(state: Stream114FBusinessPreflightUiuxState, sectionId: Stream114FBusinessPreflightSectionId): Stream114FBusinessPreflightUiuxState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `114F выбран раздел ${SECTION_TITLES[sectionId]} for Business Stream preflight.`,
  };
}

export function markStream114FBusinessPreflightSectionReady(state: Stream114FBusinessPreflightUiuxState, sectionId: Stream114FBusinessPreflightSectionId, action: string): Stream114FBusinessPreflightUiuxState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream114FBusinessPreflightAllReady(state: Stream114FBusinessPreflightUiuxState, action: string): Stream114FBusinessPreflightUiuxState {
  return {
    ...state,
    selectedSectionId: "next_business_live_gate",
    readySectionIds: SECTION_ORDER,
    businessModeReadyLocal: true,
    brandProfileContextReadyLocal: true,
    showcaseRailReadyLocal: true,
    contactLeadReadyLocal: true,
    hostControlsReadyLocal: true,
    complianceGuardReadyLocal: true,
    kernelPreflightContractReadyLocal: true,
    merchantWalletBlockedLocal: true,
    orderPaymentBlockedLocal: true,
    giftsDeferredBoundaryLocal: true,
    nextBusinessLiveGateReadyLocal: true,
    lastAction: action,
  };
}

export function buildStream114FBusinessPreflightUiuxEvidence(
  state: Stream114FBusinessPreflightUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  businessProfileEvidence: Stream114EBusinessProfileContextUiuxEvidence,
): Stream114FBusinessPreflightUiuxEvidence {
  const readySections = uniqueReady(state.readySectionIds);
  const previousBusinessProfileReady = businessProfileEvidence.businessIdentityCardReady
    && businessProfileEvidence.kernelProfileContractReady
    && businessProfileEvidence.merchantWalletBlocked
    && businessProfileEvidence.giftsDeferredCorrectly;
  const totalSections = SECTION_ORDER.length;
  const safeFlagsPassed = [
    state.allConnectionsThroughKernel,
    state.directBusinessProviderAllowed === false,
    state.directRealtimeConnectionAllowed === false,
    state.directMerchantConnectionAllowed === false,
    state.directWalletConnectionAllowed === false,
    state.directGiftPaymentAllowed === false,
    state.scatteredBusinessServiceAllowed === false,
    state.businessBackendTouchedNow === false,
    state.merchantBackendTouchedNow === false,
    state.walletTouchedNow === false,
    state.fakeBusinessLaunchAllowed === false,
    state.fakeOrderAllowed === false,
    state.fakeCheckoutAllowed === false,
    state.fakePaymentAllowed === false,
    state.fakeGiftSendingAllowed === false,
    state.giftSendingImplementedNow === false,
  ].filter(Boolean).length;
  const businessPreflightScore = Math.min(99, Math.round(((readySections.length + safeFlagsPassed + (previousBusinessProfileReady ? 1 : 0)) / (totalSections + 17)) * 100));
  const sectionItems = SECTION_ORDER.map((id): Stream114FBusinessPreflightSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySections.includes(id) ? "ready" : "needs_check",
  }));
  const selectedTitle = SECTION_TITLES[state.selectedSectionId];

  return {
    version: "STREAM-114F",
    selectedSectionId: state.selectedSectionId,
    businessPreflightScore,
    readySections: readySections.length,
    totalSections,
    sectionItems,
    heroTitle: "Business Stream preflight чистый и kernel-bound",
    heroSubtitle: "Business режим, brand context, витрина, контакт, модерация и compliance проверяются до любого реального Merchant, Wallet, order, payment или gift stage.",
    phoneStatus: `${room.title || "Business live"} · ${stage.layout} · preflight safe`,
    primaryAction: `Complete ${selectedTitle} as UI/kernel intent only — no fake order, checkout, payment, Merchant or gift sending.`,
    secondaryAction: state.lastAction,
    previousBusinessProfileReady,
    businessModeReady: state.businessModeReadyLocal,
    brandProfileContextReady: state.brandProfileContextReadyLocal,
    showcaseRailReady: state.showcaseRailReadyLocal,
    contactLeadReady: state.contactLeadReadyLocal,
    hostControlsReady: state.hostControlsReadyLocal,
    complianceGuardReady: state.complianceGuardReadyLocal,
    kernelPreflightContractReady: state.kernelPreflightContractReadyLocal,
    merchantWalletBlocked: state.merchantWalletBlockedLocal,
    orderPaymentBlocked: state.orderPaymentBlockedLocal,
    giftsDeferredCorrectly: state.giftsDeferredBoundaryLocal && state.giftSendingImplementedNow === false,
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
    fakeBusinessLaunchAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
