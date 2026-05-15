
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Trash2,
} from "lucide-react-native";

import { useI18n } from "../src/shared/i18n";
import {
  clearMessengerWallpaper,
  getMessengerThemePalette,
  getMessengerThemeState,
  setMessengerThemeState,
  type MessengerThemeId,
  type MessengerThemePalette,
  type MessengerThemeState,
} from "../src/modules/messenger/theme/messengerThemeRuntime";

const THEME_CANDIDATES = [
  "brand",
  "violet",
  "ocean",
  "sunset",
  "tiger_night",
  "lion_gold",
  "bear_forest",
  "anime_neon",
  "anime_sakura",
  "space_orbit",
  "ocean_deep",
  "mountain_mist",
] as const;

const THEME_MOODS: Record<string, string> = {
  brand: "signature sabi glass",
  violet: "neon premium glow",
  ocean: "cold deep current",
  sunset: "warm luxury dusk",
  tiger_night: "predator amber glow",
  lion_gold: "royal dusk luxury",
  bear_forest: "earthy forest power",
  anime_neon: "cyber glow pulse",
  anime_sakura: "soft romantic bloom",
  space_orbit: "cosmic orbit blue",
  ocean_deep: "cold abyss current",
  mountain_mist: "cold dusk altitude",
};

const TEXT_MAIN = "#F7FFFB";
const TEXT_SECONDARY = "rgba(232,255,246,0.76)";
const GLASS_BORDER = "rgba(255,255,255,0.10)";

function ensureColors(value: unknown, fallback: [string, string]): [string, string] {
  if (Array.isArray(value) && value.length >= 2) {
    const first = typeof value[0] === "string" ? value[0] : fallback[0];
    const second = typeof value[1] === "string" ? value[1] : fallback[1];
    return [first, second];
  }
  return fallback;
}

function ensureBackground(
  value: unknown,
  fallback: [string, string, string, string],
): [string, string, string, string] {
  if (Array.isArray(value) && value.length >= 4) {
    return [
      typeof value[0] === "string" ? value[0] : fallback[0],
      typeof value[1] === "string" ? value[1] : fallback[1],
      typeof value[2] === "string" ? value[2] : fallback[2],
      typeof value[3] === "string" ? value[3] : fallback[3],
    ];
  }
  return fallback;
}

function getSurfaceColors(palette: MessengerThemePalette): [string, string] {
  const anyPalette = palette as MessengerThemePalette & {
    surface?: [string, string];
    card?: [string, string];
  };

  return ensureColors(anyPalette.surface ?? anyPalette.card, [
    "rgba(12,39,32,0.90)",
    "rgba(9,29,24,0.82)",
  ]);
}

function getRaisedColors(palette: MessengerThemePalette): [string, string] {
  const anyPalette = palette as MessengerThemePalette & {
    surfaceRaised?: [string, string];
    cardSoft?: [string, string];
  };

  return ensureColors(anyPalette.surfaceRaised ?? anyPalette.cardSoft, [
    "rgba(255,255,255,0.08)",
    "rgba(255,255,255,0.03)",
  ]);
}

function getAccent(palette: MessengerThemePalette, fallback = "#1ED7A5") {
  return typeof palette.accent === "string" ? palette.accent : fallback;
}

function getAccentSoft(palette: MessengerThemePalette, fallback = "#D7FFF1") {
  return typeof palette.accentSoft === "string" ? palette.accentSoft : fallback;
}

function getTextMain(palette: MessengerThemePalette, fallback = TEXT_MAIN) {
  return typeof palette.textMain === "string" ? palette.textMain : fallback;
}

function getTextSecondary(palette: MessengerThemePalette, fallback = TEXT_SECONDARY) {
  return typeof palette.textSecondary === "string" ? palette.textSecondary : fallback;
}

function getPaletteSignature(palette: MessengerThemePalette) {
  const anyPalette = palette as MessengerThemePalette & { id?: string; title?: string };
  return String(anyPalette.id || anyPalette.title || "theme");
}

function getPaletteTitle(palette: MessengerThemePalette, fallback: string) {
  const anyPalette = palette as MessengerThemePalette & { title?: string };
  return typeof anyPalette.title === "string" && anyPalette.title.trim()
    ? anyPalette.title
    : fallback;
}

type ThemeDescriptor = {
  key: string;
  applyId: MessengerThemeId;
  palette: MessengerThemePalette;
  title: string;
  mood: string;
};

