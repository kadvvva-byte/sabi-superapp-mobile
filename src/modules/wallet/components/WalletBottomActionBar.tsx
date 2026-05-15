import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WalletBottomActionBarProps = {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryDisabled?: boolean;
  compact?: boolean;
};

export default function WalletBottomActionBar({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled = false,
  secondaryLabel,
  onSecondaryPress,
  secondaryDisabled = false,
  compact = false,
}: WalletBottomActionBarProps) {
  const insets = useSafeAreaInsets();
  const showSecondary = Boolean(secondaryLabel && onSecondaryPress);

  return (
    <View
      style={[
        styles.outer,
        compact ? styles.outerCompact : styles.outerRegular,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.inner}>
        {showSecondary ? (
          <Pressable
            onPress={onSecondaryPress}
            disabled={secondaryDisabled}
            style={[
              styles.secondaryButton,
              compact && styles.buttonCompact,
              secondaryDisabled && styles.disabledButton,
            ]}
          >
            <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onPrimaryPress}
          disabled={primaryDisabled}
          style={[
            styles.primaryButton,
            showSecondary ? styles.primaryButtonWithSecondary : styles.primaryButtonFull,
            compact && styles.buttonCompact,
            primaryDisabled && styles.disabledButton,
          ]}
        >
          <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "#060F19",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 16,
  },
  outerRegular: {
    paddingTop: 8,
  },
  outerCompact: {
    paddingTop: 6,
  },
  inner: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
    borderWidth: 1,
    borderColor: "#4F88FF",
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonWithSecondary: {
    flex: 1,
  },
  primaryButtonText: {
    color: "#EAF1FF",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 52,
    minWidth: 120,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E1D33",
    borderWidth: 1,
    borderColor: "rgba(95,142,255,0.24)",
  },
  secondaryButtonText: {
    color: "#DCE7FF",
    fontSize: 14,
    fontWeight: "800",
  },
  buttonCompact: {
    minHeight: 50,
    borderRadius: 16,
  },
  disabledButton: {
    opacity: 0.55,
  },
});