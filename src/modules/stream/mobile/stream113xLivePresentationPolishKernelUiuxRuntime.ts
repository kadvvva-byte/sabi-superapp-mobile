import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113WLiveLanguageI18nKernelUiuxEvidence } from "./stream113wLiveLanguageI18nKernelUiuxRuntime";

export type Stream113XLivePresentationSectionId =
  | "presentation_first_screen"
  | "language_registry_25_visible"
  | "kernel_boundary_clear"
  | "host_viewer_story_clean"
  | "safety_moderation_ready"
  | "profile_business_hooks_on_time"
  | "gifts_end_stage_boundary"
  | "no_debug_words_normal_ux";

export type Stream113XLivePresentationSectionStatus = "ready" | "needs_polish";

export type Stream113XLivePresentationSection = {
  readonly id: Stream113XLivePresentationSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113XLivePresentationSectionStatus;
};

export type Stream113XLivePresentationPolishKernelUiuxState = {
  readonly version: "STREAM-113X";
  readonly selectedSectionId: Stream113XLivePresentationSectionId;
  readonly readySectionIds: readonly Stream113XLivePresentationSectionId[];
  readonly lastAction: string;
  readonly presentationFirstScreenReadyLocal: boolean;
  readonly languageRegistry25VisibleLocal: boolean;
  readonly kernelBoundaryClearLocal: boolean;
  readonly hostViewerStoryCleanLocal: boolean;
  readonly safetyModerationReadyLocal: boolean;
  readonly profileBusinessHooksOnTimeLocal: boolean;
  readonly giftsEndStageBoundaryLocal: boolean;
  readonly noDebugWordsNormalUxLocal: boolean;
  readonly liveFirstOrderLocked: true;
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

export type Stream113XLivePresentationPolishKernelUiuxEvidence = {
  readonly version: "STREAM-113X";
  readonly selectedSectionId: Stream113XLivePresentationSectionId;
  readonly presentationScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream113XLivePresentationSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly productSummary: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly presentationReady: boolean;
  readonly languageRegistry25Ready: boolean;
  readonly supportedLanguageCount: number;
  readonly minimumRequiredLanguageCount: 25;
  readonly selectedLanguageCode: string;
  readonly selectedLanguageName: string;
  readonly kernelBoundaryReady: boolean;
  readonly cleanNormalUxReady: boolean;
  readonly profileBusinessHooksReady: boolean;
  readonly giftsDeferredCorrectly: boolean;
  readonly liveFirstOrderLocked: true;
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

const SECTION_ORDER: readonly Stream113XLivePresentationSectionId[] = [
  "presentation_first_screen",
  "language_registry_25_visible",
  "kernel_boundary_clear",
  "host_viewer_story_clean",
  "safety_moderation_ready",
  "profile_business_hooks_on_time",
  "gifts_end_stage_boundary",
  "no_debug_words_normal_ux",
];

const SECTION_TITLES: Record<Stream113XLivePresentationSectionId, string> = {
  presentation_first_screen: "Первый экран презентации",
  language_registry_25_visible: "Слой Live на 25 языках",
  kernel_boundary_clear: "Граница подключения только через ядро",
  host_viewer_story_clean: "Сценарий ведущего и зрителя",
  safety_moderation_ready: "Безопасность и модерация Sabi AI",
  profile_business_hooks_on_time: "Профиль/Business hooks",
  gifts_end_stage_boundary: "Граница подарков на поздний этап",
  no_debug_words_normal_ux: "Чистые тексты обычного UX",
};

const SECTION_DESCRIPTIONS: Record<Stream113XLivePresentationSectionId, string> = {
  presentation_first_screen: "Первый телефонный экран объясняет готовность Live без внутренних QA-панелей.",
  language_registry_25_visible: "Языковой слой Live использует общий реестр 25 языков, а не ручной блок из четырёх языков.",
  kernel_boundary_clear: "Все тексты про реальное время, провайдера, lifecycle, модерацию и будущую интеграцию проходят через core/kernel контракты.",
  host_viewer_story_clean: "Продуктовый сценарий показывает путь ведущего и зрителя как один чистый Live journey.",
  safety_moderation_ready: "18+, ругательства, оскорбления, жалобы и проверка Sabi AI видны как продуктовые элементы безопасности.",
  profile_business_hooks_on_time: "Будущие hooks профиля стримера и Business Stream названы внутри Live без раннего создания этих экранов.",
  gifts_end_stage_boundary: "Отправка подарков обязательна позже, но сейчас нет фейковой кнопки отправки, оплаты или движения COIN.",
  no_debug_words_normal_ux: "Обычный Live UX не показывает QA, smoke, evidence и служебные тексты; технические детали остаются в техрежиме.",
};

function uniqueReady(items: readonly Stream113XLivePresentationSectionId[]): readonly Stream113XLivePresentationSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream113XLivePresentationPolishKernelUiuxState(): Stream113XLivePresentationPolishKernelUiuxState {
  return {
    version: "STREAM-113X",
    selectedSectionId: "presentation_first_screen",
    readySectionIds: ["kernel_boundary_clear", "gifts_end_stage_boundary"],
    lastAction: "113X готовит финальную презентационную полировку Live UI/UX без фейкового запуска.",
    presentationFirstScreenReadyLocal: false,
    languageRegistry25VisibleLocal: false,
    kernelBoundaryClearLocal: true,
    hostViewerStoryCleanLocal: false,
    safetyModerationReadyLocal: false,
    profileBusinessHooksOnTimeLocal: false,
    giftsEndStageBoundaryLocal: true,
    noDebugWordsNormalUxLocal: false,
    liveFirstOrderLocked: true,
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

export function selectStream113XLivePresentationSection(
  state: Stream113XLivePresentationPolishKernelUiuxState,
  selectedSectionId: Stream113XLivePresentationSectionId,
): Stream113XLivePresentationPolishKernelUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113X presentation section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113XLivePresentationSectionReady(
  state: Stream113XLivePresentationPolishKernelUiuxState,
  sectionId: Stream113XLivePresentationSectionId,
  action: string,
): Stream113XLivePresentationPolishKernelUiuxState {
  const readySectionIds = uniqueReady([...state.readySectionIds, sectionId]);
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    lastAction: action,
    presentationFirstScreenReadyLocal: state.presentationFirstScreenReadyLocal || sectionId === "presentation_first_screen",
    languageRegistry25VisibleLocal: state.languageRegistry25VisibleLocal || sectionId === "language_registry_25_visible",
    kernelBoundaryClearLocal: state.kernelBoundaryClearLocal || sectionId === "kernel_boundary_clear",
    hostViewerStoryCleanLocal: state.hostViewerStoryCleanLocal || sectionId === "host_viewer_story_clean",
    safetyModerationReadyLocal: state.safetyModerationReadyLocal || sectionId === "safety_moderation_ready",
    profileBusinessHooksOnTimeLocal: state.profileBusinessHooksOnTimeLocal || sectionId === "profile_business_hooks_on_time",
    giftsEndStageBoundaryLocal: state.giftsEndStageBoundaryLocal || sectionId === "gifts_end_stage_boundary",
    noDebugWordsNormalUxLocal: state.noDebugWordsNormalUxLocal || sectionId === "no_debug_words_normal_ux",
  };
}

export function markStream113XLivePresentationAllReady(
  state: Stream113XLivePresentationPolishKernelUiuxState,
  action = "113X полная презентационная полировка готова: Live выглядит как продуктовый экран, 25 языков и граница ядра закреплены.",
): Stream113XLivePresentationPolishKernelUiuxState {
  return {
    ...state,
    readySectionIds: SECTION_ORDER,
    selectedSectionId: "presentation_first_screen",
    lastAction: action,
    presentationFirstScreenReadyLocal: true,
    languageRegistry25VisibleLocal: true,
    kernelBoundaryClearLocal: true,
    hostViewerStoryCleanLocal: true,
    safetyModerationReadyLocal: true,
    profileBusinessHooksOnTimeLocal: true,
    giftsEndStageBoundaryLocal: true,
    noDebugWordsNormalUxLocal: true,
  };
}

export function buildStream113XLivePresentationPolishKernelUiuxEvidence(
  state: Stream113XLivePresentationPolishKernelUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  languageEvidence: Stream113WLiveLanguageI18nKernelUiuxEvidence,
): Stream113XLivePresentationPolishKernelUiuxEvidence {
  const readySections = state.readySectionIds.length;
  const totalSections = SECTION_ORDER.length;
  const presentationScore = Math.round((readySections / totalSections) * 100);
  const sectionItems = SECTION_ORDER.map((id): Stream113XLivePresentationSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
  const languageRegistry25Ready = languageEvidence.supportedLanguageCount >= 25 && languageEvidence.registry25Ready;
  const profileBusinessLanguageHooksReady = languageEvidence.sectionItems.some(
    (item) => item.id === "profile_business_hooks_named" && item.status === "copy_ready",
  );
  const presentationReady = presentationScore === 100 && languageRegistry25Ready && state.allConnectionsThroughKernel;
  const selectedLanguageName = `${String(languageEvidence.selectedLanguageCode).toUpperCase()} · ${languageEvidence.selectedCopy.nativeName}`;
  const roomTitle = room.title || "Sabi Live";
  const providerBlocked = room.status === "provider_handoff_blocked" || stage.status === "broadcast_handoff_blocked";

  return {
    version: "STREAM-113X",
    selectedSectionId: state.selectedSectionId,
    presentationScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: presentationReady ? "Live UI/UX готов к показу" : "Live UI/UX доводится до финального вида",
    heroSubtitle: "Финальная презентационная полировка: 25 языков, чистый телефонный UX, подключения только через ядро, безопасность и будущие hooks без фейкового запуска.",
    phoneStatus: providerBlocked ? "Предпросмотр готов · запуск ждёт ядро/провайдера" : "Предпросмотр Live · безопасный продуктовый режим",
    activeTitle: roomTitle,
    activeNarrative: languageEvidence.selectedCopy.primary,
    productSummary: `${selectedLanguageName}: ${languageEvidence.selectedCopy.title}. ${languageEvidence.productSummary}`,
    primaryAction: presentationReady ? "Live можно показывать как UI/UX-ready экран, но настоящий эфир остаётся за kernel/provider." : "Закрой 113X full presentation перед переходом к следующему Live layer.",
    secondaryAction: "Профиль/Business hooks добавлены вовремя; подарки — обязательный end-stage, без fake send/payment сейчас.",
    presentationReady,
    languageRegistry25Ready,
    supportedLanguageCount: languageEvidence.supportedLanguageCount,
    minimumRequiredLanguageCount: 25,
    selectedLanguageCode: languageEvidence.selectedLanguageCode,
    selectedLanguageName,
    kernelBoundaryReady: state.allConnectionsThroughKernel && languageEvidence.allConnectionsThroughKernel,
    cleanNormalUxReady: state.noDebugWordsNormalUxLocal && languageEvidence.normalUxWordsClean,
    profileBusinessHooksReady: state.profileBusinessHooksOnTimeLocal && profileBusinessLanguageHooksReady,
    giftsDeferredCorrectly: state.giftsEndStageBoundaryLocal && languageEvidence.giftSendingImplementedNow === false,
    liveFirstOrderLocked: true,
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
