import type { StreamRoomRuntimeState } from "./streamRoomRuntime";

export type Stream112NLiveRoomSmokeStepId =
  | "settings"
  | "source"
  | "host"
  | "chat"
  | "participants"
  | "cohosts"
  | "battle"
  | "share";

export type Stream112NLiveRoomSmokeStepStatus = "waiting" | "passed_local" | "blocked_local" | "provider_blocked";

export type Stream112NLiveRoomSmokeStep = {
  readonly id: Stream112NLiveRoomSmokeStepId;
  readonly title: string;
  readonly status: Stream112NLiveRoomSmokeStepStatus;
  readonly note: string;
  readonly updatedAt: string | null;
};

export type Stream112NLiveRoomFinalInteractionSmokeState = {
  readonly version: "STREAM-112N";
  readonly selectedStepId: Stream112NLiveRoomSmokeStepId;
  readonly steps: readonly Stream112NLiveRoomSmokeStep[];
  readonly shareDraftPrepared: boolean;
  readonly shareSheetRequestedLocal: boolean;
  readonly lastShareMessage: string | null;
  readonly updatedAt: string;
};

export type Stream112NLiveRoomFinalInteractionSmokeEvidence = {
  readonly version: "STREAM-112N";
  readonly selectedStepId: Stream112NLiveRoomSmokeStepId;
  readonly steps: readonly Stream112NLiveRoomSmokeStep[];
  readonly passedLocalSteps: number;
  readonly totalSteps: number;
  readonly localReady: boolean;
  readonly providerReady: false;
  readonly roomId: string;
  readonly selectedSource: string;
  readonly hostPresent: boolean;
  readonly commentsReady: boolean;
  readonly participantsReady: boolean;
  readonly cohostsReady: boolean;
  readonly battleReady: boolean;
  readonly shareReady: boolean;
  readonly localBlockers: readonly string[];
  readonly providerBlockers: readonly string[];
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeCinemaMixAllowed: false;
};

const STEP_DEFINITIONS: readonly { readonly id: Stream112NLiveRoomSmokeStepId; readonly title: string }[] = [
  { id: "settings", title: "Настройки" },
  { id: "source", title: "Источник" },
  { id: "host", title: "Ведущий" },
  { id: "chat", title: "Чат" },
  { id: "participants", title: "Участники" },
  { id: "cohosts", title: "Соведущие" },
  { id: "battle", title: "Дуэль" },
  { id: "share", title: "Поделиться" },
];

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function createStep(definition: { readonly id: Stream112NLiveRoomSmokeStepId; readonly title: string }): Stream112NLiveRoomSmokeStep {
  return {
    id: definition.id,
    title: definition.title,
    status: "waiting",
    note: "ожидает локальной проверки",
    updatedAt: null,
  };
}

export function createInitialStream112NFinalInteractionSmokeState(): Stream112NLiveRoomFinalInteractionSmokeState {
  return {
    version: "STREAM-112N",
    selectedStepId: "settings",
    steps: STEP_DEFINITIONS.map(createStep),
    shareDraftPrepared: false,
    shareSheetRequestedLocal: false,
    lastShareMessage: null,
    updatedAt: nowIso(),
  };
}

export function selectStream112NFinalInteractionSmokeStep(
  state: Stream112NLiveRoomFinalInteractionSmokeState,
  stepId: Stream112NLiveRoomSmokeStepId,
): Stream112NLiveRoomFinalInteractionSmokeState {
  return { ...state, selectedStepId: stepId, updatedAt: nowIso() };
}

export function markStream112NFinalInteractionSmokeStep(
  state: Stream112NLiveRoomFinalInteractionSmokeState,
  stepId: Stream112NLiveRoomSmokeStepId,
  status: Stream112NLiveRoomSmokeStepStatus,
  note: string,
): Stream112NLiveRoomFinalInteractionSmokeState {
  const updatedAt = nowIso();
  return {
    ...state,
    selectedStepId: stepId,
    updatedAt,
    steps: state.steps.map((step) => (step.id === stepId ? { ...step, status, note, updatedAt } : step)),
  };
}

