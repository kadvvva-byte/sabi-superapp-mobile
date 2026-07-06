import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113ULiveFinalPhoneKernelAuditUiuxEvidence } from "./stream113uLiveFinalPhoneKernelAuditUiuxRuntime";

export type Stream113VLiveProductCleanupSectionId =
  | "product_first_screen"
  | "technical_mode_collapsed"
  | "live_path_single_story"
  | "kernel_boundary_visible"
  | "profile_business_hooks_soft"
  | "gifts_deferred_boundary"
  | "launch_guard_plain";

export type Stream113VLiveProductCleanupSectionStatus = "product_ready" | "needs_cleanup";

export type Stream113VLiveProductCleanupSection = {
  readonly id: Stream113VLiveProductCleanupSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113VLiveProductCleanupSectionStatus;
};

export type Stream113VLiveProductCleanupTechModeUiuxState = {
  readonly version: "STREAM-113V";
  readonly selectedSectionId: Stream113VLiveProductCleanupSectionId;
  readonly readySectionIds: readonly Stream113VLiveProductCleanupSectionId[];
  readonly lastAction: string;
  readonly productFirstScreenReadyLocal: boolean;
  readonly technicalModeCollapsedLocal: boolean;
  readonly singleLiveStoryReadyLocal: boolean;
  readonly kernelBoundaryVisibleLocal: boolean;
  readonly profileBusinessHooksSoftLocal: boolean;
  readonly giftsDeferredBoundaryLocal: boolean;
  readonly launchGuardPlainLocal: boolean;
  readonly liveFirstOrderLocked: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly separateProfileScreenCreatedNow: false;
  readonly separateBusinessScreenCreatedNow: false;
  readonly giftSendingImplementedNow: false;
  readonly backendProviderLiveReady: false;
  readonly launchAllowedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

export type Stream113VLiveProductCleanupTechModeUiuxEvidence = {
  readonly version: "STREAM-113V";
  readonly selectedSectionId: Stream113VLiveProductCleanupSectionId;
  readonly productScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream113VLiveProductCleanupSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly productSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly cleanProductModeReady: boolean;
  readonly technicalModeCollapsed: boolean;
  readonly liveFirstOrderLocked: true;
  readonly previousLiveAuditReady: boolean;
  readonly kernelBoundaryReady: boolean;
  readonly profileHookReady: boolean;
  readonly businessHookReady: boolean;
  readonly giftsDeferredCorrectly: boolean;
  readonly realLaunchStillBlocked: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly separateProfileScreenCreatedNow: false;
  readonly separateBusinessScreenCreatedNow: false;
  readonly giftSendingImplementedNow: false;
  readonly backendProviderLiveReady: false;
  readonly launchAllowedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

const SECTION_ORDER: readonly Stream113VLiveProductCleanupSectionId[] = [
  "product_first_screen",
  "technical_mode_collapsed",
  "live_path_single_story",
  "kernel_boundary_visible",
  "profile_business_hooks_soft",
  "gifts_deferred_boundary",
  "launch_guard_plain",
];

const SECTION_TITLES: Record<Stream113VLiveProductCleanupSectionId, string> = {
  product_first_screen: "Первый продуктовый экран",
  technical_mode_collapsed: "Техрежим свёрнут",
  live_path_single_story: "Единый сценарий Live",
  kernel_boundary_visible: "Граница ядра",
  profile_business_hooks_soft: "Профиль/Business hooks",
  gifts_deferred_boundary: "Подарки отложены",
  launch_guard_plain: "Понятная защита запуска",
};

const SECTION_DESCRIPTIONS: Record<Stream113VLiveProductCleanupSectionId, string> = {
  product_first_screen: "Первый экран Live settings показывает продуктовый Live UX: главный статус, phone surface, действие ведущего и безопасность без длинного QA-текста.",
  technical_mode_collapsed: "Все 112N→113U проверки остаются доступными только в техрежиме; обычный пользователь не видит debug/evidence/smoke панели.",
  live_path_single_story: "Live читается как один сценарий: подготовка, эфирный экран, чат, люди, co-host, дуэль, share, модерация, итог.",
  kernel_boundary_visible: "На экране есть понятная архитектурная граница: realtime/provider/lifecycle/moderation/co-host/battle/profile/business/gifts подключаются только через core/kernel.",
  profile_business_hooks_soft: "Будущие профиль ведущего и Business Stream представлены мягкими hooks внутри Live, без преждевременного создания отдельных экранов.",
  gifts_deferred_boundary: "Подарки отмечены как обязательная end-stage функция, но сейчас нет фейковая отправка подаркаing, fake payment и фейковое движение COIN.",
  launch_guard_plain: "Запуск настоящего live остаётся честно blocked до backend/provider, но текст выглядит продуктово, а не как ошибка разработчика.",
};

export function createInitialStream113VLiveProductCleanupTechModeUiuxState(): Stream113VLiveProductCleanupTechModeUiuxState {
  return {
    version: "STREAM-113V",
    selectedSectionId: "product_first_screen",
    readySectionIds: ["technical_mode_collapsed", "kernel_boundary_visible", "gifts_deferred_boundary"],
    lastAction: "113V начал финальную product cleanup проверку: обычный Live экран чистый, техпанели скрыты, kernel-only boundary видна.",
    productFirstScreenReadyLocal: false,
    technicalModeCollapsedLocal: true,
    singleLiveStoryReadyLocal: false,
    kernelBoundaryVisibleLocal: true,
    profileBusinessHooksSoftLocal: false,
    giftsDeferredBoundaryLocal: true,
    launchGuardPlainLocal: false,
    liveFirstOrderLocked: true,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    separateProfileScreenCreatedNow: false,
    separateBusinessScreenCreatedNow: false,
    giftSendingImplementedNow: false,
    backendProviderLiveReady: false,
    launchAllowedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  };
}

export function selectStream113VLiveProductCleanupSection(
  state: Stream113VLiveProductCleanupTechModeUiuxState,
  selectedSectionId: Stream113VLiveProductCleanupSectionId,
): Stream113VLiveProductCleanupTechModeUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113V product cleanup section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113VLiveProductCleanupSectionReady(
  state: Stream113VLiveProductCleanupTechModeUiuxState,
  sectionId: Stream113VLiveProductCleanupSectionId,
  action: string,
): Stream113VLiveProductCleanupTechModeUiuxState {
  const readySectionIds = state.readySectionIds.includes(sectionId) ? state.readySectionIds : [...state.readySectionIds, sectionId];
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    lastAction: action,
    productFirstScreenReadyLocal: state.productFirstScreenReadyLocal || sectionId === "product_first_screen",
    technicalModeCollapsedLocal: state.technicalModeCollapsedLocal || sectionId === "technical_mode_collapsed",
    singleLiveStoryReadyLocal: state.singleLiveStoryReadyLocal || sectionId === "live_path_single_story",
    kernelBoundaryVisibleLocal: state.kernelBoundaryVisibleLocal || sectionId === "kernel_boundary_visible",
    profileBusinessHooksSoftLocal: state.profileBusinessHooksSoftLocal || sectionId === "profile_business_hooks_soft",
    giftsDeferredBoundaryLocal: state.giftsDeferredBoundaryLocal || sectionId === "gifts_deferred_boundary",
    launchGuardPlainLocal: state.launchGuardPlainLocal || sectionId === "launch_guard_plain",
  };
}

export function markStream113VLiveProductCleanupAllReady(
  state: Stream113VLiveProductCleanupTechModeUiuxState,
  action: string,
): Stream113VLiveProductCleanupTechModeUiuxState {
  return {
    ...state,
    selectedSectionId: "product_first_screen",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    productFirstScreenReadyLocal: true,
    technicalModeCollapsedLocal: true,
    singleLiveStoryReadyLocal: true,
    kernelBoundaryVisibleLocal: true,
    profileBusinessHooksSoftLocal: true,
    giftsDeferredBoundaryLocal: true,
    launchGuardPlainLocal: true,
  };
}

function buildSections(readySectionIds: readonly Stream113VLiveProductCleanupSectionId[]): readonly Stream113VLiveProductCleanupSection[] {
  return SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySectionIds.includes(id) ? "product_ready" : "needs_cleanup",
  }));
}

