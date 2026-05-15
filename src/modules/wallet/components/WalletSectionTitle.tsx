import React from "react";
import { StyleSheet, Text, View } from "react-native";

type WalletSectionTitleProps = {
  title: string;
  hint?: string;
};

export default function WalletSectionTitle({
  title,
  hint,
}: WalletSectionTitleProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 26,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  hint: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 3,
    color: "#B8C5D8",
  },
});