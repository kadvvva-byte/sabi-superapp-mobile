import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
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

import { useI18n } from "../../../../shared/i18n";
import { GIFT_ASSET_MAP } from "../../gifts/giftAssetMap";

const { width, height } = Dimensions.get("window");

export type GiftStorageRarity = "basic" | "premium" | "ultra";
export type GiftStorageSource = "purchased" | "won" | "promo" | "seasonal";

export type GiftStorageItem = {
  id: string;
  emoji: string;
  label: string;
  rarity: GiftStorageRarity;
  quantity: number;
  source: GiftStorageSource;
  seasonalTag?: string;
  expiresInDays?: number | null;
  note?: string;
  linkedCatalogGiftId?: string;
};

type Props = {
  visible: boolean;
  accent: string;
  onClose: () => void;
  onSend: (item: GiftStorageItem) => void;
  items?: GiftStorageItem[];
};

type StorageTab = "all" | "won" | "seasonal" | "expiring";

const STORAGE_ASSET_INDEX = new Map(
  GIFT_ASSET_MAP.map((item) => [item.id, item]),
);

const INITIAL_PAGE_BY_TAB: Record<StorageTab, number> = {
  all: 0,
  won: 0,
  seasonal: 0,
  expiring: 0,
};

function chunk<T>(arr: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
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

  if (full.length !== 6) {
    return `rgba(39,215,223,${alpha})`;
  }

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return `rgba(39,215,223,${alpha})`;
  }

  return `rgba(${r},${g},${b},${alpha})`;
}

function getFilteredItems(items: GiftStorageItem[], tab: StorageTab) {
  const nonEmpty = items.filter((item) => item.quantity > 0);

  switch (tab) {
    case "won":
      return nonEmpty.filter((item) => item.source === "won");
    case "seasonal":
      return nonEmpty.filter(
        (item) => item.source === "seasonal" || Boolean(item.seasonalTag),
      );
    case "expiring":
      return nonEmpty
        .filter((item) => typeof item.expiresInDays === "number")
        .sort((a, b) => (a.expiresInDays ?? 999) - (b.expiresInDays ?? 999));
    default:
      return nonEmpty;
  }
}

function rarityGlow(rarity: GiftStorageRarity) {
  switch (rarity) {
    case "basic":
      return "rgba(78,217,223,0.22)";
    case "premium":
      return "rgba(171,116,255,0.24)";
    case "ultra":
      return "rgba(255,214,106,0.28)";
    default:
      return "rgba(78,217,223,0.22)";
  }
}

function getAssetForStorage(item: GiftStorageItem) {
  if (!item.linkedCatalogGiftId) {
    return null;
  }
  return STORAGE_ASSET_INDEX.get(item.linkedCatalogGiftId) ?? null;
}

const SHEET_HEIGHT = Math.min(Math.max(height * 0.47, 330), 390);
const PAGE_WIDTH = width - 20;
const CARD_WIDTH = (PAGE_WIDTH - 18) / 4;

