import type {
  StreamShortVideoCreationToolsRuntimeState,
  StreamShortVideoEffectToolId,
} from "./streamShortVideoCreationToolsRuntime";

export type StreamShortVideoEffectParameterPreset = "soft" | "balanced" | "strong";
export type StreamShortVideoEffectPreviewMode = "before" | "after" | "split";

export type StreamShortVideoEffectsEditorStatus =
  | "idle_local"
  | "stack_ready_local"
  | "parameter_adjusted_local"
  | "preview_ready_local"
  | "review_required_local"
  | "provider_render_blocked";

export type StreamShortVideoEffectsEditorEventKind =
  | "short_effect_editor_synced_local"
  | "short_effect_stack_added_local"
  | "short_effect_stack_selected_local"
  | "short_effect_stack_removed_local"
  | "short_effect_stack_reordered_local"
  | "short_effect_parameter_adjusted_local"
  | "short_effect_preset_cycled_local"
  | "short_effect_preview_mode_cycled_local"
  | "short_effect_preview_toggled_local"
  | "short_effect_review_prepared_local"
  | "short_effect_editor_event_queued_local"
  | "short_effect_render_provider_blocked";

export type StreamShortVideoEffectsEditorBlockerCode =
  | "effect_stack_required"
  | "selected_effect_required"
  | "parameter_review_required"
  | "timeline_render_contract_required"
  | "effects_render_provider_required"
  | "preview_manifest_required"
  | "media_storage_provider_required"
  | "admin_effects_review_required";

export type StreamShortVideoEffectStackItem = {
  readonly stackItemId: string;
  readonly effectId: StreamShortVideoEffectToolId;
  readonly label: string;
  readonly order: number;
  readonly intensityPercentLocal: number;
  readonly parameterPreset: StreamShortVideoEffectParameterPreset;
  readonly previewEnabledLocal: boolean;
  readonly reviewPreparedLocal: boolean;
  readonly providerRenderStatus: "not_connected";
};

export type StreamShortVideoEffectsEditorEvent = {
  readonly eventId: string;
  readonly kind: StreamShortVideoEffectsEditorEventKind;
  readonly createdAt: string;
  readonly deliveredToProvider: false;
  readonly payload: {
    readonly status: StreamShortVideoEffectsEditorStatus;
    readonly selectedStackItemId: string | null;
    readonly stackCount: number;
    readonly previewMode: StreamShortVideoEffectPreviewMode;
    readonly localBlockers: readonly StreamShortVideoEffectsEditorBlockerCode[];
    readonly providerBlockers: readonly StreamShortVideoEffectsEditorBlockerCode[];
  };
};

export type StreamShortVideoEffectsEditorEvidence = {
  readonly status: StreamShortVideoEffectsEditorStatus;
  readonly selectedStackItemId: string | null;
  readonly selectedEffectLabel: string;
  readonly stackCount: number;
  readonly activePreviewCount: number;
  readonly averageIntensityPercentLocal: number;
  readonly previewMode: StreamShortVideoEffectPreviewMode;
  readonly queuedEvents: number;
  readonly localBlockers: readonly StreamShortVideoEffectsEditorBlockerCode[];
  readonly providerBlockers: readonly StreamShortVideoEffectsEditorBlockerCode[];
  readonly timelineRenderContract: "not_connected";
  readonly effectsRenderProvider: "not_configured";
  readonly previewManifest: "not_connected";
  readonly mediaStorageProvider: "not_configured";
  readonly adminEffectsReview: "not_connected";
  readonly fakeEffectRenderAllowed: false;
  readonly fakePreviewManifestAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePublishAllowed: false;
  readonly paymentsAllowedNow: false;
  readonly giftsAllowedNow: false;
  readonly monetizationAllowedNow: false;
  readonly walletBridgeRequiredNow: false;
};

