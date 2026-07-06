import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamRouteSpecificAcceptancePassPanelProps = {
  readonly version?: "121F" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<RouteVariant, { icon: IconName; title: string; meta: string; notice: string }> = {
  live: {
    icon: "radio-outline",
    title: "Приёмка эфира",
    meta: "Путь ведущего, настройка комнаты и честная граница эфира остаются понятными.",
    notice: "Эфир принимается только как чистый мобильный маршрут. Настоящий провайдер, синхронизация и движок трансляции остаются вне этого интерфейсного прохода.",
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Приёмка шортов",
    meta: "Путь зрителя, вход в редактор и блокировка публикации остаются читаемыми.",
    notice: "Шорты принимаются только как мобильный интерфейсный маршрут. Загрузка, публикация, провайдерное хранение и рекомендации остаются закрыты до следующих слоёв.",
  },
  business: {
    icon: "storefront-outline",
    title: "Приёмка бизнеса",
    meta: "Доверие продавца, граница каталога и блокировка оплаты остаются честными.",
    notice: "Бизнес-стрим оставляет мерчант- и торговые поверхности честными. Оплата, Wallet, заказы, KYB и выплаты закрыты до реальных бизнес-слоёв.",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Приёмка профиля",
    meta: "Личность автора, граница верификации и блокировка заработка остаются понятными.",
    notice: "Профиль автора оставляет настройку и личность чистыми. Официальная верификация, подарки, заработок и выплаты закрыты до слоёв проверки и финансов.",
  },
};

const acceptanceRows: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "phone-portrait-outline",
    title: "Мобильный маршрут готов",
    body: "У каждого маршрута есть понятный первый блок, короткий текст и удобный ритм для обычного пользователя.",
  },
  {
    icon: "albums-outline",
    title: "Иерархия принята",
    body: "Карточки маршрута сначала показывают смысл продукта, а закрытые детали реального движка остаются ниже без внутреннего технического языка.",
  },
  {
    icon: "lock-closed-outline",
    title: "Заблокированные состояния приняты",
    body: "Провайдер, публикация, оплата, подарки, заработок и Admin показываются только как честные закрытые границы.",
  },
  {
    icon: "git-branch-outline",
    title: "Архитектурная граница принята",
    body: "Интерфейс остаётся оболочкой через kernel и не подключает экраны напрямую к провайдерам или платёжным потокам.",
  },
];

const guardRows = [
  "Только интерфейс маршрутов Эфира, Шортов, Бизнеса и Профиля",
  "Без фейкового эфира, загрузки, заказов, баланса или успеха заработка",
  "Без активации подарков, монетизации, Wallet, провайдера или Admin",
  "Без изменений Messenger, AI, backend или базы данных",
] as const;

export function StreamRouteSpecificAcceptancePassPanel({
  version = "121F",
  variant,
  compact = false,
  style,
}: StreamRouteSpecificAcceptancePassPanelProps) {
  const [open, setOpen] = useState(false);
  const route = routeCopy[variant];
  const readyCount = useMemo(() => acceptanceRows.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable
        style={styles.card}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${version} ${route.title} route acceptance`}
      >
        <LinearGradient
          colors={["rgba(242,199,91,0.11)", "rgba(255,255,255,0.03)"]}
          style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}
        >
          <View style={styles.leftSide}>
            <View style={styles.iconBadge}>
              <Ionicons name={route.icon} size={compact ? 14 : 16} color="#09070D" />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.title} numberOfLines={1}>121F · {route.title}</Text>
              <Text style={styles.meta} numberOfLines={1}>{route.meta}</Text>
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
                <Text style={styles.sheetTitle}>{version} · Приёмка маршрута</Text>
                <Text style={styles.sheetMeta}>Финальная мобильная интерфейсная приёмка Эфира, Шортов, Бизнеса и Профиля перед следующим участком Stream UI.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.noticeBox}>
              <View style={styles.noticeDot} />
              <Text style={styles.noticeText} numberOfLines={3}>{route.notice}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.areaGrid}>
                {acceptanceRows.map((item) => (
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

              <View style={styles.guardBox}>
                <Text style={styles.guardTitle}>121F · фиксация приёмки</Text>
                {guardRows.map((rule) => (
                  <View key={rule} style={styles.guardRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.guardText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий шаг Stream UI</Text>
                <Text style={styles.nextBody}>Продолжаем следующий мобильный UI-участок только после чистого TypeScript и видимых четырёх блоков приёмки маршрутов.</Text>
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
  guardBox: { borderRadius: 22, padding: 14, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.16)", gap: 9 },
  guardTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  guardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  guardText: { flex: 1, color: "#EEE8F4", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  nextBox: { borderRadius: 22, padding: 14, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", marginTop: 5, lineHeight: 16 },
});
