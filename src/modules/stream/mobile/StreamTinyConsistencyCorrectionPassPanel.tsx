import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamTinyConsistencyCorrectionVariant = "shell" | "live" | "shorts" | "business" | "profile";
type StreamTinyConsistencyCorrectionRoute = Exclude<StreamTinyConsistencyCorrectionVariant, "shell">;
type IconName = keyof typeof Ionicons.glyphMap;

type StreamTinyConsistencyCorrectionPassPanelProps = {
  readonly version?: "120H" | string;
  readonly variant?: StreamTinyConsistencyCorrectionVariant;
  readonly ordinaryUserMode?: boolean;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly onOpenRoute?: (route: StreamTinyConsistencyCorrectionRoute) => void;
};

const variantCopy: Record<StreamTinyConsistencyCorrectionVariant, { title: string; meta: string; icon: IconName }> = {
  shell: {
    title: "120H · Мелкая правка согласованности",
    meta: "Финальный малый слой согласованности для мобильной оболочки Stream.",
    icon: "options-outline",
  },
  live: {
    title: "120H · Согласованность эфира",
    meta: "Эфир держит настройку, безопасность и закрытые состояния в одном понятном ритме.",
    icon: "radio-outline",
  },
  shorts: {
    title: "120H · Согласованность шортов",
    meta: "Шорты разделяют просмотр, инструменты создания и честный текст закрытой публикации.",
    icon: "play-circle-outline",
  },
  business: {
    title: "120H · Согласованность бизнеса",
    meta: "Бизнес-стрим держит продавца, каталог и оплату читаемыми без запуска торговли.",
    icon: "briefcase-outline",
  },
  profile: {
    title: "120H · Согласованность профиля",
    meta: "Профиль автора честно показывает настройку, официальный статус и закрытый заработок.",
    icon: "person-circle-outline",
  },
};

const routeOrder: readonly { route: StreamTinyConsistencyCorrectionRoute; label: string; icon: IconName }[] = [
  { route: "live", label: "Эфир", icon: "radio-outline" },
  { route: "shorts", label: "Шорты", icon: "play-circle-outline" },
  { route: "business", label: "Бизнес", icon: "briefcase-outline" },
  { route: "profile", label: "Профиль", icon: "person-circle-outline" },
];

const consistencyRows: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "grid-outline",
    title: "Единый ритм маршрутов",
    body: "Оболочка, эфир, шорты, бизнес и профиль сохраняют один продуктовый порядок и визуальную логику.",
  },
  {
    icon: "hand-left-outline",
    title: "Единое удобство касаний",
    body: "Чипы маршрутов и карточки остаются удобными для нажатия без добавления новых действий пользователя.",
  },
  {
    icon: "reader-outline",
    title: "Единый читаемый текст",
    body: "Заголовки остаются короткими, подсказки спокойными, а закрытые состояния не выглядят ошибками.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Единые честные блокировки",
    body: "Провайдер, публикация, оплата, кошелёк, подарки, заработок, админка и одобрение остаются закрытыми до реальных этапов.",
  },
];

const scopeRows = [
  "Только согласованность мобильного интерфейса Stream",
  "Без сервера, провайдера, админки и запуска ядра",
  "Без изменений кошелька, Messenger, AI, подарков, платежей и монетизации",
  "Без фейкового эфира, загрузки, заказа, подписчика, баланса или состояния одобрения",
] as const;

export function StreamTinyConsistencyCorrectionPassPanel({
  version = "120H",
  variant = "shell",
  ordinaryUserMode = true,
  compact = false,
  style,
  onOpenRoute,
}: StreamTinyConsistencyCorrectionPassPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = variantCopy[variant];
  const consistencyCount = useMemo(() => consistencyRows.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable style={styles.card} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} малая правка согласованности Stream`}>
        <LinearGradient colors={["rgba(242,199,91,0.095)", "rgba(255,255,255,0.03)"]} style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}>
          <View style={styles.leftSide}>
            <View style={styles.iconBadge}>
              <Ionicons name={copy.icon} size={compact ? 14 : 16} color="#09070D" />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.title} numberOfLines={1}>{copy.title}</Text>
              <Text style={styles.meta} numberOfLines={1}>{copy.meta}</Text>
            </View>
          </View>
          <View style={styles.acceptPill}>
            <Text style={styles.acceptText}>{consistencyCount}/4</Text>
            <Ionicons name="chevron-forward" size={14} color="#09070D" />
          </View>
        </LinearGradient>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.sheetIcon}>
                <Ionicons name="options-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Малая правка согласованности Stream</Text>
                <Text style={styles.sheetMeta}>Финальный малый проход только UI для ритма маршрутов, читаемого текста, удобства касаний и честных закрытых состояний.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modeNotice}>
              <View style={ordinaryUserMode ? styles.modeDot : styles.modeDotOff} />
              <Text style={styles.modeNoticeText} numberOfLines={2}>
                {ordinaryUserMode ? "Обычный режим остаётся продуктово чистым во всех маршрутах Stream." : "Обычный режим должен оставаться включённым для публичной полировки Stream UI."}
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
                {consistencyRows.map((item) => (
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

              <View style={styles.scopeBox}>
                <Text style={styles.scopeTitle}>Область остаётся узкой</Text>
                {scopeRows.map((rule) => (
                  <View key={rule} style={styles.scopeRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.scopeText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий UI-фокус</Text>
                <Text style={styles.nextBody}>После этого прохода продолжай только acceptance-проверку или маленькую полировку конкретного маршрута, если установленный экран всё ещё выглядит неровно.</Text>
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
  acceptPill: { minWidth: 46, height: 29, borderRadius: 15, backgroundColor: "#F2C75B", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2 },
  acceptText: { color: "#09070D", fontSize: 11, fontWeight: "900" },
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
  routeStrip: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  routeChip: { minHeight: 34, borderRadius: 17, borderWidth: 1, borderColor: "rgba(242,199,91,0.22)", backgroundColor: "rgba(242,199,91,0.08)", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 6 },
  routeChipActive: { backgroundColor: "#F2C75B", borderColor: "#F2C75B" },
  routeChipText: { color: "#F2C75B", fontSize: 11, fontWeight: "900" },
  routeChipTextActive: { color: "#09070D" },
  checkGrid: { gap: 9 },
  checkCard: { minHeight: 72, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkIcon: { width: 34, height: 34, borderRadius: 15, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  checkTextWrap: { flex: 1, minWidth: 0 },
  checkTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  checkBody: { color: "#AFA7BA", fontSize: 11, lineHeight: 16, fontWeight: "700", marginTop: 4 },
  scopeBox: { borderRadius: 22, backgroundColor: "rgba(242,199,91,0.07)", borderWidth: 1, borderColor: "rgba(242,199,91,0.14)", padding: 13, gap: 8 },
  scopeTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  scopeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scopeText: { flex: 1, color: "#DED8E8", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  nextBox: { borderRadius: 22, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 13 },
  nextTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  nextBody: { color: "#AFA7BA", fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 5 },
});
