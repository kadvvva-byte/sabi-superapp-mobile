export type StreamShortVideoCaptionOverlayStatus =
  | "draft"
  | "editing_local"
  | "timeline_bound_local"
  | "review_bound_local"
  | "ready_local"
  | "provider_blocked";

export type StreamShortVideoCaptionPlacement = "top" | "center" | "bottom" | "custom";
export type StreamShortVideoCaptionColorPreset = "white" | "warm" | "dark" | "sky";
export type StreamShortVideoCaptionBackdropPreset = "none" | "soft" | "glass" | "solid";
export type StreamShortVideoCaptionAlign = "left" | "center" | "right";

export type StreamShortVideoCaptionOverlayAssetInput = {
  readonly name?: string | null;
  readonly fileName?: string | null;
  readonly durationMs?: number | null;
} | null;

export type StreamShortVideoCaptionOverlayItem = {
  readonly overlayId: string;
  readonly text: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly xPercent: number;
  readonly yPercent: number;
  readonly fontSize: number;
  readonly placement: StreamShortVideoCaptionPlacement;
  readonly colorPreset: StreamShortVideoCaptionColorPreset;
  readonly backdropPreset: StreamShortVideoCaptionBackdropPreset;
  readonly align: StreamShortVideoCaptionAlign;
  readonly status: StreamShortVideoCaptionOverlayStatus;
};

export type StreamShortVideoCaptionTextOverlayEvidence = {
  readonly selectedAssetTitle: string | null;
  readonly selectedAssetDurationMs: number | null;
  readonly overlayCountLocal: number;
  readonly selectedOverlayId: string | null;
  readonly selectedTextPresentLocal: boolean;
  readonly positionBoundLocal: boolean;
  readonly styleBoundLocal: boolean;
  readonly timingBoundLocal: boolean;
  readonly timelineBoundLocal: boolean;
  readonly reviewBoundLocal: boolean;
  readonly captionsReadyLocal: boolean;
  readonly queuedCaptionOverlayEvents: number;
  readonly fakeRenderSuccess: false;
  readonly fakeUploadSuccess: false;
  readonly fakePublishSuccess: false;
  readonly localBlockers: readonly string[];
  readonly providerBlockers: readonly string[];
};

export type StreamShortVideoCaptionTextOverlayState = {
  readonly version: "SHORTS-CAPTION-TEXT-OVERLAY-110Q";
  readonly status: StreamShortVideoCaptionOverlayStatus;
  readonly overlays: readonly StreamShortVideoCaptionOverlayItem[];
  readonly selectedOverlayId: string | null;
  readonly evidence: StreamShortVideoCaptionTextOverlayEvidence;
};

const MAX_CAPTION_LENGTH = 96;
const PLACEMENTS: readonly StreamShortVideoCaptionPlacement[] = ["bottom", "center", "top", "custom"];
const COLOR_PRESETS: readonly StreamShortVideoCaptionColorPreset[] = ["white", "warm", "dark", "sky"];
const BACKDROP_PRESETS: readonly StreamShortVideoCaptionBackdropPreset[] = ["soft", "glass", "solid", "none"];
const ALIGN_PRESETS: readonly StreamShortVideoCaptionAlign[] = ["center", "left", "right"];
const FONT_SIZES = [22, 26, 30, 34, 38, 44] as const;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function nextValue<T>(values: readonly T[], current: T): T {
  const index = values.findIndex((item) => item === current);
  return values[(index + 1 + values.length) % values.length];
}

function createDefaultOverlay(): StreamShortVideoCaptionOverlayItem {
  return {
    overlayId: "caption-overlay-1",
    text: "Sabi Shorts",
    startMs: 0,
    endMs: 5000,
    xPercent: 50,
    yPercent: 78,
    fontSize: 30,
    placement: "bottom",
    colorPreset: "white",
    backdropPreset: "soft",
    align: "center",
    status: "editing_local",
  };
}

