import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type RewardTier = "basic" | "medium" | "premium";

type WheelReward = {
  id: string;
  title: string;
  subtitle: string;
  tier: RewardTier;
  chanceLabel: string;
  rewardText: string;
  emoji: string;
};

const REWARDS: WheelReward[] = [
  {
    id: "r1",
    title: "Basic gift",
    subtitle: "Common reward",
    tier: "basic",
    chanceLabel: "x3",
    rewardText: "1 basic storage gift",
    emoji: "🎁",
  },
  {
    id: "r2",
    title: "Basic gift",
    subtitle: "Common reward",
    tier: "basic",
    chanceLabel: "x2",
    rewardText: "1 basic storage gift",
    emoji: "🌹",
  },
  {
    id: "r3",
    title: "Basic gift",
    subtitle: "Common reward",
    tier: "basic",
    chanceLabel: "x2",
    rewardText: "1 basic storage gift",
    emoji: "💝",
  },
  {
    id: "r4",
    title: "Medium gift",
    subtitle: "Better reward",
    tier: "medium",
    chanceLabel: "x1",
    rewardText: "1 medium gift",
    emoji: "🏆",
  },
  {
    id: "r5",
    title: "20 COIN gift",
    subtitle: "High value reward",
    tier: "premium",
    chanceLabel: "x1",
    rewardText: "20 COIN-equivalent premium gift",
    emoji: "💎",
  },
  {
    id: "r6",
    title: "Premium gift",
    subtitle: "Top wheel reward",
    tier: "premium",
    chanceLabel: "x1",
    rewardText: "1 premium 3D gift",
    emoji: "👑",
  },
];

function tierColors(tier: RewardTier): [string, string] {
  switch (tier) {
    case "basic":
      return ["rgba(69,110,99,0.94)", "rgba(22,40,35,0.90)"];
    case "medium":
      return ["rgba(59,101,161,0.94)", "rgba(18,35,59,0.90)"];
    case "premium":
      return ["rgba(162,121,47,0.96)", "rgba(73,46,8,0.92)"];
    default:
      return ["rgba(69,110,99,0.94)", "rgba(22,40,35,0.90)"];
  }
}

