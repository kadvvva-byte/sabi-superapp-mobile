import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  Platform,
  LayoutChangeEvent,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  LayoutGrid,
  Globe,
  Bot,
  Camera,
  Cast,
  CreditCard,
  FileText,
  Gamepad2,
  Hotel,
  Bell,
  BadgeDollarSign,
  CalendarDays,
  Store,
  Building2,
  Warehouse,
  Truck,
  Radio,
  ShoppingCart,
  Image as ImageIcon,
  MessageCircle,
  Mic2,
  QrCode,
  Settings,
  ShoppingBag,
  Car,
  UtensilsCrossed,
  Plus,
  Minus,
} from "lucide-react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MiniAppsDrawer from "./components/MiniAppsDrawer";
import { MINI_APPS_ALL } from "./data/miniApps.data";
import { homeKernelFacade } from "../../../core/kernel/home";
import { useHomeKernel } from "../../../core/kernel/home/bindings";
import { useHomeLayout } from "../HomeLayoutProvider";
import type { MiniAppItem } from "../HomeLayoutProvider";
import { useAppearance } from "../../../theme/AppearanceProvider";
import { useI18n } from "../../../shared/i18n";
import { useHomeMobileText } from "../../../shared/i18n/home-mobile-translations";
import { localizeSilkRoadMiniAppItems } from "../../marketplace/presentation/marketplace.i18n";

const GRID_COLUMNS = 4;
const GRID_GAP = 6;
const TOP_BAR_FIXED_HEIGHT = 58;

function normalizeMiniAppItem(item: MiniAppItem): MiniAppItem | null {
  const id = String(item?.id ?? "").trim();
  const title = String(item?.title ?? "").trim();
  const subtitle = String(item?.subtitle ?? "").trim();
  const category = String(item?.category ?? "").trim();
  const kind = String(item?.kind ?? "").trim();

  if (!id || !title || !category || !kind) {
    return null;
  }

  return {
    id,
    title,
    subtitle,
    category,
    kind,
    visualKey: String(item?.visualKey ?? kind).trim() || kind,
    route: typeof item?.route === "string" ? item.route : undefined,
    pinnedToHome: Boolean(item?.pinnedToHome),
    enabled: item?.enabled !== false,
  };
}

function dedupeMiniApps(items: MiniAppItem[]) {
  const result: MiniAppItem[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const normalized = normalizeMiniAppItem(item);
    if (!normalized) continue;
    if (seen.has(normalized.id)) continue;

    seen.add(normalized.id);
    result.push(normalized);
  }

  return result;
}

function getMiniAppIcon(kind: string) {
  switch (kind) {
    case "messenger":
      return MessageCircle;
    case "wallet":
      return CreditCard;
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
      return Bot;
    case "ai_voice":
      return Mic2;
    case "gallery":
      return ImageIcon;
    case "mini_apps":
      return LayoutGrid;
    case "manage":
    case "settings":
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
    case "qr":
      return QrCode;
    case "food":
    case "food_delivery":
      return UtensilsCrossed;
    case "taxi":
      return Car;
    case "web":
      return Globe;
    default:
      return LayoutGrid;
  }
}

