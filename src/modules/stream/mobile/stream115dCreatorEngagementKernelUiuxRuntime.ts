import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream115CCreatorContentTabsEvidence } from "./stream115cCreatorContentTabsKernelUiuxRuntime";

export type Stream115DCreatorEngagementSectionId =
  | "engagement_entry"
  | "follow_intent"
  | "profile_share"
  | "live_notification"
  | "message_contact"
  | "report_creator"
  | "block_mute_preview"
  | "creator_safety_boundary"
  | "kernel_engagement_contract"
  | "business_creator_handoff"
  | "gifts_monetization_deferred";

export type Stream115DCreatorEngagementStatus = "ready" | "needs_polish";

export type Stream115DCreatorEngagementSection = {
  readonly id: Stream115DCreatorEngagementSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream115DCreatorEngagementStatus;
};

export type Stream115DCreatorEngagementState = {
  readonly version: "STREAM-115D";
  readonly selectedSectionId: Stream115DCreatorEngagementSectionId;
  readonly readySectionIds: readonly Stream115DCreatorEngagementSectionId[];
  readonly lastAction: string;
  readonly engagementEntryLocal: boolean;
  readonly followIntentLocal: boolean;
  readonly profileShareLocal: boolean;
  readonly liveNotificationLocal: boolean;
  readonly messageContactLocal: boolean;
  readonly reportCreatorLocal: boolean;
  readonly blockMutePreviewLocal: boolean;
  readonly creatorSafetyBoundaryLocal: boolean;
  readonly kernelEngagementContractLocal: boolean;
  readonly businessCreatorHandoffLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directSocialProviderAllowed: false;
  readonly directNotificationProviderAllowed: false;
  readonly directMessengerProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly socialBackendTouchedNow: false;
  readonly notificationBackendTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeFollowAllowed: false;
  readonly fakeUnfollowAllowed: false;
  readonly fakeFollowerCountAllowed: false;
  readonly fakeMessageSentAllowed: false;
  readonly fakeNotificationSubscribedAllowed: false;
  readonly fakeProfileSharedSuccessAllowed: false;
  readonly fakeReportSubmittedAllowed: false;
  readonly fakeBlockEnforcedAllowed: false;
  readonly fakeMuteEnforcedAllowed: false;
  readonly fakeBusinessContactAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream115DCreatorEngagementEvidence = {
  readonly version: "STREAM-115D";
  readonly selectedSectionId: Stream115DCreatorEngagementSectionId;
  readonly engagementScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream115DCreatorEngagementSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly creatorContentTabsReady: boolean;
  readonly engagementEntryReady: boolean;
  readonly followIntentReady: boolean;
  readonly profileShareReady: boolean;
  readonly liveNotificationReady: boolean;
  readonly messageContactReady: boolean;
  readonly reportCreatorReady: boolean;
  readonly blockMutePreviewReady: boolean;
  readonly creatorSafetyBoundaryReady: boolean;
  readonly kernelEngagementContractReady: boolean;
  readonly businessCreatorHandoffReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly creatorEngagementUiuxReady: boolean;
  readonly nextCreatorProfileCleanupReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directSocialProviderAllowed: false;
  readonly directNotificationProviderAllowed: false;
  readonly directMessengerProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly socialBackendTouchedNow: false;
  readonly notificationBackendTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeFollowAllowed: false;
  readonly fakeUnfollowAllowed: false;
  readonly fakeFollowerCountAllowed: false;
  readonly fakeMessageSentAllowed: false;
  readonly fakeNotificationSubscribedAllowed: false;
  readonly fakeProfileSharedSuccessAllowed: false;
  readonly fakeReportSubmittedAllowed: false;
  readonly fakeBlockEnforcedAllowed: false;
  readonly fakeMuteEnforcedAllowed: false;
  readonly fakeBusinessContactAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream115DCreatorEngagementSectionId[] = [
  "engagement_entry",
  "follow_intent",
  "profile_share",
  "live_notification",
  "message_contact",
  "report_creator",
  "block_mute_preview",
  "creator_safety_boundary",
  "kernel_engagement_contract",
  "business_creator_handoff",
  "gifts_monetization_deferred",
];

const SECTION_TITLES: Record<Stream115DCreatorEngagementSectionId, string> = {
  engagement_entry: "Действия профиля",
  follow_intent: "Намерение подписки",
  profile_share: "Поделиться профилем",
  live_notification: "Live alerts",
  message_contact: "Message/contact",
  report_creator: "Жалоба на автора",
  block_mute_preview: "Block/mute preview",
  creator_safety_boundary: "Safety boundary",
  kernel_engagement_contract: "Контракт ядра",
  business_creator_handoff: "Передача бизнес-контекста",
  gifts_monetization_deferred: "Подарки позже",
};

const SECTION_DESCRIPTIONS: Record<Stream115DCreatorEngagementSectionId, string> = {
  engagement_entry: "Действия профиля автора собраны в одну чистую телефонную панель: подписка, поделиться, оповещения, сообщение, жалоба и безопасность.",
  follow_intent: "Подписка/отписка представлены только как намерение ядра; без фейкового счётчика, фейкового успеха и прямого вызова social provider.",
  profile_share: "Поделиться профилем готовит native/kernel payload, но не фейкует успешную рассылку или аналитику.",
  live_notification: "Live alerts are designed as subscription intent only; no fake push subscription or direct notification provider call.",
  message_contact: "Message/contact prepares the future Messenger handoff through Stream kernel, without fake message sent state.",
  report_creator: "Жалоба на автора открывает safety intent для проверки Sabi AI/admin, без фейковой backend-отправки жалобы.",
  block_mute_preview: "Блок/мьют показаны только как локальный safety preview до подключения backend/moderation enforcement через ядро.",
  creator_safety_boundary: "Тексты abuse, harassment, 18+ и безопасности автора видны без фейковых юридических или moderation promises.",
  kernel_engagement_contract: "Каждое действие профиля должно пройти через контракты/фасады/события ядра Stream до provider/backend integration.",
  business_creator_handoff: "Контакт бизнес-автора позже может передаваться в Business Stream, но сейчас без фейкового lead, order, payment или merchant state.",
  gifts_monetization_deferred: "Подарки и монетизация обязательны позже, но остаются отложены до финального этапа подарков/монетизации Stream.",
};

function uniqueReady(items: readonly Stream115DCreatorEngagementSectionId[]): readonly Stream115DCreatorEngagementSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream115DCreatorEngagementState(): Stream115DCreatorEngagementState {
  return {
    version: "STREAM-115D",
    selectedSectionId: "engagement_entry",
    readySectionIds: ["kernel_engagement_contract", "gifts_monetization_deferred"],
    lastAction: "115D начинает UI/UX действий/вовлечения автора: только ядро, без фейковых подписок/сообщений/уведомлений/подарков.",
    engagementEntryLocal: false,
    followIntentLocal: false,
    profileShareLocal: false,
    liveNotificationLocal: false,
    messageContactLocal: false,
    reportCreatorLocal: false,
    blockMutePreviewLocal: false,
    creatorSafetyBoundaryLocal: false,
    kernelEngagementContractLocal: true,
    businessCreatorHandoffLocal: false,
    giftsMonetizationDeferredLocal: true,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directSocialProviderAllowed: false,
    directNotificationProviderAllowed: false,
    directMessengerProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    profileBackendTouchedNow: false,
    socialBackendTouchedNow: false,
    notificationBackendTouchedNow: false,
    messengerTouchedNow: false,
    walletTouchedNow: false,
    mainAiTouchedNow: false,
    fakeFollowAllowed: false,
    fakeUnfollowAllowed: false,
    fakeFollowerCountAllowed: false,
    fakeMessageSentAllowed: false,
    fakeNotificationSubscribedAllowed: false,
    fakeProfileSharedSuccessAllowed: false,
    fakeReportSubmittedAllowed: false,
    fakeBlockEnforcedAllowed: false,
    fakeMuteEnforcedAllowed: false,
    fakeBusinessContactAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream115DCreatorEngagementState, sectionId: Stream115DCreatorEngagementSectionId): Stream115DCreatorEngagementState {
  return {
    ...state,
    engagementEntryLocal: state.engagementEntryLocal || sectionId === "engagement_entry",
    followIntentLocal: state.followIntentLocal || sectionId === "follow_intent",
    profileShareLocal: state.profileShareLocal || sectionId === "profile_share",
    liveNotificationLocal: state.liveNotificationLocal || sectionId === "live_notification",
    messageContactLocal: state.messageContactLocal || sectionId === "message_contact",
    reportCreatorLocal: state.reportCreatorLocal || sectionId === "report_creator",
    blockMutePreviewLocal: state.blockMutePreviewLocal || sectionId === "block_mute_preview",
    creatorSafetyBoundaryLocal: state.creatorSafetyBoundaryLocal || sectionId === "creator_safety_boundary",
    kernelEngagementContractLocal: state.kernelEngagementContractLocal || sectionId === "kernel_engagement_contract",
    businessCreatorHandoffLocal: state.businessCreatorHandoffLocal || sectionId === "business_creator_handoff",
    giftsMonetizationDeferredLocal: state.giftsMonetizationDeferredLocal || sectionId === "gifts_monetization_deferred",
  };
}

export function selectStream115DCreatorEngagementSection(
  state: Stream115DCreatorEngagementState,
  sectionId: Stream115DCreatorEngagementSectionId,
): Stream115DCreatorEngagementState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `115D selected ${SECTION_TITLES[sectionId]} for creator engagement/profile actions polish.`,
  };
}

export function markStream115DCreatorEngagementSectionReady(
  state: Stream115DCreatorEngagementState,
  sectionId: Stream115DCreatorEngagementSectionId,
  action: string,
): Stream115DCreatorEngagementState {
  const nextReady = uniqueReady([...state.readySectionIds, sectionId, "kernel_engagement_contract", "gifts_monetization_deferred"]);
  return setReadyFlag({
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: nextReady,
    lastAction: action,
  }, sectionId);
}

export function markStream115DCreatorEngagementAllReady(
  state: Stream115DCreatorEngagementState,
  action: string,
): Stream115DCreatorEngagementState {
  return {
    ...state,
    selectedSectionId: "engagement_entry",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    engagementEntryLocal: true,
    followIntentLocal: true,
    profileShareLocal: true,
    liveNotificationLocal: true,
    messageContactLocal: true,
    reportCreatorLocal: true,
    blockMutePreviewLocal: true,
    creatorSafetyBoundaryLocal: true,
    kernelEngagementContractLocal: true,
    businessCreatorHandoffLocal: true,
    giftsMonetizationDeferredLocal: true,
  };
}

function buildSectionItems(state: Stream115DCreatorEngagementState): readonly Stream115DCreatorEngagementSection[] {
  return SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
}

export function buildStream115DCreatorEngagementEvidence(
  state: Stream115DCreatorEngagementState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  contentTabsEvidence: Stream115CCreatorContentTabsEvidence,
): Stream115DCreatorEngagementEvidence {
  const sectionItems = buildSectionItems(state);
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const engagementScore = Math.round((readySections / totalSections) * 100);
  const creatorContentTabsReady = contentTabsEvidence.creatorContentTabsUiuxReady;
  const selected = SECTION_TITLES[state.selectedSectionId];
  const ready = readySections === totalSections
    && creatorContentTabsReady
    && state.allConnectionsThroughKernel
    && state.directProfileProviderAllowed === false
    && state.directSocialProviderAllowed === false
    && state.directNotificationProviderAllowed === false
    && state.directMessengerProviderAllowed === false
    && state.directGiftPaymentAllowed === false
    && state.fakeFollowAllowed === false
    && state.fakeFollowerCountAllowed === false
    && state.fakeMessageSentAllowed === false
    && state.fakeNotificationSubscribedAllowed === false
    && state.fakeReportSubmittedAllowed === false
    && state.fakeGiftSendingAllowed === false;

  return {
    version: "STREAM-115D",
    selectedSectionId: state.selectedSectionId,
    engagementScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Действия автора готовы без фейкового social state",
    heroSubtitle: "Подписка, поделиться, оповещения эфира, сообщение/контакт, жалоба и блок/мьют preview остаются чистым продуктовым UI и только через ядро.",
    phoneStatus: `${selected} · ${room.title || "Sabi Stream"} · ${stage.status}`,
    primaryAction: "Используй действия профиля как безопасные намерения, без фейковых подписок, сообщений, уведомлений и enforcement модерации.",
    secondaryAction: ready ? "115D действия вовлечения/профиля автора готовы для финальной чистки профиля." : `Дальше: доведи ${selected} и держи каждое действие за контрактами ядра Stream.`,
    creatorContentTabsReady,
    engagementEntryReady: state.engagementEntryLocal,
    followIntentReady: state.followIntentLocal,
    profileShareReady: state.profileShareLocal,
    liveNotificationReady: state.liveNotificationLocal,
    messageContactReady: state.messageContactLocal,
    reportCreatorReady: state.reportCreatorLocal,
    blockMutePreviewReady: state.blockMutePreviewLocal,
    creatorSafetyBoundaryReady: state.creatorSafetyBoundaryLocal,
    kernelEngagementContractReady: state.kernelEngagementContractLocal,
    businessCreatorHandoffReady: state.businessCreatorHandoffLocal,
    giftsMonetizationDeferredReady: state.giftsMonetizationDeferredLocal,
    creatorEngagementUiuxReady: ready,
    nextCreatorProfileCleanupReady: ready,
    allConnectionsThroughKernel: state.allConnectionsThroughKernel,
    directProfileProviderAllowed: state.directProfileProviderAllowed,
    directSocialProviderAllowed: state.directSocialProviderAllowed,
    directNotificationProviderAllowed: state.directNotificationProviderAllowed,
    directMessengerProviderAllowed: state.directMessengerProviderAllowed,
    directRealtimeConnectionAllowed: state.directRealtimeConnectionAllowed,
    directBusinessProviderAllowed: state.directBusinessProviderAllowed,
    directWalletConnectionAllowed: state.directWalletConnectionAllowed,
    directGiftPaymentAllowed: state.directGiftPaymentAllowed,
    profileBackendTouchedNow: state.profileBackendTouchedNow,
    socialBackendTouchedNow: state.socialBackendTouchedNow,
    notificationBackendTouchedNow: state.notificationBackendTouchedNow,
    messengerTouchedNow: state.messengerTouchedNow,
    walletTouchedNow: state.walletTouchedNow,
    mainAiTouchedNow: state.mainAiTouchedNow,
    fakeFollowAllowed: state.fakeFollowAllowed,
    fakeUnfollowAllowed: state.fakeUnfollowAllowed,
    fakeFollowerCountAllowed: state.fakeFollowerCountAllowed,
    fakeMessageSentAllowed: state.fakeMessageSentAllowed,
    fakeNotificationSubscribedAllowed: state.fakeNotificationSubscribedAllowed,
    fakeProfileSharedSuccessAllowed: state.fakeProfileSharedSuccessAllowed,
    fakeReportSubmittedAllowed: state.fakeReportSubmittedAllowed,
    fakeBlockEnforcedAllowed: state.fakeBlockEnforcedAllowed,
    fakeMuteEnforcedAllowed: state.fakeMuteEnforcedAllowed,
    fakeBusinessContactAllowed: state.fakeBusinessContactAllowed,
    fakeMonetizationAllowed: state.fakeMonetizationAllowed,
    fakePaymentAllowed: state.fakePaymentAllowed,
    fakeGiftSendingAllowed: state.fakeGiftSendingAllowed,
    giftSendingImplementedNow: state.giftSendingImplementedNow,
    monetizationImplementedNow: state.monetizationImplementedNow,
  };
}
