export type StreamShortVideoSocialFinalBehaviorActionId = "like" | "comments" | "share" | "save";

export type StreamShortVideoSocialFinalBehaviorInput = {
  readonly likedLocal: boolean;
  readonly commentsOpenedLocal: boolean;
  readonly commentsCountLocal: number;
  readonly shareDraftPreparedLocal: boolean;
  readonly savedLocal: boolean;
  readonly fakeLikeAllowed: false;
  readonly fakeCommentDeliveryAllowed: false;
  readonly fakeShareDeliveryAllowed: false;
  readonly fakeSaveProviderAllowed: false;
};

export type StreamShortVideoSocialFinalBehaviorAction = {
  readonly id: StreamShortVideoSocialFinalBehaviorActionId;
  readonly label: string;
  readonly readyLocal: boolean;
};

export type StreamShortVideoSocialFinalBehaviorEvidence = {
  readonly actions: readonly StreamShortVideoSocialFinalBehaviorAction[];
  readonly readyActions: number;
  readonly totalActions: number;
  readonly localStateBound: boolean;
  readonly fakeSuccessBlocked: boolean;
  readonly safetyMessage: string;
};

export function buildStreamShortVideoSocialFinalBehaviorEvidence(input: StreamShortVideoSocialFinalBehaviorInput): StreamShortVideoSocialFinalBehaviorEvidence {
  const actions: readonly StreamShortVideoSocialFinalBehaviorAction[] = [
    { id: "like", label: "Лайк", readyLocal: input.likedLocal },
    { id: "comments", label: input.commentsCountLocal > 0 ? "Комментарий отправлен" : "Комментарии", readyLocal: input.commentsOpenedLocal || input.commentsCountLocal > 0 },
    { id: "share", label: "Поделиться", readyLocal: input.shareDraftPreparedLocal },
    { id: "save", label: "Сохранить", readyLocal: input.savedLocal },
  ];

  const readyActions = actions.filter((action) => action.readyLocal).length;
  const fakeSuccessBlocked = !input.fakeLikeAllowed && !input.fakeCommentDeliveryAllowed && !input.fakeShareDeliveryAllowed && !input.fakeSaveProviderAllowed;

  return {
    actions,
    readyActions,
    totalActions: actions.length,
    localStateBound: readyActions > 0,
    fakeSuccessBlocked,
    safetyMessage: fakeSuccessBlocked
      ? "Лайк, комментарии, поделиться и сохранить работают локально в этом черновике. Синхронизация подключится после сервисного контракта."
      : "Обнаружено небезопасное состояние соц-успеха.",
  };
}
