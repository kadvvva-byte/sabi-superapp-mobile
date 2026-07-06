import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113YLiveUiuxFinalAcceptanceKernelEvidence } from "./stream113yLiveUiuxFinalAcceptanceKernelRuntime";

export type Stream113ZLiveClosureSectionId =
  | "live_uiux_100_closed"
  | "kernel_boundary_locked"
  | "language_registry_25_closed"
  | "safety_moderation_closed"
  | "profile_business_hooks_ready"
  | "gifts_deferred_locked"
  | "real_launch_blocked_honestly"
  | "stream_next_order_ready";

export type Stream113ZLiveClosureSectionStatus = "closed" | "needs_owner_check";

export type Stream113ZLiveClosureSection = {
  readonly id: Stream113ZLiveClosureSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113ZLiveClosureSectionStatus;
};

export type Stream113ZLiveFinalClosureKernelUiuxState = {
  readonly version: "STREAM-113Z";
  readonly selectedSectionId: Stream113ZLiveClosureSectionId;
  readonly closedSectionIds: readonly Stream113ZLiveClosureSectionId[];
  readonly lastAction: string;
  readonly liveUiux100ClosedLocal: boolean;
  readonly kernelBoundaryLockedLocal: boolean;
  readonly languageRegistry25ClosedLocal: boolean;
  readonly safetyModerationClosedLocal: boolean;
  readonly profileBusinessHooksReadyLocal: boolean;
  readonly giftsDeferredLockedLocal: boolean;
  readonly realLaunchBlockedHonestlyLocal: boolean;
  readonly streamNextOrderReadyLocal: boolean;
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

export type Stream113ZLiveFinalClosureKernelUiuxEvidence = {
  readonly version: "STREAM-113Z";
  readonly selectedSectionId: Stream113ZLiveClosureSectionId;
  readonly closureScore: number;
  readonly closedSections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream113ZLiveClosureSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly productSummary: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly liveUiuxClosed: boolean;
  readonly readyForStreamNextUiuxStage: boolean;
  readonly supportedLanguageCount: number;
  readonly kernelBoundaryClosed: boolean;
  readonly languageRegistry25Closed: boolean;
  readonly safetyModerationClosed: boolean;
  readonly profileBusinessHooksClosed: boolean;
  readonly giftsDeferredClosed: boolean;
  readonly realLaunchBlockedHonestly: boolean;
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

const SECTION_ORDER: readonly Stream113ZLiveClosureSectionId[] = [
  "live_uiux_100_closed",
  "kernel_boundary_locked",
  "language_registry_25_closed",
  "safety_moderation_closed",
  "profile_business_hooks_ready",
  "gifts_deferred_locked",
  "real_launch_blocked_honestly",
  "stream_next_order_ready",
];

const SECTION_TITLES: Record<Stream113ZLiveClosureSectionId, string> = {
  live_uiux_100_closed: "Live UI/UX закрыт",
  kernel_boundary_locked: "Граница ядра закреплена",
  language_registry_25_closed: "25 языков закрыты",
  safety_moderation_closed: "Безопасность закрыта",
  profile_business_hooks_ready: "Профиль/Business hooks готовы",
  gifts_deferred_locked: "Подарки закреплены на поздний этап",
  real_launch_blocked_honestly: "Настоящий запуск честно заблокирован",
  stream_next_order_ready: "Следующий порядок Stream готов",
};

const SECTION_DESCRIPTIONS: Record<Stream113ZLiveClosureSectionId, string> = {
  live_uiux_100_closed: "Телефонный Live UI/UX принят как готовый к презентации: ведущий, зритель, чат, люди, co-host, battle, share, settings и чистый режим читаются как один продуктовый поток.",
  kernel_boundary_locked: "Всё реальное время, передача провайдеру, синхронизация ведущего/зрителя, co-host, battle, модерация и будущие ссылки профиля/business/подарков должны идти через core/kernel слой.",
  language_registry_25_closed: "Языковой UX Live использует общий реестр 25 языков вместо hardcoded copy только RU/EN/UZ/ZH.",
  safety_moderation_closed: "18+, ругательства, оскорбления, жалобы, проверка Sabi AI, контроль ведущего и действия модератора закрыты без фейковых блокировок.",
  profile_business_hooks_ready: "Hooks профиля и Business Stream добавлены внутри Live в правильное время, без раннего создания полных экранов.",
  gifts_deferred_locked: "Отправка подарков обязательна, но остаётся в конце разработки Stream без фейковой отправки, оплаты или движения COIN внутри Live.",
  real_launch_blocked_honestly: "UI/UX можно показывать как готовый, пока реальный запуск эфира остаётся заблокирован до утверждения этапов ядра/сервера/провайдера.",
  stream_next_order_ready: "После этого закрытия продолжать Stream до 100% по порядку: Business Stream, профиль стримера, полировка Shorts, затем подарки/монетизация в конце.",
};

function uniqueClosed(items: readonly Stream113ZLiveClosureSectionId[]): readonly Stream113ZLiveClosureSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream113ZLiveFinalClosureKernelUiuxState(): Stream113ZLiveFinalClosureKernelUiuxState {
  return {
    version: "STREAM-113Z",
    selectedSectionId: "live_uiux_100_closed",
    closedSectionIds: ["kernel_boundary_locked", "gifts_deferred_locked", "real_launch_blocked_honestly"],
    lastAction: "113Z готовит финальное закрытие Live UI/UX: Live до 100%, затем Stream по порядку.",
    liveUiux100ClosedLocal: false,
    kernelBoundaryLockedLocal: true,
    languageRegistry25ClosedLocal: false,
    safetyModerationClosedLocal: false,
    profileBusinessHooksReadyLocal: false,
    giftsDeferredLockedLocal: true,
    realLaunchBlockedHonestlyLocal: true,
    streamNextOrderReadyLocal: false,
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

export function selectStream113ZLiveClosureSection(
  state: Stream113ZLiveFinalClosureKernelUiuxState,
  selectedSectionId: Stream113ZLiveClosureSectionId,
): Stream113ZLiveFinalClosureKernelUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113Z closure section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113ZLiveClosureSectionClosed(
  state: Stream113ZLiveFinalClosureKernelUiuxState,
  sectionId: Stream113ZLiveClosureSectionId,
  action: string,
): Stream113ZLiveFinalClosureKernelUiuxState {
  const closedSectionIds = uniqueClosed([...state.closedSectionIds, sectionId]);
  return {
    ...state,
    selectedSectionId: sectionId,
    closedSectionIds,
    lastAction: action,
    liveUiux100ClosedLocal: state.liveUiux100ClosedLocal || sectionId === "live_uiux_100_closed",
    kernelBoundaryLockedLocal: state.kernelBoundaryLockedLocal || sectionId === "kernel_boundary_locked",
    languageRegistry25ClosedLocal: state.languageRegistry25ClosedLocal || sectionId === "language_registry_25_closed",
    safetyModerationClosedLocal: state.safetyModerationClosedLocal || sectionId === "safety_moderation_closed",
    profileBusinessHooksReadyLocal: state.profileBusinessHooksReadyLocal || sectionId === "profile_business_hooks_ready",
    giftsDeferredLockedLocal: state.giftsDeferredLockedLocal || sectionId === "gifts_deferred_locked",
    realLaunchBlockedHonestlyLocal: state.realLaunchBlockedHonestlyLocal || sectionId === "real_launch_blocked_honestly",
    streamNextOrderReadyLocal: state.streamNextOrderReadyLocal || sectionId === "stream_next_order_ready",
  };
}

export function markStream113ZLiveFinalClosureAllClosed(
  state: Stream113ZLiveFinalClosureKernelUiuxState,
  action = "113Z закрытие Live UI/UX завершено: телефонный продукт, 25 языков, граница ядра, безопасность, hooks, честная блокировка запуска и поздняя граница подарков закреплены.",
): Stream113ZLiveFinalClosureKernelUiuxState {
  return {
    ...state,
    closedSectionIds: SECTION_ORDER,
    selectedSectionId: "stream_next_order_ready",
    lastAction: action,
    liveUiux100ClosedLocal: true,
    kernelBoundaryLockedLocal: true,
    languageRegistry25ClosedLocal: true,
    safetyModerationClosedLocal: true,
    profileBusinessHooksReadyLocal: true,
    giftsDeferredLockedLocal: true,
    realLaunchBlockedHonestlyLocal: true,
    streamNextOrderReadyLocal: true,
  };
}

export function buildStream113ZLiveFinalClosureKernelUiuxEvidence(
  state: Stream113ZLiveFinalClosureKernelUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  acceptanceEvidence: Stream113YLiveUiuxFinalAcceptanceKernelEvidence,
): Stream113ZLiveFinalClosureKernelUiuxEvidence {
  const sectionItems = SECTION_ORDER.map((id): Stream113ZLiveClosureSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.closedSectionIds.includes(id) ? "closed" : "needs_owner_check",
  }));
  const closedSections = sectionItems.filter((item) => item.status === "closed").length;
  const totalSections = SECTION_ORDER.length;
  const closureScore = Math.round((closedSections / totalSections) * 100);
  const kernelBoundaryClosed = state.kernelBoundaryLockedLocal
    && acceptanceEvidence.kernelBoundaryAccepted
    && state.allConnectionsThroughKernel
    && state.directProviderConnectionAllowed === false
    && state.directRealtimeConnectionAllowed === false
    && state.scatteredServiceConnectionAllowed === false;
  const languageRegistry25Closed = state.languageRegistry25ClosedLocal
    && acceptanceEvidence.languageRegistry25Accepted
    && acceptanceEvidence.supportedLanguageCount >= 25;
  const safetyModerationClosed = state.safetyModerationClosedLocal && acceptanceEvidence.presentationAccepted;
  const profileBusinessHooksClosed = state.profileBusinessHooksReadyLocal && acceptanceEvidence.profileBusinessHooksAccepted;
  const giftsDeferredClosed = state.giftsDeferredLockedLocal
    && acceptanceEvidence.giftsDeferredAccepted
    && state.giftSendingImplementedNow === false
    && state.fakeGiftSendingAllowed === false;
  const realLaunchBlockedHonestly = state.realLaunchBlockedHonestlyLocal
    && (room.status === "provider_handoff_blocked" || stage.status === "broadcast_handoff_blocked" || acceptanceEvidence.fakeLiveAllowed === false)
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false;
  const liveUiuxClosed = closureScore === 100
    && acceptanceEvidence.liveUiuxAccepted
    && kernelBoundaryClosed
    && languageRegistry25Closed
    && safetyModerationClosed
    && profileBusinessHooksClosed
    && giftsDeferredClosed
    && realLaunchBlockedHonestly;
  const readyForStreamNextUiuxStage = liveUiuxClosed && state.streamNextOrderReadyLocal;

  return {
    version: "STREAM-113Z",
    selectedSectionId: state.selectedSectionId,
    closureScore,
    closedSections,
    totalSections,
    sectionItems,
    heroTitle: liveUiuxClosed ? "Live UI/UX закрыт на 100%" : "Live UI/UX проходит финальное закрытие",
    heroSubtitle: "113Z фиксирует финальный Live UI/UX: чистый телефонный продукт, реестр 25 языков, подключения только через ядро, безопасность, своевременные hooks и подарки позже.",
    phoneStatus: liveUiuxClosed ? "Live UI/UX закрыт · реальный запуск ждёт ядро/сервер" : "Финальное закрытие · без фейкового запуска",
    activeTitle: room.title || "Sabi Live",
    activeNarrative: acceptanceEvidence.activeNarrative,
    productSummary: acceptanceEvidence.productSummary,
    primaryAction: liveUiuxClosed ? "Live UI/UX закрыт. Следующий порядок: весь Stream UI/UX до 100%, начиная с Business Stream." : "Нажми 113Z full closure после чистого 113Y acceptance.",
    secondaryAction: "Профиль/Business hooks готовы вовремя; подарки обязательны, но будут в конце без фейковые платежи.",
    liveUiuxClosed,
    readyForStreamNextUiuxStage,
    supportedLanguageCount: acceptanceEvidence.supportedLanguageCount,
    kernelBoundaryClosed,
    languageRegistry25Closed,
    safetyModerationClosed,
    profileBusinessHooksClosed,
    giftsDeferredClosed,
    realLaunchBlockedHonestly,
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
