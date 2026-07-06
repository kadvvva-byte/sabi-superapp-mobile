import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream117AOverallAcceptanceEvidence } from "./stream117aStreamOverallAcceptanceKernelUiuxRuntime";

export type Stream117BOwnerHandoffSectionId =
  | "product_surface_clean"
  | "owner_summary_ready"
  | "live_business_profile_shorts_clear"
  | "language_layer_locked"
  | "kernel_boundary_locked"
  | "tech_mode_hidden"
  | "runtime_blocks_honest"
  | "commerce_blocked"
  | "gifts_deferred"
  | "next_stage_ready";

export type Stream117BOwnerHandoffStatus = "ready" | "needs_cleanup";

export type Stream117BOwnerHandoffSection = {
  readonly id: Stream117BOwnerHandoffSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream117BOwnerHandoffStatus;
};

export type Stream117BOwnerHandoffState = {
  readonly version: "STREAM-117B";
  readonly selectedSectionId: Stream117BOwnerHandoffSectionId;
  readonly readySectionIds: readonly Stream117BOwnerHandoffSectionId[];
  readonly lastAction: string;
  readonly productSurfaceCleanLocal: boolean;
  readonly ownerSummaryReadyLocal: boolean;
  readonly liveBusinessProfileShortsClearLocal: boolean;
  readonly languageLayerLockedLocal: boolean;
  readonly kernelBoundaryLockedLocal: boolean;
  readonly techModeHiddenLocal: boolean;
  readonly runtimeBlocksHonestLocal: boolean;
  readonly commerceBlockedLocal: boolean;
  readonly giftsDeferredLocal: boolean;
  readonly nextStageReadyLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directLiveProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directShortsProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly liveBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly shortsBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream117BOwnerHandoffEvidence = {
  readonly version: "STREAM-117B";
  readonly selectedSectionId: Stream117BOwnerHandoffSectionId;
  readonly handoffScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream117BOwnerHandoffSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly productSurfaceClean: boolean;
  readonly ownerSummaryReady: boolean;
  readonly liveBusinessProfileShortsClear: boolean;
  readonly languageLayerLocked: boolean;
  readonly kernelBoundaryLocked: boolean;
  readonly techModeHidden: boolean;
  readonly runtimeBlocksHonest: boolean;
  readonly commerceBlocked: boolean;
  readonly giftsDeferred: boolean;
  readonly nextStageReady: boolean;
  readonly streamOverallAccepted: boolean;
  readonly streamProductOwnerHandoffReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directLiveProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directShortsProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly liveBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly shortsBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream117BOwnerHandoffSectionId, { title: string; description: string }> = {
  product_surface_clean: {
    title: "Чистая продуктовая поверхность",
    description: "Stream показан как одна чистая продуктовая поверхность, а не длинная QA/debug-доска.",
  },
  owner_summary_ready: {
    title: "Сводка владельца готова",
    description: "Владелец видит, что принято, что заблокировано и какой следующий этап — без технического шума.",
  },
  live_business_profile_shorts_clear: {
    title: "Эфир / бизнес / профиль / шорты понятны",
    description: "Четыре опоры Stream имеют понятную UI/UX-передачу и не смешивают коммерцию, подарки или фейковый runtime.",
  },
  language_layer_locked: {
    title: "Слой 25 языков зафиксирован",
    description: "Stream сохраняет единый общий слой 25 языков вместо маленьких ручных языковых фрагментов.",
  },
  kernel_boundary_locked: {
    title: "Граница ядра зафиксирована",
    description: "Все потоки эфира, бизнеса, профиля, шортов, модерации, провайдера и будущих подарков проходят через core/ядро контракты.",
  },
  tech_mode_hidden: {
    title: "Техрежим скрыт",
    description: "QA/evidence панели остаются доступны только в техническом режиме; обычные пользователи видят продуктовый текст и продуктовые действия.",
  },
  runtime_blocks_honest: {
    title: "Runtime-блокировки честные",
    description: "Реальный эфир, реалтайм, провайдер, загрузка и публикация не фейкуются; заблокированные состояния объяснены прямо.",
  },
  commerce_blocked: {
    title: "Коммерция заблокирована",
    description: "Merchant, Wallet, checkout, счета, выплаты и платежи остаются заблокированы до отдельных утверждённых этапов.",
  },
  gifts_deferred: {
    title: "Подарки отложены",
    description: "Отправка подарков обязательна позже и должна быть правильно реализована на финальном этапе подарков Stream.",
  },
  next_stage_ready: {
    title: "Следующий этап готов",
    description: "После владелец передача Stream может перейти к следующему упорядоченному этапу без нарушения границ ядра.",
  },
};

const ALL_SECTIONS: readonly Stream117BOwnerHandoffSectionId[] = [
  "product_surface_clean",
  "owner_summary_ready",
  "live_business_profile_shorts_clear",
  "language_layer_locked",
  "kernel_boundary_locked",
  "tech_mode_hidden",
  "runtime_blocks_honest",
  "commerce_blocked",
  "gifts_deferred",
  "next_stage_ready",
];

const FIELD_BY_SECTION: Record<Stream117BOwnerHandoffSectionId, keyof Pick<
  Stream117BOwnerHandoffState,
  | "productSurfaceCleanLocal"
  | "ownerSummaryReadyLocal"
  | "liveBusinessProfileShortsClearLocal"
  | "languageLayerLockedLocal"
  | "kernelBoundaryLockedLocal"
  | "techModeHiddenLocal"
  | "runtimeBlocksHonestLocal"
  | "commerceBlockedLocal"
  | "giftsDeferredLocal"
  | "nextStageReadyLocal"
>> = {
  product_surface_clean: "productSurfaceCleanLocal",
  owner_summary_ready: "ownerSummaryReadyLocal",
  live_business_profile_shorts_clear: "liveBusinessProfileShortsClearLocal",
  language_layer_locked: "languageLayerLockedLocal",
  kernel_boundary_locked: "kernelBoundaryLockedLocal",
  tech_mode_hidden: "techModeHiddenLocal",
  runtime_blocks_honest: "runtimeBlocksHonestLocal",
  commerce_blocked: "commerceBlockedLocal",
  gifts_deferred: "giftsDeferredLocal",
  next_stage_ready: "nextStageReadyLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream117BOwnerHandoffSectionId[]): readonly Stream117BOwnerHandoffSectionId[] {
  return Array.from(new Set(sectionIds));
}

export function createInitialStream117BOwnerHandoffState(): Stream117BOwnerHandoffState {
  return {
    version: "STREAM-117B",
    selectedSectionId: "product_surface_clean",
    readySectionIds: ["language_layer_locked", "kernel_boundary_locked", "commerce_blocked", "gifts_deferred"],
    lastAction: "Передача продукта Stream ждёт финальной чистки владельца и простой проверки заблокированных состояний.",
    productSurfaceCleanLocal: false,
    ownerSummaryReadyLocal: false,
    liveBusinessProfileShortsClearLocal: false,
    languageLayerLockedLocal: true,
    kernelBoundaryLockedLocal: true,
    techModeHiddenLocal: false,
    runtimeBlocksHonestLocal: false,
    commerceBlockedLocal: true,
    giftsDeferredLocal: true,
    nextStageReadyLocal: false,
    allConnectionsThroughKernel: true,
    directLiveProviderAllowed: false,
    directRealtimeProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directProfileProviderAllowed: false,
    directShortsProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    liveBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    shortsBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

export function selectStream117BOwnerHandoffSection(
  state: Stream117BOwnerHandoffState,
  sectionId: Stream117BOwnerHandoffSectionId,
): Stream117BOwnerHandoffState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream117BOwnerHandoffSectionReady(
  state: Stream117BOwnerHandoffState,
  sectionId: Stream117BOwnerHandoffSectionId,
  action: string,
): Stream117BOwnerHandoffState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream117BOwnerHandoffAllReady(
  state: Stream117BOwnerHandoffState,
  action: string,
): Stream117BOwnerHandoffState {
  return {
    ...state,
    selectedSectionId: "next_stage_ready",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    productSurfaceCleanLocal: true,
    ownerSummaryReadyLocal: true,
    liveBusinessProfileShortsClearLocal: true,
    languageLayerLockedLocal: true,
    kernelBoundaryLockedLocal: true,
    techModeHiddenLocal: true,
    runtimeBlocksHonestLocal: true,
    commerceBlockedLocal: true,
    giftsDeferredLocal: true,
    nextStageReadyLocal: true,
  };
}

export function buildStream117BOwnerHandoffEvidence(
  state: Stream117BOwnerHandoffState,
  room: StreamRoomRuntimeState,
  overallEvidence: Stream117AOverallAcceptanceEvidence,
): Stream117BOwnerHandoffEvidence {
  const sectionItems: Stream117BOwnerHandoffSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "needs_cleanup",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const handoffScore = Math.round((readySections / totalSections) * 100);
  const roomHasTitle = room.title.trim().length > 0;
  const streamOverallAccepted = overallEvidence.streamOverallUiuxReady;
  const streamProductOwnerHandoffReady = roomHasTitle
    && streamOverallAccepted
    && handoffScore === 100
    && state.allConnectionsThroughKernel
    && state.directLiveProviderAllowed === false
    && state.directRealtimeProviderAllowed === false
    && state.directBusinessProviderAllowed === false
    && state.directProfileProviderAllowed === false
    && state.directShortsProviderAllowed === false
    && state.directWalletConnectionAllowed === false
    && state.directGiftPaymentAllowed === false
    && state.liveBackendTouchedNow === false
    && state.businessBackendTouchedNow === false
    && state.profileBackendTouchedNow === false
    && state.shortsBackendTouchedNow === false
    && state.walletTouchedNow === false
    && state.messengerTouchedNow === false
    && state.mainAiTouchedNow === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeUploadAllowed === false
    && state.fakePublishAllowed === false
    && state.fakeOrderAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false
    && state.monetizationImplementedNow === false;

  return {
    version: "STREAM-117B",
    selectedSectionId: state.selectedSectionId,
    handoffScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Продукт Stream готов к владелец передача как чистый UI/UX-пакет",
    heroSubtitle: "Эфир, Бизнес Stream, профиль автора и шорты показаны как один продукт Stream с 25 языками, безопасностью Sabi AI и границами только через ядро.",
    phoneStatus: streamProductOwnerHandoffReady ? "Владелец передача готов" : "Владелец передача требует финальной чистки",
    primaryAction: "Показать Stream как один продукт: чистый UI телефона, скрытый техрежим, подключения только через ядро и честные заблокированные runtime-состояния.",
    secondaryAction: "Дальше: продолжать только в утверждённом порядке; подарки и монетизация остаются финальным этапом Stream с правильными правилами Coin/Wallet/провайдера.",
    productSurfaceClean: state.productSurfaceCleanLocal,
    ownerSummaryReady: state.ownerSummaryReadyLocal,
    liveBusinessProfileShortsClear: state.liveBusinessProfileShortsClearLocal,
    languageLayerLocked: state.languageLayerLockedLocal,
    kernelBoundaryLocked: state.kernelBoundaryLockedLocal,
    techModeHidden: state.techModeHiddenLocal,
    runtimeBlocksHonest: state.runtimeBlocksHonestLocal,
    commerceBlocked: state.commerceBlockedLocal,
    giftsDeferred: state.giftsDeferredLocal,
    nextStageReady: state.nextStageReadyLocal,
    streamOverallAccepted,
    streamProductOwnerHandoffReady,
    allConnectionsThroughKernel: true,
    directLiveProviderAllowed: false,
    directRealtimeProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directProfileProviderAllowed: false,
    directShortsProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    liveBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    shortsBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
