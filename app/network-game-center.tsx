import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Coins, Gamepad2, RadioTower, ShieldCheck, Trophy, Users } from "lucide-react-native";

import { useI18n } from "../src/shared/i18n";
import {
  fetchSabiNetworkGameCenterFoundationStatus,
  SABI_NETWORK_GAME_CENTER_MOBILE_FOUNDATION,
  type SabiNetworkGameCenterFoundationStatus,
} from "../src/modules/network-game-center/foundation/networkGameCenterFoundation";

type I18nLike = { t?: (key: string) => string };

function useText() {
  const i18n = useI18n() as I18nLike;
  return (key: string, fallback: string) => {
    const value = i18n.t?.(key);
    return value && value !== key ? value : fallback;
  };
}

function normalizeStatus(value: string) {
  return value.replace(/_/g, " ");
}

export default function NetworkGameCenterScreen() {
  const insets = useSafeAreaInsets();
  const t = useText();
  const [status, setStatus] = useState<SabiNetworkGameCenterFoundationStatus>(SABI_NETWORK_GAME_CENTER_MOBILE_FOUNDATION);

  useEffect(() => {
    let active = true;
    void fetchSabiNetworkGameCenterFoundationStatus().then((nextStatus) => {
      if (active) setStatus(nextStatus);
    });
    return () => {
      active = false;
    };
  }, []);

  const openBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/" as never);
  };

  const cards = [
    { Icon: Users, title: t("gameCenter.foundation.lobby.title", "Network lobby"), value: t("gameCenter.foundation.lobby.value", "Lobby foundation is ready. Real matchmaking needs provider binding.") },
    { Icon: RadioTower, title: t("gameCenter.foundation.realtime.title", "Realtime provider"), value: t("gameCenter.foundation.realtime.value", "No fake online opponents. Provider-required state is shown until integration.") },
    { Icon: Trophy, title: t("gameCenter.foundation.leaderboard.title", "Leaderboards"), value: t("gameCenter.foundation.leaderboard.value", "Ranking storage is planned without fake scores.") },
    { Icon: Coins, title: t("gameCenter.foundation.rewards.title", "Rewards"), value: t("gameCenter.foundation.rewards.value", "Rewards need Coin Wallet routing and admin/compliance hooks.") },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#061A2D", "#1D4ED8", "#7DD3FC"]} style={styles.screen}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}> 
          <Pressable onPress={openBack} style={styles.circle}><ArrowLeft size={20} color="#FFFFFF" /></Pressable>
          <View style={styles.headerText}><Text style={styles.kicker}>Sabi Space</Text><Text style={styles.title}>Network Game Center</Text></View>
          <View style={styles.circle}><Gamepad2 size={20} color="#FFFFFF" /></View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{t("gameCenter.foundation.hero.title", "Game foundation")}</Text>
            <Text style={styles.heroText}>{t("gameCenter.foundation.hero.text", "Network games, rewards, leaderboards and Messenger/Stream links with no fake wins or fake players.")}</Text>
            <Text style={styles.status}>{normalizeStatus(status.runtimeStatus)}</Text>
          </View>

          <View style={styles.grid}>
            {cards.map(({ Icon, title, value }) => (
              <View key={title} style={styles.card}>
                <Icon size={20} color="#FFFFFF" />
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardText}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.policy}>
            <View style={styles.policyHeader}><ShieldCheck size={18} color="#BFDBFE" /><Text style={styles.policyTitle}>{t("gameCenter.foundation.policy.title", "Reward policy")}</Text></View>
            {status.rewardPolicy.notes.map((note) => <Text key={note} style={styles.note}>• {note}</Text>)}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.primary} onPress={() => router.push("/games" as never)}>
              <Gamepad2 size={18} color="#061A2D" /><Text style={styles.primaryText}>{t("gameCenter.foundation.games", "Open games")}</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={() => router.push("/mini-apps" as never)}>
              <Text style={styles.secondaryText}>{t("gameCenter.foundation.miniApps", "Mini Apps")}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#061A2D" },
  screen: { flex: 1 },
  glowTop: { position: "absolute", top: -90, right: -70, width: 210, height: 210, borderRadius: 105, backgroundColor: "rgba(255,255,255,0.18)" },
  glowBottom: { position: "absolute", bottom: -100, left: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(59,130,246,0.22)" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingBottom: 12 },
  circle: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.20)" },
  headerText: { flex: 1, alignItems: "center" },
  kicker: { color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: "800" },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  content: { paddingHorizontal: 18, paddingBottom: 34 },
  hero: { borderRadius: 28, padding: 22, backgroundColor: "rgba(15,23,42,0.56)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "900" },
  heroText: { color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 20, marginTop: 8 },
  status: { color: "#BFDBFE", fontSize: 12, fontWeight: "900", textTransform: "uppercase", marginTop: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 },
  card: { width: "48%", minHeight: 136, borderRadius: 24, padding: 16, backgroundColor: "rgba(15,23,42,0.50)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  cardTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginTop: 10 },
  cardText: { color: "rgba(255,255,255,0.72)", fontSize: 12, lineHeight: 17, marginTop: 6 },
  policy: { marginTop: 16, borderRadius: 24, padding: 16, backgroundColor: "rgba(30,64,175,0.36)", borderWidth: 1, borderColor: "rgba(191,219,254,0.22)" },
  policyHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  policyTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  note: { color: "rgba(255,255,255,0.78)", fontSize: 12, lineHeight: 18, marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 18 },
  primary: { flex: 1, height: 50, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "#BFDBFE" },
  primaryText: { color: "#061A2D", fontSize: 13, fontWeight: "900" },
  secondary: { flex: 1, height: 50, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  secondaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
});
