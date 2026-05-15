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
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  AtSign,
  MessageCircleMore,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import { useI18n } from "../../src/shared/i18n";
import { walletText } from "../../src/shared/wallet/wallet-i18n";

type ContactFilter = "all" | "people" | "business" | "merchant";

type TextMap = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  all: string;
  people: string;
  business: string;
  merchant: string;
  quickRoutes: string;
  quickRoutesHint: string;
  send: string;
  request: string;
  chatPay: string;
  mySabiId: string;
  directoryTitle: string;
  directoryHint: string;
  emptyTitle: string;
  emptyText: string;
  securityTitle: string;
  securityHint: string;
  identityTitle: string;
  identityText: string;
  verifiedTitle: string;
  verifiedText: string;
};

function tr(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  return walletText(t, key, fallback);
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function RouteButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.routeButton}>
      <View style={styles.routeIcon}>{icon}</View>
      <Text style={styles.routeText}>{label}</Text>
    </Pressable>
  );
}

function InfoRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoBody}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

export default function WalletContactsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<ContactFilter>("all");
  const [search, setSearch] = useState("");

  const texts = useMemo<TextMap>(
    () => ({
      title: tr(t, "wallet.contacts.title", "Wallet contacts"),
      subtitle: tr(
        t,
        "wallet.contacts.subtitle",
        "Verified wallet contacts will appear after backend directory sync.",
      ),
      searchPlaceholder: tr(t, "wallet.contacts.searchPlaceholder", "Search verified wallet contacts"),
      all: tr(t, "wallet.contacts.all", "All"),
      people: tr(t, "wallet.contacts.people", "People"),
      business: tr(t, "wallet.contacts.business", "Business"),
      merchant: tr(t, "wallet.contacts.merchant", "Merchant"),
      quickRoutes: tr(t, "wallet.contacts.quickRoutes", "Quick routes"),
      quickRoutesHint: tr(t, "wallet.contacts.quickRoutesHint", "Actions"),
      send: tr(t, "wallet.contacts.send", "Send"),
      request: tr(t, "wallet.contacts.request", "Request"),
      chatPay: tr(t, "wallet.contacts.chatPay", "Chat Pay"),
      mySabiId: tr(t, "wallet.contacts.mySabiId", "MySabi ID"),
      directoryTitle: tr(t, "wallet.contacts.directoryTitle", "Verified directory"),
      directoryHint: tr(t, "wallet.contacts.directoryHint", "Verified directory required"),
      emptyTitle: tr(t, "wallet.contacts.emptyTitle", "No verified contacts yet"),
      emptyText: tr(
        t,
        "wallet.contacts.emptyText",
        "Contacts must come from verified user, business or merchant routes.",
      ),
      securityTitle: tr(t, "wallet.contacts.securityTitle", "Contact system"),
      securityHint: tr(t, "wallet.contacts.securityHint", "Policy"),
      identityTitle: tr(t, "wallet.contacts.identityTitle", "Identity-first routing"),
      identityText: tr(
        t,
        "wallet.contacts.identityText",
        "Wallet contacts must use unified user ID, MySabi ID or verified merchant/business route.",
      ),
      verifiedTitle: tr(t, "wallet.contacts.verifiedTitle", "Verified paths"),
      verifiedText: tr(
        t,
        "wallet.contacts.verifiedText",
        "Send and request flows should resolve recipients from backend/profile data before money movement.",
      ),
    }),
    [t],
  );

  const filters = useMemo(
    () => [
      { key: "all" as const, label: texts.all },
      { key: "people" as const, label: texts.people },
      { key: "business" as const, label: texts.business },
      { key: "merchant" as const, label: texts.merchant },
    ],
    [texts.all, texts.people, texts.business, texts.merchant],
  );

  const headerTop = Math.max(insets.top, 10);

  return (
    <WalletScreenShell>
      <View style={[styles.fixedHeader, { paddingTop: headerTop }]}> 
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{texts.title}</Text>
          <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Users size={22} color="#EAF1FF" />
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{texts.directoryHint}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{texts.directoryTitle}</Text>
          <Text style={styles.heroSubtitle}>{texts.emptyText}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.searchWrap}>
            <Search size={18} color="rgba(234,241,255,0.72)" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={texts.searchPlaceholder}
              placeholderTextColor="rgba(234,241,255,0.56)"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filtersRow}>
            {filters.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => setActiveFilter(filter.key)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.quickRoutes} hint={texts.quickRoutesHint} />
          <View style={styles.routesGrid}>
            <RouteButton
              icon={<ArrowUpRight size={18} color="#FFFFFF" />}
              label={texts.send}
              onPress={() => router.push("/wallet/send" as never)}
            />
            <RouteButton
              icon={<ArrowDownLeft size={18} color="#FFFFFF" />}
              label={texts.request}
              onPress={() => router.push("/wallet/request-money" as never)}
            />
            <RouteButton
              icon={<MessageCircleMore size={18} color="#FFFFFF" />}
              label={texts.chatPay}
              onPress={() => router.push("/wallet/chat-payments" as never)}
            />
            <RouteButton
              icon={<AtSign size={18} color="#FFFFFF" />}
              label={texts.mySabiId}
              onPress={() => router.push("/wallet/my-sabi-id" as never)}
            />
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <UserRound size={24} color="#EAF1FF" />
          </View>
          <Text style={styles.emptyTitle}>{texts.emptyTitle}</Text>
          <Text style={styles.emptyText}>{texts.emptyText}</Text>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.securityTitle} hint={texts.securityHint} />
          <InfoRow
            icon={<AtSign size={18} color="#EAF1FF" />}
            title={texts.identityTitle}
            text={texts.identityText}
          />
          <View style={styles.divider} />
          <InfoRow
            icon={<ShieldCheck size={18} color="#EAF1FF" />}
            title={texts.verifiedTitle}
            text={texts.verifiedText}
          />
        </View>
      </ScrollView>
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 30,
    minHeight: 86,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#060F19",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,32,58,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  headerSubtitle: {
    color: "rgba(234,241,255,0.70)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 116,
    paddingBottom: 40,
  },
  heroCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    backgroundColor: "#101C31",
  },
  heroGlowA: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 180,
    height: 150,
    borderRadius: 60,
    backgroundColor: "rgba(47,107,255,0.20)",
  },
  heroGlowB: {
    position: "absolute",
    right: -50,
    bottom: -60,
    width: 220,
    height: 160,
    borderRadius: 70,
    backgroundColor: "rgba(124,68,242,0.16)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroBadgeText: {
    color: "rgba(234,241,255,0.86)",
    fontSize: 11,
    fontWeight: "900",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginTop: 18,
    zIndex: 2,
  },
  heroSubtitle: {
    color: "rgba(234,241,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 8,
    zIndex: 2,
  },
  card: {
    backgroundColor: "#101C31",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
  },
  searchWrap: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  filterChip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    borderColor: "#4F88FF",
    backgroundColor: "rgba(47,107,255,0.22)",
  },
  filterChipText: { color: "rgba(234,241,255,0.72)", fontSize: 12, fontWeight: "900" },
  filterChipTextActive: { color: "#FFFFFF" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  sectionHint: { color: "rgba(234,241,255,0.58)", fontSize: 12, fontWeight: "800" },
  routesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  routeButton: {
    width: "47.8%",
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  routeIcon: { marginBottom: 8 },
  routeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", textAlign: "center" },
  emptyCard: {
    backgroundColor: "#101C31",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    marginBottom: 18,
  },
  emptyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", textAlign: "center" },
  emptyText: {
    color: "rgba(234,241,255,0.72)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoIcon: { width: 24, alignItems: "center", paddingTop: 2 },
  infoBody: { flex: 1 },
  infoTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginBottom: 4 },
  infoText: { color: "rgba(234,241,255,0.70)", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 12 },
});
