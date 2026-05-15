import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import {
  CreditCard,
  Images,
  MessageCircle,
  LayoutGrid,
  ChevronRight,
} from "lucide-react-native";

import Screen from "../../src/ui/Screen";
import Header from "../../src/ui/Header";
import Card from "../../src/ui/Card";
import { useSabiTheme } from "../../src/theme/ThemeProvider";

type ShortcutItem = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  accent: string;
  Icon: typeof CreditCard;
};

export default function DesktopHomeScreen() {
  const theme = useSabiTheme();

  const shortcuts: ShortcutItem[] = [
    {
      id: "wallet",
      title: "Wallet",
      subtitle: "Manage balances, cards and payments",
      route: "/wallet",
      accent: "#3B82F6",
      Icon: CreditCard,
    },
    {
      id: "gallery",
      title: "Gallery",
      subtitle: "Photos, albums and public selected photos",
      route: "/gallery",
      accent: "#A855F7",
      Icon: Images,
    },
    {
      id: "messenger",
      title: "Messenger",
      subtitle: "Open chats and communication",
      route: "/tabs/chats",
      accent: "#10B981",
      Icon: MessageCircle,
    },
    {
      id: "mini-apps",
      title: "Mini Apps",
      subtitle: "Open widgets and app shortcuts",
      route: "/mini-apps",
      accent: "#F59E0B",
      Icon: LayoutGrid,
    },
  ];

  const openRoute = (path: string) => {
    router.push(path as never);
  };

  return (
    <Screen>
      <Header showBrand subtitle="Desktop Home" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.balanceCard}>
          <Text
            style={[
              styles.balanceLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Total Balance
          </Text>

          <Text
            style={[
              styles.balanceValue,
              { color: theme.colors.text },
            ]}
          >
            $2,210.00
          </Text>

          <Text
            style={[
              styles.balanceHint,
              { color: theme.colors.textSecondary },
            ]}
          >
            Desktop quick access panel for the main Sabi modules
          </Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Access
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Fast launch for wallet, gallery, messenger and mini apps
          </Text>
        </View>

        <View style={styles.shortcutsGrid}>
          {shortcuts.map((item) => {
            const Icon = item.Icon;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={styles.shortcutCard}
                onPress={() => openRoute(item.route)}
              >
                <View style={styles.shortcutLeft}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: `${item.accent}22`, borderColor: `${item.accent}55` },
                    ]}
                  >
                    <Icon size={22} color={item.accent} />
                  </View>

                  <View style={styles.shortcutTextWrap}>
                    <Text style={styles.shortcutTitle}>{item.title}</Text>
                    <Text style={styles.shortcutSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>

                <View style={styles.arrowWrap}>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },

  balanceCard: {
    marginBottom: 20,
    borderRadius: 24,
    padding: 20,
  },

  balanceLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  balanceValue: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  balanceHint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  shortcutsGrid: {
    gap: 12,
  },

  shortcutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  shortcutLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  shortcutTextWrap: {
    flex: 1,
    paddingRight: 10,
  },

  shortcutTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  shortcutSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
  },

  arrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
});