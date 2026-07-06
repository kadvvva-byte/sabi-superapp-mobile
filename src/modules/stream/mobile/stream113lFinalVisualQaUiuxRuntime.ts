import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113KMobileDensityScrollUiuxEvidence } from "./stream113kMobileDensityScrollUiuxRuntime";

export type Stream113LFinalVisualQaSectionId =
  | "hero_surface"
  | "stack_order"
  | "tap_targets"
  | "copy_tone"
  | "small_phone"
  | "safe_boundary";

export type Stream113LFinalVisualQaSectionStatus = "visual_locked" | "needs_visual_pass";

export type Stream113LFinalVisualQaSection = {
  readonly id: Stream113LFinalVisualQaSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113LFinalVisualQaSectionStatus;
};

export type Stream113LFinalVisualQaUiuxState = {
  readonly version: "STREAM-113L";
  readonly selectedSectionId: Stream113LFinalVisualQaSectionId;
  readonly lockedSectionIds: readonly Stream113LFinalVisualQaSectionId[];
  readonly lastAction: string;
  readonly phoneSurfaceLockedLocal: boolean;
  readonly scrollStackLockedLocal: boolean;
  readonly tapTargetsLockedLocal: boolean;
  readonly productCopyLockedLocal: boolean;
  readonly smallPhoneLockedLocal: boolean;
  readonly technicalPanelsHiddenLocal: boolean;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113LFinalVisualQaUiuxEvidence = {
  readonly version: "STREAM-113L";
  readonly selectedSectionId: Stream113LFinalVisualQaSectionId;
  readonly premiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sections: readonly Stream113LFinalVisualQaSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly visualSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly cleanMainUxReady: boolean;
  readonly noOverlapReady: boolean;
  readonly phoneVisualQaReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SECTION_ORDER: readonly Stream113LFinalVisualQaSectionId[] = [
  "hero_surface",
  "stack_order",
  "tap_targets",
  "copy_tone",
  "small_phone",
  "safe_boundary",
];

const SECTION_TITLES: Record<Stream113LFinalVisualQaSectionId, string> = {
  hero_surface: "Главный экран",
  stack_order: "Порядок блоков",
  tap_targets: "Кнопки без наложений",
  copy_tone: "Продуктовый текст",
  small_phone: "Маленький телефон",
  safe_boundary: "Честная граница",
};

const SECTION_DESCRIPTIONS: Record<Stream113LFinalVisualQaSectionId, string> = {
  hero_surface: "Настройки эфира открываются как продуктовый Stream-экран: статус, телефонный предпросмотр, следующий шаг и безопасная граница.",
  stack_order: "Сначала виден премиальный UX, затем действия и только потом сложенные технические детали.",
  tap_targets: "Основные кнопки читаются одной рукой, не налезают друг на друга и не конкурируют визуально.",
  copy_tone: "На главном пути нет проверочного или служебного языка; пользователь видит понятный продуктовый текст.",
  small_phone: "Карточки, кнопки и предпросмотр остаются читаемыми на узком Android-экране.",
  safe_boundary: "Фейковый эфир, фейковое реальное время, фейковый провайдер, фейковые платежи и смешивание кино/аниме остаются запрещены.",
};

export function createInitialStream113LFinalVisualQaUiuxState(): Stream113LFinalVisualQaUiuxState {
  return {
    version: "STREAM-113L",
    selectedSectionId: "hero_surface",
    lockedSectionIds: ["safe_boundary"],
    lastAction: "113L начал финальную визуальную проверку: главный Stream UX должен выглядеть цельно, чисто и без служебных панелей.",
    phoneSurfaceLockedLocal: true,
    scrollStackLockedLocal: false,
    tapTargetsLockedLocal: false,
    productCopyLockedLocal: true,
    smallPhoneLockedLocal: false,
    technicalPanelsHiddenLocal: true,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113LFinalVisualQaSection(
  state: Stream113LFinalVisualQaUiuxState,
  selectedSectionId: Stream113LFinalVisualQaSectionId,
): Stream113LFinalVisualQaUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113L visual section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113LFinalVisualQaSectionLocked(
  state: Stream113LFinalVisualQaUiuxState,
  sectionId: Stream113LFinalVisualQaSectionId,
  action: string,
): Stream113LFinalVisualQaUiuxState {
  const lockedSectionIds = state.lockedSectionIds.includes(sectionId)
    ? state.lockedSectionIds
    : [...state.lockedSectionIds, sectionId];
  return {
    ...state,
    selectedSectionId: sectionId,
    lockedSectionIds,
    lastAction: action,
    phoneSurfaceLockedLocal: state.phoneSurfaceLockedLocal || sectionId === "hero_surface",
    scrollStackLockedLocal: state.scrollStackLockedLocal || sectionId === "stack_order",
    tapTargetsLockedLocal: state.tapTargetsLockedLocal || sectionId === "tap_targets",
    productCopyLockedLocal: state.productCopyLockedLocal || sectionId === "copy_tone",
    smallPhoneLockedLocal: state.smallPhoneLockedLocal || sectionId === "small_phone",
    technicalPanelsHiddenLocal: state.technicalPanelsHiddenLocal || sectionId === "safe_boundary" || sectionId === "stack_order",
  };
}

export function markStream113LFinalVisualQaAllLocked(
  state: Stream113LFinalVisualQaUiuxState,
  action: string,
): Stream113LFinalVisualQaUiuxState {
  return {
    ...state,
    selectedSectionId: "safe_boundary",
    lockedSectionIds: SECTION_ORDER,
    lastAction: action,
    phoneSurfaceLockedLocal: true,
    scrollStackLockedLocal: true,
    tapTargetsLockedLocal: true,
    productCopyLockedLocal: true,
    smallPhoneLockedLocal: true,
    technicalPanelsHiddenLocal: true,
  };
}

function locked(state: Stream113LFinalVisualQaUiuxState, sectionId: Stream113LFinalVisualQaSectionId): boolean {
  return state.lockedSectionIds.includes(sectionId);
}

function sectionItem(
  id: Stream113LFinalVisualQaSectionId,
  state: Stream113LFinalVisualQaUiuxState,
  ready: boolean,
): Stream113LFinalVisualQaSection {
  return {
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: ready || locked(state, id) ? "visual_locked" : "needs_visual_pass",
  };
}

function activeNarrative(
  id: Stream113LFinalVisualQaSectionId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "hero_surface") return `Комната ${room.roomId} должна открываться с чистым premium Stream hero, без лишнего лабораторного шума.`;
  if (id === "stack_order") return `Порядок ${stage.layout}: главный UX сверху, технические детали только после явного открытия.`;
  if (id === "tap_targets") return "Кнопки должны быть короткими, понятными и достаточно разнесёнными для управления одной рукой.";
  if (id === "copy_tone") return "Текст должен звучать как продукт: что видит ведущий, что делать дальше, почему эфир честно заблокирован до провайдера.";
  if (id === "small_phone") return "На маленьком телефоне нельзя заставлять пользователя читать длинный отчёт проверки до основного сценария.";
  return "Stream остаётся честным: никаких фейковых эфиров, реального времени, провайдера, платежей и никаких кино/аниме блоков в комнате эфира.";
}

export function buildStream113LFinalVisualQaUiuxEvidence(
  state: Stream113LFinalVisualQaUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  mobileDensity: Stream113KMobileDensityScrollUiuxEvidence,
): Stream113LFinalVisualQaUiuxEvidence {
  const safeBoundaryReady = state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false
    && mobileDensity.fakeLiveAllowed === false
    && mobileDensity.fakeRealtimeAllowed === false
    && mobileDensity.fakeProviderAllowed === false
    && mobileDensity.fakePaymentAllowed === false;

  const sections: readonly Stream113LFinalVisualQaSection[] = [
    sectionItem("hero_surface", state, state.phoneSurfaceLockedLocal && mobileDensity.productUiReady),
    sectionItem("stack_order", state, state.scrollStackLockedLocal && mobileDensity.longScrollReady),
    sectionItem("tap_targets", state, state.tapTargetsLockedLocal),
    sectionItem("copy_tone", state, state.productCopyLockedLocal && mobileDensity.premiumScore >= 80),
    sectionItem("small_phone", state, state.smallPhoneLockedLocal && mobileDensity.compactPhoneReady),
    sectionItem("safe_boundary", state, state.technicalPanelsHiddenLocal && safeBoundaryReady),
  ];

  const readySections = sections.filter((item) => item.status === "visual_locked").length;
  const totalSections = sections.length;
  const premiumScore = Math.round((readySections / totalSections) * 100);
  const next = sections.find((item) => item.status === "needs_visual_pass");
  const active = sections.find((item) => item.id === state.selectedSectionId) ?? sections[0];

  return {
    version: "STREAM-113L",
    selectedSectionId: state.selectedSectionId,
    premiumScore,
    readySections,
    totalSections,
    sections,
    heroTitle: "Финальная визуальная проверка: чистый премиальный Stream",
    heroSubtitle: "Последний визуальный проход для UI/UX комнаты эфира: главный экран, порядок, кнопки, текст, маленький телефон и честная подача границ.",
    phoneStatus: `${room.status} · visual QA · ${mobileDensity.premiumScore}% compact`,
    visualSummary: "Чистый главный блок → телефонный экран → основные действия → люди/соведущий/дуэль → сложенные техпанели",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113L визуальная проверка закрыта. UI/UX комнаты эфира выглядит как премиальный продуктовый экран, а не как проверочный/служебный экран.",
    secondaryAction: state.lastAction,
    cleanMainUxReady: premiumScore >= 90 && mobileDensity.productUiReady,
    noOverlapReady: state.tapTargetsLockedLocal && state.smallPhoneLockedLocal,
    phoneVisualQaReady: readySections === totalSections && mobileDensity.productUiReady,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
