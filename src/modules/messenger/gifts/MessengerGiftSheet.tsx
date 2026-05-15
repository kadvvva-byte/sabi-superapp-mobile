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
import {
  Crown,
  Gift,
  Gem,
  Sparkles,
  Volume2,
  X,
} from "lucide-react-native";

import {
  GIFT_CATALOG,
  GIFT_CATEGORY_ORDER,
  type GiftCategory,
  type GiftItem,
} from "./giftCatalog";

type Props = {
  visible: boolean;
  balanceDiamonds: number;
  selectedGiftId?: string | null;
  onClose: () => void;
  onSelectGift: (gift: GiftItem) => void;
};

const CATEGORY_LABELS: Record<GiftCategory, string> = {
  love_romance: "Love",
  cars_moto: "Cars",
  power_weapon: "Power",
  fantasy_myth: "Fantasy",
  divine: "Divine",
  luxury_status: "Luxury",
  wealth_money: "Wealth",
  animals: "Animals",
  space_epic: "Space",
  seasonal_event: "Event",
};

const CATEGORY_THEME: Record<
  GiftCategory,
  { colors: [string, string, string]; icon: string }
> = {
  love_romance: { colors: ["#C61C5A", "#831843", "#2B0B18"], icon: "💖" },
  cars_moto: { colors: ["#0EA5E9", "#0369A1", "#08253A"], icon: "🏎️" },
  power_weapon: { colors: ["#F97316", "#C2410C", "#34140A"], icon: "⚡" },
  fantasy_myth: { colors: ["#7C3AED", "#4C1D95", "#160B2D"], icon: "🐉" },
  divine: { colors: ["#8B5CF6", "#5B21B6", "#1E103D"], icon: "🪽" },
  luxury_status: { colors: ["#D4A017", "#8A5B00", "#2D1A05"], icon: "👑" },
  wealth_money: { colors: ["#10B981", "#047857", "#052E26"], icon: "💸" },
  animals: { colors: ["#F59E0B", "#B45309", "#3B1F07"], icon: "🐾" },
  space_epic: { colors: ["#2563EB", "#1D4ED8", "#09152E"], icon: "🌌" },
  seasonal_event: { colors: ["#EC4899", "#9D174D", "#3A0A1F"], icon: "🎆" },
};

function getTierLabel(gift: GiftItem) {
  switch (gift.tier) {
    case "basic_3d":
      return "Basic";
    case "visual_plus":
      return "Enhanced";
    case "premium_audio":
      return "Audio";
    case "near_fullscreen":
      return "Fullscreen";
    case "premium_fullscreen":
      return "Premium";
    case "ultra_premium":
      return "Ultra";
    default:
      return "Gift";
  }
}

function formatDiamondsFromCoin(valueCoin: number) {
  return `${(valueCoin * 100).toLocaleString("en-US")} D`;
}

function initials(title: string) {
  return title
    .split(" ")
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
}

function isFullscreenGift(gift: GiftItem) {
  return (
    gift.tier === "near_fullscreen" ||
    gift.tier === "premium_fullscreen" ||
    gift.tier === "ultra_premium"
  );
}

function isPremiumGift(gift: GiftItem) {
  return gift.tier === "premium_fullscreen" || gift.tier === "ultra_premium";
}

