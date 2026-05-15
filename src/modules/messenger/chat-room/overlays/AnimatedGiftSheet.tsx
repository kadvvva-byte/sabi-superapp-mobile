import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated as RNAnimated,
  Dimensions,
  Easing,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { useI18n } from "../../../../shared/i18n";
import GiftStorageSheet, { GiftStorageItem } from "./GiftStorageSheet";
import { GIFT_ASSET_MAP, GiftAssetItem } from "../../gifts/giftAssetMap";
import { getGiftMotionPreset } from "../../gifts/giftMotionPresets";
import {
  getGiftMasterItemById,
  getGiftMasterItemsForLegacyTab,
  isHighImpactGiftMasterItem,
  isPremiumPlaybackGiftMasterItem,
  isPremiumVisualGiftMasterItem,
  type GiftMasterItem,
  type GiftTier,
  type LegacyGiftMenuTab,
} from "../../gifts/giftMasterCatalog";

const { width, height } = Dimensions.get("window");

export type AnimatedGiftItem = {
  id: string;
  icon?: any;
  emoji?: string;
  label: string;
  durationMs: number;
  premium: boolean;
  priceDiamond: number;
  category: LegacyGiftMenuTab;
  tier: GiftTier;
  coinEquivalent: number;
  isFullscreen: boolean;
  hasAudio: boolean;
  highImpact: boolean;
  premiumPlayback: boolean;
  source: "catalog" | "storage";
};

export type AnimatedGiftSelectionPayload = {
  item: AnimatedGiftItem;
  quantity: number;
  totalDiamonds: number;
};

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;
  onClose: () => void;
  onSelect: (payload: AnimatedGiftSelectionPayload) => void;
  onOpenWallet?: () => void;
  storageItems?: GiftStorageItem[];
  walletBalance?: number | string | null;
};

type TabConfig = {
  key: LegacyGiftMenuTab;
  icon: keyof typeof Ionicons.glyphMap;
};

const TAB_CONFIG: TabConfig[] = [
  { key: "featured", icon: "sparkles-outline" },
  { key: "family", icon: "planet-outline" },
  { key: "local", icon: "car-sport-outline" },
  { key: "treasure", icon: "gift-outline" },
  { key: "luxury", icon: "diamond-outline" },
];

const QUANTITY_OPTIONS = [1, 10, 99, 999] as const;
const ASSET_INDEX = new Map<string, GiftAssetItem>(GIFT_ASSET_MAP.map((item) => [item.id, item]));
const TIER_ORDER: Record<GiftTier, number> = {
  micro: 0,
  basic: 1,
  enhanced: 2,
  audio: 3,
  near_fullscreen: 4,
  premium: 5,
  ultra: 6,
};

function chunk<T>(arr: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function hexToRgba(color: string, alpha: number) {
  const normalized = String(color || "").replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  if (full.length !== 6) return `rgba(39,215,223,${alpha})`;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return `rgba(39,215,223,${alpha})`;
  }

  return `rgba(${r},${g},${b},${alpha})`;
}

function getFallbackEmoji(item: GiftMasterItem) {
  switch (item.primaryCategory) {
    case "flowers":
      return "🌹";
    case "romance":
      return "💖";
    case "cute":
      return "🧸";
    case "luxury":
      return "💎";
    case "fantasy":
      return "🪽";
    case "transport":
      return "🏎️";
    case "royal":
      return "👑";
    case "cosmic":
      return "🌌";
    case "zodiac":
      return "♈";
    case "holiday":
      return "🎆";
    case "support":
      return "🔥";
    case "battle":
      return "🏆";
    case "treasure":
      return "🎁";
    default:
      return "🎁";
  }
}

function compareGiftItems(a: AnimatedGiftItem, b: AnimatedGiftItem) {
  if (a.premium !== b.premium) return Number(b.premium) - Number(a.premium);
  if (a.highImpact !== b.highImpact) return Number(b.highImpact) - Number(a.highImpact);
  if (a.isFullscreen !== b.isFullscreen) return Number(b.isFullscreen) - Number(a.isFullscreen);
  if (TIER_ORDER[a.tier] !== TIER_ORDER[b.tier]) return TIER_ORDER[b.tier] - TIER_ORDER[a.tier];
  if (a.priceDiamond !== b.priceDiamond) return b.priceDiamond - a.priceDiamond;
  return a.label.localeCompare(b.label);
}