export default function GameWheelPage() {
  const [spinCount, setSpinCount] = useState(0);
  const [lastReward, setLastReward] = useState<WheelReward | null>(null);

  const stats = useMemo(
    () => ({
      cost: "10 COIN",
      rewards: REWARDS.length,
      storageRule: "Rewards go to gift storage",
    }),
    [],
  );

  const spinWheel = () => {
    const reward = REWARDS[spinCount % REWARDS.length];
    setSpinCount((value) => value + 1);
    setLastReward(reward);

    Alert.alert(
      "Wheel result",
      `${reward.title}\n${reward.rewardText}\n\nReward goes to storage, not direct income.`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <LinearGradient
        colors={["#041411", "#081815", "#0A131B"]}
        start={{ x: 0.08, y: 0.02 }}
        end={{ x: 0.92, y: 1 }}
        style={styles.background}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <LinearGradient
              colors={["rgba(120,208,187,0.95)", "rgba(44,88,77,0.88)"]}
              style={styles.backButtonFill}
            >
              <Ionicons name="arrow-back" size={20} color="#F5FFFB" />
            </LinearGradient>
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrow}>WHEEL OF FORTUNE</Text>
            <Text style={styles.title}>Game Wheel</Text>
            <Text style={styles.subtitle}>
              Первый живой игровой экран. Потом усилим анимации, баланс и real reward flow.
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <LinearGradient
            colors={["rgba(15,29,41,0.96)", "rgba(10,21,29,0.92)"]}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroLabel}>Entry cost</Text>
                <Text style={styles.heroValue}>{stats.cost}</Text>
              </View>

              <View style={styles.heroBadge}>
                <Ionicons name="gift-outline" size={15} color="#FFE28A" />
                <Text style={styles.heroBadgeText}>{stats.rewards} reward slots</Text>
              </View>
            </View>

            <Text style={styles.heroDescription}>
              Approved rule: 10 COIN per spin. Rewards go to gift storage and later can be used in Messenger / Stream flows.
            </Text>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaPill}>
                <Ionicons name="briefcase-outline" size={12} color="#7BE7C4" />
                <Text style={styles.heroMetaText}>{stats.storageRule}</Text>
              </View>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["rgba(12,20,24,0.98)", "rgba(8,14,18,0.94)"]}
            style={styles.wheelCard}
          >
            <View style={styles.wheelOuter}>
              <View style={styles.wheelRing} />
              <View style={styles.wheelInner}>
                <Text style={styles.wheelEmoji}>{lastReward?.emoji ?? "🎯"}</Text>
                <Text style={styles.wheelCenterTitle}>{lastReward?.title ?? "Spin"}</Text>
                <Text style={styles.wheelCenterSubtitle}>
                  {lastReward?.rewardText ?? "Tap the button below"}
                </Text>
              </View>
            </View>

            <Pressable style={styles.spinButtonWrap} onPress={spinWheel}>
              <LinearGradient
                colors={["#7BE7C4", "#4BC2A0"]}
                style={styles.spinButton}
              >
                <Ionicons name="sync-outline" size={18} color="#03110E" />
                <Text style={styles.spinButtonText}>Spin for 10 COIN</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reward structure</Text>
            <Text style={styles.sectionHint}>Как мы заранее зафиксировали для колеса.</Text>
          </View>

          {REWARDS.map((reward) => (
            <LinearGradient
              key={reward.id}
              colors={tierColors(reward.tier)}
              style={styles.rewardCard}
            >
              <View style={styles.rewardEmojiWrap}>
                <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
              </View>

              <View style={styles.rewardTextWrap}>
                <View style={styles.rewardTopRow}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <View style={styles.rewardChancePill}>
                    <Text style={styles.rewardChanceText}>{reward.chanceLabel}</Text>
                  </View>
                </View>
                <Text style={styles.rewardSubtitle}>{reward.subtitle}</Text>
                <Text style={styles.rewardBody}>{reward.rewardText}</Text>
              </View>
            </LinearGradient>
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Economy rules</Text>
            <Text style={styles.sectionHint}>Чтобы потом не было хаоса.</Text>
          </View>

          <LinearGradient
            colors={["rgba(15,29,41,0.96)", "rgba(11,18,26,0.94)"]}
            style={styles.notesCard}
          >
            {[
              "10 COIN per spin.",
              "Rewards are gifts, not direct financial income.",
              "Won gifts go to storage and can expire by policy.",
              "Later Wheel should be linked from Messenger and Stream.",
            ].map((point, index) => (
              <View key={point} style={[styles.noteRow, index > 0 && styles.noteRowBorder]}>
                <View style={styles.noteDot} />
                <Text style={styles.noteText}>{point}</Text>
              </View>
            ))}
          </LinearGradient>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#041411",
  },
  background: {
    flex: 1,
  },
  glowTop: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(77,202,170,0.18)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -120,
    left: -50,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(42,104,189,0.16)",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
  },
  backButtonFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  eyebrow: {
    color: "#8EE7CA",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    color: "#F7FFFC",
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(232,255,246,0.72)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 320,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
  },
  heroCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,231,196,0.12)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLabel: {
    color: "rgba(232,255,246,0.66)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  heroBadge: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
  },
  heroBadgeText: {
    color: "#FFF4CC",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
  },
  heroDescription: {
    color: "rgba(232,255,246,0.72)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  heroMetaPill: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
  },
  heroMetaText: {
    color: "#F6FFFB",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
  },
  wheelCard: {
    marginTop: 16,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,231,196,0.10)",
    alignItems: "center",
  },
  wheelOuter: {
    width: 238,
    height: 238,
    borderRadius: 119,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  wheelRing: {
    position: "absolute",
    width: 238,
    height: 238,
    borderRadius: 119,
    borderWidth: 16,
    borderColor: "rgba(123,231,196,0.24)",
  },
  wheelInner: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  wheelEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  wheelCenterTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  wheelCenterSubtitle: {
    color: "rgba(232,255,246,0.68)",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    textAlign: "center",
  },
  spinButtonWrap: {
    marginTop: 16,
    width: "100%",
  },
  spinButton: {
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  spinButtonText: {
    color: "#03110E",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  sectionHint: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  rewardCard: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rewardEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginRight: 10,
  },
  rewardEmoji: {
    fontSize: 26,
  },
  rewardTextWrap: {
    flex: 1,
  },
  rewardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rewardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  rewardChancePill: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardChanceText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  rewardSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  rewardBody: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  notesCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(123,231,196,0.10)",
    overflow: "hidden",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  noteDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: "#7BE7C4",
    marginTop: 6,
    marginRight: 10,
  },
  noteText: {
    flex: 1,
    color: "#F5FFFB",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
});
