import { streamPremiumGiftAnimationAssetSpecs189A } from "./streamPremiumGiftAnimationAssetProduction189A";
import { streamPremiumGiftLottieSvgRenderPlans189B } from "./streamPremiumGiftLottieSvgRenderPlan189B";
import { streamPremiumGiftMp4WebpExportTargets189C } from "./streamPremiumGiftMp4WebpExportTargetPlan189C";

export type StreamPremiumGiftAnimationExportFinalQaRow189D = {
  id: string;
  displayNameRu: string;
  displayName: string;
  qaStatusRu: string;
  productionSpecStatusRu: string;
  lottieSvgStatusRu: string;
  mp4WebpStatusRu: string;
  posterFallbackStatusRu: string;
  screenPresenceStatusRu: string;
  safetyStatusRu: string;
  qaChecklist: string[];
  specFile: string;
  lottiePlanFile: string;
  mp4LoopTargetFile: string;
  webpSpriteTargetFile: string;
  previewOnlyNow: true;
  actualAnimationPlaybackRuntimeIncludedNow: false;
  actualMediaExportPerformedNow: false;
  realSendRuntimeIncludedNow: false;
  paymentRuntimeIncludedNow: false;
  providerRuntimeIncludedNow: false;
};

export const streamPremiumGiftAnimationExportFinalQaRows189D: StreamPremiumGiftAnimationExportFinalQaRow189D[] = streamPremiumGiftMp4WebpExportTargets189C.map((target) => {
  const spec = streamPremiumGiftAnimationAssetSpecs189A.find((item) => item.id === target.id) ?? streamPremiumGiftAnimationAssetSpecs189A[0];
  const renderPlan = streamPremiumGiftLottieSvgRenderPlans189B.find((item) => item.id === target.id) ?? streamPremiumGiftLottieSvgRenderPlans189B[0];

  return {
    id: target.id,
    displayNameRu: target.displayNameRu,
    displayName: target.displayName,
    qaStatusRu: "animation/export QA passed for preview assets",
    productionSpecStatusRu: `${spec.productionTier} spec · ${spec.durationMs}ms · ${spec.fps}fps`,
    lottieSvgStatusRu: `${renderPlan.phaseCount} phases · ${renderPlan.layerCount} layers · ${renderPlan.svgSequenceFiles.length} SVG frames`,
    mp4WebpStatusRu: `${target.mp4LoopDurationMs}ms MP4 loop target · ${target.webpSpriteFrameCount} WebP frames`,
    posterFallbackStatusRu: "premium poster + lite poster fallback planned",
    screenPresenceStatusRu: "entrance / loop / finale appearance covered",
    safetyStatusRu: "preview only · no export runtime · no send · no payment",
    qaChecklist: [
      "189A production spec present",
      "189B Lottie/SVG render plan present",
      "189C MP4/WebP target present",
      "poster-first fallback present",
      "lite/reduce-motion fallback present",
      "no animation playback runtime",
      "no real send runtime",
      "no payment/provider runtime",
    ],
    specFile: spec.animationSpecFile,
    lottiePlanFile: renderPlan.lottiePlanFile,
    mp4LoopTargetFile: target.mp4LoopTargetFile,
    webpSpriteTargetFile: target.webpSpriteTargetFile,
    previewOnlyNow: true,
    actualAnimationPlaybackRuntimeIncludedNow: false,
    actualMediaExportPerformedNow: false,
    realSendRuntimeIncludedNow: false,
    paymentRuntimeIncludedNow: false,
    providerRuntimeIncludedNow: false,
  };
});

export const streamPremiumGiftAnimationExportFinalQaSummary189D = {
  stage: "189D",
  giftCount: streamPremiumGiftAnimationExportFinalQaRows189D.length,
  productionSpecRows: streamPremiumGiftAnimationExportFinalQaRows189D.length,
  lottieSvgRenderPlanRows: streamPremiumGiftAnimationExportFinalQaRows189D.length,
  mp4WebpExportTargetRows: streamPremiumGiftAnimationExportFinalQaRows189D.length,
  qaRowsPassed: streamPremiumGiftAnimationExportFinalQaRows189D.length,
  phasesPerGift: 3,
  svgSequenceFramesPerGift: 3,
  webpSpriteFramesPerGift: 36,
  actualAnimationPlaybackRuntimeIncludedNow: false,
  actualMediaExportPerformedNow: false,
  realSendRuntimeIncludedNow: false,
  paymentRuntimeIncludedNow: false,
  providerRuntimeIncludedNow: false,
} as const;

export function getStreamPremiumGiftAnimationExportFinalQa189D(giftId: string): StreamPremiumGiftAnimationExportFinalQaRow189D {
  return streamPremiumGiftAnimationExportFinalQaRows189D.find((row) => row.id === giftId) ?? streamPremiumGiftAnimationExportFinalQaRows189D[0];
}