function mapCatalogToAnimatedGift(item: GiftMasterItem): AnimatedGiftItem {
  const asset = ASSET_INDEX.get(item.id);

  return {
    id: item.id,
    icon: asset?.icon,
    emoji: asset?.fallbackEmoji ?? getFallbackEmoji(item),
    label: asset?.label ?? item.title,
    durationMs: asset?.durationMs ?? item.durationMs,
    premium: isPremiumVisualGiftMasterItem(item),
    priceDiamond: item.priceDiamond,
    category: item.legacyMenuTab,
    tier: item.tier,
    coinEquivalent: item.coinEquivalent,
    isFullscreen: item.isFullscreen,
    hasAudio: item.hasAudio,
    highImpact: isHighImpactGiftMasterItem(item),
    premiumPlayback: isPremiumPlaybackGiftMasterItem(item),
    source: "catalog",
  };
}

function buildGiftItemsForTab(tab: LegacyGiftMenuTab) {
  const items = getGiftMasterItemsForLegacyTab(tab, {
    messengerOnly: true,
    excludeFutureLocked: true,
  }).map(mapCatalogToAnimatedGift);

  const seen = new Set<string>();
  return items
    .filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)))
    .sort(compareGiftItems);
}

const GIFT_ITEMS_BY_TAB: Record<LegacyGiftMenuTab, AnimatedGiftItem[]> = {
  featured: buildGiftItemsForTab("featured"),
  family: buildGiftItemsForTab("family"),
  local: buildGiftItemsForTab("local"),
  treasure: buildGiftItemsForTab("treasure"),
  luxury: buildGiftItemsForTab("luxury"),
};

const GIFT_ITEMS: AnimatedGiftItem[] = TAB_CONFIG.flatMap((tab) => GIFT_ITEMS_BY_TAB[tab.key]);
const DEFAULT_TAB =
  TAB_CONFIG.find((tab) => GIFT_ITEMS_BY_TAB[tab.key].length > 0)?.key ?? "featured";

const INITIAL_SELECTED_BY_TAB: Record<LegacyGiftMenuTab, string> = {
  featured: GIFT_ITEMS_BY_TAB.featured[0]?.id ?? "",
  family: GIFT_ITEMS_BY_TAB.family[0]?.id ?? "",
  local: GIFT_ITEMS_BY_TAB.local[0]?.id ?? "",
  treasure: GIFT_ITEMS_BY_TAB.treasure[0]?.id ?? "",
  luxury: GIFT_ITEMS_BY_TAB.luxury[0]?.id ?? "",
};

const INITIAL_PAGE_BY_TAB: Record<LegacyGiftMenuTab, number> = {
  featured: 0,
  family: 0,
  local: 0,
  treasure: 0,
  luxury: 0,
};

function buildAnimatedGiftFromCatalogId(catalogGiftId: string): AnimatedGiftItem | null {
  const masterItem = getGiftMasterItemById(catalogGiftId);
  return masterItem ? mapCatalogToAnimatedGift(masterItem) : null;
}

function mapStorageItemToAnimatedGift(item: GiftStorageItem): AnimatedGiftItem {
  if (item.linkedCatalogGiftId) {
    const linked = buildAnimatedGiftFromCatalogId(item.linkedCatalogGiftId);
    if (linked) {
      return {
        ...linked,
        id: item.id,
        label: item.label || linked.label,
        emoji: item.emoji || linked.emoji,
        source: "storage",
        priceDiamond: 0,
        coinEquivalent: 0,
      };
    }
  }

  return {
    id: item.id,
    emoji: item.emoji,
    label: item.label,
    durationMs: 2600,
    premium: item.rarity !== "basic",
    priceDiamond: 0,
    category: "featured",
    tier:
      item.rarity === "ultra"
        ? "ultra"
        : item.rarity === "premium"
          ? "premium"
          : "basic",
    coinEquivalent: 0,
    isFullscreen: item.rarity !== "basic",
    hasAudio: item.rarity === "ultra",
    highImpact: item.rarity !== "basic",
    premiumPlayback: item.rarity !== "basic",
    source: "storage",
  };
}

