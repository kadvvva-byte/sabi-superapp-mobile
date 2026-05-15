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

type CatchTier = "common" | "rare" | "premium";

type CatchReward = {
  id: string;
  title: string;
  subtitle: string;
  tier: CatchTier;
  reward: string;
  emoji: string;
};

const CATCHES: CatchReward[] = [
  {
    id: "c1",
    title: "Small catch",
    subtitle: "Common reward",
    tier: "common",
    reward: "Basic storage gift",
    emoji: "🐟",
  },
  {
    id: "c2",
    title: "Lucky catch",
    subtitle: "Better reward",
    tier: "rare",
    reward: "Medium gift or bonus inventory",
    emoji: "🎣",
  },
  {
    id: "c3",
    title: "Golden catch",
    subtitle: "Premium reward",
    tier: "premium",
    reward: "Premium gift for storage",
    emoji: "✨",
  },
];

function tierColors(tier: CatchTier): [string, string] {
  switch (tier) {
    case "common":
      return ["rgba(69,110,99,0.94)", "rgba(22,40,35,0.90)"];
    case "rare":
      return ["rgba(59,101,161,0.94)", "rgba(18,35,59,0.90)"];
    case "premium":
      return ["rgba(162,121,47,0.96)", "rgba(73,46,8,0.92)"];
    default:
      return ["rgba(69,110,99,0.94)", "rgba(22,40,35,0.90)"];
  }
}

export default function GameFishingPage() {
  const [castCount, setCastCount] = useState(0);
  const [lastCatch, setLastCatch] = useState<CatchReward | null>(null);

  const stats = useMemo(
    () => ({
      entry: "5 COIN",
      rewardRule: "Catch goes to gift storage",
      casts: castCount,
    }),
    [castCount],
  );

  const castLine = () => {
    const reward = CATCHES[castCount % CATCHES.length];
    setCastCount((value) => value + 1);
    setLastCatch(reward);

    Alert.alert(
      "Fishing result",
      `${reward.title}\n${reward.reward}\n\nReward goes to storage, not direct income.`,
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
            <Text style={styles.eyebrow}>FISHING</Text>
            <Text style={styles.title}>Game Fishing</Text>
            <Text style={styles.subtitle}>
              Второй живой игровой экран. Потом расширим логику, шанс, редкость и stream hooks.
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
                <Text style={styles.heroValue}>{stats.entry}</Text>
              </View>

              <View style={styles.heroBadge}>
                <Ionicons name="fish-outline" size={15} color="#FFE28A" />
                <Text style={styles.heroBadgeText}>{stats.casts} casts</Text>
              </View>
            </View>

            <Text style={styles.heroDescription}>
              Fishing is a light mini-game for Messenger / Stream reward loops. Catches go to storage and later can be used as gifts.
            </Text>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaPill}>
                <Ionicons name="briefcase-outline" size={12} color="#7BE7C4" />
                <Text style={styles.heroMetaText}>{stats.rewardRule}</Text>
              </View>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["rgba(12,20,24,0.98)", "rgba(8,14,18,0.94)"]}
            style={styles.pondCard}
          >
            <View style={styles.pondCircle}>
              <Text style={styles.pondEmoji}>{lastCatch?.emoji ?? "🌊"}</Text>
              <Text style={styles.pondTitle}>{lastCatch?.title ?? "Cast line"}</Text>
              <Text style={styles.pondSubtitle}>
                {lastCatch?.reward ?? "Tap the button below"}
              </Text>
            </View>

            <Pressable style={styles.castButtonWrap} onPress={castLine}>
              <LinearGradient
                colors={["#7BE7C4", "#4BC2A0"]}
                style={styles.castButton}
              >
                <Ionicons name="fish-outline" size={18} color="#03110E" />
                <Text style={styles.castButtonText}>Cast for 5 COIN</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Catch structure</Text>
            <Text style={styles.sectionHint}>Базовая схема rewards для Fishing.</Text>
          </View>

          {CATCHES.map((item) => (
            <LinearGradient
              key={item.id}
              colors={tierColors(item.tier)}
              style={styles.rewardCard}
            >
              <View style={styles.rewardEmojiWrap}>
                <Text style={styles.rewardEmoji}>{item.emoji}</Text>
              </View>

              <View style={styles.rewardTextWrap}>
                <Text style={styles.rewardTitle}>{item.title}</Text>
                <Text style={styles.rewardSubtitle}>{item.subtitle}</Text>
                <Text style={styles.rewardBody}>{item.reward}</Text>
              </View>
            </LinearGradient>
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Economy rules</Text>
            <Text style={styles.sectionHint}>Фиксируем сразу, чтобы потом не переделывать.</Text>
          </View>

          <LinearGradient
            colors={["rgba(15,29,41,0.96)", "rgba(11,18,26,0.94)"]}
            style={styles.notesCard}
          >
            {[
              "5 COIN per cast.",
              "Catch goes to gift storage, not direct income.",
              "Later Fishing should connect to Messenger and Stream entry points.",
              "Rare and premium catches can become seasonal or event rewards.",
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
  pondCard: {
    marginTop: 16,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,231,196,0.10)",
    alignItems: "center",
  },
  pondCircle: {
    width: 238,
    height: 238,
    borderRadius: 119,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(66,145,173,0.16)",
    borderWidth: 16,
    borderColor: "rgba(123,231,196,0.18)",
    paddingHorizontal: 18,
  },
  pondEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  pondTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  pondSubtitle: {
    color: "rgba(232,255,246,0.68)",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    textAlign: "center",
  },
  castButtonWrap: {
    marginTop: 16,
    width: "100%",
  },
  castButton: {
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  castButtonText: {
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
  rewardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
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
