import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WalletScrollScreenProps = ScrollViewProps & {
  children: React.ReactNode;
  topInsetExtra?: number;
  bottomInsetExtra?: number;
};

export default function WalletScrollScreen({
  children,
  contentContainerStyle,
  style,
  topInsetExtra = 20,
  bottomInsetExtra = 10,
  keyboardShouldPersistTaps = "handled",
  showsVerticalScrollIndicator = false,
  ...rest
}: WalletScrollScreenProps) {
  const insets = useSafeAreaInsets();

  const topPadding = Math.max(insets.top + topInsetExtra, 44);
  const bottomPadding = Math.max(insets.bottom + bottomInsetExtra, 12);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        {...rest}
        style={[styles.scroll, style]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#060F19",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#060F19",
  },
  content: {
    flexGrow: 1,
    backgroundColor: "#060F19",
    paddingHorizontal: 20,
  },
});