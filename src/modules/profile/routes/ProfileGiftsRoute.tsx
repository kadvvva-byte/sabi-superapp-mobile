import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  Crown,
  Gift,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  User,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";
import { syncCurrentProfilePublicSurface, syncCurrentProfilePublicSurfaceToBackend } from "../../messenger/public/publicProfileSync";

const BG_TOP = "#04120D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";

const CARD = "rgba(14, 28, 46, 0.86)";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const SOFT = "#DCEAF5";
const GREEN = "#77E28C";
const TEAL = "#58D5C9";
const BLUE = "#63A8FF";
const PURPLE = "#B588FF";
const GOLD = "#FFCC66";
const PINK = "#FF8FB9";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

type GiftTabKey = "received" | "inventory" | "history";

type GiftCardKey =
  | "phoenixBloom"
  | "crystalComet"
  | "emeraldLotus"
  | "goldenAura"
  | "violetWave"
  | "mintLight"
  | "dragonNote"
  | "moonSilk"
  | "seaBloom";

type GiftCardItem = {
  key: GiftCardKey;
  diamonds: string;
  accent: [string, string];
};

const RECEIVED_GIFTS: GiftCardItem[] = [
  {
    key: "phoenixBloom",
    diamonds: "2,400",
    accent: ["rgba(255,204,102,0.34)", "rgba(255,143,185,0.24)"],
  },
  {
    key: "crystalComet",
    diamonds: "1,200",
    accent: ["rgba(99,168,255,0.34)", "rgba(181,136,255,0.24)"],
  },
  {
    key: "emeraldLotus",
    diamonds: "680",
    accent: ["rgba(88,213,201,0.34)", "rgba(119,226,140,0.24)"],
  },
];

const INVENTORY_GIFTS: GiftCardItem[] = [
  {
    key: "goldenAura",
    diamonds: "960",
    accent: ["rgba(255,204,102,0.34)", "rgba(181,136,255,0.22)"],
  },
  {
    key: "violetWave",
    diamonds: "720",
    accent: ["rgba(181,136,255,0.34)", "rgba(99,168,255,0.22)"],
  },
  {
    key: "mintLight",
    diamonds: "440",
    accent: ["rgba(88,213,201,0.34)", "rgba(119,226,140,0.22)"],
  },
];

const HISTORY_GIFTS: GiftCardItem[] = [
  {
    key: "dragonNote",
    diamonds: "3,600",
    accent: ["rgba(255,204,102,0.34)", "rgba(255,143,185,0.24)"],
  },
  {
    key: "moonSilk",
    diamonds: "540",
    accent: ["rgba(99,168,255,0.34)", "rgba(181,136,255,0.22)"],
  },
  {
    key: "seaBloom",
    diamonds: "300",
    accent: ["rgba(88,213,201,0.34)", "rgba(119,226,140,0.22)"],
  },
];

function PremiumGlyph({
  icon,
  colors,
  borderColor,
}: {
  icon: React.ReactNode;
  colors: [string, string];
  borderColor?: string;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.premiumGlyph, borderColor ? { borderColor } : null]}
    >
      <View style={styles.premiumGlyphInner}>{icon}</View>
    </LinearGradient>
  );
}

