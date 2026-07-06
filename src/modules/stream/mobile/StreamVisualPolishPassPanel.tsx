import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamVisualPolishVariant = "shell" | "live" | "shorts" | "business" | "profile";
type IconName = keyof typeof Ionicons.glyphMap;

type StreamVisualPolishPassPanelProps = {
  readonly version?: "119G" | string;
  readonly variant?: StreamVisualPolishVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const variantТекст: Record<StreamVisualPolishVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "119G · Визуальная полировка",
    meta: "Главный вход Stream чище, плотнее и готов к финальной мобильной проверке.",
    icon: "phone-portrait-outline",
  },
  live: {
    title: "119G · Полировка эфира",
    meta: "Вход перед эфиром держит чистые отступы, понятные метки и честно закрытый запуск.",
    icon: "radio-outline",
  },
  shorts: {
    title: "119G · Полировка шортов",
    meta: "Вход в шорты держит простую навигацию, пустые состояния и понятный путь редактора.",
    icon: "play-circle-outline",
  },
  business: {
    title: "119G · Полировка бизнеса",
    meta: "Бизнес-маршрут отделён от кошелька, активации продавца и оплат.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "119G · Полировка профиля",
    meta: "Настройка автора остаётся читаемой: статус проверки и заработок только как закрытые состояния.",
    icon: "person-circle-outline",
  },
};

const polishChecks: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "resize-outline",
    title: "Плотность",
    body: "Карточки, метки и строки действий остаются достаточно компактными для обычного телефона.",
  },
  {
    icon: "text-outline",
    title: "Текст",
    body: "Пользовательский текст объясняет, что доступно сейчас и что честно заблокировано.",
  },
  {
    icon: "layers-outline",
    title: "Иерархия",
    body: "Эфир, шорты, бизнес и профиль остаются разделёнными без смешивания продуктовых потоков.",
  },
  {
    icon: "lock-closed-outline",
    title: "Блокировки",
    body: "Провайдер, админка, подарки, монетизация и активация кошелька остаются отложенными.",
  },
];

const finalUiБлокировки = [
  "обычный режим пользователя остаётся чистым и продуктовым",
  "технический контент сборки остаётся вне публичной навигации Stream",
  "пустые и закрытые состояния остаются честными, без имитации активности",
  "на этом шаге не добавляется поведение backend, провайдера, админки, кошелька, подарков или оплат",
] as const;

export function StreamVisualPolishPassPanel({
  version = "119G",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
}: StreamVisualPolishPassPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantТекст[variant];
  const readyCount = useMemo(() => polishChecks.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} visual polish`}>
        <LinearGradient colors={["rgba(255,255,255,0.10)", "rgba(242,199,91,0.10)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
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
                <Ionicons name="color-palette-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Мобильная визуальная полировка Stream</Text>
                <Text style={styles.sheetMeta}>Этот проход улучшает только публичное мобильное ощущение. Runtime-провайдеры и заработок остаются для следующих этапов.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Чистый мобильный режим активен: пользователь видит навигацию Stream, понятный статус и безопасные закрытые состояния." : "Чистый мобильный режим должен оставаться включённым перед публичной проверкой Stream."}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.checkGrid}>
                {polishChecks.map((item) => (
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

              <View style={styles.lockBox}>
                <Text style={styles.lockTitle}>Финальные блокировки полировки</Text>
                {finalUiБлокировки.map((lock) => (
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
  cardGradient: { minHeight: 56, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
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
  lockBox: { borderRadius: 24, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 13, gap: 9 },
  lockTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockText: { flex: 1, color: "#D9D2E2", fontSize: 11, fontWeight: "800", lineHeight: 15 },
});