function selectedOverlay(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionOverlayItem | null {
  return state.overlays.find((overlay) => overlay.overlayId === state.selectedOverlayId) ?? null;
}

function withSelectedOverlay(
  state: StreamShortVideoCaptionTextOverlayState,
  updater: (overlay: StreamShortVideoCaptionOverlayItem) => StreamShortVideoCaptionOverlayItem,
): StreamShortVideoCaptionTextOverlayState {
  const selected = selectedOverlay(state);
  if (!selected) return state;
  const overlays = state.overlays.map((overlay) => overlay.overlayId === selected.overlayId ? updater(overlay) : overlay);
  return normalizeCaptionTextOverlayState({ ...state, overlays, selectedOverlayId: selected.overlayId, status: "editing_local" });
}

function normalizeCaptionTextOverlayState(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  const selected = selectedOverlay(state);
  const overlayCountLocal = state.overlays.length;
  const evidenceBelongsToSelectedOverlay = Boolean(selected && state.evidence.selectedOverlayId === selected.overlayId);
  const selectedTextPresentLocal = Boolean(selected?.text.trim());
  const positionBoundLocal = Boolean(selected && selected.xPercent >= 0 && selected.yPercent >= 0);
  const styleBoundLocal = Boolean(selected && selected.fontSize >= 22 && selected.colorPreset && selected.backdropPreset && selected.align);
  const timingBoundLocal = Boolean(selected && selected.endMs > selected.startMs);
  const timelineBoundLocal = Boolean(selected && evidenceBelongsToSelectedOverlay && state.evidence.timelineBoundLocal);
  const reviewBoundLocal = Boolean(selected && evidenceBelongsToSelectedOverlay && state.evidence.reviewBoundLocal);
  const captionsReadyLocal = overlayCountLocal > 0 && selectedTextPresentLocal && positionBoundLocal && styleBoundLocal && timingBoundLocal && timelineBoundLocal && reviewBoundLocal;
  const status = captionsReadyLocal ? "ready_local" : state.status === "ready_local" ? "editing_local" : state.status;
  const localBlockers = [
    overlayCountLocal > 0 ? null : "caption_overlay_missing",
    selectedTextPresentLocal ? null : "caption_text_missing",
    positionBoundLocal ? null : "caption_position_missing",
    styleBoundLocal ? null : "caption_style_missing",
    timingBoundLocal ? null : "caption_timing_missing",
    timelineBoundLocal ? null : "caption_timeline_not_bound",
    reviewBoundLocal ? null : "caption_review_not_bound",
  ].filter((item): item is string => Boolean(item));
  const providerBlockers = ["render_provider_not_configured", "storage_cdn_not_connected", "publish_provider_not_connected"];
  return {
    ...state,
    selectedOverlayId: selected?.overlayId ?? null,
    status,
    evidence: {
      ...state.evidence,
      overlayCountLocal,
      selectedOverlayId: selected?.overlayId ?? null,
      selectedTextPresentLocal,
      positionBoundLocal,
      styleBoundLocal,
      timingBoundLocal,
      timelineBoundLocal,
      reviewBoundLocal,
      captionsReadyLocal,
      fakeRenderSuccess: false,
      fakeUploadSuccess: false,
      fakePublishSuccess: false,
      localBlockers,
      providerBlockers,
    },
  };
}

export function createInitialStreamShortVideoCaptionTextOverlayState(): StreamShortVideoCaptionTextOverlayState {
  const overlay = createDefaultOverlay();
  return normalizeCaptionTextOverlayState({
    version: "SHORTS-CAPTION-TEXT-OVERLAY-110Q",
    status: "draft",
    overlays: [overlay],
    selectedOverlayId: null,
    evidence: {
      selectedAssetTitle: null,
      selectedAssetDurationMs: null,
      overlayCountLocal: 1,
      selectedOverlayId: null,
      selectedTextPresentLocal: false,
      positionBoundLocal: false,
      styleBoundLocal: false,
      timingBoundLocal: false,
      timelineBoundLocal: false,
      reviewBoundLocal: false,
      captionsReadyLocal: false,
      queuedCaptionOverlayEvents: 0,
      fakeRenderSuccess: false,
      fakeUploadSuccess: false,
      fakePublishSuccess: false,
      localBlockers: [],
      providerBlockers: [],
    },
  });
}

export function bindStreamShortVideoCaptionTextOverlayAssetLocal(
  state: StreamShortVideoCaptionTextOverlayState,
  asset: StreamShortVideoCaptionOverlayAssetInput,
): StreamShortVideoCaptionTextOverlayState {
  const title = asset?.fileName ?? asset?.name ?? null;
  const durationMs = typeof asset?.durationMs === "number" && asset.durationMs > 0 ? asset.durationMs : state.evidence.selectedAssetDurationMs;
  const safeDuration = durationMs ?? 5000;
  const overlays = state.overlays.map((overlay) => ({
    ...overlay,
    startMs: clamp(overlay.startMs, 0, Math.max(0, safeDuration - 500)),
    endMs: clamp(overlay.endMs, 1000, Math.max(1000, safeDuration)),
  }));
  return normalizeCaptionTextOverlayState({
    ...state,
    status: "editing_local",
    overlays,
    evidence: {
      ...state.evidence,
      selectedAssetTitle: title,
      selectedAssetDurationMs: durationMs ?? null,
    },
  });
}

export function addStreamShortVideoCaptionTextOverlayLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  const index = state.overlays.length + 1;
  const overlay: StreamShortVideoCaptionOverlayItem = {
    ...createDefaultOverlay(),
    overlayId: `caption-overlay-${index}`,
    text: index === 1 ? "Sabi Shorts" : `Caption ${index}`,
    yPercent: clamp(78 - (index - 1) * 11, 12, 88),
  };
  return normalizeCaptionTextOverlayState({
    ...state,
    status: "editing_local",
    overlays: [...state.overlays, overlay],
    selectedOverlayId: null,
  });
}

