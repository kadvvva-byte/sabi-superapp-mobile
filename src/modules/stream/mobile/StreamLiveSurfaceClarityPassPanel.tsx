import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamLiveSurfaceClarityPassPanelProps = {
  readonly version?: "122B" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const liveSteps = [
  "вход ведущего чистый",
  "путь камеры спокойный",
  "запуск комнаты закрыт",
] as const;

export function StreamLiveSurfaceClarityPassPanel({
  version = "122B",
  compact = false,
  style,
}: StreamLiveSurfaceClarityPassPanelProps) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <LinearGradient
        colors={["rgba(242,199,91,0.14)", "rgba(255,255,255,0.045)"]}
        style={[styles.card, compact ? styles.cardCompact : null]}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="radio-outline" size={compact ? 14 : 16} color="#0B0810" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker} numberOfLines={1}>{version} · ясность Live-поверхности</Text>
            <Text style={styles.title} numberOfLines={1}>Вход в Live стал спокойнее и чище</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={13} color="#0B0810" />
            <Text style={styles.lockText}>закрыто</Text>
          </View>
        </View>

        <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
          Ведущий видит простой mobile-first путь: подготовить комнату, проверить камеру и ждать этапа реального Live-движка.
        </Text>

        <View style={styles.stepRow}>
          {liveSteps.map((item) => (
            <View key={item} style={styles.stepPill}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText} numberOfLines={1}>{item}</Text>
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
  stepRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  stepPill: {
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
  stepDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#F2C75B" },
  stepText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
});
