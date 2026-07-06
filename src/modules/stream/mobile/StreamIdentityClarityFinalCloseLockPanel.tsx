import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IdentityRouteVariant = "live" | "shorts" | "business" | "profile";

type StreamIdentityClarityFinalCloseLockPanelProps = {
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
    eyebrow: "закрывающая фиксация идентичности эфира",
    title: "Идентичность ведущего зафиксирована для следующей UI-зоны Stream.",
    body: "Маршрут эфира стабильно держит ведущего, название комнаты и доверие зрителей без заявления о настоящем запуске трансляции.",
    primary: "ведущий зафиксирован",
    secondary: "доверие комнаты зафиксировано",
    locked: "настоящий запуск остаётся закрыт",
  },
  shorts: {
    eyebrow: "закрывающая фиксация идентичности шорта",
    title: "Идентичность черновика автора зафиксирована для следующей UI-зоны Stream.",
    body: "Маршрут шортов стабильно держит автора, название черновика и контекст редактирования без заявления о настоящей публикации.",
    primary: "автор зафиксирован",
    secondary: "доверие черновика зафиксировано",
    locked: "загрузка остаётся закрыта",
  },
  business: {
    eyebrow: "закрывающая фиксация идентичности бизнеса",
    title: "Идентичность продавца зафиксирована для следующей UI-зоны Stream.",
    body: "Маршрут Business стабильно держит продавца, магазин и доверие каталога без активации платежей.",
    primary: "продавец зафиксирован",
    secondary: "доверие магазина зафиксировано",
    locked: "торговая активация остаётся закрыта",
  },
  profile: {
    eyebrow: "закрывающая фиксация идентичности профиля",
    title: "Идентичность профиля автора зафиксирована для следующей UI-зоны Stream.",
    body: "Маршрут профиля теперь стабильно держит автора, контекст проверки, доверие профиля и границу заработка без активации выплат.",
    primary: "профиль зафиксирован",
    secondary: "проверка зафиксирована",
    locked: "заработок остаётся закрыт",
  },
};

export function StreamIdentityClarityFinalCloseLockPanel({
  version = "125K",
  variant,
  compact = false,
  style,
}: StreamIdentityClarityFinalCloseLockPanelProps) {
  const copy = COPY[variant];

  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.98)", "rgba(246,239,220,0.95)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.compactCard, style]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-done-circle-outline" size={20} color="#684B13" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{version} · {copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
        </View>
      </View>

      <Text style={styles.body}>{copy.body}</Text>

      <View style={styles.lockGrid}>
        <View style={styles.lockPill}>
          <Ionicons name="person-circle-outline" size={14} color="#50652D" />
          <Text style={styles.lockPillText}>{copy.primary}</Text>
        </View>
        <View style={styles.lockPill}>
          <Ionicons name="bookmark-outline" size={14} color="#50652D" />
          <Text style={styles.lockPillText}>{copy.secondary}</Text>
        </View>
      </View>

      <View style={styles.boundaryLine}>
        <Ionicons name="lock-closed-outline" size={15} color="#7A5515" />
        <Text style={styles.boundaryText}>{copy.locked}</Text>
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
    borderColor: "rgba(146, 112, 35, 0.18)",
    shadowColor: "#3F2B07",
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
    backgroundColor: "rgba(225, 190, 92, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(104, 75, 19, 0.14)",
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7A5515",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 3,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    color: "#211707",
  },
  body: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "rgba(33, 23, 7, 0.68)",
  },
  lockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  lockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(80, 101, 45, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(80, 101, 45, 0.16)",
  },
  lockPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#3B5125",
  },
  boundaryLine: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "rgba(255, 247, 225, 0.9)",
  },
  boundaryText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    color: "#684B13",
  },
});
