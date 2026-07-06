import type { StreamRoomRuntimeState } from "./streamRoomRuntime";

export type StreamBattleFlowStage =
  | "idle"
  | "draft"
  | "invite_ready"
  | "invite_pending_local"
  | "accepted_local"
  | "stage_countdown_local"
  | "round_active_local"
  | "round_locked_local"
  | "provider_judging_required"
  | "ended_local";

export type StreamBattleRoundStatus = "draft" | "countdown_local" | "active_local" | "locked_local" | "provider_judging_required";
export type StreamBattleJudgeMode = "audience" | "host" | "admin_review";
export type StreamBattleOpponentReadiness = "missing" | "draft" | "invited_local" | "accepted_local" | "declined_local";
export type StreamBattleBlockerCode =
  | "battle_draft_required"
  | "battle_opponent_required"
  | "battle_topic_required"
  | "battle_not_accepted"
  | "battle_round_required"
  | "battle_realtime_provider_required"
  | "battle_media_provider_required"
  | "battle_backend_contract_required"
  | "battle_admin_judging_required";

export type StreamBattleRound = {
  readonly id: string;
  readonly title: string;
  readonly durationSeconds: number;
  readonly status: StreamBattleRoundStatus;
  readonly hostScoreLocal: number;
  readonly opponentScoreLocal: number;
  readonly fakeWinnerAllowed: false;
  readonly createdAt: string;
  readonly lockedAt: string | null;
};

export type StreamBattleFlowRuntimeState = {
  readonly version: "STREAM-108W";
  readonly battleId: string | null;
  readonly stage: StreamBattleFlowStage;
  readonly opponentName: string;
  readonly topic: string;
  readonly opponentReadiness: StreamBattleOpponentReadiness;
  readonly judgeMode: StreamBattleJudgeMode;
  readonly rounds: readonly StreamBattleRound[];
  readonly activeRoundId: string | null;
  readonly backendBattleContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly adminJudgingContract: "not_connected" | "connected";
  readonly winnerDeclaration: "blocked_provider_required";
  readonly fakeWinnerAllowed: false;
  readonly fakeScoreProviderAllowed: false;
  readonly fakeBattleProviderAllowed: false;
  readonly actionLog: readonly StreamBattleFlowActionLogEntry[];
};

export type StreamBattleFlowActionStatus =
  | "battle_flow_initialized"
  | "battle_flow_synced"
  | "battle_invite_updated"
  | "battle_stage_updated"
  | "battle_round_updated"
  | "battle_score_updated"
  | "battle_provider_blocked";

export type StreamBattleFlowActionLogEntry = {
  readonly id: string;
  readonly action: string;
  readonly status: StreamBattleFlowActionStatus;
  readonly createdAt: string;
  readonly blockers: readonly StreamBattleBlockerCode[];
};

export type StreamBattleFlowEvidenceSnapshot = {
  readonly version: "STREAM-108W";
  readonly battleId: string | null;
  readonly stage: StreamBattleFlowStage;
  readonly opponentReadiness: StreamBattleOpponentReadiness;
  readonly rounds: number;
  readonly activeRoundStatus: StreamBattleRoundStatus | "none";
  readonly hostScoreLocal: number;
  readonly opponentScoreLocal: number;
  readonly localBlockers: readonly StreamBattleBlockerCode[];
  readonly providerBlockers: readonly StreamBattleBlockerCode[];
  readonly backendBattleContract: "not_connected" | "connected";
  readonly realtimeProvider: "not_configured" | "configured";
  readonly mediaProvider: "not_configured" | "configured";
  readonly adminJudgingContract: "not_connected" | "connected";
  readonly winnerDeclaration: "blocked_provider_required";
  readonly fakeWinnerAllowed: false;
  readonly fakeScoreProviderAllowed: false;
  readonly fakeBattleProviderAllowed: false;
  readonly readyForBackendUnion: true;
};

const MAX_BATTLE_LOG = 48;
const MAX_ROUNDS = 5;

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

function createId(prefix: string, now?: Date | string | number): string {
  const stamp = nowIso(now).replace(/[^0-9]/g, "").slice(0, 17);
  return `${prefix}-${stamp}`;
}

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(999, Math.round(value)));
}

function appendBattleLog(
  state: StreamBattleFlowRuntimeState,
  action: string,
  status: StreamBattleFlowActionStatus,
  blockers: readonly StreamBattleBlockerCode[] = [],
  now?: Date | string | number,
): StreamBattleFlowRuntimeState {
  const createdAt = nowIso(now);
  return {
    ...state,
    actionLog: [{ id: `${action}-${createdAt}`, action, status, createdAt, blockers }, ...state.actionLog].slice(0, MAX_BATTLE_LOG),
  };
}

function activeRound(state: StreamBattleFlowRuntimeState): StreamBattleRound | null {
  return state.rounds.find((round) => round.id === state.activeRoundId) ?? state.rounds[0] ?? null;
}

