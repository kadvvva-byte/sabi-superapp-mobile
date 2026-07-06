import { streamPremiumGiftPack187A } from "./streamPremiumGiftPack187A";
import { streamPremiumGiftPack188A } from "./streamPremiumGiftPack188A";
import { streamPremiumGiftPack190A } from "./streamPremiumGiftPack190A";
import { streamPremiumGiftPack197A } from "./streamPremiumGiftPack197A";
import { streamPremiumGiftPack197C } from "./streamPremiumGiftPack197C";
import { streamPremiumGiftPack197D } from "./streamPremiumGiftPack197D";
import { streamPremiumGiftPack197E } from "./streamPremiumGiftPack197E";
import { streamPremiumGiftPack197F } from "./streamPremiumGiftPack197F";
import { streamPremiumGiftPack197G } from "./streamPremiumGiftPack197G";
import { streamPremiumGiftPack197H } from "./streamPremiumGiftPack197H";

export type StreamPremiumGiftCatalogPackFilter188F = "all" | "pack1" | "pack2" | "pack3" | "pack4" | "pack5" | "pack6" | "pack7" | "pack8" | "pack9" | "pack10";
export type StreamPremiumGiftCatalogRarityLane188F = "starter" | "rare" | "legendary" | "mythic";

export type StreamPremiumGiftCatalogPackFilterOption188F = {
  key: StreamPremiumGiftCatalogPackFilter188F;
  labelRu: string;
  metaRu: string;
};

export type StreamPremiumGiftCatalogRarityLaneOption188F = {
  key: StreamPremiumGiftCatalogRarityLane188F;
  labelRu: string;
  metaRu: string;
};

export type StreamPremiumGiftCatalogOrganizationRow188F = {
  assetId: string;
  packFilterKey: Exclude<StreamPremiumGiftCatalogPackFilter188F, "all">;
  packLabelRu: string;
  shelfLaneRu: string;
  rarityLaneKey: StreamPremiumGiftCatalogRarityLane188F;
  rarityLaneRu: string;
  catalogOrder: number;
  catalogBadgeRu: string;
  groupCopyRu: string;
  previewGroupingRu: string;
  recommendedUseRu: string;
  organizationChipsRu: readonly string[];
  safetyCopyRu: string;
  sourceRuntimeChangedNow: false;
  backendRuntimeEnabledNow: false;
  paymentRuntimeEnabledNow: false;
  sendRuntimeEnabledNow: false;
};

export const streamPremiumGiftCatalogPackFilters188F: StreamPremiumGiftCatalogPackFilterOption188F[] = [
  { key: "all", labelRu: "Все 80", metaRu: "10 наборов" },
  { key: "pack1", labelRu: "Pack 1", metaRu: "8 classic" },
  { key: "pack2", labelRu: "Pack 2", metaRu: "8 ultra" },
  { key: "pack3", labelRu: "Pack 3", metaRu: "8 live" },
  { key: "pack4", labelRu: "Pack 4", metaRu: "8 ultra premium" },
  { key: "pack5", labelRu: "Pack 5", metaRu: "8 diamond range" },
  { key: "pack6", labelRu: "Pack 6", metaRu: "8 royal mythic" },
  { key: "pack7", labelRu: "Pack 7", metaRu: "8 celestial dynasty" },
  { key: "pack8", labelRu: "Pack 8", metaRu: "8 imperial galaxy" },
  { key: "pack9", labelRu: "Pack 9", metaRu: "8 royal ocean legends" },
  { key: "pack10", labelRu: "Pack 10", metaRu: "8 legendary sky empire" },
];

export const streamPremiumGiftCatalogRarityLanes188F: StreamPremiumGiftCatalogRarityLaneOption188F[] = [
  { key: "starter", labelRu: "Starter", metaRu: "мягкий вход" },
  { key: "rare", labelRu: "Rare", metaRu: "яркий preview" },
  { key: "legendary", labelRu: "Legendary", metaRu: "сцена + aura" },
  { key: "mythic", labelRu: "Mythic", metaRu: "топ-эффект" },
];

