import React, { useCallback, useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronRight,
  Laptop,
  Monitor,
  QrCode,
  Shield,
  Smartphone,
  TimerReset,
} from "lucide-react-native";

import { useI18n } from "@/shared/i18n";
import { useProfileKernel } from "@/core/kernel/profile/bindings";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type DeviceSessionRecord = {
  id: string;
  title: string;
  platform: string;
  location?: string;
  lastSeen?: string;
  trusted?: boolean;
  web?: boolean;
};

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
const TEAL = "#58D5C9";

const SESSION_TIMEOUTS = ["1 week", "1 month", "3 months", "6 months", "1 year"];

function normalizeSessionList(value: unknown): DeviceSessionRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const raw = item as Partial<DeviceSessionRecord>;

      return {
        id: String(raw?.id ?? "").trim(),
        title: String(raw?.title ?? "").trim(),
        platform: String(raw?.platform ?? "").trim(),
        location: raw?.location ? String(raw.location).trim() : "",
        lastSeen: raw?.lastSeen ? String(raw.lastSeen).trim() : "",
        trusted: Boolean(raw?.trusted),
        web: Boolean(raw?.web),
      };
    })
    .filter((item) => item.id && item.title && item.platform);
}

function buildCurrentDeviceTitle() {
  if (Platform.OS === "ios") return "Current iOS device";
  if (Platform.OS === "android") return "Current Android device";
  if (Platform.OS === "web") return "Current web session";
  return "Current device";
}

function buildCurrentDevicePlatform() {
  const version =
    typeof Platform.Version === "string" || typeof Platform.Version === "number"
      ? String(Platform.Version)
      : "";

  if (Platform.OS === "ios") {
    return version ? `iOS • ${version}` : "iOS";
  }

  if (Platform.OS === "android") {
    return version ? `Android • ${version}` : "Android";
  }

  if (Platform.OS === "web") {
    return "Web";
  }

  return "Unknown platform";
}

