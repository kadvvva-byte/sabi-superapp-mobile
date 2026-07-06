import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamFinalMobileAcceptanceVariant = "shell" | "live" | "shorts" | "business" | "profile";
type IconName = keyof typeof Ionicons.glyphMap;

type StreamFinalMobileAcceptanceGatePanelProps = {
  readonly version?: "119J" | string;
  readonly variant?: StreamFinalMobileAcceptanceVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const variantCopy: Record<StreamFinalMobileAcceptanceVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "119J · финальная мобильная проверка",
    meta: "Главный вход Stream готов к продуктовой проверке в обычном режиме пользователя.",
    icon: "phone-portrait-outline",
  },
  live: {
    title: "119J · проверка эфира",
    meta: "Вход в эфир чистый, мобильный и честный до работы с реальным runtime.",
    icon: "radio-outline",
  },
  shorts: {
    title: "119J · проверка коротких видео",
    meta: "Вход в короткие видео ясно показывает просмотр, редактор и заблокированную публикацию.",
    icon: "play-circle-outline",
  },
  business: {
    title: "119J · проверка бизнеса",
    meta: "Бизнес-стрим отделён от Wallet, оплат продавца и фейковых заказов.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "119J · проверка профиля",
    meta: "Профиль автора ясно показывает настройку, проверку, значок и закрытые заработки.",
    icon: "person-circle-outline",
  },
};

const routeChecks: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "home-outline",
    title: "Главный вход",
    body: "Стартовая зона Stream показывает эфир, короткие видео, бизнес и профиль как единый чистый мобильный продукт.",
  },
  {
    icon: "radio-outline",
    title: "Эфир",
    body: "Старт эфира можно проверить визуально, а реальный запуск провайдера остаётся закрыт до своего этапа.",
  },
  {
    icon: "play-circle-outline",
    title: "Короткие видео",
    body: "Короткие видео показывают просмотр и вход в редактор без имитации готовой публикации или загрузки провайдера.",
  },
  {
    icon: "briefcase-outline",
    title: "Бизнес",
    body: "Бизнес-стрим показывает торговое направление без фейковых товаров, заказов, оплаты Wallet или заработка.",
  },
  {
    icon: "person-circle-outline",
    title: "Профиль",
    body: "Профиль автора честный: настройка и проверка видны, верификация и монетизация остаются закрыты.",
  },
];

const acceptanceLocks = [
  "обычный режим пользователя остаётся публичным и чистым",
  "внутренние панели сборки остаются вне обычного пути пользователя",
  "провайдер, публикация, оплата, подарки, Wallet, Admin и заработок остаются заблокированы",
  "фейковый эфир, загрузка, товар, заказ или баланс не добавляются",
  "следующая работа может перейти к более глубокой доработке интерфейса или реальному этапу запуска только после принятия этой мобильной проверки",
] as const;

export function StreamFinalMobileAcceptanceGatePanel({
  version = "119J",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
}: StreamFinalMobileAcceptanceGatePanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantCopy[variant];
  const passedCount = useMemo(() => routeChecks.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} финальная мобильная проверка Stream`}>
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
            <Text style={styles.scoreText}>{passedCount}/5</Text>
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
                <Text style={styles.sheetTitle}>{version} · Финальная мобильная проверка Stream</Text>
                <Text style={styles.sheetMeta}>Финальная точка проверки мобильного интерфейса для главного входа, эфира, коротких видео, бизнеса и профиля перед выходом за обычный пользовательский проход.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Обычный режим пользователя готов к мобильной приёмке: UI публичный, чистый и честный." : "Обычный режим пользователя должен оставаться включённым для финальной мобильной проверки."}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.routeGrid}>
                {routeChecks.map((item) => (
                  <View key={item.title} style={styles.routeCard}>
                    <View style={styles.routeIcon}>
                      <Ionicons name={item.icon} size={20} color="#F2C75B" />
                    </View>
                    <View style={styles.routeTextWrap}>
                      <Text style={styles.routeTitle}>{item.title}</Text>
                      <Text style={styles.routeBody}>{item.body}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.lockBox}>
                <Text style={styles.lockTitle}>119J · границы приёмки</Text>
                {acceptanceLocks.map((lock) => (
                  <View key={lock} style={styles.lockRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.lockText}>{lock}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующая граница</Text>
                <Text style={styles.nextBody}>
                  После этой проверки продолжать только утверждённую полировку Stream UI или будущий реальный этап ядра, запуска и провайдера. Подарки, Wallet, Admin и монетизация остаются вне этого шага.
                </Text>
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
  routeGrid: { gap: 8 },
  routeCard: { minHeight: 68, borderRadius: 22, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  routeIcon: { width: 40, height: 40, borderRadius: 18, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  routeTextWrap: { flex: 1, minWidth: 0 },
  routeTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  routeBody: { color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 4 },
  lockBox: { borderRadius: 24, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, gap: 8 },
  lockTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockText: { flex: 1, color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 14 },
  nextBox: { borderRadius: 24, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 12 },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 15, marginTop: 6 },
});
