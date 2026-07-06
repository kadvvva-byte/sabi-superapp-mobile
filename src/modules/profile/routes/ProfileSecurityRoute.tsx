import React, { useCallback } from "react";
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
import {
  ChevronRight,
  Fingerprint,
  KeyRound,
  Lock,
  Shield,
  Smartphone,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";

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

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

export default function SecurityScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { facade, security, phoneChange, emailChange } = useProfileKernel();

  const biometricEnabled = security.biometricEnabled;
  const appPinEnabled = security.appPinEnabled;
  const twoFactorEnabled = security.twoFactorEnabled;
  const trustedDeviceAlerts = security.trustedDeviceAlerts;
  const suspiciousLoginAlerts = security.suspiciousLoginAlerts;
  const sensitiveActionConfirmation = security.sensitiveActionConfirmation;
  const faceIdForPhoneChange = security.faceIdForPhoneChange;
  const faceIdForEmailChange = security.faceIdForEmailChange;
  const fallbackPinEnabled = security.fallbackPinEnabled;

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

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.fixedButtonsRow}>
            <Pressable
              onPress={() => router.replace("/profile")}
              style={styles.topIconButton}
            >
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
                {t("profile.securityScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.securityScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.securityScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                title={t("profile.securityScreen.metrics.biometric")}
                value={biometricEnabled ? t("common.on") : t("common.off")}
                accent={GREEN}
              />
              <MetricCard
                title={t("profile.securityScreen.metrics.appPin")}
                value={appPinEnabled ? t("common.on") : t("common.off")}
                accent={BLUE}
              />
              <MetricCard
                title={t("profile.securityScreen.metrics.twoFactor")}
                value={twoFactorEnabled ? t("common.on") : t("common.off")}
                accent={PURPLE}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.securityScreen.sections.mainProtection")}
              </Text>
              <View style={styles.groupCard}>
                <ToggleRow
                  icon={<Fingerprint size={18} color={GREEN} strokeWidth={2.4} />}
                  title={t("profile.securityScreen.mainProtection.biometric.title")}
                  description={t(
                    "profile.securityScreen.mainProtection.biometric.description",
                  )}
                  value={biometricEnabled}
                  onChange={(value) => { void facade.updateSecurity({ biometricEnabled: value }); }}
                />
                <ToggleRow
                  icon={<KeyRound size={18} color={BLUE} strokeWidth={2.4} />}
                  title={t("profile.securityScreen.mainProtection.appPin.title")}
                  description={t(
                    "profile.securityScreen.mainProtection.appPin.description",
                  )}
                  value={appPinEnabled}
                  onChange={(value) => { void facade.updateSecurity({ appPinEnabled: value }); }}
                />
                <ToggleRow
                  icon={<Shield size={18} color={PURPLE} strokeWidth={2.4} />}
                  title={t("profile.securityScreen.mainProtection.twoFactor.title")}
                  description={t(
                    "profile.securityScreen.mainProtection.twoFactor.description",
                  )}
                  value={twoFactorEnabled}
                  onChange={(value) => { void facade.updateSecurity({ twoFactorEnabled: value }); }}
                  last
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.securityScreen.sections.sensitiveActions")}
              </Text>
              <View style={styles.groupCard}>
                <ToggleRow
                  icon={<Lock size={18} color={GOLD} strokeWidth={2.4} />}
                  title={t(
                    "profile.securityScreen.sensitiveActions.confirmation.title",
                  )}
                  description={t(
                    "profile.securityScreen.sensitiveActions.confirmation.description",
                  )}
                  value={sensitiveActionConfirmation}
                  onChange={(value) => { void facade.updateSecurity({ sensitiveActionConfirmation: value }); }}
                />
                <ToggleRow
                  icon={<Smartphone size={18} color={GREEN} strokeWidth={2.4} />}
                  title={t(
                    "profile.securityScreen.sensitiveActions.trustedAlerts.title",
                  )}
                  description={t(
                    "profile.securityScreen.sensitiveActions.trustedAlerts.description",
                  )}
                  value={trustedDeviceAlerts}
                  onChange={(value) => { void facade.updateSecurity({ trustedDeviceAlerts: value }); }}
                />
                <ToggleRow
                  icon={<Shield size={18} color={BLUE} strokeWidth={2.4} />}
                  title={t(
                    "profile.securityScreen.sensitiveActions.suspiciousAlerts.title",
                  )}
                  description={t(
                    "profile.securityScreen.sensitiveActions.suspiciousAlerts.description",
                  )}
                  value={suspiciousLoginAlerts}
                  onChange={(value) => { void facade.updateSecurity({ suspiciousLoginAlerts: value }); }}
                  last
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.securityScreen.sections.identityChangeProtection")}
              </Text>
              <View style={styles.groupCard}>
                <ToggleRow
                  icon={<Fingerprint size={18} color={GREEN} strokeWidth={2.4} />}
                  title={t(
                    "profile.securityScreen.identityChange.phoneFaceId.title",
                  )}
                  description={t(
                    "profile.securityScreen.identityChange.phoneFaceId.description",
                  )}
                  value={faceIdForPhoneChange}
                  onChange={(value) => { void facade.updateSecurity({ faceIdForPhoneChange: value }); }}
                />
                <ToggleRow
                  icon={<Fingerprint size={18} color={PURPLE} strokeWidth={2.4} />}
                  title={t(
                    "profile.securityScreen.identityChange.emailFaceId.title",
                  )}
                  description={t(
                    "profile.securityScreen.identityChange.emailFaceId.description",
                  )}
                  value={faceIdForEmailChange}
                  onChange={(value) => { void facade.updateSecurity({ faceIdForEmailChange: value }); }}
                />
                <ToggleRow
                  icon={<KeyRound size={18} color={GOLD} strokeWidth={2.4} />}
                  title={t(
                    "profile.securityScreen.identityChange.fallbackPin.title",
                  )}
                  description={t(
                    "profile.securityScreen.identityChange.fallbackPin.description",
                  )}
                  value={fallbackPinEnabled}
                  onChange={(value) => { void facade.updateSecurity({ fallbackPinEnabled: value }); }}
                  last
                />
              </View>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>
                {t("profile.securityScreen.phoneFlow.title")}
              </Text>
              <Text style={styles.noteText}>
                {t("profile.securityScreen.phoneFlow.currentPhone", {
                  value: phoneChange.currentPhone,
                })}
              </Text>
              <Text style={styles.noteTextMuted}>
                {t("profile.securityScreen.phoneFlow.oldVerification", {
                  value: phoneChange.requiresOldPhoneVerification
                    ? t("profile.securityScreen.common.required")
                    : t("profile.securityScreen.common.notRequired"),
                })}
                {"\n"}
                {t("profile.securityScreen.phoneFlow.newVerification", {
                  value: phoneChange.requiresNewPhoneVerification
                    ? t("profile.securityScreen.common.required")
                    : t("profile.securityScreen.common.notRequired"),
                })}
              </Text>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>
                {t("profile.securityScreen.emailFlow.title")}
              </Text>
              <Text style={styles.noteText}>
                {t("profile.securityScreen.emailFlow.currentEmail", {
                  value: emailChange.currentEmail,
                })}
              </Text>
              <Text style={styles.noteTextMuted}>
                {t("profile.securityScreen.emailFlow.currentVerification", {
                  value: emailChange.requiresCurrentEmailVerification
                    ? t("profile.securityScreen.common.required")
                    : t("profile.securityScreen.common.notRequired"),
                })}
                {"\n"}
                {t("profile.securityScreen.emailFlow.newVerification", {
                  value: emailChange.requiresNewEmailVerification
                    ? t("profile.securityScreen.common.required")
                    : t("profile.securityScreen.common.notRequired"),
                })}
              </Text>
            </View>

            <Pressable
              style={styles.linkCard}
              onPress={() => router.push("/profile/devices")}
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconWrap}>
                  <Smartphone size={18} color={BLUE} strokeWidth={2.4} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle}>
                    {t("profile.securityScreen.links.devices.title")}
                  </Text>
                  <Text style={styles.linkDescription}>
                    {t("profile.securityScreen.links.devices.description")}
                  </Text>
                </View>
              </View>

              <ChevronRight size={18} color={MUTED} strokeWidth={2.4} />
            </Pressable>
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
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  value,
  onChange,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.rowWrap, !last && styles.rowBorder]}>
      <View style={styles.rowTop}>
        <View style={styles.rowLeft}>
          <View style={styles.rowIconWrap}>{icon}</View>
          <Text style={styles.rowTitle}>{title}</Text>
        </View>

        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: "rgba(255,255,255,0.18)", true: GREEN }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="rgba(255,255,255,0.18)"
        />
      </View>

      <Text style={styles.rowDescription}>{description}</Text>
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
    backgroundColor: "rgba(108,255,180,0.10)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    bottom: -60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(99,168,255,0.08)",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
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
    borderColor: "rgba(121,228,162,0.18)",
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

  section: {
    gap: 10,
  },

  sectionTitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  groupCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
  },

  rowWrap: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: CARD_SOFT,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  rowTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  rowDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 8,
    paddingLeft: 52,
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
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  noteTextMuted: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 8,
  },

  linkCard: {
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  linkIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  linkTextWrap: {
    flex: 1,
  },

  linkTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  linkDescription: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 4,
  },
});