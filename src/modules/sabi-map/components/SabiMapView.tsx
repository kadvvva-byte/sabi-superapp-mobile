import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { SabiMapMarker } from "../domain/sabiMap.types";
import { getSabiMapText } from "../presentation/sabiMap.i18n";
import SabiMapMarkerView from "./SabiMapMarker";

function statusLabel(status: SabiMapMarker["status"], text: ReturnType<typeof getSabiMapText>): string {
  if (status === "open") return text.statusOpen;
  if (status === "closing_soon") return text.statusClosingSoon;
  if (status === "closed") return text.statusClosed;
  return text.statusPending;
}

export default function SabiMapView({
  language,
  markers,
  selectedMarkerId,
  onSelectMarker,
}: {
  language: string;
  markers: SabiMapMarker[];
  selectedMarkerId?: string;
  onSelectMarker: (markerId: string) => void;
}) {
  const text = getSabiMapText(language);

  return (
    <View style={styles.card}>
      <View style={styles.mapHeader}>
        <View>
          <Text style={styles.mapTitle}>{text.mapReady}</Text>
          <Text style={styles.mapSubtitle}>{text.sabiStoresOnly}</Text>
        </View>
        <View style={styles.providerPill}>
          <Text style={styles.providerText}>Sabi</Text>
        </View>
      </View>

      <View style={styles.mapCanvas}>
        <View style={[styles.road, styles.roadA]} />
        <View style={[styles.road, styles.roadB]} />
        <View style={[styles.road, styles.roadC]} />
        <View style={styles.waterShape} />
        <View style={styles.parkShape} />

        {markers.map((marker) => (
          <SabiMapMarkerView
            key={marker.id}
            marker={marker}
            selected={marker.id === selectedMarkerId}
            statusText={statusLabel(marker.status, text)}
            onPress={() => onSelectMarker(marker.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#F7FAF2",
    borderWidth: 1,
    borderColor: "rgba(28, 108, 67, 0.12)",
    shadowColor: "#123225",
    shadowOpacity: 0.13,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  mapHeader: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.78)",
  },
  mapTitle: {
    color: "#0F5132",
    fontSize: 16,
    fontWeight: "900",
  },
  mapSubtitle: {
    marginTop: 2,
    color: "#607869",
    fontSize: 11,
    fontWeight: "700",
  },
  providerPill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E5F6EB",
  },
  providerText: {
    color: "#0F5132",
    fontSize: 12,
    fontWeight: "900",
  },
  mapCanvas: {
    height: 330,
    backgroundColor: "#EAF1E5",
    overflow: "hidden",
  },
  road: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
  },
  roadA: {
    left: -40,
    top: 112,
    width: "125%",
    height: 28,
    transform: [{ rotate: "-10deg" }],
  },
  roadB: {
    left: 74,
    top: -45,
    width: 30,
    height: 430,
    transform: [{ rotate: "19deg" }],
  },
  roadC: {
    right: -50,
    bottom: 68,
    width: "96%",
    height: 24,
    transform: [{ rotate: "15deg" }],
  },
  waterShape: {
    position: "absolute",
    left: -18,
    bottom: -40,
    width: 160,
    height: 120,
    borderRadius: 80,
    backgroundColor: "rgba(169, 218, 220, 0.5)",
  },
  parkShape: {
    position: "absolute",
    right: -30,
    top: 28,
    width: 160,
    height: 130,
    borderRadius: 80,
    backgroundColor: "rgba(189, 229, 194, 0.55)",
  },
});
