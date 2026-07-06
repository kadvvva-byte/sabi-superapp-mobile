import React from "react";
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import type { TaxiLang } from "../i18n/taxiClientI18n25";

type ProgramEntryCopy = {
  chooseProgram: string;
  subtitle: string;
  taxiRole: string;
  taxiDesc: string;
  quickOrder: string;
  safetyControl: string;
  support247: string;
  goRole: string;
  goDesc: string;
  highIncome: string;
  flexibleSchedule: string;
  instantPayouts: string;
  agentRole: string;
  agentDesc: string;
  topUpBalance: string;
  agentCommission: string;
  reportsAnalytics: string;
  safeTransactions: string;
  safetyTitle: string;
  safetySubtitle: string;
  navHome: string;
  navHistory: string;
  navFavorites: string;
  navWallet: string;
  navMore: string;
};

const ruCopy: ProgramEntryCopy = {
  chooseProgram: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0443",
  subtitle: "\u0422\u0440\u0438 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u044b \u0434\u043b\u044f \u0440\u0430\u0437\u043d\u044b\u0445 \u0437\u0430\u0434\u0430\u0447",
  taxiRole: "\u041f\u0430\u0441\u0441\u0430\u0436\u0438\u0440, \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430, \u0433\u0440\u0443\u0437",
  taxiDesc: "\u0411\u044b\u0441\u0442\u0440\u044b\u0439 \u0437\u0430\u043a\u0430\u0437 \u0442\u0430\u043a\u0441\u0438, \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430 \u043f\u043e\u0441\u044b\u043b\u043e\u043a \u0438 \u0433\u0440\u0443\u0437\u043e\u0432 \u0434\u043b\u044f \u0432\u0430\u0441",
  quickOrder: "\u0411\u044b\u0441\u0442\u0440\u044b\u0439 \u0437\u0430\u043a\u0430\u0437",
  safetyControl: "\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c \u0438 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c",
  support247: "\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 24/7",
  goRole: "\u0414\u043b\u044f \u0432\u043e\u0434\u0438\u0442\u0435\u043b\u0435\u0439 \u0438 \u043a\u0443\u0440\u044c\u0435\u0440\u043e\u0432",
  goDesc: "\u0417\u0430\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0439\u0442\u0435 \u0441 Sabi Taxi. \u0423\u0434\u043e\u0431\u043d\u044b\u0435 \u0437\u0430\u043a\u0430\u0437\u044b \u0438 \u043f\u0440\u043e\u0437\u0440\u0430\u0447\u043d\u044b\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f",
  highIncome: "\u0412\u044b\u0441\u043e\u043a\u0438\u0439 \u0434\u043e\u0445\u043e\u0434",
  flexibleSchedule: "\u0413\u0438\u0431\u043a\u0438\u0439 \u0433\u0440\u0430\u0444\u0438\u043a",
  instantPayouts: "\u041c\u043e\u043c\u0435\u043d\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u0432\u044b\u043f\u043b\u0430\u0442\u044b",
  agentRole: "\u0410\u0433\u0435\u043d\u0442 \u043f\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0439 \u0431\u0430\u043b\u0430\u043d\u0441\u0430",
  agentDesc: "\u041f\u043e\u043f\u043e\u043b\u043d\u044f\u0439\u0442\u0435 \u0431\u0430\u043b\u0430\u043d\u0441 \u0432\u043e\u0434\u0438\u0442\u0435\u043b\u0435\u0439 \u0438 \u043f\u043e\u043b\u0443\u0447\u0430\u0439\u0442\u0435 \u0432\u043e\u0437\u043d\u0430\u0433\u0440\u0430\u0436\u0434\u0435\u043d\u0438\u0435",
  topUpBalance: "\u041f\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435 \u0431\u0430\u043b\u0430\u043d\u0441\u0430",
  agentCommission: "\u0410\u0433\u0435\u043d\u0442\u0441\u043a\u0430\u044f \u043a\u043e\u043c\u0438\u0441\u0441\u0438\u044f",
  reportsAnalytics: "\u041e\u0442\u0447\u0451\u0442\u044b \u0438 \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430",
  safeTransactions: "\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u044b\u0435 \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0438\u0438",
  safetyTitle: "\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c \u043d\u0430 \u043f\u0435\u0440\u0432\u043e\u043c \u043c\u0435\u0441\u0442\u0435",
  safetySubtitle: "\u0412\u0441\u0435 \u043f\u043e\u0435\u0437\u0434\u043a\u0438 \u0437\u0430\u0441\u0442\u0440\u0430\u0445\u043e\u0432\u0430\u043d\u044b \u0438 \u043f\u043e\u0434 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0435\u043c Sabi AI",
  navHome: "\u0413\u043b\u0430\u0432\u043d\u0430\u044f",
  navHistory: "\u0418\u0441\u0442\u043e\u0440\u0438\u044f",
  navFavorites: "\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435",
  navWallet: "\u041a\u043e\u0448\u0435\u043b\u0451\u043a",
  navMore: "\u0415\u0449\u0451",
};

