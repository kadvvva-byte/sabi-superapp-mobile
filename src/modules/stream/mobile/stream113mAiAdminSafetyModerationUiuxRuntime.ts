import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113LFinalVisualQaUiuxEvidence } from "./stream113lFinalVisualQaUiuxRuntime";

export type Stream113MAiSafetyModerationSectionId =
  | "age_gate_18"
  | "profanity_guard"
  | "insult_guard"
  | "ai_admin_queue"
  | "host_override"
  | "safe_boundary";

export type Stream113MAiSafetyModerationStatus = "guard_locked" | "needs_guard";

export type Stream113MAiSafetyModerationSection = {
  readonly id: Stream113MAiSafetyModerationSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113MAiSafetyModerationStatus;
};

export type Stream113MAiAdminSafetyModerationUiuxState = {
  readonly version: "STREAM-113M";
  readonly selectedSectionId: Stream113MAiSafetyModerationSectionId;
  readonly lockedSectionIds: readonly Stream113MAiSafetyModerationSectionId[];
  readonly lastAction: string;
  readonly ageGateVisibleLocal: boolean;
  readonly profanityGuardVisibleLocal: boolean;
  readonly insultGuardVisibleLocal: boolean;
  readonly aiAdminQueueVisibleLocal: boolean;
  readonly hostOverrideVisibleLocal: boolean;
  readonly moderationRailCleanLocal: boolean;
  readonly autoPermanentBanAllowed: false;
  readonly fakeAiDecisionAllowed: false;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113MAiAdminSafetyModerationUiuxEvidence = {
  readonly version: "STREAM-113M";
  readonly selectedSectionId: Stream113MAiSafetyModerationSectionId;
  readonly premiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sections: readonly Stream113MAiSafetyModerationSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly safetySummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly aiAdminUxReady: boolean;
  readonly ageSafetyReady: boolean;
  readonly profanitySafetyReady: boolean;
  readonly insultSafetyReady: boolean;
  readonly moderationQueueReady: boolean;
  readonly noFakeAutoBanReady: boolean;
  readonly providerReady: false;
  readonly autoPermanentBanAllowed: false;
  readonly fakeAiDecisionAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SECTION_ORDER: readonly Stream113MAiSafetyModerationSectionId[] = [
  "age_gate_18",
  "profanity_guard",
  "insult_guard",
  "ai_admin_queue",
  "host_override",
  "safe_boundary",
];

const SECTION_TITLES: Record<Stream113MAiSafetyModerationSectionId, string> = {
  age_gate_18: "Контроль 18+",
  profanity_guard: "Ругательства",
  insult_guard: "Оскорбления",
  ai_admin_queue: "AI очередь",
  host_override: "Контроль ведущего",
  safe_boundary: "Честная граница",
};

const SECTION_DESCRIPTIONS: Record<Stream113MAiSafetyModerationSectionId, string> = {
  age_gate_18: "Stream показывает понятную проверку 18+ для взрослого контента и честно объясняет, что подтверждение требует серверных правил и провайдера.",
  profanity_guard: "Ругательства уходят в мягкую модерацию Sabi AI: предупреждение, удержание, мьют и проверка — без грубого служебного языка.",
  insult_guard: "Оскорбления и травля показываются как отдельный контроль безопасности, чтобы ведущий понимал риск и действие.",
  ai_admin_queue: "Sabi AI выступает как админ-контролёр: собирает сигналы в очередь проверки, но не делает фейковую постоянную блокировку.",
  host_override: "Ведущий видит короткие действия: предупредить, скрыть, включить мьют, удержать, передать на проверку.",
  safe_boundary: "Нет фейкового провайдера, юридического подтверждения, эфира, платежей и решения Sabi AI; только честная UI/UX подготовка.",
};

export function createInitialStream113MAiAdminSafetyModerationUiuxState(): Stream113MAiAdminSafetyModerationUiuxState {
  return {
    version: "STREAM-113M",
    selectedSectionId: "age_gate_18",
    lockedSectionIds: ["safe_boundary"],
    lastAction: "113M начал проход безопасности Sabi AI: 18+, ругательства, оскорбления и очередь админ-проверки должны выглядеть как премиальная модерация Stream.",
    ageGateVisibleLocal: true,
    profanityGuardVisibleLocal: false,
    insultGuardVisibleLocal: false,
    aiAdminQueueVisibleLocal: false,
    hostOverrideVisibleLocal: true,
    moderationRailCleanLocal: true,
    autoPermanentBanAllowed: false,
    fakeAiDecisionAllowed: false,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113MAiSafetyModerationSection(
  state: Stream113MAiAdminSafetyModerationUiuxState,
  selectedSectionId: Stream113MAiSafetyModerationSectionId,
): Stream113MAiAdminSafetyModerationUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113M AI safety section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113MAiSafetyModerationSectionLocked(
  state: Stream113MAiAdminSafetyModerationUiuxState,
  sectionId: Stream113MAiSafetyModerationSectionId,
  action: string,
): Stream113MAiAdminSafetyModerationUiuxState {
  const lockedSectionIds = state.lockedSectionIds.includes(sectionId)
    ? state.lockedSectionIds
    : [...state.lockedSectionIds, sectionId];

  return {
    ...state,
    selectedSectionId: sectionId,
    lockedSectionIds,
    lastAction: action,
    ageGateVisibleLocal: state.ageGateVisibleLocal || sectionId === "age_gate_18",
    profanityGuardVisibleLocal: state.profanityGuardVisibleLocal || sectionId === "profanity_guard",
    insultGuardVisibleLocal: state.insultGuardVisibleLocal || sectionId === "insult_guard",
    aiAdminQueueVisibleLocal: state.aiAdminQueueVisibleLocal || sectionId === "ai_admin_queue",
    hostOverrideVisibleLocal: state.hostOverrideVisibleLocal || sectionId === "host_override",
    moderationRailCleanLocal: state.moderationRailCleanLocal || sectionId === "safe_boundary" || sectionId === "ai_admin_queue",
  };
}

export function markStream113MAiSafetyModerationAllLocked(
  state: Stream113MAiAdminSafetyModerationUiuxState,
  action: string,
): Stream113MAiAdminSafetyModerationUiuxState {
  return {
    ...state,
    selectedSectionId: "safe_boundary",
    lockedSectionIds: SECTION_ORDER,
    lastAction: action,
    ageGateVisibleLocal: true,
    profanityGuardVisibleLocal: true,
    insultGuardVisibleLocal: true,
    aiAdminQueueVisibleLocal: true,
    hostOverrideVisibleLocal: true,
    moderationRailCleanLocal: true,
  };
}

function locked(state: Stream113MAiAdminSafetyModerationUiuxState, sectionId: Stream113MAiSafetyModerationSectionId): boolean {
  return state.lockedSectionIds.includes(sectionId);
}

function sectionItem(
  id: Stream113MAiSafetyModerationSectionId,
  state: Stream113MAiAdminSafetyModerationUiuxState,
  ready: boolean,
): Stream113MAiSafetyModerationSection {
  return {
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: ready || locked(state, id) ? "guard_locked" : "needs_guard",
  };
}

function activeNarrative(
  id: Stream113MAiSafetyModerationSectionId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "age_gate_18") return `Комната ${room.roomId}: 18+ проверка должна быть видна до рискованного контента и объяснять, что provider/backend policy ещё не подключена.`;
  if (id === "profanity_guard") return "Ругательства не должны ломать чат: UI показывает мягкий путь удержания, проверки и мьюта, а ведущий получает понятное действие.";
  if (id === "insult_guard") return "Оскорбления, травля и атаки на участников должны выделяться отдельно, чтобы Sabi AI помогал как контролёр, а не как декоративный бот.";
  if (id === "ai_admin_queue") return `Очередь Sabi AI открывает панель модерации: ${stage.moderationRailVisible ? "панель видна" : "панель свёрнута"}, без fake-verdict и без вечного fake-ban.`;
  if (id === "host_override") return "Ведущий остаётся главным: Sabi AI предлагает безопасное действие, но финальный контроль и правила сервера/провайдера не подменяются.";
  return "Граница честная: локальный UI готовит модерацию, но не притворяется подключенным провайдером, юридическим подтверждением, реальным исполнением эфира или платежами.";
}

export function buildStream113MAiAdminSafetyModerationUiuxEvidence(
  state: Stream113MAiAdminSafetyModerationUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  finalVisual: Stream113LFinalVisualQaUiuxEvidence,
): Stream113MAiAdminSafetyModerationUiuxEvidence {
  const safeBoundaryReady = state.autoPermanentBanAllowed === false
    && state.fakeAiDecisionAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false
    && finalVisual.fakeLiveAllowed === false
    && finalVisual.fakeRealtimeAllowed === false
    && finalVisual.fakeProviderAllowed === false
    && finalVisual.fakePaymentAllowed === false;

  const sections: readonly Stream113MAiSafetyModerationSection[] = [
    sectionItem("age_gate_18", state, state.ageGateVisibleLocal),
    sectionItem("profanity_guard", state, state.profanityGuardVisibleLocal),
    sectionItem("insult_guard", state, state.insultGuardVisibleLocal),
    sectionItem("ai_admin_queue", state, state.aiAdminQueueVisibleLocal && state.moderationRailCleanLocal),
    sectionItem("host_override", state, state.hostOverrideVisibleLocal),
    sectionItem("safe_boundary", state, state.moderationRailCleanLocal && safeBoundaryReady),
  ];

  const readySections = sections.filter((item) => item.status === "guard_locked").length;
  const totalSections = sections.length;
  const premiumScore = Math.round((readySections / totalSections) * 100);
  const next = sections.find((item) => item.status === "needs_guard");
  const active = sections.find((item) => item.id === state.selectedSectionId) ?? sections[0];

  return {
    version: "STREAM-113M",
    selectedSectionId: state.selectedSectionId,
    premiumScore,
    readySections,
    totalSections,
    sections,
    heroTitle: "Sabi AI админ: контроль безопасности эфира",
    heroSubtitle: "18+ контроль, ругательства, оскорбления, очередь Sabi AI и контроль ведущего — как премиальный UX, не как служебная панель.",
    phoneStatus: `${room.status} · AI safety · ${premiumScore}% guard`,
    safetySummary: "18+ проверка → ругательства → оскорбления → очередь Sabi AI → контроль ведущего → честная граница",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113M безопасность Sabi AI закрыта. Sabi AI выглядит как админ-контролёр, но не делает фейковую блокировку и не подменяет провайдера/сервер.",
    secondaryAction: state.lastAction,
    aiAdminUxReady: readySections === totalSections && finalVisual.phoneVisualQaReady,
    ageSafetyReady: state.ageGateVisibleLocal,
    profanitySafetyReady: state.profanityGuardVisibleLocal,
    insultSafetyReady: state.insultGuardVisibleLocal,
    moderationQueueReady: state.aiAdminQueueVisibleLocal && state.moderationRailCleanLocal,
    noFakeAutoBanReady: safeBoundaryReady,
    providerReady: false,
    autoPermanentBanAllowed: false,
    fakeAiDecisionAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
