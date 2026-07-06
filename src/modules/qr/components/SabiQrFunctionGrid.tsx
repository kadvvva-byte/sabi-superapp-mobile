import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQrMobileTranslations } from "../../../shared/i18n/qr-mobile-hooks";
import type { SabiQrFunctionDefinition } from "../contracts/universalQr.contracts";
import { getSabiQrVisualTheme } from "../runtime/qrVisualTheme";

export default function SabiQrFunctionGrid({
  items,
  onPress,
}: {
  items: SabiQrFunctionDefinition[];
  onPress: (item: SabiQrFunctionDefinition) => void;
}) {
  const { functionTitle, valueLabel } = useQrMobileTranslations();

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const theme = getSabiQrVisualTheme(item);
        return (
          <Pressable key={item.code} onPress={() => onPress(item)} style={[styles.card, { borderColor: theme.accentSoft }]}> 
            <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft }]}> 
              <Ionicons name={resolveIcon(item.surface)} size={20} color={theme.accent} />
            </View>
            <Text style={styles.title}>{functionTitle(item.code)}</Text>
            <View style={styles.footerRow}>
              <Text style={styles.badge}>{valueLabel(item.surface)}</Text>
              <Text style={styles.badge}>{valueLabel(item.domain)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function resolveIcon(surface: SabiQrFunctionDefinition["surface"]): keyof typeof Ionicons.glyphMap {
  if (surface === "wallet") return "wallet";
  if (surface === "coin_wallet") return "diamond";
  if (surface === "crypto_wallet") return "logo-bitcoin";
  if (surface === "merchant") return "storefront";
  if (surface === "business") return "briefcase";
  if (surface === "messenger") return "chatbubble-ellipses";
  if (surface === "marketplace") return "bag-handle";
  if (surface === "stream") return "radio";
  if (surface === "taxi") return "car";
  if (surface === "delivery") return "bicycle";
  if (surface === "school_attendance") return "school";
  if (surface === "work_attendance") return "business";
  if (surface === "virtual_card") return "card";
  return "person-circle";
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "48%",
    minHeight: 132,
    borderRadius: 24,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
  },
  iconWrap: { width: 42, height: 42, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { color: "#FFFFFF", fontSize: 15, lineHeight: 19, fontWeight: "900", flex: 1 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12 },
  badge: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "900" },
});
