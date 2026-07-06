import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamMobileUxConsistencyVariant = "shell" | "live" | "shorts" | "business" | "profile";
type IconName = keyof typeof Ionicons.glyphMap;

type StreamMobileUxConsistencyPassPanelProps = {
  readonly version?: "119I" | string;
  readonly variant?: StreamMobileUxConsistencyVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const variantCopy: Record<StreamMobileUxConsistencyVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "119I · UX-согласованность",
    meta: "Вход Stream использует единый порядок, тон и чистый мобильный ритм.",
    icon: "phone-portrait-outline",
  },
  live: {
    title: "119I · Согласованность эфира",
    meta: "Старт эфира сохраняет порядок: маршрут, состояние, действие, закрытый gate.",
    icon: "radio-outline",
  },
  shorts: {
    title: "119I · Согласованность шортов",
    meta: "Шорты сохраняют ту же мобильную структуру, что и остальной Stream.",
    icon: "play-circle-outline",
  },
  business: {
    title: "119I · Согласованность Business",
    meta: "Business-маршрут остаётся читаемым без Wallet, merchant-оплаты или fake-заказов.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "119I · Согласованность профиля",
    meta: "Профиль автора держит настройку, проверку и блокировки дохода в понятном порядке.",
    icon: "person-circle-outline",
  },
};

const consistencyChecks: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "list-outline",
    title: "Единый порядок",
    body: "Эфир, Шорты, Business и Профиль идут в одной мобильной последовательности: вход, статус, действие и закрытое состояние.",
  },
  {
    icon: "text-outline",
    title: "Единый тон",
    body: "Метки остаются короткими, публичными и честными, чтобы пользователь понимал, что работает сейчас, а что позже.",
  },
  {
    icon: "resize-outline",
    title: "Единая плотность",
    body: "Карточки остаются достаточно компактными для телефона, сохраняя премиальные отступы и читаемые зоны касания.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Единое safety-правило",
    body: "Недоступные provider, публикация, оплата, подарки, Wallet и Admin остаются явно закрытыми до реальных этапов.",
  },
];

const routeSequence = [
  "Эфир: просмотр и старт остаются первыми",
  "Шорты: просмотр, редактор и подготовка идут вторыми",
  "Business: коммерческий маршрут остаётся третьим и отделённым",
  "Профиль: настройка автора и проверка остаются последними",
] as const;

const consistencyLocks = [
  "Stream выглядит как один продукт, а не отдельные тестовые экраны",
  "обычный режим пользователя остаётся mobile-first и публичным",
  "закрытые состояния остаются красивыми, спокойными и честными",
  "здесь не добавляется поведение backend, provider, Admin, Wallet, подарков, платежей или монетизации",
] as const;

export function StreamMobileUxConsistencyPassPanel({
  version = "119I",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
}: StreamMobileUxConsistencyPassPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantCopy[variant];
  const readyCount = useMemo(() => consistencyChecks.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} мобильная согласованность Stream`}>
        <LinearGradient colors={["rgba(242,199,91,0.13)", "rgba(255,255,255,0.08)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
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
                <Ionicons name="layers-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Stream mobile UX consistency</Text>
                <Text style={styles.sheetMeta}>This pass aligns order, copy, spacing and honest locks across every public Stream route.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Обычный режим согласован: каждый маршрут Stream использует один публичный ритм и честный язык закрытых состояний." : "Обычный режим должен оставаться включённым до финального принятия mobile UI."}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.checkGrid}>
                {consistencyChecks.map((item) => (
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

              <View style={styles.sequenceBox}>
                <Text style={styles.sequenceTitle}>Unified Stream route order</Text>
                {routeSequence.map((item, index) => (
                  <View key={item} style={styles.sequenceRow}>
                    <View style={styles.sequenceIndex}><Text style={styles.sequenceIndexText}>{index + 1}</Text></View>
                    <Text style={styles.sequenceText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.lockBox}>
                <Text style={styles.lockTitle}>119I consistency locks</Text>
                {consistencyLocks.map((lock) => (
                  <View key={lock} style={styles.lockRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.lockText}>{lock}</Text>
                  </View>
                ))}
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
  checkGrid: { gap: 8 },
  checkCard: { minHeight: 68, borderRadius: 22, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  checkIcon: { width: 40, height: 40, borderRadius: 18, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  checkTextWrap: { flex: 1, minWidth: 0 },
  checkTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  checkBody: { color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 4 },
  sequenceBox: { borderRadius: 24, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, gap: 8 },
  sequenceTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  sequenceRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  sequenceIndex: { width: 23, height: 23, borderRadius: 12, backgroundColor: "#F2C75B", alignItems: "center", justifyContent: "center" },
  sequenceIndexText: { color: "#09070D", fontSize: 11, fontWeight: "900" },
  sequenceText: { flex: 1, color: "#EDE8F4", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  lockBox: { borderRadius: 24, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 12, gap: 8 },
  lockTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockText: { flex: 1, color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 14 },
});
