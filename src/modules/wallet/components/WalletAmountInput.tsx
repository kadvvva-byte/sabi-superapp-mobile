import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  currency: string;
  placeholder?: string;
};

export function WalletAmountInput({
  value,
  onChangeText,
  currency,
  placeholder = "0",
}: Props) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^\d]/g, ""))}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.32)"
        keyboardType="number-pad"
        style={styles.input}
      />
      <Text style={styles.currency}>{currency}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 64,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    paddingVertical: 12,
  },
  currency: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
  },
});