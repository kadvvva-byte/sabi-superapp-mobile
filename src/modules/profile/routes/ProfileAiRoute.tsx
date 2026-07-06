import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bot,
  Brain,
  ChevronRight,
  Crown,
  Languages,
  Mic,
  Palette,
  QrCode,
  ShieldCheck,
  User,
} from "lucide-react-native";
import React from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { aiMobileText } from "../../ai/mobile/aiMobileI18n";
import { useI18n } from "../../../shared/i18n";

const BG_TOP = "#04120D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";

const CARD = "rgba(14, 28, 46, 0.86)";
const CARD_ALT = "rgba(20, 39, 58, 0.84)";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const GREEN = "#77E28C";
const TEAL = "#58D5C9";
const BLUE = "#63A8FF";
const PURPLE = "#B588FF";
const GOLD = "#FFCC66";

type IconProps = {
  size: number;
  color: string;
  strokeWidth?: number;
};

const ArrowLeftIcon = ArrowLeft as unknown as React.ComponentType<IconProps>;
const BotIcon = Bot as unknown as React.ComponentType<IconProps>;
const BrainIcon = Brain as unknown as React.ComponentType<IconProps>;
const ChevronRightIcon = ChevronRight as unknown as React.ComponentType<IconProps>;
const CrownIcon = Crown as unknown as React.ComponentType<IconProps>;
const LanguagesIcon = Languages as unknown as React.ComponentType<IconProps>;
const MicIcon = Mic as unknown as React.ComponentType<IconProps>;
const PaletteIcon = Palette as unknown as React.ComponentType<IconProps>;
const QrCodeIcon = QrCode as unknown as React.ComponentType<IconProps>;
const ShieldCheckIcon = ShieldCheck as unknown as React.ComponentType<IconProps>;
const UserIcon = User as unknown as React.ComponentType<IconProps>;

type RowItem = {
  key: string;
  title: string;
  route: string;
  icon: React.ReactNode;
  badge?: string;
};

function IconBox({
  icon,
  accent = TEAL,
}: {
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <View style={[styles.iconBox, { borderColor: `${accent}33` }]}> 
      {icon}
    </View>
  );
}

function Row({ item }: { item: RowItem }) {
  return (
    <Pressable
      onPress={() => router.push(item.route as never)}
      style={styles.row}
    >
      {item.icon}

      <Text style={styles.rowTitle} numberOfLines={1}>
        {item.title}
      </Text>

      {item.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      ) : (
        <ChevronRightIcon size={17} color={MUTED} strokeWidth={2.4} />
      )}
    </Pressable>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: RowItem[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.card}>
        {items.map((item, index) => (
          <View
            key={item.key}
            style={index > 0 ? styles.rowDivider : undefined}
          >
            <Row item={item} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileAiRoute() {
  const { language } = useI18n();

  const aiItems: RowItem[] = [
    {
      key: "translation",
      title: aiMobileText(language, "action.translation.title"),
      route: "/ai/translation",
      icon: (
        <IconBox
          accent={BLUE}
          icon={<LanguagesIcon size={19} color={BLUE} strokeWidth={2.5} />}
        />
      ),
    },
    {
      key: "voice",
      title: aiMobileText(language, "action.voice.title"),
      route: "/ai/voice",
      icon: (
        <IconBox
          accent={TEAL}
          icon={<MicIcon size={19} color={TEAL} strokeWidth={2.5} />}
        />
      ),
    },
    {
      key: "memory",
      title: aiMobileText(language, "action.memory.title"),
      route: "/ai/memory",
      icon: (
        <IconBox
          accent={PURPLE}
          icon={<BrainIcon size={19} color={PURPLE} strokeWidth={2.5} />}
        />
      ),
    },
    {
      key: "premium",
      title: aiMobileText(language, "action.premium.title"),
      route: "/profile/premium",
      badge: aiMobileText(language, "premium.badge"),
      icon: (
        <IconBox
          accent={GOLD}
          icon={<CrownIcon size={19} color={GOLD} strokeWidth={2.5} />}
        />
      ),
    },
  ];

  const profileItems: RowItem[] = [
    {
      key: "profile",
      title: aiMobileText(language, "action.profileAi.title"),
      route: "/profile/edit",
      icon: (
        <IconBox
          accent={TEAL}
          icon={<UserIcon size={19} color={TEAL} strokeWidth={2.5} />}
        />
      ),
    },
    {
      key: "colors",
      title: "Colors",
      route: "/profile/colors",
      icon: (
        <IconBox
          accent={PURPLE}
          icon={<PaletteIcon size={19} color={PURPLE} strokeWidth={2.5} />}
        />
      ),
    },
    {
      key: "qr",
      title: "QR",
      route: "/profile/qr",
      icon: (
        <IconBox
          accent={BLUE}
          icon={<QrCodeIcon size={19} color={BLUE} strokeWidth={2.5} />}
        />
      ),
    },
  ];

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.orbTop} />
        <View style={styles.orbBottom} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeftIcon size={19} color={TEXT} strokeWidth={2.5} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}>
              <BotIcon size={18} color={TEAL} strokeWidth={2.5} />
            </View>

            <Text style={styles.headerTitle}>
              {aiMobileText(language, "action.profileAi.title")}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/ai" as never)}
            style={styles.headerButton}
          >
            <BotIcon size={19} color={TEXT} strokeWidth={2.5} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.statusCard}>
            <IconBox
              accent={GREEN}
              icon={<ShieldCheckIcon size={19} color={GREEN} strokeWidth={2.5} />}
            />

            <Text style={styles.statusText}>
              {aiMobileText(language, "chat.securityNotice")}
            </Text>
          </View>

          <Section title="Sabi AI" items={aiItems} />

          <Section title="Profile" items={profileItems} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  orbTop: {
    position: "absolute",
    top: -55,
    right: -55,
    width: 210,
    height: 210,
    borderRadius: 120,
    backgroundColor: "rgba(88,213,201,0.10)",
  },
  orbBottom: {
    position: "absolute",
    bottom: -80,
    left: -70,
    width: 230,
    height: 230,
    borderRadius: 130,
    backgroundColor: "rgba(99,168,255,0.08)",
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121,228,162,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: "rgba(88,213,201,0.12)",
    borderWidth: 1,
    borderColor: "rgba(88,213,201,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 16,
  },
  statusCard: {
    minHeight: 66,
    borderRadius: 23,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  section: {
    gap: 9,
  },
  sectionTitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 2,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: CARD_ALT,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  badge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,204,102,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,204,102,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "900",
  },
});
