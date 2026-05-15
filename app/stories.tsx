import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ResizeMode, Video as ExpoVideo } from "expo-av";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Play,
  RefreshCw,
  User,
  Video as VideoIcon,
  X,
} from "lucide-react-native";

import { useI18n } from "../src/shared/i18n";
import { useProfileKernel } from "../src/core/kernel/profile/bindings";
import {
  syncCurrentProfilePublicSurface,
  syncCurrentProfilePublicSurfaceToBackend,
} from "../src/modules/messenger/public/publicProfileSync";
import {
  hydrateAllPublicProfiles,
  hydratePublicProfile,
  hydratePublicProfileStorage,
  subscribePublicProfiles,
  type SharedPublicMediaItem,
  type SharedPublicProfileSnapshot,
} from "../src/modules/messenger/public/publicProfileRuntime";

const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const CARD = "rgba(14,28,46,0.88)";
const CARD_ALT = "rgba(20,39,58,0.82)";
const BORDER = "rgba(120,220,160,0.14)";
const TEAL = "#58D5C9";
const LOCAL_ONLY_URI = /^(file:|content:|asset:|blob:)/i;

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | { t?: (key: string, params?: Record<string, unknown>) => string };

type StoryItem = SharedPublicMediaItem & {
  ownerId: string;
  ownerName: string;
  ownerAvatarUri?: string;
};

function normalizeString(value?: string | null) {
  return String(value ?? "").trim();
}

function normalizeUsername(value?: string | null) {
  const raw = normalizeString(value).replace(/^@+/, "");
  return raw ? `@${raw}` : "";
}

function normalizePhone(value?: string | null) {
  return normalizeString(value).replace(/[^\d+]/g, "");
}

