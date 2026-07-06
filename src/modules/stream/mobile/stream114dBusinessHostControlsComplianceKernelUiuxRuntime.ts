import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114CBusinessContactLeadUiuxEvidence } from "./stream114cBusinessContactLeadKernelUiuxRuntime";

export type Stream114DBusinessHostControlsSectionId =
  | "host_control_surface"
  | "showcase_visibility_control"
  | "pin_product_intent"
  | "hide_hold_product_intent"
  | "business_qna_moderation"
  | "compliance_disclosure"
  | "lead_queue_review"
  | "kernel_event_contract"
  | "order_payment_blocked"
  | "gifts_end_stage_boundary"
  | "next_business_profile_setup";

export type Stream114DBusinessHostControlsStatus = "ready" | "needs_owner_check";

export type Stream114DBusinessHostControlsSection = {
  readonly id: Stream114DBusinessHostControlsSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114DBusinessHostControlsStatus;
};

export type Stream114DBusinessHostActionId = "pin_showcase" | "hide_showcase" | "hold_for_review" | "answer_question";

export type Stream114DBusinessHostAction = {
  readonly id: Stream114DBusinessHostActionId;
  readonly title: string;
  readonly description: string;
  readonly kernelEventName: string;
  readonly safeState: "intent_only";
};

