import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamSurfaceClarityFinalCloseLockVariant = "live" | "shorts" | "business" | "profile";

type StreamSurfaceClarityFinalCloseLockPanelProps = {
  readonly version?: "122K" | string;
  readonly variant: StreamSurfaceClarityFinalCloseLockVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const variantCopy: Record<StreamSurfaceClarityFinalCloseLockVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly locks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Закрытие поверхности эфира",
    body: "Мобильная поверхность эфира закрыта для этапа только интерфейса: вход ведущего остаётся первым, камера спокойной, а реальный запуск ждёт подключения провайдера.",
    locks: ["сначала ведущий", "камера спокойная", "запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Закрытие поверхности шортов",
    body: "Мобильная поверхность шортов закрыта для этапа только интерфейса: путь просмотра чистый, редактор доступен, публикация закрыта.",
    locks: ["просмотр чистый", "редактор готов", "публикация закрыта"],
  },
  business: {
    icon: "briefcase-outline",
    title: "Закрытие бизнес-поверхности",
    body: "Поверхность Бизнес-стрима закрыта для этапа только интерфейса: доверие продавца первое, путь каталога понятный, оплата закрыта.",
    locks: ["доверие продавца", "каталог понятный", "оплата закрыта"],
  },
  profile: {
    icon: "id-card-outline",
    title: "Закрытие поверхности профиля",
    body: "Поверхность профиля автора закрыта для этапа только интерфейса: идентичность первая, проверка честная, заработок закрыт.",
    locks: ["сначала идентичность", "честный бейдж", "заработок закрыт"],
  },
};

export function StreamSurfaceClarityFinalCloseLockPanel({
  version = "122K",
  variant,
  compact = false,
  style,
}: StreamSurfaceClarityFinalCloseLockPanelProps) {
  const copy = variantCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.042)", "rgba(242,199,91,0.06)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#F2C75B" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Закрытие понятности поверхности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.statePill}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#0B0810" />
            <Text style={styles.stateText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.lockRow}>
          {copy.locks.map((item) => (
            <View key={item} style={styles.lockPill}>
              <View style={styles.lockDot} />
              <Text style={styles.lockText} numberOfLines={1}>{item}</Text>
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
  lockRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  lockPill: {
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
  lockDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#F2C75B" },
  lockText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
