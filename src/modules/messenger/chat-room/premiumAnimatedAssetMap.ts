import type { ImageSourcePropType } from "react-native";

export type PremiumAnimatedEffectKey =
  | "heart"
  | "kiss"
  | "laugh"
  | "cool"
  | "cry"
  | "sparkle"
  | "float"
  | "default";

export type PremiumAnimatedTier = "low" | "mid";

export type PremiumAnimatedAsset = {
  id: string;
  title: string;
  subtitle: string;
  keywords: string[];
  source: ImageSourcePropType;
  tier: PremiumAnimatedTier;
  effectKey: PremiumAnimatedEffectKey;
  durationMs: 5000;
};

const asset = (
  id: string,
  title: string,
  subtitle: string,
  keywords: string[],
  source: ImageSourcePropType,
  tier: PremiumAnimatedTier,
  effectKey: PremiumAnimatedEffectKey,
): PremiumAnimatedAsset => ({
  id,
  title,
  subtitle,
  keywords,
  source,
  tier,
  effectKey,
  durationMs: 5000,
});

export const PREMIUM_ANIMATED_ASSETS: PremiumAnimatedAsset[] = [
  asset(
    "premium_reaction_cool_sunglasses",
    "Cool Sunglasses",
    "premium cool reaction",
    ["cool", "sunglasses", "reaction", "premium"],
    require("../../../../assets/low/reactions/reaction_cool_sunglasses.png"),
    "low",
    "cool",
  ),
  asset(
    "premium_reaction_cry_sad",
    "Cry Sad",
    "premium sad reaction",
    ["cry", "sad", "tears", "reaction", "premium"],
    require("../../../../assets/low/reactions/reaction_cry_sad.png"),
    "low",
    "cry",
  ),
  asset(
    "premium_reaction_heart_love",
    "Heart Love",
    "premium heart reaction",
    ["heart", "love", "reaction", "premium"],
    require("../../../../assets/low/reactions/reaction_heart_love.png"),
    "low",
    "heart",
  ),
  asset(
    "premium_reaction_kiss_hearts",
    "Kiss Hearts",
    "premium romantic reaction",
    ["kiss", "hearts", "love", "reaction", "premium"],
    require("../../../../assets/low/reactions/reaction_kiss_hearts.png"),
    "low",
    "kiss",
  ),
  asset(
    "premium_reaction_lol_tears",
    "LOL Tears",
    "premium funny reaction",
    ["lol", "laugh", "tears", "reaction", "premium"],
    require("../../../../assets/low/reactions/reaction_lol_tears.png"),
    "low",
    "laugh",
  ),
  asset(
    "premium_low_gift_angel_baby",
    "Angel Baby",
    "premium cute sticker",
    ["angel", "baby", "cute", "premium", "sticker"],
    require("../../../../assets/low/gift_angel_baby.png"),
    "low",
    "float",
  ),
  asset(
    "premium_low_gift_bell_gold",
    "Gold Bell",
    "premium golden sticker",
    ["bell", "gold", "premium", "sticker"],
    require("../../../../assets/low/gift_bell_gold.png"),
    "low",
    "sparkle",
  ),
  asset(
    "premium_low_gift_chocolate_box_deluxe",
    "Chocolate Deluxe",
    "premium sweet sticker",
    ["chocolate", "box", "sweet", "premium", "sticker"],
    require("../../../../assets/low/gift_chocolate_box_deluxe.png"),
    "low",
    "float",
  ),
  asset(
    "premium_low_gift_flower_bouquet_small",
    "Flower Bouquet",
    "premium flower sticker",
    ["flower", "bouquet", "rose", "premium", "sticker"],
    require("../../../../assets/low/gift_flower_bouquet_small.png"),
    "low",
    "float",
  ),
  asset(
    "premium_low_gift_heart_balloon_bouquet",
    "Heart Balloon Bouquet",
    "premium romantic sticker",
    ["heart", "balloon", "bouquet", "premium", "sticker"],
    require("../../../../assets/low/gift_heart_balloon_bouquet.png"),
    "low",
    "heart",
  ),
  asset(
    "premium_low_gift_heart_balloon",
    "Heart Balloon",
    "premium romantic sticker",
    ["heart", "balloon", "premium", "sticker"],
    require("../../../../assets/low/gift_heart_balloon.png"),
    "low",
    "heart",
  ),
  asset(
    "premium_low_gift_kiss_lips",
    "Kiss Lips",
    "premium romantic sticker",
    ["kiss", "lips", "romance", "premium", "sticker"],
    require("../../../../assets/low/gift_kiss_lips.png"),
    "low",
    "kiss",
  ),
  asset(
    "premium_low_gift_kitty_cup_love",
    "Kitty Cup Love",
    "premium cute sticker",
    ["kitty", "cup", "love", "premium", "sticker"],
    require("../../../../assets/low/gift_kitty_cup_love.png"),
    "low",
    "float",
  ),
  asset(
    "premium_low_gift_like_pink",
    "Like Pink",
    "premium like sticker",
    ["like", "pink", "premium", "sticker"],
    require("../../../../assets/low/gift_like_pink.png"),
    "low",
    "sparkle",
  ),
  asset(
    "premium_low_gift_perfume_pink",
    "Perfume Pink",
    "premium luxury sticker",
    ["perfume", "pink", "luxury", "premium", "sticker"],
    require("../../../../assets/low/gift_perfume_pink.png"),
    "low",
    "sparkle",
  ),
  asset(
    "premium_low_gift_ring_simple",
    "Ring Simple",
    "premium love sticker",
    ["ring", "love", "premium", "sticker"],
    require("../../../../assets/low/gift_ring_simple.png"),
    "low",
    "sparkle",
  ),
  asset(
    "premium_low_gift_rose_red",
    "Rose Red",
    "premium love sticker",
    ["rose", "red", "love", "premium", "sticker"],
    require("../../../../assets/low/gift_rose_red.png"),
    "low",
    "heart",
  ),
  asset(
    "premium_low_gift_star_gold",
    "Star Gold",
    "premium sparkle sticker",
    ["star", "gold", "shine", "premium", "sticker"],
    require("../../../../assets/low/gift_star_gold.png"),
    "low",
    "sparkle",
  ),
  asset(
    "premium_low_gift_teddy_heart",
    "Teddy Heart",
    "premium teddy sticker",
    ["teddy", "heart", "cute", "premium", "sticker"],
    require("../../../../assets/low/gift_teddy_heart.png"),
    "low",
    "heart",
  ),
  asset(
    "premium_mid_a_crown_box",
    "Crown Box",
    "premium mid sticker",
    ["crown", "box", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_a_crown_box.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_a_crystal_heart",
    "Crystal Heart",
    "premium mid sticker",
    ["crystal", "heart", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_a_crystal_heart.png"),
    "mid",
    "heart",
  ),
  asset(
    "premium_mid_a_heart_carriage",
    "Heart Carriage",
    "premium mid sticker",
    ["heart", "carriage", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_a_heart_carriage.png"),
    "mid",
    "heart",
  ),
  asset(
    "premium_mid_a_perfume_royal",
    "Perfume Royal",
    "premium mid sticker",
    ["perfume", "royal", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_a_perfume_royal.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_angel_wings_heart_500",
    "Angel Wings Heart 500",
    "premium mid sticker",
    ["angel", "wings", "heart", "500", "premium", "mid"],
    require("../../../../assets/mid/mid_angel_wings_heart_500.png"),
    "mid",
    "heart",
  ),
  asset(
    "premium_mid_angel_wings_heart",
    "Angel Wings Heart",
    "premium mid sticker",
    ["angel", "wings", "heart", "premium", "mid"],
    require("../../../../assets/mid/mid_angel_wings_heart.png"),
    "mid",
    "heart",
  ),
  asset(
    "premium_mid_b_flower_bouquet",
    "Flower Bouquet Mid",
    "premium mid sticker",
    ["flower", "bouquet", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_b_flower_bouquet.png"),
    "mid",
    "float",
  ),
  asset(
    "premium_mid_b_rocket_launch",
    "Rocket Launch",
    "premium mid sticker",
    ["rocket", "launch", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_b_rocket_launch.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_b_sports_car_blue",
    "Sports Car Blue",
    "premium mid sticker",
    ["sports", "car", "blue", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_b_sports_car_blue.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_b_sports_car_super",
    "Sports Car Super",
    "premium mid sticker",
    ["sports", "car", "super", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_b_sports_car_super.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_celestial_crown_500",
    "Celestial Crown 500",
    "premium mid sticker",
    ["celestial", "crown", "500", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_celestial_crown_500.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_digital_illustration_in_anime",
    "Anime Illustration",
    "premium mid sticker",
    ["anime", "illustration", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_digital_illustration_in_anime.png"),
    "mid",
    "default",
  ),
  asset(
    "premium_mid_epic_sword_300",
    "Epic Sword 300",
    "premium mid sticker",
    ["epic", "sword", "300", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_epic_sword_300.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_legendary_amulet_300",
    "Legendary Amulet 300",
    "premium mid sticker",
    ["legendary", "amulet", "300", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_legendary_amulet_300.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_legendary_bow_arrow_300",
    "Legendary Bow Arrow 300",
    "premium mid sticker",
    ["legendary", "bow", "arrow", "300", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_legendary_bow_arrow_300.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_legendary_shield_300",
    "Legendary Shield 300",
    "premium mid sticker",
    ["legendary", "shield", "300", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_legendary_shield_300.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_legendary_spear_300",
    "Legendary Spear 300",
    "premium mid sticker",
    ["legendary", "spear", "300", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_legendary_spear_300.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_moon_gate_royal_500",
    "Moon Gate Royal 500",
    "premium mid sticker",
    ["moon", "gate", "royal", "500", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_moon_gate_royal_500.png"),
    "mid",
    "sparkle",
  ),
  asset(
    "premium_mid_phoenix_emblem_500",
    "Phoenix Emblem 500",
    "premium mid sticker",
    ["phoenix", "emblem", "500", "premium", "mid", "sticker"],
    require("../../../../assets/mid/mid_phoenix_emblem_500.png"),
    "mid",
    "sparkle",
  ),
];

export function getPremiumAnimatedAssetById(id: string) {
  return PREMIUM_ANIMATED_ASSETS.find((item) => item.id === id) ?? null;
}

export function getPremiumAnimatedPreviewSource(id: string) {
  return getPremiumAnimatedAssetById(id)?.source ?? null;
}

export function isPremiumAnimatedAssetId(id: string) {
  return PREMIUM_ANIMATED_ASSETS.some((item) => item.id === id);
}
