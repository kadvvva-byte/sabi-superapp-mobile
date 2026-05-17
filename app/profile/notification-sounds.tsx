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

import { useI18n } from "../../src/shared/i18n";
import {
  SABI_CALL_SOUND_OPTIONS,
  SABI_MESSAGE_SOUND_OPTIONS,
  SABI_SERVICE_SOUND_OPTIONS,
  type SabiNotificationSoundKind,
  type SabiNotificationSoundOption,
} from "../../src/modules/notifications/sounds/sabiNotificationSounds";
import {
  deleteSabiCustomSound,
  listSabiCustomSounds,
  loadSabiSoundPreferences,
  pickAndSaveSabiCustomSound,
  saveSabiSoundPreference,
  type SabiCustomSoundItem,
  type SabiSoundPreferences,
} from "../../src/modules/notifications/sounds/sabiSoundPreferences";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

const KIND_ORDER: SabiNotificationSoundKind[] = ["call", "message", "wallet", "market", "ai", "system"];

const PROFILE_NOTIFICATION_SOUND_FALLBACKS: Record<string, string> = {
  "profile.notificationSounds.title": "\u041c\u0435\u043b\u043e\u0434\u0438\u0438 \u0438 \u0441\u0438\u0433\u043d\u0430\u043b\u044b",
  "profile.notificationSounds.subtitle": "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0437\u0432\u0443\u043a \u0434\u043b\u044f \u0432\u044b\u0437\u043e\u0432\u043e\u0432, \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439, Wallet, Market, AI \u0438 \u0441\u0438\u0441\u0442\u0435\u043c\u043d\u044b\u0445 \u0441\u043e\u0431\u044b\u0442\u0438\u0439.",
  "profile.notificationSounds.sections.call": "\u0412\u044b\u0437\u043e\u0432\u044b",
  "profile.notificationSounds.sections.message": "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f",
  "profile.notificationSounds.sections.wallet": "Wallet",
  "profile.notificationSounds.sections.market": "Market",
  "profile.notificationSounds.sections.ai": "AI",
  "profile.notificationSounds.sections.system": "\u0421\u0438\u0441\u0442\u0435\u043c\u0430",
  "profile.notificationSounds.actions.addMp3": "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c MP3",
  "profile.notificationSounds.custom.localFile": "\u041b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0439 \u0444\u0430\u0439\u043b",
  "profile.notificationSounds.notes.customMp3": "\u041c\u043e\u0436\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043b\u0438\u0447\u043d\u044b\u0439 MP3-\u0441\u0438\u0433\u043d\u0430\u043b.",
  "profile.notificationSounds.errors.addTitle": "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0437\u0432\u0443\u043a",
  "profile.notificationSounds.errors.addMessage": "\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0444\u0430\u0439\u043b \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.",
};

const PROFILE_NOTIFICATION_SOUND_TITLES: Record<string, string> = {
  call_neon: "Neon",
  call_premium: "Premium",
  call_soft: "Soft",
  call_digital: "Digital",
  call_skyline: "Skyline",
  call_ocean: "Ocean",
  call_crystal: "Crystal",
  call_lux: "Lux",
  call_night: "Night",
  call_minimal: "Minimal",
  msg_clean: "Clean",
  msg_soft: "Soft",
  msg_glass: "Glass",
  msg_pop: "Pop",
};

function fallbackNotificationSoundText(key: string): string {
  const direct = PROFILE_NOTIFICATION_SOUND_FALLBACKS[key];
  if (direct) return direct;

  const match = key.match(/^profile\.notificationSounds\.options\.([^.]+)\.(title|description)$/);
  if (match) {
    const id = match[1] || "";
    const field = match[2] || "";

    if (field === "title") {
      return PROFILE_NOTIFICATION_SOUND_TITLES[id] || id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    }

    if (id.startsWith("call_")) return "\u041c\u0435\u043b\u043e\u0434\u0438\u044f \u0432\u044b\u0437\u043e\u0432\u0430";
    if (id.startsWith("msg_")) return "\u0421\u0438\u0433\u043d\u0430\u043b \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f";
    if (id.startsWith("wallet_")) return "\u0421\u0438\u0433\u043d\u0430\u043b Wallet";
    if (id.startsWith("market_")) return "\u0421\u0438\u0433\u043d\u0430\u043b Market";
    if (id.startsWith("ai_")) return "\u0421\u0438\u0433\u043d\u0430\u043b AI";
    return "\u0421\u0438\u0441\u0442\u0435\u043c\u043d\u044b\u0439 \u0441\u0438\u0433\u043d\u0430\u043b";
  }

  return key;
}

export default function ProfileNotificationSoundsScreen() {
  const i18n = useI18n() as I18nHookValue;
  const [preferences, setPreferences] = useState<SabiSoundPreferences | null>(null);
  const [customSounds, setCustomSounds] = useState<SabiCustomSoundItem[]>([]);

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      const translated =
        typeof i18n === "function"
          ? i18n(key, params)
          : i18n?.t
            ? i18n.t(key, params)
            : key;

      return translated && translated !== key ? translated : fallbackNotificationSoundText(key);
    },
    [i18n],
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
    const next = await saveSabiSoundPreference(option.kind, option.id);
    setPreferences(next);
  }, []);

  const chooseCustom = useCallback(async (item: SabiCustomSoundItem) => {
    const next = await saveSabiSoundPreference(item.kind, item.id);
    setPreferences(next);
  }, []);

  const addCustom = useCallback(
    async (kind: SabiNotificationSoundKind) => {
      try {
        const saved = await pickAndSaveSabiCustomSound(kind);
        if (!saved) return;
        const next = await saveSabiSoundPreference(kind, saved.id);
        setPreferences(next);
        await reload();
      } catch {
        Alert.alert(
          t("profile.notificationSounds.errors.addTitle"),
          t("profile.notificationSounds.errors.addMessage"),
        );
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

      <Pressable style={styles.addButton} onPress={() => props.onAddCustom(props.kind)}>
        <Plus size={18} color="#111827" />
        <Text style={styles.addButtonText}>{props.t("profile.notificationSounds.actions.addMp3")}</Text>
      </Pressable>

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

      <Text style={styles.note}>{props.t("profile.notificationSounds.notes.customMp3")}</Text>
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
