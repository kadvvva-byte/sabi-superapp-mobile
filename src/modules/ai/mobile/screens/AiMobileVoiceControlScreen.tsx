import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bot,
  LockKeyhole,
  Mic2,
  Navigation,
  ShieldCheck,
  Volume2,
} from "lucide-react-native";

import { useI18n } from "../../../../shared/i18n";

type Locale = "en" | "ru" | "uz";

type VoiceCommand = {
  label: string;
  route: string;
};

function localeOf(language?: string | null): Locale {
  const normalized = String(language || "").trim().toLowerCase();
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uz")) return "uz";
  return "en";
}

const T = {
  eyebrow: { en: "Sabi AI", ru: "Sabi AI", uz: "Sabi AI" },
  title: { en: "SABI Voice Control", ru: "SABI голосовое управление", uz: "SABI ovozli boshqaruv" },
  subtitle: {
    en: "This is the app-control entry, not voice translation. Wake word, STT, TTS and command execution stay disabled until real server/native providers are connected.",
    ru: "Это вход для управления приложением, не голосовой перевод. Wake word, STT, TTS и выполнение команд отключены до подключения реальных server/native providers.",
    uz: "Bu ovozli tarjima emas, app boshqaruvi kirish nuqtasi. Wake word, STT, TTS va command execution real server/native provider ulanmaguncha o‘chiq turadi.",
  },
  statusTitle: { en: "Current status", ru: "Текущее состояние", uz: "Joriy holat" },
  provider: { en: "Provider", ru: "Provider", uz: "Provider" },
  providerValue: { en: "not configured", ru: "не подключён", uz: "ulanmagan" },
  wake: { en: "Wake word", ru: "Wake word", uz: "Wake word" },
  wakeValue: { en: "SABI / Саби reserved", ru: "SABI / Саби зарезервирован", uz: "SABI / Саби zaxiralangan" },
  noFakeTitle: { en: "No fake voice AI", ru: "Без fake voice AI", uz: "Fake voice AI yo‘q" },
  noFakeText: {
    en: "The screen does not simulate listening, speech recognition, voice replies or command success. Manual buttons below only open real app routes for testing navigation.",
    ru: "Экран не симулирует прослушивание, распознавание речи, голосовой ответ или успешное выполнение команды. Кнопки ниже только открывают реальные routes для проверки навигации.",
    uz: "Ekran tinglash, speech recognition, ovozli javob yoki command successni soxtalashtirmaydi. Pastdagi tugmalar faqat real app routelarni ochadi.",
  },
  commands: { en: "Manual route checks", ru: "Ручная проверка маршрутов", uz: "Route tekshirish" },
  premium: { en: "Premium later", ru: "Premium позже", uz: "Premium keyin" },
  premiumText: {
    en: "Advanced assistants, wake-word command execution, SABI voice replies and realtime call translation remain Premium/future features.",
    ru: "Advanced assistants, wake-word command execution, голосовые ответы SABI и realtime call translation остаются Premium/future функциями.",
    uz: "Advanced assistants, wake-word command execution, SABI ovozli javoblari va realtime call translation Premium/future bo‘lib qoladi.",
  },
};

function commandList(locale: Locale): VoiceCommand[] {
  const labels = {
    messenger: { en: "Open Messenger", ru: "Открыть Messenger", uz: "Messenger ochish" },
    wallet: { en: "Open Wallet", ru: "Открыть Wallet", uz: "Wallet ochish" },
    qr: { en: "Open QR", ru: "Открыть QR", uz: "QR ochish" },
    search: { en: "Open Search", ru: "Открыть поиск", uz: "Qidiruv ochish" },
    miniapps: { en: "Open Mini Apps", ru: "Открыть Mini Apps", uz: "Mini Apps ochish" },
  };

  return [
    { label: labels.messenger[locale], route: "/tabs/chats" },
    { label: labels.wallet[locale], route: "/wallet/home" },
    { label: labels.qr[locale], route: "/qr" },
    { label: labels.search[locale], route: "/search" },
    { label: labels.miniapps[locale], route: "/mini-apps" },
  ];
}

export default function AiMobileVoiceControlScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const locale = localeOf(language);
  const commands = useMemo(() => commandList(locale), [locale]);

  const openRoute = (route: string) => {
    router.push(route as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#100824", "#4C1D95", "#7C3AED"]} style={styles.screen}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.eyebrow}>{T.eyebrow[locale]}</Text>
            <Text style={styles.headerTitle}>{T.title[locale]}</Text>
          </View>
          <View style={styles.iconButton}>
            <Mic2 size={20} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Bot size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>{T.title[locale]}</Text>
            <Text style={styles.heroSubtitle}>{T.subtitle[locale]}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{T.statusTitle[locale]}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{T.provider[locale]}</Text>
              <Text style={styles.statusValue}>{T.providerValue[locale]}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{T.wake[locale]}</Text>
              <Text style={styles.statusValue}>{T.wakeValue[locale]}</Text>
            </View>
          </View>

          <View style={styles.noticeCard}>
            <ShieldCheck size={20} color="#DDD6FE" />
            <View style={styles.noticeTextWrap}>
              <Text style={styles.noticeTitle}>{T.noFakeTitle[locale]}</Text>
              <Text style={styles.noticeText}>{T.noFakeText[locale]}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{T.commands[locale]}</Text>
            <View style={styles.commandList}>
              {commands.map((command) => (
                <Pressable key={command.route} onPress={() => openRoute(command.route)} style={styles.commandButton}>
                  <Navigation size={17} color="#FFFFFF" />
                  <Text style={styles.commandText}>{command.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.noticeCard}>
            <LockKeyhole size={20} color="#FDE68A" />
            <View style={styles.noticeTextWrap}>
              <Text style={styles.noticeTitle}>{T.premium[locale]}</Text>
              <Text style={styles.noticeText}>{T.premiumText[locale]}</Text>
            </View>
          </View>

          <View style={styles.disabledMicCard}>
            <Volume2 size={22} color="rgba(255,255,255,0.55)" />
            <Text style={styles.disabledMicText}>SABI</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#100824" },
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  iconButton: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  headerCenter: { flex: 1 },
  eyebrow: { color: "rgba(255,255,255,0.64)", fontSize: 12, fontWeight: "800", letterSpacing: 0.8 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  content: { padding: 16, gap: 14, paddingBottom: 30 },
  heroCard: { borderRadius: 30, padding: 18, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  heroIcon: { width: 68, height: 68, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 14 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  heroSubtitle: { color: "rgba(255,255,255,0.74)", fontSize: 14, lineHeight: 21, marginTop: 8 },
  card: { borderRadius: 24, padding: 16, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  sectionTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginBottom: 10 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  statusLabel: { color: "rgba(255,255,255,0.66)", fontSize: 13, fontWeight: "700" },
  statusValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", flex: 1, textAlign: "right" },
  noticeCard: { flexDirection: "row", gap: 12, borderRadius: 24, padding: 15, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  noticeTextWrap: { flex: 1 },
  noticeTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  noticeText: { color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 19, marginTop: 5 },
  commandList: { gap: 9 },
  commandButton: { minHeight: 46, borderRadius: 17, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.11)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  commandText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  disabledMicCard: { minHeight: 82, borderRadius: 30, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.20)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  disabledMicText: { color: "rgba(255,255,255,0.68)", fontSize: 18, fontWeight: "900", letterSpacing: 3 },
});