export function updateSelectedStreamShortVideoCaptionTextOverlayLocal(
  state: StreamShortVideoCaptionTextOverlayState,
  text: string,
): StreamShortVideoCaptionTextOverlayState {
  const safeText = String(text ?? "").replace(/\s+/g, " ").slice(0, MAX_CAPTION_LENGTH);
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, text: safeText }));
}

export function selectStreamShortVideoCaptionTextOverlayLocal(
  state: StreamShortVideoCaptionTextOverlayState,
  overlayId: string,
): StreamShortVideoCaptionTextOverlayState {
  const selected = state.overlays.find((overlay) => overlay.overlayId === overlayId) ?? selectedOverlay(state);
  return normalizeCaptionTextOverlayState({ ...state, selectedOverlayId: selected?.overlayId ?? null });
}

export function removeSelectedStreamShortVideoCaptionTextOverlayLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  const selected = selectedOverlay(state);
  if (!selected || state.overlays.length <= 1) return normalizeCaptionTextOverlayState(state);
  const overlays = state.overlays.filter((overlay) => overlay.overlayId !== selected.overlayId);
  return normalizeCaptionTextOverlayState({ ...state, overlays, selectedOverlayId: null, status: "editing_local" });
}

export function cycleSelectedStreamShortVideoCaptionPlacementLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  return withSelectedOverlay(state, (overlay) => {
    const placement = nextValue(PLACEMENTS, overlay.placement);
    const yPercent = placement === "top" ? 18 : placement === "center" ? 50 : placement === "bottom" ? 78 : overlay.yPercent;
    return { ...overlay, placement, yPercent };
  });
}

export function nudgeSelectedStreamShortVideoCaptionXLocal(state: StreamShortVideoCaptionTextOverlayState, direction: "left" | "right"): StreamShortVideoCaptionTextOverlayState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, placement: "custom", xPercent: clamp(overlay.xPercent + (direction === "right" ? 5 : -5), 5, 95) }));
}

export function nudgeSelectedStreamShortVideoCaptionYLocal(state: StreamShortVideoCaptionTextOverlayState, direction: "up" | "down"): StreamShortVideoCaptionTextOverlayState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, placement: "custom", yPercent: clamp(overlay.yPercent + (direction === "down" ? 5 : -5), 8, 92) }));
}

