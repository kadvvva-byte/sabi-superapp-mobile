import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import {
  ArrowLeft,
  Check,
  Contrast,
  FlipHorizontal2,
  FlipVertical2,
  Image as ImageIcon,
  Palette,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  Square,
  RectangleVertical,
  Smartphone,
  Type,
  Wand2,
  Crown,
  Shield,
} from "lucide-react-native";
import * as ImageManipulator from "expo-image-manipulator";

import { useI18n } from "../../src/shared/i18n";
import { galleryStore, useGalleryItems } from "../../src/modules/gallery/store";
import GalleryAdjustedPreview from "../../src/modules/gallery/GalleryAdjustedPreview";
import {
  GalleryEditSettings,
  GalleryFilterPreset,
  GalleryFramePreset,
  GalleryTextAlignPreset,
  GalleryTextStylePreset,
  cloneGalleryEditSettings,
  galleryEditorStore,
  getDefaultGalleryEditSettings,
  getFilterPresetSettings,
  useGalleryEditorSettings,
} from "../../src/modules/gallery/editorStore";

type CropPreset = "original" | "square" | "portrait" | "story";
type EditorTab = "text" | "beauty" | "effects" | "anime" | "adjust" | "crop" | "transform";

const FILTER_OPTIONS: Array<{ id: GalleryFilterPreset; title: string; subtitle: string }> = [
  { id: "none", title: "Original", subtitle: "Clean base" },
  { id: "soft_beauty", title: "Soft Beauty", subtitle: "Smooth + glow" },
  { id: "luxury_portrait", title: "Luxury", subtitle: "Premium portrait" },
  { id: "warm_film", title: "Warm Film", subtitle: "Gold and film" },
  { id: "cool_night", title: "Cool Night", subtitle: "Blue premium" },
  { id: "anime_glow", title: "Anime Glow", subtitle: "Stylized beauty" },
  { id: "pink_dream", title: "Pink Dream", subtitle: "Cute soft style" },
  { id: "gold_glam", title: "Gold Glam", subtitle: "Luxury shine" },
];

const TEXT_COLORS = ["#FFFFFF", "#FFE08A", "#FF8CC5", "#8BD5FF", "#B8FF7D", "#D7C2FF", "#FFB28F", "#0F172A"];
const QUICK_TEXTS = ["queen", "sabiMood", "dream", "luxury", "angel", "animeGirl"] as const;

const TEXT_PRESETS: Array<{
  id: string;
  title: string;
  patch: Partial<GalleryEditSettings["text"]>;
}> = [
  {
    id: "luxury",
    title: "Luxury",
    patch: { content: "Luxury", enabled: true, color: "#FFE5A3", style: "glow", size: 56, background: true, align: "bottom" },
  },
  {
    id: "neon",
    title: "Neon",
    patch: { content: "Night Vibe", enabled: true, color: "#8BD5FF", style: "glow", size: 52, background: false, align: "center" },
  },
  {
    id: "soft",
    title: "Soft",
    patch: { content: "Soft Beauty", enabled: true, color: "#FFFFFF", style: "classic", size: 46, background: true, align: "bottom" },
  },
  {
    id: "comic",
    title: "Comic",
    patch: { content: "Wow!", enabled: true, color: "#FFFFFF", style: "outline", size: 60, background: false, align: "top" },
  },
  {
    id: "anime",
    title: "Anime",
    patch: { content: "Kawaii", enabled: true, color: "#FF9BD4", style: "bubble", size: 54, background: true, align: "center" },
  },
];

