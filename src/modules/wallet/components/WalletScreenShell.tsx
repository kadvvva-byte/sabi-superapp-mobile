import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WalletScreenShellProps = {
  children: React.ReactNode;
};

export default function WalletScreenShell({ children }: WalletScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? Math.max(insets.top, 0) : 0}
      >
        <View style={styles.content}>{children}</View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#060F19",
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#060F19",
  },
});