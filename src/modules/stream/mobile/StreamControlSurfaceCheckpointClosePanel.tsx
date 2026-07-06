import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamControlSurfaceCheckpointCloseVariant = "live" | "shorts" | "business" | "profile";

type StreamControlSurfaceCheckpointClosePanelProps = {
  readonly version?: "124H" | string;
  readonly variant: StreamControlSurfaceCheckpointCloseVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<StreamControlSurfaceCheckpointCloseVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly checks: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Контроль эфира: чекпоинт закрыт",
    body: "Эфир держит запуск ведущего, камеру, микрофон и границу реального провайдера в одной спокойной панели управления.",
    checks: ["действие ведущего", "камера спокойная", "запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Контроль шортов: чекпоинт закрыт",
    body: "Шорты держат действия зрителя, управление редактором и блокировку публикации/загрузки в читаемой мобильной панели.",
    checks: ["действие зрителя", "редактор читаемый", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Контроль бизнеса: чекпоинт закрыт",
    body: "Бизнес держит действия продавца, каталог и блокировки оплаты/KYB понятными без фейковых коммерческих состояний.",
    checks: ["действие продавца", "каталог понятен", "оплата закрыта"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Контроль профиля: чекпоинт закрыт",
    body: "Профиль держит действия автора, управление профилем и блокировки проверки/заработка понятными без фейкового статуса.",
    checks: ["действие автора", "профиль понятен", "заработок закрыт"],
  },
};

export function StreamControlSurfaceCheckpointClosePanel({
  version = "124H",
  variant,
  compact = false,
  style,
}: StreamControlSurfaceCheckpointClosePanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.13)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · закрытие чекпоинта управления</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.closePill}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#F2C75B" />
            <Text style={styles.closeText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          {copy.body}
        </Text>

        <View style={styles.checkRow}>
          {copy.checks.map((item) => (
            <View key={item} style={styles.checkPill}>
              <Ionicons name="ellipse" size={5} color="#F2C75B" />
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
    borderColor: "rgba(242,199,91,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  cardCompact: { paddingHorizontal: 10, paddingVertical: 8, gap: 7 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: "#F2C75B",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#F2C75B", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  closePill: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "rgba(242,199,91,0.10)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  closeText: { color: "#F2C75B", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DDD7E8", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkPill: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
