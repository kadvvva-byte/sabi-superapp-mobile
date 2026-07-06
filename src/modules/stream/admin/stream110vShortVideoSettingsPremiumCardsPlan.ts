export const stream110vShortVideoSettingsPremiumCardsPlan = {
  version: "110V",
  title: "Shorts Settings premium cards clean pass",
  scope: "mobile-stream-shorts-settings-only",
  safe: true,
  mainScreenRule: "Shorts main screen stays clean: video area plus right rail Settings/Like/Comments/Share/Save only.",
  settingsRule: "Record/upload/edit/text/overlays/effects/MP3/review are inside Settings.",
  changes: [
    "Added premium focus card per Settings tab with one clear primary action and two secondary actions.",
    "Reworked Settings Hub grid into compact premium cards so the tool order is easier to read.",
    "Kept existing detailed local controls below each premium card for real local state actions.",
    "No fake render/export/upload/publish/provider success added.",
  ],
  tabOrder: ["Video", "Edit", "Text", "Overlays", "Effects", "MP3", "Review"],
  blocked: ["wallet", "messenger", "calls", "backend", "payments", "gifts", "monetization", "fake_publish_success", "fake_provider_ready"],
} as const;
