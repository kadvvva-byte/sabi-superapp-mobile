import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113QModerationTrustDashboardUiuxEvidence } from "./stream113qModerationTrustDashboardUiuxRuntime";

export type Stream113RModerationOnboardingCheckpointId =
  | "creator_intro"
  | "age_gate_brief"
  | "chat_rules_brief"
  | "ai_controller_brief"
  | "moderator_action_brief"
  | "appeal_review_brief"
  | "backend_boundary_brief"
  | "ready_to_host_brief";

export type Stream113RModerationOnboardingCheckpointStatus = "checkpoint_ready" | "needs_attention";

export type Stream113RModerationOnboardingCheckpoint = {
  readonly id: Stream113RModerationOnboardingCheckpointId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113RModerationOnboardingCheckpointStatus;
};

export type Stream113RModerationOnboardingChecklistUiuxState = {
  readonly version: "STREAM-113R";
  readonly selectedCheckpointId: Stream113RModerationOnboardingCheckpointId;
  readonly readyCheckpointIds: readonly Stream113RModerationOnboardingCheckpointId[];
  readonly lastAction: string;
  readonly creatorIntroVisibleLocal: boolean;
  readonly ageGateBriefVisibleLocal: boolean;
  readonly chatRulesBriefVisibleLocal: boolean;
  readonly aiControllerBriefVisibleLocal: boolean;
  readonly moderatorActionBriefVisibleLocal: boolean;
  readonly appealReviewBriefVisibleLocal: boolean;
  readonly backendBoundaryBriefVisibleLocal: boolean;
  readonly readyToHostBriefVisibleLocal: boolean;
  readonly backendOnboardingReady: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAiAutoBanAllowed: false;
  readonly fakePermanentSanctionAllowed: false;
  readonly fakeLegalApprovalAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113RModerationOnboardingChecklistUiuxEvidence = {
  readonly version: "STREAM-113R";
  readonly selectedCheckpointId: Stream113RModerationOnboardingCheckpointId;
  readonly premiumScore: number;
  readonly readyCheckpoints: number;
  readonly totalCheckpoints: number;
  readonly checkpointItems: readonly Stream113RModerationOnboardingCheckpoint[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly onboardingSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly moderationOnboardingUxReady: boolean;
  readonly creatorIntroReady: boolean;
  readonly ageGateBriefReady: boolean;
  readonly chatRulesBriefReady: boolean;
  readonly aiControllerBriefReady: boolean;
  readonly moderatorActionBriefReady: boolean;
  readonly appealReviewBriefReady: boolean;
  readonly backendOnboardingReady: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAiAutoBanAllowed: false;
  readonly fakePermanentSanctionAllowed: false;
  readonly fakeLegalApprovalAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const CHECKPOINT_ORDER: readonly Stream113RModerationOnboardingCheckpointId[] = [
  "creator_intro",
  "age_gate_brief",
  "chat_rules_brief",
  "ai_controller_brief",
  "moderator_action_brief",
  "appeal_review_brief",
  "backend_boundary_brief",
  "ready_to_host_brief",
];

const CHECKPOINT_TITLES: Record<Stream113RModerationOnboardingCheckpointId, string> = {
  creator_intro: "Короткий ввод для ведущего",
  age_gate_brief: "18+ перед эфиром",
  chat_rules_brief: "Правила чата",
  ai_controller_brief: "Sabi AI контролёр",
  moderator_action_brief: "Действия модерации",
  appeal_review_brief: "Жалобы и апелляция",
  backend_boundary_brief: "Честная серверная граница",
  ready_to_host_brief: "Готовность к эфиру",
};

const CHECKPOINT_DESCRIPTIONS: Record<Stream113RModerationOnboardingCheckpointId, string> = {
  creator_intro: "Ведущий видит короткое объяснение безопасности Stream без длинной технической панели и без языка проверки качества.",
  age_gate_brief: "18+ показан как понятная UI-проверка: предупреждение, контекст и ручной контроль без фейковой проверки документа.",
  chat_rules_brief: "Правила чата объясняют ругательства, оскорбления и травлю человеческим языком до старта эфира.",
  ai_controller_brief: "Sabi AI описан как контролёр и проверяющий: подсвечивает риск, но не делает фейковую авто-блокировку и не заменяет ведущего.",
  moderator_action_brief: "Предупреждение, мьют, удаление предпросмотра и удержание проверки объяснены как лестница действий, не как фейковое серверное исполнение.",
  appeal_review_brief: "Жалобы, доказательства, проверка и апелляция показаны как честный путь пересмотра без фейкового юридического доказательства.",
  backend_boundary_brief: "Понятно написано, что backend/Admin/исполнение провайдером подключаются позже и сейчас не симулируются.",
  ready_to_host_brief: "Один итоговый экран говорит ведущему, что UI/UX контроля готов к live-preview без фейковый эфир/provider/payments.",
};

export function createInitialStream113RModerationOnboardingChecklistUiuxState(): Stream113RModerationOnboardingChecklistUiuxState {
  return {
    version: "STREAM-113R",
    selectedCheckpointId: "creator_intro",
    readyCheckpointIds: ["backend_boundary_brief"],
    lastAction: "113R начал moderation onboarding: ведущий получает понятную safety-инструкцию перед эфиром без debug-панелей.",
    creatorIntroVisibleLocal: true,
    ageGateBriefVisibleLocal: false,
    chatRulesBriefVisibleLocal: false,
    aiControllerBriefVisibleLocal: false,
    moderatorActionBriefVisibleLocal: false,
    appealReviewBriefVisibleLocal: false,
    backendBoundaryBriefVisibleLocal: true,
    readyToHostBriefVisibleLocal: false,
    backendOnboardingReady: false,
    fakeAgeVerificationAllowed: false,
    fakeAiAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakeLegalApprovalAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113RModerationOnboardingCheckpoint(
  state: Stream113RModerationOnboardingChecklistUiuxState,
  selectedCheckpointId: Stream113RModerationOnboardingCheckpointId,
): Stream113RModerationOnboardingChecklistUiuxState {
  return { ...state, selectedCheckpointId, lastAction: `Открыт 113R onboarding checkpoint: ${CHECKPOINT_TITLES[selectedCheckpointId]}.` };
}

export function markStream113RModerationOnboardingCheckpointReady(
  state: Stream113RModerationOnboardingChecklistUiuxState,
  checkpointId: Stream113RModerationOnboardingCheckpointId,
  action: string,
): Stream113RModerationOnboardingChecklistUiuxState {
  const readyCheckpointIds = state.readyCheckpointIds.includes(checkpointId) ? state.readyCheckpointIds : [...state.readyCheckpointIds, checkpointId];
  return {
    ...state,
    selectedCheckpointId: checkpointId,
    readyCheckpointIds,
    lastAction: action,
    creatorIntroVisibleLocal: state.creatorIntroVisibleLocal || checkpointId === "creator_intro",
    ageGateBriefVisibleLocal: state.ageGateBriefVisibleLocal || checkpointId === "age_gate_brief",
    chatRulesBriefVisibleLocal: state.chatRulesBriefVisibleLocal || checkpointId === "chat_rules_brief",
    aiControllerBriefVisibleLocal: state.aiControllerBriefVisibleLocal || checkpointId === "ai_controller_brief",
    moderatorActionBriefVisibleLocal: state.moderatorActionBriefVisibleLocal || checkpointId === "moderator_action_brief",
    appealReviewBriefVisibleLocal: state.appealReviewBriefVisibleLocal || checkpointId === "appeal_review_brief",
    backendBoundaryBriefVisibleLocal: state.backendBoundaryBriefVisibleLocal || checkpointId === "backend_boundary_brief",
    readyToHostBriefVisibleLocal: state.readyToHostBriefVisibleLocal || checkpointId === "ready_to_host_brief",
  };
}

export function markStream113RModerationOnboardingAllReady(
  state: Stream113RModerationOnboardingChecklistUiuxState,
  action: string,
): Stream113RModerationOnboardingChecklistUiuxState {
  return {
    ...state,
    selectedCheckpointId: "ready_to_host_brief",
    readyCheckpointIds: CHECKPOINT_ORDER,
    lastAction: action,
    creatorIntroVisibleLocal: true,
    ageGateBriefVisibleLocal: true,
    chatRulesBriefVisibleLocal: true,
    aiControllerBriefVisibleLocal: true,
    moderatorActionBriefVisibleLocal: true,
    appealReviewBriefVisibleLocal: true,
    backendBoundaryBriefVisibleLocal: true,
    readyToHostBriefVisibleLocal: true,
  };
}

function ready(state: Stream113RModerationOnboardingChecklistUiuxState, checkpointId: Stream113RModerationOnboardingCheckpointId): boolean {
  return state.readyCheckpointIds.includes(checkpointId);
}

function checkpointItem(
  id: Stream113RModerationOnboardingCheckpointId,
  state: Stream113RModerationOnboardingChecklistUiuxState,
  isReady: boolean,
): Stream113RModerationOnboardingCheckpoint {
  return {
    id,
    title: CHECKPOINT_TITLES[id],
    description: CHECKPOINT_DESCRIPTIONS[id],
    status: isReady || ready(state, id) ? "checkpoint_ready" : "needs_attention",
  };
}

function activeNarrative(
  id: Stream113RModerationOnboardingCheckpointId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "creator_intro") return `Ведущий комнаты ${room.roomId} получает короткую safety-инструкцию: что можно, что нельзя, кто контролирует эфир.`;
  if (id === "age_gate_brief") return "18+ включается как понятный визуальный checkpoint перед эфиром; документ, возраст и юридическое подтверждение не подделываются в UI.";
  if (id === "chat_rules_brief") return `Правила чата объясняют риск ругательств/оскорблений до отправки сообщений. Сейчас локально видно ${room.comments.length} сообщений.`;
  if (id === "ai_controller_brief") return `Sabi AI rail ${stage.moderationRailVisible ? "виден" : "свернут"}: AI помогает review/hold, но не становится fake judge.`;
  if (id === "moderator_action_brief") return "Ведущий понимает лестницу реакции: notice → warning → mute intent → remove preview → backend/Admin позже.";
  if (id === "appeal_review_brief") return "Жалоба, evidence, review и апелляция объяснены как один честный путь без юридической имитации.";
  if (id === "backend_boundary_brief") return "Граница явно говорит: фейковый провайдер, фейковое реальное время, фейковый эфир, фейковые платежи и фейковая постоянная блокировка запрещены.";
  return `Готовность ведущего: ${room.status} · ${room.participants.length} участников · safety UI собран в one-thumb journey.`;
}

export function buildStream113RModerationOnboardingChecklistUiuxEvidence(
  state: Stream113RModerationOnboardingChecklistUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  trustDashboard: Stream113QModerationTrustDashboardUiuxEvidence,
): Stream113RModerationOnboardingChecklistUiuxEvidence {
  const safeBoundaryReady = state.backendOnboardingReady === false
    && state.fakeAgeVerificationAllowed === false
    && state.fakeAiAutoBanAllowed === false
    && state.fakePermanentSanctionAllowed === false
    && state.fakeLegalApprovalAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false
    && trustDashboard.backendTrustDashboardReady === false
    && trustDashboard.fakeAgeVerificationAllowed === false
    && trustDashboard.fakeAutoBanAllowed === false
    && trustDashboard.fakePermanentSanctionAllowed === false
    && trustDashboard.fakeLegalProofAllowed === false
    && trustDashboard.fakeProviderAllowed === false
    && trustDashboard.fakeRealtimeAllowed === false
    && trustDashboard.fakeLiveAllowed === false
    && trustDashboard.fakePaymentAllowed === false
    && trustDashboard.cinemaMixAllowed === false;

  const checkpointItems: readonly Stream113RModerationOnboardingCheckpoint[] = [
    checkpointItem("creator_intro", state, state.creatorIntroVisibleLocal),
    checkpointItem("age_gate_brief", state, state.ageGateBriefVisibleLocal && trustDashboard.ageGateSummaryReady),
    checkpointItem("chat_rules_brief", state, state.chatRulesBriefVisibleLocal && trustDashboard.chatSafetySummaryReady),
    checkpointItem("ai_controller_brief", state, state.aiControllerBriefVisibleLocal && trustDashboard.aiReviewSummaryReady),
    checkpointItem("moderator_action_brief", state, state.moderatorActionBriefVisibleLocal && trustDashboard.moderatorActionSummaryReady),
    checkpointItem("appeal_review_brief", state, state.appealReviewBriefVisibleLocal && trustDashboard.appealAuditSummaryReady),
    checkpointItem("backend_boundary_brief", state, state.backendBoundaryBriefVisibleLocal && safeBoundaryReady),
    checkpointItem("ready_to_host_brief", state, state.readyToHostBriefVisibleLocal && trustDashboard.moderationTrustDashboardUxReady),
  ];

  const readyCheckpoints = checkpointItems.filter((item) => item.status === "checkpoint_ready").length;
  const totalCheckpoints = checkpointItems.length;
  const premiumScore = Math.round((readyCheckpoints / totalCheckpoints) * 100);
  const next = checkpointItems.find((item) => item.status === "needs_attention");
  const active = checkpointItems.find((item) => item.id === state.selectedCheckpointId) ?? checkpointItems[0];

  return {
    version: "STREAM-113R",
    selectedCheckpointId: state.selectedCheckpointId,
    premiumScore,
    readyCheckpoints,
    totalCheckpoints,
    checkpointItems,
    heroTitle: "Moderation onboarding: 18+, AI и правила до эфира",
    heroSubtitle: "Ведущий получает короткий премиум safety onboarding: 18+ режим, правила чата, Sabi AI контролёр, действия модерации, жалобы/апелляции и честная backend boundary.",
    phoneStatus: `${room.status} · onboarding · ${premiumScore}% UX`,
    onboardingSummary: "intro → 18+ → chat rules → Sabi AI → actions → appeals → backend boundary → ready to host",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113R onboarding закрыт: ведущий понимает 18+, AI-контроль, жалобы и границы до начала эфира.",
    secondaryAction: state.lastAction,
    moderationOnboardingUxReady: readyCheckpoints === totalCheckpoints && trustDashboard.moderationTrustDashboardUxReady,
    creatorIntroReady: state.creatorIntroVisibleLocal,
    ageGateBriefReady: state.ageGateBriefVisibleLocal,
    chatRulesBriefReady: state.chatRulesBriefVisibleLocal,
    aiControllerBriefReady: state.aiControllerBriefVisibleLocal,
    moderatorActionBriefReady: state.moderatorActionBriefVisibleLocal,
    appealReviewBriefReady: state.appealReviewBriefVisibleLocal,
    backendOnboardingReady: false,
    fakeAgeVerificationAllowed: false,
    fakeAiAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakeLegalApprovalAllowed: false,
    fakeProviderAllowed: false,
    fakeRealtimeAllowed: false,
    fakeLiveAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
