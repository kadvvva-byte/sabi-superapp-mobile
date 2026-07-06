import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import { ArrowLeft, Camera, Play, Trash2, Video as VideoIcon, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "../../../shared/i18n";
import { profileKernelFacade } from "../../../core/kernel/profile";
import { syncCurrentProfilePublicSurface, syncCurrentProfilePublicSurfaceToBackend } from "../../messenger/public/publicProfileSync";
import { getAuthSessionState } from "../../../core/kernel/auth/session.store";
import { uploadUserPublicProfileMediaFile } from "../../../shared/api/user-profile-api";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";
import type { ProfileMediaItem } from "../../../core/kernel/profile/core/types";

const BG_TOP = "#03120C";
const BG_BOTTOM = "#06271D";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";
const ACTION = "rgba(255,255,255,0.08)";
const ACTION_BORDER = "rgba(255,255,255,0.10)";
const H_PADDING = 16;
const GRID_GAP = 10;

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

function goBackOrProfileHome() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/profile" as never);
}

function formatClock(ms?: number) {
  const safe = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const mm = `${Math.floor(safe / 60)}`.padStart(2, "0");
  const ss = `${safe % 60}`.padStart(2, "0");
  return `${mm}:${ss}`;
}

type PickedProfileVideoAsset = ImagePicker.ImagePickerAsset & {
  mimeType?: string | null;
  fileName?: string | null;
};

function resolvePickedVideoMime(asset: PickedProfileVideoAsset) {
  const explicit = typeof asset.mimeType === "string" && asset.mimeType.trim() ? asset.mimeType.trim() : "";
  if (explicit.startsWith("video/")) return explicit;

  const name = String(asset.fileName || asset.uri || "").toLowerCase();
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".m4v")) return "video/mp4";
  return "video/mp4";
}

async function resolveUploadedProfileVideoUri(asset: PickedProfileVideoAsset): Promise<string | null> {
  const mimeType = resolvePickedVideoMime(asset);
  try {
    const uploadedUri = await uploadUserPublicProfileMediaFile(
      {
        uri: asset.uri,
        name: asset.fileName || `sabi-profile-video-${Date.now()}.${mimeType === "video/quicktime" ? "mov" : "mp4"}`,
        mimeType,
      },
      getAuthSessionState(),
    );
    if (uploadedUri) return uploadedUri;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "unknown");
    console.warn("[profile-short-videos] upload skipped", message);
  }

  return null;
}


function HeaderCard({ count, onAddPress, title, subtitle, addLabel }: { count: number; onAddPress: () => void; title: string; subtitle: string; addLabel: string; }) {
  return (
    <LinearGradient colors={["rgba(22,40,62,0.96)", "rgba(11,27,36,0.96)"]} style={styles.headerCard}>
      <View style={styles.headerCardRow}>
        <View style={styles.headerMainTextWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.countChip}><VideoIcon size={14} color={TEXT} strokeWidth={2.4} /><Text style={styles.countChipText}>{count}</Text></View>
      </View>
      <Pressable onPress={onAddPress} style={styles.primaryAction}><Camera size={15} color={TEXT} strokeWidth={2.4} /><Text numberOfLines={1} style={styles.primaryActionText}>{addLabel}</Text></Pressable>
    </LinearGradient>
  );
}

