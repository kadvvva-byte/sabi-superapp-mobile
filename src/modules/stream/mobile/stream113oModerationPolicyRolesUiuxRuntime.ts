import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113NModerationActionsUiuxEvidence } from "./stream113nModerationActionsUiuxRuntime";

export type Stream113OModerationPolicyRoleId =
  | "age_mode"
  | "chat_rules"
  | "ai_controller"
  | "host_moderator"
  | "guest_moderator"
  | "reaction_levels"
  | "safe_boundary";

export type Stream113OModerationPolicyRoleStatus = "policy_ready" | "needs_policy";

export type Stream113OModerationPolicyRoleItem = {
  readonly id: Stream113OModerationPolicyRoleId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113OModerationPolicyRoleStatus;
};

export type Stream113OModerationPolicyRolesUiuxState = {
  readonly version: "STREAM-113O";
  readonly selectedPolicyId: Stream113OModerationPolicyRoleId;
  readonly readyPolicyIds: readonly Stream113OModerationPolicyRoleId[];
  readonly lastAction: string;
  readonly ageModeVisibleLocal: boolean;
  readonly chatRulesVisibleLocal: boolean;
  readonly aiControllerRoleVisibleLocal: boolean;
  readonly hostModeratorRoleVisibleLocal: boolean;
  readonly guestModeratorRoleVisibleLocal: boolean;
  readonly reactionLevelsVisibleLocal: boolean;
  readonly policyRailCleanLocal: boolean;
  readonly backendPolicyEnforcementReady: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAutoBanAllowed: false;
  readonly fakeLegalApprovalAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113OModerationPolicyRolesUiuxEvidence = {
  readonly version: "STREAM-113O";
  readonly selectedPolicyId: Stream113OModerationPolicyRoleId;
  readonly premiumScore: number;
  readonly readyPolicies: number;
  readonly totalPolicies: number;
  readonly policies: readonly Stream113OModerationPolicyRoleItem[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly policySummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly moderationPolicyRolesUxReady: boolean;
  readonly ageModeReady: boolean;
  readonly chatRulesReady: boolean;
  readonly aiControllerRoleReady: boolean;
  readonly hostModeratorRoleReady: boolean;
  readonly guestModeratorRoleReady: boolean;
  readonly reactionLevelsReady: boolean;
  readonly backendPolicyEnforcementReady: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAutoBanAllowed: false;
  readonly fakeLegalApprovalAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const POLICY_ORDER: readonly Stream113OModerationPolicyRoleId[] = [
  "age_mode",
  "chat_rules",
  "ai_controller",
  "host_moderator",
  "guest_moderator",
  "reaction_levels",
  "safe_boundary",
];

const POLICY_TITLES: Record<Stream113OModerationPolicyRoleId, string> = {
  age_mode: "18+ режим",
  chat_rules: "Правила чата",
  ai_controller: "Sabi AI контролёр",
  host_moderator: "Ведущий",
  guest_moderator: "Модератор",
  reaction_levels: "Уровни реакции",
  safe_boundary: "Граница",
};

const POLICY_DESCRIPTIONS: Record<Stream113OModerationPolicyRoleId, string> = {
  age_mode: "18+ режим объясняет возрастную границу как UI/UX правило и не притворяется юридической проверкой личности.",
  chat_rules: "Правила чата показывают запрет ругательств, оскорблений, травли и взрослого контента понятным языком до старта эфира.",
  ai_controller: "Sabi AI виден как контролёр: подсвечивает риск, отправляет на проверку и предлагает действие, но не делает фейковую авто-блокировку.",
  host_moderator: "Ведущий видит финальное право принять, отклонить, смягчить или усилить действие модерации.",
  guest_moderator: "Модератор эфира получает ограниченную роль: предупреждение, намерение мьюта, проверка жалобы и передача ведущему.",
  reaction_levels: "Уровни реакции идут мягко: уведомление → предупреждение → намерение мьюта → удаление предпросмотра → админ/серверное исполнение позже.",
  safe_boundary: "Нет фейковой 18+ проверки, юридического подтверждения, авто-блокировки, исполнения провайдером, эфира, реального времени или платежей.",
};

export function createInitialStream113OModerationPolicyRolesUiuxState(): Stream113OModerationPolicyRolesUiuxState {
  return {
    version: "STREAM-113O",
    selectedPolicyId: "age_mode",
    readyPolicyIds: ["safe_boundary"],
    lastAction: "113O начал UX правил и ролей модерации: 18+, правила чата, Sabi AI контролёр, ведущий, модератор и уровни реакции.",
    ageModeVisibleLocal: true,
    chatRulesVisibleLocal: false,
    aiControllerRoleVisibleLocal: false,
    hostModeratorRoleVisibleLocal: false,
    guestModeratorRoleVisibleLocal: false,
    reactionLevelsVisibleLocal: false,
    policyRailCleanLocal: true,
    backendPolicyEnforcementReady: false,
    fakeAgeVerificationAllowed: false,
    fakeAutoBanAllowed: false,
    fakeLegalApprovalAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113OModerationPolicyRole(
  state: Stream113OModerationPolicyRolesUiuxState,
  selectedPolicyId: Stream113OModerationPolicyRoleId,
): Stream113OModerationPolicyRolesUiuxState {
  return { ...state, selectedPolicyId, lastAction: `Открыт 113O policy/role: ${POLICY_TITLES[selectedPolicyId]}.` };
}

export function markStream113OModerationPolicyRoleReady(
  state: Stream113OModerationPolicyRolesUiuxState,
  policyId: Stream113OModerationPolicyRoleId,
  action: string,
): Stream113OModerationPolicyRolesUiuxState {
  const readyPolicyIds = state.readyPolicyIds.includes(policyId) ? state.readyPolicyIds : [...state.readyPolicyIds, policyId];

  return {
    ...state,
    selectedPolicyId: policyId,
    readyPolicyIds,
    lastAction: action,
    ageModeVisibleLocal: state.ageModeVisibleLocal || policyId === "age_mode",
    chatRulesVisibleLocal: state.chatRulesVisibleLocal || policyId === "chat_rules",
    aiControllerRoleVisibleLocal: state.aiControllerRoleVisibleLocal || policyId === "ai_controller",
    hostModeratorRoleVisibleLocal: state.hostModeratorRoleVisibleLocal || policyId === "host_moderator",
    guestModeratorRoleVisibleLocal: state.guestModeratorRoleVisibleLocal || policyId === "guest_moderator",
    reactionLevelsVisibleLocal: state.reactionLevelsVisibleLocal || policyId === "reaction_levels",
    policyRailCleanLocal: state.policyRailCleanLocal || policyId === "safe_boundary" || policyId === "reaction_levels",
  };
}

export function markStream113OModerationPolicyRolesAllReady(
  state: Stream113OModerationPolicyRolesUiuxState,
  action: string,
): Stream113OModerationPolicyRolesUiuxState {
  return {
    ...state,
    selectedPolicyId: "safe_boundary",
    readyPolicyIds: POLICY_ORDER,
    lastAction: action,
    ageModeVisibleLocal: true,
    chatRulesVisibleLocal: true,
    aiControllerRoleVisibleLocal: true,
    hostModeratorRoleVisibleLocal: true,
    guestModeratorRoleVisibleLocal: true,
    reactionLevelsVisibleLocal: true,
    policyRailCleanLocal: true,
  };
}

function ready(state: Stream113OModerationPolicyRolesUiuxState, policyId: Stream113OModerationPolicyRoleId): boolean {
  return state.readyPolicyIds.includes(policyId);
}

function policyItem(
  id: Stream113OModerationPolicyRoleId,
  state: Stream113OModerationPolicyRolesUiuxState,
  isReady: boolean,
): Stream113OModerationPolicyRoleItem {
  return {
    id,
    title: POLICY_TITLES[id],
    description: POLICY_DESCRIPTIONS[id],
    status: isReady || ready(state, id) ? "policy_ready" : "needs_policy",
  };
}

function activeNarrative(
  id: Stream113OModerationPolicyRoleId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "age_mode") return `Комната ${room.roomId}: 18+ режим виден как честная UI-проверка, без fake ID/legal verification.`;
  if (id === "chat_rules") return "Правила чата должны быть понятны до сообщения: ругательства, оскорбления и травля ведут к проверке, предупреждению и мьюту.";
  if (id === "ai_controller") return `Sabi AI контролёр работает через панель модерации: ${stage.moderationRailVisible ? "панель видна" : "панель свёрнута"}, без fake verdict.`;
  if (id === "host_moderator") return "Ведущий остаётся главным человеком в контуре: AI предлагает, ведущий подтверждает или отменяет действие.";
  if (id === "guest_moderator") return "Модератор получает ограниченный UX: обработать жалобу, предупреждение, намерение мьюта и передачу выше, но не фейковую постоянную блокировку.";
  if (id === "reaction_levels") return "Реакции идут по лестнице: уведомление → предупреждение → намерение мьюта → удаление предпросмотра → сервер/админ исполнение позже.";
  return "Граница честная: UI правил и ролей готов, но возрастная проверка, юридическое подтверждение, авто-блокировка, исполнение провайдером и санкции реального времени не симулируются.";
}

export function buildStream113OModerationPolicyRolesUiuxEvidence(
  state: Stream113OModerationPolicyRolesUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  moderationActions: Stream113NModerationActionsUiuxEvidence,
): Stream113OModerationPolicyRolesUiuxEvidence {
  const safeBoundaryReady = state.backendPolicyEnforcementReady === false
    && state.fakeAgeVerificationAllowed === false
    && state.fakeAutoBanAllowed === false
    && state.fakeLegalApprovalAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false
    && moderationActions.fakePermanentBanAllowed === false
    && moderationActions.fakeLegalApprovalAllowed === false
    && moderationActions.fakeProviderAllowed === false
    && moderationActions.fakeRealtimeAllowed === false
    && moderationActions.fakeLiveAllowed === false
    && moderationActions.fakePaymentAllowed === false;

  const policies: readonly Stream113OModerationPolicyRoleItem[] = [
    policyItem("age_mode", state, state.ageModeVisibleLocal),
    policyItem("chat_rules", state, state.chatRulesVisibleLocal),
    policyItem("ai_controller", state, state.aiControllerRoleVisibleLocal),
    policyItem("host_moderator", state, state.hostModeratorRoleVisibleLocal),
    policyItem("guest_moderator", state, state.guestModeratorRoleVisibleLocal),
    policyItem("reaction_levels", state, state.reactionLevelsVisibleLocal),
    policyItem("safe_boundary", state, state.policyRailCleanLocal && safeBoundaryReady),
  ];

  const readyPolicies = policies.filter((item) => item.status === "policy_ready").length;
  const totalPolicies = policies.length;
  const premiumScore = Math.round((readyPolicies / totalPolicies) * 100);
  const next = policies.find((item) => item.status === "needs_policy");
  const active = policies.find((item) => item.id === state.selectedPolicyId) ?? policies[0];

  return {
    version: "STREAM-113O",
    selectedPolicyId: state.selectedPolicyId,
    premiumScore,
    readyPolicies,
    totalPolicies,
    policies,
    heroTitle: "Правила модерации: 18+, Sabi AI, роли",
    heroSubtitle: "Stream получает понятные правила 18+, правила чата, роли Sabi AI/ведущего/модератора и уровни реакции без фейковой серверной блокировки.",
    phoneStatus: `${room.status} · moderation policy · ${premiumScore}% UX`,
    policySummary: "18+ проверка → правила чата → контролёр Sabi AI → ведущий → модератор → лестница реакции → честная граница",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113O правила/роли закрыты: модерация Stream выглядит как понятная премиальная настройка, без фейковой авто-блокировки и фейковой проверки возраста.",
    secondaryAction: state.lastAction,
    moderationPolicyRolesUxReady: readyPolicies === totalPolicies && moderationActions.moderationActionsUxReady,
    ageModeReady: state.ageModeVisibleLocal,
    chatRulesReady: state.chatRulesVisibleLocal,
    aiControllerRoleReady: state.aiControllerRoleVisibleLocal,
    hostModeratorRoleReady: state.hostModeratorRoleVisibleLocal,
    guestModeratorRoleReady: state.guestModeratorRoleVisibleLocal,
    reactionLevelsReady: state.reactionLevelsVisibleLocal,
    backendPolicyEnforcementReady: false,
    fakeAgeVerificationAllowed: false,
    fakeAutoBanAllowed: false,
    fakeLegalApprovalAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
