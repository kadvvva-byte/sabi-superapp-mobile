import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bot,
  ChevronRight,
  RefreshCw,
  Send,
} from "lucide-react-native";

import {
  AI_MOBILE_ACCENT_GRADIENT,
  AI_MOBILE_COLORS,
  AI_MOBILE_GRADIENT,
  AI_MOBILE_GREEN_GRADIENT,
  AI_MOBILE_PURPLE_GRADIENT,
} from "../aiMobileTheme";
import type { AiMobileConnectionStatus } from "../aiMobileTypes";

type AiMobileScaffoldProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  right?: React.ReactNode;
};

export function AiMobileScaffold({
  title,
  subtitle,
  children,
  onRefresh,
  isRefreshing,
  right,
}: AiMobileScaffoldProps) {
  return (
    <LinearGradient colors={AI_MOBILE_GRADIENT} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.orbTop} />
        <View style={styles.orbBottom} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={19} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.headerSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {right ??
            (onRefresh ? (
              <Pressable onPress={onRefresh} style={styles.headerButton} disabled={isRefreshing}>
                {isRefreshing ? (
                  <ActivityIndicator size="small" color={AI_MOBILE_COLORS.cyan} />
                ) : (
                  <RefreshCw size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
                )}
              </Pressable>
            ) : (
              <View style={styles.headerButtonGhost} />
            ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

type AiHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  status?: React.ReactNode;
};

export function AiHero({ eyebrow, title, description, status }: AiHeroProps) {
  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.13)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.045)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroGlow} />
      <View style={styles.heroTopRow}>
        <View style={styles.aiOrb}>
          <Bot size={20} color={AI_MOBILE_COLORS.text} strokeWidth={2.4} />
        </View>
        {status}
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroDescription}>{description}</Text>
    </LinearGradient>
  );
}

export function AiGlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AiSectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export function AiStatusPill({
  status,
  label,
}: {
  status: AiMobileConnectionStatus;
  label: string;
}) {
  const color =
    status === "ready"
      ? AI_MOBILE_COLORS.green
      : status === "error"
        ? AI_MOBILE_COLORS.danger
        : status === "not_connected"
          ? AI_MOBILE_COLORS.dim
          : AI_MOBILE_COLORS.gold;

  return (
    <View style={[styles.statusPill, { borderColor: `${color}55` }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

export function AiActionRow({
  title,
  description,
  icon,
  badge,
  onPress,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.actionRow}>
      <LinearGradient
        colors={AI_MOBILE_ACCENT_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionIcon}
      >
        {icon ?? <Bot size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.4} />}
      </LinearGradient>

      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>

      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : onPress ? (
        <ChevronRight size={18} color={AI_MOBILE_COLORS.muted} strokeWidth={2.4} />
      ) : null}
    </Pressable>
  );
}

export function AiMetricCard({
  label,
  value,
  tone = "blue",
}: {
  label: string;
  value: string;
  tone?: "blue" | "green" | "purple";
}) {
  const colors =
    tone === "green"
      ? AI_MOBILE_GREEN_GRADIENT
      : tone === "purple"
        ? AI_MOBILE_PURPLE_GRADIENT
        : AI_MOBILE_ACCENT_GRADIENT;

  return (
    <LinearGradient colors={colors} style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={2}>
        {value}
      </Text>
    </LinearGradient>
  );
}

export function AiEmptyState({ title, text }: { title: string; text: string }) {
  return (
    <AiGlassCard style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Bot size={20} color={AI_MOBILE_COLORS.cyan} strokeWidth={2.5} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </AiGlassCard>
  );
}

export function AiComposer({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  disabled,
  multiline,
  canSubmit,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  multiline?: boolean;
  canSubmit?: boolean;
}) {
  return (
    <View style={styles.composerWrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AI_MOBILE_COLORS.dim}
        style={[styles.composerInput, multiline && styles.composerInputMultiline]}
        multiline={multiline}
        editable={!disabled}
      />
      <Pressable onPress={onSubmit} disabled={disabled || !(canSubmit ?? Boolean(value.trim()))} style={styles.sendButton}>
        <Send size={17} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

export function AiInlineNotice({ text }: { text: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  orbTop: {
    position: "absolute",
    top: -90,
    right: -60,
    width: 210,
    height: 210,
    borderRadius: 110,
    backgroundColor: "rgba(112,183,255,0.20)",
  },
  orbBottom: {
    position: "absolute",
    bottom: -110,
    left: -70,
    width: 230,
    height: 230,
    borderRadius: 120,
    backgroundColor: "rgba(181,140,255,0.16)",
  },
  header: {
    minHeight: 74,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  headerButtonGhost: { width: 44, height: 44 },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 34,
    gap: 14,
  },
  hero: {
    minHeight: 214,
    borderRadius: 30,
    padding: 18,
    borderWidth: 1,
    borderColor: AI_MOBILE_COLORS.borderStrong,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -46,
    top: -54,
    backgroundColor: "rgba(102,231,224,0.16)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  aiOrb: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  eyebrow: {
    color: AI_MOBILE_COLORS.cyan,
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: "900",
    marginBottom: 8,
  },
  heroTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  heroDescription: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: AI_MOBILE_COLORS.card,
    borderWidth: 1,
    borderColor: AI_MOBILE_COLORS.border,
  },
  sectionTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  statusPill: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  statusDot: { width: 7, height: 7, borderRadius: 5 },
  statusText: { fontSize: 11, fontWeight: "900" },
  actionRow: {
    minHeight: 76,
    borderRadius: 20,
    padding: 12,
    backgroundColor: AI_MOBILE_COLORS.cardSoft,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextWrap: { flex: 1 },
  actionTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 3,
  },
  actionDescription: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  badge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,211,107,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,211,107,0.25)",
  },
  badgeText: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 10,
    fontWeight: "900",
  },
  metricCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 20,
    padding: 13,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  metricLabel: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 11,
    fontWeight: "800",
  },
  metricValue: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  emptyCard: { alignItems: "center", paddingVertical: 24 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102,231,224,0.12)",
    marginBottom: 10,
  },
  emptyTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  emptyText: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    fontWeight: "700",
  },
  composerWrap: {
    borderRadius: 24,
    padding: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: AI_MOBILE_COLORS.card,
    borderWidth: 1,
    borderColor: AI_MOBILE_COLORS.border,
  },
  composerInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: AI_MOBILE_COLORS.text,
    backgroundColor: "rgba(255,255,255,0.055)",
    fontSize: 14,
    fontWeight: "700",
  },
  composerInputMultiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(112,183,255,0.36)",
    borderWidth: 1,
    borderColor: "rgba(112,183,255,0.30)",
  },
  notice: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,211,107,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,211,107,0.18)",
  },
  noticeText: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
});
