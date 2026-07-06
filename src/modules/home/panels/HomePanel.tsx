import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  Camera,
  Car,
  Cast,
  Coins,
  CreditCard,
  FileText,
  Gamepad2,
  Globe,
  Hotel,
  Image as ImageIcon,
  LayoutGrid,
  MessageCircle,
  Mic2,
  Minus,
  Phone,
  QrCode,
  Radio,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  UtensilsCrossed,
  Warehouse
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { homeKernelFacade } from "../../../core/kernel/home";
import { useHomeKernel } from "../../../core/kernel/home/bindings";
import { useI18n } from "../../../shared/i18n";
import { useHomeMobileText } from "../../../shared/i18n/home-mobile-translations";
import { getSabiMobilePolicy, isHomeCryptoPanelVisibleForSabiPolicy, isMiniAppKindVisibleForSabiPolicy } from "../../../shared/policy/sabiMobilePolicy";
import { localizeSilkRoadMiniAppItem } from "../../marketplace/presentation/marketplace.i18n";
import { useAppearance } from "../../../theme/AppearanceProvider";
import HomeFoundationStrip from "../components/HomeFoundationStrip";
import { useHomeEditMode } from "../HomeEditModeProvider";
import { type MiniAppItem, useHomeLayout } from "../HomeLayoutProvider";

const GRID_COLUMNS = 4;
const GRID_GAP = 6;
const LONG_PRESS_DELAY = 240;
const DRAG_START_THRESHOLD = 8;
const DOCK_HEIGHT = 64;
const TOP_BAR_FIXED_HEIGHT = 58;
const TOP_BAR_TOUCH_OFFSET = 34;
const MESSENGER_EDGE_SWIPE_ZONE = 28;
const MESSENGER_EDGE_SWIPE_TRIGGER = 72;
const HOME_BACKGROUND_DIR_NAME = "sabi-home-background";


type FiatCurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CNY"
  | "KRW"
  | "CHF"
  | "CAD"
  | "AUD"
  | "SGD"
  | "AED"
  | "TRY"
  | "RUB"
  | "INR"
  | "UZS";

type FiatRate = {
  code: FiatCurrencyCode;
  price: string;
  change: string;
};

type CryptoRate = {
  code: string;
  price: string;
  change: string;
};

type PositionsMap = Record<string, number>;

type HomeCardType = "widget" | "miniapp";

type HomeCard = {
  id: string;
  title: string;
  type: HomeCardType;
  kind: string;
  visualKey?: string;
  removable?: boolean;
};

type DockItem = {
  id: string;
  kind: "call" | "chat" | "wallet" | "mini_apps";
};

const STATIC_HOME_CARDS: HomeCard[] = [
  { id: "widget-messenger", title: "Messenger", type: "widget", kind: "messenger", removable: true },
  { id: "widget-sabipay", title: "SabiPay", type: "widget", kind: "sabipay", removable: true },
  { id: "widget-qr", title: "QR", type: "widget", kind: "qr", removable: true },
  { id: "widget-cards", title: "Cards", type: "widget", kind: "cards", removable: true },
  { id: "widget-notifications", title: "Alerts", type: "widget", kind: "notifications", removable: true },
  { id: "widget-ai", title: "AI", type: "widget", kind: "ai", removable: true },
  { id: "widget-ai-voice", title: "SABI Voice", type: "widget", kind: "ai_voice", visualKey: "ai_voice", removable: true },
  { id: "widget-gallery", title: "Gallery", type: "widget", kind: "gallery", removable: true },
  { id: "widget-games", title: "Game Center", type: "widget", kind: "games", removable: true },
  { id: "widget-marketplace", title: "SilkRoad", type: "widget", kind: "marketplace", removable: true },
  { id: "widget-supermarket", title: "Supermarket", type: "widget", kind: "supermarket", removable: true },
  { id: "widget-hotels", title: "Hotels", type: "widget", kind: "hotels", visualKey: "hotels", removable: true },
  { id: "widget-food-delivery", title: "Food", type: "widget", kind: "food_delivery", visualKey: "food", removable: true },
  { id: "widget-wholesale-market", title: "Wholesale", type: "widget", kind: "wholesale_market", visualKey: "wholesale", removable: true },
  { id: "widget-taxi", title: "Taxi", type: "widget", kind: "taxi", removable: true },
  { id: "widget-stream", title: "Stream", type: "widget", kind: "stream", removable: true },
  { id: "widget-events", title: "Events", type: "widget", kind: "events", removable: true },
  { id: "widget-settings", title: "Settings", type: "widget", kind: "settings", removable: true },
  { id: "widget-cast", title: "Wi‑Fi Cast", type: "widget", kind: "cast", removable: true },
];

const MOBILE_DOCK_ITEMS: DockItem[] = [
  { id: "dock-call", kind: "call" },
  { id: "dock-chat", kind: "chat" },
  { id: "dock-wallet", kind: "wallet" },
];

const WEB_DOCK_ITEMS: DockItem[] = [
  { id: "dock-call", kind: "call" },
  { id: "dock-chat", kind: "chat" },
  { id: "dock-wallet", kind: "wallet" },
  { id: "dock-more", kind: "mini_apps" },
];

const FIAT_RATES: FiatRate[] = [
  "USD", "EUR", "GBP", "JPY", "CNY", "KRW", "CHF", "CAD", "AUD", "SGD", "AED", "TRY", "RUB", "INR", "UZS",
].map((code) => ({ code: code as FiatCurrencyCode, price: "—", change: "—" }));

const CRYPTO_RATES: CryptoRate[] = [
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "TON", "TRX", "DOT", "AVAX", "USDT",
].map((code) => ({ code, price: "—", change: "—" }));

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.max(min, Math.min(value, max));
}

function resolveBackgroundFileExtension(uri: string) {
  const clean = uri.split("?")[0]?.split("#")[0] ?? "";
  const extension = clean.split(".").pop()?.toLowerCase() ?? "";

  if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return extension;
  }

  return "jpg";
}

async function persistHomeBackgroundImage(sourceUri: string) {
  const uri = String(sourceUri ?? "").trim();

  if (!uri || Platform.OS === "web") {
    return uri || null;
  }

  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!baseDir) {
    return uri;
  }

  const targetDir = `${baseDir}${HOME_BACKGROUND_DIR_NAME}/`;
  const extension = resolveBackgroundFileExtension(uri);
  const targetUri = `${targetDir}background-${Date.now()}.${extension}`;

  try {
    await FileSystem.deleteAsync(targetDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    await FileSystem.copyAsync({ from: uri, to: targetUri });
    return targetUri;
  } catch {
    return uri;
  }
}

function buildPositions(ids: string[]): PositionsMap {
  return ids.reduce<PositionsMap>((acc, id, index) => {
    acc[id] = index;
    return acc;
  }, {});
}

function getItemPosition(index: number, itemWidth: number, itemHeight: number) {
  "worklet";
  const row = Math.floor(index / GRID_COLUMNS);
  const col = index % GRID_COLUMNS;

  return {
    x: col * (itemWidth + GRID_GAP),
    y: row * (itemHeight + GRID_GAP),
  };
}

function getIndexFromPosition(
  x: number,
  y: number,
  itemWidth: number,
  itemHeight: number,
  count: number,
) {
  "worklet";
  const col = clamp(Math.round(x / (itemWidth + GRID_GAP)), 0, GRID_COLUMNS - 1);
  const row = Math.max(0, Math.round(y / (itemHeight + GRID_GAP)));
  const index = row * GRID_COLUMNS + col;
  return clamp(index, 0, Math.max(0, count - 1));
}