const giftLaneByAssetId: Record<string, Pick<StreamPremiumGiftCatalogOrganizationRow188F, "shelfLaneRu" | "rarityLaneKey" | "rarityLaneRu" | "catalogBadgeRu" | "recommendedUseRu">> = {
  "sakura-heart-burst": { shelfLaneRu: "Anime starter", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "soft intro", recommendedUseRu: "первый тёплый подарок" },
  "koi-luck-splash": { shelfLaneRu: "Anime water", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "luck wave", recommendedUseRu: "удачный момент эфира" },
  "neon-fox-tail": { shelfLaneRu: "Anime neon", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "neon trail", recommendedUseRu: "сильный visual hit" },
  "moon-cat-guard": { shelfLaneRu: "Anime calm", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "moon aura", recommendedUseRu: "спокойная премиум-сцена" },
  "dj-star-drop": { shelfLaneRu: "Sound stage", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "beat cue", recommendedUseRu: "музыкальный момент" },
  "golden-lion-roar": { shelfLaneRu: "Premium royal", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "gold roar", recommendedUseRu: "топ-поддержка автора" },
  "royal-rose-stage": { shelfLaneRu: "Premium romantic", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "rose bloom", recommendedUseRu: "красивый финал сцены" },
  "cosmic-dragon-gate": { shelfLaneRu: "Premium cosmic", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "dragon gate", recommendedUseRu: "главный вау-момент" },
  "phoenix-crown-burst": { shelfLaneRu: "Pack 2 crown", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "phoenix crown", recommendedUseRu: "самый сильный Pack 2 entrance" },
  "crystal-whale-wave": { shelfLaneRu: "Pack 2 aqua", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "crystal wave", recommendedUseRu: "большая спокойная сцена" },
  "cyber-panda-beat": { shelfLaneRu: "Pack 2 sound", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "beat pulse", recommendedUseRu: "весёлый musical cue" },
  "velvet-butterfly-storm": { shelfLaneRu: "Pack 2 anime", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "butterfly storm", recommendedUseRu: "мягкая anime-эмоция" },
  "thunder-tiger-flash": { shelfLaneRu: "Pack 2 impact", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "thunder flash", recommendedUseRu: "резкий impact preview" },
  "aurora-unicorn-ride": { shelfLaneRu: "Pack 2 aurora", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "aurora ride", recommendedUseRu: "яркий magical showcase" },
  "diamond-genie-lamp": { shelfLaneRu: "Pack 2 premium", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "diamond wish", recommendedUseRu: "дорогой premium preview" },
  "galaxy-idol-stage": { shelfLaneRu: "Pack 2 stage", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "idol stage", recommendedUseRu: "финальный stage moment" },
  "solar-samurai-dash": { shelfLaneRu: "Pack 3 solar", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "solar blade", recommendedUseRu: "дорогой entrance с клинком" },
  "mermaid-pearl-bloom": { shelfLaneRu: "Pack 3 pearl", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "pearl bloom", recommendedUseRu: "мягкая ocean-сцена" },
  "midnight-wolf-moon": { shelfLaneRu: "Pack 3 moon", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "wolf moon", recommendedUseRu: "тёмный anime impact" },
  "candy-planet-pop": { shelfLaneRu: "Pack 3 pop", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "candy pop", recommendedUseRu: "лёгкий весёлый момент" },
  "royal-peacock-fan": { shelfLaneRu: "Pack 3 royal", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "peacock fan", recommendedUseRu: "богатый luxury reveal" },
  "neon-shark-surge": { shelfLaneRu: "Pack 3 neon", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "shark surge", recommendedUseRu: "быстрый wave impact" },
  "angel-harp-glow": { shelfLaneRu: "Pack 3 harmony", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "harp glow", recommendedUseRu: "музыкальный calm preview" },
  "volcano-dragon-flare": { shelfLaneRu: "Pack 3 volcano", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "lava dragon", recommendedUseRu: "самый сильный fire finale" },
  "celestial-tiger-crown": { shelfLaneRu: "Pack 4 celestial", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "tiger crown", recommendedUseRu: "дорогой entrance с честной ценой" },
  "diamond-sakura-palace": { shelfLaneRu: "Pack 4 sakura", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "diamond sakura", recommendedUseRu: "мягкая premium-сцена" },
  "aurora-phoenix-parade": { shelfLaneRu: "Pack 4 aurora", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "phoenix parade", recommendedUseRu: "сильный ultra entrance" },
  "royal-galaxy-yacht": { shelfLaneRu: "Pack 4 galaxy", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "galaxy yacht", recommendedUseRu: "дорогой luxury reveal" },
  "crystal-lotus-dragon": { shelfLaneRu: "Pack 4 lotus", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "lotus dragon", recommendedUseRu: "ultra premium bloom" },
  "neon-opera-idol": { shelfLaneRu: "Pack 4 opera", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "opera idol", recommendedUseRu: "музыкальный premium cue" },
  "golden-falcon-crown": { shelfLaneRu: "Pack 4 falcon", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "falcon crown", recommendedUseRu: "быстрый royal impact" },
  "imperial-dragon-meteor": { shelfLaneRu: "Pack 4 imperial", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "dragon meteor", recommendedUseRu: "главный ultra finale" },
  "diamond-spark-one": { shelfLaneRu: "Pack 5 micro", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "1 diamond", recommendedUseRu: "доступный чистый premium gift" },
  "aurora-heart-five": { shelfLaneRu: "Pack 5 heart", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "5 diamonds", recommendedUseRu: "мягкая поддержка" },
  "silver-rose-ten": { shelfLaneRu: "Pack 5 rose", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "10 diamonds", recommendedUseRu: "красивый clean gift" },
  "crystal-cat-twenty-five": { shelfLaneRu: "Pack 5 crystal", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "25 diamonds", recommendedUseRu: "anime premium moment" },
  "royal-pegasus-seventy-five": { shelfLaneRu: "Pack 5 pegasus", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "75 diamonds", recommendedUseRu: "epic wing entrance" },
  "stellar-train-two-fifty": { shelfLaneRu: "Pack 5 stellar", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "250 diamonds", recommendedUseRu: "сильный motion gift" },
  "sky-palace-one-thousand": { shelfLaneRu: "Pack 5 palace", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "1000 diamonds", recommendedUseRu: "mythic palace showcase" },
  "imperial-galaxy-ten-thousand": { shelfLaneRu: "Pack 5 galaxy", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "10000 diamonds", recommendedUseRu: "главный ultra-top gift" },
  "jade-like-spark": { shelfLaneRu: "Pack 6 jade", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "2 diamonds", recommendedUseRu: "доступный clean premium gift" },
  "sakura-melody-shell": { shelfLaneRu: "Pack 6 melody", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "15 diamonds", recommendedUseRu: "музыкальный clean gift" },
  "moon-bunny-crown": { shelfLaneRu: "Pack 6 moon", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "50 diamonds", recommendedUseRu: "anime premium support" },
  "amber-phoenix-wing": { shelfLaneRu: "Pack 6 phoenix", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "150 diamonds", recommendedUseRu: "epic wing entrance" },
  "emerald-supercar-glide": { shelfLaneRu: "Pack 6 car", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "500 diamonds", recommendedUseRu: "cinematic motion gift" },
  "atlantis-crown-wave": { shelfLaneRu: "Pack 6 atlantis", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "1500 diamonds", recommendedUseRu: "mythic ocean crown" },
  "cosmic-castle-orbit": { shelfLaneRu: "Pack 6 castle", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "5000 diamonds", recommendedUseRu: "ultra mythic orbit" },
  "sultan-universe-throne": { shelfLaneRu: "Pack 6 throne", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "9999 diamonds", recommendedUseRu: "top ultra-premium finale" },
  "diamond-drop-one": { shelfLaneRu: "Pack 7 micro", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "1 diamond", recommendedUseRu: "доступный clean premium gift" },
  "neon-jasmine-eight": { shelfLaneRu: "Pack 7 floral", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "8 diamonds", recommendedUseRu: "мягкий цветочный premium cue" },
  "crystal-butterfly-thirty-five": { shelfLaneRu: "Pack 7 crystal", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "35 diamonds", recommendedUseRu: "anime butterfly moment" },
  "royal-lantern-one-twenty": { shelfLaneRu: "Pack 7 lantern", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "120 diamonds", recommendedUseRu: "тёплый epic entrance" },
  "dragon-pearl-seven-seven-seven": { shelfLaneRu: "Pack 7 pearl", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "777 diamonds", recommendedUseRu: "сильный premium orbit" },
  "silk-road-caravan-two-five-zero-zero": { shelfLaneRu: "Pack 7 silk road", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "2500 diamonds", recommendedUseRu: "дорогая cinematic сцена" },
  "aurora-palace-seven-five-zero-zero": { shelfLaneRu: "Pack 7 aurora", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "7500 diamonds", recommendedUseRu: "ultra palace reveal" },
  "celestial-emperor-ten-thousand": { shelfLaneRu: "Pack 7 emperor", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "10000 diamonds", recommendedUseRu: "самый дорогой top-tier gift" },
  "azure-like-three": { shelfLaneRu: "Pack 8 azure", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "3 diamonds", recommendedUseRu: "доступный premium like" },
  "ruby-heart-twelve": { shelfLaneRu: "Pack 8 heart", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "12 diamonds", recommendedUseRu: "мягкое ruby сердце" },
  "crystal-unicorn-sixty": { shelfLaneRu: "Pack 8 unicorn", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "60 diamonds", recommendedUseRu: "anime magical trail" },
  "golden-meteor-three-hundred": { shelfLaneRu: "Pack 8 meteor", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "300 diamonds", recommendedUseRu: "epic meteor arc" },
  "imperial-lily-eight-eight-eight": { shelfLaneRu: "Pack 8 lily", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "888 diamonds", recommendedUseRu: "luxury floral bloom" },
  "galactic-lion-three-thousand": { shelfLaneRu: "Pack 8 lion", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "3000 diamonds", recommendedUseRu: "mythic royal support" },
  "diamond-jet-eight-eight-zero-zero": { shelfLaneRu: "Pack 8 jet", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "8800 diamonds", recommendedUseRu: "ultra flyover gift" },
  "universe-crown-ten-thousand": { shelfLaneRu: "Pack 8 crown", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "10000 diamonds", recommendedUseRu: "top-tier crown finale" },
  "pearl-like-four": { shelfLaneRu: "Pack 9 pearl", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "4 diamonds", recommendedUseRu: "доступный clean ocean gift" },
  "coral-heart-eighteen": { shelfLaneRu: "Pack 9 coral", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "18 diamonds", recommendedUseRu: "тёплая поддержка в эфире" },
  "aqua-dolphin-eighty": { shelfLaneRu: "Pack 9 dolphin", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "80 diamonds", recommendedUseRu: "лёгкий anime ocean момент" },
  "golden-anchor-four-fifty": { shelfLaneRu: "Pack 9 anchor", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "450 diamonds", recommendedUseRu: "epic ocean support" },
  "emerald-mermaid-nine-ninety": { shelfLaneRu: "Pack 9 mermaid", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "990 diamonds", recommendedUseRu: "luxury underwater bloom" },
  "royal-submarine-four-thousand": { shelfLaneRu: "Pack 9 submarine", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "4000 diamonds", recommendedUseRu: "mythic ocean scene" },
  "atlantic-palace-nine-thousand": { shelfLaneRu: "Pack 9 palace", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "9000 diamonds", recommendedUseRu: "ultra palace reveal" },
  "ocean-emperor-ten-thousand": { shelfLaneRu: "Pack 9 emperor", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "10000 diamonds", recommendedUseRu: "самый дорогой ocean top-tier gift" },
  "emerald-clover-six": { shelfLaneRu: "Pack 10 clover", rarityLaneKey: "starter", rarityLaneRu: "Starter", catalogBadgeRu: "6 diamonds", recommendedUseRu: "доступный clean lucky gift" },
  "ruby-fox-twenty-two": { shelfLaneRu: "Pack 10 fox", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "22 diamonds", recommendedUseRu: "яркий доступный anime hit" },
  "silver-koi-ninety": { shelfLaneRu: "Pack 10 koi", rarityLaneKey: "rare", rarityLaneRu: "Rare", catalogBadgeRu: "90 diamonds", recommendedUseRu: "clean premium stream support" },
  "golden-phoenix-six-hundred": { shelfLaneRu: "Pack 10 phoenix", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "600 diamonds", recommendedUseRu: "epic premium entrance" },
  "royal-airship-twelve-hundred": { shelfLaneRu: "Pack 10 airship", rarityLaneKey: "legendary", rarityLaneRu: "Legendary", catalogBadgeRu: "1200 diamonds", recommendedUseRu: "legendary sky-stage reveal" },
  "diamond-tiger-forty-five-hundred": { shelfLaneRu: "Pack 10 tiger", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "4500 diamonds", recommendedUseRu: "mythic high-price support" },
  "crystal-planet-nine-five-hundred": { shelfLaneRu: "Pack 10 planet", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "9500 diamonds", recommendedUseRu: "ultra orbit moment" },
  "immortal-dragon-ten-thousand": { shelfLaneRu: "Pack 10 dragon", rarityLaneKey: "mythic", rarityLaneRu: "Mythic", catalogBadgeRu: "10000 diamonds", recommendedUseRu: "максимальный top-tier gift" },
};

