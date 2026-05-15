import React, { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Reply, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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

type Anchor = { x: number; y: number; width: number; height: number } | null;

type Props = {
  visible: boolean;
  anchor: Anchor;
  accent: string;
  accentSoft: string;
  onSelect: (emoji: string) => void | Promise<void>;
  onReply: () => void | Promise<void>;
  onMore: () => void | Promise<void>;
  onDismiss: () => void;
};

const QUICK_REACTIONS = ["💚", "❤️", "🔥", "👏", "🙏", "😂", "😍", "😮"];
const CARD_WIDTH = 240;

export function ReactionPickerPopover({
  visible,
  anchor,
  accent,
  accentSoft,
  onSelect,
  onReply,
  onMore,
  onDismiss,
}: Props) {
  const { width } = useWindowDimensions();
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
      reply: tx(["common.reply", "messenger.reply", "chatRoom.replyAction"], "Ответить"),
      more: tx(["common.more"], "Ещё"),
    }),
    [tx],
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
  const safeAccentSoft = accentSoft || withAlpha(safeAccent, 0.18);

  if (!visible || !anchor) return null;

  const top = Math.max(12, anchor.y + anchor.height + 6);
  const desiredLeft = anchor.x + anchor.width / 2 - CARD_WIDTH / 2;
  const left = Math.max(10, Math.min(desiredLeft, Math.max(10, width - CARD_WIDTH - 10)));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={busy ? undefined : onDismiss}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={busy ? undefined : onDismiss} />
        <View style={[styles.wrap, { top, left }]}>
          <LinearGradient
            colors={[
              withAlpha(safeAccentSoft, 0.24),
              "rgba(14,31,27,0.98)",
              "rgba(7,18,16,0.96)",
            ]}
            style={[styles.card, { borderColor: withAlpha(safeAccent, 0.14) }]}
          >
            <View style={[styles.glow, { backgroundColor: withAlpha(safeAccent, 0.10) }]} />

            <View style={styles.reactionRow}>
              {QUICK_REACTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => void runAction(() => onSelect(emoji))}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.emojiWrap,
                    pressed ? styles.pressed : undefined,
                    busy ? styles.disabled : undefined,
                  ]}
                >
                  <LinearGradient
                    colors={[safeAccentSoft, "rgba(255,255,255,0.03)"]}
                    style={[styles.emojiPill, { borderColor: withAlpha(safeAccent, 0.14) }]}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>

            <View style={styles.bottomRow}>
              <Pressable
                onPress={() => void runAction(onReply)}
                disabled={busy}
                style={({ pressed }) => [
                  styles.actionWrap,
                  pressed ? styles.pressed : undefined,
                  busy ? styles.disabled : undefined,
                ]}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                  style={[styles.actionPill, { borderColor: withAlpha(safeAccent, 0.10) }]}
                >
                  <Reply size={14} strokeWidth={2.3} color={safeAccent} />
                  <Text style={styles.actionText}>{texts.reply}</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => void runAction(onMore)}
                disabled={busy}
                style={({ pressed }) => [
                  styles.actionWrap,
                  pressed ? styles.pressed : undefined,
                  busy ? styles.disabled : undefined,
                ]}
              >
                <LinearGradient
                  colors={[safeAccentSoft, "rgba(255,255,255,0.03)"]}
                  style={[styles.actionPill, { borderColor: withAlpha(safeAccent, 0.14) }]}
                >
                  <Sparkles size={14} strokeWidth={2.3} color={safeAccent} />
                  <Text style={styles.actionText}>{texts.more}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", width: CARD_WIDTH, zIndex: 90 },
  card: {
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -20,
    right: -14,
    width: 110,
    height: 90,
    borderRadius: 999,
  },
  reactionRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  emojiWrap: { width: "23%", marginBottom: 6, borderRadius: 14, overflow: "hidden" },
  emojiPill: {
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  emoji: { fontSize: 22, lineHeight: 26 },
  bottomRow: { marginTop: 4, flexDirection: "row", justifyContent: "space-between" },
  actionWrap: { width: "48.5%", borderRadius: 12, overflow: "hidden" },
  actionPill: {
    minHeight: 34,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionText: { marginLeft: 6, color: "#F6FFF9", fontSize: 11, fontWeight: "800" },
  disabled: { opacity: 0.72 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});

export default ReactionPickerPopover;

