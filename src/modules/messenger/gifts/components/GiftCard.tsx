import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";

import { Gift } from "../types";

type Props = {
  gift: Gift;
  selected: boolean;
  onSelect: () => void;
};

export function GiftCard({ gift, selected, onSelect }: Props) {
  return (
    <Pressable
      onPress={onSelect}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <Image
        source={{ uri: gift.assets.icon }}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.price}>{gift.price.diamonds} 💎</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 86,
    height: 112,
    margin: 6,
    borderRadius: 18,
    backgroundColor: "#141A28",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardSelected: {
    borderColor: "#FFD76A",
    backgroundColor: "#1A2234",
    transform: [{ scale: 1.03 }],
  },
  image: {
    width: 62,
    height: 62,
    marginBottom: 8,
  },
  price: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});