export function createInitialStreamBattleFlowState(now?: Date | string | number): StreamBattleFlowRuntimeState {
  const state: StreamBattleFlowRuntimeState = {
    version: "STREAM-108W",
    battleId: null,
    stage: "idle",
    opponentName: "",
    topic: "",
    opponentReadiness: "missing",
    judgeMode: "audience",
    rounds: [],
    activeRoundId: null,
    backendBattleContract: "not_connected",
    realtimeProvider: "not_configured",
    mediaProvider: "not_configured",
    adminJudgingContract: "not_connected",
    winnerDeclaration: "blocked_provider_required",
    fakeWinnerAllowed: false,
    fakeScoreProviderAllowed: false,
    fakeBattleProviderAllowed: false,
    actionLog: [],
  };
  return appendBattleLog(state, "battle_flow_initialized", "battle_flow_initialized", [], now);
}

export function syncStreamBattleFlowState(current: StreamBattleFlowRuntimeState, room: StreamRoomRuntimeState, now?: Date | string | number): StreamBattleFlowRuntimeState {
  if (!room.battle) {
    return current.stage === "idle" ? current : appendBattleLog({ ...current, battleId: null, stage: "idle", activeRoundId: null }, "battle_flow_synced_idle", "battle_flow_synced", [], now);
  }

  const opponentReadiness: StreamBattleOpponentReadiness =
    room.battle.status === "accepted_local" ? "accepted_local" :
    room.battle.status === "declined_local" ? "declined_local" :
    room.battle.status === "invite_ready" ? "invited_local" :
    "draft";
  const stage: StreamBattleFlowStage =
    current.stage === "idle" || current.battleId !== room.battle.id
      ? room.battle.status === "accepted_local" ? "accepted_local" : room.battle.status === "invite_ready" ? "invite_ready" : "draft"
      : current.stage;

  const next = {
    ...current,
    battleId: room.battle.id,
    opponentName: room.battle.opponentName,
    topic: room.battle.topic,
    opponentReadiness,
    stage,
  };
  return appendBattleLog(next, "battle_flow_synced", "battle_flow_synced", [], now);
}

export function inviteLocalBattleOpponent(state: StreamBattleFlowRuntimeState, now?: Date | string | number): StreamBattleFlowRuntimeState {
  const blockers = getStreamBattleLocalBlockers(state).filter((blocker) => blocker !== "battle_not_accepted" && blocker !== "battle_round_required");
  if (blockers.length > 0) {
    return appendBattleLog(state, "battle_invite_blocked", "battle_invite_updated", blockers, now);
  }
  return appendBattleLog({ ...state, stage: "invite_pending_local", opponentReadiness: "invited_local" }, "battle_invite_pending_local", "battle_invite_updated", [], now);
}

export function answerLocalBattleOpponentInvite(state: StreamBattleFlowRuntimeState, answer: "accept" | "decline", now?: Date | string | number): StreamBattleFlowRuntimeState {
  const next: StreamBattleFlowRuntimeState = {
    ...state,
    stage: answer === "accept" ? "accepted_local" : "ended_local",
    opponentReadiness: answer === "accept" ? "accepted_local" : "declined_local",
  };
  return appendBattleLog(next, `battle_opponent_${answer}`, "battle_invite_updated", [], now);
}

export function createLocalBattleRound(state: StreamBattleFlowRuntimeState, title?: string, now?: Date | string | number): StreamBattleFlowRuntimeState {
  if (state.rounds.length >= MAX_ROUNDS) {
    return appendBattleLog(state, "battle_round_limit_blocked", "battle_round_updated", [], now);
  }
  const round: StreamBattleRound = {
    id: createId("local-battle-round", now),
    title: normalizeText(title) || `Round ${state.rounds.length + 1}`,
    durationSeconds: 60,
    status: "draft",
    hostScoreLocal: 0,
    opponentScoreLocal: 0,
    fakeWinnerAllowed: false,
    createdAt: nowIso(now),
    lockedAt: null,
  };
  return appendBattleLog({ ...state, rounds: [...state.rounds, round], activeRoundId: round.id, stage: state.stage === "idle" ? "draft" : state.stage }, "battle_round_created", "battle_round_updated", [], now);
}

export function startLocalBattleCountdown(state: StreamBattleFlowRuntimeState, now?: Date | string | number): StreamBattleFlowRuntimeState {
  const blockers = getStreamBattleLocalBlockers(state).filter((blocker) => blocker !== "battle_realtime_provider_required" && blocker !== "battle_media_provider_required" && blocker !== "battle_backend_contract_required" && blocker !== "battle_admin_judging_required");
  const round = activeRound(state);
  if (blockers.length > 0 || !round) {
    return appendBattleLog(state, "battle_countdown_blocked", "battle_stage_updated", blockers, now);
  }
  const rounds = state.rounds.map((item) => item.id === round.id ? { ...item, status: "countdown_local" as const } : item);
  return appendBattleLog({ ...state, rounds, stage: "stage_countdown_local", activeRoundId: round.id }, "battle_countdown_local", "battle_stage_updated", [], now);
}

