import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream114IBusinessAcceptanceEvidence } from "./stream114iBusinessAcceptanceHandoffKernelUiuxRuntime";

export type Stream115ACreatorProfileSectionId =
  | "creator_profile_entry"
  | "profile_header_identity"
  | "live_status_context"
  | "content_categories"
  | "followers_social_proof"
  | "official_streamer_boundary"
  | "business_creator_boundary"
  | "kernel_profile_contract"
  | "language_layer_inherited"
  | "gifts_deferred_boundary";

export type Stream115ACreatorProfileStatus = "ready" | "needs_polish";

export type Stream115ACreatorProfileSection = {
  readonly id: Stream115ACreatorProfileSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream115ACreatorProfileStatus;
};

export type Stream115ACreatorProfileState = {
  readonly version: "STREAM-115A";
  readonly selectedSectionId: Stream115ACreatorProfileSectionId;
  readonly readySectionIds: readonly Stream115ACreatorProfileSectionId[];
  readonly lastAction: string;
  readonly creatorProfileEntryLocal: boolean;
  readonly profileHeaderIdentityLocal: boolean;
  readonly liveStatusContextLocal: boolean;
  readonly contentCategoriesLocal: boolean;
  readonly followersSocialProofLocal: boolean;
  readonly officialStreamerBoundaryLocal: boolean;
  readonly businessCreatorBoundaryLocal: boolean;
  readonly kernelProfileContractLocal: boolean;
  readonly languageLayerInheritedLocal: boolean;
  readonly giftsDeferredBoundaryLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly scatteredProfileServiceAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeProfileVerificationAllowed: false;
  readonly fakeFollowerCountAllowed: false;
  readonly fakeLiveStatusAllowed: false;
  readonly fakeBusinessAccountAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

export type Stream115ACreatorProfileEvidence = {
  readonly version: "STREAM-115A";
  readonly selectedSectionId: Stream115ACreatorProfileSectionId;
  readonly creatorProfileScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream115ACreatorProfileSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly businessStreamAccepted: boolean;
  readonly creatorProfileEntryReady: boolean;
  readonly profileHeaderIdentityReady: boolean;
  readonly liveStatusContextReady: boolean;
  readonly contentCategoriesReady: boolean;
  readonly followersSocialProofReady: boolean;
  readonly officialStreamerBoundaryReady: boolean;
  readonly businessCreatorBoundaryReady: boolean;
  readonly kernelProfileContractReady: boolean;
  readonly languageLayerInheritedReady: boolean;
  readonly giftsDeferredBoundaryReady: boolean;
  readonly creatorProfileUiuxFoundationReady: boolean;
  readonly streamProfileNextPolishReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly scatteredProfileServiceAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeProfileVerificationAllowed: false;
  readonly fakeFollowerCountAllowed: false;
  readonly fakeLiveStatusAllowed: false;
  readonly fakeBusinessAccountAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
};

const SECTION_ORDER: readonly Stream115ACreatorProfileSectionId[] = [
  "creator_profile_entry",
  "profile_header_identity",
  "live_status_context",
  "content_categories",
  "followers_social_proof",
  "official_streamer_boundary",
  "business_creator_boundary",
  "kernel_profile_contract",
  "language_layer_inherited",
  "gifts_deferred_boundary",
];

const SECTION_TITLES: Record<Stream115ACreatorProfileSectionId, string> = {
  creator_profile_entry: "Вход в профиль",
  profile_header_identity: "Личность автора",
  live_status_context: "Статус эфира",
  content_categories: "Категории",
  followers_social_proof: "Социальное подтверждение",
  official_streamer_boundary: "Официальный стример",
  business_creator_boundary: "Граница бизнеса",
  kernel_profile_contract: "Контракт ядра",
  language_layer_inherited: "25 языков",
  gifts_deferred_boundary: "Подарки позже",
};

const SECTION_DESCRIPTIONS: Record<Stream115ACreatorProfileSectionId, string> = {
  creator_profile_entry: "Профиль стримера начинается в правильном порядке после принятия Live и Business Stream.",
  profile_header_identity: "Шапка, аватар, обложка, имя, описание и действия профиля заданы только как чистый UI-контекст.",
  live_status_context: "Статус эфира представлен как состояние ядра, без фейковых счётчиков онлайн/эфира и без состояния провайдера.",
  content_categories: "Категории контента готовят страницу автора для Live, Shorts и будущего бизнес-контекста.",
  followers_social_proof: "Подписчики и социальное подтверждение остаются только UI-заготовкой; фейковые подписчики и популярность запрещены.",
  official_streamer_boundary: "Статус официального стримера и регистрация обозначены как будущая проверка, без фейковой верификации.",
  business_creator_boundary: "Бизнес-контекст автора связан аккуратно, без фейковой готовности Business Account/Merchant.",
  kernel_profile_contract: "Профиль, статус эфира, подписка/поделиться и будущие события должны идти через контракты/фасады/события ядра Stream.",
  language_layer_inherited: "Профиль наследует 25-язычный реестр Live и не заменяет его захардкоженными четырьмя языками.",
  gifts_deferred_boundary: "Подарки обязательны позже и должны быть корректными, но остаются отложенными до финального этапа монетизации/подарков Stream.",
};

function uniqueReady(items: readonly Stream115ACreatorProfileSectionId[]): readonly Stream115ACreatorProfileSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream115ACreatorProfileState(): Stream115ACreatorProfileState {
  return {
    version: "STREAM-115A",
    selectedSectionId: "creator_profile_entry",
    readySectionIds: ["kernel_profile_contract", "language_layer_inherited", "gifts_deferred_boundary"],
    lastAction: "115A начинает UI/UX профиля стримера в правильном порядке: только ядро, без фейковых метрик профиля и подарков.",
    creatorProfileEntryLocal: false,
    profileHeaderIdentityLocal: false,
    liveStatusContextLocal: false,
    contentCategoriesLocal: false,
    followersSocialProofLocal: false,
    officialStreamerBoundaryLocal: false,
    businessCreatorBoundaryLocal: false,
    kernelProfileContractLocal: true,
    languageLayerInheritedLocal: true,
    giftsDeferredBoundaryLocal: true,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    scatteredProfileServiceAllowed: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeProfileVerificationAllowed: false,
    fakeFollowerCountAllowed: false,
    fakeLiveStatusAllowed: false,
    fakeBusinessAccountAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}

function setReadyFlag(state: Stream115ACreatorProfileState, sectionId: Stream115ACreatorProfileSectionId): Stream115ACreatorProfileState {
  return {
    ...state,
    creatorProfileEntryLocal: state.creatorProfileEntryLocal || sectionId === "creator_profile_entry",
    profileHeaderIdentityLocal: state.profileHeaderIdentityLocal || sectionId === "profile_header_identity",
    liveStatusContextLocal: state.liveStatusContextLocal || sectionId === "live_status_context",
    contentCategoriesLocal: state.contentCategoriesLocal || sectionId === "content_categories",
    followersSocialProofLocal: state.followersSocialProofLocal || sectionId === "followers_social_proof",
    officialStreamerBoundaryLocal: state.officialStreamerBoundaryLocal || sectionId === "official_streamer_boundary",
    businessCreatorBoundaryLocal: state.businessCreatorBoundaryLocal || sectionId === "business_creator_boundary",
    kernelProfileContractLocal: state.kernelProfileContractLocal || sectionId === "kernel_profile_contract",
    languageLayerInheritedLocal: state.languageLayerInheritedLocal || sectionId === "language_layer_inherited",
    giftsDeferredBoundaryLocal: state.giftsDeferredBoundaryLocal || sectionId === "gifts_deferred_boundary",
  };
}

export function selectStream115ACreatorProfileSection(state: Stream115ACreatorProfileState, sectionId: Stream115ACreatorProfileSectionId): Stream115ACreatorProfileState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `115A selected ${SECTION_TITLES[sectionId]} for Stream profile/creator UI/UX.`,
  };
}

