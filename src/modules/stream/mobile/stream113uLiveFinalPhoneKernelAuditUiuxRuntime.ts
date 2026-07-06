import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113TOwnerHandoffLaunchReadinessUiuxEvidence } from "./stream113tOwnerHandoffLaunchReadinessUiuxRuntime";

export type Stream113ULiveFinalPhoneKernelAuditSectionId =
  | "one_screen_phone_audit"
  | "clean_phone_default"
  | "host_viewer_final_path"
  | "safety_moderation_final"
  | "kernel_connection_boundary"
  | "profile_hook_ready"
  | "business_stream_hook_ready"
  | "gift_end_stage_boundary";

export type Stream113ULiveFinalPhoneKernelAuditSectionStatus = "audit_ready" | "needs_final_audit";

export type Stream113ULiveFinalPhoneKernelAuditSection = {
  readonly id: Stream113ULiveFinalPhoneKernelAuditSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113ULiveFinalPhoneKernelAuditSectionStatus;
};

export type Stream113ULiveFinalPhoneKernelAuditUiuxState = {
  readonly version: "STREAM-113U";
  readonly selectedSectionId: Stream113ULiveFinalPhoneKernelAuditSectionId;
  readonly readySectionIds: readonly Stream113ULiveFinalPhoneKernelAuditSectionId[];
  readonly lastAction: string;
  readonly phoneAuditReadyLocal: boolean;
  readonly cleanPhoneDefaultReadyLocal: boolean;
  readonly hostViewerPathReadyLocal: boolean;
  readonly safetyModerationReadyLocal: boolean;
  readonly kernelBoundaryReadyLocal: boolean;
  readonly profileHookReadyLocal: boolean;
  readonly businessStreamHookReadyLocal: boolean;
  readonly giftEndStageBoundaryReadyLocal: boolean;
  readonly allLiveConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly profileScreenImplementationAllowedNow: false;
  readonly businessStreamScreenImplementationAllowedNow: false;
  readonly giftSendImplementationAllowedNow: false;
  readonly backendProviderLiveReady: false;
  readonly launchAllowedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

export type Stream113ULiveFinalPhoneKernelAuditUiuxEvidence = {
  readonly version: "STREAM-113U";
  readonly selectedSectionId: Stream113ULiveFinalPhoneKernelAuditSectionId;
  readonly premiumScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream113ULiveFinalPhoneKernelAuditSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly finalAuditSummary: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly livePhoneUiuxReady: boolean;
  readonly liveUiuxCloseToOneHundred: boolean;
  readonly kernelBoundaryReady: boolean;
  readonly profileHookReady: boolean;
  readonly businessStreamHookReady: boolean;
  readonly giftBoundaryReady: boolean;
  readonly realLaunchStillBlocked: true;
  readonly allLiveConnectionsThroughKernel: true;
  readonly directProviderConnectionAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly scatteredServiceConnectionAllowed: false;
  readonly profileScreenImplementationAllowedNow: false;
  readonly businessStreamScreenImplementationAllowedNow: false;
  readonly giftSendImplementationAllowedNow: false;
  readonly backendProviderLiveReady: false;
  readonly launchAllowedNow: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
};

const SECTION_ORDER: readonly Stream113ULiveFinalPhoneKernelAuditSectionId[] = [
  "one_screen_phone_audit",
  "clean_phone_default",
  "host_viewer_final_path",
  "safety_moderation_final",
  "kernel_connection_boundary",
  "profile_hook_ready",
  "business_stream_hook_ready",
  "gift_end_stage_boundary",
];

const SECTION_TITLES: Record<Stream113ULiveFinalPhoneKernelAuditSectionId, string> = {
  one_screen_phone_audit: "Phone audit",
  clean_phone_default: "Clean phone mode",
  host_viewer_final_path: "Host / viewer path",
  safety_moderation_final: "Safety / moderation",
  kernel_connection_boundary: "Kernel connection boundary",
  profile_hook_ready: "Profile hook",
  business_stream_hook_ready: "Business Stream hook",
  gift_end_stage_boundary: "Gift end-stage boundary",
};

const SECTION_DESCRIPTIONS: Record<Stream113ULiveFinalPhoneKernelAuditSectionId, string> = {
  one_screen_phone_audit: "Финальная проверка телефона: первый экран, spacing, tap targets, scroll, bottom chat, side actions и status не налезают друг на друга.",
  clean_phone_default: "Обычный пользователь видит чистый Live UX; 112N→113T техпанели скрыты и остаются только в техрежиме.",
  host_viewer_final_path: "Путь ведущего и зрителя выглядит цельно: подготовка, экран эфира, чат, люди, co-host, дуэль, share, завершение.",
  safety_moderation_final: "18+, Sabi AI контроль, ругательства, оскорбления, жалобы, review, mute/remove preview и audit собраны в понятный UX.",
  kernel_connection_boundary: "Все future realtime/provider/room lifecycle/host-viewer sync/co-host/battle/moderation connections идут только через core/kernel facade/events.",
  profile_hook_ready: "В Live заранее есть корректная точка для будущей мини-карточки ведущего / official streamer / profile link, но профиль-экран сейчас не создаётся.",
  business_stream_hook_ready: "В Live заранее есть boundary для будущего ordinary/business mode и business host badge, но отдельный Business Stream экран сейчас не создаётся.",
  gift_end_stage_boundary: "Отправка подарков обязательна позже, но сейчас она оставлена как end-stage boundary без фейковые платежи, фейковая отправка подарка и фейковое движение COIN.",
};

export function createInitialStream113ULiveFinalPhoneKernelAuditUiuxState(): Stream113ULiveFinalPhoneKernelAuditUiuxState {
  return {
    version: "STREAM-113U",
    selectedSectionId: "one_screen_phone_audit",
    readySectionIds: ["kernel_connection_boundary", "gift_end_stage_boundary"],
    lastAction: "113U начал финальный Live phone UI/UX audit: порядок Live сначала, Stream потом, все подключения только через kernel.",
    phoneAuditReadyLocal: false,
    cleanPhoneDefaultReadyLocal: false,
    hostViewerPathReadyLocal: false,
    safetyModerationReadyLocal: false,
    kernelBoundaryReadyLocal: true,
    profileHookReadyLocal: false,
    businessStreamHookReadyLocal: false,
    giftEndStageBoundaryReadyLocal: true,
    allLiveConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    profileScreenImplementationAllowedNow: false,
    businessStreamScreenImplementationAllowedNow: false,
    giftSendImplementationAllowedNow: false,
    backendProviderLiveReady: false,
    launchAllowedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  };
}

export function selectStream113ULiveFinalPhoneKernelAuditSection(
  state: Stream113ULiveFinalPhoneKernelAuditUiuxState,
  selectedSectionId: Stream113ULiveFinalPhoneKernelAuditSectionId,
): Stream113ULiveFinalPhoneKernelAuditUiuxState {
  return { ...state, selectedSectionId, lastAction: `Открыт 113U final audit section: ${SECTION_TITLES[selectedSectionId]}.` };
}

export function markStream113ULiveFinalPhoneKernelAuditSectionReady(
  state: Stream113ULiveFinalPhoneKernelAuditUiuxState,
  sectionId: Stream113ULiveFinalPhoneKernelAuditSectionId,
  action: string,
): Stream113ULiveFinalPhoneKernelAuditUiuxState {
  const readySectionIds = state.readySectionIds.includes(sectionId) ? state.readySectionIds : [...state.readySectionIds, sectionId];
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds,
    lastAction: action,
    phoneAuditReadyLocal: state.phoneAuditReadyLocal || sectionId === "one_screen_phone_audit",
    cleanPhoneDefaultReadyLocal: state.cleanPhoneDefaultReadyLocal || sectionId === "clean_phone_default",
    hostViewerPathReadyLocal: state.hostViewerPathReadyLocal || sectionId === "host_viewer_final_path",
    safetyModerationReadyLocal: state.safetyModerationReadyLocal || sectionId === "safety_moderation_final",
    kernelBoundaryReadyLocal: state.kernelBoundaryReadyLocal || sectionId === "kernel_connection_boundary",
    profileHookReadyLocal: state.profileHookReadyLocal || sectionId === "profile_hook_ready",
    businessStreamHookReadyLocal: state.businessStreamHookReadyLocal || sectionId === "business_stream_hook_ready",
    giftEndStageBoundaryReadyLocal: state.giftEndStageBoundaryReadyLocal || sectionId === "gift_end_stage_boundary",
  };
}

