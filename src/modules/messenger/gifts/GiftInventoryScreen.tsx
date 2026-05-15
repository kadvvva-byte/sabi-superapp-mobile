import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GiftCatalogItem, GiftInventoryItem } from "./giftTypes";
import {
  getAvailableInventory,
  getBoughtInventory,
  getExpiredInventory,
  getUsedInventory,
  getWonInventory,
  sortInventoryByExpirySoonest,
  sortInventoryNewestFirst,
} from "./giftInventoryEngine";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;
  ownerUserId: string;
  inventoryItems: GiftInventoryItem[];
  catalogById?: Record<string, GiftCatalogItem>;
  onClose: () => void;
  onSelectInventoryItem?: (item: GiftInventoryItem) => void;
};

type InventoryTab = "all" | "available" | "won" | "bought" | "used" | "expired";

function getTierLabel(tier: GiftInventoryItem["giftTierSnapshot"]) {
  switch (tier) {
    case "basic_3d":
      return "Basic 3D";
    case "visual_plus":
      return "Visual+";
    case "premium_audio":
      return "Premium Audio";
    case "near_fullscreen":
      return "Near Fullscreen";
    case "premium_fullscreen":
      return "Premium";
    case "ultra_premium":
      return "Ultra Premium";
    default:
      return "Gift";
  }
}

function getTierPalette(tier: GiftInventoryItem["giftTierSnapshot"]) {
  switch (tier) {
    case "basic_3d":
      return {
        bgTop: "rgba(255,255,255,0.07)",
        bgBottom: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.10)",
        glow: "rgba(255,255,255,0.08)",
      };
    case "visual_plus":
      return {
        bgTop: "rgba(47,107,255,0.16)",
        bgBottom: "rgba(18,32,56,0.84)",
        border: "rgba(47,107,255,0.22)",
        glow: "rgba(47,107,255,0.18)",
      };
    case "premium_audio":
      return {
        bgTop: "rgba(18,184,134,0.16)",
        bgBottom: "rgba(9,31,24,0.88)",
        border: "rgba(18,184,134,0.22)",
        glow: "rgba(18,184,134,0.18)",
      };
    case "near_fullscreen":
      return {
        bgTop: "rgba(245,158,11,0.16)",
        bgBottom: "rgba(38,24,10,0.88)",
        border: "rgba(245,158,11,0.22)",
        glow: "rgba(245,158,11,0.18)",
      };
    case "premium_fullscreen":
      return {
        bgTop: "rgba(124,68,242,0.16)",
        bgBottom: "rgba(27,14,45,0.90)",
        border: "rgba(124,68,242,0.22)",
        glow: "rgba(124,68,242,0.18)",
      };
    case "ultra_premium":
      return {
        bgTop: "rgba(255,92,92,0.18)",
        bgBottom: "rgba(38,12,12,0.92)",
        border: "rgba(255,92,92,0.22)",
        glow: "rgba(255,92,92,0.20)",
      };
    default:
      return {
        bgTop: "rgba(255,255,255,0.07)",
        bgBottom: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.10)",
        glow: "rgba(255,255,255,0.08)",
      };
  }
}