function GiftVisual({
  item,
  active,
  accent,
}: {
  item: AnimatedGiftItem;
  active: boolean;
  accent: string;
}) {
  const motionPreset = useMemo(() => getGiftMotionPreset(item.id), [item.id]);
  const floatAnim = useRef(new RNAnimated.Value(0)).current;
  const pulseAnim = useRef(new RNAnimated.Value(active ? 1 : 0.65)).current;
  const shimmerAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const floatLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        RNAnimated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: active ? 1 : 0.78,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: active ? 0.78 : 0.55,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const shimmerLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        RNAnimated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        RNAnimated.delay(700),
      ]),
    );

    floatLoop.start();
    pulseLoop.start();

    if (
      item.highImpact ||
      motionPreset?.menuIdle === "royal_glow" ||
      motionPreset?.menuIdle === "cosmic_drift"
    ) {
      shimmerLoop.start();
    }

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
      shimmerLoop.stop();
    };
  }, [active, floatAnim, item.highImpact, motionPreset?.menuIdle, pulseAnim, shimmerAnim]);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, item.premium ? 1.06 : 1.04],
  });
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, item.premium ? 0.42 : item.highImpact ? 0.36 : 0.28],
  });
  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });

  const accentGlow = hexToRgba(accent, active ? 0.24 : 0.14);
  const premiumGlow = item.premium
    ? "rgba(255,214,106,0.26)"
    : item.highImpact
      ? "rgba(141,109,255,0.26)"
      : accentGlow;

  return (
    <RNAnimated.View style={[styles.visualOuter, { transform: [{ translateY }, { scale }] }]}>
      <RNAnimated.View
        style={[styles.visualGlow, { backgroundColor: premiumGlow, opacity: glowOpacity }]}
      />
      <View
        style={[
          styles.visualWrap,
          active && styles.visualWrapActive,
          item.premium && styles.visualWrapPremium,
          item.highImpact && !item.premium && styles.visualWrapImpact,
        ]}
      >
        {item.highImpact ? (
          <RNAnimated.View
            pointerEvents="none"
            style={[
              styles.shimmerBar,
              {
                transform: [{ translateX: shimmerTranslateX }, { rotate: "18deg" }],
              },
            ]}
          />
        ) : null}

        {item.icon ? (
          <Image source={item.icon} style={styles.cardImage} resizeMode="contain" />
        ) : (
          <Text style={styles.cardEmoji}>{item.emoji ?? "🎁"}</Text>
        )}

        {item.premium ? (
          <View style={styles.premiumMiniBadge}>
            <Ionicons name="sparkles" size={9} color="#FFF7D6" />
          </View>
        ) : item.highImpact ? (
          <View style={styles.impactMiniBadge}>
            <Ionicons name="flash" size={9} color="#E9DEFF" />
          </View>
        ) : null}
      </View>
    </RNAnimated.View>
  );
}

