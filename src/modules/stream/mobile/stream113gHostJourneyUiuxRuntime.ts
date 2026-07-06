import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113CLiveRoomLifecycleUiuxEvidence } from "./stream113cLiveRoomLifecycleUiuxRuntime";
import type { Stream113ELiveRoomSurfaceUiuxEvidence } from "./stream113eLiveRoomSurfaceUiuxRuntime";
import type { Stream113FLiveActionSheetsUiuxEvidence } from "./stream113fLiveActionSheetsUiuxRuntime";

export type Stream113GHostJourneyStepId =
  | "prepare_room"
  | "go_live_review"
  | "control_actions"
  | "people_stage"
  | "battle_share"
  | "end_summary";

export type Stream113GHostJourneyStepStatus = "premium_local" | "needs_review";

export type Stream113GHostJourneyStep = {
  readonly id: Stream113GHostJourneyStepId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113GHostJourneyStepStatus;
};

export type Stream113GHostJourneyUiuxState = {
  readonly version: "STREAM-113G";
  readonly selectedStepId: Stream113GHostJourneyStepId;
  readonly reviewedStepIds: readonly Stream113GHostJourneyStepId[];
  readonly lastAction: string;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113GHostJourneyUiuxEvidence = {
  readonly version: "STREAM-113G";
  readonly selectedStepId: Stream113GHostJourneyStepId;
  readonly premiumScore: number;
  readonly readySteps: number;
  readonly totalSteps: number;
  readonly steps: readonly Stream113GHostJourneyStep[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly hostJourneyReady: boolean;
  readonly cleanProductUiReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const STEP_ORDER: readonly Stream113GHostJourneyStepId[] = [
  "prepare_room",
  "go_live_review",
  "control_actions",
  "people_stage",
  "battle_share",
  "end_summary",
];

const STEP_TITLES: Record<Stream113GHostJourneyStepId, string> = {
  prepare_room: "Подготовка",
  go_live_review: "Эфирный экран",
  control_actions: "Быстрые действия",
  people_stage: "Люди и сцена",
  battle_share: "Дуэль и «Поделиться»",
  end_summary: "Итог эфира",
};

const STEP_DESCRIPTIONS: Record<Stream113GHostJourneyStepId, string> = {
  prepare_room: "Ведущий понимает, что готовит: тема, источник, безопасность, честная граница провайдера.",
  go_live_review: "Главный экран читается как экран эфира: статус, видео-поле, нижний чат и действия одной рукой.",
  control_actions: "Чат, люди, соведущий, дуэль и «Поделиться» открываются как премиальные нижние панели, а не как служебный экран.",
  people_stage: "Участники, соведущий и сцена собраны в один понятный путь без перекрытия видео.",
  battle_share: "Дуэль и системное «Поделиться» доступны рядом, но без фейкового победителя/провайдера/эфира.",
  end_summary: "Завершение ведёт к аккуратному итогу, а не к резкому исчезновению комнаты.",
};

export function createInitialStream113GHostJourneyUiuxState(): Stream113GHostJourneyUiuxState {
  return {
    version: "STREAM-113G",
    selectedStepId: "prepare_room",
    reviewedStepIds: ["prepare_room"],
    lastAction: "113G начал собирать комнату эфира в один премиум-сценарий ведущего.",
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113GHostJourneyStep(
  state: Stream113GHostJourneyUiuxState,
  selectedStepId: Stream113GHostJourneyStepId,
): Stream113GHostJourneyUiuxState {
  return { ...state, selectedStepId, lastAction: `Открыт шаг 113G: ${STEP_TITLES[selectedStepId]}.` };
}

export function markStream113GHostJourneyStepReviewed(
  state: Stream113GHostJourneyUiuxState,
  stepId: Stream113GHostJourneyStepId,
  action: string,
): Stream113GHostJourneyUiuxState {
  const reviewedStepIds = state.reviewedStepIds.includes(stepId)
    ? state.reviewedStepIds
    : [...state.reviewedStepIds, stepId];
  return { ...state, selectedStepId: stepId, reviewedStepIds, lastAction: action };
}

export function markStream113GHostJourneyAllReviewed(
  state: Stream113GHostJourneyUiuxState,
  action: string,
): Stream113GHostJourneyUiuxState {
  return { ...state, selectedStepId: "end_summary", reviewedStepIds: STEP_ORDER, lastAction: action };
}

function reviewed(state: Stream113GHostJourneyUiuxState, stepId: Stream113GHostJourneyStepId): boolean {
  return state.reviewedStepIds.includes(stepId);
}

function step(
  id: Stream113GHostJourneyStepId,
  state: Stream113GHostJourneyUiuxState,
  ready: boolean,
): Stream113GHostJourneyStep {
  return {
    id,
    title: STEP_TITLES[id],
    description: STEP_DESCRIPTIONS[id],
    status: ready || reviewed(state, id) ? "premium_local" : "needs_review",
  };
}

function activeNarrative(
  stepId: Stream113GHostJourneyStepId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  const activePeople = room.participants.filter((participant) => !participant.blocked).length;
  if (stepId === "prepare_room") return `Комната ${room.title || room.roomId}: источник ${room.broadcast.source}, статус ${room.status}.`;
  if (stepId === "go_live_review") return stage.commentsVisible ? "Экран эфира показывает нижний чат и не прячет основное видео-поле." : "Нужно вернуть нижний чат в основной путь одной рукой.";
  if (stepId === "control_actions") return "Быстрые действия должны открываться как нижние панели и вести к следующему шагу.";
  if (stepId === "people_stage") return `${activePeople} активных участников · co-host rail должен читаться как сцена.`;
  if (stepId === "battle_share") return stage.battleOverlayVisible ? "Дуэль открыта, «Поделиться» остаётся безопасным системным действием." : "Дуэль и «Поделиться» должны быть рядом, но без фейкового провайдера/эфира.";
  return "Завершение должно показывать итог эфира и честно оставить провайдера/реальное время заблокированными.";
}

export function buildStream113GHostJourneyUiuxEvidence(
  state: Stream113GHostJourneyUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  lifecycle: Stream113CLiveRoomLifecycleUiuxEvidence,
  surface: Stream113ELiveRoomSurfaceUiuxEvidence,
  actions: Stream113FLiveActionSheetsUiuxEvidence,
): Stream113GHostJourneyUiuxEvidence {
  const activePeople = room.participants.filter((participant) => !participant.blocked).length;
  const hasCohost = room.participants.some((participant) => participant.role === "cohost" && !participant.blocked);
  const hasBattleOrShare = stage.battleOverlayVisible || actions.focusedFlow === "share" || actions.focusedFlow === "battle";
  const safeBoundaryReady = lifecycle.fakeLiveAllowed === false
    && surface.fakeLiveAllowed === false
    && actions.fakeLiveAllowed === false
    && state.fakeLiveAllowed === false
    && lifecycle.fakeProviderAllowed === false
    && surface.fakeProviderAllowed === false
    && actions.fakeProviderAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false;

  const steps: readonly Stream113GHostJourneyStep[] = [
    step("prepare_room", state, lifecycle.readySteps >= 2 && safeBoundaryReady),
    step("go_live_review", state, surface.localUxReady),
    step("control_actions", state, actions.oneHandReady),
    step("people_stage", state, activePeople > 0 && (hasCohost || stage.cohostRailVisible || stage.participantsVisible)),
    step("battle_share", state, hasBattleOrShare),
    step("end_summary", state, lifecycle.reviewedLocal && lifecycle.providerBoundaryClear),
  ];

  const readySteps = steps.filter((item) => item.status === "premium_local").length;
  const totalSteps = steps.length;
  const premiumScore = Math.round((readySteps / totalSteps) * 100);
  const next = steps.find((item) => item.status === "needs_review");
  const active = steps.find((item) => item.id === state.selectedStepId) ?? steps[0];

  return {
    version: "STREAM-113G",
    selectedStepId: state.selectedStepId,
    premiumScore,
    readySteps,
    totalSteps,
    steps,
    heroTitle: "Один премиум-сценарий ведущего",
    heroSubtitle: "Комната эфира должна вести ведущего от подготовки до итога без служебного ощущения и без фейкового эфира/провайдера/платежей.",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    phoneStatus: `${room.status} · ${surface.heroStatus} · ${actions.activeSheetTitle}`,
    primaryAction: next ? `${next.title}: ${next.description}` : "113G сценарий ведущего локально закрыт. Дальше можно чистить зрительский UI/UX.",
    secondaryAction: state.lastAction,
    hostJourneyReady: readySteps >= 5 && surface.localUxReady && actions.oneHandReady,
    cleanProductUiReady: readySteps === totalSteps && surface.localUxReady && actions.productUiReady,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
