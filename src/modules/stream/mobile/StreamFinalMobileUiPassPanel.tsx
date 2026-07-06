import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type StreamFinalMobileUiPassPanelProps = {
  version?: "119A" | string;
  ordinaryUserMode?: boolean;
  style?: StyleProp<ViewStyle>;
};

const mobileNavigationItems = [
  {
    icon: "radio-outline",
    title: "Эфир",
    status: "только мобильный UI эфира",
    detail: "Подготовка эфира, выбор режима и запуск остаются в мобильном UI. Запуск через сервер/провайдера пока заблокирован.",
  },
  {
    icon: "play-circle-outline",
    title: "Короткие видео",
    status: "только UI ленты и редактора",
    detail: "Вход в короткие видео виден с честными пустыми состояниями. Загрузка и публикация через провайдера отложены.",
  },
  {
    icon: "briefcase-outline",
    title: "Бизнес",
    status: "бизнес-раздел виден",
    detail: "Вход в бизнес-стрим отделён от обычного эфира. Оплаты и заказы остаются закрыты.",
  },
  {
    icon: "person-circle-outline",
    title: "Профиль",
    status: "настройка автора видна",
    detail: "Профиль автора и настройка официального стримера остаются только как черновик/проверка до готовности Admin и сервера.",
  },
] as const;

const honestBlockedStates = [
  "provider_not_configured остаётся видимым заблокированным состоянием",
  "фейковый эфир, зрители и счётчики не добавляются",
  "технические и debug-панели скрыты из обычного режима пользователя",
  "подарки, монетизация и Wallet отложены до финального этапа Stream",
] as const;

export function StreamFinalMobileUiPassPanel({
  version = "119A",
  ordinaryUserMode = true,
  style,
}: StreamFinalMobileUiPassPanelProps) {
  const [open, setOpen] = useState(false);
  const visibleNavigationCount = useMemo(() => mobileNavigationItems.length, []);

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${version} полный UI`}>
        <LinearGradient colors={["rgba(242,199,91,0.22)", "rgba(255,255,255,0.08)"]} style={styles.triggerGradient}>
          <View style={styles.triggerLeft}>
            <View style={styles.versionBadge}>
              <Ionicons name="phone-portrait-outline" size={14} color="#09070D" />
              <Text style={styles.versionText}>{version}</Text>
            </View>
            <View style={styles.triggerTextWrap}>
              <Text style={styles.triggerTitle} numberOfLines={1}>Финальный мобильный UI</Text>
              <Text style={styles.triggerMeta} numberOfLines={1}>Эфир / Короткие видео / Бизнес / Профиль · чистый режим пользователя</Text>
            </View>
          </View>
          <View style={styles.openPill}>
            <Text style={styles.openText}>119A полный UI</Text>
            <Ionicons name="chevron-forward" size={15} color="#09070D" />
          </View>
        </LinearGradient>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.sheetIcon}>
                <Ionicons name="phone-portrait-outline" size={26} color="#F2C75B" />
              </View>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>{version} · финальная проверка мобильного Stream UI</Text>
                <Text style={styles.sheetMeta}>Сначала UI → сервер/ядро/провайдер → Admin → подарки/монетизация/Wallet</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.notice}>
              <View style={styles.noticeDot} />
              <Text style={styles.noticeText} numberOfLines={2}>
                Обычный мобильный режим чистый. Технические и debug-панели не входят в публичный путь Stream.
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.heroCard}>
                <Text style={styles.heroNumber}>{visibleNavigationCount}</Text>
                <Text style={styles.heroTitle}>главные разделы Stream</Text>
                <Text style={styles.heroMeta}>{ordinaryUserMode ? "обычный режим пользователя включён" : "внутренний режим владельца выключен"}</Text>
              </View>

              <View style={styles.grid}>
                {mobileNavigationItems.map((item) => (
                  <View key={item.title} style={styles.tile}>
                    <View style={styles.tileIcon}>
                      <Ionicons name={item.icon} size={22} color="#F2C75B" />
                    </View>
                    <Text style={styles.tileTitle}>{item.title}</Text>
                    <Text style={styles.tileStatus}>{item.status}</Text>
                    <Text style={styles.tileDetail}>{item.detail}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.blockedBox}>
                <Text style={styles.blockedTitle}>Честные заблокированные состояния</Text>
                {honestBlockedStates.map((item) => (
                  <View key={item} style={styles.blockedRow}>
                    <Ionicons name="lock-closed-outline" size={15} color="#F2C75B" />
                    <Text style={styles.blockedText}>{item}</Text>
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
  wrapper: { position: "absolute", top: 60, left: 18, right: 18, zIndex: 22 },
  trigger: { borderRadius: 22, overflow: "hidden" },
  triggerGradient: { minHeight: 58, borderRadius: 22, borderWidth: 1, borderColor: "rgba(242,199,91,0.24)", padding: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  triggerLeft: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 9 },
  versionBadge: { height: 34, borderRadius: 17, backgroundColor: "#F2C75B", paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 5 },
  versionText: { color: "#09070D", fontSize: 12, fontWeight: "900" },
  triggerTextWrap: { flex: 1, minWidth: 0 },
  triggerTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  triggerMeta: { color: "#D9D2E2", fontSize: 10, fontWeight: "800", marginTop: 2 },
  openPill: { height: 34, borderRadius: 17, backgroundColor: "#F2C75B", paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 3 },
  openText: { color: "#09070D", fontSize: 11, fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  sheet: { maxHeight: "86%", borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: "#111018", borderWidth: 1, borderColor: "#292532", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  sheetTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  sheetIcon: { width: 48, height: 48, borderRadius: 20, backgroundColor: "rgba(242,199,91,0.10)", borderWidth: 1, borderColor: "rgba(242,199,91,0.20)", alignItems: "center", justifyContent: "center" },
  sheetTitleWrap: { flex: 1, minWidth: 0 },
  sheetTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  sheetMeta: { color: "#8D8796", fontSize: 11, fontWeight: "800", marginTop: 4, lineHeight: 15 },
  closeButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  notice: { minHeight: 48, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  noticeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#F2C75B" },
  noticeText: { flex: 1, color: "#E1DCE8", fontSize: 11, fontWeight: "900", lineHeight: 15 },
  content: { paddingTop: 12, gap: 12 },
  heroCard: { minHeight: 110, borderRadius: 26, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.18)", alignItems: "center", justifyContent: "center", gap: 3 },
  heroNumber: { color: "#F2C75B", fontSize: 42, fontWeight: "900" },
  heroTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  heroMeta: { color: "#D7CDAE", fontSize: 11, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { width: "48.5%", minHeight: 148, borderRadius: 22, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 12 },
  tileIcon: { width: 38, height: 38, borderRadius: 17, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tileTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  tileStatus: { color: "#F2C75B", fontSize: 10, fontWeight: "900", marginTop: 4 },
  tileDetail: { color: "#8D8796", fontSize: 10, fontWeight: "800", lineHeight: 14, marginTop: 7 },
  blockedBox: { borderRadius: 24, backgroundColor: "#17151E", borderWidth: 1, borderColor: "#2B2735", padding: 13, gap: 9 },
  blockedTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  blockedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  blockedText: { flex: 1, color: "#D9D2E2", fontSize: 11, fontWeight: "800", lineHeight: 15 },
});
