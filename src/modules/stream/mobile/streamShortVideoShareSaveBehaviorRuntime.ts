export type StreamShortVideoShareSaveSheetMode = "share" | "save";
export type StreamShortVideoShareSaveCollection = "saved" | "favorites" | "watch_later";

export type StreamShortVideoShareSaveProviderBlockerCode =
  | "backend_share_contract_required"
  | "backend_save_collection_contract_required"
  | "realtime_social_sync_required"
  | "admin_social_safety_review_required";

export type StreamShortVideoShareSaveBehaviorEvidence = {
  readonly activeSheetMode: StreamShortVideoShareSaveSheetMode | null;
  readonly shareOptionsOpenLocal: boolean;
  readonly saveOptionsOpenLocal: boolean;
  readonly nativeShareRequestedLocal: boolean;
  readonly shareTextCopiedLocal: boolean;
  readonly savedToLocalCollection: StreamShortVideoShareSaveCollection | null;
  readonly removedFromLocalSaved: boolean;
  readonly shareActionCountLocal: number;
  readonly saveActionCountLocal: number;
  readonly queuedShareSaveEventsLocal: number;
  readonly providerBlockers: readonly StreamShortVideoShareSaveProviderBlockerCode[];
  readonly fakeShareDeliveryAllowed: false;
  readonly fakeSaveProviderAllowed: false;
};

export type StreamShortVideoShareSaveBehaviorState = {
  readonly activeSheetMode: StreamShortVideoShareSaveSheetMode | null;
  readonly shareOptionsOpenLocal: boolean;
  readonly saveOptionsOpenLocal: boolean;
  readonly nativeShareRequestedLocal: boolean;
  readonly shareTextCopiedLocal: boolean;
  readonly savedToLocalCollection: StreamShortVideoShareSaveCollection | null;
  readonly removedFromLocalSaved: boolean;
  readonly shareActionCountLocal: number;
  readonly saveActionCountLocal: number;
  readonly queuedShareSaveEventsLocal: number;
  readonly evidence: StreamShortVideoShareSaveBehaviorEvidence;
  readonly updatedAt: string;
};

const providerBlockers: readonly StreamShortVideoShareSaveProviderBlockerCode[] = [
  "backend_share_contract_required",
  "backend_save_collection_contract_required",
  "realtime_social_sync_required",
  "admin_social_safety_review_required",
];

function nowIso(): string {
  return new Date().toISOString();
}

function buildEvidence(state: Omit<StreamShortVideoShareSaveBehaviorState, "evidence">): StreamShortVideoShareSaveBehaviorEvidence {
  return {
    activeSheetMode: state.activeSheetMode,
    shareOptionsOpenLocal: state.shareOptionsOpenLocal,
    saveOptionsOpenLocal: state.saveOptionsOpenLocal,
    nativeShareRequestedLocal: state.nativeShareRequestedLocal,
    shareTextCopiedLocal: state.shareTextCopiedLocal,
    savedToLocalCollection: state.savedToLocalCollection,
    removedFromLocalSaved: state.removedFromLocalSaved,
    shareActionCountLocal: state.shareActionCountLocal,
    saveActionCountLocal: state.saveActionCountLocal,
    queuedShareSaveEventsLocal: state.queuedShareSaveEventsLocal,
    providerBlockers,
    fakeShareDeliveryAllowed: false,
    fakeSaveProviderAllowed: false,
  };
}

function withEvidence(state: Omit<StreamShortVideoShareSaveBehaviorState, "evidence">): StreamShortVideoShareSaveBehaviorState {
  return { ...state, evidence: buildEvidence(state) };
}

export function createInitialStreamShortVideoShareSaveBehaviorState(): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({
    activeSheetMode: null,
    shareOptionsOpenLocal: false,
    saveOptionsOpenLocal: false,
    nativeShareRequestedLocal: false,
    shareTextCopiedLocal: false,
    savedToLocalCollection: null,
    removedFromLocalSaved: false,
    shareActionCountLocal: 0,
    saveActionCountLocal: 0,
    queuedShareSaveEventsLocal: 0,
    updatedAt: nowIso(),
  });
}

export function openStreamShortVideoShareOptionsLocal(state: StreamShortVideoShareSaveBehaviorState): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({ ...state, activeSheetMode: "share", shareOptionsOpenLocal: true, saveOptionsOpenLocal: false, updatedAt: nowIso() });
}

export function openStreamShortVideoSaveOptionsLocal(state: StreamShortVideoShareSaveBehaviorState): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({ ...state, activeSheetMode: "save", saveOptionsOpenLocal: true, shareOptionsOpenLocal: false, updatedAt: nowIso() });
}

export function closeStreamShortVideoShareSaveSheetLocal(state: StreamShortVideoShareSaveBehaviorState): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({ ...state, activeSheetMode: null, shareOptionsOpenLocal: false, saveOptionsOpenLocal: false, updatedAt: nowIso() });
}

export function markStreamShortVideoNativeShareRequestedLocal(state: StreamShortVideoShareSaveBehaviorState): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({
    ...state,
    activeSheetMode: "share",
    shareOptionsOpenLocal: true,
    nativeShareRequestedLocal: true,
    shareActionCountLocal: state.shareActionCountLocal + 1,
    queuedShareSaveEventsLocal: state.queuedShareSaveEventsLocal + 1,
    updatedAt: nowIso(),
  });
}

export function markStreamShortVideoShareTextCopiedLocal(state: StreamShortVideoShareSaveBehaviorState): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({
    ...state,
    activeSheetMode: "share",
    shareOptionsOpenLocal: true,
    shareTextCopiedLocal: true,
    shareActionCountLocal: state.shareActionCountLocal + 1,
    queuedShareSaveEventsLocal: state.queuedShareSaveEventsLocal + 1,
    updatedAt: nowIso(),
  });
}

export function markStreamShortVideoSavedToLocalCollection(
  state: StreamShortVideoShareSaveBehaviorState,
  collection: StreamShortVideoShareSaveCollection,
): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({
    ...state,
    activeSheetMode: "save",
    saveOptionsOpenLocal: true,
    savedToLocalCollection: collection,
    removedFromLocalSaved: false,
    saveActionCountLocal: state.saveActionCountLocal + 1,
    queuedShareSaveEventsLocal: state.queuedShareSaveEventsLocal + 1,
    updatedAt: nowIso(),
  });
}

export function markStreamShortVideoRemovedFromLocalSaved(state: StreamShortVideoShareSaveBehaviorState): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({
    ...state,
    activeSheetMode: "save",
    saveOptionsOpenLocal: true,
    savedToLocalCollection: null,
    removedFromLocalSaved: true,
    saveActionCountLocal: state.saveActionCountLocal + 1,
    queuedShareSaveEventsLocal: state.queuedShareSaveEventsLocal + 1,
    updatedAt: nowIso(),
  });
}

export function requestStreamShortVideoShareSaveProviderBlocked(state: StreamShortVideoShareSaveBehaviorState): StreamShortVideoShareSaveBehaviorState {
  return withEvidence({ ...state, queuedShareSaveEventsLocal: state.queuedShareSaveEventsLocal + 1, updatedAt: nowIso() });
}
