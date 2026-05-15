import React, { useMemo } from "react";
import {
  DimensionValue,
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  GalleryEditSettings,
  GalleryFramePreset,
  GalleryStickerPreset,
} from "./editorStore";

type Props = {
  uri: string;
  width: number;
  height: number;
  settings: GalleryEditSettings;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  transform?: Array<
    | { rotate: string }
    | { scaleX: number }
    | { scaleY: number }
    | { scale: number }
    | { translateX: number }
    | { translateY: number }
  >;
  compareMode?: boolean;
  borderRadius?: number;
};

type Point = { x: string; y: string; size: number; rotate?: string; opacity?: number };

const SPARKLE_POINTS: Point[] = [
  { x: "10%", y: "14%", size: 18, rotate: "12deg" },
  { x: "24%", y: "22%", size: 12, rotate: "-6deg" },
  { x: "76%", y: "18%", size: 16, rotate: "20deg" },
  { x: "82%", y: "32%", size: 12, rotate: "0deg" },
  { x: "18%", y: "72%", size: 12, rotate: "-12deg" },
  { x: "64%", y: "68%", size: 18, rotate: "18deg" },
  { x: "84%", y: "78%", size: 12, rotate: "8deg" },
];

const HEART_POINTS: Point[] = [
  { x: "14%", y: "20%", size: 18 },
  { x: "80%", y: "22%", size: 16 },
  { x: "22%", y: "76%", size: 20 },
  { x: "72%", y: "72%", size: 18 },
];

const DUST_POINTS: Point[] = [
  { x: "16%", y: "18%", size: 3, opacity: 0.7 },
  { x: "32%", y: "14%", size: 2, opacity: 0.4 },
  { x: "48%", y: "22%", size: 3, opacity: 0.5 },
  { x: "66%", y: "26%", size: 2, opacity: 0.35 },
  { x: "80%", y: "16%", size: 3, opacity: 0.45 },
  { x: "14%", y: "60%", size: 2, opacity: 0.3 },
  { x: "30%", y: "70%", size: 3, opacity: 0.4 },
  { x: "58%", y: "78%", size: 2, opacity: 0.3 },
  { x: "84%", y: "66%", size: 3, opacity: 0.5 },
];

const BOKEH_POINTS: Point[] = [
  { x: "-6%", y: "8%", size: 120, opacity: 0.6 },
  { x: "76%", y: "10%", size: 90, opacity: 0.45 },
  { x: "16%", y: "64%", size: 80, opacity: 0.35 },
  { x: "68%", y: "72%", size: 110, opacity: 0.42 },
  { x: "36%", y: "40%", size: 66, opacity: 0.20 },
];

const BOKEH_COLORS = [
  "rgba(255,255,255,0.24)",
  "rgba(255,225,188,0.22)",
  "rgba(184,214,255,0.22)",
  "rgba(255,196,224,0.18)",
  "rgba(255,255,255,0.16)",
] as const;

const SAKURA_POINTS: Point[] = [
  { x: "14%", y: "16%", size: 18, rotate: "14deg" },
  { x: "36%", y: "12%", size: 14, rotate: "-8deg" },
  { x: "72%", y: "22%", size: 18, rotate: "16deg" },
  { x: "82%", y: "54%", size: 16, rotate: "-10deg" },
  { x: "22%", y: "76%", size: 18, rotate: "18deg" },
];

const STAR_POINTS: Point[] = [
  { x: "18%", y: "14%", size: 18 },
  { x: "74%", y: "18%", size: 14 },
  { x: "84%", y: "64%", size: 20 },
  { x: "26%", y: "74%", size: 16 },
];

const CROWN_POINTS: Point[] = [{ x: "40%", y: "10%", size: 34 }];

const BUTTERFLY_POINTS: Point[] = [
  { x: "16%", y: "24%", size: 18, rotate: "-10deg" },
  { x: "76%", y: "28%", size: 18, rotate: "16deg" },
  { x: "24%", y: "68%", size: 18, rotate: "-14deg" },
];

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function overlayOpacity(value: number, multiplier = 1) {
  return clamp01((value / 100) * multiplier);
}

