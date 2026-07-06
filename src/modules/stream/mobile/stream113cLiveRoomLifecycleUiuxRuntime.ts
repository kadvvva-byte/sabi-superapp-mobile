import type { StreamHostControlsRuntimeState } from "./streamHostControlsRuntime";
import type { StreamRoomRuntimeState } from "./streamRoomRuntime";

export type Stream113CLifecycleStepId = "prepare" | "preview" | "provider_boundary" | "safe_pause" | "resume" | "end_summary";
export type Stream113CLifecycleStepStatus = "waiting" | "ready_local" | "blocked_safely";

export type Stream113CLifecycleStep = {
  readonly id: Stream113CLifecycleStepId;
  readonly title: string;
  readonly note: string;
  readonly status: Stream113CLifecycleStepStatus;
};

export type Stream113CLiveRoomLifecycleUiuxState = {
  readonly version: "STREAM-113C";
  readonly selectedStepId: Stream113CLifecycleStepId;
  readonly completedStepIds: readonly Stream113CLifecycleStepId[];
  readonly reviewedLocal: boolean;
  readonly lastAction: string;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113CLiveRoomLifecycleUiuxEvidence = {
  readonly version: "STREAM-113C";
  readonly selectedStepId: Stream113CLifecycleStepId;
  readonly premiumScore: number;
  readonly readySteps: number;
  readonly totalSteps: number;
  readonly steps: readonly Stream113CLifecycleStep[];
  readonly roomStatus: string;
  readonly safetyState: string;
  readonly lifecycleNarrative: string;
  readonly nextPrimaryAction: string;
  readonly localUxReady: boolean;
  readonly reviewedLocal: boolean;
  readonly endedAt: string | null;
  readonly actionLogCount: number;
  readonly providerBoundaryClear: boolean;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
  readonly providerReady: false;
};

const STEP_TITLES: Record<Stream113CLifecycleStepId, string> = {
  prepare: "Подготовка",
  preview: "Предпросмотр",
  provider_boundary: "Граница провайдера",
  safe_pause: "Пауза",
  resume: "Возврат",
  end_summary: "Итог",
};

const STEP_ORDER: readonly Stream113CLifecycleStepId[] = ["prepare", "preview", "provider_boundary", "safe_pause", "resume", "end_summary"];

export function createInitialStream113CLiveRoomLifecycleUiuxState(): Stream113CLiveRoomLifecycleUiuxState {
  return {
    version: "STREAM-113C",
    selectedStepId: "prepare",
    completedStepIds: [],
    reviewedLocal: false,
    lastAction: "Проверьте жизненный цикл эфира: подготовка → предпросмотр → безопасная граница провайдера → пауза → возврат → итог.",
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113CLifecycleStep(
  state: Stream113CLiveRoomLifecycleUiuxState,
  stepId: Stream113CLifecycleStepId,
): Stream113CLiveRoomLifecycleUiuxState {
  return { ...state, selectedStepId: stepId, lastAction: `Открыт lifecycle UI/UX шаг: ${STEP_TITLES[stepId]}` };
}

export function markStream113CLifecycleStepReviewed(
  state: Stream113CLiveRoomLifecycleUiuxState,
  stepId: Stream113CLifecycleStepId,
  action: string,
): Stream113CLiveRoomLifecycleUiuxState {
  const completed = state.completedStepIds.includes(stepId) ? state.completedStepIds : [...state.completedStepIds, stepId];
  return { ...state, selectedStepId: stepId, completedStepIds: completed, reviewedLocal: true, lastAction: action };
}

export function markStream113CLifecycleAllReviewed(
  state: Stream113CLiveRoomLifecycleUiuxState,
  action: string,
): Stream113CLiveRoomLifecycleUiuxState {
  return { ...state, selectedStepId: "end_summary", completedStepIds: STEP_ORDER, reviewedLocal: true, lastAction: action };
}

function hasAction(room: StreamRoomRuntimeState, action: string): boolean {
  return room.actionLog.some((item) => item.action === action);
}

function isCompleted(state: Stream113CLiveRoomLifecycleUiuxState, id: Stream113CLifecycleStepId): boolean {
  return state.completedStepIds.includes(id);
}

function step(id: Stream113CLifecycleStepId, ready: boolean, note: string, blockedSafely = false): Stream113CLifecycleStep {
  return { id, title: STEP_TITLES[id], note, status: ready ? "ready_local" : blockedSafely ? "blocked_safely" : "waiting" };
}

export function buildStream113CLiveRoomLifecycleUiuxEvidence(
  state: Stream113CLiveRoomLifecycleUiuxState,
  room: StreamRoomRuntimeState,
  hostControls: StreamHostControlsRuntimeState,
): Stream113CLiveRoomLifecycleUiuxEvidence {
  const prepareReady = isCompleted(state, "prepare") || room.status === "local_room_ready" || room.status === "local_preview_active" || room.status === "provider_handoff_blocked" || room.status === "ended" || hasAction(room, "create_local_room");
  const previewReady = isCompleted(state, "preview") || room.status === "local_preview_active" || room.status === "provider_handoff_blocked" || room.status === "ended" || hasAction(room, "activate_local_preview");
  const providerBoundaryReady = isCompleted(state, "provider_boundary") || room.status === "provider_handoff_blocked" || hasAction(room, "request_provider_handoff") || room.status === "ended";
  const pauseReady = isCompleted(state, "safe_pause") || hostControls.safetyState === "safe_pause_local" || hostControls.safetyState === "resume_requested_local" || room.status === "ended";
  const resumeReady = isCompleted(state, "resume") || hostControls.safetyState === "resume_requested_local" || room.status === "ended";
  const endedReady = isCompleted(state, "end_summary") || room.status === "ended";

  const steps: readonly Stream113CLifecycleStep[] = [
    step("prepare", prepareReady, prepareReady ? "Комната подготовлена, ведущий понимает первый шаг." : "Нужно нажать «Подготовка», чтобы убрать пустой путь черновика."),
    step("preview", previewReady, previewReady ? "Предпросмотр включён локально: ведущий видит состояние до эфира." : "Нужно включить предпросмотр перед запросом эфира/провайдера."),
    step("provider_boundary", providerBoundaryReady, providerBoundaryReady ? "Граница провайдера/реального времени показана честно: эфир не фейкуется." : "Нужно нажать «Граница провайдера», чтобы показать безопасный блокер.", providerBoundaryReady),
    step("safe_pause", pauseReady, pauseReady ? "Пауза выглядит как безопасное состояние, не как авария." : "Нужно проверить UX паузы для ведущего."),
    step("resume", resumeReady, resumeReady ? "Возврат после паузы понятен и не ломает главный путь." : "Нужно проверить UX возврата после паузы."),
    step("end_summary", endedReady, endedReady ? "Завершение даёт итог, а не резкий обрыв экрана." : "Нужно закрыть эфир и показать итог."),
  ];

  const readySteps = steps.filter((item) => item.status === "ready_local" || item.status === "blocked_safely").length;
  const totalSteps = steps.length;
  const premiumScore = Math.round((readySteps / totalSteps) * 100);
  const next = steps.find((item) => item.status === "waiting");
  const providerBoundaryClear = providerBoundaryReady && room.integration.fakeOnAirAllowed === false && room.integration.fakeProviderAllowed === false && room.integration.fakePaymentAllowed === false;
  const lifecycleNarrative = room.status === "ended"
    ? "Эфир завершён локально: ведущий видит итог и безопасные границы."
    : room.status === "provider_handoff_blocked"
      ? "Запрос эфира/провайдера честно остановлен, потому что реальный провайдер не подключён."
      : hostControls.safetyState === "safe_pause_local"
        ? "Эфир в безопасной паузе: UI объясняет, что происходит."
        : room.status === "local_preview_active"
          ? "Предпросмотр активен: ведущий может проверить картинку, чат и людей."
          : "Эфир ещё в подготовке: нужен чистый первый шаг.";

  return {
    version: "STREAM-113C",
    selectedStepId: state.selectedStepId,
    premiumScore,
    readySteps,
    totalSteps,
    steps,
    roomStatus: room.status,
    safetyState: hostControls.safetyState,
    lifecycleNarrative,
    nextPrimaryAction: next ? `${next.title}: ${next.note}` : "Жизненный цикл UI/UX локально закрыт; дальше можно чистить финальный телефонный экран.",
    localUxReady: readySteps === totalSteps && state.reviewedLocal,
    reviewedLocal: state.reviewedLocal,
    endedAt: room.endedAt,
    actionLogCount: room.actionLog.length,
    providerBoundaryClear,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
    providerReady: false,
  };
}
