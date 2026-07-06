export type StreamShortVideoUsefulOverlayStatus =
  | "черновик"
  | "editing_local"
  | "timeline_bound_local"
  | "review_bound_local"
  | "ready_local"
  | "provider_blocked";

export type StreamShortVideoUsefulOverlayKind = "emoji" | "label" | "badge" | "arrow" | "highlight" | "shape";
export type StreamShortVideoUsefulOverlayTone = "warm" | "light" | "dark" | "blue" | "green";
export type StreamShortVideoUsefulOverlayShape = "pill" | "circle" | "box" | "underline";

export type StreamShortVideoUsefulOverlayAssetInput = {
  readonly name?: string | null;
  readonly fileName?: string | null;
  readonly durationMs?: number | null;
} | null;

export type StreamShortVideoUsefulOverlayItem = {
  readonly overlayId: string;
  readonly kind: StreamShortVideoUsefulOverlayKind;
  readonly label: string;
  readonly iconText: string;
  readonly xPercent: number;
  readonly yPercent: number;
  readonly layer: number;
  readonly scalePercent: number;
  readonly rotationDeg: number;
  readonly opacityPercent: number;
  readonly startMs: number;
  readonly endMs: number;
  readonly tone: StreamShortVideoUsefulOverlayTone;
  readonly shape: StreamShortVideoUsefulOverlayShape;
  readonly status: StreamShortVideoUsefulOverlayStatus;
};

export type StreamShortVideoUsefulOverlayEditorEvidence = {
  readonly selectedAssetTitle: string | null;
  readonly selectedAssetDurationMs: number | null;
  readonly overlayCountLocal: number;
  readonly selectedOverlayId: string | null;
  readonly usefulKindSelectedLocal: boolean;
  readonly positionBoundLocal: boolean;
  readonly styleBoundLocal: boolean;
  readonly layerBoundLocal: boolean;
  readonly timingBoundLocal: boolean;
  readonly timelineBoundLocal: boolean;
  readonly reviewBoundLocal: boolean;
  readonly overlayReadyLocal: boolean;
  readonly queuedOverlayEvents: number;
  readonly fakeRenderSuccess: false;
  readonly fakeUploadSuccess: false;
  readonly fakePublishSuccess: false;
  readonly localBlockers: readonly string[];
  readonly providerBlockers: readonly string[];
};

export type StreamShortVideoUsefulOverlayEditorState = {
  readonly version: "SHORTS-USEFUL-OVERLAY-EDITOR-110S";
  readonly status: StreamShortVideoUsefulOverlayStatus;
  readonly overlays: readonly StreamShortVideoUsefulOverlayItem[];
  readonly selectedOverlayId: string | null;
  readonly evidence: StreamShortVideoUsefulOverlayEditorEvidence;
};

const KINDS: readonly StreamShortVideoUsefulOverlayKind[] = ["label", "emoji", "badge", "arrow", "highlight", "shape"];
const TONES: readonly StreamShortVideoUsefulOverlayTone[] = ["warm", "light", "dark", "blue", "green"];
const SHAPES: readonly StreamShortVideoUsefulOverlayShape[] = ["pill", "circle", "box", "underline"];

