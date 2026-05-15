import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Gift } from "../types";

type Props = {
  gift: Gift | null;
  quantity: number;
  onChangeQuantity: (value: number) => void;
  onSend: () => void;
};

const quantityOptions = [1, 5, 10, 20, 50, 100, 500, 999];

export function GiftBottomBar({
  gift,
  quantity,
  onChangeQuantity,
  onSend,
}: Props) {
  if (!gift) return null;

  const total = gift.price.diamonds * quantity;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.unitPrice}>{gift.price.diamonds} 💎</Text>
        <Text style={styles.totalPrice}>Итого: {total} 💎</Text>
      </View>

      <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quantityRow}
      >
        {quantityOptions.map((item) => {
          const selected = quantity === item;

          return (
            <Pressable
              key={item}
              onPress={() => onChangeQuantity(item)}
              style={[styles.qtyChip, selected && styles.qtyChipSelected]}
            >
              <Text
                style={[styles.qtyText, selected && styles.qtyTextSelected]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable style={styles.sendButton} onPress={onSend}>
        <Text style={styles.sendText}>Отправить</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0F1524",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  unitPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  totalPrice: {
    color: "#8FD3FF",
    fontSize: 16,
    fontWeight: "700",
  },
  quantityRow: {
    gap: 8,
    paddingBottom: 10,
  },
  qtyChip: {
    minWidth: 48,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#171F31",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyChipSelected: {
    backgroundColor: "#2A3752",
    borderColor: "#FFD76A",
  },
  qtyText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "700",
  },
  qtyTextSelected: {
    color: "#FFFFFF",
  },
  sendButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#3A7BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
