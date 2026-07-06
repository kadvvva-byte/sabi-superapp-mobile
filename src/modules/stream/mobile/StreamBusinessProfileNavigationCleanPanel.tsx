import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

type StreamBusinessProfileNavigationCleanPanelMode = "business" | "profile";

type CleanNavItem = {
  readonly icon: IconName;
  readonly title: string;
  readonly meta: string;
};

const sharedFlowItems: readonly CleanNavItem[] = [
  { icon: "radio-outline", title: "Эфир", meta: "обычный эфир сначала" },
  { icon: "play-circle-outline", title: "Шорты", meta: "короткое видео отдельно" },
  { icon: "briefcase-outline", title: "Бизнес", meta: "витрина без фейковых заказов" },
  { icon: "person-circle-outline", title: "Профиль", meta: "профиль без фейковых метрик" },
];

const businessGuardItems: readonly CleanNavItem[] = [
  { icon: "storefront-outline", title: "Бизнес-стрим", meta: "интерфейс готовится, провайдер позже" },
  { icon: "cube-outline", title: "Каталог", meta: "без фейковых товаров и заказов" },
  { icon: "wallet-outline", title: "Кошелёк / оплата", meta: "не подключаем сейчас" },
  { icon: "shield-checkmark-outline", title: "Проверка продавца", meta: "честно заблокировано" },
];

const profileGuardItems: readonly CleanNavItem[] = [
  { icon: "person-outline", title: "Профиль автора", meta: "чистый профиль автора" },
  { icon: "ribbon-outline", title: "Официальный статус", meta: "без фейкового бейджа" },
  { icon: "analytics-outline", title: "Метрики", meta: "без фейковых подписчиков" },
  { icon: "gift-outline", title: "Подарки", meta: "отложено до конца стрима" },
];

const copyByMode: Record<StreamBusinessProfileNavigationCleanPanelMode, {
  readonly title: string;
  readonly subtitle: string;
  readonly notice: string;
  readonly guardTitle: string;
}> = {
  business: {
    title: "119E · Чистая навигация бизнеса",
    subtitle: "Бизнес-стрим остаётся чистым мобильным входом без платежей, кошелька и фейковой торговли.",
    notice: "Сервер · провайдер · продавец · кошелёк · оплаты не запускаются на этом шаге.",
    guardTitle: "Закрытые состояния бизнеса",
  },
  profile: {
    title: "119E · Чистая навигация профиля",
    subtitle: "Профиль автора остаётся честным: без фейковой популярности и фейковой верификации.",
    notice: "Официальный статус · подписчики · аналитика · подарки не фейкуются и ждут реальные этапы.",
    guardTitle: "Закрытые состояния профиля",
  },
};

function CleanItem({ item }: { readonly item: CleanNavItem }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemIcon}>
        <Ionicons name={item.icon} size={18} color="#F2C75B" />
      </View>
      <View style={styles.itemText}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemMeta} numberOfLines={2}>{item.meta}</Text>
      </View>
    </View>
  );
}

export function StreamBusinessProfileNavigationCleanPanel({
  mode,
}: {
  readonly mode: StreamBusinessProfileNavigationCleanPanelMode;
}) {
  const copy = copyByMode[mode];
  const guardItems = mode === "business" ? businessGuardItems : profileGuardItems;

  return (
    <View style={styles.panel}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Ionicons name={mode === "business" ? "briefcase-outline" : "person-circle-outline"} size={22} color="#F2C75B" />
        </View>
        <View style={styles.topText}>
          <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{copy.subtitle}</Text>
        </View>
      </View>

      <View style={styles.noticeRow}>
        <View style={styles.dot} />
        <Text style={styles.noticeText} numberOfLines={2}>{copy.notice}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Порядок мобильного маршрута</Text>
        <Text style={styles.sectionMeta}>Сначала интерфейс → основа и сервер позже</Text>
      </View>
      <View style={styles.grid}>
        {sharedFlowItems.map((item) => <CleanItem key={`${mode}-flow-${item.title}`} item={item} />)}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{copy.guardTitle}</Text>
        <Text style={styles.sectionMeta}>честные отключённые состояния</Text>
      </View>
      <View style={styles.grid}>
        {guardItems.map((item) => <CleanItem key={`${mode}-guard-${item.title}`} item={item} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.20)",
    backgroundColor: "#0F0D15",
    padding: 13,
    gap: 10,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 20,
    backgroundColor: "rgba(242,199,91,0.10)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  topText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
    color: "#B9B1C8",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    marginTop: 4,
  },
  noticeRow: {
    minHeight: 42,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#F2C75B",
  },
  noticeText: {
    flex: 1,
    color: "#E9E3F2",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionMeta: {
    color: "#8D8796",
    fontSize: 9,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  item: {
    width: "48.5%",
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: "#17151E",
    borderWidth: 1,
    borderColor: "#2B2735",
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: "rgba(242,199,91,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  itemMeta: {
    color: "#8D8796",
    fontSize: 9,
    fontWeight: "800",
    lineHeight: 12,
    marginTop: 2,
  },
});