export function markStream113ULiveFinalPhoneKernelAuditAllReady(
  state: Stream113ULiveFinalPhoneKernelAuditUiuxState,
  action: string,
): Stream113ULiveFinalPhoneKernelAuditUiuxState {
  return {
    ...state,
    selectedSectionId: "kernel_connection_boundary",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    phoneAuditReadyLocal: true,
    cleanPhoneDefaultReadyLocal: true,
    hostViewerPathReadyLocal: true,
    safetyModerationReadyLocal: true,
    kernelBoundaryReadyLocal: true,
    profileHookReadyLocal: true,
    businessStreamHookReadyLocal: true,
    giftEndStageBoundaryReadyLocal: true,
  };
}

function sectionReady(state: Stream113ULiveFinalPhoneKernelAuditUiuxState, sectionId: Stream113ULiveFinalPhoneKernelAuditSectionId): boolean {
  return state.readySectionIds.includes(sectionId);
}

function sectionItem(
  id: Stream113ULiveFinalPhoneKernelAuditSectionId,
  state: Stream113ULiveFinalPhoneKernelAuditUiuxState,
  upstreamReady: boolean,
): Stream113ULiveFinalPhoneKernelAuditSection {
  return {
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: upstreamReady || sectionReady(state, id) ? "audit_ready" : "needs_final_audit",
  };
}

