import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GiftRoomHistoryCardViewModel } from "./giftTypes";

type Props = {
  item: GiftRoomHistoryCardViewModel;
  isOwnMessage?: boolean;
  senderLabel?: string;
  receiverLabel?: string;
  accent?: string;
  onPress?: (item: GiftRoomHistoryCardViewModel) => void;
};

function getTierLabel(tier: GiftRoomHistoryCardViewModel["tier"]) {
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

function getTierPalette(tier: GiftRoomHistoryCardViewModel["tier"]) {
  switch (tier) {
    case "basic_3d":
      return {
        border: "rgba(255,255,255,0.10)",
        bgTop: "rgba(255,255,255,0.07)",
        bgBottom: "rgba(255,255,255,0.04)",
        glow: "rgba(255,255,255,0.07)",
        accent: "#E9FFF5",
      };
    case "visual_plus":
      return {
        border: "rgba(47,107,255,0.24)",
        bgTop: "rgba(47,107,255,0.16)",
        bgBottom: "rgba(18,32,56,0.84)",
        glow: "rgba(47,107,255,0.18)",
        accent: "#CFE0FF",
      };
    case "premium_audio":
      return {
        border: "rgba(18,184,134,0.24)",
        bgTop: "rgba(18,184,134,0.16)",
        bgBottom: "rgba(9,31,24,0.88)",
        glow: "rgba(18,184,134,0.18)",
        accent: "#D7FFF0",
      };
    case "near_fullscreen":
      return {
        border: "rgba(245,158,11,0.24)",
        bgTop: "rgba(245,158,11,0.16)",
        bgBottom: "rgba(38,24,10,0.88)",
        glow: "rgba(245,158,11,0.18)",
        accent: "#FFE9C6",
      };
    case "premium_fullscreen":
      return {
        border: "rgba(124,68,242,0.24)",
        bgTop: "rgba(124,68,242,0.16)",
        bgBottom: "rgba(27,14,45,0.90)",
        glow: "rgba(124,68,242,0.20)",
        accent: "#E9D9FF",
      };
    case "ultra_premium":
      return {
        border: "rgba(255,92,92,0.24)",
        bgTop: "rgba(255,92,92,0.16)",
        bgBottom: "rgba(38,12,12,0.92)",
        glow: "rgba(255,92,92,0.22)",
        accent: "#FFE0E0",
      };
    default:
      return {
        border: "rgba(255,255,255,0.10)",
        bgTop: "rgba(255,255,255,0.07)",
        bgBottom: "rgba(255,255,255,0.04)",
        glow: "rgba(255,255,255,0.07)",
        accent: "#E9FFF5",
      };
  }
}

function getCategoryIcon(
  category: GiftRoomHistoryCardViewModel["category"],
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

function formatVisibilityDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Month end";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatCoins(value: number) {
  return `${value.toLocaleString()} COIN`;
}

function GiftHistoryCardComponent({
  item,
  isOwnMessage = false,
  senderLabel = "Sender",
  receiverLabel = "Receiver",
  accent = "#7EC0AD",
  onPress,
}: Props) {
  const palette = useMemo(() => getTierPalette(item.tier), [item.tier]);

  const alignmentStyle = isOwnMessage ? styles.alignRight : styles.alignLeft;
  const cardWidthStyle = isOwnMessage ? styles.cardOwn : styles.cardOther;
  const visibilityDate = formatVisibilityDate(item.visibleToRoomUntil);
  const iconName = getCategoryIcon(item.category);

  return (
    <View style={[styles.wrapper, alignmentStyle]}>
      <Pressable onPress={() => onPress?.(item)} style={cardWidthStyle}>
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

              <View style={styles.badges}>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierBadgeText}>{getTierLabel(item.tier)}</Text>
                </View>

                {item.rewardTier === "premium" ? (
                  <View style={[styles.specialBadge, { borderColor: `${accent}25` }]}>
                    <Text style={[styles.specialBadgeText, { color: accent }]}>
                      Premium
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.shortLabel}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="cube-outline" size={12} color={palette.accent} />
                <Text style={[styles.metaPillText, { color: palette.accent }]}>
                  3D Gift
                </Text>
              </View>

              <View style={styles.metaPill}>
                <Ionicons name="wallet-outline" size={12} color={palette.accent} />
                <Text style={[styles.metaPillText, { color: palette.accent }]}>
                  {formatCoins(item.priceCoin)}
                </Text>
              </View>
            </View>

            <View style={styles.peopleRow}>
              <View style={styles.personPill}>
                <Ionicons name="arrow-up-outline" size={12} color="#D7FFF0" />
                <Text style={styles.personPillText}>{senderLabel}</Text>
              </View>

              {item.receiverUserId ? (
                <View style={styles.personPill}>
                  <Ionicons name="arrow-down-outline" size={12} color="#D7FFF0" />
                  <Text style={styles.personPillText}>{receiverLabel}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.bottomRow}>
              <View>
                <Text style={styles.bottomLabel}>Visible in room until</Text>
                <Text style={styles.bottomValue}>{visibilityDate}</Text>
              </View>

              <View style={styles.replayWrap}>
                {(item.isReplayableForSender || item.isReplayableForReceiver) && (
                  <View style={[styles.replayPill, { borderColor: `${accent}22` }]}>
                    <Ionicons name="play-outline" size={12} color={accent} />
                    <Text style={[styles.replayPillText, { color: accent }]}>
                      Replay
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}

export const GiftHistoryCard = memo(GiftHistoryCardComponent);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    width: "100%",
  },
  alignLeft: {
    alignItems: "flex-start",
  },
  alignRight: {
    alignItems: "flex-end",
  },

  cardOwn: {
    width: "86%",
  },
  cardOther: {
    width: "86%",
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -20,
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
  badges: {
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
  specialBadge: {
    minHeight: 22,
    borderRadius: 999,
    paddingHorizontal: 9,
    marginTop: 6,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  specialBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },

  title: {
    color: "#F6FFF9",
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(233,255,245,0.62)",
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
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  peopleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  personPill: {
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
  personPillText: {
    color: "#D7FFF0",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  bottomRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bottomLabel: {
    color: "rgba(233,255,245,0.52)",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 3,
  },
  bottomValue: {
    color: "#F6FFF9",
    fontSize: 12,
    fontWeight: "900",
  },

  replayWrap: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  replayPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  replayPillText: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.988 }],
  },
});