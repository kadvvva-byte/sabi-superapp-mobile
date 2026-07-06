import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream117BOwnerHandoffEvidence } from "./stream117bStreamProductOwnerHandoffKernelUiuxRuntime";

export type Stream117CReadinessDashboardSectionId =
  | "dashboard_surface_ready"
  | "live_summary_visible"
  | "business_summary_visible"
  | "profile_shorts_summary_visible"
  | "backend_provider_blockers_clear"
  | "kernel_contracts_locked"
  | "safety_compliance_visible"
  | "commerce_blockers_honest"
  | "gifts_monetization_deferred"
  | "launch_not_claimed"
  | "next_backend_plan_ready";

export type Stream117CReadinessDashboardStatus = "ready" | "blocked";

export type Stream117CReadinessDashboardSection = {
  readonly id: Stream117CReadinessDashboardSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream117CReadinessDashboardStatus;
};

export type Stream117CReadinessDashboardState = {
  readonly version: "STREAM-117C";
  readonly selectedSectionId: Stream117CReadinessDashboardSectionId;
  readonly readySectionIds: readonly Stream117CReadinessDashboardSectionId[];
  readonly lastAction: string;
  readonly dashboardSurfaceReadyLocal: boolean;
  readonly liveSummaryVisibleLocal: boolean;
  readonly businessSummaryVisibleLocal: boolean;
  readonly profileShortsSummaryVisibleLocal: boolean;
  readonly backendProviderBlockersClearLocal: boolean;
  readonly kernelContractsLockedLocal: boolean;
  readonly safetyComplianceVisibleLocal: boolean;
  readonly commerceBlockersHonestLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly launchNotClaimedLocal: boolean;
  readonly nextBackendPlanReadyLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directLiveProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directShortsProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly backendProviderActivatedNow: false;
  readonly liveBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly shortsBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream117CReadinessDashboardEvidence = {
  readonly version: "STREAM-117C";
  readonly selectedSectionId: Stream117CReadinessDashboardSectionId;
  readonly readinessScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream117CReadinessDashboardSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly dashboardSurfaceReady: boolean;
  readonly liveSummaryVisible: boolean;
  readonly businessSummaryVisible: boolean;
  readonly profileShortsSummaryVisible: boolean;
  readonly backendProviderBlockersClear: boolean;
  readonly kernelContractsLocked: boolean;
  readonly safetyComplianceVisible: boolean;
  readonly commerceBlockersHonest: boolean;
  readonly giftsMonetizationDeferred: boolean;
  readonly launchNotClaimed: boolean;
  readonly nextBackendPlanReady: boolean;
  readonly ownerHandoffReady: boolean;
  readonly streamReadinessDashboardReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directLiveProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directShortsProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly backendProviderActivatedNow: false;
  readonly liveBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly shortsBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream117CReadinessDashboardSectionId, { title: string; description: string }> = {
  dashboard_surface_ready: {
    title: "Поверхность readiness панель",
    description: "Единый владелец-facing readiness панель Stream объясняет готовность UI/UX, не превращая экран телефона в debug-шум.",
  },
  live_summary_visible: {
    title: "Сводка эфира видна",
    description: "Готовность эфир room ясно резюмирована: ведущий, зритель, чат, соведущий, дуэль, модерация и preflight готовы на уровне UI/ядра.",
  },
  business_summary_visible: {
    title: "Сводка Бизнес Stream видна",
    description: "Готовность Бизнес Stream видна, при этом merchant, order, invoice, checkout и платёж остаются заблокированы.",
  },
  profile_shorts_summary_visible: {
    title: "Сводка профиля и шортов видна",
    description: "Профиль автора и шорты резюмированы как чистые продуктовые потоки с честными локальными/ядерными действиями без фейковых счётчиков.",
  },
  backend_provider_blockers_clear: {
    title: "Блокеры бэкенд/провайдер понятны",
    description: "Блокеры реального эфир-провайдера, реалтайм-провайдера, загрузка, публикация, воспроизведение и бэкенд-активации показаны прямо.",
  },
  kernel_contracts_locked: {
    title: "Контракты ядра зафиксированы",
    description: "Все границы эфира, реалтайм, модерации, бизнеса, профиля, шортов и будущих подарков остаются за core/ядро контракты.",
  },
  safety_compliance_visible: {
    title: "Безопасность и комплаенс видны",
    description: "AI-модерация, жалобы, 18+, language guard, обработка abuse и границы проверка являются частью readiness панель.",
  },
  commerce_blockers_honest: {
    title: "Блокеры коммерции честные",
    description: "Wallet, Merchant, заказы, checkout, счета, выплаты и платежи не симулируются и остаются заблокированы.",
  },
  gifts_monetization_deferred: {
    title: "Подарки и монетизация отложены",
    description: "Подарки и монетизация обязательны позже, но не реализованы и не фейкуются на этом этапе готовности Stream.",
  },
  launch_not_claimed: {
    title: "Запуск не заявлен",
    description: "Панель говорит, что UI/UX и intent через ядро готовы; он не заявляет реальный запуск до утверждения этапов бэкенд/провайдер.",
  },
  next_backend_plan_ready: {
    title: "Следующий бэкенд-план готов",
    description: "Следующий упорядоченный шаг может двигаться к бэкенд/провайдер контракты без нарушения UI/UX, безопасности или границ ядра.",
  },
};

const ALL_SECTIONS: readonly Stream117CReadinessDashboardSectionId[] = [
  "dashboard_surface_ready",
  "live_summary_visible",
  "business_summary_visible",
  "profile_shorts_summary_visible",
  "backend_provider_blockers_clear",
  "kernel_contracts_locked",
  "safety_compliance_visible",
  "commerce_blockers_honest",
  "gifts_monetization_deferred",
  "launch_not_claimed",
  "next_backend_plan_ready",
];

const FIELD_BY_SECTION: Record<Stream117CReadinessDashboardSectionId, keyof Pick<
  Stream117CReadinessDashboardState,
  | "dashboardSurfaceReadyLocal"
  | "liveSummaryVisibleLocal"
  | "businessSummaryVisibleLocal"
  | "profileShortsSummaryVisibleLocal"
  | "backendProviderBlockersClearLocal"
  | "kernelContractsLockedLocal"
  | "safetyComplianceVisibleLocal"
  | "commerceBlockersHonestLocal"
  | "giftsMonetizationDeferredLocal"
  | "launchNotClaimedLocal"
  | "nextBackendPlanReadyLocal"
>> = {
  dashboard_surface_ready: "dashboardSurfaceReadyLocal",
  live_summary_visible: "liveSummaryVisibleLocal",
  business_summary_visible: "businessSummaryVisibleLocal",
  profile_shorts_summary_visible: "profileShortsSummaryVisibleLocal",
  backend_provider_blockers_clear: "backendProviderBlockersClearLocal",
  kernel_contracts_locked: "kernelContractsLockedLocal",
  safety_compliance_visible: "safetyComplianceVisibleLocal",
  commerce_blockers_honest: "commerceBlockersHonestLocal",
  gifts_monetization_deferred: "giftsMonetizationDeferredLocal",
  launch_not_claimed: "launchNotClaimedLocal",
  next_backend_plan_ready: "nextBackendPlanReadyLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream117CReadinessDashboardSectionId[]): readonly Stream117CReadinessDashboardSectionId[] {
  return Array.from(new Set(sectionIds));
}

export function createInitialStream117CReadinessDashboardState(): Stream117CReadinessDashboardState {
  return {
    version: "STREAM-117C",
    selectedSectionId: "dashboard_surface_ready",
    readySectionIds: ["kernel_contracts_locked", "commerce_blockers_honest", "gifts_monetization_deferred", "launch_not_claimed"],
    lastAction: "Readiness панель Stream ждёт проверки владельца: готовность должна быть ясной, только через ядро и честной по бэкенд/провайдер блокерам.",
    dashboardSurfaceReadyLocal: false,
    liveSummaryVisibleLocal: false,
    businessSummaryVisibleLocal: false,
    profileShortsSummaryVisibleLocal: false,
    backendProviderBlockersClearLocal: false,
    kernelContractsLockedLocal: true,
    safetyComplianceVisibleLocal: false,
    commerceBlockersHonestLocal: true,
    giftsMonetizationDeferredLocal: true,
    launchNotClaimedLocal: true,
    nextBackendPlanReadyLocal: false,
    allConnectionsThroughKernel: true,
    directLiveProviderAllowed: false,
    directRealtimeProviderAllowed: false,
    directUploadProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directProfileProviderAllowed: false,
    directShortsProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    backendProviderActivatedNow: false,
    liveBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    shortsBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeLaunchAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeViewsAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

export function selectStream117CReadinessDashboardSection(
  state: Stream117CReadinessDashboardState,
  sectionId: Stream117CReadinessDashboardSectionId,
): Stream117CReadinessDashboardState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream117CReadinessDashboardSectionReady(
  state: Stream117CReadinessDashboardState,
  sectionId: Stream117CReadinessDashboardSectionId,
  action: string,
): Stream117CReadinessDashboardState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream117CReadinessDashboardAllReady(
  state: Stream117CReadinessDashboardState,
  action: string,
): Stream117CReadinessDashboardState {
  return {
    ...state,
    selectedSectionId: "next_backend_plan_ready",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    dashboardSurfaceReadyLocal: true,
    liveSummaryVisibleLocal: true,
    businessSummaryVisibleLocal: true,
    profileShortsSummaryVisibleLocal: true,
    backendProviderBlockersClearLocal: true,
    kernelContractsLockedLocal: true,
    safetyComplianceVisibleLocal: true,
    commerceBlockersHonestLocal: true,
    giftsMonetizationDeferredLocal: true,
    launchNotClaimedLocal: true,
    nextBackendPlanReadyLocal: true,
  };
}

export function buildStream117CReadinessDashboardEvidence(
  state: Stream117CReadinessDashboardState,
  room: StreamRoomRuntimeState,
  ownerHandoffEvidence: Stream117BOwnerHandoffEvidence,
): Stream117CReadinessDashboardEvidence {
  const sectionItems: Stream117CReadinessDashboardSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "blocked",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const readinessScore = Math.round((readySections / totalSections) * 100);
  const roomHasTitle = room.title.trim().length > 0;
  const ownerHandoffReady = ownerHandoffEvidence.streamProductOwnerHandoffReady;
  const streamReadinessDashboardReady = roomHasTitle
    && ownerHandoffReady
    && readinessScore === 100
    && state.allConnectionsThroughKernel
    && state.directLiveProviderAllowed === false
    && state.directRealtimeProviderAllowed === false
    && state.directUploadProviderAllowed === false
    && state.directBusinessProviderAllowed === false
    && state.directProfileProviderAllowed === false
    && state.directShortsProviderAllowed === false
    && state.directWalletConnectionAllowed === false
    && state.directGiftPaymentAllowed === false
    && state.backendProviderActivatedNow === false
    && state.liveBackendTouchedNow === false
    && state.businessBackendTouchedNow === false
    && state.profileBackendTouchedNow === false
    && state.shortsBackendTouchedNow === false
    && state.walletTouchedNow === false
    && state.messengerTouchedNow === false
    && state.mainAiTouchedNow === false
    && state.fakeLaunchAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeUploadAllowed === false
    && state.fakePublishAllowed === false
    && state.fakeViewsAllowed === false
    && state.fakeOrderAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false
    && state.monetizationImplementedNow === false;

  return {
    version: "STREAM-117C",
    selectedSectionId: state.selectedSectionId,
    readinessScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Readiness панель Stream чистый, честный и только через ядро",
    heroSubtitle: "Владелец видит готовность эфира, Бизнес Stream, профиля автора и шортов плюс бэкенд/провайдер блокеры без фейкового запуск, runtime, загрузка или платёж.",
    phoneStatus: streamReadinessDashboardReady ? "Readiness панель готов" : "Readiness панель требует финальной проверки блокеров",
    primaryAction: "Показать один владелец панель: UI/UX принят, контракты ядра зафиксированы, бэкенд/провайдер запуск блокеры понятны, коммерция/подарки отложены.",
    secondaryAction: "Дальше: продолжать утверждённое бэкенд/провайдер планирование или финальный этап подарков только по порядку; пока не заявлять эфир запуск.",
    dashboardSurfaceReady: state.dashboardSurfaceReadyLocal,
    liveSummaryVisible: state.liveSummaryVisibleLocal,
    businessSummaryVisible: state.businessSummaryVisibleLocal,
    profileShortsSummaryVisible: state.profileShortsSummaryVisibleLocal,
    backendProviderBlockersClear: state.backendProviderBlockersClearLocal,
    kernelContractsLocked: state.kernelContractsLockedLocal,
    safetyComplianceVisible: state.safetyComplianceVisibleLocal,
    commerceBlockersHonest: state.commerceBlockersHonestLocal,
    giftsMonetizationDeferred: state.giftsMonetizationDeferredLocal,
    launchNotClaimed: state.launchNotClaimedLocal,
    nextBackendPlanReady: state.nextBackendPlanReadyLocal,
    ownerHandoffReady,
    streamReadinessDashboardReady,
    allConnectionsThroughKernel: true,
    directLiveProviderAllowed: false,
    directRealtimeProviderAllowed: false,
    directUploadProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directProfileProviderAllowed: false,
    directShortsProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    backendProviderActivatedNow: false,
    liveBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    shortsBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeLaunchAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeViewsAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
