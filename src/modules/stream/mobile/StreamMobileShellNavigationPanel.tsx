import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamMobileShellRoute = "live" | "shorts" | "business" | "profile";
type StreamMobileShellTab = "home" | StreamMobileShellRoute;
type IconName = keyof typeof Ionicons.glyphMap;

type StreamMobileShellNavigationPanelProps = {
  version?: "119B" | string;
  ordinaryUserMode?: boolean;
  onOpenRoute?: (tab: StreamMobileShellTab) => void;
  style?: StyleProp<ViewStyle>;
};

const shellRoutes: readonly {
  id: StreamMobileShellRoute;
  icon: IconName;
  title: string;
  subtitle: string;
  state: string;
}[] = [
  {
    id: "live",
    icon: "radio-outline",
    title: "Эфир",
    subtitle: "Обычный эфир, режимы, подготовка и честные ворота запуска.",
    state: "UI готов · провайдер закрыт",
  },
  {
    id: "shorts",
    icon: "play-circle-outline",
    title: "Шорты",
    subtitle: "Лента, создание, редактор, комментарии, сохранение и отправка без фейковой публикации.",
    state: "Мобильный UI · честные пустые состояния",
  },
  {
    id: "business",
    icon: "briefcase-outline",
    title: "Бизнес",
    subtitle: "Бизнес-стрим отдельно от обычного эфира; продажи и платежи закрыты.",
    state: "Отдельный маршрут · платежи закрыты",
  },
  {
    id: "profile",
    icon: "person-circle-outline",
    title: "Профиль",
    subtitle: "Профиль автора, заявка официального стримера и настройка creator-профиля.",
    state: "Настройка автора · только проверка",
  },
];

const publicModeLocks = [
  "debug/tech/QA панели скрыты от обычного пользовательского пути",
  "backend/core/provider остаются после мобильного UI",
  "подарки, монетизация и Wallet отложены до финального этапа Stream",
  "закрытые состояния остаются честными: без fake live, fake viewers, fake payments и fake provider success",
] as const;

