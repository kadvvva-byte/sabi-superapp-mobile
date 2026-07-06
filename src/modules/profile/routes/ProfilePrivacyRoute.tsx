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
  Bell,
  ChevronRight,
  Clock3,
  Database,
  Gift,
  Image as ImageIcon,
  Lock,
  Mail,
  MessageSquare,
  Mic,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
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
const TEAL = "#58D5C9";
const BLUE = "#63A8FF";
const PURPLE = "#B588FF";
const GOLD = "#FFCC66";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type PrivacyRow = {
  key: string;
  title: string;
  description: string;
  route?: string;
  badge?: string;
};

function getRowIcon(key: string) {
  switch (key) {
    case "security":
      return <ShieldCheck size={18} color={GREEN} strokeWidth={2.4} />;
    case "data":
      return <Database size={18} color={TEAL} strokeWidth={2.4} />;
    case "blocked":
      return <Lock size={18} color={PURPLE} strokeWidth={2.4} />;
    case "login_email":
      return <Mail size={18} color={BLUE} strokeWidth={2.4} />;
    case "autodelete":
      return <Clock3 size={18} color={GOLD} strokeWidth={2.4} />;
    case "phone":
      return <Phone size={18} color={BLUE} strokeWidth={2.4} />;
    case "last-seen":
      return <UserRound size={18} color={GREEN} strokeWidth={2.4} />;
    case "photo":
      return <ImageIcon size={18} color={TEAL} strokeWidth={2.4} />;
    case "bio":
      return <UserRound size={18} color={PURPLE} strokeWidth={2.4} />;
    case "birthday":
      return <Gift size={18} color={GOLD} strokeWidth={2.4} />;
    case "gifts":
      return <Gift size={18} color={TEAL} strokeWidth={2.4} />;
    case "forwards":
      return <MessageSquare size={18} color={BLUE} strokeWidth={2.4} />;
    case "calls":
      return <Phone size={18} color={GREEN} strokeWidth={2.4} />;
    case "voice-messages":
      return <Mic size={18} color={PURPLE} strokeWidth={2.4} />;
    case "messages":
      return <MessageSquare size={18} color={BLUE} strokeWidth={2.4} />;
    case "groups":
      return <Users size={18} color={GREEN} strokeWidth={2.4} />;
    default:
      return <Bell size={18} color={TEAL} strokeWidth={2.4} />;
  }
}

export default function PrivacyScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { privacySecurityRows, privacyVisibilityRows } = useProfileKernel();

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

  const getRowTitle = useCallback(
    (row: PrivacyRow) => {
      const key = `profile.privacyScreen.rows.${row.key}.title`;
      const translated = t(key);
      return translated === key ? row.title : translated;
    },
    [t],
  );

  const getRowDescription = useCallback(
    (row: PrivacyRow) => {
      const key = `profile.privacyScreen.rows.${row.key}.description`;
      const translated = t(key);
      return translated === key ? row.description : translated;
    },
    [t],
  );

  const getRowBadge = useCallback(
    (row: PrivacyRow) => {
      if (!row.badge) return undefined;
      const key = `profile.privacyScreen.rows.${row.key}.badge`;
      const translated = t(key);
      return translated === key ? row.badge : translated;
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
          <View style={styles.fixedButtonsRow} pointerEvents="box-none">
            <Pressable
              onPress={() => router.replace("/profile")}
              style={styles.headerIconButton}
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
                {t("profile.privacyScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.privacyScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.privacyScreen.intro.subtitle")}
              </Text>
            </View>

            <Section
              title={t("profile.privacyScreen.sections.securityAccess")}
              rows={privacySecurityRows}
              getRowTitle={getRowTitle}
              getRowDescription={getRowDescription}
              getRowBadge={getRowBadge}
            />

            <Section
              title={t("profile.privacyScreen.sections.visibilityCommunication")}
              rows={privacyVisibilityRows}
              getRowTitle={getRowTitle}
              getRowDescription={getRowDescription}
              getRowBadge={getRowBadge}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Section({
  title,
  rows,
  getRowTitle,
  getRowDescription,
  getRowBadge,
}: {
  title: string;
  rows: PrivacyRow[];
  getRowTitle: (row: PrivacyRow) => string;
  getRowDescription: (row: PrivacyRow) => string;
  getRowBadge: (row: PrivacyRow) => string | undefined;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.groupCard}>
        {rows.map((row, index) => {
          const badge = getRowBadge(row);

          const content = (
            <>
              <View style={styles.rowIcon}>{getRowIcon(row.key)}</View>

              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>{getRowTitle(row)}</Text>
                <Text style={styles.rowDescription}>
                  {getRowDescription(row)}
                </Text>
              </View>

              {badge ? (
                <View style={styles.badgeWrap}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ) : (
                <ChevronRight size={16} color={MUTED} strokeWidth={2.4} />
              )}
            </>
          );

          if (row.route) {
            return (
              <Pressable
                key={row.key}
                onPress={() => router.push(row.route as never)}
                style={[styles.row, index !== rows.length - 1 && styles.rowBorder]}
              >
                {content}
              </Pressable>
            );
          }

          return (
            <View
              key={row.key}
              style={[styles.row, index !== rows.length - 1 && styles.rowBorder]}
            >
              {content}
            </View>
          );
        })}
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

  headerIconButton: {
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
    paddingHorizontal: 2,
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
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontWeight: "600",
    maxWidth: 420,
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
    paddingHorizontal: 2,
  },

  groupCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
  },

  row: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: CARD_SOFT,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  rowTextWrap: {
    flex: 1,
  },

  rowTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  rowDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },

  badgeWrap: {
    minHeight: 28,
    maxWidth: 110,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
  },
});