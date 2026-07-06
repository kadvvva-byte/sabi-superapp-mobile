import { streamPremiumGiftAppearanceProfiles188G } from "./streamPremiumGiftAppearanceEngine188G";

export type StreamPremiumGiftVisualFxProfile188H = {
  assetId: string;
  visualFxTitleRu: string;
  primaryGlowRu: string;
  particleBurstRu: string;
  motionTrailRu: string;
  auraRu: string;
  screenImpactRu: string;
  finaleBurstRu: string;
  luxuryLightingRu: string;
  overlayDepthRu: string;
  particleDensityLabel: string;
  glowIntensityLabel: string;
  burstScaleLabel: string;
  trailDurationMs: number;
  auraPulseMs: number;
  premiumFxScore: number;
  fxChipsRu: readonly string[];
  fallbackCopyRu: string;
  safetyCopyRu: string;
  userFacingOnly: true;
  previewOnlyNow: true;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  sendRuntimeEnabledNow: false;
  actualAnimationRuntimeEnabledNow: false;
  actualSoundAutoplayEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

type VisualFxDetail188H = Omit<StreamPremiumGiftVisualFxProfile188H, "assetId" | "safetyCopyRu" | "userFacingOnly" | "previewOnlyNow" | "backendRuntimeEnabledNow" | "paymentRuntimeEnabledNow" | "providerRuntimeEnabledNow" | "payoutRuntimeEnabledNow" | "sendRuntimeEnabledNow" | "actualAnimationRuntimeEnabledNow" | "actualSoundAutoplayEnabledNow" | "randomWinRuntimeEnabledNow">;

const visualFxDetailsByAssetId188H: Record<string, VisualFxDetail188H> = {
  "sakura-heart-burst": { visualFxTitleRu: "Sakura Luxury Bloom FX", primaryGlowRu: "rose-gold bloom glow", particleBurstRu: "лепестки + heart spark burst", motionTrailRu: "мягкий лепестковый след", auraRu: "сердцевая aura вокруг получателя", screenImpactRu: "экран мягко раскрывается розовым светом", finaleBurstRu: "petal rain finale", luxuryLightingRu: "soft anime rose spotlight", overlayDepthRu: "front petals + back bloom + creator halo", particleDensityLabel: "dense petals", glowIntensityLabel: "soft ultra", burstScaleLabel: "wide bloom", trailDurationMs: 1500, auraPulseMs: 920, premiumFxScore: 94, fxChipsRu: ["rose glow", "petal burst", "heart aura"], fallbackCopyRu: "lite: static sakura poster + soft rose aura" },
  "koi-luck-splash": { visualFxTitleRu: "Koi Water Fortune FX", primaryGlowRu: "aqua luck glow", particleBurstRu: "water rings + coin sparkles", motionTrailRu: "koi wave trail", auraRu: "водная luck aura", screenImpactRu: "нижняя волна поднимает подарок", finaleBurstRu: "splash sparkle finale", luxuryLightingRu: "aqua-gold premium reflection", overlayDepthRu: "wave foreground + ring middle + sparkle back", particleDensityLabel: "medium water", glowIntensityLabel: "aqua bright", burstScaleLabel: "ring burst", trailDurationMs: 1700, auraPulseMs: 1100, premiumFxScore: 92, fxChipsRu: ["water rings", "luck shine", "koi arc"], fallbackCopyRu: "lite: koi poster + water shimmer" },
  "neon-fox-tail": { visualFxTitleRu: "Neon Fox Cyber FX", primaryGlowRu: "purple neon glow", particleBurstRu: "electric sparks + tail fragments", motionTrailRu: "diagonal fox tail trail", auraRu: "cyber fox aura", screenImpactRu: "неоновый slash проходит по экрану", finaleBurstRu: "electric snap finale", luxuryLightingRu: "night club violet beams", overlayDepthRu: "trail foreground + fox aura + cyber grid", particleDensityLabel: "sharp sparks", glowIntensityLabel: "neon ultra", burstScaleLabel: "fast slash", trailDurationMs: 1350, auraPulseMs: 760, premiumFxScore: 95, fxChipsRu: ["neon slash", "fox aura", "electric sparks"], fallbackCopyRu: "lite: neon fox poster + static cyber rim" },
  "moon-cat-guard": { visualFxTitleRu: "Moon Cat Guardian FX", primaryGlowRu: "silver moon glow", particleBurstRu: "star dust + moon motes", motionTrailRu: "slow lunar orbit", auraRu: "лунный guard halo", screenImpactRu: "moon halo softly opens behind receiver", finaleBurstRu: "star dust curtain", luxuryLightingRu: "silver-blue calm stage", overlayDepthRu: "moon back layer + cat silhouette + stars", particleDensityLabel: "soft stars", glowIntensityLabel: "calm glow", burstScaleLabel: "small curtain", trailDurationMs: 2200, auraPulseMs: 1400, premiumFxScore: 90, fxChipsRu: ["moon halo", "star dust", "cat guard"], fallbackCopyRu: "lite: moon cat poster + small star shimmer" },
  "dj-star-drop": { visualFxTitleRu: "DJ Star Beat FX", primaryGlowRu: "club gold beat glow", particleBurstRu: "music stars + equalizer pixels", motionTrailRu: "rhythmic pulse trail", auraRu: "beat aura around gift", screenImpactRu: "star drops on beat and lights stage", finaleBurstRu: "downbeat flash finale", luxuryLightingRu: "gold club strobes", overlayDepthRu: "star front + equalizer back + spotlight", particleDensityLabel: "beat particles", glowIntensityLabel: "flashy gold", burstScaleLabel: "stage flash", trailDurationMs: 1200, auraPulseMs: 560, premiumFxScore: 91, fxChipsRu: ["beat rings", "equalizer", "star flash"], fallbackCopyRu: "muted: visual equalizer + star poster" },
  "golden-lion-roar": { visualFxTitleRu: "Golden Lion Royal FX", primaryGlowRu: "royal gold glow", particleBurstRu: "crown sparks + gold rays", motionTrailRu: "lion crest trail", auraRu: "royal roar aura", screenImpactRu: "gold crest expands across screen", finaleBurstRu: "crown flare finale", luxuryLightingRu: "gold palace spotlight", overlayDepthRu: "crest foreground + rays + crown sparks", particleDensityLabel: "dense gold", glowIntensityLabel: "royal ultra", burstScaleLabel: "large crest", trailDurationMs: 1600, auraPulseMs: 880, premiumFxScore: 97, fxChipsRu: ["gold rays", "crown sparks", "roar flare"], fallbackCopyRu: "lite: lion crest poster + gold rim" },
  "royal-rose-stage": { visualFxTitleRu: "Royal Rose Velvet FX", primaryGlowRu: "velvet red glow", particleBurstRu: "rose petals + velvet sparks", motionTrailRu: "curtain petal trail", auraRu: "romantic rose aura", screenImpactRu: "velvet curtain opens on stream", finaleBurstRu: "rose bloom finale", luxuryLightingRu: "red carpet spotlight", overlayDepthRu: "curtain front + rose middle + spark back", particleDensityLabel: "velvet petals", glowIntensityLabel: "elegant red", burstScaleLabel: "bloom curtain", trailDurationMs: 1900, auraPulseMs: 1050, premiumFxScore: 93, fxChipsRu: ["velvet", "rose bloom", "curtain"], fallbackCopyRu: "lite: rose poster + petal frame" },
  "cosmic-dragon-gate": { visualFxTitleRu: "Cosmic Dragon Portal FX", primaryGlowRu: "cosmic violet glow", particleBurstRu: "stars + comet shards + portal sparks", motionTrailRu: "dragon comet trail", auraRu: "portal aura around receiver", screenImpactRu: "cosmic gate opens full-screen", finaleBurstRu: "comet portal finale", luxuryLightingRu: "mythic violet beams", overlayDepthRu: "portal back + dragon trail + comet front", particleDensityLabel: "dense cosmic", glowIntensityLabel: "mythic ultra", burstScaleLabel: "portal burst", trailDurationMs: 2400, auraPulseMs: 1180, premiumFxScore: 99, fxChipsRu: ["portal", "dragon trail", "comet burst"], fallbackCopyRu: "lite: dragon gate poster + cosmic rim" },
  "phoenix-crown-burst": { visualFxTitleRu: "Phoenix Crown Flame FX", primaryGlowRu: "fire-gold glow", particleBurstRu: "feather sparks + crown flames", motionTrailRu: "phoenix wing trail", auraRu: "crown rebirth aura", screenImpactRu: "phoenix wing lifts the whole stage", finaleBurstRu: "rebirth crown flare", luxuryLightingRu: "royal fire spotlight", overlayDepthRu: "feathers front + crown + fire haze", particleDensityLabel: "dense feathers", glowIntensityLabel: "fire ultra", burstScaleLabel: "crown flare", trailDurationMs: 1800, auraPulseMs: 900, premiumFxScore: 98, fxChipsRu: ["phoenix", "crown", "fire"], fallbackCopyRu: "lite: phoenix crown poster + ember glow" },
  "crystal-whale-wave": { visualFxTitleRu: "Crystal Whale Ocean FX", primaryGlowRu: "ice-blue crystal glow", particleBurstRu: "crystal mist + whale sparkles", motionTrailRu: "slow wave trail", auraRu: "ocean crystal aura", screenImpactRu: "crystal wave washes over the stream", finaleBurstRu: "ice splash finale", luxuryLightingRu: "aqua crystal stage", overlayDepthRu: "wave front + whale shadow + mist", particleDensityLabel: "soft crystal", glowIntensityLabel: "cool bright", burstScaleLabel: "wide wave", trailDurationMs: 2600, auraPulseMs: 1300, premiumFxScore: 93, fxChipsRu: ["crystal", "whale", "wave"], fallbackCopyRu: "lite: whale poster + blue shimmer" },
  "cyber-panda-beat": { visualFxTitleRu: "Cyber Panda Beat FX", primaryGlowRu: "cyber green glow", particleBurstRu: "pixels + beat cubes", motionTrailRu: "panda jump trail", auraRu: "equalizer aura", screenImpactRu: "beat frame pops into stream", finaleBurstRu: "pixel beat pop", luxuryLightingRu: "green cyber club", overlayDepthRu: "pixels front + cubes + equalizer", particleDensityLabel: "pixel dense", glowIntensityLabel: "cyber bright", burstScaleLabel: "beat pop", trailDurationMs: 1100, auraPulseMs: 500, premiumFxScore: 90, fxChipsRu: ["pixels", "beat", "panda"], fallbackCopyRu: "muted: pixel poster + equalizer glow" },
  "velvet-butterfly-storm": { visualFxTitleRu: "Velvet Butterfly Storm FX", primaryGlowRu: "velvet pink glow", particleBurstRu: "butterflies + rose dust", motionTrailRu: "wing trail", auraRu: "butterfly halo", screenImpactRu: "butterfly frame opens around creator", finaleBurstRu: "butterfly bloom finale", luxuryLightingRu: "pink velvet spotlight", overlayDepthRu: "wings front + velvet haze + spark back", particleDensityLabel: "butterfly swarm", glowIntensityLabel: "soft pink", burstScaleLabel: "wing bloom", trailDurationMs: 2100, auraPulseMs: 980, premiumFxScore: 92, fxChipsRu: ["butterflies", "velvet", "bloom"], fallbackCopyRu: "lite: butterfly poster + soft frame" },
  "thunder-tiger-flash": { visualFxTitleRu: "Thunder Tiger Impact FX", primaryGlowRu: "electric yellow glow", particleBurstRu: "lightning shards + tiger sparks", motionTrailRu: "tiger flash trail", auraRu: "thunder aura", screenImpactRu: "lightning stripe splits the screen", finaleBurstRu: "thunder flash finale", luxuryLightingRu: "electric stage hit", overlayDepthRu: "lightning front + tiger silhouette + sparks", particleDensityLabel: "sharp lightning", glowIntensityLabel: "impact ultra", burstScaleLabel: "screen flash", trailDurationMs: 1000, auraPulseMs: 520, premiumFxScore: 96, fxChipsRu: ["thunder", "tiger", "impact"], fallbackCopyRu: "lite: tiger poster + lightning rim" },
  "aurora-unicorn-ride": { visualFxTitleRu: "Aurora Unicorn Magic FX", primaryGlowRu: "aurora rainbow glow", particleBurstRu: "stardust + rainbow rings", motionTrailRu: "unicorn rainbow trail", auraRu: "magic aurora aura", screenImpactRu: "aurora gate opens softly", finaleBurstRu: "rainbow star finale", luxuryLightingRu: "rainbow premium wash", overlayDepthRu: "aurora back + unicorn trail + stars", particleDensityLabel: "magic dust", glowIntensityLabel: "rainbow soft", burstScaleLabel: "aurora wide", trailDurationMs: 2300, auraPulseMs: 1250, premiumFxScore: 94, fxChipsRu: ["aurora", "unicorn", "stars"], fallbackCopyRu: "lite: unicorn poster + aurora rim" },
  "diamond-genie-lamp": { visualFxTitleRu: "Diamond Genie Wish FX", primaryGlowRu: "diamond violet glow", particleBurstRu: "diamond dust + lamp smoke", motionTrailRu: "genie smoke trail", auraRu: "wish aura", screenImpactRu: "lamp smoke fills premium stage", finaleBurstRu: "diamond wish finale", luxuryLightingRu: "violet diamond spotlight", overlayDepthRu: "smoke front + diamonds + lamp back", particleDensityLabel: "diamond dust", glowIntensityLabel: "luxury violet", burstScaleLabel: "wish burst", trailDurationMs: 2000, auraPulseMs: 1000, premiumFxScore: 97, fxChipsRu: ["diamond", "genie", "wish"], fallbackCopyRu: "lite: genie poster + diamond smoke" },
  "galaxy-idol-stage": { visualFxTitleRu: "Galaxy Idol Concert FX", primaryGlowRu: "galaxy stage glow", particleBurstRu: "idol stars + light beams", motionTrailRu: "concert beam trail", auraRu: "idol spotlight aura", screenImpactRu: "concert lights open around stream", finaleBurstRu: "idol star finale", luxuryLightingRu: "galaxy concert beams", overlayDepthRu: "beams back + idol stars + front flare", particleDensityLabel: "stage stars", glowIntensityLabel: "concert ultra", burstScaleLabel: "stage finale", trailDurationMs: 1700, auraPulseMs: 620, premiumFxScore: 95, fxChipsRu: ["idol", "galaxy", "concert"], fallbackCopyRu: "muted: idol poster + stage lights" },
};

export const streamPremiumGiftVisualFxProfiles188H: StreamPremiumGiftVisualFxProfile188H[] = streamPremiumGiftAppearanceProfiles188G.map((appearance) => {
  const detail = visualFxDetailsByAssetId188H[appearance.assetId];
  return {
    assetId: appearance.assetId,
    ...detail,
    safetyCopyRu: "Visual FX сейчас работает как дорогой local preview layer: без backend, оплаты, реальной отправки, payout, provider, autoplay audio и random win.",
    userFacingOnly: true,
    previewOnlyNow: true,
    backendRuntimeEnabledNow: false,
    paymentRuntimeEnabledNow: false,
    providerRuntimeEnabledNow: false,
    payoutRuntimeEnabledNow: false,
    sendRuntimeEnabledNow: false,
    actualAnimationRuntimeEnabledNow: false,
    actualSoundAutoplayEnabledNow: false,
    randomWinRuntimeEnabledNow: false,
  };
});

export const streamPremiumGiftVisualFxSummary188H = {
  version: "STREAM-GAME-GIFTS-188H",
  totalGifts: streamPremiumGiftVisualFxProfiles188H.length,
  visualFxProfiles: streamPremiumGiftVisualFxProfiles188H.length,
  includesParticles: true,
  includesGlow: true,
  includesBurst: true,
  includesTrail: true,
  includesAura: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  providerRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  actualAnimationRuntimeEnabledNow: false,
  actualSoundAutoplayEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftVisualFxProfile188H(assetId: string): StreamPremiumGiftVisualFxProfile188H {
  return streamPremiumGiftVisualFxProfiles188H.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftVisualFxProfiles188H[0];
}
