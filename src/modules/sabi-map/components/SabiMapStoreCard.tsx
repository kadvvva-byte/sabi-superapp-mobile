import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Heart, Navigation, Store, Truck } from "lucide-react-native";

import { formatDeliveryWindow, formatDistanceKm } from "../application/sabiMap.service";
import type { SabiMapMarker } from "../domain/sabiMap.types";

export default function SabiMapStoreCard({
  marker,
  selected,
  typeLabel,
  statusLabel,
  openLabel,
  onPress,
}: {
  marker: SabiMapMarker;
  selected: boolean;
  typeLabel: string;
  statusLabel: string;
  openLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected ? styles.selectedCard : null]}>
      <View style={styles.iconBox}>
        <Store size={20} color="#0F5132" />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{marker.title}</Text>
          <View style={[styles.statusPill, selected ? styles.selectedStatus : null]}>
            <Text style={[styles.statusText, selected ? styles.selectedStatusText : null]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.typeText}>{typeLabel}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Navigation size={13} color="#607869" />
            <Text style={styles.metaText}>{formatDistanceKm(marker.distanceKm)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Truck size={13} color="#607869" />
            <Text style={styles.metaText}>{formatDeliveryWindow(marker.deliveryMinutes)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Heart size={13} color="#607869" />
            <Text style={styles.metaText}>{marker.rating?.toFixed(1) ?? "—"}</Text>
          </View>
        </View>
        <Text style={styles.openLabel} numberOfLines={1}>{openLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    minHeight: 128,
    borderRadius: 28,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "rgba(15, 81, 50, 0.11)",
    shadowColor: "#123225",
    shadowOpacity: 0.09,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  selectedCard: {
    borderColor: "#48B879",
    backgroundColor: "#F8FFF9",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    color: "#12251C",
    fontSize: 15,
    fontWeight: "900",
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EEF6EF",
  },
  selectedStatus: {
    backgroundColor: "#DDF7E7",
  },
  statusText: {
    color: "#0F5132",
    fontSize: 10,
    fontWeight: "900",
  },
  selectedStatusText: {
    color: "#086239",
  },
  typeText: {
    marginTop: 4,
    color: "#607869",
    fontSize: 12,
    fontWeight: "700",
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "#3D5548",
    fontSize: 11,
    fontWeight: "800",
  },
  openLabel: {
    marginTop: 10,
    color: "#7A8B80",
    fontSize: 11,
    fontWeight: "700",
  },
});
