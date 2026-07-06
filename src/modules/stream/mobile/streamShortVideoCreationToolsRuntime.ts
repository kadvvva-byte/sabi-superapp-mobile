import type { StreamShortVideoSourceRuntimeState } from "./streamShortVideoSourceIntentRuntime";
import type { StreamShortVideoTimelineRuntimeState } from "./streamShortVideoEditorTimelineRuntime";

export type StreamShortVideoEffectToolId =
  | "filter_cinematic"
  | "filter_warm"
  | "filter_clean"
  | "beauty_soft"
  | "stabilization"
  | "crop_9_16"
  | "speed_curve"
  | "text_overlay"
  | "transition_soft";

export type StreamShortVideoAudioToolId =
  | "mp3_import"
  | "music_trim"
  | "original_audio_mute"
  | "audio_volume_balance"
  | "voiceover_intent"
  | "beat_sync";

export type StreamShortVideoCreationToolsStatus =
  | "idle_local"
  | "ready_local"
  | "effect_applied_local"
  | "audio_intent_ready_local"
  | "review_required_local"
  | "blocked_local"
  | "provider_tools_blocked";

export type StreamShortVideoCreationToolEventKind =
  | "short_effect_tool_selected_local"
  | "short_effect_applied_local"
  | "short_effect_removed_local"
  | "short_audio_tool_selected_local"
  | "short_mp3_import_intent_local"
  | "short_audio_trimmed_local"
  | "short_original_audio_mute_toggled_local"
  | "short_audio_volume_changed_local"
  | "short_beat_sync_ready_local"
  | "short_creation_tools_checked_local"
  | "short_creation_tools_provider_blocked";

export type StreamShortVideoCreationToolBlockerCode =
  | "timeline_clip_required"
  | "source_asset_intent_required"
  | "effect_or_audio_tool_required"
  | "mp3_or_music_provider_required"
  | "effects_render_provider_required"
  | "backend_editor_contract_required"
  | "media_storage_provider_required"
  | "admin_media_review_required";

export type StreamShortVideoEffectToolRecord = {
  readonly id: StreamShortVideoEffectToolId;
  readonly label: string;
  readonly purpose: string;
  readonly status: "available_local" | "applied_local" | "review_required_local";
  readonly appliedLocal: boolean;
  readonly requiresRenderProvider: boolean;
};

export type StreamShortVideoAudioToolRecord = {
  readonly id: StreamShortVideoAudioToolId;
  readonly label: string;
  readonly purpose: string;
  readonly status: "available_local" | "intent_ready_local" | "review_required_local";
  readonly intentReadyLocal: boolean;
  readonly requiresAudioProvider: boolean;
};

export type StreamShortVideoAudioTrackIntent = {
  readonly mp3ImportIntentReady: boolean;
  readonly trackTitleLocal: string;
  readonly trimStartMsLocal: number;
  readonly trimEndMsLocal: number;
  readonly volumePercentLocal: number;
  readonly originalAudioMutedLocal: boolean;
  readonly beatSyncReadyLocal: boolean;
  readonly voiceoverIntentReadyLocal: boolean;
};

export type StreamShortVideoCreationToolsEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoCreationToolEventKind;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoCreationToolsStatus;
    readonly selectedEffectToolId: StreamShortVideoEffectToolId | null;
    readonly selectedAudioToolId: StreamShortVideoAudioToolId | null;
    readonly activeEffects: readonly StreamShortVideoEffectToolId[];
    readonly mp3ImportIntentReady: boolean;
    readonly originalAudioMutedLocal: boolean;
    readonly volumePercentLocal: number;
    readonly localBlockers: readonly StreamShortVideoCreationToolBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoCreationToolBlockerCode[];
  };
};

