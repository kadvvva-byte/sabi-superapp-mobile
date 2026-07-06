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
import { ArrowLeft, Images, Link2, Mic, Video } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";

const BG_TOP = "#04120D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const CARD = "rgba(14, 28, 46, 0.86)";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

function RouteCard({
  title,
  subtitle,
  icon,
  route,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
}) {
  return (
    <Pressable onPress={() => router.push(route as never)} style={styles.routeCard}>
      {icon}
      <View style={styles.routeTextWrap}>
        <Text style={styles.routeTitle}>{title}</Text>
        <Text style={styles.routeSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileMediaScreen() {
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

  const total = profile.counts.mediaCount;

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>

            <Text style={styles.headerTitle}>{t("profile.mediaScreen.header.title")}</Text>

            <View style={styles.headerButtonPlaceholder} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>{t("profile.mediaScreen.card.title")}</Text>

              <Text style={styles.count}>{total}</Text>

              <Text style={styles.subtitle}>{t("profile.mediaScreen.card.subtitle")}</Text>
            </View>

            <RouteCard
              title={t("profile.mediaScreen.routes.photos.title")}
              subtitle={t("profile.mediaScreen.routes.photos.subtitle")}
              icon={<Images size={18} color={TEXT} strokeWidth={2.4} />}
              route="/profile/photos"
            />

            <RouteCard
              title={t("profile.mediaScreen.routes.shortVideos.title")}
              subtitle={t("profile.mediaScreen.routes.shortVideos.subtitle")}
              icon={<Video size={18} color={TEXT} strokeWidth={2.4} />}
              route="/profile/short-videos"
            />

            <RouteCard
              title={t("profile.mediaScreen.routes.links.title")}
              subtitle={t("profile.mediaScreen.routes.links.subtitle")}
              icon={<Link2 size={18} color={TEXT} strokeWidth={2.4} />}
              route="/profile/links"
            />

            <RouteCard
              title={t("profile.mediaScreen.routes.voice.title")}
              subtitle={t("profile.mediaScreen.routes.voice.subtitle")}
              icon={<Mic size={18} color={TEXT} strokeWidth={2.4} />}
              route="/profile/voice"
            />
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
    gap: 12,
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

  count: {
    color: TEXT,
    fontSize: 52,
    fontWeight: "900",
    marginTop: 18,
  },

  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
  },

  routeCard: {
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  routeTextWrap: {
    flex: 1,
  },

  routeTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  routeSubtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 3,
  },
});
