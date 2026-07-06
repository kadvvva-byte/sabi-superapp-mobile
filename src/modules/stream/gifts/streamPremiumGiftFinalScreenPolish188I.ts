import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { getStreamPremiumGiftEffectProfile187B } from "./streamPremiumGiftEffects187B";
import { getStreamPremiumGiftAppearanceProfile188G } from "./streamPremiumGiftAppearanceEngine188G";
import { getStreamPremiumGiftVisualFxProfile188H } from "./streamPremiumGiftVisualFxPack188H";

export type StreamPremiumGiftFinalScreenPolish188I = {
  assetId: string;
  finalScreenTitleRu: string;
  premiumImpactRu: string;
  soundSignatureRu: string;
  hapticSignatureRu: string;
  timingSignatureRu: string;
  finaleCloseRu: string;
  recipientFocusRu: string;
  crowdMomentRu: string;
  reduceMotionFallbackRu: string;
  soundPreviewRuntimeEnabledNow: false;
  realGiftSendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  payoutRuntimeEnabledNow: false;
  backendRuntimeEnabledNow: false;
};

type FinalPolishSeed = Omit<StreamPremiumGiftFinalScreenPolish188I,
  "soundPreviewRuntimeEnabledNow" |
  "realGiftSendRuntimeEnabledNow" |
  "paymentRuntimeEnabledNow" |
  "payoutRuntimeEnabledNow" |
  "backendRuntimeEnabledNow"
>;

