import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Copy,
  Edit3,
  Forward,
  Languages,
  MoreHorizontal,
  Reply,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react-native";
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

function getFirstLocalizedValue(
  locale: TranslationTree | null,
  keys: string[],
) {
  for (const key of keys) {
    const value = getTranslationValue(locale, key);
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

export type ActionKey =
  | "reply"
  | "edit"
  | "copy"
  | "translate"
  | "forward"
  | "delete"
  | "more";

type Mode = "mine" | "other" | null;

type Props = {
  visible: boolean;
  mode: Mode;
  accent: string;
  onAction: (key: ActionKey) => void | Promise<void>;
  onClose: () => void;
};

type ActionDef = {
  key: ActionKey;
  icon: LucideIcon;
  keys: string[];
  fallback: string;
};

const MINE_ACTIONS: readonly ActionDef[] = [
  { key: "edit", icon: Edit3, keys: ["common.edit"], fallback: "Edit" },
  { key: "copy", icon: Copy, keys: ["common.copy"], fallback: "Copy" },
  {
    key: "translate",
    icon: Languages,
    keys: ["messenger.chat.translateAction", "ai.mobile.common.translate"],
    fallback: "Translate",
  },
  {
    key: "forward",
    icon: Forward,
    keys: ["common.forward", "messenger.forward"],
    fallback: "Forward",
  },
  { key: "delete", icon: Trash2, keys: ["common.delete"], fallback: "Delete" },
  { key: "more", icon: MoreHorizontal, keys: ["common.more"], fallback: "More" },
] as const;

const OTHER_ACTIONS: readonly ActionDef[] = [
  {
    key: "reply",
    icon: Reply,
    keys: ["common.reply", "messenger.reply", "chatRoom.replyAction"],
    fallback: "Reply",
  },
  { key: "copy", icon: Copy, keys: ["common.copy"], fallback: "Copy" },
  {
    key: "translate",
    icon: Languages,
    keys: ["messenger.chat.translateAction", "ai.mobile.common.translate"],
    fallback: "Translate",
  },
  {
    key: "forward",
    icon: Forward,
    keys: ["common.forward", "messenger.forward"],
    fallback: "Forward",
  },
  { key: "delete", icon: Trash2, keys: ["common.delete"], fallback: "Delete" },
  { key: "more", icon: MoreHorizontal, keys: ["common.more"], fallback: "More" },
] as const;

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

  const rgbMatch = String(color).match(
    /^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i,
  );
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${normalizedAlpha})`;
  }

  const rgbaMatch = String(color).match(
    /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${normalizedAlpha})`;
  }

  return color;
}

export function MessageTopActionBar({
  visible,
  mode,
  accent,
  onAction,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const [busyKey, setBusyKey] = useState<ActionKey | null>(null);

  const activeLocale = useMemo(() => getLocaleTree(language), [language]);
  const russianLocale = useMemo(() => getLocaleTree("ru"), []);

  const tx = useCallback(
    (keys: string[], fallback: string) =>
      getFirstLocalizedValue(activeLocale, keys) ??
      getFirstLocalizedValue(russianLocale, keys) ??
      fallback,
    [activeLocale, russianLocale],
  );

  const actions = useMemo(() => {
    const source = mode === "mine" ? MINE_ACTIONS : OTHER_ACTIONS;
    return source.map((item) => ({
      ...item,
      label: tx(item.keys, item.fallback),
    }));
  }, [mode, tx]);

  const topOffset = Math.max(insets.top + 10, 68);
  const disabled = busyKey !== null;
  const safeAccent = accent || "#56F3C1";

  const handleAction = useCallback(
    async (key: ActionKey) => {
      if (disabled) return;
      try {
        setBusyKey(key);
        await onAction(key);
      } finally {
        setBusyKey(null);
      }
    },
    [disabled, onAction],
  );

  if (!visible || !mode) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={disabled ? undefined : onClose}
      />

      <View style={[styles.wrap, { top: topOffset }]} pointerEvents="box-none">
        <LinearGradient
          colors={["rgba(14,31,27,0.98)", "rgba(7,18,16,0.96)"]}
          style={[styles.bar, { borderColor: withAlpha(safeAccent, 0.22) }]}
        >
          <View style={styles.actionsRow}>
            {actions.map((action) => {
              const isDanger = action.key === "delete";
              const isBusy = busyKey === action.key;

              return (
                <Pressable
                  key={action.key}
                  onPress={() => void handleAction(action.key)}
                  disabled={disabled}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.actionItem,
                    pressed ? styles.pressed : undefined,
                    disabled ? styles.disabled : undefined,
                  ]}
                >
                  <action.icon
                    size={16}
                    strokeWidth={2.3}
                    color={isDanger ? "#FF9A9A" : safeAccent}
                  />
                  <Text
                    style={[
                      styles.label,
                      isDanger ? styles.labelDanger : undefined,
                    ]}
                    numberOfLines={1}
                  >
                    {action.label}
                  </Text>
                  {isBusy ? <View style={styles.busyDot} /> : null}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={disabled ? undefined : onClose}
            disabled={disabled}
            hitSlop={6}
            style={({ pressed }) => [
              styles.closeButton,
              pressed ? styles.pressed : undefined,
              disabled ? styles.disabled : undefined,
            ]}
          >
            <X size={15} strokeWidth={2.4} color="#F6FFF9" />
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 75,
    elevation: 75,
  },
  bar: {
    minHeight: 48,
    borderRadius: 18,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 6,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  actionsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  actionItem: {
    minWidth: 52,
    height: 36,
    borderRadius: 12,
    marginRight: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 1,
    color: "#F6FFF9",
    fontSize: 9,
    fontWeight: "800",
  },
  labelDanger: {
    color: "#FFB2B2",
  },
  busyDot: {
    position: "absolute",
    top: 4,
    right: 7,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(246,255,249,0.72)",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  disabled: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
});

export default MessageTopActionBar;
