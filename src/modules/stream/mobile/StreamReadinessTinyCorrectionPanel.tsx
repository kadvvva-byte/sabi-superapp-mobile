import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type StreamReadinessTinyCorrectionVariant = "live" | "shorts" | "business" | "profile";

type StreamReadinessTinyCorrectionPanelProps = {
  readonly version?: "127G" | string;
  readonly variant: StreamReadinessTinyCorrectionVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly correction: string;
  readonly checks: readonly string[];
};

const routeCopy: Record<StreamReadinessTinyCorrectionVariant, RouteCopy> = {
  live: {
    icon: "radio-outline",
    title: "Коррекция готовности эфира",
    body: "Эфир сохраняет готовность ведущего, состояние комнаты, доверие зрителя и честное описание закрытого запуска до начала работы с провайдером.",
    correction: "готовность комнаты остаётся понятной",
    checks: ["ведущий готов", "доверие зрителя", "запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Коррекция готовности шортов",
    body: "Шорты сохраняют готовность черновика, состояние редактора, действие зрителя и честное описание закрытой публикации до начала работы с загрузкой.",
    correction: "готовность черновика остаётся понятной",
    checks: ["черновик готов", "состояние редактора", "публикация закрыта"],
  },
  business: {
    icon: "storefront-outline",
    title: "Коррекция готовности бизнеса",
    body: "Бизнес сохраняет готовность продавца, состояние каталога, доверие покупателя и честное описание закрытого мерчанта до подключения провайдера.",
    correction: "готовность продавца остаётся понятной",
    checks: ["продавец готов", "состояние каталога", "провайдер закрыт"],
  },
  profile: {
    icon: "person-circle-outline",
    title: "Коррекция готовности профиля",
    body: "Профиль сохраняет готовность автора, состояние публичного профиля, доверие зрителя и честное описание закрытой проверки до работы над запуском.",
    correction: "готовность автора остаётся понятной",
    checks: ["автор готов", "состояние профиля", "проверка закрыта"],
  },
};

export function StreamReadinessTinyCorrectionPanel({
  version = "127G",
  variant,
  compact = false,
  style,
}: StreamReadinessTinyCorrectionPanelProps) {
  const copy = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(158,232,255,0.11)", "rgba(255,255,255,0.04)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 13 : 15} color="#061018" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Коррекция готовности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#9EE8FF" />
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.correctionRow}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#9EE8FF" />
          <Text style={styles.correctionText} numberOfLines={1}>{copy.correction}</Text>
        </View>

        <View style={styles.checkRow}>
          {copy.checks.map((item) => (
            <View key={item} style={styles.checkPill}>
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
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(158,232,255,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  cardCompact: { paddingHorizontal: 10, paddingVertical: 8, gap: 7 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: "#9EE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#9EE8FF", fontSize: 10, fontWeight: "900", letterSpacing: 0.28, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(158,232,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(158,232,255,0.16)",
  },
  body: { color: "#EAFBFF", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  correctionRow: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(158,232,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(158,232,255,0.14)",
  },
  correctionText: { color: "#EAFBFF", fontSize: 10, fontWeight: "900", flex: 1 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkPill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
