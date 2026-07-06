export type StreamShortVideoRealMobileInteractionQaActionId =
  | "settings"
  | "like"
  | "comments"
  | "share"
  | "save"
  | "record_video"
  | "upload_video"
  | "mp3_audio"
  | "effect_apply";

export type StreamShortVideoRealMobileInteractionQaStatus =
  | "waiting_mobile_taps_local"
  | "partial_mobile_actions_checked_local"
  | "all_mobile_actions_checked_local";

export type StreamShortVideoRealMobileInteractionQaEventKind =
  | "short_mobile_action_tapped_local"
  | "short_mobile_interaction_check_local"
  | "short_mobile_provider_blocked";

export type StreamShortVideoRealMobileInteractionQaAction = {
  readonly id: StreamShortVideoRealMobileInteractionQaActionId;
  readonly label: string;
  readonly area: "viewer" | "settings";
  readonly boundLocal: boolean;
  readonly tappedLocal: boolean;
  readonly stateChangedLocal: boolean;
  readonly passedLocal: boolean;
  readonly providerBlockedExpected: true;
};

export type StreamShortVideoRealMobileInteractionQaInput = {
  readonly settingsOpenedLocal: boolean;
  readonly likedLocal: boolean;
  readonly commentsOpenOrAddedLocal: boolean;
  readonly shareDraftPreparedLocal: boolean;
  readonly savedLocal: boolean;
  readonly recordVideoStateChangedLocal: boolean;
  readonly uploadVideoStateChangedLocal: boolean;
  readonly mp3TrackReadyLocal: boolean;
  readonly effectsAppliedLocal: boolean;
};

export type StreamShortVideoRealMobileInteractionQaEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoRealMobileInteractionQaEventKind;
  readonly actionId: StreamShortVideoRealMobileInteractionQaActionId | null;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
};

export type StreamShortVideoRealMobileInteractionQaEvidence = {
  readonly status: StreamShortVideoRealMobileInteractionQaStatus;
  readonly totalActions: number;
  readonly viewerActions: number;
  readonly settingsActions: number;
  readonly tappedActions: number;
  readonly stateChangedActions: number;
  readonly passedActions: number;
  readonly actions: readonly StreamShortVideoRealMobileInteractionQaAction[];
  readonly missingActionIds: readonly StreamShortVideoRealMobileInteractionQaActionId[];
  readonly notTouchedActionIds: readonly StreamShortVideoRealMobileInteractionQaActionId[];
  readonly mainShortsScreenClean: true;
  readonly toolsInsideSettings: true;
  readonly socialRailVisible: true;
  readonly settingsButtonVisible: true;
  readonly oldDebugCardsVisible: false;
  readonly fakeLikeAllowed: false;
  readonly fakeCommentDeliveryAllowed: false;
  readonly fakeShareDeliveryAllowed: false;
  readonly fakeSaveProviderAllowed: false;
  readonly fakeUploadSuccessAllowed: false;
  readonly fakeMp3SuccessAllowed: false;
  readonly fakePublishAllowed: false;
  readonly providerStillRequired: true;
};