function formatDateShort(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getDaysLeft(expiresAt: string) {
  const now = new Date();
  const expires = new Date(expiresAt);

  if (Number.isNaN(expires.getTime())) return 0;

  const diff = expires.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getStatusColors(status: GiftInventoryItem["status"]) {
  switch (status) {
    case "available":
      return {
        bg: "rgba(18,184,134,0.16)",
        border: "rgba(18,184,134,0.24)",
        text: "#D7FFF0",
      };
    case "used":
      return {
        bg: "rgba(47,107,255,0.16)",
        border: "rgba(47,107,255,0.24)",
        text: "#DCE7FF",
      };
    case "expired":
      return {
        bg: "rgba(255,92,92,0.16)",
        border: "rgba(255,92,92,0.24)",
        text: "#FFE0E0",
      };
    default:
      return {
        bg: "rgba(255,255,255,0.08)",
        border: "rgba(255,255,255,0.10)",
        text: "#F6FFF9",
      };
  }
}

function getOwnershipLabel(type: GiftInventoryItem["ownershipType"]) {
  return type === "won" ? "Won" : "Bought";
}

function getSourceLabel(source: GiftInventoryItem["sourceRewardType"]) {
  switch (source) {
    case "direct_purchase":
      return "Direct Purchase";
    case "wheel_of_fortune":
      return "Wheel of Fortune";
    case "fishing_game":
      return "Fishing";
    case "lucky_box":
      return "Lucky Box";
    case "card_flip":
      return "Card Flip";
    case "treasure_chest":
      return "Treasure Chest";
    case "stream_event":
      return "Stream Event";
    case "event_reward":
      return "Event Reward";
    default:
      return "Reward";
  }
}

function getCategoryIcon(
  category: GiftInventoryItem["giftCategorySnapshot"],
): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case "love_romance":
      return "heart-outline";
    case "cars_moto":
      return "car-sport-outline";
    case "power_weapon":
      return "flash-outline";
    case "fantasy_myth":
      return "flame-outline";
    case "divine":
      return "sparkles-outline";
    case "luxury_status":
      return "diamond-outline";
    case "wealth_money":
      return "cash-outline";
    case "animals":
      return "paw-outline";
    case "space_epic":
      return "planet-outline";
    case "seasonal_event":
      return "star-outline";
    default:
      return "gift-outline";
  }
}