const KIND_DEFAULTS: Record<StreamShortVideoUsefulOverlayKind, { readonly label: string; readonly iconText: string; readonly shape: StreamShortVideoUsefulOverlayShape }> = {
  emoji: { label: "Настроение", iconText: "🙂", shape: "circle" },
  label: { label: "Важно", iconText: "TXT", shape: "pill" },
  badge: { label: "Проверено", iconText: "OK", shape: "pill" },
  arrow: { label: "Смотри сюда", iconText: "→", shape: "underline" },
  highlight: { label: "Выделение", iconText: "HL", shape: "box" },
  shape: { label: "Рамка", iconText: "□", shape: "box" },
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function nextValue<T>(values: readonly T[], current: T): T {
  const index = values.findIndex((item) => item === current);
  return values[(index + 1 + values.length) % values.length];
}

function selectedOverlay(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayItem | null {
  return state.overlays.find((overlay) => overlay.overlayId === state.selectedOverlayId) ?? null;
}

function createDefaultOverlay(index = 1, kind: StreamShortVideoUsefulOverlayKind = "label"): StreamShortVideoUsefulOverlayItem {
  const defaults = KIND_DEFAULTS[kind];
  return {
    overlayId: `useful-overlay-${index}`,
    kind,
    label: index === 1 ? defaults.label : `${defaults.label} ${index}`,
    iconText: defaults.iconText,
    xPercent: clamp(54 + (index - 1) * 5, 12, 88),
    yPercent: clamp(54 - (index - 1) * 7, 12, 88),
    layer: clamp(index, 1, 10),
    scalePercent: 100,
    rotationDeg: 0,
    opacityPercent: 92,
    startMs: 0,
    endMs: 5000,
    tone: "warm",
    shape: defaults.shape,
    status: "editing_local",
  };
}

function withSelectedOverlay(
  state: StreamShortVideoUsefulOverlayEditorState,
  updater: (overlay: StreamShortVideoUsefulOverlayItem) => StreamShortVideoUsefulOverlayItem,
): StreamShortVideoUsefulOverlayEditorState {
  const selected = selectedOverlay(state);
  if (!selected) return state;
  const overlays = state.overlays.map((overlay) => overlay.overlayId === selected.overlayId ? updater(overlay) : overlay);
  return normalizeUsefulOverlayEditorState({ ...state, overlays, selectedOverlayId: selected.overlayId, status: "editing_local" });
}

function normalizeUsefulOverlayEditorState(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  const selected = selectedOverlay(state);
  const overlayCountLocal = state.overlays.length;
  const evidenceBelongsToSelectedOverlay = Boolean(selected && state.evidence.selectedOverlayId === selected.overlayId);
  const usefulKindSelectedLocal = Boolean(selected?.kind);
  const positionBoundLocal = Boolean(selected && selected.xPercent >= 0 && selected.yPercent >= 0);
  const styleBoundLocal = Boolean(selected && selected.label.trim() && selected.iconText.trim() && selected.tone && selected.shape && selected.scalePercent > 0 && selected.opacityPercent > 0);
  const layerBoundLocal = Boolean(selected && selected.layer >= 1 && selected.layer <= 10);
  const timingBoundLocal = Boolean(selected && selected.endMs > selected.startMs);
  const timelineBoundLocal = Boolean(selected && evidenceBelongsToSelectedOverlay && state.evidence.timelineBoundLocal);
  const reviewBoundLocal = Boolean(selected && evidenceBelongsToSelectedOverlay && state.evidence.reviewBoundLocal);
  const overlayReadyLocal = overlayCountLocal > 0 && usefulKindSelectedLocal && positionBoundLocal && styleBoundLocal && layerBoundLocal && timingBoundLocal && timelineBoundLocal && reviewBoundLocal;
  const status = overlayReadyLocal ? "ready_local" : state.status === "ready_local" ? "editing_local" : state.status;
  const localBlockers = [
    overlayCountLocal > 0 ? null : "useful_overlay_missing",
    usefulKindSelectedLocal ? null : "useful_overlay_kind_missing",
    positionBoundLocal ? null : "useful_overlay_position_missing",
    styleBoundLocal ? null : "useful_overlay_style_missing",
    layerBoundLocal ? null : "useful_overlay_layer_missing",
    timingBoundLocal ? null : "useful_overlay_timing_missing",
    timelineBoundLocal ? null : "useful_overlay_timeline_not_bound",
    reviewBoundLocal ? null : "useful_overlay_review_not_bound",
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
      usefulKindSelectedLocal,
      positionBoundLocal,
      styleBoundLocal,
      layerBoundLocal,
      timingBoundLocal,
      timelineBoundLocal,
      reviewBoundLocal,
      overlayReadyLocal,
      fakeRenderSuccess: false,
      fakeUploadSuccess: false,
      fakePublishSuccess: false,
      localBlockers,
      providerBlockers,
    },
  };
}

export function createInitialStreamShortVideoUsefulOverlayEditorState(): StreamShortVideoUsefulOverlayEditorState {
  const overlay = createDefaultOverlay();
  return normalizeUsefulOverlayEditorState({
    version: "SHORTS-USEFUL-OVERLAY-EDITOR-110S",
    status: "черновик",
    overlays: [overlay],
    selectedOverlayId: null,
    evidence: {
      selectedAssetTitle: null,
      selectedAssetDurationMs: null,
      overlayCountLocal: 1,
      selectedOverlayId: null,
      usefulKindSelectedLocal: false,
      positionBoundLocal: false,
      styleBoundLocal: false,
      layerBoundLocal: false,
      timingBoundLocal: false,
      timelineBoundLocal: false,
      reviewBoundLocal: false,
      overlayReadyLocal: false,
      queuedOverlayEvents: 0,
      fakeRenderSuccess: false,
      fakeUploadSuccess: false,
      fakePublishSuccess: false,
      localBlockers: [],
      providerBlockers: [],
    },
  });
}

export function bindStreamShortVideoUsefulOverlayAssetLocal(
  state: StreamShortVideoUsefulOverlayEditorState,
  asset: StreamShortVideoUsefulOverlayAssetInput,
): StreamShortVideoUsefulOverlayEditorState {
  const title = asset?.fileName ?? asset?.name ?? null;
  const durationMs = typeof asset?.durationMs === "number" && asset.durationMs > 0 ? asset.durationMs : state.evidence.selectedAssetDurationMs;
  const safeDuration = durationMs ?? 5000;
  const overlays = state.overlays.map((overlay) => ({
    ...overlay,
    startMs: clamp(overlay.startMs, 0, Math.max(0, safeDuration - 500)),
    endMs: clamp(overlay.endMs, 1000, Math.max(1000, safeDuration)),
  }));
  return normalizeUsefulOverlayEditorState({
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

export function addStreamShortVideoUsefulOverlayLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  const index = state.overlays.length + 1;
  const kind = KINDS[(index - 1) % KINDS.length];
  const overlay = createDefaultOverlay(index, kind);
  return normalizeUsefulOverlayEditorState({
    ...state,
    status: "editing_local",
    overlays: [...state.overlays, overlay],
    selectedOverlayId: null,
  });
}

export function removeSelectedStreamShortVideoUsefulOverlayLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  const selected = selectedOverlay(state);
  if (!selected || state.overlays.length <= 1) return normalizeUsefulOverlayEditorState(state);
  const overlays = state.overlays.filter((overlay) => overlay.overlayId !== selected.overlayId);
  return normalizeUsefulOverlayEditorState({ ...state, overlays, selectedOverlayId: null, status: "editing_local" });
}

export function selectStreamShortVideoUsefulOverlayLocal(state: StreamShortVideoUsefulOverlayEditorState, overlayId: string): StreamShortVideoUsefulOverlayEditorState {
  const selected = state.overlays.find((overlay) => overlay.overlayId === overlayId) ?? selectedOverlay(state);
  return normalizeUsefulOverlayEditorState({ ...state, selectedOverlayId: selected?.overlayId ?? null });
}

export function updateSelectedStreamShortVideoUsefulOverlayLabelLocal(state: StreamShortVideoUsefulOverlayEditorState, label: string): StreamShortVideoUsefulOverlayEditorState {
  const safeLabel = String(label ?? "").replace(/\s+/g, " ").slice(0, 28);
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, label: safeLabel || overlay.label }));
}