export type StreamShortVideoEffectsEditorRuntimeState = {
  readonly status: StreamShortVideoEffectsEditorStatus;
  readonly effectStack: readonly StreamShortVideoEffectStackItem[];
  readonly selectedStackItemId: string | null;
  readonly previewMode: StreamShortVideoEffectPreviewMode;
  readonly events: readonly StreamShortVideoEffectsEditorEvent[];
  readonly evidence: StreamShortVideoEffectsEditorEvidence;
  readonly updatedAt: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}`;

const providerBlockers = (): readonly StreamShortVideoEffectsEditorBlockerCode[] => [
  "timeline_render_contract_required",
  "effects_render_provider_required",
  "preview_manifest_required",
  "media_storage_provider_required",
  "admin_effects_review_required",
];

function findToolLabel(tools: StreamShortVideoCreationToolsRuntimeState, effectId: StreamShortVideoEffectToolId): string {
  return tools.effectTools.find((tool) => tool.id === effectId)?.label ?? effectId;
}

function localBlockersFor(state: Omit<StreamShortVideoEffectsEditorRuntimeState, "evidence" | "updatedAt">): readonly StreamShortVideoEffectsEditorBlockerCode[] {
  const blockers: StreamShortVideoEffectsEditorBlockerCode[] = [];
  if (state.effectStack.length === 0) blockers.push("effect_stack_required");
  if (!state.selectedStackItemId || !state.effectStack.some((item) => item.stackItemId === state.selectedStackItemId)) blockers.push("selected_effect_required");
  if (state.effectStack.some((item) => !item.reviewPreparedLocal)) blockers.push("parameter_review_required");
  return blockers;
}

function selectedItem(state: Pick<StreamShortVideoEffectsEditorRuntimeState, "effectStack" | "selectedStackItemId">): StreamShortVideoEffectStackItem | null {
  return state.selectedStackItemId ? state.effectStack.find((item) => item.stackItemId === state.selectedStackItemId) ?? null : null;
}

function normalizeOrder(items: readonly StreamShortVideoEffectStackItem[]): readonly StreamShortVideoEffectStackItem[] {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

function rebuild(base: Omit<StreamShortVideoEffectsEditorRuntimeState, "evidence" | "updatedAt">): StreamShortVideoEffectsEditorRuntimeState {
  const selected = selectedItem(base);
  const localBlockers = localBlockersFor(base);
  const activePreviewCount = base.effectStack.filter((item) => item.previewEnabledLocal).length;
  const averageIntensity = base.effectStack.length > 0
    ? Math.round(base.effectStack.reduce((sum, item) => sum + item.intensityPercentLocal, 0) / base.effectStack.length)
    : 0;
  return {
    ...base,
    evidence: {
      status: base.status,
      selectedStackItemId: selected?.stackItemId ?? null,
      selectedEffectLabel: selected?.label ?? "Эффект не выбран",
      stackCount: base.effectStack.length,
      activePreviewCount,
      averageIntensityPercentLocal: averageIntensity,
      previewMode: base.previewMode,
      queuedEvents: base.events.length,
      localBlockers,
      providerBlockers: providerBlockers(),
      timelineRenderContract: "not_connected",
      effectsRenderProvider: "not_configured",
      previewManifest: "not_connected",
      mediaStorageProvider: "not_configured",
      adminEffectsReview: "not_connected",
      fakeEffectRenderAllowed: false,
      fakePreviewManifestAllowed: false,
      fakeProviderAllowed: false,
      fakePublishAllowed: false,
      paymentsAllowedNow: false,
      giftsAllowedNow: false,
      monetizationAllowedNow: false,
      walletBridgeRequiredNow: false,
    },
    updatedAt: nowIso(),
  };
}

function addEvent(
  state: Omit<StreamShortVideoEffectsEditorRuntimeState, "evidence" | "updatedAt">,
  kind: StreamShortVideoEffectsEditorEventKind,
): Omit<StreamShortVideoEffectsEditorRuntimeState, "evidence" | "updatedAt"> {
  const event: StreamShortVideoEffectsEditorEvent = {
    eventId: makeId(kind),
    kind,
    createdAt: nowIso(),
    deliveredToProvider: false,
    payload: {
      status: state.status,
      selectedStackItemId: state.selectedStackItemId,
      stackCount: state.effectStack.length,
      previewMode: state.previewMode,
      localBlockers: localBlockersFor(state),
      providerBlockers: providerBlockers(),
    },
  };
  return { ...state, events: [event, ...state.events].slice(0, 30) };
}

function makeStackItem(effectId: StreamShortVideoEffectToolId, label: string, order: number): StreamShortVideoEffectStackItem {
  return {
    stackItemId: `${effectId}-${Date.now()}`,
    effectId,
    label,
    order,
    intensityPercentLocal: 55,
    parameterPreset: "balanced",
    previewEnabledLocal: true,
    reviewPreparedLocal: false,
    providerRenderStatus: "not_connected",
  };
}

export function createInitialStreamShortVideoEffectsEditorState(
  tools: StreamShortVideoCreationToolsRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  const stack = normalizeOrder(tools.activeEffects.map((effectId, index) => makeStackItem(effectId, findToolLabel(tools, effectId), index + 1)));
  return rebuild({
    status: stack.length > 0 ? "stack_ready_local" : "idle_local",
    effectStack: stack,
    selectedStackItemId: null,
    previewMode: "after",
    events: [],
  });
}

export function syncStreamShortVideoEffectsEditorWithCreationTools(
  state: StreamShortVideoEffectsEditorRuntimeState,
  tools: StreamShortVideoCreationToolsRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  const currentByEffect = new Map(state.effectStack.map((item) => [item.effectId, item]));
  const nextStack = normalizeOrder(tools.activeEffects.map((effectId, index) => currentByEffect.get(effectId) ?? makeStackItem(effectId, findToolLabel(tools, effectId), index + 1)));
  const selectedStillExists = nextStack.some((item) => item.stackItemId === state.selectedStackItemId);
  const next = addEvent({
    ...state,
    status: nextStack.length > 0 ? "stack_ready_local" : "idle_local",
    effectStack: nextStack,
    selectedStackItemId: selectedStillExists ? state.selectedStackItemId : null,
  }, "short_effect_editor_synced_local");
  return rebuild(next);
}

export function addStreamShortVideoEffectToEditorStackLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
  effectId: StreamShortVideoEffectToolId,
  label: string,
): StreamShortVideoEffectsEditorRuntimeState {
  const existing = state.effectStack.find((item) => item.effectId === effectId);
  const nextItem = existing ?? makeStackItem(effectId, label, state.effectStack.length + 1);
  const nextStack = existing ? state.effectStack : normalizeOrder([...state.effectStack, nextItem]);
  const next = addEvent({
    ...state,
    status: "stack_ready_local",
    effectStack: nextStack,
    selectedStackItemId: state.effectStack.some((item) => item.stackItemId === state.selectedStackItemId) ? state.selectedStackItemId : null,
  }, "short_effect_stack_added_local");
  return rebuild(next);
}

export function selectStreamShortVideoEditorEffectLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
  stackItemId?: string,
): StreamShortVideoEffectsEditorRuntimeState {
  const ids = state.effectStack.map((item) => item.stackItemId);
  const selectedStillExists = state.selectedStackItemId ? ids.includes(state.selectedStackItemId) : false;
  const currentIndex = selectedStillExists ? ids.indexOf(state.selectedStackItemId as string) : -1;
  const nextId = stackItemId ?? (currentIndex < 0 ? ids[0] : ids[(currentIndex + 1) % Math.max(1, ids.length)]) ?? null;
  const next = addEvent({ ...state, status: state.effectStack.length > 0 ? "stack_ready_local" : "idle_local", selectedStackItemId: nextId }, "short_effect_stack_selected_local");
  return rebuild(next);
}

export function removeSelectedStreamShortVideoEditorEffectLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  const selected = selectedItem(state);
  if (!selected) return rebuild(addEvent({ ...state, status: "idle_local" }, "short_effect_stack_removed_local"));
  const nextStack = normalizeOrder(state.effectStack.filter((item) => item.stackItemId !== selected.stackItemId));
  const next = addEvent({
    ...state,
    status: nextStack.length > 0 ? "stack_ready_local" : "idle_local",
    effectStack: nextStack,
    selectedStackItemId: null,
  }, "short_effect_stack_removed_local");
  return rebuild(next);
}

export function moveSelectedStreamShortVideoEditorEffectLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
  direction: "up" | "down",
): StreamShortVideoEffectsEditorRuntimeState {
  const selected = selectedItem(state);
  if (!selected) return state;
  const items = [...state.effectStack];
  const index = items.findIndex((item) => item.stackItemId === selected.stackItemId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return state;
  const target = items[targetIndex];
  if (!target) return state;
  items[targetIndex] = selected;
  items[index] = target;
  const next = addEvent({ ...state, status: "stack_ready_local", effectStack: normalizeOrder(items) }, "short_effect_stack_reordered_local");
  return rebuild(next);
}

export function adjustSelectedStreamShortVideoEffectIntensityLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  const selected = selectedItem(state);
  if (!selected) return state;
  const steps = [25, 55, 75, 100] as const;
  const currentIndex = Math.max(0, steps.findIndex((value) => value === selected.intensityPercentLocal));
  const nextIntensity = steps[(currentIndex + 1) % steps.length];
  const nextStack = state.effectStack.map((item) => item.stackItemId === selected.stackItemId ? { ...item, intensityPercentLocal: nextIntensity, reviewPreparedLocal: false } : item);
  const next = addEvent({ ...state, status: "parameter_adjusted_local", effectStack: nextStack }, "short_effect_parameter_adjusted_local");
  return rebuild(next);
}

export function cycleSelectedStreamShortVideoEffectPresetLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  const selected = selectedItem(state);
  if (!selected) return state;
  const presets: readonly StreamShortVideoEffectParameterPreset[] = ["soft", "balanced", "strong"];
  const currentIndex = Math.max(0, presets.indexOf(selected.parameterPreset));
  const nextPreset = presets[(currentIndex + 1) % presets.length];
  const nextStack = state.effectStack.map((item) => item.stackItemId === selected.stackItemId ? { ...item, parameterPreset: nextPreset, reviewPreparedLocal: false } : item);
  const next = addEvent({ ...state, status: "parameter_adjusted_local", effectStack: nextStack }, "short_effect_preset_cycled_local");
  return rebuild(next);
}

export function cycleStreamShortVideoEffectPreviewModeLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  const modes: readonly StreamShortVideoEffectPreviewMode[] = ["before", "after", "split"];
  const currentIndex = Math.max(0, modes.indexOf(state.previewMode));
  const next = addEvent({ ...state, status: "preview_ready_local", previewMode: modes[(currentIndex + 1) % modes.length] }, "short_effect_preview_mode_cycled_local");
  return rebuild(next);
}

export function toggleSelectedStreamShortVideoEffectPreviewLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  const selected = selectedItem(state);
  if (!selected) return state;
  const nextStack = state.effectStack.map((item) => item.stackItemId === selected.stackItemId ? { ...item, previewEnabledLocal: !item.previewEnabledLocal } : item);
  const next = addEvent({ ...state, status: "preview_ready_local", effectStack: nextStack }, "short_effect_preview_toggled_local");
  return rebuild(next);
}

export function prepareSelectedStreamShortVideoEffectReviewLocal(
  state: StreamShortVideoEffectsEditorRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  const selected = selectedItem(state);
  if (!selected) return state;
  const nextStack = state.effectStack.map((item) => item.stackItemId === selected.stackItemId ? { ...item, reviewPreparedLocal: true } : item);
  const next = addEvent({ ...state, status: "review_required_local", effectStack: nextStack }, "short_effect_review_prepared_local");
  return rebuild(next);
}

export function queueStreamShortVideoEffectsEditorLocalEvent(
  state: StreamShortVideoEffectsEditorRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  return rebuild(addEvent({ ...state, status: state.effectStack.length > 0 ? "review_required_local" : state.status }, "short_effect_editor_event_queued_local"));
}

export function requestStreamShortVideoEffectsEditorProviderBlocked(
  state: StreamShortVideoEffectsEditorRuntimeState,
): StreamShortVideoEffectsEditorRuntimeState {
  return rebuild(addEvent({ ...state, status: "provider_render_blocked" }, "short_effect_render_provider_blocked"));
}
