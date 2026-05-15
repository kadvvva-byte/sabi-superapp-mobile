import React, { useCallback, useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "../../../../shared/i18n";

export type AnimatedHubAction = "reaction" | "emoji" | "gift";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;
  onClose: () => void;
  onSelect: (action: AnimatedHubAction) => void;
};

type HubCard = {
  id: AnimatedHubAction;
  icon: keyof typeof Ionicons.glyphMap;
  tail: string;
};

const HUB_CARDS: readonly HubCard[] = [
  {
    id: "reaction",
    icon: "sparkles-outline",
    tail: "5s",
  },
  {
    id: "emoji",
    icon: "happy-outline",
    tail: "2 COIN",
  },
  {
    id: "gift",
    icon: "gift-outline",
    tail: "3D",
  },
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

function buildCardColors(id: AnimatedHubAction, accent: string, accentSoft: string): [string, string] {
  if (id === "reaction") {
    return [withAlpha(accentSoft, 0.34), "rgba(15,30,74,0.96)"];
  }

  if (id === "gift") {
    return ["rgba(255,222,129,0.24)", "rgba(72,45,10,0.96)"];
  }

  return [withAlpha(accent, 0.24), "rgba(7,46,36,0.96)"];
}

export function AnimatedHubSheet({
  visible,
  accent,
  accentSoft,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const tx = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t],
  );

  const texts = useMemo(
    () => ({
      title: tx("messenger.animatedHub.title", "Animated"),
      subtitle: tx("messenger.animatedHub.subtitle", "reaction · emoji · GIFT 3D PREMIUM"),
      reactionTitle: tx("messenger.animatedHub.reactionTitle", "Animated Reaction"),
      reactionSubtitle: tx(
        "messenger.animatedHub.reactionSubtitle",
        "full-screen premium reactions · 5 sec",
      ),
      emojiTitle: tx("messenger.animatedHub.emojiTitle", "Animated Emoji"),
      emojiSubtitle: tx(
        "messenger.animatedHub.emojiSubtitle",
        "premium emoji layer · no 3D · no audio",
      ),
      giftTitle: tx("messenger.animatedHub.giftTitle", "GIFT 3D PREMIUM"),
      giftSubtitle: tx(
        "messenger.animatedHub.giftSubtitle",
        "paid premium 3D gifts",
      ),
    }),
    [tx],
  );

  const safeAccent = accent || "#56F3C1";
  const safeAccentSoft = accentSoft || withAlpha(safeAccent, 0.18);

  const localizedCards = useMemo(
    () =>
      HUB_CARDS.map((item) => {
        const title =
          item.id === "reaction"
            ? texts.reactionTitle
            : item.id === "gift"
              ? texts.giftTitle
              : texts.emojiTitle;
        const subtitle =
          item.id === "reaction"
            ? texts.reactionSubtitle
            : item.id === "gift"
              ? texts.giftSubtitle
              : texts.emojiSubtitle;

        return {
          ...item,
          colors: buildCardColors(item.id, safeAccent, safeAccentSoft),
          title,
          subtitle,
        };
      }),
    [
      safeAccent,
      safeAccentSoft,
      texts.emojiSubtitle,
      texts.emojiTitle,
      texts.giftSubtitle,
      texts.giftTitle,
      texts.reactionSubtitle,
      texts.reactionTitle,
    ],
  );

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
            style={[styles.sheet, { borderColor: withAlpha(safeAccent, 0.18) }]}
          >
            <View
              style={[
                styles.sheetGlow,
                { backgroundColor: withAlpha(safeAccentSoft, 0.16) },
              ]}
            />
            <View
              style={[
                styles.sheetGlowAlt,
                { backgroundColor: withAlpha(safeAccent, 0.10) },
              ]}
            />

            <View style={styles.handle} />

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <View style={styles.headerRow}>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.title}>{texts.title}</Text>
                  <Text style={styles.subtitle}>{texts.subtitle}</Text>
                </View>

                <Pressable onPress={onClose} style={styles.closeWrap}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                      style={[
                        styles.closeButton,
                        { borderColor: withAlpha(safeAccent, 0.16) },
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <Ionicons name="close" size={18} color="#F6FFF9" />
                    </LinearGradient>
                  )}
                </Pressable>
              </View>

              {localizedCards.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => onSelect(item.id)}
                  style={styles.cardWrap}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={item.colors}
                      style={[
                        styles.card,
                        { borderColor: withAlpha(safeAccent, 0.12) },
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <View style={styles.cardLeft}>
                        <View
                          style={[
                            styles.iconWrap,
                            {
                              borderColor: withAlpha(safeAccent, 0.18),
                              backgroundColor: withAlpha(safeAccentSoft, 0.14),
                            },
                          ]}
                        >
                          <Ionicons name={item.icon} size={18} color={safeAccent} />
                        </View>

                        <View style={styles.cardTextWrap}>
                          <Text style={styles.cardTitle}>{item.title}</Text>
                          <Text style={styles.cardSubtitle} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.tailPill,
                          {
                            borderColor: withAlpha(safeAccent, 0.14),
                            backgroundColor: withAlpha(safeAccentSoft, 0.10),
                          },
                        ]}
                      >
                        <Text style={styles.tailText}>{item.tail}</Text>
                      </View>
                    </LinearGradient>
                  )}
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
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(3,11,10,0.42)",
    paddingHorizontal: 10,
  },
  wrap: {
    paddingTop: 10,
  },
  sheet: {
    borderRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    maxHeight: 340,
  },
  sheetGlow: {
    position: "absolute",
    top: -32,
    right: -26,
    width: 170,
    height: 140,
    borderRadius: 170,
  },
  sheetGlowAlt: {
    position: "absolute",
    left: -28,
    bottom: 20,
    width: 140,
    height: 140,
    borderRadius: 140,
  },
  handle: {
    alignSelf: "center",
    width: 46,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 8,
  },
  content: {
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    color: "#F6FFF9",
    fontSize: 14,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 2,
    color: "rgba(232,255,246,0.54)",
    fontSize: 10,
    fontWeight: "700",
  },
  closeWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    overflow: "hidden",
  },
  closeButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrap: {
    marginBottom: 10,
  },
  card: {
    minHeight: 88,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    color: "#F6FFF9",
    fontSize: 13,
    fontWeight: "900",
  },
  cardSubtitle: {
    marginTop: 3,
    color: "rgba(232,255,246,0.68)",
    fontSize: 11,
    fontWeight: "700",
  },
  tailPill: {
    minWidth: 52,
    height: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tailText: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.988 }],
  },
});

export default AnimatedHubSheet;

