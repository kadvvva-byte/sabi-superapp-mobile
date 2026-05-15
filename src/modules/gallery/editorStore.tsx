import { useSyncExternalStore } from "react";

export type GalleryFilterPreset =
  | "none"
  | "soft_beauty"
  | "luxury_portrait"
  | "warm_film"
  | "cool_night"
  | "anime_glow"
  | "pink_dream"
  | "gold_glam";

export type GalleryTextStylePreset = "classic" | "glow" | "outline" | "bubble";
export type GalleryTextAlignPreset = "top" | "center" | "bottom";
export type GalleryStickerPreset =
  | "none"
  | "sparkle_cluster"
  | "hearts"
  | "crown"
  | "stars"
  | "petals"
  | "butterfly";
export type GalleryFramePreset =
  | "none"
  | "luxury_gold"
  | "soft_portrait"
  | "anime_frame"
  | "story_glass";

export type GalleryBeautySettings = {
  smooth: number;
  glow: number;
  skinTone: number;
  portraitLight: number;
  eyeLight: number;
  lipsTint: number;
  blush: number;
  animeBeauty: number;
};

export type GalleryAdjustSettings = {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  cool: number;
  blur: number;
  vignette: number;
  fade: number;
  sharpen: number;
};

export type GalleryEffectsSettings = {
  sparkles: number;
  bokeh: number;
  lightLeak: number;
  hearts: number;
  dust: number;
  goldLight: number;
  neon: number;
};

export type GalleryAnimeSettings = {
  aura: number;
  mangaLines: number;
  sakura: number;
  kawaiiHearts: number;
  comicFrame: number;
  glowEyes: number;
};

export type GalleryTextSettings = {
  enabled: boolean;
  content: string;
  color: string;
  style: GalleryTextStylePreset;
  size: number;
  opacity: number;
  align: GalleryTextAlignPreset;
  background: boolean;
};

export type GalleryObjectsSettings = {
  stickerPreset: GalleryStickerPreset;
  stickerIntensity: number;
  framePreset: GalleryFramePreset;
  frameIntensity: number;
};

export type GalleryEditSettings = {
  beauty: GalleryBeautySettings;
  adjust: GalleryAdjustSettings;
  effects: GalleryEffectsSettings;
  anime: GalleryAnimeSettings;
  text: GalleryTextSettings;
  objects: GalleryObjectsSettings;
  filterPreset: GalleryFilterPreset;
};

type EditorState = {
  byId: Record<string, GalleryEditSettings>;
  updatedAt: number;
};

const listeners = new Set<() => void>();

const DEFAULT_SETTINGS: GalleryEditSettings = {
  beauty: {
    smooth: 0,
    glow: 0,
    skinTone: 0,
    portraitLight: 0,
    eyeLight: 0,
    lipsTint: 0,
    blush: 0,
    animeBeauty: 0,
  },
  adjust: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    cool: 0,
    blur: 0,
    vignette: 0,
    fade: 0,
    sharpen: 0,
  },
  effects: {
    sparkles: 0,
    bokeh: 0,
    lightLeak: 0,
    hearts: 0,
    dust: 0,
    goldLight: 0,
    neon: 0,
  },
  anime: {
    aura: 0,
    mangaLines: 0,
    sakura: 0,
    kawaiiHearts: 0,
    comicFrame: 0,
    glowEyes: 0,
  },
  text: {
    enabled: false,
    content: "",
    color: "#FFFFFF",
    style: "classic",
    size: 48,
    opacity: 100,
    align: "bottom",
    background: false,
  },
  objects: {
    stickerPreset: "none",
    stickerIntensity: 60,
    framePreset: "none",
    frameIntensity: 70,
  },
  filterPreset: "none",
};