export function StreamMobileShellNavigationPanel({
  version = "119B",
  ordinaryUserMode = true,
  onOpenRoute,
  style,
}: StreamMobileShellNavigationPanelProps) {
  const [open, setOpen] = useState(false);
  const routeCount = useMemo(() => shellRoutes.length, []);

  const goToRoute = (route: StreamMobileShellRoute) => {
    setOpen(false);
    onOpenRoute?.(route);
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable style={styles.hero} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} мобильная навигация Stream`}>
        <LinearGradient colors={["rgba(242,199,91,0.18)", "rgba(255,255,255,0.055)"]} style={styles.heroGradient}>
          <View style={styles.heroLeft}>
            <View style={styles.iconBadge}>
              <Ionicons name="phone-portrait-outline" size={18} color="#09070D" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle} numberOfLines={1}>{version} · Мобильная навигация Stream</Text>
              <Text style={styles.heroMeta} numberOfLines={1}>Эфир / Шорты / Бизнес / Профиль · чистый режим пользователя</Text>
            </View>
          </View>
          <View style={styles.routeCountPill}>
            <Text style={styles.routeCountText}>{routeCount}</Text>
            <Ionicons name="chevron-forward" size={16} color="#09070D" />
          </View>
        </LinearGradient>
      </Pressable>

      <View style={styles.quickRoutes}>
        {shellRoutes.map((route) => (
          <Pressable
            key={route.id}
            style={styles.quickRoute}
            onPress={() => goToRoute(route.id)}
            accessibilityRole="button"
            accessibilityLabel={route.title}
          >
            <Ionicons name={route.icon} size={16} color="#F2C75B" />
            <Text style={styles.quickRouteText} numberOfLines={1}>{route.title}</Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.sheetIcon}>
                <Ionicons name="phone-portrait-outline" size={26} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Финальная навигация Stream</Text>
                <Text style={styles.sheetMeta}>Сначала мобильный UI. Backend/core/provider, Admin и монетизация остаются после этой фазы.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Обычный режим чистый: без debug-блоков на публичном входе Stream." : "Внутренний режим должен оставаться выключенным для публичной проверки Stream."}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.routeGrid}>
                {shellRoutes.map((route) => (
                  <Pressable key={route.id} style={styles.routeCard} onPress={() => goToRoute(route.id)} accessibilityRole="button" accessibilityLabel={`Открыть ${route.title}`}>
                    <View style={styles.routeIcon}>
                      <Ionicons name={route.icon} size={22} color="#F2C75B" />
                    </View>
                    <View style={styles.routeTextWrap}>
                      <Text style={styles.routeTitle}>{route.title}</Text>
                      <Text style={styles.routeSubtitle}>{route.subtitle}</Text>
                      <Text style={styles.routeState}>{route.state}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#8D8796" />
                  </Pressable>
                ))}
              </View>

              <View style={styles.lockBox}>
                <Text style={styles.lockTitle}>Блокировки чистого публичного пути</Text>
                {publicModeLocks.map((lock) => (
                  <View key={lock} style={styles.lockRow}>
                    <Ionicons name="lock-closed-outline" size={15} color="#F2C75B" />
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
  hero: { borderRadius: 24, overflow: "hidden", marginBottom: 8 },
  heroGradient: { minHeight: 66, borderRadius: 24, borderWidth: 1, borderColor: "rgba(242,199,91,0.22)", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  heroLeft: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 11 },
  iconBadge: { width: 40, height: 40, borderRadius: 18, backgroundColor: "#F2C75B", alignItems: "center", justifyContent: "center" },
  heroTextWrap: { flex: 1, minWidth: 0 },
  heroTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  heroMeta: { color: "#D9D2E2", fontSize: 11, fontWeight: "800", marginTop: 4 },
  routeCountPill: { minWidth: 44, height: 34, borderRadius: 17, backgroundColor: "#F2C75B", paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2 },
  routeCountText: { color: "#09070D", fontSize: 13, fontWeight: "900" },
  quickRoutes: { flexDirection: "row", gap: 7, marginBottom: 2 },
  quickRoute: { flex: 1, minHeight: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.065)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 5 },
  quickRouteText: { color: "#EDE8F4", fontSize: 10, fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  sheet: { maxHeight: "88%", borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: "#111018", borderWidth: 1, borderColor: "#292532", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  sheetTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  sheetIcon: { width: 48, height: 48, borderRadius: 20, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.20)", alignItems: "center", justifyContent: "center" },
  sheetTitleWrap: { flex: 1, minWidth: 0 },
  sheetTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  sheetMeta: { color: "#8D8796", fontSize: 11, fontWeight: "800", marginTop: 4, lineHeight: 15 },
  closeButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  modeNotice: { minHeight: 48, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  modeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#F2C75B" },
  modeDotOff: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF6B6B" },
  modeNoticeText: { flex: 1, color: "#E1DCE8", fontSize: 11, fontWeight: "900", lineHeight: 15 },
  sheetContent: { paddingTop: 12, gap: 12 },
  routeGrid: { gap: 8 },
  routeCard: { minHeight: 74, borderRadius: 22, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", paddingHorizontal: 12, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 11 },
  routeIcon: { width: 42, height: 42, borderRadius: 18, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  routeTextWrap: { flex: 1, minWidth: 0 },
  routeTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  routeSubtitle: { color: "#D9D2E2", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 4 },
  routeState: { color: "#F2C75B", fontSize: 10, fontWeight: "900", marginTop: 5 },
  lockBox: { borderRadius: 24, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 13, gap: 9 },
  lockTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockText: { flex: 1, color: "#D9D2E2", fontSize: 11, fontWeight: "800", lineHeight: 15 },
});
