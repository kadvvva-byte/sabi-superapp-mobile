import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av";
import {
  ArrowLeft,
  Globe,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react-native";

import { useI18n } from "../../shared/i18n";
import { GalleryItem } from "./store";

type Props = {
  visible: boolean;
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
  onTogglePublic: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
  onEdit: (item: GalleryItem) => void;
  onOpenSendMenu: (item: GalleryItem) => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BLACK = "#000000";
const TEXT = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.72)";
const BAR = "rgba(18,18,20,0.82)";
const MENU = "rgba(28,28,30,0.96)";
const STROKE = "rgba(255,255,255,0.10)";
const ACCENT = "#0A84FF";
const DANGER = "#FF453A";

function isVideoItem(item: GalleryItem) {
  if (item.mimeType?.startsWith("video/")) return true;
  const uri = item.uri.toLowerCase();
  return uri.endsWith(".mp4") || uri.endsWith(".mov") || uri.endsWith(".m4v") || uri.endsWith(".webm");
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function GalleryVideoPlayer({
  item,
  active,
  bottomOffset,
  chromeVisible,
}: {
  item: GalleryItem;
  active: boolean;
  bottomOffset: number;
  chromeVisible: boolean;
}) {
  const videoRef = useRef<Video | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [didFinish, setDidFinish] = useState(false);

  useEffect(() => {
    if (!active) {
      void videoRef.current?.pauseAsync().catch(() => undefined);
    }
  }, [active]);

  const onStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsLoaded(false);
      setIsPlaying(false);
      return;
    }

    setIsLoaded(true);
    setIsPlaying(Boolean(status.isPlaying));
    setPositionMs(status.positionMillis ?? 0);
    setDurationMs(status.durationMillis ?? 0);

    if (status.didJustFinish) {
      setDidFinish(true);
      setIsPlaying(false);
    } else if (status.isPlaying) {
      setDidFinish(false);
    }
  };

  const playFromStart = async () => {
    const player = videoRef.current;
    if (!player || !isLoaded) return;

    try {
      await player.setPositionAsync(0);
      setPositionMs(0);
      setDidFinish(false);
      await player.playAsync();
    } catch {}
  };

  const togglePlayback = async () => {
    const player = videoRef.current;
    if (!player || !isLoaded) return;

    try {
      if (isPlaying) {
        await player.pauseAsync();
        return;
      }

      const isAtEnd = durationMs > 0 && positionMs >= durationMs - 250;
      if (didFinish || isAtEnd) {
        await playFromStart();
        return;
      }

      setDidFinish(false);
      await player.playAsync();
    } catch {}
  };

  const replay = async () => {
    await playFromStart();
  };

  const seekBy = async (deltaMs: number) => {
    const player = videoRef.current;
    if (!player || !isLoaded) return;

    try {
      const maxPosition = durationMs > 0 ? durationMs : Number.MAX_SAFE_INTEGER;
      const nextPosition = Math.min(maxPosition, Math.max(0, positionMs + deltaMs));
      await player.setPositionAsync(nextPosition);
      setPositionMs(nextPosition);
      if (nextPosition < maxPosition - 250) setDidFinish(false);
    } catch {}
  };

  const progress = durationMs > 0 ? Math.min(100, Math.max(0, (positionMs / durationMs) * 100)) : 0;

  return (
    <View style={styles.page}>
      <Video
        ref={(ref) => {
          videoRef.current = ref;
        }}
        source={{ uri: item.uri }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={active}
        isLooping={false}
        useNativeControls={false}
        onPlaybackStatusUpdate={onStatusUpdate}
      />

      {!isPlaying ? (
        <Pressable onPress={togglePlayback} style={styles.centerPlayButton} disabled={!isLoaded}>
          <Play size={34} color={TEXT} fill={TEXT} />
        </Pressable>
      ) : null}

      {chromeVisible ? (
        <View style={[styles.playerControls, { bottom: bottomOffset + 72 }] }>
          <View style={styles.playerMainRow}>
            <Pressable onPress={() => seekBy(-10000)} style={styles.seekButton} disabled={!isLoaded}>
              <Text style={styles.seekButtonText}>−10</Text>
            </Pressable>

            <Pressable onPress={togglePlayback} style={styles.playerButton} disabled={!isLoaded}>
              {isPlaying ? <Pause size={19} color={TEXT} fill={TEXT} /> : <Play size={19} color={TEXT} fill={TEXT} />}
            </Pressable>

            <Pressable onPress={() => seekBy(10000)} style={styles.seekButton} disabled={!isLoaded}>
              <Text style={styles.seekButtonText}>+10</Text>
            </Pressable>

            <Pressable onPress={replay} style={styles.playerReplayButton} disabled={!isLoaded}>
              <RotateCcw size={18} color={TEXT} />
            </Pressable>
          </View>

          <View style={styles.timelineWrap}>
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.timeText}>{`${formatTime(positionMs)} / ${formatTime(durationMs)}`}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function GalleryImageSlide({ item }: { item: GalleryItem }) {
  return (
    <View style={styles.page}>
      <Image source={{ uri: item.uri }} style={styles.imageFill} resizeMode="cover" />
    </View>
  );
}

export default function GalleryViewerModal({
  visible,
  items,
  initialIndex,
  onClose,
  onTogglePublic,
  onDelete,
  onEdit,
  onOpenSendMenu,
}: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<GalleryItem> | null>(null);
  const [index, setIndex] = useState(initialIndex);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setIndex(initialIndex);
    setChromeVisible(true);
    setMenuVisible(false);
  }, [initialIndex, visible]);

  useEffect(() => {
    if (!visible || !items.length) return;

    requestAnimationFrame(() => {
      try {
        listRef.current?.scrollToIndex({
          index: Math.min(initialIndex, items.length - 1),
          animated: false,
        });
      } catch {}
    });
  }, [initialIndex, items.length, visible]);

  const currentItem = items[index] ?? null;
  const bottomOffset = useMemo(() => Math.max(insets.bottom, 14), [insets.bottom]);
  const topOffset = useMemo(() => Math.max(insets.top, 8), [insets.top]);

  const handleMediaTap = () => {
    if (menuVisible) {
      setMenuVisible(false);
      return;
    }
    setChromeVisible((prev) => !prev);
  };

  const runMenuAction = (action: () => void) => {
    setMenuVisible(false);
    action();
  };

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.screen}>
        <StatusBar hidden backgroundColor={BLACK} />

        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index: itemIndex }) => (
            <View style={styles.pageFrame}>
              {isVideoItem(item) ? (
                <GalleryVideoPlayer
                  item={item}
                  active={visible && itemIndex === index}
                  bottomOffset={bottomOffset}
                  chromeVisible={chromeVisible && !menuVisible}
                />
              ) : (
                <GalleryImageSlide item={item} />
              )}
              <Pressable style={styles.tapLayer} onPress={handleMediaTap} />
            </View>
          )}
          getItemLayout={(_, itemIndex) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * itemIndex, index: itemIndex })}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setIndex(Math.max(0, Math.min(items.length - 1, nextIndex)));
            setMenuVisible(false);
          }}
          onScrollToIndexFailed={() => {}}
        />

        {chromeVisible ? (
          <View style={[styles.topBar, { top: topOffset }] }>
            <Pressable onPress={onClose} style={styles.navButton} accessibilityLabel={t("common.back")}>
              <ArrowLeft size={21} color={TEXT} />
            </Pressable>
            <Text style={styles.counter}>{items.length ? `${index + 1} / ${items.length}` : "0 / 0"}</Text>
            <Pressable
              onPress={() => setMenuVisible((prev) => !prev)}
              style={styles.navButton}
              disabled={!currentItem}
              accessibilityLabel={t("common.settings")}
            >
              <MoreHorizontal size={22} color={TEXT} />
            </Pressable>
          </View>
        ) : null}

        {chromeVisible && menuVisible && currentItem ? (
          <View style={[styles.menuCard, { top: topOffset + 46 }] }>
            <Pressable onPress={() => runMenuAction(() => onOpenSendMenu(currentItem))} style={styles.menuRow}>
              <Send size={18} color={TEXT} />
              <Text style={styles.menuText}>{t("common.share")}</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable onPress={() => runMenuAction(() => onEdit(currentItem))} style={styles.menuRow}>
              <Pencil size={18} color={TEXT} />
              <Text style={styles.menuText}>{t("common.edit")}</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable onPress={() => runMenuAction(() => onTogglePublic(currentItem))} style={styles.menuRow}>
              <Globe size={18} color={currentItem.isPublic ? ACCENT : TEXT} />
              <Text style={styles.menuText}>{currentItem.isPublic ? t("common.private") : t("common.public")}</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable onPress={() => runMenuAction(() => onDelete(currentItem))} style={styles.menuRow}>
              <Trash2 size={18} color={DANGER} />
              <Text style={[styles.menuText, styles.menuDanger]}>{t("common.delete")}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BLACK },
  pageFrame: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: BLACK },
  page: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, alignItems: "center", justifyContent: "center", backgroundColor: BLACK },
  tapLayer: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
  imageFill: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: BLACK },
  video: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: BLACK },
  topBar: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 40,
    zIndex: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BAR,
    borderWidth: 1,
    borderColor: STROKE,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: { color: TEXT, fontSize: 15, fontWeight: "600" },
  menuCard: {
    position: "absolute",
    right: 10,
    zIndex: 50,
    width: 188,
    borderRadius: 16,
    backgroundColor: MENU,
    borderWidth: 1,
    borderColor: STROKE,
    overflow: "hidden",
  },
  menuRow: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: { flex: 1, color: TEXT, fontSize: 15, fontWeight: "600" },
  menuDanger: { color: DANGER },
  menuDivider: { height: 1, marginLeft: 44, backgroundColor: "rgba(255,255,255,0.08)" },
  centerPlayButton: {
    position: "absolute",
    left: SCREEN_WIDTH / 2 - 34,
    top: SCREEN_HEIGHT / 2 - 34,
    zIndex: 20,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(18,18,20,0.70)",
    borderWidth: 1,
    borderColor: STROKE,
    alignItems: "center",
    justifyContent: "center",
  },
  playerControls: {
    position: "absolute",
    left: 14,
    right: 14,
    zIndex: 28,
    minHeight: 76,
    borderRadius: 18,
    backgroundColor: BAR,
    borderWidth: 1,
    borderColor: STROKE,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  playerMainRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  playerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
  },
  seekButton: {
    minWidth: 46,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  seekButtonText: { color: TEXT, fontSize: 13, fontWeight: "700" },
  playerReplayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  timelineWrap: { gap: 5 },
  timelineTrack: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden" },
  timelineFill: { height: 4, borderRadius: 2, backgroundColor: TEXT },
  timeText: { color: MUTED, fontSize: 10, fontWeight: "600", textAlign: "center" },
});