function AIGlyph({ size = 18 }: { size?: number }) {
  return (
    <View style={styles.aiGlyphWrap}>
      <LinearGradient
        colors={["rgba(181,136,255,0.98)", "rgba(88,213,201,0.98)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiGlyphOrb}
      >
        <Sparkles size={size} color="#F7FDFF" strokeWidth={2.5} />
      </LinearGradient>
      <View style={styles.aiGlyphDot} />
    </View>
  );
}

function QuickAction({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      {icon}
      <Text style={styles.quickActionText}>{title}</Text>
    </Pressable>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

function GiftTab({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, selected && styles.tabButtonSelected]}
    >
      <Text
        style={[styles.tabButtonText, selected && styles.tabButtonTextSelected]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function GiftCard({
  item,
  active,
  onPress,
  title,
  subtitle,
  diamondsLabel,
  status,
  rarity,
}: {
  item: GiftCardItem;
  active?: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
  diamondsLabel: string;
  status: string;
  rarity: string;
}) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={["rgba(22,40,62,0.94)", "rgba(10,27,34,0.94)"]}
        style={[styles.giftCard, active && styles.giftCardActive]}
      >
        <View style={styles.giftCardTop}>
          <PremiumGlyph
            colors={item.accent}
            borderColor="rgba(255,255,255,0.10)"
            icon={<Gift size={18} color={TEXT} strokeWidth={2.4} />}
          />
          <View style={styles.giftBadge}>
            <Text style={styles.giftBadgeText}>{rarity}</Text>
          </View>
        </View>

        <Text style={styles.giftTitle}>{title}</Text>
        <Text style={styles.giftSubtitle}>{subtitle}</Text>

        <View style={styles.giftMetaRow}>
          <Text style={styles.giftDiamonds}>
            {item.diamonds} {diamondsLabel}
          </Text>
          <Text style={styles.giftStatus}>{status}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function ProfileGiftsScreen() {
  const i18n = useI18n() as I18nHookValue;
  const { account } = useProfileKernel();
  const [activeTab, setActiveTab] = useState<GiftTabKey>("received");
  const [selectedGiftKey, setSelectedGiftKey] =
    useState<GiftCardKey>("phoenixBloom");

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      if (typeof i18n === "function") {
        const value = i18n(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      if (i18n && typeof i18n.t === "function") {
        const value = i18n.t(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      return key;
    },
    [i18n],
  );

  const visibleItems = useMemo(() => {
    switch (activeTab) {
      case "inventory":
        return INVENTORY_GIFTS;
      case "history":
        return HISTORY_GIFTS;
      case "received":
      default:
        return RECEIVED_GIFTS;
    }
  }, [activeTab]);

  const selectedGift =
    visibleItems.find((item) => item.key === selectedGiftKey) ?? visibleItems[0];

  useEffect(() => {
    void syncCurrentProfilePublicSurface();
  }, []);

  const selectedGiftTitle = t(
    `profile.giftsScreen.items.${selectedGift.key}.title`,
  );
  const selectedGiftSubtitle = t(
    `profile.giftsScreen.items.${selectedGift.key}.subtitle`,
  );
  const selectedGiftStatus = t(
    `profile.giftsScreen.items.${selectedGift.key}.status`,
  );

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>

            <Text style={styles.headerTitle}>
              {t("profile.giftsScreen.header.title")}
            </Text>

            <Pressable
              onPress={() => router.push("/profile/public")}
              style={styles.headerAction}
            >
              <Text style={styles.headerActionText}>
                {t("profile.giftsScreen.header.openAction")}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>
                {t("profile.giftsScreen.intro.eyebrow")}
              </Text>
              <Text style={styles.title}>
                {t("profile.giftsScreen.intro.title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("profile.giftsScreen.intro.subtitle")}
              </Text>
            </View>

            <LinearGradient
              colors={[
                "rgba(24,46,70,0.98)",
                "rgba(17,28,56,0.96)",
                "rgba(10,23,34,0.94)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroAccentOne} />
              <View style={styles.heroAccentTwo} />

              <View style={styles.heroTop}>
                <PremiumGlyph
                  colors={["rgba(255,204,102,0.36)", "rgba(181,136,255,0.24)"]}
                  borderColor="rgba(255,204,102,0.20)"
                  icon={<Gift size={18} color={GOLD} strokeWidth={2.4} />}
                />

                <View style={styles.heroPills}>
                  <View style={styles.heroBadge}>
                    <Star size={13} color={GOLD} strokeWidth={2.4} />
                    <Text style={styles.heroBadgeText}>
                      {t("profile.giftsScreen.hero.badges.identity")}
                    </Text>
                  </View>

                  <View style={styles.heroBadgeSecondary}>
                    <BadgeCheck size={13} color={GREEN} strokeWidth={2.4} />
                    <Text style={styles.heroBadgeText}>
                      {t("profile.giftsScreen.hero.badges.unifiedIdBound")}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.heroTitle}>{selectedGiftTitle}</Text>
              <Text style={styles.heroSubtitle}>{selectedGiftSubtitle}</Text>

              <View style={styles.heroStatsRow}>
                <MiniStat
                  label={t("profile.giftsScreen.hero.stats.diamonds")}
                  value={`${selectedGift.diamonds} ${t("profile.giftsScreen.common.diamonds")}`}
                />
                <MiniStat
                  label={t("profile.giftsScreen.hero.stats.status")}
                  value={selectedGiftStatus}
                />
                <MiniStat
                  label={t("profile.giftsScreen.hero.stats.owner")}
                  value={account.sabiDisplayId || account.userId || "SABI"}
                />
              </View>

              <View style={styles.heroActionsRow}>
                <QuickAction
                  title={t("profile.giftsScreen.hero.actions.public")}
                  icon={<User size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/public")}
                />
                <QuickAction
                  title={t("profile.giftsScreen.hero.actions.premium")}
                  icon={<Crown size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/premium")}
                />
                <QuickAction
                  title={t("profile.giftsScreen.hero.actions.credits")}
                  icon={<CreditCard size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/credits")}
                />
                <QuickAction
                  title={t("profile.giftsScreen.hero.actions.theme")}
                  icon={<Palette size={13} color={SOFT} strokeWidth={2.4} />}
                  onPress={() => router.push("/profile/colors")}
                />
              </View>
            </LinearGradient>

            <LinearGradient
              colors={[
                "rgba(85,208,193,0.22)",
                "rgba(101,168,255,0.20)",
                "rgba(181,136,255,0.16)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.noticeCard}
            >
              <View style={styles.noticeTop}>
                <PremiumGlyph
                  colors={["rgba(119,226,140,0.30)", "rgba(88,213,201,0.22)"]}
                  borderColor="rgba(119,226,140,0.18)"
                  icon={<ShieldCheck size={16} color={TEXT} strokeWidth={2.4} />}
                />
                <Text style={styles.noticeTitle}>
                  {t("profile.giftsScreen.notice.title")}
                </Text>
              </View>

              <Text style={styles.noticeText}>
                {t("profile.giftsScreen.notice.description")}
              </Text>
            </LinearGradient>

            <View style={styles.tabsRow}>
              <GiftTab
                title={t("profile.giftsScreen.tabs.received")}
                selected={activeTab === "received"}
                onPress={() => {
                  setActiveTab("received");
                  setSelectedGiftKey(RECEIVED_GIFTS[0].key);
                }}
              />
              <GiftTab
                title={t("profile.giftsScreen.tabs.inventory")}
                selected={activeTab === "inventory"}
                onPress={() => {
                  setActiveTab("inventory");
                  setSelectedGiftKey(INVENTORY_GIFTS[0].key);
                }}
              />
              <GiftTab
                title={t("profile.giftsScreen.tabs.history")}
                selected={activeTab === "history"}
                onPress={() => {
                  setActiveTab("history");
                  setSelectedGiftKey(HISTORY_GIFTS[0].key);
                }}
              />
            </View>

            <View style={styles.cardGrid}>
              {visibleItems.map((item) => (
                <GiftCard
                  key={item.key}
                  item={item}
                  active={selectedGift.key === item.key}
                  onPress={() => setSelectedGiftKey(item.key)}
                  title={t(`profile.giftsScreen.items.${item.key}.title`)}
                  subtitle={t(`profile.giftsScreen.items.${item.key}.subtitle`)}
                  diamondsLabel={t("profile.giftsScreen.common.diamonds")}
                  status={t(`profile.giftsScreen.items.${item.key}.status`)}
                  rarity={t(`profile.giftsScreen.items.${item.key}.rarity`)}
                />
              ))}
            </View>

            <LinearGradient
              colors={["rgba(16,31,48,0.90)", "rgba(11,25,40,0.94)"]}
              style={styles.footerCard}
            >
              <View style={styles.footerTop}>
                <PremiumGlyph
                  colors={["rgba(181,136,255,0.34)", "rgba(88,213,201,0.24)"]}
                  borderColor="rgba(181,136,255,0.18)"
                  icon={<AIGlyph size={16} />}
                />
                <View style={styles.footerTextWrap}>
                  <Text style={styles.footerTitle}>
                    {t("profile.giftsScreen.footer.title")}
                  </Text>
                  <Text style={styles.footerSubtitle}>
                    {t("profile.giftsScreen.footer.description")}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/profile/public")}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {t("profile.giftsScreen.footer.action")}
                </Text>
              </Pressable>
            </LinearGradient>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },

  backgroundOrbTop: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(108, 255, 180, 0.10)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    bottom: -60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(99, 168, 255, 0.08)",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  headerRow: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121, 228, 162, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  headerAction: {
    minWidth: 62,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121, 228, 162, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  headerActionText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
  },

  scrollContent: {
    paddingTop: 14,
    paddingBottom: 36,
    gap: 14,
  },

  introBlock: {
    paddingTop: 6,
    paddingBottom: 2,
    paddingHorizontal: 2,
  },

  eyebrow: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  title: {
    color: TEXT,
    fontSize: 30,
    fontWeight: "900",
  },

  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontWeight: "600",
    maxWidth: 420,
  },

  heroCard: {
    borderRadius: 30,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  heroAccentOne: {
    position: "absolute",
    right: -30,
    top: -20,
    width: 170,
    height: 170,
    borderRadius: 170,
    backgroundColor: "rgba(255,204,102,0.12)",
  },

  heroAccentTwo: {
    position: "absolute",
    left: -20,
    bottom: -28,
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: "rgba(181,136,255,0.10)",
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  heroPills: {
    alignItems: "flex-end",
    gap: 8,
  },

  heroBadge: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  heroBadgeSecondary: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(119,226,140,0.12)",
    borderWidth: 1,
    borderColor: "rgba(119,226,140,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  heroBadgeText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "800",
  },

  heroTitle: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 14,
  },

  heroSubtitle: {
    color: SOFT,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
  },

  heroStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },

  heroActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },

  quickAction: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  quickActionText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
  },

  miniStat: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 12,
  },

  miniStatLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  miniStatValue: {
    marginTop: 6,
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },

  noticeCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  noticeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  noticeTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  noticeText: {
    marginTop: 10,
    color: SOFT,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },

  tabsRow: {
    flexDirection: "row",
    gap: 8,
  },

  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  tabButtonSelected: {
    backgroundColor: "rgba(181,136,255,0.16)",
    borderColor: "rgba(181,136,255,0.22)",
  },

  tabButtonText: {
    color: SOFT,
    fontSize: 12,
    fontWeight: "800",
  },

  tabButtonTextSelected: {
    color: TEXT,
  },

  cardGrid: {
    gap: 10,
  },

  giftCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
  },

  giftCardActive: {
    borderColor: "rgba(126,240,208,0.28)",
    shadowColor: "rgba(126,240,208,0.88)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },

  giftCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  giftBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  giftBadgeText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
  },

  giftTitle: {
    marginTop: 12,
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  giftSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  giftMetaRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  giftDiamonds: {
    color: SOFT,
    fontSize: 12,
    fontWeight: "800",
  },

  giftStatus: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  footerCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  footerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  footerTextWrap: {
    flex: 1,
  },

  footerTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  footerSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  primaryButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  primaryButtonText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "900",
  },

  premiumGlyph: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  premiumGlyphInner: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(8,16,24,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },

  aiGlyphWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  aiGlyphOrb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  aiGlyphDot: {
    position: "absolute",
    right: -1,
    top: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PINK,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
});