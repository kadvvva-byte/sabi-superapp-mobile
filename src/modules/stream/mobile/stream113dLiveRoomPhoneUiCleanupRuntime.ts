import type { Stream113ALiveRoomUx100Evidence } from "./stream113aLiveRoomUx100Runtime";
import type { Stream113BPeopleCohostBattleUxEvidence } from "./stream113bPeopleCohostBattleUxRuntime";
import type { Stream113CLiveRoomLifecycleUiuxEvidence } from "./stream113cLiveRoomLifecycleUiuxRuntime";
import type { StreamRoomRuntimeState } from "./streamRoomRuntime";

export type Stream113DPhoneUiSectionId =
  | "clean_first_screen"
  | "hero_hierarchy"
  | "action_focus"
  | "technical_hidden"
  | "safe_boundary"
  | "phone_spacing";

export type Stream113DPhoneUiSectionStatus = "premium_local" | "needs_review";

export type Stream113DPhoneUiSection = {
  readonly id: Stream113DPhoneUiSectionId;
  readonly title: string;
  readonly note: string;
  readonly status: Stream113DPhoneUiSectionStatus;
};

export type Stream113DLiveRoomPhoneUiCleanupState = {
  readonly version: "STREAM-113D";
  readonly selectedSectionId: Stream113DPhoneUiSectionId;
  readonly reviewedSectionIds: readonly Stream113DPhoneUiSectionId[];
  readonly technicalPanelsVisible: boolean;
  readonly lastAction: string;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113DLiveRoomPhoneUiCleanupEvidence = {
  readonly version: "STREAM-113D";
  readonly selectedSectionId: Stream113DPhoneUiSectionId;
  readonly premiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly cleanPhoneMode: boolean;
  readonly technicalPanelsVisible: boolean;
  readonly sections: readonly Stream113DPhoneUiSection[];
  readonly topNarrative: string;
  readonly nextPrimaryAction: string;
  readonly localUxReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SECTION_ORDER: readonly Stream113DPhoneUiSectionId[] = [
  "clean_first_screen",
  "hero_hierarchy",
  "action_focus",
  "technical_hidden",
  "safe_boundary",
  "phone_spacing",
];

const SECTION_TITLES: Record<Stream113DPhoneUiSectionId, string> = {
  clean_first_screen: "Чистый первый экран",
  hero_hierarchy: "Иерархия ведущего",
  action_focus: "Фокус действий",
  technical_hidden: "Техпанели скрыты",
  safe_boundary: "Честная граница",
  phone_spacing: "Телефонные отступы",
};

export function createInitialStream113DLiveRoomPhoneUiCleanupState(): Stream113DLiveRoomPhoneUiCleanupState {
  return {
    version: "STREAM-113D",
    selectedSectionId: "clean_first_screen",
    reviewedSectionIds: ["clean_first_screen", "technical_hidden"],
    technicalPanelsVisible: false,
    lastAction: "113D чистый телефонный режим включён по умолчанию: панели проверки и доказательств скрыты из главного UX.",
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113DPhoneUiSection(
  state: Stream113DLiveRoomPhoneUiCleanupState,
  sectionId: Stream113DPhoneUiSectionId,
): Stream113DLiveRoomPhoneUiCleanupState {
  return { ...state, selectedSectionId: sectionId };
}

export function markStream113DPhoneUiSectionReviewed(
  state: Stream113DLiveRoomPhoneUiCleanupState,
  sectionId: Stream113DPhoneUiSectionId,
  action: string,
): Stream113DLiveRoomPhoneUiCleanupState {
  const reviewedSectionIds = state.reviewedSectionIds.includes(sectionId)
    ? state.reviewedSectionIds
    : [...state.reviewedSectionIds, sectionId];
  return { ...state, selectedSectionId: sectionId, reviewedSectionIds, lastAction: action };
}

export function markStream113DPhoneUiAllReviewed(
  state: Stream113DLiveRoomPhoneUiCleanupState,
  action: string,
): Stream113DLiveRoomPhoneUiCleanupState {
  return { ...state, selectedSectionId: "phone_spacing", reviewedSectionIds: SECTION_ORDER, technicalPanelsVisible: false, lastAction: action };
}

export function setStream113DTechnicalPanelsVisible(
  state: Stream113DLiveRoomPhoneUiCleanupState,
  visible: boolean,
): Stream113DLiveRoomPhoneUiCleanupState {
  return {
    ...state,
    technicalPanelsVisible: visible,
    selectedSectionId: "technical_hidden",
    reviewedSectionIds: visible ? state.reviewedSectionIds : Array.from(new Set([...state.reviewedSectionIds, "technical_hidden"])),
    lastAction: visible
      ? "Технические панели открыты вручную только для проверки. Основной телефонный UX остаётся чистым."
      : "Технические панели снова скрыты: основной Stream UX без проверочного/служебного мусора.",
  };
}

function section(
  id: Stream113DPhoneUiSectionId,
  ready: boolean,
  note: string,
): Stream113DPhoneUiSection {
  return { id, title: SECTION_TITLES[id], note, status: ready ? "premium_local" : "needs_review" };
}

function hasReviewed(state: Stream113DLiveRoomPhoneUiCleanupState, id: Stream113DPhoneUiSectionId): boolean {
  return state.reviewedSectionIds.includes(id);
}

export function buildStream113DLiveRoomPhoneUiCleanupEvidence(
  state: Stream113DLiveRoomPhoneUiCleanupState,
  room: StreamRoomRuntimeState,
  liveUx: Stream113ALiveRoomUx100Evidence,
  peopleUx: Stream113BPeopleCohostBattleUxEvidence,
  lifecycleUx: Stream113CLiveRoomLifecycleUiuxEvidence,
): Stream113DLiveRoomPhoneUiCleanupEvidence {
  const cleanPhoneMode = !state.technicalPanelsVisible;
  const safeBoundaryReady = room.integration.fakeOnAirAllowed === false
    && room.integration.fakeProviderAllowed === false
    && room.integration.fakePaymentAllowed === false
    && liveUx.fakeLiveAllowed === false
    && peopleUx.fakeLiveAllowed === false
    && lifecycleUx.fakeLiveAllowed === false;

  const sections: readonly Stream113DPhoneUiSection[] = [
    section("clean_first_screen", cleanPhoneMode || hasReviewed(state, "clean_first_screen"), cleanPhoneMode ? "Первый экран показывает премиум-путь эфира, а не длинную простыню проверки." : "Включите чистый режим, чтобы скрыть технический шум."),
    section("hero_hierarchy", liveUx.premiumScore >= 70 || hasReviewed(state, "hero_hierarchy"), "Верхняя иерархия ведёт пользователя: комната эфира → люди → жизненный цикл."),
    section("action_focus", peopleUx.premiumScore >= 70 || hasReviewed(state, "action_focus"), "Основные действия сгруппированы по смыслу: чат, участники, соведущий, дуэль, поделиться."),
    section("technical_hidden", cleanPhoneMode || hasReviewed(state, "technical_hidden"), cleanPhoneMode ? "Панели 112N, доказательств и статуса спрятаны из обычного UX." : "Техпанели открыты вручную — это режим проверки, не основной экран."),
    section("safe_boundary", safeBoundaryReady || hasReviewed(state, "safe_boundary"), "Провайдер, реальное время и платежи остаются честно заблокированы, фейковый эфир не включается."),
    section("phone_spacing", lifecycleUx.premiumScore >= 70 || hasReviewed(state, "phone_spacing"), "Карточки и кнопки идут вертикально, прокрутка не обрезает экран телефона."),
  ];

  const readySections = sections.filter((item) => item.status === "premium_local").length;
  const totalSections = sections.length;
  const premiumScore = Math.round((readySections / totalSections) * 100);
  const next = sections.find((item) => item.status === "needs_review");
  const topNarrative = cleanPhoneMode
    ? "113D чистый телефонный режим: Stream выглядит как продуктовая комната эфира, а не как тестовая лаборатория."
    : "Технические панели открыты вручную для проверки; перед UX-проверкой верните чистый режим.";

  return {
    version: "STREAM-113D",
    selectedSectionId: state.selectedSectionId,
    premiumScore,
    readySections,
    totalSections,
    cleanPhoneMode,
    technicalPanelsVisible: state.technicalPanelsVisible,
    sections,
    topNarrative,
    nextPrimaryAction: next ? `${next.title}: ${next.note}` : "113D телефонный UI/UX локально закрыт. Дальше можно полировать сам экран эфира без проверочного мусора.",
    localUxReady: readySections === totalSections && cleanPhoneMode,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
