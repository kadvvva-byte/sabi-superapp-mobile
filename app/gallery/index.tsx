import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Vibration,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Camera, Check, Film, Globe, Images, Send, Trash2, X } from "lucide-react-native";

import GalleryViewerModal from "../../src/modules/gallery/GalleryViewerModal";
import GalleryCaptureModal from "../../src/modules/gallery/GalleryCaptureModal";
import { useI18n } from "../../src/shared/i18n";
import {
  filterGalleryItemsByAlbum,
  galleryStore,
  getGalleryMediaKind,
  sortGalleryItems,
  useGalleryItems,
} from "../../src/modules/gallery/store";
import type { GalleryAlbumKind, GalleryItem, GallerySortMode } from "../../src/modules/gallery/store";

const GRID_COLUMNS = 3;
const GRID_GAP = 1;
const BACKGROUND = "#000000";
const SURFACE = "#121212";
const SURFACE_ALT = "#1C1C1E";
const STROKE = "rgba(255,255,255,0.08)";
const TEXT = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.62)";
const ACCENT = "#0A84FF";
const ACCENT_SOFT = "rgba(10,132,255,0.18)";
const DANGER_SOFT = "rgba(255,69,58,0.18)";

type GalleryFilter = GalleryAlbumKind;

const ALBUM_FILTERS: GalleryFilter[] = ["all", "public", "private", "camera", "imported", "videos"];
const SORT_SEQUENCE: GallerySortMode[] = ["newest", "oldest", "type"];

function isVideoItem(item: Pick<GalleryItem, "uri" | "mimeType">) {
  return getGalleryMediaKind(item) === "video";
}

function applyCount(template: string, count: number) {
  return template.replace("{{count}}", String(count));
}