export function startLocalBattleRound(state: StreamBattleFlowRuntimeState, now?: Date | string | number): StreamBattleFlowRuntimeState {
  const round = activeRound(state);
  if (!round || state.opponentReadiness !== "accepted_local") {
    return appendBattleLog(state, "battle_round_start_blocked", "battle_stage_updated", getStreamBattleLocalBlockers(state), now);
  }
  const rounds = state.rounds.map((item) => item.id === round.id ? { ...item, status: "active_local" as const } : item);
  return appendBattleLog({ ...state, rounds, stage: "round_active_local", activeRoundId: round.id }, "battle_round_active_local", "battle_stage_updated", [], now);
}

export function updateLocalBattleScore(
  state: StreamBattleFlowRuntimeState,
  patch: { readonly hostDelta?: number; readonly opponentDelta?: number },
  now?: Date | string | number,
): StreamBattleFlowRuntimeState {
  const round = activeRound(state);
  if (!round) return appendBattleLog(state, "battle_score_missing_round", "battle_score_updated", ["battle_round_required"], now);
  const rounds = state.rounds.map((item) => item.id === round.id ? {
    ...item,
    hostScoreLocal: clampScore(item.hostScoreLocal + (patch.hostDelta ?? 0)),
    opponentScoreLocal: clampScore(item.opponentScoreLocal + (patch.opponentDelta ?? 0)),
  } : item);
  return appendBattleLog({ ...state, rounds }, "battle_score_updated_local", "battle_score_updated", [], now);
}

export function lockLocalBattleRound(state: StreamBattleFlowRuntimeState, now?: Date | string | number): StreamBattleFlowRuntimeState {
  const round = activeRound(state);
  if (!round) return appendBattleLog(state, "battle_lock_missing_round", "battle_round_updated", ["battle_round_required"], now);
  const rounds = state.rounds.map((item) => item.id === round.id ? { ...item, status: "locked_local" as const, lockedAt: nowIso(now) } : item);
  return appendBattleLog({ ...state, rounds, stage: "round_locked_local" }, "battle_round_locked_local", "battle_round_updated", [], now);
}

export function requestBattleProviderJudging(state: StreamBattleFlowRuntimeState, now?: Date | string | number): StreamBattleFlowRuntimeState {
  const blockers = [...getStreamBattleLocalBlockers(state), ...getStreamBattleProviderBlockers(state)];
  const round = activeRound(state);
  const rounds = round ? state.rounds.map((item) => item.id === round.id ? { ...item, status: "provider_judging_required" as const } : item) : state.rounds;
  return appendBattleLog({ ...state, rounds, stage: "provider_judging_required" }, "battle_provider_judging_blocked", "battle_provider_blocked", blockers, now);
}

export function endLocalBattleFlow(state: StreamBattleFlowRuntimeState, now?: Date | string | number): StreamBattleFlowRuntimeState {
  return appendBattleLog({ ...state, stage: "ended_local" }, "battle_flow_ended_local", "battle_stage_updated", [], now);
}

export function getStreamBattleLocalBlockers(state: StreamBattleFlowRuntimeState): readonly StreamBattleBlockerCode[] {
  const blockers: StreamBattleBlockerCode[] = [];
  if (!state.battleId) blockers.push("battle_draft_required");
  if (!normalizeText(state.opponentName)) blockers.push("battle_opponent_required");
  if (!normalizeText(state.topic)) blockers.push("battle_topic_required");
  if (state.opponentReadiness !== "accepted_local") blockers.push("battle_not_accepted");
  if (state.rounds.length === 0) blockers.push("battle_round_required");
  return blockers;
}

export function getStreamBattleProviderBlockers(state: StreamBattleFlowRuntimeState): readonly StreamBattleBlockerCode[] {
  const blockers: StreamBattleBlockerCode[] = [];
  if (state.backendBattleContract !== "connected") blockers.push("battle_backend_contract_required");
  if (state.realtimeProvider !== "configured") blockers.push("battle_realtime_provider_required");
  if (state.mediaProvider !== "configured") blockers.push("battle_media_provider_required");
  if (state.adminJudgingContract !== "connected") blockers.push("battle_admin_judging_required");
  return blockers;
}

export function buildStreamBattleFlowEvidenceSnapshot(state: StreamBattleFlowRuntimeState): StreamBattleFlowEvidenceSnapshot {
  const round = activeRound(state);
  return {
    version: "STREAM-108W",
    battleId: state.battleId,
    stage: state.stage,
    opponentReadiness: state.opponentReadiness,
    rounds: state.rounds.length,
    activeRoundStatus: round?.status ?? "none",
    hostScoreLocal: round?.hostScoreLocal ?? 0,
    opponentScoreLocal: round?.opponentScoreLocal ?? 0,
    localBlockers: getStreamBattleLocalBlockers(state),
    providerBlockers: getStreamBattleProviderBlockers(state),
    backendBattleContract: state.backendBattleContract,
    realtimeProvider: state.realtimeProvider,
    mediaProvider: state.mediaProvider,
    adminJudgingContract: state.adminJudgingContract,
    winnerDeclaration: "blocked_provider_required",
    fakeWinnerAllowed: false,
    fakeScoreProviderAllowed: false,
    fakeBattleProviderAllowed: false,
    readyForBackendUnion: true,
  };
}