const enCopy: ProgramEntryCopy = {
  chooseProgram: "Choose program",
  subtitle: "Three programs for different tasks",
  taxiRole: "Passenger, delivery, cargo",
  taxiDesc: "Fast taxi booking, parcel delivery, and cargo service for you",
  quickOrder: "Fast order",
  safetyControl: "Safety and control",
  support247: "24/7 support",
  goRole: "For drivers and couriers",
  goDesc: "Earn with Sabi Taxi. Convenient orders and transparent terms",
  highIncome: "High income",
  flexibleSchedule: "Flexible schedule",
  instantPayouts: "Instant payouts",
  agentRole: "Balance top-up agent",
  agentDesc: "Top up driver balances and receive rewards",
  topUpBalance: "Balance top-up",
  agentCommission: "Agent commission",
  reportsAnalytics: "Reports and analytics",
  safeTransactions: "Safe transactions",
  safetyTitle: "Safety first",
  safetySubtitle: "All rides are insured and monitored by Sabi AI",
  navHome: "Home",
  navHistory: "History",
  navFavorites: "Favorites",
  navWallet: "Wallet",
  navMore: "More",
};

const programCopy: Record<TaxiLang, ProgramEntryCopy> = {
  ru: ruCopy,
  en: enCopy,
  uz: enCopy,
  zh: enCopy,
  ar: enCopy,
  tr: enCopy,
  fr: enCopy,
  de: enCopy,
  es: enCopy,
  it: enCopy,
  pt: enCopy,
  hi: enCopy,
  ur: enCopy,
  fa: enCopy,
  ko: enCopy,
  ja: enCopy,
  id: enCopy,
  ms: enCopy,
  th: enCopy,
  vi: enCopy,
  kk: enCopy,
  ky: enCopy,
  tg: enCopy,
  az: enCopy,
  pl: enCopy,
};

const logoAsset = require("../../../../brand-assets/sabi-app-emblem-preview.png");
const taxiVisual = require("../../../../assets/mid/mid_b_sports_car_super.png");
const goVisual = require("../../../../assets/images/silkroad/categories/auto.png");
const agentVisual = require("../../../../assets/mid/mid_a_crown_box.png");

type Props = {
  lang: TaxiLang;
  onOpenTaxiClient: () => void;
};

type Tone = "green" | "gold" | "blue";

function toneColor(tone: Tone) {
  if (tone === "gold") return "#ffc400";
  if (tone === "blue") return "#16a9ff";
  return "#75ee34";
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.logoBox}>
          <Image source={logoAsset} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.brandWhite}>Sabi</Text>
        <Text style={styles.brandGreen}> Taxi</Text>
      </View>

      <View style={styles.headerActions}>
        <View style={styles.headerCircle}>
          <View style={styles.headerDot} />
          <View style={styles.bellIcon}>
            <View style={styles.bellBody} />
            <View style={styles.bellBottom} />
          </View>
        </View>

        <View style={styles.headerCircle}>
          <Text style={styles.headerBadge}>3</Text>
          <View style={styles.chatIcon}>
            <View style={styles.chatBox} />
            <View style={styles.chatTail} />
          </View>
        </View>
      </View>
    </View>
  );
}

function FeatureIcon({ tone }: { tone: Tone }) {
  const color = toneColor(tone);

  return (
    <View style={styles.featureIconWrap}>
      <View style={[styles.featureIconLine, { borderColor: color }]} />
      <View style={[styles.featureIconDot, { backgroundColor: color }]} />
    </View>
  );
}

