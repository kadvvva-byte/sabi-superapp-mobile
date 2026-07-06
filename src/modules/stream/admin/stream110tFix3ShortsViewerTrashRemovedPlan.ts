export const stream110tFix3ShortsViewerTrashRemovedPlan = {
  version: "110T-FIX3",
  title: "Shorts viewer trash card removed",
  scope: "mobile-stream-shorts-only",
  changedBehavior: [
    "Main Shorts viewer screen keeps only the right rail actions",
    "Settings remains visible on the right rail",
    "Bottom Shorts viewer dock, progress chips, smoke bar and settings notice are removed from the main viewer screen",
    "Video/source/edit/effects/MP3 tools remain inside Settings only",
  ],
  blocked: [
    "backend upload",
    "CDN/storage success",
    "fake publish success",
    "wallet",
    "messenger",
    "calls",
    "payments",
  ],
} as const;
