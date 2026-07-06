import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113ZLiveFinalClosureKernelUiuxEvidence } from "./stream113zLiveFinalClosureKernelUiuxRuntime";

export type Stream114ABusinessMainScreenSectionId =
  | "business_entry_surface"
  | "ordinary_business_mode_boundary"
  | "brand_card_ready"
  | "showcase_preview_ready"
  | "contact_request_price_ready"
  | "kernel_contract_boundary"
  | "commerce_payments_blocked"
  | "safety_moderation_ready"
  | "profile_hook_ready"
  | "gifts_deferred_boundary"
  | "stream_next_order_ready";

export type Stream114ABusinessMainScreenSectionStatus = "ready" | "needs_owner_check";

export type Stream114ABusinessMainScreenSection = {
  readonly id: Stream114ABusinessMainScreenSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114ABusinessMainScreenSectionStatus;
};

export type Stream114ABusinessMainScreenUiuxState = {
  readonly version: "STREAM-114A";
  readonly selectedSectionId: Stream114ABusinessMainScreenSectionId;
  readonly readySectionIds: readonly Stream114ABusinessMainScreenSectionId[];
  readonly lastAction: string;
  readonly businessEntrySurfaceReadyLocal: boolean;
  readonly ordinaryBusinessBoundaryReadyLocal: boolean;
  readonly brandCardReadyLocal: boolean;
  readonly showcasePreviewReadyLocal: boolean;
  readonly contactRequestPriceReadyLocal: boolean;
  readonly kernelContractBoundaryReadyLocal: boolean;
  readonly commercePaymentsBlockedLocal: boolean;
  readonly safetyModerationReadyLocal: boolean;
  readonly profileHookReadyLocal: boolean;
  readonly giftsDeferredBoundaryLocal: boolean;
  readonly streamNextOrderReadyLocal: boolean;
  readonly liveUiuxMustStayClosedFirst: true;
  readonly businessScreenCreatedAsUiuxLayerNow: true;
  readonly walletTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly allConnectionsThroughKernel: true;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeInvoiceAllowed: false;
  readonly fakePayoutAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114ABusinessMainScreenUiuxEvidence = {
  readonly version: "STREAM-114A";
  readonly selectedSectionId: Stream114ABusinessMainScreenSectionId;
  readonly businessScreenScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114ABusinessMainScreenSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeTitle: string;
  readonly productSummary: string;
  readonly businessModeLabel: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly liveUiuxClosedBeforeBusiness: boolean;
  readonly businessMainScreenReady: boolean;
  readonly ordinaryBusinessBoundaryReady: boolean;
  readonly brandCardReady: boolean;
  readonly showcasePreviewReady: boolean;
  readonly contactRequestPriceReady: boolean;
  readonly kernelBoundaryReady: boolean;
  readonly commercePaymentsBlocked: boolean;
  readonly safetyModerationReady: boolean;
  readonly profileHookReady: boolean;
  readonly giftsDeferredCorrectly: boolean;
  readonly supportedLanguageCount: number;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly walletTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeInvoiceAllowed: false;
  readonly fakePayoutAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114ABusinessMainScreenSectionId[] = [
  "business_entry_surface",
  "ordinary_business_mode_boundary",
  "brand_card_ready",
  "showcase_preview_ready",
  "contact_request_price_ready",
  "kernel_contract_boundary",
  "commerce_payments_blocked",
  "safety_moderation_ready",
  "profile_hook_ready",
  "gifts_deferred_boundary",
  "stream_next_order_ready",
];

const SECTION_TITLES: Record<Stream114ABusinessMainScreenSectionId, string> = {
  business_entry_surface: "Вход Business Stream",
  ordinary_business_mode_boundary: "Граница обычного/Business эфира",
  brand_card_ready: "Карточка бренда",
  showcase_preview_ready: "Предпросмотр витрины",
  contact_request_price_ready: "Контакт / запрос цены",
  kernel_contract_boundary: "Граница kernel-контракта",
  commerce_payments_blocked: "Коммерция честно закрыта",
  safety_moderation_ready: "Безопасность Business готова",
  profile_hook_ready: "Связь профиля готова",
  gifts_deferred_boundary: "Подарки отложены",
  stream_next_order_ready: "Следующий порядок Stream",
};

const SECTION_DESCRIPTIONS: Record<Stream114ABusinessMainScreenSectionId, string> = {
  business_entry_surface: "Business Stream получает чистый продуктовый вход после закрытия Live UI/UX: без debug/QA карточки и без короткого пути к marketplace/payment.",
  ordinary_business_mode_boundary: "Обычный эфир и бизнес-эфир визуально разделены; business mode показан только как безопасный presentation layer для коммерции.",
  brand_card_ready: "Бизнес-карточка показывает бренд, категорию, статус доверия и live context без обещания неутверждённого KYB, merchant или Wallet activation.",
  showcase_preview_ready: "Товары/услуги можно показывать как карточки для презентации, но заказ, корзина, checkout, наличие и оплата не симулируются.",
  contact_request_price_ready: "Зритель понимает следующий шаг: связаться, задать вопрос или запросить цену. До backend contracts это только UI/UX.",
  kernel_contract_boundary: "Все действия Business Stream, profile hooks, showcase events и будущие merchant/payment/gift boundaries идут только через Stream core/kernel contracts/facades/events.",
  commerce_payments_blocked: "Заказы, invoices, payouts, Wallet, Merchant, COIN и provider calls честно закрыты до отдельных backend/Wallet этапов.",
  safety_moderation_ready: "18+, Sabi AI moderation, жалобы, контроль ругани/оскорблений и host/moderator review наследуются в Business Stream.",
  profile_hook_ready: "Связи owner/profile названы вовремя, чтобы Live мог подключиться позже без задержки архитектуры профиля; полный profile screen на этом шаге не создаётся.",
  gifts_deferred_boundary: "Отправка подарков обязательна позже, но остаётся end-stage: сейчас нет fake gift send, fake payment или fake COIN movement.",
  stream_next_order_ready: "После 114A продолжаем Business Stream по порядку: витрина, host tools, Q&A, compliance, затем profile/Shorts/gifts позже.",
};

function uniqueReady(items: readonly Stream114ABusinessMainScreenSectionId[]): readonly Stream114ABusinessMainScreenSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114ABusinessMainScreenUiuxState(): Stream114ABusinessMainScreenUiuxState {
  return {
    version: "STREAM-114A",
    selectedSectionId: "business_entry_surface",
    readySectionIds: ["kernel_contract_boundary", "commerce_payments_blocked", "gifts_deferred_boundary"],
    lastAction: "114A начинает главный экран Business Stream после закрытия Live: только kernel, без fake commerce, подарки позже.",
    businessEntrySurfaceReadyLocal: false,
    ordinaryBusinessBoundaryReadyLocal: false,
    brandCardReadyLocal: false,
    showcasePreviewReadyLocal: false,
    contactRequestPriceReadyLocal: false,
    kernelContractBoundaryReadyLocal: true,
    commercePaymentsBlockedLocal: true,
    safetyModerationReadyLocal: false,
    profileHookReadyLocal: false,
    giftsDeferredBoundaryLocal: true,
    streamNextOrderReadyLocal: false,
    liveUiuxMustStayClosedFirst: true,
    businessScreenCreatedAsUiuxLayerNow: true,
    walletTouchedNow: false,
    merchantBackendTouchedNow: false,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    allConnectionsThroughKernel: true,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeInvoiceAllowed: false,
    fakePayoutAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

export function selectStream114ABusinessMainScreenSection(
  state: Stream114ABusinessMainScreenUiuxState,
  selectedSectionId: Stream114ABusinessMainScreenSectionId,
): Stream114ABusinessMainScreenUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 114A Business Stream раздел: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream114ABusinessMainScreenSectionReady(
  state: Stream114ABusinessMainScreenUiuxState,
  sectionId: Stream114ABusinessMainScreenSectionId,
  action: string,
): Stream114ABusinessMainScreenUiuxState {
  const readySectionIds = uniqueReady([...state.readySectionIds, sectionId]);
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    lastAction: action,
    businessEntrySurfaceReadyLocal: state.businessEntrySurfaceReadyLocal || sectionId === "business_entry_surface",
    ordinaryBusinessBoundaryReadyLocal: state.ordinaryBusinessBoundaryReadyLocal || sectionId === "ordinary_business_mode_boundary",
    brandCardReadyLocal: state.brandCardReadyLocal || sectionId === "brand_card_ready",
    showcasePreviewReadyLocal: state.showcasePreviewReadyLocal || sectionId === "showcase_preview_ready",
    contactRequestPriceReadyLocal: state.contactRequestPriceReadyLocal || sectionId === "contact_request_price_ready",
    kernelContractBoundaryReadyLocal: state.kernelContractBoundaryReadyLocal || sectionId === "kernel_contract_boundary",
    commercePaymentsBlockedLocal: state.commercePaymentsBlockedLocal || sectionId === "commerce_payments_blocked",
    safetyModerationReadyLocal: state.safetyModerationReadyLocal || sectionId === "safety_moderation_ready",
    profileHookReadyLocal: state.profileHookReadyLocal || sectionId === "profile_hook_ready",
    giftsDeferredBoundaryLocal: state.giftsDeferredBoundaryLocal || sectionId === "gifts_deferred_boundary",
    streamNextOrderReadyLocal: state.streamNextOrderReadyLocal || sectionId === "stream_next_order_ready",
  };
}

export function markStream114ABusinessMainScreenAllReady(
  state: Stream114ABusinessMainScreenUiuxState,
  action = "114A главный экран Business Stream готов: вход, граница, карточка бренда, preview витрины, контакт/запрос цены, только kernel, без fake commerce, подарки позже.",
): Stream114ABusinessMainScreenUiuxState {
  return {
    ...state,
    readySectionIds: SECTION_ORDER,
    selectedSectionId: "stream_next_order_ready",
    lastAction: action,
    businessEntrySurfaceReadyLocal: true,
    ordinaryBusinessBoundaryReadyLocal: true,
    brandCardReadyLocal: true,
    showcasePreviewReadyLocal: true,
    contactRequestPriceReadyLocal: true,
    kernelContractBoundaryReadyLocal: true,
    commercePaymentsBlockedLocal: true,
    safetyModerationReadyLocal: true,
    profileHookReadyLocal: true,
    giftsDeferredBoundaryLocal: true,
    streamNextOrderReadyLocal: true,
  };
}

export function buildStream114ABusinessMainScreenUiuxEvidence(
  state: Stream114ABusinessMainScreenUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  liveClosureEvidence: Stream113ZLiveFinalClosureKernelUiuxEvidence,
): Stream114ABusinessMainScreenUiuxEvidence {
  const readySet = new Set(state.readySectionIds);
  const sectionItems = SECTION_ORDER.map((id): Stream114ABusinessMainScreenSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySet.has(id) ? "ready" : "needs_owner_check",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const businessScreenScore = Math.round((readySections / totalSections) * 100);
  const liveUiuxClosedBeforeBusiness = liveClosureEvidence.liveUiuxClosed && liveClosureEvidence.kernelBoundaryClosed;
  const businessMainScreenReady = readySections === totalSections && liveUiuxClosedBeforeBusiness;
  const isBusinessMode = room.mode === "businessLive" || room.visibility === "business_only" || stage.layout === "business_showcase";
  return {
    version: "STREAM-114A",
    selectedSectionId: state.selectedSectionId,
    businessScreenScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Главный экран Business Stream",
    heroSubtitle: "Business Stream начинается после Live UI/UX 100%: чистый экран телефона, карточка бренда, preview витрины и безопасный contact-flow.",
    phoneStatus: businessMainScreenReady ? "Business Stream UI/UX готов · только kernel" : "Business Stream UI/UX настройка · без fake commerce",
    activeTitle: isBusinessMode ? "Business live режим" : "Business Stream preview",
    productSummary: `${room.title || "Sabi Business Stream"} · ${room.topic || "презентация бренда"} · showcase preview without fake orders/payments`,
    businessModeLabel: isBusinessMode ? "Business режим выбран" : "Business режим можно выбрать позже через kernel-safe flow",
    primaryAction: businessMainScreenReady ? "Продолжай к 114B: витрина товаров/услуг." : "Закрой Business entry, карточку бренда, витрину и kernel boundary.",
    secondaryAction: "Никаких заказов, оплат, Wallet, Merchant, COIN или подарков сейчас — только UI/UX и kernel-контракты.",
    liveUiuxClosedBeforeBusiness,
    businessMainScreenReady,
    ordinaryBusinessBoundaryReady: state.ordinaryBusinessBoundaryReadyLocal,
    brandCardReady: state.brandCardReadyLocal,
    showcasePreviewReady: state.showcasePreviewReadyLocal,
    contactRequestPriceReady: state.contactRequestPriceReadyLocal,
    kernelBoundaryReady: state.kernelContractBoundaryReadyLocal,
    commercePaymentsBlocked: state.commercePaymentsBlockedLocal,
    safetyModerationReady: state.safetyModerationReadyLocal,
    profileHookReady: state.profileHookReadyLocal,
    giftsDeferredCorrectly: state.giftsDeferredBoundaryLocal,
    supportedLanguageCount: liveClosureEvidence.supportedLanguageCount,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    walletTouchedNow: false,
    merchantBackendTouchedNow: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeInvoiceAllowed: false,
    fakePayoutAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
