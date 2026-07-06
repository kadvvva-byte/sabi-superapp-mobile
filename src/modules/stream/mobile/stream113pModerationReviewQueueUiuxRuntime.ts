import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113OModerationPolicyRolesUiuxEvidence } from "./stream113oModerationPolicyRolesUiuxRuntime";

export type Stream113PModerationReviewQueueId =
  | "report_intake"
  | "evidence_clip"
  | "ai_review_queue"
  | "host_decision"
  | "moderator_notes"
  | "appeal_path"
  | "audit_boundary";

export type Stream113PModerationReviewQueueStatus = "review_ready" | "needs_review";

export type Stream113PModerationReviewQueueItem = {
  readonly id: Stream113PModerationReviewQueueId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113PModerationReviewQueueStatus;
};

export type Stream113PModerationReviewQueueUiuxState = {
  readonly version: "STREAM-113P";
  readonly selectedReviewId: Stream113PModerationReviewQueueId;
  readonly readyReviewIds: readonly Stream113PModerationReviewQueueId[];
  readonly lastAction: string;
  readonly reportIntakeVisibleLocal: boolean;
  readonly evidenceClipVisibleLocal: boolean;
  readonly aiReviewQueueVisibleLocal: boolean;
  readonly hostDecisionVisibleLocal: boolean;
  readonly moderatorNotesVisibleLocal: boolean;
  readonly appealPathVisibleLocal: boolean;
  readonly auditBoundaryVisibleLocal: boolean;
  readonly backendReviewEnforcementReady: false;
  readonly fakeAutoBanAllowed: false;
  readonly fakePermanentSanctionAllowed: false;
  readonly fakeLegalAgeProofAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113PModerationReviewQueueUiuxEvidence = {
  readonly version: "STREAM-113P";
  readonly selectedReviewId: Stream113PModerationReviewQueueId;
  readonly premiumScore: number;
  readonly readyReviews: number;
  readonly totalReviews: number;
  readonly reviewItems: readonly Stream113PModerationReviewQueueItem[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly reviewSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly moderationReviewQueueUxReady: boolean;
  readonly reportIntakeReady: boolean;
  readonly evidenceClipReady: boolean;
  readonly aiReviewQueueReady: boolean;
  readonly hostDecisionReady: boolean;
  readonly moderatorNotesReady: boolean;
  readonly appealPathReady: boolean;
  readonly backendReviewEnforcementReady: false;
  readonly fakeAutoBanAllowed: false;
  readonly fakePermanentSanctionAllowed: false;
  readonly fakeLegalAgeProofAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const REVIEW_ORDER: readonly Stream113PModerationReviewQueueId[] = [
  "report_intake",
  "evidence_clip",
  "ai_review_queue",
  "host_decision",
  "moderator_notes",
  "appeal_path",
  "audit_boundary",
];

const REVIEW_TITLES: Record<Stream113PModerationReviewQueueId, string> = {
  report_intake: "Жалоба",
  evidence_clip: "Доказательства",
  ai_review_queue: "Проверка Sabi AI",
  host_decision: "Решение ведущего",
  moderator_notes: "Заметки модератора",
  appeal_path: "Апелляция",
  audit_boundary: "Журнал и граница",
};

const REVIEW_DESCRIPTIONS: Record<Stream113PModerationReviewQueueId, string> = {
  report_intake: "Жалоба попадает в понятную очередь: кто пожаловался, на что, какая категория риска и что увидит ведущий.",
  evidence_clip: "Доказательства показаны как локальный предпросмотр UI: сообщение, момент эфира, участник и причина без фейковой видеозаписи или хранилища провайдера.",
  ai_review_queue: "Sabi AI сортирует риск в очередь проверки, подсвечивает 18+, ругательства, оскорбления и травлю, но не выносит фейковый вердикт.",
  host_decision: "Ведущий видит мягкую лестницу решений: оставить, предупреждение, намерение мьюта, удаление предпросмотра или отправка администратору позже.",
  moderator_notes: "Модератор может добавить краткую заметку и передать решение ведущему без скрытой серверной блокировки.",
  appeal_path: "Путь апелляции объясняет пользователю, что действие можно пересмотреть, когда будет подключено серверное/админское исполнение.",
  audit_boundary: "Журнал действий виден как честная история UI: проверка, намерение, предпросмотр решения и граница без фейковой постоянной санкции.",
};

export function createInitialStream113PModerationReviewQueueUiuxState(): Stream113PModerationReviewQueueUiuxState {
  return {
    version: "STREAM-113P",
    selectedReviewId: "report_intake",
    readyReviewIds: ["audit_boundary"],
    lastAction: "113P начал UX очереди проверки: жалобы, доказательства, проверка Sabi AI, решение ведущего, заметки модератора, апелляция и журнал.",
    reportIntakeVisibleLocal: true,
    evidenceClipVisibleLocal: false,
    aiReviewQueueVisibleLocal: false,
    hostDecisionVisibleLocal: false,
    moderatorNotesVisibleLocal: false,
    appealPathVisibleLocal: false,
    auditBoundaryVisibleLocal: true,
    backendReviewEnforcementReady: false,
    fakeAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakeLegalAgeProofAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113PModerationReviewQueue(
  state: Stream113PModerationReviewQueueUiuxState,
  selectedReviewId: Stream113PModerationReviewQueueId,
): Stream113PModerationReviewQueueUiuxState {
  return { ...state, selectedReviewId, lastAction: `Открыт 113P review item: ${REVIEW_TITLES[selectedReviewId]}.` };
}

export function markStream113PModerationReviewQueueItemReady(
  state: Stream113PModerationReviewQueueUiuxState,
  reviewId: Stream113PModerationReviewQueueId,
  action: string,
): Stream113PModerationReviewQueueUiuxState {
  const readyReviewIds = state.readyReviewIds.includes(reviewId) ? state.readyReviewIds : [...state.readyReviewIds, reviewId];

  return {
    ...state,
    selectedReviewId: reviewId,
    readyReviewIds,
    lastAction: action,
    reportIntakeVisibleLocal: state.reportIntakeVisibleLocal || reviewId === "report_intake",
    evidenceClipVisibleLocal: state.evidenceClipVisibleLocal || reviewId === "evidence_clip",
    aiReviewQueueVisibleLocal: state.aiReviewQueueVisibleLocal || reviewId === "ai_review_queue",
    hostDecisionVisibleLocal: state.hostDecisionVisibleLocal || reviewId === "host_decision",
    moderatorNotesVisibleLocal: state.moderatorNotesVisibleLocal || reviewId === "moderator_notes",
    appealPathVisibleLocal: state.appealPathVisibleLocal || reviewId === "appeal_path",
    auditBoundaryVisibleLocal: state.auditBoundaryVisibleLocal || reviewId === "audit_boundary",
  };
}

export function markStream113PModerationReviewQueueAllReady(
  state: Stream113PModerationReviewQueueUiuxState,
  action: string,
): Stream113PModerationReviewQueueUiuxState {
  return {
    ...state,
    selectedReviewId: "audit_boundary",
    readyReviewIds: REVIEW_ORDER,
    lastAction: action,
    reportIntakeVisibleLocal: true,
    evidenceClipVisibleLocal: true,
    aiReviewQueueVisibleLocal: true,
    hostDecisionVisibleLocal: true,
    moderatorNotesVisibleLocal: true,
    appealPathVisibleLocal: true,
    auditBoundaryVisibleLocal: true,
  };
}

function ready(state: Stream113PModerationReviewQueueUiuxState, reviewId: Stream113PModerationReviewQueueId): boolean {
  return state.readyReviewIds.includes(reviewId);
}

function reviewItem(
  id: Stream113PModerationReviewQueueId,
  state: Stream113PModerationReviewQueueUiuxState,
  isReady: boolean,
): Stream113PModerationReviewQueueItem {
  return {
    id,
    title: REVIEW_TITLES[id],
    description: REVIEW_DESCRIPTIONS[id],
    status: isReady || ready(state, id) ? "review_ready" : "needs_review",
  };
}

function activeNarrative(
  id: Stream113PModerationReviewQueueId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "report_intake") return `Комната ${room.roomId}: жалоба должна открывать clear review sheet, а не теряться в чате.`;
  if (id === "evidence_clip") return "Предпросмотр доказательств показывает сообщение, участника, причину и момент эфира без фейковой записи, хранилища или загрузки провайдеру.";
  if (id === "ai_review_queue") return `Sabi AI review rail ${stage.moderationRailVisible ? "виден" : "скрыт"}: AI сортирует риск, но финальное решение не подделывает.`;
  if (id === "host_decision") return "Ведущий получает понятную панель решения: оставить, предупреждение, намерение мьюта, удаление предпросмотра или передача выше позже.";
  if (id === "moderator_notes") return "Заметка модератора короткая и практичная: что случилось, почему риск, какое действие рекомендовано.";
  if (id === "appeal_path") return "Апелляция объясняет пользователю пересмотр решения без фейкового юридического обещания и без серверного исполнения сейчас.";
  return "Граница журнала честная: UI хранит локальный журнал намерений и проверок, но не симулирует постоянную блокировку, юридическое подтверждение или исполнение реального времени/провайдера.";
}

export function buildStream113PModerationReviewQueueUiuxEvidence(
  state: Stream113PModerationReviewQueueUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  policyRoles: Stream113OModerationPolicyRolesUiuxEvidence,
): Stream113PModerationReviewQueueUiuxEvidence {
  const safeBoundaryReady = state.backendReviewEnforcementReady === false
    && state.fakeAutoBanAllowed === false
    && state.fakePermanentSanctionAllowed === false
    && state.fakeLegalAgeProofAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false
    && policyRoles.fakeAgeVerificationAllowed === false
    && policyRoles.fakeAutoBanAllowed === false
    && policyRoles.fakeLegalApprovalAllowed === false
    && policyRoles.fakeProviderAllowed === false
    && policyRoles.fakeRealtimeAllowed === false
    && policyRoles.fakeLiveAllowed === false
    && policyRoles.fakePaymentAllowed === false
    && policyRoles.cinemaMixAllowed === false;

  const reviewItems: readonly Stream113PModerationReviewQueueItem[] = [
    reviewItem("report_intake", state, state.reportIntakeVisibleLocal),
    reviewItem("evidence_clip", state, state.evidenceClipVisibleLocal),
    reviewItem("ai_review_queue", state, state.aiReviewQueueVisibleLocal),
    reviewItem("host_decision", state, state.hostDecisionVisibleLocal),
    reviewItem("moderator_notes", state, state.moderatorNotesVisibleLocal),
    reviewItem("appeal_path", state, state.appealPathVisibleLocal),
    reviewItem("audit_boundary", state, state.auditBoundaryVisibleLocal && safeBoundaryReady),
  ];

  const readyReviews = reviewItems.filter((item) => item.status === "review_ready").length;
  const totalReviews = reviewItems.length;
  const premiumScore = Math.round((readyReviews / totalReviews) * 100);
  const next = reviewItems.find((item) => item.status === "needs_review");
  const active = reviewItems.find((item) => item.id === state.selectedReviewId) ?? reviewItems[0];

  return {
    version: "STREAM-113P",
    selectedReviewId: state.selectedReviewId,
    premiumScore,
    readyReviews,
    totalReviews,
    reviewItems,
    heroTitle: "Очередь проверки: жалобы, доказательства, Sabi AI, решение",
    heroSubtitle: "Stream получает понятный UX проверки модерации: жалоба → доказательства → проверка Sabi AI → решение ведущего/модератора → апелляция → граница журнала.",
    phoneStatus: `${room.status} · review queue · ${premiumScore}% UX`,
    reviewSummary: "жалоба → предпросмотр доказательств → проверка Sabi AI → решение ведущего → заметка модератора → апелляция → граница журнала",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113P очередь проверки закрыта: проверка модерации выглядит как премиальный продуктовый UX, без фейковой постоянной санкции или фейкового серверного исполнения.",
    secondaryAction: state.lastAction,
    moderationReviewQueueUxReady: readyReviews === totalReviews && policyRoles.moderationPolicyRolesUxReady,
    reportIntakeReady: state.reportIntakeVisibleLocal,
    evidenceClipReady: state.evidenceClipVisibleLocal,
    aiReviewQueueReady: state.aiReviewQueueVisibleLocal,
    hostDecisionReady: state.hostDecisionVisibleLocal,
    moderatorNotesReady: state.moderatorNotesVisibleLocal,
    appealPathReady: state.appealPathVisibleLocal,
    backendReviewEnforcementReady: false,
    fakeAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakeLegalAgeProofAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
