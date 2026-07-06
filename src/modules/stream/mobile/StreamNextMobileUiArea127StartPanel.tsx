import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamNextMobileUiArea127StartVariant = "live" | "shorts" | "business" | "profile";

type StreamNextMobileUiArea127StartPanelProps = {
  readonly version?: "127A" | string;
  readonly variant: StreamNextMobileUiArea127StartVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checkpoints: readonly string[];
  readonly boundary: string;
};

const routeCopy: Record<StreamNextMobileUiArea127StartVariant, RouteCopy> = {
  live: {
    icon: "radio-outline",
    title: "Зона готовности эфира открыта",
    body: "Маршрут эфира переходит к ясности готовности: вход в комнату, управление ведущего, доверие зрителя и граница провайдера остаются спокойными до реальной связки.",
    checkpoints: ["комната готова", "ведущий чисто", "доверие зрителя"],
    boundary: "реальный запуск эфира остаётся закрытым",
  },
  shorts: {
    icon: "film-outline",
    title: "Зона готовности шортов открыта",
    body: "Маршрут шортов переходит к ясности готовности: вход в черновик, управление редактором, действия зрителя и граница публикации читаются до реальной загрузки.",
    checkpoints: ["черновик готов", "редактор чисто", "публикация закрыта"],
    boundary: "реальная загрузка остаётся закрытой",
  },
  business: {
    icon: "storefront-outline",
    title: "Зона готовности бизнеса открыта",
    body: "Бизнес-маршрут переходит к ясности готовности: вход продавца, управление каталогом, доверие покупателя и мерчант-граница читаются до реальной связки провайдера.",
    checkpoints: ["продавец готов", "каталог чисто", "мерчант закрыт"],
    boundary: "оплата и KYB остаются закрытыми",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Зона готовности профиля открыта",
    body: "Маршрут профиля переходит к ясности готовности: вход автора, публичный профиль, доверие зрителя и граница проверки читаются до реальной связки.",
    checkpoints: ["автор готов", "профиль чисто", "проверка закрыта"],
    boundary: "проверка и выплаты остаются закрытыми",
  },
};

export function StreamNextMobileUiArea127StartPanel({
  version = "127A",
  variant,
  compact = false,
  style,
}: StreamNextMobileUiArea127StartPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(124,230,196,0.10)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#06120F" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · зона готовности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#06120F" />
            <Text style={styles.statusText}>только интерфейс</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.checkRow}>
          {copy.checkpoints.map((item) => (
            <View key={item} style={styles.checkPill}>
              <Ionicons name="checkmark-circle-outline" size={10} color="#7CE6C4" />
              <Text style={styles.checkText} numberOfLines={1}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="lock-closed-outline" size={14} color="#7CE6C4" />
          <Text style={styles.boundaryText} numberOfLines={1}>{copy.boundary}</Text>
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
    borderColor: "rgba(124,230,196,0.18)",
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
    backgroundColor: "#7CE6C4",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#7CE6C4", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  statusBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#7CE6C4",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: { color: "#06120F", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#E6FFF7", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  boundaryRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124,230,196,0.08)",
    borderWidth: 1,
    borderColor: "rgba(124,230,196,0.15)",
  },
  boundaryText: { color: "#E6FFF7", fontSize: 10, fontWeight: "900", flex: 1 },
});
