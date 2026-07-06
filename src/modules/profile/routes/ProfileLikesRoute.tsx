import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { ArrowLeft, Heart } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";
import { hydratePublicProfile, hydratePublicProfileStorage, subscribePublicProfiles } from "../../../modules/messenger/public/publicProfileRuntime";
import { syncCurrentProfilePublicSurface, syncCurrentProfilePublicSurfaceToBackend } from "../../../modules/messenger/public/publicProfileSync";

type LocalIconProps = { size?: number; color?: string; strokeWidth?: number; style?: unknown };
const BackIcon = ArrowLeft as unknown as React.ComponentType<LocalIconProps>;
const HeartIcon = Heart as unknown as React.ComponentType<LocalIconProps>;

const BG_TOP = "#04120D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const CARD = "rgba(14, 28, 46, 0.86)";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | { t?: (key: string, params?: Record<string, unknown>) => string };

function NoteCard({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.noteCard}>
      <Text style={styles.noteTitle}>{title}</Text>
      <Text style={styles.noteText}>{description}</Text>
    </View>
  );
}

function goBackOrProfileHome() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/profile" as never);
}

export default function ProfileLikesScreen() {
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

  const [publicSurfaceRevision, setPublicSurfaceRevision] = useState(0);

  useEffect(() => {
    let mounted = true;

    void hydratePublicProfileStorage().then(() => {
      if (mounted) setPublicSurfaceRevision((value) => value + 1);
    });

    const unsubscribe = subscribePublicProfiles(() => {
      setPublicSurfaceRevision((value) => value + 1);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const surface = syncCurrentProfilePublicSurface(profile.state);
    if (surface) setPublicSurfaceRevision((value) => value + 1);

    void syncCurrentProfilePublicSurfaceToBackend(profile.state)
      .then((saved) => {
        if (saved) setPublicSurfaceRevision((value) => value + 1);
      })
      .catch(() => {});
  }, [profile.state]);

  const publicSurface = useMemo(() => {
    const account = profile.account;
    const aliases = [
      account.userId,
      account.sabiDisplayId,
      account.username,
      account.username ? `@${String(account.username).replace(/^@+/, "")}` : "",
      account.phone,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    for (const alias of aliases) {
      const snapshot = hydratePublicProfile(alias);
      if (
        snapshot &&
        (snapshot.updatedAt > 0 ||
          snapshot.likesCount > 0 ||
          snapshot.publicationPhotos.length > 0 ||
          snapshot.publicationVideos.length > 0)
      ) {
        return snapshot;
      }
    }

    return null;
  }, [profile.account, publicSurfaceRevision]);

  const likedMediaCount = useMemo(() => {
    const photos = Array.isArray(publicSurface?.publicationPhotos) ? publicSurface.publicationPhotos : [];
    const videos = Array.isArray(publicSurface?.publicationVideos) ? publicSurface.publicationVideos : [];
    return [...photos, ...videos].filter((item) => Boolean(item?.liked)).length;
  }, [publicSurface]);

  const count = Math.max(
    Number(profile.likesCount || 0),
    Number(publicSurface?.likesCount || 0),
    likedMediaCount,
  );

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={goBackOrProfileHome} style={styles.headerButton}>
              <BackIcon size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>

            <Text style={styles.headerTitle}>{t("profile.likesScreen.header.title")}</Text>

            <View style={styles.headerButtonPlaceholder} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <View style={styles.titleRow}>
                <HeartIcon size={20} color={TEXT} strokeWidth={2.4} />
                <Text style={styles.title}>{t("profile.likesScreen.card.title")}</Text>
              </View>
              <Text style={styles.count}>{count}</Text>
              <Text style={styles.subtitle}>{t("profile.likesScreen.card.subtitle")}</Text>
            </View>

            <NoteCard
              title={t("profile.likesScreen.notes.readonlyTitle")}
              description={t("profile.likesScreen.notes.readonlyDescription")}
            />
            <NoteCard
              title={t("profile.likesScreen.notes.sourceTitle")}
              description={t("profile.likesScreen.notes.sourceDescription")}
            />
            <NoteCard
              title={count > 0 ? t("profile.likesScreen.actions.fromUsers") : t("profile.likesScreen.empty.title")}
              description={count > 0 ? t("profile.likesScreen.notes.nonEmptyDescription") : t("profile.likesScreen.empty.description")}
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
  headerRow: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(12,28,25,0.86)", borderWidth: 1, borderColor: "rgba(121,228,162,0.18)", alignItems: "center", justifyContent: "center" },
  headerButtonPlaceholder: { width: 44, height: 44 },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: "900" },
  content: { paddingTop: 14, paddingBottom: 32, gap: 12 },
  card: { borderRadius: 24, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, padding: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: TEXT, fontSize: 24, fontWeight: "900" },
  count: { color: TEXT, fontSize: 52, fontWeight: "900", marginTop: 18 },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 20, fontWeight: "600", marginTop: 8 },
  noteCard: { borderRadius: 18, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, padding: 14 },
  noteTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  noteText: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "600", marginTop: 6 },
});
