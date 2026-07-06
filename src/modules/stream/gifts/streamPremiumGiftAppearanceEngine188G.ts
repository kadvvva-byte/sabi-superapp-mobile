import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";

export type StreamPremiumGiftAppearancePhaseKey188G = "entrance" | "loop" | "finale";

export type StreamPremiumGiftAppearancePhaseOption188G = {
  key: StreamPremiumGiftAppearancePhaseKey188G;
  labelRu: string;
  metaRu: string;
  durationMs: number;
};

export type StreamPremiumGiftAppearanceProfile188G = {
  assetId: string;
  packLabelRu: string;
  appearanceTitleRu: string;
  fullScreenLayerRu: string;
  entranceRu: string;
  loopRu: string;
  finaleRu: string;
  entranceDurationMs: number;
  loopDurationMs: number;
  finaleDurationMs: number;
  stageLightingRu: string;
  backgroundDimRu: string;
  particleSystemRu: string;
  motionTrailRu: string;
  recipientFocusRu: string;
  soundHitRu: string;
  hapticHitRu: string;
  luxuryMoodRu: string;
  appearanceChipsRu: readonly string[];
  fallbackCopyRu: string;
  safetyCopyRu: string;
  userFacingOnly: true;
  previewOnlyNow: true;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  providerRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  sendRuntimeEnabledNow: false;
  randomWinRuntimeEnabledNow: false;
};

export const streamPremiumGiftAppearancePhaseOptions188G: StreamPremiumGiftAppearancePhaseOption188G[] = [
  { key: "entrance", labelRu: "Entrance", metaRu: "эффектный вход", durationMs: 900 },
  { key: "loop", labelRu: "Live Loop", metaRu: "живёт на экране", durationMs: 2400 },
  { key: "finale", labelRu: "Finale", metaRu: "дорогой burst", durationMs: 800 },
];

type AppearanceDetail = Pick<StreamPremiumGiftAppearanceProfile188G, "appearanceTitleRu" | "fullScreenLayerRu" | "entranceRu" | "loopRu" | "finaleRu" | "stageLightingRu" | "backgroundDimRu" | "particleSystemRu" | "motionTrailRu" | "recipientFocusRu" | "soundHitRu" | "hapticHitRu" | "luxuryMoodRu" | "appearanceChipsRu" | "fallbackCopyRu">;

