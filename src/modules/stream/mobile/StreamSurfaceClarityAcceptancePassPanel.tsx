import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamSurfaceClarityAcceptanceVariant = "live" | "shorts" | "business" | "profile";

type StreamSurfaceClarityAcceptancePassPanelProps = {
  readonly version?: "122F" | string;
  readonly variant: StreamSurfaceClarityAcceptanceVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const variantCopy: Record<StreamSurfaceClarityAcceptanceVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly points: readonly string[];
}> = {
  live: {
    icon: "videocam-outline",
    title: "Поверхность эфира принята",
    body: "Вход ведущего, настройка камеры, текст запуска комнаты и граница реального провайдера остаются понятными без имитации подключения прямого эфира.",
    points: ["путь ведущего принят", "настройка комнаты принята", "провайдер закрыт"],
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Поверхность шортов принята",
    body: "Просмотр, редактор, эффекты и путь публикации остаются понятными, а загрузка и публикация через провайдера закрыты до реального этапа.",
    points: ["путь просмотра принят", "путь редактора принят", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Бизнес-поверхность принята",
    body: "Вход продавца, путь каталога, текст доверия, KYB, кошелёк, оплата и заказы остаются честными без имитации коммерции.",
    points: ["путь продавца принят", "граница каталога принята", "оплата закрыта"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Поверхность профиля принята",
    body: "Идентичность автора, маршрут проверки, официальный бейдж, заработок, подарки и выплаты остаются понятными и закрытыми.",
    points: ["идентичность принята", "проверка закрыта", "заработок закрыт"],
  },
};

export function StreamSurfaceClarityAcceptancePassPanel({
  version = "122F",
  variant,
  compact = false,
  style,
}: StreamSurfaceClarityAcceptancePassPanelProps) {
  const copy = variantCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.12)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Приёмка понятности поверхности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="shield-checkmark-outline" size={13} color="#0B0810" />
            <Text style={styles.lockText}>принято</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.pointRow}>
          {copy.points.map((item) => (
            <View key={item} style={styles.pointPill}>
              <View style={styles.pointDot} />
              <Text style={styles.pointText} numberOfLines={1}>{item}</Text>
            </View>
          ))}
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
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DAD3E5", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  pointRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pointPill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pointDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#F2C75B" },
  pointText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