function movePositionMap(map: PositionsMap, from: number, to: number): PositionsMap {
  "worklet";
  if (from === to) return map;

  const next = { ...map };

  Object.keys(next).forEach((id) => {
    const value = next[id];

    if (value === from) {
      next[id] = to;
      return;
    }

    if (from < to && value > from && value <= to) {
      next[id] = value - 1;
      return;
    }

    if (from > to && value >= to && value < from) {
      next[id] = value + 1;
    }
  });

  return next;
}

function sortIdsByPositions(ids: string[], positions: PositionsMap) {
  return [...ids].sort((a, b) => (positions[a] ?? 0) - (positions[b] ?? 0));
}

function areStringArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

function mergeVisibleDockOrderWithPreservedIds(
  visibleOrder: string[],
  currentOrder: string[],
  visibleIds: string[],
) {
  const visibleSet = new Set(visibleIds);
  const nextSet = new Set(visibleOrder);
  const preserved = currentOrder.filter((id) => !visibleSet.has(id) && !nextSet.has(id));
  return [...visibleOrder, ...preserved];
}

function getMiniAppVisualKey(item: MiniAppItem) {
  const maybeVisualKey = (item as MiniAppItem & { visualKey?: string }).visualKey;
  return String(maybeVisualKey ?? item.kind).trim() || item.kind;
}

function getMiniAppGradient(kind: string): [string, string, ...string[]] {
  switch (kind.toLowerCase()) {
    case "messenger":
      return ["#0F766E", "#14B8A6", "#99F6E4"];
    case "sabipay":
      return ["#2450B8", "#3B82F6", "#8EC5FF"];
    case "wallet":
      return ["#2450B8", "#3B82F6", "#8EC5FF"];
    case "qr":
      return ["#2E9C88", "#47C98F", "#A7F0C8"];
    case "cards":
      return ["#133B80", "#2563EB", "#93C5FD"];
    case "marketplace":
      return ["#D66A1E", "#F59E0B", "#FFE18A"];
    case "merchant":
      return ["#B45309", "#F59E0B", "#FCD34D"];
    case "business":
      return ["#1D4ED8", "#3B82F6", "#93C5FD"];
    case "supermarket":
      return ["#047857", "#10B981", "#A7F3D0"];
    case "hotels":
    case "hotel":
      return ["#4338CA", "#7C3AED", "#C4B5FD"];
    case "wholesale":
    case "wholesale_market":
      return ["#1E3A5F", "#3B82F6", "#BAE6FD"];
    case "notifications":
    case "events":
      return ["#334155", "#64748B", "#E2E8F0"];
    case "stream":
      return ["#7E22CE", "#A855F7", "#F0ABFC"];
    case "delivery":
      return ["#0369A1", "#38BDF8", "#BAE6FD"];
    case "ai":
    case "bot":
      return ["#5B44C8", "#7C6DFF", "#AAC2FF"];
    case "ai_voice":
      return ["#25105C", "#7C3AED", "#DDD6FE"];
    case "gallery":
      return ["#7C3AED", "#A855F7", "#F0ABFC"];
    case "settings":
    case "manage":
      return ["#334155", "#475569", "#CBD5E1"];
    case "cast":
      return ["#0F766E", "#14B8A6", "#7DD3FC"];
    case "games":
      return ["#2563EB", "#38BDF8", "#BAE6FD"];
    case "camera":
      return ["#3B3F46", "#6B7280", "#D1D5DB"];
    case "documents":
    case "files":
      return ["#0F766E", "#14B8A6", "#99F6E4"];
    case "food":
    case "food_delivery":
      return ["#F04A2F", "#FB7A2F", "#FFBE75"];
    case "taxi":
      return ["#C38A00", "#EAB308", "#FFE480"];
    case "mini_apps":
      return ["#0F172A", "#334155", "#94A3B8"];
    case "web":
      return ["#2450B8", "#3B82F6", "#8EC5FF"];
    default:
      return ["#475569", "#64748B", "#CBD5E1"];
  }
}

function getHomeCardIcon(kind: string) {
  switch (kind.toLowerCase()) {
    case "messenger":
      return MessageCircle;
    case "sabipay":
      return ArrowUpRight;
    case "wallet":
    case "cards":
      return CreditCard;
    case "qr":
      return QrCode;
    case "marketplace":
      return Store;
    case "merchant":
      return BadgeDollarSign;
    case "business":
      return Building2;
    case "supermarket":
      return ShoppingCart;
    case "hotels":
    case "hotel":
      return Hotel;
    case "wholesale":
    case "wholesale_market":
      return Warehouse;
    case "notifications":
      return Bell;
    case "events":
      return CalendarDays;
    case "stream":
      return Radio;
    case "delivery":
      return Truck;
    case "ai":
    case "bot":
      return Bot;
    case "ai_voice":
      return Mic2;
    case "gallery":
      return ImageIcon;
    case "settings":
    case "manage":
      return Settings;
    case "cast":
      return Cast;
    case "games":
      return Gamepad2;
    case "camera":
      return Camera;
    case "documents":
    case "files":
      return FileText;
    case "food":
    case "food_delivery":
      return UtensilsCrossed;
    case "taxi":
      return Car;
    case "mini_apps":
      return LayoutGrid;
    case "web":
      return Globe;
    default:
      return LayoutGrid;
  }
}

function getDockIcon(kind: DockItem["kind"]) {
  switch (kind) {
    case "call":
      return Phone;
    case "chat":
      return MessageCircle;
    case "wallet":
      return CreditCard;
    case "mini_apps":
      return LayoutGrid;
  }
}

type DraggableCardProps = {
  itemId: string;
  title: string;
  kind: string;
  visualKey?: string;
  itemWidth: number;
  itemHeight: number;
  itemCount: number;
  borderColor: string;
  positions: SharedValue<PositionsMap>;
  isEditMode: boolean;
  removable?: boolean;
  onDragStart: () => void;
  onDragEnd: (positions: PositionsMap, itemId: string) => void;
  onPress: () => void;
  onRemove: () => void;
};

