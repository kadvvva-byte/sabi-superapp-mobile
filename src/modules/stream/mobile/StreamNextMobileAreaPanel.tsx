import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamNextMobileAreaVariant = "shell" | "live" | "shorts" | "business" | "profile";
type StreamNextMobileAreaRoute = Exclude<StreamNextMobileAreaVariant, "shell">;
type IconName = keyof typeof Ionicons.glyphMap;

type StreamNextMobileAreaPanelProps = {
  readonly version?: "121A" | string;
  readonly variant?: StreamNextMobileAreaVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly onOpenRoute?: (route: StreamNextMobileAreaRoute) => void;
};

const copyByVariant: Record<StreamNextMobileAreaVariant, { title: string; meta: string; icon: IconName; focus: string }> = {
  shell: {
    title: "121A · следующая мобильная зона",
    meta: "Stream остаётся мобильным в первую очередь, пока начинается следующий UI-слой.",
    icon: "layers-outline",
    focus: "Главный экран держит Live, Shorts, Business и Profile видимыми как единый чистый Stream-продукт.",
  },
  live: {
    title: "121A · старт Live-зоны",
    meta: "Настройка ведущего остаётся понятной без имитации живого провайдера.",
    icon: "radio-outline",
    focus: "Эфир готовит путь комнаты, safety-состояния и комфорт устройства без фейкового успеха трансляции.",
  },
  shorts: {
    title: "121A · старт Shorts-зоны",
    meta: "Shorts сохраняет понятные пути зрителя и автора до реального этапа публикации.",
    icon: "play-circle-outline",
    focus: "Shorts разделяет просмотр, редактирование и границы публикации чисто и честно.",
  },
  business: {
    title: "121A · старт Business-зоны",
    meta: "Business Stream остаётся аккуратным, пока merchant/pay-потоки закрыты.",
    icon: "briefcase-outline",
    focus: "Business показывает торговое направление без фейкового каталога, фейковых заказов и фейковых платежей.",
  },
  profile: {
    title: "121A · старт Profile-зоны",
    meta: "Профиль автора остаётся публичным, читаемым и честным до этапов верификации и runtime.",
    icon: "person-circle-outline",
    focus: "Профиль показывает направление настройки без фейковых подписчиков, фейкового официального статуса и фейковых доходов.",
  },
};

const routeOrder: readonly { route: StreamNextMobileAreaRoute; label: string; icon: IconName }[] = [
  { route: "live", label: "Эфир", icon: "radio-outline" },
  { route: "shorts", label: "Shorts", icon: "play-circle-outline" },
  { route: "business", label: "Business", icon: "briefcase-outline" },
  { route: "profile", label: "Profile", icon: "person-circle-outline" },
];

const areaRows: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "navigate-outline",
    title: "Ясность маршрутов",
    body: "Следующая мобильная UI-зона делает каждый Stream-маршрут понятным и легко доступным.",
  },
  {
    icon: "phone-portrait-outline",
    title: "Ритм телефона",
    body: "Карты, chip-ы и панели остаются удобными для управления большим пальцем на реальном телефоне.",
  },
  {
    icon: "text-outline",
    title: "Читаемый текст",
    body: "Пользовательский текст остаётся коротким, продуктовым и без внутренней технической речи.",
  },
  {
    icon: "lock-closed-outline",
    title: "Честные границы",
    body: "Provider, backend, publish, Wallet, pay, gifts, earning и Admin остаются закрытыми до следующих этапов.",
  },
];

const scopeRows = [
  "Только мобильный Stream UI",
  "Без backend, provider-runtime и Admin",
  "Без изменений Wallet, Messenger или AI",
  "Без подарков, платежей, монетизации и фейкового успеха",
] as const;

export function StreamNextMobileAreaPanel({
  version = "121A",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
  onOpenRoute,
}: StreamNextMobileAreaPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = copyByVariant[variant];
  const readyCount = useMemo(() => areaRows.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} следующая мобильная Stream-зона`}>
        <LinearGradient colors={["rgba(242,199,91,0.11)", "rgba(255,255,255,0.032)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
          <View style={styles.leftSide}>
            <View style={styles.iconBadge}>
              <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#09070D" />
            </View>
            <View style={styles.copyWrap}>
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
                <Ionicons name="layers-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · следующая мобильная Stream-зона</Text>
                <Text style={styles.sheetMeta}>Начинаем следующую только UI Stream-зону, оставляя runtime и монетизацию на следующие этапы.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? copy.focus : "Обычный режим пользователя должен оставаться включённым для этой UI-only зоны."}
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

              <View style={styles.areaGrid}>
                {areaRows.map((item) => (
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

              <View style={styles.scopeBox}>
                <Text style={styles.scopeTitle}>121A · блокировка scope</Text>
                {scopeRows.map((rule) => (
                  <View key={rule} style={styles.scopeRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.scopeText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий шаг</Text>
                <Text style={styles.nextBody}>Сначала продолжаем полировать мобильные экраны каждого маршрута. Backend/core/provider, Admin и подарки остаются следующими фазами Stream.</Text>
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
  modeNotice: { marginHorizontal: 18, marginTop: 14, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  modeDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#F2C75B" },
  modeDotOff: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#7E7788" },
  modeNoticeText: { flex: 1, color: "#FFFFFF", fontSize: 12, fontWeight: "800", lineHeight: 17 },
  content: { padding: 18, paddingBottom: 28, gap: 14 },
  routeStrip: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  routeChip: { minHeight: 38, borderRadius: 19, borderWidth: 1, borderColor: "rgba(242,199,91,0.22)", backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 6 },
  routeChipActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  routeChipText: { color: "#F2C75B", fontSize: 12, fontWeight: "900" },
  routeChipTextActive: { color: "#09070D" },
  areaGrid: { gap: 10 },
  areaCard: { borderRadius: 20, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, flexDirection: "row", gap: 11 },
  areaIcon: { width: 38, height: 38, borderRadius: 16, backgroundColor: "rgba(242,199,91,0.12)", alignItems: "center", justifyContent: "center" },
  areaTextWrap: { flex: 1, minWidth: 0 },
  areaTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  areaBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", marginTop: 4, lineHeight: 16 },
  scopeBox: { borderRadius: 22, padding: 14, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.16)", gap: 9 },
  scopeTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 2 },
  scopeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scopeText: { flex: 1, color: "#EEE8F4", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  nextBox: { borderRadius: 22, padding: 14, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", marginTop: 5, lineHeight: 16 },
});