let state: EditorState = {
  byId: {},
  updatedAt: Date.now(),
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function emit() {
  state = {
    ...state,
    updatedAt: Date.now(),
  };
  listeners.forEach((listener) => listener());
}

function mergeSettings(current: GalleryEditSettings, patch: Partial<GalleryEditSettings>): GalleryEditSettings {
  return {
    beauty: { ...current.beauty, ...(patch.beauty ?? {}) },
    adjust: { ...current.adjust, ...(patch.adjust ?? {}) },
    effects: { ...current.effects, ...(patch.effects ?? {}) },
    anime: { ...current.anime, ...(patch.anime ?? {}) },
    text: { ...current.text, ...(patch.text ?? {}) },
    objects: { ...current.objects, ...(patch.objects ?? {}) },
    filterPreset: patch.filterPreset ?? current.filterPreset,
  };
}

export function cloneGalleryEditSettings(settings: GalleryEditSettings): GalleryEditSettings {
  return clone(settings);
}

export function getDefaultGalleryEditSettings(): GalleryEditSettings {
  return clone(DEFAULT_SETTINGS);
}

export function hasVisibleGalleryEdits(settings: GalleryEditSettings): boolean {
  if (settings.filterPreset !== "none") return true;
  if (Object.values(settings.beauty).some((value) => value !== 0)) return true;
  if (Object.values(settings.adjust).some((value) => value !== 0)) return true;
  if (Object.values(settings.effects).some((value) => value !== 0)) return true;
  if (Object.values(settings.anime).some((value) => value !== 0)) return true;
  if (settings.objects.framePreset !== "none") return true;
  if (settings.objects.stickerPreset !== "none") return true;
  return !!(settings.text.enabled && settings.text.content.trim());
}

export const galleryEditorStore = {
  getDefaultSettings(): GalleryEditSettings {
    return getDefaultGalleryEditSettings();
  },

  getSettings(id: string): GalleryEditSettings {
    return state.byId[id] ? clone(state.byId[id]) : getDefaultGalleryEditSettings();
  },

  setSettings(id: string, next: GalleryEditSettings) {
    state = {
      ...state,
      byId: {
        ...state.byId,
        [id]: clone(next),
      },
    };
    emit();
  },

  patchSettings(id: string, patch: Partial<GalleryEditSettings>) {
    const current = this.getSettings(id);
    this.setSettings(id, mergeSettings(current, patch));
  },

  resetSettings(id: string) {
    this.setSettings(id, getDefaultGalleryEditSettings());
  },

  removeSettings(id: string) {
    const next = { ...state.byId };
    delete next[id];
    state = { ...state, byId: next };
    emit();
  },
};

export function getFilterPresetSettings(preset: GalleryFilterPreset): GalleryEditSettings {
  const base = getDefaultGalleryEditSettings();

  switch (preset) {
    case "soft_beauty":
      return {
        ...base,
        filterPreset: preset,
        beauty: {
          ...base.beauty,
          smooth: 44,
          glow: 28,
          skinTone: 24,
          portraitLight: 22,
          eyeLight: 18,
          blush: 12,
        },
        adjust: {
          ...base.adjust,
          brightness: 8,
          saturation: 10,
          warmth: 12,
          fade: 6,
        },
      };
    case "luxury_portrait":
      return {
        ...base,
        filterPreset: preset,
        beauty: {
          ...base.beauty,
          smooth: 26,
          glow: 40,
          portraitLight: 38,
          skinTone: 20,
          eyeLight: 14,
        },
        adjust: {
          ...base.adjust,
          contrast: 14,
          warmth: 10,
          vignette: 14,
          sharpen: 10,
        },
        effects: {
          ...base.effects,
          goldLight: 18,
        },
        objects: {
          ...base.objects,
          framePreset: "luxury_gold",
          frameIntensity: 70,
        },
      };
    case "warm_film":
      return {
        ...base,
        filterPreset: preset,
        adjust: {
          ...base.adjust,
          warmth: 32,
          contrast: 12,
          saturation: 12,
          fade: 18,
          vignette: 16,
        },
        effects: {
          ...base.effects,
          dust: 22,
          lightLeak: 18,
        },
      };
    case "cool_night":
      return {
        ...base,
        filterPreset: preset,
        adjust: {
          ...base.adjust,
          cool: 36,
          contrast: 20,
          saturation: 8,
          vignette: 24,
          brightness: -6,
        },
        effects: {
          ...base.effects,
          neon: 18,
          bokeh: 12,
        },
      };
    case "anime_glow":
      return {
        ...base,
        filterPreset: preset,
        beauty: {
          ...base.beauty,
          glow: 34,
          animeBeauty: 40,
          smooth: 18,
          portraitLight: 20,
        },
        anime: {
          ...base.anime,
          aura: 28,
          glowEyes: 24,
          comicFrame: 10,
        },
        adjust: {
          ...base.adjust,
          saturation: 18,
          cool: 10,
          warmth: 8,
        },
        objects: {
          ...base.objects,
          framePreset: "anime_frame",
          frameIntensity: 72,
        },
      };
    case "pink_dream":
      return {
        ...base,
        filterPreset: preset,
        beauty: {
          ...base.beauty,
          smooth: 30,
          glow: 26,
          blush: 24,
          lipsTint: 18,
          skinTone: 12,
        },
        effects: {
          ...base.effects,
          hearts: 20,
          sparkles: 16,
        },
        adjust: {
          ...base.adjust,
          brightness: 8,
          saturation: 14,
        },
        anime: {
          ...base.anime,
          kawaiiHearts: 18,
          sakura: 14,
        },
        objects: {
          ...base.objects,
          stickerPreset: "hearts",
          stickerIntensity: 70,
        },
      };
    case "gold_glam":
      return {
        ...base,
        filterPreset: preset,
        beauty: {
          ...base.beauty,
          glow: 34,
          portraitLight: 34,
          skinTone: 22,
        },
        effects: {
          ...base.effects,
          goldLight: 36,
          sparkles: 16,
          lightLeak: 18,
        },
        adjust: {
          ...base.adjust,
          warmth: 18,
          contrast: 12,
          saturation: 10,
        },
        objects: {
          ...base.objects,
          framePreset: "luxury_gold",
          frameIntensity: 76,
          stickerPreset: "sparkle_cluster",
          stickerIntensity: 52,
        },
      };
    case "none":
    default:
      return base;
  }
}

export function useGalleryEditorSettings(id: string): GalleryEditSettings {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return snapshot.byId[id] ?? DEFAULT_SETTINGS;
}
