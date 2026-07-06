import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Stream126RouteVariant = "live" | "shorts" | "business" | "profile";
type IconName = keyof typeof Ionicons.glyphMap;

type StreamNextMobileUiArea126StartPanelProps = {
  version?: string;
  variant: Stream126RouteVariant;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  eyebrow: string;
  title: string;
  body: string;
  main: string;
  support: string;
  boundary: string;
  icon: IconName;
  checks: Array<{ label: string; value: string; icon: IconName }>;
};

const COPY: Record<Stream126RouteVariant, RouteCopy> = {
  live: {
    eyebrow: "Зона потока эфира",
    title: "Поток комнаты эфира готов к следующей проверке интерфейса.",
    body: "После фиксации идентичности маршрут эфира переходит к ясности комнаты: вход, действие ведущего, доверие зрителя и граница рабочего запуска остаются читаемыми.",
    main: "поток комнаты первым",
    support: "передача зрителю чистая",
    boundary: "реальный запуск через провайдера остаётся закрытым",
    icon: "radio-outline",
    checks: [
      { label: "путь входа", value: "чисто", icon: "enter-outline" },
      { label: "действие ведущего", value: "стабильно", icon: "person-circle-outline" },
      { label: "доверие зрителя", value: "безопасно", icon: "people-outline" },
    ],
  },
  shorts: {
    eyebrow: "Зона потока шортов",
    title: "Поток черновика шортов готов к следующей проверке интерфейса.",
    body: "После фиксации идентичности маршрут шортов переходит к ясности черновика: вход в монтаж, выбор медиа, граница публикации и действие зрителя остаются читаемыми.",
    main: "поток черновика первым",
    support: "передача в редактор чистая",
    boundary: "реальная загрузка остаётся закрытой",
    icon: "videocam-outline",
    checks: [
      { label: "путь монтажа", value: "чисто", icon: "create-outline" },
      { label: "выбор медиа", value: "стабильно", icon: "albums-outline" },
      { label: "линия публикации", value: "закрыто", icon: "lock-closed-outline" },
    ],
  },
  business: {
    eyebrow: "Зона потока бизнеса",
    title: "Поток бизнес-эфира готов к следующей проверке интерфейса.",
    body: "После фиксации идентичности бизнес-маршрут переходит к ясности продавца: вход магазина, действие каталога, контрольная граница и доверие клиента остаются читаемыми.",
    main: "поток продавца первым",
    support: "передача каталога чистая",
    boundary: "оплата и KYB остаются закрытыми",
    icon: "briefcase-outline",
    checks: [
      { label: "путь магазина", value: "чисто", icon: "business-outline" },
      { label: "действие каталога", value: "стабильно", icon: "grid-outline" },
      { label: "compliance", value: "закрыто", icon: "shield-checkmark-outline" },
    ],
  },
  profile: {
    eyebrow: "Зона потока профиля",
    title: "Поток профиля автора готов к следующей проверке интерфейса.",
    body: "После фиксации идентичности маршрут профиля переходит к ясности автора: вход в настройку, публичная карточка, граница проверки и доверие к заработку остаются читаемыми.",
    main: "поток автора первым",
    support: "передача настройки чистая",
    boundary: "проверка и выплаты остаются закрытыми",
    icon: "person-circle-outline",
    checks: [
      { label: "путь настройки", value: "чисто", icon: "options-outline" },
      { label: "публичная карточка", value: "стабильно", icon: "id-card-outline" },
      { label: "линия заработка", value: "закрыто", icon: "lock-closed-outline" },
    ],
  },
};

export function StreamNextMobileUiArea126StartPanel({
  version = "126A",
  variant,
  compact = false,
  style,
}: StreamNextMobileUiArea126StartPanelProps) {
  const copy = COPY[variant];

  return (
    <LinearGradient
      colors={["rgba(250,255,252,0.98)", "rgba(235,247,241,0.95)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.compactCard, style]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={copy.icon} size={20} color="#1E6445" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{version} · {copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
        </View>
      </View>

      <Text style={styles.body}>{copy.body}</Text>

      <View style={styles.pillRow}>
        <View style={styles.primaryPill}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#1E6445" />
          <Text style={styles.primaryPillText}>{copy.main}</Text>
        </View>
        <View style={styles.secondaryPill}>
          <Ionicons name="swap-horizontal-outline" size={14} color="#466A56" />
          <Text style={styles.secondaryPillText}>{copy.support}</Text>
        </View>
      </View>

      <View style={styles.checkGrid}>
        {copy.checks.map((item) => (
          <View key={item.label} style={styles.checkItem}>
            <Ionicons name={item.icon} size={15} color="#1E6445" />
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>{item.label}</Text>
              <Text style={styles.checkValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.boundaryLine}>
        <Ionicons name="lock-closed-outline" size={15} color="#2F7252" />
        <Text style={styles.boundaryText}>{copy.boundary}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(46, 122, 83, 0.18)",
    shadowColor: "#123B29",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  compactCard: {
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201, 236, 218, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(46, 122, 83, 0.16)",
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#3F765B",
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 3,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    color: "#123B29",
  },
  body: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "rgba(18, 59, 41, 0.68)",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  primaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(46, 122, 83, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(46, 122, 83, 0.16)",
  },
  primaryPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E6445",
  },
  secondaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255, 255, 255, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(70, 106, 86, 0.14)",
  },
  secondaryPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#466A56",
  },
  checkGrid: {
    marginTop: 12,
    gap: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  checkTextWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  checkLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(18, 59, 41, 0.72)",
  },
  checkValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1E6445",
  },
  boundaryLine: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "rgba(230, 246, 237, 0.82)",
  },
  boundaryText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    color: "#2F7252",
  },
});