const appearanceDetailsByAssetId: Record<string, AppearanceDetail> = {
  "sakura-heart-burst": { appearanceTitleRu: "Sakura Heart Full-Screen", fullScreenLayerRu: "розовый premium bloom поверх эфира", entranceRu: "лепестки входят дугой и собирают сердце", loopRu: "сердце пульсирует в мягкой сакура-ауре", finaleRu: "лепестковый burst с мягким fade", stageLightingRu: "rose-gold soft glow", backgroundDimRu: "light dim 18%", particleSystemRu: "sakura petals + tiny heart sparks", motionTrailRu: "soft petal trail", recipientFocusRu: "creator halo highlight", soundHitRu: "gentle chime", hapticHitRu: "soft tap", luxuryMoodRu: "warm anime support", appearanceChipsRu: ["petals", "heart pulse", "soft glow"], fallbackCopyRu: "reduce motion: статичный heart poster с лёгкой аурой" },
  "koi-luck-splash": { appearanceTitleRu: "Koi Luck Wave", fullScreenLayerRu: "aqua wave слой вокруг чата", entranceRu: "карп делает водную дугу снизу вверх", loopRu: "водные кольца и luck sparkle держатся на сцене", finaleRu: "маленький splash burst и sparkle fade", stageLightingRu: "aqua shine", backgroundDimRu: "cool dim 16%", particleSystemRu: "water rings + luck sparks", motionTrailRu: "koi water trail", recipientFocusRu: "stream host water-ring focus", soundHitRu: "water bell", hapticHitRu: "pulse", luxuryMoodRu: "lucky premium", appearanceChipsRu: ["water rings", "koi arc", "luck sparkle"], fallbackCopyRu: "lite mode: poster + water-ring shimmer" },
  "neon-fox-tail": { appearanceTitleRu: "Neon Fox Tail Strike", fullScreenLayerRu: "неоновый diagonal sweep", entranceRu: "хвост лиса прорезает экран неоновым следом", loopRu: "fox aura мерцает рядом с получателем", finaleRu: "electric fox-snap burst", stageLightingRu: "purple neon", backgroundDimRu: "night dim 24%", particleSystemRu: "neon sparks + tail echo", motionTrailRu: "fast neon tail", recipientFocusRu: "sharp creator edge light", soundHitRu: "synth snap", hapticHitRu: "crisp tap", luxuryMoodRu: "cyber anime", appearanceChipsRu: ["neon trail", "fox aura", "electric snap"], fallbackCopyRu: "reduce motion: static neon fox poster" },
  "moon-cat-guard": { appearanceTitleRu: "Moon Cat Guardian", fullScreenLayerRu: "лунный halo слой", entranceRu: "луна поднимается за аватаром автора", loopRu: "кот-страж моргает в мягком orbit", finaleRu: "star dust закрывает сцену", stageLightingRu: "moon silver", backgroundDimRu: "calm dim 20%", particleSystemRu: "star dust + lunar halo", motionTrailRu: "slow orbit", recipientFocusRu: "moon guard ring", soundHitRu: "night bell", hapticHitRu: "gentle ripple", luxuryMoodRu: "calm premium", appearanceChipsRu: ["moon halo", "cat blink", "star dust"], fallbackCopyRu: "lite mode: moon poster + star shimmer" },
  "dj-star-drop": { appearanceTitleRu: "DJ Star Drop Stage", fullScreenLayerRu: "beat pulse overlay", entranceRu: "звезда падает в центр и раскрывает beat rings", loopRu: "equalizer glow держит ритм", finaleRu: "короткий flash на downbeat", stageLightingRu: "club gold", backgroundDimRu: "stage dim 22%", particleSystemRu: "music stars + beat rings", motionTrailRu: "rhythm pulse", recipientFocusRu: "beat spotlight", soundHitRu: "short EDM cue", hapticHitRu: "beat tick", luxuryMoodRu: "music premium", appearanceChipsRu: ["beat pulse", "equalizer", "star drop"], fallbackCopyRu: "muted mode: visual beat rings only" },
  "golden-lion-roar": { appearanceTitleRu: "Golden Lion Royal Roar", fullScreenLayerRu: "золотая royal aura", entranceRu: "герб льва раскрывается золотыми лучами", loopRu: "корона и грива дают premium shimmer", finaleRu: "royal roar flare", stageLightingRu: "gold spotlight", backgroundDimRu: "royal dim 28%", particleSystemRu: "gold rays + crown sparks", motionTrailRu: "lion crest trail", recipientFocusRu: "gold creator spotlight", soundHitRu: "soft roar hit", hapticHitRu: "strong impact", luxuryMoodRu: "royal premium", appearanceChipsRu: ["gold flare", "crown sparks", "roar aura"], fallbackCopyRu: "lite mode: lion crest poster + gold glow" },
  "royal-rose-stage": { appearanceTitleRu: "Royal Rose Curtain", fullScreenLayerRu: "velvet rose stage", entranceRu: "занавес открывает королевскую розу", loopRu: "лепестки медленно вращаются вокруг сцены", finaleRu: "rose bloom burst", stageLightingRu: "velvet red", backgroundDimRu: "romantic dim 20%", particleSystemRu: "rose petals + velvet sparkles", motionTrailRu: "petal curtain", recipientFocusRu: "rose spotlight", soundHitRu: "romantic sting", hapticHitRu: "elegant pulse", luxuryMoodRu: "romantic luxury", appearanceChipsRu: ["curtain", "rose bloom", "velvet aura"], fallbackCopyRu: "reduce motion: rose poster + petal frame" },
  "cosmic-dragon-gate": { appearanceTitleRu: "Cosmic Dragon Gate", fullScreenLayerRu: "cosmic portal full-screen", entranceRu: "портал открывается за аватаром", loopRu: "дракон проходит силуэтом через gate", finaleRu: "comet burst закрывает сцену", stageLightingRu: "cosmic violet", backgroundDimRu: "space dim 32%", particleSystemRu: "stars + comet dust + portal sparks", motionTrailRu: "dragon comet trail", recipientFocusRu: "portal halo", soundHitRu: "deep cosmic hit", hapticHitRu: "finale impact", luxuryMoodRu: "mythic premium", appearanceChipsRu: ["portal", "dragon trail", "comet burst"], fallbackCopyRu: "lite mode: dragon gate poster + cosmic glow" },
  "phoenix-crown-burst": { appearanceTitleRu: "Phoenix Crown Rebirth", fullScreenLayerRu: "fire crown full-screen", entranceRu: "феникс поднимается золотым крылом", loopRu: "корона горит в мягкой royal ауре", finaleRu: "phoenix crown burst", stageLightingRu: "fire gold", backgroundDimRu: "warm dim 30%", particleSystemRu: "feather sparks + crown fire", motionTrailRu: "phoenix wing trail", recipientFocusRu: "crown focus ring", soundHitRu: "fire crown hit", hapticHitRu: "strong rise", luxuryMoodRu: "ultra crown", appearanceChipsRu: ["phoenix", "crown", "fire aura"], fallbackCopyRu: "reduce motion: crown poster + feather shimmer" },
  "crystal-whale-wave": { appearanceTitleRu: "Crystal Whale Wave", fullScreenLayerRu: "large crystal wave", entranceRu: "кит всплывает сквозь crystal mist", loopRu: "волна держит спокойный premium glow", finaleRu: "crystal splash sparkle", stageLightingRu: "ice blue", backgroundDimRu: "aqua dim 22%", particleSystemRu: "crystal mist + whale sparkle", motionTrailRu: "slow wave trail", recipientFocusRu: "aqua focus wave", soundHitRu: "deep water bell", hapticHitRu: "slow pulse", luxuryMoodRu: "calm ultra", appearanceChipsRu: ["whale", "crystal", "wave"], fallbackCopyRu: "lite mode: whale poster + mist shimmer" },
  "cyber-panda-beat": { appearanceTitleRu: "Cyber Panda Beat", fullScreenLayerRu: "cyber equalizer stage", entranceRu: "панда прыгает через beat frame", loopRu: "equalizer cubes работают в такт", finaleRu: "pixel beat burst", stageLightingRu: "cyber green", backgroundDimRu: "club dim 22%", particleSystemRu: "pixels + beat cubes", motionTrailRu: "panda beat trail", recipientFocusRu: "equalizer spotlight", soundHitRu: "cute beat cue", hapticHitRu: "rhythm tap", luxuryMoodRu: "cute cyber", appearanceChipsRu: ["panda", "beat", "pixels"], fallbackCopyRu: "muted mode: pixel equalizer only" },
  "velvet-butterfly-storm": { appearanceTitleRu: "Velvet Butterfly Storm", fullScreenLayerRu: "soft butterfly storm", entranceRu: "бабочки раскрывают velvet frame", loopRu: "крылья мерцают вокруг подарка", finaleRu: "butterfly bloom fade", stageLightingRu: "velvet pink", backgroundDimRu: "soft dim 18%", particleSystemRu: "butterflies + velvet dust", motionTrailRu: "wing trail", recipientFocusRu: "butterfly ring", soundHitRu: "velvet sparkle", hapticHitRu: "soft flutter", luxuryMoodRu: "soft anime", appearanceChipsRu: ["butterfly", "velvet", "flutter"], fallbackCopyRu: "reduce motion: butterfly poster + soft frame" },
  "thunder-tiger-flash": { appearanceTitleRu: "Thunder Tiger Flash", fullScreenLayerRu: "thunder impact layer", entranceRu: "тигр входит молнией слева", loopRu: "полосы электричества держатся на сцене", finaleRu: "thunder flash burst", stageLightingRu: "electric yellow", backgroundDimRu: "impact dim 30%", particleSystemRu: "lightning shards + tiger sparks", motionTrailRu: "tiger flash trail", recipientFocusRu: "lightning focus", soundHitRu: "thunder clap", hapticHitRu: "sharp impact", luxuryMoodRu: "impact premium", appearanceChipsRu: ["tiger", "thunder", "flash"], fallbackCopyRu: "lite mode: tiger poster + lightning rim" },
  "aurora-unicorn-ride": { appearanceTitleRu: "Aurora Unicorn Ride", fullScreenLayerRu: "aurora rainbow scene", entranceRu: "единорог выходит из aurora gate", loopRu: "радуга держит magic trail", finaleRu: "aurora stardust burst", stageLightingRu: "rainbow aurora", backgroundDimRu: "magic dim 20%", particleSystemRu: "aurora dust + star rings", motionTrailRu: "unicorn rainbow trail", recipientFocusRu: "rainbow focus halo", soundHitRu: "magic bell", hapticHitRu: "rising pulse", luxuryMoodRu: "magical premium", appearanceChipsRu: ["aurora", "unicorn", "rainbow"], fallbackCopyRu: "reduce motion: unicorn poster + aurora glow" },
  "diamond-genie-lamp": { appearanceTitleRu: "Diamond Genie Wish", fullScreenLayerRu: "diamond smoke stage", entranceRu: "лампа открывает diamond smoke", loopRu: "джинн держит wish aura", finaleRu: "diamond wish burst", stageLightingRu: "diamond violet", backgroundDimRu: "premium dim 26%", particleSystemRu: "diamond dust + lamp smoke", motionTrailRu: "smoke trail", recipientFocusRu: "diamond focus frame", soundHitRu: "wish shimmer", hapticHitRu: "luxury pulse", luxuryMoodRu: "expensive wish", appearanceChipsRu: ["diamond", "genie", "wish"], fallbackCopyRu: "lite mode: genie lamp poster + diamond smoke" },
  "galaxy-idol-stage": { appearanceTitleRu: "Galaxy Idol Stage", fullScreenLayerRu: "idol concert overlay", entranceRu: "idol lights open in galaxy arc", loopRu: "stage beams move behind gift", finaleRu: "idol star finale", stageLightingRu: "galaxy concert", backgroundDimRu: "stage dim 24%", particleSystemRu: "idol stars + beam dots", motionTrailRu: "stage beam trail", recipientFocusRu: "concert spotlight", soundHitRu: "idol hit cue", hapticHitRu: "stage beat", luxuryMoodRu: "showcase premium", appearanceChipsRu: ["idol", "galaxy", "stage"], fallbackCopyRu: "muted mode: stage poster + light beams" },
};

