export const STREAM_109X_SHORT_VIDEO_EDITOR_TIMELINE_PLAN = {
  stage: "109X",
  title: "Short video editor timeline depth / media intent controls",
  scope: "stream_mobile_only",
  runtimeFiles: [
    "src/modules/stream/mobile/streamShortVideoEditorTimelineRuntime.ts",
    "src/modules/stream/mobile/StreamShortVideoDraftPanel.tsx",
  ],
  realLocalActions: [
    "add_camera_clip_local",
    "add_upload_clip_local",
    "trim_selected_clip_local",
    "split_selected_clip_local",
    "reorder_selected_clip_local",
    "mark_cover_from_selected_clip_local",
    "caption_track_ready_local",
    "timeline_policy_review_local",
    "queue_timeline_event_local",
    "provider_timeline_handoff_blocked",
  ],
  providerBlockers: [
    "media_storage_provider_required",
    "cdn_provider_required",
    "backend_timeline_contract_required",
    "admin_editor_review_required",
  ],
  forbidden: {
    walletTouched: false,
    paymentsTouched: false,
    giftsTouched: false,
    monetizationTouched: false,
    serverTouched: false,
    fakeUploadAllowed: false,
    fakePublishAllowed: false,
    fakeProviderSuccessAllowed: false,
  },
} as const;

export type Stream109XShortVideoEditorTimelinePlan = typeof STREAM_109X_SHORT_VIDEO_EDITOR_TIMELINE_PLAN;