function buildRows(): StreamPremiumGiftCatalogOrganizationRow188F[] {
  const pack1 = streamPremiumGiftPack187A.map((gift, index) => ({ gift, packFilterKey: "pack1" as const, packLabelRu: "Pack 1 · Classic Anime", orderOffset: index + 1 }));
  const pack2 = streamPremiumGiftPack188A.map((gift, index) => ({ gift, packFilterKey: "pack2" as const, packLabelRu: "Pack 2 · Ultra Stage", orderOffset: index + 9 }));
  const pack3 = streamPremiumGiftPack190A.map((gift, index) => ({ gift, packFilterKey: "pack3" as const, packLabelRu: "Pack 3 · Premium Live", orderOffset: index + 17 }));
  const pack4 = streamPremiumGiftPack197A.map((gift, index) => ({ gift, packFilterKey: "pack4" as const, packLabelRu: "Pack 4 · Ultra Premium", orderOffset: index + 25 }));
  const pack5 = streamPremiumGiftPack197C.map((gift, index) => ({ gift, packFilterKey: "pack5" as const, packLabelRu: "Pack 5 · Diamond Range", orderOffset: index + 33 }));
  const pack6 = streamPremiumGiftPack197D.map((gift, index) => ({ gift, packFilterKey: "pack6" as const, packLabelRu: "Pack 6 · Royal Mythic", orderOffset: index + 41 }));
  const pack7 = streamPremiumGiftPack197E.map((gift, index) => ({ gift, packFilterKey: "pack7" as const, packLabelRu: "Pack 7 · Celestial Dynasty", orderOffset: index + 49 }));
  const pack8 = streamPremiumGiftPack197F.map((gift, index) => ({ gift, packFilterKey: "pack8" as const, packLabelRu: "Pack 8 · Imperial Galaxy", orderOffset: index + 57 }));
  const pack9 = streamPremiumGiftPack197G.map((gift, index) => ({ gift, packFilterKey: "pack9" as const, packLabelRu: "Pack 9 · Royal Ocean Legends", orderOffset: index + 65 }));
  const pack10 = streamPremiumGiftPack197H.map((gift, index) => ({ gift, packFilterKey: "pack10" as const, packLabelRu: "Pack 10 · Legendary Sky Empire", orderOffset: index + 73 }));
  return [...pack1, ...pack2, ...pack3, ...pack4, ...pack5, ...pack6, ...pack7, ...pack8, ...pack9, ...pack10].map(({ gift, packFilterKey, packLabelRu, orderOffset }) => {
    const lane = giftLaneByAssetId[gift.id] ?? {
      shelfLaneRu: "Premium",
      rarityLaneKey: "rare" as const,
      rarityLaneRu: "Rare",
      catalogBadgeRu: "preview",
      recommendedUseRu: "локальный preview",
    };
    return {
      assetId: gift.id,
      packFilterKey,
      packLabelRu,
      shelfLaneRu: lane.shelfLaneRu,
      rarityLaneKey: lane.rarityLaneKey,
      rarityLaneRu: lane.rarityLaneRu,
      catalogOrder: orderOffset,
      catalogBadgeRu: lane.catalogBadgeRu,
      groupCopyRu: `${packLabelRu} · ${lane.rarityLaneRu} · ${gift.catalogSegment}`,
      previewGroupingRu: `${lane.shelfLaneRu} · ${gift.rarityLabel} · poster fallback`,
      recommendedUseRu: lane.recommendedUseRu,
      organizationChipsRu: [packLabelRu, lane.rarityLaneRu, gift.catalogSegment, "preview only"],
      safetyCopyRu: "Каталог только организует локальный preview: без оплаты, без отправки, без backend и без payout.",
      sourceRuntimeChangedNow: false,
      backendRuntimeEnabledNow: false,
      paymentRuntimeEnabledNow: false,
      sendRuntimeEnabledNow: false,
    };
  });
}

