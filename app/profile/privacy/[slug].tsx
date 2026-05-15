import React from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight } from "lucide-react-native";

import { useI18n } from "../../../src/shared/i18n";
import PrivacyDetailScreen from "../../../src/modules/profile/components/PrivacyDetailScreen";
import { useProfileKernel } from "../../../src/core/kernel/profile/bindings";

const BG_TOP = "#05140D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";

const CARD = "rgba(16, 31, 48, 0.82)";
const CARD_BORDER = "rgba(120, 220, 160, 0.12)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

export default function ProfilePrivacyDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const { facade } = useProfileKernel();
  const config = facade.selectors.privacyDetailConfig(slug);
  const i18n = useI18n() as I18nHookValue;

  const t = (key: string, params?: Record<string, unknown>) => {
    if (typeof i18n === "function") {
      const value = i18n(key, params);
      return typeof value === "string" && value.length ? value : key;
    }

    if (i18n && typeof i18n.t === "function") {
      const value = i18n.t(key, params);
      return typeof value === "string" && value.length ? value : key;
    }

    return key;
  };

  if (config) {
    return <PrivacyDetailScreen config={config} />;
  }

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.fixedButtonsRow}>
            <Pressable
              onPress={() => router.replace("/profile/privacy")}
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

          <View style={styles.content}>
            <Text style={styles.eyebrow}>
              {t("profile.privacyDetailScreen.defaults.eyebrow")}
            </Text>
            <Text style={styles.title}>
              {t("profile.privacyDetailScreen.notFound.title")}
            </Text>
            <Text style={styles.subtitle}>
              {t("profile.privacyDetailScreen.notFound.subtitle")}
            </Text>

            <Pressable
              onPress={() => router.replace("/profile/privacy")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {t("profile.privacyDetailScreen.notFound.backAction")}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

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

  content: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 62,
    paddingBottom: 36,
  },

  eyebrow: {
    color: "#77E28C",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  title: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: "600",
    maxWidth: 460,
  },

  primaryButton: {
    minHeight: 54,
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    alignSelf: "flex-start",
  },

  primaryButtonText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "900",
  },
});