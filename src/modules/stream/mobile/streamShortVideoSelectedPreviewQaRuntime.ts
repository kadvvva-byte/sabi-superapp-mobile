import type { StreamShortVideoRecordUploadAsset } from "./streamShortVideoRecordUploadSourceFlowRuntime";

export type StreamShortVideoSelectedPreviewQaCheckId =
  | "source_selected"
  | "local_uri_bound"
  | "preview_mounted"
  | "playback_bound"
  | "settings_accessible"
  | "social_actions_visible"
  | "sabi_camera_only";

export type StreamShortVideoSelectedPreviewQaCheck = {
  readonly id: StreamShortVideoSelectedPreviewQaCheckId;
  readonly label: string;
  readonly passedLocal: boolean;
};

export type StreamShortVideoSelectedPreviewQaInput = {
  readonly selectedAssetUriPresent: boolean;
  readonly selectedAssetTitle: string | null;
  readonly selectedSourceKind: StreamShortVideoRecordUploadAsset["kind"] | null;
  readonly previewAssetUriPresent: boolean;
  readonly previewReadyLocal: boolean;
  readonly playbackBoundLocal: boolean;
  readonly viewerPreviewMountedLocal: boolean;
  readonly settingsButtonVisibleLocal: boolean;
  readonly socialRailVisibleLocal: boolean;
  readonly settingsOverlayOpenLocal: boolean;
  readonly recordUsesSabiInAppCameraLocal: boolean;
  readonly systemCameraLaunchBlockedLocal: boolean;
  readonly progressPercentLocal: number;
  readonly durationMsLocal: number | null;
};

export type StreamShortVideoSelectedPreviewQaEvidence = {
  readonly checks: readonly StreamShortVideoSelectedPreviewQaCheck[];
  readonly readyCount: number;
  readonly totalCount: number;
  readonly readyForViewerLocal: boolean;
  readonly selectedTitle: string | null;
  readonly selectedSourceKind: StreamShortVideoRecordUploadAsset["kind"] | null;
  readonly progressPercentLocal: number;
  readonly durationMsLocal: number | null;
  readonly summaryLabel: string;
  readonly settingsOverlayOpenLocal: boolean;
  readonly fakePreviewAllowed: false;
  readonly fakeProviderSuccessAllowed: false;
  readonly fakePublishAllowed: false;
  readonly systemCameraAllowed: false;
};

function makeCheck(id: StreamShortVideoSelectedPreviewQaCheckId, label: string, passedLocal: boolean): StreamShortVideoSelectedPreviewQaCheck {
  return { id, label, passedLocal };
}

export function buildStreamShortVideoSelectedPreviewQaEvidence(input: StreamShortVideoSelectedPreviewQaInput): StreamShortVideoSelectedPreviewQaEvidence {
  const checks: readonly StreamShortVideoSelectedPreviewQaCheck[] = [
    makeCheck("source_selected", "Видео", input.selectedAssetUriPresent),
    makeCheck("local_uri_bound", "Файл", input.previewAssetUriPresent),
    makeCheck("preview_mounted", "Предпросмотр", input.viewerPreviewMountedLocal),
    makeCheck("playback_bound", "Плеер", input.playbackBoundLocal || input.previewReadyLocal),
    makeCheck("settings_accessible", "Настройки", input.settingsButtonVisibleLocal && input.settingsOverlayOpenLocal),
    makeCheck("social_actions_visible", "Соц-действия", input.socialRailVisibleLocal),
    makeCheck("sabi_camera_only", "Камера Sabi", input.recordUsesSabiInAppCameraLocal && input.systemCameraLaunchBlockedLocal),
  ];
  const readyCount = checks.filter((check) => check.passedLocal).length;
  const totalCount = checks.length;
  const readyForViewerLocal = readyCount === totalCount;
  const summaryLabel = input.selectedAssetTitle
    ? `${input.selectedAssetTitle} · ${input.progressPercentLocal}% предпросмотр · ${input.durationMsLocal ? Math.max(1, Math.round(input.durationMsLocal / 1000)) + " сек" : "локально"}`
    : "Выбери или сними видео, затем вернись к предпросмотру.";

  return {
    checks,
    readyCount,
    totalCount,
    readyForViewerLocal,
    selectedTitle: input.selectedAssetTitle,
    selectedSourceKind: input.selectedSourceKind,
    progressPercentLocal: input.progressPercentLocal,
    durationMsLocal: input.durationMsLocal,
    summaryLabel,
    settingsOverlayOpenLocal: input.settingsOverlayOpenLocal,
    fakePreviewAllowed: false,
    fakeProviderSuccessAllowed: false,
    fakePublishAllowed: false,
    systemCameraAllowed: false,
  };
}
