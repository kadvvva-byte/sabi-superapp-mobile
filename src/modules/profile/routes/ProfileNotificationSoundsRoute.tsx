import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Bell, Check, Music2, Plus, Trash2 } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import {
  SABI_CALL_SOUND_OPTIONS,
  SABI_MESSAGE_SOUND_OPTIONS,
  SABI_SERVICE_SOUND_OPTIONS,
  type SabiNotificationSoundKind,
  type SabiNotificationSoundOption,
} from "../../notifications/sounds/sabiNotificationSounds";
import {
  deleteSabiCustomSound,
  listSabiCustomSounds,
  loadSabiSoundPreferences,
  pickAndSaveSabiCustomSound,
  saveSabiSoundPreference,
  type SabiCustomSoundItem,
  type SabiSoundPreferences,
} from "../../notifications/sounds/sabiSoundPreferences";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
      language?: string;
    };

const KIND_ORDER: SabiNotificationSoundKind[] = ["call", "message", "wallet", "market", "ai", "system"];

export default function ProfileNotificationSoundsScreen() {
  const i18n = useI18n() as I18nHookValue;
  const [preferences, setPreferences] = useState<SabiSoundPreferences | null>(null);
  const [customSounds, setCustomSounds] = useState<SabiCustomSoundItem[]>([]);

  const activeLanguage = typeof i18n === "object" && typeof i18n?.language === "string" ? i18n.language : "ru";
  const fallbackTerms = useMemo(() => buildNotificationSoundFallbackTerms(activeLanguage), [activeLanguage]);

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      const translated =
        typeof i18n === "function"
          ? i18n(key, params)
          : i18n?.t
            ? i18n.t(key, params)
            : key;

      if (translated && translated !== key) return translated;
      return fallbackTerms[key] || key;
    },
    [fallbackTerms, i18n],
  );

  const reload = useCallback(async () => {
    const [nextPrefs, nextCustom] = await Promise.all([
      loadSabiSoundPreferences(),
      listSabiCustomSounds(),
    ]);
    setPreferences(nextPrefs);
    setCustomSounds(nextCustom);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const sections = useMemo(() => {
    return {
      call: SABI_CALL_SOUND_OPTIONS,
      message: SABI_MESSAGE_SOUND_OPTIONS,
      wallet: SABI_SERVICE_SOUND_OPTIONS.filter((item) => item.kind === "wallet"),
      market: SABI_SERVICE_SOUND_OPTIONS.filter((item) => item.kind === "market"),
      ai: SABI_SERVICE_SOUND_OPTIONS.filter((item) => item.kind === "ai"),
      system: SABI_SERVICE_SOUND_OPTIONS.filter((item) => item.kind === "system"),
    } satisfies Record<SabiNotificationSoundKind, SabiNotificationSoundOption[]>;
  }, []);

  const chooseBundled = useCallback(async (option: SabiNotificationSoundOption) => {
    try {
      const next = await saveSabiSoundPreference(option.kind, option.id);
      setPreferences(next);
    } catch {
      Alert.alert(t("profile.notificationSounds.errors.addTitle"), t("profile.notificationSounds.errors.saveMessage"));
    }
  }, [t]);

  const chooseCustom = useCallback(async (item: SabiCustomSoundItem) => {
    try {
      const next = await saveSabiSoundPreference(item.kind, item.id);
      setPreferences(next);
    } catch {
      Alert.alert(t("profile.notificationSounds.errors.addTitle"), t("profile.notificationSounds.errors.saveMessage"));
    }
  }, [t]);

  const addCustom = useCallback(
    async (kind: SabiNotificationSoundKind) => {
      try {
        const saved = await pickAndSaveSabiCustomSound(kind);
        if (!saved) return;
        const next = await saveSabiSoundPreference(kind, saved.id);
        setPreferences(next);
        await reload();
      } catch (error) {
        const message =
          error instanceof Error && error.message.includes("mp3")
            ? t("profile.notificationSounds.errors.onlyMp3")
            : t("profile.notificationSounds.errors.addMessage");
        Alert.alert(t("profile.notificationSounds.errors.addTitle"), message);
      }
    },
    [reload, t],
  );

  const removeCustom = useCallback(
    async (item: SabiCustomSoundItem) => {
      await deleteSabiCustomSound(item.id);
      await reload();
    },
    [reload],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#111827" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>{t("profile.notificationSounds.title")}</Text>
          <Text style={styles.subtitle}>{t("profile.notificationSounds.subtitle")}</Text>
        </View>

        <View style={styles.headerButton}>
          <Music2 size={21} color="#111827" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {KIND_ORDER.map((kind) => (
          <SoundSection
            key={kind}
            kind={kind}
            title={t(`profile.notificationSounds.sections.${kind}`)}
            options={sections[kind]}
            customSounds={customSounds.filter((item) => item.kind === kind)}
            selectedId={preferences?.[kind] ?? ""}
            t={t}
            onChooseBundled={chooseBundled}
            onChooseCustom={chooseCustom}
            onAddCustom={addCustom}
            onRemoveCustom={removeCustom}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SoundSection(props: {
  kind: SabiNotificationSoundKind;
  title: string;
  options: SabiNotificationSoundOption[];
  customSounds: SabiCustomSoundItem[];
  selectedId: string;
  t: (key: string, params?: Record<string, unknown>) => string;
  onChooseBundled: (option: SabiNotificationSoundOption) => void;
  onChooseCustom: (item: SabiCustomSoundItem) => void;
  onAddCustom: (kind: SabiNotificationSoundKind) => void;
  onRemoveCustom: (item: SabiCustomSoundItem) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Bell size={17} color="#111827" />
        <Text style={styles.sectionTitle}>{props.title}</Text>
      </View>

      <View style={styles.card}>
        {props.options.map((option) => (
          <SoundRow
            key={option.id}
            title={props.t(`profile.notificationSounds.options.${option.id}.title`)}
            description={props.t(`profile.notificationSounds.options.${option.id}.description`)}
            selected={props.selectedId === option.id}
            onPress={() => props.onChooseBundled(option)}
          />
        ))}
      </View>

      {props.kind === "call" ? (
        <Pressable style={styles.addButton} onPress={() => props.onAddCustom(props.kind)}>
          <Plus size={18} color="#111827" />
          <Text style={styles.addButtonText}>{props.t("profile.notificationSounds.actions.addCallMp3")}</Text>
        </Pressable>
      ) : null}

      {props.customSounds.length ? (
        <View style={styles.card}>
          {props.customSounds.map((item) => (
            <View key={item.id} style={styles.customRow}>
              <Pressable style={styles.customChoose} onPress={() => props.onChooseCustom(item)}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowDescription}>{props.t("profile.notificationSounds.custom.localFile")}</Text>
                </View>
                <View style={[styles.checkCircle, props.selectedId === item.id && styles.checkCircleActive]}>
                  {props.selectedId === item.id ? <Check size={14} color="#FFFFFF" /> : null}
                </View>
              </Pressable>

              <Pressable style={styles.deleteButton} onPress={() => props.onRemoveCustom(item)}>
                <Trash2 size={17} color="#DC2626" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.note}>
        {props.kind === "call"
          ? props.t("profile.notificationSounds.notes.callMp3Clip")
          : props.t("profile.notificationSounds.notes.signalsBundledOnly")}
      </Text>
    </View>
  );
}

function SoundRow(props: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.row, props.selected && styles.rowActive]} onPress={props.onPress}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{props.title}</Text>
        <Text style={styles.rowDescription}>{props.description}</Text>
      </View>

      <View style={[styles.checkCircle, props.selected && styles.checkCircleActive]}>
        {props.selected ? <Check size={14} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

function buildNotificationSoundFallbackTerms(language: string): Record<string, string> {
  const normalized = String(language || "ru").toLowerCase();
  if (normalized.startsWith("uz")) return buildUzNotificationSoundFallbackTerms();
  if (normalized.startsWith("en")) return buildEnNotificationSoundFallbackTerms();
  return buildRuNotificationSoundFallbackTerms();
}

function buildRuNotificationSoundFallbackTerms(): Record<string, string> {
  return {
    "profile.notificationSounds.title": "Мелодии и сигналы",
    "profile.notificationSounds.subtitle": "Выберите мелодию звонка и короткие сигналы для событий Sabi.",
    "profile.notificationSounds.sections.call": "Звонки",
    "profile.notificationSounds.sections.message": "Сообщения",
    "profile.notificationSounds.sections.wallet": "Wallet",
    "profile.notificationSounds.sections.market": "Market",
    "profile.notificationSounds.sections.ai": "AI",
    "profile.notificationSounds.sections.system": "Система",
    "profile.notificationSounds.actions.addCallMp3": "Выбрать MP3 мелодию звонка",
    "profile.notificationSounds.custom.localFile": "Локальный файл • первые 30 секунд",
    "profile.notificationSounds.notes.callMp3Clip": "MP3 применяется только к входящим звонкам Sabi. Используется 30-секундный фрагмент; остальные сигналы MP3 не используют.",
    "profile.notificationSounds.notes.signalsBundledOnly": "Для сигналов применяются только встроенные короткие звуки. MP3 здесь не используется.",
    "profile.notificationSounds.errors.addTitle": "Звук не добавлен",
    "profile.notificationSounds.errors.addMessage": "Не удалось импортировать этот аудиофайл.",
    "profile.notificationSounds.errors.onlyMp3": "Для мелодии звонка можно выбрать только MP3-файл.",
    "profile.notificationSounds.errors.saveMessage": "Не удалось сохранить выбранную мелодию или сигнал.",
    "profile.notificationSounds.options.call_neon.title": "Neon",
    "profile.notificationSounds.options.call_neon.description": "Современная мелодия звонка",
    "profile.notificationSounds.options.call_premium.title": "Premium",
    "profile.notificationSounds.options.call_premium.description": "Премиальная мелодия звонка",
    "profile.notificationSounds.options.call_soft.title": "Soft",
    "profile.notificationSounds.options.call_soft.description": "Мягкая мелодия звонка",
    "profile.notificationSounds.options.call_digital.title": "Digital",
    "profile.notificationSounds.options.call_digital.description": "Цифровая мелодия звонка",
    "profile.notificationSounds.options.call_skyline.title": "Skyline",
    "profile.notificationSounds.options.call_skyline.description": "Яркая мелодия звонка",
    "profile.notificationSounds.options.call_ocean.title": "Ocean",
    "profile.notificationSounds.options.call_ocean.description": "Спокойная мелодия звонка",
    "profile.notificationSounds.options.call_crystal.title": "Crystal",
    "profile.notificationSounds.options.call_crystal.description": "Чистая мелодия звонка",
    "profile.notificationSounds.options.call_lux.title": "Lux",
    "profile.notificationSounds.options.call_lux.description": "Богатая мелодия звонка",
    "profile.notificationSounds.options.call_night.title": "Night",
    "profile.notificationSounds.options.call_night.description": "Ночная мелодия звонка",
    "profile.notificationSounds.options.call_minimal.title": "Minimal",
    "profile.notificationSounds.options.call_minimal.description": "Минимальная мелодия звонка",
    "profile.notificationSounds.options.msg_clean.title": "Clean",
    "profile.notificationSounds.options.msg_clean.description": "Короткий сигнал сообщения",
    "profile.notificationSounds.options.msg_soft.title": "Soft",
    "profile.notificationSounds.options.msg_soft.description": "Мягкий сигнал сообщения",
    "profile.notificationSounds.options.msg_glass.title": "Glass",
    "profile.notificationSounds.options.msg_glass.description": "Стеклянный сигнал сообщения",
    "profile.notificationSounds.options.msg_pop.title": "Pop",
    "profile.notificationSounds.options.msg_pop.description": "Короткий pop-сигнал",
    "profile.notificationSounds.options.msg_air.title": "Air",
    "profile.notificationSounds.options.msg_air.description": "Лёгкий сигнал сообщения",
    "profile.notificationSounds.options.msg_pixel.title": "Pixel",
    "profile.notificationSounds.options.msg_pixel.description": "Pixel-сигнал сообщения",
    "profile.notificationSounds.options.msg_drop.title": "Drop",
    "profile.notificationSounds.options.msg_drop.description": "Короткий drop-сигнал",
    "profile.notificationSounds.options.msg_bell.title": "Bell",
    "profile.notificationSounds.options.msg_bell.description": "Колокольчик",
    "profile.notificationSounds.options.msg_swipe.title": "Swipe",
    "profile.notificationSounds.options.msg_swipe.description": "Swipe-сигнал",
    "profile.notificationSounds.options.msg_tap.title": "Tap",
    "profile.notificationSounds.options.msg_tap.description": "Tap-сигнал",
    "profile.notificationSounds.options.wallet_confirm.title": "Wallet Confirm",
    "profile.notificationSounds.options.wallet_confirm.description": "Сигнал подтверждения Wallet",
    "profile.notificationSounds.options.wallet_alert.title": "Wallet Alert",
    "profile.notificationSounds.options.wallet_alert.description": "Сигнал Wallet-уведомления",
    "profile.notificationSounds.options.market_alert.title": "Market Alert",
    "profile.notificationSounds.options.market_alert.description": "Сигнал Market-уведомления",
    "profile.notificationSounds.options.market_soft.title": "Market Soft",
    "profile.notificationSounds.options.market_soft.description": "Мягкий Market-сигнал",
    "profile.notificationSounds.options.ai_ping.title": "AI Ping",
    "profile.notificationSounds.options.ai_ping.description": "Короткий AI-сигнал",
    "profile.notificationSounds.options.ai_soft.title": "AI Soft",
    "profile.notificationSounds.options.ai_soft.description": "Мягкий AI-сигнал",
    "profile.notificationSounds.options.system_notice.title": "System Notice",
    "profile.notificationSounds.options.system_notice.description": "Системный сигнал",
    "profile.notificationSounds.options.system_soft.title": "System Soft",
    "profile.notificationSounds.options.system_soft.description": "Мягкий системный сигнал",
  };
}

function buildUzNotificationSoundFallbackTerms(): Record<string, string> {
  return {
    "profile.notificationSounds.title": "Musiqa va signallar",
    "profile.notificationSounds.subtitle": "Qo‘ng‘iroq musiqasi va Sabi hodisalari uchun qisqa signallarni tanlang.",
    "profile.notificationSounds.sections.call": "Qo‘ng‘iroqlar",
    "profile.notificationSounds.sections.message": "Xabarlar",
    "profile.notificationSounds.sections.wallet": "Wallet",
    "profile.notificationSounds.sections.market": "Market",
    "profile.notificationSounds.sections.ai": "AI",
    "profile.notificationSounds.sections.system": "Tizim",
    "profile.notificationSounds.actions.addCallMp3": "Qo‘ng‘iroq MP3 musiqasini tanlash",
    "profile.notificationSounds.custom.localFile": "Lokal fayl • dastlabki 30 soniya",
    "profile.notificationSounds.notes.callMp3Clip": "MP3 faqat Sabi kiruvchi qo‘ng‘iroqlariga qo‘llanadi. 30 soniyalik parcha ishlatiladi; boshqa signallar MP3 ishlatmaydi.",
    "profile.notificationSounds.notes.signalsBundledOnly": "Signallar uchun faqat ichki qisqa tovushlar ishlatiladi. Bu yerda MP3 ishlatilmaydi.",
    "profile.notificationSounds.errors.addTitle": "Tovush qo‘shilmadi",
    "profile.notificationSounds.errors.addMessage": "Bu audiofaylni import qilib bo‘lmadi.",
    "profile.notificationSounds.errors.onlyMp3": "Qo‘ng‘iroq musiqasi uchun faqat MP3-fayl tanlash mumkin.",
    "profile.notificationSounds.errors.saveMessage": "Tanlangan musiqa yoki signalni saqlab bo‘lmadi.",
    ...buildCommonSoundOptionTerms("uz"),
  };
}

function buildEnNotificationSoundFallbackTerms(): Record<string, string> {
  return {
    "profile.notificationSounds.title": "Melodies and signals",
    "profile.notificationSounds.subtitle": "Choose a call ringtone and short signals for Sabi events.",
    "profile.notificationSounds.sections.call": "Calls",
    "profile.notificationSounds.sections.message": "Messages",
    "profile.notificationSounds.sections.wallet": "Wallet",
    "profile.notificationSounds.sections.market": "Market",
    "profile.notificationSounds.sections.ai": "AI",
    "profile.notificationSounds.sections.system": "System",
    "profile.notificationSounds.actions.addCallMp3": "Choose call MP3 ringtone",
    "profile.notificationSounds.custom.localFile": "Local file • first 30 seconds",
    "profile.notificationSounds.notes.callMp3Clip": "MP3 applies only to incoming Sabi calls. A 30-second fragment is used; other signals do not use MP3.",
    "profile.notificationSounds.notes.signalsBundledOnly": "Signals use only bundled short sounds. MP3 is not used here.",
    "profile.notificationSounds.errors.addTitle": "Sound was not added",
    "profile.notificationSounds.errors.addMessage": "This audio file could not be imported.",
    "profile.notificationSounds.errors.onlyMp3": "Only MP3 files can be selected for call ringtone.",
    "profile.notificationSounds.errors.saveMessage": "Could not save the selected melody or signal.",
    ...buildCommonSoundOptionTerms("en"),
  };
}

function buildCommonSoundOptionTerms(language: "uz" | "en"): Record<string, string> {
  const callDescription = language === "uz" ? "Qo‘ng‘iroq musiqasi" : "Call ringtone";
  const messageDescription = language === "uz" ? "Qisqa xabar signali" : "Short message signal";
  const serviceDescription = language === "uz" ? "Qisqa servis signali" : "Short service signal";
  return {
    "profile.notificationSounds.options.call_neon.title": "Neon",
    "profile.notificationSounds.options.call_neon.description": callDescription,
    "profile.notificationSounds.options.call_premium.title": "Premium",
    "profile.notificationSounds.options.call_premium.description": callDescription,
    "profile.notificationSounds.options.call_soft.title": "Soft",
    "profile.notificationSounds.options.call_soft.description": callDescription,
    "profile.notificationSounds.options.call_digital.title": "Digital",
    "profile.notificationSounds.options.call_digital.description": callDescription,
    "profile.notificationSounds.options.call_skyline.title": "Skyline",
    "profile.notificationSounds.options.call_skyline.description": callDescription,
    "profile.notificationSounds.options.call_ocean.title": "Ocean",
    "profile.notificationSounds.options.call_ocean.description": callDescription,
    "profile.notificationSounds.options.call_crystal.title": "Crystal",
    "profile.notificationSounds.options.call_crystal.description": callDescription,
    "profile.notificationSounds.options.call_lux.title": "Lux",
    "profile.notificationSounds.options.call_lux.description": callDescription,
    "profile.notificationSounds.options.call_night.title": "Night",
    "profile.notificationSounds.options.call_night.description": callDescription,
    "profile.notificationSounds.options.call_minimal.title": "Minimal",
    "profile.notificationSounds.options.call_minimal.description": callDescription,
    "profile.notificationSounds.options.msg_clean.title": "Clean",
    "profile.notificationSounds.options.msg_clean.description": messageDescription,
    "profile.notificationSounds.options.msg_soft.title": "Soft",
    "profile.notificationSounds.options.msg_soft.description": messageDescription,
    "profile.notificationSounds.options.msg_glass.title": "Glass",
    "profile.notificationSounds.options.msg_glass.description": messageDescription,
    "profile.notificationSounds.options.msg_pop.title": "Pop",
    "profile.notificationSounds.options.msg_pop.description": messageDescription,
    "profile.notificationSounds.options.msg_air.title": "Air",
    "profile.notificationSounds.options.msg_air.description": messageDescription,
    "profile.notificationSounds.options.msg_pixel.title": "Pixel",
    "profile.notificationSounds.options.msg_pixel.description": messageDescription,
    "profile.notificationSounds.options.msg_drop.title": "Drop",
    "profile.notificationSounds.options.msg_drop.description": messageDescription,
    "profile.notificationSounds.options.msg_bell.title": "Bell",
    "profile.notificationSounds.options.msg_bell.description": messageDescription,
    "profile.notificationSounds.options.msg_swipe.title": "Swipe",
    "profile.notificationSounds.options.msg_swipe.description": messageDescription,
    "profile.notificationSounds.options.msg_tap.title": "Tap",
    "profile.notificationSounds.options.msg_tap.description": messageDescription,
    "profile.notificationSounds.options.wallet_confirm.title": "Wallet Confirm",
    "profile.notificationSounds.options.wallet_confirm.description": serviceDescription,
    "profile.notificationSounds.options.wallet_alert.title": "Wallet Alert",
    "profile.notificationSounds.options.wallet_alert.description": serviceDescription,
    "profile.notificationSounds.options.market_alert.title": "Market Alert",
    "profile.notificationSounds.options.market_alert.description": serviceDescription,
    "profile.notificationSounds.options.market_soft.title": "Market Soft",
    "profile.notificationSounds.options.market_soft.description": serviceDescription,
    "profile.notificationSounds.options.ai_ping.title": "AI Ping",
    "profile.notificationSounds.options.ai_ping.description": serviceDescription,
    "profile.notificationSounds.options.ai_soft.title": "AI Soft",
    "profile.notificationSounds.options.ai_soft.description": serviceDescription,
    "profile.notificationSounds.options.system_notice.title": "System Notice",
    "profile.notificationSounds.options.system_notice.description": serviceDescription,
    "profile.notificationSounds.options.system_soft.title": "System Soft",
    "profile.notificationSounds.options.system_soft.description": serviceDescription,
  };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FB" },
  header: {
    minHeight: 82,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 4, fontSize: 12, fontWeight: "600", color: "#6B7280" },
  content: { padding: 18, paddingBottom: 40, gap: 18 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  card: { borderRadius: 22, overflow: "hidden", backgroundColor: "#FFFFFF" },
  row: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  rowActive: { backgroundColor: "#EEF4FF" },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15, fontWeight: "900", color: "#111827" },
  rowDescription: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  checkCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  addButton: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addButtonText: { fontSize: 14, fontWeight: "900", color: "#111827" },
  customRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  customChoose: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    paddingHorizontal: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});
