import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114ABusinessMainScreenUiuxEvidence } from "./stream114aBusinessMainScreenUiuxRuntime";

export type Stream114BBusinessShowcaseRailSectionId =
  | "showcase_rail_surface"
  | "category_filter_ready"
  | "featured_cards_ready"
  | "request_price_flow_ready"
  | "contact_seller_flow_ready"
  | "inventory_truth_boundary"
  | "order_checkout_blocked"
  | "kernel_event_contracts_ready"
  | "business_profile_context_ready"
  | "moderation_compliance_ready"
  | "gifts_end_stage_boundary"
  | "next_host_tools_ready";

export type Stream114BBusinessShowcaseRailSectionStatus = "ready" | "needs_owner_check";

export type Stream114BBusinessShowcaseRailSection = {
  readonly id: Stream114BBusinessShowcaseRailSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream114BBusinessShowcaseRailSectionStatus;
};

export type Stream114BShowcaseCard = {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly label: string;
  readonly action: "request_price" | "contact" | "details_only";
  readonly safeCommerceState: "preview_only";
};

export type Stream114BBusinessShowcaseRailUiuxState = {
  readonly version: "STREAM-114B";
  readonly selectedSectionId: Stream114BBusinessShowcaseRailSectionId;
  readonly readySectionIds: readonly Stream114BBusinessShowcaseRailSectionId[];
  readonly selectedCardId: string;
  readonly lastAction: string;
  readonly showcaseRailSurfaceReadyLocal: boolean;
  readonly categoryFilterReadyLocal: boolean;
  readonly featuredCardsReadyLocal: boolean;
  readonly requestPriceFlowReadyLocal: boolean;
  readonly contactSellerFlowReadyLocal: boolean;
  readonly inventoryTruthBoundaryLocal: boolean;
  readonly orderCheckoutBlockedLocal: boolean;
  readonly kernelEventContractsReadyLocal: boolean;
  readonly businessProfileContextReadyLocal: boolean;
  readonly moderationComplianceReadyLocal: boolean;
  readonly giftsEndStageBoundaryLocal: boolean;
  readonly nextHostToolsReadyLocal: boolean;
  readonly businessMainScreenMustStayReady: true;
  readonly walletTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly orderBackendTouchedNow: false;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly allConnectionsThroughKernel: true;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeInvoiceAllowed: false;
  readonly fakeStockAllowed: false;
  readonly fakeDeliveryAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream114BBusinessShowcaseRailUiuxEvidence = {
  readonly version: "STREAM-114B";
  readonly selectedSectionId: Stream114BBusinessShowcaseRailSectionId;
  readonly selectedCardId: string;
  readonly showcaseScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream114BBusinessShowcaseRailSection[];
  readonly showcaseCards: readonly Stream114BShowcaseCard[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeCardTitle: string;
  readonly activeCardMeta: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly businessMainScreenReadyBeforeShowcase: boolean;
  readonly showcaseRailReady: boolean;
  readonly categoryFilterReady: boolean;
  readonly featuredCardsReady: boolean;
  readonly requestPriceFlowReady: boolean;
  readonly contactSellerFlowReady: boolean;
  readonly inventoryTruthBoundary: boolean;
  readonly orderCheckoutBlocked: boolean;
  readonly kernelEventContractsReady: boolean;
  readonly businessProfileContextReady: boolean;
  readonly moderationComplianceReady: boolean;
  readonly giftsDeferredCorrectly: boolean;
  readonly supportedLanguageCount: number;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly walletTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly orderBackendTouchedNow: false;
  readonly fakeOrderAllowed: false;
  readonly fakeCheckoutAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeInvoiceAllowed: false;
  readonly fakeStockAllowed: false;
  readonly fakeDeliveryAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream114BBusinessShowcaseRailSectionId[] = [
  "showcase_rail_surface",
  "category_filter_ready",
  "featured_cards_ready",
  "request_price_flow_ready",
  "contact_seller_flow_ready",
  "inventory_truth_boundary",
  "order_checkout_blocked",
  "kernel_event_contracts_ready",
  "business_profile_context_ready",
  "moderation_compliance_ready",
  "gifts_end_stage_boundary",
  "next_host_tools_ready",
];

const SECTION_TITLES: Record<Stream114BBusinessShowcaseRailSectionId, string> = {
  showcase_rail_surface: "Витрина",
  category_filter_ready: "Фильтр категорий",
  featured_cards_ready: "Карточки витрины",
  request_price_flow_ready: "Запрос цены",
  contact_seller_flow_ready: "Контакт с продавцом",
  inventory_truth_boundary: "Граница честного наличия",
  order_checkout_blocked: "Заказ / checkout закрыт",
  kernel_event_contracts_ready: "Только kernel-события",
  business_profile_context_ready: "Контекст Business профиля",
  moderation_compliance_ready: "Модерация / compliance",
  gifts_end_stage_boundary: "Подарки в конце",
  next_host_tools_ready: "Следующие инструменты ведущего",
};

const SECTION_DESCRIPTIONS: Record<Stream114BBusinessShowcaseRailSectionId, string> = {
  showcase_rail_surface: "Business Stream получает чистую горизонтальную витрину товаров/услуг внутри эфира, без marketplace clutter и без payment funnel.",
  category_filter_ready: "Зрители понимают категории и выбирают нужные позиции без выхода из эфира и без запуска backend order/payment path.",
  featured_cards_ready: "Карточки показывают название, категорию, короткую подпись и безопасное действие; без fake stock, fake delivery, fake checkout и fake price guarantee.",
  request_price_flow_ready: "Запрос цены — UI/UX intent для будущих kernel events и Messenger/business follow-up, не instant invoice и не payment promise.",
  contact_seller_flow_ready: "Контакт с продавцом остаётся безопасным intent path для будущего Messenger/kernel routing, без отдельного marketplace chat сейчас.",
  inventory_truth_boundary: "Доступность, stock и delivery не выдумываются. Пока нет provider/backend data, позиции витрины остаются preview-only.",
  order_checkout_blocked: "Cart, order, checkout, invoice, Wallet, Merchant и payout flows честно закрыты до своих backend/Wallet этапов.",
  kernel_event_contracts_ready: "Все taps витрины, price requests, seller contacts, profile/business hooks и future gift boundaries идут через Stream core/kernel contracts/facades/events.",
  business_profile_context_ready: "Контекст Business профиля назван вовремя для будущих экранов, но полный profile screen на этом шаге не создаётся.",
  moderation_compliance_ready: "Business витрина наследует 18+, Sabi AI moderation, report/review и compliance wording для безопасных business live rooms.",
  gifts_end_stage_boundary: "Отправка подарков остаётся обязательной позже и должна быть правильной, но сейчас не добавляется fake gift send/payment/COIN movement.",
  next_host_tools_ready: "После витрины продолжаем Business Stream host tools и live Q&A без прыжка к payments или gifts.",
};

const SHOWCASE_CARDS: readonly Stream114BShowcaseCard[] = [
  { id: "featured_product", title: "Главный товар", category: "Товар", label: "Preview-карточка · цена по запросу", action: "request_price", safeCommerceState: "preview_only" },
  { id: "service_offer", title: "Услуга", category: "Сервис", label: "Уточнить детали · без checkout", action: "contact", safeCommerceState: "preview_only" },
  { id: "business_bundle", title: "Business комплект", category: "B2B", label: "Catalog intent · без fake stock", action: "details_only", safeCommerceState: "preview_only" },
];

function uniqueReady(items: readonly Stream114BBusinessShowcaseRailSectionId[]): readonly Stream114BBusinessShowcaseRailSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream114BBusinessShowcaseRailUiuxState(): Stream114BBusinessShowcaseRailUiuxState {
  return {
    version: "STREAM-114B",
    selectedSectionId: "showcase_rail_surface",
    readySectionIds: ["inventory_truth_boundary", "order_checkout_blocked", "kernel_event_contracts_ready", "gifts_end_stage_boundary"],
    selectedCardId: "featured_product",
    lastAction: "114B начинает витрину Business Stream: preview-only, kernel events, без fake commerce, подарки позже.",
    showcaseRailSurfaceReadyLocal: false,
    categoryFilterReadyLocal: false,
    featuredCardsReadyLocal: false,
    requestPriceFlowReadyLocal: false,
    contactSellerFlowReadyLocal: false,
    inventoryTruthBoundaryLocal: true,
    orderCheckoutBlockedLocal: true,
    kernelEventContractsReadyLocal: true,
    businessProfileContextReadyLocal: false,
    moderationComplianceReadyLocal: false,
    giftsEndStageBoundaryLocal: true,
    nextHostToolsReadyLocal: false,
    businessMainScreenMustStayReady: true,
    walletTouchedNow: false,
    merchantBackendTouchedNow: false,
    orderBackendTouchedNow: false,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    allConnectionsThroughKernel: true,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeInvoiceAllowed: false,
    fakeStockAllowed: false,
    fakeDeliveryAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

export function selectStream114BBusinessShowcaseRailSection(
  state: Stream114BBusinessShowcaseRailUiuxState,
  selectedSectionId: Stream114BBusinessShowcaseRailSectionId,
): Stream114BBusinessShowcaseRailUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 114B showcase section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function selectStream114BShowcaseCard(
  state: Stream114BBusinessShowcaseRailUiuxState,
  selectedCardId: string,
): Stream114BBusinessShowcaseRailUiuxState {
  return { ...state, selectedCardId, lastAction: `Выбрана preview-card 114B: ${selectedCardId}. No checkout/no payment.` };
}

export function markStream114BBusinessShowcaseRailSectionReady(
  state: Stream114BBusinessShowcaseRailUiuxState,
  sectionId: Stream114BBusinessShowcaseRailSectionId,
  action: string,
): Stream114BBusinessShowcaseRailUiuxState {
  const readySectionIds = uniqueReady([...state.readySectionIds, sectionId]);
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    lastAction: action,
    showcaseRailSurfaceReadyLocal: state.showcaseRailSurfaceReadyLocal || sectionId === "showcase_rail_surface",
    categoryFilterReadyLocal: state.categoryFilterReadyLocal || sectionId === "category_filter_ready",
    featuredCardsReadyLocal: state.featuredCardsReadyLocal || sectionId === "featured_cards_ready",
    requestPriceFlowReadyLocal: state.requestPriceFlowReadyLocal || sectionId === "request_price_flow_ready",
    contactSellerFlowReadyLocal: state.contactSellerFlowReadyLocal || sectionId === "contact_seller_flow_ready",
    inventoryTruthBoundaryLocal: state.inventoryTruthBoundaryLocal || sectionId === "inventory_truth_boundary",
    orderCheckoutBlockedLocal: state.orderCheckoutBlockedLocal || sectionId === "order_checkout_blocked",
    kernelEventContractsReadyLocal: state.kernelEventContractsReadyLocal || sectionId === "kernel_event_contracts_ready",
    businessProfileContextReadyLocal: state.businessProfileContextReadyLocal || sectionId === "business_profile_context_ready",
    moderationComplianceReadyLocal: state.moderationComplianceReadyLocal || sectionId === "moderation_compliance_ready",
    giftsEndStageBoundaryLocal: state.giftsEndStageBoundaryLocal || sectionId === "gifts_end_stage_boundary",
    nextHostToolsReadyLocal: state.nextHostToolsReadyLocal || sectionId === "next_host_tools_ready",
  };
}

export function markStream114BBusinessShowcaseRailAllReady(
  state: Stream114BBusinessShowcaseRailUiuxState,
  action = "114B витрина Business UI/UX готова: preview-карточки, категории, запрос цены/контакт intents, только kernel, без fake order/payment, подарки позже.",
): Stream114BBusinessShowcaseRailUiuxState {
  return {
    ...state,
    readySectionIds: SECTION_ORDER,
    selectedSectionId: "next_host_tools_ready",
    selectedCardId: "featured_product",
    lastAction: action,
    showcaseRailSurfaceReadyLocal: true,
    categoryFilterReadyLocal: true,
    featuredCardsReadyLocal: true,
    requestPriceFlowReadyLocal: true,
    contactSellerFlowReadyLocal: true,
    inventoryTruthBoundaryLocal: true,
    orderCheckoutBlockedLocal: true,
    kernelEventContractsReadyLocal: true,
    businessProfileContextReadyLocal: true,
    moderationComplianceReadyLocal: true,
    giftsEndStageBoundaryLocal: true,
    nextHostToolsReadyLocal: true,
  };
}

export function buildStream114BBusinessShowcaseRailUiuxEvidence(
  state: Stream114BBusinessShowcaseRailUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  businessMainEvidence: Stream114ABusinessMainScreenUiuxEvidence,
): Stream114BBusinessShowcaseRailUiuxEvidence {
  const readySet = new Set(state.readySectionIds);
  const sectionItems = SECTION_ORDER.map((id): Stream114BBusinessShowcaseRailSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySet.has(id) ? "ready" : "needs_owner_check",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const showcaseScore = Math.round((readySections / totalSections) * 100);
  const businessMainScreenReadyBeforeShowcase = businessMainEvidence.businessMainScreenReady && businessMainEvidence.kernelBoundaryReady;
  const showcaseRailReady = readySections === totalSections && businessMainScreenReadyBeforeShowcase;
  const activeCard = SHOWCASE_CARDS.find((card) => card.id === state.selectedCardId) || SHOWCASE_CARDS[0];
  const isBusinessMode = room.mode === "businessLive" || room.visibility === "business_only" || stage.layout === "business_showcase";
  return {
    version: "STREAM-114B",
    selectedSectionId: state.selectedSectionId,
    selectedCardId: activeCard.id,
    showcaseScore,
    readySections,
    totalSections,
    sectionItems,
    showcaseCards: SHOWCASE_CARDS,
    heroTitle: "Витрина Business Stream",
    heroSubtitle: "Витрина внутри Business Stream: товары/услуги как preview, запрос цены и контакт через будущие kernel events — без fake orders/payments.",
    phoneStatus: showcaseRailReady ? "Витрина готова · preview-only · kernel" : "Настройка витрины · без checkout/оплаты",
    activeCardTitle: activeCard.title,
    activeCardMeta: `${activeCard.category} · ${activeCard.label} · ${isBusinessMode ? "business режим" : "preview режим"}`,
    primaryAction: showcaseRailReady ? "Продолжай к 114C: инструменты ведущего Business / live Q&A." : "Закрой витрину, категории, карточки, запрос цены/контакт и kernel boundaries.",
    secondaryAction: "Нет fake price, stock, checkout, invoice, Wallet, Merchant, delivery или gift sending. Всё ждёт kernel/backend этапы.",
    businessMainScreenReadyBeforeShowcase,
    showcaseRailReady,
    categoryFilterReady: state.categoryFilterReadyLocal,
    featuredCardsReady: state.featuredCardsReadyLocal,
    requestPriceFlowReady: state.requestPriceFlowReadyLocal,
    contactSellerFlowReady: state.contactSellerFlowReadyLocal,
    inventoryTruthBoundary: state.inventoryTruthBoundaryLocal,
    orderCheckoutBlocked: state.orderCheckoutBlockedLocal,
    kernelEventContractsReady: state.kernelEventContractsReadyLocal,
    businessProfileContextReady: state.businessProfileContextReadyLocal,
    moderationComplianceReady: state.moderationComplianceReadyLocal,
    giftsDeferredCorrectly: state.giftsEndStageBoundaryLocal,
    supportedLanguageCount: businessMainEvidence.supportedLanguageCount,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    walletTouchedNow: false,
    merchantBackendTouchedNow: false,
    orderBackendTouchedNow: false,
    fakeOrderAllowed: false,
    fakeCheckoutAllowed: false,
    fakePaymentAllowed: false,
    fakeInvoiceAllowed: false,
    fakeStockAllowed: false,
    fakeDeliveryAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
