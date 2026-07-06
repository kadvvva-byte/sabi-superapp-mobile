import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113PModerationReviewQueueUiuxEvidence } from "./stream113pModerationReviewQueueUiuxRuntime";

export type Stream113QModerationTrustDashboardSectionId =
  | "age_gate_summary"
  | "chat_safety_summary"
  | "report_health_summary"
  | "ai_review_summary"
  | "moderator_action_summary"
  | "appeal_audit_summary"
  | "backend_boundary_summary"
  | "owner_ready_summary";

export type Stream113QModerationTrustDashboardStatus = "summary_ready" | "needs_review";

export type Stream113QModerationTrustDashboardItem = {
  readonly id: Stream113QModerationTrustDashboardSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113QModerationTrustDashboardStatus;
};

export type Stream113QModerationTrustDashboardUiuxState = {
  readonly version: "STREAM-113Q";
  readonly selectedSectionId: Stream113QModerationTrustDashboardSectionId;
  readonly readySectionIds: readonly Stream113QModerationTrustDashboardSectionId[];
  readonly lastAction: string;
  readonly ageGateSummaryVisibleLocal: boolean;
  readonly chatSafetySummaryVisibleLocal: boolean;
  readonly reportHealthSummaryVisibleLocal: boolean;
  readonly aiReviewSummaryVisibleLocal: boolean;
  readonly moderatorActionSummaryVisibleLocal: boolean;
  readonly appealAuditSummaryVisibleLocal: boolean;
  readonly backendBoundarySummaryVisibleLocal: boolean;
  readonly ownerReadySummaryVisibleLocal: boolean;
  readonly backendTrustDashboardReady: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAutoBanAllowed: false;
  readonly fakePermanentSanctionAllowed: false;
  readonly fakeLegalProofAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113QModerationTrustDashboardUiuxEvidence = {
  readonly version: "STREAM-113Q";
  readonly selectedSectionId: Stream113QModerationTrustDashboardSectionId;
  readonly premiumScore: number;
  readonly readySummaries: number;
  readonly totalSummaries: number;
  readonly summaryItems: readonly Stream113QModerationTrustDashboardItem[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly dashboardSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly moderationTrustDashboardUxReady: boolean;
  readonly ageGateSummaryReady: boolean;
  readonly chatSafetySummaryReady: boolean;
  readonly reportHealthSummaryReady: boolean;
  readonly aiReviewSummaryReady: boolean;
  readonly moderatorActionSummaryReady: boolean;
  readonly appealAuditSummaryReady: boolean;
  readonly backendTrustDashboardReady: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAutoBanAllowed: false;
  readonly fakePermanentSanctionAllowed: false;
  readonly fakeLegalProofAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SUMMARY_ORDER: readonly Stream113QModerationTrustDashboardSectionId[] = [
  "age_gate_summary",
  "chat_safety_summary",
  "report_health_summary",
  "ai_review_summary",
  "moderator_action_summary",
  "appeal_audit_summary",
  "backend_boundary_summary",
  "owner_ready_summary",
];

const SUMMARY_TITLES: Record<Stream113QModerationTrustDashboardSectionId, string> = {
  age_gate_summary: "18+ статус",
  chat_safety_summary: "Чат и оскорбления",
  report_health_summary: "Жалобы",
  ai_review_summary: "Sabi Проверка Sabi AI",
  moderator_action_summary: "Действия модерации",
  appeal_audit_summary: "Апелляция и журнал",
  backend_boundary_summary: "Граница сервера",
  owner_ready_summary: "Готовность ведущего",
};

const SUMMARY_DESCRIPTIONS: Record<Stream113QModerationTrustDashboardSectionId, string> = {
  age_gate_summary: "Один понятный индикатор показывает, что эфир имеет 18+ режим как UI-проверку, без фейкового паспорта или юридической проверки.",
  chat_safety_summary: "Сводка чата показывает ругательства, оскорбления, травлю и мягкую лестницу реакции до действия модерации.",
  report_health_summary: "Жалобы видны как панель состояния: что пришло, что на проверке, что требует решения, без потерянных карточек.",
  ai_review_summary: "Sabi AI показан как контролёр риска и помощник ведущего, но не как фейковый судья или исполнитель постоянной блокировки.",
  moderator_action_summary: "Ведущий и модератор видят предупреждение, мьют, удаление предпросмотра и передачу выше как намерения, не как фейковое серверное исполнение.",
  appeal_audit_summary: "Апелляция и audit дают прозрачность: что было отмечено, кем просмотрено и что ещё требует backend/Admin позже.",
  backend_boundary_summary: "Граница честная: исполнение реального времени, провайдера и админа ещё не подключено, поэтому UI не обещает невозможное.",
  owner_ready_summary: "Главный экран безопасности собирает всё в одну телефонную сводку, чтобы ведущий не искал контроль по разным техпанелям.",
};

export function createInitialStream113QModerationTrustDashboardUiuxState(): Stream113QModerationTrustDashboardUiuxState {
  return {
    version: "STREAM-113Q",
    selectedSectionId: "age_gate_summary",
    readySectionIds: ["backend_boundary_summary"],
    lastAction: "113Q начал UX панели доверия: 18+, чат, жалобы, проверка Sabi AI, действия, апелляция, журнал и честная серверная граница.",
    ageGateSummaryVisibleLocal: true,
    chatSafetySummaryVisibleLocal: false,
    reportHealthSummaryVisibleLocal: false,
    aiReviewSummaryVisibleLocal: false,
    moderatorActionSummaryVisibleLocal: false,
    appealAuditSummaryVisibleLocal: false,
    backendBoundarySummaryVisibleLocal: true,
    ownerReadySummaryVisibleLocal: false,
    backendTrustDashboardReady: false,
    fakeAgeVerificationAllowed: false,
    fakeAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakeLegalProofAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113QModerationTrustDashboardSection(
  state: Stream113QModerationTrustDashboardUiuxState,
  selectedSectionId: Stream113QModerationTrustDashboardSectionId,
): Stream113QModerationTrustDashboardUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113Q trust dashboard section: ${SUMMARY_TITLES[selectedSectionId]}.` };
}

export function markStream113QModerationTrustDashboardSectionReady(
  state: Stream113QModerationTrustDashboardUiuxState,
  sectionId: Stream113QModerationTrustDashboardSectionId,
  action: string,
): Stream113QModerationTrustDashboardUiuxState {
  const readySectionIds = state.readySectionIds.includes(sectionId) ? state.readySectionIds : [...state.readySectionIds, sectionId];
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    lastAction: action,
    ageGateSummaryVisibleLocal: state.ageGateSummaryVisibleLocal || sectionId === "age_gate_summary",
    chatSafetySummaryVisibleLocal: state.chatSafetySummaryVisibleLocal || sectionId === "chat_safety_summary",
    reportHealthSummaryVisibleLocal: state.reportHealthSummaryVisibleLocal || sectionId === "report_health_summary",
    aiReviewSummaryVisibleLocal: state.aiReviewSummaryVisibleLocal || sectionId === "ai_review_summary",
    moderatorActionSummaryVisibleLocal: state.moderatorActionSummaryVisibleLocal || sectionId === "moderator_action_summary",
    appealAuditSummaryVisibleLocal: state.appealAuditSummaryVisibleLocal || sectionId === "appeal_audit_summary",
    backendBoundarySummaryVisibleLocal: state.backendBoundarySummaryVisibleLocal || sectionId === "backend_boundary_summary",
    ownerReadySummaryVisibleLocal: state.ownerReadySummaryVisibleLocal || sectionId === "owner_ready_summary",
  };
}

export function markStream113QModerationTrustDashboardAllReady(
  state: Stream113QModerationTrustDashboardUiuxState,
  action: string,
): Stream113QModerationTrustDashboardUiuxState {
  return {
    ...state,
    selectedSectionId: "owner_ready_summary",
    readySectionIds: SUMMARY_ORDER,
    lastAction: action,
    ageGateSummaryVisibleLocal: true,
    chatSafetySummaryVisibleLocal: true,
    reportHealthSummaryVisibleLocal: true,
    aiReviewSummaryVisibleLocal: true,
    moderatorActionSummaryVisibleLocal: true,
    appealAuditSummaryVisibleLocal: true,
    backendBoundarySummaryVisibleLocal: true,
    ownerReadySummaryVisibleLocal: true,
  };
}

function ready(state: Stream113QModerationTrustDashboardUiuxState, sectionId: Stream113QModerationTrustDashboardSectionId): boolean {
  return state.readySectionIds.includes(sectionId);
}

function summaryItem(
  id: Stream113QModerationTrustDashboardSectionId,
  state: Stream113QModerationTrustDashboardUiuxState,
  isReady: boolean,
): Stream113QModerationTrustDashboardItem {
  return {
    id,
    title: SUMMARY_TITLES[id],
    description: SUMMARY_DESCRIPTIONS[id],
    status: isReady || ready(state, id) ? "summary_ready" : "needs_review",
  };
}

function activeNarrative(
  id: Stream113QModerationTrustDashboardSectionId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "age_gate_summary") return `Комната ${room.roomId}: 18+ status должен быть виден как понятный проверка безопасности Stream, без fake document verification.`;
  if (id === "chat_safety_summary") return `Чат: ${room.comments.length} сообщений. Сводка должна показывать profanity/insult/bullying risk мягко и без перегруза.`;
  if (id === "report_health_summary") return "Жалобы собираются в одну сводку состояния: новые, на проверке, готовые к решению, без служебных таблиц.";
  if (id === "ai_review_summary") return `Sabi AI review rail ${stage.moderationRailVisible ? "открыт" : "свернут"}: AI подсвечивает риск, но не делает fake final verdict.`;
  if (id === "moderator_action_summary") return "Действия показываются как предупреждение, мьют, намерение удаления и предпросмотр передачи выше — честно, без серверной блокировки сейчас.";
  if (id === "appeal_audit_summary") return "Апелляция и журнал видны как прозрачная лента действий, не как юридическое обещание или журнал провайдера.";
  if (id === "backend_boundary_summary") return "Серверное, админское и провайдерское исполнение не симулируется: UI показывает границу и готовит контракт на будущую интеграцию.";
  return `Ведущий видит ${room.participants.length} участников, состояние ${room.status} и один понятный trust dashboard без поиска по техпанелям.`;
}

export function buildStream113QModerationTrustDashboardUiuxEvidence(
  state: Stream113QModerationTrustDashboardUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  reviewQueue: Stream113PModerationReviewQueueUiuxEvidence,
): Stream113QModerationTrustDashboardUiuxEvidence {
  const safeBoundaryReady = state.backendTrustDashboardReady === false
    && state.fakeAgeVerificationAllowed === false
    && state.fakeAutoBanAllowed === false
    && state.fakePermanentSanctionAllowed === false
    && state.fakeLegalProofAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false
    && reviewQueue.backendReviewEnforcementReady === false
    && reviewQueue.fakeAutoBanAllowed === false
    && reviewQueue.fakePermanentSanctionAllowed === false
    && reviewQueue.fakeLegalAgeProofAllowed === false
    && reviewQueue.fakeProviderAllowed === false
    && reviewQueue.fakeRealtimeAllowed === false
    && reviewQueue.fakeLiveAllowed === false
    && reviewQueue.fakePaymentAllowed === false
    && reviewQueue.cinemaMixAllowed === false;

  const summaryItems: readonly Stream113QModerationTrustDashboardItem[] = [
    summaryItem("age_gate_summary", state, state.ageGateSummaryVisibleLocal),
    summaryItem("chat_safety_summary", state, state.chatSafetySummaryVisibleLocal),
    summaryItem("report_health_summary", state, state.reportHealthSummaryVisibleLocal && reviewQueue.reportIntakeReady),
    summaryItem("ai_review_summary", state, state.aiReviewSummaryVisibleLocal && reviewQueue.aiReviewQueueReady),
    summaryItem("moderator_action_summary", state, state.moderatorActionSummaryVisibleLocal && reviewQueue.hostDecisionReady),
    summaryItem("appeal_audit_summary", state, state.appealAuditSummaryVisibleLocal && reviewQueue.appealPathReady),
    summaryItem("backend_boundary_summary", state, state.backendBoundarySummaryVisibleLocal && safeBoundaryReady),
    summaryItem("owner_ready_summary", state, state.ownerReadySummaryVisibleLocal && reviewQueue.moderationReviewQueueUxReady),
  ];

  const readySummaries = summaryItems.filter((item) => item.status === "summary_ready").length;
  const totalSummaries = summaryItems.length;
  const premiumScore = Math.round((readySummaries / totalSummaries) * 100);
  const next = summaryItems.find((item) => item.status === "needs_review");
  const active = summaryItems.find((item) => item.id === state.selectedSectionId) ?? summaryItems[0];

  return {
    version: "STREAM-113Q",
    selectedSectionId: state.selectedSectionId,
    premiumScore,
    readySummaries,
    totalSummaries,
    summaryItems,
    heroTitle: "Панель доверия: 18+, Sabi AI, жалобы, журнал",
    heroSubtitle: "Stream получает одну премиальную сводку безопасности: 18+ режим, ругательства/оскорбления, жалобы, проверка Sabi AI, действия модерации, апелляция и честная серверная граница.",
    phoneStatus: `${room.status} · trust dashboard · ${premiumScore}% UX`,
    dashboardSummary: "18+ → безопасность чата → жалобы → проверка Sabi AI → действия модератора → апелляции/журнал → серверная граница",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113Q панель доверия закрыта: ведущий видит состояние безопасности эфира одним премиальным экраном без фейкового исполнения.",
    secondaryAction: state.lastAction,
    moderationTrustDashboardUxReady: readySummaries === totalSummaries && reviewQueue.moderationReviewQueueUxReady,
    ageGateSummaryReady: state.ageGateSummaryVisibleLocal,
    chatSafetySummaryReady: state.chatSafetySummaryVisibleLocal,
    reportHealthSummaryReady: state.reportHealthSummaryVisibleLocal,
    aiReviewSummaryReady: state.aiReviewSummaryVisibleLocal,
    moderatorActionSummaryReady: state.moderatorActionSummaryVisibleLocal,
    appealAuditSummaryReady: state.appealAuditSummaryVisibleLocal,
    backendTrustDashboardReady: false,
    fakeAgeVerificationAllowed: false,
    fakeAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakeLegalProofAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