export const streamPremiumGiftCatalogOrganizationRows188F = buildRows();

export const streamPremiumGiftCatalogOrganizationSummary188F = {
  version: "STREAM-GAME-GIFTS-188F",
  totalGifts: streamPremiumGiftCatalogOrganizationRows188F.length,
  pack1Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack1").length,
  pack2Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack2").length,
  pack3Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack3").length,
  pack4Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack4").length,
  pack5Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack5").length,
  pack6Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack6").length,
  pack7Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack7").length,
  pack8Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack8").length,
  pack9Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack9").length,
  pack10Count: streamPremiumGiftCatalogOrganizationRows188F.filter((row) => row.packFilterKey === "pack10").length,
  rarityLaneCount: streamPremiumGiftCatalogRarityLanes188F.length,
  packFilterCount: streamPremiumGiftCatalogPackFilters188F.length,
  catalogOrganizationOnly: true,
  sourceRuntimeChangedNow: false,
  backendRuntimeEnabledNow: false,
  paymentRuntimeEnabledNow: false,
  sendRuntimeEnabledNow: false,
  payoutRuntimeEnabledNow: false,
} as const;

export function getStreamPremiumGiftCatalogOrganization188F(assetId: string): StreamPremiumGiftCatalogOrganizationRow188F {
  return streamPremiumGiftCatalogOrganizationRows188F.find((row) => row.assetId === assetId) ?? streamPremiumGiftCatalogOrganizationRows188F[0];
}
