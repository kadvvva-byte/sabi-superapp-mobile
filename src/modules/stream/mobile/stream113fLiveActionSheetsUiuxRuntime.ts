import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113ELiveRoomSurfaceFocus, Stream113ELiveRoomSurfaceUiuxEvidence } from "./stream113eLiveRoomSurfaceUiuxRuntime";

export type Stream113FLiveActionSheetId =
  | "chat_sheet"
  | "people_sheet"
  | "cohost_sheet"
  | "battle_sheet"
  | "share_sheet"
  | "safe_boundary";

export type Stream113FLiveActionSheetStatus = "premium_local" | "needs_review";

export type Stream113FLiveActionSheetCard = {
  readonly id: Stream113FLiveActionSheetId;
  readonly title: string;
  readonly subtitle: string;
  readonly primary: string;
  readonly status: Stream113FLiveActionSheetStatus;
};

export type Stream113FLiveActionSheetsUiuxState = {
  readonly version: "STREAM-113F";
  readonly selectedSheetId: Stream113FLiveActionSheetId;
  readonly reviewedSheetIds: readonly Stream113FLiveActionSheetId[];
  readonly focusedFlow: Stream113ELiveRoomSurfaceFocus;
  readonly lastAction: string;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113FLiveActionSheetsUiuxEvidence = {
  readonly version: "STREAM-113F";
  readonly selectedSheetId: Stream113FLiveActionSheetId;
  readonly focusedFlow: Stream113ELiveRoomSurfaceFocus;
  readonly premiumScore: number;
  readonly readySheets: number;
  readonly totalSheets: number;
  readonly sheetCards: readonly Stream113FLiveActionSheetCard[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly activeSheetTitle: string;
  readonly activeSheetBody: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly oneHandReady: boolean;
  readonly productUiReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SHEET_ORDER: readonly Stream113FLiveActionSheetId[] = [
  "chat_sheet",
  "people_sheet",
  "cohost_sheet",
  "battle_sheet",
  "share_sheet",
  "safe_boundary",
];

const SHEET_TITLES: Record<Stream113FLiveActionSheetId, string> = {
  chat_sheet: "Чат",
  people_sheet: "Люди",
  cohost_sheet: "Соведущий",
  battle_sheet: "Дуэль",
  share_sheet: "Поделиться",
  safe_boundary: "Границы",
};

const FLOW_TO_SHEET: Record<Stream113ELiveRoomSurfaceFocus, Stream113FLiveActionSheetId> = {
  chat: "chat_sheet",
  people: "people_sheet",
  cohost: "cohost_sheet",
  battle: "battle_sheet",
  share: "share_sheet",
};

const SHEET_COPY: Record<Stream113FLiveActionSheetId, { readonly subtitle: string; readonly primary: string }> = {
  chat_sheet: {
    subtitle: "Нижний редактор, быстрый ответ и закреплённая подсказка без перекрытия видео.",
    primary: "Открыть чат снизу",
  },
  people_sheet: {
    subtitle: "Участники читаются как зрительская лента эфира с модерацией и статусами рядом.",
    primary: "Показать людей",
  },
  cohost_sheet: {
    subtitle: "Приглашение и принятие соведущего выглядят как сценический путь, а не служебное действие.",
    primary: "Поднять соведущего",
  },
  battle_sheet: {
    subtitle: "Дуэль открывается отдельной нижней панелью с честной границей провайдера.",
    primary: "Открыть дуэль",
  },
  share_sheet: {
    subtitle: "Поделиться запускается через системное окно и не обещает фейковый эфир/провайдера.",
    primary: "Поделиться эфиром",
  },
  safe_boundary: {
    subtitle: "Эфир, реальное время, провайдер и платежи остаются честно заблокированы до настоящего backend/провайдера.",
    primary: "Проверить безопасность",
  },
};

export function createInitialStream113FLiveActionSheetsUiuxState(): Stream113FLiveActionSheetsUiuxState {
  return {
    version: "STREAM-113F",
    selectedSheetId: "chat_sheet",
    reviewedSheetIds: ["chat_sheet", "safe_boundary"],
    focusedFlow: "chat",
    lastAction: "113F начал превращать быстрые действия комнаты эфира в продуктовые нижние панели.",
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113FLiveActionSheet(
  state: Stream113FLiveActionSheetsUiuxState,
  selectedSheetId: Stream113FLiveActionSheetId,
): Stream113FLiveActionSheetsUiuxState {
  return { ...state, selectedSheetId };
}

export function focusStream113FLiveActionSheetFlow(
  state: Stream113FLiveActionSheetsUiuxState,
  focusedFlow: Stream113ELiveRoomSurfaceFocus,
  action: string,
): Stream113FLiveActionSheetsUiuxState {
  return markStream113FLiveActionSheetReviewed({ ...state, focusedFlow }, FLOW_TO_SHEET[focusedFlow], action);
}

export function markStream113FLiveActionSheetReviewed(
  state: Stream113FLiveActionSheetsUiuxState,
  sheetId: Stream113FLiveActionSheetId,
  action: string,
): Stream113FLiveActionSheetsUiuxState {
  const reviewedSheetIds = state.reviewedSheetIds.includes(sheetId)
    ? state.reviewedSheetIds
    : [...state.reviewedSheetIds, sheetId];
  return { ...state, selectedSheetId: sheetId, reviewedSheetIds, lastAction: action };
}

export function markStream113FLiveActionSheetsAllReviewed(
  state: Stream113FLiveActionSheetsUiuxState,
  action: string,
): Stream113FLiveActionSheetsUiuxState {
  return { ...state, selectedSheetId: "share_sheet", reviewedSheetIds: SHEET_ORDER, focusedFlow: "share", lastAction: action };
}

function reviewed(state: Stream113FLiveActionSheetsUiuxState, sheetId: Stream113FLiveActionSheetId): boolean {
  return state.reviewedSheetIds.includes(sheetId);
}

function card(
  id: Stream113FLiveActionSheetId,
  state: Stream113FLiveActionSheetsUiuxState,
  ready: boolean,
): Stream113FLiveActionSheetCard {
  const copy = SHEET_COPY[id];
  return {
    id,
    title: SHEET_TITLES[id],
    subtitle: copy.subtitle,
    primary: copy.primary,
    status: ready || reviewed(state, id) ? "premium_local" : "needs_review",
  };
}

function activeBody(sheetId: Stream113FLiveActionSheetId, room: StreamRoomRuntimeState, stage: StreamRoomStageRuntimeState): string {
  const activePeople = room.participants.filter((participant) => !participant.blocked).length;
  const cohosts = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  if (sheetId === "chat_sheet") return stage.commentsVisible ? "Чат закреплён снизу и готов к быстрым ответам." : "Чат надо вернуть в нижнюю зону эфира.";
  if (sheetId === "people_sheet") return `${activePeople} активных людей · лента должна открываться без перекрытия видео-поля.`;
  if (sheetId === "cohost_sheet") return `${cohosts} co-host · приглашение должно вести к сцене, не к тестовой панели.`;
  if (sheetId === "battle_sheet") return stage.battleOverlayVisible ? "Дуэль открыта как оверлей с честным блокером провайдера." : "Дуэль должна открываться отдельной панелью действий.";
  if (sheetId === "share_sheet") return "Системное окно «Поделиться» готовится как безопасное действие без фейкового провайдера/эфира.";
  return "Фейковый эфир, фейковое реальное время, фейковый провайдер, фейковые платежи и смешивание с кино остаются запрещены.";
}

export function buildStream113FLiveActionSheetsUiuxEvidence(
  state: Stream113FLiveActionSheetsUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  surface: Stream113ELiveRoomSurfaceUiuxEvidence,
): Stream113FLiveActionSheetsUiuxEvidence {
  const activePeople = room.participants.filter((participant) => !participant.blocked).length;
  const hasCohost = room.participants.some((participant) => participant.role === "cohost" && !participant.blocked);
  const hasBattle = stage.battleOverlayVisible || reviewed(state, "battle_sheet");
  const safeBoundaryReady = surface.fakeLiveAllowed === false
    && surface.fakeRealtimeAllowed === false
    && surface.fakeProviderAllowed === false
    && surface.fakePaymentAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false;

  const sheetCards: readonly Stream113FLiveActionSheetCard[] = [
    card("chat_sheet", state, stage.commentsVisible && surface.localUxReady),
    card("people_sheet", state, stage.participantsVisible && activePeople > 0),
    card("cohost_sheet", state, stage.cohostRailVisible || hasCohost),
    card("battle_sheet", state, hasBattle),
    card("share_sheet", state, surface.focusedFlow === "share" || reviewed(state, "share_sheet")),
    card("safe_boundary", state, safeBoundaryReady),
  ];

  const readySheets = sheetCards.filter((item) => item.status === "premium_local").length;
  const totalSheets = sheetCards.length;
  const premiumScore = Math.round((readySheets / totalSheets) * 100);
  const next = sheetCards.find((item) => item.status === "needs_review");
  const active = sheetCards.find((item) => item.id === state.selectedSheetId) ?? sheetCards[0];

  return {
    version: "STREAM-113F",
    selectedSheetId: state.selectedSheetId,
    focusedFlow: state.focusedFlow,
    premiumScore,
    readySheets,
    totalSheets,
    sheetCards,
    heroTitle: "Быстрые действия как премиальные нижние панели",
    heroSubtitle: "Чат, люди, соведущий, дуэль и «Поделиться» должны открываться понятным продуктовым путём одной рукой.",
    activeSheetTitle: active.title,
    activeSheetBody: activeBody(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.primary}` : "113F панели действий локально закрыты. Дальше можно полировать UX зрителя до эфира и во время эфира.",
    secondaryAction: state.lastAction,
    oneHandReady: readySheets >= 5 && surface.localUxReady,
    productUiReady: readySheets === totalSheets && surface.localUxReady,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
