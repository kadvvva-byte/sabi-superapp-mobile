import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamSurfaceClarityCheckpointCloseVariant = "live" | "shorts" | "business" | "profile";

type StreamSurfaceClarityCheckpointClosePanelProps = {
  readonly version?: "122H" | string;
  readonly variant: StreamSurfaceClarityCheckpointCloseVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const variantCopy: Record<StreamSurfaceClarityCheckpointCloseVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Закрытие контрольной точки поверхности эфира",
    body: "Вход в эфир закрыт для проверки мобильного интерфейса: настройка ведущего остаётся понятной, а запуск через реального провайдера закрыт.",
    checks: ["вход ведущего", "путь камеры", "запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Закрытие контрольной точки поверхности шортов",
    body: "Поверхность шортов закрыта для проверки интерфейса: просмотр, вход в редактор и граница публикации остаются понятными и честными.",
    checks: ["поток просмотра", "путь редактора", "публикация закрыта"],
  },
  business: {
    icon: "briefcase-outline",
    title: "Закрытие контрольной точки бизнес-поверхности",
    body: "Поверхность Бизнес-стрима закрыта для проверки интерфейса: доверие продавца, путь каталога и граница оплаты остаются понятными.",
    checks: ["доверие продавца", "путь каталога", "оплата закрыта"],
  },
  profile: {
    icon: "id-card-outline",
    title: "Закрытие контрольной точки поверхности профиля",
    body: "Поверхность профиля автора закрыта для проверки интерфейса: идентичность, путь проверки и граница заработка остаются честными.",
    checks: ["сначала идентичность", "проверка закрыта", "заработок закрыт"],
  },
};

export function StreamSurfaceClarityCheckpointClosePanel({
  version = "122H",
  variant,
  compact = false,
  style,
}: StreamSurfaceClarityCheckpointClosePanelProps) {
  const copy = variantCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.055)", "rgba(242,199,91,0.075)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#F2C75B" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Закрытие контрольной точки понятности поверхности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.statePill}>
            <Ionicons name="checkmark-done-outline" size={12} color="#0B0810" />
            <Text style={styles.stateText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.checkRow}>
          {copy.checks.map((item) => (
            <View key={item} style={styles.checkPill}>
              <View style={styles.checkDot} />
              <Text style={styles.checkText} numberOfLines={1}>{item}</Text>
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
    borderColor: "rgba(255,255,255,0.09)",
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
    backgroundColor: "rgba(242,199,91,0.12)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#F2C75B", fontSize: 10, fontWeight: "900", letterSpacing: 0.28, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  statePill: {
    height: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stateText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDD7E8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkPill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#F2C75B" },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
