export type StreamShortVideoMusicEditorStatus =
  | "idle_local"
  | "track_imported_local"
  | "trim_ready_local"
  | "mix_ready_local"
  | "review_required_local"
  | "blocked_local"
  | "provider_music_blocked";

export type StreamShortVideoMusicEditorEventKind =
  | "short_music_track_imported_local"
  | "short_music_track_selected_local"
  | "short_music_trim_changed_local"
  | "short_music_placement_changed_local"
  | "short_music_volume_changed_local"
  | "short_music_original_mute_toggled_local"
  | "short_music_voiceover_intent_local"
  | "short_music_beat_marker_added_local"
  | "short_music_track_removed_local"
  | "short_music_review_queued_local"
  | "short_music_provider_blocked";

export type StreamShortVideoMusicEditorBlockerCode =
  | "mp3_file_required"
  | "audio_uri_required"
  | "trim_window_required"
  | "audio_mix_review_required"
  | "music_rights_review_required"
  | "audio_render_provider_required"
  | "media_storage_provider_required"
  | "backend_audio_contract_required"
  | "admin_audio_review_required";

export type StreamShortVideoMusicImportAsset = {
  readonly name: string;
  readonly uri: string;
  readonly mimeType?: string | null;
  readonly size?: number | null;
};

export type StreamShortVideoMusicTrack = {
  readonly trackId: string;
  readonly title: string;
  readonly uri: string;
  readonly mimeType: string | null;
  readonly sizeBytes: number | null;
  readonly trimStartMsLocal: number;
  readonly trimEndMsLocal: number;
  readonly placementStartMsLocal: number;
  readonly volumePercentLocal: number;
  readonly originalAudioMutedLocal: boolean;
  readonly voiceoverIntentReadyLocal: boolean;
  readonly beatMarkersMsLocal: readonly number[];
  readonly rightsReviewStatus: "needs_review_local" | "reviewed_local";
  readonly renderStatus: "local_intent_only" | "provider_required";
};

export type StreamShortVideoMusicEditorEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoMusicEditorEventKind;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoMusicEditorStatus;
    readonly selectedTrackId: string | null;
    readonly trackCount: number;
    readonly hasImportedTrack: boolean;
    readonly trimStartMsLocal: number | null;
    readonly trimEndMsLocal: number | null;
    readonly placementStartMsLocal: number | null;
    readonly volumePercentLocal: number | null;
    readonly originalAudioMutedLocal: boolean;
    readonly localBlockers: readonly StreamShortVideoMusicEditorBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoMusicEditorBlockerCode[];
  };
};

