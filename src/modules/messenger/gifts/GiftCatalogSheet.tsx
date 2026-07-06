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

import { GIFT_CATEGORY_ORDER, getCurrentlyAvailableGiftCatalog } from "./giftCatalog";
import { MessengerUnifiedGiftsReadinessPanel197V } from "./MessengerUnifiedGiftsReadinessPanel197V";
import {
  GiftCatalogItem,
  GiftCatalogSection,
  GiftProgramScope,
} from "./giftTypes";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;
  sourceProgram?: GiftProgramScope;
  currentCoinBalance?: number;
  onClose: () => void;
  onSelectGift: (gift: GiftCatalogItem) => void;
  onOpenSection?: (section: GiftCatalogSection) => void;
};

type SectionCardItem = {
  id: GiftCatalogSection;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SECTION_CARDS: readonly SectionCardItem[] = [
  {
    id: "shop",
    title: "Shop",
    subtitle: "All 3D premium gifts by category",
    icon: "gift-outline",
  },
  {
    id: "wheel_of_fortune",
    title: "Wheel of Fortune",
    subtitle: "10 COIN spin reward game",
    icon: "sync-outline",
  },
  {
    id: "fishing",
    title: "Fishing",
    subtitle: "Catch gifts from the shared reward engine",
    icon: "fish-outline",
  },
  {
    id: "inventory",
    title: "Storage",
    subtitle: "Bought and won gifts",
    icon: "albums-outline",
  },
  {
    id: "event_gifts",
    title: "Event Gifts",
    subtitle: "Seasonal and limited-time gifts",
    icon: "sparkles-outline",
  },
] as const;

const CATEGORY_TITLES: Record<GiftCatalogItem["category"], string> = {
  love_romance: "Love / Romance",
  cars_moto: "Cars / Moto",
  power_weapon: "Power / Weapon",
  fantasy_myth: "Fantasy / Myth",
  divine: "Divine",
  luxury_status: "Luxury / Status",
  wealth_money: "Wealth / Money",
  animals: "Animals",
  space_epic: "Space / Epic",
  seasonal_event: "Event Gifts",
};

function getTierLabel(tier: GiftCatalogItem["tier"]) {
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

function getTierColors(tier: GiftCatalogItem["tier"]) {
  switch (tier) {
    case "basic_3d":
      return {
        bg: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.12)",
        glow: "rgba(255,255,255,0.06)",
      };
    case "visual_plus":
      return {
        bg: "rgba(47,107,255,0.12)",
        border: "rgba(47,107,255,0.24)",
        glow: "rgba(47,107,255,0.14)",
      };
    case "premium_audio":
      return {
        bg: "rgba(18,184,134,0.12)",
        border: "rgba(18,184,134,0.24)",
        glow: "rgba(18,184,134,0.16)",
      };
    case "near_fullscreen":
      return {
        bg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.24)",
        glow: "rgba(245,158,11,0.16)",
      };
    case "premium_fullscreen":
      return {
        bg: "rgba(124,68,242,0.12)",
        border: "rgba(124,68,242,0.24)",
        glow: "rgba(124,68,242,0.16)",
      };
    case "ultra_premium":
      return {
        bg: "rgba(255,92,92,0.12)",
        border: "rgba(255,92,92,0.24)",
        glow: "rgba(255,92,92,0.18)",
      };
    default:
      return {
        bg: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.12)",
        glow: "rgba(255,255,255,0.06)",
      };
  }
}

