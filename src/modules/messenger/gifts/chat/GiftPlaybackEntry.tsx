import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { Gift } from "../types";
import { GiftPlaybackQueue } from "../playback/GiftPlaybackQueue";
import { GiftMessageBubble } from "./GiftMessageBubble";

type Props = {
  gift: Gift;
  quantity: number;
  totalDiamonds: number;
  isOwn?: boolean;
  senderName?: string;
  receiverName?: string;
};

export function GiftPlaybackEntry({
  gift,
  quantity,
  totalDiamonds,
  isOwn = false,
  senderName,
  receiverName,
}: Props) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        GiftPlaybackQueue.enqueue({
          id: `${gift.id}_${Date.now()}`,
          gift,
          quantity,
          totalDiamonds,
          senderName,
          receiverName,
          createdAt: Date.now(),
        });
      }}
    >
      <GiftMessageBubble
        gift={gift}
        quantity={quantity}
        totalDiamonds={totalDiamonds}
        isOwn={isOwn}
        senderName={senderName}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
  },
});