function pointTextStyle(point: Point, color: string, globalOpacity: number): StyleProp<TextStyle> {
  return {
    left: point.x as DimensionValue,
    top: point.y as DimensionValue,
    color,
    fontSize: point.size,
    opacity: Math.min(1, globalOpacity * (point.opacity ?? 1)),
    transform: [{ rotate: point.rotate ?? "0deg" }],
  } satisfies TextStyle;
}

function pointViewStyle(point: Point, opacity: number): StyleProp<ViewStyle> {
  return {
    left: point.x as DimensionValue,
    top: point.y as DimensionValue,
    width: point.size,
    height: point.size,
    opacity,
  } satisfies ViewStyle;
}

function OverlayGlyph({
  symbol,
  points,
  color,
  globalOpacity,
}: {
  symbol: string;
  points: Point[];
  color: string;
  globalOpacity: number;
}) {
  return (
    <>
      {points.map((point, index) => (
        <Text key={`${symbol}-${index}`} pointerEvents="none" style={[styles.glyph, pointTextStyle(point, color, globalOpacity)]}>
          {symbol}
        </Text>
      ))}
    </>
  );
}

function getStickerSymbol(preset: GalleryStickerPreset) {
  switch (preset) {
    case "hearts":
      return "♥";
    case "crown":
      return "♛";
    case "stars":
      return "✦";
    case "petals":
      return "❀";
    case "butterfly":
      return "🦋";
    case "sparkle_cluster":
      return "✦";
    case "none":
    default:
      return "";
  }
}

function getStickerPoints(preset: GalleryStickerPreset) {
  switch (preset) {
    case "hearts":
      return HEART_POINTS;
    case "crown":
      return CROWN_POINTS;
    case "stars":
      return STAR_POINTS;
    case "petals":
      return SAKURA_POINTS;
    case "butterfly":
      return BUTTERFLY_POINTS;
    case "sparkle_cluster":
      return SPARKLE_POINTS;
    case "none":
    default:
      return [];
  }
}

function getStickerColor(preset: GalleryStickerPreset) {
  switch (preset) {
    case "hearts":
      return "#FF7DB2";
    case "crown":
      return "#FFD86A";
    case "stars":
      return "#FFF0A8";
    case "petals":
      return "#FFC7E3";
    case "butterfly":
      return "#C8B2FF";
    case "sparkle_cluster":
    default:
      return "#FFFFFF";
  }
}

function TextOverlay({ settings }: { settings: GalleryEditSettings["text"] }) {
  if (!settings.enabled || !settings.content.trim()) return null;

  const opacity = overlayOpacity(settings.opacity);
  const fontSize = Math.max(18, settings.size);
  const alignStyle =
    settings.align === "top"
      ? styles.textTop
      : settings.align === "center"
      ? styles.textCenter
      : styles.textBottom;

  const textStyle: StyleProp<TextStyle> = {
    color: settings.color,
    fontSize,
    opacity,
  };

  const shadowRadius = settings.style === "glow" ? 16 : settings.style === "outline" ? 10 : 8;
  const shadowColor = settings.style === "glow" ? settings.color : "rgba(0,0,0,0.92)";

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.textWrap]}>
      <View style={[styles.textBubbleWrap, alignStyle, settings.background ? styles.textWithBackground : null]}>
        <Text
          style={[
            styles.textOverlay,
            textStyle,
            {
              textShadowColor: shadowColor,
              textShadowRadius: shadowRadius,
              textShadowOffset: { width: 0, height: 2 },
            },
            settings.style === "bubble" ? styles.textBubbleText : null,
          ]}
        >
          {settings.content}
        </Text>
      </View>
    </View>
  );
}

function StickerOverlay({ settings }: { settings: GalleryEditSettings["objects"] }) {
  if (settings.stickerPreset === "none") return null;
  const symbol = getStickerSymbol(settings.stickerPreset);
  const points = getStickerPoints(settings.stickerPreset);
  const color = getStickerColor(settings.stickerPreset);
  const opacity = overlayOpacity(settings.stickerIntensity, 0.92);

  if (!symbol || !points.length || opacity <= 0) return null;

  return <OverlayGlyph symbol={symbol} points={points} color={color} globalOpacity={opacity} />;
}

