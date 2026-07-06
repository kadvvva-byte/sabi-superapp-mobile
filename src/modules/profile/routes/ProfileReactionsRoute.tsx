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
import { ArrowLeft } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { profileKernelFacade } from "../../../core/kernel/profile";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";

type LocalIconProps = { size?: number; color?: string; strokeWidth?: number; style?: unknown };
const BackIcon = ArrowLeft as unknown as React.ComponentType<LocalIconProps>;

const BG_TOP = "#04120D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const CARD = "rgba(14, 28, 46, 0.86)";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";
const EMOJIS = ["❤️", "🔥", "👏", "😍", "⚡", "🎉"];

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

export default function ProfileReactionsScreen() {
  const i18n = useI18n() as I18nHookValue;
  const profile = useProfileKernel();

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
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <BackIcon size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>

            <Text style={styles.headerTitle}>
              {t("profile.reactionsScreen.header.title")}
            </Text>

            <View style={styles.headerButtonPlaceholder} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>
                {t("profile.reactionsScreen.card.title")}
              </Text>

              <Text style={styles.subtitle}>
                {t("profile.reactionsScreen.card.subtitle")}
              </Text>

              <View style={styles.grid}>
                {EMOJIS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => void profileKernelFacade.addReaction(emoji, 1)}
                    style={styles.emojiCard}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                    <Text style={styles.emojiCount}>
                      {profile.reactionCounts[emoji] ?? 0}
                    </Text>
                  </Pressable>
                ))}
              </View>
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
  container: { flex: 1, paddingHorizontal: 16 },

  headerRow: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121,228,162,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerButtonPlaceholder: {
    width: 44,
    height: 44,
  },

  headerTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  content: {
    paddingTop: 14,
    paddingBottom: 32,
  },

  card: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },

  title: {
    color: TEXT,
    fontSize: 24,
    fontWeight: "900",
  },

  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },

  emojiCard: {
    width: "31%",
    minHeight: 94,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  emoji: {
    fontSize: 28,
  },

  emojiCount: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "900",
  },
});
