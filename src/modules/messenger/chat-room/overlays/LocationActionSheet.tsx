import React, { useCallback, useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "../../../../shared/i18n";
import LOCALES from "../../../../shared/i18n/locales";

export type LocationProviderId =
  | "sabi_navigator"
  | "sabi_taxi"
  | "yandex_maps"
  | "google_maps";

export type ProviderRuntimeItem = {
  id: LocationProviderId;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  premium?: boolean;
  available?: boolean;
  etaMinutes?: number | null;
};

type Props = {
  visible: boolean;
  accent: string;
  title: string;
  subtitle?: string;
  live?: boolean;
  onClose: () => void;
  onSelect: (provider: LocationProviderId) => void;
  providers?: ProviderRuntimeItem[];
};

type ProviderItem = {
  id: LocationProviderId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  premium?: boolean;
  available?: boolean;
  etaMinutes?: number | null;
};

function isTranslationTree(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTranslationValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isTranslationTree(acc)) return undefined;
    return acc[key];
  }, source);
}

function normalizeLocaleCode(input?: string | null) {
  return String(input ?? "").trim().replace(/_/g, "-").toLowerCase();
}

function getLocaleTree(code?: string | null) {
  const locales = LOCALES as Record<string, Record<string, unknown>>;
  const normalized = normalizeLocaleCode(code);
  if (!normalized) return null;

  const exactEntry = Object.entries(locales).find(
    ([key]) => normalizeLocaleCode(key) === normalized,
  );
  if (exactEntry) return exactEntry[1];

  const baseCode = normalized.split("-")[0];
  const baseEntry = Object.entries(locales).find(
    ([key]) => normalizeLocaleCode(key) === baseCode,
  );
  return baseEntry?.[1] ?? null;
}

function getFirstLocalizedValue(locale: Record<string, unknown> | null, keys: string[]) {
  for (const key of keys) {
    const value = getTranslationValue(locale, key);
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function hexToRgb(color: string) {
  const value = String(color || "").trim();
  if (!value.startsWith("#")) return null;
  let hex = value.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }

  if (hex.length !== 6) return null;

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((item) => Number.isNaN(item))) return null;
  return { r, g, b };
}

