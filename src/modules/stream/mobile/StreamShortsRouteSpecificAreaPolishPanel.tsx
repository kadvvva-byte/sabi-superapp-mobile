import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;

type StreamShortsRouteSpecificAreaPolishPanelProps = {
  readonly version?: "121C" | string;
  readonly compact?: boolean;
  readonly style?: StyleProp<ViewStyle>;
};

const shortsRows: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "film-outline",
    title: "Сначала просмотр шортов",
    body: "Маршрут оставляет просмотр видео главным экраном, а детали настройки держит ниже пользовательского пути.",
  },
  {
    icon: "cut-outline",
    title: "Понятный путь редактирования",
    body: "Черновик, обрезка, эффекты и музыка остаются читаемыми локальными шагами подготовки на телефоне.",
  },
  {
    icon: "phone-portrait-outline",
    title: "Действия удобны для пальца",
    body: "Основные карточки маршрута остаются компактными, читаемыми и удобными для управления одной рукой.",
  },
  {
    icon: "lock-closed-outline",
    title: "Честная граница публикации",
    body: "Загрузка, хранилище провайдера, публичная публикация, подарки и заработок остаются заблокированы до реальной базовой фазы.",
  },
];

const guardRows = [
  "Только мобильный интерфейс шортов",
  "Без загрузки и хранилища провайдера",
  "Без публичной публикации и заработка",
  "Без изменений кошелька, Messenger, ИИ или админ-панели",
] as const;

export function StreamShortsRouteSpecificAreaPolishPanel({
  version = "121C",
  compact = false,
  style,
}: StreamShortsRouteSpecificAreaPolishPanelProps) {
  const [open, setOpen] = useState(false);
  const readyCount = useMemo(() => shortsRows.length, []);

  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null, style]}>
      <Pressable
        style={styles.card}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${version} Полировка мобильного маршрута шортов`}
      >
        <LinearGradient
          colors={["rgba(242,199,91,0.12)", "rgba(255,255,255,0.032)"]}
          style={[styles.cardGradient, compact ? styles.cardGradientCompact : null]}
        >
          <View style={styles.leftSide}>
            <View style={styles.iconBadge}>
              <Ionicons name="film-outline" size={compact ? 14 : 16} color="#09070D" />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.title} numberOfLines={1}>121C · Полировка маршрута шортов</Text>
              <Text style={styles.meta} numberOfLines={1}>Сначала просмотр, понятный путь редактирования и честно закрытая публикация.</Text>
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
                <Ionicons name="film-outline" size={24} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · Полировка мобильного маршрута шортов</Text>
                <Text style={styles.sheetMeta}>Маршрутный проход полировки для просмотра шортов и входа в создание.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Закрыть">
                <Ionicons name="close" size={21} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.noticeBox}>
              <View style={styles.noticeDot} />
              <Text style={styles.noticeText} numberOfLines={2}>
                Шорты остаются чистым мобильным просмотром и локальной поверхностью создания. Реальная загрузка, хранилище и публичная публикация остаются отложены.
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.areaGrid}>
                {shortsRows.map((item) => (
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
                <Text style={styles.guardTitle}>121C · границы этапа</Text>
                {guardRows.map((rule) => (
                  <View key={rule} style={styles.guardRow}>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#F2C75B" />
                    <Text style={styles.guardText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.nextBox}>
                <Text style={styles.nextTitle}>Следующий шаг интерфейса Stream</Text>
                <Text style={styles.nextBody}>Продолжить маршрутную мобильную полировку после шортов. Runtime-ядро, админ-панель и монетизацию оставить для следующих фаз.</Text>
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
