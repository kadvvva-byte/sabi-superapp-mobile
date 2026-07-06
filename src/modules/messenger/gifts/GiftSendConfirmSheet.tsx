import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GiftCatalogItem } from "./giftTypes";
import {
  DEFAULT_GIFT_FEE_RATE_BPS,
  getGiftFeeCoinAmount,
  getGiftNetCoinAmount,
} from "./giftTierRules";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;
  gift: GiftCatalogItem | null;
  currentCoinBalance?: number;
  receiverLabel?: string;
  feeRateBps?: number;
  onClose: () => void;
  sendRuntimeEnabled?: boolean;
  onConfirmSend: (gift: GiftCatalogItem) => void;
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
        border: "rgba(255,255,255,0.10)",
        glow: "rgba(255,255,255,0.06)",
      };
    case "visual_plus":
      return {
        bg: "rgba(47,107,255,0.12)",
        border: "rgba(47,107,255,0.24)",
        glow: "rgba(47,107,255,0.12)",
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
        border: "rgba(255,255,255,0.10)",
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

function SummaryRow({
  label,
  value,
  valueAccent,
}: {
  label: string;
  value: string;
  valueAccent?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={[styles.summaryRowValue, valueAccent ? styles.summaryRowValueAccent : null]}>
        {value}
      </Text>
    </View>
  );
}

export default function GiftSendConfirmSheet({
  visible,
  accent,
  accentSoft,
  gift,
  currentCoinBalance = 0,
  receiverLabel = "Recipient",
  feeRateBps = DEFAULT_GIFT_FEE_RATE_BPS,
  sendRuntimeEnabled = false,
  onClose,
  onConfirmSend,
}: Props) {
  const financials = useMemo(() => {
    if (!gift) {
      return {
        grossCoin: 0,
        feeCoin: 0,
        netCoin: 0,
        balanceAfter: currentCoinBalance,
        canSend: false,
        canPreviewHandoff: false,
      };
    }

    const grossCoin = gift.priceCoin;
    const feeCoin = getGiftFeeCoinAmount(grossCoin, feeRateBps);
    const netCoin = getGiftNetCoinAmount(grossCoin, feeRateBps);
    const balanceAfter = currentCoinBalance - grossCoin;

    return {
      grossCoin,
      feeCoin,
      netCoin,
      balanceAfter,
      canSend: sendRuntimeEnabled && balanceAfter >= 0,
      canPreviewHandoff: balanceAfter >= 0,
    };
  }, [gift, currentCoinBalance, feeRateBps, sendRuntimeEnabled]);

  if (!gift) return null;

  const tierColors = getTierColors(gift.tier);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <LinearGradient
          colors={["rgba(17,31,27,0.98)", "rgba(8,18,16,0.98)"]}
          style={styles.sheet}
        >
          <View
            style={[
              styles.sheetGlow,
              { backgroundColor: accentSoft ?? `${accent}20` },
            ]}
          />
          <View style={[styles.sheetGlowAlt, { backgroundColor: `${accent}16` }]} />

          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.eyebrow, { color: accent }]}>
                GIFT 3D PREMIUM
              </Text>
              <Text style={styles.title}>Confirm Send</Text>
              <Text style={styles.subtitle}>
                No local fake send: sender charge and receiver pending balance require backend gift ledger.
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

          <View
            style={[
              styles.giftCard,
              {
                backgroundColor: tierColors.bg,
                borderColor: tierColors.border,
              },
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
                <Ionicons name={getGiftIcon(gift)} size={20} color={accent} />
              </View>

              <View style={styles.badges}>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierBadgeText}>{getTierLabel(gift.tier)}</Text>
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
            {gift.subtitle ? <Text style={styles.giftSubtitle}>{gift.subtitle}</Text> : null}

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="cube-outline" size={12} color="#D9F8EC" />
                <Text style={styles.metaPillText}>3D</Text>
              </View>

              <View style={styles.metaPill}>
                <Ionicons
                  name={gift.hasAudio ? "volume-high-outline" : "volume-mute-outline"}
                  size={12}
                  color="#D9F8EC"
                />
                <Text style={styles.metaPillText}>
                  {gift.hasAudio ? "Audio" : "No Audio"}
                </Text>
              </View>

              <View style={styles.metaPill}>
                <Ionicons name="time-outline" size={12} color="#D9F8EC" />
                <Text style={styles.metaPillText}>
                  {gift.durationMinSec}-{gift.durationMaxSec}s
                </Text>
              </View>
            </View>
          </View>

          <LinearGradient
            colors={["rgba(40,71,63,0.90)", "rgba(14,27,23,0.88)"]}
            style={[styles.balanceCard, { borderColor: `${accent}22` }]}
          >
            <View style={styles.balanceTopRow}>
              <View>
                <Text style={styles.balanceLabel}>Current COIN</Text>
                <Text style={styles.balanceValue}>
                  {currentCoinBalance.toLocaleString()}
                </Text>
              </View>

              <View style={[styles.receiverBadge, { borderColor: `${accent}22` }]}>
                <Ionicons name="person-outline" size={13} color={accent} />
                <Text style={[styles.receiverBadgeText, { color: accent }]}>
                  {receiverLabel}
                </Text>
              </View>
            </View>

            <Text style={styles.balanceHint}>
              Receiver pending appears only after verified backend ledger event. Available balance is never faked on mobile.
            </Text>
          </LinearGradient>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Transaction Summary</Text>

            <SummaryRow
              label="Gift price"
              value={`${financials.grossCoin.toLocaleString()} COIN`}
            />
            <SummaryRow
              label="Platform fee"
              value={`${financials.feeCoin.toLocaleString()} COIN`}
            />
            <SummaryRow
              label="Receiver net credit"
              value={`${financials.netCoin.toLocaleString()} COIN`}
              valueAccent
            />
            <SummaryRow
              label="Your balance after send"
              value={`${financials.balanceAfter.toLocaleString()} COIN`}
            />

            <View style={styles.divider} />

            <Text style={styles.ruleText}>
              This is a unified Stream + Messenger gift preview. Real send, payment, Wallet mutation and payout are disabled until backend ledger is connected.
            </Text>
          </View>

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
              onPress={() => financials.canSend && onConfirmSend(gift)}
              disabled={!financials.canSend}
              style={styles.primaryActionWrap}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={
                    financials.canSend
                      ? ["rgba(126,192,173,0.96)", "rgba(44,82,71,0.88)"]
                      : ["rgba(86,92,90,0.64)", "rgba(52,56,55,0.62)"]
                  }
                  style={[
                    styles.primaryAction,
                    pressed ? styles.pressed : null,
                    !financials.canSend ? styles.primaryActionDisabled : null,
                  ]}
                >
                  <Ionicons name="gift-outline" size={17} color="#06130F" />
                  <Text style={styles.primaryActionText}>
                    {financials.canSend ? "Confirm Send" : financials.canPreviewHandoff ? "Backend Ledger Required" : "Not Enough COIN"}
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
    backgroundColor: "rgba(3,11,10,0.60)",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  sheet: {
    borderRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(170,255,224,0.12)",
  },

  sheetGlow: {
    position: "absolute",
    top: -28,
    right: -18,
    width: 210,
    height: 180,
    borderRadius: 210,
  },
  sheetGlowAlt: {
    position: "absolute",
    left: -30,
    bottom: 80,
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
    fontSize: 24,
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

  giftCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  giftGlow: {
    position: "absolute",
    top: -16,
    right: -10,
    width: 110,
    height: 110,
    borderRadius: 110,
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
  badges: {
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
    fontSize: 18,
    fontWeight: "900",
  },
  giftSubtitle: {
    color: "rgba(232,255,246,0.64)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
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
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
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

  balanceCard: {
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
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
  receiverBadge: {
    minHeight: 28,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  receiverBadgeText: {
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

  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
    marginBottom: 14,
  },
  summaryTitle: {
    color: "#F6FFF9",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },
  summaryRow: {
    minHeight: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryRowLabel: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryRowValue: {
    color: "#F6FFF9",
    fontSize: 12,
    fontWeight: "900",
  },
  summaryRowValueAccent: {
    color: "#A7F4D2",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 10,
  },
  ruleText: {
    color: "rgba(232,255,246,0.58)",
    fontSize: 11,
    lineHeight: 16,
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
    transform: [{ scale: 0.985 }],
  },
});
