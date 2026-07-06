import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Car,
  Home as HomeIcon,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Warehouse,
  Wifi,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useHomeMobileText } from "../../../shared/i18n/home-mobile-translations";
import {
  fetchSabiProgramFoundationStatus,
  formatSabiFoundationSource,
  formatSabiProgramProviderStatus,
  formatSabiProgramRuntimeStatus,
  type SabiProgramFoundationFetchResult,
} from "../programs/programFoundationClient";
import { buildLocalSabiProgramStatus } from "../programs/programFoundationRegistry";
import type { SabiHomeProgramCode, SabiProgramFoundationStatus } from "../programs/programFoundation.types";

export type HomeProgramEntryKind =
  | "marketplace"
  | "supermarket"
  | "food-delivery"
  | "wholesale-market"
  | "taxi"
  | "wifi-cast";

type HomeProgramEntryConfig = {
  title: string;
  programCode: SabiHomeProgramCode;
  route: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  colors: [string, string, string];
};

type HomeProgramEntryLabels = {
  status: string;
  provider: string;
  route: string;
  api: string;
  source: string;
  loading: string;
};

const PROGRAM_ENTRY_CONFIG: Record<HomeProgramEntryKind, HomeProgramEntryConfig> = {
  marketplace: {
    title: "SilkRoad",
    programCode: "marketplace",
    route: "/marketplace",
    icon: ShoppingBag,
    colors: ["#2B1607", "#7C3A08", "#F59E0B"],
  },
  supermarket: {
    title: "Supermarket",
    programCode: "supermarket",
    route: "/supermarket",
    icon: Store,
    colors: ["#062016", "#047857", "#7CFFB2"],
  },
  "food-delivery": {
    title: "Food Delivery",
    programCode: "food_delivery",
    route: "/food-delivery",
    icon: UtensilsCrossed,
    colors: ["#2B0B07", "#B43B20", "#FFB15E"],
  },
  "wholesale-market": {
    title: "Wholesale Market",
    programCode: "wholesale_market",
    route: "/wholesale-market",
    icon: Warehouse,
    colors: ["#101827", "#27466B", "#77B8FF"],
  },
  taxi: {
    title: "Taxi",
    programCode: "taxi",
    route: "/taxi",
    icon: Car,
    colors: ["#241A04", "#A16207", "#FFE07A"],
  },
  "wifi-cast": {
    title: "Wi‑Fi Cast",
    programCode: "wifi_cast",
    route: "/wifi-cast",
    icon: Wifi,
    colors: ["#071A25", "#0284C7", "#7DD3FC"],
  },
};

const ENTRY_LABELS: Record<"en" | "ru" | "uz", HomeProgramEntryLabels> = {
  en: {
    status: "Status",
    provider: "Provider",
    route: "Route",
    api: "API",
    source: "Source",
    loading: "Loading",
  },
  ru: {
    status: "Статус",
    provider: "Провайдер",
    route: "Маршрут",
    api: "API",
    source: "Источник",
    loading: "Загрузка",
  },
  uz: {
    status: "Holat",
    provider: "Provider",
    route: "Yo‘l",
    api: "API",
    source: "Manba",
    loading: "Yuklanmoqda",
  },
};

function resolveEntryLocale(language?: string | null): "en" | "ru" | "uz" {
  const normalized = String(language || "").trim().toLowerCase();
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uz")) return "uz";
  return "en";
}

function getInitialStatus(programCode: SabiHomeProgramCode): SabiProgramFoundationStatus {
  return buildLocalSabiProgramStatus(programCode);
}

export default function HomeProgramEntryScreen({ kind }: { kind: HomeProgramEntryKind }) {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const homeText = useHomeMobileText();
  const labels = ENTRY_LABELS[resolveEntryLocale(language)];
  const config = PROGRAM_ENTRY_CONFIG[kind];

  const initialStatus = useMemo(() => getInitialStatus(config.programCode), [config.programCode]);
  const [result, setResult] = useState<SabiProgramFoundationFetchResult>({
    source: "local_unavailable",
    status: initialStatus,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    void fetchSabiProgramFoundationStatus(config.programCode)
      .then((nextResult) => {
        if (!cancelled) setResult(nextResult);
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ source: "local_unavailable", status: initialStatus });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config.programCode, initialStatus]);

  const program = result.status.program;
  const Icon = config.icon;
  const footerBottomInset = Math.max(insets.bottom, 12);

  const statusRows = [
    {
      label: labels.status,
      value: loading
        ? labels.loading
        : formatSabiProgramRuntimeStatus(program.runtimeStatus, language),
    },
    {
      label: labels.provider,
      value: formatSabiProgramProviderStatus(program.providerStatus, language),
    },
    {
      label: labels.route,
      value: program.mobileRoute || config.route,
    },
    {
      label: labels.api,
      value: program.apiBasePath || "—",
    },
    {
      label: labels.source,
      value: formatSabiFoundationSource(result.source, language),
    },
  ];

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push("/" as never);
  };

  const openHome = () => {
    router.push("/" as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={config.colors} style={styles.background}>
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          <Pressable onPress={goBack} style={styles.headerButton}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {config.title}
          </Text>

          <View style={styles.headerButton}>
            <Icon size={20} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Icon size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.heroTitle}>{config.title}</Text>

            <View style={styles.statusPill}>
              {loading ? <ActivityIndicator size="small" color="#BBF7D0" /> : <View style={styles.statusDot} />}
              <Text style={styles.statusPillText}>
                {loading ? labels.loading : formatSabiProgramRuntimeStatus(program.runtimeStatus, language)}
              </Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            {statusRows.map((row) => (
              <View key={row.label} style={styles.statusRow}>
                <Text style={styles.statusLabel}>{row.label}</Text>
                <Text style={styles.statusValue} numberOfLines={1}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.fixedFooter, { paddingBottom: footerBottomInset }]}>
          <Pressable onPress={openHome} style={styles.homeButton}>
            <HomeIcon size={18} color="#0F172A" />
            <Text style={styles.homeButtonText}>{homeText.homeTitle}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050B14",
  },
  background: {
    flex: 1,
  },
  topGlow: {
    position: "absolute",
    top: -110,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  bottomGlow: {
    position: "absolute",
    left: -95,
    bottom: -90,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
  heroCard: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 14,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  statusPill: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(15,118,110,0.24)",
    borderWidth: 1,
    borderColor: "rgba(187,247,208,0.24)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#BBF7D0",
  },
  statusPillText: {
    color: "#DCFCE7",
    fontSize: 12,
    fontWeight: "800",
  },
  statusCard: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  statusRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  statusLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    fontWeight: "800",
  },
  statusValue: {
    flex: 1.4,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  fixedFooter: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "rgba(5,11,20,0.18)",
    zIndex: 20,
    elevation: 20,
  },
  homeButton: {
    minHeight: 50,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  homeButtonText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "900",
  },
});