function ProgramCard({
  tone,
  title,
  role,
  desc,
  features,
  visual,
  onPress,
}: {
  tone: Tone;
  title: string;
  role: string;
  desc: string;
  features: string[];
  visual: number;
  onPress?: () => void;
}) {
  const color = toneColor(tone);

  const card = (
    <View style={[styles.card, { borderColor: color, shadowColor: color }]}>
      <LinearGradient
        colors={
          tone === "green"
            ? ["rgba(2,14,13,0.98)", "rgba(5,36,24,0.92)", "rgba(2,14,13,0.98)"]
            : tone === "gold"
              ? ["rgba(15,12,5,0.98)", "rgba(42,31,4,0.88)", "rgba(15,12,5,0.98)"]
              : ["rgba(2,12,20,0.98)", "rgba(3,35,61,0.86)", "rgba(2,12,20,0.98)"]
        }
        style={styles.cardFill}
      />

      <Image source={visual} style={styles.cardVisual} resizeMode="cover" />
      <View style={styles.cardDarkMask} />

      <View style={styles.cardTop}>
        <View style={styles.cardCopy}>
          <Text style={[styles.cardTitle, { color }]}>{title}</Text>
          <Text style={styles.cardRole}>{role}</Text>
          <Text style={styles.cardDesc}>{desc}</Text>
        </View>

        <View style={[styles.personBadge, { borderColor: color, backgroundColor: color + "20" }]}>
          <View style={[styles.personHead, { backgroundColor: color }]} />
          <View style={[styles.personBody, { backgroundColor: color }]} />
        </View>
      </View>

      <View style={styles.featureRow}>
        {features.map((feature) => (
          <View key={feature} style={styles.feature}>
            <FeatureIcon tone={tone} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.arrowCircle, { borderColor: color, backgroundColor: color + "1F" }]}>
        <Text style={[styles.arrowText, { color }]}>{">"}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.cardPress}>
        {card}
      </Pressable>
    );
  }

  return <View style={styles.cardPress}>{card}</View>;
}