function selectedTitle(sectionId: Stream113ULiveFinalPhoneKernelAuditSectionId): string {
  return SECTION_TITLES[sectionId];
}

function selectedNarrative(sectionId: Stream113ULiveFinalPhoneKernelAuditSectionId): string {
  return SECTION_DESCRIPTIONS[sectionId];
}

export function buildStream113ULiveFinalPhoneKernelAuditUiuxEvidence(
  state: Stream113ULiveFinalPhoneKernelAuditUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  ownerHandoff: Stream113TOwnerHandoffLaunchReadinessUiuxEvidence,
): Stream113ULiveFinalPhoneKernelAuditUiuxEvidence {
  const ownerReady = ownerHandoff.ownerHandoffUiuxReady || ownerHandoff.streamUiuxPresentationReady;
  const sectionItems = SECTION_ORDER.map((id) => sectionItem(id, state, ownerReady && (id === "kernel_connection_boundary" || id === "gift_end_stage_boundary")));
  const readySections = sectionItems.filter((item) => item.status === "audit_ready").length;
  const totalSections = SECTION_ORDER.length;
  const safetyFlagsClean = state.allLiveConnectionsThroughKernel
    && state.directProviderConnectionAllowed === false
    && state.directRealtimeConnectionAllowed === false
    && state.scatteredServiceConnectionAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false;
  const livePhoneUiuxReady = readySections === totalSections && ownerReady && safetyFlagsClean;
  const activeTitle = selectedTitle(state.selectedSectionId);
  const activeNarrative = selectedNarrative(state.selectedSectionId);
  const roomTitle = room.title || "Sabi Live";
  const stageMode = stage.layout || "portrait_host";
  return {
    version: "STREAM-113U",
    selectedSectionId: state.selectedSectionId,
    premiumScore: Math.round((readySections / totalSections) * 100),
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Финальная телефонная проверка Live UI/UX",
    heroSubtitle: "Доводим Live по порядку до 100%: чистый телефонный UX, future hooks вовремя и все подключения только через core/kernel.",
    phoneStatus: `${roomTitle} · ${room.status} · ${stageMode} · kernel only`,
    finalAuditSummary: livePhoneUiuxReady
      ? "Live phone UI/UX готов как финальный product layer; real launch ждёт kernel/backend/provider."
      : "Live ещё проходит финальный phone audit: закрываем видимость, порядок, safety, kernel boundary и future hooks.",
    activeTitle,
    activeNarrative,
    primaryAction: livePhoneUiuxReady ? "Live UI/UX можно считать закрытым на phone/presentation layer; следующий шаг после ручной проверки — Stream 100%." : `Закрой 113U: ${activeTitle}.`,
    secondaryAction: "Профиль/Business hooks добавлены как boundary внутри Live, подарки остаются end-stage функцией.",
    livePhoneUiuxReady,
    liveUiuxCloseToOneHundred: readySections >= 7 && ownerReady,
    kernelBoundaryReady: state.kernelBoundaryReadyLocal && state.allLiveConnectionsThroughKernel,
    profileHookReady: state.profileHookReadyLocal,
    businessStreamHookReady: state.businessStreamHookReadyLocal,
    giftBoundaryReady: state.giftEndStageBoundaryReadyLocal && state.giftSendImplementationAllowedNow === false,
    realLaunchStillBlocked: true,
    allLiveConnectionsThroughKernel: true,
    directProviderConnectionAllowed: false,
    directRealtimeConnectionAllowed: false,
    scatteredServiceConnectionAllowed: false,
    profileScreenImplementationAllowedNow: false,
    businessStreamScreenImplementationAllowedNow: false,
    giftSendImplementationAllowedNow: false,
    backendProviderLiveReady: false,
    launchAllowedNow: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
  };
}