export default function DevicesScreen() {
  const i18n = useI18n() as I18nHookValue;

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      if (typeof i18n === "function") {
        const value = i18n(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      if (i18n && typeof i18n.t === "function") {
        const value = i18n.t(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      return key;
    },
    [i18n],
  );

  const tt = useCallback(
    (key: string, fallback: string, params?: Record<string, unknown>) => {
      const value = t(key, params);
      return value === key ? fallback : value;
    },
    [t],
  );

  const { facade, devices, isReady } = useProfileKernel();
  const sessionTimeout = devices.sessionTimeout;
  const sessions = useMemo(() => normalizeSessionList(devices.sessions), [devices.sessions]);

  const currentDevice = useMemo(
    () => ({
      title: tt("profile.devicesScreen.current.title", buildCurrentDeviceTitle()),
      platform: buildCurrentDevicePlatform(),
      lastSeen: tt("profile.devicesScreen.current.now", "Now"),
      trusted: true,
    }),
    [tt],
  );

  const trustedCount = useMemo(() => {
    return sessions.filter((item) => item.trusted).length + 1;
  }, [sessions]);

  const allSessionsCount = useMemo(() => sessions.length + 1, [sessions]);

  const revokeSession = useCallback(async (id: string) => { await facade.revokeDeviceSession(id); }, [facade]);

  const endAllOtherSessions = useCallback(async () => { await facade.endAllOtherSessions(); }, [facade]);

  const handleTimeoutChange = useCallback(async (value: string) => { await facade.updateSessionTimeout(value); }, [facade]);

  const connectDevice = useCallback(() => {
    router.push("/profile/qr" as never);
  }, []);

  if (!isReady) {
    return (
      <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
          <View style={styles.container}>
            <View style={styles.loadingWrap}>
              <Text style={styles.loadingText}>
                {tt("profile.devicesScreen.loading", "Qurilmalar yuklanmoqda...")}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.fixedButtonsRow}>
            <Pressable onPress={() => router.back()} style={styles.topIconButton}>
              <ChevronRight
                size={18}
                color={TEXT}
                strokeWidth={2.4}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>
                {tt("profile.devicesScreen.intro.eyebrow", "DEVICE CENTER")}
              </Text>
              <Text style={styles.title}>
                {tt("profile.devicesScreen.intro.title", "Qurilmalar va sessiyalar")}
              </Text>
              <Text style={styles.subtitle}>
                {tt(
                  "profile.devicesScreen.intro.subtitle",
                  "Faol sessiyalar, ishonchli qurilmalar, QR kirish va avtomatik tugash qoidalarini boshqaring.",
                )}
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                title={tt("profile.devicesScreen.metrics.allSessions", "All sessions")}
                value={`${allSessionsCount}`}
                accent={BLUE}
              />
              <MetricCard
                title={tt("profile.devicesScreen.metrics.trusted", "Trusted")}
                value={`${trustedCount}`}
                accent={GREEN}
              />
              <MetricCard
                title={tt("profile.devicesScreen.metrics.timeout", "Timeout")}
                value={sessionTimeout}
                accent={PURPLE}
                compact
              />
            </View>

            <View style={styles.connectCard}>
              <View style={styles.connectIllustration}>
                <Laptop size={48} color={BLUE} strokeWidth={1.8} />
              </View>

              <Text style={styles.connectTitle}>
                {tt("profile.devicesScreen.connect.title", "Qurilma ulash")}
              </Text>
              <Text style={styles.connectText}>
                {tt(
                  "profile.devicesScreen.connect.description",
                  "QR orqali kirish va tasdiqlangan qurilmalarni boshqarish uchun profile QR bo‘limini oching.",
                )}
              </Text>

              <Pressable style={styles.connectButton} onPress={connectDevice}>
                <QrCode size={18} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.connectButtonText}>
                  {tt("profile.devicesScreen.connect.action", "Qurilma ulash")}
                </Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {tt("profile.devicesScreen.sections.thisDevice", "This device")}
              </Text>

              <View style={styles.groupCard}>
                <View style={styles.deviceRow}>
                  <View style={styles.deviceIconWrap}>
                    {Platform.OS === "web" ? (
                      <Monitor size={20} color={BLUE} strokeWidth={2.4} />
                    ) : (
                      <Smartphone size={20} color={BLUE} strokeWidth={2.4} />
                    )}
                  </View>

                  <View style={styles.deviceTextWrap}>
                    <Text style={styles.deviceTitle}>{currentDevice.title}</Text>
                    <Text style={styles.deviceMeta}>{currentDevice.platform}</Text>
                    <Text style={styles.deviceMeta}>{currentDevice.lastSeen}</Text>
                  </View>

                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>
                      {tt("profile.devicesScreen.badges.live", "Jonli")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {tt("profile.devicesScreen.sections.otherSessions", "Other sessions")}
                </Text>

                {sessions.length ? (
                  <Pressable onPress={endAllOtherSessions} style={styles.endAllButton}>
                    <TimerReset size={14} color={TEXT} strokeWidth={2.4} />
                    <Text style={styles.endAllButtonText}>
                      {tt("profile.devicesScreen.endAllAction", "Barchasini tugatish")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.groupCard}>
                {sessions.length ? (
                  sessions.map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.deviceRow,
                        index !== sessions.length - 1 && styles.rowBorder,
                      ]}
                    >
                      <View style={styles.deviceIconWrap}>
                        {item.web ? (
                          <Monitor size={20} color={GREEN} strokeWidth={2.4} />
                        ) : (
                          <Smartphone size={20} color={BLUE} strokeWidth={2.4} />
                        )}
                      </View>

                      <View style={styles.deviceTextWrap}>
                        <View style={styles.deviceTitleRow}>
                          <Text style={styles.deviceTitle}>{item.title}</Text>
                          {item.trusted ? (
                            <View style={styles.trustedBadge}>
                              <Shield size={12} color={GREEN} strokeWidth={2.4} />
                              <Text style={styles.trustedBadgeText}>
                                {tt("profile.devicesScreen.badges.trusted", "Ishonchli")}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.deviceMeta}>{item.platform}</Text>

                        {!!item.location || !!item.lastSeen ? (
                          <Text style={styles.deviceMeta}>
                            {[item.location, item.lastSeen].filter(Boolean).join(" • ")}
                          </Text>
                        ) : null}
                      </View>

                      <Pressable
                        style={styles.revokeButton}
                        onPress={() => void revokeSession(item.id)}
                      >
                        <Text style={styles.revokeButtonText}>
                          {tt("profile.devicesScreen.revokeAction", "Bekor qilish")}
                        </Text>
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>
                      {tt(
                        "profile.devicesScreen.empty.title",
                        "Boshqa faol sessiyalar topilmadi",
                      )}
                    </Text>
                    <Text style={styles.emptyStateText}>
                      {tt(
                        "profile.devicesScreen.empty.description",
                        "Hozircha bu akkauntga bog‘langan qo‘shimcha sessiyalar yo‘q.",
                      )}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {tt(
                  "profile.devicesScreen.sections.autoEnd",
                  "Automatically end sessions",
                )}
              </Text>

              <View style={styles.groupCard}>
                {SESSION_TIMEOUTS.map((item, index) => {
                  const active = item === sessionTimeout;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => void handleTimeoutChange(item)}
                      style={[
                        styles.timeoutRow,
                        index !== SESSION_TIMEOUTS.length - 1 && styles.rowBorder,
                      ]}
                    >
                      <Text style={styles.timeoutText}>
                        {tt(`profile.devicesScreen.timeouts.${item.replace(/\s+/g, "")}`, item)}
                      </Text>

                      {active ? (
                        <View style={styles.activePill}>
                          <Text style={styles.activePillText}>
                            {tt("profile.devicesScreen.selectedBadge", "Tanlangan")}
                          </Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>
                {tt("profile.devicesScreen.notes.safety.title", "Sessiya xavfsizligi")}
              </Text>
              <Text style={styles.noteText}>
                {tt(
                  "profile.devicesScreen.notes.safety.description",
                  "Bu bo‘limda faqat real joriy qurilma va saqlangan sessiyalar ko‘rsatiladi.",
                )}
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetricCard({
  title,
  value,
  accent,
  compact,
}: {
  title: string;
  value: string;
  accent: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text
        numberOfLines={1}
        style={[
          styles.metricValue,
          compact && styles.metricValueCompact,
          { color: accent },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },

  backgroundOrbTop: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(108, 255, 180, 0.10)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    bottom: -60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(99, 168, 255, 0.08)",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
  },

  fixedButtonsRow: {
    position: "absolute",
    top: 6,
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  topIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121, 228, 162, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingTop: 62,
    paddingBottom: 36,
    gap: 16,
  },

  introBlock: {
    paddingTop: 6,
    paddingBottom: 2,
  },

  eyebrow: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  title: {
    color: TEXT,
    fontSize: 30,
    fontWeight: "900",
  },

  subtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    fontWeight: "600",
  },

  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },

  metricCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  metricTitle: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  metricValueCompact: {
    fontSize: 13,
  },

  connectCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 18,
    alignItems: "center",
  },

  connectIllustration: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: "rgba(99,168,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  connectTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  connectText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 420,
  },

  connectButton: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "rgba(99,168,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(99,168,255,0.28)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  section: {
    gap: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  sectionTitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  endAllButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  endAllButtonText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
  },

  groupCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
  },

  deviceRow: {
    minHeight: 88,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: CARD_SOFT,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  deviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  deviceTextWrap: {
    flex: 1,
    gap: 4,
  },

  deviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  deviceTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  deviceMeta: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  liveBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(119,226,140,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  liveBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  trustedBadge: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(119,226,140,0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  trustedBadgeText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  revokeButton: {
    minWidth: 84,
    minHeight: 36,
    borderRadius: 12,
    backgroundColor: "rgba(82,18,30,0.70)",
    borderWidth: 1,
    borderColor: "rgba(255,110,110,0.16)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  revokeButtonText: {
    color: "#FFD7D7",
    fontSize: 12,
    fontWeight: "900",
  },

  emptyState: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: CARD_SOFT,
  },

  emptyStateTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },

  emptyStateText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 6,
  },

  timeoutRow: {
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD_SOFT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  timeoutText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "700",
  },

  activePill: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(181,136,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  activePillText: {
    color: "#F3E8FF",
    fontSize: 11,
    fontWeight: "900",
  },

  noteCard: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },

  noteTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  noteText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
});