function activeNarrativeFor(sectionId: Stream113VLiveProductCleanupSectionId): string {
  switch (sectionId) {
    case "product_first_screen":
      return "Обычный Live экран должен начинаться с продукта: понятный статус, phone preview и одно главное действие, без QA-отчёта в первом экране.";
    case "technical_mode_collapsed":
      return "Технические проверки остаются, но спрятаны за отдельной кнопкой. Это сохраняет контроль разработки и не портит UX ведущего.";
    case "live_path_single_story":
      return "Ведущий и зритель проходят один сценарий Live, а не набор разрозненных тестовых панелей.";
    case "kernel_boundary_visible":
      return "Все подключения должны идти через core/kernel contracts/facades/events; экран не должен подключаться напрямую к provider или scattered services.";
    case "profile_business_hooks_soft":
      return "Профиль и Business Stream нужны Live вовремя как hooks, но не должны преждевременно раздувать текущий этап отдельными экранами.";
    case "gifts_deferred_boundary":
      return "Подарки обязательны позже и должны быть реализованы правильно, но сейчас они остаются end-stage boundary без fake отправки и fake оплаты.";
    case "launch_guard_plain":
      return "Пользователь должен понимать: preview готов, но реальный live запуск ждёт backend/provider. Это честное состояние, не ошибка.";
  }
}

