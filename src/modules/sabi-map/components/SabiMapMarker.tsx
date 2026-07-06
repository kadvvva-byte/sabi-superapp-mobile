import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MapPin } from "lucide-react-native";

import type { SabiMapMarker as SabiMapMarkerModel } from "../domain/sabiMap.types";

export default function SabiMapMarker({
  marker,
  selected,
  statusText,
  onPress,
}: {
  marker: SabiMapMarkerModel;
  selected: boolean;
  statusText: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.marker,
        {
          left: `${marker.x}%`,
          top: `${marker.y}%`,
        },
        selected ? styles.selectedMarker : null,
      ]}
    >
      <View style={[styles.pin, selected ? styles.selectedPin : null]}>
        <MapPin size={15} color={selected ? "#FFFFFF" : "#0F5132"} />
      </View>
      <View style={[styles.bubble, selected ? styles.selectedBubble : null]}>
        <Text style={[styles.title, selected ? styles.selectedText : null]} numberOfLines={1}>
          {marker.title}
        </Text>
        <Text style={[styles.meta, selected ? styles.selectedMeta : null]} numberOfLines={1}>
          {statusText}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: "absolute",
    minWidth: 118,
    transform: [{ translateX: -26 }, { translateY: -28 }],
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectedMarker: {
    zIndex: 20,
    elevation: 8,
  },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF7EF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  selectedPin: {
    backgroundColor: "#179B5C",
  },
  bubble: {
    maxWidth: 120,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "rgba(11, 94, 56, 0.13)",
  },
  selectedBubble: {
    backgroundColor: "#0F5132",
    borderColor: "rgba(255,255,255,0.35)",
  },
  title: {
    color: "#123225",
    fontSize: 11,
    fontWeight: "900",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  meta: {
    marginTop: 1,
    color: "#5A7164",
    fontSize: 9,
    fontWeight: "700",
  },
  selectedMeta: {
    color: "#BDF7D4",
  },
});
