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
import LOCALES from "../../../../shared/i18n/locales";

type StickerTabId = "recent" | "reactions" | "emoji" | "gestures" | "flags";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft: string;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  recentItems?: string[];
  onRecentChange?: (items: string[]) => void;
  quickReactions?: string[];
};

type TabConfig = {
  id: StickerTabId;
  icon: keyof typeof Ionicons.glyphMap;
};

const DEFAULT_QUICK_REACTIONS = ["👍", "❤️", "😂", "🔥", "😮", "🙏", "👏", "😍"];
const REACTIONS = ["👍","👎","❤️","💚","💙","🔥","✨","💯","😂","🤣","😮","😢","😭","🥹","😡","🤔","😎","🥳","😍","😘","🙏","👏","🙌","🤝","👌","👑","💎","🎉","🚀","⚡","🌟","✅"];
const EMOJI = ["😀","😁","😄","😅","😊","🙂","😉","😌","😇","🤩","🤗","🫠","😴","🤤","🤯","😬","😵","🤓","🧐","🤠","🥶","🥵","😷","🤒","🤕","🤖","👻","🎯","🎵","🍀","🌙","☀️"];
const GESTURES = ["👋","🤚","✋","🖐️","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👉","👈","☝️","👇","👆","👊","✊","🤛","🤜","👏","🙌","🙏","💪","🫶","🖖"];
const FLAGS = ["🇺🇿","🇰🇿","🇹🇯","🇰🇬","🇹🇲","🇦🇿","🇬🇪","🇦🇪","🇸🇦","🇹🇷","🇺🇸","🇬🇧","🇩🇪","🇫🇷","🇮🇹","🇪🇸","🇷🇺","🇺🇦","🇮🇳","🇵🇰","🇨🇳","🇰🇷","🇯🇵","🇲🇾","🇸🇬","🇹🇭","🇮🇩","🇵🇭","🇶🇦","🇰🇼","🇪🇬","🇧🇷"];

const DATA: Record<Exclude<StickerTabId, "recent">, string[]> = {
  reactions: REACTIONS,
  emoji: EMOJI,
  gestures: GESTURES,
  flags: FLAGS,
};

const TAB_META: TabConfig[] = [
  { id: "recent", icon: "time-outline" },
  { id: "reactions", icon: "flash-outline" },
  { id: "emoji", icon: "happy-outline" },
  { id: "gestures", icon: "hand-left-outline" },
  { id: "flags", icon: "flag-outline" },
];

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