function FrameOverlay({
  preset,
  intensity,
  borderRadius,
}: {
  preset: GalleryFramePreset;
  intensity: number;
  borderRadius: number;
}) {
  const value = overlayOpacity(intensity);
  if (preset === "none" || value <= 0) return null;

  if (preset === "luxury_gold") {
    return (
      <>
        <LinearGradient
          pointerEvents="none"
          colors={[
            `rgba(255,232,173,${0.72 * value})`,
            `rgba(193,137,61,${0.62 * value})`,
            `rgba(255,236,188,${0.72 * value})`,
          ]}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        />
        <View pointerEvents="none" style={[styles.innerFrame, { borderRadius: Math.max(8, borderRadius - 10), borderColor: `rgba(255,241,205,${0.84 * value})` }]} />
      </>
    );
  }

  if (preset === "soft_portrait") {
    return (
      <>
        <LinearGradient
          pointerEvents="none"
          colors={[
            `rgba(255,255,255,${0.18 * value})`,
            "transparent",
            `rgba(255,214,235,${0.18 * value})`,
          ]}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        />
        <View pointerEvents="none" style={[styles.innerFrameSoft, { borderRadius: Math.max(8, borderRadius - 8), borderColor: `rgba(255,255,255,${0.56 * value})` }]} />
      </>
    );
  }

  if (preset === "anime_frame") {
    return (
      <>
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { borderRadius, borderWidth: 10, borderColor: `rgba(255,255,255,${0.85 * value})` }]} />
        <View pointerEvents="none" style={[styles.animeFrameBars, styles.animeFrameTop, { opacity: 0.64 * value }]} />
        <View pointerEvents="none" style={[styles.animeFrameBars, styles.animeFrameBottom, { opacity: 0.64 * value }]} />
      </>
    );
  }

  if (preset === "story_glass") {
    return (
      <>
        <LinearGradient
          pointerEvents="none"
          colors={[
            `rgba(255,255,255,${0.24 * value})`,
            `rgba(187,215,255,${0.12 * value})`,
            `rgba(255,255,255,${0.06 * value})`,
          ]}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        />
        <View pointerEvents="none" style={[styles.storyGlassFrame, { borderRadius: Math.max(8, borderRadius - 10), borderColor: `rgba(210,232,255,${0.58 * value})` }]} />
      </>
    );
  }

  return null;
}

