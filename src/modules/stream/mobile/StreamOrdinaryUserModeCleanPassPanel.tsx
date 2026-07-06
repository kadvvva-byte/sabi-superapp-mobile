import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamOrdinaryUserModeVariant = "shell" | "live" | "shorts" | "business" | "profile";
type IconName = keyof typeof Ionicons.glyphMap;

type StreamOrdinaryUserModeCleanPassPanelProps = {
  readonly version?: "119F" | string;
  readonly variant?: StreamOrdinaryUserModeVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly onOpenRoute?: (route: "live" | "shorts" | "business" | "profile") => void;
  readonly style?: StyleProp<ViewStyle>;
};

const routeOrder: readonly {
  id: "live" | "shorts" | "business" | "profile";
  icon: IconName;
  title: string;
  publicState: string;
  blockedState: string;
}[] = [
  {
    id: "live",
    icon: "radio-outline",
    title: "Live",
    publicState: "чистый путь старта",
    blockedState: "реальный provider launch остаётся закрытым",
  },
  {
    id: "shorts",
    icon: "play-circle-outline",
    title: "Shorts",
    publicState: "чистая лента и вход в редактор",
    blockedState: "publish provider остаётся закрытым",
  },
  {
    id: "business",
    icon: "briefcase-outline",
    title: "Business",
    publicState: "commerce-маршрут отделён",
    blockedState: "заказы, Wallet и merchant pay остаются закрытыми",
  },
  {
    id: "profile",
    icon: "person-circle-outline",
    title: "Profile",
    publicState: "настройка автора видна",
    blockedState: "official badge и earning остаются только через review",
  },
];

const variantCopy: Record<StreamOrdinaryUserModeVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "119F · Чистый пользовательский режим",
    meta: "Live / Shorts / Business / Profile проверены как публичные мобильные маршруты.",
    icon: "phone-portrait-outline",
  },
  live: {
    title: "119F · Публичный путь Live",
    meta: "Стартовый экран остаётся mobile-first без fake on-air состояния.",
    icon: "radio-outline",
  },
  shorts: {
    title: "119F · Публичный путь Shorts",
    meta: "Лента, вход в редактор и empty states остаются чистыми до provider-работы.",
    icon: "play-circle-outline",
  },
  business: {
    title: "119F · Публичный путь Business",
    meta: "Business Stream остаётся отделён от payments и Wallet activation.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "119F · Публичный путь Profile",
    meta: "Creator Profile остаётся честным: setup виден, earning и badge закрыты.",
    icon: "person-circle-outline",
  },
};

const finalLocks = [
  "обычные пользователи видят только мобильные продуктовые маршруты",
  "внутренние planning panels остаются вне публичного пути",
  "все blocked states честные и читаемые",
  "без fake live, fake provider, fake payment, fake earning или fake gift state",
] as const;

export function StreamOrdinaryUserModeCleanPassPanel({
  version = "119F",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  onOpenRoute,
  style,
}: StreamOrdinaryUserModeCleanPassPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantCopy[variant];
  const readyCount = useMemo(() => routeOrder.length, []);

  const openRoute = (route: "live" | "shorts" | "business" | "profile") => {
    setOpen(false);
    onOpenRoute?.(route);
  };

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} clean user mode`}>
        <LinearGradient colors={["rgba(242,199,91,0.16)", "rgba(255,255,255,0.055)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
          <View style={styles.left}>
            <View style={styles.iconBadge}>
              <Ionicons name={copy.icon} size={compact ? 15 : 17} color="#09070D" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
              <Text style={styles.meta} numberOfLines={1}>{copy.meta}</Text>
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
                <Ionicons name="phone-portrait-outline" size={25} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · финальная чистка обычного режима</Text>
                <Text style={styles.sheetMeta}>Мобильный UI остаётся первым. Backend/core/provider, Admin, gifts и monetization остаются после этого UI-pass.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeBox}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeText} numberOfLines={2}>
                {ordinaryUserMode ? "Публичный мобильный маршрут чистый: пользователь видит продуктовую навигацию, а не внутренние экраны сборки." : "Публичный режим должен оставаться включённым перед визуальной приёмкой."}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.routeGrid}>
                {routeOrder.map((route) => (
                  <Pressable key={route.id} style={styles.routeCard} onPress={() => openRoute(route.id)} accessibilityRole="button" accessibilityLabel={`Открыть ${route.title}`}>
                    <View style={styles.routeIcon}>
                      <Ionicons name={route.icon} size={21} color="#F2C75B" />
                    </View>
                    <View style={styles.routeTextWrap}>
                      <Text style={styles.routeTitle}>{route.title}</Text>
                      <Text style={styles.routeState}>{route.publicState}</Text>
                      <Text style={styles.routeBlocked}>{route.blockedState}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={17} color="#8D8796" />
                  </Pressable>
                ))}
              </View>

              <View style={styles.lockBox}>
                <Text style={styles.lockTitle}>Финальные ограничения обычного режима</Text>
                {finalLocks.map((lock) => (
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
  wrapperCompact: { marginBottom: 8 },
  card: { borderRadius: 22, overflow: "hidden" },
  cardGradient: { minHeight: 58, borderRadius: 22, borderWidth: 1, borderColor: "rgba(242,199,91,0.20)", paddingHorizontal: 10, paddingVertical: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardGradientCompact: { minHeight: 50, paddingVertical: 7 },
  left: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 9 },
  iconBadge: { width: 36, height: 36, borderRadius: 16, backgroundColor: "#F2C75B", alignItems: "center", justifyContent: "center" },
  textWrap: { flex: 1, minWidth: 0 },
  title: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  meta: { color: "#D8D1E1", fontSize: 10, fontWeight: "800", marginTop: 3 },
  readyPill: { minWidth: 48, height: 30, borderRadius: 15, backgroundColor: "#F2C75B", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2 },
  readyText: { color: "#09070D", fontSize: 11, fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  sheet: { maxHeight: "88%", borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: "#111018", borderWidth: 1, borderColor: "#292532", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  sheetTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  sheetIcon: { width: 48, height: 48, borderRadius: 20, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.20)", alignItems: "center", justifyContent: "center" },
  sheetTitleWrap: { flex: 1, minWidth: 0 },
  sheetTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  sheetMeta: { color: "#8D8796", fontSize: 11, fontWeight: "800", marginTop: 4, lineHeight: 15 },
  closeButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  modeBox: { minHeight: 48, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  modeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#F2C75B" },
  modeDotOff: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF6B6B" },
  modeText: { flex: 1, color: "#E1DCE8", fontSize: 11, fontWeight: "900", lineHeight: 15 },
  content: { paddingTop: 12, gap: 12 },
  routeGrid: { gap: 8 },
  routeCard: { minHeight: 72, borderRadius: 22, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", paddingHorizontal: 11, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  routeIcon: { width: 40, height: 40, borderRadius: 18, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  routeTextWrap: { flex: 1, minWidth: 0 },
  routeTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  routeState: { color: "#D8D1E1", fontSize: 10, fontWeight: "900", marginTop: 3 },
  routeBlocked: { color: "#8D8796", fontSize: 10, fontWeight: "800", marginTop: 3, lineHeight: 14 },
  lockBox: { borderRadius: 24, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.16)", paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  lockTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  lockRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  lockText: { flex: 1, color: "#EDE8F4", fontSize: 11, fontWeight: "800", lineHeight: 15 },
});