function withAlpha(color: string, alpha: number) {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const rgb = hexToRgb(color);
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${safeAlpha})`;
  }

  const rgbMatch = color.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${safeAlpha})`;
  }

  const rgbaMatch = color.match(
    /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${safeAlpha})`;
  }

  return color;
}

export function LocationActionSheet({
  visible,
  accent,
  title,
  subtitle,
  live = false,
  onClose,
  onSelect,
  providers,
}: Props) {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();

  const activeLocale = useMemo(() => getLocaleTree(language), [language]);
  const russianLocale = useMemo(() => getLocaleTree("ru"), []);
  const englishLocale = useMemo(() => getLocaleTree("en"), []);

  const tx = useCallback((keys: string[], fallback: string) => {
    return (
      getFirstLocalizedValue(activeLocale, keys) ??
      getFirstLocalizedValue(russianLocale, keys) ??
      getFirstLocalizedValue(englishLocale, keys) ??
      fallback
    );
  }, [activeLocale, englishLocale, russianLocale]);

  const texts = useMemo(() => ({
    fallbackSubtitle: tx(["chatRoom.location.chooseProvider"], "Choose map or service"),
    live: tx(["common.live"], "LIVE"),
    navigatorTitle: tx(["chatRoom.location.providers.sabiNavigator.title"], "Sabi Navigator"),
    navigatorSubtitle: tx(["chatRoom.location.providers.sabiNavigator.subtitle"], "Open this point in Sabi Navigator"),
    taxiTitle: tx(["chatRoom.location.providers.sabiTaxi.title"], "Sabi Taxi"),
    taxiSubtitle: tx(["chatRoom.location.providers.sabiTaxi.subtitle"], "Order Sabi Taxi to this point"),
    yandexTitle: tx(["chatRoom.location.providers.yandex.title"], "Yandex Maps"),
    yandexSubtitle: tx(["chatRoom.location.providers.yandex.subtitle"], "Open this point in Yandex Maps"),
    googleTitle: tx(["chatRoom.location.providers.google.title"], "Google Maps"),
    googleSubtitle: tx(["chatRoom.location.providers.google.subtitle"], "Open this point in Google Maps"),
    eta: tx(["chatRoom.location.eta"], "min"),
    unavailable: tx(["common.unavailable"], "Unavailable"),
    premium: tx(["common.premium"], "Premium"),
  }), [tx]);

  const fallbackProviders = useMemo<ProviderItem[]>(() => [
    { id: "sabi_navigator", title: texts.navigatorTitle, subtitle: texts.navigatorSubtitle, icon: "navigate-outline", premium: true, available: true },
    { id: "sabi_taxi", title: texts.taxiTitle, subtitle: texts.taxiSubtitle, icon: "car-outline", premium: true, available: true },
    { id: "yandex_maps", title: texts.yandexTitle, subtitle: texts.yandexSubtitle, icon: "map-outline", available: true },
    { id: "google_maps", title: texts.googleTitle, subtitle: texts.googleSubtitle, icon: "earth-outline", available: true },
  ], [texts]);

  const providerMap = useMemo<Record<LocationProviderId, ProviderItem>>(
    () =>
      fallbackProviders.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as Record<LocationProviderId, ProviderItem>),
    [fallbackProviders],
  );

  const effectiveProviders = useMemo<ProviderItem[]>(
    () =>
      (providers?.length ? providers : fallbackProviders).map((item) => {
        const fallback = providerMap[item.id];
        return {
          ...fallback,
          ...item,
          title: item.title || fallback.title,
          subtitle: item.subtitle || fallback.subtitle,
          icon: item.icon || fallback.icon,
          available: item.available ?? true,
        };
      }),
    [fallbackProviders, providerMap, providers],
  );

  const safeAccent = accent || "#56F3C1";
  const accentSoft = withAlpha(safeAccent, 0.18);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <LinearGradient
            colors={[
              withAlpha(accentSoft, 0.24),
              "rgba(14,31,27,0.98)",
              "rgba(7,18,16,0.96)",
            ]}
            style={[styles.card, { borderColor: withAlpha(safeAccent, 0.14) }]}
          >
            <View style={[styles.glowTop, { backgroundColor: withAlpha(safeAccent, 0.10) }]} />
            <View style={[styles.glowBottom, { backgroundColor: withAlpha(safeAccent, 0.08) }]} />

            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <View style={styles.headerTitleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                  {live ? (
                    <View style={[styles.liveBadge, { borderColor: withAlpha(safeAccent, 0.18) }]}>
                      <View style={[styles.liveDot, { backgroundColor: safeAccent }]} />
                      <Text style={styles.liveBadgeText}>{texts.live}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle || texts.fallbackSubtitle}
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButtonWrap,
                  pressed ? styles.pressed : undefined,
                ]}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                  style={[styles.closeButton, { borderColor: withAlpha(safeAccent, 0.14) }]}
                >
                  <Ionicons name="close" size={15} color="#F6FFF9" />
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.list}>
              {effectiveProviders.map((item) => {
                const iconColor = item.premium ? "#FFF7DE" : safeAccent;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => item.available !== false && onSelect(item.id)}
                    style={({ pressed }) => [
                      styles.itemWrap,
                      pressed && item.available !== false ? styles.pressed : undefined,
                    ]}
                    disabled={item.available === false}
                  >
                    <LinearGradient
                      colors={
                        item.premium
                          ? [withAlpha(safeAccent, 0.18), "rgba(255,255,255,0.04)"]
                          : ["rgba(255,255,255,0.045)", "rgba(255,255,255,0.02)"]
                      }
                      style={[
                        styles.item,
                        item.premium
                          ? { borderColor: withAlpha(safeAccent, 0.20) }
                          : { borderColor: withAlpha(safeAccent, 0.10) },
                        item.available === false ? styles.itemDisabled : undefined,
                      ]}
                    >
                      <View
                        style={[
                          styles.itemIconWrap,
                          item.premium
                            ? {
                                backgroundColor: withAlpha(safeAccent, 0.14),
                                borderColor: withAlpha(safeAccent, 0.18),
                              }
                            : {
                                backgroundColor: withAlpha(safeAccent, 0.10),
                                borderColor: withAlpha(safeAccent, 0.14),
                              },
                        ]}
                      >
                        <Ionicons name={item.icon} size={17} color={iconColor} />
                      </View>

                      <View style={styles.itemTextWrap}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          {item.premium ? (
                            <View style={[styles.premiumPill, { borderColor: withAlpha(safeAccent, 0.18) }]}>
                              <Text style={styles.premiumPillText}>{texts.premium}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.itemMeta} numberOfLines={2}>
                          {item.available === false ? texts.unavailable : item.subtitle}
                        </Text>
                      </View>

                      {item.etaMinutes ? (
                        <View style={[styles.etaPill, { borderColor: withAlpha(safeAccent, 0.12) }]}>
                          <Text style={styles.etaPillText}>
                            {item.etaMinutes} {texts.eta}
                          </Text>
                        </View>
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="rgba(246,255,249,0.72)"
                        />
                      )}
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,8,7,0.22)",
    justifyContent: "flex-end",
  },
  wrap: {
    paddingHorizontal: 10,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -24,
    right: -18,
    width: 150,
    height: 120,
    borderRadius: 999,
  },
  glowBottom: {
    position: "absolute",
    left: -28,
    bottom: -16,
    width: 150,
    height: 120,
    borderRadius: 999,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: {
    color: "#F6FFF9",
    fontSize: 14,
    fontWeight: "900",
    flexShrink: 1,
  },
  subtitle: {
    marginTop: 3,
    color: "rgba(232,255,246,0.58)",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
  },
  closeButtonWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  list: {
    paddingTop: 2,
  },
  itemWrap: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 9,
  },
  item: {
    minHeight: 64,
    borderRadius: 18,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  itemDisabled: {
    opacity: 0.55,
  },
  itemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  itemTextWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  itemTitle: {
    color: "#F6FFF9",
    fontSize: 13,
    fontWeight: "800",
    flexShrink: 1,
  },
  itemMeta: {
    marginTop: 2,
    color: "rgba(232,255,246,0.58)",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
  },
  liveBadge: {
    marginLeft: 8,
    minHeight: 20,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    marginRight: 5,
  },
  liveBadgeText: {
    color: "#F6FFF9",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  premiumPill: {
    marginLeft: 8,
    minHeight: 18,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumPillText: {
    color: "#FFF7DE",
    fontSize: 8,
    fontWeight: "900",
  },
  etaPill: {
    minWidth: 54,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  etaPillText: {
    color: "#F6FFF9",
    fontSize: 9,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});

export default LocationActionSheet;

