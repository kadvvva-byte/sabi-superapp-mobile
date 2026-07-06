import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamMobileProductPolishVariant = "shell" | "live" | "shorts" | "business" | "profile";
type IconName = keyof typeof Ionicons.glyphMap;

type StreamMobileProductPolishPassPanelProps = {
  readonly version?: "120A" | string;
  readonly variant?: StreamMobileProductPolishVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly onOpenRoute?: (route: StreamMobileProductPolishVariant) => void;
};

const variantCopy: Record<StreamMobileProductPolishVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "120A · мобильная продуктовая полировка",
    meta: "Вход в Stream оставляет эфир, короткие видео, бизнес и профиль чистыми на телефонах.",
    icon: "phone-portrait-outline",
  },
  live: {
    title: "120A · полировка эфира",
    meta: "Старт эфира остаётся простым, читаемым и честным до реальной работы провайдера.",
    icon: "radio-outline",
  },
  shorts: {
    title: "120A · полировка коротких видео",
    meta: "Короткие видео ясно показывают просмотр, создание и редактор без fake publish.",
    icon: "play-circle-outline",
  },
  business: {
    title: "120A · полировка бизнеса",
    meta: "Бизнес-стрим остаётся отделён от оплат, Wallet и фейковых заказов.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "120A · полировка профиля",
    meta: "Профиль автора сохраняет читаемые настройку, проверку и закрытые состояния заработка.",
    icon: "person-circle-outline",
  },
};

const routeOrder: readonly { route: StreamMobileProductPolishVariant; label: string; icon: IconName }[] = [
  { route: "live", label: "Эфир", icon: "radio-outline" },
  { route: "shorts", label: "Короткие видео", icon: "play-circle-outline" },
  { route: "business", label: "Бизнес", icon: "briefcase-outline" },
  { route: "profile", label: "Профиль", icon: "person-circle-outline" },
];

const polishChecks: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "phone-portrait-outline",
    title: "Ритм под телефон",
    body: "Каждый раздел сохраняет компактные карточки, короткие метки и понятные зоны касания для одной руки.",
  },
  {
    icon: "layers-outline",
    title: "Единая продуктовая структура",
    body: "Эфир, короткие видео, бизнес и профиль связаны единым порядком и визуальным языком.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Честные закрытые состояния",
    body: "Провайдер, публикация, оплата, подарки, Wallet, Admin и заработок остаются закрыты до своих реальных этапов.",
  },
  {
    icon: "text-outline",
    title: "Чистый публичный текст",
    body: "Обычный пользователь видит продуктовый текст, а не build-текст; недоступные действия объяснены честно.",
  },
];

const boundaryLocks = [
  "backend и provider runtime не запускаются в 120A",
  "Admin, Wallet, Messenger и AI не трогались",
  "подарки, оплаты и монетизация остаются отложены",
  "не добавляются фейковый эфир, загрузка, заказ, badge или баланс",
] as const;

export function StreamMobileProductPolishPassPanel({
  version = "120A",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
  onOpenRoute,
}: StreamMobileProductPolishPassPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantCopy[variant];
  const readyCount = useMemo(() => polishChecks.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} мобильная продуктовая полировка Stream`}>
        <LinearGradient colors={["rgba(242,199,91,0.14)", "rgba(255,255,255,0.075)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
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
                <Text style={styles.sheetTitle}>{version} · мобильная продуктовая полировка Stream</Text>
                <Text style={styles.sheetMeta}>Следующий этап UI-полировки после gate 119J: улучшить публичный мобильный ритм Stream без открытия runtime, оплат или заработка.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Обычный режим пользователя остаётся чистым: Stream показывает только продуктовые разделы и честные закрытые состояния." : "Обычный режим пользователя должен оставаться включённым во время этого polish pass."}
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
                {polishChecks.map((item) => (
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
                <Text style={styles.lockTitle}>Границы 120A</Text>
                {boundaryLocks.map((lock) => (
                  <View key={lock} style={styles.lockRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.lockText}>{lock}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий фокус полировки</Text>
                <Text style={styles.nextBody}>Продолжаем только мобильный Stream UI: иерархия карточек, текст, отступы и понятность для обычного пользователя. Runtime/core/provider и Admin остаются на следующих этапах.</Text>
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
  cardGradient: { minHeight: 56, borderRadius: 22, borderWidth: 1, borderColor: "rgba(242,199,91,0.16)", paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
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