export default function MessengerGiftSheet({
  visible,
  balanceDiamonds,
  selectedGiftId,
  onClose,
  onSelectGift,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<GiftCategory>("love_romance");

  const gifts = useMemo(
    () => GIFT_CATALOG.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const selectedGift = useMemo(
    () => GIFT_CATALOG.find((item) => item.id === selectedGiftId) ?? null,
    [selectedGiftId]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.eyebrow}>GIFT 3D PREMIUM</Text>
              <Text style={styles.title}>Messenger Gifts</Text>
              <Text style={styles.subtitle}>
                Premium gift catalog with Diamonds pricing.
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.balanceCard}>
            <LinearGradient
              colors={["#111827", "#0F172A", "#0B1220"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceGradient}
            >
              <View style={styles.balanceGlow} />
              <View style={styles.balanceTopRow}>
                <View>
                  <Text style={styles.balanceLabel}>Available Diamonds</Text>
                  <Text style={styles.balanceValue}>
                    {balanceDiamonds.toLocaleString("en-US")} D
                  </Text>
                </View>

                <View style={styles.balanceBadge}>
                  <Gem size={14} color="#FACC15" />
                  <Text style={styles.balanceBadgeText}>1 COIN = 100 D</Text>
                </View>
              </View>

              {selectedGift ? (
                <View style={styles.selectedRow}>
                  <Text style={styles.selectedLabel}>Selected</Text>
                  <Text style={styles.selectedValue}>
                    {selectedGift.title} · {formatDiamondsFromCoin(selectedGift.priceCoin)}
                  </Text>
                </View>
              ) : (
                <View style={styles.selectedRow}>
                  <Text style={styles.selectedLabel}>Selected</Text>
                  <Text style={styles.selectedPlaceholder}>Choose a gift</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {GIFT_CATEGORY_ORDER.map((category) => {
              const theme = CATEGORY_THEME[category];
              const active = category === activeCategory;

              return (
                <Pressable
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <Text style={styles.categoryEmoji}>{theme.icon}</Text>
                  <Text style={styles.categoryText}>{CATEGORY_LABELS[category]}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
          >
            {gifts.map((gift) => {
              const theme = CATEGORY_THEME[gift.category];
              const active = gift.id === selectedGiftId;
              const giftDiamonds = gift.priceCoin * 100;
              const affordable = balanceDiamonds >= giftDiamonds;

              return (
                <Pressable
                  key={gift.id}
                  onPress={() => onSelectGift(gift)}
                  style={[
                    styles.card,
                    active && styles.cardActive,
                    !affordable && styles.cardDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={theme.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardGlow} />
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.previewOrb}>
                        <Text style={styles.previewEmoji}>{theme.icon}</Text>
                      </View>

                      <View style={styles.tierPill}>
                        <Text style={styles.tierPillText}>{getTierLabel(gift)}</Text>
                      </View>
                    </View>

                    <View style={styles.previewCenter}>
                      <Text style={styles.previewInitials}>{initials(gift.title)}</Text>
                    </View>

                    <Text numberOfLines={2} style={styles.cardTitle}>
                      {gift.title}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.priceWrap}>
                        <Gem size={14} color="#FACC15" />
                        <Text style={styles.priceText}>
                          {formatDiamondsFromCoin(gift.priceCoin)}
                        </Text>
                      </View>

                      {!affordable ? (
                        <Text style={styles.lowBalanceText}>Low balance</Text>
                      ) : null}
                    </View>

                    <View style={styles.badgesRow}>
                      {gift.hasAudio ? (
                        <View style={styles.metaBadge}>
                          <Volume2 size={12} color="#FFFFFF" />
                          <Text style={styles.metaBadgeText}>Audio</Text>
                        </View>
                      ) : null}

                      {isFullscreenGift(gift) ? (
                        <View style={styles.metaBadge}>
                          <Sparkles size={12} color="#FFFFFF" />
                          <Text style={styles.metaBadgeText}>Fullscreen</Text>
                        </View>
                      ) : null}

                      {isPremiumGift(gift) ? (
                        <View style={styles.metaBadge}>
                          <Crown size={12} color="#FFFFFF" />
                          <Text style={styles.metaBadgeText}>Premium</Text>
                        </View>
                      ) : null}
                    </View>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.bottomBar}>
            <Pressable onPress={onClose} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Close</Text>
            </Pressable>

            <Pressable
              disabled={!selectedGift}
              onPress={() => {
                if (selectedGift) onSelectGift(selectedGift);
              }}
              style={[
                styles.primaryButton,
                !selectedGift && styles.primaryButtonDisabled,
              ]}
            >
              <Gift size={16} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                {selectedGift ? "Use Selected Gift" : "Choose Gift"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: "92%",
    minHeight: "74%",
    backgroundColor: "#060F19",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  handle: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  eyebrow: {
    color: "#8EC5FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 260,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  balanceCard: {
    marginBottom: 14,
  },
  balanceGradient: {
    borderRadius: 24,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  balanceGlow: {
    position: "absolute",
    top: -24,
    right: -18,
    width: 140,
    height: 100,
    borderRadius: 34,
    backgroundColor: "rgba(250,204,21,0.10)",
  },
  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  balanceBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  selectedRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  selectedLabel: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  selectedValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  selectedPlaceholder: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryRow: {
    gap: 10,
    paddingBottom: 12,
  },
  categoryChip: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: "rgba(72,120,255,0.18)",
    borderColor: "rgba(142,197,255,0.34)",
  },
  categoryEmoji: {
    fontSize: 15,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  grid: {
    paddingBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48.5%",
    minHeight: 250,
    marginBottom: 12,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardActive: {
    borderColor: "rgba(142,197,255,0.46)",
  },
  cardDisabled: {
    opacity: 0.62,
  },
  cardGradient: {
    flex: 1,
    padding: 14,
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    top: -22,
    right: -18,
    width: 120,
    height: 92,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewOrb: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  previewEmoji: {
    fontSize: 20,
  },
  tierPill: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  tierPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  previewCenter: {
    flex: 1,
    minHeight: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  previewInitials: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
    textShadowColor: "rgba(0,0,0,0.24)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 19,
    minHeight: 40,
  },
  metaRow: {
    marginTop: 10,
    minHeight: 22,
    justifyContent: "space-between",
  },
  priceWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  lowBalanceText: {
    color: "#FFD5D5",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  metaBadge: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  bottomBar: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 6,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E1D33",
    borderWidth: 1,
    borderColor: "rgba(95,142,255,0.24)",
  },
  secondaryButtonText: {
    color: "#DCE7FF",
    fontSize: 14,
    fontWeight: "800",
  },
  primaryButton: {
    flex: 1.25,
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
    borderWidth: 1,
    borderColor: "#4F88FF",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