function SummaryCard({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <View style={[styles.summaryCard, { borderColor: `${accent}22` }]}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summarySubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function GiftInventoryScreen({
  visible,
  accent,
  accentSoft,
  ownerUserId,
  inventoryItems,
  catalogById,
  onClose,
  onSelectInventoryItem,
}: Props) {
  const [activeTab, setActiveTab] = useState<InventoryTab>("all");

  const availableItems = useMemo(
    () => sortInventoryByExpirySoonest(getAvailableInventory(inventoryItems, ownerUserId)),
    [inventoryItems, ownerUserId],
  );

  const wonItems = useMemo(
    () => sortInventoryNewestFirst(getWonInventory(inventoryItems, ownerUserId)),
    [inventoryItems, ownerUserId],
  );

  const boughtItems = useMemo(
    () => sortInventoryNewestFirst(getBoughtInventory(inventoryItems, ownerUserId)),
    [inventoryItems, ownerUserId],
  );

  const usedItems = useMemo(
    () => sortInventoryNewestFirst(getUsedInventory(inventoryItems, ownerUserId)),
    [inventoryItems, ownerUserId],
  );

  const expiredItems = useMemo(
    () => sortInventoryNewestFirst(getExpiredInventory(inventoryItems, ownerUserId)),
    [inventoryItems, ownerUserId],
  );

  const allItems = useMemo(
    () => sortInventoryNewestFirst([...wonItems, ...boughtItems].filter(
      (item, index, arr) => arr.findIndex((x) => x.inventoryId === item.inventoryId) === index,
    )),
    [wonItems, boughtItems],
  );

  const visibleItems = useMemo(() => {
    switch (activeTab) {
      case "available":
        return availableItems;
      case "won":
        return wonItems;
      case "bought":
        return boughtItems;
      case "used":
        return usedItems;
      case "expired":
        return expiredItems;
      case "all":
      default:
        return allItems;
    }
  }, [activeTab, allItems, availableItems, wonItems, boughtItems, usedItems, expiredItems]);

  const tabs: Array<{ id: InventoryTab; title: string; count: number }> = [
    { id: "all", title: "All", count: allItems.length },
    { id: "available", title: "Available", count: availableItems.length },
    { id: "won", title: "Won", count: wonItems.length },
    { id: "bought", title: "Bought", count: boughtItems.length },
    { id: "used", title: "Used", count: usedItems.length },
    { id: "expired", title: "Expired", count: expiredItems.length },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <LinearGradient
          colors={["rgba(14,28,24,0.98)", "rgba(7,16,14,0.98)"]}
          style={styles.sheet}
        >
          <View style={[styles.sheetGlow, { backgroundColor: accentSoft ?? `${accent}18` }]} />
          <View style={[styles.sheetGlowAlt, { backgroundColor: `${accent}14` }]} />

          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.eyebrow, { color: accent }]}>GIFT 3D PREMIUM</Text>
              <Text style={styles.title}>Gift Storage</Text>
              <Text style={styles.subtitle}>
                Shared inventory for Messenger and Stream. Won gifts expire after 30 days.
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeWrap}>
              {({ pressed }) => (
                <View style={[styles.closeButton, pressed ? styles.pressed : null]}>
                  <Ionicons name="close" size={18} color="#F6FFF9" />
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <SummaryCard
              title="Available"
              value={String(availableItems.length)}
              subtitle="Ready to send"
              accent="#12B886"
            />
            <SummaryCard
              title="Won"
              value={String(wonItems.length)}
              subtitle="Reward gifts"
              accent="#7C44F2"
            />
            <SummaryCard
              title="Expired"
              value={String(expiredItems.length)}
              subtitle="Past 30 days"
              accent="#FF5C5C"
            />
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabs.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={styles.tabWrap}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.tabChip,
                        active
                          ? {
                              backgroundColor: `${accent}18`,
                              borderColor: `${accent}34`,
                            }
                          : styles.tabChipIdle,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>
                        {tab.title}
                      </Text>
                      <View
                        style={[
                          styles.tabCountPill,
                          active
                            ? { backgroundColor: `${accent}22` }
                            : styles.tabCountPillIdle,
                        ]}
                      >
                        <Text style={styles.tabCountText}>{tab.count}</Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {visibleItems.map((item) => {
              const palette = getTierPalette(item.giftTierSnapshot);
              const statusColors = getStatusColors(item.status);
              const daysLeft = getDaysLeft(item.expiresAt);
              const linkedGift = catalogById?.[item.giftId];

              return (
                <Pressable
                  key={item.inventoryId}
                  onPress={() => onSelectInventoryItem?.(item)}
                  style={styles.cardWrap}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={[palette.bgTop, palette.bgBottom]}
                      style={[
                        styles.card,
                        { borderColor: palette.border },
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <View style={[styles.cardGlow, { backgroundColor: palette.glow }]} />

                      <View style={styles.cardTopRow}>
                        <View style={[styles.iconWrap, { borderColor: palette.border }]}>
                          <Ionicons
                            name={getCategoryIcon(item.giftCategorySnapshot)}
                            size={18}
                            color={accent}
                          />
                        </View>

                        <View style={styles.badgesColumn}>
                          <View style={styles.tierBadge}>
                            <Text style={styles.tierBadgeText}>
                              {getTierLabel(item.giftTierSnapshot)}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: statusColors.bg,
                                borderColor: statusColors.border,
                              },
                            ]}
                          >
                            <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                              {item.status}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.cardTitle}>{item.giftTitleSnapshot}</Text>
                      <Text style={styles.cardSubtitle}>{item.giftShortLabelSnapshot}</Text>

                      <View style={styles.metaRow}>
                        <View style={styles.metaPill}>
                          <Ionicons name="cube-outline" size={12} color="#D9F8EC" />
                          <Text style={styles.metaPillText}>3D</Text>
                        </View>

                        <View style={styles.metaPill}>
                          <Ionicons name="layers-outline" size={12} color="#D9F8EC" />
                          <Text style={styles.metaPillText}>
                            {getOwnershipLabel(item.ownershipType)}
                          </Text>
                        </View>

                        <View style={styles.metaPill}>
                          <Ionicons name="sparkles-outline" size={12} color="#D9F8EC" />
                          <Text style={styles.metaPillText}>
                            {getSourceLabel(item.sourceRewardType)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Created</Text>
                          <Text style={styles.detailValue}>
                            {formatDateShort(item.createdAt)}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Expires</Text>
                          <Text style={styles.detailValue}>
                            {formatDateShort(item.expiresAt)}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Days left</Text>
                          <Text
                            style={[
                              styles.detailValue,
                              item.status === "expired" ? styles.detailValueExpired : null,
                            ]}
                          >
                            {item.status === "expired" ? "Expired" : `${daysLeft}d`}
                          </Text>
                        </View>

                        {linkedGift ? (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Catalog price</Text>
                            <Text style={styles.detailValue}>
                              {linkedGift.priceCoin} COIN
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.cardBottomRow}>
                        <View style={styles.quantityWrap}>
                          <Text style={styles.quantityLabel}>Quantity</Text>
                          <Text style={styles.quantityValue}>{item.quantity}</Text>
                        </View>

                        <View style={styles.actionHint}>
                          <Ionicons name="arrow-forward" size={15} color={accent} />
                          <Text style={[styles.actionHintText, { color: accent }]}>
                            Open
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  )}
                </Pressable>
              );
            })}

            {!visibleItems.length ? (
              <View style={styles.emptyState}>
                <Ionicons name="gift-outline" size={28} color="rgba(246,255,249,0.42)" />
                <Text style={styles.emptyTitle}>No gifts here yet</Text>
                <Text style={styles.emptySubtitle}>
                  Try reward games or direct purchases in GIFT 3D PREMIUM.
                </Text>
              </View>
            ) : null}

            <View style={{ height: 26 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(3,11,10,0.56)",
  },

  sheet: {
    minHeight: "82%",
    maxHeight: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 14,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(170,255,224,0.12)",
  },

  sheetGlow: {
    position: "absolute",
    top: -26,
    right: -26,
    width: 220,
    height: 180,
    borderRadius: 220,
  },
  sheetGlowAlt: {
    position: "absolute",
    left: -36,
    top: 180,
    width: 180,
    height: 180,
    borderRadius: 180,
  },

  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    color: "#F6FFF9",
    fontSize: 25,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(232,255,246,0.66)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },

  closeWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    overflow: "hidden",
  },
  closeButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    minHeight: 84,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
    justifyContent: "space-between",
  },
  summaryTitle: {
    color: "rgba(232,255,246,0.60)",
    fontSize: 11,
    fontWeight: "800",
  },
  summaryValue: {
    color: "#F6FFF9",
    fontSize: 20,
    fontWeight: "900",
  },
  summarySubtitle: {
    color: "rgba(232,255,246,0.52)",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
  },

  tabsRow: {
    paddingBottom: 8,
  },
  tabWrap: {
    marginRight: 8,
  },
  tabChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  tabChipIdle: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
  },
  tabText: {
    color: "rgba(232,255,246,0.76)",
    fontSize: 11,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#F6FFF9",
  },
  tabCountPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  tabCountPillIdle: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tabCountText: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },

  listContent: {
    paddingBottom: 4,
  },

  cardWrap: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    top: -18,
    right: -14,
    width: 120,
    height: 120,
    borderRadius: 120,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgesColumn: {
    alignItems: "flex-end",
  },
  tierBadge: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  tierBadgeText: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },
  statusBadge: {
    minHeight: 22,
    borderRadius: 999,
    paddingHorizontal: 9,
    marginTop: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  cardTitle: {
    color: "#F6FFF9",
    fontSize: 16,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  metaPill: {
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  metaPillText: {
    color: "#D9F8EC",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  detailRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: "rgba(232,255,246,0.56)",
    fontSize: 11,
    fontWeight: "700",
  },
  detailValue: {
    color: "#F6FFF9",
    fontSize: 11,
    fontWeight: "900",
  },
  detailValueExpired: {
    color: "#FFE0E0",
  },

  cardBottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityWrap: {},
  quantityLabel: {
    color: "rgba(232,255,246,0.52)",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 3,
  },
  quantityValue: {
    color: "#F6FFF9",
    fontSize: 14,
    fontWeight: "900",
  },

  actionHint: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionHintText: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },

  emptyState: {
    marginTop: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#F6FFF9",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
  },
  emptySubtitle: {
    color: "rgba(232,255,246,0.56)",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.988 }],
  },
});