export type StreamShortVideoMusicEditorEvidence = {
  readonly status: StreamShortVideoMusicEditorStatus;
  readonly selectedTrackId: string | null;
  readonly selectedTrackTitle: string;
  readonly selectedTrackUriPresent: boolean;
  readonly selectedTrackMimeType: string | null;
  readonly selectedTrackSizeBytes: number | null;
  readonly trackCount: number;
  readonly trimStartMsLocal: number | null;
  readonly trimEndMsLocal: number | null;
  readonly trimDurationMsLocal: number;
  readonly placementStartMsLocal: number | null;
  readonly volumePercentLocal: number | null;
  readonly originalAudioMutedLocal: boolean;
  readonly voiceoverIntentReadyLocal: boolean;
  readonly beatMarkersCountLocal: number;
  readonly queuedMusicEvents: number;
  readonly localBlockers: readonly StreamShortVideoMusicEditorBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoMusicEditorBlockerCode[];
  readonly documentPickerConnected: true;
  readonly selectedFileIsRealLocalUri: boolean;
  readonly backendAudioContract: "not_connected";
  readonly audioRenderProvider: "not_configured";
  readonly mediaStorageProvider: "not_configured";
  readonly adminAudioReview: "not_connected";
  readonly fakeMp3ImportAllowed: false;
  readonly fakeAudioRenderAllowed: false;
  readonly fakeMusicPublishAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoMusicEditorRuntimeState = {
  readonly status: StreamShortVideoMusicEditorStatus;
  readonly tracks: readonly StreamShortVideoMusicTrack[];
  readonly selectedTrackId: string | null;
  readonly events: readonly StreamShortVideoMusicEditorEvent[];
  readonly evidence: StreamShortVideoMusicEditorEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}`;

function selectedTrack(state: Pick<StreamShortVideoMusicEditorRuntimeState, "tracks" | "selectedTrackId">): StreamShortVideoMusicTrack | null {
  return state.tracks.find((track) => track.trackId === state.selectedTrackId) ?? null;
}

function providerBlockers(): readonly StreamShortVideoMusicEditorBlockerCode[] {
  return [
    "music_rights_review_required",
    "audio_render_provider_required",
    "media_storage_provider_required",
    "backend_audio_contract_required",
    "admin_audio_review_required",
  ];
}

function localBlockersFor(state: Omit<StreamShortVideoMusicEditorRuntimeState, "evidence" | "updatedAt">): readonly StreamShortVideoMusicEditorBlockerCode[] {
  const track = selectedTrack(state);
  const blockers: StreamShortVideoMusicEditorBlockerCode[] = [];
  if (!track) blockers.push("mp3_file_required");
  if (track && !track.uri) blockers.push("audio_uri_required");
  if (track && track.trimEndMsLocal <= track.trimStartMsLocal) blockers.push("trim_window_required");
  if (track && track.rightsReviewStatus !== "reviewed_local") blockers.push("audio_mix_review_required");
  return blockers;
}

function buildEvidence(
  state: Omit<StreamShortVideoMusicEditorRuntimeState, "evidence" | "updatedAt">,
  localBlockers: readonly StreamShortVideoMusicEditorBlockerCode[],
): StreamShortVideoMusicEditorEvidence {
  const track = selectedTrack(state);
  const trimDuration = track ? Math.max(0, track.trimEndMsLocal - track.trimStartMsLocal) : 0;
  return {
    status: state.status,
    selectedTrackId: track?.trackId ?? null,
    selectedTrackTitle: track?.title ?? "MP3 не выбран",
    selectedTrackUriPresent: Boolean(track?.uri),
    selectedTrackMimeType: track?.mimeType ?? null,
    selectedTrackSizeBytes: track?.sizeBytes ?? null,
    trackCount: state.tracks.length,
    trimStartMsLocal: track?.trimStartMsLocal ?? null,
    trimEndMsLocal: track?.trimEndMsLocal ?? null,
    trimDurationMsLocal: trimDuration,
    placementStartMsLocal: track?.placementStartMsLocal ?? null,
    volumePercentLocal: track?.volumePercentLocal ?? null,
    originalAudioMutedLocal: Boolean(track?.originalAudioMutedLocal),
    voiceoverIntentReadyLocal: Boolean(track?.voiceoverIntentReadyLocal),
    beatMarkersCountLocal: track?.beatMarkersMsLocal.length ?? 0,
    queuedMusicEvents: state.events.length,
    localBlockers,
    providerBlockers: providerBlockers(),
    documentPickerConnected: true,
    selectedFileIsRealLocalUri: Boolean(track?.uri),
    backendAudioContract: "not_connected",
    audioRenderProvider: "not_configured",
    mediaStorageProvider: "not_configured",
    adminAudioReview: "not_connected",
    fakeMp3ImportAllowed: false,
    fakeAudioRenderAllowed: false,
    fakeMusicPublishAllowed: false,
    fakeProviderAllowed: false,
    fakePublishAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
  };
}

function rebuild(state: Omit<StreamShortVideoMusicEditorRuntimeState, "evidence" | "updatedAt">): StreamShortVideoMusicEditorRuntimeState {
  const localBlockers = localBlockersFor(state);
  const status: StreamShortVideoMusicEditorStatus = state.status === "provider_music_blocked"
    ? "provider_music_blocked"
    : localBlockers.length === 0
      ? state.status === "idle_local" || state.status === "blocked_local" ? "review_required_local" : state.status
      : "blocked_local";
  const next = { ...state, status };
  return { ...next, evidence: buildEvidence(next, localBlockers), updatedAt: nowIso() };
}

function addEvent(
  state: Omit<StreamShortVideoMusicEditorRuntimeState, "evidence" | "updatedAt">,
  kind: StreamShortVideoMusicEditorEventKind,
): Omit<StreamShortVideoMusicEditorRuntimeState, "evidence" | "updatedAt"> {
  const track = selectedTrack(state);
  const event: StreamShortVideoMusicEditorEvent = {
    eventId: makeId(kind),
    kind,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: state.status,
      selectedTrackId: track?.trackId ?? null,
      trackCount: state.tracks.length,
      hasImportedTrack: Boolean(track?.uri),
      trimStartMsLocal: track?.trimStartMsLocal ?? null,
      trimEndMsLocal: track?.trimEndMsLocal ?? null,
      placementStartMsLocal: track?.placementStartMsLocal ?? null,
      volumePercentLocal: track?.volumePercentLocal ?? null,
      originalAudioMutedLocal: Boolean(track?.originalAudioMutedLocal),
      localBlockers: [],
      providerBlockers: providerBlockers(),
    },
  };
  return { ...state, events: [event, ...state.events].slice(0, 28) };
}

function updateSelectedTrack(
  state: StreamShortVideoMusicEditorRuntimeState,
  updater: (track: StreamShortVideoMusicTrack) => StreamShortVideoMusicTrack,
  kind: StreamShortVideoMusicEditorEventKind,
  status: StreamShortVideoMusicEditorStatus,
): StreamShortVideoMusicEditorRuntimeState {
  const track = selectedTrack(state);
  if (!track) return rebuild(addEvent({ ...state, status: "blocked_local" }, kind));
  const tracks = state.tracks.map((item) => item.trackId === track.trackId ? updater(item) : item);
  return rebuild(addEvent({ ...state, status, tracks }, kind));
}

export function createInitialStreamShortVideoMusicEditorState(): StreamShortVideoMusicEditorRuntimeState {
  const base = {
    status: "idle_local" as StreamShortVideoMusicEditorStatus,
    tracks: [] as readonly StreamShortVideoMusicTrack[],
    selectedTrackId: null,
    events: [] as readonly StreamShortVideoMusicEditorEvent[],
  };
  return rebuild(base);
}

export function importStreamShortVideoMusicTrackLocal(
  state: StreamShortVideoMusicEditorRuntimeState,
  asset: StreamShortVideoMusicImportAsset,
): StreamShortVideoMusicEditorRuntimeState {
  const cleanName = asset.name?.trim() || "Выбранный MP3";
  const trackId = makeId("short-music-track");
  const track: StreamShortVideoMusicTrack = {
    trackId,
    title: cleanName,
    uri: asset.uri,
    mimeType: asset.mimeType ?? null,
    sizeBytes: typeof asset.size === "number" ? asset.size : null,
    trimStartMsLocal: 0,
    trimEndMsLocal: 15000,
    placementStartMsLocal: 0,
    volumePercentLocal: 80,
    originalAudioMutedLocal: false,
    voiceoverIntentReadyLocal: false,
    beatMarkersMsLocal: [],
    rightsReviewStatus: "needs_review_local",
    renderStatus: "local_intent_only",
  };
  return rebuild(addEvent({ ...state, status: "track_imported_local", tracks: [track, ...state.tracks].slice(0, 6), selectedTrackId: null }, "short_music_track_imported_local"));
}

export function selectStreamShortVideoMusicTrackLocal(
  state: StreamShortVideoMusicEditorRuntimeState,
  trackId: string,
): StreamShortVideoMusicEditorRuntimeState {
  const exists = state.tracks.some((track) => track.trackId === trackId);
  return rebuild(addEvent({ ...state, selectedTrackId: exists ? trackId : state.selectedTrackId, status: exists ? "review_required_local" : "blocked_local" }, "short_music_track_selected_local"));
}

export function shiftSelectedStreamShortVideoMusicTrimLocal(
  state: StreamShortVideoMusicEditorRuntimeState,
  direction: "start_back" | "start_forward" | "end_back" | "end_forward",
): StreamShortVideoMusicEditorRuntimeState {
  return updateSelectedTrack(state, (track) => {
    const step = 1000;
    const minDuration = 3000;
    if (direction === "start_back") return { ...track, trimStartMsLocal: Math.max(0, track.trimStartMsLocal - step), rightsReviewStatus: "needs_review_local" };
    if (direction === "start_forward") return { ...track, trimStartMsLocal: Math.min(track.trimEndMsLocal - minDuration, track.trimStartMsLocal + step), rightsReviewStatus: "needs_review_local" };
    if (direction === "end_back") return { ...track, trimEndMsLocal: Math.max(track.trimStartMsLocal + minDuration, track.trimEndMsLocal - step), rightsReviewStatus: "needs_review_local" };
    return { ...track, trimEndMsLocal: Math.min(60000, track.trimEndMsLocal + step), rightsReviewStatus: "needs_review_local" };
  }, "short_music_trim_changed_local", "trim_ready_local");
}

export function shiftSelectedStreamShortVideoMusicPlacementLocal(
  state: StreamShortVideoMusicEditorRuntimeState,
  direction: "back" | "forward",
): StreamShortVideoMusicEditorRuntimeState {
  return updateSelectedTrack(state, (track) => ({
    ...track,
    placementStartMsLocal: direction === "forward" ? Math.min(60000, track.placementStartMsLocal + 1000) : Math.max(0, track.placementStartMsLocal - 1000),
    rightsReviewStatus: "needs_review_local",
  }), "short_music_placement_changed_local", "mix_ready_local");
}

export function cycleSelectedStreamShortVideoMusicVolumeLocal(state: StreamShortVideoMusicEditorRuntimeState): StreamShortVideoMusicEditorRuntimeState {
  const steps = [30, 50, 70, 80, 100] as const;
  return updateSelectedTrack(state, (track) => {
    const index = Math.max(0, steps.findIndex((item) => item === track.volumePercentLocal));
    return { ...track, volumePercentLocal: steps[(index + 1) % steps.length], rightsReviewStatus: "needs_review_local" };
  }, "short_music_volume_changed_local", "mix_ready_local");
}

export function toggleSelectedStreamShortVideoOriginalAudioMuteLocal(state: StreamShortVideoMusicEditorRuntimeState): StreamShortVideoMusicEditorRuntimeState {
  return updateSelectedTrack(state, (track) => ({ ...track, originalAudioMutedLocal: !track.originalAudioMutedLocal, rightsReviewStatus: "needs_review_local" }), "short_music_original_mute_toggled_local", "mix_ready_local");
}

export function markSelectedStreamShortVideoVoiceoverIntentLocal(state: StreamShortVideoMusicEditorRuntimeState): StreamShortVideoMusicEditorRuntimeState {
  return updateSelectedTrack(state, (track) => ({ ...track, voiceoverIntentReadyLocal: true, rightsReviewStatus: "needs_review_local" }), "short_music_voiceover_intent_local", "mix_ready_local");
}

export function addSelectedStreamShortVideoBeatMarkerLocal(state: StreamShortVideoMusicEditorRuntimeState): StreamShortVideoMusicEditorRuntimeState {
  return updateSelectedTrack(state, (track) => {
    const nextMarker = Math.min(track.trimEndMsLocal, track.trimStartMsLocal + ((track.beatMarkersMsLocal.length + 1) * 1000));
    const beatMarkersMsLocal = [...track.beatMarkersMsLocal, nextMarker].slice(0, 24);
    return { ...track, beatMarkersMsLocal, rightsReviewStatus: "needs_review_local" };
  }, "short_music_beat_marker_added_local", "mix_ready_local");
}

export function reviewSelectedStreamShortVideoMusicMixLocal(state: StreamShortVideoMusicEditorRuntimeState): StreamShortVideoMusicEditorRuntimeState {
  return updateSelectedTrack(state, (track) => ({ ...track, rightsReviewStatus: "reviewed_local" }), "short_music_review_queued_local", "review_required_local");
}

export function removeSelectedStreamShortVideoMusicTrackLocal(state: StreamShortVideoMusicEditorRuntimeState): StreamShortVideoMusicEditorRuntimeState {
  const track = selectedTrack(state);
  if (!track) return rebuild(addEvent({ ...state, status: "blocked_local" }, "short_music_track_removed_local"));
  const tracks = state.tracks.filter((item) => item.trackId !== track.trackId);
  return rebuild(addEvent({ ...state, status: "review_required_local", tracks, selectedTrackId: null }, "short_music_track_removed_local"));
}

export function queueStreamShortVideoMusicEditorLocalEvent(state: StreamShortVideoMusicEditorRuntimeState): StreamShortVideoMusicEditorRuntimeState {
  return rebuild(addEvent({ ...state, status: state.tracks.length > 0 ? "review_required_local" : state.status }, "short_music_review_queued_local"));
}

export function requestStreamShortVideoMusicEditorProviderBlocked(state: StreamShortVideoMusicEditorRuntimeState): StreamShortVideoMusicEditorRuntimeState {
  return rebuild(addEvent({ ...state, status: "provider_music_blocked" }, "short_music_provider_blocked"));
}
