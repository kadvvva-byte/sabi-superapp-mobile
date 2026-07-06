import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113IEmptyErrorStatesUiuxEvidence } from "./stream113iEmptyErrorStatesUiuxRuntime";

export type Stream113JProductLanguageSectionId =
  | "hero_copy"
  | "primary_action"
  | "technical_language"
  | "visual_hierarchy"
  | "phone_spacing"
  | "safe_boundary_copy";

export type Stream113JProductLanguageSectionStatus = "premium_product" | "needs_copy_polish";

export type Stream113JProductLanguageSection = {
  readonly id: Stream113JProductLanguageSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113JProductLanguageSectionStatus;
};

export type Stream113JProductLanguageHierarchyUiuxState = {
  readonly version: "STREAM-113J";
  readonly selectedSectionId: Stream113JProductLanguageSectionId;
  readonly polishedSectionIds: readonly Stream113JProductLanguageSectionId[];
  readonly lastAction: string;
  readonly debugCopyHiddenLocal: boolean;
  readonly technicalLanguageCollapsedLocal: boolean;
  readonly productToneLockedLocal: boolean;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113JProductLanguageHierarchyUiuxEvidence = {
  readonly version: "STREAM-113J";
  readonly selectedSectionId: Stream113JProductLanguageSectionId;
  readonly premiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sections: readonly Stream113JProductLanguageSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly phoneStatus: string;
  readonly productTitle: string;
  readonly productSubtitle: string;
  readonly hierarchySummary: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly safeBoundaryCopy: string;
  readonly productLanguageReady: boolean;
  readonly cleanProductUiReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SECTION_ORDER: readonly Stream113JProductLanguageSectionId[] = [
  "hero_copy",
  "primary_action",
  "technical_language",
  "visual_hierarchy",
  "phone_spacing",
  "safe_boundary_copy",
];

const SECTION_TITLES: Record<Stream113JProductLanguageSectionId, string> = {
  hero_copy: "Главный текст",
  primary_action: "Главное действие",
  technical_language: "Без служебного языка",
  visual_hierarchy: "Визуальная иерархия",
  phone_spacing: "Телефонные отступы",
  safe_boundary_copy: "Безопасная граница",
};

const SECTION_DESCRIPTIONS: Record<Stream113JProductLanguageSectionId, string> = {
  hero_copy: "Первый экран объясняет эфир простым продуктовым языком, без проверочных терминов.",
  primary_action: "Ведущий и зритель всегда видят одно главное действие, а не набор равных тест-кнопок.",
  technical_language: "Технические слова остаются за кнопкой техпанелей и не ломают обычный UX.",
  visual_hierarchy: "Заголовок, статус, видео-поле, чат и действия читаются сверху вниз без перегруза.",
  phone_spacing: "Карточки и кнопки рассчитаны на телефон: не налезают друг на друга и не режутся.",
  safe_boundary_copy: "Граница провайдера/реального времени честная, короткая и не похожа на ошибку приложения.",
};

export function createInitialStream113JProductLanguageHierarchyUiuxState(): Stream113JProductLanguageHierarchyUiuxState {
  return {
    version: "STREAM-113J",
    selectedSectionId: "hero_copy",
    polishedSectionIds: ["safe_boundary_copy"],
    lastAction: "113J начал финальную чистку текста, визуальной иерархии и продуктового языка для комнаты эфира.",
    debugCopyHiddenLocal: true,
    technicalLanguageCollapsedLocal: true,
    productToneLockedLocal: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113JProductLanguageSection(
  state: Stream113JProductLanguageHierarchyUiuxState,
  selectedSectionId: Stream113JProductLanguageSectionId,
): Stream113JProductLanguageHierarchyUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113J section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113JProductLanguageSectionPolished(
  state: Stream113JProductLanguageHierarchyUiuxState,
  sectionId: Stream113JProductLanguageSectionId,
  action: string,
): Stream113JProductLanguageHierarchyUiuxState {
  const polishedSectionIds = state.polishedSectionIds.includes(sectionId)
    ? state.polishedSectionIds
    : [...state.polishedSectionIds, sectionId];
  return {
    ...state,
    selectedSectionId: sectionId,
    polishedSectionIds,
    lastAction: action,
    debugCopyHiddenLocal: state.debugCopyHiddenLocal || sectionId === "technical_language",
    technicalLanguageCollapsedLocal: state.technicalLanguageCollapsedLocal || sectionId === "technical_language",
    productToneLockedLocal: state.productToneLockedLocal || sectionId === "hero_copy" || sectionId === "primary_action",
  };
}

export function markStream113JProductLanguageAllPolished(
  state: Stream113JProductLanguageHierarchyUiuxState,
  action: string,
): Stream113JProductLanguageHierarchyUiuxState {
  return {
    ...state,
    selectedSectionId: "safe_boundary_copy",
    polishedSectionIds: SECTION_ORDER,
    lastAction: action,
    debugCopyHiddenLocal: true,
    technicalLanguageCollapsedLocal: true,
    productToneLockedLocal: true,
  };
}

function polished(state: Stream113JProductLanguageHierarchyUiuxState, sectionId: Stream113JProductLanguageSectionId): boolean {
  return state.polishedSectionIds.includes(sectionId);
}

function sectionItem(
  id: Stream113JProductLanguageSectionId,
  runtime: Stream113JProductLanguageHierarchyUiuxState,
  ready: boolean,
): Stream113JProductLanguageSection {
  return {
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: ready || polished(runtime, id) ? "premium_product" : "needs_copy_polish",
  };
}

function activeNarrative(
  id: Stream113JProductLanguageSectionId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "hero_copy") return "Главный блок должен говорить человеческим языком: что за эфир, кто ведёт, что можно сделать дальше.";
  if (id === "primary_action") return room.status === "local_preview_active" ? "Главное действие — управлять эфиром и чатом, а не искать нужную тест-кнопку." : "Главное действие ведёт к подготовке/предпросмотру без фейковых запусков.";
  if (id === "technical_language") return "Проверки, доказательства и детали провайдера скрыты из обычного UX и доступны только как техпанели.";
  if (id === "visual_hierarchy") return `Текущий макет ${stage.layout}: статус → видео-поле → чат → действия → безопасная граница.`;
  if (id === "phone_spacing") return "Карточки остаются короткими, кнопки действий читаются одной рукой, прокрутка не обрезает важный путь.";
  return "Безопасная граница объясняет: эфир/провайдер ещё не подключён, но приложение не врёт и не рисует фейковый успех.";
}

export function buildStream113JProductLanguageHierarchyUiuxEvidence(
  state: Stream113JProductLanguageHierarchyUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  emptyStates: Stream113IEmptyErrorStatesUiuxEvidence,
): Stream113JProductLanguageHierarchyUiuxEvidence {
  const safeBoundaryReady = emptyStates.fakeLiveAllowed === false
    && emptyStates.fakeRealtimeAllowed === false
    && emptyStates.fakeProviderAllowed === false
    && emptyStates.fakePaymentAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false;

  const sections: readonly Stream113JProductLanguageSection[] = [
    sectionItem("hero_copy", state, state.productToneLockedLocal),
    sectionItem("primary_action", state, state.productToneLockedLocal),
    sectionItem("technical_language", state, state.debugCopyHiddenLocal && state.technicalLanguageCollapsedLocal),
    sectionItem("visual_hierarchy", state, emptyStates.cleanProductUiReady || polished(state, "visual_hierarchy")),
    sectionItem("phone_spacing", state, emptyStates.premiumScore >= 80 || polished(state, "phone_spacing")),
    sectionItem("safe_boundary_copy", state, safeBoundaryReady),
  ];

  const readySections = sections.filter((item) => item.status === "premium_product").length;
  const totalSections = sections.length;
  const premiumScore = Math.round((readySections / totalSections) * 100);
  const next = sections.find((item) => item.status === "needs_copy_polish");
  const active = sections.find((item) => item.id === state.selectedSectionId) ?? sections[0];
  const title = room.title || "Эфир Sabi";

  return {
    version: "STREAM-113J",
    selectedSectionId: state.selectedSectionId,
    premiumScore,
    readySections,
    totalSections,
    sections,
    heroTitle: "Чистка продуктового языка и визуальной иерархии",
    heroSubtitle: "Финальная чистка текста, статусов и визуального порядка, чтобы комната эфира ощущалась как готовый премиальный Stream UX, а не панель проверки.",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    phoneStatus: `${room.status} · product copy · ${emptyStates.premiumScore}% states`,
    productTitle: title,
    productSubtitle: room.topic || "Эфир готовится: источник, чат, люди и действия собраны в один понятный путь.",
    hierarchySummary: `Главный блок → ${stage.layout} видео-поле → нижний чат → люди/действия → честная граница`,
    primaryAction: next ? `${next.title}: ${next.description}` : "113J продуктовый язык закрыт. Дальше можно делать финальный визуальный проход по всему Stream UI.",
    secondaryAction: state.lastAction,
    safeBoundaryCopy: safeBoundaryReady ? "Провайдер/реальное время честно заблокированы до реального подключения. Фейковый эфир, фейковый провайдер и фейковые платежи запрещены." : "Нужно вернуть честную безопасную границу без фейкового успеха.",
    productLanguageReady: readySections >= 5 && emptyStates.emptyErrorUxReady,
    cleanProductUiReady: readySections === totalSections && emptyStates.cleanProductUiReady,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
