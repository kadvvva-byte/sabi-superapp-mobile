import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IdentityRouteVariant = "live" | "shorts" | "business" | "profile";

type StreamIdentityClarityFinalHandoffPanelProps = {
  version?: string;
  variant: IdentityRouteVariant;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const COPY: Record<IdentityRouteVariant, {
  eyebrow: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
  locked: string;
}> = {
  live: {
    eyebrow: "передача идентичности эфира",
    title: "Ведущий, комната и доверие зрителей остаются читаемыми.",
    body: "Маршрут эфира теперь держит имя ведущего, название комнаты и границу готовности вместе до подключения реального запуска провайдера.",
    primary: "ведущий виден",
    secondary: "название комнаты ясно",
    locked: "рантайм провайдера закрыт",
  },
  shorts: {
    eyebrow: "передача идентичности шорта",
    title: "Автор, черновик и состояние редактирования остаются читаемыми.",
    body: "Маршрут шортов ясно показывает автора и контекст черновика, пока загрузка и публикация недоступны до подключения реальных сервисов.",
    primary: "автор виден",
    secondary: "состояние черновика ясно",
    locked: "рантайм загрузки закрыт",
  },
  business: {
    eyebrow: "передача идентичности бизнеса",
    title: "Продавец, магазин и доверие каталога остаются читаемыми.",
    body: "Маршрут Business показывает продавца и контекст магазина, пока merchant-активация и KYB закрыты до реального backend-одобрения.",
    primary: "продавец виден",
    secondary: "контекст магазина ясен",
    locked: "merchant-рантайм закрыт",
  },
  profile: {
    eyebrow: "передача идентичности профиля",
    title: "Профиль автора и состояние проверки остаются читаемыми.",
    body: "Маршрут профиля ясно показывает автора и контекст проверки, пока заработок и runtime выплат недоступны.",
    primary: "профиль виден",
    secondary: "проверка ясна",
    locked: "рантайм заработка закрыт",
  },
};

export function StreamIdentityClarityFinalHandoffPanel({
  version = "125I",
  variant,
  compact = false,
  style,
}: StreamIdentityClarityFinalHandoffPanelProps) {
  const copy = COPY[variant];

  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.96)", "rgba(255,250,236,0.92)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.compactCard, style]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="person-circle-outline" size={20} color="#6C4E14" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{version} · {copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
        </View>
      </View>

      <Text style={styles.body}>{copy.body}</Text>

      <View style={styles.signalRow}>
        <View style={styles.signalPill}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#5E7A35" />
          <Text style={styles.signalText}>{copy.primary}</Text>
        </View>
        <View style={styles.signalPill}>
          <Ionicons name="reader-outline" size={14} color="#5E7A35" />
          <Text style={styles.signalText}>{copy.secondary}</Text>
        </View>
      </View>

      <View style={styles.lockLine}>
        <Ionicons name="lock-closed-outline" size={15} color="#8A6115" />
        <Text style={styles.lockText}>{copy.locked}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(165, 128, 42, 0.18)",
    shadowColor: "#3F2D0B",
    shadowOpacity: 0.08,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242, 199, 91, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(108, 78, 20, 0.14)",
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8A6115",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 3,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    color: "#231A0A",
  },
  body: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "rgba(35, 26, 10, 0.68)",
  },
  signalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  signalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(94, 122, 53, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(94, 122, 53, 0.16)",
  },
  signalText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#415729",
  },
  lockLine: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "rgba(255, 246, 223, 0.9)",
  },
  lockText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    color: "#6C4E14",
  },
});