export type Stream114DBusinessHostControlsComplianceUiuxState = {
  readonly version: "STREAM-114D";
  readonly selectedSectionId: Stream114DBusinessHostControlsSectionId;
  readonly readySectionIds: readonly Stream114DBusinessHostControlsSectionId[];
  readonly selectedActionId: Stream114DBusinessHostActionId;
  readonly lastAction: string;
  readonly hostControlSurfaceReadyLocal: boolean;
  readonly showcaseVisibilityControlLocal: boolean;
  readonly pinProductIntentLocal: boolean;
  readonly hideHoldProductIntentLocal: boolean;
  readonly businessQnaModerationLocal: boolean;
  readonly complianceDisclosureLocal: boolean;
  readonly leadQueueReviewLocal: boolean;
  readonly kernelEventContractLocal: boolean;
  readonly orderPaymentBlockedLocal: boolean;
  readonly giftsEndStageBoundaryLocal: boolean;
  readonly nextBusinessProfileSetupLocal: boolean;
  readonly businessLeadFlowMustStayReady: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directMerchantConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly walletTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly orderBackendTouchedNow: false;
  readonly moderationBackendTouchedNow: false;
  readonly fakePinPublishedAllowed: false;
  readonly fakeHideEnforcedAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeInvoiceAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114DBusinessHostControlsComplianceUiuxEvidence = {
  readonly version: "STREAM-114D";
  readonly selectedSectionId: Stream114DBusinessHostControlsSectionId;
  readonly selectedActionId: Stream114DBusinessHostActionId;
  readonly hostControlsScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114DBusinessHostControlsSection[];
  readonly hostActions: readonly Stream114DBusinessHostAction[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeActionTitle: string;
  readonly activeActionMeta: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly leadFlowReadyBeforeHostControls: boolean;
  readonly hostControlSurfaceReady: boolean;
  readonly showcaseVisibilityControlReady: boolean;
  readonly pinProductIntentReady: boolean;
  readonly hideHoldProductIntentReady: boolean;
  readonly businessQnaModerationReady: boolean;
  readonly complianceDisclosureReady: boolean;
  readonly leadQueueReviewReady: boolean;
  readonly kernelEventContractReady: boolean;
  readonly orderPaymentBlocked: boolean;
  readonly giftsDeferredCorrectly: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directMerchantConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly walletTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly orderBackendTouchedNow: false;
  readonly moderationBackendTouchedNow: false;
  readonly fakePinPublishedAllowed: false;
  readonly fakeHideEnforcedAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeInvoiceAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114DBusinessHostControlsSectionId[] = [
  "host_control_surface",
  "showcase_visibility_control",
  "pin_product_intent",
  "hide_hold_product_intent",
  "business_qna_moderation",
  "compliance_disclosure",
  "lead_queue_review",
  "kernel_event_contract",
  "order_payment_blocked",
  "gifts_end_stage_boundary",
  "next_business_profile_setup",
];

const SECTION_TITLES: Record<Stream114DBusinessHostControlsSectionId, string> = {
  host_control_surface: "Экран host controls",
  showcase_visibility_control: "Видимость витрины",
  pin_product_intent: "Intent закрепления товара",
  hide_hold_product_intent: "Скрыть / hold intent",
  business_qna_moderation: "Business Q&A модерация",
  compliance_disclosure: "Compliance disclosure",
  lead_queue_review: "Lead queue review",
  kernel_event_contract: "Kernel event contract",
  order_payment_blocked: "Order / payment blocked",
  gifts_end_stage_boundary: "Подарки в конце",
  next_business_profile_setup: "Next Business profile setup",
};

const SECTION_DESCRIPTIONS: Record<Stream114DBusinessHostControlsSectionId, string> = {
  host_control_surface: "Business host sees a clean control surface for showcase, questions, leads and safety without leaving the live room.",
  showcase_visibility_control: "Show/hide decisions are local UI intents until backend moderation and provider enforcement are connected through kernel.",
  pin_product_intent: "Pinned product/service is a presentation intent only; it does not publish stock, price, order or payment as fake success.",
  hide_hold_product_intent: "Suspicious product or sales spam can be held for review locally without pretending backend removal already happened.",
  business_qna_moderation: "Business questions inherit 18+, Sabi AI review, profanity/insult control and host/moderator decisions.",
  compliance_disclosure: "Business stream clearly separates product information from order/payment; regulated or risky goods require later admin/compliance gates.",
  lead_queue_review: "Leads from 114C are reviewed as safe intent items before any future Messenger/business handoff.",
  kernel_event_contract: "Every control, pin, hide, Q&A answer, lead review and future business/profile/gift edge must go through Stream kernel contracts/facades/events.",
  order_payment_blocked: "Order, checkout, invoice, Wallet, Merchant, settlement and payout are still blocked until real financial stages.",
  gifts_end_stage_boundary: "Отправка подарков остаётся обязательной позже и должна быть правильной, но сейчас не добавляется fake gift send/payment/COIN movement.",
  next_business_profile_setup: "After host controls, continue Business Stream profile/context setup without jumping to payment or gifts.",
};

const HOST_ACTIONS: readonly Stream114DBusinessHostAction[] = [
  { id: "pin_showcase", title: "Закрепить витрину", description: "Сделать одну позицию визуально главной в эфире без fake publishing.", kernelEventName: "stream.business.host.pin_showcase", safeState: "intent_only" },
  { id: "hide_showcase", title: "Скрыть витрину", description: "Локально скрыть сомнительную позицию до появления backend moderation.", kernelEventName: "stream.business.host.hide_showcase", safeState: "intent_only" },
  { id: "hold_for_review", title: "Удержать на review", description: "Отправить товар/вопрос/lead в review queue как kernel intent.", kernelEventName: "stream.business.host.hold_for_review", safeState: "intent_only" },
  { id: "answer_question", title: "Ответить на вопрос", description: "Подготовить безопасный Business Q&A response без fake Messenger/backend send.", kernelEventName: "stream.business.host.answer_question", safeState: "intent_only" },
];

function uniqueReady(items: readonly Stream114DBusinessHostControlsSectionId[]): readonly Stream114DBusinessHostControlsSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114DBusinessHostControlsComplianceUiuxState(): Stream114DBusinessHostControlsComplianceUiuxState {
  return {
    version: "STREAM-114D",
    selectedSectionId: "host_control_surface",
    readySectionIds: ["kernel_event_contract", "order_payment_blocked", "gifts_end_stage_boundary"],
    selectedActionId: "pin_showcase",
    lastAction: "114D starts Business host controls/compliance UI/UX: kernel-only, no fake enforcement/order/payment/gifts.",
    hostControlSurfaceReadyLocal: false,
    showcaseVisibilityControlLocal: false,
    pinProductIntentLocal: false,
    hideHoldProductIntentLocal: false,
    businessQnaModerationLocal: false,
    complianceDisclosureLocal: false,
    leadQueueReviewLocal: false,
    kernelEventContractLocal: true,
    orderPaymentBlockedLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextBusinessProfileSetupLocal: false,
    businessLeadFlowMustStayReady: true,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    directMerchantConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    walletTouchedNow: false,
    merchantBackendTouchedNow: false,
    orderBackendTouchedNow: false,
    moderationBackendTouchedNow: false,
    fakePinPublishedAllowed: false,
    fakeHideEnforcedAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeInvoiceAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

export function selectStream114DBusinessHostControlsSection(
  state: Stream114DBusinessHostControlsComplianceUiuxState,
  sectionId: Stream114DBusinessHostControlsSectionId,
): Stream114DBusinessHostControlsComplianceUiuxState {
  return { ...state, selectedSectionId: sectionId, lastAction: `114D выбран раздел ${SECTION_TITLES[sectionId]}.` };
}

export function selectStream114DBusinessHostAction(
  state: Stream114DBusinessHostControlsComplianceUiuxState,
  actionId: Stream114DBusinessHostActionId,
): Stream114DBusinessHostControlsComplianceUiuxState {
  return { ...state, selectedActionId: actionId, lastAction: `114D выбран раздел ${HOST_ACTIONS.find((item) => item.id === actionId)?.title ?? "host action"}.` };
}

export function markStream114DBusinessHostControlsSectionReady(
  state: Stream114DBusinessHostControlsComplianceUiuxState,
  sectionId: Stream114DBusinessHostControlsSectionId,
  action: string,
): Stream114DBusinessHostControlsComplianceUiuxState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...state.readySectionIds, sectionId]),
    hostControlSurfaceReadyLocal: state.hostControlSurfaceReadyLocal || sectionId === "host_control_surface",
    showcaseVisibilityControlLocal: state.showcaseVisibilityControlLocal || sectionId === "showcase_visibility_control",
    pinProductIntentLocal: state.pinProductIntentLocal || sectionId === "pin_product_intent",
    hideHoldProductIntentLocal: state.hideHoldProductIntentLocal || sectionId === "hide_hold_product_intent",
    businessQnaModerationLocal: state.businessQnaModerationLocal || sectionId === "business_qna_moderation",
    complianceDisclosureLocal: state.complianceDisclosureLocal || sectionId === "compliance_disclosure",
    leadQueueReviewLocal: state.leadQueueReviewLocal || sectionId === "lead_queue_review",
    kernelEventContractLocal: state.kernelEventContractLocal || sectionId === "kernel_event_contract",
    orderPaymentBlockedLocal: state.orderPaymentBlockedLocal || sectionId === "order_payment_blocked",
    giftsEndStageBoundaryLocal: state.giftsEndStageBoundaryLocal || sectionId === "gifts_end_stage_boundary",
    nextBusinessProfileSetupLocal: state.nextBusinessProfileSetupLocal || sectionId === "next_business_profile_setup",
    lastAction: action,
  };
}

export function markStream114DBusinessHostControlsAllReady(
  state: Stream114DBusinessHostControlsComplianceUiuxState,
  action = "114D Business host controls/compliance UI/UX ready: control surface, pin/hide/hold, Q&A, compliance, kernel-only, no fake order/payment/gifts.",
): Stream114DBusinessHostControlsComplianceUiuxState {
  return {
    ...state,
    selectedSectionId: "next_business_profile_setup",
    readySectionIds: SECTION_ORDER,
    hostControlSurfaceReadyLocal: true,
    showcaseVisibilityControlLocal: true,
    pinProductIntentLocal: true,
    hideHoldProductIntentLocal: true,
    businessQnaModerationLocal: true,
    complianceDisclosureLocal: true,
    leadQueueReviewLocal: true,
    kernelEventContractLocal: true,
    orderPaymentBlockedLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextBusinessProfileSetupLocal: true,
    lastAction: action,
  };
}

export function buildStream114DBusinessHostControlsComplianceUiuxEvidence(
  state: Stream114DBusinessHostControlsComplianceUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  leadEvidence: Stream114CBusinessContactLeadUiuxEvidence,
): Stream114DBusinessHostControlsComplianceUiuxEvidence {
  const readySections = uniqueReady(state.readySectionIds).length;
  const totalSections = SECTION_ORDER.length;
  const hostControlsScore = Math.round((readySections / totalSections) * 100);
  const selectedAction = HOST_ACTIONS.find((item) => item.id === state.selectedActionId) ?? HOST_ACTIONS[0];
  const leadFlowReadyBeforeHostControls = leadEvidence.leadSheetReady && leadEvidence.orderPaymentBlocked && leadEvidence.messengerKernelBoundaryReady;
  const sectionItems = SECTION_ORDER.map((id): Stream114DBusinessHostControlsSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_owner_check",
  }));
  return {
    version: "STREAM-114D",
    selectedSectionId: state.selectedSectionId,
    selectedActionId: state.selectedActionId,
    hostControlsScore,
    readySections,
    totalSections,
    sectionItems,
    hostActions: HOST_ACTIONS,
    heroTitle: "Business host controls без fake commerce",
    heroSubtitle: "Pin, hide, hold и Business Q&A остаются безопасными kernel intents до backend/provider moderation и merchant flows.",
    phoneStatus: stage.status === "broadcast_handoff_blocked" ? "Business controls · запуск честно закрыт" : `Business controls · ${room.mode}`,
    activeActionTitle: selectedAction.title,
    activeActionMeta: `${selectedAction.description} · ${selectedAction.kernelEventName}`,
    primaryAction: "Безопасно управлять витриной · без fake enforcement",
    secondaryAction: leadFlowReadyBeforeHostControls ? "Lead/contact path готов. Дальше настройка Business profile/context." : "114C lead/contact flow должен оставаться готовым, иначе host controls не завершены.",
    leadFlowReadyBeforeHostControls,
    hostControlSurfaceReady: state.hostControlSurfaceReadyLocal,
    showcaseVisibilityControlReady: state.showcaseVisibilityControlLocal,
    pinProductIntentReady: state.pinProductIntentLocal,
    hideHoldProductIntentReady: state.hideHoldProductIntentLocal,
    businessQnaModerationReady: state.businessQnaModerationLocal,
    complianceDisclosureReady: state.complianceDisclosureLocal,
    leadQueueReviewReady: state.leadQueueReviewLocal,
    kernelEventContractReady: state.kernelEventContractLocal,
    orderPaymentBlocked: state.orderPaymentBlockedLocal,
    giftsDeferredCorrectly: state.giftsEndStageBoundaryLocal && !state.giftSendingImplementedNow,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    directMerchantConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    walletTouchedNow: false,
    merchantBackendTouchedNow: false,
    orderBackendTouchedNow: false,
    moderationBackendTouchedNow: false,
    fakePinPublishedAllowed: false,
    fakeHideEnforcedAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeInvoiceAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
