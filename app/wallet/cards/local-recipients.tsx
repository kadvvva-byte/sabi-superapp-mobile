import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Landmark,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react-native";

import AppContainer from "../../../components/AppContainer";
import { useI18n } from "../../../src/shared/i18n";
import { useSabiTheme } from "../../../src/theme/ThemeProvider";

function walletText(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

function SectionHeader({
  title,
  hint,
  colors,
}: {
  title: string;
  hint: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
  );
}

function Badge({
  label,
  colors,
  radius,
}: {
  label: string;
  colors: { cardSoft: string; border: string; text: string };
  radius: number;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

export default function WalletLocalRecipientsScreen() {
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.localRecipients.eyebrow", "LOCAL RECIPIENTS"),
      title: walletText(t, "wallet.localRecipients.title", "Domestic recipient directory"),
      subtitle: walletText(
        t,
        "wallet.localRecipients.subtitle",
        "Verified local-card recipients from provider, contacts and profile sync.",
      ),
      heroTitle: walletText(t, "wallet.localRecipients.heroTitle", "No local recipients yet"),
      heroText: walletText(
        t,
        "wallet.localRecipients.heroText",
        "Saved recipients must come from a real provider directory, verified contacts or successful transfer history.",
      ),
      localCard: walletText(t, "wallet.cards.localCard", "Local Card"),
      trusted: walletText(t, "wallet.localRecipients.trusted", "Trusted"),
      domesticOnly: walletText(t, "wallet.localCards.domesticOnly", "Domestic only"),
      searchTitle: walletText(t, "wallet.localRecipients.searchTitle", "Search recipients"),
      searchHint: walletText(t, "wallet.localRecipients.searchHint", "Provider directory"),
      searchPlaceholder: walletText(
        t,
        "wallet.localRecipients.searchPlaceholder",
        "Search by name, phone, ID or provider token",
      ),
      emptyTitle: walletText(t, "wallet.localRecipients.emptyTitle", "No recipients found"),
      emptyText: walletText(
        t,
        "wallet.localRecipients.emptyText",
        "The local recipient list is empty until real verified recipients are synced. No local test contacts are shipped in this screen.",
      ),
      note1Title: walletText(t, "wallet.localRecipients.note1Title", "Verified recipients only"),
      note1Text: walletText(
        t,
        "wallet.localRecipients.note1Text",
        "Local transfers should be sent only to verified domestic recipients or provider-confirmed card tokens.",
      ),
      note2Title: walletText(t, "wallet.localRecipients.note2Title", "Real directory only"),
      note2Text: walletText(
        t,
        "wallet.localRecipients.note2Text",
        "This directory contains only synced provider recipients or verified transfer history.",
      ),
      cardsHub: walletText(t, "wallet.localTransfer.cardsHub", "Cards Hub"),
      newTransfer: walletText(t, "wallet.localRecipients.newTransfer", "New transfer"),
    }),
    [t],
  );

  return (
    <AppContainer>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>

        <View style={styles.fixedHeaderTextWrap}>
          <Text style={[styles.fixedEyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text>
          <Text style={[styles.fixedTitle, { color: colors.text }]}>{texts.title}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.subtitleTop, { color: colors.textSecondary }]}>{texts.subtitle}</Text>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <View style={styles.heroShine} />

          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.heroIconWrap,
                {
                  backgroundColor: colors.cardSoft,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <WalletCards size={22} color={colors.text} />
            </View>

            <View style={styles.heroTextWrap}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{texts.heroTitle}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{texts.heroText}</Text>
            </View>
          </View>

          <View style={styles.heroBadges}>
            <Badge label={texts.localCard} colors={colors} radius={radius.lg} />
            <Badge label={texts.trusted} colors={colors} radius={radius.lg} />
            <Badge label={texts.domesticOnly} colors={colors} radius={radius.lg} />
          </View>
        </View>

        <View
          style={[
            styles.searchCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <SectionHeader title={texts.searchTitle} hint={texts.searchHint} colors={colors} />

          <View
            style={[
              styles.searchInputWrap,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={texts.searchPlaceholder}
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
        </View>

        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <UserRound size={22} color={colors.text} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{texts.emptyTitle}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{texts.emptyText}</Text>
        </View>

        <View
          style={[
            styles.noteCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.noteRow}>
            <View style={styles.noteIconWrap}>
              <ShieldCheck size={18} color={colors.text} />
            </View>

            <View style={styles.noteTextWrap}>
              <Text style={[styles.noteTitle, { color: colors.text }]}>{texts.note1Title}</Text>
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>{texts.note1Text}</Text>
            </View>
          </View>

          <Divider color={colors.border} />

          <View style={styles.noteRow}>
            <View style={styles.noteIconWrap}>
              <Landmark size={18} color={colors.text} />
            </View>

            <View style={styles.noteTextWrap}>
              <Text style={[styles.noteTitle, { color: colors.text }]}>{texts.note2Title}</Text>
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>{texts.note2Text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomActions}>
          <Pressable
            onPress={() => router.replace("/wallet/cards" as never)}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{texts.cardsHub}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/wallet/cards/local-transfer" as never)}
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text style={styles.primaryButtonText}>{texts.newTransfer}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    minHeight: 82,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fixedHeaderTextWrap: { flex: 1 },
  fixedEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 3,
  },
  fixedTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 96,
    paddingBottom: 40,
  },
  subtitleTop: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },
  heroGlowA: {
    position: "absolute",
    top: -18,
    left: -18,
    width: 180,
    height: 135,
    borderRadius: 44,
    backgroundColor: "rgba(61,121,255,0.18)",
  },
  heroGlowB: {
    position: "absolute",
    right: -26,
    bottom: -28,
    width: 210,
    height: 150,
    borderRadius: 60,
    backgroundColor: "rgba(124,68,242,0.12)",
  },
  heroShine: {
    position: "absolute",
    top: -50,
    right: 38,
    width: 92,
    height: 280,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "22deg" }],
  },
  heroTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    marginBottom: 16,
    zIndex: 2,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: { flex: 1 },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    zIndex: 2,
  },
  badge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  searchCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: "700",
  },
  searchInputWrap: {
    minHeight: 54,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyCard: {
    borderWidth: 1,
    padding: 24,
    marginBottom: 18,
    alignItems: "center",
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  noteCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  noteRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  noteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  noteTextWrap: { flex: 1 },
  noteTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  bottomActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  primaryButton: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#08111F",
    fontSize: 14,
    fontWeight: "900",
  },
});
