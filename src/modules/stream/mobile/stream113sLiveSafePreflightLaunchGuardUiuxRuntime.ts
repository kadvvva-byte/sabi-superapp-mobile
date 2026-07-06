import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113RModerationOnboardingChecklistUiuxEvidence } from "./stream113rModerationOnboardingChecklistUiuxRuntime";

export type Stream113SLiveSafePreflightStepId =
  | "phone_surface_ready"
  | "age_gate_ready"
  | "ai_guard_ready"
  | "chat_policy_ready"
  | "reports_ready"
  | "host_controls_ready"
  | "provider_boundary_ready"
  | "safe_to_preview_ready";

export type Stream113SLiveSafePreflightStepStatus = "preflight_ready" | "needs_attention";

export type Stream113SLiveSafePreflightStep = {
  readonly id: Stream113SLiveSafePreflightStepId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113SLiveSafePreflightStepStatus;
};

export type Stream113SLiveSafePreflightLaunchGuardUiuxState = {
  readonly version: "STREAM-113S";
  readonly selectedStepId: Stream113SLiveSafePreflightStepId;
  readonly readyStepIds: readonly Stream113SLiveSafePreflightStepId[];
  readonly lastAction: string;
  readonly phoneSurfaceCheckedLocal: boolean;
  readonly ageGateCheckedLocal: boolean;
  readonly aiGuardCheckedLocal: boolean;
  readonly chatPolicyCheckedLocal: boolean;
  readonly reportsCheckedLocal: boolean;
  readonly hostControlsCheckedLocal: boolean;
  readonly providerBoundaryCheckedLocal: boolean;
  readonly safePreviewCheckedLocal: boolean;
  readonly backendLaunchGuardReady: false;
  readonly providerLiveReady: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAiAutoBanAllowed: false;
  readonly fakePermanentSanctionAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113SLiveSafePreflightLaunchGuardUiuxEvidence = {
  readonly version: "STREAM-113S";
  readonly selectedStepId: Stream113SLiveSafePreflightStepId;
  readonly premiumScore: number;
  readonly readySteps: number;
  readonly totalSteps: number;
  readonly stepItems: readonly Stream113SLiveSafePreflightStep[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly preflightSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly liveSafePreflightUxReady: boolean;
  readonly launchButtonShouldStayBlocked: boolean;
  readonly backendLaunchGuardReady: false;
  readonly providerLiveReady: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeOnAirAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAiAutoBanAllowed: false;
  readonly fakePermanentSanctionAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const STEP_ORDER: readonly Stream113SLiveSafePreflightStepId[] = [
  "phone_surface_ready",
  "age_gate_ready",
  "ai_guard_ready",
  "chat_policy_ready",
  "reports_ready",
  "host_controls_ready",
  "provider_boundary_ready",
  "safe_to_preview_ready",
];

const STEP_TITLES: Record<Stream113SLiveSafePreflightStepId, string> = {
  phone_surface_ready: "Экран эфира готов",
  age_gate_ready: "18+ checkpoint",
  ai_guard_ready: "Sabi AI контроль",
  chat_policy_ready: "Правила чата",
  reports_ready: "Жалобы и review",
  host_controls_ready: "Контроль ведущего",
  provider_boundary_ready: "Backend/provider boundary",
  safe_to_preview_ready: "Готово к preview",
};

const STEP_DESCRIPTIONS: Record<Stream113SLiveSafePreflightStepId, string> = {
  phone_surface_ready: "Главный Stream экран, нижний чат, действия и density выглядят как продуктовый phone UX, не как QA-панель.",
  age_gate_ready: "18+ показан до старта как честная UI-проверка без поддельной проверки документов или юридическое подтверждение.",
  ai_guard_ready: "Sabi AI объяснён как контролёр/reviewer: подсвечивает риск, ставит hold, но не делает фейковая авто-блокировка.",
  chat_policy_ready: "Ругательства, оскорбления и травля объяснены в правилах до эфира, чтобы ведущий видел безопасный сценарий.",
  reports_ready: "Жалобы, evidence, appeal и audit находятся в понятном review flow без фейковое решение и фейковая постоянная блокировка.",
  host_controls_ready: "Ведущий видит warning, mute intent, remove preview и ручной контроль действий перед backend enforcement.",
  provider_boundary_ready: "Live/realtime/provider/backend launch остаются честно заблокированы, пока нет настоящей интеграции.",
  safe_to_preview_ready: "Финальный preflight даёт только safe preview/local UI readiness, но не включает фейковый эфир launch.",
};

export function createInitialStream113SLiveSafePreflightLaunchGuardUiuxState(): Stream113SLiveSafePreflightLaunchGuardUiuxState {
  return {
    version: "STREAM-113S",
    selectedStepId: "phone_surface_ready",
    readyStepIds: ["provider_boundary_ready"],
    lastAction: "113S начал live-safe preflight: ведущий видит UI readiness и честную блокировку fake launch.",
    phoneSurfaceCheckedLocal: true,
    ageGateCheckedLocal: false,
    aiGuardCheckedLocal: false,
    chatPolicyCheckedLocal: false,
    reportsCheckedLocal: false,
    hostControlsCheckedLocal: false,
    providerBoundaryCheckedLocal: true,
    safePreviewCheckedLocal: false,
    backendLaunchGuardReady: false,
    providerLiveReady: false,
    fakeLaunchAllowed: false,
    fakeOnAirAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeAgeVerificationAllowed: false,
    fakeAiAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113SLiveSafePreflightStep(
  state: Stream113SLiveSafePreflightLaunchGuardUiuxState,
  selectedStepId: Stream113SLiveSafePreflightStepId,
): Stream113SLiveSafePreflightLaunchGuardUiuxState {
  return { ...state, selectedStepId, lastAction: `Открыт 113S preflight step: ${STEP_TITLES[selectedStepId]}.` };
}

export function markStream113SLiveSafePreflightStepReady(
  state: Stream113SLiveSafePreflightLaunchGuardUiuxState,
  stepId: Stream113SLiveSafePreflightStepId,
  action: string,
): Stream113SLiveSafePreflightLaunchGuardUiuxState {
  const readyStepIds = state.readyStepIds.includes(stepId) ? state.readyStepIds : [...state.readyStepIds, stepId];
  return {
    ...state,
    selectedStepId: stepId,
    readyStepIds,
    lastAction: action,
    phoneSurfaceCheckedLocal: state.phoneSurfaceCheckedLocal || stepId === "phone_surface_ready",
    ageGateCheckedLocal: state.ageGateCheckedLocal || stepId === "age_gate_ready",
    aiGuardCheckedLocal: state.aiGuardCheckedLocal || stepId === "ai_guard_ready",
    chatPolicyCheckedLocal: state.chatPolicyCheckedLocal || stepId === "chat_policy_ready",
    reportsCheckedLocal: state.reportsCheckedLocal || stepId === "reports_ready",
    hostControlsCheckedLocal: state.hostControlsCheckedLocal || stepId === "host_controls_ready",
    providerBoundaryCheckedLocal: state.providerBoundaryCheckedLocal || stepId === "provider_boundary_ready",
    safePreviewCheckedLocal: state.safePreviewCheckedLocal || stepId === "safe_to_preview_ready",
  };
}

export function markStream113SLiveSafePreflightAllReady(
  state: Stream113SLiveSafePreflightLaunchGuardUiuxState,
  action: string,
): Stream113SLiveSafePreflightLaunchGuardUiuxState {
  return {
    ...state,
    selectedStepId: "safe_to_preview_ready",
    readyStepIds: STEP_ORDER,
    lastAction: action,
    phoneSurfaceCheckedLocal: true,
    ageGateCheckedLocal: true,
    aiGuardCheckedLocal: true,
    chatPolicyCheckedLocal: true,
    reportsCheckedLocal: true,
    hostControlsCheckedLocal: true,
    providerBoundaryCheckedLocal: true,
    safePreviewCheckedLocal: true,
  };
}

function ready(state: Stream113SLiveSafePreflightLaunchGuardUiuxState, stepId: Stream113SLiveSafePreflightStepId): boolean {
  return state.readyStepIds.includes(stepId);
}

function stepItem(
  id: Stream113SLiveSafePreflightStepId,
  state: Stream113SLiveSafePreflightLaunchGuardUiuxState,
  isReady: boolean,
): Stream113SLiveSafePreflightStep {
  return {
    id,
    title: STEP_TITLES[id],
    description: STEP_DESCRIPTIONS[id],
    status: isReady || ready(state, id) ? "preflight_ready" : "needs_attention",
  };
}

function activeNarrative(
  id: Stream113SLiveSafePreflightStepId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "phone_surface_ready") return `Комната ${room.roomId}: phone surface остаётся чистым, техпанели скрыты, основной UX не перегружен.`;
  if (id === "age_gate_ready") return "18+ checkpoint виден до старта как предупреждение и ручной контроль, но без фейковая проверка возраста/юридическое подтверждение.";
  if (id === "ai_guard_ready") return `Sabi AI rail ${stage.moderationRailVisible ? "открыт" : "свернут"}: AI помогает фильтровать ругательства, оскорбления и травлю без fake auto-ban.`;
  if (id === "chat_policy_ready") return `Чат защищён правилами до эфира; текущие локальные сообщения: ${room.comments.length}.`;
  if (id === "reports_ready") return "Жалобы и evidence уходят в review path; итоговое решение не подделывается в UI.";
  if (id === "host_controls_ready") return "Ведущий видит мягкую лестницу реакции: warning → mute intent → remove preview → backend/Admin позже.";
  if (id === "provider_boundary_ready") return "Кнопка настоящего live launch должна оставаться заблокированной до backend/realtime/provider подключения.";
  return `Safe preview готов: ${room.status} · ${room.participants.length} участников · запуск live не симулируется.`;
}

export function buildStream113SLiveSafePreflightLaunchGuardUiuxEvidence(
  state: Stream113SLiveSafePreflightLaunchGuardUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  onboarding: Stream113RModerationOnboardingChecklistUiuxEvidence,
): Stream113SLiveSafePreflightLaunchGuardUiuxEvidence {
  const safeBoundaryReady = state.backendLaunchGuardReady === false
    && state.providerLiveReady === false
    && state.fakeLaunchAllowed === false
    && state.fakeOnAirAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeAgeVerificationAllowed === false
    && state.fakeAiAutoBanAllowed === false
    && state.fakePermanentSanctionAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false
    && onboarding.backendOnboardingReady === false
    && onboarding.fakeAgeVerificationAllowed === false
    && onboarding.fakeAiAutoBanAllowed === false
    && onboarding.fakePermanentSanctionAllowed === false
    && onboarding.fakeLegalApprovalAllowed === false
    && onboarding.fakeProviderAllowed === false
    && onboarding.fakeRealtimeAllowed === false
    && onboarding.fakeLiveAllowed === false
    && onboarding.fakePaymentAllowed === false
    && onboarding.cinemaMixAllowed === false;

  const stepItems: readonly Stream113SLiveSafePreflightStep[] = [
    stepItem("phone_surface_ready", state, state.phoneSurfaceCheckedLocal),
    stepItem("age_gate_ready", state, state.ageGateCheckedLocal && onboarding.ageGateBriefReady),
    stepItem("ai_guard_ready", state, state.aiGuardCheckedLocal && onboarding.aiControllerBriefReady),
    stepItem("chat_policy_ready", state, state.chatPolicyCheckedLocal && onboarding.chatRulesBriefReady),
    stepItem("reports_ready", state, state.reportsCheckedLocal && onboarding.appealReviewBriefReady),
    stepItem("host_controls_ready", state, state.hostControlsCheckedLocal && onboarding.moderatorActionBriefReady),
    stepItem("provider_boundary_ready", state, state.providerBoundaryCheckedLocal && safeBoundaryReady),
    stepItem("safe_to_preview_ready", state, state.safePreviewCheckedLocal && onboarding.moderationOnboardingUxReady && safeBoundaryReady),
  ];

  const readySteps = stepItems.filter((item) => item.status === "preflight_ready").length;
  const totalSteps = stepItems.length;
  const premiumScore = Math.round((readySteps / totalSteps) * 100);
  const next = stepItems.find((item) => item.status === "needs_attention");
  const active = stepItems.find((item) => item.id === state.selectedStepId) ?? stepItems[0];
  const liveSafePreflightUxReady = readySteps === totalSteps && onboarding.moderationOnboardingUxReady && safeBoundaryReady;

  return {
    version: "STREAM-113S",
    selectedStepId: state.selectedStepId,
    premiumScore,
    readySteps,
    totalSteps,
    stepItems,
    heroTitle: "Live-safe preflight: запуск без риска и без фейковый эфир",
    heroSubtitle: "Перед эфиром ведущий видит готовность UI, 18+, Sabi AI-контроль, правила чата, жалобы, ручные действия и честную backend/provider boundary.",
    phoneStatus: `${room.status} · live-safe preflight · ${premiumScore}% UX`,
    preflightSummary: "phone UI → 18+ → Sabi AI → chat rules → reports → host control → backend boundary → safe preview",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113S preflight закрыт: UI/UX готов к safe preview, но настоящий launch остаётся заблокирован до backend/provider.",
    secondaryAction: state.lastAction,
    liveSafePreflightUxReady,
    launchButtonShouldStayBlocked: state.backendLaunchGuardReady === false || state.providerLiveReady === false,
    backendLaunchGuardReady: false,
    providerLiveReady: false,
    fakeLaunchAllowed: false,
    fakeOnAirAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeAgeVerificationAllowed: false,
    fakeAiAutoBanAllowed: false,
    fakePermanentSanctionAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
