import type { Stream113DLiveRoomPhoneUiCleanupEvidence } from "./stream113dLiveRoomPhoneUiCleanupRuntime";
import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";

export type Stream113ELiveRoomSurfaceSectionId =
  | "hero_status"
  | "video_canvas"
  | "side_actions"
  | "bottom_chat"
  | "audience_rail"
  | "honest_boundary"
  | "one_thumb_flow";

export type Stream113ELiveRoomSurfaceFocus = "chat" | "people" | "cohost" | "battle" | "share";

export type Stream113ELiveRoomSurfaceSectionStatus = "premium_local" | "needs_review";

export type Stream113ELiveRoomSurfaceSection = {
  readonly id: Stream113ELiveRoomSurfaceSectionId;
  readonly title: string;
  readonly note: string;
  readonly status: Stream113ELiveRoomSurfaceSectionStatus;
};

export type Stream113ELiveRoomSurfaceUiuxState = {
  readonly version: "STREAM-113E";
  readonly selectedSectionId: Stream113ELiveRoomSurfaceSectionId;
  readonly reviewedSectionIds: readonly Stream113ELiveRoomSurfaceSectionId[];
  readonly focusedFlow: Stream113ELiveRoomSurfaceFocus;
  readonly lastAction: string;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113ELiveRoomSurfaceUiuxEvidence = {
  readonly version: "STREAM-113E";
  readonly selectedSectionId: Stream113ELiveRoomSurfaceSectionId;
  readonly focusedFlow: Stream113ELiveRoomSurfaceFocus;
  readonly premiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sections: readonly Stream113ELiveRoomSurfaceSection[];
  readonly heroStatus: string;
  readonly heroNarrative: string;
  readonly videoCanvasTitle: string;
  readonly videoCanvasSubtitle: string;
  readonly bottomChatPreview: string;
  readonly audienceSummary: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly localUxReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SECTION_ORDER: readonly Stream113ELiveRoomSurfaceSectionId[] = [
  "hero_status",
  "video_canvas",
  "side_actions",
  "bottom_chat",
  "audience_rail",
  "honest_boundary",
  "one_thumb_flow",
];

const SECTION_TITLES: Record<Stream113ELiveRoomSurfaceSectionId, string> = {
  hero_status: "Верхний статус",
  video_canvas: "Видео-поле",
  side_actions: "Боковые действия",
  bottom_chat: "Нижний чат",
  audience_rail: "Участники рядом",
  honest_boundary: "Честная граница",
  one_thumb_flow: "Путь одним пальцем",
};

const FOCUS_LABELS: Record<Stream113ELiveRoomSurfaceFocus, string> = {
  chat: "чат снизу",
  people: "участники рядом",
  cohost: "соведущий",
  battle: "дуэль",
  share: "поделиться",
};

export function createInitialStream113ELiveRoomSurfaceUiuxState(): Stream113ELiveRoomSurfaceUiuxState {
  return {
    version: "STREAM-113E",
    selectedSectionId: "video_canvas",
    reviewedSectionIds: ["hero_status", "video_canvas", "honest_boundary"],
    focusedFlow: "chat",
    lastAction: "113E начал чистить сам экран эфира: видео, чат, люди и действия должны быть первым UX, а не панелями проверки.",
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113ELiveRoomSurfaceSection(
  state: Stream113ELiveRoomSurfaceUiuxState,
  sectionId: Stream113ELiveRoomSurfaceSectionId,
): Stream113ELiveRoomSurfaceUiuxState {
  return { ...state, selectedSectionId: sectionId };
}

export function focusStream113ELiveRoomSurfaceFlow(
  state: Stream113ELiveRoomSurfaceUiuxState,
  focusedFlow: Stream113ELiveRoomSurfaceFocus,
  action: string,
): Stream113ELiveRoomSurfaceUiuxState {
  const flowSection: Stream113ELiveRoomSurfaceSectionId = focusedFlow === "chat"
    ? "bottom_chat"
    : focusedFlow === "people"
      ? "audience_rail"
      : focusedFlow === "share"
        ? "one_thumb_flow"
        : "side_actions";
  return markStream113ELiveRoomSurfaceSectionReviewed({ ...state, focusedFlow }, flowSection, action);
}

export function markStream113ELiveRoomSurfaceSectionReviewed(
  state: Stream113ELiveRoomSurfaceUiuxState,
  sectionId: Stream113ELiveRoomSurfaceSectionId,
  action: string,
): Stream113ELiveRoomSurfaceUiuxState {
  const reviewedSectionIds = state.reviewedSectionIds.includes(sectionId)
    ? state.reviewedSectionIds
    : [...state.reviewedSectionIds, sectionId];
  return { ...state, selectedSectionId: sectionId, reviewedSectionIds, lastAction: action };
}

export function markStream113ELiveRoomSurfaceAllReviewed(
  state: Stream113ELiveRoomSurfaceUiuxState,
  action: string,
): Stream113ELiveRoomSurfaceUiuxState {
  return { ...state, selectedSectionId: "one_thumb_flow", reviewedSectionIds: SECTION_ORDER, focusedFlow: "share", lastAction: action };
}

function section(
  id: Stream113ELiveRoomSurfaceSectionId,
  ready: boolean,
  note: string,
): Stream113ELiveRoomSurfaceSection {
  return { id, title: SECTION_TITLES[id], note, status: ready ? "premium_local" : "needs_review" };
}

function hasReviewed(state: Stream113ELiveRoomSurfaceUiuxState, id: Stream113ELiveRoomSurfaceSectionId): boolean {
  return state.reviewedSectionIds.includes(id);
}

function latestVisibleComment(room: StreamRoomRuntimeState): string {
  const latest = room.comments.find((item) => item.status !== "moderation_blocked");
  if (!latest) return "Чат готов: первое сообщение появится снизу, не перекрывая видео.";
  return latest.text.trim() || "Новое сообщение готово к показу снизу.";
}

export function buildStream113ELiveRoomSurfaceUiuxEvidence(
  state: Stream113ELiveRoomSurfaceUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  phoneCleanup: Stream113DLiveRoomPhoneUiCleanupEvidence,
): Stream113ELiveRoomSurfaceUiuxEvidence {
  const providerBoundaryReady = room.integration.fakeOnAirAllowed === false
    && room.integration.fakeProviderAllowed === false
    && room.integration.fakePaymentAllowed === false
    && stage.integration.fakeOnAirAllowed === false
    && stage.integration.fakeProviderAllowed === false
    && phoneCleanup.fakeLiveAllowed === false
    && phoneCleanup.fakePaymentAllowed === false;
  const hasVideoCanvas = room.broadcast.source !== null || stage.requestedSource !== null || phoneCleanup.localUxReady;
  const hasAudience = room.participants.filter((participant) => !participant.blocked).length > 0;
  const hasBottomChat = stage.commentsVisible && phoneCleanup.cleanPhoneMode;
  const hasSideActions = stage.participantsVisible || stage.cohostRailVisible || stage.battleOverlayVisible || hasReviewed(state, "side_actions");

  const sections: readonly Stream113ELiveRoomSurfaceSection[] = [
    section("hero_status", phoneCleanup.cleanPhoneMode || hasReviewed(state, "hero_status"), "Верхний статус короткий: режим, готовность, люди и честный блокер без длинной простыни проверки."),
    section("video_canvas", hasVideoCanvas || hasReviewed(state, "video_canvas"), "Видео/предпросмотр занимает главный фокус, панели не выглядят важнее эфира."),
    section("side_actions", hasSideActions || hasReviewed(state, "side_actions"), "Справа остаются только быстрые действия: люди, соведущий, дуэль, поделиться."),
    section("bottom_chat", hasBottomChat || hasReviewed(state, "bottom_chat"), "Чат закреплён как нижний компонент эфира, а не отдельная тестовая секция."),
    section("audience_rail", hasAudience || hasReviewed(state, "audience_rail"), "Участники и соведущий читаются как боковая лента рядом с эфиром."),
    section("honest_boundary", providerBoundaryReady || hasReviewed(state, "honest_boundary"), "Провайдер, реальное время и платежи честно заблокированы; фейковый эфир не разрешён."),
    section("one_thumb_flow", phoneCleanup.localUxReady || hasReviewed(state, "one_thumb_flow"), "Главные действия доступны одной рукой: чат → люди → соведущий → дуэль → поделиться."),
  ];

  const readySections = sections.filter((item) => item.status === "premium_local").length;
  const totalSections = sections.length;
  const premiumScore = Math.round((readySections / totalSections) * 100);
  const next = sections.find((item) => item.status === "needs_review");
  const activePeople = room.participants.filter((participant) => !participant.blocked).length;
  const focusedLabel = FOCUS_LABELS[state.focusedFlow];
  const heroStatus = providerBoundaryReady
    ? `${room.status} · ${activePeople} people · provider blocked честно`
    : `${room.status} · требуется честная граница провайдера`;

  return {
    version: "STREAM-113E",
    selectedSectionId: state.selectedSectionId,
    focusedFlow: state.focusedFlow,
    premiumScore,
    readySections,
    totalSections,
    sections,
    heroStatus,
    heroNarrative: `Фокус экрана: ${focusedLabel}. Live-room surface должен ощущаться как эфир, а не как debug-панель.`,
    videoCanvasTitle: room.title.trim() || "Комната эфира Sabi Stream",
    videoCanvasSubtitle: stage.requestedSource ? `Источник: ${stage.requestedSource} · layout: ${stage.layout}` : "Выберите источник перед реальным эфиром",
    bottomChatPreview: latestVisibleComment(room),
    audienceSummary: `${activePeople} активных · ${room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length} co-host · ${room.participants.filter((participant) => participant.blocked).length} blocked`,
    primaryAction: next ? `${next.title}: ${next.note}` : "113E экран UI/UX локально закрыт. Дальше можно полировать экран зрителя до эфира и во время эфира.",
    secondaryAction: state.lastAction,
    localUxReady: readySections === totalSections && phoneCleanup.cleanPhoneMode,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
