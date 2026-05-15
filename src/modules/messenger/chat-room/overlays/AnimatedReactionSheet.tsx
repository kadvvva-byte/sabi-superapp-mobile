import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "../../../../shared/i18n";
import { PREMIUM_ANIMATED_ASSETS, PremiumAnimatedAsset } from "../premiumAnimatedAssetMap";

export type AnimatedReactionItem = {
  id: string;
  emoji: string;
  label: string;
  subtitle: string;
  category: "love" | "fun" | "mood";
  durationMs: 5000;
  premium: true;
  previewSource: ImageSourcePropType;
};

type Props = {
  visible: boolean;
  accent: string;
  accentSoft: string;
  onClose: () => void;
  onSelect: (item: AnimatedReactionItem) => void;
  items?: PremiumAnimatedAsset[];
};

type TabKey = "all" | "love" | "fun" | "mood";

function inferCategory(asset: PremiumAnimatedAsset): "love" | "fun" | "mood" {
  if (asset.effectKey === "heart" || asset.effectKey === "kiss") return "love";
  if (asset.effectKey === "laugh") return "fun";
  return "mood";
}

function inferEmoji(asset: PremiumAnimatedAsset) {
  switch (asset.effectKey) {
    case "heart":
      return "💚";
    case "kiss":
      return "😘";
    case "laugh":
      return "😂";
    case "cool":
      return "😎";
    case "cry":
      return "😢";
    case "sparkle":
      return "✨";
    case "float":
      return "💫";
    default:
      return "✨";
  }
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
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  const rgb = hexToRgb(color);
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedAlpha})`;
  }

  const rgbMatch = color.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${normalizedAlpha})`;
  }

  const rgbaMatch = color.match(
    /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${normalizedAlpha})`;
  }

  return color;
}

function getCardColors(
  item: AnimatedReactionItem,
  accent: string,
  accentSoft: string,
): [string, string] {
  if (item.category === "love") {
    return [withAlpha(accentSoft, 0.34), "rgba(56,18,38,0.96)"];
  }
  if (item.category === "fun") {
    return [withAlpha(accent, 0.22), "rgba(58,39,10,0.96)"];
  }
  return [withAlpha(accent, 0.18), "rgba(16,32,68,0.96)"];
}

export function AnimatedReactionSheet({
  visible,
  accent,
  accentSoft,
  onClose,
  onSelect,
  items,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");

  const tx = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t],
  );

  const texts = useMemo(
    () => ({
      title: tx("messenger.animatedReaction.title", "Premium stickers"),
      subtitle: tx("messenger.animatedReaction.subtitle", "all premium PNG stickers"),
      search: tx("messenger.animatedReaction.search", "Search premium sticker"),
      all: tx("common.all", "All"),
      love: tx("messenger.animatedReaction.love", "Love"),
      fun: tx("messenger.animatedReaction.fun", "Fun"),
      mood: tx("messenger.animatedReaction.mood", "Mood"),
    }),
    [tx],
  );

  const tabs = useMemo(
    () => [
      { key: "all" as const, label: texts.all },
      { key: "love" as const, label: texts.love },
      { key: "fun" as const, label: texts.fun },
      { key: "mood" as const, label: texts.mood },
    ],
    [texts.all, texts.fun, texts.love, texts.mood],
  );

  const reactions: AnimatedReactionItem[] = useMemo(
    () => (items ?? PREMIUM_ANIMATED_ASSETS).map((asset) => ({
      id: asset.id,
      emoji: inferEmoji(asset),
      label: asset.title,
      subtitle: asset.subtitle,
      category: inferCategory(asset),
      durationMs: 5000,
      premium: true,
      previewSource: asset.source,
    })),
    [items],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return reactions.filter((item) => {
      const tabOk = tab === "all" ? true : item.category === tab;
      if (!tabOk) return false;
      if (!normalized) return true;

      return (
        item.label.toLowerCase().includes(normalized) ||
        item.subtitle.toLowerCase().includes(normalized) ||
        item.id.toLowerCase().includes(normalized)
      );
    });
  }, [query, reactions, tab]);

  const safeAccent = accent || "#56F3C1";
  const safeAccentSoft = accentSoft || withAlpha(safeAccent, 0.18);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <LinearGradient
            colors={[
              withAlpha(safeAccentSoft, 0.24),
              "rgba(12,24,21,0.98)",
              "rgba(6,15,13,0.98)",
            ]}
            style={[styles.card, { borderColor: withAlpha(safeAccent, 0.18) }]}
          >
            <View style={[styles.glowTop, { backgroundColor: withAlpha(safeAccent, 0.10) }]} />
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>{texts.title}</Text>
                <Text style={styles.subtitle}>{texts.subtitle}</Text>
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
                  style={[styles.closeButton, { borderColor: withAlpha(safeAccent, 0.16) }]}
                >
                  <Ionicons name="close" size={16} color="#F6FFF9" />
                </LinearGradient>
              </Pressable>
            </View>

            <View
              style={[
                styles.searchWrap,
                {
                  borderColor: withAlpha(safeAccent, 0.18),
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              ]}
            >
              <Ionicons name="search-outline" size={15} color={safeAccent} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={texts.search}
                placeholderTextColor="rgba(232,255,246,0.40)"
                style={styles.searchInput}
                selectionColor={safeAccent}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}
            >
              {tabs.map((item) => {
                const active = item.key === tab;
                return (
                  <Pressable key={item.key} onPress={() => setTab(item.key)} style={styles.tabWrap}>
                    <LinearGradient
                      colors={
                        active
                          ? [safeAccentSoft, withAlpha(safeAccent, 0.18)]
                          : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]
                      }
                      style={[
                        styles.tabPill,
                        { borderColor: active ? withAlpha(safeAccent, 0.22) : "rgba(255,255,255,0.08)" },
                      ]}
                    >
                      <Text style={[styles.tabText, active ? styles.tabTextActive : undefined]}>
                        {item.label}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
              {filtered.map((item) => {
                const cardColors = getCardColors(item, safeAccent, safeAccentSoft);

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => onSelect(item)}
                    style={({ pressed }) => [styles.itemWrap, pressed ? styles.pressed : undefined]}
                  >
                    <LinearGradient
                      colors={cardColors}
                      style={[styles.itemCard, { borderColor: withAlpha(safeAccent, 0.10) }]}
                    >
                      <View
                        style={[
                          styles.itemPreviewWrap,
                          {
                            backgroundColor: withAlpha(safeAccentSoft, 0.10),
                            borderColor: withAlpha(safeAccent, 0.12),
                          },
                        ]}
                      >
                        <Image source={item.previewSource} style={styles.itemPreview} resizeMode="contain" />
                      </View>

                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.label}
                      </Text>
                      <Text style={styles.itemSubtitle} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(2,8,7,0.42)", justifyContent: "flex-end" },
  wrap: { paddingHorizontal: 10 },
  card: {
    maxHeight: "86%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -28,
    left: 32,
    right: 32,
    height: 88,
    borderRadius: 999,
  },
  handle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerTextWrap: { flex: 1, minWidth: 0 },
  title: { color: "#F6FFF9", fontSize: 16, fontWeight: "900" },
  subtitle: { marginTop: 2, color: "rgba(232,255,246,0.66)", fontSize: 11, fontWeight: "700" },
  closeButtonWrap: { width: 34, height: 34, borderRadius: 12, overflow: "hidden" },
  closeButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  searchWrap: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#F6FFF9",
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 0,
  },
  tabsRow: { paddingTop: 12, paddingBottom: 8, paddingRight: 8 },
  tabWrap: { marginRight: 8 },
  tabPill: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tabText: { color: "#F6FFF9", fontSize: 11, fontWeight: "900" },
  tabTextActive: { color: "#071711" },
  grid: {
    paddingBottom: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemWrap: {
    width: "48.2%",
    marginBottom: 10,
  },
  itemCard: {
    minHeight: 172,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
  },
  itemPreviewWrap: {
    height: 104,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  itemPreview: {
    width: 92,
    height: 92,
  },
  itemTitle: { color: "#F6FFF9", fontSize: 12, fontWeight: "900" },
  itemSubtitle: { marginTop: 3, color: "rgba(232,255,246,0.74)", fontSize: 10, fontWeight: "700" },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
});

export default AnimatedReactionSheet;