const EFFECT_STYLE_PRESETS = [
  {
    id: "clean",
    title: "Clean",
    subtitle: "Natural finish",
    beauty: { glow: 0, portraitLight: 0, smooth: 0 },
    adjust: { contrast: 0, saturation: 0, warmth: 0, cool: 0, vignette: 0, sharpen: 0, fade: 0, brightness: 0 },
    effects: { sparkles: 0, bokeh: 0, lightLeak: 0, hearts: 0, dust: 0, goldLight: 0, neon: 0 },
  },
  {
    id: "studio_soft",
    title: "Studio Soft",
    subtitle: "Soft portrait light",
    beauty: { glow: 22, portraitLight: 28, smooth: 10 },
    adjust: { contrast: 8, saturation: 8, warmth: 8, cool: 0, vignette: 8, sharpen: 8, fade: 3, brightness: 4 },
    effects: { sparkles: 0, bokeh: 34, lightLeak: 6, hearts: 0, dust: 0, goldLight: 4, neon: 0 },
  },
  {
    id: "portrait_pro",
    title: "Portrait Pro",
    subtitle: "Balanced premium look",
    beauty: { glow: 16, portraitLight: 34, smooth: 8 },
    adjust: { contrast: 16, saturation: 10, warmth: 3, cool: 0, vignette: 16, sharpen: 18, fade: 0, brightness: 2 },
    effects: { sparkles: 0, bokeh: 22, lightLeak: 0, hearts: 0, dust: 6, goldLight: 8, neon: 0 },
  },
  {
    id: "cinematic",
    title: "Cinematic",
    subtitle: "Film light and depth",
    beauty: { glow: 4, portraitLight: 10, smooth: 0 },
    adjust: { contrast: 24, saturation: -8, warmth: 12, cool: 0, vignette: 34, sharpen: 12, fade: 10, brightness: -4 },
    effects: { sparkles: 0, bokeh: 8, lightLeak: 42, hearts: 0, dust: 28, goldLight: 4, neon: 0 },
  },
  {
    id: "luxe_gold",
    title: "Luxe Gold",
    subtitle: "Warm luxury shine",
    beauty: { glow: 18, portraitLight: 22, smooth: 4 },
    adjust: { contrast: 14, saturation: 14, warmth: 22, cool: 0, vignette: 18, sharpen: 10, fade: 0, brightness: 2 },
    effects: { sparkles: 10, bokeh: 18, lightLeak: 12, hearts: 0, dust: 8, goldLight: 48, neon: 0 },
  },
  {
    id: "crystal",
    title: "Crystal",
    subtitle: "Clear glossy highlight",
    beauty: { glow: 12, portraitLight: 18, smooth: 0 },
    adjust: { contrast: 18, saturation: 6, warmth: 0, cool: 8, vignette: 10, sharpen: 28, fade: 0, brightness: 4 },
    effects: { sparkles: 34, bokeh: 8, lightLeak: 4, hearts: 0, dust: 0, goldLight: 4, neon: 12 },
  },
  {
    id: "editorial",
    title: "Editorial",
    subtitle: "Clean fashion mood",
    beauty: { glow: 0, portraitLight: 16, smooth: 0 },
    adjust: { contrast: 30, saturation: -14, warmth: 0, cool: 10, vignette: 20, sharpen: 26, fade: 4, brightness: 0 },
    effects: { sparkles: 0, bokeh: 4, lightLeak: 0, hearts: 0, dust: 18, goldLight: 0, neon: 0 },
  },
  {
    id: "neon_edge",
    title: "Neon Edge",
    subtitle: "Night accent",
    beauty: { glow: 6, portraitLight: 8, smooth: 0 },
    adjust: { contrast: 24, saturation: 18, warmth: 0, cool: 22, vignette: 26, sharpen: 20, fade: 0, brightness: -3 },
    effects: { sparkles: 0, bokeh: 8, lightLeak: 10, hearts: 0, dust: 0, goldLight: 0, neon: 56 },
  },
] as const;

const FRAME_OPTIONS: Array<{ id: GalleryFramePreset; title: string; Icon: typeof Square }> = [
  { id: "none", title: "None", Icon: Shield },
  { id: "luxury_gold", title: "Luxury", Icon: Crown },
  { id: "soft_portrait", title: "Soft", Icon: Square },
  { id: "anime_frame", title: "Anime", Icon: Sparkles },
  { id: "story_glass", title: "Story", Icon: Smartphone },
];

const TAB_CONFIG: Array<{ id: EditorTab; title: string; Icon: typeof Type }> = [
  { id: "text", title: "Text", Icon: Type },
  { id: "beauty", title: "Beauty", Icon: Sparkles },
  { id: "effects", title: "Effects", Icon: Wand2 },
  { id: "anime", title: "Anime", Icon: Palette },
  { id: "adjust", title: "Adjust", Icon: SlidersHorizontal },
  { id: "crop", title: "Crop", Icon: Scissors },
  { id: "transform", title: "Transform", Icon: ImageIcon },
];

function getCropRect(
  width: number,
  height: number,
  preset: CropPreset
): { originX: number; originY: number; width: number; height: number } | null {
  if (preset === "original") return null;
  const aspect = preset === "square" ? 1 : preset === "portrait" ? 4 / 5 : 9 / 16;
  const sourceAspect = width / height;

  if (sourceAspect > aspect) {
    const cropWidth = Math.round(height * aspect);
    const originX = Math.round((width - cropWidth) / 2);
    return { originX, originY: 0, width: cropWidth, height };
  }

  const cropHeight = Math.round(width / aspect);
  const originY = Math.round((height - cropHeight) / 2);
  return { originX: 0, originY, width, height: cropHeight };
}

function isVideoItem(uri: string, mimeType?: string | null) {
  if (mimeType?.startsWith("video/")) return true;
  const value = uri.toLowerCase();
  return value.endsWith(".mp4") || value.endsWith(".mov") || value.endsWith(".m4v") || value.endsWith(".webm");
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function SliderRow({
  title,
  value,
  onChange,
  min = 0,
  max = 100,
  accent = "#8BD5FF",
}: {
  title: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  accent?: string;
}) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderTitle}>{title}</Text>
        <Text style={styles.sliderValue}>{Math.round(value)}</Text>
      </View>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={min}
        maximumValue={max}
        minimumTrackTintColor={accent}
        maximumTrackTintColor="rgba(255,255,255,0.14)"
      />
    </View>
  );
}