function isRemoteOrDataUri(uri?: string | null) {
  const value = normalizeString(uri);
  if (!value) return false;
  if (/^data:image\//i.test(value)) return true;
  return !LOCAL_ONLY_URI.test(value);
}

function getMediaPreviewUri(item: SharedPublicMediaItem) {
  if (item.kind === "video") {
    return normalizeString(item.thumbnailUri) || "";
  }
  return normalizeString(item.thumbnailUri) || normalizeString(item.uri) || normalizeString(item.mediaUri);
}

function getMediaOpenUri(item: SharedPublicMediaItem) {
  return normalizeString(item.mediaUri) || normalizeString(item.uri) || normalizeString(item.thumbnailUri);
}

function getDisplayName(snapshot: SharedPublicProfileSnapshot) {
  return (
    normalizeString(snapshot.publicName) ||
    normalizeString(snapshot.displayName) ||
    normalizeUsername(snapshot.publicUsername || snapshot.username) ||
    normalizeString(snapshot.phone) ||
    "Sabi User"
  );
}

function getInitial(value: string) {
  const match = value.match(/\p{L}|\d/u);
  return match ? match[0].toUpperCase() : "S";
}

function buildCurrentAliases(profile: ReturnType<typeof useProfileKernel>) {
  const account = profile.account;
  return [
    account.userId,
    account.sabiDisplayId,
    account.username,
    normalizeUsername(account.username),
    account.phone,
    normalizePhone(account.phone),
  ]
    .map(normalizeString)
    .filter(Boolean);
}

function buildStoriesFromProfiles(profiles: SharedPublicProfileSnapshot[]) {
  const seen = new Set<string>();
  const result: StoryItem[] = [];

  profiles.forEach((profile) => {
    const ownerId = normalizeString(profile.chatId || profile.userId);
    if (!ownerId) return;

    const ownerName = getDisplayName(profile);
    const ownerAvatarUri =
      normalizeString(profile.avatarUri) || normalizeString(profile.coverUri) || undefined;
    const items = [...profile.publicationPhotos, ...profile.publicationVideos];

    items.forEach((item) => {
      const openUri = getMediaOpenUri(item);
      const previewUri = getMediaPreviewUri(item);
      const key = `${ownerId}:${normalizeString(item.id) || openUri || previewUri}`;
      if (seen.has(key)) return;
      if (!openUri && !previewUri) return;
      seen.add(key);
      result.push({ ...item, ownerId, ownerName, ownerAvatarUri });
    });
  });

  return result;
}

export default function StoriesScreen() {
  const i18n = useI18n() as I18nHookValue;
  const profile = useProfileKernel();
  const { width } = useWindowDimensions();
  const [profilesVersion, setProfilesVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StoryItem | null>(null);
  const [brokenPreviewIds, setBrokenPreviewIds] = useState<Record<string, boolean>>({});
  const [playerError, setPlayerError] = useState(false);

  const t = useCallback(
    (key: string, fallback: string, params?: Record<string, unknown>) => {
      let value = key;
      if (typeof i18n === "function") value = i18n(key, params);
      else if (i18n && typeof i18n.t === "function") value = i18n.t(key, params);
      return typeof value === "string" && value.length && value !== key ? value : fallback;
    },
    [i18n],
  );

  const refreshStories = useCallback(async () => {
    setLoading(true);
    try {
      await hydratePublicProfileStorage();
      const localSnapshot = syncCurrentProfilePublicSurface(profile.state);
      void syncCurrentProfilePublicSurfaceToBackend(profile.state);
      if (localSnapshot?.chatId) hydratePublicProfile(localSnapshot.chatId);
      setProfilesVersion((value) => value + 1);
    } finally {
      setLoading(false);
    }
  }, [profile.state]);

  useEffect(() => {
    void refreshStories();
  }, [refreshStories]);

  useEffect(() => subscribePublicProfiles(() => setProfilesVersion((value) => value + 1)), []);

  const currentAliases = useMemo(() => buildCurrentAliases(profile), [profile]);
  const stories = useMemo(() => {
    void profilesVersion;
    const currentSnapshots = currentAliases
      .map((alias) => hydratePublicProfile(alias))
      .filter((snapshot) => snapshot.chatId);
    const byId = new Map<string, SharedPublicProfileSnapshot>();
    [...currentSnapshots, ...hydrateAllPublicProfiles()].forEach((snapshot) => {
      if (snapshot.chatId) byId.set(snapshot.chatId, snapshot);
    });
    return buildStoriesFromProfiles(Array.from(byId.values()));
  }, [currentAliases, profilesVersion]);

  const tileWidth = Math.max(142, Math.floor((Math.max(width, 320) - 42) / 2));
  const openSelected = useCallback((item: StoryItem) => {
    setPlayerError(false);
    setSelected(item);
  }, []);

  const renderStoryTile = (item: StoryItem) => {
    const previewUri = getMediaPreviewUri(item);
    const openUri = getMediaOpenUri(item);
    const broken = Boolean(brokenPreviewIds[item.ownerId + item.id]);
    const canShowPreview = item.kind === "photo" && isRemoteOrDataUri(previewUri) && !broken;
    const canShowVideoThumb = item.kind === "video" && isRemoteOrDataUri(previewUri) && !broken;

    return (
      <Pressable
        key={item.ownerId + item.id + openUri}
        onPress={() => openSelected(item)}
        style={[styles.tile, { width: tileWidth, height: Math.floor(tileWidth * 1.36) }]}
      >
        <LinearGradient colors={[CARD, CARD_ALT]} style={styles.tileGradient}>
          {canShowPreview || canShowVideoThumb ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.tileImage}
              resizeMode="cover"
              onError={() =>
                setBrokenPreviewIds((state) => ({ ...state, [item.ownerId + item.id]: true }))
              }
            />
          ) : (
            <LinearGradient
              colors={["rgba(88,213,201,0.28)", "rgba(99,168,255,0.18)", "rgba(6,18,14,0.92)"]}
              style={styles.previewFallback}
            >
              {item.kind === "video" ? (
                <Play size={36} color={TEXT} fill={TEXT} strokeWidth={2.2} />
              ) : (
                <ImageIcon size={34} color={TEXT} strokeWidth={2.2} />
              )}
              <Text style={styles.previewFallbackText}>
                {item.kind === "video"
                  ? t("stories.preview.video", "Video")
                  : t("stories.preview.photo", "Photo")}
              </Text>
            </LinearGradient>
          )}
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.76)"]} style={styles.tileOverlay}>
            <View style={styles.ownerRow}>
              <View style={styles.ownerAvatar}>
                {item.ownerAvatarUri ? (
                  <Image source={{ uri: item.ownerAvatarUri }} style={styles.ownerAvatarImage} />
                ) : (
                  <Text style={styles.ownerAvatarText}>{getInitial(item.ownerName)}</Text>
                )}
              </View>
              <Text numberOfLines={1} style={styles.ownerName}>{item.ownerName}</Text>
            </View>
            <View style={styles.kindPill}>
              {item.kind === "video" ? (
                <VideoIcon size={13} color={TEXT} strokeWidth={2.2} />
              ) : (
                <ImageIcon size={13} color={TEXT} strokeWidth={2.2} />
              )}
              <Text style={styles.kindPillText}>
                {item.duration ||
                  (item.kind === "video"
                    ? t("stories.kind.video", "Video")
                    : t("stories.kind.photo", "Photo"))}
              </Text>
            </View>
          </LinearGradient>
        </LinearGradient>
      </Pressable>
    );
  };

  const selectedUri = selected ? getMediaOpenUri(selected) : "";
  const selectedPreviewUri = selected ? getMediaPreviewUri(selected) : "";
  const canOpenSelected = isRemoteOrDataUri(selectedUri) || /^data:image\//i.test(selectedUri);

  return (
    <LinearGradient colors={["#03120C", "#062018", "#08261E"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.topButton}>
            <ArrowLeft size={19} color={TEXT} strokeWidth={2.4} />
          </Pressable>
          <Text numberOfLines={1} style={styles.title}>{t("stories.header.title", "Stories")}</Text>
          <Pressable onPress={() => void refreshStories()} style={styles.topButton}>
            {loading ? <ActivityIndicator color={TEXT} size="small" /> : <RefreshCw size={18} color={TEXT} strokeWidth={2.4} />}
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <LinearGradient colors={["rgba(24,46,70,0.96)", "rgba(10,24,34,0.94)"]} style={styles.heroCard}>
            <View style={styles.heroIcon}><User size={22} color={TEXT} strokeWidth={2.4} /></View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>{t("stories.hero.title", "Public stories")}</Text>
              <Text style={styles.heroText}>
                {t("stories.hero.subtitle", "Photos and short videos from public profile are shown here without opening a black screen.")}
              </Text>
            </View>
            <Pressable onPress={() => router.push("/profile/photos" as never)} style={styles.heroAction}>
              <Camera size={15} color={TEXT} strokeWidth={2.4} />
              <Text style={styles.heroActionText}>{t("stories.actions.add", "Add")}</Text>
            </Pressable>
          </LinearGradient>

          {stories.length ? (
            <View style={styles.grid}>{stories.map(renderStoryTile)}</View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("stories.empty.title", "No public stories yet")}</Text>
              <Text style={styles.emptyText}>
                {t("stories.empty.text", "Add public photos or short videos in Profile. Only selected public media will appear here.")}
              </Text>
              <Pressable onPress={() => router.push("/profile/public" as never)} style={styles.emptyAction}>
                <Text style={styles.emptyActionText}>{t("stories.empty.action", "Open profile info")}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        <Modal visible={Boolean(selected)} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setSelected(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setSelected(null)} style={styles.modalButton}>
                <X size={19} color={TEXT} strokeWidth={2.4} />
              </Pressable>
              <Text numberOfLines={1} style={styles.modalTitle}>{selected?.ownerName || ""}</Text>
              <View style={styles.modalButton} />
            </View>
            <View style={styles.modalBody}>
              {selected?.kind === "video" ? (
                canOpenSelected && !playerError ? (
                  <ExpoVideo
                    source={{ uri: selectedUri }}
                    style={styles.fullscreenMedia}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay
                    onError={() => setPlayerError(true)}
                  />
                ) : (
                  <View style={styles.modalFallback}>
                    {selectedPreviewUri && isRemoteOrDataUri(selectedPreviewUri) ? (
                      <Image source={{ uri: selectedPreviewUri }} style={styles.modalFallbackImage} resizeMode="contain" />
                    ) : (
                      <Play size={48} color={TEXT} fill={TEXT} strokeWidth={2.3} />
                    )}
                    <Text style={styles.modalFallbackTitle}>{t("stories.video.unavailable.title", "Video is not available")}</Text>
                    <Text style={styles.modalFallbackText}>
                      {t("stories.video.unavailable.text", "This video has no public uploaded file yet, so it cannot be played on another device.")}
                    </Text>
                  </View>
                )
              ) : selected && isRemoteOrDataUri(selectedUri || selectedPreviewUri) ? (
                <Image source={{ uri: selectedUri || selectedPreviewUri }} style={styles.fullscreenMedia} resizeMode="contain" />
              ) : (
                <View style={styles.modalFallback}>
                  <ImageIcon size={48} color={TEXT} strokeWidth={2.3} />
                  <Text style={styles.modalFallbackTitle}>{t("stories.photo.unavailable.title", "Photo is not available")}</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create<any>({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: { minHeight: 58, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topButton: { width: 42, height: 42, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  title: { flex: 1, textAlign: "center", color: TEXT, fontSize: 18, fontWeight: "900", marginHorizontal: 10 },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  heroCard: { borderRadius: 28, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: "row", alignItems: "center", overflow: "hidden", marginBottom: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(119,226,140,0.16)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(119,226,140,0.20)" },
  heroTextWrap: { flex: 1, paddingHorizontal: 12 },
  heroTitle: { color: TEXT, fontSize: 18, fontWeight: "900" },
  heroText: { color: MUTED, fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 4 },
  heroAction: { minHeight: 38, borderRadius: 15, paddingHorizontal: 12, flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: "rgba(119,226,140,0.16)", borderWidth: 1, borderColor: "rgba(119,226,140,0.22)" },
  heroActionText: { color: TEXT, fontSize: 12, fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { borderRadius: 24, overflow: "hidden" },
  tileGradient: { flex: 1, borderRadius: 24, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  tileImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  previewFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewFallbackText: { color: TEXT, fontSize: 13, fontWeight: "900", marginTop: 10 },
  tileOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, minHeight: 94, justifyContent: "flex-end" },
  ownerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ownerAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: TEAL, overflow: "hidden", marginRight: 8 },
  ownerAvatarImage: { width: "100%", height: "100%" },
  ownerAvatarText: { color: "#062018", fontSize: 13, fontWeight: "900" },
  ownerName: { flex: 1, color: TEXT, fontSize: 13, fontWeight: "900" },
  kindPill: { alignSelf: "flex-start", minHeight: 26, borderRadius: 999, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  kindPillText: { color: TEXT, fontSize: 10, fontWeight: "900" },
  emptyCard: { borderRadius: 28, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, padding: 18, alignItems: "center" },
  emptyTitle: { color: TEXT, fontSize: 18, fontWeight: "900", textAlign: "center" },
  emptyText: { color: MUTED, fontSize: 13, lineHeight: 19, fontWeight: "700", textAlign: "center", marginTop: 8 },
  emptyAction: { marginTop: 14, minHeight: 44, borderRadius: 16, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(119,226,140,0.16)", borderWidth: 1, borderColor: "rgba(119,226,140,0.22)" },
  emptyActionText: { color: TEXT, fontSize: 13, fontWeight: "900" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.96)" },
  modalHeader: { minHeight: 66, paddingTop: 10, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalButton: { width: 42, height: 42, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)" },
  modalTitle: { flex: 1, color: TEXT, fontSize: 15, fontWeight: "900", textAlign: "center", marginHorizontal: 8 },
  modalBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 20 },
  fullscreenMedia: { width: "100%", height: "100%" },
  modalFallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  modalFallbackImage: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "100%", opacity: 0.42 },
  modalFallbackTitle: { color: TEXT, fontSize: 18, fontWeight: "900", textAlign: "center", marginTop: 16 },
  modalFallbackText: { color: MUTED, fontSize: 13, lineHeight: 19, fontWeight: "700", textAlign: "center", marginTop: 8, maxWidth: 280 },
});
