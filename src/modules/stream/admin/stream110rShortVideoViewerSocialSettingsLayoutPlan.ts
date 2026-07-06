export type Stream110rShortVideoViewerSocialSettingsLayoutGate = {
  readonly id: string;
  readonly title: string;
  readonly status: "local_ready" | "provider_blocked" | "not_fake";
  readonly evidence: readonly string[];
};

export type Stream110rShortVideoViewerSocialSettingsLayoutPlan = {
  readonly version: "110R";
  readonly scope: "shorts_viewer_social_settings_layout";
  readonly socialActions: readonly string[];
  readonly studioSettings: readonly string[];
  readonly gates: readonly Stream110rShortVideoViewerSocialSettingsLayoutGate[];
  readonly forbidden: readonly string[];
};

export const stream110rShortVideoViewerSocialSettingsLayoutPlan: Stream110rShortVideoViewerSocialSettingsLayoutPlan = {
  version: "110R",
  scope: "shorts_viewer_social_settings_layout",
  socialActions: ["like", "comments", "share", "save"],
  studioSettings: ["record", "upload", "edit", "effects", "mp3", "review", "source"],
  gates: [
    {
      id: "viewer_social_rail_visible",
      title: "Like / Comments / Share / Save are visible as viewer actions, not hidden inside Studio settings.",
      status: "local_ready",
      evidence: ["right-side viewer rail", "same local social runtime", "comment modal remains connected"],
    },
    {
      id: "studio_tools_are_settings",
      title: "Record / Upload / Edit / Effects / MP3 remain studio settings/tools.",
      status: "local_ready",
      evidence: ["settings dock title", "studio tools grouped", "no old duplicate controls restored"],
    },
    {
      id: "provider_truthful_block",
      title: "No fake backend engagement, publish, render, or storage success is introduced.",
      status: "provider_blocked",
      evidence: ["local-only engagement state", "provider blocked text", "no fake success flags"],
    },
  ],
  forbidden: [
    "do_not_restore_old_ShortsActionRail",
    "do_not_fake_like_count_from_backend",
    "do_not_fake_comment_delivery",
    "do_not_fake_share_provider_success",
    "do_not_fake_save_cloud_sync",
  ],
};
