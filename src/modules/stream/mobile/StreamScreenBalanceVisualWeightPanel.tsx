import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamScreenBalanceVisualWeightVariant = "shell" | "live" | "shorts" | "business" | "profile";
type StreamScreenBalanceVisualWeightRoute = Exclude<StreamScreenBalanceVisualWeightVariant, "shell">;
type IconName = keyof typeof Ionicons.glyphMap;

type StreamScreenBalanceVisualWeightPanelProps = {
  readonly version?: "120E" | string;
  readonly variant?: StreamScreenBalanceVisualWeightVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly onOpenRoute?: (route: StreamScreenBalanceVisualWeightRoute) => void;
};

const variantCopy: Record<StreamScreenBalanceVisualWeightVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "120E · Баланс экрана",
    meta: "Stream сохраняет спокойный мобильный визуальный вес во всех маршрутах входа.",
    icon: "albums-outline",
  },
  live: {
    title: "120E · Баланс эфира",
    meta: "Старт эфира визуально разделяет настройку камеры, запуск и закрытое ядро.",
    icon: "radio-outline",
  },
  shorts: {
    title: "120E · Баланс шортов",
    meta: "Shorts держит просмотр, редактор и закрытую публикацию читаемыми на телефоне.",
    icon: "play-circle-outline",
  },
  business: {
    title: "120E · Баланс бизнеса",
    meta: "Бизнес-стрим показывает витрину честно, без фейковой оплаты и фейкового успеха продавца.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "120E · Баланс профиля",
    meta: "Профиль автора держит настройку, публичную идентичность и закрытый заработок понятными.",
    icon: "person-circle-outline",
  },
};

const routeOrder: readonly { route: StreamScreenBalanceVisualWeightRoute; label: string; icon: IconName }[] = [
  { route: "live", label: "Эфир", icon: "radio-outline" },
  { route: "shorts", label: "Шорты", icon: "play-circle-outline" },
  { route: "business", label: "Бизнес", icon: "briefcase-outline" },
  { route: "profile", label: "Профиль", icon: "person-circle-outline" },
];

const balanceChecks: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "resize-outline",
    title: "Сбалансированный визуальный вес",
    body: "Основные карточки читаются первыми, а закрытые заметки ядра остаются мягче и ниже по приоритету.",
  },
  {
    icon: "phone-portrait-outline",
    title: "Ритм под телефон",
    body: "Компактные панели держат короткие строки, безопасные зоны касания и спокойные вертикальные отступы для одной руки.",
  },
  {
    icon: "layers-outline",
    title: "Понятные слои экрана",
    body: "Вход, действие, настройка и закрытые зоны визуально не спорят друг с другом.",
  },
  {
    icon: "lock-closed-outline",
    title: "Закрытые состояния честные",
    body: "Провайдер, загрузка, оплата, подарки, кошелёк, заработок и админка закрыты без фейкового успеха.",
  },
];

const visualRules = [
  "первая видимая карточка объясняет маршрут, а не внутренний этап сборки",
  "закрытые состояния ядра видны, но остаются вторичными",
  "метки действий достаточно короткие для маленьких Android-экранов",
  "без выдуманных счётчиков, балансов, подписчиков, заказов и успеха провайдера",
] as const;

