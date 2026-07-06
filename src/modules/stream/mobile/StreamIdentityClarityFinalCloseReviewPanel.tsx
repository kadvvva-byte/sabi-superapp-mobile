import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IdentityRouteVariant = "live" | "shorts" | "business" | "profile";

type StreamIdentityClarityFinalCloseReviewPanelProps = {
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
    eyebrow: "закрывающая проверка идентичности эфира",
    title: "Идентичность ведущего и доверие комнаты готовы для следующей UI-зоны.",
    body: "Маршрут эфира показывает имя ведущего, название комнаты, контекст аудитории и границу провайдера до начала работ с реальным рантаймом.",
    primary: "ведущий ясен",
    secondary: "доверие комнаты ясно",
    locked: "рантайм провайдера остаётся закрыт",
  },
  shorts: {
    eyebrow: "закрывающая проверка идентичности шорта",
    title: "Идентичность автора и контекст черновика готовы для следующей UI-зоны.",
    body: "Маршрут шортов показывает имя автора, метку черновика, состояние редактирования и границу загрузки без заявления о реальном сервисе публикации.",
    primary: "автор ясен",
    secondary: "доверие черновика ясно",
    locked: "рантайм загрузки остаётся закрыт",
  },
  business: {
    eyebrow: "закрывающая проверка идентичности бизнеса",
    title: "Идентичность продавца и контекст магазина готовы для следующей UI-зоны.",
    body: "Маршрут Business показывает продавца, метку магазина, доверие каталога и границу merchant-одобрения без активации платежей.",
    primary: "продавец ясен",
    secondary: "доверие магазина ясно",
    locked: "merchant-рантайм остаётся закрыт",
  },
  profile: {
    eyebrow: "закрывающая проверка идентичности профиля",
    title: "Идентичность профиля автора готова для следующей UI-зоны.",
    body: "Маршрут профиля показывает имя автора, контекст проверки, доверие профиля и границу заработка без активации выплат.",
    primary: "профиль ясен",
    secondary: "проверка ясна",
    locked: "рантайм заработка остаётся закрыт",
  },
};

export function StreamIdentityClarityFinalCloseReviewPanel({
  version = "125J",
  variant,
  compact = false,
  style,
}: StreamIdentityClarityFinalCloseReviewPanelProps) {
  const copy = COPY[variant];

  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.97)", "rgba(247,241,225,0.94)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.compactCard, style]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#684B13" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{version} · {copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
        </View>
      </View>

      <Text style={styles.body}>{copy.body}</Text>

      <View style={styles.reviewGrid}>
        <View style={styles.reviewPill}>
          <Ionicons name="person-outline" size={14} color="#50652D" />
          <Text style={styles.reviewText}>{copy.primary}</Text>
        </View>
        <View style={styles.reviewPill}>
          <Ionicons name="albums-outline" size={14} color="#50652D" />
          <Text style={styles.reviewText}>{copy.secondary}</Text>
        </View>
      </View>

      <View style={styles.lockLine}>
        <Ionicons name="lock-closed-outline" size={15} color="#7A5515" />
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
  reviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  reviewPill: {
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
  reviewText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#3B5125",
  },
  lockLine: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "rgba(255, 247, 225, 0.9)",
  },
  lockText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    color: "#684B13",
  },
});
