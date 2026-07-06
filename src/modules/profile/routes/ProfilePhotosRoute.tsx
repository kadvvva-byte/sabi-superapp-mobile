import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Camera,
  Edit3,
  Images,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileKernelFacade } from "@/core/kernel/profile";
import { syncCurrentProfilePublicSurface, syncCurrentProfilePublicSurfaceToBackend } from "@/modules/messenger/public/publicProfileSync";
import { getAuthSessionState } from "@/core/kernel/auth/session.store";
import { uploadUserPublicProfileMediaFile } from "@/shared/api/user-profile-api";
import { useProfileKernel } from "@/core/kernel/profile/bindings";
import type {
  ProfileMediaItem,
  ProfilePhotoEditState,
  ProfilePhotoFilterKey,
} from "@/core/kernel/profile/core/types";
import {
  VideoMessageCaptureScreen,
  type VideoCaptureResult,
} from "@/modules/messenger/chat-room/VideoMessageCaptureScreen";
import { useI18n } from "@/shared/i18n";

const BG_TOP = "#03120C";
const BG_BOTTOM = "#06271D";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";
const ACTION = "rgba(255,255,255,0.08)";
const ACTION_BORDER = "rgba(255,255,255,0.10)";
const ACCENT = "#63E6BE";
const H_PADDING = 16;
const GRID_GAP = 8;

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | { t?: (key: string, params?: Record<string, unknown>) => string };

function goBackOrProfileHome() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/profile" as never);
}

type FilterPreset = {
  key: ProfilePhotoFilterKey;
  label: string;
  overlayColor: string;
};

function getPhotoImageStyle(edit?: ProfilePhotoEditState | null): ImageStyle {
  const safe: ProfilePhotoEditState = edit ?? {
    rotation: 0,
    flipX: false,
    flipY: false,
    filter: "none",
  };

  return {
    transform: [
      { scaleX: safe.flipX ? -1 : 1 },
      { scaleY: safe.flipY ? -1 : 1 },
      { rotate: `${safe.rotation}deg` },
    ],
  };
}

function getPhotoOverlayStyle(
  presets: FilterPreset[],
  edit?: ProfilePhotoEditState | null,
): ViewStyle | null {
  const key = edit?.filter ?? "none";
  const preset = presets.find((item) => item.key === key);
  if (!preset || preset.overlayColor === "transparent") return null;
  return { backgroundColor: preset.overlayColor };
}

type PickedProfileImageAsset = ImagePicker.ImagePickerAsset & {
  base64?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};

function resolvePickedImageMime(asset: PickedProfileImageAsset) {
  const explicit = typeof asset.mimeType === "string" && asset.mimeType.trim() ? asset.mimeType.trim() : "";
  if (explicit.startsWith("image/")) return explicit;

  const name = String(asset.fileName || asset.uri || "").toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".heic") || name.endsWith(".heif")) return "image/jpeg";
  return "image/jpeg";
}

function isLocalOnlyProfileUri(value?: string | null) {
  const uri = String(value ?? "").trim();
  return !uri || /^(file:|content:|asset:|blob:|data:)/i.test(uri);
}

async function resolveUploadedProfilePhotoUri(asset: PickedProfileImageAsset): Promise<string | null> {
  const mimeType = resolvePickedImageMime(asset);
  try {
    const uploadedUri = await uploadUserPublicProfileMediaFile(
      {
        uri: asset.uri,
        name: asset.fileName || `sabi-profile-photo-${Date.now()}.${mimeType === "image/png" ? "png" : "jpg"}`,
        mimeType,
      },
      getAuthSessionState(),
    );
    if (uploadedUri) return uploadedUri;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "unknown");
    console.warn("[profile-photos] upload skipped", message);
  }

  return null;
}


function PhotoTile({
  item,
  isAvatar,
  onPress,
  avatarBadgeLabel,
  overlayStyle,
  tileSize,
}: {
  item: ProfileMediaItem;
  isAvatar: boolean;
  onPress: () => void;
  avatarBadgeLabel: string;
  overlayStyle: ViewStyle | null;
  tileSize: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tileWrap, { width: tileSize, height: tileSize }]}
    >
      <Image
        source={{ uri: item.uri }}
        style={[styles.tile, getPhotoImageStyle(item.edit)]}
      />
      {overlayStyle ? (
        <View pointerEvents="none" style={[styles.tileOverlay, overlayStyle]} />
      ) : null}
      {isAvatar ? (
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarBadgeText}>{avatarBadgeLabel}</Text>
        </View>
      ) : null}
      <View style={styles.editBadge}>
        <Edit3 size={12} color={TEXT} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

