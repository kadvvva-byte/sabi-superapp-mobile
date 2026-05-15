import React, { useCallback, useMemo, useState } from "react";
import {
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

export type AnimatedEmojiItem = {
  id: string;
  emoji: string;
  label: string;
  category: "faces" | "hearts" | "celebration";
  durationMs: 5000;
  playback: "fullscreen";
  premium: true;
};

type Props = {
  visible: boolean;
  accent: string;
  accentSoft: string;
  onClose: () => void;
  onSelect: (item: AnimatedEmojiItem) => void;
  items?: AnimatedEmojiItem[];
};

type TabKey = "faces" | "hearts" | "celebration";

const DEFAULT_EMOJIS: AnimatedEmojiItem[] = [
  { id: "grin-burst", emoji: "😁", label: "Big grin", category: "faces", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "cool-pop", emoji: "😎", label: "Cool pop", category: "faces", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "shock-wave", emoji: "😮", label: "Shock wave", category: "faces", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "tears-laugh", emoji: "😂", label: "Laugh tears", category: "faces", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "heart-green", emoji: "💚", label: "Green heart", category: "hearts", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "heart-red", emoji: "❤️", label: "Red heart", category: "hearts", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "spark-heart", emoji: "💖", label: "Spark heart", category: "hearts", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "gift-heart", emoji: "💝", label: "Gift heart", category: "hearts", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "confetti-party", emoji: "🎉", label: "Confetti", category: "celebration", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "star-glow", emoji: "✨", label: "Star glow", category: "celebration", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "crown-show", emoji: "👑", label: "Crown show", category: "celebration", durationMs: 5000, playback: "fullscreen", premium: true },
  { id: "rocket-hype", emoji: "🚀", label: "Rocket hype", category: "celebration", durationMs: 5000, playback: "fullscreen", premium: true },
];

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

function getCardColors(item: AnimatedEmojiItem, accent: string, accentSoft: string): [string, string] {
  if (item.category === "hearts") {
    return [withAlpha(accentSoft, 0.34), "rgba(56,18,38,0.96)"];
  }
  if (item.category === "celebration") {
    return [withAlpha(accent, 0.22), "rgba(58,39,10,0.96)"];
  }
  return [withAlpha(accent, 0.18), "rgba(16,32,68,0.96)"];
}

export function AnimatedEmojiSheet({
  visible,
  accent,
  accentSoft,
  onClose,
  onSelect,
  items,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [tab, setTab] = useState<TabKey>("faces");
  const [query, setQuery] = useState("");

  const tx = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t],
  );

  const data = items ?? DEFAULT_EMOJIS;

  const texts = useMemo(
    () => ({
      title: tx("messenger.animatedEmoji.title", "Animated emoji"),
      subtitle: tx(
        "messenger.animatedEmoji.subtitle",
        "Premium emoji with 5 sec full-screen playback",
      ),
      search: tx("messenger.animatedEmoji.search", "Search animated emoji"),
      faces: tx("messenger.animatedEmoji.faces", "Faces"),
      hearts: tx("messenger.animatedEmoji.hearts", "Hearts"),
      celebration: tx("messenger.animatedEmoji.celebration", "Celebration"),
      empty: tx("messenger.animatedEmoji.empty", "Nothing found for this tab"),
    }),
    [tx],
  );

  const tabs = useMemo(
    () => [
      { key: "faces" as const, label: texts.faces },
      { key: "hearts" as const, label: texts.hearts },
      { key: "celebration" as const, label: texts.celebration },
    ],
    [texts.celebration, texts.faces, texts.hearts],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return data.filter((item) => {
      const tabOk = item.category === tab;
      if (!tabOk) return false;
      if (!normalized) return true;

      return (
        item.label.toLowerCase().includes(normalized) ||
        item.id.toLowerCase().includes(normalized)
      );
    });
  }, [data, query, tab]);

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
              {filtered.length > 0 ? (
                filtered.map((item) => {
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
                            styles.previewWrap,
                            {
                              backgroundColor: withAlpha(safeAccentSoft, 0.10),
                              borderColor: withAlpha(safeAccent, 0.12),
                            },
                          ]}
                        >
                          <Text style={styles.emoji}>{item.emoji}</Text>
                        </View>

                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.label}
                        </Text>
                        <Text style={styles.itemSubtitle}>5 sec · premium</Text>
                      </LinearGradient>
                    </Pressable>
                  );
                })
              ) : (
                <View style={styles.emptyWrap}>
                  <Ionicons name="sparkles-outline" size={18} color={safeAccent} />
                  <Text style={styles.emptyText}>{texts.empty}</Text>
                </View>
              )}
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
    minHeight: 164,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
  },
  previewWrap: {
    height: 98,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emoji: { fontSize: 42, lineHeight: 48 },
  itemTitle: { color: "#F6FFF9", fontSize: 12, fontWeight: "900" },
  itemSubtitle: { marginTop: 3, color: "rgba(232,255,246,0.74)", fontSize: 10, fontWeight: "700" },
  emptyWrap: {
    width: "100%",
    minHeight: 120,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  emptyText: { marginTop: 8, color: "rgba(232,255,246,0.64)", fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
});

export default AnimatedEmojiSheet;

