import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamUiOnlyCheckpointVariant = "shell" | "live" | "shorts" | "business" | "profile";
type StreamUiOnlyCheckpointRoute = Exclude<StreamUiOnlyCheckpointVariant, "shell">;
type IconName = keyof typeof Ionicons.glyphMap;

type StreamUiOnlyCheckpointPanelProps = {
  readonly version?: "120K" | string;
  readonly variant?: StreamUiOnlyCheckpointVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly onOpenRoute?: (route: StreamUiOnlyCheckpointRoute) => void;
};

const copyByVariant: Record<StreamUiOnlyCheckpointVariant, { title: string; meta: string; icon: IconName; focus: string }> = {
  shell: {
    title: "120K · Мобильная контрольная точка",
    meta: "Финальная мобильная контрольная точка Stream перед следующей зоной интерфейса.",
    icon: "phone-portrait-outline",
    focus: "Вход Stream остаётся чистым, маршрутным и готовым к следующей мобильной полировке.",
  },
  live: {
    title: "120K · Контроль эфира",
    meta: "Эфир держит настройку понятной, пока реальный запуск остаётся закрытым.",
    icon: "radio-outline",
    focus: "Эфир показывает подготовку ведущего и честные блокировки, а не имитацию трансляции.",
  },
  shorts: {
    title: "120K · Контроль шортов",
    meta: "Шорты держат просмотр, редактор и границы публикации понятными.",
    icon: "play-circle-outline",
    focus: "Шорты остаются телефонными без вида, что загрузка или публикация через внешний провайдер уже готовы.",
  },
  business: {
    title: "120K · Контроль бизнес-стрима",
    meta: "Бизнес-стрим остаётся премиальным без запуска продавца и оплаты.",
    icon: "briefcase-outline",
    focus: "Бизнес-стрим держит каталог, продавца, заработок и оплату видимо закрытыми до реальных этапов.",
  },
  profile: {
    title: "120K · Контроль профиля",
    meta: "Профиль автора честно показывает публичную настройку.",
    icon: "person-circle-outline",
    focus: "Профиль не показывает имитацию аудитории, официальный статус, доход от подарков или успешную проверку.",
  },
};

const routeOrder: readonly { route: StreamUiOnlyCheckpointRoute; label: string; icon: IconName }[] = [
  { route: "live", label: "Эфир", icon: "radio-outline" },
  { route: "shorts", label: "Шорты", icon: "play-circle-outline" },
  { route: "business", label: "Бизнес", icon: "briefcase-outline" },
  { route: "profile", label: "Профиль", icon: "person-circle-outline" },
];

const checkpointRows: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "phone-portrait-outline",
    title: "Маршрут под телефон",
    body: "Пользователь видит простой путь Stream: эфир, шорты, Бизнес и профиль.",
  },
  {
    icon: "albums-outline",
    title: "Карточки продукта выровнены",
    body: "Карточки сохраняют одну иерархию, отступы и короткий текст во всех публичных маршрутах.",
  },
  {
    icon: "hand-left-outline",
    title: "Касания остаются удобными",
    body: "Чипы маршрутов и строки действий удобно нажимать на реальном экране телефона.",
  },
  {
    icon: "lock-closed-outline",
    title: "Закрытые состояния честные",
    body: "Реальный запуск, внешний провайдер, публикация, оплата, кошелёк, подарки, заработок и админ-панель остаются закрытыми.",
  },
];

const boundaryRows = [
  "Только мобильный интерфейс Stream",
  "Без серверного запуска и внешнего провайдера",
  "Без изменений админ-панели, кошелька, Messenger и AI",
  "Без подарков, платежей, монетизации и имитации успеха",
] as const;

export function StreamUiOnlyCheckpointPanel({
  version = "120K",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
  onOpenRoute,
}: StreamUiOnlyCheckpointPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = copyByVariant[variant];
  const readyCount = useMemo(() => checkpointRows.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} мобильная контрольная точка Stream`}>
        <LinearGradient colors={["rgba(242,199,91,0.1)", "rgba(255,255,255,0.034)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
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
                <Ionicons name="shield-checkmark-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Мобильная контрольная точка Stream</Text>
                <Text style={styles.sheetMeta}>Финальная мобильная контрольная точка перед следующей зоной интерфейса Stream.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? copy.focus : "Обычный режим должен оставаться включённым для этой контрольной точки."}
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

              <View style={styles.checkGrid}>
                {checkpointRows.map((item) => (
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

              <View style={styles.boundaryBox}>
                <Text style={styles.boundaryTitle}>Граница контрольной точки</Text>
                {boundaryRows.map((rule) => (
                  <View key={rule} style={styles.boundaryRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.boundaryText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующая зона интерфейса Stream</Text>
                <Text style={styles.nextBody}>Продолжай только мобильный интерфейс. Реальный запуск, серверная основа, админ-панель и монетизация остаются для следующих этапов Stream.</Text>
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
  cardGradient: { minHeight: 56, borderRadius: 22, borderWidth: 1, borderColor: "rgba(242,199,91,0.14)", paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
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
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 28, gap: 14 },
  routeStrip: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  routeChip: { minHeight: 38, borderRadius: 19, paddingHorizontal: 11, borderWidth: 1, borderColor: "rgba(242,199,91,0.22)", backgroundColor: "rgba(255,255,255,0.045)", flexDirection: "row", alignItems: "center", gap: 6 },
  routeChipActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  routeChipText: { color: "#F2C75B", fontSize: 12, fontWeight: "900" },
  routeChipTextActive: { color: "#09070D" },
  checkGrid: { gap: 10 },
  checkCard: { borderRadius: 22, backgroundColor: "rgba(255,255,255,0.052)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, flexDirection: "row", gap: 11 },
  checkIcon: { width: 38, height: 38, borderRadius: 16, backgroundColor: "rgba(242,199,91,0.11)", alignItems: "center", justifyContent: "center" },
  checkTextWrap: { flex: 1, minWidth: 0 },
  checkTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  checkBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 4 },
  boundaryBox: { borderRadius: 24, backgroundColor: "rgba(242,199,91,0.075)", borderWidth: 1, borderColor: "rgba(242,199,91,0.16)", padding: 14, gap: 9 },
  boundaryTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginBottom: 2 },
  boundaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  boundaryText: { flex: 1, color: "#EFE9D7", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  nextBox: { borderRadius: 22, backgroundColor: "rgba(255,255,255,0.048)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14 },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#D8D1E1", fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 5 },
});