export function StreamScreenBalanceVisualWeightPanel({
  version = "120E",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
  onOpenRoute,
}: StreamScreenBalanceVisualWeightPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantCopy[variant];
  const readyCount = useMemo(() => balanceChecks.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} Баланс экрана Stream`}>
        <LinearGradient colors={["rgba(242,199,91,0.10)", "rgba(255,255,255,0.045)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
          <View style={styles.leftSide}>
            <View style={styles.iconBadge}>
              <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#09070D" />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
              <Text style={styles.meta} numberOfLines={1}>{copy.meta}</Text>
            </View>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{readyCount}/4</Text>
            <Ionicons name="chevron-forward" size={14} color="#09070D" />
          </View>
        </LinearGradient>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.sheetIcon}>
                <Ionicons name="albums-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Баланс экрана Stream</Text>
                <Text style={styles.sheetMeta}>Финальный проход визуального веса для более спокойного и чистого мобильного Stream перед этапами ядра.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Обычный режим остаётся сбалансированным: сначала продуктовый маршрут, затем закрытое ядро." : "Обычный режим должен оставаться включённым для этого прохода визуального баланса."}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.routeStrip}>
                {routeOrder.map((item) => (
                  <Pressable
                    key={item.route}
                    style={[styles.routeChip, item.route === variant ? styles.routeChipActive : null]}
                    onPress={() => onOpenRoute?.(item.route)}
                    accessibilityRole="button"
                    accessibilityLabel={`Открыть ${item.label}`}
                  >
                    <Ionicons name={item.icon} size={16} color={item.route === variant ? "#09070D" : "#F2C75B"} />
                    <Text style={[styles.routeChipText, item.route === variant ? styles.routeChipTextActive : null]}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.checkGrid}>
                {balanceChecks.map((item) => (
                  <View key={item.title} style={styles.checkCard}>
                    <View style={styles.checkIcon}>
                      <Ionicons name={item.icon} size={20} color="#F2C75B" />
                    </View>
                    <View style={styles.checkTextWrap}>
                      <Text style={styles.checkTitle}>{item.title}</Text>
                      <Text style={styles.checkBody}>{item.body}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.ruleBox}>
                <Text style={styles.ruleTitle}>Правила визуального веса сохранены</Text>
                {visualRules.map((rule) => (
                  <View key={rule} style={styles.ruleRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий UI-фокус</Text>
                <Text style={styles.nextBody}>Продолжить только финальную приёмку мобильных маршрутов и малые визуальные исправления; сервер, провайдер, админка, подарки, кошелёк и платежи остаются отложенными.</Text>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  wrapperCompact: { marginBottom: 7 },
  card: { borderRadius: 22, overflow: "hidden" },
  cardGradient: { minHeight: 56, borderRadius: 22, borderWidth: 1, borderColor: "rgba(242,199,91,0.14)", paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardGradientCompact: { minHeight: 48, paddingVertical: 6 },
  leftSide: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 9 },
  iconBadge: { width: 34, height: 34, borderRadius: 15, backgroundColor: "#F2C75B", alignItems: "center", justifyContent: "center" },
  copyWrap: { flex: 1, minWidth: 0 },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  meta: { color: "#D8D1E1", fontSize: 10, fontWeight: "800", marginTop: 3 },
  scorePill: { minWidth: 46, height: 29, borderRadius: 15, backgroundColor: "#F2C75B", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2 },
  scoreText: { color: "#09070D", fontSize: 11, fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  sheet: { maxHeight: "88%", borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: "#111018", borderWidth: 1, borderColor: "#292532", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  sheetTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  sheetIcon: { width: 48, height: 48, borderRadius: 20, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.20)", alignItems: "center", justifyContent: "center" },
  sheetTitleWrap: { flex: 1, minWidth: 0 },
  sheetTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  sheetMeta: { color: "#8D8796", fontSize: 11, fontWeight: "800", marginTop: 4, lineHeight: 15 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  modeNotice: { minHeight: 48, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  modeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#F2C75B" },
  modeDotOff: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF6B6B" },
  modeNoticeText: { flex: 1, color: "#E1DCE8", fontSize: 11, fontWeight: "900", lineHeight: 15 },
  content: { paddingTop: 12, gap: 12 },
  routeStrip: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  routeChip: { minHeight: 34, borderRadius: 17, borderWidth: 1, borderColor: "rgba(242,199,91,0.22)", backgroundColor: "rgba(242,199,91,0.08)", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 6 },
  routeChipActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  routeChipText: { color: "#F2C75B", fontSize: 11, fontWeight: "900" },
  routeChipTextActive: { color: "#09070D" },
  checkGrid: { gap: 8 },
  checkCard: { minHeight: 68, borderRadius: 22, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  checkIcon: { width: 40, height: 40, borderRadius: 18, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  checkTextWrap: { flex: 1, minWidth: 0 },
  checkTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  checkBody: { color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 4 },
  ruleBox: { borderRadius: 24, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 12, gap: 8 },
  ruleTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleText: { flex: 1, color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 14 },
  nextBox: { borderRadius: 24, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)", padding: 12 },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#DCD5E6", fontSize: 10, fontWeight: "800", lineHeight: 15, marginTop: 5 },
});
