import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FloatingTile from "./FloatingTile";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

type Tile = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colors: [string, string];
  route?: Href;
};

export default function HomeTilesGrid() {
  const router = useRouter();

  const tiles: Tile[] = [
    {
      title: "Wallet",
      subtitle: "Balances, cards, transfers",
      icon: <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />,
      colors: ["#4F8CFF", "#1B2B52"],
      route: "/wallet",
    },
    {
      title: "Market",
      subtitle: "Shop and deals",
      icon: <Ionicons name="cart-outline" size={22} color="#FFFFFF" />,
      colors: ["#2ED3A8", "#153B34"],
    },
    {
      title: "Taxi",
      subtitle: "Fast city rides",
      icon: (
        <MaterialCommunityIcons name="taxi" size={22} color="#FFFFFF" />
      ),
      colors: ["#F5B400", "#3B2A00"],
    },
    {
      title: "AI",
      subtitle: "Smart assistant",
      icon: <Ionicons name="hardware-chip-outline" size={22} color="#FFFFFF" />,
      colors: ["#9B5CFF", "#291942"],
      route: "/ai",
    },
  ];

  function ColoredTile({
    item,
    style,
    compact,
  }: {
    item: Tile;
    style?: StyleProp<ViewStyle>;
    compact?: boolean;
  }) {
    return (
      <View style={style}>
        <LinearGradient
          colors={[
            `${item.colors[0]}33`,
            `${item.colors[0]}10`,
            "transparent",
          ]}
          start={{ x: 0.2, y: 0.15 }}
          end={{ x: 0.8, y: 0.9 }}
          style={styles.glow}
        />

        <FloatingTile
          title={item.title}
          subtitle={item.subtitle}
          compact={compact}
          icon={item.icon}
          onPress={() => {
            if (item.route) {
              router.push(item.route);
            }
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      <View style={styles.col}>
        <ColoredTile item={tiles[0]} style={styles.large} />
        <ColoredTile item={tiles[2]} style={styles.small} compact />
      </View>

      <View style={styles.col}>
        <ColoredTile item={tiles[1]} style={styles.small} compact />
        <ColoredTile item={tiles[3]} style={styles.large} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 14,
  },

  col: {
    flex: 1,
    gap: 14,
  },

  large: {
    minHeight: 190,
  },

  small: {
    minHeight: 128,
  },

  glow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 36,
    opacity: 0.8,
  },
});