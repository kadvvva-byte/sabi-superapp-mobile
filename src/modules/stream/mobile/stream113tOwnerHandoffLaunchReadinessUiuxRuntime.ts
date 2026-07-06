import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113SLiveSafePreflightLaunchGuardUiuxEvidence } from "./stream113sLiveSafePreflightLaunchGuardUiuxRuntime";

export type Stream113TOwnerHandoffSectionId =
  | "premium_phone_ui"
  | "host_journey"
  | "viewer_journey"
  | "safety_control"
  | "adult_gate"
  | "launch_guard"
  | "backend_provider_boundary"
  | "owner_next_step";

export type Stream113TOwnerHandoffSectionStatus = "handoff_ready" | "needs_owner_review";

export type Stream113TOwnerHandoffSection = {
  readonly id: Stream113TOwnerHandoffSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113TOwnerHandoffSectionStatus;
};

export type Stream113TOwnerHandoffLaunchReadinessUiuxState = {
  readonly version: "STREAM-113T";
  readonly selectedSectionId: Stream113TOwnerHandoffSectionId;
  readonly readySectionIds: readonly Stream113TOwnerHandoffSectionId[];
  readonly lastAction: string;
  readonly phoneUiOwnerReviewedLocal: boolean;
  readonly hostJourneyOwnerReviewedLocal: boolean;
  readonly viewerJourneyOwnerReviewedLocal: boolean;
  readonly safetyOwnerReviewedLocal: boolean;
  readonly adultGateOwnerReviewedLocal: boolean;
  readonly launchGuardOwnerReviewedLocal: boolean;
  readonly backendBoundaryOwnerReviewedLocal: boolean;
  readonly ownerNextStepReviewedLocal: boolean;
  readonly backendProviderLiveReady: false;
  readonly launchAllowedNow: false;
  readonly fakeOwnerApprovalAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAiAutoBanAllowed: false;
  readonly fakePermanentBanAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113TOwnerHandoffLaunchReadinessUiuxEvidence = {
  readonly version: "STREAM-113T";
  readonly selectedSectionId: Stream113TOwnerHandoffSectionId;
  readonly premiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream113TOwnerHandoffSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly handoffSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly ownerHandoffUiuxReady: boolean;
  readonly streamUiuxPresentationReady: boolean;
  readonly realLaunchStillBlocked: true;
  readonly backendProviderLiveReady: false;
  readonly launchAllowedNow: false;
  readonly fakeOwnerApprovalAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeAiAutoBanAllowed: false;
  readonly fakePermanentBanAllowed: false;
  readonly cinemaMixAllowed: false;
};

const SECTION_ORDER: readonly Stream113TOwnerHandoffSectionId[] = [
  "premium_phone_ui",
  "host_journey",
  "viewer_journey",
  "safety_control",
  "adult_gate",
  "launch_guard",
  "backend_provider_boundary",
  "owner_next_step",
];

const SECTION_TITLES: Record<Stream113TOwnerHandoffSectionId, string> = {
  premium_phone_ui: "Premium phone UI",
  host_journey: "Host journey",
  viewer_journey: "Viewer journey",
  safety_control: "Safety control",
  adult_gate: "18+ control",
  launch_guard: "Launch guard",
  backend_provider_boundary: "Backend/provider boundary",
  owner_next_step: "Owner next step",
};

const SECTION_DESCRIPTIONS: Record<Stream113TOwnerHandoffSectionId, string> = {
  premium_phone_ui: "Главный Stream экран, settings, action sheets, density и clean phone mode выглядят как продуктовый UX, не как QA/debug.",
  host_journey: "Ведущий понимает путь: подготовить эфир, открыть экран, управлять людьми/чатом, дуэлью/share и безопасно завершить.",
  viewer_journey: "Зрительский путь показывает чат, аудиторию, co-host/дуэль/share и empty/error состояния без ощущения сломанного экрана.",
  safety_control: "Sabi AI показан как админ/контролёр: ругательства, оскорбления, травля, жалобы, evidence, review и appeal.",
  adult_gate: "18+ режим показан честно как UI-проверка и правила эфира, без фейковая проверка возраста/юридическое подтверждение.",
  launch_guard: "Перед настоящим запуском видна блокировка live/realtime/provider и safe preview readiness без fake launch.",
  backend_provider_boundary: "Backend/исполнение провайдером, realtime, media provider и permanent sanctions не симулируются на mobile UI.",
  owner_next_step: "Owner видит, что UI/UX Stream доведён до presentation-ready слоя, а реальный live запуск ждёт backend/provider.",
};

export function createInitialStream113TOwnerHandoffLaunchReadinessUiuxState(): Stream113TOwnerHandoffLaunchReadinessUiuxState {
  return {
    version: "STREAM-113T",
    selectedSectionId: "premium_phone_ui",
    readySectionIds: ["backend_provider_boundary"],
    lastAction: "113T начал owner handoff: Stream UI/UX готовится как premium presentation-ready слой без fake launch.",
    phoneUiOwnerReviewedLocal: true,
    hostJourneyOwnerReviewedLocal: false,
    viewerJourneyOwnerReviewedLocal: false,
    safetyOwnerReviewedLocal: false,
    adultGateOwnerReviewedLocal: false,
    launchGuardOwnerReviewedLocal: false,
    backendBoundaryOwnerReviewedLocal: true,
    ownerNextStepReviewedLocal: false,
    backendProviderLiveReady: false,
    launchAllowedNow: false,
    fakeOwnerApprovalAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeAgeVerificationAllowed: false,
    fakeAiAutoBanAllowed: false,
    fakePermanentBanAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113TOwnerHandoffSection(
  state: Stream113TOwnerHandoffLaunchReadinessUiuxState,
  selectedSectionId: Stream113TOwnerHandoffSectionId,
): Stream113TOwnerHandoffLaunchReadinessUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113T owner handoff section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113TOwnerHandoffSectionReady(
  state: Stream113TOwnerHandoffLaunchReadinessUiuxState,
  sectionId: Stream113TOwnerHandoffSectionId,
  action: string,
): Stream113TOwnerHandoffLaunchReadinessUiuxState {
  const readySectionIds = state.readySectionIds.includes(sectionId) ? state.readySectionIds : [...state.readySectionIds, sectionId];
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    lastAction: action,
    phoneUiOwnerReviewedLocal: state.phoneUiOwnerReviewedLocal || sectionId === "premium_phone_ui",
    hostJourneyOwnerReviewedLocal: state.hostJourneyOwnerReviewedLocal || sectionId === "host_journey",
    viewerJourneyOwnerReviewedLocal: state.viewerJourneyOwnerReviewedLocal || sectionId === "viewer_journey",
    safetyOwnerReviewedLocal: state.safetyOwnerReviewedLocal || sectionId === "safety_control",
    adultGateOwnerReviewedLocal: state.adultGateOwnerReviewedLocal || sectionId === "adult_gate",
    launchGuardOwnerReviewedLocal: state.launchGuardOwnerReviewedLocal || sectionId === "launch_guard",
    backendBoundaryOwnerReviewedLocal: state.backendBoundaryOwnerReviewedLocal || sectionId === "backend_provider_boundary",
    ownerNextStepReviewedLocal: state.ownerNextStepReviewedLocal || sectionId === "owner_next_step",
  };
}

export function markStream113TOwnerHandoffAllReady(
  state: Stream113TOwnerHandoffLaunchReadinessUiuxState,
  action: string,
): Stream113TOwnerHandoffLaunchReadinessUiuxState {
  return {
    ...state,
    selectedSectionId: "owner_next_step",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    phoneUiOwnerReviewedLocal: true,
    hostJourneyOwnerReviewedLocal: true,
    viewerJourneyOwnerReviewedLocal: true,
    safetyOwnerReviewedLocal: true,
    adultGateOwnerReviewedLocal: true,
    launchGuardOwnerReviewedLocal: true,
    backendBoundaryOwnerReviewedLocal: true,
    ownerNextStepReviewedLocal: true,
  };
}

function sectionReady(state: Stream113TOwnerHandoffLaunchReadinessUiuxState, sectionId: Stream113TOwnerHandoffSectionId): boolean {
  return state.readySectionIds.includes(sectionId);
}

function sectionItem(
  id: Stream113TOwnerHandoffSectionId,
  state: Stream113TOwnerHandoffLaunchReadinessUiuxState,
  upstreamReady: boolean,
): Stream113TOwnerHandoffSection {
  return {
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: upstreamReady || sectionReady(state, id) ? "handoff_ready" : "needs_owner_review",
  };
}

function activeNarrative(
  id: Stream113TOwnerHandoffSectionId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  if (id === "premium_phone_ui") return `Room ${room.roomId}: clean phone mode, premium settings, action dock и density готовы для owner review.`;
  if (id === "host_journey") return "Ведущий получает один понятный путь без прыжков между debug-панелями.";
  if (id === "viewer_journey") return `Зрительский UX держит чат/аудиторию/empty states в продуктовой форме: участников ${room.participants.length}.`;
  if (id === "safety_control") return `Sabi AI панель модерации ${stage.moderationRailVisible ? "открыт" : "доступен"}: контроль без fake auto-ban и fake verdict.`;
  if (id === "adult_gate") return "18+ показан как предупреждение, режим и правила; документы/юридическое подтверждение не подделываются.";
  if (id === "launch_guard") return "Настоящая кнопка запуска должна оставаться заблокированной, пока нет backend/realtime/provider.";
  if (id === "backend_provider_boundary") return "Mobile UI не подменяет сервер: no фейковый эфир, no фейковый провайдер, no фейковые платежи, no фейковая постоянная блокировка.";
  return "Следующий честный шаг: backend/realtime/media provider integration, затем реальный launch smoke на двух устройствах.";
}

export function buildStream113TOwnerHandoffLaunchReadinessUiuxEvidence(
  state: Stream113TOwnerHandoffLaunchReadinessUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  preflight: Stream113SLiveSafePreflightLaunchGuardUiuxEvidence,
): Stream113TOwnerHandoffLaunchReadinessUiuxEvidence {
  const boundaryReady = state.backendProviderLiveReady === false
    && state.launchAllowedNow === false
    && state.fakeOwnerApprovalAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeAgeVerificationAllowed === false
    && state.fakeAiAutoBanAllowed === false
    && state.fakePermanentBanAllowed === false
    && state.cinemaMixAllowed === false
    && preflight.launchButtonShouldStayBlocked
    && preflight.fakeLaunchAllowed === false
    && preflight.fakeOnAirAllowed === false
    && preflight.fakeProviderAllowed === false
    && preflight.fakeRealtimeAllowed === false
    && preflight.fakePaymentAllowed === false;

  const sectionItems: readonly Stream113TOwnerHandoffSection[] = [
    sectionItem("premium_phone_ui", state, state.phoneUiOwnerReviewedLocal || preflight.premiumScore >= 80),
    sectionItem("host_journey", state, state.hostJourneyOwnerReviewedLocal),
    sectionItem("viewer_journey", state, state.viewerJourneyOwnerReviewedLocal),
    sectionItem("safety_control", state, state.safetyOwnerReviewedLocal || preflight.liveSafePreflightUxReady),
    sectionItem("adult_gate", state, state.adultGateOwnerReviewedLocal || preflight.fakeAgeVerificationAllowed === false),
    sectionItem("launch_guard", state, state.launchGuardOwnerReviewedLocal || preflight.launchButtonShouldStayBlocked),
    sectionItem("backend_provider_boundary", state, state.backendBoundaryOwnerReviewedLocal || boundaryReady),
    sectionItem("owner_next_step", state, state.ownerNextStepReviewedLocal),
  ];
  const readySections = sectionItems.filter((item) => item.status === "handoff_ready").length;
  const totalSections = sectionItems.length;
  const active = sectionItems.find((item) => item.id === state.selectedSectionId) ?? sectionItems[0];
  const next = sectionItems.find((item) => item.status === "needs_owner_review");
  const ownerHandoffUiuxReady = readySections === totalSections && boundaryReady && preflight.launchButtonShouldStayBlocked;
  const premiumScore = Math.round((readySections / totalSections) * 100);

  return {
    version: "STREAM-113T",
    selectedSectionId: state.selectedSectionId,
    premiumScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Owner handoff: Stream UI/UX presentation-ready",
    heroSubtitle: "Единый итоговый экран показывает, что UI/UX доведён до премиум уровня, а реальный live запуск честно ждёт backend/provider.",
    phoneStatus: ownerHandoffUiuxReady ? "Presentation-ready UI/UX · real launch blocked" : "Owner review in progress · safe preview only",
    handoffSummary: `${readySections}/${totalSections} секций закрыто · backend/provider live: not ready · launch: blocked`,
    activeTitle: active.title,
    activeNarrative: activeNarrative(state.selectedSectionId, room, stage),
    primaryAction: next ? `${next.title}: ${next.description}` : "113T handoff закрыт: UI/UX готов как presentation-ready, но реальный live launch всё ещё заблокирован до backend/provider.",
    secondaryAction: state.lastAction,
    ownerHandoffUiuxReady,
    streamUiuxPresentationReady: ownerHandoffUiuxReady,
    realLaunchStillBlocked: true,
    backendProviderLiveReady: false,
    launchAllowedNow: false,
    fakeOwnerApprovalAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeAgeVerificationAllowed: false,
    fakeAiAutoBanAllowed: false,
    fakePermanentBanAllowed: false,
    cinemaMixAllowed: false,
  };
}