export default function ProfileShortVideosScreen() {
  const i18n = useI18n() as I18nHookValue;
  const profile = useProfileKernel();
  const items = useMemo(() => profile.shortVideos, [profile.shortVideos]);
  const [selected, setSelected] = useState<ProfileMediaItem | null>(null);
  const playerRef = useRef<Video | null>(null);
  const { width } = useWindowDimensions();

  const t = useCallback((key: string, fallback: string, params?: Record<string, unknown>) => {
    let value = key;
    if (typeof i18n === "function") value = i18n(key, params);
    else if (i18n && typeof i18n.t === "function") value = i18n.t(key, params);
    return typeof value === "string" && value.length && value !== key ? value : fallback;
  }, [i18n]);

  const tileWidth = useMemo(() => Math.max(138, Math.floor((Math.max(320, width - H_PADDING * 2) - GRID_GAP) / 2)), [width]);
  const tileHeight = Math.floor(tileWidth * 1.35);

  const pickVideo = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("profile.shortVideosScreen.alerts.permission.title", "Galereya ruxsati"), t("profile.shortVideosScreen.alerts.permission.message", "Galereyaga kirishga ruxsat bering."));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 1 });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    const publicVideoUri = await resolveUploadedProfileVideoUri(asset as PickedProfileVideoAsset);
    if (!publicVideoUri) return;
    const nextState = await profileKernelFacade.addShortVideo({ id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, uri: publicVideoUri, durationMs: asset.duration ?? 0, createdAt: Date.now(), thumbnailUri: "" });
    syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
  }, [t]);

  const handleRemove = useCallback(async (id: string) => {
    const nextState = await profileKernelFacade.removeShortVideo(id);
    syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
    if (selected?.id === id) setSelected(null);
  }, [selected]);

  return (
    <LinearGradient colors={[BG_TOP, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.screen}>
          <View style={styles.topBar}>
            <Pressable onPress={goBackOrProfileHome} style={styles.topButton}><ArrowLeft size={18} color={TEXT} strokeWidth={2.4} /></Pressable>
            <Text numberOfLines={1} style={styles.screenTitle}>{t("profile.shortVideosScreen.header.title", "Qisqa videolar")}</Text>
            <Pressable onPress={() => void pickVideo()} style={styles.topButton}><Camera size={18} color={TEXT} strokeWidth={2.4} /></Pressable>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={<HeaderCard count={items.length} onAddPress={() => void pickVideo()} title={t("profile.shortVideosScreen.card.title", "Qisqa videolar")} subtitle={t("profile.shortVideosScreen.card.subtitle", "Profil qatlami uchun haqiqiy qisqa videolarni qo‘shing va boshqaring.")} addLabel={t("profile.shortVideosScreen.actions.add", "Qisqa video qo‘shish")} />}
            ListEmptyComponent={<View style={styles.emptyCard}><Text style={styles.emptyTitle}>{t("profile.shortVideosScreen.empty.title", "Hali qisqa videolar yo‘q")}</Text><Text style={styles.emptyText}>{t("profile.shortVideosScreen.empty.description", "Birinchi videoni qo‘shing. U alohida to‘liq ekranli pleyerda ochiladi.")}</Text></View>}
            columnWrapperStyle={items.length ? styles.columnWrapper : undefined}
            renderItem={({ item }) => (
              <Pressable onPress={() => setSelected(item)} style={[styles.tileWrap, { width: tileWidth, height: tileHeight }]}> 
                <Video source={{ uri: item.uri }} style={styles.tileVideo} resizeMode={ResizeMode.COVER} shouldPlay={false} isLooping={false} isMuted />
                <View style={styles.playOverlay}><View style={styles.playButton}><Play size={18} color={TEXT} fill={TEXT} strokeWidth={2.4} /></View></View>
                <View style={styles.tileFooter}><Text style={styles.tileName} numberOfLines={1}>{t("profile.shortVideosScreen.item.title", "Qisqa video")}</Text><Text style={styles.tileDuration}>{formatClock(item.durationMs ?? 0)}</Text></View>
              </Pressable>
            )}
          />
        </View>

        <Modal visible={!!selected} animationType="fade" transparent statusBarTranslucent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setSelected(null)} style={styles.modalButton}><X size={18} color={TEXT} strokeWidth={2.4} /></Pressable>
              <Pressable onPress={() => selected && void handleRemove(selected.id)} style={styles.modalButtonWide}><Trash2 size={16} color={TEXT} strokeWidth={2.4} /><Text numberOfLines={1} style={styles.modalButtonText}>{t("profile.shortVideosScreen.modal.remove", "Olib tashlash")}</Text></Pressable>
            </View>
            <View style={styles.playerWrap}>{selected ? <Video ref={playerRef} source={{ uri: selected.uri }} style={styles.fullscreenVideo} resizeMode={ResizeMode.CONTAIN} useNativeControls shouldPlay isLooping={false} /> : null}</View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 }, safeArea: { flex: 1 }, screen: { flex: 1, paddingHorizontal: H_PADDING },
  topBar: { paddingTop: 6, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  topButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(12,28,25,0.86)", borderWidth: 1, borderColor: "rgba(121,228,162,0.18)", alignItems: "center", justifyContent: "center" },
  screenTitle: { flex: 1, textAlign: "center", color: TEXT, fontSize: 18, fontWeight: "900" }, listContent: { paddingBottom: 28 },
  headerCard: { borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: CARD_BORDER }, headerCardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 }, headerMainTextWrap: { flex: 1, minWidth: 0 },
  headerTitle: { color: TEXT, fontSize: 28, fontWeight: "900" }, headerSubtitle: { marginTop: 6, color: MUTED, fontSize: 13, lineHeight: 19, fontWeight: "600" }, countChip: { minHeight: 34, paddingHorizontal: 10, borderRadius: 999, backgroundColor: ACTION, borderWidth: 1, borderColor: ACTION_BORDER, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }, countChipText: { color: TEXT, fontSize: 13, fontWeight: "800" }, primaryAction: { minHeight: 46, borderRadius: 16, backgroundColor: ACTION, borderWidth: 1, borderColor: ACTION_BORDER, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 14 }, primaryActionText: { color: TEXT, fontSize: 13, fontWeight: "800" }, emptyCard: { borderRadius: 20, borderWidth: 1, borderColor: CARD_BORDER, padding: 16, backgroundColor: "rgba(8,22,17,0.84)" }, emptyTitle: { color: TEXT, fontSize: 16, fontWeight: "900" }, emptyText: { color: MUTED, fontSize: 13, lineHeight: 20, fontWeight: "600", marginTop: 8 },
  columnWrapper: { justifyContent: "space-between", marginBottom: GRID_GAP }, tileWrap: { borderRadius: 18, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.06)", marginBottom: GRID_GAP }, tileVideo: { width: "100%", height: "100%" }, playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" }, playButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(0,0,0,0.42)", alignItems: "center", justifyContent: "center" }, tileFooter: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "rgba(0,0,0,0.42)" }, tileName: { color: TEXT, fontSize: 12, fontWeight: "800" }, tileDuration: { color: MUTED, fontSize: 11, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", paddingTop: 56, paddingHorizontal: 16, paddingBottom: 24 }, modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, modalButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: ACTION, borderWidth: 1, borderColor: ACTION_BORDER, alignItems: "center", justifyContent: "center" }, modalButtonWide: { minHeight: 42, paddingHorizontal: 12, borderRadius: 14, backgroundColor: ACTION, borderWidth: 1, borderColor: ACTION_BORDER, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, modalButtonText: { color: TEXT, fontSize: 12, fontWeight: "800" }, playerWrap: { flex: 1, alignItems: "center", justifyContent: "center" }, fullscreenVideo: { width: "100%", height: "100%", maxHeight: 520 },
});
