import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bell, MoonStar, ShieldCheck, Volume2 } from "lucide-react-native";

import { DEFAULT_NOTIFICATION_PREFERENCES } from "../src/modules/notifications/data/notifications";
import type {
  NotificationModulePreference,
  NotificationPreferences,
} from "../src/modules/notifications/types";
import {
  normalizeRuntimeLanguage,
  pickRuntimeDictionary,
  useRuntimeLanguage,
} from "../src/shared/i18n/runtime-language";
import { openSabiHome } from "../src/modules/home/navigation/homeRoutes";

const BG_TOP = "#05140D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const CARD = "rgba(16, 31, 48, 0.82)";
const CARD_SOFT = "rgba(26, 44, 64, 0.82)";
const CARD_BORDER = "rgba(120, 220, 160, 0.12)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const GREEN = "#77E28C";
const BLUE = "#63A8FF";
const PURPLE = "#B588FF";
const GOLD = "#FFCC66";
const TEAL = "#58D5C9";

const SABI_NOTIFICATION_PREFERENCES_STORAGE_KEY = "sabi.notification.preferences.v1";

function mergeNotificationPreferences(saved: unknown): NotificationPreferences {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(saved as Partial<NotificationPreferences>),
  };
}

async function loadStoredNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(SABI_NOTIFICATION_PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    return mergeNotificationPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

async function saveStoredNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SABI_NOTIFICATION_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // Notification settings must never crash the screen.
  }
}


const UI_TEXT = {
  en: {
    inbox: "Inbox",
    home: "Home",
    title: "Notification Preferences",
    modulesEnabled: "Modules",
    quietMode: "Quiet",
    channelsOn: "Channels",
    on: "ON",
    off: "OFF",
    globalBehavior: "Global",
    quietModeTitle: "Quiet mode",
    start: "Start",
    end: "End",
    criticalBypassTitle: "Critical bypass",
    lockTitle: "Lock screen",
    groupTitle: "Group by module",
    autoReadTitle: "Auto mark read",
    modules: "Modules",
    criticalOnlyTitle: "Critical only",
    channels: {
      inApp: "In-app",
      push: "Push",
      email: "Email",
      sms: "SMS",
      sound: "Sound",
      vibration: "Vibration",
      preview: "Preview",
    },
    moduleTexts: {
      wallet: "Wallet",
      business: "Business",
      merchant: "Merchant",
      messenger: "Messenger",
      marketplace: "Marketplace",
      ai: "AI",
      system: "System",
      security: "Security",
      stream: "Stream",
      balance: "Balance",
    },
  },
  ru: {
    inbox: "Входящие",
    home: "Домой",
    title: "Настройки уведомлений",
    modulesEnabled: "Модули",
    quietMode: "Тихо",
    channelsOn: "Каналы",
    on: "ВКЛ",
    off: "ВЫКЛ",
    globalBehavior: "Общие настройки",
    quietModeTitle: "Тихий режим",
    start: "Начало",
    end: "Конец",
    criticalBypassTitle: "Критические уведомления обходят тихий режим",
    lockTitle: "Экран блокировки",
    groupTitle: "Группировать по модулю",
    autoReadTitle: "Автоматически отмечать прочитанным",
    modules: "Модули",
    criticalOnlyTitle: "Только критические",
    channels: {
      inApp: "В приложении",
      push: "Push",
      email: "Email",
      sms: "SMS",
      sound: "Звук",
      vibration: "Вибрация",
      preview: "Превью",
    },
    moduleTexts: {
      wallet: "Wallet",
      business: "Business",
      merchant: "Merchant",
      messenger: "Messenger",
      marketplace: "Marketplace",
      ai: "AI",
      system: "Система",
      security: "Безопасность",
      stream: "Stream",
      balance: "Баланс",
    },
  },
  uz: {
    inbox: "Kiruvchi",
    home: "Bosh sahifa",
    title: "Bildirishnoma sozlamalari",
    modulesEnabled: "Modullar",
    quietMode: "Tinch",
    channelsOn: "Kanallar",
    on: "YOQ",
    off: "O‘CHIQ",
    globalBehavior: "Global",
    quietModeTitle: "Tinch rejim",
    start: "Boshlanish",
    end: "Tugash",
    criticalBypassTitle: "Muhim chetlab o‘tadi",
    lockTitle: "Qulf ekrani",
    groupTitle: "Modul bo‘yicha",
    autoReadTitle: "Avto o‘qilgan",
    modules: "Modullar",
    criticalOnlyTitle: "Faqat muhim",
    channels: {
      inApp: "Ilovada",
      push: "Push",
      email: "Email",
      sms: "SMS",
      sound: "Ovoz",
      vibration: "Vibratsiya",
      preview: "Ko‘rinish",
    },
    moduleTexts: {
      wallet: "Hamyon",
      business: "Biznes",
      merchant: "Merchant",
      messenger: "Messenger",
      marketplace: "Marketplace",
      ai: "AI",
      system: "Tizim",
      security: "Xavfsizlik",
      stream: "Stream",
      balance: "Balans",
    },
  },
} as const;

