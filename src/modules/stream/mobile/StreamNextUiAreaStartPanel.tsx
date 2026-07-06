import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamNextUiAreaStartPanelProps = {
  readonly version?: "122A" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<RouteVariant, { icon: IconName; title: string; body: string; focus: readonly string[] }> = {
  live: {
    icon: "videocam-outline",
    title: "Старт поверхности эфира",
    body: "Следующая мобильная зона начинается с чистой поверхности ведущего и честной границы провайдера.",
    focus: ["ведущий", "путь комнаты", "провайдер закрыт"],
  },
  shorts: {
    icon: "film-outline",
    title: "Старт поверхности шортов",
    body: "Следующая зона шортов сохраняет понятный просмотр и монтаж, а публикация остаётся закрытой.",
    focus: ["просмотр", "путь монтажа", "публикация закрыта"],
  },
  business: {
    icon: "bag-handle-outline",
    title: "Старт поверхности бизнес-стрима",
    body: "Следующая зона бизнес-стрима держит доверие к продавцу первым, а платежи остаются закрытыми.",
    focus: ["доверие", "каталог", "оплата закрыта"],
  },
  profile: {
    icon: "person-outline",
    title: "Старт поверхности профиля",
    body: "Следующая зона профиля держит личность автора понятной, а заработок остаётся закрытым.",
    focus: ["личность", "профиль", "заработок закрыт"],
  },
};

export function StreamNextUiAreaStartPanel({
  version = "122A",
  variant,
  compact = false,
  style,
}: StreamNextUiAreaStartPanelProps) {
  const route = routeCopy[variant];

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.13)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={route.icon} size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · следующая зона интерфейса</Text>
            <Text style={styles.title} numberOfLines={1}>{route.title}</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="shield-checkmark-outline" size={13} color="#0B0810" />
            <Text style={styles.lockText}>только интерфейс</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>{route.body}</Text>

        <View style={styles.focusRow}>
          {route.focus.map((item) => (
            <View key={`${variant}-${item}`} style={styles.focusPill}>
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
    borderColor: "rgba(242,199,91,0.16)",
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
    backgroundColor: "#F2C75B",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, minWidth: 0 },
  kicker: { color: "#F2C75B", fontSize: 10, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginTop: 2 },
  lockPill: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: "#F2C75B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockText: { color: "#0B0810", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  body: { color: "#DAD3E5", fontSize: 11, fontWeight: "800", lineHeight: 16 },
  focusRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  focusPill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  focusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#F2C75B" },
  focusText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
