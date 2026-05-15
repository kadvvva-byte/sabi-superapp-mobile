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

import { getGiftById } from "./giftCatalog";
import { GIFT_FISHING_GAME_CONFIG } from "./giftGameConfigs";
import {
  createGiftRewardEngineContext,
  resolveGiftReward,
} from "./giftRewardEngine";
import { GiftBetMultiplier, GiftCatalogItem, GiftProgramScope } from "./giftTypes";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;
  currentCoinBalance?: number;
  sourceProgram?: GiftProgramScope;
  ownerUserId: string;
  onClose: () => void;
  onCatchComplete?: (
    gift: GiftCatalogItem,
    meta: { betMultiplier: GiftBetMultiplier },
  ) => void;
};

type FishingPoolCard = {
  id: string;
  title: string;
  subtitle: string;
  tier: "basic" | "fixed_20" | "medium" | "premium";
  gift: GiftCatalogItem | null;
};

function getTierLabel(tier: FishingPoolCard["tier"]) {
  switch (tier) {
    case "basic":
      return "Basic";
    case "fixed_20":
      return "20 COIN";
    case "medium":
      return "Medium";
    case "premium":
      return "Premium";
    default:
      return "Reward";
  }
}

function getTierPalette(tier: FishingPoolCard["tier"]) {
  switch (tier) {
    case "basic":
      return {
        bgTop: "rgba(255,255,255,0.07)",
        bgBottom: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.10)",
        glow: "rgba(255,255,255,0.08)",
      };
    case "fixed_20":
      return {
        bgTop: "rgba(47,107,255,0.16)",
        bgBottom: "rgba(18,32,56,0.84)",
        border: "rgba(47,107,255,0.22)",
        glow: "rgba(47,107,255,0.18)",
      };
    case "medium":
      return {
        bgTop: "rgba(18,184,134,0.16)",
        bgBottom: "rgba(9,31,24,0.88)",
        border: "rgba(18,184,134,0.22)",
        glow: "rgba(18,184,134,0.18)",
      };
    case "premium":
      return {
        bgTop: "rgba(124,68,242,0.16)",
        bgBottom: "rgba(27,14,45,0.90)",
        border: "rgba(124,68,242,0.22)",
        glow: "rgba(124,68,242,0.18)",
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

function getGiftIcon(gift: GiftCatalogItem | null): keyof typeof Ionicons.glyphMap {
  if (!gift) return "gift-outline";

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

function buildFishingPoolCards(): FishingPoolCard[] {
  return GIFT_FISHING_GAME_CONFIG.rewardPool.map((poolItem) => {
    const gift = getGiftById(poolItem.giftId);

    return {
      id: poolItem.poolItemId,
      title: gift?.title ?? "Gift Reward",
      subtitle: gift ? `${gift.priceCoin} COIN` : "Reward",
      tier: poolItem.rewardTier,
      gift,
    };
  });
}

function BetChip({
  value,
  active,
  onPress,
  accent,
}: {
  value: GiftBetMultiplier;
  active: boolean;
  onPress: () => void;
  accent: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.betChipWrap}>
      {({ pressed }) => (
        <View
          style={[
            styles.betChip,
            active
              ? {
                  backgroundColor: `${accent}18`,
                  borderColor: `${accent}34`,
                }
              : styles.betChipIdle,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={[styles.betChipText, active ? styles.betChipTextActive : null]}>
            x{value}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function InfoCard({
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
    <View style={[styles.infoCard, { borderColor: `${accent}22` }]}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardValue}>{value}</Text>
      <Text style={styles.infoCardSubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function GiftFishingScreen({
  visible,
  accent,
  accentSoft,
  currentCoinBalance = 0,
  sourceProgram = "messenger",
  ownerUserId,
  onClose,
  onCatchComplete,
}: Props) {
  const [betMultiplier, setBetMultiplier] = useState<GiftBetMultiplier>(1);
  const [caughtGift, setCaughtGift] = useState<GiftCatalogItem | null>(null);

  const entryCost = GIFT_FISHING_GAME_CONFIG.castCostCoin * betMultiplier;
  const canCast = currentCoinBalance >= entryCost;

  const poolCards = useMemo(() => buildFishingPoolCards(), []);

  const probabilitySummary = useMemo(
    () => ({
      basic: "85%",
      fixed20: "10%",
      medium: "4%",
      premium: "1%",
    }),
    [],
  );

  const handleCast = () => {
    if (!canCast) return;

    const context = createGiftRewardEngineContext({
      userId: ownerUserId,
      sourceProgram,
      betMultiplier,
    });

    const result = resolveGiftReward({
      context,
    });

    setCaughtGift(result.selectedGift);
    onCatchComplete?.(result.selectedGift, { betMultiplier });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <LinearGradient
          colors={["rgba(12,25,28,0.98)", "rgba(6,14,16,0.98)"]}
          style={styles.sheet}
        >
          <View style={[styles.sheetGlow, { backgroundColor: accentSoft ?? `${accent}18` }]} />
          <View style={[styles.sheetGlowAlt, { backgroundColor: `${accent}14` }]} />

          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.eyebrow, { color: accent }]}>GIFT 3D PREMIUM</Text>
              <Text style={styles.title}>Fishing</Text>
              <Text style={styles.subtitle}>
                Cast for gift rewards through the shared engine. The visual game differs, the reward rules stay unified.
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
            colors={["rgba(28,56,59,0.92)", "rgba(12,23,24,0.90)"]}
            style={[styles.balanceCard, { borderColor: `${accent}22` }]}
          >
            <View style={styles.balanceTopRow}>
              <View>
                <Text style={styles.balanceLabel}>Available COIN</Text>
                <Text style={styles.balanceValue}>{currentCoinBalance.toLocaleString()}</Text>
              </View>

              <View style={[styles.modeBadge, { borderColor: `${accent}22` }]}>
                <Ionicons name="fish-outline" size={13} color={accent} />
                <Text style={[styles.modeBadgeText, { color: accent }]}>Fishing</Text>
              </View>
            </View>

            <Text style={styles.balanceHint}>
              Cast cost is fixed at 10 COIN base. Bet multiplier can slightly increase rare reward chance.
            </Text>
          </LinearGradient>

          <View style={styles.infoRow}>
            <InfoCard
              title="Cast Cost"
              value={`${entryCost} COIN`}
              subtitle={`Base 10 COIN × x${betMultiplier}`}
              accent={accent}
            />
            <InfoCard
              title="Program"
              value={sourceProgram === "stream" ? "Stream" : "Messenger"}
              subtitle="Shared reward engine"
              accent={accent}
            />
            <InfoCard
              title="Premium Chance"
              value={probabilitySummary.premium}
              subtitle="Base rare reward"
              accent={accent}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bet Multiplier</Text>
            <Text style={styles.sectionHint}>Higher bet = slightly better rare chance</Text>
          </View>

          <View style={styles.betRow}>
            {[1, 2, 3].map((value) => (
              <BetChip
                key={value}
                value={value as GiftBetMultiplier}
                active={betMultiplier === value}
                onPress={() => setBetMultiplier(value as GiftBetMultiplier)}
                accent={accent}
              />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fishing Reward Pool</Text>
            <Text style={styles.sectionHint}>Shared reward tiers inside a different game mode</Text>
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.poolRow}
          >
            {poolCards.map((card) => {
              const palette = getTierPalette(card.tier);

              return (
                <LinearGradient
                  key={card.id}
                  colors={[palette.bgTop, palette.bgBottom]}
                  style={[styles.poolCard, { borderColor: palette.border }]}
                >
                  <View style={[styles.poolGlow, { backgroundColor: palette.glow }]} />

                  <View style={styles.poolTopRow}>
                    <View style={[styles.poolIconWrap, { borderColor: palette.border }]}>
                      <Ionicons
                        name={getGiftIcon(card.gift)}
                        size={18}
                        color={accent}
                      />
                    </View>

                    <View style={styles.poolBadge}>
                      <Text style={styles.poolBadgeText}>{getTierLabel(card.tier)}</Text>
                    </View>
                  </View>

                  <Text style={styles.poolTitle} numberOfLines={2}>
                    {card.title}
                  </Text>
                  <Text style={styles.poolSubtitle}>{card.subtitle}</Text>
                </LinearGradient>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reward Profile</Text>
            <Text style={styles.sectionHint}>Same distribution as other gift games</Text>
          </View>

          <View style={styles.probabilityCard}>
            <View style={styles.probabilityRow}>
              <Text style={styles.probabilityLabel}>Basic Gifts</Text>
              <Text style={styles.probabilityValue}>{probabilitySummary.basic}</Text>
            </View>
            <View style={styles.probabilityRow}>
              <Text style={styles.probabilityLabel}>20 COIN Gift</Text>
              <Text style={styles.probabilityValue}>{probabilitySummary.fixed20}</Text>
            </View>
            <View style={styles.probabilityRow}>
              <Text style={styles.probabilityLabel}>Medium Gift</Text>
              <Text style={styles.probabilityValue}>{probabilitySummary.medium}</Text>
            </View>
            <View style={styles.probabilityRow}>
              <Text style={styles.probabilityLabel}>Premium Gift</Text>
              <Text style={styles.probabilityValue}>{probabilitySummary.premium}</Text>
            </View>
          </View>

          {caughtGift ? (
            <LinearGradient
              colors={["rgba(28,56,59,0.92)", "rgba(12,23,24,0.88)"]}
              style={[styles.resultCard, { borderColor: `${accent}22` }]}
            >
              <View style={styles.resultTopRow}>
                <View style={[styles.resultIconWrap, { borderColor: `${accent}22` }]}>
                  <Ionicons
                    name={getGiftIcon(caughtGift)}
                    size={20}
                    color={accent}
                  />
                </View>

                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>Caught Gift</Text>
                </View>
              </View>

              <Text style={styles.resultTitle}>{caughtGift.title}</Text>
              <Text style={styles.resultSubtitle}>
                {caughtGift.priceCoin} COIN · {caughtGift.shortLabel}
              </Text>

              <Text style={styles.resultHint}>
                Reward should go into shared gift storage first, then the user decides when to send it.
              </Text>
            </LinearGradient>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable onPress={onClose} style={styles.secondaryActionWrap}>
              {({ pressed }) => (
                <View style={[styles.secondaryAction, pressed ? styles.pressed : null]}>
                  <Ionicons name="arrow-back-outline" size={16} color="#F6FFF9" />
                  <Text style={styles.secondaryActionText}>Back</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={handleCast}
              disabled={!canCast}
              style={styles.primaryActionWrap}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={
                    canCast
                      ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                      : ["rgba(86,92,90,0.64)", "rgba(52,56,55,0.62)"]
                  }
                  style={[
                    styles.primaryAction,
                    pressed ? styles.pressed : null,
                    !canCast ? styles.primaryActionDisabled : null,
                  ]}
                >
                  <Ionicons name="fish-outline" size={17} color="#06130F" />
                  <Text style={styles.primaryActionText}>
                    {canCast ? `Cast for ${entryCost} COIN` : "Not Enough COIN"}
                  </Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
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
    minHeight: "84%",
    maxHeight: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
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
    color: "rgba(232,255,246,0.60)",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  balanceValue: {
    color: "#F6FFF9",
    fontSize: 22,
    fontWeight: "900",
  },
  modeBadge: {
    minHeight: 28,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  modeBadgeText: {
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

  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  infoCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
    justifyContent: "space-between",
  },
  infoCardTitle: {
    color: "rgba(232,255,246,0.58)",
    fontSize: 11,
    fontWeight: "800",
  },
  infoCardValue: {
    color: "#F6FFF9",
    fontSize: 18,
    fontWeight: "900",
  },
  infoCardSubtitle: {
    color: "rgba(232,255,246,0.50)",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#F6FFF9",
    fontSize: 15,
    fontWeight: "900",
  },
  sectionHint: {
    color: "rgba(232,255,246,0.56)",
    fontSize: 11,
    fontWeight: "800",
  },

  betRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  betChipWrap: {
    marginRight: 8,
  },
  betChip: {
    minHeight: 36,
    minWidth: 62,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  betChipIdle: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
  },
  betChipText: {
    color: "rgba(232,255,246,0.76)",
    fontSize: 12,
    fontWeight: "900",
  },
  betChipTextActive: {
    color: "#F6FFF9",
  },

  poolRow: {
    paddingBottom: 8,
  },
  poolCard: {
    width: 170,
    minHeight: 126,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
    marginRight: 10,
  },
  poolGlow: {
    position: "absolute",
    top: -18,
    right: -12,
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  poolTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  poolIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  poolBadge: {
    minHeight: 22,
    borderRadius: 999,
    paddingHorizontal: 9,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  poolBadgeText: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },
  poolTitle: {
    color: "#F6FFF9",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },
  poolSubtitle: {
    color: "rgba(232,255,246,0.60)",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },

  probabilityCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
    marginBottom: 14,
  },
  probabilityRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  probabilityLabel: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    fontWeight: "700",
  },
  probabilityValue: {
    color: "#F6FFF9",
    fontSize: 12,
    fontWeight: "900",
  },

  resultCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  resultTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  resultIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultBadge: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultBadgeText: {
    color: "#F6FFF9",
    fontSize: 10,
    fontWeight: "900",
  },
  resultTitle: {
    color: "#F6FFF9",
    fontSize: 16,
    fontWeight: "900",
  },
  resultSubtitle: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  resultHint: {
    color: "rgba(232,255,246,0.56)",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryActionWrap: {
    flex: 1,
    marginRight: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  secondaryAction: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: "#F6FFF9",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },

  primaryActionWrap: {
    flex: 1.25,
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryAction: {
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionDisabled: {
    opacity: 0.75,
  },
  primaryActionText: {
    color: "#06130F",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.988 }],
  },
});
