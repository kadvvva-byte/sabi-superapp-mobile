import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamRouteAcceptanceTinyCorrectionPanelProps = {
  readonly version?: "121G" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeDetails: Record<RouteVariant, { icon: IconName; title: string; summary: string; correction: string }> = {
  live: {
    icon: "radio-outline",
    title: "Малая правка эфира",
    summary: "Старт ведущего, настройка комнаты и блокировка эфира простые на телефоне.",
    correction: "Эфир держит первое действие на подготовке комнаты. Реальный запуск провайдера, движок трансляции и синхронизация комнаты остаются закрытыми до будущего фундаментального этапа.",
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Малая правка шортов",
    summary: "Просмотр, вход в редактор и блокировка публикации остаются понятными.",
    correction: "Шорты держат путь зрителя чистым, а вход в редактор видимым. Загрузка, публикация, хранение и рекомендации остаются закрытыми до реальных провайдерных слоёв.",
  },
  business: {
    icon: "storefront-outline",
    title: "Малая правка бизнеса",
    summary: "Доверие продавца, граница каталога и блокировка оплаты остаются спокойными.",
    correction: "Бизнес-стрим держит коммерческие поверхности как честную подготовку интерфейса. KYB, мерчант-аккаунт, Wallet, оплата, заказы и выплаты остаются закрытыми до реальных бизнес- и финансовых слоёв.",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Малая правка профиля",
    summary: "Личность автора, проверка и блокировка заработка остаются честными.",
    correction: "Профиль автора держит личность и настройку чистыми. Официальная проверка, подарки, заработок, Wallet и выплаты остаются закрытыми до реальных слоёв проверки и финансов.",
  },
};

const correctionRows: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "phone-portrait-outline",
    title: "Ритм телефона",
    body: "Карточка маршрута остаётся компактной, читаемой и удобной для касания без добавления новой продуктовой функции.",
  },
  {
    icon: "reader-outline",
    title: "Правка текста",
    body: "Язык маршрута остаётся коротким и публичным, без внутренних технических формулировок для обычных пользователей.",
  },
  {
    icon: "lock-closed-outline",
    title: "Ясность блокировок",
    body: "Границы провайдера, публикации, оплаты, подарков, заработка и Admin остаются честными и не выглядят запущенными.",
  },
  {
    icon: "git-branch-outline",
    title: "Линия kernel",
    body: "Панель остаётся только интерфейсной и не обходит Stream kernel прямыми вызовами провайдера или оплаты.",
  },
];

const lockRows = [
  "Малая UI-правка только для Эфира, Шортов, Бизнеса и Профиля",
  "Без callback маршрута оболочки и скрытой backend-активации",
  "Без фейкового эфира, загрузки, заказа, баланса, подарка или успешного заработка",
  "Без изменений Wallet, Messenger, AI, Admin, провайдера или базы данных",
] as const;

export function StreamRouteAcceptanceTinyCorrectionPanel({
  version = "121G",
  variant,
  compact = false,
  style,
}: StreamRouteAcceptanceTinyCorrectionPanelProps) {
  const [open, setOpen] = useState(false);
  const route = routeDetails[variant];
  const readyCount = useMemo(() => correctionRows.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable
        style={styles.card}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${version} ${route.title}`}
      >
        <LinearGradient
          colors={["rgba(242,199,91,0.10)", "rgba(255,255,255,0.03)"]}
          style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}
        >
          <View style={styles.leftSide}>
            <View style={styles.iconBadge}>
              <Ionicons name={route.icon} size={compact ? 14 : 16} color="#09070D" />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.title} numberOfLines={1}>{version} · {route.title}</Text>
              <Text style={styles.meta} numberOfLines={1}>{route.summary}</Text>
            </View>
          </View>
          <View style={styles.readyPill}>
            <Text style={styles.readyText}>{readyCount}/4</Text>
            <Ionicons name="chevron-forward" size={14} color="#09070D" />
          </View>
        </LinearGradient>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.sheetIcon}>
                <Ionicons name={route.icon} size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Малая правка принятия маршрута</Text>
                <Text style={styles.sheetMeta}>Малая финальная визуальная правка только для этого маршрута Stream. Продуктовый движок остаётся закрытым.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.noticeBox}>
              <View style={styles.noticeDot} />
              <Text style={styles.noticeText} numberOfLines={4}>{route.correction}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.areaGrid}>
                {correctionRows.map((item) => (
                  <View key={item.title} style={styles.areaCard}>
                    <View style={styles.areaIcon}>
                      <Ionicons name={item.icon} size={20} color="#F2C75B" />
                    </View>
                    <View style={styles.areaTextWrap}>
                      <Text style={styles.areaTitle}>{item.title}</Text>
                      <Text style={styles.areaBody}>{item.body}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.lockBox}>
                <Text style={styles.lockTitle}>121G · блокировка правки</Text>
                {lockRows.map((rule) => (
                  <View key={rule} style={styles.lockRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.lockText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий шаг Stream UI</Text>
                <Text style={styles.nextBody}>Продолжать только после чистого TypeScript и видимой 121G-правки в Эфире, Шортах, Бизнесе и Профиле.</Text>
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
  readyPill: { minWidth: 46, height: 29, borderRadius: 15, backgroundColor: "#F2C75B", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2 },
  readyText: { color: "#09070D", fontSize: 11, fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(3,2,7,0.78)", justifyContent: "flex-end" },
  sheet: { maxHeight: "88%", borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: "#111018", borderWidth: 1, borderColor: "rgba(242,199,91,0.16)", paddingTop: 18, overflow: "hidden" },
  sheetTop: { paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 12 },
  sheetIcon: { width: 48, height: 48, borderRadius: 20, backgroundColor: "rgba(242,199,91,0.12)", alignItems: "center", justifyContent: "center" },
  sheetTitleWrap: { flex: 1, minWidth: 0 },
  sheetTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  sheetMeta: { color: "#D8D1E1", fontSize: 12, fontWeight: "700", marginTop: 4, lineHeight: 17 },
  closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  noticeBox: { marginHorizontal: 18, marginTop: 14, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  noticeDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#F2C75B" },
  noticeText: { flex: 1, color: "#FFFFFF", fontSize: 12, fontWeight: "800", lineHeight: 17 },
  content: { padding: 18, paddingBottom: 28, gap: 14 },
  areaGrid: { gap: 10 },
  areaCard: { borderRadius: 20, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, flexDirection: "row", gap: 11 },
  areaIcon: { width: 38, height: 38, borderRadius: 16, backgroundColor: "rgba(242,199,91,0.12)", alignItems: "center", justifyContent: "center" },
  areaTextWrap: { flex: 1, minWidth: 0 },
  areaTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  areaBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", marginTop: 4, lineHeight: 16 },
  lockBox: { borderRadius: 22, padding: 14, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.16)", gap: 9 },
  lockTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockText: { flex: 1, color: "#EEE8F4", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  nextBox: { borderRadius: 22, padding: 14, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", marginTop: 5, lineHeight: 16 },
});
