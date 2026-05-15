import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useI18n } from "../../../shared/i18n";
import { getWalletSharedTexts } from "../../../shared/wallet/wallet-i18n";

export type WalletCardVisualStyle =
  | "midnight"
  | "ocean"
  | "emerald"
  | "violet"
  | "sunset"
  | "youth-neon";

type Props = {
  title: string;
  scheme: string;
  maskedPan: string;
  holder?: string;
  expiry?: string;
  balance?: string;
  badge?: string;
  selected?: boolean;
  visualStyle?: WalletCardVisualStyle;
  onPress?: () => void;
};

function getPalette(visualStyle: WalletCardVisualStyle) {
  switch (visualStyle) {
    case "ocean":
      return {
        colors: ["#0B2A48", "#184A7A", "#63B7FF"] as const,
        accent: "rgba(255,255,255,0.18)",
      };
    case "emerald":
      return {
        colors: ["#06261D", "#0E5A49", "#37D6A3"] as const,
        accent: "rgba(255,255,255,0.16)",
      };
    case "violet":
      return {
        colors: ["#1C1233", "#4C2E86", "#A78BFA"] as const,
        accent: "rgba(255,255,255,0.16)",
      };
    case "sunset":
      return {
        colors: ["#3A1707", "#A34518", "#FFB45E"] as const,
        accent: "rgba(255,255,255,0.16)",
      };
    case "youth-neon":
      return {
        colors: ["#081424", "#154C8A", "#63F0FF"] as const,
        accent: "rgba(120,255,220,0.18)",
      };
    case "midnight":
    default:
      return {
        colors: ["#111827", "#1F3A63", "#5DA3FF"] as const,
        accent: "rgba(255,255,255,0.16)",
      };
  }
}

function getSchemeIcon(scheme: string) {
  const normalized = scheme.toLowerCase();

  if (normalized.includes("visa")) {
    return <Text style={styles.schemeText}>VISA</Text>;
  }

  if (normalized.includes("master")) {
    return <Text style={styles.schemeText}>MC</Text>;
  }

  if (normalized.includes("union")) {
    return <Text style={styles.schemeText}>UP</Text>;
  }

  if (normalized.includes("humo")) {
    return <Text style={styles.schemeText}>HUMO</Text>;
  }

  if (normalized.includes("uzcard")) {
    return <Text style={styles.schemeText}>UZCARD</Text>;
  }

  return <MaterialCommunityIcons name="credit-card-outline" size={18} color="#FFFFFF" />;
}

export default function WalletVisualCard({
  title,
  scheme,
  maskedPan,
  holder = "—",
  expiry = "—",
  balance,
  badge,
  selected = false,
  visualStyle = "midnight",
  onPress,
}: Props) {
  const palette = getPalette(visualStyle);
  const { t } = useI18n();
  const texts = useMemo(() => getWalletSharedTexts(t), [t]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <LinearGradient
        colors={palette.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, selected && styles.cardSelected]}
      >
        <View style={[styles.glowOrb, { backgroundColor: palette.accent }]} />
        <View style={styles.topLight} />

        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSchemeSub}>{scheme}</Text>
          </View>

          <View style={styles.schemeWrap}>{getSchemeIcon(scheme)}</View>
        </View>

        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Ionicons name="hardware-chip-outline" size={18} color="#FFFFFF" />
          </View>

          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.pan}>{maskedPan}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>{texts.holder}</Text>
            <Text style={styles.metaValue}>{holder}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>{texts.expiry}</Text>
            <Text style={styles.metaValue}>{expiry}</Text>
          </View>

          <View style={[styles.metaBlock, styles.balanceBlock]}>
            <Text style={styles.metaLabel}>{texts.balance}</Text>
            <Text style={styles.metaValue}>{balance ?? "—"}</Text>
          </View>
        </View>

        {visualStyle === "youth-neon" ? (
          <View style={styles.neonStripeWrap}>
            <View style={styles.neonStripeA} />
            <View style={styles.neonStripeB} />
          </View>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
  pressed: {
    opacity: 0.94,
  },
  card: {
    minHeight: 214,
    borderRadius: 28,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  cardSelected: {
    borderColor: "rgba(255,255,255,0.26)",
  },
  glowOrb: {
    position: "absolute",
    right: -24,
    top: -12,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  topLight: {
    position: "absolute",
    top: 6,
    left: 16,
    right: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  topLeft: {
    flex: 1,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  cardSchemeSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
  },
  schemeWrap: {
    minWidth: 56,
    height: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  schemeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  chipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  chip: {
    width: 42,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  pan: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 22,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 10,
  },
  metaBlock: {
    flex: 1,
  },
  balanceBlock: {
    alignItems: "flex-end",
  },
  metaLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    marginBottom: 5,
  },
  metaValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  neonStripeWrap: {
    position: "absolute",
    right: -12,
    bottom: -6,
    width: 120,
    height: 68,
    transform: [{ rotate: "-12deg" }],
  },
  neonStripeA: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(99,240,255,0.26)",
  },
  neonStripeB: {
    position: "absolute",
    top: 32,
    left: 8,
    right: 16,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(111,255,49,0.18)",
  },
});