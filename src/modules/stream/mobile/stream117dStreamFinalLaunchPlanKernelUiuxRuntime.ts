import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream117CReadinessDashboardEvidence } from "./stream117cStreamReadinessDashboardKernelUiuxRuntime";

export type Stream117DFinalLaunchPlanSectionId =
  | "launch_plan_surface_ready"
  | "product_scope_summary_locked"
  | "backend_provider_plan_honest"
  | "realtime_media_plan_honest"
  | "upload_publish_playback_plan_honest"
  | "admin_moderation_plan_honest"
  | "commerce_wallet_blocked"
  | "gifts_monetization_last_stage"
  | "kernel_handoff_ready"
  | "no_fake_launch_claim"
  | "next_execution_scope_ready";

export type Stream117DFinalLaunchPlanStatus = "ready" | "blocked";

export type Stream117DFinalLaunchPlanSection = {
  readonly id: Stream117DFinalLaunchPlanSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream117DFinalLaunchPlanStatus;
};

export type Stream117DFinalLaunchPlanState = {
  readonly version: "STREAM-117D";
  readonly selectedSectionId: Stream117DFinalLaunchPlanSectionId;
  readonly readySectionIds: readonly Stream117DFinalLaunchPlanSectionId[];
  readonly lastAction: string;
  readonly launchPlanSurfaceReadyLocal: boolean;
  readonly productScopeSummaryLockedLocal: boolean;
  readonly backendProviderPlanHonestLocal: boolean;
  readonly realtimeMediaPlanHonestLocal: boolean;
  readonly uploadPublishPlaybackPlanHonestLocal: boolean;
  readonly adminModerationPlanHonestLocal: boolean;
  readonly commerceWalletBlockedLocal: boolean;
  readonly giftsMonetizationLastStageLocal: boolean;
  readonly kernelHandoffReadyLocal: boolean;
  readonly noFakeLaunchClaimLocal: boolean;
  readonly nextExecutionScopeReadyLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directLiveProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directShortsProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly backendProviderActivatedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly liveBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly shortsBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream117DFinalLaunchPlanEvidence = {
  readonly version: "STREAM-117D";
  readonly selectedSectionId: Stream117DFinalLaunchPlanSectionId;
  readonly planScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream117DFinalLaunchPlanSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly launchPlanSurfaceReady: boolean;
  readonly productScopeSummaryLocked: boolean;
  readonly backendProviderPlanHonest: boolean;
  readonly realtimeMediaPlanHonest: boolean;
  readonly uploadPublishPlaybackPlanHonest: boolean;
  readonly adminModerationPlanHonest: boolean;
  readonly commerceWalletBlocked: boolean;
  readonly giftsMonetizationLastStage: boolean;
  readonly kernelHandoffReady: boolean;
  readonly noFakeLaunchClaim: boolean;
  readonly nextExecutionScopeReady: boolean;
  readonly readinessDashboardReady: boolean;
  readonly streamFinalLaunchPlanReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directLiveProviderAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directShortsProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly backendProviderActivatedNow: false;
  readonly realtimeProviderActivatedNow: false;
  readonly mediaProviderActivatedNow: false;
  readonly liveBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly shortsBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream117DFinalLaunchPlanSectionId, { title: string; description: string }> = {
  launch_plan_surface_ready: {
    title: "Поверхность финального запуск-плана",
    description: "Чистый владелец-facing экран запуск-плана объясняет готовность продукта Stream без обещания реального бэкенд/провайдер запуск.",
  },
  product_scope_summary_locked: {
    title: "Scope продукта зафиксирован",
    description: "Эфир, Бизнес Stream, профиль автора и шорты резюмированы как продуктовые UI/UX-зоны в одном упорядоченном пути.",
  },
  backend_provider_plan_honest: {
    title: "Бэкенд/провайдер план честный",
    description: "Реальная активация провайдера, бэкенд runtime и service передача остаются заблокированы до отдельного утверждённого бэкенд-этапа.",
  },
  realtime_media_plan_honest: {
    title: "Реалтайм/медиа план честный",
    description: "Реалтайм sync, состояние ведущий/зритель, захват медиа, воспроизведение и работа эфир-провайдера остаются контрактами ядра, а не прямыми UI-вызовами.",
  },
  upload_publish_playback_plan_honest: {
    title: "Загрузка/публикация/воспроизведение план честный",
    description: "Загрузка, публикация, воспроизведение, счётчики и аналитика шортов спланированы ясно без фейкового загрузка или фейк просмотры.",
  },
  admin_moderation_plan_honest: {
    title: "Админ/moderation план честный",
    description: "AI-модерация, жалобы, очередь проверка, appeals, 18+ и language guard остаются видимыми границами безопасности.",
  },
  commerce_wallet_blocked: {
    title: "Коммерция и Wallet заблокированы",
    description: "Merchant, Wallet, checkout, invoice, payout, платёж и order flows заблокированы и не симулируются в Stream UI/UX.",
  },
  gifts_monetization_last_stage: {
    title: "Подарки — последний этап",
    description: "Подарки и монетизация обязательны для Stream позже, но остаются финальным упорядоченным этапом, не шагом этого запуск-плана.",
  },
  kernel_handoff_ready: {
    title: "Передача ядра готова",
    description: "Все будущие границы реалтайм, провайдера, модерации, бизнеса, профиля, шортов, подарков и платежей должны идти через core/ядро.",
  },
  no_fake_launch_claim: {
    title: "Нет фейкового запуск-claim",
    description: "UI говорит о продукт shell/readiness, а не о реальном запуск, пока бэкенд/провайдер/runtime этапы реально не пройдены.",
  },
  next_execution_scope_ready: {
    title: "Следующий execution scope готов",
    description: "Следующее утверждённое выполнение может начаться с планирования бэкенд/провайдер/подарки без нарушения принятой UI/UX-основы.",
  },
};

const ALL_SECTIONS: readonly Stream117DFinalLaunchPlanSectionId[] = [
  "launch_plan_surface_ready",
  "product_scope_summary_locked",
  "backend_provider_plan_honest",
  "realtime_media_plan_honest",
  "upload_publish_playback_plan_honest",
  "admin_moderation_plan_honest",
  "commerce_wallet_blocked",
  "gifts_monetization_last_stage",
  "kernel_handoff_ready",
  "no_fake_launch_claim",
  "next_execution_scope_ready",
];

const FIELD_BY_SECTION: Record<Stream117DFinalLaunchPlanSectionId, keyof Pick<
  Stream117DFinalLaunchPlanState,
  | "launchPlanSurfaceReadyLocal"
  | "productScopeSummaryLockedLocal"
  | "backendProviderPlanHonestLocal"
  | "realtimeMediaPlanHonestLocal"
  | "uploadPublishPlaybackPlanHonestLocal"
  | "adminModerationPlanHonestLocal"
  | "commerceWalletBlockedLocal"
  | "giftsMonetizationLastStageLocal"
  | "kernelHandoffReadyLocal"
  | "noFakeLaunchClaimLocal"
  | "nextExecutionScopeReadyLocal"
>> = {
  launch_plan_surface_ready: "launchPlanSurfaceReadyLocal",
  product_scope_summary_locked: "productScopeSummaryLockedLocal",
  backend_provider_plan_honest: "backendProviderPlanHonestLocal",
  realtime_media_plan_honest: "realtimeMediaPlanHonestLocal",
  upload_publish_playback_plan_honest: "uploadPublishPlaybackPlanHonestLocal",
  admin_moderation_plan_honest: "adminModerationPlanHonestLocal",
  commerce_wallet_blocked: "commerceWalletBlockedLocal",
  gifts_monetization_last_stage: "giftsMonetizationLastStageLocal",
  kernel_handoff_ready: "kernelHandoffReadyLocal",
  no_fake_launch_claim: "noFakeLaunchClaimLocal",
  next_execution_scope_ready: "nextExecutionScopeReadyLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream117DFinalLaunchPlanSectionId[]): readonly Stream117DFinalLaunchPlanSectionId[] {
  return Array.from(new Set(sectionIds));
}

export function createInitialStream117DFinalLaunchPlanState(): Stream117DFinalLaunchPlanState {
  return {
    version: "STREAM-117D",
    selectedSectionId: "launch_plan_surface_ready",
    readySectionIds: ["commerce_wallet_blocked", "gifts_monetization_last_stage", "kernel_handoff_ready", "no_fake_launch_claim"],
    lastAction: "Финальный запуск-план Stream ждёт проверки владельца: готовность продукта отделена от бэкенд/провайдер запуск.",
    launchPlanSurfaceReadyLocal: false,
    productScopeSummaryLockedLocal: false,
    backendProviderPlanHonestLocal: false,
    realtimeMediaPlanHonestLocal: false,
    uploadPublishPlaybackPlanHonestLocal: false,
    adminModerationPlanHonestLocal: false,
    commerceWalletBlockedLocal: true,
    giftsMonetizationLastStageLocal: true,
    kernelHandoffReadyLocal: true,
    noFakeLaunchClaimLocal: true,
    nextExecutionScopeReadyLocal: false,
    allConnectionsThroughKernel: true,
    directLiveProviderAllowed: false,
    directRealtimeProviderAllowed: false,
    directMediaProviderAllowed: false,
    directUploadProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directProfileProviderAllowed: false,
    directShortsProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    backendProviderActivatedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    liveBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    shortsBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeLaunchAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

export function selectStream117DFinalLaunchPlanSection(
  state: Stream117DFinalLaunchPlanState,
  sectionId: Stream117DFinalLaunchPlanSectionId,
): Stream117DFinalLaunchPlanState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream117DFinalLaunchPlanSectionReady(
  state: Stream117DFinalLaunchPlanState,
  sectionId: Stream117DFinalLaunchPlanSectionId,
  action: string,
): Stream117DFinalLaunchPlanState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream117DFinalLaunchPlanAllReady(
  state: Stream117DFinalLaunchPlanState,
  action: string,
): Stream117DFinalLaunchPlanState {
  return {
    ...state,
    selectedSectionId: "next_execution_scope_ready",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    launchPlanSurfaceReadyLocal: true,
    productScopeSummaryLockedLocal: true,
    backendProviderPlanHonestLocal: true,
    realtimeMediaPlanHonestLocal: true,
    uploadPublishPlaybackPlanHonestLocal: true,
    adminModerationPlanHonestLocal: true,
    commerceWalletBlockedLocal: true,
    giftsMonetizationLastStageLocal: true,
    kernelHandoffReadyLocal: true,
    noFakeLaunchClaimLocal: true,
    nextExecutionScopeReadyLocal: true,
  };
}

export function buildStream117DFinalLaunchPlanEvidence(
  state: Stream117DFinalLaunchPlanState,
  room: StreamRoomRuntimeState,
  readinessDashboardEvidence: Stream117CReadinessDashboardEvidence,
): Stream117DFinalLaunchPlanEvidence {
  const sectionItems: Stream117DFinalLaunchPlanSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "blocked",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const planScore = Math.round((readySections / totalSections) * 100);
  const roomHasTitle = room.title.trim().length > 0;
  const readinessDashboardReady = readinessDashboardEvidence.streamReadinessDashboardReady;
  const streamFinalLaunchPlanReady = roomHasTitle
    && readinessDashboardReady
    && planScore === 100
    && state.allConnectionsThroughKernel
    && state.directLiveProviderAllowed === false
    && state.directRealtimeProviderAllowed === false
    && state.directMediaProviderAllowed === false
    && state.directUploadProviderAllowed === false
    && state.directPlaybackProviderAllowed === false
    && state.directBusinessProviderAllowed === false
    && state.directProfileProviderAllowed === false
    && state.directShortsProviderAllowed === false
    && state.directWalletConnectionAllowed === false
    && state.directGiftPaymentAllowed === false
    && state.backendProviderActivatedNow === false
    && state.realtimeProviderActivatedNow === false
    && state.mediaProviderActivatedNow === false
    && state.liveBackendTouchedNow === false
    && state.businessBackendTouchedNow === false
    && state.profileBackendTouchedNow === false
    && state.shortsBackendTouchedNow === false
    && state.walletTouchedNow === false
    && state.messengerTouchedNow === false
    && state.mainAiTouchedNow === false
    && state.fakeLaunchAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakeUploadAllowed === false
    && state.fakePublishAllowed === false
    && state.fakePlaybackAllowed === false
    && state.fakeViewsAllowed === false
    && state.fakeOrderAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false
    && state.monetizationImplementedNow === false;

  return {
    version: "STREAM-117D",
    selectedSectionId: state.selectedSectionId,
    planScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Финальный запуск-план Stream чистый, честный и только через ядро",
    heroSubtitle: "Владелец видит, что готово как продукт, что требует реального бэкенд/провайдер выполнения и почему подарки/платёж остаются отложенными вместо фейка.",
    phoneStatus: streamFinalLaunchPlanReady ? "Финальный запуск-план готов" : "Финальному запуск-плану нужна проверка владельца",
    primaryAction: "Держать UI/UX Stream принятым, показывать план выполнения бэкенда/провайдера/подарков отдельно и пока не заявлять реальный запуск эфира.",
    secondaryAction: "Дальше: двигаться только к отдельно утверждённому бэкенд/провайдер execution planning или финальному этапу подарки/monetization после этой UI/UX-передачи.",
    launchPlanSurfaceReady: state.launchPlanSurfaceReadyLocal,
    productScopeSummaryLocked: state.productScopeSummaryLockedLocal,
    backendProviderPlanHonest: state.backendProviderPlanHonestLocal,
    realtimeMediaPlanHonest: state.realtimeMediaPlanHonestLocal,
    uploadPublishPlaybackPlanHonest: state.uploadPublishPlaybackPlanHonestLocal,
    adminModerationPlanHonest: state.adminModerationPlanHonestLocal,
    commerceWalletBlocked: state.commerceWalletBlockedLocal,
    giftsMonetizationLastStage: state.giftsMonetizationLastStageLocal,
    kernelHandoffReady: state.kernelHandoffReadyLocal,
    noFakeLaunchClaim: state.noFakeLaunchClaimLocal,
    nextExecutionScopeReady: state.nextExecutionScopeReadyLocal,
    readinessDashboardReady,
    streamFinalLaunchPlanReady,
    allConnectionsThroughKernel: true,
    directLiveProviderAllowed: false,
    directRealtimeProviderAllowed: false,
    directMediaProviderAllowed: false,
    directUploadProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directProfileProviderAllowed: false,
    directShortsProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    backendProviderActivatedNow: false,
    realtimeProviderActivatedNow: false,
    mediaProviderActivatedNow: false,
    liveBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    shortsBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeLaunchAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
