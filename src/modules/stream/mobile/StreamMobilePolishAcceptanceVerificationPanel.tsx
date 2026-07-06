import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamMobilePolishAcceptanceVariant = "shell" | "live" | "shorts" | "business" | "profile";
type StreamMobilePolishAcceptanceRoute = Exclude<StreamMobilePolishAcceptanceVariant, "shell">;
type IconName = keyof typeof Ionicons.glyphMap;

type StreamMobilePolishAcceptanceVerificationPanelProps = {
  readonly version?: "120I" | string;
  readonly variant?: StreamMobilePolishAcceptanceVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly onOpenRoute?: (route: StreamMobilePolishAcceptanceRoute) => void;
};

const variantCopy: Record<StreamMobilePolishAcceptanceVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "120I · Принятие мобильной полировки",
    meta: "Финальный слой принятия мобильного интерфейса Stream для основной оболочки.",
    icon: "shield-checkmark-outline",
  },
  live: {
    title: "120I · Эфир принят",
    meta: "Вход эфира сохраняет чистую настройку, читаемые блокировки и без фейкового состояния прямого эфира.",
    icon: "radio-outline",
  },
  shorts: {
    title: "120I · Шорты приняты",
    meta: "Шорты сохраняют понятные зоны просмотра и создания без фейковой публикации.",
    icon: "play-circle-outline",
  },
  business: {
    title: "120I · Бизнес принят",
    meta: "Бизнес-стрим остаётся полезным, пока мерчант, оплата и KYB закрыты.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "120I · Профиль принят",
    meta: "Профиль автора честно держит настройку, официальный статус и блокировки дохода.",
    icon: "person-circle-outline",
  },
};

const routeOrder: readonly { route: StreamMobilePolishAcceptanceRoute; label: string; icon: IconName }[] = [
  { route: "live", label: "Эфир", icon: "radio-outline" },
  { route: "shorts", label: "Шорты", icon: "play-circle-outline" },
  { route: "business", label: "Бизнес", icon: "briefcase-outline" },
  { route: "profile", label: "Профиль", icon: "person-circle-outline" },
];

const acceptanceRows: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "phone-portrait-outline",
    title: "Мобильный маршрут готов",
    body: "Оболочка, Эфир, Шорты, Бизнес и Профиль держат чистый мобильный путь входа.",
  },
  {
    icon: "albums-outline",
    title: "Иерархия карточек готова",
    body: "Первый видимый блок объясняет маршрут до закрытых состояний провайдера и запуска.",
  },
  {
    icon: "text-outline",
    title: "Текст готов",
    body: "Заголовки короткие, подсказки спокойные, а закрытые состояния не выглядят как ошибки.",
  },
  {
    icon: "lock-closed-outline",
    title: "Блокировки готовы",
    body: "Провайдер, публикация, Wallet, подарки, доход, платежи и Admin остаются закрытыми до реальных этапов.",
  },
];

const scopeRows = [
  "Только принятие мобильного интерфейса Stream",
  "Без запуска backend, провайдера, Admin или runtime",
  "Без изменений Wallet, Messenger, AI, подарков, платежей или монетизации",
  "Без фейкового эфира, загрузки, заказа, подписчиков, баланса или approval-состояния",
] as const;

export function StreamMobilePolishAcceptanceVerificationPanel({
  version = "120I",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
  onOpenRoute,
}: StreamMobilePolishAcceptanceVerificationPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantCopy[variant];
  const acceptedCount = useMemo(() => acceptanceRows.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} принятие мобильной полировки Stream`}>
        <LinearGradient colors={["rgba(242,199,91,0.10)", "rgba(255,255,255,0.035)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
          <View style={styles.leftSide}>
            <View style={styles.iconBadge}>
              <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#09070D" />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
              <Text style={styles.meta} numberOfLines={1}>{copy.meta}</Text>
            </View>
          </View>
          <View style={styles.acceptPill}>
            <Text style={styles.acceptText}>{acceptedCount}/4</Text>
            <Ionicons name="chevron-forward" size={14} color="#09070D" />
          </View>
        </LinearGradient>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.sheetIcon}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Приёмка мобильной полировки Stream</Text>
                <Text style={styles.sheetMeta}>Финальный слой приёмки только мобильного интерфейса для публичной навигации Stream, текста, иерархии карточек и честных закрытых состояний.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Обычный режим принят как чистый, читаемый и честный для UI-этапа Stream." : "Обычный режим должен оставаться включённым до публичного принятия Stream UI."}
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

              <View style={styles.acceptanceGrid}>
                {acceptanceRows.map((item) => (
                  <View key={item.title} style={styles.acceptanceCard}>
                    <View style={styles.acceptanceIcon}>
                      <Ionicons name={item.icon} size={20} color="#F2C75B" />
                    </View>
                    <View style={styles.acceptanceTextWrap}>
                      <Text style={styles.acceptanceTitle}>{item.title}</Text>
                      <Text style={styles.acceptanceBody}>{item.body}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.scopeBox}>
                <Text style={styles.scopeTitle}>Принятые границы</Text>
                {scopeRows.map((rule) => (
                  <View key={rule} style={styles.scopeRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.scopeText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий UI-фокус</Text>
                <Text style={styles.nextBody}>Продолжать только полировку конкретных разделов там, где реальный экран ещё выглядит неровно; backend, подарки, Wallet и Admin оставить для следующих этапов.</Text>
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
  acceptPill: { minWidth: 46, height: 29, borderRadius: 15, backgroundColor: "#F2C75B", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2 },
  acceptText: { color: "#09070D", fontSize: 11, fontWeight: "900" },
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
  acceptanceGrid: { gap: 9 },
  acceptanceCard: { minHeight: 74, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, flexDirection: "row", gap: 11 },
  acceptanceIcon: { width: 36, height: 36, borderRadius: 16, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)", alignItems: "center", justifyContent: "center" },
  acceptanceTextWrap: { flex: 1, minWidth: 0 },
  acceptanceTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  acceptanceBody: { color: "#AFA8BB", fontSize: 11, fontWeight: "800", lineHeight: 16, marginTop: 3 },
  scopeBox: { borderRadius: 22, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)", padding: 12, gap: 8 },
  scopeTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  scopeRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  scopeText: { flex: 1, color: "#DCD6E4", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  nextBox: { borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12 },
  nextTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  nextBody: { color: "#AFA8BB", fontSize: 11, fontWeight: "800", lineHeight: 16, marginTop: 4 },
});