export function markStream112NShareDraftPrepared(
  state: Stream112NLiveRoomFinalInteractionSmokeState,
  message: string,
): Stream112NLiveRoomFinalInteractionSmokeState {
  return markStream112NFinalInteractionSmokeStep(
    { ...state, shareDraftPrepared: true, shareSheetRequestedLocal: true, lastShareMessage: message },
    "share",
    "passed_local",
    "локальный черновик «Поделиться» подготовлен; провайдер и реальное время не фейкуются",
  );
}

function completedStatus(
  existing: Stream112NLiveRoomSmokeStep,
  passed: boolean,
  passedNote: string,
  blockedNote: string,
): Stream112NLiveRoomSmokeStep {
  if (passed) return { ...existing, status: "passed_local", note: existing.status === "passed_local" ? existing.note : passedNote };
  if (existing.status === "passed_local") return existing;
  return { ...existing, status: "blocked_local", note: blockedNote };
}

export function buildStream112NFinalInteractionSmokeEvidence(
  state: Stream112NLiveRoomFinalInteractionSmokeState,
  room: StreamRoomRuntimeState,
): Stream112NLiveRoomFinalInteractionSmokeEvidence {
  const selectedSource = room.broadcast.source ?? "none";
  const hostPresent = room.participants.some((participant) => participant.role === "host" && !participant.blocked);
  const commentsReady = room.comments.some((comment) => comment.localOnly && comment.text.trim().length > 0);
  const participantsReady = room.participants.filter((participant) => !participant.blocked).length > 1;
  const cohostsReady = room.participants.some((participant) => participant.role === "cohost" && !participant.blocked) || room.cohostInvites.length > 0;
  const battleReady = Boolean(room.battle);
  const shareReady = state.shareDraftPrepared && state.shareSheetRequestedLocal;

  const derived: Record<Stream112NLiveRoomSmokeStepId, boolean> = {
    settings: true,
    source: selectedSource !== "none",
    host: hostPresent,
    chat: commentsReady,
    participants: participantsReady,
    cohosts: cohostsReady,
    battle: battleReady,
    share: shareReady,
  };

  const notes: Record<Stream112NLiveRoomSmokeStepId, { readonly ok: string; readonly blocked: string }> = {
    settings: { ok: "панель настроек открыта без внешнего мусора", blocked: "панель настроек ещё не открыта" },
    source: { ok: `источник выбран: ${selectedSource}`, blocked: "источник эфира не выбран" },
    host: { ok: "ведущий присутствует", blocked: "ведущий отсутствует или заблокирован" },
    chat: { ok: "локальный путь комментария в чате работает", blocked: "локальное действие чата не проверено" },
    participants: { ok: "локальный путь участника работает", blocked: "пути участников нужен локальный зритель" },
    cohosts: { ok: "приглашение и принятие соведущего работают локально", blocked: "путь соведущего не проверен" },
    battle: { ok: "черновик дуэли работает локально", blocked: "путь дуэли не проверен" },
    share: { ok: "черновик «Поделиться» подготовлен локально", blocked: "системное окно «Поделиться» не проверено" },
  };

  const steps = state.steps.map((step) => completedStatus(step, derived[step.id], notes[step.id].ok, notes[step.id].blocked));
  const localBlockers = steps.filter((step) => step.status !== "passed_local").map((step) => `${step.id}_not_passed`);
  const providerBlockers = [
    "backend_live_room_final_smoke_contract_required",
    "realtime_live_room_final_smoke_provider_required",
    "media_live_room_final_smoke_provider_required",
  ];
  const passedLocalSteps = steps.filter((step) => step.status === "passed_local").length;

  return {
    version: "STREAM-112N",
    selectedStepId: state.selectedStepId,
    steps,
    passedLocalSteps,
    totalSteps: steps.length,
    localReady: localBlockers.length === 0,
    providerReady: false,
    roomId: room.roomId,
    selectedSource,
    hostPresent,
    commentsReady,
    participantsReady,
    cohostsReady,
    battleReady,
    shareReady,
    localBlockers,
    providerBlockers,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeCinemaMixAllowed: false,
  };
}
