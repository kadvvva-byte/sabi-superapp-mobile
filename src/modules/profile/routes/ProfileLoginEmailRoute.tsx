import React, { useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronRight,
  Mail,
  MailCheck,
  ShieldCheck,
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

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

export default function ProfileLoginEmailRoute() {
  const i18n = useI18n() as I18nHookValue;
  const { facade, emailChange } = useProfileKernel();

  const email = emailChange.currentEmail;
  const requireCurrentEmailVerification = emailChange.requiresCurrentEmailVerification;
  const requireNewEmailVerification = emailChange.requiresNewEmailVerification;

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
              onPress={() => router.replace("/profile/privacy")}
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
                {t("profile.loginEmailScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.loginEmailScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.loginEmailScreen.intro.subtitle")}
              </Text>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIconWrap}>
                  <Mail size={20} color={BLUE} strokeWidth={2.4} />
                </View>

                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>
                    {t("profile.loginEmailScreen.hero.title")}
                  </Text>
                  <Text style={styles.heroDescription}>
                    {t("profile.loginEmailScreen.hero.description")}
                  </Text>
                </View>
              </View>

              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>
                  {t("profile.loginEmailScreen.field.label")}
                </Text>
                <TextInput
                  value={email}
                  onChangeText={(value) => { void facade.updateEmailChange({ currentEmail: value }); }}
                  placeholder={t("profile.loginEmailScreen.field.placeholder")}
                  placeholderTextColor="rgba(255,255,255,0.30)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.fieldInput}
                />
              </View>
            </View>

            <View style={styles.groupCard}>
              <ToggleRow
                icon={<MailCheck size={18} color={GREEN} strokeWidth={2.4} />}
                title={t(
                  "profile.loginEmailScreen.toggles.currentVerification.title",
                )}
                description={t(
                  "profile.loginEmailScreen.toggles.currentVerification.description",
                )}
                value={requireCurrentEmailVerification}
                onChange={(value) => { void facade.updateEmailChange({ requiresCurrentEmailVerification: value }); }}
              />

              <ToggleRow
                icon={<ShieldCheck size={18} color={PURPLE} strokeWidth={2.4} />}
                title={t(
                  "profile.loginEmailScreen.toggles.newVerification.title",
                )}
                description={t(
                  "profile.loginEmailScreen.toggles.newVerification.description",
                )}
                value={requireNewEmailVerification}
                onChange={(value) => { void facade.updateEmailChange({ requiresNewEmailVerification: value }); }}
                last
              />
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>
                {t("profile.loginEmailScreen.note.title")}
              </Text>
              <Text style={styles.noteText}>
                {t("profile.loginEmailScreen.note.description")}
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
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

  heroCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },

  heroHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroTextWrap: {
    flex: 1,
  },

  heroTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  heroDescription: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 6,
  },

  fieldCard: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: CARD_SOFT,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
  },

  fieldLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },

  fieldInput: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
    minHeight: 44,
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
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
});