import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type ProfileStatsRowItem = {
  key: string;
  label: string;
  value: string;
};

export type ProfileStatsRowProps = {
  items: ProfileStatsRowItem[];
};

const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";

function ProfileStatsRow({ items }: ProfileStatsRowProps) {
  if (!items.length) return null;

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <LinearGradient
          key={item.key}
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"]}
          style={styles.card}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </LinearGradient>
      ))}
    </View>
  );
}

export default memo(ProfileStatsRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    flex: 1,
    minHeight: 74,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "space-between",
  },
  label: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
});
