import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamInteractionPathUiStartVariant = "live" | "shorts" | "business" | "profile";

type StreamInteractionPathUiStartPanelProps = {
  readonly version?: "123A" | string;
  readonly variant: StreamInteractionPathUiStartVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamInteractionPathUiStartVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly path: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Путь взаимодействия эфира",
    body: "Эфир открывает следующую зону только UI: путь ведущего читаемый, настройка устройства спокойная, а реальный запуск закрыт до готовности рантайма.",
    path: ["Ведущий", "Настройка", "Запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Путь взаимодействия шортов",
    body: "Шорты открывают следующую зону только UI: просмотр остаётся первым, создание читаемое, а публикация закрыта.",
    path: ["Просмотр", "Создание", "Публикация закрыта"],
  },
  business: {
    icon: "briefcase-outline",
    title: "Путь бизнес-взаимодействия",
    body: "Бизнес-эфир открывает следующую зону только UI: доверие к продавцу первое, путь каталога читаемый, а оплата закрыта.",
    path: ["Доверие", "Каталог", "Оплата закрыта"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Путь взаимодействия профиля",
    body: "Профиль автора открывает следующую зону только UI: идентичность первая, верификация честная, а заработок закрыт.",
    path: ["Идентичность", "Проверка", "Заработок закрыт"],
  },
};

export function StreamInteractionPathUiStartPanel({
  version = "123A",
  variant,
  compact = false,
  style,
}: StreamInteractionPathUiStartPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.045)", "rgba(242,199,91,0.055)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#F2C75B" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · UI пути взаимодействия</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.statePill}>
            <Ionicons name="phone-portrait-outline" size={12} color="#0B0810" />
            <Text style={styles.stateText}>только UI</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.pathRow}>
          {copy.path.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.pathPill}>
              <Text style={styles.pathIndex}>{index + 1}</Text>
              <Text style={styles.pathText} numberOfLines={1}>{item}</Text>
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
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stateText: { color: "#0B0810", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDD7E8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  pathRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pathPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pathIndex: { color: "#F2C75B", fontSize: 10, fontWeight: "900" },
  pathText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