function FilterChip({
  active,
  label,
  onPress,
}: {
  active?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function HeaderCard({
  count,
  onGalleryPress,
  onCameraFxPress,
  title,
  subtitle,
  galleryLabel,
  cameraFxLabel,
}: {
  count: number;
  onGalleryPress: () => void;
  onCameraFxPress: () => void;
  title: string;
  subtitle: string;
  galleryLabel: string;
  cameraFxLabel: string;
}) {
  return (
    <LinearGradient
      colors={["rgba(22,40,62,0.96)", "rgba(11,27,36,0.96)"]}
      style={styles.headerCard}
    >
      <View style={styles.headerCardRow}>
        <View style={styles.headerMainTextWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.countChip}>
          <Images size={14} color={TEXT} strokeWidth={2.4} />
          <Text style={styles.countChipText}>{count}</Text>
        </View>
      </View>
      <View style={styles.heroActionsRow}>
        <Pressable onPress={onGalleryPress} style={styles.primaryAction}>
          <Images size={15} color={TEXT} strokeWidth={2.4} />
          <Text numberOfLines={1} style={styles.primaryActionText}>
            {galleryLabel}
          </Text>
        </Pressable>
        <Pressable onPress={onCameraFxPress} style={styles.primaryAction}>
          <Sparkles size={15} color={TEXT} strokeWidth={2.4} />
          <Text numberOfLines={1} style={styles.primaryActionText}>
            {cameraFxLabel}
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

export default function ProfilePhotosScreen() {
  const i18n = useI18n() as I18nHookValue;
  const profile = useProfileKernel();
  const items = useMemo(() => profile.photos, [profile.photos]);
  const [selected, setSelected] = useState<ProfileMediaItem | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const { width } = useWindowDimensions();

  const t = useCallback(
    (key: string, fallback: string, params?: Record<string, unknown>) => {
      let value = key;
      if (typeof i18n === "function") value = i18n(key, params);
      else if (i18n && typeof i18n.t === "function") value = i18n.t(key, params);
      return typeof value === "string" && value.length && value !== key ? value : fallback;
    },
    [i18n],
  );

  const usableWidth = Math.max(320, width - H_PADDING * 2);
  const tileSize = useMemo(
    () => Math.max(92, Math.floor((usableWidth - GRID_GAP * 2) / 3)),
    [usableWidth],
  );

  const filterPresets = useMemo<FilterPreset[]>(
    () => [
      {
        key: "none",
        label: t("profile.photosScreen.filters.none", "Yo‘q"),
        overlayColor: "transparent",
      },
      {
        key: "warm",
        label: t("profile.photosScreen.filters.warm", "Iliq"),
        overlayColor: "rgba(255,170,94,0.16)",
      },
      {
        key: "cool",
        label: t("profile.photosScreen.filters.cool", "Sovuq"),
        overlayColor: "rgba(88,170,255,0.16)",
      },
      {
        key: "mono",
        label: t("profile.photosScreen.filters.mono", "Mono"),
        overlayColor: "rgba(160,160,160,0.20)",
      },
      {
        key: "dream",
        label: t("profile.photosScreen.filters.emerald", "Zumrad"),
        overlayColor: "rgba(45,204,153,0.16)",
      },
    ],
    [t],
  );

  const pickPhotoFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t("profile.photosScreen.alerts.permissionTitle", "Galereya ruxsati"),
        t(
          "profile.photosScreen.alerts.permissionMessage",
          "Galereyangizga kirishga ruxsat bering.",
        ),
      );
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.62,
      base64: false,
    });
    if (result.canceled) return null;
    return result.assets?.[0] ?? null;
  }, [t]);

  const handleGalleryAdd = useCallback(async () => {
    const asset = await pickPhotoFromGallery();
    if (!asset?.uri) return;
    const publicUri = await resolveUploadedProfilePhotoUri(asset as PickedProfileImageAsset);
    if (!publicUri) return;
    const previewUri = publicUri;
    let nextState = await profileKernelFacade.addPhoto({
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      uri: publicUri,
      thumbnailUri: previewUri,
      createdAt: Date.now(),
      width: asset.width ?? null,
      height: asset.height ?? null,
      edit: { rotation: 0, flipX: false, flipY: false, filter: "none" },
    });
    if (isLocalOnlyProfileUri(profile.avatarUri)) nextState = await profileKernelFacade.setAvatar(publicUri);
    syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
  }, [pickPhotoFromGallery, profile.avatarUri]);

  const handleRemove = useCallback(
    async (id: string) => {
      const nextState = await profileKernelFacade.removePhoto(id);
      syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
      if (selected?.id === id) setSelected(null);
    },
    [selected],
  );

  const selectedLive = useMemo(
    () => (selected ? profile.photos.find((item) => item.id === selected.id) ?? selected : null),
    [profile.photos, selected],
  );
  const avatarUri = profile.avatarUri ?? null;
  const handleSetAvatar = useCallback(async () => {
    if (!selectedLive?.uri) return;
    const nextState = await profileKernelFacade.setAvatar(selectedLive.uri);
    syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
  }, [selectedLive]);
  const selectedOverlayStyle = useMemo(
    () => getPhotoOverlayStyle(filterPresets, selectedLive?.edit),
    [filterPresets, selectedLive?.edit],
  );

  const handleRotateLeft = useCallback(async () => {
    if (!selectedLive) return;
    const current =
      selectedLive.edit ?? {
        rotation: 0,
        flipX: false,
        flipY: false,
        filter: "none" as ProfilePhotoFilterKey,
      };
    const nextState = await profileKernelFacade.updatePhotoEdit(selectedLive.id, {
      ...current,
      rotation: ((current.rotation - 90) % 360 + 360) % 360,
    });
    syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
  }, [selectedLive]);

  const handleRotateRight = useCallback(async () => {
    if (!selectedLive) return;
    const current =
      selectedLive.edit ?? {
        rotation: 0,
        flipX: false,
        flipY: false,
        filter: "none" as ProfilePhotoFilterKey,
      };
    const nextState = await profileKernelFacade.updatePhotoEdit(selectedLive.id, {
      ...current,
      rotation: (current.rotation + 90) % 360,
    });
    syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
  }, [selectedLive]);

  const handleToggleFlipX = useCallback(async () => {
    if (!selectedLive) return;
    const current =
      selectedLive.edit ?? {
        rotation: 0,
        flipX: false,
        flipY: false,
        filter: "none" as ProfilePhotoFilterKey,
      };
    const nextState = await profileKernelFacade.updatePhotoEdit(selectedLive.id, {
      ...current,
      flipX: !current.flipX,
    });
    syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
  }, [selectedLive]);

  const handleToggleFlipY = useCallback(async () => {
    if (!selectedLive) return;
    const current =
      selectedLive.edit ?? {
        rotation: 0,
        flipX: false,
        flipY: false,
        filter: "none" as ProfilePhotoFilterKey,
      };
    const nextState = await profileKernelFacade.updatePhotoEdit(selectedLive.id, {
      ...current,
      flipY: !current.flipY,
    });
    syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
  }, [selectedLive]);

  const handleSetFilter = useCallback(
    async (filter: ProfilePhotoFilterKey) => {
      if (!selectedLive) return;
      const current =
        selectedLive.edit ?? {
          rotation: 0,
          flipX: false,
          flipY: false,
          filter: "none" as ProfilePhotoFilterKey,
        };
      const nextState = await profileKernelFacade.updatePhotoEdit(selectedLive.id, {
        ...current,
        filter,
      });
      syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
    },
    [selectedLive],
  );

  const handleCameraCapture = useCallback(
    async (result: VideoCaptureResult) => {
      if (!result?.uri) return;
      const capturedAsset = {
        uri: result.uri,
        fileName: `sabi-profile-photo-${Date.now()}.jpg`,
        mimeType: "image/jpeg",
      } as PickedProfileImageAsset;
      const publicUri = await resolveUploadedProfilePhotoUri(capturedAsset);
      if (!publicUri) return;
      let nextState = await profileKernelFacade.addPhoto({
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        uri: publicUri,
        thumbnailUri: result.uri,
        createdAt: Date.now(),
        edit: { rotation: 0, flipX: false, flipY: false, filter: "none" },
      });
      if (isLocalOnlyProfileUri(profile.avatarUri)) nextState = await profileKernelFacade.setAvatar(publicUri);
      syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
      setCameraVisible(false);
    },
    [profile.avatarUri],
  );

  return (
    <LinearGradient colors={[BG_TOP, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.screen}>
          <View style={styles.topBar}>
            <Pressable onPress={goBackOrProfileHome} style={styles.topButton}>
              <ArrowLeft size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>
            <Text numberOfLines={1} style={styles.screenTitle}>
              {t("profile.photosScreen.header.title", "Rasmlar")}
            </Text>
            <Pressable onPress={() => setCameraVisible(true)} style={styles.topButton}>
              <Camera size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <HeaderCard
                count={items.length}
                onGalleryPress={() => void handleGalleryAdd()}
                onCameraFxPress={() => setCameraVisible(true)}
                title={t("profile.photosScreen.card.title", "Jonli profil rasmlari")}
                subtitle={t(
                  "profile.photosScreen.card.subtitle",
                  "Haqiqiy rasmlar, avatar holati, filtrlar va kamera effektlarini profil qatlami uchun boshqaring.",
                )}
                galleryLabel={t("profile.photosScreen.actions.gallery", "Galereya")}
                cameraFxLabel={t("profile.photosScreen.actions.cameraFx", "Kamera FX")}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {t("profile.photosScreen.empty.title", "Hali rasmlar yo‘q")}
                </Text>
                <Text style={styles.emptyText}>
                  {t(
                    "profile.photosScreen.empty.description",
                    "Birinchi profil rasmingizni galereyadan qo‘shing yoki effektli kamerani ishlating.",
                  )}
                </Text>
              </View>
            }
            columnWrapperStyle={items.length ? styles.columnWrapper : undefined}
            renderItem={({ item }) => (
              <PhotoTile
                item={item}
                isAvatar={avatarUri === item.uri}
                onPress={() => setSelected(item)}
                avatarBadgeLabel={t("profile.photosScreen.badges.avatar", "Avatar")}
                overlayStyle={getPhotoOverlayStyle(filterPresets, item.edit)}
                tileSize={tileSize}
              />
            )}
          />
        </View>

        <Modal visible={!!selectedLive} animationType="fade" transparent statusBarTranslucent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setSelected(null)} style={styles.modalButton}>
                <X size={18} color={TEXT} strokeWidth={2.4} />
              </Pressable>
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => void handleSetAvatar()}
                  style={styles.modalButtonWide}
                >
                  <User size={16} color={TEXT} strokeWidth={2.4} />
                  <Text numberOfLines={1} style={styles.modalButtonText}>
                    {t("profile.photosScreen.modal.actions.setAvatar", "Avatar qilish")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => (selectedLive ? void handleRemove(selectedLive.id) : undefined)}
                  style={styles.modalButtonWide}
                >
                  <Trash2 size={16} color={TEXT} strokeWidth={2.4} />
                  <Text numberOfLines={1} style={styles.modalButtonText}>
                    {t("profile.photosScreen.modal.actions.delete", "O‘chirish")}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.editorToolbar}>
              <Pressable onPress={() => void handleRotateLeft()} style={styles.editorButton}>
                <RotateCcw size={16} color={TEXT} strokeWidth={2.4} />
                <Text style={styles.editorButtonText}>
                  {t("profile.photosScreen.modal.editor.left", "Chapga")}
                </Text>
              </Pressable>
              <Pressable onPress={() => void handleRotateRight()} style={styles.editorButton}>
                <RotateCw size={16} color={TEXT} strokeWidth={2.4} />
                <Text style={styles.editorButtonText}>
                  {t("profile.photosScreen.modal.editor.right", "O‘ngga")}
                </Text>
              </Pressable>
              <Pressable onPress={() => void handleToggleFlipX()} style={styles.editorButton}>
                <Edit3 size={16} color={TEXT} strokeWidth={2.4} />
                <Text style={styles.editorButtonText}>
                  {t("profile.photosScreen.modal.editor.mirrorX", "X bo‘yicha aks")}
                </Text>
              </Pressable>
              <Pressable onPress={() => void handleToggleFlipY()} style={styles.editorButton}>
                <Edit3 size={16} color={TEXT} strokeWidth={2.4} />
                <Text style={styles.editorButtonText}>
                  {t("profile.photosScreen.modal.editor.mirrorY", "Y bo‘yicha aks")}
                </Text>
              </Pressable>
            </View>

            <View style={styles.filterRow}>
              {filterPresets.map((preset) => (
                <FilterChip
                  key={preset.key}
                  label={preset.label}
                  active={selectedLive?.edit?.filter === preset.key}
                  onPress={() => void handleSetFilter(preset.key)}
                />
              ))}
            </View>

            <View style={styles.modalImageWrap}>
              {selectedLive ? (
                <View style={styles.modalImageFrame}>
                  <Image
                    source={{ uri: selectedLive.uri }}
                    style={[styles.modalImage, getPhotoImageStyle(selectedLive.edit)]}
                    resizeMode="contain"
                  />
                  {selectedOverlayStyle ? (
                    <View pointerEvents="none" style={[styles.modalImageOverlay, selectedOverlayStyle]} />
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        </Modal>

        <VideoMessageCaptureScreen
          visible={cameraVisible}
          accent={ACCENT}
          usageMode="photo"
          onClose={() => setCameraVisible(false)}
          onCapture={handleCameraCapture}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  screen: { flex: 1, paddingHorizontal: H_PADDING },
  topBar: {
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121,228,162,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: { flex: 1, textAlign: "center", color: TEXT, fontSize: 18, fontWeight: "900" },
  listContent: { paddingBottom: 28 },
  headerCard: { borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: CARD_BORDER },
  headerCardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerMainTextWrap: { flex: 1, minWidth: 0 },
  headerTitle: { color: TEXT, fontSize: 28, fontWeight: "900" },
  headerSubtitle: { marginTop: 6, color: MUTED, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  countChip: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: ACTION,
    borderWidth: 1,
    borderColor: ACTION_BORDER,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  countChipText: { color: TEXT, fontSize: 13, fontWeight: "800" },
  heroActionsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  primaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: ACTION,
    borderWidth: 1,
    borderColor: ACTION_BORDER,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryActionText: { color: TEXT, fontSize: 13, fontWeight: "800" },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    backgroundColor: "rgba(8,22,17,0.84)",
  },
  emptyTitle: { color: TEXT, fontSize: 16, fontWeight: "900" },
  emptyText: { color: MUTED, fontSize: 13, lineHeight: 20, fontWeight: "600", marginTop: 8 },
  columnWrapper: { justifyContent: "space-between", marginBottom: GRID_GAP },
  tileWrap: { borderRadius: 18, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.06)", marginBottom: GRID_GAP },
  tile: { width: "100%", height: "100%" },
  tileOverlay: { ...StyleSheet.absoluteFillObject },
  avatarBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(7,18,12,0.84)",
  },
  avatarBadgeText: { color: TEXT, fontSize: 11, fontWeight: "800" },
  editBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(7,18,12,0.84)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  modalButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: ACTION,
    borderWidth: 1,
    borderColor: ACTION_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  modalActions: { flexDirection: "row", gap: 10, flex: 1, justifyContent: "flex-end" },
  modalButtonWide: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: ACTION,
    borderWidth: 1,
    borderColor: ACTION_BORDER,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  modalButtonText: { color: TEXT, fontSize: 12, fontWeight: "800" },
  editorToolbar: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  editorButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: ACTION,
    borderWidth: 1,
    borderColor: ACTION_BORDER,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  editorButtonText: { color: TEXT, fontSize: 12, fontWeight: "700" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: ACTION,
    borderWidth: 1,
    borderColor: ACTION_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: { backgroundColor: "rgba(99,230,190,0.16)", borderColor: "rgba(99,230,190,0.34)" },
  filterChipText: { color: TEXT, fontSize: 12, fontWeight: "700" },
  filterChipTextActive: { color: "#CFFFEF" },
  modalImageWrap: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 18 },
  modalImageFrame: {
    width: "100%",
    height: "100%",
    maxHeight: 420,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  modalImage: { width: "100%", height: "100%" },
  modalImageOverlay: { ...StyleSheet.absoluteFillObject },
});