export function cycleSelectedStreamShortVideoUsefulOverlayKindLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => {
    const kind = nextValue(KINDS, overlay.kind);
    const defaults = KIND_DEFAULTS[kind];
    return { ...overlay, kind, label: defaults.label, iconText: defaults.iconText, shape: defaults.shape };
  });
}

export function cycleSelectedStreamShortVideoUsefulOverlayToneLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, tone: nextValue(TONES, overlay.tone) }));
}

export function cycleSelectedStreamShortVideoUsefulOverlayShapeLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, shape: nextValue(SHAPES, overlay.shape) }));
}

export function nudgeSelectedStreamShortVideoUsefulOverlayXLocal(state: StreamShortVideoUsefulOverlayEditorState, direction: "left" | "right"): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, xPercent: clamp(overlay.xPercent + (direction === "right" ? 5 : -5), 5, 95) }));
}

export function nudgeSelectedStreamShortVideoUsefulOverlayYLocal(state: StreamShortVideoUsefulOverlayEditorState, direction: "up" | "down"): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, yPercent: clamp(overlay.yPercent + (direction === "down" ? 5 : -5), 6, 94) }));
}

export function cycleSelectedStreamShortVideoUsefulOverlayLayerLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, layer: overlay.layer >= 10 ? 1 : overlay.layer + 1 }));
}

