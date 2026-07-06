import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114BBusinessShowcaseRailUiuxEvidence } from "./stream114bBusinessShowcaseRailUiuxRuntime";

export type Stream114CBusinessContactLeadSectionId =
  | "lead_sheet_surface"
  | "request_price_composer"
  | "contact_seller_intent"
  | "lead_fields_minimal"
  | "message_preview_ready"
  | "messenger_kernel_boundary"
  | "business_profile_hook"
  | "moderation_compliance_inherited"
  | "audit_event_contract"
  | "order_payment_blocked"
  | "gifts_end_stage_boundary"
  | "next_business_host_tools";

export type Stream114CBusinessContactLeadSectionStatus = "ready" | "needs_owner_check";

export type Stream114CBusinessContactLeadSection = {
  readonly id: Stream114CBusinessContactLeadSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114CBusinessContactLeadSectionStatus;
};

export type Stream114CLeadIntentId = "request_price" | "ask_details" | "contact_business";

export type Stream114CLeadIntent = {
  readonly id: Stream114CLeadIntentId;
  readonly title: string;
  readonly description: string;
  readonly kernelEventName: string;
  readonly safeState: "intent_only";
};

export type Stream114CBusinessContactLeadUiuxState = {
  readonly version: "STREAM-114C";
  readonly selectedSectionId: Stream114CBusinessContactLeadSectionId;
  readonly readySectionIds: readonly Stream114CBusinessContactLeadSectionId[];
  readonly selectedIntentId: Stream114CLeadIntentId;
  readonly draftMessage: string;
  readonly lastAction: string;
  readonly leadSheetSurfaceReadyLocal: boolean;
  readonly requestPriceComposerReadyLocal: boolean;
  readonly contactSellerIntentReadyLocal: boolean;
  readonly leadFieldsMinimalLocal: boolean;
  readonly messagePreviewReadyLocal: boolean;
  readonly messengerKernelBoundaryLocal: boolean;
  readonly businessProfileHookLocal: boolean;
  readonly moderationComplianceInheritedLocal: boolean;
  readonly auditEventContractLocal: boolean;
  readonly orderPaymentBlockedLocal: boolean;
  readonly giftsEndStageBoundaryLocal: boolean;
  readonly nextBusinessHostToolsLocal: boolean;
  readonly showcaseRailMustStayReady: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directMessengerConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly walletTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly orderBackendTouchedNow: false;
  readonly messengerBackendTouchedNow: false;
  readonly fakeLeadSentAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeInvoiceAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114CBusinessContactLeadUiuxEvidence = {
  readonly version: "STREAM-114C";
  readonly selectedSectionId: Stream114CBusinessContactLeadSectionId;
  readonly selectedIntentId: Stream114CLeadIntentId;
  readonly leadScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114CBusinessContactLeadSection[];
  readonly leadIntents: readonly Stream114CLeadIntent[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeIntentTitle: string;
  readonly activeIntentMeta: string;
  readonly draftMessage: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly showcaseRailReadyBeforeLead: boolean;
  readonly leadSheetReady: boolean;
  readonly requestPriceComposerReady: boolean;
  readonly contactSellerIntentReady: boolean;
  readonly leadFieldsMinimal: boolean;
  readonly messagePreviewReady: boolean;
  readonly messengerKernelBoundaryReady: boolean;
  readonly businessProfileHookReady: boolean;
  readonly moderationComplianceInherited: boolean;
  readonly auditEventContractReady: boolean;
  readonly orderPaymentBlocked: boolean;
  readonly giftsDeferredCorrectly: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directMessengerConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly walletTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly orderBackendTouchedNow: false;
  readonly messengerBackendTouchedNow: false;
  readonly fakeLeadSentAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeInvoiceAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114CBusinessContactLeadSectionId[] = [
  "lead_sheet_surface",
  "request_price_composer",
  "contact_seller_intent",
  "lead_fields_minimal",
  "message_preview_ready",
  "messenger_kernel_boundary",
  "business_profile_hook",
  "moderation_compliance_inherited",
  "audit_event_contract",
  "order_payment_blocked",
  "gifts_end_stage_boundary",
  "next_business_host_tools",
];

const SECTION_TITLES: Record<Stream114CBusinessContactLeadSectionId, string> = {
  lead_sheet_surface: "Lead-лист",
  request_price_composer: "Composer запроса цены",
  contact_seller_intent: "Intent контакта с продавцом",
  lead_fields_minimal: "Минимальные lead-поля",
  message_preview_ready: "Preview сообщения",
  messenger_kernel_boundary: "Messenger через kernel",
  business_profile_hook: "Business profile hook",
  moderation_compliance_inherited: "Модерация наследована",
  audit_event_contract: "Audit event contract",
  order_payment_blocked: "Order / payment blocked",
  gifts_end_stage_boundary: "Подарки в конце",
  next_business_host_tools: "Следующие инструменты ведущего",
};

const SECTION_DESCRIPTIONS: Record<Stream114CBusinessContactLeadSectionId, string> = {
  lead_sheet_surface: "Business Stream получает чистый lead path в стиле bottom sheet, не сырую форму, не marketplace cart и не payment screen.",
  request_price_composer: "Запрос цены — понятный viewer intent с коротким текстом и future kernel event, не fake invoice и не checkout.",
  contact_seller_intent: "Контакт с продавцом остаётся intent, который позже откроет Messenger через kernel routing без duplicate marketplace chat сейчас.",
  lead_fields_minimal: "В UI показываются только безопасные минимальные поля: интерес к товару/услуге, короткое сообщение и contact intent. Без private payment details.",
  message_preview_ready: "Зритель видит, что будет запрошено перед отправкой; пока backend отсутствует, это preview-only, а не fake success send.",
  messenger_kernel_boundary: "Любой будущий Messenger handoff должен пройти через Stream kernel contracts/facades/events, не напрямую с экрана в Messenger service.",
  business_profile_hook: "Контекст Business профиля назван в Live/Business Stream вовремя, но полный profile screen здесь не создаётся.",
  moderation_compliance_inherited: "Business contact flow наследует 18+, Sabi AI review, обработку жалоб и compliance language из Live safety.",
  audit_event_contract: "Будущие lead/request events должны быть auditable через kernel event contracts без видимости, что backend persistence уже существует.",
  order_payment_blocked: "Order, checkout, invoice, Wallet, Merchant, delivery и payout paths остаются закрыты до своих реальных этапов.",
  gifts_end_stage_boundary: "Отправка подарков остаётся обязательной позже и должна быть правильной, но сейчас не добавляется fake gift send/payment/COIN movement.",
  next_business_host_tools: "После contact/lead flow продолжаем Business Stream host tools, Q&A и pinned product controls без прыжка к payments.",
};

const LEAD_INTENTS: readonly Stream114CLeadIntent[] = [
  { id: "request_price", title: "Запрос цены", description: "Зритель запрашивает цену/детали через будущий kernel event.", kernelEventName: "stream.business.lead.request_price", safeState: "intent_only" },
  { id: "ask_details", title: "Уточнить детали", description: "Зритель отправляет вопрос по товару/услуге без checkout и оплаты.", kernelEventName: "stream.business.lead.ask_details", safeState: "intent_only" },
  { id: "contact_business", title: "Связаться с Business", description: "Future Messenger handoff intent, route только через Stream kernel.", kernelEventName: "stream.business.lead.contact_business", safeState: "intent_only" },
];

function uniqueReady(items: readonly Stream114CBusinessContactLeadSectionId[]): readonly Stream114CBusinessContactLeadSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114CBusinessContactLeadUiuxState(): Stream114CBusinessContactLeadUiuxState {
  return {
    version: "STREAM-114C",
    selectedSectionId: "lead_sheet_surface",
    readySectionIds: ["messenger_kernel_boundary", "order_payment_blocked", "gifts_end_stage_boundary"],
    selectedIntentId: "request_price",
    draftMessage: "Здравствуйте, интересует цена и детали по этому предложению.",
    lastAction: "114C начинает Business contact/lead UI/UX: запрос цены/контакт intents, только kernel, без fake send/order/payment.",
    leadSheetSurfaceReadyLocal: false,
    requestPriceComposerReadyLocal: false,
    contactSellerIntentReadyLocal: false,
    leadFieldsMinimalLocal: false,
    messagePreviewReadyLocal: false,
    messengerKernelBoundaryLocal: true,
    businessProfileHookLocal: false,
    moderationComplianceInheritedLocal: false,
    auditEventContractLocal: false,
    orderPaymentBlockedLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextBusinessHostToolsLocal: false,
    showcaseRailMustStayReady: true,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    directMessengerConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    walletTouchedNow: false,
    merchantBackendTouchedNow: false,
    orderBackendTouchedNow: false,
    messengerBackendTouchedNow: false,
    fakeLeadSentAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeInvoiceAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

export function selectStream114CBusinessContactLeadSection(
  state: Stream114CBusinessContactLeadUiuxState,
  sectionId: Stream114CBusinessContactLeadSectionId,
): Stream114CBusinessContactLeadUiuxState {
  return { ...state, selectedSectionId: sectionId, lastAction: `114C выбран раздел ${SECTION_TITLES[sectionId]}.` };
}

export function selectStream114CLeadIntent(
  state: Stream114CBusinessContactLeadUiuxState,
  intentId: Stream114CLeadIntentId,
): Stream114CBusinessContactLeadUiuxState {
  return { ...state, selectedIntentId: intentId, lastAction: `114C выбран раздел ${LEAD_INTENTS.find((item) => item.id === intentId)?.title ?? "lead intent"}.` };
}

export function setStream114CLeadDraftMessage(
  state: Stream114CBusinessContactLeadUiuxState,
  draftMessage: string,
): Stream114CBusinessContactLeadUiuxState {
  return { ...state, draftMessage, messagePreviewReadyLocal: draftMessage.trim().length > 0, readySectionIds: uniqueReady([...state.readySectionIds, "message_preview_ready"]), lastAction: "114C обновил preview lead-сообщения локально; без fake send." };
}

export function markStream114CBusinessContactLeadSectionReady(
  state: Stream114CBusinessContactLeadUiuxState,
  sectionId: Stream114CBusinessContactLeadSectionId,
  action: string,
): Stream114CBusinessContactLeadUiuxState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...state.readySectionIds, sectionId]),
    leadSheetSurfaceReadyLocal: state.leadSheetSurfaceReadyLocal || sectionId === "lead_sheet_surface",
    requestPriceComposerReadyLocal: state.requestPriceComposerReadyLocal || sectionId === "request_price_composer",
    contactSellerIntentReadyLocal: state.contactSellerIntentReadyLocal || sectionId === "contact_seller_intent",
    leadFieldsMinimalLocal: state.leadFieldsMinimalLocal || sectionId === "lead_fields_minimal",
    messagePreviewReadyLocal: state.messagePreviewReadyLocal || sectionId === "message_preview_ready",
    messengerKernelBoundaryLocal: state.messengerKernelBoundaryLocal || sectionId === "messenger_kernel_boundary",
    businessProfileHookLocal: state.businessProfileHookLocal || sectionId === "business_profile_hook",
    moderationComplianceInheritedLocal: state.moderationComplianceInheritedLocal || sectionId === "moderation_compliance_inherited",
    auditEventContractLocal: state.auditEventContractLocal || sectionId === "audit_event_contract",
    orderPaymentBlockedLocal: state.orderPaymentBlockedLocal || sectionId === "order_payment_blocked",
    giftsEndStageBoundaryLocal: state.giftsEndStageBoundaryLocal || sectionId === "gifts_end_stage_boundary",
    nextBusinessHostToolsLocal: state.nextBusinessHostToolsLocal || sectionId === "next_business_host_tools",
    lastAction: action,
  };
}

export function markStream114CBusinessContactLeadAllReady(
  state: Stream114CBusinessContactLeadUiuxState,
  action = "114C Business contact/lead UI/UX готов: запрос цены/контакт intents, только kernel, без fake send/order/payment, подарки позже.",
): Stream114CBusinessContactLeadUiuxState {
  return {
    ...state,
    selectedSectionId: "next_business_host_tools",
    readySectionIds: SECTION_ORDER,
    leadSheetSurfaceReadyLocal: true,
    requestPriceComposerReadyLocal: true,
    contactSellerIntentReadyLocal: true,
    leadFieldsMinimalLocal: true,
    messagePreviewReadyLocal: true,
    messengerKernelBoundaryLocal: true,
    businessProfileHookLocal: true,
    moderationComplianceInheritedLocal: true,
    auditEventContractLocal: true,
    orderPaymentBlockedLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextBusinessHostToolsLocal: true,
    lastAction: action,
  };
}

export function buildStream114CBusinessContactLeadUiuxEvidence(
  state: Stream114CBusinessContactLeadUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  showcaseEvidence: Stream114BBusinessShowcaseRailUiuxEvidence,
): Stream114CBusinessContactLeadUiuxEvidence {
  const readySections = uniqueReady(state.readySectionIds).length;
  const totalSections = SECTION_ORDER.length;
  const leadScore = Math.round((readySections / totalSections) * 100);
  const selectedIntent = LEAD_INTENTS.find((item) => item.id === state.selectedIntentId) ?? LEAD_INTENTS[0];
  const showcaseRailReadyBeforeLead = showcaseEvidence.showcaseRailReady && showcaseEvidence.orderCheckoutBlocked && showcaseEvidence.kernelEventContractsReady;
  const sectionItems = SECTION_ORDER.map((id): Stream114CBusinessContactLeadSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_owner_check",
  }));
  return {
    version: "STREAM-114C",
    selectedSectionId: state.selectedSectionId,
    selectedIntentId: state.selectedIntentId,
    leadScore,
    readySections,
    totalSections,
    sectionItems,
    leadIntents: LEAD_INTENTS,
    heroTitle: "Business contact flow без fake commerce",
    heroSubtitle: "Запрос цены, детали и контакт с Business остаются kernel intents до реального Messenger/backend wiring.",
    phoneStatus: stage.status === "broadcast_handoff_blocked" ? "Business lead preview · запуск честно закрыт" : "Business lead preview · только kernel",
    activeIntentTitle: selectedIntent.title,
    activeIntentMeta: `${selectedIntent.description} · ${selectedIntent.kernelEventName}`,
    draftMessage: state.draftMessage,
    primaryAction: "Preview lead request · без fake send",
    secondaryAction: showcaseRailReadyBeforeLead ? "Витрина готова перед lead flow. Дальше 114D host tools." : "114B витрина должна оставаться готовой, иначе lead flow не считается завершённым.",
    showcaseRailReadyBeforeLead,
    leadSheetReady: state.leadSheetSurfaceReadyLocal,
    requestPriceComposerReady: state.requestPriceComposerReadyLocal,
    contactSellerIntentReady: state.contactSellerIntentReadyLocal,
    leadFieldsMinimal: state.leadFieldsMinimalLocal,
    messagePreviewReady: state.messagePreviewReadyLocal,
    messengerKernelBoundaryReady: state.messengerKernelBoundaryLocal,
    businessProfileHookReady: state.businessProfileHookLocal,
    moderationComplianceInherited: state.moderationComplianceInheritedLocal,
    auditEventContractReady: state.auditEventContractLocal,
    orderPaymentBlocked: state.orderPaymentBlockedLocal,
    giftsDeferredCorrectly: state.giftsEndStageBoundaryLocal && !state.giftSendingImplementedNow,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    directMessengerConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    walletTouchedNow: false,
    merchantBackendTouchedNow: false,
    orderBackendTouchedNow: false,
    messengerBackendTouchedNow: false,
    fakeLeadSentAllowed: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeInvoiceAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
