export const STREAM_113J_PRODUCT_LANGUAGE_HIERARCHY_UIUX_PLAN = {
  version: "STREAM-113J",
  title: "Product language / hierarchy UI/UX cleanup",
  scope: "Stream live room mobile UI only",
  goals: [
    "Turn the live room settings into product language instead of QA/debug wording.",
    "Polish hero copy, primary action, hierarchy, phone spacing, and safe provider boundary text.",
    "Keep technical evidence hidden by default while preserving honest no-fake provider/realtime/payment rules."
  ],
  forbidden: [
    "fake live",
    "fake realtime",
    "fake provider",
    "fake payments",
    "cinema/series/anime mixing",
    "Wallet/Messenger/AI changes"
  ],
  mobileFiles: [
    "src/modules/stream/mobile/StreamRoomRuntimePanel.tsx",
    "src/modules/stream/mobile/stream113jProductLanguageHierarchyUiuxRuntime.ts"
  ],
  cumulativeFrom: ["112N", "113A", "113B", "113C", "113D", "113E", "113F", "113G", "113H", "113I", "113I-FIX1"]
} as const;
