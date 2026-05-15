import React from "react";
import {
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

const FEATURES = [
  {
    id: "wheel",
    title: "Wheel of Fortune",
    subtitle: "10 COIN entry · premium gift rewards",
    icon: "sync-outline" as const,
    status: "Ready",
    route: "/game-wheel",
  },
  {
    id: "fishing",
    title: "Fishing",
    subtitle: "Mini game rewards for Messenger and Stream",
    icon: "fish-outline" as const,
    status: "Ready",
    route: "/game-fishing",
  },
  {
    id: "battle",
    title: "Battle Arena",
    subtitle: "Батлы, viewer support, ranking gifts",
    icon: "trophy-outline" as const,
    status: "Soon",
    route: null,
  },
  {
    id: "live",
    title: "Stream Games",
    subtitle: "Support creators, groups, family battles",
    icon: "game-controller-outline" as const,
    status: "Planned",
    route: null,
  },
];

const ECONOMY_POINTS = [
  "Games page is only the entry layer for now.",
  "Later it will connect to Messenger gifts, Coin and Stream.",
  "Wheel, Fishing and battle gifts stay separate from regular stickers.",
  "Gift rewards from games go to storage / inventory, not direct income.",
];

export default function GamesPage() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <LinearGradient
        colors={["#041411", "#071B18", "#0A131B"]}
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
            <Text style={styles.eyebrow}>GAME CENTER</Text>
            <Text style={styles.title}>Sabi Games</Text>
            <Text style={styles.subtitle}>
              Создаём страницу сейчас. Потом уже спокойно улучшаем при создании самих игр.
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <LinearGradient
            colors={["rgba(15,29,41,0.96)", "rgba(10,21,29,0.92)"]}
            style={styles.heroCard}
          >
            <View style={styles.heroRow}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTitle}>Games entry is ready</Text>
                <Text style={styles.heroSubtitle}>
                  Здесь потом подключим Wheel, Fishing, Battle Arena, Stream mini-games и ranking rewards.
                </Text>
              </View>

              <View style={styles.heroBadge}>
                <Ionicons name="sparkles-outline" size={16} color="#FFE28A" />
                <Text style={styles.heroBadgeText}>Stage 1</Text>
              </View>
            </View>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaPill}>
                <Ionicons name="gift-outline" size={13} color="#7BE7C4" />
                <Text style={styles.heroMetaText}>Messenger ready</Text>
              </View>

              <View style={styles.heroMetaPill}>
                <Ionicons name="diamond-outline" size={13} color="#FFD76A" />
                <Text style={styles.heroMetaText}>Coin / Gifts later</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Planned modules</Text>
            <Text style={styles.sectionHint}>Без хаоса. Сначала входная страница, потом игры по очереди.</Text>
          </View>

          <View style={styles.grid}>
            {FEATURES.map((item) => {
              const Card = (
                <LinearGradient
                  colors={["rgba(13,24,23,0.98)", "rgba(8,15,18,0.94)"]}
                  style={[
                    styles.featureCard,
                    item.route ? styles.featureCardReady : undefined,
                  ]}
                >
                  <View style={styles.featureTopRow}>
                    <View style={styles.featureIconWrap}>
                      <Ionicons name={item.icon} size={20} color="#7BE7C4" />
                    </View>

                    <View style={styles.featureStatusPill}>
                      <Text style={styles.featureStatusText}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureSubtitle}>{item.subtitle}</Text>

                  {item.route ? (
                    <View style={styles.featureFooter}>
                      <Text style={styles.featureFooterText}>Open module</Text>
                      <Ionicons name="arrow-forward" size={15} color="#7BE7C4" />
                    </View>
                  ) : null}
                </LinearGradient>
              );

              if (!item.route) return <View key={item.id} style={styles.featureWrap}>{Card}</View>;

              return (
                <Pressable
                  key={item.id}
                  style={styles.featureWrap}
                  onPress={() => router.push(item.route as never)}
                >
                  {Card}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Economy notes</Text>
            <Text style={styles.sectionHint}>Фиксируем сразу, чтобы потом не переделывать.</Text>
          </View>

          <LinearGradient
            colors={["rgba(15,29,41,0.96)", "rgba(11,18,26,0.94)"]}
            style={styles.notesCard}
          >
            {ECONOMY_POINTS.map((point, index) => (
              <View key={point} style={[styles.noteRow, index > 0 && styles.noteRowBorder]}>
                <View style={styles.noteDot} />
                <Text style={styles.noteText}>{point}</Text>
              </View>
            ))}
          </LinearGradient>

          <View style={styles.bottomActions}>
            <Pressable
              onPress={() => router.back()}
              style={styles.secondaryActionWrap}
            >
              <LinearGradient
                colors={["rgba(87,121,111,0.92)", "rgba(31,52,47,0.88)"]}
                style={styles.secondaryAction}
              >
                <Ionicons name="arrow-back-outline" size={16} color="#F4FFFB" />
                <Text style={styles.secondaryActionText}>Back</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.primaryAction} onPress={() => router.push("/game-wheel" as never)}>
              <Ionicons name="sync-outline" size={16} color="#041411" />
              <Text style={styles.primaryActionText}>Open Wheel</Text>
            </Pressable>
          </View>
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
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: "rgba(232,255,246,0.72)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  heroBadge: {
    minWidth: 82,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  heroBadgeText: {
    color: "#FFF4CC",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureWrap: {
    width: "48.4%",
    marginBottom: 10,
  },
  featureCard: {
    width: "100%",
    minHeight: 142,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(123,231,196,0.10)",
  },
  featureCardReady: {
    borderColor: "rgba(123,231,196,0.22)",
  },
  featureTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(123,231,196,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureStatusPill: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureStatusText: {
    color: "#EAF7F1",
    fontSize: 10,
    fontWeight: "800",
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 14,
  },
  featureSubtitle: {
    color: "rgba(232,255,246,0.68)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  featureFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  featureFooterText: {
    color: "#7BE7C4",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 6,
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
  bottomActions: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryActionWrap: {
    flex: 1,
    height: 48,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 8,
  },
  secondaryAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  secondaryActionText: {
    color: "#F4FFFB",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
  primaryAction: {
    flex: 1.3,
    height: 48,
    borderRadius: 18,
    backgroundColor: "#7BE7C4",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryActionText: {
    color: "#041411",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 6,
  },
});
