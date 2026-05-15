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
  Bell,
  Bot,
  Boxes,
  Building2,
  CalendarDays,
  Camera,
  Car,
  FileText,
  Gamepad2,
  Hotel,
  Radio,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UtensilsCrossed,
  Wifi,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { normalizeSabiHomeRoute } from "../navigation/homeRoutes";
import {
  fetchSabiProgramFoundationStatus,
  formatSabiFoundationSource,
  formatSabiProgramBoolean,
  formatSabiProgramProviderStatus,
  formatSabiProgramRuntimeStatus,
  type SabiProgramFoundationFetchResult,
} from "../programs/programFoundationClient";
import type { SabiHomeProgramCode, SabiProgramFoundationStatus } from "../programs/programFoundation.types";
import { buildLocalSabiProgramStatus } from "../programs/programFoundationRegistry";
import {
  getSabiModuleEntryContent,
  getSabiModuleSectionLabels,
  type SabiModuleEntryCode,
} from "./moduleEntryContent";

export type SabiModuleEntryIcon = SabiModuleEntryCode | "ai" | "ai_voice";

export type SabiModuleEntryAction = {
  label: string;
  route: string;
  tone?: "primary" | "secondary";
};

export type SabiModuleEntryStatus = {
  label: string;
  value: string;
};

export type SabiModuleEntryScreenProps = {
  moduleCode?: SabiModuleEntryCode;
  programCode?: SabiHomeProgramCode;
  icon?: SabiModuleEntryIcon;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  stage?: string;
  description?: string;
  statuses?: SabiModuleEntryStatus[];
  actions?: SabiModuleEntryAction[];
  policyNotes?: string[];
};

function getIcon(icon: SabiModuleEntryIcon) {
  switch (icon) {
    case "marketplace":
      return ShoppingBag;
    case "wholesale":
      return Boxes;
    case "supermarket":
      return Store;
    case "hotels":
      return Hotel;
    case "food":
      return UtensilsCrossed;
    case "taxi":
      return Car;
    case "delivery":
      return Truck;
    case "stream":
      return Radio;
    case "events":
      return CalendarDays;
    case "notifications":
      return Bell;
    case "ai":
    case "ai_voice":
      return Bot;
    case "games":
      return Gamepad2;
    case "business":
      return Building2;
    case "merchant":
      return Store;
    case "documents":
      return FileText;
    case "camera":
      return Camera;
    case "cast":
      return Wifi;
    default:
      return ShieldCheck;
  }
}

function getGradient(icon: SabiModuleEntryIcon): [string, string, string] {
  switch (icon) {
    case "marketplace":
      return ["#2B1607", "#7C3A08", "#F59E0B"];
    case "wholesale":
      return ["#101827", "#27466B", "#77B8FF"];
    case "supermarket":
      return ["#062016", "#047857", "#7CFFB2"];
    case "hotels":
      return ["#130B2B", "#4338CA", "#C4B5FD"];
    case "food":
      return ["#2B0B07", "#B43B20", "#FFB15E"];
    case "taxi":
      return ["#241A04", "#A16207", "#FFE07A"];
    case "delivery":
      return ["#071C2B", "#0369A1", "#7DD3FC"];
    case "stream":
      return ["#18071F", "#7E22CE", "#F0ABFC"];
    case "events":
      return ["#071A25", "#0F766E", "#99F6E4"];
    case "notifications":
      return ["#111827", "#374151", "#E5E7EB"];
    case "ai":
    case "ai_voice":
      return ["#130B2B", "#5B21B6", "#C4B5FD"];
    case "games":
      return ["#061A2D", "#2563EB", "#93C5FD"];
    case "business":
      return ["#0A1322", "#1D4ED8", "#93C5FD"];
    case "merchant":
      return ["#17120A", "#B45309", "#FCD34D"];
    case "documents":
      return ["#0B1720", "#0F766E", "#99F6E4"];
    case "camera":
      return ["#1F2937", "#4B5563", "#D1D5DB"];
    case "cast":
      return ["#071A25", "#0284C7", "#7DD3FC"];
    default:
      return ["#0F172A", "#334155", "#CBD5E1"];
  }
}

