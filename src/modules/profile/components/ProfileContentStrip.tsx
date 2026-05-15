import React, { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { renderAppIcon, type AppIconKey } from "../../shared/icon-pack/iconRegistry";

export type ProfileContentStripItem = {
  key: string;
  title: string;
  subtitle?: string;
  meta?: string;
  iconKey: AppIconKey;
  accentColors?: [string, string];
  onPress?: () => void;
};

export type ProfileContentStripProps = {
  title: string;
  subtitle?: string;
  items: ProfileContentStripItem[];
};

const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";

function ProfileContentStrip({ title, subtitle, items }: ProfileContentStripProps) {
  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => (
          <Pressable key={item.key} disabled={!item.onPress} onPress={item.onPress}>
            {({ pressed }) => (
              <LinearGradient
                colors={item.accentColors ?? ["rgba(90,74,201,0.90)", "rgba(47,30,114,0.90)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, pressed && styles.pressed]}
              >
                <View style={styles.topRow}>
                  <View style={styles.iconWrap}>
                    {renderAppIcon(item.iconKey, { color: "#FFFFFF", size: "sm" })}
                  </View>
                  {item.meta ? (
                    <View style={styles.metaChip}>
                      <Text style={styles.metaText}>{item.meta}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                {item.subtitle ? (
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </LinearGradient>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default memo(ProfileContentStrip);

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  header: {
    gap: 4,
  },
  title: {
    color: TEXT,
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    gap: 12,
    paddingRight: 8,
  },
  card: {
    width: 188,
    minHeight: 152,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  metaChip: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
  },
  metaText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: "rgba(245,251,255,0.88)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
});