export function markStream115ACreatorProfileSectionReady(state: Stream115ACreatorProfileState, sectionId: Stream115ACreatorProfileSectionId, action: string): Stream115ACreatorProfileState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream115ACreatorProfileAllReady(state: Stream115ACreatorProfileState, action: string): Stream115ACreatorProfileState {
  return {
    ...state,
    selectedSectionId: "gifts_deferred_boundary",
    readySectionIds: SECTION_ORDER,
    creatorProfileEntryLocal: true,
    profileHeaderIdentityLocal: true,
    liveStatusContextLocal: true,
    contentCategoriesLocal: true,
    followersSocialProofLocal: true,
    officialStreamerBoundaryLocal: true,
    businessCreatorBoundaryLocal: true,
    kernelProfileContractLocal: true,
    languageLayerInheritedLocal: true,
    giftsDeferredBoundaryLocal: true,
    lastAction: action,
  };
}

export function buildStream115ACreatorProfileEvidence(
  state: Stream115ACreatorProfileState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  businessAcceptanceEvidence: Stream114IBusinessAcceptanceEvidence,
): Stream115ACreatorProfileEvidence {
  const readySectionIds = uniqueReady(state.readySectionIds);
  const businessStreamAccepted = businessAcceptanceEvidence.businessStreamUiuxAccepted
    && businessAcceptanceEvidence.streamOverallNextStepReady
    && businessAcceptanceEvidence.allConnectionsThroughKernel
    && businessAcceptanceEvidence.fakeOrderAllowed === false
    && businessAcceptanceEvidence.fakePaymentAllowed === false
    && businessAcceptanceEvidence.fakeGiftSendingAllowed === false;

  const creatorProfileEntryReady = state.creatorProfileEntryLocal && businessStreamAccepted;
  const profileHeaderIdentityReady = state.profileHeaderIdentityLocal && creatorProfileEntryReady;
  const liveStatusContextReady = state.liveStatusContextLocal && (stage.status === "broadcast_handoff_blocked" || businessAcceptanceEvidence.fakeRealtimeAllowed === false);
  const contentCategoriesReady = state.contentCategoriesLocal && creatorProfileEntryReady;
  const followersSocialProofReady = state.followersSocialProofLocal && state.fakeFollowerCountAllowed === false;
  const officialStreamerBoundaryReady = state.officialStreamerBoundaryLocal && state.fakeProfileVerificationAllowed === false;
  const businessCreatorBoundaryReady = state.businessCreatorBoundaryLocal && state.fakeBusinessAccountAllowed === false && businessAcceptanceEvidence.directMerchantConnectionAllowed === false;
  const kernelProfileContractReady = state.kernelProfileContractLocal && state.allConnectionsThroughKernel && businessAcceptanceEvidence.allConnectionsThroughKernel;
  const languageLayerInheritedReady = state.languageLayerInheritedLocal;
  const giftsDeferredBoundaryReady = state.giftsDeferredBoundaryLocal && state.fakeGiftSendingAllowed === false && state.giftSendingImplementedNow === false;
  const fakeSafetyReady = state.fakeProfileVerificationAllowed === false
    && state.fakeFollowerCountAllowed === false
    && state.fakeLiveStatusAllowed === false
    && state.fakeBusinessAccountAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false;
  const readyFlags = [
    creatorProfileEntryReady,
    profileHeaderIdentityReady,
    liveStatusContextReady,
    contentCategoriesReady,
    followersSocialProofReady,
    officialStreamerBoundaryReady,
    businessCreatorBoundaryReady,
    kernelProfileContractReady,
    languageLayerInheritedReady,
    giftsDeferredBoundaryReady,
  ];
  const readySections = readyFlags.filter(Boolean).length;
  const creatorProfileUiuxFoundationReady = readyFlags.every(Boolean) && fakeSafetyReady;
  const sectionItems = SECTION_ORDER.map((id): Stream115ACreatorProfileSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
  const roomTitle = room.title || "Sabi Stream";
  return {
    version: "STREAM-115A",
    selectedSectionId: state.selectedSectionId,
    creatorProfileScore: Math.round((readySections / SECTION_ORDER.length) * 100),
    readySections,
    totalSections: SECTION_ORDER.length,
    sectionItems,
    heroTitle: creatorProfileUiuxFoundationReady ? "Профиль стримера готов как основа UI/UX" : "Доведи профиль стримера как следующий этап Stream",
    heroSubtitle: `${roomTitle}: профиль стримера — только UI/намерение ядра. Без фейковых подписчиков, фейковой верификации и подарков/платежей сейчас.`,
    phoneStatus: creatorProfileUiuxFoundationReady ? "Основа профиля стримера готова · только ядро" : "Проверка основы профиля стримера",
    primaryAction: "Собрать чистый профиль стримера: личность, статус эфира, категории, контекст подписчиков, официальная граница.",
    secondaryAction: creatorProfileUiuxFoundationReady ? "Следующий этап: 115B регистрация официального стримера / настройка автора UI/UX." : "Закрой разделы профиля без фейковых метрик профиля и без реализации подарков/платежей.",
    businessStreamAccepted,
    creatorProfileEntryReady,
    profileHeaderIdentityReady,
    liveStatusContextReady,
    contentCategoriesReady,
    followersSocialProofReady,
    officialStreamerBoundaryReady,
    businessCreatorBoundaryReady,
    kernelProfileContractReady,
    languageLayerInheritedReady,
    giftsDeferredBoundaryReady,
    creatorProfileUiuxFoundationReady,
    streamProfileNextPolishReady: creatorProfileUiuxFoundationReady,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    scatteredProfileServiceAllowed: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeProfileVerificationAllowed: false,
    fakeFollowerCountAllowed: false,
    fakeLiveStatusAllowed: false,
    fakeBusinessAccountAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
  };
}