function getGradient(kind: string): [string, string, string] {
  switch (kind) {
    case "messenger":
      return ["#0F766E", "#14B8A6", "#99F6E4"];
    case "wallet":
      return ["#2450B8", "#3B82F6", "#8EC5FF"];
    case "marketplace":
      return ["#D66A1E", "#F59E0B", "#FFE18A"];
    case "hotels":
    case "hotel":
      return ["#4338CA", "#7C3AED", "#C4B5FD"];
    case "merchant":
      return ["#B45309", "#F59E0B", "#FCD34D"];
    case "business":
      return ["#1D4ED8", "#3B82F6", "#93C5FD"];
    case "supermarket":
      return ["#047857", "#10B981", "#A7F3D0"];
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
      return ["#5B44C8", "#7C6DFF", "#AAC2FF"];
    case "ai_voice":
      return ["#25105C", "#7C3AED", "#DDD6FE"];
    case "gallery":
      return ["#7C3AED", "#A855F7", "#F0ABFC"];
    case "mini_apps":
      return ["#0F172A", "#334155", "#94A3B8"];
    case "manage":
    case "settings":
      return ["#4B5563", "#6B7280", "#D1D5DB"];
    case "cast":
      return ["#0F766E", "#14B8A6", "#7DD3FC"];
    case "games":
      return ["#2563EB", "#38BDF8", "#BAE6FD"];
    case "camera":
      return ["#3B3F46", "#6B7280", "#D1D5DB"];
    case "documents":
    case "files":
      return ["#0F766E", "#14B8A6", "#99F6E4"];
    case "qr":
      return ["#2E9C88", "#47C98F", "#A7F0C8"];
    case "food":
    case "food_delivery":
      return ["#F04A2F", "#FB7A2F", "#FFBE75"];
    case "taxi":
      return ["#C38A00", "#EAB308", "#FFE480"];
    case "web":
      return ["#2450B8", "#3B82F6", "#8EC5FF"];
    default:
      return ["#475569", "#64748B", "#CBD5E1"];
  }
}

const HOME_CARD_IDS_BY_MINI_APP_ID: Record<string, string[]> = {
  messenger: ["widget-messenger"],
  qr: ["widget-qr"],
  wallet: ["widget-sabipay", "widget-cards"],
  notifications: ["widget-notifications"],
  ai: ["widget-ai"],
  "sabi-voice": ["widget-ai-voice"],
  gallery: ["widget-gallery"],
  "network-games": ["widget-games"],
  marketplace: ["widget-marketplace"],
  hotels: ["widget-hotels"],
  supermarket: ["widget-supermarket"],
  "food-delivery": ["widget-food-delivery"],
  "wholesale-market": ["widget-wholesale-market"],
  taxi: ["widget-taxi"],
  stream: ["widget-stream"],
  events: ["widget-events"],
  settings: ["widget-settings"],
  "wifi-cast": ["widget-cast"],
};

const HOME_CARD_IDS_BY_MINI_APP_KIND: Record<string, string[]> = {
  messenger: ["widget-messenger"],
  qr: ["widget-qr"],
  wallet: ["widget-sabipay", "widget-cards"],
  notifications: ["widget-notifications"],
  ai: ["widget-ai"],
  ai_voice: ["widget-ai-voice"],
  gallery: ["widget-gallery"],
  games: ["widget-games"],
  marketplace: ["widget-marketplace"],
  hotels: ["widget-hotels"],
  hotel: ["widget-hotels"],
  supermarket: ["widget-supermarket"],
  food_delivery: ["widget-food-delivery"],
  food: ["widget-food-delivery"],
  wholesale_market: ["widget-wholesale-market"],
  wholesale: ["widget-wholesale-market"],
  taxi: ["widget-taxi"],
  stream: ["widget-stream"],
  events: ["widget-events"],
  settings: ["widget-settings"],
  manage: ["widget-settings"],
  cast: ["widget-cast"],
};

function getHomeCardIdsForMiniApp(item: MiniAppItem): string[] {
  const byId = HOME_CARD_IDS_BY_MINI_APP_ID[item.id];
  if (byId?.length) return byId;

  const byKind = HOME_CARD_IDS_BY_MINI_APP_KIND[item.kind];
  if (byKind?.length) return byKind;

  return [`miniapp-${item.id}`];
}

function isStaticHomeMiniApp(item: MiniAppItem): boolean {
  return Boolean(HOME_CARD_IDS_BY_MINI_APP_ID[item.id]?.length || HOME_CARD_IDS_BY_MINI_APP_KIND[item.kind]?.length);
}