export function AnimatedGiftSheet({
  visible,
  accent,
  accentSoft,
  onClose,
  onSelect,
  onOpenWallet,
  storageItems,
  walletBalance,
}: Props) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<LegacyGiftMenuTab>(DEFAULT_TAB);
  const [selectedGiftId, setSelectedGiftId] = useState<string>(
    INITIAL_SELECTED_BY_TAB[DEFAULT_TAB] || GIFT_ITEMS[0]?.id || "",
  );
  const [selectedByTab, setSelectedByTab] =
    useState<Record<LegacyGiftMenuTab, string>>(INITIAL_SELECTED_BY_TAB);
  const [pageByTab, setPageByTab] =
    useState<Record<LegacyGiftMenuTab, number>>(INITIAL_PAGE_BY_TAB);
  const [quantity, setQuantity] = useState<number>(1);
  const [storageVisible, setStorageVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pagesScrollRef = useRef<ScrollView | null>(null);

  const tx = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t],
  );

  const themeAccent = accent || "#27D7DF";
  const themeAccentSoft = accentSoft || hexToRgba(themeAccent, 0.18);
  const balanceText = walletBalance == null ? "—" : String(walletBalance);

  const texts = useMemo(
    () => ({
      premiumLayer: tx(
        "messenger.animatedGift.premiumLayer",
        "Premium gift layer • Messenger only",
      ),
      storage: tx("messenger.animatedGift.storage", "My"),
      featured: tx("messenger.animatedGift.featured", "Featured"),
      family: tx("messenger.animatedGift.family", "Zodiac"),
      local: tx("messenger.animatedGift.local", "Drive"),
      treasure: tx("messenger.animatedGift.treasure", "Leisure"),
      luxury: tx("messenger.animatedGift.luxury", "Premium"),
    }),
    [tx],
  );

  const tabs = useMemo(
    () => [
      { ...TAB_CONFIG[0], label: texts.featured },
      { ...TAB_CONFIG[1], label: texts.family },
      { ...TAB_CONFIG[2], label: texts.local },
      { ...TAB_CONFIG[3], label: texts.treasure },
      { ...TAB_CONFIG[4], label: texts.luxury },
    ],
    [texts],
  );

  const filtered = useMemo(() => GIFT_ITEMS_BY_TAB[activeTab] ?? [], [activeTab]);
  const pages = useMemo(() => chunk(filtered, 8), [filtered]);

  useEffect(() => {
    if (!filtered.length) return;
    const rememberedId = selectedByTab[activeTab];
    const safeId = filtered.some((item) => item.id === rememberedId)
      ? rememberedId
      : filtered[0]?.id ?? "";
    if (safeId && safeId !== selectedGiftId) setSelectedGiftId(safeId);
  }, [activeTab, filtered, selectedByTab, selectedGiftId]);

  useEffect(() => {
    if (!visible) return;
    const safePage = Math.min(pageByTab[activeTab] ?? 0, Math.max(pages.length - 1, 0));
    setCurrentPage(safePage);
    requestAnimationFrame(() => {
      pagesScrollRef.current?.scrollTo({ x: safePage * PAGE_WIDTH, animated: false });
    });
  }, [activeTab, pageByTab, pages.length, visible]);

  const selectedGift =
    filtered.find((item) => item.id === selectedGiftId) ?? filtered[0] ?? GIFT_ITEMS[0] ?? null;
  const totalDiamonds = (selectedGift?.priceDiamond ?? 0) * quantity;

  const handlePagedScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / PAGE_WIDTH);
    setCurrentPage(nextPage);
    setPageByTab((prev) => ({ ...prev, [activeTab]: nextPage }));
  };

  const handlePageDotPress = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setPageByTab((prev) => ({ ...prev, [activeTab]: pageIndex }));
    pagesScrollRef.current?.scrollTo({ x: pageIndex * PAGE_WIDTH, animated: true });
  };

  if (!visible) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <LinearGradient
            colors={[
              themeAccentSoft,
              "rgba(10,12,18,0.98)",
              "rgba(8,11,16,0.98)",
            ]}
            style={[styles.sheet, { borderTopColor: hexToRgba(themeAccent, 0.18) }]}
          >
            <View style={[styles.glowTop, { backgroundColor: hexToRgba(themeAccent, 0.10) }]} />
            <View style={[styles.glowBottom, { backgroundColor: hexToRgba(themeAccent, 0.08) }]} />

            <View style={styles.topBar}>
              <View style={styles.progressLeft}>
                <View
                  style={[styles.rankPill, { borderColor: hexToRgba(themeAccent, 0.34) }]}
                >
                  <Ionicons name="diamond-outline" size={14} color="#F8F8F8" />
                  <Text style={styles.rankText}>3D</Text>
                </View>

                <View style={styles.progressWrap}>
                  <Text style={styles.progressLabel}>{texts.premiumLayer}</Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { backgroundColor: themeAccent, width: "42%" },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <Pressable style={styles.topRight} onPress={() => setStorageVisible(true)}>
                <View
                  style={[styles.myPill, { borderColor: hexToRgba(themeAccent, 0.14) }]}
                >
                  <Ionicons name="briefcase-outline" size={14} color="#FFD76A" />
                  <Text style={styles.myText}>{texts.storage}</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.tabsRow}>
              <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsContent}
              >
                {tabs.map((tab) => {
                  const active = tab.key === activeTab;
                  const count = GIFT_ITEMS_BY_TAB[tab.key].length;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => {
                        setActiveTab(tab.key);
                        setQuantity(1);
                      }}
                      style={styles.tabPress}
                    >
                      <View style={styles.tabItem}>
                        <View
                          style={[
                            styles.tabPill,
                            active && {
                              backgroundColor: hexToRgba(themeAccent, 0.16),
                              borderColor: hexToRgba(themeAccent, 0.34),
                            },
                          ]}
                        >
                          <Ionicons
                            name={tab.icon}
                            size={13}
                            color={active ? "#FFFFFF" : "rgba(255,255,255,0.52)"}
                          />
                          <Text style={[styles.tabText, active && styles.tabTextActive]}>
                            {tab.label}
                          </Text>
                          {count > 0 ? (
                            <Text style={[styles.tabCount, active && styles.tabCountActive]}>
                              {count}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable
                style={[styles.storageButton, { borderColor: hexToRgba(themeAccent, 0.10) }]}
                onPress={() => router.push("/games" as never)}
              >
                <Ionicons name="game-controller-outline" size={22} color="#F3F4F6" />
              </Pressable>
            </View>

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
              ref={pagesScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pagesContent}
              onMomentumScrollEnd={handlePagedScroll}
            >
              {pages.map((page, pageIndex) => (
                <View key={`page-${pageIndex}`} style={styles.page}>
                  {page.map((item) => {
                    const active = item.id === selectedGiftId;

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setSelectedGiftId(item.id);
                          setSelectedByTab((prev) => ({ ...prev, [activeTab]: item.id }));
                        }}
                        style={[
                          styles.card,
                          active && styles.cardActive,
                          active && { borderColor: hexToRgba(themeAccent, 0.42) },
                        ]}
                      >
                        <GiftVisual item={item} active={active} accent={themeAccent} />

                        <Text style={styles.cardLabel} numberOfLines={1}>
                          {item.label}
                        </Text>

                        <View style={styles.cardMetaRow}>
                          {item.hasAudio ? (
                            <View style={styles.metaDot}>
                              <Ionicons name="volume-high-outline" size={10} color="#CFCFD6" />
                            </View>
                          ) : null}
                          {item.isFullscreen ? (
                            <View style={styles.metaDot}>
                              <Ionicons name="scan-outline" size={10} color="#CFCFD6" />
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.priceRow}>
                          <Ionicons
                            name="diamond-outline"
                            size={11}
                            color="rgba(245,245,245,0.68)"
                          />
                          <Text style={styles.cardPrice}>
                            {item.priceDiamond.toLocaleString()}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            {pages.length > 1 ? (
              <View style={styles.sliderStubWrap}>
                <View style={styles.pageDotsRow}>
                  {pages.map((_, index) => {
                    const active = index === currentPage;
                    return (
                      <Pressable key={`dot-${index}`} onPress={() => handlePageDotPress(index)}>
                        <View
                          style={[
                            styles.pageDot,
                            active && { width: 18, backgroundColor: themeAccent },
                          ]}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.sliderStubWrap}>
                <View style={styles.sliderStub}>
                  <View style={[styles.sliderThumb, { backgroundColor: themeAccent }]} />
                </View>
              </View>
            )}

            <View style={styles.bottomBar}>
              <Pressable style={styles.balanceSection} onPress={onOpenWallet}>
                <Ionicons name="diamond" size={18} color="#F6C94C" />
                <Text style={styles.balanceText}>{balanceText}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.70)"
                />
              </Pressable>

              <View style={styles.qtySection}>
                {QUANTITY_OPTIONS.map((value) => {
                  const active = value === quantity;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setQuantity(value)}
                      style={[
                        styles.qtyChip,
                        active && {
                          backgroundColor: themeAccent,
                          borderColor: hexToRgba(themeAccent, 0.56),
                        },
                      ]}
                    >
                      <Text style={[styles.qtyText, active && styles.qtyTextActive]}>
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={[
                  styles.arrowButton,
                  { backgroundColor: themeAccent },
                  !selectedGift && styles.arrowButtonDisabled,
                ]}
                onPress={() =>
                  selectedGift &&
                  onSelect({
                    item: selectedGift,
                    quantity,
                    totalDiamonds,
                  })
                }
                disabled={!selectedGift}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      <GiftStorageSheet
        visible={storageVisible}
        accent={themeAccent}
        onClose={() => setStorageVisible(false)}
        onSend={(storageItem) => {
          const mappedGift = mapStorageItemToAnimatedGift(storageItem);
          setStorageVisible(false);
          onSelect({ item: mappedGift, quantity: 1, totalDiamonds: 0 });
        }}
        items={storageItems}
      />
    </>
  );
}

export default AnimatedGiftSheet;

const SHEET_HEIGHT = Math.min(Math.max(height * 0.56, 390), 470);
const PAGE_WIDTH = width - 20;
const CARD_WIDTH = (PAGE_WIDTH - 18) / 4;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.30)",
  },
  sheet: {
    width: "100%",
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 150,
    height: 120,
    borderRadius: 999,
  },
  glowBottom: {
    position: "absolute",
    left: -30,
    bottom: -20,
    width: 150,
    height: 120,
    borderRadius: 999,
  },
  topBar: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  progressLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  rankPill: {
    minWidth: 58,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  progressWrap: {
    flex: 1,
    minWidth: 0,
  },
  progressLabel: {
    color: "#E9D38A",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 999,
  },
  topRight: {
    marginLeft: 10,
  },
  myPill: {
    minWidth: 90,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  myText: {
    color: "#F3F4F6",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 5,
  },
  tabsRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tabsContent: {
    paddingRight: 6,
  },
  tabPress: {
    marginRight: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabPill: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tabText: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  tabCount: {
    color: "rgba(255,255,255,0.34)",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 5,
  },
  tabCountActive: {
    color: "rgba(255,255,255,0.72)",
  },
  storageButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  pagesContent: {
    paddingBottom: 4,
  },
  page: {
    width: PAGE_WIDTH,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 8,
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardActive: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  visualOuter: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  visualGlow: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 999,
  },
  visualWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  visualWrapActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  visualWrapPremium: {
    borderColor: "rgba(255,214,106,0.18)",
  },
  visualWrapImpact: {
    borderColor: "rgba(141,109,255,0.18)",
  },
  shimmerBar: {
    position: "absolute",
    width: 20,
    height: 82,
    backgroundColor: "rgba(255,255,255,0.22)",
    opacity: 0.28,
  },
  cardImage: {
    width: 40,
    height: 40,
  },
  cardEmoji: {
    fontSize: 26,
    lineHeight: 30,
  },
  premiumMiniBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,214,106,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  impactMiniBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(141,109,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  cardMetaRow: {
    minHeight: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  metaDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  priceRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cardPrice: {
    marginLeft: 4,
    color: "rgba(245,245,245,0.68)",
    fontSize: 9,
    fontWeight: "700",
  },
  sliderStubWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 6,
    minHeight: 16,
  },
  pageDotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginHorizontal: 3,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  sliderStub: {
    width: 64,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  sliderThumb: {
    width: 24,
    height: 4,
    borderRadius: 999,
  },
  bottomBar: {
    marginTop: "auto",
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  balanceSection: {
    minWidth: 92,
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 6,
  },
  qtySection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  qtyChip: {
    minWidth: 34,
    height: 30,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    paddingHorizontal: 8,
  },
  qtyText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  qtyTextActive: {
    color: "#071711",
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowButtonDisabled: {
    opacity: 0.42,
  },
});