function ThemePreviewCard({
  item,
  selected,
  onPress,
}: {
  item: ThemeDescriptor;
  selected: boolean;
  onPress: () => void;
}) {
  const background = ensureBackground((item.palette as MessengerThemePalette).background, [
    "#03110E",
    "#061714",
    "#0A211B",
    "#0D2821",
  ]);
  const cardColors = getSurfaceColors(item.palette);
  const accent = getAccent(item.palette);
  const accentSoft = getAccentSoft(item.palette);

  return (
    <Pressable
      style={({ pressed }) => [styles.themeWrap, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.cardShadow} />
      <LinearGradient
        colors={cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.themeCard}
      >
        <View style={styles.cardGlass} />
        <LinearGradient
          colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardShine}
        />

        <LinearGradient
          colors={background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.themePreview}
        >
          <View style={styles.themePreviewTopGlow} />
          <View
            style={[
              styles.themePreviewAccent,
              { backgroundColor: accent },
            ]}
          />
          <View style={styles.themePreviewBubbleA} />
          <View style={styles.themePreviewBubbleB} />
          <View style={styles.themePreviewBubbleC} />
        </LinearGradient>

        <View style={styles.themeTextWrap}>
          <Text style={styles.themeTitle}>{item.title}</Text>
          <Text style={styles.themeSubtitle}>{item.mood}</Text>
        </View>

        <View style={styles.themeTrailing}>
          {selected ? (
            <View style={styles.selectedPill}>
              <Check size={17} color={accentSoft} strokeWidth={2.6} />
            </View>
          ) : (
            <Text style={styles.applyText}>Qo‘llash</Text>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function MessengerThemeScreen() {
  const { t } = useI18n();
  const [state, setState] = useState<MessengerThemeState>(getMessengerThemeState());

  const txAny = useCallback(
    (keys: string[], fallback = "") => {
      for (const key of keys) {
        const value = t(key);
        if (typeof value === "string" && value.trim() && value !== key) {
          return value;
        }
      }
      return fallback;
    },
    [t],
  );

  useFocusEffect(
    useCallback(() => {
      setState(getMessengerThemeState());
    }, []),
  );

  const palette = useMemo<MessengerThemePalette>(
    () => getMessengerThemePalette(state.themeId),
    [state.themeId],
  );

  const currentSignature = useMemo(() => getPaletteSignature(palette), [palette]);

  const themeItems = useMemo<ThemeDescriptor[]>(() => {
    const seen = new Set<string>();
    const items: ThemeDescriptor[] = [];

    for (const candidate of THEME_CANDIDATES) {
      const applyId = candidate as unknown as MessengerThemeId;
      const itemPalette = getMessengerThemePalette(applyId);
      const signature = getPaletteSignature(itemPalette);

      if (seen.has(signature)) continue;
      seen.add(signature);

      items.push({
        key: signature,
        applyId,
        palette: itemPalette,
        title: getPaletteTitle(itemPalette, candidate),
        mood: THEME_MOODS[candidate] || "premium messenger style",
      });
    }

    return items;
  }, []);

  const paletteBackground = ensureBackground(palette.background, [
    "#03110E",
    "#061714",
    "#0A211B",
    "#0D2821",
  ]);
  const paletteCard = getSurfaceColors(palette);
  const paletteRaised = getRaisedColors(palette);
  const paletteAccent = getAccent(palette);
  const paletteAccentSoft = getAccentSoft(palette);
  const paletteTextMain = getTextMain(palette);
  const paletteTextSecondary = getTextSecondary(palette);

  const texts = useMemo(
    () => ({
      title: txAny(["messenger.theme.screenTitle", "messenger.themeWallpaper"], "Mavzu va fon rasmi"),
      subtitle: txAny(["messenger.theme.screenSubtitle"], "Sabi Messenger uchun yagona uslub, mavzular va fon rasmlari."),
      livePreview: txAny(["common.preview"], "Preview"),
      themeBlock: txAny(["messenger.theme.title"], "Themes"),
      wallpaperBlock: txAny(["messenger.wallpaper.title"], "Wallpaper"),
      chooseWallpaper: txAny(["messenger.theme.chooseWallpaper"], "Fon rasmi tanlash"),
      replaceWallpaper: txAny(["messenger.theme.replaceWallpaper"], "Fon rasmini almashtirish"),
      removeWallpaper: txAny(["messenger.theme.removeWallpaper"], "Fon rasmini olib tashlash"),
      wallpaperActive: txAny(["status.active", "common.enabled"], "Active"),
      saved: txAny(["common.save"], "Saved"),
      noWallpaper: txAny(["messenger.theme.noWallpaper"], "Fon rasmi tanlanmagan"),
      useThemeBackground: txAny(["messenger.theme.useThemeBackground"], "Mavzu fonidan foydalanish"),
    }),
    [txAny],
  );

  const applyTheme = async (themeId: MessengerThemeId) => {
    const next: MessengerThemeState = {
      ...state,
      themeId,
    };

    setState(next);
    await Promise.resolve(setMessengerThemeState(next) as unknown);
    setState(getMessengerThemeState());
  };

  const pickWallpaper = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert(texts.title, texts.chooseWallpaper);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const next: MessengerThemeState = {
      ...state,
      wallpaperUri: result.assets[0].uri,
    };

    setState(next);
    await Promise.resolve(setMessengerThemeState(next) as unknown);
    setState(getMessengerThemeState());
  };

  const removeWallpaper = async () => {
    await Promise.resolve(clearMessengerWallpaper() as unknown);
    setState(getMessengerThemeState());
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={paletteBackground}
        start={{ x: 0.04, y: 0.02 }}
        end={{ x: 0.96, y: 1 }}
        style={styles.background}
      >
        <View style={styles.topGlow} />
        <View style={styles.sideGlow} />
        <View style={styles.bottomGlow} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable style={styles.headerButton} onPress={() => router.back()}>
              {({ pressed }) => (
                <LinearGradient
                  colors={paletteRaised}
                  style={[styles.headerButtonFill, pressed && styles.pressed]}
                >
                  <View style={styles.headerButtonGlass} />
                  <ArrowLeft size={20} color={paletteTextMain} strokeWidth={2.3} />
                </LinearGradient>
              )}
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>{texts.title}</Text>
              <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroWrap}>
            <View style={styles.cardShadow} />
            <LinearGradient
              colors={paletteCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.cardGlass} />
              <LinearGradient
                colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardShine}
              />

              <View style={styles.heroPreviewWrap}>
                {state.wallpaperUri ? (
                  <ImageBackground
                    source={{ uri: state.wallpaperUri }}
                    style={styles.heroPreview}
                    imageStyle={styles.heroPreviewImage}
                    resizeMode="cover"
                  >
                    <LinearGradient
                      colors={["rgba(7,12,20,0.18)", "rgba(7,12,20,0.34)"]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.heroPreviewBubbleA} />
                    <View style={styles.heroPreviewBubbleB} />
                  </ImageBackground>
                ) : (
                  <LinearGradient
                    colors={paletteBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroPreview}
                  >
                    <View style={styles.heroPreviewTopGlow} />
                    <View
                      style={[
                        styles.heroPreviewAccent,
                        { backgroundColor: paletteAccent },
                      ]}
                    />
                    <View style={styles.heroPreviewBubbleA} />
                    <View style={styles.heroPreviewBubbleB} />
                  </LinearGradient>
                )}
              </View>

              <View style={styles.heroTextWrap}>
                <View style={styles.heroTag}>
                  <Sparkles size={14} color={paletteAccentSoft} strokeWidth={2.3} />
                  <Text style={styles.heroTagText}>{texts.livePreview}</Text>
                </View>

                <Text style={styles.heroTitle}>{getPaletteTitle(palette, state.themeId)}</Text>
                <Text style={styles.heroSubtitle}>
                  {THEME_MOODS[state.themeId] || "premium messenger style"}
                </Text>

                <View style={styles.heroMetaRow}>
                  <View style={styles.heroMetaPill}>
                    <Palette size={13} color={paletteAccentSoft} strokeWidth={2.3} />
                    <Text style={styles.heroMetaText}>{texts.themeBlock}</Text>
                  </View>

                  <View style={styles.heroMetaPill}>
                    <ImageIcon size={13} color={paletteAccentSoft} strokeWidth={2.3} />
                    <Text style={styles.heroMetaText}>
                      {state.wallpaperUri ? texts.wallpaperActive : texts.useThemeBackground}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.blockWrap}>
            <Text style={styles.blockTitle}>{texts.themeBlock}</Text>

            {themeItems.map((item) => (
              <ThemePreviewCard
                key={item.key}
                item={item}
                selected={currentSignature === item.key}
                onPress={() => void applyTheme(item.applyId)}
              />
            ))}
          </View>

          <View style={styles.blockWrap}>
            <Text style={styles.blockTitle}>{texts.wallpaperBlock}</Text>

            <Pressable
              style={({ pressed }) => [styles.actionWrap, pressed && styles.pressed]}
              onPress={() => void pickWallpaper()}
            >
              <View style={styles.cardShadow} />
              <LinearGradient
                colors={paletteCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionCard}
              >
                <View style={styles.cardGlass} />
                <LinearGradient
                  colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardShine}
                />

                <View style={styles.actionIconWrap}>
                  <ImageIcon size={18} color={paletteAccentSoft} strokeWidth={2.3} />
                </View>

                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>
                    {state.wallpaperUri ? texts.replaceWallpaper : texts.chooseWallpaper}
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    {state.wallpaperUri ? texts.saved : texts.noWallpaper}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionWrap, pressed && styles.pressed]}
              onPress={() => void removeWallpaper()}
            >
              <View style={styles.cardShadow} />
              <LinearGradient
                colors={["rgba(73,19,28,0.96)", "rgba(40,12,18,0.92)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionCard}
              >
                <View style={styles.cardGlass} />
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.00)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardShine}
                />

                <View style={[styles.actionIconWrap, styles.actionDangerIconWrap]}>
                  <Trash2 size={18} color="#FFD4DC" strokeWidth={2.3} />
                </View>

                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>{texts.removeWallpaper}</Text>
                  <Text style={styles.actionSubtitle}>{texts.useThemeBackground}</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  safeArea: { flex: 1, backgroundColor: "#03110E" },
  background: { flex: 1 },

  topGlow: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(35, 210, 160, 0.16)",
  },
  sideGlow: {
    position: "absolute",
    top: 180,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(105,255,198,0.08)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: 60,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: "rgba(25, 138, 108, 0.12)",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  headerButtonFill: {
    flex: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerButtonGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    color: TEXT_MAIN,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2,
  },
  headerSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },

  heroWrap: {
    borderRadius: 28,
    marginBottom: 18,
  },
  cardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 10 }, { scaleX: 0.96 }],
  },
  heroCard: {
    borderRadius: 28,
    minHeight: 210,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: "hidden",
    padding: 14,
  },
  cardGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardShine: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPreviewWrap: {
    width: "100%",
    height: 112,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 14,
  },
  heroPreview: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  heroPreviewImage: {
    borderRadius: 22,
  },
  heroPreviewTopGlow: {
    position: "absolute",
    top: -18,
    right: -10,
    width: 120,
    height: 80,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroPreviewAccent: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 5,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  heroPreviewBubbleA: {
    position: "absolute",
    top: 18,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroPreviewBubbleB: {
    position: "absolute",
    bottom: 14,
    left: 22,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  heroTextWrap: {
    flex: 1,
  },
  heroTag: {
    alignSelf: "flex-start",
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  heroTagText: {
    marginLeft: 6,
    color: TEXT_MAIN,
    fontSize: 12,
    fontWeight: "900",
  },
  heroTitle: {
    color: TEXT_MAIN,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 12,
  },
  heroSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    fontWeight: "700",
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  heroMetaPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroMetaText: {
    marginLeft: 6,
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "800",
  },

  blockWrap: {
    marginBottom: 18,
  },
  blockTitle: {
    color: TEXT_MAIN,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },

  themeWrap: {
    borderRadius: 24,
    marginBottom: 12,
  },
  themeCard: {
    minHeight: 110,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: "hidden",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  themePreview: {
    width: 78,
    height: 78,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 12,
  },
  themePreviewTopGlow: {
    position: "absolute",
    top: -10,
    right: -6,
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  themePreviewAccent: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  themePreviewBubbleA: {
    position: "absolute",
    top: 16,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  themePreviewBubbleB: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  themePreviewBubbleC: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  themeTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  themeTitle: {
    color: TEXT_MAIN,
    fontSize: 17,
    fontWeight: "900",
  },
  themeSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "700",
  },
  themeTrailing: {
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  applyText: {
    color: TEXT_MAIN,
    fontSize: 12,
    fontWeight: "900",
  },

  actionWrap: {
    borderRadius: 24,
    marginBottom: 12,
  },
  actionCard: {
    minHeight: 92,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginRight: 12,
  },
  actionDangerIconWrap: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    color: TEXT_MAIN,
    fontSize: 16,
    fontWeight: "900",
  },
  actionSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
    fontWeight: "700",
  },

  pressed: {
    transform: [{ scale: 0.988 }],
    opacity: 0.97,
  },
});
