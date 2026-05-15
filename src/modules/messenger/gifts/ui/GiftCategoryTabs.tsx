import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { giftFamilies } from "../data/giftFamilies";
import { GiftCategory } from "../types";
import { GiftCategoryFilter } from "../domain/getGiftsByFilter";

type Props = {
  value: GiftCategoryFilter;
  onChange: (value: GiftCategoryFilter) => void;
};

export function GiftCategoryTabs({ value, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {giftFamilies.map((item) => {
          const selected = value === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id as GiftCategoryFilter)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text
                style={[styles.tabText, selected && styles.tabTextSelected]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 10,
  },
  content: {
    paddingHorizontal: 10,
    gap: 8,
  },
  tab: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#151B29",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tabSelected: {
    backgroundColor: "#24324A",
    borderColor: "#8FD3FF",
  },
  tabText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextSelected: {
    color: "#FFFFFF",
  },
});
