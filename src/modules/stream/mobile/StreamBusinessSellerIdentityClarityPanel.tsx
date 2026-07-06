import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamBusinessSellerIdentityClarityPanelProps = {
  readonly version?: "125D" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const sellerRows = [
  { label: "профиль продавца", value: "видно", icon: "storefront-outline" },
  { label: "название магазина", value: "ясно", icon: "business-outline" },
  { label: "доверие каталога", value: "стабильно", icon: "list-circle-outline" },
] as const;

export function StreamBusinessSellerIdentityClarityPanel({
  version = "125D",
  compact = false,
  style,
}: StreamBusinessSellerIdentityClarityPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.14)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="storefront-outline" size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Business профиль продавца</Text>
            <Text style={styles.title} numberOfLines={1}>Профиль продавца и магазин остаются понятными</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={12} color="#0B0810" />
            <Text style={styles.lockText}>KYB заблокирован</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Business-маршрут понятно показывает имя продавца, профиль магазина, доверие каталога и границу проверки; реальная активация мерчанта остаётся заблокирована до серверного и админского этапа.
        </Text>

        <View style={styles.sellerGrid}>
          {sellerRows.map((item) => (
            <View key={item.label} style={styles.sellerItem}>
              <Ionicons name={item.icon} size={15} color="#F2C75B" />
              <View style={styles.sellerTextWrap}>
                <Text style={styles.sellerLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.sellerValue} numberOfLines={1}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#F2C75B" />
          <Text style={styles.boundaryText} numberOfLines={1}>Только мобильный UI · настоящий мерчант-режим позже</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  wrapperCompact: { marginBottom: 7 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 9,
  },
  cardCompact: { paddingHorizontal: 10, paddingVertical: 8, gap: 7 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 15,
    backgroundColor: "#F2C75B",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#F2C75B", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#F6E7B0", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  sellerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sellerItem: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sellerTextWrap: { minWidth: 82 },
  sellerLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  sellerValue: { color: "#F2C75B", fontSize: 9, fontWeight: "900", textTransform: "uppercase", marginTop: 1 },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(242,199,91,0.08)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.14)",
  },
  boundaryText: { color: "#F6E7B0", fontSize: 10, fontWeight: "900", flex: 1 },
});
