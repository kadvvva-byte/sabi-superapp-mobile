import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113MAiAdminSafetyModerationUiuxEvidence } from "./stream113mAiAdminSafetyModerationUiuxRuntime";

export type Stream113NModerationActionId =
  | "report_flow"
  | "warning_action"
  | "mute_action"
  | "remove_action"
  | "ai_hold_review"
  | "audit_log"
  | "safe_boundary";

export type Stream113NModerationActionStatus = "action_ready" | "needs_action";

export type Stream113NModerationActionItem = {
  readonly id: Stream113NModerationActionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113NModerationActionStatus;
};

export type Stream113NModerationActionsUiuxState = {
  readonly version: "STREAM-113N";
  readonly selectedActionId: Stream113NModerationActionId;
  readonly readyActionIds: readonly Stream113NModerationActionId[];
  readonly lastAction: string;
  readonly reportSheetVisibleLocal: boolean;
  readonly warningActionVisibleLocal: boolean;
  readonly muteActionVisibleLocal: boolean;
  readonly removePreviewVisibleLocal: boolean;
  readonly aiHoldReviewVisibleLocal: boolean;
  readonly auditLogVisibleLocal: boolean;
  readonly actionRailCleanLocal: boolean;
  readonly providerEnforcementReady: false;
  readonly fakePermanentBanAllowed: false;
  readonly fakeLegalApprovalAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113NModerationActionsUiuxEvidence = {
  readonly version: "STREAM-113N";
  readonly selectedActionId: Stream113NModerationActionId;
  readonly premiumScore: number;
  readonly readyActions: number;
  readonly totalActions: number;
  readonly actions: readonly Stream113NModerationActionItem[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly actionSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly moderationActionsUxReady: boolean;
  readonly reportFlowReady: boolean;
  readonly warningReady: boolean;
  readonly muteReady: boolean;
  readonly removePreviewReady: boolean;
  readonly aiHoldReviewReady: boolean;
  readonly auditLogReady: boolean;
  readonly providerEnforcementReady: false;
  readonly fakePermanentBanAllowed: false;
  readonly fakeLegalApprovalAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const ACTION_ORDER: readonly Stream113NModerationActionId[] = [
  "report_flow",
  "warning_action",
  "mute_action",
  "remove_action",
  "ai_hold_review",
  "audit_log",
  "safe_boundary",
];

const ACTION_TITLES: Record<Stream113NModerationActionId, string> = {
  report_flow: "Жалоба",
  warning_action: "Предупреждение",
  mute_action: "Мьют",
  remove_action: "Убрать предпросмотр",
  ai_hold_review: "Проверка удержания Sabi AI",
  audit_log: "Журнал",
  safe_boundary: "Граница",
};

const ACTION_DESCRIPTIONS: Record<Stream113NModerationActionId, string> = {
  report_flow: "Зритель или ведущий отправляет жалобу через понятную нижнюю панель: причина, контекст, комментарий и безопасный статус.",
  warning_action: "Ведущий видит мягкое предупреждение перед жёсткими действиями, чтобы не было случайного наказания.",
  mute_action: "Мьют показывает локальный UX: кто, почему, на какой срок и что позже требует серверного/провайдерского исполнения.",
  remove_action: "Удаление предпросмотра объясняет действие как подготовленный шаг, но не притворяется настоящей серверной блокировкой.",
  ai_hold_review: "Sabi AI может поставить контент или участника на удержание для проверки и показать ведущему следующий безопасный шаг.",
  audit_log: "Каждое действие отображается как журнал: кто инициировал, почему, какой статус и что ещё не подключено.",
  safe_boundary: "Нет фейковой постоянной блокировки, юридического подтверждения, исполнения провайдером, эфира, реального времени или платежей.",
};

export function createInitialStream113NModerationActionsUiuxState(): Stream113NModerationActionsUiuxState {
  return {
    version: "STREAM-113N",
    selectedActionId: "report_flow",
    readyActionIds: ["safe_boundary"],
    lastAction: "113N начал UX действий модерации: жалоба, предупреждение, мьют, удаление предпросмотра, удержание Sabi AI и журнал должны выглядеть как премиальные элементы Stream.",
    reportSheetVisibleLocal: true,
    warningActionVisibleLocal: false,
    muteActionVisibleLocal: false,
    removePreviewVisibleLocal: false,
    aiHoldReviewVisibleLocal: false,
    auditLogVisibleLocal: false,
    actionRailCleanLocal: true,
    providerEnforcementReady: false,
    fakePermanentBanAllowed: false,
    fakeLegalApprovalAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113NModerationAction(
  state: Stream113NModerationActionsUiuxState,
  selectedActionId: Stream113NModerationActionId,
): Stream113NModerationActionsUiuxState {
  return { ...state, selectedActionId, lastAction: `Открыт 113N moderation action: ${ACTION_TITLES[selectedActionId]}.` };
}

export function markStream113NModerationActionReady(
  state: Stream113NModerationActionsUiuxState,
  actionId: Stream113NModerationActionId,
  action: string,
): Stream113NModerationActionsUiuxState {
  const readyActionIds = state.readyActionIds.includes(actionId)
    ? state.readyActionIds
    : [...state.readyActionIds, actionId];

  return {
    ...state,
    selectedActionId: actionId,
    readyActionIds,
    lastAction: action,
    reportSheetVisibleLocal: state.reportSheetVisibleLocal || actionId === "report_flow",
    warningActionVisibleLocal: state.warningActionVisibleLocal || actionId === "warning_action",
    muteActionVisibleLocal: state.muteActionVisibleLocal || actionId === "mute_action",
    removePreviewVisibleLocal: state.removePreviewVisibleLocal || actionId === "remove_action",
    aiHoldReviewVisibleLocal: state.aiHoldReviewVisibleLocal || actionId === "ai_hold_review",
    auditLogVisibleLocal: state.auditLogVisibleLocal || actionId === "audit_log",
    actionRailCleanLocal: state.actionRailCleanLocal || actionId === "safe_boundary" || actionId === "audit_log",
  };
}

export function markStream113NModerationActionsAllReady(
  state: Stream113NModerationActionsUiuxState,
  action: string,
): Stream113NModerationActionsUiuxState {
  return {
    ...state,
    selectedActionId: "safe_boundary",
    readyActionIds: ACTION_ORDER,
    lastAction: action,
    reportSheetVisibleLocal: true,
    warningActionVisibleLocal: true,
    muteActionVisibleLocal: true,
    removePreviewVisibleLocal: true,
    aiHoldReviewVisibleLocal: true,
    auditLogVisibleLocal: true,
    actionRailCleanLocal: true,
  };
}

function ready(state: Stream113NModerationActionsUiuxState, actionId: Stream113NModerationActionId): boolean {
  return state.readyActionIds.includes(actionId);
}

function actionItem(
  id: Stream113NModerationActionId,
  state: Stream113NModerationActionsUiuxState,
  isReady: boolean,
): Stream113NModerationActionItem {
  return {
    id,
    title: ACTION_TITLES[id],
    description: ACTION_DESCRIPTIONS[id],
    status: isReady || ready(state, id) ? "action_ready" : "needs_action",
  };
}

function activeNarrative(
  id: Stream113NModerationActionId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "report_flow") return `Комната ${room.roomId}: нижняя панель жалобы показывает причину, контекст и next step без технического шума.`;
  if (id === "warning_action") return "Предупреждение должно быть первым мягким действием перед мьютом или удалением, чтобы UX был справедливым и понятным.";
  if (id === "mute_action") return "Мьют отображается как локальное намерение модерации: ведущий понимает действие, но приложение не обещает исполнение провайдером до сервера.";
  if (id === "remove_action") return "Удаление предпросмотра показывает удаление как подготовленный шаг, не как фейковую постоянную блокировку и не как юридически завершённое решение.";
  if (id === "ai_hold_review") return `AI hold review открывает панель модерации: ${stage.moderationRailVisible ? "панель видна" : "панель свёрнута"}, без fake AI verdict.`;
  if (id === "audit_log") return "Журнал действий делает контроль прозрачным: жалоба, предупреждение, мьют, удаление предпросмотра, удержание Sabi AI и граница видны одной историей.";
  return "Граница честная: UI/UX готов, но постоянная блокировка, исполнение провайдером, юридическое подтверждение, санкции реального времени и платежи не симулируются.";
}

export function buildStream113NModerationActionsUiuxEvidence(
  state: Stream113NModerationActionsUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  aiSafety: Stream113MAiAdminSafetyModerationUiuxEvidence,
): Stream113NModerationActionsUiuxEvidence {
  const safeBoundaryReady = state.providerEnforcementReady === false
    && state.fakePermanentBanAllowed === false
    && state.fakeLegalApprovalAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false
    && aiSafety.autoPermanentBanAllowed === false
    && aiSafety.fakeAiDecisionAllowed === false
    && aiSafety.fakeProviderAllowed === false
    && aiSafety.fakeRealtimeAllowed === false
    && aiSafety.fakeLiveAllowed === false
    && aiSafety.fakePaymentAllowed === false;

  const actions: readonly Stream113NModerationActionItem[] = [
    actionItem("report_flow", state, state.reportSheetVisibleLocal),
    actionItem("warning_action", state, state.warningActionVisibleLocal),
    actionItem("mute_action", state, state.muteActionVisibleLocal),
    actionItem("remove_action", state, state.removePreviewVisibleLocal),
    actionItem("ai_hold_review", state, state.aiHoldReviewVisibleLocal),
    actionItem("audit_log", state, state.auditLogVisibleLocal && state.actionRailCleanLocal),
    actionItem("safe_boundary", state, state.actionRailCleanLocal && safeBoundaryReady),
  ];

  const readyActions = actions.filter((item) => item.status === "action_ready").length;
  const totalActions = actions.length;
  const premiumScore = Math.round((readyActions / totalActions) * 100);
  const next = actions.find((item) => item.status === "needs_action");
  const active = actions.find((item) => item.id === state.selectedActionId) ?? actions[0];

  return {
    version: "STREAM-113N",
    selectedActionId: state.selectedActionId,
    premiumScore,
    readyActions,
    totalActions,
    actions,
    heroTitle: "Действия модерации: жалоба, предупреждение, мьют, удаление, удержание",
    heroSubtitle: "Sabi AI и ведущий получают чистый UX действий: жалоба, предупреждение, мьют, удаление предпросмотра, удержание для проверки и журнал.",
    phoneStatus: `${room.status} · moderation actions · ${premiumScore}% UX`,
    actionSummary: "Жалоба → предупреждение → мьют → удаление предпросмотра → удержание Sabi AI → журнал → честная граница",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113N действия модерации закрыты: действия выглядят как продуктовый UX безопасности, без фейковой блокировки и фейкового исполнения провайдером.",
    secondaryAction: state.lastAction,
    moderationActionsUxReady: readyActions === totalActions && aiSafety.aiAdminUxReady,
    reportFlowReady: state.reportSheetVisibleLocal,
    warningReady: state.warningActionVisibleLocal,
    muteReady: state.muteActionVisibleLocal,
    removePreviewReady: state.removePreviewVisibleLocal,
    aiHoldReviewReady: state.aiHoldReviewVisibleLocal,
    auditLogReady: state.auditLogVisibleLocal && state.actionRailCleanLocal,
    providerEnforcementReady: false,
    fakePermanentBanAllowed: false,
    fakeLegalApprovalAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
