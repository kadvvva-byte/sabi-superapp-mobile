export type StreamShortVideoProductionUiSmokeActionId =
  | "like"
  | "comments"
  | "share"
  | "save"
  | "effects"
  | "mp3"
  | "timeline"
  | "playback";

export type StreamShortVideoProductionUiSmokeStatus =
  | "production_actions_bound_local"
  | "production_actions_missing_local";

export type StreamShortVideoProductionUiSmokeAction = {
  readonly id: StreamShortVideoProductionUiSmokeActionId;
  readonly label: string;
  readonly boundLocal: boolean;
  readonly stateTouchedLocal: boolean;
  readonly providerBlockedExpected: true;
};

export type StreamShortVideoProductionUiSmokeInput = {
  readonly likeActionBound: boolean;
  readonly likeStateTouchedLocal: boolean;
  readonly commentsActionBound: boolean;
  readonly commentsStateTouchedLocal: boolean;
  readonly shareActionBound: boolean;
  readonly shareStateTouchedLocal: boolean;
  readonly saveActionBound: boolean;
  readonly saveStateTouchedLocal: boolean;
  readonly effectsActionBound: boolean;
  readonly effectsStateTouchedLocal: boolean;
  readonly mp3ActionBound: boolean;
  readonly mp3StateTouchedLocal: boolean;
  readonly timelineActionBound: boolean;
  readonly timelineStateTouchedLocal: boolean;
  readonly playbackActionBound: boolean;
  readonly playbackStateTouchedLocal: boolean;
};

export type StreamShortVideoProductionUiSmokeEvidence = {
  readonly status: StreamShortVideoProductionUiSmokeStatus;
  readonly totalActions: number;
  readonly boundActions: number;
  readonly touchedActions: number;
  readonly missingActionIds: readonly StreamShortVideoProductionUiSmokeActionId[];
  readonly actions: readonly StreamShortVideoProductionUiSmokeAction[];
  readonly allActionsBoundLocal: boolean;
  readonly anyActionTouchedLocal: boolean;
  readonly oldShortsControlsRendered: false;
  readonly fakePublishAllowed: false;
  readonly fakeProviderSuccessAllowed: false;
  readonly fakeEngagementAllowed: false;
  readonly fakeMp3SuccessAllowed: false;
  readonly providerStillRequired: true;
};

function action(
  id: StreamShortVideoProductionUiSmokeActionId,
  label: string,
  boundLocal: boolean,
  stateTouchedLocal: boolean,
): StreamShortVideoProductionUiSmokeAction {
  return {
    id,
    label,
    boundLocal,
    stateTouchedLocal,
    providerBlockedExpected: true,
  };
}

export function runStreamShortVideoProductionUiSmokeCheck(
  input: StreamShortVideoProductionUiSmokeInput,
): StreamShortVideoProductionUiSmokeEvidence {
  const actions: readonly StreamShortVideoProductionUiSmokeAction[] = [
    action("like", "Лайк", input.likeActionBound, input.likeStateTouchedLocal),
    action("comments", "Комментарии", input.commentsActionBound, input.commentsStateTouchedLocal),
    action("share", "Поделиться", input.shareActionBound, input.shareStateTouchedLocal),
    action("save", "Сохранить", input.saveActionBound, input.saveStateTouchedLocal),
    action("effects", "Эффекты", input.effectsActionBound, input.effectsStateTouchedLocal),
    action("mp3", "MP3", input.mp3ActionBound, input.mp3StateTouchedLocal),
    action("timeline", "Таймлайн", input.timelineActionBound, input.timelineStateTouchedLocal),
    action("playback", "Плеер", input.playbackActionBound, input.playbackStateTouchedLocal),
  ];

  const missingActionIds = actions.filter((item) => !item.boundLocal).map((item) => item.id);
  const boundActions = actions.length - missingActionIds.length;
  const touchedActions = actions.filter((item) => item.stateTouchedLocal).length;
  const allActionsBoundLocal = missingActionIds.length === 0;

  return {
    status: allActionsBoundLocal ? "production_actions_bound_local" : "production_actions_missing_local",
    totalActions: actions.length,
    boundActions,
    touchedActions,
    missingActionIds,
    actions,
    allActionsBoundLocal,
    anyActionTouchedLocal: touchedActions > 0,
    oldShortsControlsRendered: false,
    fakePublishAllowed: false,
    fakeProviderSuccessAllowed: false,
    fakeEngagementAllowed: false,
    fakeMp3SuccessAllowed: false,
    providerStillRequired: true,
  };
}
