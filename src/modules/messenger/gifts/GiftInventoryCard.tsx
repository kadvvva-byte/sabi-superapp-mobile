import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GiftCatalogItem, GiftInventoryItem } from "./giftTypes";

type Props = {
  item: GiftInventoryItem;
  accent?: string;
  catalogItem?: GiftCatalogItem | null;
  onPress?: (item: GiftInventoryItem) => void;
};

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

function GiftInventoryCardComponent({
  item,
  accent = "#7EC0AD",
  catalogItem,
  onPress,
}: Props) {
  const palette = useMemo(
    () => getTierPalette(item.giftTierSnapshot),
    [item.giftTierSnapshot],
  );
  const statusColors = useMemo(
    () => getStatusColors(item.status),
    [item.status],
  );

  const daysLeft = getDaysLeft(item.expiresAt);
  const iconName = getCategoryIcon(item.giftCategorySnapshot);

  return (
    <Pressable onPress={() => onPress?.(item)}>
      {({ pressed }) => (
        <LinearGradient
          colors={[palette.bgTop, palette.bgBottom]}
          style={[
            styles.card,
            { borderColor: palette.border },
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={[styles.glow, { backgroundColor: palette.glow }]} />

          <View style={styles.topRow}>
            <View style={[styles.iconWrap, { borderColor: palette.border }]}>
              <Ionicons name={iconName} size={18} color={accent} />
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

          <Text style={styles.title}>{item.giftTitleSnapshot}</Text>
          <Text style={styles.subtitle}>{item.giftShortLabelSnapshot}</Text>

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
              <Text style={styles.detailValue}>{formatDateShort(item.createdAt)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expires</Text>
              <Text style={styles.detailValue}>{formatDateShort(item.expiresAt)}</Text>
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

            {catalogItem ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Catalog price</Text>
                <Text style={styles.detailValue}>{catalogItem.priceCoin} COIN</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.bottomLabel}>Quantity</Text>
              <Text style={styles.bottomValue}>{item.quantity}</Text>
            </View>

            <View style={styles.openPill}>
              <Ionicons name="arrow-forward" size={15} color={accent} />
              <Text style={[styles.openPillText, { color: accent }]}>Open</Text>
            </View>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

export const GiftInventoryCard = memo(GiftInventoryCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
    marginBottom: 10,
  },
  glow: {
    position: "absolute",
    top: -18,
    right: -14,
    width: 120,
    height: 120,
    borderRadius: 120,
  },

  topRow: {
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

  title: {
    color: "#F6FFF9",
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
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

  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomLabel: {
    color: "rgba(232,255,246,0.52)",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 3,
  },
  bottomValue: {
    color: "#F6FFF9",
    fontSize: 14,
    fontWeight: "900",
  },

  openPill: {
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
  openPillText: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.988 }],
  },
});