function uniqueEmojiList(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  items.forEach((item) => {
    const normalized = String(item ?? "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });
  return result;
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

export function StickerReactionSheet({
  visible,
  accent,
  accentSoft,
  onClose,
  onSelect,
  recentItems,
  onRecentChange,
  quickReactions,
}: Props) {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StickerTabId>("recent");
  const [localRecent, setLocalRecent] = useState<string[]>(DEFAULT_QUICK_REACTIONS);

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
    title: tx(["messenger.stickerSheet.title"], "Sticker reactions"),
    subtitle: tx(["messenger.stickerSheet.subtitle"], "Reactions, emoji, gestures and country flags"),
    searchPlaceholder: tx(["messenger.stickerSheet.searchPlaceholder"], "Search emoji or flag"),
    quickReactions: tx(["messenger.stickerSheet.quickReactions"], "Quick reactions"),
    empty: tx(["messenger.stickerSheet.empty"], "Nothing found in this tab"),
    recent: tx(["messenger.stickerSheet.tabs.recent"], "Recent"),
    reactions: tx(["messenger.stickerSheet.tabs.reactions"], "Reactions"),
    emoji: tx(["messenger.stickerSheet.tabs.emoji"], "Emoji"),
    gestures: tx(["messenger.stickerSheet.tabs.gestures"], "Gestures"),
    flags: tx(["messenger.stickerSheet.tabs.flags"], "Flags"),
  }), [tx]);

  const quickItems = useMemo(() => uniqueEmojiList(quickReactions?.length ? quickReactions : DEFAULT_QUICK_REACTIONS), [quickReactions]);
  const effectiveRecent = useMemo(() => uniqueEmojiList(recentItems?.length ? recentItems : localRecent), [localRecent, recentItems]);

  const tabItems = useMemo(() => {
    const baseItems = activeTab === "recent" ? effectiveRecent : DATA[activeTab];
    const trimmedQuery = search.trim();
    if (!trimmedQuery) return baseItems;
    return baseItems.filter((item) => item.includes(trimmedQuery));
  }, [activeTab, effectiveRecent, search]);

  const tabLabels = useMemo<Record<StickerTabId, string>>(() => ({
    recent: texts.recent,
    reactions: texts.reactions,
    emoji: texts.emoji,
    gestures: texts.gestures,
    flags: texts.flags,
  }), [texts]);

  const pushRecent = (value: string) => {
    const next = uniqueEmojiList([value, ...effectiveRecent]).slice(0, 24);
    if (!recentItems) setLocalRecent(next);
    onRecentChange?.(next);
  };

  const handleSelect = (value: string) => {
    pushRecent(value);
    onSelect(value);
  };

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
              withAlpha(safeAccentSoft, 0.22),
              "rgba(13,30,26,0.985)",
              "rgba(7,18,16,0.97)",
            ]}
            style={[styles.sheet, { borderColor: withAlpha(safeAccent, 0.20) }]}
          >
            <View style={[styles.glowOrb, { backgroundColor: withAlpha(safeAccent, 0.12) }]} />
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <View style={styles.headerTitleRow}>
                  <View style={[styles.brandBadge, { borderColor: withAlpha(safeAccent, 0.22) }]}>
                    <Ionicons name="sparkles-outline" size={13} color={safeAccent} />
                  </View>
                  <Text style={styles.title}>{texts.title}</Text>
                </View>
                <Text style={styles.subtitle}>{texts.subtitle}</Text>
              </View>
              <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : undefined]}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                  style={[styles.closeButtonFill, { borderColor: withAlpha(safeAccent, 0.18) }]}
                >
                  <Ionicons name="close" size={16} color="#F6FFF9" />
                </LinearGradient>
              </Pressable>
            </View>

            <View style={[styles.searchWrap, { borderColor: withAlpha(safeAccent, 0.18) }]}>
              <Ionicons name="search-outline" size={15} color={safeAccent} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={texts.searchPlaceholder}
                placeholderTextColor="rgba(232,255,246,0.38)"
                style={styles.searchInput}
                selectionColor={safeAccent}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.quickSection}>
              <Text style={styles.sectionLabel}>{texts.quickReactions}</Text>
              <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
                {quickItems.map((emoji) => (
                  <Pressable key={emoji} onPress={() => handleSelect(emoji)} style={({ pressed }) => [styles.quickChipWrap, pressed ? styles.pressed : undefined]}>
                    <LinearGradient
                      colors={[safeAccentSoft, "rgba(255,255,255,0.025)"]}
                      style={[styles.quickChip, { borderColor: withAlpha(safeAccent, 0.18) }]}
                    >
                      <Text style={styles.quickEmoji}>{emoji}</Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {TAB_META.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={({ pressed }) => [styles.tabWrap, pressed ? styles.pressed : undefined]}>
                    <LinearGradient
                      colors={
                        selected
                          ? [safeAccentSoft, "rgba(255,255,255,0.035)"]
                          : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.015)"]
                      }
                      style={[
                        styles.tabChip,
                        { borderColor: selected ? withAlpha(safeAccent, 0.28) : "rgba(255,255,255,0.06)" },
                      ]}
                    >
                      <Ionicons name={tab.icon} size={13} color={selected ? "#F6FFF9" : "rgba(232,255,246,0.60)"} />
                      <Text style={[styles.tabLabel, selected ? { color: "#F6FFF9" } : styles.tabLabelMuted]}>{tabLabels[tab.id]}</Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentWrap}>
              <View style={styles.flowWrap}>
                {tabItems.map((emoji) => (
                  <Pressable key={`${activeTab}-${emoji}`} onPress={() => handleSelect(emoji)} style={({ pressed }) => [styles.itemWrap, pressed ? styles.pressed : undefined]}>
                    <LinearGradient
                      colors={["rgba(255,255,255,0.045)", "rgba(255,255,255,0.018)"]}
                      style={[
                        styles.itemChip,
                        { borderColor: activeTab === "flags" ? withAlpha(safeAccent, 0.14) : "rgba(255,255,255,0.055)" },
                      ]}
                    >
                      <Text style={[styles.itemEmoji, activeTab === "flags" ? styles.flagEmoji : undefined]}>{emoji}</Text>
                    </LinearGradient>
                  </Pressable>
                ))}
                {tabItems.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons name="sparkles-outline" size={18} color={safeAccent} />
                    <Text style={styles.emptyText}>{texts.empty}</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(2,8,7,0.18)", justifyContent: "flex-end" },
  wrap: { paddingHorizontal: 10 },
  sheet: {
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
    maxHeight: 462,
    overflow: "hidden",
  },
  glowOrb: { position: "absolute", top: -30, right: -18, width: 140, height: 110, borderRadius: 999 },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 999, marginBottom: 10, backgroundColor: "rgba(255,255,255,0.10)" },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  headerTextWrap: { flex: 1, paddingRight: 10 },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  brandBadge: { width: 28, height: 28, borderRadius: 10, marginRight: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1 },
  title: { color: "#F6FFF9", fontSize: 15, fontWeight: "900" },
  subtitle: { marginTop: 4, color: "rgba(232,255,246,0.56)", fontSize: 11, fontWeight: "700" },
  closeButton: { width: 34, height: 34, borderRadius: 12, overflow: "hidden" },
  closeButtonFill: { flex: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  searchWrap: { minHeight: 42, borderRadius: 15, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)" },
  searchInput: { flex: 1, height: 40, marginLeft: 8, color: "#F6FFF9", fontSize: 13, fontWeight: "700", paddingVertical: 0 },
  quickSection: { marginTop: 12 },
  sectionLabel: { color: "rgba(232,255,246,0.62)", fontSize: 10, fontWeight: "800", letterSpacing: 0.2, marginBottom: 8 },
  quickRow: { paddingRight: 6 },
  quickChipWrap: { marginRight: 8, borderRadius: 16 },
  quickChip: { minWidth: 42, height: 36, borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  quickEmoji: { fontSize: 18 },
  tabsRow: { paddingTop: 12, paddingBottom: 10, paddingRight: 8 },
  tabWrap: { marginRight: 8, borderRadius: 999 },
  tabChip: { height: 32, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  tabLabel: { fontSize: 11, fontWeight: "800", marginLeft: 6 },
  tabLabelMuted: { color: "rgba(232,255,246,0.60)" },
  contentWrap: { paddingBottom: 6 },
  flowWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" },
  itemWrap: { marginRight: 8, marginBottom: 8, borderRadius: 16 },
  itemChip: { minWidth: 42, height: 38, borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  itemEmoji: { fontSize: 20, lineHeight: 23 },
  flagEmoji: { fontSize: 19 },
  emptyWrap: { width: "100%", minHeight: 84, borderRadius: 18, marginTop: 4, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.025)" },
  emptyText: { marginTop: 8, color: "rgba(232,255,246,0.62)", fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});

export default StickerReactionSheet;

