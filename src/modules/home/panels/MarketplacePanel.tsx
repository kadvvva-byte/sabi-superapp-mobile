import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ShoppingBag,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAppearance } from "../../../theme/AppearanceProvider";

const CATEGORIES = [
  "For you",
  "Fashion",
  "Electronics",
  "Home",
  "Beauty",
  "Groceries",
];

const CARDS = [
  {
    title: "Daily Picks",
    subtitle:
      "Recommended items based on your recent activity and saved interests.",
    badge: "Curated",
  },
  {
    title: "Top Stores",
    subtitle:
      "Popular merchants and verified shops with fast delivery options.",
    badge: "Verified",
  },
  {
    title: "Deals & Flash",
    subtitle:
      "Limited offers, special bundles and time-sensitive promotions.",
    badge: "Hot",
  },
];

export default function MarketplacePanel({
  onBack,
}: {
  onBack?: () => void;
}) {
  const { themeMode, backgroundType } = useAppearance();

  const THEME_PRESETS = {
    brand: {
      accent: "#7CFF2B",
      border: "rgba(124,255,43,0.18)",
      text: "#F8FAFC",
      textSecondary: "#D7E4EE",
      surface: "rgba(255,255,255,0.08)",
      surfaceElevated: "rgba(255,255,255,0.10)",
      brandSoft: "rgba(124,255,43,0.12)",
      info: "#5DA3FF",
      infoSoft: "rgba(93,163,255,0.12)",
      screen:
        backgroundType === "Custom background"
          ? "rgba(8,12,18,0.05)"
          : "rgba(6,16,12,0.08)",
    },
    wallet: {
      accent: "#5DA3FF",
      border: "rgba(93,163,255,0.24)",
      text: "#F8FAFC",
      textSecondary: "#D8E8FF",
      surface: "rgba(255,255,255,0.08)",
      surfaceElevated: "rgba(255,255,255,0.10)",
      brandSoft: "rgba(93,163,255,0.12)",
      info: "#5DA3FF",
      infoSoft: "rgba(93,163,255,0.12)",
      screen:
        backgroundType === "Custom background"
          ? "rgba(8,12,18,0.05)"
          : "rgba(7,18,34,0.08)",
    },
    ai: {
      accent: "#A855F7",
      border: "rgba(168,85,247,0.24)",
      text: "#F8FAFC",
      textSecondary: "#E9DDFF",
      surface: "rgba(255,255,255,0.08)",
      surfaceElevated: "rgba(255,255,255,0.10)",
      brandSoft: "rgba(168,85,247,0.12)",
      info: "#7C6DFF",
      infoSoft: "rgba(124,109,255,0.12)",
      screen:
        backgroundType === "Custom background"
          ? "rgba(8,12,18,0.05)"
          : "rgba(20,12,34,0.08)",
    },
    messenger: {
      accent: "#10B981",
      border: "rgba(16,185,129,0.24)",
      text: "#F8FAFC",
      textSecondary: "#D6FFF1",
      surface: "rgba(255,255,255,0.08)",
      surfaceElevated: "rgba(255,255,255,0.10)",
      brandSoft: "rgba(16,185,129,0.12)",
      info: "#10B981",
      infoSoft: "rgba(16,185,129,0.12)",
      screen:
        backgroundType === "Custom background"
          ? "rgba(8,12,18,0.05)"
          : "rgba(6,24,20,0.08)",
    },
  } as const;

  const palette = THEME_PRESETS[themeMode] ?? THEME_PRESETS.brand;

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <View
        style={[
          styles.backgroundGlowTop,
          { backgroundColor: palette.accent + "22" },
        ]}
      />
      <View
        style={[
          styles.backgroundGlowBottom,
          { backgroundColor: palette.info + "18" },
        ]}
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (onBack) onBack();
            else router.back();
          }}
          style={[
            styles.iconButton,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <ArrowLeft size={18} color={palette.text} />
        </Pressable>

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <Search size={16} color={palette.textSecondary} />
          <Text style={[styles.searchText, { color: palette.textSecondary }]}>
            Search products, brands, stores
          </Text>
        </View>

        <Pressable
          style={[
            styles.iconButton,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <SlidersHorizontal size={18} color={palette.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: palette.surfaceElevated,
              borderColor: palette.border,
            },
          ]}
        >
          <View
            style={[
              styles.heroBadge,
              {
                backgroundColor: palette.brandSoft,
              },
            ]}
          >
            <ShoppingBag size={14} color={palette.accent} />
            <Text style={[styles.heroBadgeText, { color: palette.accent }]}>
              Marketplace
            </Text>
          </View>

          <Text style={[styles.heroTitle, { color: palette.text }]}>
            Discover and shop inside Sabi
          </Text>
          <Text style={[styles.heroSubtitle, { color: palette.textSecondary }]}>
            Explore stores, products and curated selections with a premium
            in-app shopping experience.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((category, index) => (
            <View
              key={category}
              style={[
                styles.categoryChip,
                {
                  marginRight: 8,
                  backgroundColor:
                    index === 0 ? palette.brandSoft : palette.surface,
                  borderColor:
                    index === 0 ? palette.accent : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: index === 0 ? palette.accent : palette.text,
                  },
                ]}
              >
                {category}
              </Text>
            </View>
          ))}
        </ScrollView>

        {CARDS.map((card) => (
          <View
            key={card.title}
            style={[
              styles.contentCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.contentBadge,
                {
                  backgroundColor: palette.infoSoft,
                },
              ]}
            >
              <Text style={[styles.contentBadgeText, { color: palette.info }]}>
                {card.badge}
              </Text>
            </View>

            <Text style={[styles.contentTitle, { color: palette.text }]}>
              {card.title}
            </Text>
            <Text
              style={[styles.contentSubtitle, { color: palette.textSecondary }]}
            >
              {card.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: -120,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchText: {
    fontSize: 13,
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 16,
    overflow: "hidden",
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoriesRow: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  categoryChip: {
    minHeight: 38,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: "center",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  contentCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 16,
    marginBottom: 12,
  },
  contentBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
    borderRadius: 999,
  },
  contentBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  contentSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});