function useProgramFoundation(programCode?: SabiHomeProgramCode) {
  const [result, setResult] = useState<SabiProgramFoundationFetchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!programCode) {
      setResult(null);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    void fetchSabiProgramFoundationStatus(programCode)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ source: "local_unavailable", status: buildLocalSabiProgramStatus(programCode) });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [programCode]);

  return { result, loading };
}

function resolveEntryLocale(language?: string | null) {
  const normalized = String(language || "").trim().toLowerCase();
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uz")) return "uz";
  return "en";
}

function getFoundationRowLabels(language?: string | null) {
  const locale = resolveEntryLocale(language);
  return {
    route: { en: "Route", ru: "Route", uz: "Route" }[locale],
    runtime: { en: "Runtime", ru: "Runtime", uz: "Runtime" }[locale],
    provider: { en: "Provider/API", ru: "Provider/API", uz: "Provider/API" }[locale],
    source: { en: "Source", ru: "Источник", uz: "Manba" }[locale],
    wallet: { en: "Wallet", ru: "Wallet", uz: "Wallet" }[locale],
    qr: { en: "QR", ru: "QR", uz: "QR" }[locale],
    notifications: { en: "Alerts", ru: "Оповещения", uz: "Bildirishnomalar" }[locale],
    ai: { en: "AI", ru: "AI", uz: "AI" }[locale],
    admin: { en: "Admin", ru: "Админ", uz: "Admin" }[locale],
  };
}

function buildFoundationRows(
  status: SabiProgramFoundationStatus | null,
  source: SabiProgramFoundationFetchResult["source"] | null,
  language?: string | null,
) {
  if (!status?.program) return [];

  const labels = getFoundationRowLabels(language);
  const program = status.program;

  return [
    { label: labels.route, value: program.mobileRoute },
    { label: labels.runtime, value: formatSabiProgramRuntimeStatus(program.runtimeStatus, language) },
    { label: labels.provider, value: formatSabiProgramProviderStatus(program.providerStatus, language) },
    { label: labels.source, value: formatSabiFoundationSource(source ?? "local_unavailable", language) },
    { label: labels.wallet, value: formatSabiProgramBoolean(program.paymentsRouteThroughWallet, language) },
    { label: labels.qr, value: formatSabiProgramBoolean(program.qrEnabled, language) },
    { label: labels.notifications, value: formatSabiProgramBoolean(program.notificationsEnabled, language) },
    { label: labels.ai, value: formatSabiProgramBoolean(program.aiHooksEnabled, language) },
    { label: labels.admin, value: formatSabiProgramBoolean(program.adminReviewRequired, language) },
  ];
}