const finalScreenPolishSeeds188I: Record<string, FinalPolishSeed> = {
  "sakura-heart-burst": {
    assetId: "sakura-heart-burst",
    finalScreenTitleRu: "Сакура Сердце · мягкий премиум финал",
    premiumImpactRu: "розовый bloom, лепестки проходят через центр эфира и раскрывают сердце",
    soundSignatureRu: "soft chime + petal shimmer, 1.1s label only",
    hapticSignatureRu: "soft tap → gentle pulse → tiny finale",
    timingSignatureRu: "0.25s entrance · 1.4s loop · 0.55s finale",
    finaleCloseRu: "сердце растворяется в лепестках без резкого flash",
    recipientFocusRu: "получатель подсвечен мягким sakura halo",
    crowdMomentRu: "комментарии видят clean premium gift moment",
    reduceMotionFallbackRu: "static poster + one glow pulse + muted-safe label",
  },
  "koi-luck-splash": {
    assetId: "koi-luck-splash",
    finalScreenTitleRu: "Карп Удачи · водный lucky impact",
    premiumImpactRu: "водные кольца расходятся от карпа и дают aqua shimmer на экран",
    soundSignatureRu: "water bell + luck sparkle, 1.2s label only",
    hapticSignatureRu: "pulse wave → light tap → calm release",
    timingSignatureRu: "0.30s entrance · 1.6s loop · 0.65s splash finale",
    finaleCloseRu: "последняя волна закрывает эффект через soft fade",
    recipientFocusRu: "ник получателя проходит через aqua luck ring",
    crowdMomentRu: "stream получает эффект удачи без gambling результата",
    reduceMotionFallbackRu: "static water ring poster + no-motion sparkle copy",
  },
  "neon-fox-tail": {
    assetId: "neon-fox-tail",
    finalScreenTitleRu: "Неоновый Лис · быстрый neon sweep",
    premiumImpactRu: "лисий хвост рисует неоновую дугу и оставляет cyber trail",
    soundSignatureRu: "synth swipe + tiny electric snap, 0.9s label only",
    hapticSignatureRu: "sharp tap → snap impact → short fade",
    timingSignatureRu: "0.18s entrance · 1.2s loop · 0.45s snap finale",
    finaleCloseRu: "неоновый след сужается в маленькую звезду",
    recipientFocusRu: "получатель отмечен neon outline frame",
    crowdMomentRu: "быстрый premium reaction для активного чата",
    reduceMotionFallbackRu: "single neon frame + no trail animation",
  },
  "moon-cat-guard": {
    assetId: "moon-cat-guard",
    finalScreenTitleRu: "Лунный Кот · спокойная guardian сцена",
    premiumImpactRu: "лунный круг закрывает экран, кот создаёт защитный glow",
    soundSignatureRu: "night bell + soft star dust, 1.4s label only",
    hapticSignatureRu: "gentle tap → calm hold → soft release",
    timingSignatureRu: "0.35s entrance · 1.8s loop · 0.70s moon fade",
    finaleCloseRu: "лунная пыль уходит вверх без flash",
    recipientFocusRu: "получатель получает moon-guard badge glow",
    crowdMomentRu: "дорогой спокойный gift без перегрузки экрана",
    reduceMotionFallbackRu: "moon poster + still halo + readable label",
  },
  "dj-star-drop": {
    assetId: "dj-star-drop",
    finalScreenTitleRu: "DJ Звезда · beat pulse moment",
    premiumImpactRu: "звезда падает в центр и запускает equalizer rings",
    soundSignatureRu: "short EDM hit + muted-safe beat label, 1.0s",
    hapticSignatureRu: "beat tap ×2 → small impact",
    timingSignatureRu: "0.20s drop · 1.3s beat loop · 0.50s star burst",
    finaleCloseRu: "equalizer сжимается в bright star",
    recipientFocusRu: "получатель подсвечен rhythm frame",
    crowdMomentRu: "подходит для музыкального live без autoplay runtime",
    reduceMotionFallbackRu: "static star + beat label only",
  },
  "golden-lion-roar": {
    assetId: "golden-lion-roar",
    finalScreenTitleRu: "Золотой Лев · royal impact",
    premiumImpactRu: "золотая грива раскрывается короной и даёт stage roar aura",
    soundSignatureRu: "royal hit + soft roar label, 1.3s",
    hapticSignatureRu: "strong impact → hold → gold release",
    timingSignatureRu: "0.28s crown entrance · 1.7s aura loop · 0.75s roar finale",
    finaleCloseRu: "корона закрывает эффект золотым fade",
    recipientFocusRu: "получатель получает royal crown spotlight",
    crowdMomentRu: "высокая premium заметность без payout runtime",
    reduceMotionFallbackRu: "gold crest poster + one static crown glow",
  },
  "royal-rose-stage": {
    assetId: "royal-rose-stage",
    finalScreenTitleRu: "Королевская Роза · velvet bloom finale",
    premiumImpactRu: "роза раскрывается как сцена с velvet aura и petal curtain",
    soundSignatureRu: "romantic sting + petal whisper, 1.2s",
    hapticSignatureRu: "elegant tap → soft bloom → calm close",
    timingSignatureRu: "0.32s bloom · 1.6s velvet loop · 0.65s petal finale",
    finaleCloseRu: "лепестки уходят в premium curtain fade",
    recipientFocusRu: "получатель отмечен rose spotlight",
    crowdMomentRu: "дорогой романтичный gift для creator support",
    reduceMotionFallbackRu: "rose poster + still velvet frame",
  },
  "cosmic-dragon-gate": {
    assetId: "cosmic-dragon-gate",
    finalScreenTitleRu: "Космический Дракон · mythic gate finale",
    premiumImpactRu: "портал открывает космические ворота, дракон делает mythic sweep",
    soundSignatureRu: "deep cosmic hit + portal whoosh, 1.6s",
    hapticSignatureRu: "deep impact → long pulse → finale hit",
    timingSignatureRu: "0.40s portal entrance · 2.1s dragon loop · 0.90s gate finale",
    finaleCloseRu: "портал схлопывается в star burst",
    recipientFocusRu: "получатель входит в cosmic spotlight",
    crowdMomentRu: "самый дорогой full-screen preview pack 1",
    reduceMotionFallbackRu: "portal poster + single cosmic glow frame",
  },
  "phoenix-crown-burst": {
    assetId: "phoenix-crown-burst",
    finalScreenTitleRu: "Феникс Корона · crown rebirth",
    premiumImpactRu: "феникс поднимается над короной и запускает ember rain",
    soundSignatureRu: "fire crown rise + gold hit, 1.5s",
    hapticSignatureRu: "rise pulse → crown impact → ember fade",
    timingSignatureRu: "0.34s flame entrance · 1.9s wing loop · 0.80s crown finale",
    finaleCloseRu: "корона вспыхивает и оставляет золотой след",
    recipientFocusRu: "получатель получает phoenix crown focus",
    crowdMomentRu: "дорогой лидерский gift без monetization runtime",
    reduceMotionFallbackRu: "phoenix poster + static ember frame",
  },
  "crystal-whale-wave": {
    assetId: "crystal-whale-wave",
    finalScreenTitleRu: "Кристальный Кит · cinematic wave",
    premiumImpactRu: "кит проходит через экран и оставляет crystal wave arc",
    soundSignatureRu: "deep water bell + crystal shimmer, 1.4s",
    hapticSignatureRu: "slow wave pulse → soft sparkle",
    timingSignatureRu: "0.38s wave entrance · 1.8s crystal loop · 0.72s tide finale",
    finaleCloseRu: "кристальные блики уходят в aqua fade",
    recipientFocusRu: "получатель отмечен crystal water halo",
    crowdMomentRu: "мягкий большой gift для спокойных эфиров",
    reduceMotionFallbackRu: "whale poster + static wave ring",
  },
  "cyber-panda-beat": {
    assetId: "cyber-panda-beat",
    finalScreenTitleRu: "Кибер Панда · neon beat impact",
    premiumImpactRu: "кибер-панда включает neon equalizer и bass rings",
    soundSignatureRu: "cyber beat hit + muted-safe label, 1.0s",
    hapticSignatureRu: "beat tap ×3 → micro impact",
    timingSignatureRu: "0.20s beat entrance · 1.4s equalizer loop · 0.50s bass finale",
    finaleCloseRu: "equalizer закрывается в neon paw",
    recipientFocusRu: "получатель получает cyber beat outline",
    crowdMomentRu: "живой music gift без real audio autoplay",
    reduceMotionFallbackRu: "cyber panda poster + static equalizer line",
  },
  "velvet-butterfly-storm": {
    assetId: "velvet-butterfly-storm",
    finalScreenTitleRu: "Бархатные Бабочки · soft storm bloom",
    premiumImpactRu: "бабочки облетает экран и создают velvet glow storm",
    soundSignatureRu: "soft wing shimmer + velvet chime, 1.3s",
    hapticSignatureRu: "tiny flutter taps → soft release",
    timingSignatureRu: "0.30s flutter entrance · 1.7s orbit loop · 0.62s curtain finale",
    finaleCloseRu: "бабочки уходят за бархатную сцену",
    recipientFocusRu: "получатель отмечен butterfly ring",
    crowdMomentRu: "мягкий premium anime момент",
    reduceMotionFallbackRu: "butterfly poster + static orbit dots",
  },
  "thunder-tiger-flash": {
    assetId: "thunder-tiger-flash",
    finalScreenTitleRu: "Громовой Тигр · lightning stage hit",
    premiumImpactRu: "тигр прыгает через экран, молния создаёт shock ring",
    soundSignatureRu: "thunder snap + tiger impact, 1.2s",
    hapticSignatureRu: "strong snap → impact → quick release",
    timingSignatureRu: "0.18s lightning entrance · 1.4s charge loop · 0.62s tiger finale",
    finaleCloseRu: "молния закрывается golden slash",
    recipientFocusRu: "получатель получает thunder spotlight",
    crowdMomentRu: "сильный action gift без win logic",
    reduceMotionFallbackRu: "tiger poster + one static lightning slash",
  },
  "aurora-unicorn-ride": {
    assetId: "aurora-unicorn-ride",
    finalScreenTitleRu: "Аврора Единорог · pastel mythic ride",
    premiumImpactRu: "единорог оставляет aurora trail и pastel star rain",
    soundSignatureRu: "aurora bell + magic glide, 1.5s",
    hapticSignatureRu: "soft rise → pastel pulse → gentle finale",
    timingSignatureRu: "0.36s aurora entrance · 2.0s glide loop · 0.78s star finale",
    finaleCloseRu: "северное сияние растворяется в pastel glow",
    recipientFocusRu: "получатель подсвечен aurora crown",
    crowdMomentRu: "волшебный luxury gift для большого момента",
    reduceMotionFallbackRu: "unicorn poster + static aurora ribbon",
  },
  "diamond-genie-lamp": {
    assetId: "diamond-genie-lamp",
    finalScreenTitleRu: "Алмазный Джинн · luxury reveal",
    premiumImpactRu: "лампа открывает diamond smoke и джинн выходит через spotlight",
    soundSignatureRu: "diamond reveal + magic low hit, 1.6s",
    hapticSignatureRu: "deep reveal pulse → diamond tap → finale hit",
    timingSignatureRu: "0.42s smoke entrance · 2.1s genie loop · 0.88s diamond finale",
    finaleCloseRu: "алмазы сходятся в lamp sparkle",
    recipientFocusRu: "получатель получает diamond wish frame",
    crowdMomentRu: "дорогой мифический gift без money movement",
    reduceMotionFallbackRu: "genie poster + static diamond smoke",
  },
  "galaxy-idol-stage": {
    assetId: "galaxy-idol-stage",
    finalScreenTitleRu: "Галакси Айдол · stage concert finale",
    premiumImpactRu: "галактическая сцена включает idol spotlight и crowd sparkle",
    soundSignatureRu: "idol stage hit + cosmic crowd shimmer, 1.4s",
    hapticSignatureRu: "stage tap → beat pulse → finale burst",
    timingSignatureRu: "0.30s stage entrance · 1.9s concert loop · 0.76s galaxy finale",
    finaleCloseRu: "прожектор уходит в star confetti",
    recipientFocusRu: "получатель появляется в idol stage frame",
    crowdMomentRu: "самый концертный gift для live шоу",
    reduceMotionFallbackRu: "idol poster + static stage lights",
  },
};

