import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream116GShortsFinalAcceptanceEvidence } from "./stream116gShortsFinalAcceptanceKernelUiuxRuntime";

export type Stream117AOverallAcceptanceSectionId =
  | "live_room_accepted"
  | "business_stream_accepted"
  | "creator_profile_accepted"
  | "shorts_accepted"
  | "language_layer_ready"
  | "kernel_boundary_locked"
  | "safety_moderation_ready"
  | "commerce_blocked"
  | "gifts_deferred"
  | "stream_next_handoff";

export type Stream117AOverallAcceptanceStatus = "ready" | "needs_polish";

export type Stream117AOverallAcceptanceSection = {
  readonly id: Stream117AOverallAcceptanceSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream117AOverallAcceptanceStatus;
};

export type Stream117AOverallAcceptanceState = {
  readonly version: "STREAM-117A";
  readonly selectedSectionId: Stream117AOverallAcceptanceSectionId;
  readonly readySectionIds: readonly Stream117AOverallAcceptanceSectionId[];
  readonly lastAction: string;
  readonly liveRoomAcceptedLocal: boolean;
  readonly businessStreamAcceptedLocal: boolean;
  readonly creatorProfileAcceptedLocal: boolean;
  readonly shortsAcceptedLocal: boolean;
  readonly languageLayerReadyLocal: boolean;
  readonly kernelBoundaryLockedLocal: boolean;
  readonly safetyModerationReadyLocal: boolean;
  readonly commerceBlockedLocal: boolean;
  readonly giftsDeferredLocal: boolean;
  readonly streamNextHandoffLocal: boolean;
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
  readonly fakeBusinessLiveAllowed: false;
  readonly fakeProfileSaveAllowed: false;
  readonly fakeShortsFeedAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream117AOverallAcceptanceEvidence = {
  readonly version: "STREAM-117A";
  readonly selectedSectionId: Stream117AOverallAcceptanceSectionId;
  readonly overallScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream117AOverallAcceptanceSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly liveRoomAccepted: boolean;
  readonly businessStreamAccepted: boolean;
  readonly creatorProfileAccepted: boolean;
  readonly shortsAccepted: boolean;
  readonly languageLayerReady: boolean;
  readonly kernelBoundaryLocked: boolean;
  readonly safetyModerationReady: boolean;
  readonly commerceBlocked: boolean;
  readonly giftsDeferred: boolean;
  readonly streamNextHandoffReady: boolean;
  readonly shortsFinalAcceptanceReady: boolean;
  readonly streamOverallUiuxReady: boolean;
  readonly nextGiftsStageReady: boolean;
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
  readonly fakeBusinessLiveAllowed: false;
  readonly fakeProfileSaveAllowed: false;
  readonly fakeShortsFeedAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream117AOverallAcceptanceSectionId, { title: string; description: string }> = {
  live_room_accepted: {
    title: "Эфир принят",
    description: "UI/UX эфира закрыт первым: ведущий, зритель, чат, люди, соведущий, дуэль, поделиться, 18+, AI-защита и предварительная проверка.",
  },
  business_stream_accepted: {
    title: "Бизнес Stream принят",
    description: "Бизнес Stream содержит бренд, витрину, запрос цены, контакт/лид, управление ведущего, комплаенс и владелец шлюз как UI/intent через ядро.",
  },
  creator_profile_accepted: {
    title: "Профиль автора принят",
    description: "Профиль автора покрывает личность, вкладки контента, настройку, вовлечение, приватность, безопасность и границу официального стримера без фейковой верификации.",
  },
  shorts_accepted: {
    title: "Шорты приняты",
    description: "Шорты покрывают премиум-ленту, редактор, эффекты, MP3/музыку, комментарии, реакции, модерацию и шлюз публикации без фейковой загрузки/воспроизведения.",
  },
  language_layer_ready: {
    title: "Слой 25 языков готов",
    description: "Stream использует единый общий реестр 25 языков вместо ручных фрагментов RU/EN/UZ/ZH.",
  },
  kernel_boundary_locked: {
    title: "Граница только через ядро",
    description: "Эфир, бизнес, профиль, шорты, реалтайм, провайдер, подарки и будущая коммерция подключаются только через core/ядро facades/events.",
  },
  safety_moderation_ready: {
    title: "Безопасность и модерация готовы",
    description: "18+, мат, оскорбления, жалобы, AI-проверка, управление ведущего и appeal/аудит UI показаны как честные границы модерации.",
  },
  commerce_blocked: {
    title: "Коммерция заблокирована",
    description: "Merchant, Wallet, заказы, checkout, счета, выплаты и платежи остаются заблокированы до своих утверждённых этапов.",
  },
  gifts_deferred: {
    title: "Подарки отложены",
    description: "Отправка подарков обязательна позже, но остаётся отложенной до финального этапа подарков Stream с правильными правилами Coin/Wallet/провайдера.",
  },
  stream_next_handoff: {
    title: "Передача Stream",
    description: "После общей приёмки Stream следующая работа может перейти к правильному оставшемуся этапу без нарушения границ ядра.",
  },
};

const ALL_SECTIONS: readonly Stream117AOverallAcceptanceSectionId[] = [
  "live_room_accepted",
  "business_stream_accepted",
  "creator_profile_accepted",
  "shorts_accepted",
  "language_layer_ready",
  "kernel_boundary_locked",
  "safety_moderation_ready",
  "commerce_blocked",
  "gifts_deferred",
  "stream_next_handoff",
];

const FIELD_BY_SECTION: Record<Stream117AOverallAcceptanceSectionId, keyof Pick<
  Stream117AOverallAcceptanceState,
  | "liveRoomAcceptedLocal"
  | "businessStreamAcceptedLocal"
  | "creatorProfileAcceptedLocal"
  | "shortsAcceptedLocal"
  | "languageLayerReadyLocal"
  | "kernelBoundaryLockedLocal"
  | "safetyModerationReadyLocal"
  | "commerceBlockedLocal"
  | "giftsDeferredLocal"
  | "streamNextHandoffLocal"
>> = {
  live_room_accepted: "liveRoomAcceptedLocal",
  business_stream_accepted: "businessStreamAcceptedLocal",
  creator_profile_accepted: "creatorProfileAcceptedLocal",
  shorts_accepted: "shortsAcceptedLocal",
  language_layer_ready: "languageLayerReadyLocal",
  kernel_boundary_locked: "kernelBoundaryLockedLocal",
  safety_moderation_ready: "safetyModerationReadyLocal",
  commerce_blocked: "commerceBlockedLocal",
  gifts_deferred: "giftsDeferredLocal",
  stream_next_handoff: "streamNextHandoffLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream117AOverallAcceptanceSectionId[]): readonly Stream117AOverallAcceptanceSectionId[] {
  return Array.from(new Set(sectionIds));
}

export function createInitialStream117AOverallAcceptanceState(): Stream117AOverallAcceptanceState {
  return {
    version: "STREAM-117A",
    selectedSectionId: "live_room_accepted",
    readySectionIds: ["commerce_blocked", "gifts_deferred"],
    lastAction: "Общая приёмка Stream ждёт совместной проверки эфира, бизнеса, профиля и шортов.",
    liveRoomAcceptedLocal: false,
    businessStreamAcceptedLocal: false,
    creatorProfileAcceptedLocal: false,
    shortsAcceptedLocal: false,
    languageLayerReadyLocal: true,
    kernelBoundaryLockedLocal: true,
    safetyModerationReadyLocal: false,
    commerceBlockedLocal: true,
    giftsDeferredLocal: true,
    streamNextHandoffLocal: false,
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
    fakeBusinessLiveAllowed: false,
    fakeProfileSaveAllowed: false,
    fakeShortsFeedAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

export function selectStream117AOverallAcceptanceSection(
  state: Stream117AOverallAcceptanceState,
  sectionId: Stream117AOverallAcceptanceSectionId,
): Stream117AOverallAcceptanceState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream117AOverallAcceptanceSectionReady(
  state: Stream117AOverallAcceptanceState,
  sectionId: Stream117AOverallAcceptanceSectionId,
  action: string,
): Stream117AOverallAcceptanceState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream117AOverallAcceptanceAllReady(
  state: Stream117AOverallAcceptanceState,
  action: string,
): Stream117AOverallAcceptanceState {
  return {
    ...state,
    selectedSectionId: "stream_next_handoff",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    liveRoomAcceptedLocal: true,
    businessStreamAcceptedLocal: true,
    creatorProfileAcceptedLocal: true,
    shortsAcceptedLocal: true,
    languageLayerReadyLocal: true,
    kernelBoundaryLockedLocal: true,
    safetyModerationReadyLocal: true,
    commerceBlockedLocal: true,
    giftsDeferredLocal: true,
    streamNextHandoffLocal: true,
  };
}

export function buildStream117AOverallAcceptanceEvidence(
  state: Stream117AOverallAcceptanceState,
  room: StreamRoomRuntimeState,
  shortsEvidence: Stream116GShortsFinalAcceptanceEvidence,
): Stream117AOverallAcceptanceEvidence {
  const sectionItems: Stream117AOverallAcceptanceSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "needs_polish",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const overallScore = Math.round((readySections / totalSections) * 100);
  const roomHasTitle = room.title.trim().length > 0;
  const shortsFinalAcceptanceReady = shortsEvidence.shortsFinalAcceptanceUiuxReady;
  const streamOverallUiuxReady = roomHasTitle
    && shortsFinalAcceptanceReady
    && overallScore === 100
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
    && state.fakeBusinessLiveAllowed === false
    && state.fakeProfileSaveAllowed === false
    && state.fakeShortsFeedAllowed === false
    && state.fakeUploadAllowed === false
    && state.fakePublishAllowed === false
    && state.fakeOrderAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false
    && state.monetizationImplementedNow === false;

  return {
    version: "STREAM-117A",
    selectedSectionId: state.selectedSectionId,
    overallScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Общая UI/UX-приёмка Stream готова к финальной проверке владельца",
    heroSubtitle: "Эфир, Бизнес Stream, профиль автора и шорты собраны в один продуктовый путь Stream с 25 языками, безопасностью Sabi AI и границами только через core/ядро.",
    phoneStatus: streamOverallUiuxReady ? "UI/UX Stream принят" : "Общей приёмке Stream нужны финальные проверки",
    primaryAction: "Проверь Stream как один продукт: сначала эфир, затем Бизнес Stream, профиль и шорты — всё через контракты ядра без фейкового runtime-success.",
    secondaryAction: "Дальше: держать подарки и монетизацию для финального этапа Stream; сейчас не включать фейковые платежи, заказы, счётчики или отправку подарков.",
    liveRoomAccepted: state.liveRoomAcceptedLocal,
    businessStreamAccepted: state.businessStreamAcceptedLocal,
    creatorProfileAccepted: state.creatorProfileAcceptedLocal,
    shortsAccepted: state.shortsAcceptedLocal,
    languageLayerReady: state.languageLayerReadyLocal,
    kernelBoundaryLocked: state.kernelBoundaryLockedLocal,
    safetyModerationReady: state.safetyModerationReadyLocal,
    commerceBlocked: state.commerceBlockedLocal,
    giftsDeferred: state.giftsDeferredLocal,
    streamNextHandoffReady: state.streamNextHandoffLocal,
    shortsFinalAcceptanceReady,
    streamOverallUiuxReady,
    nextGiftsStageReady: streamOverallUiuxReady,
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
    fakeBusinessLiveAllowed: false,
    fakeProfileSaveAllowed: false,
    fakeShortsFeedAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