export function buildStream113VLiveProductCleanupTechModeUiuxEvidence(
  state: Stream113VLiveProductCleanupTechModeUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  liveAudit: Stream113ULiveFinalPhoneKernelAuditUiuxEvidence,
): Stream113VLiveProductCleanupTechModeUiuxEvidence {
  const readySections = state.readySectionIds.length;
  const totalSections = SECTION_ORDER.length;
  const previousLiveAuditReady = liveAudit.livePhoneUiuxReady && liveAudit.kernelBoundaryReady;
  const cleanProductModeReady = readySections === totalSections && previousLiveAuditReady;
  const scoreBase = Math.round((readySections / totalSections) * 100);
  const productScore = Math.min(99, Math.max(scoreBase, previousLiveAuditReady ? 88 : 70));
  const title = room.title || "Sabi Live";
  const activeTitle = SECTION_TITLES[state.selectedSectionId];
  const activeNarrative = activeNarrativeFor(state.selectedSectionId);
  const technicalModeCollapsed = state.technicalModeCollapsedLocal && state.readySectionIds.includes("technical_mode_collapsed");
  const kernelBoundaryReady = state.kernelBoundaryVisibleLocal && liveAudit.allLiveConnectionsThroughKernel;
  return {
    version: "STREAM-113V",
    selectedSectionId: state.selectedSectionId,
    productScore,
    readySections,
    totalSections,
    sectionItems: buildSections(state.readySectionIds),
    heroTitle: cleanProductModeReady ? "Live product cleanup закрыт" : "Live product cleanup",
    heroSubtitle: `${title}: чистый экран Live, техрежим скрыт, kernel boundary видна, gifts later.`,
    phoneStatus: technicalModeCollapsed ? "Clean product mode" : "Нужно спрятать техпанели",
    productSummary: `${room.participants.length} участн. · ${room.comments.length} комм. · ${stage.layout} · launch blocked до backend/provider`,
    activeTitle,
    activeNarrative,
    primaryAction: cleanProductModeReady ? "Live UI/UX выглядит как продуктовый экран. Следующий pass — финальная ручная проверка на телефоне." : `Закройте: ${activeTitle}.`,
    secondaryAction: state.lastAction,
    cleanProductModeReady,
    technicalModeCollapsed,
    liveFirstOrderLocked: true,
    previousLiveAuditReady,
    kernelBoundaryReady,
    profileHookReady: state.profileBusinessHooksSoftLocal && liveAudit.profileHookReady,
    businessHookReady: state.profileBusinessHooksSoftLocal && liveAudit.businessStreamHookReady,
    giftsDeferredCorrectly: state.giftsDeferredBoundaryLocal && liveAudit.giftBoundaryReady,
    realLaunchStillBlocked: true,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    separateProfileScreenCreatedNow: false,
    separateBusinessScreenCreatedNow: false,
    giftSendingImplementedNow: false,
    backendProviderLiveReady: false,
    launchAllowedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  };
}