const allGiftAssets188I = [...streamPremiumGiftPack187A, ...streamPremiumGiftPack188A];

export const streamPremiumGiftFinalScreenPolish188I: StreamPremiumGiftFinalScreenPolish188I[] = allGiftAssets188I.map((gift) => ({
  ...finalScreenPolishSeeds188I[gift.id],
  soundPreviewRuntimeEnabledNow: false,
  realGiftSendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
}));

export function getStreamPremiumGiftFinalScreenPolish188I(assetId: string): StreamPremiumGiftFinalScreenPolish188I {
  return streamPremiumGiftFinalScreenPolish188I.find((profile) => profile.assetId === assetId) ?? streamPremiumGiftFinalScreenPolish188I[0];
}

export const streamPremiumGiftFinalScreenPolishSummary188I = {
  version: "STREAM-GAME-GIFTS-188I",
  totalGifts: streamPremiumGiftFinalScreenPolish188I.length,
  pack1GiftCount: streamPremiumGiftPack187A.length,
  pack2GiftCount: streamPremiumGiftPack188A.length,
  profilesWithSoundSignature: streamPremiumGiftFinalScreenPolish188I.filter((profile) => profile.soundSignatureRu.length > 0).length,
  profilesWithHapticSignature: streamPremiumGiftFinalScreenPolish188I.filter((profile) => profile.hapticSignatureRu.length > 0).length,
  profilesWithFinaleClose: streamPremiumGiftFinalScreenPolish188I.filter((profile) => profile.finaleCloseRu.length > 0).length,
  soundPreviewRuntimeEnabledNow: false,
  realGiftSendRuntimeEnabledNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
  actualAudioAutoplayEnabledNow: false,
  usesExisting187BSoundCueLabelsOnly: true,
  usesExistingHapticPreviewButtonOnly: true,
} as const;

export const streamPremiumGiftFinalScreenPolishQa188I = allGiftAssets188I.map((gift) => {
  const finalPolish = getStreamPremiumGiftFinalScreenPolish188I(gift.id);
  const effectProfile = getStreamPremiumGiftEffectProfile187B(gift.id);
  const appearanceProfile = getStreamPremiumGiftAppearanceProfile188G(gift.id);
  const visualFxProfile = getStreamPremiumGiftVisualFxProfile188H(gift.id);
  return {
    assetId: gift.id,
    displayNameRu: gift.displayNameRu,
    finalScreenTitleRu: finalPolish.finalScreenTitleRu,
    soundCueLabel: effectProfile.soundCueLabel,
    hapticImpactStyle: effectProfile.hapticImpactStyle,
    appearanceTitleRu: appearanceProfile.appearanceTitleRu,
    visualFxTitleRu: visualFxProfile.visualFxTitleRu,
    previewOnly: true,
    noAutoplay: true,
    noBackend: true,
    noPayment: true,
    noPayout: true,
    noSendRuntime: true,
  };
});