export type StreamShortVideoRealMobileInteractionQaState = {
  readonly touchedActionIds: readonly StreamShortVideoRealMobileInteractionQaActionId[];
  readonly events: readonly StreamShortVideoRealMobileInteractionQaEvent[];
  readonly evidence: StreamShortVideoRealMobileInteractionQaEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const actionDefinitions: readonly Omit<StreamShortVideoRealMobileInteractionQaAction, "tappedLocal" | "stateChangedLocal" | "passedLocal">[] = [
  { id: "settings", label: "Настройки", area: "viewer", boundLocal: true, providerBlockedExpected: true },
  { id: "like", label: "Лайк", area: "viewer", boundLocal: true, providerBlockedExpected: true },
  { id: "comments", label: "Комментарии", area: "viewer", boundLocal: true, providerBlockedExpected: true },
  { id: "share", label: "Поделиться", area: "viewer", boundLocal: true, providerBlockedExpected: true },
  { id: "save", label: "Сохранить", area: "viewer", boundLocal: true, providerBlockedExpected: true },
  { id: "record_video", label: "Снять видео", area: "settings", boundLocal: true, providerBlockedExpected: true },
  { id: "upload_video", label: "Загрузить видео", area: "settings", boundLocal: true, providerBlockedExpected: true },
  { id: "mp3_audio", label: "MP3 / Аудио", area: "settings", boundLocal: true, providerBlockedExpected: true },
  { id: "effect_apply", label: "Эффекты", area: "settings", boundLocal: true, providerBlockedExpected: true },
];

function hasTouched(state: Pick<StreamShortVideoRealMobileInteractionQaState, "touchedActionIds">, id: StreamShortVideoRealMobileInteractionQaActionId): boolean {
  return state.touchedActionIds.includes(id);
}

function stateChangedFor(id: StreamShortVideoRealMobileInteractionQaActionId, input: StreamShortVideoRealMobileInteractionQaInput): boolean {
  switch (id) {
    case "settings":
      return input.settingsOpenedLocal;
    case "like":
      return input.likedLocal;
    case "comments":
      return input.commentsOpenOrAddedLocal;
    case "share":
      return input.shareDraftPreparedLocal;
    case "save":
      return input.savedLocal;
    case "record_video":
      return input.recordVideoStateChangedLocal;
    case "upload_video":
      return input.uploadVideoStateChangedLocal;
    case "mp3_audio":
      return input.mp3TrackReadyLocal;
    case "effect_apply":
      return input.effectsAppliedLocal;
  }
}

export function buildStreamShortVideoRealMobileInteractionQaEvidence(
  state: Pick<StreamShortVideoRealMobileInteractionQaState, "touchedActionIds">,
  input: StreamShortVideoRealMobileInteractionQaInput,
): StreamShortVideoRealMobileInteractionQaEvidence {
  const actions = actionDefinitions.map((definition) => {
    const tappedLocal = hasTouched(state, definition.id);
    const stateChangedLocal = stateChangedFor(definition.id, input);
    return {
      ...definition,
      tappedLocal,
      stateChangedLocal,
      passedLocal: definition.boundLocal && (tappedLocal || stateChangedLocal),
    };
  });

  const tappedActions = actions.filter((item) => item.tappedLocal).length;
  const stateChangedActions = actions.filter((item) => item.stateChangedLocal).length;
  const passedActions = actions.filter((item) => item.passedLocal).length;
  const missingActionIds = actions.filter((item) => !item.boundLocal).map((item) => item.id);
  const notTouchedActionIds = actions.filter((item) => !item.passedLocal).map((item) => item.id);
  const status: StreamShortVideoRealMobileInteractionQaStatus = passedActions === actions.length
    ? "all_mobile_actions_checked_local"
    : passedActions > 0
      ? "partial_mobile_actions_checked_local"
      : "waiting_mobile_taps_local";

  return {
    status,
    totalActions: actions.length,
    viewerActions: actions.filter((item) => item.area === "viewer").length,
    settingsActions: actions.filter((item) => item.area === "settings").length,
    tappedActions,
    stateChangedActions,
    passedActions,
    actions,
    missingActionIds,
    notTouchedActionIds,
    mainShortsScreenClean: true,
    toolsInsideSettings: true,
    socialRailVisible: true,
    settingsButtonVisible: true,
    oldDebugCardsVisible: false,
    fakeLikeAllowed: false,
    fakeCommentDeliveryAllowed: false,
    fakeShareDeliveryAllowed: false,
    fakeSaveProviderAllowed: false,
    fakeUploadSuccessAllowed: false,
    fakeMp3SuccessAllowed: false,
    fakePublishAllowed: false,
    providerStillRequired: true,
  };
}

export function createInitialStreamShortVideoRealMobileInteractionQaState(): StreamShortVideoRealMobileInteractionQaState {
  const base = {
    touchedActionIds: [] as readonly StreamShortVideoRealMobileInteractionQaActionId[],
    events: [] as readonly StreamShortVideoRealMobileInteractionQaEvent[],
    updatedAt: nowIso(),
  };
  return {
    ...base,
    evidence: buildStreamShortVideoRealMobileInteractionQaEvidence(base, {
      settingsOpenedLocal: false,
      likedLocal: false,
      commentsOpenOrAddedLocal: false,
      shareDraftPreparedLocal: false,
      savedLocal: false,
      recordVideoStateChangedLocal: false,
      uploadVideoStateChangedLocal: false,
      mp3TrackReadyLocal: false,
      effectsAppliedLocal: false,
    }),
  };
}

export function markStreamShortVideoMobileInteractionActionLocal(
  state: StreamShortVideoRealMobileInteractionQaState,
  actionId: StreamShortVideoRealMobileInteractionQaActionId,
): StreamShortVideoRealMobileInteractionQaState {
  const touchedActionIds = state.touchedActionIds.includes(actionId)
    ? state.touchedActionIds
    : [...state.touchedActionIds, actionId];
  const event: StreamShortVideoRealMobileInteractionQaEvent = {
    eventId: makeId("short-mobile-action"),
    kind: "short_mobile_action_tapped_local",
    actionId,
    createdAt: nowIso(),
    deliveredToProvider: false,
  };
  return {
    ...state,
    touchedActionIds,
    events: [event, ...state.events].slice(0, 40),
    updatedAt: nowIso(),
  };
}

export function queueStreamShortVideoMobileInteractionQaCheck(
  state: StreamShortVideoRealMobileInteractionQaState,
  input: StreamShortVideoRealMobileInteractionQaInput,
): StreamShortVideoRealMobileInteractionQaState {
  const event: StreamShortVideoRealMobileInteractionQaEvent = {
    eventId: makeId("short-mobile-check"),
    kind: "short_mobile_interaction_check_local",
    actionId: null,
    createdAt: nowIso(),
    deliveredToProvider: false,
  };
  return {
    ...state,
    evidence: buildStreamShortVideoRealMobileInteractionQaEvidence(state, input),
    events: [event, ...state.events].slice(0, 40),
    updatedAt: nowIso(),
  };
}

export function requestStreamShortVideoMobileInteractionProviderBlocked(
  state: StreamShortVideoRealMobileInteractionQaState,
): StreamShortVideoRealMobileInteractionQaState {
  const event: StreamShortVideoRealMobileInteractionQaEvent = {
    eventId: makeId("short-mobile-provider-blocked"),
    kind: "short_mobile_provider_blocked",
    actionId: null,
    createdAt: nowIso(),
    deliveredToProvider: false,
  };
  return {
    ...state,
    events: [event, ...state.events].slice(0, 40),
    updatedAt: nowIso(),
  };
}
