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
  ChevronRight,
  FileText,
  HelpCircle,
  Info,
  LifeBuoy,
  MessageCircleQuestion,
  Shield,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { PROFILE_SUPPORT_LINKS } from "../data/profile";

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

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type SupportLinkItem = {
  id: string;
  title: string;
  description: string;
};

function normalizeSupportKey(item: SupportLinkItem) {
  const raw = `${item.id} ${item.title}`.toLowerCase();

  if (
    raw.includes("help") &&
    raw.includes("center")
  ) {
    return "helpCenter";
  }

  if (
    raw.includes("contact") &&
    raw.includes("support")
  ) {
    return "contactSupport";
  }

  if (
    raw.includes("privacy") &&
    raw.includes("policy")
  ) {
    return "privacyPolicy";
  }

  if (
    raw.includes("terms") &&
    raw.includes("service")
  ) {
    return "termsOfService";
  }

  if (
    raw.includes("about") &&
    raw.includes("sabi")
  ) {
    return "aboutSabi";
  }

  return item.id || "general";
}

function getSupportIcon(item: SupportLinkItem) {
  const key = normalizeSupportKey(item);

  switch (key) {
    case "helpCenter":
      return <HelpCircle size={18} color={TEAL} strokeWidth={2.4} />;
    case "contactSupport":
      return <LifeBuoy size={18} color={BLUE} strokeWidth={2.4} />;
    case "privacyPolicy":
      return <Shield size={18} color={GREEN} strokeWidth={2.4} />;
    case "termsOfService":
      return <FileText size={18} color={PURPLE} strokeWidth={2.4} />;
    case "aboutSabi":
      return <Info size={18} color={TEAL} strokeWidth={2.4} />;
    default:
      return <MessageCircleQuestion size={18} color={BLUE} strokeWidth={2.4} />;
  }
}

export default function SupportScreen() {
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

  const getSupportTitle = useCallback(
    (item: SupportLinkItem) => {
      const supportKey = normalizeSupportKey(item);
      const key = `profile.supportScreen.links.${supportKey}.title`;
      const translated = t(key);
      return translated === key ? item.title : translated;
    },
    [t],
  );

  const getSupportDescription = useCallback(
    (item: SupportLinkItem) => {
      const supportKey = normalizeSupportKey(item);
      const key = `profile.supportScreen.links.${supportKey}.description`;
      const translated = t(key);
      return translated === key ? item.description : translated;
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
                {t("profile.supportScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.supportScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.supportScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>
                {t("profile.supportScreen.hero.title")}
              </Text>
              <Text style={styles.heroText}>
                {t("profile.supportScreen.hero.description")}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("profile.supportScreen.sections.links")}
              </Text>

              <View style={styles.groupCard}>
                {(PROFILE_SUPPORT_LINKS as SupportLinkItem[]).map((item, index, arr) => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.linkRow,
                      index !== arr.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.linkLeft}>
                      <View style={styles.iconWrap}>{getSupportIcon(item)}</View>

                      <View style={styles.textWrap}>
                        <Text style={styles.linkTitle}>{getSupportTitle(item)}</Text>
                        <Text style={styles.linkDescription}>
                          {getSupportDescription(item)}
                        </Text>
                      </View>
                    </View>

                    <ChevronRight size={16} color={MUTED} strokeWidth={2.4} />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>
                {t("profile.supportScreen.notes.premiumFoundation.title")}
              </Text>
              <Text style={styles.noteText}>
                {t("profile.supportScreen.notes.premiumFoundation.description")}
              </Text>
            </View>

            <View style={styles.noteCardSoft}>
              <Text style={styles.noteTitle}>
                {t("profile.supportScreen.notes.legalTrust.title")}
              </Text>
              <Text style={styles.noteText}>
                {t("profile.supportScreen.notes.legalTrust.description")}
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
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

  heroTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  heroText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
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

  linkRow: {
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: CARD_SOFT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  linkLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  textWrap: {
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

  noteCard: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },

  noteCardSoft: {
    borderRadius: 22,
    backgroundColor: CARD_SOFT,
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