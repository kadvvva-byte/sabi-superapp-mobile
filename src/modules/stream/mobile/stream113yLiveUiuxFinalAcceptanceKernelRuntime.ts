import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113XLivePresentationPolishKernelUiuxEvidence } from "./stream113xLivePresentationPolishKernelUiuxRuntime";

export type Stream113YLiveUiuxAcceptanceSectionId =
  | "phone_acceptance_complete"
  | "language_registry_25_locked"
  | "kernel_connection_contract_locked"
  | "safety_moderation_acceptance"
  | "profile_business_hooks_timed"
  | "gifts_deferred_acceptance"
  | "no_debug_panels_normal_ux"
  | "live_uiux_ready_handoff";

export type Stream113YLiveUiuxAcceptanceSectionStatus = "accepted" | "needs_final_review";

export type Stream113YLiveUiuxAcceptanceSection = {
  readonly id: Stream113YLiveUiuxAcceptanceSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113YLiveUiuxAcceptanceSectionStatus;
};

export type Stream113YLiveUiuxFinalAcceptanceKernelState = {
  readonly version: "STREAM-113Y";
  readonly selectedSectionId: Stream113YLiveUiuxAcceptanceSectionId;
  readonly acceptedSectionIds: readonly Stream113YLiveUiuxAcceptanceSectionId[];
  readonly lastAction: string;
  readonly phoneAcceptanceCompleteLocal: boolean;
  readonly languageRegistry25LockedLocal: boolean;
  readonly kernelConnectionContractLockedLocal: boolean;
  readonly safetyModerationAcceptanceLocal: boolean;
  readonly profileBusinessHooksTimedLocal: boolean;
  readonly giftsDeferredAcceptanceLocal: boolean;
  readonly noDebugPanelsNormalUxLocal: boolean;
  readonly liveUiuxReadyHandoffLocal: boolean;
  readonly liveFirstOrderLocked: true;
  readonly streamAfterLiveOrderLocked: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly separateProfileScreenCreatedNow: false;
  readonly separateBusinessScreenCreatedNow: false;
  readonly giftSendingImplementedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

export type Stream113YLiveUiuxFinalAcceptanceKernelEvidence = {
  readonly version: "STREAM-113Y";
  readonly selectedSectionId: Stream113YLiveUiuxAcceptanceSectionId;
  readonly acceptanceScore: number;
  readonly acceptedSections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream113YLiveUiuxAcceptanceSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly productSummary: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly liveUiuxAccepted: boolean;
  readonly presentationAccepted: boolean;
  readonly languageRegistry25Accepted: boolean;
  readonly supportedLanguageCount: number;
  readonly kernelBoundaryAccepted: boolean;
  readonly normalUxCleanAccepted: boolean;
  readonly profileBusinessHooksAccepted: boolean;
  readonly giftsDeferredAccepted: boolean;
  readonly liveFirstOrderLocked: true;
  readonly streamAfterLiveOrderLocked: true;
  readonly allConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly separateProfileScreenCreatedNow: false;
  readonly separateBusinessScreenCreatedNow: false;
  readonly giftSendingImplementedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

const SECTION_ORDER: readonly Stream113YLiveUiuxAcceptanceSectionId[] = [
  "phone_acceptance_complete",
  "language_registry_25_locked",
  "kernel_connection_contract_locked",
  "safety_moderation_acceptance",
  "profile_business_hooks_timed",
  "gifts_deferred_acceptance",
  "no_debug_panels_normal_ux",
  "live_uiux_ready_handoff",
];

const SECTION_TITLES: Record<Stream113YLiveUiuxAcceptanceSectionId, string> = {
  phone_acceptance_complete: "Телефонный UI принят",
  language_registry_25_locked: "25 языков закреплены",
  kernel_connection_contract_locked: "Контракт ядра закреплён",
  safety_moderation_acceptance: "Безопасность принята",
  profile_business_hooks_timed: "Профиль/Business hooks добавлены вовремя",
  gifts_deferred_acceptance: "Подарки правильно отложены",
  no_debug_panels_normal_ux: "Без служебного режима в обычном UX",
  live_uiux_ready_handoff: "Передача Live UI/UX",
};

const SECTION_DESCRIPTIONS: Record<Stream113YLiveUiuxAcceptanceSectionId, string> = {
  phone_acceptance_complete: "Live открывается как чистый телефонный продуктовый экран: ведущий, зритель, чат, люди, co-host, battle и share читаются без визуального мусора.",
  language_registry_25_locked: "Общий языковой слой использует реестр 25 языков; в пути приёмки Live не остаётся shortcut только RU/EN/UZ/ZH.",
  kernel_connection_contract_locked: "Каждое обещание подключения остаётся за core/kernel контрактами, фасадами и событиями; экран не подключается напрямую к провайдеру или realtime-сервисам.",
  safety_moderation_acceptance: "18+, ругательства, оскорбления, жалобы, проверка Sabi AI и действия ведущего/модератора читаются как единый продуктовый поток безопасности.",
  profile_business_hooks_timed: "Hooks профиля стримера и Business Stream названы внутри Live вовремя, без раннего создания этих экранов.",
  gifts_deferred_acceptance: "Отправка подарков обязательна позже, но на этом этапе Live нет фейковой кнопки подарка, оплаты или движения COIN.",
  no_debug_panels_normal_ux: "Обычный пользовательский UX скрывает QA, smoke, evidence и служебные тексты; технические панели остаются только за явным техрежимом.",
  live_uiux_ready_handoff: "Live UI/UX можно передать как принятый, пока реальный запуск остаётся заблокирован до утверждения этапов ядра/провайдера/сервера.",
};

function uniqueAccepted(items: readonly Stream113YLiveUiuxAcceptanceSectionId[]): readonly Stream113YLiveUiuxAcceptanceSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream113YLiveUiuxFinalAcceptanceKernelState(): Stream113YLiveUiuxFinalAcceptanceKernelState {
  return {
    version: "STREAM-113Y",
    selectedSectionId: "phone_acceptance_complete",
    acceptedSectionIds: ["kernel_connection_contract_locked", "gifts_deferred_acceptance"],
    lastAction: "113Y готовит финальную acceptance-проверку Live UI/UX: Live сначала до 100%, затем Stream.",
    phoneAcceptanceCompleteLocal: false,
    languageRegistry25LockedLocal: false,
    kernelConnectionContractLockedLocal: true,
    safetyModerationAcceptanceLocal: false,
    profileBusinessHooksTimedLocal: false,
    giftsDeferredAcceptanceLocal: true,
    noDebugPanelsNormalUxLocal: false,
    liveUiuxReadyHandoffLocal: false,
    liveFirstOrderLocked: true,
    streamAfterLiveOrderLocked: true,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    separateProfileScreenCreatedNow: false,
    separateBusinessScreenCreatedNow: false,
    giftSendingImplementedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  };
}

export function selectStream113YLiveUiuxAcceptanceSection(
  state: Stream113YLiveUiuxFinalAcceptanceKernelState,
  selectedSectionId: Stream113YLiveUiuxAcceptanceSectionId,
): Stream113YLiveUiuxFinalAcceptanceKernelState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113Y acceptance section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113YLiveUiuxAcceptanceSectionAccepted(
  state: Stream113YLiveUiuxFinalAcceptanceKernelState,
  sectionId: Stream113YLiveUiuxAcceptanceSectionId,
  action: string,
): Stream113YLiveUiuxFinalAcceptanceKernelState {
  const acceptedSectionIds = uniqueAccepted([...state.acceptedSectionIds, sectionId]);
  return {
    ...state,
    selectedSectionId: sectionId,
    acceptedSectionIds,
    lastAction: action,
    phoneAcceptanceCompleteLocal: state.phoneAcceptanceCompleteLocal || sectionId === "phone_acceptance_complete",
    languageRegistry25LockedLocal: state.languageRegistry25LockedLocal || sectionId === "language_registry_25_locked",
    kernelConnectionContractLockedLocal: state.kernelConnectionContractLockedLocal || sectionId === "kernel_connection_contract_locked",
    safetyModerationAcceptanceLocal: state.safetyModerationAcceptanceLocal || sectionId === "safety_moderation_acceptance",
    profileBusinessHooksTimedLocal: state.profileBusinessHooksTimedLocal || sectionId === "profile_business_hooks_timed",
    giftsDeferredAcceptanceLocal: state.giftsDeferredAcceptanceLocal || sectionId === "gifts_deferred_acceptance",
    noDebugPanelsNormalUxLocal: state.noDebugPanelsNormalUxLocal || sectionId === "no_debug_panels_normal_ux",
    liveUiuxReadyHandoffLocal: state.liveUiuxReadyHandoffLocal || sectionId === "live_uiux_ready_handoff",
  };
}

export function markStream113YLiveUiuxFinalAcceptanceAllAccepted(
  state: Stream113YLiveUiuxFinalAcceptanceKernelState,
  action = "113Y приёмка Live UI/UX закрыта: телефонный UX, 25 языков, граница ядра, безопасность, hooks и граница подарков приняты.",
): Stream113YLiveUiuxFinalAcceptanceKernelState {
  return {
    ...state,
    acceptedSectionIds: SECTION_ORDER,
    selectedSectionId: "live_uiux_ready_handoff",
    lastAction: action,
    phoneAcceptanceCompleteLocal: true,
    languageRegistry25LockedLocal: true,
    kernelConnectionContractLockedLocal: true,
    safetyModerationAcceptanceLocal: true,
    profileBusinessHooksTimedLocal: true,
    giftsDeferredAcceptanceLocal: true,
    noDebugPanelsNormalUxLocal: true,
    liveUiuxReadyHandoffLocal: true,
  };
}

export function buildStream113YLiveUiuxFinalAcceptanceKernelEvidence(
  state: Stream113YLiveUiuxFinalAcceptanceKernelState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  presentationEvidence: Stream113XLivePresentationPolishKernelUiuxEvidence,
): Stream113YLiveUiuxFinalAcceptanceKernelEvidence {
  const acceptedSections = state.acceptedSectionIds.length;
  const totalSections = SECTION_ORDER.length;
  const acceptanceScore = Math.round((acceptedSections / totalSections) * 100);
  const sectionItems = SECTION_ORDER.map((id): Stream113YLiveUiuxAcceptanceSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.acceptedSectionIds.includes(id) ? "accepted" : "needs_final_review",
  }));
  const presentationAccepted = presentationEvidence.presentationReady;
  const languageRegistry25Accepted = presentationEvidence.languageRegistry25Ready && presentationEvidence.supportedLanguageCount >= 25;
  const kernelBoundaryAccepted = state.allConnectionsThroughKernel && presentationEvidence.kernelBoundaryReady && presentationEvidence.directProviderConnectionAllowed === false && presentationEvidence.directRealtimeConnectionAllowed === false;
  const normalUxCleanAccepted = state.noDebugPanelsNormalUxLocal && presentationEvidence.cleanNormalUxReady;
  const profileBusinessHooksAccepted = state.profileBusinessHooksTimedLocal && presentationEvidence.profileBusinessHooksReady;
  const giftsDeferredAccepted = state.giftsDeferredAcceptanceLocal && presentationEvidence.giftsDeferredCorrectly && presentationEvidence.giftSendingImplementedNow === false;
  const providerBlocked = room.status === "provider_handoff_blocked" || stage.status === "broadcast_handoff_blocked";
  const liveUiuxAccepted = acceptanceScore === 100
    && presentationAccepted
    && languageRegistry25Accepted
    && kernelBoundaryAccepted
    && normalUxCleanAccepted
    && profileBusinessHooksAccepted
    && giftsDeferredAccepted;

  return {
    version: "STREAM-113Y",
    selectedSectionId: state.selectedSectionId,
    acceptanceScore,
    acceptedSections,
    totalSections,
    sectionItems,
    heroTitle: liveUiuxAccepted ? "Live UI/UX принят как финальный" : "Live UI/UX проходит финальный acceptance",
    heroSubtitle: "113Y фиксирует: Live сначала до 100%, 25 языков через общий registry, все подключения через kernel, подарки в конце без fake send/payment.",
    phoneStatus: providerBlocked ? "UI принят · запуск ждёт ядро/провайдера" : "Предпросмотр принят · безопасный режим ядра",
    activeTitle: room.title || "Sabi Live",
    activeNarrative: presentationEvidence.activeNarrative,
    productSummary: `${presentationEvidence.selectedLanguageName}: ${presentationEvidence.productSummary}`,
    primaryAction: liveUiuxAccepted ? "Live UI/UX можно считать закрытым; следующий блок — Stream UI/UX 100% по порядку." : "Закрой 113Y full acceptance, затем переходи только по порядку.",
    secondaryAction: "Профиль и Business hooks добавлены вовремя; отдельные экраны и gifts остаются на своих будущих этапах.",
    liveUiuxAccepted,
    presentationAccepted,
    languageRegistry25Accepted,
    supportedLanguageCount: presentationEvidence.supportedLanguageCount,
    kernelBoundaryAccepted,
    normalUxCleanAccepted,
    profileBusinessHooksAccepted,
    giftsDeferredAccepted,
    liveFirstOrderLocked: true,
    streamAfterLiveOrderLocked: true,
    allConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    separateProfileScreenCreatedNow: false,
    separateBusinessScreenCreatedNow: false,
    giftSendingImplementedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  };
}
