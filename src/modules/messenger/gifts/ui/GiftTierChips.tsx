import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GiftTier } from "../types";
import { GiftTierFilter } from "../domain/getGiftsByFilter";

type Props = {
  value: GiftTierFilter;
  onChange: (value: GiftTierFilter) => void;
};

const tiers: { id: GiftTierFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "t1", label: "T1" },
  { id: "t2", label: "T2" },
  { id: "t3", label: "T3" },
  { id: "t4", label: "T4" },
  { id: "t5", label: "T5" },
];

export function GiftTierChips({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {tiers.map((item) => {
        const selected = value === item.id;

        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text
              style={[styles.chipText, selected && styles.chipTextSelected]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  chip: {
    minWidth: 46,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#151B29",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipSelected: {
    backgroundColor: "#2E2248",
    borderColor: "#C7A6FF",
  },
  chipText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
});