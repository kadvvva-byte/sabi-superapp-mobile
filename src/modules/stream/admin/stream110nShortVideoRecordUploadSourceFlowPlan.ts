export type Stream110nShortVideoRecordUploadSourceFlowPlan = {
  readonly version: "STREAM-110N";
  readonly title: "Shorts record/upload source flow premium depth";
  readonly scope: "mobile_stream_shorts_only";
  readonly changedRuntimeFiles: readonly string[];
  readonly realLocalActions: readonly string[];
  readonly blockedUntilProviderReady: readonly string[];
  readonly untouchedAreas: readonly string[];
  readonly fakeSuccessBlocked: true;
};

export const stream110nShortVideoRecordUploadSourceFlowPlan: Stream110nShortVideoRecordUploadSourceFlowPlan = {
  version: "STREAM-110N",
  title: "Shorts record/upload source flow premium depth",
  scope: "mobile_stream_shorts_only",
  changedRuntimeFiles: [
    "src/modules/stream/mobile/StreamShortVideoDraftPanel.tsx",
    "src/modules/stream/mobile/streamShortVideoRecordUploadSourceFlowRuntime.ts",
    "src/modules/stream/admin/stream110nShortVideoRecordUploadSourceFlowPlan.ts",
    "src/modules/stream/index.ts",
  ],
  realLocalActions: [
    "Record opens the native camera video capture flow through expo-image-picker.",
    "Upload opens the native media-library video picker through expo-image-picker.",
    "Video file opens the native document picker for video files.",
    "Selected local video asset metadata is stored in the Shorts source-flow runtime.",
    "Selected video source is bound to Source intent and Timeline local clip state.",
    "All source-flow events remain local and are not sent to a fake provider.",
  ],
  blockedUntilProviderReady: [
    "media_storage_provider_required",
    "cdn_provider_required",
    "backend_asset_contract_required",
    "admin_media_review_required",
  ],
  untouchedAreas: [
    "Wallet",
    "Messenger",
    "Calls",
    "server/backend",
    "payments",
    "gifts",
    "monetization",
  ],
  fakeSuccessBlocked: true,
};