function updateModulePreference(
  preferences: NotificationPreferences,
  key: NotificationModulePreference["key"],
  updater: (module: NotificationModulePreference) => NotificationModulePreference,
): NotificationPreferences {
  return {
    ...preferences,
    modules: preferences.modules.map((item) => item.key === key ? updater(item) : item),
  };
}

export default function NotificationPreferencesScreen() {
  const language = useRuntimeLanguage();
  const texts = pickRuntimeDictionary(normalizeRuntimeLanguage(language), UI_TEXT);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [notificationPreferencesHydrated, setNotificationPreferencesHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    void loadStoredNotificationPreferences().then((next) => {
      if (!mounted) return;
      setPreferences(next);
      setNotificationPreferencesHydrated(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!notificationPreferencesHydrated) return;
    void saveStoredNotificationPreferences(preferences);
  }, [notificationPreferencesHydrated, preferences]);

  const enabledModules = useMemo(() => preferences.modules.filter((item) => item.enabled).length, [preferences.modules]);
  const enabledChannels = useMemo(() => preferences.modules.reduce((acc, module) => acc + Object.values(module.channels).filter(Boolean).length, 0), [preferences.modules]);

  const updateTopLevel = <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value, showOnLockScreen: false }));
  };

  const toggleModule = (key: NotificationModulePreference["key"]) => {
    setPreferences((prev) => updateModulePreference(prev, key, (module) => ({ ...module, enabled: !module.enabled })));
  };

  const toggleChannel = (key: NotificationModulePreference["key"], channel: keyof NotificationModulePreference["channels"]) => {
    setPreferences((prev) => updateModulePreference(prev, key, (module) => ({
      ...module,
      channels: { ...module.channels, [channel]: !module.channels[channel] },
    })));
  };

  const toggleCriticalOnly = (key: NotificationModulePreference["key"]) => {
    setPreferences((prev) => updateModulePreference(prev, key, (module) => ({ ...module, criticalOnly: !module.criticalOnly })));
  };

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.fixedButtonsRow}>
            <Pressable onPress={() => router.replace("/notifications" as never)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{texts.inbox}</Text>
            </Pressable>
            <Pressable onPress={() => openSabiHome()} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{texts.home}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.introBlock}>
              <View style={styles.titleRow}>
                <View style={styles.titleIconWrap}>
                  <Bell size={20} color={GREEN} strokeWidth={2.4} />
                </View>
                <Text style={styles.title}>{texts.title}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard title={texts.modulesEnabled} value={`${enabledModules}`} accent={GREEN} />
              <SummaryCard title={texts.quietMode} value={preferences.quietMode ? texts.on : texts.off} accent={PURPLE} />
              <SummaryCard title={texts.channelsOn} value={`${enabledChannels}`} accent={BLUE} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{texts.globalBehavior}</Text>

              <ToggleRow
                icon={<MoonStar size={18} color={PURPLE} strokeWidth={2.4} />}
                title={texts.quietModeTitle}
                value={preferences.quietMode}
                onChange={(v) => updateTopLevel("quietMode", v)}
              />

              <View style={styles.inlineMetaRow}>
                <View style={styles.inlineMetaCard}>
                  <Text style={styles.inlineMetaLabel}>{texts.start}</Text>
                  <Text style={styles.inlineMetaValue}>{preferences.quietModeStart}</Text>
                </View>
                <View style={styles.inlineMetaCard}>
                  <Text style={styles.inlineMetaLabel}>{texts.end}</Text>
                  <Text style={styles.inlineMetaValue}>{preferences.quietModeEnd}</Text>
                </View>
              </View>

              <ToggleRow
                icon={<ShieldCheck size={18} color={GREEN} strokeWidth={2.4} />}
                title={texts.criticalBypassTitle}
                value={preferences.criticalAlertsBypassQuietMode}
                onChange={(v) => updateTopLevel("criticalAlertsBypassQuietMode", v)}
              />
              <ToggleRow
                icon={<Volume2 size={18} color={TEAL} strokeWidth={2.4} />}
                title={texts.groupTitle}
                value={preferences.groupByModule}
                onChange={(v) => updateTopLevel("groupByModule", v)}
              />
              <ToggleRow
                icon={<Bell size={18} color={GOLD} strokeWidth={2.4} />}
                title={texts.autoReadTitle}
                value={preferences.autoMarkReadOnOpen}
                onChange={(v) => updateTopLevel("autoMarkReadOnOpen", v)}
                last
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{texts.modules}</Text>
              {preferences.modules.map((module) => {
                const moduleTitle = texts.moduleTexts[module.key];
                return (
                  <View key={module.key} style={styles.moduleCard}>
                    <View style={styles.moduleTopRow}>
                      <Text style={styles.moduleTitle}>{moduleTitle}</Text>
                      <Switch
                        value={module.enabled}
                        onValueChange={() => toggleModule(module.key)}
                        trackColor={{ false: "rgba(255,255,255,0.18)", true: GREEN }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="rgba(255,255,255,0.18)"
                      />
                    </View>

                    <View style={styles.channelsGrid}>
                      {([
                        ["inApp", texts.channels.inApp],
                        ["push", texts.channels.push],
                        ["email", texts.channels.email],
                        ["sms", texts.channels.sms],
                        ["sound", texts.channels.sound],
                        ["vibration", texts.channels.vibration],
                        ["preview", texts.channels.preview],
                      ] as const).map(([channelKey, label]) => (
                        <Pressable
                          key={`${module.key}-${channelKey}`}
                          onPress={() => toggleChannel(module.key, channelKey)}
                          style={[
                            styles.channelChip,
                            module.channels[channelKey] && styles.channelChipActive,
                            !module.enabled && styles.channelChipDisabled,
                          ]}
                        >
                          <Text style={[styles.channelChipText, module.channels[channelKey] && styles.channelChipTextActive]}>{label}</Text>
                        </Pressable>
                      ))}
                    </View>

                    {module.key === "security" || module.key === "balance" ? (
                      <View style={styles.settingRowCompact}>
                        <Text style={styles.settingTitle}>{texts.criticalOnlyTitle}</Text>
                        <Switch
                          value={!!module.criticalOnly}
                          onValueChange={() => toggleCriticalOnly(module.key)}
                          trackColor={{ false: "rgba(255,255,255,0.18)", true: GREEN }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor="rgba(255,255,255,0.18)"
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SummaryCard({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: accent }]}>{title}</Text>
    </View>
  );
}

function ToggleRow({ icon, title, value, onChange, last }: {
  icon: React.ReactNode;
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.settingRow, !last && styles.settingRowBorder]}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrap}>{icon}</View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "rgba(255,255,255,0.18)", true: GREEN }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="rgba(255,255,255,0.18)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  backgroundOrbTop: { position: "absolute", top: -110, right: -70, width: 240, height: 240, borderRadius: 240, backgroundColor: "rgba(119,226,140,0.13)" },
  backgroundOrbBottom: { position: "absolute", bottom: -120, left: -70, width: 280, height: 280, borderRadius: 280, backgroundColor: "rgba(99,168,255,0.11)" },
  container: { flex: 1, paddingHorizontal: 16 },
  fixedButtonsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, paddingTop: 8, paddingBottom: 10 },
  headerButton: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: CARD_BORDER },
  headerButtonText: { color: TEXT, fontSize: 12, fontWeight: "900" },
  scrollContent: { paddingBottom: 28, gap: 14 },
  introBlock: { borderRadius: 28, padding: 18, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  titleIconWrap: { width: 42, height: 42, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(119,226,140,0.13)", borderWidth: 1, borderColor: "rgba(119,226,140,0.24)" },
  title: { color: TEXT, fontSize: 26, lineHeight: 31, fontWeight: "900", letterSpacing: -0.5, flex: 1 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, minHeight: 78, borderRadius: 22, padding: 14, backgroundColor: CARD_SOFT, borderWidth: 1, borderColor: CARD_BORDER, justifyContent: "center" },
  summaryValue: { color: TEXT, fontSize: 23, fontWeight: "900" },
  summaryLabel: { marginTop: 3, fontSize: 11, fontWeight: "900" },
  section: { borderRadius: 26, padding: 15, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, gap: 10 },
  sectionTitle: { color: TEXT, fontSize: 15, fontWeight: "900", marginBottom: 2 },
  settingRow: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingVertical: 8 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  settingLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11 },
  settingIconWrap: { width: 36, height: 36, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: CARD_BORDER },
  settingTitle: { color: TEXT, fontSize: 14, fontWeight: "900" },
  inlineMetaRow: { flexDirection: "row", gap: 10 },
  inlineMetaCard: { flex: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 11, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: CARD_BORDER },
  inlineMetaLabel: { color: MUTED, fontSize: 11, fontWeight: "800" },
  inlineMetaValue: { color: TEXT, marginTop: 3, fontSize: 15, fontWeight: "900" },
  moduleCard: { borderRadius: 22, padding: 14, backgroundColor: CARD_SOFT, borderWidth: 1, borderColor: CARD_BORDER, gap: 12 },
  moduleTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  moduleTitle: { color: TEXT, fontSize: 15, fontWeight: "900" },
  channelsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  channelChip: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: CARD_BORDER },
  channelChipActive: { backgroundColor: "rgba(119,226,140,0.17)", borderColor: "rgba(119,226,140,0.34)" },
  channelChipDisabled: { opacity: 0.48 },
  channelChipText: { color: MUTED, fontSize: 11, fontWeight: "900" },
  channelChipTextActive: { color: GREEN },
  settingRowCompact: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingTop: 10 },
});


