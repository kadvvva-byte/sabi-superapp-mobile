import React, { useCallback } from "react";
import {
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
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  FileBadge,
  MailCheck,
  MapPin,
  ScanFace,
  Shield,
  Smartphone,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import {
  PROFILE_KYC_STATE,
  PROFILE_VERIFICATION_DOCUMENTS,
} from "../data/profile";
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

type KycStatus = "verified" | "pending" | "review" | "limited" | "rejected" | string;
type DocStatus = "approved" | "pending" | "review" | string;

type VerificationDocument = {
  id: string;
  title: string;
  updatedAt: string;
  status: DocStatus;
};

function normalizeKeyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getStatusColor(status: KycStatus) {
  switch (status) {
    case "verified":
      return GREEN;
    case "pending":
      return GOLD;
    case "review":
      return PURPLE;
    case "limited":
      return "#FF8A66";
    case "rejected":
      return "#FF6B6B";
    default:
      return MUTED;
  }
}

function getDocStatusColor(status: DocStatus) {
  switch (status) {
    case "approved":
      return GREEN;
    case "pending":
      return GOLD;
    case "review":
      return PURPLE;
    default:
      return MUTED;
  }
}

export default function VerificationScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { account } = useProfileKernel();
  const phoneVerified = Boolean(String(account.phone || "").trim()) || Boolean((PROFILE_KYC_STATE as any).phoneVerified);
  const emailVerified = Boolean(String(account.email || "").trim()) || Boolean((PROFILE_KYC_STATE as any).emailVerified);
  const verificationStatus = account.verificationStatus === "verified" ? "verified" : PROFILE_KYC_STATE.status;

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

  const getKycStatusText = useCallback(
    (status: KycStatus) => {
      const key = `profile.verificationScreen.status.${normalizeKeyPart(status)}`;
      const translated = t(key);
      return translated === key
        ? t("profile.verificationScreen.common.unknown")
        : translated;
    },
    [t],
  );

  const getDocStatusText = useCallback(
    (status: DocStatus) => {
      const key = `profile.verificationScreen.documentStatus.${normalizeKeyPart(status)}`;
      const translated = t(key);
      return translated === key
        ? t("profile.verificationScreen.common.unknown")
        : translated;
    },
    [t],
  );

  const getComplianceStatusText = useCallback(
    (status: string) => {
      const key = `profile.verificationScreen.compliance.${normalizeKeyPart(status)}`;
      const translated = t(key);
      return translated === key ? status : translated;
    },
    [t],
  );

  const getRestrictionText = useCallback(
    (value: string) => {
      const key = `profile.verificationScreen.restrictions.${normalizeKeyPart(value)}`;
      const translated = t(key);
      return translated === key ? value : translated;
    },
    [t],
  );

  const getDocumentTitle = useCallback(
    (item: VerificationDocument) => {
      const key = `profile.verificationScreen.documents.${normalizeKeyPart(
        item.id || item.title,
      )}.title`;
      const translated = t(key);
      return translated === key ? item.title : translated;
    },
    [t],
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
                {t("profile.verificationScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.verificationScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.verificationScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroBadge}>
                  <BadgeCheck
                    size={16}
                    color={getStatusColor(verificationStatus)}
                    strokeWidth={2.4}
                  />
                  <Text
                    style={[
                      styles.heroBadgeText,
                      { color: getStatusColor(verificationStatus) },
                    ]}
                  >
                    {getKycStatusText(verificationStatus)}
                  </Text>
                </View>

                <Text style={styles.heroLevel}>{PROFILE_KYC_STATE.kycLevel}</Text>
              </View>

              <Text style={styles.heroDescription}>
                {t("profile.verificationScreen.hero.residencyCountry", {
                  value: PROFILE_KYC_STATE.residencyCountry,
                })}
              </Text>

              {PROFILE_KYC_STATE.reviewReason ? (
                <View style={styles.reviewNote}>
                  <CircleAlert size={16} color={GOLD} strokeWidth={2.4} />
                  <Text style={styles.reviewNoteText}>
                    {t("profile.verificationScreen.hero.reviewReason", {
                      value: PROFILE_KYC_STATE.reviewReason,
                    })}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                title={t("profile.verificationScreen.metrics.phone")}
                value={
                  phoneVerified
                    ? t("profile.verificationScreen.common.verified")
                    : t("profile.verificationScreen.common.pending")
                }
                accent={phoneVerified ? GREEN : GOLD}
              />
              <MetricCard
                title={t("profile.verificationScreen.metrics.email")}
                value={
                  emailVerified
                    ? t("profile.verificationScreen.common.verified")
                    : t("profile.verificationScreen.common.pending")
                }
                accent={emailVerified ? GREEN : GOLD}
              />
              <MetricCard
                title={t("profile.verificationScreen.metrics.liveness")}
                value={
                  PROFILE_KYC_STATE.livenessVerified
                    ? t("profile.verificationScreen.common.verified")
                    : t("profile.verificationScreen.common.pending")
                }
                accent={PROFILE_KYC_STATE.livenessVerified ? GREEN : GOLD}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.verificationScreen.sections.checks")}
              </Text>

              <View style={styles.groupCard}>
                <CheckRow
                  icon={<Smartphone size={18} color={BLUE} strokeWidth={2.4} />}
                  title={t("profile.verificationScreen.checks.phone")}
                  value={phoneVerified}
                  verifiedText={t("profile.verificationScreen.common.verified")}
                  pendingText={t("profile.verificationScreen.common.pending")}
                />
                <CheckRow
                  icon={<MailCheck size={18} color={GREEN} strokeWidth={2.4} />}
                  title={t("profile.verificationScreen.checks.email")}
                  value={emailVerified}
                  verifiedText={t("profile.verificationScreen.common.verified")}
                  pendingText={t("profile.verificationScreen.common.pending")}
                />
                <CheckRow
                  icon={<ScanFace size={18} color={PURPLE} strokeWidth={2.4} />}
                  title={t("profile.verificationScreen.checks.liveness")}
                  value={PROFILE_KYC_STATE.livenessVerified}
                  verifiedText={t("profile.verificationScreen.common.verified")}
                  pendingText={t("profile.verificationScreen.common.pending")}
                />
                <CheckRow
                  icon={<MapPin size={18} color={GOLD} strokeWidth={2.4} />}
                  title={t("profile.verificationScreen.checks.address")}
                  value={PROFILE_KYC_STATE.addressVerified}
                  verifiedText={t("profile.verificationScreen.common.verified")}
                  pendingText={t("profile.verificationScreen.common.pending")}
                  last
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.verificationScreen.sections.documents")}
              </Text>

              <View style={styles.groupCard}>
                {(PROFILE_VERIFICATION_DOCUMENTS as VerificationDocument[]).map(
                  (item, index, arr) => (
                    <View
                      key={item.id}
                      style={[
                        styles.docRow,
                        index !== arr.length - 1 && styles.rowBorder,
                      ]}
                    >
                      <View style={styles.docLeft}>
                        <View style={styles.docIconWrap}>
                          <FileBadge size={18} color={BLUE} strokeWidth={2.4} />
                        </View>

                        <View style={styles.docTextWrap}>
                          <Text style={styles.docTitle}>{getDocumentTitle(item)}</Text>
                          <Text style={styles.docDate}>
                            {t("profile.verificationScreen.documents.updatedAt", {
                              value: item.updatedAt,
                            })}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.docBadge,
                          {
                            backgroundColor: `${getDocStatusColor(item.status)}22`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.docBadgeText,
                            { color: getDocStatusColor(item.status) },
                          ]}
                        >
                          {getDocStatusText(item.status)}
                        </Text>
                      </View>
                    </View>
                  ),
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.verificationScreen.sections.compliance")}
              </Text>

              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Shield size={16} color={PURPLE} strokeWidth={2.4} />
                  <Text style={styles.noteTitle}>
                    {t("profile.verificationScreen.complianceState.label", {
                      value: getComplianceStatusText(
                        PROFILE_KYC_STATE.complianceStatus,
                      ),
                    })}
                  </Text>
                </View>

                {PROFILE_KYC_STATE.restrictedActions.length ? (
                  <>
                    <Text style={styles.noteText}>
                      {t("profile.verificationScreen.complianceState.restrictedIntro")}
                    </Text>

                    <View style={styles.restrictionsList}>
                      {PROFILE_KYC_STATE.restrictedActions.map((item: string) => (
                        <View key={item} style={styles.restrictionPill}>
                          <Text style={styles.restrictionPillText}>
                            {getRestrictionText(item)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.noteText}>
                    {t("profile.verificationScreen.complianceState.noRestrictions")}
                  </Text>
                )}

                {PROFILE_KYC_STATE.sourceOfFundsRequested ? (
                  <Text style={styles.noteTextMuted}>
                    {t("profile.verificationScreen.complianceState.sourceOfFundsRequested")}
                  </Text>
                ) : null}

                {PROFILE_KYC_STATE.reverificationRequired ? (
                  <Text style={styles.noteTextMuted}>
                    {t("profile.verificationScreen.complianceState.reverificationRequired")}
                  </Text>
                ) : null}
              </View>
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

function CheckRow({
  icon,
  title,
  value,
  verifiedText,
  pendingText,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  value: boolean;
  verifiedText: string;
  pendingText: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.checkRow, !last && styles.rowBorder]}>
      <View style={styles.checkLeft}>
        <View style={styles.checkIconWrap}>{icon}</View>
        <Text style={styles.checkTitle}>{title}</Text>
      </View>

      <View
        style={[
          styles.checkBadge,
          {
            backgroundColor: value
              ? "rgba(119,226,140,0.14)"
              : "rgba(255,204,102,0.14)",
          },
        ]}
      >
        <Text
          style={[
            styles.checkBadgeText,
            { color: value ? GREEN : GOLD },
          ]}
        >
          {value ? verifiedText : pendingText}
        </Text>
      </View>
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

  heroCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  heroBadge: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heroBadgeText: {
    fontSize: 13,
    fontWeight: "900",
  },

  heroLevel: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  heroDescription: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 12,
  },

  reviewNote: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  reviewNoteText: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
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
    fontSize: 17,
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

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  checkRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: CARD_SOFT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  checkLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  checkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  checkTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  checkBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  checkBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },

  docRow: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: CARD_SOFT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  docLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  docTextWrap: {
    flex: 1,
  },

  docTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  docDate: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  docBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  docBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },

  noteCard: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },

  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  noteTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  noteText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },

  restrictionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  restrictionPill: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(181,136,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(181,136,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  restrictionPillText: {
    color: "#F1E7FF",
    fontSize: 12,
    fontWeight: "800",
  },

  noteTextMuted: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 10,
  },
});