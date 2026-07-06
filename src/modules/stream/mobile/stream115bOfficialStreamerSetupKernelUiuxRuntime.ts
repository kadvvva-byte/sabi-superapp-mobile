import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream115ACreatorProfileEvidence } from "./stream115aCreatorProfileMainKernelUiuxRuntime";

export type Stream115BOfficialStreamerSetupSectionId =
  | "setup_entry"
  | "creator_rules"
  | "identity_review"
  | "category_setup"
  | "content_safety"
  | "official_application"
  | "business_creator_option"
  | "ai_moderation_boundary"
  | "kernel_setup_contract"
  | "gifts_monetization_deferred";

export type Stream115BOfficialStreamerSetupStatus = "ready" | "needs_polish";

export type Stream115BOfficialStreamerSetupSection = {
  readonly id: Stream115BOfficialStreamerSetupSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream115BOfficialStreamerSetupStatus;
};

export type Stream115BOfficialStreamerSetupState = {
  readonly version: "STREAM-115B";
  readonly selectedSectionId: Stream115BOfficialStreamerSetupSectionId;
  readonly readySectionIds: readonly Stream115BOfficialStreamerSetupSectionId[];
  readonly lastAction: string;
  readonly setupEntryLocal: boolean;
  readonly creatorRulesLocal: boolean;
  readonly identityReviewLocal: boolean;
  readonly categorySetupLocal: boolean;
  readonly contentSafetyLocal: boolean;
  readonly officialApplicationLocal: boolean;
  readonly businessCreatorOptionLocal: boolean;
  readonly aiModerationBoundaryLocal: boolean;
  readonly kernelSetupContractLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directVerificationProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly scatteredCreatorSetupServiceAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly verificationBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeOfficialVerificationAllowed: false;
  readonly fakeDocumentApprovalAllowed: false;
  readonly fakeCreatorEligibilityAllowed: false;
  readonly fakeFollowerRequirementAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream115BOfficialStreamerSetupEvidence = {
  readonly version: "STREAM-115B";
  readonly selectedSectionId: Stream115BOfficialStreamerSetupSectionId;
  readonly setupScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream115BOfficialStreamerSetupSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly creatorProfileFoundationReady: boolean;
  readonly setupEntryReady: boolean;
  readonly creatorRulesReady: boolean;
  readonly identityReviewReady: boolean;
  readonly categorySetupReady: boolean;
  readonly contentSafetyReady: boolean;
  readonly officialApplicationReady: boolean;
  readonly businessCreatorOptionReady: boolean;
  readonly aiModerationBoundaryReady: boolean;
  readonly kernelSetupContractReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly officialStreamerSetupUiuxReady: boolean;
  readonly creatorNextStepReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directProfileProviderAllowed: false;
  readonly directVerificationProviderAllowed: false;
  readonly directRealtimeConnectionAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly scatteredCreatorSetupServiceAllowed: false;
  readonly profileBackendTouchedNow: false;
  readonly verificationBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly merchantBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeOfficialVerificationAllowed: false;
  readonly fakeDocumentApprovalAllowed: false;
  readonly fakeCreatorEligibilityAllowed: false;
  readonly fakeFollowerRequirementAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_ORDER: readonly Stream115BOfficialStreamerSetupSectionId[] = [
  "setup_entry",
  "creator_rules",
  "identity_review",
  "category_setup",
  "content_safety",
  "official_application",
  "business_creator_option",
  "ai_moderation_boundary",
  "kernel_setup_contract",
  "gifts_monetization_deferred",
];

const SECTION_TITLES: Record<Stream115BOfficialStreamerSetupSectionId, string> = {
  setup_entry: "Настройка автора",
  creator_rules: "Правила",
  identity_review: "Проверка личности",
  category_setup: "Категории",
  content_safety: "Безопасность",
  official_application: "Официальная заявка",
  business_creator_option: "Бизнес-опция",
  ai_moderation_boundary: "AI-защита",
  kernel_setup_contract: "Контракт ядра",
  gifts_monetization_deferred: "Подарки позже",
};

const SECTION_DESCRIPTIONS: Record<Stream115BOfficialStreamerSetupSectionId, string> = {
  setup_entry: "Настройка официального стримера/автора начинается после основы профиля и остаётся чистым продуктовым UI.",
  creator_rules: "Правила читаются до заявки: без травли, незаконного контента и вводящих в заблуждение бизнес-заявлений.",
  identity_review: "Проверка личности/профиля — будущий верифицированный поток, без фейкового одобрения и успеха документов.",
  category_setup: "Категории автора готовят Live, Shorts, Business Stream и будущий поиск профиля.",
  content_safety: "18+, мат, оскорбления, жалобы и проверка Sabi AI наследуются из Live Safety.",
  official_application: "Заявка официального стримера — только намерение заявки, без фейкового бейджа и фейковой пригодности.",
  business_creator_option: "Путь бизнес-автора виден, но Merchant/Wallet/активация бизнеса остаются заблокированы до своего этапа.",
  ai_moderation_boundary: "Sabi AI помогает проверять и направлять безопасность, но не делает фейковый финальный вердикт или фейковый постоянный бан.",
  kernel_setup_contract: "Вся настройка автора, намерение верификации, подписка/поделиться/статус и будущие события проходят через контракты/фасады/события ядра Stream.",
  gifts_monetization_deferred: "Подарки и монетизация обязательны позже, но не реализуются до финального этапа монетизации/подарков Stream.",
};

function uniqueReady(items: readonly Stream115BOfficialStreamerSetupSectionId[]): readonly Stream115BOfficialStreamerSetupSectionId[] {
  return SECTION_ORDER.filter((item) => items.includes(item));
}

export function createInitialStream115BOfficialStreamerSetupState(): Stream115BOfficialStreamerSetupState {
  return {
    version: "STREAM-115B",
    selectedSectionId: "setup_entry",
    readySectionIds: ["kernel_setup_contract", "gifts_monetization_deferred", "ai_moderation_boundary"],
    lastAction: "115B начинает UI/UX настройки официального стримера/автора: только ядро, без фейковой верификации и без монетизации/подарков сейчас.",
    setupEntryLocal: false,
    creatorRulesLocal: false,
    identityReviewLocal: false,
    categorySetupLocal: false,
    contentSafetyLocal: false,
    officialApplicationLocal: false,
    businessCreatorOptionLocal: false,
    aiModerationBoundaryLocal: true,
    kernelSetupContractLocal: true,
    giftsMonetizationDeferredLocal: true,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directVerificationProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    scatteredCreatorSetupServiceAllowed: false,
    profileBackendTouchedNow: false,
    verificationBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeOfficialVerificationAllowed: false,
    fakeDocumentApprovalAllowed: false,
    fakeCreatorEligibilityAllowed: false,
    fakeFollowerRequirementAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

function setReadyFlag(state: Stream115BOfficialStreamerSetupState, sectionId: Stream115BOfficialStreamerSetupSectionId): Stream115BOfficialStreamerSetupState {
  return {
    ...state,
    setupEntryLocal: state.setupEntryLocal || sectionId === "setup_entry",
    creatorRulesLocal: state.creatorRulesLocal || sectionId === "creator_rules",
    identityReviewLocal: state.identityReviewLocal || sectionId === "identity_review",
    categorySetupLocal: state.categorySetupLocal || sectionId === "category_setup",
    contentSafetyLocal: state.contentSafetyLocal || sectionId === "content_safety",
    officialApplicationLocal: state.officialApplicationLocal || sectionId === "official_application",
    businessCreatorOptionLocal: state.businessCreatorOptionLocal || sectionId === "business_creator_option",
    aiModerationBoundaryLocal: state.aiModerationBoundaryLocal || sectionId === "ai_moderation_boundary",
    kernelSetupContractLocal: state.kernelSetupContractLocal || sectionId === "kernel_setup_contract",
    giftsMonetizationDeferredLocal: state.giftsMonetizationDeferredLocal || sectionId === "gifts_monetization_deferred",
  };
}

export function selectStream115BOfficialStreamerSetupSection(state: Stream115BOfficialStreamerSetupState, sectionId: Stream115BOfficialStreamerSetupSectionId): Stream115BOfficialStreamerSetupState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `115B selected ${SECTION_TITLES[sectionId]} for official streamer/creator setup UI/UX.`,
  };
}

export function markStream115BOfficialStreamerSetupSectionReady(state: Stream115BOfficialStreamerSetupState, sectionId: Stream115BOfficialStreamerSetupSectionId, action: string): Stream115BOfficialStreamerSetupState {
  const next = setReadyFlag(state, sectionId);
  return {
    ...next,
    selectedSectionId: sectionId,
    readySectionIds: uniqueReady([...next.readySectionIds, sectionId]),
    lastAction: action,
  };
}

export function markStream115BOfficialStreamerSetupAllReady(state: Stream115BOfficialStreamerSetupState, action: string): Stream115BOfficialStreamerSetupState {
  return {
    ...state,
    selectedSectionId: "gifts_monetization_deferred",
    readySectionIds: SECTION_ORDER,
    setupEntryLocal: true,
    creatorRulesLocal: true,
    identityReviewLocal: true,
    categorySetupLocal: true,
    contentSafetyLocal: true,
    officialApplicationLocal: true,
    businessCreatorOptionLocal: true,
    aiModerationBoundaryLocal: true,
    kernelSetupContractLocal: true,
    giftsMonetizationDeferredLocal: true,
    lastAction: action,
  };
}

export function buildStream115BOfficialStreamerSetupEvidence(
  state: Stream115BOfficialStreamerSetupState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  creatorProfileEvidence: Stream115ACreatorProfileEvidence,
): Stream115BOfficialStreamerSetupEvidence {
  const readySectionIds = uniqueReady(state.readySectionIds);
  const creatorProfileFoundationReady = creatorProfileEvidence.creatorProfileUiuxFoundationReady
    && creatorProfileEvidence.streamProfileNextPolishReady
    && creatorProfileEvidence.allConnectionsThroughKernel
    && creatorProfileEvidence.fakeProfileVerificationAllowed === false
    && creatorProfileEvidence.fakeFollowerCountAllowed === false
    && creatorProfileEvidence.fakeGiftSendingAllowed === false;

  const setupEntryReady = state.setupEntryLocal && creatorProfileFoundationReady;
  const creatorRulesReady = state.creatorRulesLocal && state.fakeCreatorEligibilityAllowed === false;
  const identityReviewReady = state.identityReviewLocal && state.fakeDocumentApprovalAllowed === false && state.fakeOfficialVerificationAllowed === false;
  const categorySetupReady = state.categorySetupLocal && setupEntryReady;
  const contentSafetyReady = state.contentSafetyLocal && (stage.status === "broadcast_handoff_blocked" || creatorProfileEvidence.fakeLiveStatusAllowed === false);
  const officialApplicationReady = state.officialApplicationLocal && state.fakeOfficialVerificationAllowed === false;
  const businessCreatorOptionReady = state.businessCreatorOptionLocal && state.businessBackendTouchedNow === false && state.merchantBackendTouchedNow === false;
  const aiModerationBoundaryReady = state.aiModerationBoundaryLocal && state.mainAiTouchedNow === false;
  const kernelSetupContractReady = state.kernelSetupContractLocal && state.allConnectionsThroughKernel && creatorProfileEvidence.allConnectionsThroughKernel;
  const giftsMonetizationDeferredReady = state.giftsMonetizationDeferredLocal && state.giftSendingImplementedNow === false && state.monetizationImplementedNow === false;
  const fakeSafetyReady = state.fakeOfficialVerificationAllowed === false
    && state.fakeDocumentApprovalAllowed === false
    && state.fakeCreatorEligibilityAllowed === false
    && state.fakeFollowerRequirementAllowed === false
    && state.fakeMonetizationAllowed === false
    && state.fakePaymentAllowed === false
    && state.fakeGiftSendingAllowed === false;
  const readyFlags = [
    setupEntryReady,
    creatorRulesReady,
    identityReviewReady,
    categorySetupReady,
    contentSafetyReady,
    officialApplicationReady,
    businessCreatorOptionReady,
    aiModerationBoundaryReady,
    kernelSetupContractReady,
    giftsMonetizationDeferredReady,
  ];
  const readySections = readyFlags.filter(Boolean).length;
  const officialStreamerSetupUiuxReady = readyFlags.every(Boolean) && fakeSafetyReady;
  const sectionItems = SECTION_ORDER.map((id): Stream115BOfficialStreamerSetupSection => ({
    id,
    title: SECTION_TITLES[id],
    description: SECTION_DESCRIPTIONS[id],
    status: readySectionIds.includes(id) ? "ready" : "needs_polish",
  }));
  const roomTitle = room.title || "Sabi Stream";
  return {
    version: "STREAM-115B",
    selectedSectionId: state.selectedSectionId,
    setupScore: Math.round((readySections / SECTION_ORDER.length) * 100),
    readySections,
    totalSections: SECTION_ORDER.length,
    sectionItems,
    heroTitle: officialStreamerSetupUiuxReady ? "Настройка автора готова как UI/UX" : "Доведи настройку официального стримера без фейкового одобрения",
    heroSubtitle: `${roomTitle}: заявка официального стримера — только намерение ядра. Без фейкового бейджа, фейковых документов и монетизации/подарков сейчас.`,
    phoneStatus: officialStreamerSetupUiuxReady ? "Настройка автора готова · только ядро" : "Проверка настройки автора",
    primaryAction: "Собрать настройку официального стримера: правила, проверка личности, категории, безопасность, намерение заявки, бизнес-опция.",
    secondaryAction: officialStreamerSetupUiuxReady ? "Следующий этап: 115C вкладки контента профиля / сетка Live + Shorts UI/UX." : "Закрой разделы настройки без фейковой верификации, фейковых метрик, фейковой монетизации и без реализации подарков/платежей.",
    creatorProfileFoundationReady,
    setupEntryReady,
    creatorRulesReady,
    identityReviewReady,
    categorySetupReady,
    contentSafetyReady,
    officialApplicationReady,
    businessCreatorOptionReady,
    aiModerationBoundaryReady,
    kernelSetupContractReady,
    giftsMonetizationDeferredReady,
    officialStreamerSetupUiuxReady,
    creatorNextStepReady: officialStreamerSetupUiuxReady,
    allConnectionsThroughKernel: true,
    directProfileProviderAllowed: false,
    directVerificationProviderAllowed: false,
    directRealtimeConnectionAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    scatteredCreatorSetupServiceAllowed: false,
    profileBackendTouchedNow: false,
    verificationBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    merchantBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeOfficialVerificationAllowed: false,
    fakeDocumentApprovalAllowed: false,
    fakeCreatorEligibilityAllowed: false,
    fakeFollowerRequirementAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