function getGiftIcon(gift: GiftCatalogItem): keyof typeof Ionicons.glyphMap {
  switch (gift.category) {
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

export default function GiftCatalogSheet({
  visible,
  accent,
  accentSoft,
  sourceProgram = "messenger",
  currentCoinBalance = 0,
  onClose,
  onSelectGift,
  onOpenSection,
}: Props) {
  const [selectedCategory, setSelectedCategory] =
    useState<GiftCatalogItem["category"]>("love_romance");

  const availableCatalog = useMemo(
    () => getCurrentlyAvailableGiftCatalog(sourceProgram),
    [sourceProgram],
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<GiftCatalogItem["category"], number>();
    GIFT_CATEGORY_ORDER.forEach((category) => map.set(category, 0));
    availableCatalog.forEach((item) => {
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    });
    return map;
  }, [availableCatalog]);

  const selectedCategoryItems = useMemo(
    () =>
      availableCatalog.filter((item) => item.category === selectedCategory),
    [availableCatalog, selectedCategory],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <LinearGradient
          colors={["rgba(15,28,24,0.98)", "rgba(8,18,16,0.98)"]}
          style={styles.sheet}
        >
          <View
            style={[
              styles.sheetGlow,
              { backgroundColor: accentSoft ?? `${accent}20` },
            ]}
          />
          <View style={[styles.sheetGlowAlt, { backgroundColor: `${accent}18` }]} />

          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.eyebrow, { color: accent }]}>
                GIFT 3D PREMIUM
              </Text>
              <Text style={styles.title}>Gift Catalog</Text>
              <Text style={styles.subtitle}>
                Unified Stream + Messenger gift catalog. Real send is backend-ledger only.
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

          <LinearGradient
            colors={["rgba(41,77,69,0.92)", "rgba(15,29,25,0.92)"]}
            style={[styles.balanceCard, { borderColor: `${accent}26` }]}
          >
            <View style={styles.balanceTopRow}>
              <View>
                <Text style={styles.balanceLabel}>Available COIN</Text>
                <Text style={styles.balanceValue}>
                  {currentCoinBalance.toLocaleString()}
                </Text>
              </View>

              <View style={[styles.balanceBadge, { borderColor: `${accent}30` }]}>
                <Ionicons name="wallet-outline" size={14} color={accent} />
                <Text style={[styles.balanceBadgeText, { color: accent }]}>
                  {sourceProgram === "stream" ? "Stream" : "Messenger"}
                </Text>
              </View>
            </View>

            <Text style={styles.balanceHint}>
              Preview catalog only: no local fake purchase, no fake receiver balance, backend ledger required.
            </Text>
          </LinearGradient>

          <MessengerUnifiedGiftsReadinessPanel197V accent={accent} />

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionCardsRow}
          >
            {SECTION_CARDS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onOpenSection?.(item.id)}
                style={styles.sectionCardWrap}
              >
                {({ pressed }) => (
                  <LinearGradient
                    colors={["rgba(48,76,69,0.90)", "rgba(16,29,25,0.88)"]}
                    style={[
                      styles.sectionCard,
                      { borderColor: `${accent}18` },
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <View style={[styles.sectionIconWrap, { borderColor: `${accent}22` }]}>
                      <Ionicons name={item.icon} size={16} color={accent} />
                    </View>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                    <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
                  </LinearGradient>
                )}
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.categoriesHeader}>
            <Text style={styles.sectionLabel}>Categories</Text>
            <Text style={styles.sectionLabelSecondary}>
              {availableCatalog.length} gifts
            </Text>
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsRow}
          >
            {GIFT_CATEGORY_ORDER.filter(
              (category) => (categoryCounts.get(category) ?? 0) > 0,
            ).map((category) => {
              const active = category === selectedCategory;
              const count = categoryCounts.get(category) ?? 0;

              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={styles.categoryChipWrap}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.categoryChip,
                        active
                          ? {
                              backgroundColor: `${accent}18`,
                              borderColor: `${accent}36`,
                            }
                          : styles.categoryChipIdle,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          active ? { color: "#F6FFF9" } : styles.categoryChipTextIdle,
                        ]}
                      >
                        {CATEGORY_TITLES[category]}
                      </Text>
                      <View
                        style={[
                          styles.categoryCountPill,
                          active
                            ? { backgroundColor: `${accent}24` }
                            : styles.categoryCountPillIdle,
                        ]}
                      >
                        <Text style={styles.categoryCountText}>{count}</Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.categoriesHeader}>
            <Text style={styles.sectionLabel}>
              {CATEGORY_TITLES[selectedCategory]}
            </Text>
            <Text style={styles.sectionLabelSecondary}>
              {selectedCategoryItems.length} items
            </Text>
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.giftList}
          >
            {selectedCategoryItems.map((gift) => {
              const tierColors = getTierColors(gift.tier);

              return (
                <Pressable
                  key={gift.id}
                  onPress={() => onSelectGift(gift)}
                  style={styles.giftCardWrap}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.giftCard,
                        {
                          backgroundColor: tierColors.bg,
                          borderColor: tierColors.border,
                        },
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <View
                        style={[
                          styles.giftGlow,
                          { backgroundColor: tierColors.glow },
                        ]}
                      />

                      <View style={styles.giftTopRow}>
                        <View
                          style={[
                            styles.giftIconWrap,
                            { borderColor: tierColors.border },
                          ]}
                        >
                          <Ionicons
                            name={getGiftIcon(gift)}
                            size={18}
                            color={accent}
                          />
                        </View>

                        <View style={styles.giftBadges}>
                          <View style={styles.tierBadge}>
                            <Text style={styles.tierBadgeText}>
                              {getTierLabel(gift.tier)}
                            </Text>
                          </View>

                          {gift.badgeLabel ? (
                            <View style={[styles.specialBadge, { borderColor: `${accent}22` }]}>
                              <Text style={[styles.specialBadgeText, { color: accent }]}>
                                {gift.badgeLabel}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      <Text style={styles.giftTitle}>{gift.title}</Text>

                      {gift.subtitle ? (
                        <Text style={styles.giftSubtitle}>{gift.subtitle}</Text>
                      ) : null}

                      <View style={styles.giftMetaRow}>
                        <View style={styles.metaPill}>
                          <Ionicons
                            name="cube-outline"
                            size={12}
                            color="#D8F6EA"
                          />
                          <Text style={styles.metaPillText}>3D</Text>
                        </View>

                        <View style={styles.metaPill}>
                          <Ionicons
                            name={
                              gift.hasAudio
                                ? "volume-high-outline"
                                : "volume-mute-outline"
                            }
                            size={12}
                            color="#D8F6EA"
                          />
                          <Text style={styles.metaPillText}>
                            {gift.hasAudio ? "Audio" : "No Audio"}
                          </Text>
                        </View>

                        <View style={styles.metaPill}>
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color="#D8F6EA"
                          />
                          <Text style={styles.metaPillText}>
                            {gift.durationMinSec}-{gift.durationMaxSec}s
                          </Text>
                        </View>
                      </View>

                      <View style={styles.giftBottomRow}>
                        <View>
                          <Text style={styles.priceLabel}>Price</Text>
                          <Text style={styles.priceValue}>
                            {gift.priceCoin} COIN
                          </Text>
                        </View>

                        <LinearGradient
                          colors={["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]}
                          style={styles.sendButton}
                        >
                          <Ionicons name="arrow-forward" size={15} color="#06130F" />
                          <Text style={styles.sendButtonText}>Select</Text>
                        </LinearGradient>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}

            <View style={{ height: 28 }} />
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
    backgroundColor: "rgba(3,11,10,0.55)",
  },

  sheet: {
    minHeight: "84%",
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
    top: -24,
    right: -26,
    width: 220,
    height: 180,
    borderRadius: 220,
  },
  sheetGlowAlt: {
    position: "absolute",
    left: -34,
    top: 120,
    width: 200,
    height: 200,
    borderRadius: 200,
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
    fontSize: 26,
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

  balanceCard: {
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  balanceValue: {
    color: "#F6FFF9",
    fontSize: 24,
    fontWeight: "900",
  },
  balanceBadge: {
    minHeight: 28,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  balanceBadgeText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "900",
  },
  balanceHint: {
    marginTop: 8,
    color: "rgba(232,255,246,0.60)",
    fontSize: 11,
    lineHeight: 15,
  },

  sectionCardsRow: {
    paddingBottom: 10,
  },
  sectionCardWrap: {
    width: 168,
    marginRight: 10,
  },
  sectionCard: {
    minHeight: 96,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#F6FFF9",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "rgba(232,255,246,0.58)",
    fontSize: 11,
    lineHeight: 15,
  },

  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    color: "#F6FFF9",
    fontSize: 15,
    fontWeight: "900",
  },
  sectionLabelSecondary: {
    color: "rgba(232,255,246,0.58)",
    fontSize: 11,
    fontWeight: "800",
  },

  categoryTabsRow: {
    paddingBottom: 8,
  },
  categoryChipWrap: {
    marginRight: 8,
  },
  categoryChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryChipIdle: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "900",
  },
  categoryChipTextIdle: {
    color: "rgba(232,255,246,0.74)",
  },
  categoryCountPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  categoryCountPillIdle: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  categoryCountText: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },

  giftList: {
    paddingBottom: 4,
  },
  giftCardWrap: {
    marginBottom: 10,
  },
  giftCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  giftGlow: {
    position: "absolute",
    top: -16,
    right: -12,
    width: 120,
    height: 120,
    borderRadius: 120,
  },

  giftTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  giftIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  giftBadges: {
    alignItems: "flex-end",
  },
  tierBadge: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
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
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  specialBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },

  giftTitle: {
    color: "#F6FFF9",
    fontSize: 17,
    fontWeight: "900",
  },
  giftSubtitle: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },

  giftMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  metaPill: {
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  metaPillText: {
    color: "#D8F6EA",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  giftBottomRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: "rgba(232,255,246,0.56)",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 2,
  },
  priceValue: {
    color: "#F6FFF9",
    fontSize: 19,
    fontWeight: "900",
  },

  sendButton: {
    minWidth: 94,
    height: 38,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#06130F",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
