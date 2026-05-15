import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Gift } from "../types";

type Props = {
  gift: Gift;
  quantity: number;
  totalDiamonds: number;
  isOwn?: boolean;
  senderName?: string;
  onPress?: () => void;
};

export function GiftMessageBubble({
  gift,
  quantity,
  totalDiamonds,
  isOwn = false,
  senderName,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
      ]}
    >
      {!isOwn && !!senderName && (
        <Text style={styles.senderName} numberOfLines={1}>
          {senderName}
        </Text>
      )}

      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Image
          source={{ uri: gift.assets.icon }}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.metaRow}>
          <Text style={styles.giftName} numberOfLines={1}>
            {gift.name}
          </Text>
          <Text style={styles.totalPrice}>{totalDiamonds} 💎</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.quantity}>× {quantity}</Text>
          <Text style={styles.unitPrice}>{gift.price.diamonds} 💎 / шт</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "78%",
    marginVertical: 6,
  },
  containerOwn: {
    alignSelf: "flex-end",
  },
  containerOther: {
    alignSelf: "flex-start",
  },
  senderName: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 8,
  },
  bubble: {
    borderRadius: 18,
    padding: 10,
    minWidth: 160,
  },
  bubbleOwn: {
    backgroundColor: "#1B2437",
    borderTopRightRadius: 8,
  },
  bubbleOther: {
    backgroundColor: "#141A28",
    borderTopLeftRadius: 8,
  },
  image: {
    width: 112,
    height: 112,
    alignSelf: "center",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  giftName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  totalPrice: {
    color: "#8FD3FF",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantity: {
    color: "#FFD76A",
    fontSize: 13,
    fontWeight: "700",
  },
  unitPrice: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 12,
  },
});