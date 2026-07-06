import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113ELiveRoomSurfaceUiuxEvidence } from "./stream113eLiveRoomSurfaceUiuxRuntime";
import type { Stream113FLiveActionSheetsUiuxEvidence } from "./stream113fLiveActionSheetsUiuxRuntime";
import type { Stream113GHostJourneyUiuxEvidence } from "./stream113gHostJourneyUiuxRuntime";

export type Stream113HViewerExperienceStepId =
  | "watch_surface"
  | "bottom_chat"
  | "audience_context"
  | "cohost_battle_context"
  | "share_return"
  | "safe_boundary";

export type Stream113HViewerExperienceStepStatus = "premium_local" | "needs_review";

export type Stream113HViewerExperienceStep = {
  readonly id: Stream113HViewerExperienceStepId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113HViewerExperienceStepStatus;
};

export type Stream113HViewerExperienceUiuxState = {
  readonly version: "STREAM-113H";
  readonly selectedStepId: Stream113HViewerExperienceStepId;
  readonly reviewedStepIds: readonly Stream113HViewerExperienceStepId[];
  readonly lastAction: string;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113HViewerExperienceUiuxEvidence = {
  readonly version: "STREAM-113H";
  readonly selectedStepId: Stream113HViewerExperienceStepId;
  readonly premiumScore: number;
  readonly readySteps: number;
  readonly totalSteps: number;
  readonly steps: readonly Stream113HViewerExperienceStep[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly phoneStatus: string;
  readonly viewerSurfaceTitle: string;
  readonly viewerSurfaceSubtitle: string;
  readonly viewerChatPreview: string;
  readonly viewerAudienceSummary: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly viewerExperienceReady: boolean;
  readonly cleanProductUiReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const STEP_ORDER: readonly Stream113HViewerExperienceStepId[] = [
  "watch_surface",
  "bottom_chat",
  "audience_context",
  "cohost_battle_context",
  "share_return",
  "safe_boundary",
];

const STEP_TITLES: Record<Stream113HViewerExperienceStepId, string> = {
  watch_surface: "Экран зрителя",
  bottom_chat: "Нижний чат",
  audience_context: "Аудитория",
  cohost_battle_context: "Соведущий / дуэль",
  share_return: "Поделиться / возврат",
  safe_boundary: "Границы",
};

const STEP_DESCRIPTIONS: Record<Stream113HViewerExperienceStepId, string> = {
  watch_surface: "Зритель сразу понимает эфир: экран, автор, тема, видео-поле и безопасный статус.",
  bottom_chat: "Чат читается снизу, не перекрывает видео и не выглядит как служебный журнал.",
  audience_context: "Участники и онлайн-контекст показываются как зрительская лента, а не техническая таблица.",
  cohost_battle_context: "Соведущий и дуэль объясняются зрителю мягко, без фейкового победителя/провайдера/эфира.",
  share_return: "Поделиться и вернуться в эфир можно без потери контекста и без обещания фейкового запуска.",
  safe_boundary: "Провайдер, реальное время, платежи и кино остаются честно заблокированы до настоящих интеграций.",
};

export function createInitialStream113HViewerExperienceUiuxState(): Stream113HViewerExperienceUiuxState {
  return {
    version: "STREAM-113H",
    selectedStepId: "watch_surface",
    reviewedStepIds: ["watch_surface", "safe_boundary"],
    lastAction: "113H начал чистить зрительский UI/UX комнаты эфира как продуктовый телефонный путь.",
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113HViewerExperienceStep(
  state: Stream113HViewerExperienceUiuxState,
  selectedStepId: Stream113HViewerExperienceStepId,
): Stream113HViewerExperienceUiuxState {
  return { ...state, selectedStepId, lastAction: `Открыт viewer-step 113H: ${STEP_TITLES[selectedStepId]}.` };
}

export function markStream113HViewerExperienceStepReviewed(
  state: Stream113HViewerExperienceUiuxState,
  stepId: Stream113HViewerExperienceStepId,
  action: string,
): Stream113HViewerExperienceUiuxState {
  const reviewedStepIds = state.reviewedStepIds.includes(stepId)
    ? state.reviewedStepIds
    : [...state.reviewedStepIds, stepId];
  return { ...state, selectedStepId: stepId, reviewedStepIds, lastAction: action };
}

export function markStream113HViewerExperienceAllReviewed(
  state: Stream113HViewerExperienceUiuxState,
  action: string,
): Stream113HViewerExperienceUiuxState {
  return { ...state, selectedStepId: "share_return", reviewedStepIds: STEP_ORDER, lastAction: action };
}

function reviewed(state: Stream113HViewerExperienceUiuxState, stepId: Stream113HViewerExperienceStepId): boolean {
  return state.reviewedStepIds.includes(stepId);
}

function step(
  id: Stream113HViewerExperienceStepId,
  state: Stream113HViewerExperienceUiuxState,
  ready: boolean,
): Stream113HViewerExperienceStep {
  return {
    id,
    title: STEP_TITLES[id],
    description: STEP_DESCRIPTIONS[id],
    status: ready || reviewed(state, id) ? "premium_local" : "needs_review",
  };
}

function latestViewerComment(room: StreamRoomRuntimeState): string {
  const latest = room.comments.find((item) => item.status !== "moderation_blocked");
  if (!latest) return "Зритель видит аккуратную строку чата снизу, первое сообщение появится без перекрытия видео.";
  return latest.text.trim() || "Новое сообщение готово к показу в нижнем чате.";
}

function activeNarrative(
  stepId: Stream113HViewerExperienceStepId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  const viewers = room.participants.filter((participant) => participant.role === "viewer" && !participant.blocked).length;
  const cohosts = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  if (stepId === "watch_surface") return `${room.title || "Эфир Sabi"}: зритель должен сразу видеть тему, видео-поле и безопасный статус эфира.`;
  if (stepId === "bottom_chat") return stage.commentsVisible ? latestViewerComment(room) : "Нужно вернуть нижний чат в основной экран зрителя.";
  if (stepId === "audience_context") return `${viewers} зрителей локально · audience rail должен быть понятным и не перекрывать видео.`;
  if (stepId === "cohost_battle_context") return `${cohosts} co-host · дуэль ${stage.battleOverlayVisible ? "показана" : "ожидает"}, без fake winner/provider.`;
  if (stepId === "share_return") return "Поделиться должен открывать системное окно и возвращать зрителя в тот же контекст эфира.";
  return "Все внешние границы честные: эфир, реальное время, провайдер, платежи и кино не включаются фейково.";
}

export function buildStream113HViewerExperienceUiuxEvidence(
  state: Stream113HViewerExperienceUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  surface: Stream113ELiveRoomSurfaceUiuxEvidence,
  actions: Stream113FLiveActionSheetsUiuxEvidence,
  hostJourney: Stream113GHostJourneyUiuxEvidence,
): Stream113HViewerExperienceUiuxEvidence {
  const activePeople = room.participants.filter((participant) => !participant.blocked).length;
  const viewers = room.participants.filter((participant) => participant.role === "viewer" && !participant.blocked).length;
  const hasCohost = room.participants.some((participant) => participant.role === "cohost" && !participant.blocked);
  const hasBattleContext = stage.battleOverlayVisible || room.battle?.status === "accepted_local" || reviewed(state, "cohost_battle_context");
  const safeBoundaryReady = surface.fakeLiveAllowed === false
    && actions.fakeLiveAllowed === false
    && hostJourney.fakeLiveAllowed === false
    && state.fakeLiveAllowed === false
    && surface.fakeRealtimeAllowed === false
    && actions.fakeRealtimeAllowed === false
    && state.fakeRealtimeAllowed === false
    && surface.fakeProviderAllowed === false
    && actions.fakeProviderAllowed === false
    && hostJourney.fakeProviderAllowed === false
    && state.fakeProviderAllowed === false
    && surface.fakePaymentAllowed === false
    && actions.fakePaymentAllowed === false
    && hostJourney.fakePaymentAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false;

  const steps: readonly Stream113HViewerExperienceStep[] = [
    step("watch_surface", state, surface.localUxReady && hostJourney.hostJourneyReady),
    step("bottom_chat", state, stage.commentsVisible && room.comments.length > 0),
    step("audience_context", state, stage.participantsVisible && activePeople > 0 && viewers >= 1),
    step("cohost_battle_context", state, stage.cohostRailVisible || hasCohost || hasBattleContext),
    step("share_return", state, actions.focusedFlow === "share" || reviewed(state, "share_return")),
    step("safe_boundary", state, safeBoundaryReady),
  ];

  const readySteps = steps.filter((item) => item.status === "premium_local").length;
  const totalSteps = steps.length;
  const premiumScore = Math.round((readySteps / totalSteps) * 100);
  const next = steps.find((item) => item.status === "needs_review");
  const active = steps.find((item) => item.id === state.selectedStepId) ?? steps[0];

  return {
    version: "STREAM-113H",
    selectedStepId: state.selectedStepId,
    premiumScore,
    readySteps,
    totalSteps,
    steps,
    heroTitle: "Зрительская комната эфира как премиум UX",
    heroSubtitle: "Зритель должен видеть красивый эфир, чат, аудиторию и действия без служебных панелей и без фейкового эфира/провайдера/платежей.",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    phoneStatus: `${room.status} · ${viewers} viewers · ${surface.heroStatus}`,
    viewerSurfaceTitle: room.title || "Эфир Sabi",
    viewerSurfaceSubtitle: `${room.topic || "локальный предпросмотр"} · ${room.visibility}`,
    viewerChatPreview: latestViewerComment(room),
    viewerAudienceSummary: `${activePeople} active · ${viewers} viewers · ${hasCohost ? "соведущий на сцене" : "сцена чистая"}`,
    primaryAction: next ? `${next.title}: ${next.description}` : "113H зрительский UX локально закрыт. Дальше можно делать финальную проверку согласованности UI.",
    secondaryAction: state.lastAction,
    viewerExperienceReady: readySteps >= 5 && surface.localUxReady && actions.oneHandReady,
    cleanProductUiReady: readySteps === totalSteps && surface.localUxReady && actions.productUiReady && hostJourney.cleanProductUiReady,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