function OptionChip({
  active,
  title,
  onPress,
}: {
  active: boolean;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.optionChip, active && styles.optionChipActive]}>
      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{title}</Text>
    </Pressable>
  );
}

export default function GalleryEditScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();
  const galleryItems = useGalleryItems();

  const item = useMemo(() => {
    const id = typeof params.id === "string" ? params.id : "";
    return galleryItems.find((entry) => entry.id === id) ?? null;
  }, [galleryItems, params.id]);

  const storedSettings = useGalleryEditorSettings(item?.id ?? "__missing__");

  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [cropPreset, setCropPreset] = useState<CropPreset>("original");
  const [activeTab, setActiveTab] = useState<EditorTab>("text");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedEffectStyle, setSelectedEffectStyle] = useState<(typeof EFFECT_STYLE_PRESETS)[number]["id"] | "custom">("clean");
  const [isSaving, setIsSaving] = useState(false);
  const [draftSettings, setDraftSettings] = useState<GalleryEditSettings>(() =>
    cloneGalleryEditSettings(storedSettings)
  );

  useEffect(() => {
    if (!item) return;
    setDraftSettings(cloneGalleryEditSettings(storedSettings));
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setCropPreset("original");
    setSelectedEffectStyle("clean");
  }, [item?.id]);

  const previewTransform = [
    { rotate: `${rotation}deg` },
    { scaleX: flipHorizontal ? -1 : 1 },
    { scaleY: flipVertical ? -1 : 1 },
  ] as const;

  const previewFrame = useMemo(() => {
    const maxWidth = Math.min(width - 20, 460);
    const maxHeight = Math.max(360, Math.min(height * 0.56, 580));

    if (!item) return { width: maxWidth, height: maxHeight };

    const safeWidth = Math.max(item.width || 1, 1);
    const safeHeight = Math.max(item.height || 1, 1);
    const imageRatio = safeWidth / safeHeight;
    const frameRatio = maxWidth / maxHeight;
    if (imageRatio > frameRatio) {
      return { width: maxWidth, height: maxWidth / imageRatio };
    }
    return { width: maxHeight * imageRatio, height: maxHeight };
  }, [height, item, width]);

  const cropOverlayStyle = useMemo(() => {
    if (!item || cropPreset === "original") return null;
    const frameWidth = previewFrame.width;
    const frameHeight = previewFrame.height;
    const aspect = cropPreset === "square" ? 1 : cropPreset === "portrait" ? 4 / 5 : 9 / 16;
    const currentAspect = frameWidth / frameHeight;

    if (currentAspect > aspect) {
      return { width: frameHeight * aspect, height: frameHeight };
    }
    return { width: frameWidth, height: frameWidth / aspect };
  }, [cropPreset, item, previewFrame.height, previewFrame.width]);

  const markCustom = (settings: GalleryEditSettings) =>
    settings.filterPreset === "none" ? settings.filterPreset : "none";

  const updateBeauty = (key: keyof GalleryEditSettings["beauty"], value: number) => {
    setDraftSettings((prev) => ({
      ...prev,
      beauty: { ...prev.beauty, [key]: value },
      filterPreset: markCustom(prev),
    }));
  };

  const updateAdjust = (key: keyof GalleryEditSettings["adjust"], value: number) => {
    setDraftSettings((prev) => ({
      ...prev,
      adjust: { ...prev.adjust, [key]: value },
      filterPreset: markCustom(prev),
    }));
  };

  const updateEffects = (key: keyof GalleryEditSettings["effects"], value: number) => {
    setSelectedEffectStyle("custom");
    setDraftSettings((prev) => ({
      ...prev,
      effects: { ...prev.effects, [key]: value },
      filterPreset: markCustom(prev),
    }));
  };

  const updateAnime = (key: keyof GalleryEditSettings["anime"], value: number) => {
    setDraftSettings((prev) => ({
      ...prev,
      anime: { ...prev.anime, [key]: value },
      filterPreset: markCustom(prev),
    }));
  };

  const updateText = (patch: Partial<GalleryEditSettings["text"]>) => {
    setDraftSettings((prev) => ({
      ...prev,
      text: { ...prev.text, ...patch },
    }));
  };

  const updateObjects = (patch: Partial<GalleryEditSettings["objects"]>) => {
    setDraftSettings((prev) => ({
      ...prev,
      objects: { ...prev.objects, ...patch },
      filterPreset: markCustom(prev),
    }));
  };

  const applyFilterPreset = (preset: GalleryFilterPreset) => {
    setDraftSettings(getFilterPresetSettings(preset));
  };

  const applyEffectStyle = (styleId: (typeof EFFECT_STYLE_PRESETS)[number]["id"]) => {
    const preset = EFFECT_STYLE_PRESETS.find((entry) => entry.id === styleId);
    if (!preset) return;
    setSelectedEffectStyle(styleId);
    setDraftSettings((prev) => ({
      ...prev,
      beauty: { ...prev.beauty, ...preset.beauty },
      adjust: { ...prev.adjust, ...preset.adjust },
      objects: { ...prev.objects, stickerPreset: "none", stickerIntensity: 0 },
      effects: { ...prev.effects, ...preset.effects },
      filterPreset: markCustom(prev),
    }));
  };

  const applyTextPreset = (patch: Partial<GalleryEditSettings["text"]>) => {
    updateText(patch);
  };

  const handleReset = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setCropPreset("original");
    setSelectedEffectStyle("clean");
    setDraftSettings(getDefaultGalleryEditSettings());
  };

  const handleSave = async () => {
    if (!item || isSaving) return;

    try {
      setIsSaving(true);
      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const rotatedWidth = normalizedRotation === 90 || normalizedRotation === 270 ? item.height : item.width;
      const rotatedHeight = normalizedRotation === 90 || normalizedRotation === 270 ? item.width : item.height;
      const cropRect = getCropRect(rotatedWidth, rotatedHeight, cropPreset);

      const actions: ImageManipulator.Action[] = [];
      if (rotation !== 0) actions.push({ rotate: rotation });
      if (flipHorizontal) actions.push({ flip: ImageManipulator.FlipType.Horizontal });
      if (flipVertical) actions.push({ flip: ImageManipulator.FlipType.Vertical });
      if (cropRect) actions.push({ crop: cropRect });

      const result = await ImageManipulator.manipulateAsync(item.uri, actions, {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      galleryStore.updateItem(item.id, {
        uri: result.uri,
        width: result.width,
        height: result.height,
      });

      galleryEditorStore.setSettings(item.id, draftSettings);
      router.replace(`/gallery?id=${encodeURIComponent(item.id)}&viewer=1` as never);
    } catch {
      Alert.alert(t("gallery.editor.saveErrorTitle"), t("gallery.editor.saveErrorMessage"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={["#020814", "#071321", "#0A1D3C"]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.missingWrap}>
            <Text style={styles.missingTitle}>{t("gallery.editor.missing")}</Text>
            
            <Pressable onPress={() => router.back()} style={styles.primaryButton}>
              <ArrowLeft size={18} color="#071321" />
              <Text style={styles.primaryButtonText}>{t("common.back")}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isVideoItem(item.uri, item.mimeType ?? null)) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={["#020814", "#071321", "#0A1D3C"]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.missingWrap}>
            <Text style={styles.missingTitle}>{t("gallery.editor.videoEditorUnavailable")}</Text>
            
            <Pressable onPress={() => router.back()} style={styles.primaryButton}>
              <ArrowLeft size={18} color="#071321" />
              <Text style={styles.primaryButtonText}>{t("common.back")}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const renderTextTab = () => (
    <>
      <SectionCard>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t("gallery.editor.textOverlay")}</Text>
          <Pressable
            onPress={() => updateText({ enabled: !draftSettings.text.enabled })}
            style={[styles.pillToggle, draftSettings.text.enabled && styles.pillToggleActive]}
          >
            <Text style={[styles.pillToggleText, draftSettings.text.enabled && styles.pillToggleTextActive]}>
              {draftSettings.text.enabled ? t("common.on") : t("common.off")}
            </Text>
          </Pressable>
        </View>

        <TextInput
          value={draftSettings.text.content}
          onChangeText={(value) =>
            updateText({
              content: value,
              enabled: value.trim().length > 0 ? true : draftSettings.text.enabled,
            })
          }
          placeholder={t("gallery.editor.textPlaceholder")}
          placeholderTextColor="rgba(226,235,255,0.36)"
          style={styles.textInput}
          multiline
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {QUICK_TEXTS.map((quick) => (
            <Pressable key={quick} onPress={() => updateText({ content: t(`gallery.editor.quick.${quick}`), enabled: true })} style={styles.quickChip}>
              <Text style={styles.quickChipText}>{t(`gallery.editor.quick.${quick}`)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>{t("gallery.editor.textPresets")}</Text>
        
        <View style={styles.chipGrid}>
          {TEXT_PRESETS.map((preset) => (
            <Pressable key={preset.id} onPress={() => applyTextPreset(preset.patch)} style={styles.toolTile}>
              <Type size={18} color="#F8FAFC" />
              <Text style={styles.toolTileText}>{t(`gallery.editor.textPresetsMap.${preset.id}`)}</Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>{t("gallery.editor.textStyle")}</Text>
        <View style={styles.chipGrid}>
          {(["classic", "glow", "outline", "bubble"] as GalleryTextStylePreset[]).map((stylePreset) => {
            const active = draftSettings.text.style === stylePreset;
            return <OptionChip key={stylePreset} active={active} title={t(`gallery.editor.textStyles.${stylePreset}`)} onPress={() => updateText({ style: stylePreset, enabled: true })} />;
          })}
        </View>

        <Text style={[styles.sectionTitle, styles.sectionBlockTitle]}>{t("gallery.editor.color")}</Text>
        <View style={styles.colorRow}>
          {TEXT_COLORS.map((color) => {
            const active = draftSettings.text.color === color;
            return (
              <Pressable
                key={color}
                onPress={() => updateText({ color, enabled: true })}
                style={[styles.colorChip, active && styles.colorChipActive, { backgroundColor: color }]}
              />
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, styles.sectionBlockTitle]}>{t("gallery.editor.position")}</Text>
        <View style={styles.chipGrid}>
          {(["top", "center", "bottom"] as GalleryTextAlignPreset[]).map((align) => {
            const active = draftSettings.text.align === align;
            return <OptionChip key={align} active={active} title={t(`gallery.editor.align.${align}`)} onPress={() => updateText({ align, enabled: true })} />;
          })}
        </View>

        <View style={styles.inlineActions}>
          <Pressable
            onPress={() => updateText({ background: !draftSettings.text.background, enabled: true })}
            style={[styles.inlineActionChip, draftSettings.text.background && styles.inlineActionChipActive]}
          >
            <Text style={[styles.inlineActionText, draftSettings.text.background && styles.inlineActionTextActive]}>{t("gallery.editor.background")}</Text>
          </Pressable>
        </View>

        <SliderRow title={t("gallery.editor.size")} value={draftSettings.text.size} onChange={(value) => updateText({ size: Math.round(value), enabled: true })} min={18} max={84} accent="#FFB7D8" />
        <SliderRow title={t("gallery.editor.opacity")} value={draftSettings.text.opacity} onChange={(value) => updateText({ opacity: Math.round(value), enabled: true })} accent="#FFB7D8" />
      </SectionCard>
    </>
  );

  const renderBeautyTab = () => (
    <SectionCard>
      <Text style={styles.sectionTitle}>{t("gallery.editor.beautyStudio")}</Text>
      
      <SliderRow title={t("gallery.editor.smoothSkin")} value={draftSettings.beauty.smooth} onChange={(value) => updateBeauty("smooth", Math.round(value))} accent="#FFB7D8" />
      <SliderRow title={t("gallery.editor.softGlow")} value={draftSettings.beauty.glow} onChange={(value) => updateBeauty("glow", Math.round(value))} accent="#FFB7D8" />
      <SliderRow title={t("gallery.editor.skinTone")} value={draftSettings.beauty.skinTone} onChange={(value) => updateBeauty("skinTone", Math.round(value))} accent="#FFB7D8" />
      <SliderRow title={t("gallery.editor.portraitLight")} value={draftSettings.beauty.portraitLight} onChange={(value) => updateBeauty("portraitLight", Math.round(value))} accent="#FFB7D8" />
      <SliderRow title={t("gallery.editor.eyesLight")} value={draftSettings.beauty.eyeLight} onChange={(value) => updateBeauty("eyeLight", Math.round(value))} accent="#FFB7D8" />
      <SliderRow title={t("gallery.editor.lipsTint")} value={draftSettings.beauty.lipsTint} onChange={(value) => updateBeauty("lipsTint", Math.round(value))} accent="#FFB7D8" />
      <SliderRow title={t("gallery.editor.blush")} value={draftSettings.beauty.blush} onChange={(value) => updateBeauty("blush", Math.round(value))} accent="#FFB7D8" />
      <SliderRow title={t("gallery.editor.animeBeauty")} value={draftSettings.beauty.animeBeauty} onChange={(value) => updateBeauty("animeBeauty", Math.round(value))} accent="#FFB7D8" />
    </SectionCard>
  );

  const renderEffectsTab = () => (
    <>
      <SectionCard>
        <Text style={styles.sectionTitle}>{t("gallery.editor.effects")}</Text>
        <View style={styles.filterGrid}>
          {EFFECT_STYLE_PRESETS.map((preset) => {
            const active = selectedEffectStyle === preset.id;
            return (
              <Pressable key={preset.id} onPress={() => applyEffectStyle(preset.id)} style={[styles.filterCard, active && styles.filterCardActive]}>
                <Text style={[styles.filterTitle, active && styles.filterTitleActive]}>{preset.title}</Text>
                <Text style={[styles.filterSubtitle, active && styles.filterSubtitleActive]}>{preset.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>{t("gallery.editor.adjust")}</Text>
        <SliderRow title={t("gallery.editor.bokeh")} value={draftSettings.effects.bokeh} onChange={(value) => updateEffects("bokeh", Math.round(value))} accent="#E8D6FF" />
        <SliderRow title={t("gallery.editor.lightLeak")} value={draftSettings.effects.lightLeak} onChange={(value) => updateEffects("lightLeak", Math.round(value))} accent="#FFD38D" />
        <SliderRow title={t("gallery.editor.dust")} value={draftSettings.effects.dust} onChange={(value) => updateEffects("dust", Math.round(value))} accent="#C9D4E5" />
        <SliderRow title={t("gallery.editor.goldLight")} value={draftSettings.effects.goldLight} onChange={(value) => updateEffects("goldLight", Math.round(value))} accent="#FFE08A" />
        <SliderRow title={t("gallery.editor.sparkles")} value={draftSettings.effects.sparkles} onChange={(value) => updateEffects("sparkles", Math.round(value))} accent="#9FE4FF" />
        <SliderRow title={t("gallery.editor.neonEdge")} value={draftSettings.effects.neon} onChange={(value) => updateEffects("neon", Math.round(value))} accent="#8DB7FF" />
      </SectionCard>
    </>
  );

  const renderAnimeTab = () => (
    <>
      <SectionCard>
        <Text style={styles.sectionTitle}>{t("gallery.editor.frames")}</Text>
        
        <View style={styles.chipGrid}>
          {FRAME_OPTIONS.map(({ id, title, Icon }) => {
            const active = draftSettings.objects.framePreset === id;
            return (
              <Pressable key={id} onPress={() => updateObjects({ framePreset: id })} style={[styles.toolTile, active && styles.toolTileActive]}>
                <Icon size={18} color={active ? "#071321" : "#F8FAFC"} />
                <Text style={[styles.toolTileText, active && styles.toolTileTextActive]}>{t(`gallery.editor.option.${id}`)}</Text>
              </Pressable>
            );
          })}
        </View>
        <SliderRow title={t("gallery.editor.frameIntensity")} value={draftSettings.objects.frameIntensity} onChange={(value) => updateObjects({ frameIntensity: Math.round(value) })} accent="#B9C8FF" />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>{t("gallery.editor.animeLayer")}</Text>
        
        <SliderRow title={t("gallery.editor.aura")} value={draftSettings.anime.aura} onChange={(value) => updateAnime("aura", Math.round(value))} accent="#B9C8FF" />
        <SliderRow title={t("gallery.editor.mangaLines")} value={draftSettings.anime.mangaLines} onChange={(value) => updateAnime("mangaLines", Math.round(value))} accent="#B9C8FF" />
        <SliderRow title={t("gallery.editor.sakura")} value={draftSettings.anime.sakura} onChange={(value) => updateAnime("sakura", Math.round(value))} accent="#B9C8FF" />
        <SliderRow title={t("gallery.editor.kawaiiHearts")} value={draftSettings.anime.kawaiiHearts} onChange={(value) => updateAnime("kawaiiHearts", Math.round(value))} accent="#B9C8FF" />
        <SliderRow title={t("gallery.editor.comicFrame")} value={draftSettings.anime.comicFrame} onChange={(value) => updateAnime("comicFrame", Math.round(value))} accent="#B9C8FF" />
        <SliderRow title={t("gallery.editor.glowEyes")} value={draftSettings.anime.glowEyes} onChange={(value) => updateAnime("glowEyes", Math.round(value))} accent="#B9C8FF" />
      </SectionCard>
    </>
  );

  const renderAdjustTab = () => (
    <>
      <SectionCard>
        <Text style={styles.sectionTitle}>{t("gallery.editor.filterLooks")}</Text>
        
        <View style={styles.filterGrid}>
          {FILTER_OPTIONS.map((option) => {
            const active = draftSettings.filterPreset === option.id;
            return (
              <Pressable key={option.id} onPress={() => applyFilterPreset(option.id)} style={[styles.filterCard, active && styles.filterCardActive]}>
                <Text style={[styles.filterTitle, active && styles.filterTitleActive]}>{t(`gallery.editor.filters.${option.id}`)}</Text>
                
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>{t("gallery.editor.adjust")}</Text>
        
        <SliderRow title={t("gallery.editor.brightness")} value={draftSettings.adjust.brightness} onChange={(value) => updateAdjust("brightness", Math.round(value))} min={-40} max={40} />
        <SliderRow title={t("gallery.editor.contrast")} value={draftSettings.adjust.contrast} onChange={(value) => updateAdjust("contrast", Math.round(value))} />
        <SliderRow title={t("gallery.editor.saturation")} value={draftSettings.adjust.saturation} onChange={(value) => updateAdjust("saturation", Math.round(value))} />
        <SliderRow title={t("gallery.editor.warmth")} value={draftSettings.adjust.warmth} onChange={(value) => updateAdjust("warmth", Math.round(value))} />
        <SliderRow title={t("gallery.editor.cool")} value={draftSettings.adjust.cool} onChange={(value) => updateAdjust("cool", Math.round(value))} />
        <SliderRow title={t("gallery.editor.blur")} value={draftSettings.adjust.blur} onChange={(value) => updateAdjust("blur", Math.round(value))} />
        <SliderRow title={t("gallery.editor.vignette")} value={draftSettings.adjust.vignette} onChange={(value) => updateAdjust("vignette", Math.round(value))} />
        <SliderRow title={t("gallery.editor.fade")} value={draftSettings.adjust.fade} onChange={(value) => updateAdjust("fade", Math.round(value))} />
        <SliderRow title={t("gallery.editor.sharpen")} value={draftSettings.adjust.sharpen} onChange={(value) => updateAdjust("sharpen", Math.round(value))} />
      </SectionCard>
    </>
  );

  const renderCropTab = () => (
    <SectionCard>
      <Text style={styles.sectionTitle}>{t("gallery.editor.crop")}</Text>
      <View style={styles.chipGrid}>
        {([
          { id: "original", title: "Original", Icon: RefreshCw },
          { id: "square", title: "Square", Icon: Square },
          { id: "portrait", title: "4:5", Icon: RectangleVertical },
          { id: "story", title: "9:16", Icon: Smartphone },
        ] as Array<{ id: CropPreset; title: string; Icon: typeof RefreshCw }>).map(({ id, title, Icon }) => {
          const active = cropPreset === id;
          return (
            <Pressable key={id} onPress={() => setCropPreset(id)} style={[styles.toolTile, active && styles.toolTileActive]}>
              <Icon size={18} color={active ? "#071321" : "#F8FAFC"} />
              <Text style={[styles.toolTileText, active && styles.toolTileTextActive]}>{t(`gallery.editor.option.${id}`)}</Text>
            </Pressable>
          );
        })}
      </View>
    </SectionCard>
  );

  const renderTransformTab = () => (
    <SectionCard>
      <Text style={styles.sectionTitle}>{t("gallery.editor.transform")}</Text>
      <View style={styles.chipGrid}>
        <Pressable onPress={() => setRotation((prev) => prev - 90)} style={styles.toolTile}>
          <RotateCcw size={18} color="#F8FAFC" />
          <Text style={styles.toolTileText}>{t("gallery.editor.left")}</Text>
        </Pressable>
        <Pressable onPress={() => setRotation((prev) => prev + 90)} style={styles.toolTile}>
          <RotateCw size={18} color="#F8FAFC" />
          <Text style={styles.toolTileText}>{t("gallery.editor.right")}</Text>
        </Pressable>
        <Pressable onPress={() => setFlipHorizontal((prev) => !prev)} style={[styles.toolTile, flipHorizontal && styles.toolTileActive]}>
          <FlipHorizontal2 size={18} color={flipHorizontal ? "#071321" : "#F8FAFC"} />
          <Text style={[styles.toolTileText, flipHorizontal && styles.toolTileTextActive]}>{t("gallery.editor.mirrorX")}</Text>
        </Pressable>
        <Pressable onPress={() => setFlipVertical((prev) => !prev)} style={[styles.toolTile, flipVertical && styles.toolTileActive]}>
          <FlipVertical2 size={18} color={flipVertical ? "#071321" : "#F8FAFC"} />
          <Text style={[styles.toolTileText, flipVertical && styles.toolTileTextActive]}>{t("gallery.editor.mirrorY")}</Text>
        </Pressable>
      </View>
    </SectionCard>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "text":
        return renderTextTab();
      case "beauty":
        return renderBeautyTab();
      case "effects":
        return renderEffectsTab();
      case "anime":
        return renderAnimeTab();
      case "adjust":
        return renderAdjustTab();
      case "crop":
        return renderCropTab();
      case "transform":
        return renderTransformTab();
      default:
        return renderTextTab();
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#020814", "#071321", "#0A1D3C"]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.topButton}>
            <ArrowLeft size={20} color="#F8FAFC" />
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>{t("gallery.editor.title")}</Text>
            
          </View>

          <Pressable
            onPressIn={() => setCompareMode(true)}
            onPressOut={() => setCompareMode(false)}
            onLongPress={() => setCompareMode(true)}
            style={[styles.compareButton, compareMode && styles.compareButtonActive]}
          >
            <Contrast size={18} color={compareMode ? "#071321" : "#F8FAFC"} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
          <View style={styles.previewOuter}>
            <View style={[styles.previewCard, { width: previewFrame.width, height: previewFrame.height }]}>
              <GalleryAdjustedPreview
                uri={item.uri}
                width={previewFrame.width}
                height={previewFrame.height}
                settings={draftSettings}
                resizeMode="contain"
                transform={previewTransform as unknown as any}
                compareMode={compareMode}
                borderRadius={28}
              />

              {cropOverlayStyle ? (
                <View style={styles.cropOverlayWrap} pointerEvents="none">
                  <View style={[styles.cropOverlay, { width: cropOverlayStyle.width, height: cropOverlayStyle.height }]} />
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.editorShell}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {TAB_CONFIG.map(({ id, title, Icon }) => {
                const active = activeTab === id;
                return (
                  <Pressable key={id} onPress={() => setActiveTab(id)} style={[styles.tabChip, active && styles.tabChipActive]}>
                    <Icon size={16} color={active ? "#071321" : "#F8FAFC"} />
                    <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{t(`gallery.editor.tabs.${id}`)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.panelCard}>{renderActiveTab()}</View>

            <View style={styles.footerRow}>
              <Pressable onPress={handleReset} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>{t("common.reset")}</Text>
              </Pressable>

              <Pressable onPress={handleSave} disabled={isSaving} style={[styles.saveAction, isSaving && styles.saveActionDisabled]}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#071321" />
                ) : (
                  <>
                    <Check size={18} color="#071321" />
                    <Text style={styles.saveActionText}>{t("common.save")}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020814" },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  compareButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  compareButtonActive: {
    backgroundColor: "#B8D3FF",
    borderColor: "#B8D3FF",
  },
  titleWrap: { flex: 1, minHeight: 42, justifyContent: "center" },
  title: { color: "#F8FAFC", fontSize: 18, fontWeight: "900" },
  subtitle: { color: "rgba(220,232,255,0.72)", fontSize: 12, fontWeight: "600", marginTop: 2 },
  previewOuter: { paddingHorizontal: 10, paddingTop: 0, paddingBottom: 6, alignItems: "center", justifyContent: "center" },
  previewCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  cropOverlayWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  cropOverlay: { borderWidth: 2, borderColor: "#B8D3FF", borderRadius: 18, backgroundColor: "rgba(184,211,255,0.06)" },
  editorShell: { paddingHorizontal: 10, paddingTop: 2 },
  tabsRow: { paddingBottom: 7, gap: 7 },
  tabChip: {
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabChipActive: { backgroundColor: "#B8D3FF", borderColor: "#B8D3FF" },
  tabChipText: { color: "#F8FAFC", fontSize: 11, fontWeight: "900" },
  tabChipTextActive: { color: "#071321" },
  panelCard: {
    borderRadius: 22,
    backgroundColor: "rgba(4,14,32,0.88)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sectionCard: { gap: 6 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  sectionTitle: { color: "#F8FAFC", fontSize: 14, fontWeight: "900" },
  sectionSubtitle: { color: "rgba(220,232,255,0.70)", fontSize: 13, lineHeight: 19, marginTop: 2 },
  sectionBlockTitle: { marginTop: 6 },
  pillToggle: {
    minHeight: 28,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillToggleActive: { backgroundColor: "#B8D3FF" },
  pillToggleText: { color: "#F8FAFC", fontSize: 11, fontWeight: "900" },
  pillToggleTextActive: { color: "#071321" },
  textInput: {
    minHeight: 58,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    textAlignVertical: "top",
  },
  quickRow: { gap: 8, paddingTop: 2 },
  quickChip: {
    minHeight: 31,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickChipText: { color: "#F8FAFC", fontSize: 11, fontWeight: "800" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  optionChip: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionChipActive: { backgroundColor: "#B8D3FF", borderColor: "#B8D3FF" },
  optionChipText: { color: "#F8FAFC", fontSize: 11, fontWeight: "800" },
  optionChipTextActive: { color: "#071321" },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
  },
  colorChipActive: { borderColor: "#FFFFFF", transform: [{ scale: 1.06 }] },
  inlineActions: { flexDirection: "row", gap: 8 },
  inlineActionChip: {
    minHeight: 31,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineActionChipActive: { backgroundColor: "#B8D3FF", borderColor: "#B8D3FF" },
  inlineActionText: { color: "#F8FAFC", fontSize: 12, fontWeight: "800" },
  inlineActionTextActive: { color: "#071321" },
  sliderRow: { marginTop: 2 },
  sliderHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  sliderTitle: { color: "#F8FAFC", fontSize: 13, fontWeight: "800" },
  sliderValue: { color: "rgba(220,232,255,0.74)", fontSize: 13, fontWeight: "900" },
  toolTile: {
    width: "32%",
    minHeight: 46,
    borderRadius: 15,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  toolTileActive: { backgroundColor: "#B8D3FF", borderColor: "#B8D3FF" },
  toolTileText: { color: "#F8FAFC", fontSize: 10, fontWeight: "900", textAlign: "center" },
  toolTileTextActive: { color: "#071321" },
  filterGrid: { gap: 6 },
  filterCard: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
  },
  filterCardActive: { backgroundColor: "#B8D3FF", borderColor: "#B8D3FF" },
  filterTitle: { color: "#F8FAFC", fontSize: 12.5, fontWeight: "900" },
  filterTitleActive: { color: "#071321" },
  filterSubtitle: { color: "rgba(220,232,255,0.70)", fontSize: 12, fontWeight: "700", marginTop: 2 },
  filterSubtitleActive: { color: "rgba(7,19,33,0.76)" },
  footerRow: { flexDirection: "row", gap: 10, marginTop: 8, paddingBottom: 2 },
  resetButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(190,214,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: { color: "#F8FAFC", fontSize: 14, fontWeight: "900" },
  saveAction: {
    flex: 1.35,
    minHeight: 46,
    borderRadius: 18,
    backgroundColor: "#B8D3FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveActionDisabled: { opacity: 0.75 },
  saveActionText: { color: "#071321", fontSize: 14, fontWeight: "900" },
  missingWrap: { flex: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  missingTitle: { color: "#F8FAFC", fontSize: 24, fontWeight: "900", marginBottom: 8, textAlign: "center" },
  missingText: { color: "rgba(220,232,255,0.78)", fontSize: 14, lineHeight: 22, textAlign: "center", marginBottom: 18 },
  primaryButton: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 18,
    backgroundColor: "#B8D3FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: { color: "#071321", fontSize: 14, fontWeight: "900" },
});