function DraggableCard({
  itemId,
  title,
  kind,
  visualKey,
  itemWidth,
  itemHeight,
  itemCount,
  borderColor,
  positions,
  isEditMode,
  removable = true,
  onDragStart,
  onDragEnd,
  onPress,
  onRemove,
}: DraggableCardProps) {
  const resolvedVisualKey = (visualKey ?? kind).toLowerCase();
  const Icon = getHomeCardIcon(resolvedVisualKey);
  const colors = getMiniAppGradient(resolvedVisualKey);

  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_DELAY)
    .onStart(() => {
      const currentIndex = positions.value[itemId] ?? 0;
      const currentPosition = getItemPosition(currentIndex, itemWidth, itemHeight);

      isDragging.value = true;
      startX.value = currentPosition.x;
      startY.value = currentPosition.y;
      dragX.value = currentPosition.x;
      dragY.value = currentPosition.y;

      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      const nextX = startX.value + event.translationX;
      const nextY = startY.value + event.translationY;

      dragX.value = nextX;
      dragY.value = nextY;

      if (
        Math.abs(event.translationX) <= DRAG_START_THRESHOLD &&
        Math.abs(event.translationY) <= DRAG_START_THRESHOLD
      ) {
        return;
      }

      const currentIndex = positions.value[itemId] ?? 0;
      const nextIndex = getIndexFromPosition(nextX, nextY, itemWidth, itemHeight, itemCount);

      if (currentIndex !== nextIndex) {
        positions.value = movePositionMap(positions.value, currentIndex, nextIndex);
      }
    })
    .onEnd(() => {
      const finalIndex = positions.value[itemId] ?? 0;
      const finalPosition = getItemPosition(finalIndex, itemWidth, itemHeight);

      dragX.value = withSpring(finalPosition.x);
      dragY.value = withSpring(finalPosition.y);

      runOnJS(onDragEnd)(positions.value, itemId);
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const index = positions.value[itemId] ?? 0;
    const target = getItemPosition(index, itemWidth, itemHeight);

    return {
      position: "absolute",
      width: itemWidth,
      height: itemHeight,
      left: isDragging.value ? dragX.value : withSpring(target.x),
      top: isDragging.value ? dragY.value : withSpring(target.y),
      transform: [{ scale: isDragging.value ? withSpring(1.03) : pressScale.value }],
      zIndex: isDragging.value ? 30 : 1,
      shadowOpacity: isDragging.value ? 0.24 : 0.12,
      shadowRadius: isDragging.value ? 16 : 8,
      shadowOffset: { width: 0, height: isDragging.value ? 10 : 5 },
      elevation: isDragging.value ? 10 : 3,
      shadowColor: "#000000",
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.gridCard, animatedStyle]}>
        {isEditMode && removable ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.removeBadge}
            onPress={onRemove}
          >
            <Minus size={12} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        ) : null}

        <Pressable
          style={styles.gridCardPressable}
          onPress={() => {
            if (!isEditMode) onPress();
          }}
          onPressIn={() => {
            pressScale.value = withSpring(0.975, { damping: 15, stiffness: 230 });
          }}
          onPressOut={() => {
            pressScale.value = withSpring(1, { damping: 15, stiffness: 230 });
          }}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gridCardGradient, { borderColor }]}
          >
            <View style={styles.gridCardOverlay} />
            <View style={styles.gridCardGlow} />
            <Icon size={22} color="#FFFFFF" strokeWidth={2.3} />
            <Text style={styles.gridCardTitle}>{title}</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

type DraggableDockProps = {
  item: DockItem;
  itemWidth: number;
  itemHeight: number;
  itemCount: number;
  positions: SharedValue<PositionsMap>;
  onDragEnd: (positions: PositionsMap, itemId: string) => void;
  onPress: () => void;
};

