import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { GiftPlaybackEntry } from "./GiftPlaybackEntry";
import { useMessengerGiftBridge } from "./MessengerGiftBridge";

export function MessengerGiftChatAdapter() {
  const { history } = useMessengerGiftBridge();

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <GiftPlaybackEntry
            gift={item.gift}
            quantity={item.quantity}
            totalDiamonds={item.totalDiamonds}
            isOwn={item.isOwn}
            senderName={item.senderName}
            receiverName={item.receiverName}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});