import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamSurfaceClarityTinyCorrectionVariant = "live" | "shorts" | "business" | "profile";

type StreamSurfaceClarityTinyCorrectionPanelProps = {
  readonly version?: "122G" | string;
  readonly variant: StreamSurfaceClarityTinyCorrectionVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const variantCopy: Record<StreamSurfaceClarityTinyCorrectionVariant, {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly title: string;
  readonly body: string;
  readonly focus: readonly string[];
}> = {
  live: {
    icon: "radio-outline",
    title: "Маленькая коррекция поверхности эфира",
    body: "Путь ведущего остаётся спокойным, настройка камеры читаемой, а запуск комнаты сохраняет границу реального провайдера.",
    focus: ["путь ведущего", "текст камеры", "запуск закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Маленькая коррекция поверхности шортов",
    body: "Путь просмотра, вход в редактор и текст публикации остаются чистыми, а загрузка закрыта до реального этапа.",
    focus: ["путь просмотра", "вход в редактор", "публикация закрыта"],
  },
  business: {
    icon: "briefcase-outline",
    title: "Маленькая коррекция бизнес-поверхности",
    body: "Вход продавца, путь каталога и текст доверия остаются продуктово понятными, а оплата и KYB честно закрыты.",
    focus: ["вход продавца", "путь каталога", "оплата закрыта"],
  },
  profile: {
    icon: "id-card-outline",
    title: "Маленькая коррекция поверхности профиля",
    body: "Идентичность автора, маршрут проверки и текст заработка остаются читаемыми без фейковых бейджей и фейкового дохода.",
    focus: ["сначала идентичность", "проверка закрыта", "заработок закрыт"],
  },
};

export function StreamSurfaceClarityTinyCorrectionPanel({
  version = "122G",
  variant,
  compact = false,
  style,
}: StreamSurfaceClarityTinyCorrectionPanelProps) {
  const copy = variantCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "rgba(242,199,91,0.08)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#F2C75B" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · Маленькая коррекция понятности поверхности</Text>
            <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          </View>
          <View style={styles.statePill}>
            <Ionicons name="lock-closed-outline" size={12} color="#0B0810" />
            <Text style={styles.stateText}>honest</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{copy.body}</Text>

        <View style={styles.focusRow}>
          {copy.focus.map((item) => (
            <View key={item} style={styles.focusPill}>
              <View style={styles.focusDot} />
              <Text style={styles.focusText} numberOfLines={1}>{item}</Text>
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
  focusRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  focusPill: {
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
  focusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#F2C75B" },
  focusText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