function DraggableDock({
  item,
  itemWidth,
  itemHeight,
  itemCount,
  positions,
  onDragEnd,
  onPress,
}: DraggableDockProps) {
  const Icon = getDockIcon(item.kind);
  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_DELAY)
    .onStart(() => {
      const currentIndex = positions.value[item.id] ?? 0;
      const currentPosition = getItemPosition(currentIndex, itemWidth, itemHeight);

      isDragging.value = true;
      startX.value = currentPosition.x;
      startY.value = currentPosition.y;
      dragX.value = currentPosition.x;
      dragY.value = currentPosition.y;
    })
    .onUpdate((event) => {
      const nextX = startX.value + event.translationX;
      const nextY = startY.value + event.translationY;

      dragX.value = nextX;
      dragY.value = nextY;

      const currentIndex = positions.value[item.id] ?? 0;
      const nextIndex = getIndexFromPosition(nextX, nextY, itemWidth, itemHeight, itemCount);

      if (currentIndex !== nextIndex) {
        positions.value = movePositionMap(positions.value, currentIndex, nextIndex);
      }
    })
    .onEnd(() => {
      const finalIndex = positions.value[item.id] ?? 0;
      const finalPosition = getItemPosition(finalIndex, itemWidth, itemHeight);

      dragX.value = withSpring(finalPosition.x);
      dragY.value = withSpring(finalPosition.y);

      runOnJS(onDragEnd)(positions.value, item.id);
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const index = positions.value[item.id] ?? 0;
    const target = getItemPosition(index, itemWidth, itemHeight);

    return {
      position: "absolute",
      width: itemWidth,
      height: itemHeight,
      left: isDragging.value ? dragX.value : withSpring(target.x),
      top: isDragging.value ? dragY.value : withSpring(target.y),
      transform: [{ scale: isDragging.value ? withSpring(1.03) : pressScale.value }],
      zIndex: isDragging.value ? 20 : 1,
      shadowOpacity: isDragging.value ? 0.24 : 0.1,
      shadowRadius: isDragging.value ? 12 : 6,
      shadowOffset: { width: 0, height: isDragging.value ? 8 : 4 },
      elevation: isDragging.value ? 8 : 2,
      shadowColor: "#000000",
    };
  });

  const dockButton = (
    <Animated.View style={[styles.dockCard, animatedStyle]}>
      <Pressable
        style={styles.dockPressable}
        onPress={onPress}
        onPressIn={() => {
          pressScale.value = withSpring(0.975, { damping: 15, stiffness: 230 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 15, stiffness: 230 });
        }}
      >
        <LinearGradient
          colors={["#4A515C", "#313842", "#232A33"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dockCardGradient}
        >
          <View style={styles.dockOverlay} />
          <Icon size={20} color="#FFFFFF" strokeWidth={2.3} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  if (Platform.OS === "web") {
    return dockButton;
  }

  return <GestureDetector gesture={gesture}>{dockButton}</GestureDetector>;
}

function HeroInfoPanel({
  title,
  symbol,
  value,
  change,
  kind,
  accent,
  transparentMode,
  signalLabel,
}: {
  title: string;
  symbol: string;
  value: string;
  change: string;
  kind: "forex" | "crypto";
  accent: string;
  transparentMode: boolean;
  signalLabel: string;
}) {
  const Icon = kind === "forex" ? TrendingUp : Coins;
  const positive = !change.startsWith("-");
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  const gradientColors =
    kind === "forex"
      ? transparentMode
        ? (["rgba(8,18,30,0.74)", "rgba(14,34,56,0.64)", "rgba(93,163,255,0.22)"] as const)
        : (["rgba(10,20,34,0.92)", "rgba(18,42,68,0.78)", "rgba(93,163,255,0.28)"] as const)
      : transparentMode
      ? (["rgba(24,14,38,0.74)", "rgba(48,22,78,0.64)", "rgba(168,85,247,0.22)"] as const)
      : (["rgba(28,16,42,0.94)", "rgba(59,25,92,0.78)", "rgba(168,85,247,0.28)"] as const);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.marketPanel}
    >
      <View style={styles.marketPanelGlass} />
      <View
        style={[
          styles.marketPanelGlow,
          {
            backgroundColor:
              kind === "forex" ? "rgba(93,163,255,0.16)" : "rgba(168,85,247,0.16)",
          },
        ]}
      />
      <View style={styles.marketPanelTop}>
        <View style={styles.marketPanelHeader}>
          <View
            style={[
              styles.marketIconWrap,
              {
                backgroundColor:
                  kind === "forex" ? "rgba(93,163,255,0.18)" : "rgba(168,85,247,0.18)",
                borderColor:
                  kind === "forex" ? "rgba(93,163,255,0.22)" : "rgba(168,85,247,0.22)",
              },
            ]}
          >
            <Icon size={15} color="#FFFFFF" strokeWidth={2.3} />
          </View>

          <View>
            <Text style={styles.marketTitle}>{title}</Text>
            <Text style={styles.marketSymbol}>{symbol}</Text>
          </View>
        </View>

        <View
          style={[
            styles.marketChangeBadge,
            positive ? styles.marketChangePositive : styles.marketChangeNegative,
          ]}
        >
          <TrendIcon size={11} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.marketChangeText}>{change}</Text>
        </View>
      </View>

      <View style={styles.marketFooter}>
        <Text style={styles.marketValue}>{value}</Text>
        <View style={styles.marketMetaRow}>
          <TrendingUp size={11} color={accent} strokeWidth={2.2} />
          <Text style={styles.marketMetaText}>{signalLabel}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export default function HomePanel() {
  const insets = useSafeAreaInsets();
  const home = useHomeKernel();
  const { themeMode, cycleThemeMode, setImageBackground, backgroundType } = useAppearance();
  const { pinnedMiniApps, reorderPinnedMiniApps } = useHomeLayout();
  const { setIsHomeEditMode } = useHomeEditMode();

  const [gridWidth, setGridWidth] = useState(0);
  const [dockWidth, setDockWidth] = useState(0);
  const [homeAlertsVisible, setHomeAlertsVisible] = useState(false);
  const isWeb = Platform.OS === "web";
  const homeText = useHomeMobileText();
  const { language } = useI18n();
  const mobilePolicy = useMemo(() => getSabiMobilePolicy(), []);

  const safePinnedMiniApps = useMemo(
    () => (Array.isArray(pinnedMiniApps) ? pinnedMiniApps : []),
    [pinnedMiniApps],
  );

  const settingsVisible = home.settingsVisible;
  const selectedFiat = home.selectedFiat as FiatCurrencyCode;
  const selectedCrypto = home.selectedCrypto;
  const isEditMode = home.isEditMode;
  const hiddenCardIds = home.hiddenCardIds;
  const accountReady = home.isReady;

  const defaultDockItems = useMemo(
    () => (isWeb ? WEB_DOCK_ITEMS : MOBILE_DOCK_ITEMS),
    [isWeb],
  );

  const localizedStaticHomeCards = useMemo(
    () => STATIC_HOME_CARDS.filter((item) => isMiniAppKindVisibleForSabiPolicy(item.kind, mobilePolicy)).map((item) => localizeSilkRoadMiniAppItem(item, language)),
    [language, mobilePolicy],
  );

  const staticKinds = useMemo(
    () => new Set(localizedStaticHomeCards.map((item) => item.kind)),
    [localizedStaticHomeCards],
  );

  const miniAppCards = useMemo<HomeCard[]>(
    () =>
      safePinnedMiniApps
        .filter((app) => app.kind !== "mini_apps" && app.id !== "mini-apps" && !staticKinds.has(app.kind) && isMiniAppKindVisibleForSabiPolicy(app.kind, mobilePolicy))
        .map((app) => ({
          id: `miniapp-${app.id}`,
          title: localizeSilkRoadMiniAppItem(app, language).title,
          type: "miniapp",
          kind: app.kind,
          visualKey: getMiniAppVisualKey(app),
          removable: true,
        })),
    [language, safePinnedMiniApps, staticKinds, mobilePolicy],
  );

  const allKnownCards = useMemo<HomeCard[]>(
    () => [...localizedStaticHomeCards, ...miniAppCards],
    [localizedStaticHomeCards, miniAppCards],
  );

  const allCardsSource = useMemo<HomeCard[]>(
    () => allKnownCards.filter((item) => !hiddenCardIds.includes(item.id)),
    [allKnownCards, hiddenCardIds],
  );

  const hiddenCards = useMemo<HomeCard[]>(
    () => allKnownCards.filter((item) => hiddenCardIds.includes(item.id)),
    [allKnownCards, hiddenCardIds],
  );

  useEffect(() => {
    const allIds = allCardsSource.map((item) => item.id);
    const kept = home.homeOrder.filter((id) => allIds.includes(id));
    const missing = allIds.filter((id) => !kept.includes(id));
    const next = [...kept, ...missing];

    const isSame =
      home.homeOrder.length === next.length &&
      home.homeOrder.every((id, index) => id === next[index]);

    if (!isSame) {
      void homeKernelFacade.setHomeOrder(next);
    }
  }, [allCardsSource, home.homeOrder]);

  useEffect(() => {
    const visibleDockIds = defaultDockItems.map((item) => item.id);
    const kept = home.dockOrder.filter((id) => visibleDockIds.includes(id));
    const missing = visibleDockIds.filter((id) => !kept.includes(id));
    const nextVisibleOrder = [...kept, ...missing];
    const next = mergeVisibleDockOrderWithPreservedIds(
      nextVisibleOrder,
      home.dockOrder,
      visibleDockIds,
    );

    if (!areStringArraysEqual(home.dockOrder, next)) {
      void homeKernelFacade.setDockOrder(next);
    }
  }, [defaultDockItems, home.dockOrder]);

  const orderedHomeCards = useMemo(() => {
    const map = new Map(allCardsSource.map((item) => [item.id, item]));
    return home.homeOrder.map((id) => map.get(id)).filter(Boolean) as HomeCard[];
  }, [allCardsSource, home.homeOrder]);

  const orderedDockItems = useMemo(() => {
    const map = new Map(defaultDockItems.map((item) => [item.id, item]));
    return home.dockOrder.map((id) => map.get(id)).filter(Boolean) as DockItem[];
  }, [defaultDockItems, home.dockOrder]);

  const homePositions = useSharedValue<PositionsMap>(buildPositions(home.homeOrder));
  const dockPositions = useSharedValue<PositionsMap>(buildPositions(home.dockOrder));

  useEffect(() => {
    homePositions.value = buildPositions(home.homeOrder);
  }, [home.homeOrder, homePositions]);

  useEffect(() => {
    dockPositions.value = buildPositions(home.dockOrder);
  }, [home.dockOrder, dockPositions]);

  const THEME_PRESETS = {
    brand: {
      accent: "#7CFF2B",
      border: "rgba(124,255,43,0.18)",
      text: "#F8FAFC",
      textSecondary: "#D7E4EE",
      topBarText: "#0F172A",
      overlayBackground:
        backgroundType === "Custom background"
          ? "rgba(7,14,10,0.62)"
          : "rgba(7,18,13,0.88)",
      screenTint:
        backgroundType === "Custom background"
          ? "rgba(0,0,0,0.10)"
          : "rgba(5,12,10,0.42)",
      modalCardBackground: "#0D1510",
      modalActionBackground: "#111827",
      webBackgroundGradient: ["#08140F", "#0E2419", "#143722"] as [string, string, string],
    },
    wallet: {
      accent: "#5DA3FF",
      border: "rgba(93,163,255,0.24)",
      text: "#F8FAFC",
      textSecondary: "#D8E8FF",
      topBarText: "#0F172A",
      overlayBackground:
        backgroundType === "Custom background"
          ? "rgba(7,14,24,0.62)"
          : "rgba(7,18,34,0.88)",
      screenTint:
        backgroundType === "Custom background"
          ? "rgba(0,0,0,0.10)"
          : "rgba(5,12,24,0.42)",
      modalCardBackground: "#0B1524",
      modalActionBackground: "#111C2D",
      webBackgroundGradient: ["#091321", "#102845", "#1B4677"] as [string, string, string],
    },
    ai: {
      accent: "#A855F7",
      border: "rgba(168,85,247,0.24)",
      text: "#F8FAFC",
      textSecondary: "#E9DDFF",
      topBarText: "#0F172A",
      overlayBackground:
        backgroundType === "Custom background"
          ? "rgba(19,10,30,0.62)"
          : "rgba(20,12,34,0.88)",
      screenTint:
        backgroundType === "Custom background"
          ? "rgba(0,0,0,0.10)"
          : "rgba(17,9,30,0.42)",
      modalCardBackground: "#170F27",
      modalActionBackground: "#211334",
      webBackgroundGradient: ["#140B22", "#24123D", "#4C1D95"] as [string, string, string],
    },
    messenger: {
      accent: "#10B981",
      border: "rgba(16,185,129,0.24)",
      text: "#F8FAFC",
      textSecondary: "#D6FFF1",
      topBarText: "#0F172A",
      overlayBackground:
        backgroundType === "Custom background"
          ? "rgba(6,18,14,0.62)"
          : "rgba(6,24,20,0.88)",
      screenTint:
        backgroundType === "Custom background"
          ? "rgba(0,0,0,0.10)"
          : "rgba(5,18,15,0.42)",
      modalCardBackground: "#0C1A16",
      modalActionBackground: "#12231E",
      webBackgroundGradient: ["#071913", "#0D2A22", "#0F5C50"] as [string, string, string],
    },
  } as const;

  const palette = THEME_PRESETS[themeMode] ?? THEME_PRESETS.brand;

  const brand = palette.accent;
  const border = palette.border;
  const text = palette.text;
  const textSecondary = palette.textSecondary;
  const topBarText = palette.topBarText;
  const overlayBackground = palette.overlayBackground;
  const screenTint = palette.screenTint;
  const modalCardBackground = palette.modalCardBackground;
  const modalActionBackground = palette.modalActionBackground;
  const webBackgroundGradient = palette.webBackgroundGradient;
  const isCustomBackground = backgroundType === "Custom background";

  const themeLabel =
    themeMode === "wallet"
      ? homeText.themeWallet
      : themeMode === "ai"
      ? homeText.themeAi
      : themeMode === "messenger"
      ? homeText.themeMessenger
      : homeText.themeSabi;

  const wallpaperLabel = isCustomBackground
    ? homeText.customBackground
    : homeText.brandBackground;

  const selectedFiatData =
    FIAT_RATES.find((rate) => rate.code === selectedFiat) ?? FIAT_RATES[0];

  const selectedCryptoData =
    CRYPTO_RATES.find((rate) => rate.code === selectedCrypto) ?? CRYPTO_RATES[0];

  const itemWidth = useMemo(() => {
    if (!gridWidth) return 72;
    return (gridWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  }, [gridWidth]);

  const dockItemWidth = useMemo(() => {
    if (!dockWidth) return 72;

    const columns = Math.max(1, orderedDockItems.length);
    return (dockWidth - GRID_GAP * (columns - 1)) / columns;
  }, [dockWidth, orderedDockItems.length]);

  const homeItemHeight = 76;
  const dockItemHeight = 50;

  const homeGridHeight = useMemo(() => {
    const rows = Math.ceil(orderedHomeCards.length / GRID_COLUMNS);
    return rows * homeItemHeight + Math.max(0, rows - 1) * GRID_GAP;
  }, [orderedHomeCards.length]);

  const dockGridHeight = dockItemHeight;
  const normalizedTopInset = isWeb ? 0 : Math.min(Math.max(insets.top, 0), 38);
  const normalizedBottomInset = isWeb ? 0 : Math.min(Math.max(insets.bottom, 0), 34);
  const dockLiftSixMillimeters = 23;
  const dockBottomBaseOffset = isWeb
    ? 12
    : Platform.OS === "ios"
      ? Math.max(18, Math.min(normalizedBottomInset + 8, 44))
      : 18;
  const dockBottomOffset = dockBottomBaseOffset + dockLiftSixMillimeters;
  const scrollBottomPadding = DOCK_HEIGHT + dockBottomOffset + 22;
  const topSpacerHeight = Math.max(normalizedTopInset, 8) + TOP_BAR_FIXED_HEIGHT + TOP_BAR_TOUCH_OFFSET;

  const closeEditMode = useCallback(() => {
    setIsHomeEditMode(false);
  }, [setIsHomeEditMode]);

  const handlePickBackground = async () => {
    if (Platform.OS === "web") {
      Alert.alert(homeText.webVersionTitle, homeText.webVersionBody);
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(homeText.permissionRequiredTitle, homeText.permissionRequiredBody);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
        mediaTypes: ["images"],
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert(homeText.imageErrorTitle, homeText.imageUriMissing);
        return;
      }

      const persistentUri = await persistHomeBackgroundImage(uri);

      if (!persistentUri) {
        Alert.alert(homeText.imageErrorTitle, homeText.imageUriMissing);
        return;
      }

      setImageBackground(persistentUri);
    } catch {
      Alert.alert(homeText.imageErrorTitle, homeText.imagePickFailed);
    }
  };

  const handleResetBackground = () => {
    setImageBackground("");
  };

  const handleProfileButtonPress = useCallback(() => {
    router.push("/profile" as never);
  }, []);

  const handleProfileButtonLongPress = useCallback(() => {
    router.push("/profile" as never);
  }, []);

  const handleResetHomeLayout = useCallback(() => {
    void homeKernelFacade.resetLayout();
    closeEditMode();
  }, [closeEditMode]);

  const openHomeAlertsDrawer = useCallback(() => {
    closeEditMode();
    setHomeAlertsVisible(true);
  }, [closeEditMode]);

  const closeHomeAlertsDrawer = useCallback(() => {
    setHomeAlertsVisible(false);
  }, []);

  const handleRestoreCard = useCallback((cardId: string) => {
    void homeKernelFacade.restoreCard(cardId);
  }, []);

  const openMiniApps = () => {
    closeEditMode();
    router.push({ pathname: "/mini-apps" } as never);
  };

  const openFullMessenger = useCallback(() => {
    closeEditMode();
    router.push("/tabs" as never);
  }, [closeEditMode]);

  const homeAlertsPullGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isEditMode && !settingsVisible && !homeAlertsVisible)
        .activeOffsetY([14, 999])
        .failOffsetX([-30, 30])
        .onEnd((event) => {
          if (event.translationY >= 30) {
            runOnJS(openHomeAlertsDrawer)();
          }
        }),
    [isEditMode, settingsVisible, homeAlertsVisible, openHomeAlertsDrawer],
  );

  const messengerSwipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isEditMode && !settingsVisible && !homeAlertsVisible)
        .hitSlop({ left: 0, width: MESSENGER_EDGE_SWIPE_ZONE })
        .activeOffsetX([18, 999])
        .failOffsetY([-24, 24])
        .onEnd((event) => {
          if (event.translationX >= MESSENGER_EDGE_SWIPE_TRIGGER) {
            runOnJS(openFullMessenger)();
          }
        }),
    [isEditMode, settingsVisible, homeAlertsVisible, openFullMessenger],
  );

  const openCard = (card: HomeCard) => {
    if (isEditMode) {
      closeEditMode();
      return;
    }

    switch (card.kind) {
      case "messenger":
        openFullMessenger();
        break;
      case "sabipay":
        router.push("/wallet/send-internal" as never);
        break;
      case "qr":
        router.push("/qr" as never);
        break;
      case "cards":
        router.push("/wallet/cards" as never);
        break;
      case "notifications":
        openHomeAlertsDrawer();
        break;
      case "events":
        router.push("/events" as never);
        break;
      case "marketplace":
        router.push("/marketplace" as never);
        break;
      case "supermarket":
        router.push("/supermarket" as never);
        break;
      case "hotels":
      case "hotel":
        router.push("/hotels" as never);
        break;
      case "food_delivery":
      case "food":
        router.push("/food-delivery" as never);
        break;
      case "wholesale_market":
      case "wholesale":
        router.push("/wholesale-market" as never);
        break;
      case "taxi":
        router.push("/taxi" as never);
        break;
      case "delivery":
        router.push("/delivery" as never);
        break;
      case "stream":
        router.push("/stream" as never);
        break;
      case "business":
        router.push("/business" as never);
        break;
      case "merchant":
        router.push("/merchant" as never);
        break;
      case "ai":
        router.push("/ai" as never);
        break;
      case "ai_voice":
        router.push("/ai/voice-control" as never);
        break;
      case "gallery":
        router.push("/gallery" as never);
        break;
      case "games":
        router.push("/network-game-center" as never);
        break;
      case "documents":
      case "files":
        router.push("/documents" as never);
        break;
      case "camera":
        router.push("/camera" as never);
        break;
      case "mini_apps":
        openMiniApps();
        break;
      case "settings":
      case "manage":
        void homeKernelFacade.setSettingsVisible(true);
        break;
      case "cast":
        router.push("/wifi-cast" as never);
        break;
      default:
        openMiniApps();
        break;
    }
  };

  const openDock = (kind: DockItem["kind"]) => {
    if (isEditMode) {
      closeEditMode();
    }

    switch (kind) {
      case "call":
        router.push("/tabs/calls" as never);
        break;
      case "chat":
        router.push("/tabs/chats" as never);
        break;
      case "wallet":
        router.push("/wallet/home" as never);
        break;
      case "mini_apps":
        openMiniApps();
        break;
    }
  };

  const handleHomeDragStart = useCallback(() => {
    if (!isEditMode) {
      setIsHomeEditMode(true);
    }
  }, [isEditMode, setIsHomeEditMode]);

  const handleHomeDragEnd = useCallback(
    (nextPositions: PositionsMap) => {
      const nextIds = sortIdsByPositions(home.homeOrder, nextPositions);
      void homeKernelFacade.setHomeOrder(nextIds);

      const nextMiniApps = nextIds
        .filter((id) => id.startsWith("miniapp-"))
        .map((id) => id.replace("miniapp-", ""))
        .map((miniId) => safePinnedMiniApps.find((app) => app.id === miniId))
        .filter(Boolean) as MiniAppItem[];

      const sameMiniOrder =
        nextMiniApps.length === safePinnedMiniApps.length &&
        nextMiniApps.every((app, index) => app.id === safePinnedMiniApps[index]?.id);

      if (!sameMiniOrder && nextMiniApps.length === safePinnedMiniApps.length) {
        reorderPinnedMiniApps(nextMiniApps);
      }
    },
    [home.homeOrder, safePinnedMiniApps, reorderPinnedMiniApps],
  );

  const handleDockDragEnd = useCallback(
    (nextPositions: PositionsMap) => {
      const visibleDockIds = defaultDockItems.map((item) => item.id);
      const visibleCurrentOrder = home.dockOrder.filter((id) => visibleDockIds.includes(id));
      const nextVisibleIds = sortIdsByPositions(visibleCurrentOrder, nextPositions);
      const nextIds = mergeVisibleDockOrderWithPreservedIds(
        nextVisibleIds,
        home.dockOrder,
        visibleDockIds,
      );

      if (!areStringArraysEqual(home.dockOrder, nextIds)) {
        void homeKernelFacade.setDockOrder(nextIds);
      }
    },
    [defaultDockItems, home.dockOrder],
  );

  const handleRemoveCard = useCallback((cardId: string) => {
    void homeKernelFacade.hideCard(cardId);
  }, []);

  const displayName = home.displayName;
  const displayUsername = home.displayUsername;
  const displayUserId = home.displaySabiId;
  const displayPhone = home.displayPhone;
  const avatarLetter = home.avatarLetter;
  const avatarUri = home.avatarUri;

  if (!accountReady) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {!isCustomBackground ? (
          <LinearGradient
            colors={webBackgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.webBackgroundLayer}
            pointerEvents="none"
          >
            <View style={styles.webBackgroundGlowTop} />
            <View style={styles.webBackgroundGlowBottom} />
          </LinearGradient>
        ) : null}

        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={brand} />
          <Text style={[styles.loadingTitle, { color: text }]}>{homeText.loadingTitle}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureDetector gesture={messengerSwipeGesture}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {!isCustomBackground ? (
          <LinearGradient
            colors={webBackgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.webBackgroundLayer}
            pointerEvents="none"
          >
            <View style={styles.webBackgroundGlowTop} />
            <View style={styles.webBackgroundGlowBottom} />
          </LinearGradient>
        ) : null}

        <Pressable
          style={styles.container}
          onPress={() => {
            if (isEditMode) closeEditMode();
          }}
        >
          <View style={styles.topBarFixed}>
            <View style={styles.topBar}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.profileButton}
                onPress={() => { closeEditMode(); handleProfileButtonPress(); }}
                onLongPress={() => { closeEditMode(); handleProfileButtonLongPress(); }}
                delayLongPress={220}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#FAFAFA", "#F3F4F6"]}
                  style={[styles.topBarCard, styles.profileButtonCard, { borderColor: border }]}
                >
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                  ) : (
                    <Text style={[styles.avatarText, { color: topBarText }]}>{avatarLetter}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.aiButton}
                onPress={() => { closeEditMode(); router.push("/ai/voice-control" as never); }}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#FAFAFA", "#F3F4F6"]}
                  style={[styles.topBarCard, { borderColor: border }]}
                >
                  <View style={styles.aiRow}>
                    <View style={[styles.aiDot, { backgroundColor: brand }]} />
                    <Text style={[styles.aiButtonText, { color: topBarText }]}>{homeText.voiceButton}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.topBarActions}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.searchButton}
                  onPress={() => { closeEditMode(); router.push("/search" as never); }}
                >
                  <LinearGradient
                    colors={["#FFFFFF", "#FAFAFA", "#F3F4F6"]}
                    style={[styles.topBarCard, { borderColor: border }]}
                  >
                    <Search size={18} color={topBarText} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <GestureDetector gesture={homeAlertsPullGesture}>
            <View style={[styles.alertsSwipeHotspot, { height: Math.max(24, Math.min(normalizedTopInset + 16, 42)) }]} />
          </GestureDetector>

          <ScrollView
            contentContainerStyle={{
              paddingTop: topSpacerHeight,
              paddingBottom: scrollBottomPadding,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={closeEditMode}
          >
            <View style={[styles.overlay, { backgroundColor: screenTint }]}>
              <View
                style={[
                  styles.heroCard,
                  isCustomBackground ? styles.heroCardTransparent : null,
                  {
                    backgroundColor: overlayBackground,
                    borderColor: border,
                    shadowColor: "#000000",
                  },
                ]}
              >
                <Text style={[styles.heroBrand, { color: brand }]}>{displayName}</Text>
                <Text style={[styles.heroTitle, { color: text }]}>{homeText.homeTitle}</Text>

                <View style={styles.identityBlock}>
                  <Text style={[styles.identityUsername, { color: textSecondary }]}>
                    {displayUsername}
                  </Text>
                  {displayPhone ? (
                    <Text style={[styles.identityUsername, { color: textSecondary }]}> 
                      {displayPhone}
                    </Text>
                  ) : null}
                  <Text style={[styles.identityUserId, { color: brand }]}>
                    {displayUserId}
                  </Text>
                </View>

                <View style={styles.heroPanelsRow}>
                  <HeroInfoPanel
                    title={homeText.forexTitle}
                    symbol={selectedFiatData.code}
                    value={selectedFiatData.price}
                    change={selectedFiatData.change}
                    kind="forex"
                    accent={brand}
                    transparentMode={isCustomBackground}
                    signalLabel={homeText.forexSignal}
                  />
                  {isHomeCryptoPanelVisibleForSabiPolicy(mobilePolicy) ? (
                    <HeroInfoPanel
                      title={homeText.cryptoTitle}
                      symbol={selectedCryptoData.code}
                      value={selectedCryptoData.price}
                      change={selectedCryptoData.change}
                      kind="crypto"
                      accent={brand}
                      transparentMode={isCustomBackground}
                      signalLabel={homeText.cryptoSignal}
                    />
                  ) : null}
                </View>
              </View>


              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: text }]}>{homeText.widgetsTitle}</Text>
              </View>

              <View
                style={[styles.homeGrid, { height: homeGridHeight }]}
                onLayout={(event: LayoutChangeEvent) =>
                  setGridWidth(event.nativeEvent.layout.width)
                }
              >
                {gridWidth > 0 &&
                  orderedHomeCards.map((card) => (
                    <DraggableCard
                      key={card.id}
                      itemId={card.id}
                      title={card.title}
                      kind={card.kind}
                      visualKey={card.visualKey}
                      itemWidth={itemWidth}
                      itemHeight={homeItemHeight}
                      itemCount={orderedHomeCards.length}
                      borderColor={border}
                      positions={homePositions}
                      isEditMode={isEditMode}
                      removable={card.removable !== false}
                      onDragStart={handleHomeDragStart}
                      onDragEnd={handleHomeDragEnd}
                      onPress={() => openCard(card)}
                      onRemove={() => handleRemoveCard(card.id)}
                    />
                  ))}
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.dockWrapper,
              {
                bottom: dockBottomOffset,
                paddingBottom: 0,
              },
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.dockGroup}>
              <LinearGradient
                colors={["#414853", "#2B313A", "#1A2028"]}
                style={styles.dockGroupGradient}
              >
                <View
                  style={[styles.dockGrid, { height: dockGridHeight }]}
                  onLayout={(event: LayoutChangeEvent) =>
                    setDockWidth(event.nativeEvent.layout.width)
                  }
                >
                  {dockWidth > 0 &&
                    orderedDockItems.map((item) => (
                      <DraggableDock
                        key={item.id}
                        item={item}
                        itemWidth={dockItemWidth}
                        itemHeight={dockItemHeight}
                        itemCount={orderedDockItems.length}
                        positions={dockPositions}
                        onDragEnd={handleDockDragEnd}
                        onPress={() => openDock(item.kind)}
                      />
                    ))}
                </View>
              </LinearGradient>
            </View>
          </View>

          {homeAlertsVisible ? (
            <View style={styles.alertDrawerLayer} pointerEvents="auto">
              <Pressable style={styles.alertDrawerBackdrop} onPress={closeHomeAlertsDrawer}>
                <Pressable
                  style={styles.alertDrawerCard}
                  onPress={(event) => event.stopPropagation()}
                >
                  <View style={styles.alertDrawerHandle} />
                  <Text style={styles.alertDrawerTitle}>{homeText.alertDrawerTitle}</Text>
                  <HomeFoundationStrip
                    text={homeText}
                    borderColor={border}
                    transparentMode={isCustomBackground}
                  />
                </Pressable>
              </Pressable>
            </View>
          ) : null}

          <Modal
            visible={settingsVisible}
            animationType="slide"
            transparent
            onRequestClose={() => void homeKernelFacade.setSettingsVisible(false)}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalBackdrop}>
                <View
                  style={[
                    styles.modalCard,
                    {
                      backgroundColor: modalCardBackground,
                      borderColor: border,
                    },
                  ]}
                >
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalScrollContent}
                  >
                    <Text style={[styles.modalTitle, { color: text }]}>{homeText.settingsTitle}</Text>

                    <View
                      style={[
                        styles.modalAction,
                        {
                          backgroundColor: modalActionBackground,
                          borderColor: border,
                        },
                      ]}
                    >
                      <View style={styles.accountHeaderRow}>
                        <ShieldCheck size={16} color={brand} />
                        <Text style={[styles.modalActionTitle, { color: text }]}>{homeText.unifiedAccount}</Text>
                      </View>
                      <Text style={[styles.accountPrimaryText, { color: text }]}>{displayName}</Text>
                      <Text style={[styles.accountSecondaryText, { color: textSecondary }]}> 
                        {displayUsername}
                      </Text>
                      <Text style={[styles.accountIdText, { color: brand }]}>{displayUserId}</Text>
                      {displayPhone ? (
                        <Text style={[styles.accountSecondaryText, { color: textSecondary }]}> 
                          {displayPhone}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={cycleThemeMode}
                      style={[
                        styles.modalAction,
                        {
                          backgroundColor: modalActionBackground,
                          borderColor: border,
                        },
                      ]}
                    >
                      <Text style={[styles.modalActionTitle, { color: text }]}>{homeText.theme}</Text>
                      <Text style={[styles.modalActionValue, { color: brand }]}>{themeLabel}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handlePickBackground}
                      style={[
                        styles.modalAction,
                        {
                          backgroundColor: modalActionBackground,
                          borderColor: border,
                        },
                      ]}
                    >
                      <Text style={[styles.modalActionTitle, { color: text }]}>{homeText.background}</Text>
                      <Text style={[styles.modalActionValue, { color: brand }]}>{wallpaperLabel}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleResetBackground}
                      style={[
                        styles.modalAction,
                        {
                          backgroundColor: modalActionBackground,
                          borderColor: border,
                        },
                      ]}
                    >
                      <Text style={[styles.modalActionTitle, { color: text }]}>{homeText.resetBackground}</Text>
                      <Text style={[styles.modalActionValue, { color: brand }]}>{homeText.defaultBackground}</Text>
                    </TouchableOpacity>

                    <View
                      style={[
                        styles.modalAction,
                        {
                          backgroundColor: modalActionBackground,
                          borderColor: border,
                        },
                      ]}
                    >
                      <Text style={[styles.modalActionTitle, { color: text }]}>{homeText.forexTitle}</Text>

                      <View style={styles.currencyRow}>
                        {FIAT_RATES.map((currency) => {
                          const active = selectedFiat === currency.code;
                          return (
                            <TouchableOpacity
                              key={currency.code}
                              activeOpacity={0.9}
                              onPress={() => void homeKernelFacade.setSelectedFiat(currency.code)}
                              style={[
                                styles.currencyChip,
                                {
                                  backgroundColor: active ? brand : "transparent",
                                  borderColor: active ? brand : border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.currencyChipText,
                                  { color: active ? "#08110A" : text },
                                ]}
                              >
                                {currency.code}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.modalAction,
                        {
                          backgroundColor: modalActionBackground,
                          borderColor: border,
                        },
                      ]}
                    >
                      <Text style={[styles.modalActionTitle, { color: text }]}>{homeText.cryptoTitle}</Text>

                      <View style={styles.currencyRow}>
                        {CRYPTO_RATES.map((asset) => {
                          const active = selectedCrypto === asset.code;
                          return (
                            <TouchableOpacity
                              key={asset.code}
                              activeOpacity={0.9}
                              onPress={() => void homeKernelFacade.setSelectedCrypto(asset.code)}
                              style={[
                                styles.currencyChip,
                                {
                                  backgroundColor: active ? brand : "transparent",
                                  borderColor: active ? brand : border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.currencyChipText,
                                  { color: active ? "#08110A" : text },
                                ]}
                              >
                                {asset.code}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.modalAction,
                        {
                          backgroundColor: modalActionBackground,
                          borderColor: border,
                        },
                      ]}
                    >
                      <Text style={[styles.modalActionTitle, { color: text }]}>{homeText.hidden}</Text>

                      {hiddenCards.length === 0 ? (
                        <Text style={[styles.modalActionValue, { color: textSecondary }]}>{homeText.noHiddenCards}</Text>
                      ) : (
                        <View style={styles.restoreList}>
                          {hiddenCards.map((card) => (
                            <TouchableOpacity
                              key={card.id}
                              activeOpacity={0.9}
                              onPress={() => handleRestoreCard(card.id)}
                              style={[
                                styles.restoreButton,
                                {
                                  borderColor: border,
                                  backgroundColor: "rgba(255,255,255,0.02)",
                                },
                              ]}
                            >
                              <Text style={[styles.restoreButtonText, { color: text }]}>{homeText.restorePrefix} {card.title}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleResetHomeLayout}
                      style={[
                        styles.resetHomeButton,
                        {
                          borderColor: border,
                          backgroundColor: modalActionBackground,
                        },
                      ]}
                    >
                      <RotateCcw size={16} color={text} />
                      <Text style={[styles.resetHomeButtonText, { color: text }]}>{homeText.resetLayout}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => void homeKernelFacade.setSettingsVisible(false)}
                      style={[styles.closeButton, { backgroundColor: brand }]}
                    >
                      <Text style={styles.closeButtonText}>{homeText.done}</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        </Pressable>
      </SafeAreaView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, backgroundColor: "transparent" },
  overlay: { flex: 1, paddingHorizontal: 10 },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  topBarFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 150,
    elevation: 150,
    paddingHorizontal: 10,
    paddingTop: 8 + TOP_BAR_TOUCH_OFFSET,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  topBarCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: { width: 40, height: 40 },
  profileButtonCard: { overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  searchButton: { width: 40, height: 40 },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarText: { fontSize: 22, fontWeight: "900" },
  aiButton: { flex: 1, height: 40 },
  aiRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  aiDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  aiButtonText: { fontSize: 13, fontWeight: "800" },
  alertsSwipeHotspot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    zIndex: 90,
    elevation: 90,
    backgroundColor: "transparent",
  },
  alertDrawerLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 180,
  },
  alertDrawerBackdrop: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  alertDrawerCard: {
    marginTop: 8,
    marginHorizontal: 10,
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderRadius: 24,
    backgroundColor: "rgba(8,15,22,0.98)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  alertDrawerHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    marginBottom: 8,
  },
  alertDrawerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
    textAlign: "center",
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 10,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  heroCardTransparent: {
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  heroBrand: { fontSize: 14, fontWeight: "900", marginBottom: 0 },
  heroTitle: { fontSize: 20, fontWeight: "900", marginBottom: 6 },
  identityBlock: { marginBottom: 10, gap: 2 },
  identityUsername: { fontSize: 12, fontWeight: "700" },
  identityUserId: { fontSize: 12, fontWeight: "800" },
  heroPanelsRow: { flexDirection: "row", gap: 8 },
  marketPanel: {
    flex: 1,
    minHeight: 118,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 11,
    overflow: "hidden",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  marketPanelGlass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  marketPanelGlow: {
    position: "absolute",
    right: -24,
    top: -12,
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  marketPanelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  marketPanelHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  marketIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  marketTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  marketSymbol: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  marketChangeBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  marketChangePositive: { backgroundColor: "rgba(21,181,87,0.18)" },
  marketChangeNegative: { backgroundColor: "rgba(220,68,68,0.18)" },
  marketChangeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  marketFooter: { gap: 6 },
  marketValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  marketMetaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  marketMetaText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "700",
  },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 1 },
  homeGrid: { position: "relative" },
  gridCard: { borderRadius: 16 },
  gridCardPressable: { flex: 1, width: "100%", height: "100%" },
  gridCardGradient: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    overflow: "hidden",
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  gridCardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "46%",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gridCardGlow: {
    position: "absolute",
    top: 6,
    left: 8,
    right: 8,
    height: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  gridCardTitle: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.14)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  removeBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF4D4F",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  dockWrapper: {
    position: "absolute",
    left: 10,
    right: 10,
    zIndex: 220,
    elevation: 220,
  },
  dockGroup: {
    height: DOCK_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
  },
  dockGroupGradient: {
    flex: 1,
    paddingHorizontal: 6,
    paddingTop: 7,
    paddingBottom: 7,
  },
  dockGrid: { position: "relative" },
  dockCard: { borderRadius: 18 },
  dockPressable: { flex: 1, width: "100%", height: "100%" },
  dockCardGradient: {
    flex: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dockOverlay: {
    position: "absolute",
    top: 4,
    left: 6,
    right: 6,
    height: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  webBackgroundLayer: { ...StyleSheet.absoluteFillObject },
  webBackgroundGlowTop: {
    position: "absolute",
    top: -120,
    right: -60,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  webBackgroundGlowBottom: {
    position: "absolute",
    bottom: -140,
    left: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  modalSafeArea: { flex: 1, backgroundColor: "rgba(0,0,0,0.42)" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", padding: 12 },
  modalCard: {
    borderWidth: 1,
    borderRadius: 24,
    maxHeight: "92%",
    overflow: "hidden",
  },
  modalScrollContent: { padding: 16, paddingBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: "900", marginBottom: 12 },
  modalAction: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  modalActionTitle: { fontSize: 14, fontWeight: "800", marginBottom: 6 },
  modalActionValue: { fontSize: 13, fontWeight: "800" },
  accountHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  accountPrimaryText: { fontSize: 15, fontWeight: "900", marginBottom: 2 },
  accountSecondaryText: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  accountIdText: { fontSize: 12, fontWeight: "900", marginBottom: 4 },
  currencyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  currencyChip: {
    minWidth: 60,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  currencyChipText: { fontSize: 12, fontWeight: "800" },
  restoreList: { gap: 8, marginTop: 6 },
  restoreButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  restoreButtonText: { fontSize: 13, fontWeight: "800" },
  resetHomeButton: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 2,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resetHomeButtonText: { fontSize: 14, fontWeight: "900" },
  closeButton: {
    marginTop: 6,
    minHeight: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: { color: "#08110A", fontSize: 14, fontWeight: "900" },
});