export default function GalleryAdjustedPreview({
  uri,
  width,
  height,
  settings,
  resizeMode = "contain",
  transform,
  compareMode = false,
  borderRadius = 0,
}: Props) {
  const blurRadius = useMemo(() => {
    if (compareMode) return 0;
    return Math.round((settings.adjust.blur * 0.06 + settings.beauty.smooth * 0.03) * 10) / 10;
  }, [compareMode, settings.adjust.blur, settings.beauty.smooth]);

  const brightness = compareMode ? 0 : settings.adjust.brightness / 100;
  const contrast = compareMode ? 0 : settings.adjust.contrast / 100;
  const saturation = compareMode ? 0 : settings.adjust.saturation / 100;
  const warmth = compareMode ? 0 : settings.adjust.warmth / 100;
  const cool = compareMode ? 0 : settings.adjust.cool / 100;
  const vignette = compareMode ? 0 : settings.adjust.vignette / 100;
  const glow = compareMode ? 0 : settings.beauty.glow / 100;
  const skinTone = compareMode ? 0 : settings.beauty.skinTone / 100;
  const portraitLight = compareMode ? 0 : settings.beauty.portraitLight / 100;
  const animeBeauty = compareMode ? 0 : settings.beauty.animeBeauty / 100;
  const eyeLight = compareMode ? 0 : settings.beauty.eyeLight / 100;
  const lipsTint = compareMode ? 0 : settings.beauty.lipsTint / 100;
  const blush = compareMode ? 0 : settings.beauty.blush / 100;
  const fade = compareMode ? 0 : settings.adjust.fade / 100;
  const sharpen = compareMode ? 0 : settings.adjust.sharpen / 100;
  const sparkles = compareMode ? 0 : settings.effects.sparkles / 100;
  const bokeh = compareMode ? 0 : settings.effects.bokeh / 100;
  const lightLeak = compareMode ? 0 : settings.effects.lightLeak / 100;
  const hearts = compareMode ? 0 : settings.effects.hearts / 100;
  const dust = compareMode ? 0 : settings.effects.dust / 100;
  const goldLight = compareMode ? 0 : settings.effects.goldLight / 100;
  const neon = compareMode ? 0 : settings.effects.neon / 100;
  const aura = compareMode ? 0 : settings.anime.aura / 100;
  const mangaLines = compareMode ? 0 : settings.anime.mangaLines / 100;
  const sakura = compareMode ? 0 : settings.anime.sakura / 100;
  const kawaiiHearts = compareMode ? 0 : settings.anime.kawaiiHearts / 100;
  const comicFrame = compareMode ? 0 : settings.anime.comicFrame / 100;
  const glowEyes = compareMode ? 0 : settings.anime.glowEyes / 100;

  return (
    <View style={[styles.frame, { width, height, borderRadius }]}> 
      <Image
        source={{ uri }}
        resizeMode={resizeMode}
        blurRadius={blurRadius}
        style={[
          styles.image,
          {
            width,
            height,
            borderRadius,
            transform,
          } as StyleProp<ImageStyle>,
        ]}
      />

      {!compareMode ? (
        <>
          {brightness !== 0 ? (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor:
                    brightness > 0
                      ? `rgba(255,255,255,${0.18 * clamp01(brightness)})`
                      : `rgba(0,0,0,${0.24 * clamp01(Math.abs(brightness))})`,
                  borderRadius,
                },
              ]}
            />
          ) : null}


          {contrast !== 0 ? (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor:
                    contrast > 0
                      ? `rgba(0,0,0,${0.14 * clamp01(contrast)})`
                      : `rgba(255,255,255,${0.10 * clamp01(Math.abs(contrast))})`,
                  borderRadius,
                },
              ]}
            />
          ) : null}

          {saturation !== 0 ? (
            <LinearGradient
              pointerEvents="none"
              colors={
                saturation > 0
                  ? [
                      `rgba(255,86,130,${0.08 * clamp01(saturation)})`,
                      `rgba(255,210,74,${0.06 * clamp01(saturation)})`,
                      `rgba(92,180,255,${0.08 * clamp01(saturation)})`,
                    ]
                  : [
                      `rgba(180,190,210,${0.10 * clamp01(Math.abs(saturation))})`,
                      `rgba(0,0,0,${0.08 * clamp01(Math.abs(saturation))})`,
                      `rgba(180,190,210,${0.10 * clamp01(Math.abs(saturation))})`,
                    ]
              }
              style={[StyleSheet.absoluteFillObject, { borderRadius }]}
            />
          ) : null}

          {warmth > 0 || cool > 0 || skinTone > 0 ? (
            <LinearGradient
              pointerEvents="none"
              colors={[
                `rgba(255,190,136,${0.24 * warmth + 0.16 * skinTone})`,
                `rgba(255,225,202,${0.10 * skinTone})`,
                `rgba(135,188,255,${0.22 * cool})`,
              ]}
              style={[StyleSheet.absoluteFillObject, { borderRadius }]}
            />
          ) : null}

          {fade > 0 ? (
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFillObject, { backgroundColor: `rgba(255,255,255,${0.12 * fade})`, borderRadius }]}
            />
          ) : null}

          {glow > 0 || portraitLight > 0 || goldLight > 0 ? (
            <LinearGradient
              pointerEvents="none"
              colors={[
                `rgba(255,255,255,${0.18 * glow + 0.10 * portraitLight})`,
                `rgba(255,236,203,${0.16 * goldLight + 0.10 * portraitLight})`,
                "transparent",
              ]}
              style={[StyleSheet.absoluteFillObject, { borderRadius }]}
            />
          ) : null}

          {vignette > 0 ? (
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.vignetteWrap, { borderRadius }]}>
              <View style={[StyleSheet.absoluteFillObject, styles.vignetteFill, { opacity: vignette * 0.55 }]} />
            </View>
          ) : null}

          {lightLeak > 0 ? (
            <LinearGradient
              pointerEvents="none"
              colors={[
                `rgba(255,128,79,${0.42 * lightLeak})`,
                `rgba(255,226,168,${0.28 * lightLeak})`,
                "transparent",
              ]}
              style={[styles.lightLeak, { borderRadius }]}
            />
          ) : null}

          {goldLight > 0 ? (
            <LinearGradient
              pointerEvents="none"
              colors={[
                `rgba(255,227,156,${0.26 * goldLight})`,
                "transparent",
                `rgba(255,214,106,${0.24 * goldLight})`,
              ]}
              style={[StyleSheet.absoluteFillObject, { borderRadius }]}
            />
          ) : null}

          {neon > 0 ? (
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.neonFrame, { borderColor: `rgba(141,198,255,${0.78 * neon})`, borderRadius }]} />
          ) : null}

          {sharpen > 0 ? (
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.sharpenWrap, { borderRadius, opacity: 0.24 * sharpen }]} />
          ) : null}

          {animeBeauty > 0 || aura > 0 ? (
            <LinearGradient
              pointerEvents="none"
              colors={[
                `rgba(214,164,255,${0.12 * animeBeauty + 0.18 * aura})`,
                "transparent",
                `rgba(124,173,255,${0.10 * animeBeauty + 0.16 * aura})`,
              ]}
              style={[StyleSheet.absoluteFillObject, { borderRadius }]}
            />
          ) : null}

          {mangaLines > 0 ? <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.mangaLines, { opacity: 0.26 * mangaLines }]} /> : null}
          {comicFrame > 0 ? <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.comicFrame, { opacity: 0.34 * comicFrame, borderRadius }]} /> : null}
          {glowEyes > 0 ? (
            <>
              <View pointerEvents="none" style={[styles.eyeGlow, styles.eyeGlowLeft, { opacity: 0.38 * glowEyes }]} />
              <View pointerEvents="none" style={[styles.eyeGlow, styles.eyeGlowRight, { opacity: 0.38 * glowEyes }]} />
            </>
          ) : null}

          {sparkles > 0 ? (
            <>
              {SPARKLE_POINTS.map((point, index) => (
                <View
                  key={`sparkle-glow-${index}`}
                  pointerEvents="none"
                  style={[
                    styles.sparkleGlow,
                    pointViewStyle({ ...point, size: Math.round(point.size * 1.45) }, 0.18 * sparkles),
                    { borderRadius: Math.round(point.size * 0.72) },
                  ]}
                />
              ))}
              <OverlayGlyph symbol="✦" points={SPARKLE_POINTS} color="#FFFFFF" globalOpacity={sparkles} />
            </>
          ) : null}
          {hearts > 0 ? <OverlayGlyph symbol="♥" points={HEART_POINTS} color="#FF7AB6" globalOpacity={hearts} /> : null}

          {dust > 0 ? (
            <>
              {DUST_POINTS.map((point, index) => (
                <View
                  key={`dust-${index}`}
                  pointerEvents="none"
                  style={[
                    styles.dust,
                    pointViewStyle(point, (point.opacity ?? 0.4) * dust),
                    { backgroundColor: index % 2 === 0 ? "rgba(255,255,255,0.88)" : "rgba(255,224,168,0.74)" },
                  ]}
                />
              ))}
            </>
          ) : null}

          {bokeh > 0 ? (
            <>
              {BOKEH_POINTS.map((point, index) => (
                <View
                  key={`bokeh-${index}`}
                  pointerEvents="none"
                  style={[
                    styles.bokeh,
                    pointViewStyle(point, Math.min(1, (point.opacity ?? 0.4) * bokeh * 1.35)),
                    { borderRadius: point.size / 2, backgroundColor: BOKEH_COLORS[index % BOKEH_COLORS.length] },
                  ]}
                />
              ))}
            </>
          ) : null}

          {sakura > 0 ? <OverlayGlyph symbol="❀" points={SAKURA_POINTS} color="#FFC9E8" globalOpacity={sakura} /> : null}
          {kawaiiHearts > 0 ? <OverlayGlyph symbol="♥" points={HEART_POINTS} color="#FF9FD1" globalOpacity={kawaiiHearts} /> : null}

          <StickerOverlay settings={settings.objects} />
          <FrameOverlay preset={settings.objects.framePreset} intensity={settings.objects.frameIntensity} borderRadius={borderRadius} />
          {(blush > 0 || lipsTint > 0 || eyeLight > 0) ? (
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.faceHintsWrap]}>
              {blush > 0 ? (
                <>
                  <View style={[styles.blushOrb, styles.blushLeft, { opacity: 0.22 * blush }]} />
                  <View style={[styles.blushOrb, styles.blushRight, { opacity: 0.22 * blush }]} />
                </>
              ) : null}
              {eyeLight > 0 ? (
                <>
                  <View style={[styles.eyeLightOrb, styles.eyeLightLeft, { opacity: 0.26 * eyeLight }]} />
                  <View style={[styles.eyeLightOrb, styles.eyeLightRight, { opacity: 0.26 * eyeLight }]} />
                </>
              ) : null}
              {lipsTint > 0 ? <View style={[styles.lipsTint, { opacity: 0.20 * lipsTint }]} /> : null}
            </View>
          ) : null}

          <TextOverlay settings={settings.text} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    backgroundColor: "#071321",
  },
  image: {
    alignSelf: "center",
  },
  glyph: {
    position: "absolute",
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.28)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sparkleGlow: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.34)",
  },
  dust: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 999,
  },
  bokeh: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  lightLeak: {
    position: "absolute",
    top: -8,
    left: "-8%",
    width: "54%",
    height: "112%",
    transform: [{ rotate: "-14deg" }],
  },
  vignetteWrap: {
    overflow: "hidden",
  },
  vignetteFill: {
    backgroundColor: "rgba(0,0,0,0.46)",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  neonFrame: {
    borderWidth: 5,
  },
  sharpenWrap: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  mangaLines: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  comicFrame: {
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.92)",
  },
  animeFrameBars: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: "#071321",
  },
  animeFrameTop: { top: 22 },
  animeFrameBottom: { bottom: 22 },
  eyeGlow: {
    position: "absolute",
    top: "39%",
    width: 54,
    height: 14,
    borderRadius: 10,
    backgroundColor: "rgba(173,220,255,0.95)",
  },
  eyeGlowLeft: { left: "31%" },
  eyeGlowRight: { right: "31%" },
  faceHintsWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  blushOrb: {
    position: "absolute",
    top: "58%",
    width: 54,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#FF9BBE",
  },
  blushLeft: { left: "21%" },
  blushRight: { right: "21%" },
  eyeLightOrb: {
    position: "absolute",
    top: "38%",
    width: 42,
    height: 14,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
  },
  eyeLightLeft: { left: "30%" },
  eyeLightRight: { right: "30%" },
  lipsTint: {
    position: "absolute",
    top: "67%",
    width: 68,
    height: 18,
    borderRadius: 10,
    backgroundColor: "#FF86A7",
  },
  textWrap: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  textBubbleWrap: {
    maxWidth: "88%",
  },
  textOverlay: {
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  textTop: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
  textCenter: {
    alignSelf: "center",
    marginTop: "42%",
  },
  textBottom: {
    alignSelf: "center",
    marginTop: "76%",
  },
  textWithBackground: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(7,19,33,0.42)",
  },
  textBubbleText: {
    textTransform: "uppercase",
  },
  innerFrame: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 2,
  },
  innerFrameSoft: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 1.5,
  },
  storyGlassFrame: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 1.5,
  },
});
