import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream118HProtectedRouteMountOwnerApprovalGateEvidence } from "./stream118hProtectedRouteMountOwnerApprovalGateKernelUiuxRuntime";

export type Stream118IMobileKernelConnectionBridgeSectionId =
  | "mobile_kernel_bridge"
  | "live_ui_kernel_route"
  | "shorts_ui_kernel_route"
  | "business_stream_kernel_route"
  | "creator_profile_kernel_route"
  | "moderation_admin_kernel_route"
  | "foundation_handoff_packet"
  | "no_direct_provider_calls"
  | "no_mobile_secrets"
  | "external_foundation_next_scope"
  | "wallet_gifts_last";

export type Stream118IMobileKernelConnectionBridgeStatus = "pending" | "ready";

export type Stream118IMobileKernelConnectionBridgeSection = {
  readonly id: Stream118IMobileKernelConnectionBridgeSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream118IMobileKernelConnectionBridgeStatus;
};

export type Stream118IMobileKernelConnectionBridgeState = {
  readonly version: "STREAM-118I";
  readonly selectedSectionId: Stream118IMobileKernelConnectionBridgeSectionId;
  readonly readySectionIds: readonly Stream118IMobileKernelConnectionBridgeSectionId[];
  readonly lastAction: string;
  readonly mobileKernelBridgeLocal: boolean;
  readonly liveUiKernelRouteLocal: boolean;
  readonly shortsUiKernelRouteLocal: boolean;
  readonly businessStreamKernelRouteLocal: boolean;
  readonly creatorProfileKernelRouteLocal: boolean;
  readonly moderationAdminKernelRouteLocal: boolean;
  readonly foundationHandoffPacketLocal: boolean;
  readonly noDirectProviderCallsLocal: boolean;
  readonly noMobileSecretsLocal: boolean;
  readonly externalFoundationNextScopeLocal: boolean;
  readonly walletGiftsLastLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly sourceOnlyMobileKernelBridge: true;
  readonly ownerApprovalGateRequired: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRouteMountedNow: false;
  readonly routeMountExecutedNow: false;
  readonly providerAdapterExecutedNow: false;
  readonly providerCallExecutedNow: false;
  readonly databaseWriteExecutedNow: false;
  readonly productionTrafficEnabledNow: false;
  readonly mobileDirectProviderBridgeAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directAnalyticsProviderAllowed: false;
  readonly directModerationProviderAllowed: false;
  readonly directWalletProviderAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly serverSecretsStoredInMobile: false;
  readonly serverSecretsReturnedToUi: false;
  readonly envSecretValuesPrinted: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly externalFoundationStartedNow: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeModerationAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream118IMobileKernelConnectionBridgeEvidence = {
  readonly version: "STREAM-118I";
  readonly selectedSectionId: Stream118IMobileKernelConnectionBridgeSectionId;
  readonly bridgeScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream118IMobileKernelConnectionBridgeSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly mobileKernelBridge: boolean;
  readonly liveUiKernelRoute: boolean;
  readonly shortsUiKernelRoute: boolean;
  readonly businessStreamKernelRoute: boolean;
  readonly creatorProfileKernelRoute: boolean;
  readonly moderationAdminKernelRoute: boolean;
  readonly foundationHandoffPacket: boolean;
  readonly noDirectProviderCalls: boolean;
  readonly noMobileSecrets: boolean;
  readonly externalFoundationNextScope: boolean;
  readonly walletGiftsLast: boolean;
  readonly ownerApprovalGateReady: boolean;
  readonly mobileKernelConnectionBridgeReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly backendImplementationStartedNow: false;
  readonly backendRouteMountedNow: false;
  readonly routeMountExecutedNow: false;
  readonly providerAdapterExecutedNow: false;
  readonly providerCallExecutedNow: false;
  readonly databaseWriteExecutedNow: false;
  readonly productionTrafficEnabledNow: false;
  readonly mobileDirectProviderBridgeAllowed: false;
  readonly directRealtimeProviderAllowed: false;
  readonly directMediaProviderAllowed: false;
  readonly directUploadProviderAllowed: false;
  readonly directPlaybackProviderAllowed: false;
  readonly directAnalyticsProviderAllowed: false;
  readonly directModerationProviderAllowed: false;
  readonly directWalletProviderAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly serverSecretsStoredInMobile: false;
  readonly serverSecretsReturnedToUi: false;
  readonly envSecretValuesPrinted: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly externalFoundationStartedNow: false;
  readonly fakeLaunchAllowed: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakeUploadAllowed: false;
  readonly fakePublishAllowed: false;
  readonly fakePlaybackAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeAnalyticsAllowed: false;
  readonly fakeModerationAllowed: false;
  readonly fakeOrderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream118IMobileKernelConnectionBridgeSectionId, { title: string; description: string }> = {
  mobile_kernel_bridge: {
    title: "Mobile → Kernel bridge",
    description: "Mobile UI actions должны проходить через Stream kernel contracts/facades/events, а не напрямую в provider/backend.",
  },
  live_ui_kernel_route: {
    title: "Live UI через kernel",
    description: "Start/join/end/reconnect/cohost/battle/live source actions остаются local/kernel-bound до backend/provider foundation.",
  },
  shorts_ui_kernel_route: {
    title: "Shorts через kernel",
    description: "Upload/publish/playback/likes/comments/share/save идут через Shorts kernel contracts; fake upload/publish/views запрещены.",
  },
  business_stream_kernel_route: {
    title: "Business Stream через kernel",
    description: "Catalog/lead/product showcase связаны только через Stream/Business contracts; orders/payments не имитируются.",
  },
  creator_profile_kernel_route: {
    title: "Creator Profile через kernel",
    description: "Official streamer/profile/badge/monetization paths остаются draft/review contracts до Admin/backend approval.",
  },
  moderation_admin_kernel_route: {
    title: "Moderation/Admin через kernel",
    description: "Report, 18+, abuse/profanity, AI signals и appeals идут через moderation/Admin contracts, не через direct UI punishment.",
  },
  foundation_handoff_packet: {
    title: "Foundation handoff packet",
    description: "Mobile UI handoff должен указывать Stream foundation order: lifecycle, realtime, media, upload, playback, moderation, Admin.",
  },
  no_direct_provider_calls: {
    title: "Direct provider calls запрещены",
    description: "UI не вызывает realtime/media/upload/CDN/analytics/moderation providers напрямую и не показывает provider success без backend.",
  },
  no_mobile_secrets: {
    title: "No mobile secrets",
    description: "Provider keys, CDN signing keys, AI keys, env values и server secrets не хранятся и не отображаются в mobile.",
  },
  external_foundation_next_scope: {
    title: "Переход к backend/common foundation outside mobile",
    description: "После Stream kernel bridge следующий scope — backend/common foundation outside mobile planning, отдельно от Wallet/Messenger runtime и без скрытого backend write.",
  },
  wallet_gifts_last: {
    title: "Wallet/подарки последние",
    description: "Gifts, diamonds, Wallet, merchant, payout и monetization остаются последним approved этапом после стабильной Stream foundation.",
  },
};

const ALL_SECTIONS: readonly Stream118IMobileKernelConnectionBridgeSectionId[] = [
  "mobile_kernel_bridge",
  "live_ui_kernel_route",
  "shorts_ui_kernel_route",
  "business_stream_kernel_route",
  "creator_profile_kernel_route",
  "moderation_admin_kernel_route",
  "foundation_handoff_packet",
  "no_direct_provider_calls",
  "no_mobile_secrets",
  "external_foundation_next_scope",
  "wallet_gifts_last",
];

const withReadySection = (
  readySectionIds: readonly Stream118IMobileKernelConnectionBridgeSectionId[],
  sectionId: Stream118IMobileKernelConnectionBridgeSectionId,
): readonly Stream118IMobileKernelConnectionBridgeSectionId[] => {
  if (readySectionIds.includes(sectionId)) return readySectionIds;
  return [...readySectionIds, sectionId];
};

const buildSectionItems = (state: Stream118IMobileKernelConnectionBridgeState): readonly Stream118IMobileKernelConnectionBridgeSection[] => {
  return ALL_SECTIONS.map((id) => ({
    id,
    title: SECTION_COPY[id].title,
    description: SECTION_COPY[id].description,
    status: state.readySectionIds.includes(id) ? "ready" : "pending",
  }));
};

export const createInitialStream118IMobileKernelConnectionBridgeState = (): Stream118IMobileKernelConnectionBridgeState => ({
  version: "STREAM-118I",
  selectedSectionId: "mobile_kernel_bridge",
  readySectionIds: ["mobile_kernel_bridge", "no_direct_provider_calls", "no_mobile_secrets", "wallet_gifts_last"],
  lastAction: "118I mobile kernel bridge prepared: UI actions stay kernel-bound; direct provider/backend/DB/Wallet/gift execution is blocked.",
  mobileKernelBridgeLocal: true,
  liveUiKernelRouteLocal: false,
  shortsUiKernelRouteLocal: false,
  businessStreamKernelRouteLocal: false,
  creatorProfileKernelRouteLocal: false,
  moderationAdminKernelRouteLocal: false,
  foundationHandoffPacketLocal: false,
  noDirectProviderCallsLocal: true,
  noMobileSecretsLocal: true,
  externalFoundationNextScopeLocal: false,
  walletGiftsLastLocal: true,
  allConnectionsThroughKernel: true,
  sourceOnlyMobileKernelBridge: true,
  ownerApprovalGateRequired: true,
  backendImplementationStartedNow: false,
  backendRouteMountedNow: false,
  routeMountExecutedNow: false,
  providerAdapterExecutedNow: false,
  providerCallExecutedNow: false,
  databaseWriteExecutedNow: false,
  productionTrafficEnabledNow: false,
  mobileDirectProviderBridgeAllowed: false,
  directRealtimeProviderAllowed: false,
  directMediaProviderAllowed: false,
  directUploadProviderAllowed: false,
  directPlaybackProviderAllowed: false,
  directAnalyticsProviderAllowed: false,
  directModerationProviderAllowed: false,
  directWalletProviderAllowed: false,
  directGiftPaymentAllowed: false,
  serverSecretsStoredInMobile: false,
  serverSecretsReturnedToUi: false,
  envSecretValuesPrinted: false,
  walletTouchedNow: false,
  messengerTouchedNow: false,
  mainAiTouchedNow: false,
  externalFoundationStartedNow: false,
  fakeLaunchAllowed: false,
  fakeLiveAllowed: false,
  fakeRealtimeAllowed: false,
  fakeProviderAllowed: false,
  fakeUploadAllowed: false,
  fakePublishAllowed: false,
  fakePlaybackAllowed: false,
  fakeViewsAllowed: false,
  fakeAnalyticsAllowed: false,
  fakeModerationAllowed: false,
  fakeOrderAllowed: false,
  fakePaymentAllowed: false,
  fakeGiftSendingAllowed: false,
  giftSendingImplementedNow: false,
  monetizationImplementedNow: false,
});

export const selectStream118IMobileKernelConnectionBridgeSection = (
  state: Stream118IMobileKernelConnectionBridgeState,
  selectedSectionId: Stream118IMobileKernelConnectionBridgeSectionId,
): Stream118IMobileKernelConnectionBridgeState => ({
  ...state,
  selectedSectionId,
  lastAction: `118I selected ${SECTION_COPY[selectedSectionId].title}: ${SECTION_COPY[selectedSectionId].description}`,
});

export const markStream118IMobileKernelConnectionBridgeSectionReady = (
  state: Stream118IMobileKernelConnectionBridgeState,
  sectionId: Stream118IMobileKernelConnectionBridgeSectionId,
  action: string,
): Stream118IMobileKernelConnectionBridgeState => ({
  ...state,
  selectedSectionId: sectionId,
  readySectionIds: withReadySection(state.readySectionIds, sectionId),
  lastAction: action,
  mobileKernelBridgeLocal: state.mobileKernelBridgeLocal || sectionId === "mobile_kernel_bridge",
  liveUiKernelRouteLocal: state.liveUiKernelRouteLocal || sectionId === "live_ui_kernel_route",
  shortsUiKernelRouteLocal: state.shortsUiKernelRouteLocal || sectionId === "shorts_ui_kernel_route",
  businessStreamKernelRouteLocal: state.businessStreamKernelRouteLocal || sectionId === "business_stream_kernel_route",
  creatorProfileKernelRouteLocal: state.creatorProfileKernelRouteLocal || sectionId === "creator_profile_kernel_route",
  moderationAdminKernelRouteLocal: state.moderationAdminKernelRouteLocal || sectionId === "moderation_admin_kernel_route",
  foundationHandoffPacketLocal: state.foundationHandoffPacketLocal || sectionId === "foundation_handoff_packet",
  noDirectProviderCallsLocal: state.noDirectProviderCallsLocal || sectionId === "no_direct_provider_calls",
  noMobileSecretsLocal: state.noMobileSecretsLocal || sectionId === "no_mobile_secrets",
  externalFoundationNextScopeLocal: state.externalFoundationNextScopeLocal || sectionId === "external_foundation_next_scope",
  walletGiftsLastLocal: state.walletGiftsLastLocal || sectionId === "wallet_gifts_last",
});

export const markStream118IMobileKernelConnectionBridgeAllReady = (
  state: Stream118IMobileKernelConnectionBridgeState,
  action: string,
): Stream118IMobileKernelConnectionBridgeState => ({
  ...state,
  selectedSectionId: "external_foundation_next_scope",
  readySectionIds: ALL_SECTIONS,
  lastAction: action,
  mobileKernelBridgeLocal: true,
  liveUiKernelRouteLocal: true,
  shortsUiKernelRouteLocal: true,
  businessStreamKernelRouteLocal: true,
  creatorProfileKernelRouteLocal: true,
  moderationAdminKernelRouteLocal: true,
  foundationHandoffPacketLocal: true,
  noDirectProviderCallsLocal: true,
  noMobileSecretsLocal: true,
  externalFoundationNextScopeLocal: true,
  walletGiftsLastLocal: true,
});

export const buildStream118IMobileKernelConnectionBridgeEvidence = (
  state: Stream118IMobileKernelConnectionBridgeState,
  runtime: StreamRoomRuntimeState,
  ownerApprovalGateEvidence: Stream118HProtectedRouteMountOwnerApprovalGateEvidence,
): Stream118IMobileKernelConnectionBridgeEvidence => {
  const sectionItems = buildSectionItems(state);
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = ALL_SECTIONS.length;
  const bridgeScore = Math.round((readySections / totalSections) * 100);
  const ownerApprovalGateReady = ownerApprovalGateEvidence.ownerApprovalGateReady;
  const mobileKernelConnectionBridgeReady = ownerApprovalGateReady
    && state.mobileKernelBridgeLocal
    && state.liveUiKernelRouteLocal
    && state.shortsUiKernelRouteLocal
    && state.businessStreamKernelRouteLocal
    && state.creatorProfileKernelRouteLocal
    && state.moderationAdminKernelRouteLocal
    && state.foundationHandoffPacketLocal
    && state.noDirectProviderCallsLocal
    && state.noMobileSecretsLocal
    && state.externalFoundationNextScopeLocal
    && state.walletGiftsLastLocal;

  const activeLocalPreview = runtime.status === "local_preview_active";

  return {
    version: "STREAM-118I",
    selectedSectionId: state.selectedSectionId,
    bridgeScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Mobile UI → Stream kernel → backend/common foundation outside mobile bridge",
    heroSubtitle: "118I связывает mobile UI actions с kernel contracts/facades/events и готовит безопасный переход к backend/common foundation outside mobile без backend/provider execution.",
    phoneStatus: activeLocalPreview ? "Preview local; все действия остаются через kernel bridge" : "Kernel bridge готовится без route mount/provider/DB",
    primaryAction: "Закрыть mobile UI bridge: Live, Shorts, Business Stream, Creator Profile и Moderation/Admin идут через kernel; дальше отдельный backend/common foundation outside mobile scope.",
    secondaryAction: state.lastAction,
    mobileKernelBridge: state.mobileKernelBridgeLocal,
    liveUiKernelRoute: state.liveUiKernelRouteLocal,
    shortsUiKernelRoute: state.shortsUiKernelRouteLocal,
    businessStreamKernelRoute: state.businessStreamKernelRouteLocal,
    creatorProfileKernelRoute: state.creatorProfileKernelRouteLocal,
    moderationAdminKernelRoute: state.moderationAdminKernelRouteLocal,
    foundationHandoffPacket: state.foundationHandoffPacketLocal,
    noDirectProviderCalls: state.noDirectProviderCallsLocal,
    noMobileSecrets: state.noMobileSecretsLocal,
    externalFoundationNextScope: state.externalFoundationNextScopeLocal,
    walletGiftsLast: state.walletGiftsLastLocal,
    ownerApprovalGateReady,
    mobileKernelConnectionBridgeReady,
    allConnectionsThroughKernel: true,
    backendImplementationStartedNow: false,
    backendRouteMountedNow: false,
    routeMountExecutedNow: false,
    providerAdapterExecutedNow: false,
    providerCallExecutedNow: false,
    databaseWriteExecutedNow: false,
    productionTrafficEnabledNow: false,
    mobileDirectProviderBridgeAllowed: false,
    directRealtimeProviderAllowed: false,
    directMediaProviderAllowed: false,
    directUploadProviderAllowed: false,
    directPlaybackProviderAllowed: false,
    directAnalyticsProviderAllowed: false,
    directModerationProviderAllowed: false,
    directWalletProviderAllowed: false,
    directGiftPaymentAllowed: false,
    serverSecretsStoredInMobile: false,
    serverSecretsReturnedToUi: false,
    envSecretValuesPrinted: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    externalFoundationStartedNow: false,
    fakeLaunchAllowed: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakePlaybackAllowed: false,
    fakeViewsAllowed: false,
    fakeAnalyticsAllowed: false,
    fakeModerationAllowed: false,
    fakeOrderAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
};
