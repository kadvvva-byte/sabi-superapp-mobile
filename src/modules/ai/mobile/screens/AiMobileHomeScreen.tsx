import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bot,
  Brain,
  Crown,
  History,
  Languages,
  MessageCircle,
  Mic,
  RefreshCw,
  Settings,
  ShieldCheck,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "../../../../shared/i18n";
import { aiMobileText } from "../aiMobileI18n";
import { AI_MOBILE_COLORS, AI_MOBILE_GRADIENT } from "../aiMobileTheme";
import { useAiMobileSnapshot } from "../useAiMobileSnapshot";

type HomeAction = {
  key: string;
  title: string;
  icon: React.ReactNode;
  route: string;
  locked?: boolean;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readStatus(value: unknown): "ready" | "limited" | "not_connected" | "error" {
  return value === "ready" ||
    value === "limited" ||
    value === "not_connected" ||
    value === "error"
    ? value
    : "limited";
}

function isPremiumEnabled(snapshot: unknown): boolean {
  const root = toRecord(snapshot);
  const premium = toRecord(root?.premium);
  return readBoolean(premium?.enabled);
}

function isVoiceReady(snapshot: unknown): boolean {
  const root = toRecord(snapshot);
  const voice = toRecord(root?.voice);
  const manifest = toRecord(voice?.manifest);
  const status = toRecord(voice?.status);

  return readBoolean(manifest?.configured) && readBoolean(status?.enabled);
}

function StatusPill({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "ready" | "premium";
}) {
  return (
    <View
      style={[
        styles.statusPill,
        tone === "ready" && styles.statusPillReady,
        tone === "premium" && styles.statusPillPremium,
      ]}
    >
      <Text style={styles.statusPillText}>{label}</Text>
    </View>
  );
}

function ActionCard({ action }: { action: HomeAction }) {
  return (
    <Pressable
      disabled={action.locked}
      onPress={() => router.push(action.route as never)}
      style={[styles.actionCard, action.locked && styles.actionCardLocked]}
    >
      <View style={styles.actionIcon}>{action.icon}</View>
      <Text style={styles.actionTitle} numberOfLines={1}>
        {action.title}
      </Text>
    </Pressable>
  );
}

export default function AiMobileHomeScreen() {
  const { language } = useI18n();
  const insets = useSafeAreaInsets();
  const { snapshot, isLoading, refresh } = useAiMobileSnapshot();

  const status = readStatus(toRecord(snapshot)?.status);
  const premiumEnabled = isPremiumEnabled(snapshot);
  const voiceReady = isVoiceReady(snapshot);

  const actions = useMemo<HomeAction[]>(
    () => [
      {
        key: "chat",
        title: aiMobileText(language, "action.chat.title"),
        route: "/ai/chat",
        icon: <MessageCircle size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
      },
      {
        key: "voice",
        title: aiMobileText(language, "action.voice.title"),
        route: "/ai/voice",
        locked: false,
        icon: <Mic size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
      },
      {
        key: "translation",
        title: aiMobileText(language, "action.translation.title"),
        route: "/ai/translation",
        icon: <Languages size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
      },
      {
        key: "history",
        title: aiMobileText(language, "action.history.title"),
        route: "/ai/history",
        icon: <History size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
      },
      {
        key: "memory",
        title: aiMobileText(language, "action.memory.title"),
        route: "/ai/memory",
        icon: <Brain size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
      },
      {
        key: "premium",
        title: aiMobileText(language, "action.premium.title"),
        route: "/ai/premium",
        icon: <Crown size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
      },
      {
        key: "settings",
        title: aiMobileText(language, "action.settings.title"),
        route: "/ai/settings",
        icon: <Settings size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
      },
    ],
    [language],
  );

  return (
    <LinearGradient colors={AI_MOBILE_GRADIENT} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.orbTop} />
        <View style={styles.orbBottom} />

        <View style={styles.header}>
          <View style={styles.aiMark}>
            <Bot size={25} color={AI_MOBILE_COLORS.cyan} strokeWidth={2.5} />
          </View>

          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>{aiMobileText(language, "home.title")}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {aiMobileText(language, `status.${status}`)}
            </Text>
          </View>

          <Pressable onPress={refresh} style={styles.headerButton}>
            {isLoading ? (
              <ActivityIndicator size="small" color={AI_MOBILE_COLORS.text} />
            ) : (
              <RefreshCw size={20} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
            )}
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 22, 36) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statusRow}>
            <StatusPill label={aiMobileText(language, `status.${status}`)} tone="ready" />
            <StatusPill
              label={
                premiumEnabled
                  ? aiMobileText(language, "premium.badge")
                  : aiMobileText(language, "premium.title")
              }
              tone="premium"
            />
            <StatusPill
              label={
                voiceReady
                  ? aiMobileText(language, "voice.title")
                  : aiMobileText(language, "common.notConnected")
              }
            />
          </View>

          <View style={styles.actionGrid}>
            {actions.map((action) => (
              <ActionCard key={action.key} action={action} />
            ))}
          </View>

          <View style={styles.securityCard}>
            <ShieldCheck size={20} color={AI_MOBILE_COLORS.green} strokeWidth={2.5} />
            <Text style={styles.securityText}>
              {aiMobileText(language, "chat.securityNotice")}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  orbTop: {
    position: "absolute",
    top: -100,
    right: -70,
    width: 230,
    height: 230,
    borderRadius: 130,
    backgroundColor: "rgba(112,183,255,0.16)",
  },
  orbBottom: {
    position: "absolute",
    bottom: -130,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: "rgba(102,231,224,0.10)",
  },
  header: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiMark: {
    width: 50,
    height: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102,231,224,0.13)",
    borderWidth: 1,
    borderColor: "rgba(102,231,224,0.24)",
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: 2,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: AI_MOBILE_COLORS.border,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusPill: {
    minHeight: 34,
    borderRadius: 15,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  statusPillReady: {
    backgroundColor: "rgba(102,231,135,0.10)",
    borderColor: "rgba(102,231,135,0.20)",
  },
  statusPillPremium: {
    backgroundColor: "rgba(255,206,102,0.11)",
    borderColor: "rgba(255,206,102,0.22)",
  },
  statusPillText: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 11,
    fontWeight: "900",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionCard: {
    width: "48.5%",
    minHeight: 112,
    borderRadius: 25,
    padding: 14,
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  actionCardLocked: {
    opacity: 0.55,
  },
  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.095)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  actionTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.1,
  },
  securityCard: {
    minHeight: 56,
    borderRadius: 21,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(102,231,135,0.09)",
    borderWidth: 1,
    borderColor: "rgba(102,231,135,0.17)",
  },
  securityText: {
    flex: 1,
    color: AI_MOBILE_COLORS.softText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
});