import React, { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Crosshair, MapPin, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "../../../../shared/i18n";
import LOCALES from "../../../../shared/i18n/locales";

type TranslationTree = Record<string, unknown>;

function isTranslationTree(value: unknown): value is TranslationTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTranslationValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isTranslationTree(acc)) return undefined;
    return acc[key];
  }, source);
}

function normalizeLocaleCode(input?: string | null) {
  return String(input ?? "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function getLocaleTree(code?: string | null): TranslationTree | null {
  const locales = LOCALES as Record<string, TranslationTree>;
  const normalized = normalizeLocaleCode(code);
  if (!normalized) return null;

  const exactEntry = Object.entries(locales).find(
    ([key]) => normalizeLocaleCode(key) === normalized,
  );
  if (exactEntry) return exactEntry[1];

  const base = normalized.split("-")[0];
  const baseEntry = Object.entries(locales).find(
    ([key]) => normalizeLocaleCode(key) === base,
  );
  return baseEntry?.[1] ?? null;
}

function getFirstLocalizedValue(locale: TranslationTree | null, keys: string[]) {
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

type LocationOption = { id: string; title: string; subtitle: string };

type Props = {
  visible: boolean;
  accent: string;
  onClose: () => void;
  onUseCurrentLocation: () => void | Promise<void>;
  onSelect: (item: LocationOption) => void | Promise<void>;
};

export function LocationQuickSheet({
  visible,
  accent,
  onClose,
  onUseCurrentLocation,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const [busy, setBusy] = useState(false);

  const activeLocale = useMemo(() => getLocaleTree(language), [language]);
  const russianLocale = useMemo(() => getLocaleTree("ru"), []);
  const tx = useCallback(
    (keys: string[], fallback: string) =>
      getFirstLocalizedValue(activeLocale, keys) ??
      getFirstLocalizedValue(russianLocale, keys) ??
      fallback,
    [activeLocale, russianLocale],
  );

  const texts = useMemo(
    () => ({
      title: tx(["chatRoom.locationTitle", "messenger.location"], "Геолокация"),
      subtitle: tx(
        ["chatRoom.locationQuickSubtitle"],
        "Используйте текущее место или отправьте сохранённую точку",
      ),
      currentTitle: tx(
        ["chatRoom.useCurrentLocation"],
        "Использовать текущее местоположение",
      ),
      currentSubtitle: tx(
        ["chatRoom.useCurrentLocationSubtitle"],
        "Доступ к GPS и определению адреса",
      ),
      savedPlaces: tx(["chatRoom.savedPlaces"], "Сохранённые места"),
      officeTitle: tx(["chatRoom.savedOfficeTitle"], "Главный офис"),
      officeSubtitle: tx(
        ["chatRoom.savedOfficeSubtitle"],
        "Проспект Амира Темура · Ташкент",
      ),
      airportTitle: tx(["chatRoom.savedAirportTitle"], "Аэропорт Ташкента"),
      airportSubtitle: tx(
        ["chatRoom.savedAirportSubtitle"],
        "Терминал 2 · зона вылета",
      ),
      coffeeTitle: tx(["chatRoom.savedCoffeeTitle"], "Кофе-поинт"),
      coffeeSubtitle: tx(
        ["chatRoom.savedCoffeeSubtitle"],
        "Улица Шевченко · место встречи",
      ),
      homeTitle: tx(["chatRoom.savedHomeTitle"], "Дом"),
      homeSubtitle: tx(["chatRoom.savedHomeSubtitle"], "Сохранённое личное место"),
    }),
    [tx],
  );

  const recentLocations = useMemo<LocationOption[]>(
    () => [
      { id: "office", title: texts.officeTitle, subtitle: texts.officeSubtitle },
      { id: "airport", title: texts.airportTitle, subtitle: texts.airportSubtitle },
      { id: "coffee", title: texts.coffeeTitle, subtitle: texts.coffeeSubtitle },
      { id: "home", title: texts.homeTitle, subtitle: texts.homeSubtitle },
    ],
    [texts],
  );

  const runAction = useCallback(
    async (action: () => void | Promise<void>) => {
      if (busy) return;
      try {
        setBusy(true);
        await action();
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  const safeAccent = accent || "#56F3C1";
  const accentSoft = withAlpha(safeAccent, 0.18);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={busy ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={busy ? undefined : onClose} />
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
                <Text style={styles.title}>{texts.title}</Text>
                <Text style={styles.subtitle}>{texts.subtitle}</Text>
              </View>
              <Pressable
                onPress={busy ? undefined : onClose}
                disabled={busy}
                style={({ pressed }) => [
                  styles.closeButtonWrap,
                  pressed ? styles.pressed : undefined,
                  busy ? styles.disabled : undefined,
                ]}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                  style={[styles.closeButton, { borderColor: withAlpha(safeAccent, 0.14) }]}
                >
                  <X size={15} strokeWidth={2.4} color="#F6FFF9" />
                </LinearGradient>
              </Pressable>
            </View>

            <Pressable
              onPress={() => void runAction(onUseCurrentLocation)}
              disabled={busy}
              style={({ pressed }) => [
                styles.primaryWrap,
                pressed ? styles.pressed : undefined,
                busy ? styles.disabled : undefined,
              ]}
            >
              <LinearGradient
                colors={[accentSoft, "rgba(255,255,255,0.03)"]}
                style={[styles.primaryCard, { borderColor: withAlpha(safeAccent, 0.16) }]}
              >
                <View
                  style={[
                    styles.primaryIconWrap,
                    {
                      borderColor: withAlpha(safeAccent, 0.20),
                      backgroundColor: withAlpha(safeAccent, 0.12),
                    },
                  ]}
                >
                  <Crosshair size={18} strokeWidth={2.3} color={safeAccent} />
                </View>
                <View style={styles.primaryTextWrap}>
                  <Text style={styles.primaryTitle}>{texts.currentTitle}</Text>
                  <Text style={styles.primarySubtitle}>{texts.currentSubtitle}</Text>
                </View>
                <ChevronRight size={16} strokeWidth={2.3} color="rgba(246,255,249,0.72)" />
              </LinearGradient>
            </Pressable>

            <Text style={styles.sectionLabel}>{texts.savedPlaces}</Text>

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
              {recentLocations.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => void runAction(() => onSelect(item))}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.itemWrap,
                    pressed ? styles.pressed : undefined,
                    busy ? styles.disabled : undefined,
                  ]}
                >
                  <LinearGradient
                    colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.025)"]}
                    style={[styles.item, { borderColor: withAlpha(safeAccent, 0.10) }]}
                  >
                    <View
                      style={[
                        styles.itemIconWrap,
                        {
                          backgroundColor: withAlpha(safeAccent, 0.10),
                          borderColor: withAlpha(safeAccent, 0.16),
                        },
                      ]}
                    >
                      <MapPin size={16} strokeWidth={2.3} color={safeAccent} />
                    </View>
                    <View style={styles.itemTextWrap}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemMeta} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(2,8,7,0.22)", justifyContent: "flex-end" },
  wrap: { paddingHorizontal: 10 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    maxHeight: 460,
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
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  headerTextWrap: { flex: 1, paddingRight: 10 },
  title: { color: "#F6FFF9", fontSize: 14, fontWeight: "900" },
  subtitle: { marginTop: 2, color: "rgba(232,255,246,0.58)", fontSize: 11, fontWeight: "700" },
  closeButtonWrap: { width: 34, height: 34, borderRadius: 12, overflow: "hidden" },
  closeButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primaryWrap: { marginBottom: 10, borderRadius: 18, overflow: "hidden" },
  primaryCard: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primaryTextWrap: { flex: 1, marginLeft: 10 },
  primaryTitle: { color: "#F6FFF9", fontSize: 12, fontWeight: "900" },
  primarySubtitle: { marginTop: 2, color: "rgba(232,255,246,0.58)", fontSize: 11, fontWeight: "700" },
  sectionLabel: { marginBottom: 8, color: "rgba(232,255,246,0.52)", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  list: { paddingBottom: 2 },
  itemWrap: { marginBottom: 8, borderRadius: 16, overflow: "hidden" },
  item: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  itemIconWrap: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  itemTextWrap: { flex: 1, marginLeft: 10 },
  itemTitle: { color: "#F6FFF9", fontSize: 12, fontWeight: "800" },
  itemMeta: { marginTop: 2, color: "rgba(232,255,246,0.58)", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  disabled: { opacity: 0.72 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});

export default LocationQuickSheet;

