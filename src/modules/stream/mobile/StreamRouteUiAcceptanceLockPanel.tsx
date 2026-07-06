import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;
type RouteVariant = "live" | "shorts" | "business" | "profile";

type StreamRouteUiAcceptanceLockPanelProps = {
  readonly version?: "121I" | string;
  readonly variant: RouteVariant;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const routeCopy: Record<RouteVariant, { icon: IconName; title: string; summary: string; lock: string }> = {
  live: {
    icon: "radio-outline",
    title: "Фиксация приёмки эфира",
    summary: "Старт ведущего, настройка комнаты и граница выхода в эфир остаются чистыми на телефоне.",
    lock: "Маршрут эфира принимается только как мобильная интерфейсная поверхность. Реальный движок трансляции, передача провайдеру и синхронизация комнаты закрыты до фундаментальной фазы.",
  },
  shorts: {
    icon: "play-circle-outline",
    title: "Фиксация приёмки шортов",
    summary: "Зрительский путь, вход в редактор и граница публикации остаются читаемыми и удобными.",
    lock: "Маршрут шортов принимается без имитации загрузки, публикации, хранения, рекомендаций или провайдерской доставки.",
  },
  business: {
    icon: "storefront-outline",
    title: "Фиксация приёмки бизнеса",
    summary: "Доверие продавца, вход в каталог и граница оплаты остаются честными и спокойными.",
    lock: "Маршрут бизнеса принимается без фейковых продаж каталога, KYB-одобрения, мерчант-аккаунта, оплаты, заказов, выплат или подключения Wallet.",
  },
  profile: {
    icon: "person-circle-outline",
    title: "Фиксация приёмки профиля",
    summary: "Личность автора, действия настройки и граница заработка остаются понятными.",
    lock: "Маршрут профиля принимается без фейкового официального бейджа, верификации, подарков, заработка, Wallet, выплат или успеха подписчиков.",
  },
};

const acceptanceRows: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "phone-portrait-outline",
    title: "Мобильный маршрут принят",
    body: "Маршрут выглядит как нормальный экран телефона, а не как внутренняя страница сборки.",
  },
  {
    icon: "layers-outline",
    title: "Визуальный порядок зафиксирован",
    body: "Главный продуктовый контент остаётся первым; закрытые состояния ниже, спокойно и понятно.",
  },
  {
    icon: "hand-left-outline",
    title: "Путь касаний зафиксирован",
    body: "Главные действия сохраняют удобные отступы и короткие подписи для одной руки.",
  },
  {
    icon: "lock-closed-outline",
    title: "Честная граница зафиксирована",
    body: "Сервер, провайдер, публикация, оплата, подарки, заработок и Admin-зоны не симулируются.",
  },
];

const safetyRows = [
  "Фиксация интерфейсной приёмки относится только к Эфиру, Шортам, Бизнесу и Профилю",
  "Без старта провайдера, серверной записи и скрытой активации",
  "Без фейкового эфира, загрузки, заказа, баланса, подарка, бейджа, выплаты или результата заработка",
  "Без изменений Wallet, Messenger, AI, Admin, базы данных, оплаты или монетизации",
] as const;

export function StreamRouteUiAcceptanceLockPanel({
  version = "121I",
  variant,
  compact = false,
  style,
}: StreamRouteUiAcceptanceLockPanelProps) {
  const [open, setOpen] = useState(false);
  const route = routeCopy[variant];
  const acceptedCount = useMemo(() => acceptanceRows.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable
        style={styles.card}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${version} ${route.title}`}
      >
        <LinearGradient
          colors={["rgba(242,199,91,0.12)", "rgba(255,255,255,0.04)"]}
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
          <View style={styles.acceptedPill}>
            <Text style={styles.acceptedText}>{acceptedCount}/4</Text>
            <Ionicons name="lock-closed" size={12} color="#09070D" />
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
                <Text style={styles.sheetTitle}>{version} · Финальная фиксация интерфейсной приёмки маршрута</Text>
                <Text style={styles.sheetMeta}>Мобильный интерфейс маршрута зафиксирован для визуальной приёмки. Фундамент, провайдер и финансовые зоны остаются закрытыми.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.noticeBox}>
              <View style={styles.noticeDot} />
              <Text style={styles.noticeText} numberOfLines={4}>{route.lock}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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

              <View style={styles.safetyBox}>
                <Text style={styles.safetyTitle}>121I · фиксация приёмки</Text>
                {safetyRows.map((rule) => (
                  <View key={rule} style={styles.safetyRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.safetyText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий безопасный UI-шаг</Text>
                <Text style={styles.nextBody}>Продолжаем только после чистого TypeScript и видимой 121I-фиксации в Эфире, Шортах, Бизнесе и Профиле.</Text>
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
  acceptedPill: { minWidth: 48, height: 29, borderRadius: 15, backgroundColor: "#F2C75B", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  acceptedText: { color: "#09070D", fontSize: 11, fontWeight: "900" },
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
  acceptanceGrid: { gap: 10 },
  acceptanceCard: { borderRadius: 20, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, flexDirection: "row", gap: 11 },
  acceptanceIcon: { width: 38, height: 38, borderRadius: 16, backgroundColor: "rgba(242,199,91,0.12)", alignItems: "center", justifyContent: "center" },
  acceptanceTextWrap: { flex: 1, minWidth: 0 },
  acceptanceTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  acceptanceBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", marginTop: 4, lineHeight: 16 },
  safetyBox: { borderRadius: 22, padding: 14, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.16)", gap: 9 },
  safetyTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  safetyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  safetyText: { flex: 1, color: "#EEE8F4", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  nextBox: { borderRadius: 22, padding: 14, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", marginTop: 5, lineHeight: 16 },
});