export default function GalleryIndexScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string; viewer?: string }>();
  const routeHandledRef = useRef<string | null>(null);

  const allItems = useGalleryItems();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [sortMode, setSortMode] = useState<GallerySortMode>("newest");
  const [captureVisible, setCaptureVisible] = useState(false);

  const items = useMemo(() => {
    return sortGalleryItems(filterGalleryItemsByAlbum(allItems, filter), sortMode);
  }, [allItems, filter, sortMode]);

  const isSelectionMode = selectedIds.length > 0;

  const tileSize = useMemo(() => {
    const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
    return Math.floor((width - totalGap) / GRID_COLUMNS);
  }, [width]);

  const counts = useMemo(() => {
    const publicCount = allItems.filter((item) => item.isPublic).length;
    return {
      all: allItems.length,
      public: publicCount,
      private: allItems.length - publicCount,
    };
  }, [allItems]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => allItems.some((item) => item.id === id)));
  }, [allItems]);

  useEffect(() => {
    if (!viewerVisible) return;
    if (!items.length) {
      setViewerVisible(false);
      setViewerIndex(0);
      return;
    }
    if (viewerIndex > items.length - 1) {
      setViewerIndex(items.length - 1);
    }
  }, [items, viewerIndex, viewerVisible]);

  useEffect(() => {
    const routeId = typeof params.id === "string" ? params.id : "";
    const shouldOpenViewer = params.viewer === "1" && !!routeId;

    if (!shouldOpenViewer) {
      routeHandledRef.current = null;
      return;
    }

    const signature = `${routeId}:${params.viewer}`;
    if (routeHandledRef.current === signature) return;

    const visibleIndex = items.findIndex((item) => item.id === routeId);
    if (visibleIndex >= 0) {
      routeHandledRef.current = signature;
      setViewerIndex(visibleIndex);
      setViewerVisible(true);
      router.replace("/gallery" as never);
      return;
    }

    const existsInAllItems = allItems.some((item) => item.id === routeId);
    if (existsInAllItems && filter !== "all") {
      setFilter("all");
    }
  }, [allItems, filter, items, params.id, params.viewer]);

  const openPicker = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t("gallery.alerts.noAccessTitle"), t("gallery.alerts.noAccessMessage"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      orderedSelection: true,
      selectionLimit: 0,
      quality: 1,
    });

    if (result.canceled) return;

    galleryStore.addItems(
      result.assets.map((asset, index) => ({
        uri: asset.uri,
        width: asset.width ?? 1,
        height: asset.height ?? 1,
        createdAt: Date.now() + index,
        updatedAt: Date.now() + index,
        isPublic: false,
        source: "imported" as const,
        filename: asset.fileName ?? null,
        mimeType: asset.mimeType ?? (asset.type === "video" ? "video/mp4" : "image/jpeg"),
      }))
    );
    void galleryStore.flushToStorage();
  }, [t]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const enterSelection = useCallback((id: string) => {
    Vibration.vibrate(8);
    setSelectedIds([id]);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((itemId) => itemId !== id);
      return [...prev, id];
    });
  }, []);

  const openViewer = useCallback(
    (id: string) => {
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return;
      setViewerIndex(index);
      setViewerVisible(true);
    },
    [items]
  );

  const shareItem = useCallback(async (item: GalleryItem) => {
    try {
      await Share.share({ url: item.uri, message: item.uri });
    } catch {}
  }, []);

  const shareSelected = useCallback(async () => {
    const selected = allItems.filter((item) => selectedIds.includes(item.id));
    if (!selected.length) return;

    try {
      if (selected.length === 1) {
        await Share.share({ url: selected[0].uri, message: selected[0].uri });
        return;
      }
      await Share.share({ message: selected.map((item) => item.uri).join("\n") });
    } catch {}
  }, [allItems, selectedIds]);

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return;
    Alert.alert(t("gallery.alerts.deleteSelectedTitle"), applyCount(t("gallery.alerts.deleteSelectedMessage"), selectedIds.length), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          galleryStore.removeItems(selectedIds);
          setSelectedIds([]);
          void galleryStore.flushToStorage();
        },
      },
    ]);
  }, [selectedIds, t]);

  const setSelectedPublic = useCallback(
    (isPublic: boolean) => {
      if (!selectedIds.length) return;
      galleryStore.setItemsPublic(selectedIds, isPublic);
      void galleryStore.flushToStorage();
    },
    [selectedIds]
  );

  const handleViewerTogglePublic = useCallback((item: GalleryItem) => {
    galleryStore.toggleItemPublic(item.id);
    void galleryStore.flushToStorage();
  }, []);

  const handleViewerDelete = useCallback(
    (item: GalleryItem) => {
      Alert.alert(t("gallery.alerts.deleteOneTitle"), t("gallery.alerts.deleteOneMessage"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            const currentIndex = items.findIndex((current) => current.id === item.id);
            const nextLength = Math.max(0, items.length - 1);
            galleryStore.removeItem(item.id);
            void galleryStore.flushToStorage();

            if (nextLength === 0) {
              setViewerVisible(false);
              setViewerIndex(0);
              return;
            }

            setViewerIndex(Math.min(Math.max(currentIndex, 0), nextLength - 1));
          },
        },
      ]);
    },
    [items, t]
  );

  const handleViewerEdit = useCallback((item: GalleryItem) => {
    setViewerVisible(false);
    router.push(`/gallery/edit?id=${encodeURIComponent(item.id)}` as never);
  }, []);

  const handleCameraCapture = useCallback((result: { uri: string; mediaKind?: "photo" | "video"; durationMs?: number | null; customEffectConfig?: unknown | null; effectId?: string; transformId?: string; effectIntensity?: number; mirrorActive?: boolean; effectsVisible?: boolean; }) => {
    const isVideo = result.mediaKind === "video";
    const nextItem = galleryStore.addItem({
      uri: result.uri,
      width: 1080,
      height: 1920,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublic: false,
      source: "camera",
      filename: isVideo ? `Sabi_video_${Date.now()}.mp4` : `Sabi_photo_${Date.now()}.jpg`,
      mimeType: isVideo ? "video/mp4" : "image/jpeg",
    });

    void galleryStore.flushToStorage();

    setCaptureVisible(false);
    setFilter("all");
    requestAnimationFrame(() => {
      const index = galleryStore.getItems().findIndex((item) => item.id === nextItem.id);
      if (index >= 0) {
        setViewerIndex(index);
        setViewerVisible(true);
      }
    });
  }, []);

  const filterLabels: Record<GalleryFilter, string> = {
    all: t("common.all"),
    public: t("common.public"),
    private: t("common.private"),
    camera: t("gallery.camera.short"),
    device: t("gallery.import"),
    imported: t("gallery.import"),
    videos: t("gallery.video"),
  };

  const filterCounts: Record<GalleryFilter, number> = {
    all: counts.all,
    public: counts.public,
    private: counts.private,
    camera: allItems.filter((item) => item.source === "camera").length,
    device: allItems.filter((item) => item.source === "device").length,
    imported: allItems.filter((item) => item.source === "imported" || item.source === "device").length,
    videos: allItems.filter((item) => isVideoItem(item)).length,
  };

  const cycleSortMode = useCallback(() => {
    setSortMode((current) => {
      const index = SORT_SEQUENCE.indexOf(current);
      return SORT_SEQUENCE[(index + 1) % SORT_SEQUENCE.length];
    });
  }, []);

  const sortSymbol = sortMode === "newest" ? "↓" : sortMode === "oldest" ? "↑" : "▦";

  const renderFilterChip = (value: GalleryFilter) => {
    const active = filter === value;
    return (
      <Pressable
        key={value}
        onPress={() => {
          setFilter(value);
          setSelectedIds([]);
        }}
        style={[styles.segmentButton, active && styles.segmentButtonActive]}
      >
        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{filterLabels[value]}</Text>
        <View style={[styles.segmentCountWrap, active && styles.segmentCountWrapActive]}>
          <Text style={[styles.segmentCount, active && styles.segmentCountActive]}>{filterCounts[value]}</Text>
        </View>
      </Pressable>
    );
  };

  const renderGridItem = useCallback(
    ({ item }: { item: GalleryItem }) => {
      const isSelected = selectedIds.includes(item.id);
      const isVideo = isVideoItem(item);

      return (
        <Pressable
          onPress={() => {
            if (isSelectionMode) {
              toggleSelection(item.id);
              return;
            }
            openViewer(item.id);
          }}
          onLongPress={() => {
            if (isSelectionMode) {
              toggleSelection(item.id);
              return;
            }
            enterSelection(item.id);
          }}
          delayLongPress={220}
          style={[styles.gridItem, { width: tileSize, height: tileSize }]}
        >
          {isVideo ? (
            <View style={styles.videoTile}>
              <Film size={20} color={TEXT} />
            </View>
          ) : (
            <Image source={{ uri: item.uri }} style={styles.gridImage} />
          )}

          {isVideo ? (
            <View style={styles.videoBadge}>
              <Film size={10} color={TEXT} />
            </View>
          ) : null}

          {item.isPublic ? (
            <View style={styles.publicDot}>
              <Globe size={10} color={TEXT} />
            </View>
          ) : null}

          {isSelected ? (
            <View style={styles.selectedBadge}>
              <Check size={13} color={TEXT} />
            </View>
          ) : null}
        </Pressable>
      );
    },
    [enterSelection, isSelectionMode, openViewer, selectedIds, tileSize, toggleSelection]
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          {!isSelectionMode ? (
            <>
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <ArrowLeft size={20} color={TEXT} />
              </Pressable>

              <View style={styles.titleWrap}>
                <Text style={styles.title} numberOfLines={1}>{t("gallery.title")}</Text>
              </View>

              <View style={styles.topActionsRow}>
                <Pressable onPress={cycleSortMode} style={styles.iconButton}>
                  <Text style={styles.sortSymbol}>{sortSymbol}</Text>
                </Pressable>
                <Pressable onPress={openPicker} style={styles.topActionButton}>
                  <Images size={17} color={ACCENT} />
                  <Text style={styles.topActionText}>{t("gallery.import")}</Text>
                </Pressable>
                <Pressable onPress={() => setCaptureVisible(true)} style={styles.iconButton}>
                  <Camera size={18} color={TEXT} />
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Pressable onPress={clearSelection} style={styles.iconButton}>
                <X size={20} color={TEXT} />
              </Pressable>
              <View style={styles.titleWrap}>
                <Text style={styles.title} numberOfLines={1}>{applyCount(t("gallery.selected"), selectedIds.length)}</Text>
              </View>
              <View style={styles.topActionsRow}>
                <Pressable onPress={shareSelected} style={styles.iconButton}>
                  <Send size={18} color={TEXT} />
                </Pressable>
                <Pressable onPress={deleteSelected} style={[styles.iconButton, styles.iconButtonDanger]}>
                  <Trash2 size={18} color="#FF453A" />
                </Pressable>
              </View>
            </>
          )}
        </View>

        {!isSelectionMode ? (
          <View style={styles.albumBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.albumScrollContent}>
              {ALBUM_FILTERS.map(renderFilterChip)}
            </ScrollView>
          </View>
        ) : null}

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Images size={36} color={MUTED} />
            <View style={styles.emptyActionsRow}>
              <Pressable onPress={openPicker} style={styles.emptyButtonPrimary}>
                <Text style={styles.emptyButtonPrimaryText}>{t("gallery.import")}</Text>
              </Pressable>
              <Pressable onPress={() => setCaptureVisible(true)} style={styles.emptyButtonSecondary}>
                <Text style={styles.emptyButtonSecondaryText}>{t("gallery.camera.short")}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderGridItem}
            numColumns={GRID_COLUMNS}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 6,
              paddingBottom: Math.max(insets.bottom, 18) + (isSelectionMode ? 82 : 18),
            }}
            columnWrapperStyle={styles.columnWrap}
          />
        )}

        {isSelectionMode ? (
          <View style={[styles.selectionBar, { bottom: Math.max(insets.bottom, 10) }] }>
            <Pressable onPress={() => setSelectedPublic(true)} style={styles.selectionAction}>
              <Globe size={17} color={TEXT} />
              <Text style={styles.selectionActionText}>{t("common.public")}</Text>
            </Pressable>
            <Pressable onPress={() => setSelectedPublic(false)} style={styles.selectionAction}>
              <Globe size={17} color={TEXT} />
              <Text style={styles.selectionActionText}>{t("common.private")}</Text>
            </Pressable>
          </View>
        ) : null}

        <GalleryViewerModal
          visible={viewerVisible}
          items={items}
          initialIndex={viewerIndex}
          onClose={() => setViewerVisible(false)}
          onTogglePublic={handleViewerTogglePublic}
          onDelete={handleViewerDelete}
          onEdit={handleViewerEdit}
          onOpenSendMenu={shareItem}
        />

        <GalleryCaptureModal
          visible={captureVisible}
          accent={ACCENT}
          onClose={() => setCaptureVisible(false)}
          onCapture={handleCameraCapture}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  safe: { flex: 1, backgroundColor: BACKGROUND },
  topBar: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingTop: 2,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: TEXT, fontSize: 20, fontWeight: "700" },
  topActionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SURFACE_ALT,
    borderWidth: 1,
    borderColor: STROKE,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDanger: { borderColor: "rgba(255,69,58,0.22)", backgroundColor: DANGER_SOFT },
  topActionButton: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: SURFACE_ALT,
    borderWidth: 1,
    borderColor: STROKE,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  topActionText: { color: TEXT, fontSize: 14, fontWeight: "600" },
  sortSymbol: { color: TEXT, fontSize: 19, fontWeight: "700", lineHeight: 21 },
  albumBar: {
    marginBottom: 8,
  },
  albumScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  segmentButton: {
    minHeight: 34,
    minWidth: 86,
    borderRadius: 17,
    paddingHorizontal: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: STROKE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  segmentButtonActive: { backgroundColor: SURFACE_ALT, borderColor: "rgba(255,255,255,0.18)" },
  segmentText: { color: MUTED, fontSize: 13, fontWeight: "600" },
  segmentTextActive: { color: TEXT },
  segmentCountWrap: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentCountWrapActive: { backgroundColor: ACCENT_SOFT },
  segmentCount: { color: MUTED, fontSize: 12, fontWeight: "700" },
  segmentCountActive: { color: TEXT },
  columnWrap: { gap: GRID_GAP, marginBottom: GRID_GAP },
  gridItem: { backgroundColor: SURFACE, overflow: "hidden" },
  gridImage: { width: "100%", height: "100%", resizeMode: "cover" },
  videoTile: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#111113" },
  videoBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  publicDot: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 14 },
  emptyActionsRow: { flexDirection: "row", gap: 12, marginTop: 2 },
  emptyButtonPrimary: { minWidth: 104, height: 40, borderRadius: 20, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  emptyButtonSecondary: { minWidth: 104, height: 40, borderRadius: 20, backgroundColor: SURFACE_ALT, borderWidth: 1, borderColor: STROKE, alignItems: "center", justifyContent: "center" },
  emptyButtonPrimaryText: { color: TEXT, fontSize: 15, fontWeight: "600" },
  emptyButtonSecondaryText: { color: TEXT, fontSize: 15, fontWeight: "600" },
  selectionBar: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(28,28,30,0.96)",
    borderWidth: 1,
    borderColor: STROKE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    gap: 6,
  },
  selectionAction: { flex: 1, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  selectionActionText: { color: TEXT, fontSize: 13, fontWeight: "600" },
});