export function cycleSelectedStreamShortVideoCaptionFontSizeLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, fontSize: nextValue(FONT_SIZES, overlay.fontSize as typeof FONT_SIZES[number]) }));
}

export function cycleSelectedStreamShortVideoCaptionColorLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, colorPreset: nextValue(COLOR_PRESETS, overlay.colorPreset) }));
}

export function cycleSelectedStreamShortVideoCaptionBackdropLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, backdropPreset: nextValue(BACKDROP_PRESETS, overlay.backdropPreset) }));
}

export function cycleSelectedStreamShortVideoCaptionAlignLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, align: nextValue(ALIGN_PRESETS, overlay.align) }));
}

export function shiftSelectedStreamShortVideoCaptionStartLocal(state: StreamShortVideoCaptionTextOverlayState, direction: "back" | "forward"): StreamShortVideoCaptionTextOverlayState {
  return withSelectedOverlay(state, (overlay) => {
    const maxStart = Math.max(0, overlay.endMs - 500);
    return { ...overlay, startMs: clamp(overlay.startMs + (direction === "forward" ? 500 : -500), 0, maxStart) };
  });
}

export function shiftSelectedStreamShortVideoCaptionEndLocal(state: StreamShortVideoCaptionTextOverlayState, direction: "back" | "forward"): StreamShortVideoCaptionTextOverlayState {
  const maxDuration = state.evidence.selectedAssetDurationMs ?? 60000;
  return withSelectedOverlay(state, (overlay) => ({
    ...overlay,
    endMs: clamp(overlay.endMs + (direction === "forward" ? 500 : -500), overlay.startMs + 500, maxDuration),
  }));
}

export function markStreamShortVideoCaptionTextOverlayTimelineBoundLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  const selected = selectedOverlay(state);
  if (!selected) {
    return normalizeCaptionTextOverlayState({
      ...state,
      status: "editing_local",
      evidence: { ...state.evidence, selectedOverlayId: null, timelineBoundLocal: false, reviewBoundLocal: false },
    });
  }
  return normalizeCaptionTextOverlayState({
    ...state,
    status: "timeline_bound_local",
    overlays: state.overlays.map((overlay) => overlay.overlayId === selected.overlayId ? { ...overlay, status: "timeline_bound_local" } : overlay),
    evidence: { ...state.evidence, selectedOverlayId: selected.overlayId, timelineBoundLocal: true, reviewBoundLocal: false },
  });
}

export function markStreamShortVideoCaptionTextOverlayReviewBoundLocal(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  const selected = selectedOverlay(state);
  const timelineIsBoundToSelected = Boolean(selected && state.evidence.selectedOverlayId === selected.overlayId && state.evidence.timelineBoundLocal);
  if (!selected || !timelineIsBoundToSelected) {
    return normalizeCaptionTextOverlayState({
      ...state,
      status: "editing_local",
      evidence: { ...state.evidence, reviewBoundLocal: false },
    });
  }
  return normalizeCaptionTextOverlayState({
    ...state,
    status: "review_bound_local",
    overlays: state.overlays.map((overlay) => overlay.overlayId === selected.overlayId ? { ...overlay, status: "review_bound_local" } : overlay),
    evidence: { ...state.evidence, selectedOverlayId: selected.overlayId, reviewBoundLocal: true },
  });
}

export function runStreamShortVideoCaptionTextOverlayCheck(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  return normalizeCaptionTextOverlayState(state);
}

export function queueStreamShortVideoCaptionTextOverlayEvent(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  return normalizeCaptionTextOverlayState({
    ...state,
    evidence: {
      ...state.evidence,
      queuedCaptionOverlayEvents: state.evidence.queuedCaptionOverlayEvents + 1,
    },
  });
}

export function requestStreamShortVideoCaptionTextOverlayProviderBlocked(state: StreamShortVideoCaptionTextOverlayState): StreamShortVideoCaptionTextOverlayState {
  return normalizeCaptionTextOverlayState({ ...state, status: "provider_blocked" });
}
