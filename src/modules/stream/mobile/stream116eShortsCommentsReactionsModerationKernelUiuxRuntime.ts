import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { Stream116DShortsFeedPlaybackEvidence } from "./stream116dShortsFeedPlaybackKernelUiuxRuntime";

export type Stream116EShortsCommentsReactionsSectionId =
  | "comments_thread"
  | "reply_composer"
  | "reaction_picker"
  | "report_comment"
  | "ai_moderation"
  | "language_18_guard"
  | "creator_controls"
  | "kernel_comment_contract"
  | "comment_send_blocked"
  | "gifts_monetization_deferred";

export type Stream116EShortsCommentsReactionsStatus = "ready" | "needs_polish";

export type Stream116EShortsCommentsReactionsSection = {
  readonly id: Stream116EShortsCommentsReactionsSectionId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream116EShortsCommentsReactionsStatus;
};

export type Stream116EShortsCommentsReactionsState = {
  readonly version: "STREAM-116E";
  readonly selectedSectionId: Stream116EShortsCommentsReactionsSectionId;
  readonly readySectionIds: readonly Stream116EShortsCommentsReactionsSectionId[];
  readonly lastAction: string;
  readonly commentsThreadLocal: boolean;
  readonly replyComposerLocal: boolean;
  readonly reactionPickerLocal: boolean;
  readonly reportCommentLocal: boolean;
  readonly aiModerationLocal: boolean;
  readonly language18GuardLocal: boolean;
  readonly creatorControlsLocal: boolean;
  readonly kernelCommentContractLocal: boolean;
  readonly commentSendBlockedLocal: boolean;
  readonly giftsMonetizationDeferredLocal: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directShortsProviderAllowed: false;
  readonly directCommentsProviderAllowed: false;
  readonly directReactionProviderAllowed: false;
  readonly directModerationProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly commentsBackendTouchedNow: false;
  readonly reactionsBackendTouchedNow: false;
  readonly moderationBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeCommentSentAllowed: false;
  readonly fakeReplySentAllowed: false;
  readonly fakeReactionSavedAllowed: false;
  readonly fakeReportSubmittedAllowed: false;
  readonly fakeAiVerdictAllowed: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeLanguageAutoTranslateAllowed: false;
  readonly fakeCreatorControlSavedAllowed: false;
  readonly fakeModerationEnforcementAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

export type Stream116EShortsCommentsReactionsEvidence = {
  readonly version: "STREAM-116E";
  readonly selectedSectionId: Stream116EShortsCommentsReactionsSectionId;
  readonly commentsScore: number;
  readonly readySections: number;
  readonly totalSections: number;
  readonly sectionItems: readonly Stream116EShortsCommentsReactionsSection[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly phoneStatus: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly feedPlaybackReady: boolean;
  readonly commentsThreadReady: boolean;
  readonly replyComposerReady: boolean;
  readonly reactionPickerReady: boolean;
  readonly reportCommentReady: boolean;
  readonly aiModerationReady: boolean;
  readonly language18GuardReady: boolean;
  readonly creatorControlsReady: boolean;
  readonly kernelCommentContractReady: boolean;
  readonly commentSendBlockedReady: boolean;
  readonly giftsMonetizationDeferredReady: boolean;
  readonly shortsCommentsReactionsUiuxReady: boolean;
  readonly nextShortsFinalCleanupReady: boolean;
  readonly allConnectionsThroughKernel: true;
  readonly directShortsProviderAllowed: false;
  readonly directCommentsProviderAllowed: false;
  readonly directReactionProviderAllowed: false;
  readonly directModerationProviderAllowed: false;
  readonly directProfileProviderAllowed: false;
  readonly directBusinessProviderAllowed: false;
  readonly directWalletConnectionAllowed: false;
  readonly directGiftPaymentAllowed: false;
  readonly commentsBackendTouchedNow: false;
  readonly reactionsBackendTouchedNow: false;
  readonly moderationBackendTouchedNow: false;
  readonly profileBackendTouchedNow: false;
  readonly businessBackendTouchedNow: false;
  readonly walletTouchedNow: false;
  readonly messengerTouchedNow: false;
  readonly mainAiTouchedNow: false;
  readonly fakeCommentSentAllowed: false;
  readonly fakeReplySentAllowed: false;
  readonly fakeReactionSavedAllowed: false;
  readonly fakeReportSubmittedAllowed: false;
  readonly fakeAiVerdictAllowed: false;
  readonly fakeAgeVerificationAllowed: false;
  readonly fakeLanguageAutoTranslateAllowed: false;
  readonly fakeCreatorControlSavedAllowed: false;
  readonly fakeModerationEnforcementAllowed: false;
  readonly fakeViewsAllowed: false;
  readonly fakeLikesAllowed: false;
  readonly fakeMonetizationAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly fakeGiftSendingAllowed: false;
  readonly giftSendingImplementedNow: false;
  readonly monetizationImplementedNow: false;
};

const SECTION_COPY: Record<Stream116EShortsCommentsReactionsSectionId, { title: string; description: string }> = {
  comments_thread: {
    title: "Поток комментариев",
    description: "Чистая поверхность комментариев с компактными читаемыми строками и без имитации истории.",
  },
  reply_composer: {
    title: "Composer ответа",
    description: "Поле ответа показано как kernel-намерение, а не как имитация отправленного сообщения.",
  },
  reaction_picker: {
    title: "Выбор реакции",
    description: "Реакции — локальные UI-намерения; счётчики и persistence ждут kernel/backend.",
  },
  report_comment: {
    title: "Жалоба на комментарий",
    description: "Жалоба открывает безопасный путь проверки без имитации отправки жалобы.",
  },
  ai_moderation: {
    title: "AI-модерация",
    description: "Sabi AI защищает от мата, оскорблений и буллинга без имитации вердикта или auto-ban.",
  },
  language_18_guard: {
    title: "Язык + 18+ guard",
    description: "Текст безопасности для 25 языков и 18+ готов; без имитации age/legal verification.",
  },
  creator_controls: {
    title: "Контроли автора",
    description: "Автор может проверять, pin/hide intent и safety states через Stream kernel.",
  },
  kernel_comment_contract: {
    title: "Контракт комментариев kernel",
    description: "Комментарии, реакции, жалобы и модерация должны идти через core/kernel events.",
  },
  comment_send_blocked: {
    title: "Без имитации отправки",
    description: "Send/reply/reaction/report enforcement остаётся заблокированным до backend/provider работы.",
  },
  gifts_monetization_deferred: {
    title: "Подарки позже",
    description: "Реакции-подарки и монетизация отложены до финального gift-этапа Stream.",
  },
};

const ALL_SECTIONS: readonly Stream116EShortsCommentsReactionsSectionId[] = [
  "comments_thread",
  "reply_composer",
  "reaction_picker",
  "report_comment",
  "ai_moderation",
  "language_18_guard",
  "creator_controls",
  "kernel_comment_contract",
  "comment_send_blocked",
  "gifts_monetization_deferred",
];

const FIELD_BY_SECTION: Record<Stream116EShortsCommentsReactionsSectionId, keyof Pick<
  Stream116EShortsCommentsReactionsState,
  | "commentsThreadLocal"
  | "replyComposerLocal"
  | "reactionPickerLocal"
  | "reportCommentLocal"
  | "aiModerationLocal"
  | "language18GuardLocal"
  | "creatorControlsLocal"
  | "kernelCommentContractLocal"
  | "commentSendBlockedLocal"
  | "giftsMonetizationDeferredLocal"
>> = {
  comments_thread: "commentsThreadLocal",
  reply_composer: "replyComposerLocal",
  reaction_picker: "reactionPickerLocal",
  report_comment: "reportCommentLocal",
  ai_moderation: "aiModerationLocal",
  language_18_guard: "language18GuardLocal",
  creator_controls: "creatorControlsLocal",
  kernel_comment_contract: "kernelCommentContractLocal",
  comment_send_blocked: "commentSendBlockedLocal",
  gifts_monetization_deferred: "giftsMonetizationDeferredLocal",
};

function uniqueSectionIds(sectionIds: readonly Stream116EShortsCommentsReactionsSectionId[]): readonly Stream116EShortsCommentsReactionsSectionId[] {
  return Array.from(new Set(sectionIds));
}

export function createInitialStream116EShortsCommentsReactionsState(): Stream116EShortsCommentsReactionsState {
  return {
    version: "STREAM-116E",
    selectedSectionId: "comments_thread",
    readySectionIds: [],
    lastAction: "Комментарии, реакции и модерация Shorts ждут premium UI/UX cleanup.",
    commentsThreadLocal: false,
    replyComposerLocal: false,
    reactionPickerLocal: false,
    reportCommentLocal: false,
    aiModerationLocal: false,
    language18GuardLocal: false,
    creatorControlsLocal: false,
    kernelCommentContractLocal: false,
    commentSendBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
    allConnectionsThroughKernel: true,
    directShortsProviderAllowed: false,
    directCommentsProviderAllowed: false,
    directReactionProviderAllowed: false,
    directModerationProviderAllowed: false,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    commentsBackendTouchedNow: false,
    reactionsBackendTouchedNow: false,
    moderationBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeCommentSentAllowed: false,
    fakeReplySentAllowed: false,
    fakeReactionSavedAllowed: false,
    fakeReportSubmittedAllowed: false,
    fakeAiVerdictAllowed: false,
    fakeAgeVerificationAllowed: false,
    fakeLanguageAutoTranslateAllowed: false,
    fakeCreatorControlSavedAllowed: false,
    fakeModerationEnforcementAllowed: false,
    fakeViewsAllowed: false,
    fakeLikesAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}

export function selectStream116EShortsCommentsReactionsSection(
  state: Stream116EShortsCommentsReactionsState,
  sectionId: Stream116EShortsCommentsReactionsSectionId,
): Stream116EShortsCommentsReactionsState {
  return {
    ...state,
    selectedSectionId: sectionId,
    lastAction: `${SECTION_COPY[sectionId].title}: ${SECTION_COPY[sectionId].description}`,
  };
}

export function markStream116EShortsCommentsReactionsSectionReady(
  state: Stream116EShortsCommentsReactionsState,
  sectionId: Stream116EShortsCommentsReactionsSectionId,
  action: string,
): Stream116EShortsCommentsReactionsState {
  return {
    ...state,
    selectedSectionId: sectionId,
    readySectionIds: uniqueSectionIds([...state.readySectionIds, sectionId]),
    [FIELD_BY_SECTION[sectionId]]: true,
    lastAction: action,
  };
}

export function markStream116EShortsCommentsReactionsAllReady(
  state: Stream116EShortsCommentsReactionsState,
  action: string,
): Stream116EShortsCommentsReactionsState {
  return {
    ...state,
    selectedSectionId: "kernel_comment_contract",
    readySectionIds: ALL_SECTIONS,
    lastAction: action,
    commentsThreadLocal: true,
    replyComposerLocal: true,
    reactionPickerLocal: true,
    reportCommentLocal: true,
    aiModerationLocal: true,
    language18GuardLocal: true,
    creatorControlsLocal: true,
    kernelCommentContractLocal: true,
    commentSendBlockedLocal: true,
    giftsMonetizationDeferredLocal: true,
  };
}

export function buildStream116EShortsCommentsReactionsEvidence(
  state: Stream116EShortsCommentsReactionsState,
  room: StreamRoomRuntimeState,
  feedEvidence: Stream116DShortsFeedPlaybackEvidence,
): Stream116EShortsCommentsReactionsEvidence {
  const sectionItems: Stream116EShortsCommentsReactionsSection[] = ALL_SECTIONS.map((sectionId) => ({
    id: sectionId,
    title: SECTION_COPY[sectionId].title,
    description: SECTION_COPY[sectionId].description,
    status: state.readySectionIds.includes(sectionId) ? "ready" : "needs_polish",
  }));
  const readySections = sectionItems.filter((item) => item.status === "ready").length;
  const totalSections = sectionItems.length;
  const commentsScore = Math.round((readySections / totalSections) * 100);
  const feedPlaybackReady = feedEvidence.shortsFeedPlaybackUiuxReady;
  const shortsCommentsReactionsUiuxReady = feedPlaybackReady
    && commentsScore === 100
    && state.allConnectionsThroughKernel
    && state.directCommentsProviderAllowed === false
    && state.directReactionProviderAllowed === false
    && state.directModerationProviderAllowed === false
    && state.commentsBackendTouchedNow === false
    && state.reactionsBackendTouchedNow === false
    && state.moderationBackendTouchedNow === false
    && state.fakeCommentSentAllowed === false
    && state.fakeReplySentAllowed === false
    && state.fakeReactionSavedAllowed === false
    && state.fakeReportSubmittedAllowed === false
    && state.fakeAiVerdictAllowed === false
    && state.fakeAgeVerificationAllowed === false
    && state.fakeModerationEnforcementAllowed === false
    && state.fakeGiftSendingAllowed === false
    && state.giftSendingImplementedNow === false
    && state.monetizationImplementedNow === false;

  return {
    version: "STREAM-116E",
    selectedSectionId: state.selectedSectionId,
    commentsScore,
    readySections,
    totalSections,
    sectionItems,
    heroTitle: "Комментарии Shorts выглядят premium, безопасно и kernel-ready",
    heroSubtitle: "Комментарии, ответы, реакции, жалобы и AI-модерация организованы как чистый phone UX без имитации отправки, счётчиков, verdicts, gifts или payments.",
    phoneStatus: shortsCommentsReactionsUiuxReady ? "UI/UX комментариев Shorts готов" : "Комментарии Shorts требуют финальной чистки",
    primaryAction: "Открывай комментарии, ответ, реакцию, жалобу и модерацию как чистые kernel-намерения.",
    secondaryAction: "Далее: 116F финальная продуктовая чистка / приёмка Shorts перед подарками и монетизацией.",
    feedPlaybackReady,
    commentsThreadReady: state.commentsThreadLocal,
    replyComposerReady: state.replyComposerLocal,
    reactionPickerReady: state.reactionPickerLocal,
    reportCommentReady: state.reportCommentLocal,
    aiModerationReady: state.aiModerationLocal,
    language18GuardReady: state.language18GuardLocal,
    creatorControlsReady: state.creatorControlsLocal,
    kernelCommentContractReady: state.kernelCommentContractLocal,
    commentSendBlockedReady: state.commentSendBlockedLocal,
    giftsMonetizationDeferredReady: state.giftsMonetizationDeferredLocal,
    shortsCommentsReactionsUiuxReady,
    nextShortsFinalCleanupReady: shortsCommentsReactionsUiuxReady,
    allConnectionsThroughKernel: true,
    directShortsProviderAllowed: false,
    directCommentsProviderAllowed: false,
    directReactionProviderAllowed: false,
    directModerationProviderAllowed: false,
    directProfileProviderAllowed: false,
    directBusinessProviderAllowed: false,
    directWalletConnectionAllowed: false,
    directGiftPaymentAllowed: false,
    commentsBackendTouchedNow: false,
    reactionsBackendTouchedNow: false,
    moderationBackendTouchedNow: false,
    profileBackendTouchedNow: false,
    businessBackendTouchedNow: false,
    walletTouchedNow: false,
    messengerTouchedNow: false,
    mainAiTouchedNow: false,
    fakeCommentSentAllowed: false,
    fakeReplySentAllowed: false,
    fakeReactionSavedAllowed: false,
    fakeReportSubmittedAllowed: false,
    fakeAiVerdictAllowed: false,
    fakeAgeVerificationAllowed: false,
    fakeLanguageAutoTranslateAllowed: false,
    fakeCreatorControlSavedAllowed: false,
    fakeModerationEnforcementAllowed: false,
    fakeViewsAllowed: false,
    fakeLikesAllowed: false,
    fakeMonetizationAllowed: false,
    fakePaymentAllowed: false,
    fakeGiftSendingAllowed: false,
    giftSendingImplementedNow: false,
    monetizationImplementedNow: false,
  };
}
