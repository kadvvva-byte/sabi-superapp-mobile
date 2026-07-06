import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream112NLiveRoomFinalInteractionSmokeEvidence } from "./stream112nLiveRoomFinalInteractionSmokeRuntime";

export type Stream113AUxSectionId =
  | "phone_shell"
  | "visual_hierarchy"
  | "primary_path"
  | "chat_bottom"
  | "participants"
  | "cohosts"
  | "battle"
  | "share"
  | "safe_boundaries";

export type Stream113AUxSectionStatus = "waiting" | "ready_local" | "needs_local_action" | "provider_blocked";

export type Stream113AUxSection = {
  readonly id: Stream113AUxSectionId;
  readonly title: string;
  readonly status: Stream113AUxSectionStatus;
  readonly note: string;
};

export type Stream113ALiveRoomUx100State = {
  readonly version: "STREAM-113A";
  readonly selectedSectionId: Stream113AUxSectionId;
  readonly reviewedLocally: boolean;
  readonly externalPanelClutterRemoved: boolean;
  readonly debugCopyHiddenFromMainPath: boolean;
  readonly phoneFirstLayoutLocked: boolean;
  readonly updatedAt: string;
};

export type Stream113ALiveRoomUx100Evidence = {
  readonly version: "STREAM-113A";
  readonly selectedSectionId: Stream113AUxSectionId;
  readonly sections: readonly Stream113AUxSection[];
  readonly localReadySections: number;
  readonly totalSections: number;
  readonly localUxReady: boolean;
  readonly premiumScore: number;
  readonly nextPrimaryAction: string;
  readonly roomStatus: string;
  readonly visualState: string;
  readonly providerReady: false;
  readonly localBlockers: readonly string[];
  readonly providerBlockers: readonly string[];
  readonly fakeLiveAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SECTION_TITLES: Record<Stream113AUxSectionId, string> = {
  phone_shell: "Экран телефона",
  visual_hierarchy: "Визуальная иерархия",
  primary_path: "Главный путь эфира",
  chat_bottom: "Чат снизу",
  participants: "Участники",
  cohosts: "Соведущие",
  battle: "Дуэль",
  share: "Поделиться",
  safe_boundaries: "Безопасные границы",
};

const SECTION_ORDER: readonly Stream113AUxSectionId[] = [
  "phone_shell",
  "visual_hierarchy",
  "primary_path",
  "chat_bottom",
  "participants",
  "cohosts",
  "battle",
  "share",
  "safe_boundaries",
];

function nowIso(now?: Date | string | number): string {
  if (now instanceof Date) return now.toISOString();
  if (typeof now === "string") return new Date(now).toISOString();
  if (typeof now === "number") return new Date(now).toISOString();
  return new Date().toISOString();
}

export function createInitialStream113ALiveRoomUx100State(): Stream113ALiveRoomUx100State {
  return {
    version: "STREAM-113A",
    selectedSectionId: "phone_shell",
    reviewedLocally: false,
    externalPanelClutterRemoved: true,
    debugCopyHiddenFromMainPath: true,
    phoneFirstLayoutLocked: true,
    updatedAt: nowIso(),
  };
}

export function selectStream113AUxSection(
  state: Stream113ALiveRoomUx100State,
  sectionId: Stream113AUxSectionId,
): Stream113ALiveRoomUx100State {
  return { ...state, selectedSectionId: sectionId, updatedAt: nowIso() };
}

export function markStream113AUxReviewedLocally(state: Stream113ALiveRoomUx100State): Stream113ALiveRoomUx100State {
  return {
    ...state,
    reviewedLocally: true,
    externalPanelClutterRemoved: true,
    debugCopyHiddenFromMainPath: true,
    phoneFirstLayoutLocked: true,
    updatedAt: nowIso(),
  };
}

function section(
  id: Stream113AUxSectionId,
  ready: boolean,
  noteReady: string,
  noteBlocked: string,
): Stream113AUxSection {
  return {
    id,
    title: SECTION_TITLES[id],
    status: ready ? "ready_local" : "needs_local_action",
    note: ready ? noteReady : noteBlocked,
  };
}

export function buildStream113ALiveRoomUx100Evidence(
  state: Stream113ALiveRoomUx100State,
  room: StreamRoomRuntimeState,
  finalSmoke: Stream112NLiveRoomFinalInteractionSmokeEvidence,
): Stream113ALiveRoomUx100Evidence {
  const activeParticipants = room.participants.filter((participant) => !participant.blocked);
  const hostPresent = activeParticipants.some((participant) => participant.role === "host");
  const chatReady = finalSmoke.commentsReady || room.comments.some((comment) => comment.text.trim().length > 0);
  const cohostsReady = finalSmoke.cohostsReady || activeParticipants.some((participant) => participant.role === "cohost") || room.cohostInvites.length > 0;
  const battleReady = finalSmoke.battleReady || Boolean(room.battle);
  const shareReady = finalSmoke.shareReady;
  const sourceReady = Boolean(room.broadcast.source);
  const roomHasLocalShell = hostPresent && sourceReady;
  const primaryPathReady = finalSmoke.passedLocalSteps >= 7;
  const safeBoundariesReady = !room.integration.fakeOnAirAllowed && !room.integration.fakeProviderAllowed && !room.integration.fakePaymentAllowed && !room.integration.fakeLaunchCompleteAllowed;

  const sections: readonly Stream113AUxSection[] = SECTION_ORDER.map((id) => {
    if (id === "phone_shell") return section(id, state.phoneFirstLayoutLocked && roomHasLocalShell, "телефонная оболочка зафиксирована", "нужно открыть комнату и выбрать источник");
    if (id === "visual_hierarchy") return section(id, state.externalPanelClutterRemoved && state.debugCopyHiddenFromMainPath, "главный путь очищен от служебного шума", "нужно убрать служебный шум из основного пути");
    if (id === "primary_path") return section(id, primaryPathReady, "настройки → источник → ведущий → чат → участники → дуэль пройдены локально", "нужно пройти проверку 112N");
    if (id === "chat_bottom") return section(id, chatReady, "чатовый путь снизу проверен", "нужно отправить локальный комментарий");
    if (id === "participants") return section(id, activeParticipants.length > 1, "участники отображаются и меняют состояние", "нужно добавить локального участника");
    if (id === "cohosts") return section(id, cohostsReady, "соведущий/инвайт готов локально", "нужно проверить путь соведущего");
    if (id === "battle") return section(id, battleReady, "дуэль готова локально", "нужно проверить путь дуэли");
    if (id === "share") return section(id, shareReady, "системное окно «Поделиться» подготовлено", "нужно нажать Поделиться");
    return section(id, safeBoundariesReady, "фейковый эфир, провайдер, платежи и смешивание с кино запрещены", "нужно заблокировать фейковые границы");
  });

  const localBlockers = sections.filter((item) => item.status !== "ready_local").map((item) => `${item.id}_not_ready`);
  const localReadySections = sections.length - localBlockers.length;
  const premiumScore = Math.round((localReadySections / sections.length) * 100);
  const next = sections.find((item) => item.status !== "ready_local");

  const providerBlockers = [
    "backend_live_room_contract_required",
    "realtime_room_sync_provider_required",
    "media_stream_provider_required",
  ];

  const visualState = premiumScore >= 100
    ? "premium_local_ui_ready"
    : premiumScore >= 75
      ? "premium_local_ui_needs_final_pass"
      : "premium_local_ui_in_progress";

  return {
    version: "STREAM-113A",
    selectedSectionId: state.selectedSectionId,
    sections,
    localReadySections,
    totalSections: sections.length,
    localUxReady: localBlockers.length === 0,
    premiumScore,
    nextPrimaryAction: next?.title ?? "Финальная ручная проверка на телефоне",
    roomStatus: room.status,
    visualState,
    providerReady: false,
    localBlockers,
    providerBlockers,
    fakeLiveAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
