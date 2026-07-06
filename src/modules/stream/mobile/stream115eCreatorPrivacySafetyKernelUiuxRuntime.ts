import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream115DCreatorEngagementEvidence } from "./stream115dCreatorEngagementKernelUiuxRuntime";

export type Stream115ECreatorPrivacySafetySectionId =
  | "privacy_entry"
  | "profile_visibility"
  | "comment_permissions"
  | "message_permissions"
  | "live_alert_privacy"
  | "report_block_mute_policy"
  | "age_safety_visibility"
  | "business_creator_privacy"
  | "kernel_privacy_contract"
  | "gifts_monetization_deferred"
  | "final_profile_cleanup";

export type Stream115ECreatorPrivacySafetyStatus = "ready" | "needs_polish";

export type Stream115ECreatorPrivacySafetySection = {
  readonly id: Stream115ECreatorPrivacySafetySectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream115ECreatorPrivacySafetyStatus;
};

export type Stream115ECreatorPrivacySafetyState = {
  readonly version: "STREAM-115E";
  readonly selectedSectionId: Stream115ECreatorPrivacySafetySectionId;
  readonly readySectionIds: readonly Stream115ECreatorPrivacySafetySectionId[];
  readonly lastAction: string;
  readonly privacyEntryLocal: boolean;
  readonly profileVisibilityLocal: boolean;
  readonly commentPermissionsLocal: boolean;
  readonly messagePermissionsLocal: boolean;
  readonly liveAlertPrivacyLocal: boolean;
  readonly reportBlockMutePolicyLocal: boolean;
  readonly ageSafetyVisibilityLocal: boolean;
  readonly businessCreatorPrivacyLocal: boolean;
  readonly kernelPrivacyContractLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly finalProfileCleanupLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directPrivacyProviderAllowed: false;
  readonly directModerationProviderAllowed: false;
  readonly directNotificationProviderAllowed: false;
  readonly directMessengerProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly privacyBackendTouchedNow: false;
  readonly moderationBackendTouchedNow: false;
  readonly notificationBackendTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakePrivacySavedAllowed: false;
  readonly fakeVisibilityPublishedAllowed: false;
  readonly fakeCommentPolicyEnforcedAllowed: false;
  readonly fakeMessagePolicyEnforcedAllowed: false;
  readonly fakeAlertSubscriptionAllowed: false;
  readonly fakeReportSubmittedAllowed: false;
  readonly fakeBlockEnforcedAllowed: false;
  readonly fakeMuteEnforcedAllowed: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeBusinessVerificationAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream115ECreatorPrivacySafetyEvidence = {
  readonly version: "STREAM-115E";
  readonly selectedSectionId: Stream115ECreatorPrivacySafetySectionId;
  readonly privacySafetyScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream115ECreatorPrivacySafetySection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly creatorEngagementReady: boolean;
  readonly privacyEntryReady: boolean;
  readonly profileVisibilityReady: boolean;
  readonly commentPermissionsReady: boolean;
  readonly messagePermissionsReady: boolean;
  readonly liveAlertPrivacyReady: boolean;
  readonly reportBlockMutePolicyReady: boolean;
  readonly ageSafetyVisibilityReady: boolean;
  readonly businessCreatorPrivacyReady: boolean;
  readonly kernelPrivacyContractReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly finalProfileCleanupReady: boolean;
  readonly creatorPrivacySafetyUiuxReady: boolean;
  readonly nextCreatorFinalHandoffReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directPrivacyProviderAllowed: false;
  readonly directModerationProviderAllowed: false;
  readonly directNotificationProviderAllowed: false;
  readonly directMessengerProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly privacyBackendTouchedNow: false;
  readonly moderationBackendTouchedNow: false;
  readonly notificationBackendTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakePrivacySavedAllowed: false;
  readonly fakeVisibilityPublishedAllowed: false;
  readonly fakeCommentPolicyEnforcedAllowed: false;
  readonly fakeMessagePolicyEnforcedAllowed: false;
  readonly fakeAlertSubscriptionAllowed: false;
  readonly fakeReportSubmittedAllowed: false;
  readonly fakeBlockEnforcedAllowed: false;
  readonly fakeMuteEnforcedAllowed: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeBusinessVerificationAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream115ECreatorPrivacySafetySectionId[] = [
  "privacy_entry",
  "profile_visibility",
  "comment_permissions",
  "message_permissions",
  "live_alert_privacy",
  "report_block_mute_policy",
  "age_safety_visibility",
  "business_creator_privacy",
  "kernel_privacy_contract",
  "gifts_monetization_deferred",
  "final_profile_cleanup",
];

const SECTION_TITLES: Record<Stream115ECreatorPrivacySafetySectionId, string> = {
  privacy_entry: "Центр приватности",
  profile_visibility: "Видимость профиля",
  comment_permissions: "Права комментариев",
  message_permissions: "Права сообщений",
  live_alert_privacy: "Приватность оповещений",
  report_block_mute_policy: "Жалоба / блок / мьют",
  age_safety_visibility: "18+ и безопасность",
  business_creator_privacy: "Приватность бизнес-автора",
  kernel_privacy_contract: "Контракт ядра",
  gifts_monetization_deferred: "Подарки позже",
  final_profile_cleanup: "Чистка профиля",
};

const SECTION_DESCRIPTIONS: Record<Stream115ECreatorPrivacySafetySectionId, string> = {
  privacy_entry: "Приватность профиля автора показана как чистая телефонная поверхность настроек, а не debug-доска.",
  profile_visibility: "Visibility is a kernel intent only: public, limited or hidden draft state cannot fake backend publishing.",
  comment_permissions: "Права комментариев задают, кто может комментировать, но не фейкуют moderation/provider enforcement.",
  message_permissions: "Message/contact permissions prepare future Messenger handoff through Stream kernel without fake messages.",
  live_alert_privacy: "Приватность оповещений готовит намерение notification preferences без фейковой push-подписки.",
  report_block_mute_policy: "Жалоба, блок и мьют — локальные safety intents до подключения moderation backend через ядро.",
  age_safety_visibility: "Видимость 18+ и safety остаётся понятной без фейкового legal или age verification success.",
  business_creator_privacy: "Приватность бизнес-автора задаёт видимость бренда/контакта без фейкового merchant, order, payment или business verification.",
  kernel_privacy_contract: "Все действия приватности автора должны пройти через контракты/фасады/события ядра Stream до provider/backend integration.",
  gifts_monetization_deferred: "Gifts and monetization are mandatory later, but stay deferred until the final Stream gifts/monetization stage.",
  final_profile_cleanup: "Действия профиля автора, приватность и безопасность очищены для product-ready телефонного потока.",
};

function uniqueReady(items: readonly Stream115ECreatorPrivacySafetySectionId[]): readonly Stream115ECreatorPrivacySafetySectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream115ECreatorPrivacySafetyState(): Stream115ECreatorPrivacySafetyState {
  return {
    version: "STREAM-115E",
    selectedSectionId: "privacy_entry",
    readySectionIds: ["kernel_privacy_contract", "gifts_monetization_deferred"],
    lastAction: "115E начинает UI/UX приватности/безопасности профиля автора: только ядро, без фейкового сохранения приватности, enforcement и подарков.",
    privacyEntryLocal: false,
    profileVisibilityLocal: false,
    commentPermissionsLocal: false,
    messagePermissionsLocal: false,
    liveAlertPrivacyLocal: false,
    reportBlockMutePolicyLocal: false,
    ageSafetyVisibilityLocal: false,
    businessCreatorPrivacyLocal: false,
    kernelPrivacyContractLocal: true,
    giftsMonetizationDeferredLocal: true,
    finalProfileCleanupLocal: false,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directPrivacyProviderAllowed: false,
    directModerationProviderAllowed: false,
    directNotificationProviderAllowed: false,
    directMessengerProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    profileBackendTouchedNow: false,
    privacyBackendTouchedNow: false,
    moderationBackendTouchedNow: false,
    notificationBackendTouchedNow: false,
    messengerTouchedNow: false,
    walletTouchedNow: false,
    mainAiTouchedNow: false,
    fakePrivacySavedAllowed: false,
    fakeVisibilityPublishedAllowed: false,
    fakeCommentPolicyEnforcedAllowed: false,
    fakeMessagePolicyEnforcedAllowed: false,
    fakeAlertSubscriptionAllowed: false,
    fakeReportSubmittedAllowed: false,
    fakeBlockEnforcedAllowed: false,
    fakeMuteEnforcedAllowed: false,
    fakeAgeVerificationAllowed: false,
    fakeBusinessVerificationAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream115ECreatorPrivacySafetyState, sectionId: Stream115ECreatorPrivacySafetySectionId): Stream115ECreatorPrivacySafetyState {
  return {
    ...state,
    privacyEntryLocal: state.privacyEntryLocal || sectionId === "privacy_entry",
    profileVisibilityLocal: state.profileVisibilityLocal || sectionId === "profile_visibility",
    commentPermissionsLocal: state.commentPermissionsLocal || sectionId === "comment_permissions",
    messagePermissionsLocal: state.messagePermissionsLocal || sectionId === "message_permissions",
    liveAlertPrivacyLocal: state.liveAlertPrivacyLocal || sectionId === "live_alert_privacy",
    reportBlockMutePolicyLocal: state.reportBlockMutePolicyLocal || sectionId === "report_block_mute_policy",
    ageSafetyVisibilityLocal: state.ageSafetyVisibilityLocal || sectionId === "age_safety_visibility",
    businessCreatorPrivacyLocal: state.businessCreatorPrivacyLocal || sectionId === "business_creator_privacy",
    kernelPrivacyContractLocal: state.kernelPrivacyContractLocal || sectionId === "kernel_privacy_contract",
    giftsMonetizationDeferredLocal: state.giftsMonetizationDeferredLocal || sectionId === "gifts_monetization_deferred",
    finalProfileCleanupLocal: state.finalProfileCleanupLocal || sectionId === "final_profile_cleanup",
  };
}

export function selectStream115ECreatorPrivacySafetySection(
  state: Stream115ECreatorPrivacySafetyState,
  sectionId: Stream115ECreatorPrivacySafetySectionId,
): Stream115ECreatorPrivacySafetyState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `115E selected ${SECTION_TITLES[sectionId]} for creator privacy/safety polish.`,
  };
}

export function markStream115ECreatorPrivacySafetySectionReady(
  state: Stream115ECreatorPrivacySafetyState,
  sectionId: Stream115ECreatorPrivacySafetySectionId,
  action: string,
): Stream115ECreatorPrivacySafetyState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream115ECreatorPrivacySafetyAllReady(
  state: Stream115ECreatorPrivacySafetyState,
  action = "115E настройки приватности/безопасности автора product-ready, только ядро, без фейкового enforcement/подарков.",
): Stream115ECreatorPrivacySafetyState {
  return {
    ...state,
    selectedSectionId: "final_profile_cleanup",
    readySectionIds: SECTION_ORDER,
    lastAction: action,
    privacyEntryLocal: true,
    profileVisibilityLocal: true,
    commentPermissionsLocal: true,
    messagePermissionsLocal: true,
    liveAlertPrivacyLocal: true,
    reportBlockMutePolicyLocal: true,
    ageSafetyVisibilityLocal: true,
    businessCreatorPrivacyLocal: true,
    kernelPrivacyContractLocal: true,
    giftsMonetizationDeferredLocal: true,
    finalProfileCleanupLocal: true,
  };
}

export function buildStream115ECreatorPrivacySafetyEvidence(
  state: Stream115ECreatorPrivacySafetyState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  engagementEvidence: Stream115DCreatorEngagementEvidence,
): Stream115ECreatorPrivacySafetyEvidence {
  const sectionItems = SECTION_ORDER.map((id): Stream115ECreatorPrivacySafetySection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: state.readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const privacySafetyScore = Math.round((readySections / totalSections) * 100);
  const creatorEngagementReady = engagementEvidence.creatorEngagementUiuxReady;
  const profileVisibilityReady = state.profileVisibilityLocal || state.readySectionIds.includes("profile_visibility");
  const commentPermissionsReady = state.commentPermissionsLocal || state.readySectionIds.includes("comment_permissions");
  const messagePermissionsReady = state.messagePermissionsLocal || state.readySectionIds.includes("message_permissions");
  const liveAlertPrivacyReady = state.liveAlertPrivacyLocal || state.readySectionIds.includes("live_alert_privacy");
  const reportBlockMutePolicyReady = state.reportBlockMutePolicyLocal || state.readySectionIds.includes("report_block_mute_policy");
  const ageSafetyVisibilityReady = state.ageSafetyVisibilityLocal || state.readySectionIds.includes("age_safety_visibility");
  const businessCreatorPrivacyReady = state.businessCreatorPrivacyLocal || state.readySectionIds.includes("business_creator_privacy");
  const kernelPrivacyContractReady = state.kernelPrivacyContractLocal && state.allConnectionsThroughKernel;
  const giftsMonetizationDeferredReady = state.giftsMonetizationDeferredLocal && !state.giftSendingImplementedNow && !state.monetizationImplementedNow;
  const privacyEntryReady = state.privacyEntryLocal || state.readySectionIds.includes("privacy_entry");
  const finalProfileCleanupReady = state.finalProfileCleanupLocal || state.readySectionIds.includes("final_profile_cleanup");
  const creatorPrivacySafetyUiuxReady = creatorEngagementReady
    && privacyEntryReady
    && profileVisibilityReady
    && commentPermissionsReady
    && messagePermissionsReady
    && liveAlertPrivacyReady
    && reportBlockMutePolicyReady
    && ageSafetyVisibilityReady
    && businessCreatorPrivacyReady
    && kernelPrivacyContractReady
    && giftsMonetizationDeferredReady
    && finalProfileCleanupReady
    && state.fakePrivacySavedAllowed === false
    && state.fakeVisibilityPublishedAllowed === false
    && state.fakeCommentPolicyEnforcedAllowed === false
    && state.fakeMessagePolicyEnforcedAllowed === false
    && state.fakeAlertSubscriptionAllowed === false
    && state.fakeReportSubmittedAllowed === false
    && state.fakeBlockEnforcedAllowed === false
    && state.fakeMuteEnforcedAllowed === false
    && state.fakeAgeVerificationAllowed === false
    && state.fakeGiftSendingAllowed === false;

  return {
    version: "STREAM-115E",
    selectedSectionId: state.selectedSectionId,
    privacySafetyScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Приватность и безопасность автора готовы как чистый продуктовый UI",
    heroSubtitle: "Видимость, комментарии, сообщения, оповещения, жалобы, блок/мьют preview и 18+ тексты собраны как единый поток настроек профиля только через ядро.",
    phoneStatus: creatorPrivacySafetyUiuxReady ? "Приватность профиля автора готова как чистое UI/намерение ядра." : `Приватности профиля автора нужно ${totalSections - readySections} UI/UX проверок.`,
    primaryAction: "Настрой видимость профиля, права комментариев/сообщений и safety controls без фейкового backend enforcement.",
    secondaryAction: `Room ${room.roomId} · stage ${stage.status} · next: creator profile final acceptance before returning to Shorts premium polish.`,
    creatorEngagementReady,
    privacyEntryReady,
    profileVisibilityReady,
    commentPermissionsReady,
    messagePermissionsReady,
    liveAlertPrivacyReady,
    reportBlockMutePolicyReady,
    ageSafetyVisibilityReady,
    businessCreatorPrivacyReady,
    kernelPrivacyContractReady,
    giftsMonetizationDeferredReady,
    finalProfileCleanupReady,
    creatorPrivacySafetyUiuxReady,
    nextCreatorFinalHandoffReady: creatorPrivacySafetyUiuxReady,
    allConnectionsThroughKernel: state.allConnectionsThroughKernel,
    directProfileProviderAllowed: state.directProfileProviderAllowed,
    directPrivacyProviderAllowed: state.directPrivacyProviderAllowed,
    directModerationProviderAllowed: state.directModerationProviderAllowed,
    directNotificationProviderAllowed: state.directNotificationProviderAllowed,
    directMessengerProviderAllowed: state.directMessengerProviderAllowed,
    directBusinessProviderAllowed: state.directBusinessProviderAllowed,
    directWalletConnectionAllowed: state.directWalletConnectionAllowed,
    directGiftPaymentAllowed: state.directGiftPaymentAllowed,
    profileBackendTouchedNow: state.profileBackendTouchedNow,
    privacyBackendTouchedNow: state.privacyBackendTouchedNow,
    moderationBackendTouchedNow: state.moderationBackendTouchedNow,
    notificationBackendTouchedNow: state.notificationBackendTouchedNow,
    messengerTouchedNow: state.messengerTouchedNow,
    walletTouchedNow: state.walletTouchedNow,
    mainAiTouchedNow: state.mainAiTouchedNow,
    fakePrivacySavedAllowed: state.fakePrivacySavedAllowed,
    fakeVisibilityPublishedAllowed: state.fakeVisibilityPublishedAllowed,
    fakeCommentPolicyEnforcedAllowed: state.fakeCommentPolicyEnforcedAllowed,
    fakeMessagePolicyEnforcedAllowed: state.fakeMessagePolicyEnforcedAllowed,
    fakeAlertSubscriptionAllowed: state.fakeAlertSubscriptionAllowed,
    fakeReportSubmittedAllowed: state.fakeReportSubmittedAllowed,
    fakeBlockEnforcedAllowed: state.fakeBlockEnforcedAllowed,
    fakeMuteEnforcedAllowed: state.fakeMuteEnforcedAllowed,
    fakeAgeVerificationAllowed: state.fakeAgeVerificationAllowed,
    fakeBusinessVerificationAllowed: state.fakeBusinessVerificationAllowed,
    fakeMonetizationAllowed: state.fakeMonetizationAllowed,
    fakePaymentAllowed: state.fakePaymentAllowed,
    fakeGiftSendingAllowed: state.fakeGiftSendingAllowed,
    giftSendingImplementedNow: state.giftSendingImplementedNow,
    monetizationImplementedNow: state.monetizationImplementedNow,
  };
}
