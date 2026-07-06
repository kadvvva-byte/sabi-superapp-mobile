import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113JProductLanguageHierarchyUiuxEvidence } from "./stream113jProductLanguageHierarchyUiuxRuntime";

export type Stream113KMobileDensitySectionId =
  | "top_priority"
  | "card_density"
  | "scroll_order"
  | "action_rhythm"
  | "small_phone"
  | "technical_fold";

export type Stream113KMobileDensitySectionStatus = "premium_compact" | "needs_density_pass";

export type Stream113KMobileDensitySection = {
  readonly id: Stream113KMobileDensitySectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113KMobileDensitySectionStatus;
};

export type Stream113KMobileDensityScrollUiuxState = {
  readonly version: "STREAM-113K";
  readonly selectedSectionId: Stream113KMobileDensitySectionId;
  readonly polishedSectionIds: readonly Stream113KMobileDensitySectionId[];
  readonly lastAction: string;
  readonly compactModeLockedLocal: boolean;
  readonly longScrollTamedLocal: boolean;
  readonly technicalPanelsFoldedLocal: boolean;
  readonly oneThumbPriorityLockedLocal: boolean;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113KMobileDensityScrollUiuxEvidence = {
  readonly version: "STREAM-113K";
  readonly selectedSectionId: Stream113KMobileDensitySectionId;
  readonly premiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sections: readonly Stream113KMobileDensitySection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly densitySummary: string;
  readonly foldSummary: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly oneScreenPriorityReady: boolean;
  readonly longScrollReady: boolean;
  readonly compactPhoneReady: boolean;
  readonly productUiReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SECTION_ORDER: readonly Stream113KMobileDensitySectionId[] = [
  "top_priority",
  "card_density",
  "scroll_order",
  "action_rhythm",
  "small_phone",
  "technical_fold",
];

const SECTION_TITLES: Record<Stream113KMobileDensitySectionId, string> = {
  top_priority: "Первый экран",
  card_density: "Плотность карточек",
  scroll_order: "Порядок прокрутки",
  action_rhythm: "Ритм действий",
  small_phone: "Маленький телефон",
  technical_fold: "Техпанели сложены",
};

const SECTION_DESCRIPTIONS: Record<Stream113KMobileDensitySectionId, string> = {
  top_priority: "Верх экрана показывает только главное: статус эфира, следующий шаг и честную границу провайдера.",
  card_density: "Карточки короткие, без длинных текстов проверки и без ощущения тяжёлого отчёта.",
  scroll_order: "Прокрутка идёт от продукта к деталям: главный блок, телефонный предпросмотр, действия, люди, затем техпанели только вручную.",
  action_rhythm: "Кнопки сгруппированы по смыслу и не конкурируют между собой на одном уровне.",
  small_phone: "Тексты, кнопки и карточки не требуют широкого экрана и остаются читаемыми одной рукой.",
  technical_fold: "Доказательства и служебные данные остаются доступными, но не видны в обычном UX комнаты эфира.",
};

export function createInitialStream113KMobileDensityScrollUiuxState(): Stream113KMobileDensityScrollUiuxState {
  return {
    version: "STREAM-113K",
    selectedSectionId: "top_priority",
    polishedSectionIds: ["technical_fold"],
    lastAction: "113K начал финальную мобильную плотность: меньше перегруза, правильная прокрутка, техпанели сложены.",
    compactModeLockedLocal: true,
    longScrollTamedLocal: false,
    technicalPanelsFoldedLocal: true,
    oneThumbPriorityLockedLocal: true,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113KMobileDensitySection(
  state: Stream113KMobileDensityScrollUiuxState,
  selectedSectionId: Stream113KMobileDensitySectionId,
): Stream113KMobileDensityScrollUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113K section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113KMobileDensitySectionPolished(
  state: Stream113KMobileDensityScrollUiuxState,
  sectionId: Stream113KMobileDensitySectionId,
  action: string,
): Stream113KMobileDensityScrollUiuxState {
  const polishedSectionIds = state.polishedSectionIds.includes(sectionId)
    ? state.polishedSectionIds
    : [...state.polishedSectionIds, sectionId];
  return {
    ...state,
    selectedSectionId: sectionId,
    polishedSectionIds,
    lastAction: action,
    compactModeLockedLocal: state.compactModeLockedLocal || sectionId === "card_density" || sectionId === "small_phone",
    longScrollTamedLocal: state.longScrollTamedLocal || sectionId === "scroll_order",
    technicalPanelsFoldedLocal: state.technicalPanelsFoldedLocal || sectionId === "technical_fold",
    oneThumbPriorityLockedLocal: state.oneThumbPriorityLockedLocal || sectionId === "top_priority" || sectionId === "action_rhythm",
  };
}

export function markStream113KMobileDensityAllPolished(
  state: Stream113KMobileDensityScrollUiuxState,
  action: string,
): Stream113KMobileDensityScrollUiuxState {
  return {
    ...state,
    selectedSectionId: "technical_fold",
    polishedSectionIds: SECTION_ORDER,
    lastAction: action,
    compactModeLockedLocal: true,
    longScrollTamedLocal: true,
    technicalPanelsFoldedLocal: true,
    oneThumbPriorityLockedLocal: true,
  };
}

function polished(state: Stream113KMobileDensityScrollUiuxState, sectionId: Stream113KMobileDensitySectionId): boolean {
  return state.polishedSectionIds.includes(sectionId);
}

function sectionItem(
  id: Stream113KMobileDensitySectionId,
  runtime: Stream113KMobileDensityScrollUiuxState,
  ready: boolean,
): Stream113KMobileDensitySection {
  return {
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: ready || polished(runtime, id) ? "premium_compact" : "needs_density_pass",
  };
}

function activeNarrative(
  id: Stream113KMobileDensitySectionId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "top_priority") return "Первый экран должен сразу объяснять эфир, состояние и следующий безопасный шаг без лишних блоков.";
  if (id === "card_density") return "Плотность карточек должна быть премиальной: короткие строки, меньше повторов, больше воздуха.";
  if (id === "scroll_order") return `Порядок scroll сохраняет путь ${stage.layout}: hero → preview → actions → people → details.`;
  if (id === "action_rhythm") return "Действия идут группами: подготовка, экран эфира, люди, дуэль/поделиться, безопасная граница.";
  if (id === "small_phone") return `Комната ${room.roomId} должна быть читаемой на маленьком телефоне без горизонтального мышления.`;
  return "Техпанели остаются доступными только вручную, чтобы обычный пользователь не видел проверки, доказательства и служебные данные.";
}

export function buildStream113KMobileDensityScrollUiuxEvidence(
  state: Stream113KMobileDensityScrollUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  productLanguage: Stream113JProductLanguageHierarchyUiuxEvidence,
): Stream113KMobileDensityScrollUiuxEvidence {
  const safeBoundaryReady = productLanguage.fakeLiveAllowed === false
    && productLanguage.fakeRealtimeAllowed === false
    && productLanguage.fakeProviderAllowed === false
    && productLanguage.fakePaymentAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false;

  const sections: readonly Stream113KMobileDensitySection[] = [
    sectionItem("top_priority", state, state.oneThumbPriorityLockedLocal && productLanguage.productLanguageReady),
    sectionItem("card_density", state, state.compactModeLockedLocal && productLanguage.premiumScore >= 80),
    sectionItem("scroll_order", state, state.longScrollTamedLocal),
    sectionItem("action_rhythm", state, state.oneThumbPriorityLockedLocal && polished(state, "action_rhythm")),
    sectionItem("small_phone", state, state.compactModeLockedLocal && polished(state, "small_phone")),
    sectionItem("technical_fold", state, state.technicalPanelsFoldedLocal && safeBoundaryReady),
  ];

  const readySections = sections.filter((item) => item.status === "premium_compact").length;
  const totalSections = sections.length;
  const premiumScore = Math.round((readySections / totalSections) * 100);
  const next = sections.find((item) => item.status === "needs_density_pass");
  const active = sections.find((item) => item.id === state.selectedSectionId) ?? sections[0];

  return {
    version: "STREAM-113K",
    selectedSectionId: state.selectedSectionId,
    premiumScore,
    readySections,
    totalSections,
    sections,
    heroTitle: "Чистка мобильной плотности и порядка прокрутки",
    heroSubtitle: "Финальный проход по плотности настроек эфира: меньше перегруза, правильный порядок блоков, чистый телефонный режим и удобство одной рукой.",
    phoneStatus: `${room.status} · compact live settings · ${productLanguage.premiumScore}% product`,
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    densitySummary: "Главный блок → телефонный предпросмотр → основные действия → люди/соведущий/дуэль → детали только при необходимости",
    foldSummary: state.technicalPanelsFoldedLocal ? "Техпанели сложены. Обычный Stream UX остаётся чистым." : "Нужно снова сложить техпанели и убрать проверки из основной прокрутки.",
    primaryAction: next ? `${next.title}: ${next.description}` : "113K проход плотности закрыт. Дальше можно финально полировать визуал комнаты эфира / Shorts без перегруза.",
    secondaryAction: state.lastAction,
    oneScreenPriorityReady: state.oneThumbPriorityLockedLocal && productLanguage.productLanguageReady,
    longScrollReady: state.longScrollTamedLocal,
    compactPhoneReady: state.compactModeLockedLocal && readySections >= 5,
    productUiReady: readySections === totalSections && productLanguage.cleanProductUiReady,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