function buildAppearanceRows(): StreamPremiumGiftAppearanceProfile188G[] {
  const pack1 = streamPremiumGiftPack187A.map((gift) => ({ gift, packLabelRu: "Pack 1 · Classic Anime" }));
  const pack2 = streamPremiumGiftPack188A.map((gift) => ({ gift, packLabelRu: "Pack 2 · Ultra Stage" }));
  return [...pack1, ...pack2].map(({ gift, packLabelRu }) => {
    const detail = appearanceDetailsByAssetId[gift.id];
    return {
      assetId: gift.id,
      packLabelRu,
      appearanceTitleRu: detail.appearanceTitleRu,
      fullScreenLayerRu: detail.fullScreenLayerRu,
      entranceRu: detail.entranceRu,
      loopRu: detail.loopRu,
      finaleRu: detail.finaleRu,
      entranceDurationMs: 900,
      loopDurationMs: 2400,
      finaleDurationMs: 800,
      stageLightingRu: detail.stageLightingRu,
      backgroundDimRu: detail.backgroundDimRu,
      particleSystemRu: detail.particleSystemRu,
      motionTrailRu: detail.motionTrailRu,
      recipientFocusRu: detail.recipientFocusRu,
      soundHitRu: detail.soundHitRu,
      hapticHitRu: detail.hapticHitRu,
      luxuryMoodRu: detail.luxuryMoodRu,
      appearanceChipsRu: detail.appearanceChipsRu,
      fallbackCopyRu: detail.fallbackCopyRu,
      safetyCopyRu: "On-screen appearance сейчас только локальный preview: без оплаты, без реальной отправки, без backend/provider/payout и без autoplay audio.",
      userFacingOnly: true,
      previewOnlyNow: true,
      backendRuntimeEnabledNow: false,
      paymentRuntimeEnabledNow: false,
      providerRuntimeEnabledNow: false,
      payoutRuntimeEnabledNow: false,
      sendRuntimeEnabledNow: false,
      randomWinRuntimeEnabledNow: false,
    };
  });
}

export const streamPremiumGiftAppearanceProfiles188G = buildAppearanceRows();

export const streamPremiumGiftAppearanceEngineSummary188G = {
  version: "STREAM-GAME-GIFTS-188G",
  totalGifts: streamPremiumGiftAppearanceProfiles188G.length,
  phases: streamPremiumGiftAppearancePhaseOptions188G.length,
  fullScreenAppearanceLayerPlanned: true,
  previewOnlyNow: true,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  randomWinRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftAppearanceProfile188G(assetId: string): StreamPremiumGiftAppearanceProfile188G {
  return streamPremiumGiftAppearanceProfiles188G.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftAppearanceProfiles188G[0];
}
