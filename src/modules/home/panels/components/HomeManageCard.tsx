import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeManageCard({
  title,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.shadow}>
      <LinearGradient
        colors={["#203754", "#182E4A", "#122843"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.glow} />
        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 22,
    marginBottom: 12,
    shadowColor: "#010A16",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(180,215,255,0.12)",
  },
  glow: {
    position: "absolute",
    top: 0,
    left: 14,
    right: 14,
    height: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(220,235,255,0.80)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
});