export default function GiftStorageSheet({
  visible,
  accent,
  onClose,
  onSend,
  items,
}: Props) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<StorageTab>("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedByTab, setSelectedByTab] = useState<Record<StorageTab, string>>({
    all: "",
    won: "",
    seasonal: "",
    expiring: "",
  });
  const [pageByTab, setPageByTab] = useState<Record<StorageTab, number>>(INITIAL_PAGE_BY_TAB);
  const [currentPage, setCurrentPage] = useState(0);
  const pagesScrollRef = useRef<ScrollView | null>(null);

  const tx = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t],
  );

  const texts = useMemo(
    () => ({
      inventory: tx("messenger.giftStorage.inventory", "Gift inventory"),
      all: tx("common.all", "All"),
      won: tx("messenger.giftStorage.won", "Won"),
      seasonal: tx("messenger.giftStorage.seasonal", "Seasonal"),
      expiring: tx("messenger.giftStorage.expiring", "Soon"),
      emptyTitle: tx("messenger.giftStorage.emptyTitle", "Storage is empty"),
      emptyText: tx(
        "messenger.giftStorage.emptyText",
        "No gifts in this section right now.",
      ),
      buy: tx("messenger.giftStorage.buy", "Buy"),
      event: tx("messenger.giftStorage.event", "Event"),
      promo: tx("messenger.giftStorage.promo", "Promo"),
      basic: tx("messenger.giftStorage.basic", "Basic"),
      premium: tx("messenger.giftStorage.premium", "Premium"),
      ultra: tx("messenger.giftStorage.ultra", "Ultra"),
      days: tx("messenger.giftStorage.days", "d"),
    }),
    [tx],
  );

  const inventory = items ?? [];
  const themeAccent = accent || "#27D7DF";
  const themeAccentSoft = hexToRgba(themeAccent, 0.18);

  const tabs = useMemo(
    () => [
      { key: "all" as const, label: texts.all },
      { key: "won" as const, label: texts.won },
      { key: "seasonal" as const, label: texts.seasonal },
      { key: "expiring" as const, label: texts.expiring },
    ],
    [texts.all, texts.expiring, texts.seasonal, texts.won],
  );

  const filtered = useMemo(
    () => getFilteredItems(inventory, activeTab),
    [activeTab, inventory],
  );
  const pages = useMemo(() => chunk(filtered, 8), [filtered]);

  useEffect(() => {
    if (!visible) return;

    const safePage = Math.min(pageByTab[activeTab] ?? 0, Math.max(pages.length - 1, 0));
    setCurrentPage(safePage);
    requestAnimationFrame(() => {
      pagesScrollRef.current?.scrollTo({ x: safePage * PAGE_WIDTH, animated: false });
    });
  }, [activeTab, pageByTab, pages.length, visible]);

  useEffect(() => {
    const rememberedId = selectedByTab[activeTab];
    const nextSelected =
      filtered.find((item) => item.id === rememberedId)?.id ?? filtered[0]?.id ?? "";

    if (nextSelected !== selectedId) {
      setSelectedId(nextSelected);
    }
  }, [activeTab, filtered, selectedByTab, selectedId]);

  const selectedItem =
    filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  const inventoryCount = useMemo(
    () => inventory.reduce((sum, item) => sum + item.quantity, 0),
    [inventory],
  );

  const expiringCount = useMemo(
    () =>
      inventory.filter(
        (item) => typeof item.expiresInDays === "number" && item.quantity > 0,
      ).length,
    [inventory],
  );

  const selectedMeta =
    selectedItem?.expiresInDays != null
      ? `${selectedItem.expiresInDays}${texts.days}`
      : selectedItem?.source === "won"
        ? texts.won
        : selectedItem?.source === "seasonal"
          ? texts.event
          : selectedItem?.source === "promo"
            ? texts.promo
            : texts.buy;

  const handleTabPress = (tab: StorageTab) => {
    setActiveTab(tab);
  };

  const handleSelectItem = (item: GiftStorageItem) => {
    setSelectedId(item.id);
    setSelectedByTab((prev) => ({
      ...prev,
      [activeTab]: item.id,
    }));
  };

  const handlePagedScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / PAGE_WIDTH);
    setCurrentPage(nextPage);
    setPageByTab((prev) => ({
      ...prev,
      [activeTab]: nextPage,
    }));
  };

  const handlePageDotPress = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setPageByTab((prev) => ({
      ...prev,
      [activeTab]: pageIndex,
    }));
    pagesScrollRef.current?.scrollTo({ x: pageIndex * PAGE_WIDTH, animated: true });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheetWrap}>
          <LinearGradient
            colors={[
              themeAccentSoft,
              "rgba(10,12,18,0.98)",
              "rgba(8,11,16,0.98)",
            ]}
            style={[styles.sheet, { borderTopColor: hexToRgba(themeAccent, 0.18) }]}
          >
            <View
              style={[
                styles.glowTop,
                { backgroundColor: hexToRgba(themeAccent, 0.10) },
              ]}
            />
            <View style={styles.topBar}>
              <View style={styles.progressLeft}>
                <View style={[styles.rankPill, { borderColor: hexToRgba(themeAccent, 0.34) }]}>
                  <Ionicons name="gift-outline" size={14} color="#F8F8F8" />
                  <Text style={styles.rankText}>{inventoryCount}</Text>
                </View>

                <View style={styles.progressWrap}>
                  <Text style={styles.progressLabel}>{texts.inventory}</Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, Math.max(12, expiringCount * 12))}%`,
                          backgroundColor: themeAccent,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <Pressable style={styles.topRight} onPress={onClose}>
                <View style={[styles.myPill, { borderColor: hexToRgba(themeAccent, 0.14) }]}>
                  <Ionicons name="timer-outline" size={14} color="#FFD76A" />
                  <Text style={styles.myText}>{expiringCount}</Text>
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
                  const count = getFilteredItems(inventory, tab.key).length;
                  return (
                    <Pressable key={tab.key} onPress={() => handleTabPress(tab.key)} style={styles.tabPress}>
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
                          <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                          {count > 0 ? (
                            <Text style={[styles.tabCount, active && styles.tabCountActive]}>{count}</Text>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={[styles.storageButton, { borderColor: hexToRgba(themeAccent, 0.10) }]}>
                <Ionicons name="archive-outline" size={18} color="#F3F4F6" />
              </View>
            </View>

            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
              ref={pagesScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pagesContent}
              onMomentumScrollEnd={handlePagedScroll}
            >
              {pages.length ? (
                pages.map((page, pageIndex) => (
                  <View key={`page-${pageIndex}`} style={styles.page}>
                    {page.map((item) => {
                      const active = item.id === selectedId;
                      const asset = getAssetForStorage(item);

                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => handleSelectItem(item)}
                          style={[
                            styles.card,
                            active && styles.cardActive,
                            active && { borderColor: hexToRgba(themeAccent, 0.42) },
                          ]}
                        >
                          <View style={styles.visualOuter}>
                            <View
                              style={[
                                styles.visualGlow,
                                { backgroundColor: rarityGlow(item.rarity) },
                                active ? styles.visualGlowActive : undefined,
                              ]}
                            />
                            <View style={[styles.visualWrap, active && styles.visualWrapActive]}>
                              {asset?.icon ? (
                                <Image source={asset.icon} style={styles.cardImage} resizeMode="contain" />
                              ) : (
                                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                              )}

                              {item.rarity !== "basic" ? (
                                <View style={styles.premiumMiniBadge}>
                                  <Ionicons
                                    name={item.rarity === "ultra" ? "diamond" : "sparkles"}
                                    size={9}
                                    color="#FFF7D6"
                                  />
                                </View>
                              ) : null}

                              <View style={styles.quantityBadge}>
                                <Text style={styles.quantityBadgeText}>×{item.quantity}</Text>
                              </View>
                            </View>
                          </View>

                          <Text style={styles.cardLabel} numberOfLines={1}>
                            {item.label}
                          </Text>

                          <View style={styles.priceRow}>
                            <Ionicons name="cube-outline" size={11} color="rgba(245,245,245,0.68)" />
                            <Text style={styles.cardPrice}>{selectedMeta}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyPage}>
                  <Ionicons name="gift-outline" size={28} color="rgba(255,255,255,0.24)" />
                  <Text style={styles.emptyTitle}>{texts.emptyTitle}</Text>
                  <Text style={styles.emptyText}>{texts.emptyText}</Text>
                </View>
              )}
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
              <View style={styles.balanceSection}>
                <Ionicons name="briefcase-outline" size={18} color="#F6C94C" />
                <Text style={styles.balanceText}>{selectedItem?.quantity ?? 0}</Text>
                <Text style={styles.balanceSubtext}>{selectedMeta}</Text>
              </View>

              <View style={styles.qtySection}>
                {selectedItem ? (
                  <View style={styles.infoChip}>
                    <Text style={styles.infoChipText}>
                      {selectedItem.rarity === "basic"
                        ? texts.basic
                        : selectedItem.rarity === "premium"
                          ? texts.premium
                          : texts.ultra}
                    </Text>
                  </View>
                ) : null}
                {selectedItem?.seasonalTag ? (
                  <View style={styles.infoChip}>
                    <Text style={styles.infoChipText}>{selectedItem.seasonalTag}</Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                style={[
                  styles.arrowButton,
                  { backgroundColor: themeAccent },
                  !selectedItem && styles.arrowButtonDisabled,
                ]}
                disabled={!selectedItem}
                onPress={() => selectedItem && onSend(selectedItem)}
              >
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.26)",
  },
  sheetWrap: {
    width: "100%",
    height: SHEET_HEIGHT,
  },
  sheet: {
    width: "100%",
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -28,
    right: -18,
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
    marginBottom: 8,
  },
  progressLeft: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 },
  rankPill: {
    minWidth: 54,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginLeft: 4 },
  progressWrap: { flex: 1, minWidth: 0 },
  progressLabel: { color: "#E9D38A", fontSize: 11, fontWeight: "700", marginBottom: 3 },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  progressFill: { height: 4, borderRadius: 999 },
  topRight: { marginLeft: 10 },
  myPill: {
    minWidth: 72,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  myText: { color: "#F3F4F6", fontSize: 13, fontWeight: "700", marginLeft: 5 },
  tabsRow: { minHeight: 38, flexDirection: "row", alignItems: "center", marginBottom: 8 },
  tabsContent: { paddingRight: 6 },
  tabPress: { marginRight: 10 },
  tabItem: { alignItems: "center", justifyContent: "center" },
  tabPill: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tabText: { color: "rgba(255,255,255,0.46)", fontSize: 12, fontWeight: "700" },
  tabTextActive: { color: "#FFFFFF", fontWeight: "800" },
  tabCount: {
    color: "rgba(255,255,255,0.34)",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 5,
  },
  tabCountActive: { color: "rgba(255,255,255,0.72)" },
  storageButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  pagesContent: { paddingBottom: 4 },
  page: {
    width: PAGE_WIDTH,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 8,
    borderRadius: 16,
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
    opacity: 0.64,
  },
  visualGlowActive: {
    opacity: 0.88,
    transform: [{ scale: 1.06 }],
  },
  visualWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  visualWrapActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardImage: {
    width: 38,
    height: 38,
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
  quantityBadge: {
    position: "absolute",
    bottom: 3,
    right: 3,
    minWidth: 16,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },
  cardLabel: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
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
  emptyPage: {
    width: PAGE_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 42,
  },
  emptyTitle: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
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
    minWidth: 88,
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 6,
  },
  balanceSubtext: {
    color: "rgba(255,255,255,0.54)",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 6,
  },
  qtySection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  infoChip: {
    minHeight: 24,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  infoChipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
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