function BottomNav({ copy }: { copy: ProgramEntryCopy }) {
  const items = [
    { label: copy.navHome, active: true },
    { label: copy.navHistory, active: false },
    { label: copy.navFavorites, active: false },
    { label: copy.navWallet, active: false },
    { label: copy.navMore, active: false },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item, index) => (
        <View key={item.label} style={styles.navItem}>
          <View style={styles.navIconBox}>
            {index === 0 ? <View style={styles.navHomeIcon} /> : null}
            {index === 1 ? <View style={styles.navCircleIcon} /> : null}
            {index === 2 ? (
              <View style={styles.navStarIcon}>
                <View style={styles.navStarA} />
                <View style={styles.navStarB} />
              </View>
            ) : null}
            {index === 3 ? <View style={styles.navWalletIcon} /> : null}
            {index === 4 ? (
              <View style={styles.navMenuIcon}>
                <View style={styles.navMenuLine} />
                <View style={styles.navMenuLine} />
                <View style={styles.navMenuLine} />
              </View>
            ) : null}
          </View>
          <Text style={item.active ? styles.navTextActive : styles.navText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function TaxiProgramEntryScreen({ lang, onOpenTaxiClient }: Props) {
  const c = programCopy[lang] ?? programCopy.ru;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#020807" />
      <LinearGradient colors={["#020807", "#02100e", "#020807"]} style={styles.background} />

      <Header />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={taxiVisual} style={styles.heroCar} resizeMode="cover" />
          <LinearGradient
            colors={["rgba(2,8,10,0.05)", "rgba(2,8,10,0.32)", "rgba(2,8,10,0.95)"]}
            style={styles.heroShade}
          />
          <Text style={styles.heroTitle}>{c.chooseProgram}</Text>
          <Text style={styles.heroAccent}>Sabi Taxi</Text>
          <Text style={styles.heroSubtitle}>{c.subtitle}</Text>
        </View>

        <ProgramCard
          tone="green"
          title="Sabi Taxi"
          role={c.taxiRole}
          desc={c.taxiDesc}
          features={[c.quickOrder, c.safetyControl, c.support247]}
          visual={taxiVisual}
          onPress={onOpenTaxiClient}
        />

        <ProgramCard
          tone="gold"
          title="Sabi Taxi GO"
          role={c.goRole}
          desc={c.goDesc}
          features={[c.highIncome, c.flexibleSchedule, c.instantPayouts, c.support247]}
          visual={goVisual}
        />

        <ProgramCard
          tone="blue"
          title="Sabi Taxi Agent"
          role={c.agentRole}
          desc={c.agentDesc}
          features={[c.topUpBalance, c.agentCommission, c.reportsAnalytics, c.safeTransactions]}
          visual={agentVisual}
        />

        <View style={styles.safety}>
          <View style={styles.safetyBadge}>
            <Text style={styles.safetyBadgeText}>AI</Text>
          </View>
          <View style={styles.safetyCopy}>
            <Text style={styles.safetyTitle}>{c.safetyTitle}</Text>
            <Text style={styles.safetySubtitle}>{c.safetySubtitle}</Text>
          </View>
          <Text style={styles.safetyArrow}>{">"}</Text>
        </View>
      </ScrollView>

      <BottomNav copy={c} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020807",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    height: 82,
    paddingHorizontal: 24,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#75ee34",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  brandWhite: {
    color: "#ffffff",
    fontSize: 33,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  brandGreen: {
    color: "#75ee34",
    fontSize: 33,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    backgroundColor: "rgba(8,15,16,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  headerDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#75ee34",
  },
  headerBadge: {
    position: "absolute",
    top: -4,
    right: -2,
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    overflow: "hidden",
    color: "#051009",
    backgroundColor: "#75ee34",
    fontSize: 13,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
    zIndex: 2,
  },
  bellIcon: {
    width: 27,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBody: {
    width: 19,
    height: 21,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  bellBottom: {
    width: 25,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    marginTop: -2,
  },
  chatIcon: {
    width: 29,
    height: 27,
  },
  chatBox: {
    width: 25,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  chatTail: {
    position: "absolute",
    right: 2,
    bottom: 1,
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#ffffff",
    transform: [{ rotate: "45deg" }],
  },

  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 104,
  },
  hero: {
    minHeight: 245,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 30,
    marginTop: 4,
    marginBottom: 14,
  },
  heroCar: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: -18,
    width: "100%",
    height: 210,
    opacity: 0.62,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 35,
    lineHeight: 41,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  heroAccent: {
    color: "#75ee34",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.9,
    marginTop: 2,
  },
  heroSubtitle: {
    color: "#d8e4e0",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },

  cardPress: {
    marginBottom: 14,
  },
  card: {
    minHeight: 250,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1.55,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  cardFill: {
    ...StyleSheet.absoluteFillObject,
  },
  cardVisual: {
    position: "absolute",
    right: 0,
    top: 18,
    width: "58%",
    height: 138,
    opacity: 0.72,
  },
  cardDarkMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  cardTop: {
    paddingTop: 22,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardCopy: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  cardRole: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  cardDesc: {
    color: "#e5f1ee",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    marginTop: 16,
    maxWidth: 260,
  },
  personBadge: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  personHead: {
    width: 15,
    height: 15,
    borderRadius: 999,
    marginBottom: 2,
  },
  personBody: {
    width: 27,
    height: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  featureRow: {
    position: "absolute",
    left: 20,
    right: 84,
    bottom: 20,
    minHeight: 63,
    borderRadius: 18,
    backgroundColor: "rgba(1,10,11,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  feature: {
    flex: 1,
    alignItems: "center",
  },
  featureIconWrap: {
    width: 33,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  featureIconLine: {
    width: 25,
    height: 15,
    borderRadius: 4,
    borderWidth: 2,
  },
  featureIconDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  featureText: {
    color: "#ffffff",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  arrowCircle: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  arrowText: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
  },

  safety: {
    minHeight: 92,
    borderRadius: 22,
    paddingHorizontal: 18,
    marginTop: 2,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,24,24,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  safetyBadge: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "rgba(117,238,52,0.14)",
    borderWidth: 1,
    borderColor: "rgba(117,238,52,0.35)",
  },
  safetyBadgeText: {
    color: "#75ee34",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
  },
  safetyCopy: {
    flex: 1,
  },
  safetyTitle: {
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
  },
  safetySubtitle: {
    color: "#bdc8c5",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "500",
    marginTop: 6,
  },
  safetyArrow: {
    color: "#d5dfdc",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    flexDirection: "row",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(1,7,8,0.98)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconBox: {
    width: 34,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  navHomeIcon: {
    width: 25,
    height: 25,
    borderRadius: 5,
    backgroundColor: "#75ee34",
  },
  navCircleIcon: {
    width: 25,
    height: 25,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#aeb8b5",
  },
  navStarIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  navStarA: {
    position: "absolute",
    width: 27,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#aeb8b5",
    transform: [{ rotate: "45deg" }],
  },
  navStarB: {
    position: "absolute",
    width: 27,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#aeb8b5",
    transform: [{ rotate: "-45deg" }],
  },
  navWalletIcon: {
    width: 27,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#aeb8b5",
  },
  navMenuIcon: {
    height: 25,
    justifyContent: "space-between",
  },
  navMenuLine: {
    width: 31,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#aeb8b5",
  },
  navText: {
    color: "#aeb8b5",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  navTextActive: {
    color: "#75ee34",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textAlign: "center",
  },
});
