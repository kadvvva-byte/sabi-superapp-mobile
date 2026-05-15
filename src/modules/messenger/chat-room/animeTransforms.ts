export type AnimeTransformId =
  | "none"
  | "anime_snap"
  | "anime_hero"
  | "anime_manga"
  | "anime_freeze";

export type AnimeTransformPreset = {
  id: AnimeTransformId;
  title: string;
  subtitle: string;
  badge?: string;
};

export const ANIME_TRANSFORM_PRESETS: AnimeTransformPreset[] = [
  {
    id: "anime_snap",
    title: "Anime kadr",
    subtitle: "chaqnash kadri + yaltiroq o‘tish",
    badge: "top",
  },
  {
    id: "anime_hero",
    title: "Qahramon rejimi",
    subtitle: "kuchli portlash + jonli nur",
    badge: "top",
  },
  {
    id: "anime_manga",
    title: "Manga kesimi",
    subtitle: "tezlik chiziqlari + dramatik kontrast",
    badge: "pro",
  },
  {
    id: "anime_freeze",
    title: "Muzlagan kadr",
    subtitle: "kamera chaqnashi + muzlagan panjara",
    badge: "pro",
  },
];

export function isAnimatedTransform(effectId: AnimeTransformId) {
  return effectId !== "none";
}

export function getAnimeTransformPreset(effectId: AnimeTransformId) {
  return ANIME_TRANSFORM_PRESETS.find((item) => item.id === effectId) ?? null;
}
