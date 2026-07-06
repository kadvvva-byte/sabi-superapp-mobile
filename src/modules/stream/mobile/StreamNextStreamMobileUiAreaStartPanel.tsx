import React, { useMemo } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type RouteVariant = "live" | "shorts" | "business" | "profile";
type IconName = keyof typeof Ionicons.glyphMap;

type StreamNextStreamMobileUiAreaStartPanelProps = {
  version?: string;
  variant: RouteVariant;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

type RouteCopy = {
  kicker: string;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  icon: IconName;
  checkpoints: Array<{ label: string; value: string; icon: IconName }>;
};

const ROUTE_COPY: Record<RouteVariant, RouteCopy> = {
  live: {
    kicker: "Live-маршрут",
    title: "Зона Live-комнаты начинается",
    body: "После фиксации панели управления следующая мобильная зона держит личность ведущего, безопасный вход в комнату и передачу зрителю понятными до подключения реального провайдера.",
    primaryLabel: "сначала личность комнаты",
    secondaryLabel: "запуск провайдера закрыт",
    icon: "radio-outline",
    checkpoints: [
      { label: "карточка ведущего", value: "чисто", icon: "person-circle-outline" },
      { label: "вход в комнату", value: "безопасно", icon: "enter-outline" },
      { label: "передача зрителю", value: "готово", icon: "people-outline" },
    ],
  },
  shorts: {
    kicker: "Shorts-маршрут",
    title: "Зона создания Shorts начинается",
    body: "Следующая мобильная зона держит личность черновика, вход в редактор и границу публикации чистыми, пока загрузка и выполнение через провайдера закрыты.",
    primaryLabel: "сначала личность черновика",
    secondaryLabel: "граница загрузки закрыта",
    icon: "videocam-outline",
    checkpoints: [
      { label: "карточка черновика", value: "чисто", icon: "albums-outline" },
      { label: "вход в редактор", value: "безопасно", icon: "create-outline" },
      { label: "линия публикации", value: "закрыто", icon: "lock-closed-outline" },
    ],
  },
  business: {
    kicker: "Business-маршрут",
    title: "Зона Business Stream начинается",
    body: "Следующая мобильная зона держит личность продавца, вход в каталог и compliance-границу понятными без фейковой оплаты или KYB-успеха.",
    primaryLabel: "сначала личность продавца",
    secondaryLabel: "оплата и KYB закрыты",
    icon: "briefcase-outline",
    checkpoints: [
      { label: "карточка продавца", value: "чисто", icon: "business-outline" },
      { label: "вход в каталог", value: "безопасно", icon: "grid-outline" },
      { label: "линия compliance", value: "закрыто", icon: "shield-checkmark-outline" },
    ],
  },
  profile: {
    kicker: "Profile-маршрут",
    title: "Зона профиля автора начинается",
    body: "Следующая мобильная зона держит личность автора, настройку профиля и границу заработка чистыми без фейковой верификации или баланса.",
    primaryLabel: "сначала личность автора",
    secondaryLabel: "граница заработка закрыта",
    icon: "person-circle-outline",
    checkpoints: [
      { label: "карточка автора", value: "чисто", icon: "id-card-outline" },
      { label: "вход в настройку", value: "безопасно", icon: "options-outline" },
      { label: "линия верификации", value: "закрыто", icon: "lock-closed-outline" },
    ],
  },
};

export function StreamNextStreamMobileUiAreaStartPanel({
  version = "125A",
  variant,
  compact = false,
  style,
}: StreamNextStreamMobileUiAreaStartPanelProps) {
  const copy = ROUTE_COPY[variant];
  const containerStyle = useMemo(
    () => [styles.container, compact ? styles.containerCompact : null, style],
    [compact, style],
  );

  return (
    <View style={containerStyle}>
      <LinearGradient colors={["rgba(246, 250, 255, 0.98)", "rgba(236, 244, 255, 0.94)"]} style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Ionicons name={copy.icon} size={18} color="#1F4F7A" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>{version} · {copy.kicker}</Text>
            <Text style={styles.title}>{copy.title}</Text>
          </View>
        </View>

        <Text style={styles.body}>{copy.body}</Text>

        <View style={styles.pillRow}>
          <View style={styles.primaryPill}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#17476F" />
            <Text style={styles.primaryPillText}>{copy.primaryLabel}</Text>
          </View>
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed-outline" size={14} color="#4D6172" />
            <Text style={styles.lockPillText}>{copy.secondaryLabel}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {copy.checkpoints.map((item) => (
            <View key={item.label} style={styles.checkItem}>
              <Ionicons name={item.icon} size={16} color="#2D638F" />
              <View style={styles.checkTextWrap}>
                <Text style={styles.checkLabel}>{item.label}</Text>
                <Text style={styles.checkValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boundaryRow}>
          <Ionicons name="layers-outline" size={15} color="#5A6C7A" />
          <Text style={styles.boundaryText}>Только мобильный UI · передача через kernel позже · без провайдера и движения денег</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  containerCompact: {
    marginTop: 10,
  },
  card: {
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(95, 136, 173, 0.18)",
    shadowColor: "#254B68",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(209, 231, 252, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(79, 126, 166, 0.2)",
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#5A7186",
  },
  title: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "900",
    color: "#153A57",
  },
  body: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: "#426174",
    fontWeight: "600",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 13,
  },
  primaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(197, 225, 249, 0.82)",
  },
  primaryPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17476F",
  },
  lockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(228, 234, 239, 0.86)",
  },
  lockPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4D6172",
  },
  grid: {
    marginTop: 13,
    gap: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(92, 134, 168, 0.14)",
  },
  checkTextWrap: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  checkLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#31586F",
  },
  checkValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1E5D88",
  },
  boundaryRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  boundaryText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "#5A6C7A",
  },
});