export type StreamShortVideoCreationToolsEvidence = {
  readonly status: StreamShortVideoCreationToolsStatus;
  readonly selectedEffectToolId: StreamShortVideoEffectToolId | null;
  readonly selectedEffectLabel: string;
  readonly selectedAudioToolId: StreamShortVideoAudioToolId | null;
  readonly selectedAudioLabel: string;
  readonly activeEffects: readonly StreamShortVideoEffectToolId[];
  readonly activeEffectsCount: number;
  readonly mp3ImportIntentReady: boolean;
  readonly audioTrackTitleLocal: string;
  readonly trimStartMsLocal: number;
  readonly trimEndMsLocal: number;
  readonly volumePercentLocal: number;
  readonly originalAudioMutedLocal: boolean;
  readonly beatSyncReadyLocal: boolean;
  readonly voiceoverIntentReadyLocal: boolean;
  readonly queuedCreationToolEvents: number;
  readonly localBlockers: readonly StreamShortVideoCreationToolBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoCreationToolBlockerCode[];
  readonly backendEditorContract: "not_connected";
  readonly effectsRenderProvider: "not_configured";
  readonly mp3MusicProvider: "not_configured";
  readonly mediaStorageProvider: "not_configured";
  readonly adminMediaReview: "not_connected";
  readonly fakeEffectRenderAllowed: false;
  readonly fakeMp3ImportAllowed: false;
  readonly fakeMusicPublishAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoCreationToolsRuntimeState = {
  readonly status: StreamShortVideoCreationToolsStatus;
  readonly effectTools: readonly StreamShortVideoEffectToolRecord[];
  readonly audioTools: readonly StreamShortVideoAudioToolRecord[];
  readonly selectedEffectToolId: StreamShortVideoEffectToolId | null;
  readonly selectedAudioToolId: StreamShortVideoAudioToolId | null;
  readonly activeEffects: readonly StreamShortVideoEffectToolId[];
  readonly audioTrack: StreamShortVideoAudioTrackIntent;
  readonly events: readonly StreamShortVideoCreationToolsEvent[];
  readonly evidence: StreamShortVideoCreationToolsEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeEventId = (kind: StreamShortVideoCreationToolEventKind) => `${kind}-${Date.now()}`;

function baseEffectTools(): readonly StreamShortVideoEffectToolRecord[] {
  return [
    { id: "filter_cinematic", label: "Кино-фильтр", purpose: "Локальный intent кинематографичного цвета для выбранного шорта.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
    { id: "filter_warm", label: "Тёплый тон", purpose: "Локальный intent тёплого цвета для людей и товаров.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
    { id: "filter_clean", label: "Чистый вид", purpose: "Локальный intent чистого естественного вида для ленты шортов.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
    { id: "beauty_soft", label: "Мягкая красота", purpose: "Локальный beauty-intent без подмены личности и фейкового результата.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
    { id: "stabilization", label: "Стабилизация", purpose: "Локальный intent стабилизации для клипов с рук.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
    { id: "crop_9_16", label: "Кадр 9:16", purpose: "Локальный intent вертикального кадра для мобильной ленты.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
    { id: "speed_curve", label: "Кривая скорости", purpose: "Локальный intent изменения скорости в монтажной линии.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
    { id: "text_overlay", label: "Текстовый слой", purpose: "Локальный intent текстового слоя, связанного с монтажом.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
    { id: "transition_soft", label: "Мягкий стык", purpose: "Локальный intent перехода между клипами.", status: "available_local", appliedLocal: false, requiresRenderProvider: true },
  ];
}

function baseAudioTools(): readonly StreamShortVideoAudioToolRecord[] {
  return [
    { id: "mp3_import", label: "MP3 импорт", purpose: "Локальный intent вставки MP3/музыки в шорт.", status: "available_local", intentReadyLocal: false, requiresAudioProvider: true },
    { id: "music_trim", label: "Обрезка музыки", purpose: "Локальный intent обрезки музыки перед будущим рендером.", status: "available_local", intentReadyLocal: false, requiresAudioProvider: true },
    { id: "original_audio_mute", label: "Отключить оригинал", purpose: "Локальный intent выключения или возврата исходного звука клипа.", status: "available_local", intentReadyLocal: false, requiresAudioProvider: false },
    { id: "audio_volume_balance", label: "Громкость", purpose: "Локальный intent настройки громкости музыки.", status: "available_local", intentReadyLocal: false, requiresAudioProvider: false },
    { id: "voiceover_intent", label: "Голос поверх", purpose: "Локальный intent записи голоса для будущей передачи аудио-провайдеру.", status: "available_local", intentReadyLocal: false, requiresAudioProvider: true },
    { id: "beat_sync", label: "Синхрон с битом", purpose: "Локальный intent синхронизации музыки и видео.", status: "available_local", intentReadyLocal: false, requiresAudioProvider: true },
  ];
}

function providerBlockers(): readonly StreamShortVideoCreationToolBlockerCode[] {
  return [
    "effects_render_provider_required",
    "mp3_or_music_provider_required",
    "backend_editor_contract_required",
    "media_storage_provider_required",
    "admin_media_review_required",
  ];
}

function localBlockersFor(
  state: Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt">,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): readonly StreamShortVideoCreationToolBlockerCode[] {
  const blockers: StreamShortVideoCreationToolBlockerCode[] = [];
  if (timeline.evidence.clipCount <= 0) blockers.push("timeline_clip_required");
  if (!source.evidence.selectedReadyLocal) blockers.push("source_asset_intent_required");
  if (state.activeEffects.length === 0 && !state.audioTrack.mp3ImportIntentReady && !state.audioTrack.voiceoverIntentReadyLocal) blockers.push("effect_or_audio_tool_required");
  return blockers;
}

function selectedEffect(state: Pick<StreamShortVideoCreationToolsRuntimeState, "effectTools" | "selectedEffectToolId">): StreamShortVideoEffectToolRecord | null {
  return state.selectedEffectToolId ? state.effectTools.find((tool) => tool.id === state.selectedEffectToolId) ?? null : null;
}

function selectedAudio(state: Pick<StreamShortVideoCreationToolsRuntimeState, "audioTools" | "selectedAudioToolId">): StreamShortVideoAudioToolRecord | null {
  return state.selectedAudioToolId ? state.audioTools.find((tool) => tool.id === state.selectedAudioToolId) ?? null : null;
}

function buildEvidence(
  state: Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt">,
  localBlockers: readonly StreamShortVideoCreationToolBlockerCode[],
): StreamShortVideoCreationToolsEvidence {
  const effect = selectedEffect(state);
  const audio = selectedAudio(state);
  return {
    status: state.status,
    selectedEffectToolId: effect?.id ?? null,
    selectedEffectLabel: effect?.label ?? "выбери эффект",
    selectedAudioToolId: audio?.id ?? null,
    selectedAudioLabel: audio?.label ?? "выбери аудио",
    activeEffects: state.activeEffects,
    activeEffectsCount: state.activeEffects.length,
    mp3ImportIntentReady: state.audioTrack.mp3ImportIntentReady,
    audioTrackTitleLocal: state.audioTrack.trackTitleLocal,
    trimStartMsLocal: state.audioTrack.trimStartMsLocal,
    trimEndMsLocal: state.audioTrack.trimEndMsLocal,
    volumePercentLocal: state.audioTrack.volumePercentLocal,
    originalAudioMutedLocal: state.audioTrack.originalAudioMutedLocal,
    beatSyncReadyLocal: state.audioTrack.beatSyncReadyLocal,
    voiceoverIntentReadyLocal: state.audioTrack.voiceoverIntentReadyLocal,
    queuedCreationToolEvents: state.events.length,
    localBlockers,
    providerBlockers: providerBlockers(),
    backendEditorContract: "not_connected",
    effectsRenderProvider: "not_configured",
    mp3MusicProvider: "not_configured",
    mediaStorageProvider: "not_configured",
    adminMediaReview: "not_connected",
    fakeEffectRenderAllowed: false,
    fakeMp3ImportAllowed: false,
    fakeMusicPublishAllowed: false,
    fakeProviderAllowed: false,
    fakePublishAllowed: false,
    paymentsAllowedNow: false,
    giftsAllowedNow: false,
    monetizationAllowedNow: false,
    walletBridgeRequiredNow: false,
  };
}

function rebuild(
  state: Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt">,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const localBlockers = localBlockersFor(state, timeline, source);
  const status: StreamShortVideoCreationToolsStatus = state.status === "provider_tools_blocked"
    ? "provider_tools_blocked"
    : localBlockers.length === 0
      ? state.status === "idle_local" || state.status === "blocked_local" ? "ready_local" : state.status
      : "blocked_local";
  const next = { ...state, status };
  return { ...next, evidence: buildEvidence(next, localBlockers), updatedAt: nowIso() };
}

function withEffectTools(
  state: Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt">,
  selectedEffectToolId: StreamShortVideoEffectToolId,
  activeEffects: readonly StreamShortVideoEffectToolId[],
): Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt"> {
  const activeSet = new Set(activeEffects);
  return {
    ...state,
    selectedEffectToolId,
    activeEffects,
    effectTools: state.effectTools.map((tool): StreamShortVideoEffectToolRecord => ({
      ...tool,
      appliedLocal: activeSet.has(tool.id),
      status: activeSet.has(tool.id) ? "applied_local" : tool.status === "review_required_local" ? "review_required_local" : "available_local",
    })),
  };
}

function withAudioTools(
  state: Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt">,
  selectedAudioToolId: StreamShortVideoAudioToolId,
  audioTrack: StreamShortVideoAudioTrackIntent,
): Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt"> {
  return {
    ...state,
    selectedAudioToolId,
    audioTrack,
    audioTools: state.audioTools.map((tool): StreamShortVideoAudioToolRecord => {
      const ready =
        (tool.id === "mp3_import" && audioTrack.mp3ImportIntentReady)
        || (tool.id === "music_trim" && audioTrack.trimEndMsLocal > audioTrack.trimStartMsLocal)
        || (tool.id === "original_audio_mute" && audioTrack.originalAudioMutedLocal)
        || (tool.id === "audio_volume_balance" && audioTrack.volumePercentLocal !== 70)
        || (tool.id === "voiceover_intent" && audioTrack.voiceoverIntentReadyLocal)
        || (tool.id === "beat_sync" && audioTrack.beatSyncReadyLocal);
      return { ...tool, intentReadyLocal: ready, status: ready ? "intent_ready_local" : "available_local" };
    }),
  };
}

function addEvent(
  state: Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt">,
  kind: StreamShortVideoCreationToolEventKind,
): Omit<StreamShortVideoCreationToolsRuntimeState, "evidence" | "updatedAt"> {
  const event: StreamShortVideoCreationToolsEvent = {
    eventId: makeEventId(kind),
    kind,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: state.status,
      selectedEffectToolId: state.selectedEffectToolId,
      selectedAudioToolId: state.selectedAudioToolId,
      activeEffects: state.activeEffects,
      mp3ImportIntentReady: state.audioTrack.mp3ImportIntentReady,
      originalAudioMutedLocal: state.audioTrack.originalAudioMutedLocal,
      volumePercentLocal: state.audioTrack.volumePercentLocal,
      localBlockers: [],
      providerBlockers: providerBlockers(),
    },
  };
  return { ...state, events: [event, ...state.events].slice(0, 24) };
}

export function createInitialStreamShortVideoCreationToolsState(
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const base = {
    status: "idle_local" as StreamShortVideoCreationToolsStatus,
    effectTools: baseEffectTools(),
    audioTools: baseAudioTools(),
    selectedEffectToolId: null as StreamShortVideoEffectToolId | null,
    selectedAudioToolId: null as StreamShortVideoAudioToolId | null,
    activeEffects: [] as readonly StreamShortVideoEffectToolId[],
    audioTrack: {
      mp3ImportIntentReady: false,
      trackTitleLocal: "MP3 не выбран",
      trimStartMsLocal: 0,
      trimEndMsLocal: 0,
      volumePercentLocal: 70,
      originalAudioMutedLocal: false,
      beatSyncReadyLocal: false,
      voiceoverIntentReadyLocal: false,
    },
    events: [] as readonly StreamShortVideoCreationToolsEvent[],
  };
  return rebuild(base, timeline, source);
}

export function selectStreamShortVideoEffectTool(
  state: StreamShortVideoCreationToolsRuntimeState,
  effectToolId?: StreamShortVideoEffectToolId,
  timeline?: StreamShortVideoTimelineRuntimeState,
  source?: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const ids = state.effectTools.map((tool) => tool.id);
  const currentIndex = state.selectedEffectToolId ? ids.indexOf(state.selectedEffectToolId) : -1;
  const nextId = effectToolId ?? ids[(Math.max(-1, currentIndex) + 1) % ids.length] ?? state.selectedEffectToolId;
  const next = addEvent({ ...state, selectedEffectToolId: nextId, status: "ready_local" }, "short_effect_tool_selected_local");
  return rebuild(next, timeline ?? ({ evidence: { clipCount: 1 } } as StreamShortVideoTimelineRuntimeState), source ?? ({ evidence: { selectedReadyLocal: true } } as StreamShortVideoSourceRuntimeState));
}

export function applySelectedStreamShortVideoEffectLocal(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  if (!state.selectedEffectToolId) return state;
  const activeEffects = state.activeEffects.includes(state.selectedEffectToolId) ? state.activeEffects : [...state.activeEffects, state.selectedEffectToolId];
  const next = addEvent(withEffectTools({ ...state, status: "effect_applied_local" }, state.selectedEffectToolId, activeEffects), "short_effect_applied_local");
  return rebuild(next, timeline, source);
}

export function removeSelectedStreamShortVideoEffectLocal(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  if (!state.selectedEffectToolId) return state;
  const activeEffects = state.activeEffects.filter((id) => id !== state.selectedEffectToolId);
  const next = addEvent(withEffectTools({ ...state, status: "review_required_local" }, state.selectedEffectToolId, activeEffects), "short_effect_removed_local");
  return rebuild(next, timeline, source);
}

export function selectStreamShortVideoAudioTool(
  state: StreamShortVideoCreationToolsRuntimeState,
  audioToolId?: StreamShortVideoAudioToolId,
  timeline?: StreamShortVideoTimelineRuntimeState,
  source?: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const ids = state.audioTools.map((tool) => tool.id);
  const currentIndex = state.selectedAudioToolId ? ids.indexOf(state.selectedAudioToolId) : -1;
  const nextId = audioToolId ?? ids[(Math.max(-1, currentIndex) + 1) % ids.length] ?? state.selectedAudioToolId;
  const next = addEvent({ ...state, selectedAudioToolId: nextId, status: "ready_local" }, "short_audio_tool_selected_local");
  return rebuild(next, timeline ?? ({ evidence: { clipCount: 1 } } as StreamShortVideoTimelineRuntimeState), source ?? ({ evidence: { selectedReadyLocal: true } } as StreamShortVideoSourceRuntimeState));
}

export function requestStreamShortVideoMp3ImportIntentLocal(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const audioTrack = { ...state.audioTrack, mp3ImportIntentReady: true, trackTitleLocal: "локальный MP3 intent", trimStartMsLocal: 0, trimEndMsLocal: Math.max(state.audioTrack.trimEndMsLocal, 15000) };
  const next = addEvent(withAudioTools({ ...state, status: "audio_intent_ready_local" }, "mp3_import", audioTrack), "short_mp3_import_intent_local");
  return rebuild(next, timeline, source);
}

export function trimStreamShortVideoAudioLocal(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const nextEnd = state.audioTrack.trimEndMsLocal > state.audioTrack.trimStartMsLocal ? state.audioTrack.trimEndMsLocal + 5000 : 15000;
  const audioTrack = { ...state.audioTrack, mp3ImportIntentReady: true, trackTitleLocal: state.audioTrack.trackTitleLocal === "MP3 не выбран" ? "локальный MP3 intent" : state.audioTrack.trackTitleLocal, trimStartMsLocal: 0, trimEndMsLocal: Math.min(nextEnd, 60000) };
  const next = addEvent(withAudioTools({ ...state, status: "audio_intent_ready_local" }, "music_trim", audioTrack), "short_audio_trimmed_local");
  return rebuild(next, timeline, source);
}

export function toggleStreamShortVideoOriginalAudioMuteLocal(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const audioTrack = { ...state.audioTrack, originalAudioMutedLocal: !state.audioTrack.originalAudioMutedLocal };
  const next = addEvent(withAudioTools({ ...state, status: "audio_intent_ready_local" }, "original_audio_mute", audioTrack), "short_original_audio_mute_toggled_local");
  return rebuild(next, timeline, source);
}

export function cycleStreamShortVideoAudioVolumeLocal(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const steps = [40, 70, 100] as const;
  const currentIndex = Math.max(0, steps.findIndex((item) => item === state.audioTrack.volumePercentLocal));
  const audioTrack = { ...state.audioTrack, volumePercentLocal: steps[(currentIndex + 1) % steps.length] };
  const next = addEvent(withAudioTools({ ...state, status: "audio_intent_ready_local" }, "audio_volume_balance", audioTrack), "short_audio_volume_changed_local");
  return rebuild(next, timeline, source);
}

export function markStreamShortVideoBeatSyncLocal(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const audioTrack = { ...state.audioTrack, mp3ImportIntentReady: true, beatSyncReadyLocal: true, trackTitleLocal: state.audioTrack.trackTitleLocal === "MP3 не выбран" ? "локальный MP3 intent" : state.audioTrack.trackTitleLocal };
  const next = addEvent(withAudioTools({ ...state, status: "audio_intent_ready_local" }, "beat_sync", audioTrack), "short_beat_sync_ready_local");
  return rebuild(next, timeline, source);
}

export function markStreamShortVideoVoiceoverIntentLocal(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const audioTrack = { ...state.audioTrack, voiceoverIntentReadyLocal: true };
  const next = addEvent(withAudioTools({ ...state, status: "audio_intent_ready_local" }, "voiceover_intent", audioTrack), "short_audio_tool_selected_local");
  return rebuild(next, timeline, source);
}

export function runStreamShortVideoCreationToolsReadinessCheck(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const next = addEvent({ ...state, status: "review_required_local" }, "short_creation_tools_checked_local");
  return rebuild(next, timeline, source);
}

export function queueStreamShortVideoCreationToolsEvent(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const next = addEvent({ ...state, status: state.activeEffects.length > 0 || state.audioTrack.mp3ImportIntentReady ? "review_required_local" : state.status }, "short_creation_tools_checked_local");
  return rebuild(next, timeline, source);
}

export function requestStreamShortVideoCreationToolsProviderBlocked(
  state: StreamShortVideoCreationToolsRuntimeState,
  timeline: StreamShortVideoTimelineRuntimeState,
  source: StreamShortVideoSourceRuntimeState,
): StreamShortVideoCreationToolsRuntimeState {
  const next = addEvent({ ...state, status: "provider_tools_blocked" }, "short_creation_tools_provider_blocked");
  return rebuild(next, timeline, source);
}
