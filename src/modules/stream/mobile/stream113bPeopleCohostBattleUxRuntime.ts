import type { StreamBattleFlowRuntimeState } from "./streamRoomBattleRuntime";
import type { StreamParticipantManagementRuntimeState } from "./streamRoomParticipantRuntime";
import type { StreamRoomRuntimeState } from "./streamRoomRuntime";

export type Stream113BPeopleUxPanelId = "participants" | "cohosts" | "battle" | "share";
export type Stream113BPeopleUxStatus = "needs_local_action" | "premium_local";

export type Stream113BPeopleUxPanel = {
  readonly id: Stream113BPeopleUxPanelId;
  readonly title: string;
  readonly note: string;
  readonly status: Stream113BPeopleUxStatus;
};

export type Stream113BPeopleCohostBattleUxState = {
  readonly version: "STREAM-113B";
  readonly selectedPanelId: Stream113BPeopleUxPanelId;
  readonly reviewedLocal: boolean;
  readonly lastAction: string;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
};

export type Stream113BPeopleCohostBattleUxEvidence = {
  readonly version: "STREAM-113B";
  readonly selectedPanelId: Stream113BPeopleUxPanelId;
  readonly premiumScore: number;
  readonly totalPanels: number;
  readonly readyPanels: number;
  readonly panels: readonly Stream113BPeopleUxPanel[];
  readonly hostName: string;
  readonly viewers: number;
  readonly cohosts: number;
  readonly speakerSeatsOccupied: number;
  readonly battleStatus: string;
  readonly battleStage: string;
  readonly nextPrimaryAction: string;
  readonly localUxReady: boolean;
  readonly reviewedLocal: boolean;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly providerReady: false;
};

export function createInitialStream113BPeopleCohostBattleUxState(): Stream113BPeopleCohostBattleUxState {
  return {
    version: "STREAM-113B",
    selectedPanelId: "participants",
    reviewedLocal: false,
    lastAction: "Начните с чистого списка участников, затем проверьте соведущего и дуэль.",
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
  };
}

export function selectStream113BPeopleUxPanel(
  state: Stream113BPeopleCohostBattleUxState,
  panelId: Stream113BPeopleUxPanelId,
): Stream113BPeopleCohostBattleUxState {
  return { ...state, selectedPanelId: panelId, lastAction: `Открыт UI/UX раздел: ${panelId}` };
}

export function markStream113BPeopleUxReviewedLocally(
  state: Stream113BPeopleCohostBattleUxState,
  action: string,
): Stream113BPeopleCohostBattleUxState {
  return { ...state, reviewedLocal: true, lastAction: action };
}

function panel(id: Stream113BPeopleUxPanelId, title: string, note: string, ready: boolean): Stream113BPeopleUxPanel {
  return { id, title, note, status: ready ? "premium_local" : "needs_local_action" };
}

export function buildStream113BPeopleCohostBattleUxEvidence(
  state: Stream113BPeopleCohostBattleUxState,
  room: StreamRoomRuntimeState,
  participantState: StreamParticipantManagementRuntimeState,
  battleFlowState: StreamBattleFlowRuntimeState,
): Stream113BPeopleCohostBattleUxEvidence {
  const host = room.participants.find((participant) => participant.role === "host" && !participant.blocked) ?? room.participants[0] ?? null;
  const viewers = room.participants.filter((participant) => participant.role === "viewer" && !participant.blocked).length;
  const cohosts = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  const speakerSeatsOccupied = participantState.speakerSeats.filter((seat) => Boolean(seat.participantId)).length;
  const battleStatus = room.battle?.status ?? "none";
  const battleReady = battleStatus === "accepted_local" || battleFlowState.stage === "accepted_local" || battleFlowState.stage === "round_active_local" || battleFlowState.stage === "round_locked_local";
  const panels: readonly Stream113BPeopleUxPanel[] = [
    panel("participants", "Участники", viewers > 0 ? `${viewers} зритель локально готов, список не пустой.` : "Добавьте локального зрителя, чтобы проверить визуальную иерархию списка.", Boolean(host) && viewers > 0),
    panel("cohosts", "Соведущие", cohosts > 0 ? `${cohosts} co-host готов для premium stage.` : "Проверьте приглашение → принятие, чтобы соведущий стал реальным локальным состоянием.", cohosts > 0 || speakerSeatsOccupied > 1),
    panel("battle", "Дуэль", battleReady ? `Дуэль: ${battleStatus} / ${battleFlowState.stage}.` : "Проверьте черновик → принятие, без фейкового победителя или провайдера.", battleReady),
    panel("share", "Поделиться", room.roomId ? "Поделиться использует системное окно и реальный ID комнаты." : "Нужен ID комнаты для красивого предпросмотра «Поделиться».", Boolean(room.roomId)),
  ];
  const readyPanels = panels.filter((item) => item.status === "premium_local").length;
  const totalPanels = panels.length;
  const premiumScore = Math.round((readyPanels / totalPanels) * 100);
  const next = panels.find((item) => item.status !== "premium_local") ?? null;
  return {
    version: "STREAM-113B",
    selectedPanelId: state.selectedPanelId,
    premiumScore,
    totalPanels,
    readyPanels,
    panels,
    hostName: host?.displayName ?? "Ведущий отсутствует",
    viewers,
    cohosts,
    speakerSeatsOccupied,
    battleStatus,
    battleStage: battleFlowState.stage,
    nextPrimaryAction: next ? `${next.title}: ${next.note}` : "Участники, соведущий, дуэль и «Поделиться» выглядят цельно на телефоне.",
    localUxReady: readyPanels === totalPanels && state.reviewedLocal,
    reviewedLocal: state.reviewedLocal,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    providerReady: false,
  };
}
