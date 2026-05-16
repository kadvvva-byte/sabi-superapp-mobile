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

export default function ProfileNotificationSoundsScreen() {
  const i18n = useI18n() as I18nHookValue;
  const [preferences, setPreferences] = useState<SabiSoundPreferences | null>(null);
  const [customSounds, setCustomSounds] = useState<SabiCustomSoundItem[]>([]);

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      if (typeof i18n === "function") return i18n(key, params);
      if (i18n?.t) return i18n.t(key, params);
      return key;
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
