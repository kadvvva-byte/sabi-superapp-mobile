import { streamPremiumGiftLottieSvgRenderPlans189B } from "./streamPremiumGiftLottieSvgRenderPlan189B";

export type StreamPremiumGiftMp4WebpExportTarget189C = {
  id: string;
  displayNameRu: string;
  displayName: string;
  mp4LoopTargetFile: string;
  mp4FinaleTargetFile: string;
  webpSpriteTargetFile: string;
  posterFallbackTargetFile: string;
  litePosterFallbackTargetFile: string;
  exportTargetJsonFile: string;
  dimensionsLabel: string;
  mp4LoopDurationMs: number;
  webpSpriteFrameCount: number;
  webpSpriteGridLabel: string;
  qualityTargets: string[];
  fallbackPolicy: string[];
  exportStatusRu: string;
  deliverySafetyRu: string;
  previewOnlyNow: true;
  actualMp4FileIncludedNow: false;
  actualWebpFileIncludedNow: false;
  actualPlaybackRuntimeIncludedNow: false;
  realSendRuntimeIncludedNow: false;
  paymentRuntimeIncludedNow: false;
};

export const streamPremiumGiftMp4WebpExportTargets189C: StreamPremiumGiftMp4WebpExportTarget189C[] = streamPremiumGiftLottieSvgRenderPlans189B.map((plan, index) => ({
  id: plan.id,
  displayNameRu: plan.displayNameRu,
  displayName: plan.displayName,
  mp4LoopTargetFile: `assets/stream/gifts/production/mp4/${plan.id}-premium-loop.mp4`,
  mp4FinaleTargetFile: `assets/stream/gifts/production/mp4/${plan.id}-premium-finale.mp4`,
  webpSpriteTargetFile: `assets/stream/gifts/production/webp/${plan.id}-premium-sprite.webp`,
  posterFallbackTargetFile: `assets/stream/gifts/production/posters/${plan.id}-premium-poster.webp`,
  litePosterFallbackTargetFile: `assets/stream/gifts/production/posters/${plan.id}-lite-poster.webp`,
  exportTargetJsonFile: `assets/stream/gifts/189c-export-targets/target-json/${plan.id}-mp4-webp-export-target-189c.json`,
  dimensionsLabel: "720×720 safe-area premium overlay",
  mp4LoopDurationMs: 3000 + (index % 4) * 120,
  webpSpriteFrameCount: 36,
  webpSpriteGridLabel: "6×6 WebP sprite target · 360px frames",
  qualityTargets: ["lite", "standard", "ultra"],
  fallbackPolicy: ["poster-first", "mute-safe", "reduce-motion-safe", "low-memory-lite"],
  exportStatusRu: "MP4/WebP target plan ready · media export later",
  deliverySafetyRu: "target paths only · no actual MP4/WebP files · no playback/send/payment runtime",
  previewOnlyNow: true,
  actualMp4FileIncludedNow: false,
  actualWebpFileIncludedNow: false,
  actualPlaybackRuntimeIncludedNow: false,
  realSendRuntimeIncludedNow: false,
  paymentRuntimeIncludedNow: false,
}));

export const streamPremiumGiftMp4WebpExportTargetSummary189C = {
  stage: "189C",
  giftCount: streamPremiumGiftMp4WebpExportTargets189C.length,
  exportTargetJsonFiles: streamPremiumGiftMp4WebpExportTargets189C.length,
  mp4TargetFilesPlanned: streamPremiumGiftMp4WebpExportTargets189C.length * 2,
  webpSpriteTargetsPlanned: streamPremiumGiftMp4WebpExportTargets189C.length,
  posterFallbackTargetsPlanned: streamPremiumGiftMp4WebpExportTargets189C.length * 2,
  actualMp4FilesIncludedNow: 0,
  actualWebpFilesIncludedNow: 0,
  actualPlaybackRuntimeIncludedNow: false,
  realSendRuntimeIncludedNow: false,
  paymentRuntimeIncludedNow: false,
} as const;

export function getStreamPremiumGiftMp4WebpExportTarget189C(giftId: string): StreamPremiumGiftMp4WebpExportTarget189C {
  return streamPremiumGiftMp4WebpExportTargets189C.find((target) => target.id === giftId) ?? streamPremiumGiftMp4WebpExportTargets189C[0];
}