function MiniWidget({
  item,
  width,
  isPinned,
  isActionOpen,
  borderColor,
  onPress,
  onLongPress,
  onAddToHome,
  onRemoveFromHome,
  addLabel,
  removeLabel,
}: {
  item: MiniAppItem;
  width: number;
  isPinned: boolean;
  isActionOpen: boolean;
  borderColor: string;
  onPress: () => void;
  onLongPress: () => void;
  onAddToHome: () => void;
  onRemoveFromHome: () => void;
  addLabel: string;
  removeLabel: string;
}) {
  const visualType = String(item.visualKey ?? item.kind).trim() || item.kind;
  const Icon = getMiniAppIcon(visualType);
  const colors = getGradient(visualType);

  return (
    <View style={[styles.widgetWrap, { width }]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={260}
        style={styles.widgetPressable}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.widgetCard, { borderColor }]}
        >
          <View style={styles.widgetGlow} />
          <Icon size={22} color="#FFFFFF" />
          <Text style={styles.widgetTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </LinearGradient>
      </Pressable>

      {isActionOpen ? (
        <View style={styles.actionMenu}>
          {!isPinned ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onAddToHome}
              style={styles.actionButton}
            >
              <Plus size={14} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{addLabel}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onRemoveFromHome}
              style={styles.actionButton}
            >
              <Minus size={14} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{removeLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function MiniAppsPanel({ onBack }: { onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const homeLayout = useHomeLayout();
  const home = useHomeKernel();
  const { themeMode, backgroundType } = useAppearance();
  const homeText = useHomeMobileText();
  const { language } = useI18n();

  const pinnedMiniApps: MiniAppItem[] = homeLayout?.pinnedMiniApps ?? [];

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [gridWidth, setGridWidth] = useState(0);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const safePinnedMiniApps = useMemo<MiniAppItem[]>(
    () => dedupeMiniApps(Array.isArray(pinnedMiniApps) ? pinnedMiniApps : []),
    [pinnedMiniApps],
  );

  const pinnedIds = useMemo(
    () => new Set(safePinnedMiniApps.map((item) => item.id)),
    [safePinnedMiniApps],
  );

  const hiddenHomeCardIds = home.hiddenCardIds;
  const homeOrderIds = home.homeOrder;

  const THEME_PRESETS = {
    brand: {
      accent: "#7CFF2B",
      border: "rgba(124,255,43,0.18)",
      text: "#F8FAFC",
      overlayBackground:
        backgroundType === "Custom background"
          ? "rgba(255,255,255,0.03)"
          : "rgba(6,16,12,0.22)",
      screenTint:
        backgroundType === "Custom background"
          ? "transparent"
          : "rgba(6,16,12,0.06)",
    },
    wallet: {
      accent: "#5DA3FF",
      border: "rgba(93,163,255,0.24)",
      text: "#F8FAFC",
      overlayBackground:
        backgroundType === "Custom background"
          ? "rgba(255,255,255,0.03)"
          : "rgba(7,18,34,0.18)",
      screenTint:
        backgroundType === "Custom background"
          ? "transparent"
          : "rgba(7,18,34,0.05)",
    },
    ai: {
      accent: "#A855F7",
      border: "rgba(168,85,247,0.24)",
      text: "#F8FAFC",
      overlayBackground:
        backgroundType === "Custom background"
          ? "rgba(255,255,255,0.03)"
          : "rgba(20,12,34,0.18)",
      screenTint:
        backgroundType === "Custom background"
          ? "transparent"
          : "rgba(20,12,34,0.05)",
    },
    messenger: {
      accent: "#10B981",
      border: "rgba(16,185,129,0.24)",
      text: "#F8FAFC",
      overlayBackground:
        backgroundType === "Custom background"
          ? "rgba(255,255,255,0.03)"
          : "rgba(6,24,20,0.18)",
      screenTint:
        backgroundType === "Custom background"
          ? "transparent"
          : "rgba(6,24,20,0.05)",
    },
  } as const;

  const palette = THEME_PRESETS[themeMode] ?? THEME_PRESETS.brand;
  const brand = palette.accent;
  const border = palette.border;
  const text = palette.text;
  const overlayBackground = palette.overlayBackground;
  const screenTint = palette.screenTint;
  const isWeb = Platform.OS === "web";
  const localizedMiniAppsAll = useMemo(() => localizeSilkRoadMiniAppItems(MINI_APPS_ALL, language), [language]);

  const allItems = useMemo(
    () =>
      dedupeMiniApps(
        localizedMiniAppsAll.filter((item) => {
          if (item.enabled === false) return false;
          if (item.id === "mini-apps" || item.kind === "mini_apps") return false;
          if (hiddenIds.includes(item.id)) return false;
          if (!isWeb && item.id === "web") return false;
          return true;
        }),
      ).sort((left, right) => {
        const leftPinned = pinnedIds.has(left.id) ? 0 : 1;
        const rightPinned = pinnedIds.has(right.id) ? 0 : 1;

        if (leftPinned !== rightPinned) {
          return leftPinned - rightPinned;
        }

        return left.title.localeCompare(right.title);
      }),
    [hiddenIds, isWeb, localizedMiniAppsAll, pinnedIds],
  );

  const hiddenItems = useMemo(
    () =>
      dedupeMiniApps(
        localizedMiniAppsAll.filter((item) => {
          if (item.enabled === false) return false;
          if (item.id === "mini-apps" || item.kind === "mini_apps") return false;
          if (!isWeb && item.id === "web") return false;

          const homeCardIds = getHomeCardIdsForMiniApp(item);
          return hiddenIds.includes(item.id) || homeCardIds.some((cardId) => hiddenHomeCardIds.includes(cardId));
        }),
      ),
    [hiddenIds, hiddenHomeCardIds, isWeb, localizedMiniAppsAll],
  );

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);
  const dismissActions = () => setActiveActionId(null);

  const openItem = (item: MiniAppItem) => {
    dismissActions();

    try {
      router.push((item.route || "/mini-apps") as never);
    } catch {
      router.push("/mini-apps" as never);
    }
  };

  const openWebFlow = () => {
    dismissActions();

    try {
      router.push("/mini-apps/web" as never);
    } catch {
      router.push("/mini-apps" as never);
    }
  };

  const restoreItem = (id: string) => {
    const item = localizedMiniAppsAll.find((entry) => entry.id === id);
    setHiddenIds((prev) => prev.filter((itemId) => itemId !== id));

    if (!item) {
      dismissActions();
      return;
    }

    addToHome(item);
  };

  const resetLayout = () => {
    setHiddenIds([]);
    dismissActions();
    void homeKernelFacade.restoreAllCards();
  };

  const addToHome = (item: MiniAppItem) => {
    const homeCardIds = getHomeCardIdsForMiniApp(item);

    void (async () => {
      if (!isStaticHomeMiniApp(item) && !pinnedIds.has(item.id)) {
        await homeKernelFacade.addPinnedMiniApp({ ...item, pinnedToHome: true });
      }

      for (const cardId of homeCardIds) {
        await homeKernelFacade.restoreCard(cardId);
      }
    })();

    dismissActions();
  };

  const removeFromHome = (item: MiniAppItem) => {
    const homeCardIds = getHomeCardIdsForMiniApp(item);

    void (async () => {
      for (const cardId of homeCardIds) {
        await homeKernelFacade.hideCard(cardId);
      }
    })();

    dismissActions();
  };

  const itemWidth = useMemo(() => {
    if (!gridWidth) return 72;
    return (gridWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  }, [gridWidth]);

  const homeItemHeight = 76;
  const rows = Math.ceil(allItems.length / GRID_COLUMNS);
  const gridHeight = rows * homeItemHeight + Math.max(0, rows - 1) * GRID_GAP;

  const scrollBottomPadding = Math.max(insets.bottom, 16) + 16;
  const topSpacerHeight = Math.max(insets.top, 8) + TOP_BAR_FIXED_HEIGHT;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        {isWeb ? (
          <LinearGradient
            colors={["#081322", "#0E2440", "#14345D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.webBackgroundLayer}
          >
            <View style={styles.webGlowTop} />
            <View style={styles.webGlowBottom} />
          </LinearGradient>
        ) : null}

        <Pressable style={styles.container} onPress={dismissActions}>
          <View style={[styles.overlay, { backgroundColor: screenTint }]}>
            <View style={styles.topBarFixed}>
              <View style={styles.topBar}>
                <Pressable
                  onPress={() => {
                    if (onBack) onBack();
                    else router.back();
                  }}
                  style={styles.iconButton}
                >
                  <ArrowLeft size={18} color="#E7F1FF" />
                </Pressable>

                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{homeText.miniAppsBadge}</Text>
                </View>

                <View style={styles.headerRight}>
                  {isWeb ? (
                    <Pressable onPress={openWebFlow} style={styles.iconButton}>
                      <Globe size={18} color="#E7F1FF" />
                    </Pressable>
                  ) : null}

                  <Pressable onPress={openDrawer} style={styles.iconButton}>
                    <LayoutGrid size={18} color="#E7F1FF" />
                  </Pressable>
                </View>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: topSpacerHeight,
                paddingBottom: scrollBottomPadding,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  styles.heroCard,
                  {
                    backgroundColor: overlayBackground,
                    borderColor: border,
                  },
                ]}
              >
                <Text style={[styles.heroLabel, { color: brand }]}>Sabi</Text>
                <Text style={[styles.heroTitle, { color: text }]}>{homeText.miniAppsTitle}</Text>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: text }]}>{homeText.miniAppsAllWidgets}</Text>
              </View>

              <View
                style={[styles.grid, { height: gridHeight }]}
                onLayout={(event: LayoutChangeEvent) =>
                  setGridWidth(event.nativeEvent.layout.width)
                }
              >
                {allItems.map((item, index) => {
                  const row = Math.floor(index / GRID_COLUMNS);
                  const col = index % GRID_COLUMNS;
                  const left = col * (itemWidth + GRID_GAP);
                  const top = row * (homeItemHeight + GRID_GAP);
                  const homeCardIds = getHomeCardIdsForMiniApp(item);
                  const isPinned = homeCardIds.some(
                    (cardId) => homeOrderIds.includes(cardId) && !hiddenHomeCardIds.includes(cardId),
                  );

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.gridItemAbsolute,
                        {
                          width: itemWidth,
                          height: homeItemHeight,
                          left,
                          top,
                          zIndex: activeActionId === item.id ? 30 : 1,
                        },
                      ]}
                    >
                      <MiniWidget
                        item={item}
                        width={itemWidth}
                        isPinned={isPinned}
                        isActionOpen={activeActionId === item.id}
                        borderColor={border}
                        onPress={() => openItem(item)}
                        onLongPress={() => setActiveActionId(item.id)}
                        onAddToHome={() => addToHome(item)}
                        onRemoveFromHome={() => removeFromHome(item)}
                        addLabel={homeText.miniAppsAddToHome}
                        removeLabel={homeText.miniAppsRemoveFromHome}
                      />
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <MiniAppsDrawer
              visible={drawerVisible}
              onClose={closeDrawer}
              hiddenItems={hiddenItems}
              onRestoreItem={restoreItem}
              onResetLayout={resetLayout}
            />
          </View>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  safe: { flex: 1 },
  container: { flex: 1 },
  overlay: { flex: 1, paddingHorizontal: 10 },
  webBackgroundLayer: { ...StyleSheet.absoluteFillObject },
  webGlowTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  webGlowBottom: {
    position: "absolute",
    bottom: -160,
    left: -100,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  topBarFixed: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    zIndex: 100,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: {
    color: "#DCEBFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  heroCard: {
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  sectionHeader: { marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  grid: { position: "relative", marginBottom: 10 },
  gridItemAbsolute: { position: "absolute" },
  widgetWrap: { flex: 1 },
  widgetPressable: { flex: 1 },
  widgetCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    gap: 4,
  },
  widgetGlow: {
    position: "absolute",
    top: 6,
    left: 8,
    right: 8,
    height: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  widgetTitle: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  actionMenu: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 82,
    zIndex: 30,
    borderRadius: 12,
    backgroundColor: "rgba(8,16,28,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 6,
  },
  actionButton: {
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});