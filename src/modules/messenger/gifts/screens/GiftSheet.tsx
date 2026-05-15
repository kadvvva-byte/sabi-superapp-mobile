import React, { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import { useMessengerGiftBridge } from "../chat/MessengerGiftBridge";
import { GiftBottomBar } from "../components/GiftBottomBar";
import { GiftCard } from "../components/GiftCard";
import {
  getGiftsByFilter,
  GiftCategoryFilter,
  GiftTierFilter,
} from "../domain/getGiftsByFilter";
import { GiftPlaybackOverlay } from "../playback/GiftPlaybackOverlay";
import { Gift } from "../types";
import { GiftCategoryTabs } from "../ui/GiftCategoryTabs";
import { GiftTierChips } from "../ui/GiftTierChips";

export default function GiftSheet() {
  const [selected, setSelected] = useState<Gift | null>(null);
  const [category, setCategory] = useState<GiftCategoryFilter>("all");
  const [tier, setTier] = useState<GiftTierFilter>("all");
  const [quantity, setQuantity] = useState<number>(1);

  const { sendGift } = useMessengerGiftBridge();

  const filteredGifts = useMemo(() => {
    return getGiftsByFilter({ category, tier });
  }, [category, tier]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B1020" }}>
      <GiftCategoryTabs value={category} onChange={setCategory} />
      <GiftTierChips value={tier} onChange={setTier} />

      <FlatList
        data={filteredGifts}
        numColumns={4}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10, paddingBottom: 170 }}
        renderItem={({ item }) => (
          <GiftCard
            gift={item}
            selected={selected?.id === item.id}
            onSelect={() => {
              setSelected(item);
              setQuantity(1);
            }}
          />
        )}
      />

      <GiftBottomBar
        gift={selected}
        quantity={quantity}
        onChangeQuantity={setQuantity}
        onSend={() => {
          if (!selected) return;

          sendGift({
            gift: selected,
            quantity,
            senderName: "You",
            receiverName: "User",
            isOwn: true,
          });
        }}
      />

      <GiftPlaybackOverlay />
    </View>
  );
}