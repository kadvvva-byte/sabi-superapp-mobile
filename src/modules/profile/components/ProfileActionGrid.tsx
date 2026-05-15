import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { renderAppIcon, type AppIconKey } from "../../shared/icon-pack/iconRegistry";

export type ProfileActionGridItem = {
  key: string;
  title: string;
  subtitle?: string;
  iconKey: AppIconKey;
  onPress?: () => void;
  badge?: string;
};

export type ProfileActionGridProps = {
  items: ProfileActionGridItem[];
  columns?: 2 | 3 | 4;
};

const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";

function ProfileActionGrid({ items, columns = 3 }: ProfileActionGridProps) {
  if (!items.length) return null;

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          disabled={!item.onPress}
          style={[styles.cell, { width: `${100 / columns}%` as const }]}
          onPress={item.onPress}
        >
          {({ pressed }) => (
            <LinearGradient
              colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
              style={[styles.actionCard, pressed && styles.pressed]}
            >
              <View style={styles.iconWrap}>
                {renderAppIcon(item.iconKey, { tone: "default", size: "md" })}
              </View>

              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>

              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              ) : null}

              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </LinearGradient>
          )}
        </Pressable>
      ))}
    </View>
  );
}

export default memo(ProfileActionGrid);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  cell: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  actionCard: {
    minHeight: 112,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },
  subtitle: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    minHeight: 24,
    minWidth: 24,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: TEXT,
    fontSize: 10,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
});