export function nudgeSelectedStreamShortVideoUsefulOverlayScaleLocal(state: StreamShortVideoUsefulOverlayEditorState, direction: "smaller" | "larger"): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, scalePercent: clamp(overlay.scalePercent + (direction === "larger" ? 10 : -10), 60, 180) }));
}

export function nudgeSelectedStreamShortVideoUsefulOverlayRotationLocal(state: StreamShortVideoUsefulOverlayEditorState, direction: "left" | "right"): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, rotationDeg: clamp(overlay.rotationDeg + (direction === "right" ? 15 : -15), -45, 45) }));
}

export function cycleSelectedStreamShortVideoUsefulOverlayOpacityLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  const values = [60, 75, 88, 100] as const;
  return withSelectedOverlay(state, (overlay) => ({ ...overlay, opacityPercent: nextValue(values, overlay.opacityPercent as typeof values[number]) }));
}

export function shiftSelectedStreamShortVideoUsefulOverlayStartLocal(state: StreamShortVideoUsefulOverlayEditorState, direction: "back" | "forward"): StreamShortVideoUsefulOverlayEditorState {
  return withSelectedOverlay(state, (overlay) => {
    const maxStart = Math.max(0, overlay.endMs - 500);
    return { ...overlay, startMs: clamp(overlay.startMs + (direction === "forward" ? 500 : -500), 0, maxStart) };
  });
}

export function shiftSelectedStreamShortVideoUsefulOverlayEndLocal(state: StreamShortVideoUsefulOverlayEditorState, direction: "back" | "forward"): StreamShortVideoUsefulOverlayEditorState {
  const maxDuration = state.evidence.selectedAssetDurationMs ?? 60000;
  return withSelectedOverlay(state, (overlay) => ({
    ...overlay,
    endMs: clamp(overlay.endMs + (direction === "forward" ? 500 : -500), overlay.startMs + 500, maxDuration),
  }));
}

export function markStreamShortVideoUsefulOverlayTimelineBoundLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  const selected = selectedOverlay(state);
  if (!selected) {
    return normalizeUsefulOverlayEditorState({
      ...state,
      status: "editing_local",
      evidence: { ...state.evidence, selectedOverlayId: null, timelineBoundLocal: false, reviewBoundLocal: false },
    });
  }
  return normalizeUsefulOverlayEditorState({
    ...state,
    status: "timeline_bound_local",
    overlays: state.overlays.map((overlay) => overlay.overlayId === selected.overlayId ? { ...overlay, status: "timeline_bound_local" } : overlay),
    evidence: { ...state.evidence, selectedOverlayId: selected.overlayId, timelineBoundLocal: true, reviewBoundLocal: false },
  });
}

export function markStreamShortVideoUsefulOverlayReviewBoundLocal(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  const selected = selectedOverlay(state);
  const timelineIsBoundToSelected = Boolean(selected && state.evidence.selectedOverlayId === selected.overlayId && state.evidence.timelineBoundLocal);
  if (!selected || !timelineIsBoundToSelected) {
    return normalizeUsefulOverlayEditorState({
      ...state,
      status: "editing_local",
      evidence: { ...state.evidence, reviewBoundLocal: false },
    });
  }
  return normalizeUsefulOverlayEditorState({
    ...state,
    status: "review_bound_local",
    overlays: state.overlays.map((overlay) => overlay.overlayId === selected.overlayId ? { ...overlay, status: "review_bound_local" } : overlay),
    evidence: { ...state.evidence, selectedOverlayId: selected.overlayId, reviewBoundLocal: true },
  });
}

export function runStreamShortVideoUsefulOverlayEditorCheck(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  return normalizeUsefulOverlayEditorState(state);
}

export function queueStreamShortVideoUsefulOverlayEditorEvent(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  return normalizeUsefulOverlayEditorState({
    ...state,
    evidence: {
      ...state.evidence,
      queuedOverlayEvents: state.evidence.queuedOverlayEvents + 1,
    },
  });
}

export function requestStreamShortVideoUsefulOverlayProviderBlocked(state: StreamShortVideoUsefulOverlayEditorState): StreamShortVideoUsefulOverlayEditorState {
  return normalizeUsefulOverlayEditorState({ ...state, status: "provider_blocked" });
}
