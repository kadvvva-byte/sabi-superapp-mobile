import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamTouchComfortSpacingPolishVariant = "shell" | "live" | "shorts" | "business" | "profile";
type StreamTouchComfortSpacingPolishRoute = Exclude<StreamTouchComfortSpacingPolishVariant, "shell">;
type IconName = keyof typeof Ionicons.glyphMap;

type StreamTouchComfortSpacingPolishPanelProps = {
  readonly version?: "120C" | string;
  readonly variant?: StreamTouchComfortSpacingPolishVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly onOpenRoute?: (route: StreamTouchComfortSpacingPolishRoute) => void;
};

const variantCopy: Record<StreamTouchComfortSpacingPolishVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "120C · Удобство касаний",
    meta: "Stream держит чистые зоны касания, отступы и мобильный ритм чтения.",
    icon: "phone-portrait-outline",
  },
  live: {
    title: "120C · Удобство эфира",
    meta: "Кнопки старта легче читать до подключения реального провайдера.",
    icon: "radio-outline",
  },
  shorts: {
    title: "120C · Удобство шортов",
    meta: "Просмотр и создание разделены без фейковых состояний публикации.",
    icon: "play-circle-outline",
  },
  business: {
    title: "120C · Удобство бизнеса",
    meta: "Коммерческие карточки читаются, пока merchant, оплата и KYB закрыты.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "120C · Удобство профиля",
    meta: "Карточки автора понятны без фейкового бейджа и фейкового дохода.",
    icon: "person-circle-outline",
  },
};

const routeOrder: readonly { route: StreamTouchComfortSpacingPolishRoute; label: string; icon: IconName }[] = [
  { route: "live", label: "Эфир", icon: "radio-outline" },
  { route: "shorts", label: "Шорты", icon: "play-circle-outline" },
  { route: "business", label: "Бизнес", icon: "briefcase-outline" },
  { route: "profile", label: "Профиль", icon: "person-circle-outline" },
];

const comfortChecks: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "hand-left-outline",
    title: "Удобные касания",
    body: "Основные карточки маршрутов и закрытые действия сохраняют удобные мобильные отступы.",
  },
  {
    icon: "contract-outline",
    title: "Меньше визуального давления",
    body: "Карточки используют короткие строки и спокойные отступы, чтобы Stream ощущался премиальным мобильным экраном.",
  },
  {
    icon: "text-outline",
    title: "Читается с первого взгляда",
    body: "Метки объясняют, что доступно сейчас и что закрыто до будущих этапов ядра.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Без фейкового прогресса",
    body: "Провайдер, публикация, оплата, подарки, заработок и админка остаются честно закрытыми.",
  },
];

const lockedStates = [
  "провайдер эфира закрыт до этапа ядра и сервера",
  "публикация и загрузка шортов закрыты до реального ядра",
  "бизнес-оплата, мерчант и KYB остаются закрытыми",
  "подарки, заработок и кошелёк отложены до конца Stream",
] as const;

export function StreamTouchComfortSpacingPolishPanel({
  version = "120C",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
  onOpenRoute,
}: StreamTouchComfortSpacingPolishPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantCopy[variant];
  const readyCount = useMemo(() => comfortChecks.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} Удобство касаний Stream`}>
        <LinearGradient colors={["rgba(242,199,91,0.115)", "rgba(255,255,255,0.055)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
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
                <Ionicons name="phone-portrait-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Stream touch comfort and spacing</Text>
                <Text style={styles.sheetMeta}>Final mobile UI spacing pass for easier taps, calmer card rhythm and honest locked states across Stream.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Обычный режим остаётся продуктово чистым: без технических панелей, фейкового ядра и фейковой монетизации." : "Обычный режим должен оставаться включённым для этого прохода полировки."}
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
                {comfortChecks.map((item) => (
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

              <View style={styles.lockBox}>
                <Text style={styles.lockTitle}>Честные закрытые состояния</Text>
                {lockedStates.map((lock) => (
                  <View key={lock} style={styles.lockRow}>
                    <Ionicons name="lock-closed-outline" size={15} color="#F2C75B" />
                    <Text style={styles.lockText}>{lock}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий UI-фокус</Text>
                <Text style={styles.nextBody}>Продолжить финальную читаемость экранов и чистку текста маршрутов перед реальными этапами ядра и сервера Stream.</Text>
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
  cardGradient: { minHeight: 56, borderRadius: 22, borderWidth: 1, borderColor: "rgba(242,199,91,0.15)", paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
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
  lockBox: { borderRadius: 24, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 12, gap: 8 },
  lockTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockText: { flex: 1, color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 14 },
  nextBox: { borderRadius: 24, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)", padding: 12 },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#DCD5E6", fontSize: 10, fontWeight: "800", lineHeight: 15, marginTop: 5 },
});