export default function SabiModuleEntryScreen(props: SabiModuleEntryScreenProps) {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const sectionLabels = getSabiModuleSectionLabels(language);
  const generated = props.moduleCode
    ? getSabiModuleEntryContent(props.moduleCode, language)
    : null;

  const programCode = props.programCode ?? generated?.programCode;
  const { result: foundationResult, loading } = useProgramFoundation(programCode);
  const foundationStatus = foundationResult?.status ?? null;
  const foundation = foundationStatus?.program ?? null;

  const icon = props.icon ?? generated?.icon ?? "marketplace";
  const title = props.title ?? foundation?.title ?? generated?.title ?? "Sabi";
  const eyebrow = props.eyebrow ?? sectionLabels.eyebrow;
  const stage = props.stage ?? generated?.stage ?? "Ready";
  const statuses = useMemo(
    () => props.statuses ?? buildFoundationRows(foundationStatus, foundationResult?.source ?? null, language) ?? generated?.statuses ?? [],
    [foundationResult?.source, foundationStatus, generated?.statuses, language, props.statuses],
  );
  const actions = props.actions ?? generated?.actions ?? [{ label: "Home", route: "/", tone: "primary" as const }];

  const Icon = getIcon(icon);
  const colors = getGradient(icon);
  const footerBottomInset = Math.max(insets.bottom, 12);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push("/" as never);
  };

  const openRoute = (route: string) => {
    router.push(normalizeSabiHomeRoute(route) as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors} style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}> 
          <Pressable onPress={goBack} style={styles.backButton}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          <View style={styles.headerIcon}>
            <Icon size={21} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <Icon size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.heroTitle}>{title}</Text>

            <View style={styles.stagePill}>
              {loading ? <ActivityIndicator size="small" color="#BBF7D0" /> : <View style={styles.stageDot} />}
              <Text style={styles.stageText}>{loading ? sectionLabels.loading : stage}</Text>
            </View>
          </View>

          {statuses.length ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{sectionLabels.connection}</Text>
              <View style={styles.statusList}>
                {statuses.map((item) => (
                  <View key={`${item.label}:${item.value}`} style={styles.statusRow}>
                    <Text style={styles.statusLabel}>{item.label}</Text>
                    <Text style={styles.statusValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {actions.length ? (
          <View style={[styles.fixedActions, { paddingBottom: footerBottomInset }]}>
            <View style={styles.actions}>
              {actions.map((action) => (
                <Pressable
                  key={`${action.label}:${action.route}`}
                  onPress={() => openRoute(action.route)}
                  style={[
                    styles.actionButton,
                    action.tone === "secondary" ? styles.secondaryAction : styles.primaryAction,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      action.tone === "secondary" ? styles.secondaryActionText : styles.primaryActionText,
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050B14" },
  background: { flex: 1 },
  glowTop: { position: "absolute", top: -100, right: -60, width: 240, height: 240, borderRadius: 240, backgroundColor: "rgba(255,255,255,0.14)" },
  glowBottom: { position: "absolute", left: -90, bottom: -80, width: 260, height: 260, borderRadius: 260, backgroundColor: "rgba(255,255,255,0.1)" },
  header: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  headerCenter: { flex: 1 },
  eyebrow: { color: "rgba(255,255,255,0.68)", fontSize: 12, fontWeight: "800", letterSpacing: 0.6 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  headerIcon: { width: 42, height: 42, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  heroCard: { borderRadius: 30, padding: 18, backgroundColor: "rgba(255,255,255,0.13)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", overflow: "hidden" },
  heroIconWrap: { width: 66, height: 66, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.16)", marginBottom: 14 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  stagePill: { marginTop: 14, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: "rgba(15,118,110,0.24)", borderWidth: 1, borderColor: "rgba(187,247,208,0.24)" },
  stageDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#BBF7D0" },
  stageText: { color: "#DCFCE7", fontSize: 12, fontWeight: "800" },
  card: { borderRadius: 24, padding: 16, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  sectionTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginBottom: 8 },
  statusList: { gap: 9 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  statusLabel: { color: "rgba(255,255,255,0.66)", fontSize: 13, fontWeight: "700", flex: 1 },
  statusValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", flex: 1, textAlign: "right" },
  fixedActions: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: "rgba(5,11,20,0.18)", zIndex: 20, elevation: 20 },
  actions: { flexDirection: "row", gap: 10, borderRadius: 24, padding: 8, backgroundColor: "rgba(5,11,20,0.56)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  actionButton: { flex: 1, minHeight: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, borderWidth: 1 },
  primaryAction: { backgroundColor: "#FFFFFF", borderColor: "rgba(255,255,255,0.8)" },
  secondaryAction: { backgroundColor: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.18)" },
  actionText: { fontSize: 13, fontWeight: "900" },
  primaryActionText: { color: "#0F172A" },
  secondaryActionText: { color: "#FFFFFF" },
});
