import React, { useCallback, useEffect, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import {
  canUseSystemOverlay,
  isOverlayFeatureSupported,
  openOverlayPermissionSettings,
} from "./overlayPermission";

type Props = {
  visible?: boolean;
  accent?: string;
  onPermissionKnown?: (allowed: boolean) => void;
};

const TEXT_MAIN = "#F6FFF9";
const TEXT_SECONDARY = "rgba(232,255,246,0.76)";
const TEXT_MUTED = "rgba(232,255,246,0.58)";

export default function OverlayPermissionCard({
  visible = true,
  accent = "#8EF2C8",
  onPermissionKnown,
}: Props) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  const refreshStatus = useCallback(async () => {
    if (!isOverlayFeatureSupported()) {
      setAllowed(false);
      setChecking(false);
      onPermissionKnown?.(false);
      return;
    }

    setChecking(true);
    const next = await canUseSystemOverlay();
    setAllowed(next);
    setChecking(false);
    onPermissionKnown?.(next);
  }, [onPermissionKnown]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === "active") {
        void refreshStatus();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      sub.remove();
    };
  }, [refreshStatus]);

  if (!visible) return null;
  if (!isOverlayFeatureSupported()) return null;
  if (allowed && !checking) return null;

  return (
    <LinearGradient
      colors={["rgba(16,34,31,0.96)", "rgba(10,22,20,0.92)"]}
      style={styles.card}
    >
      <View
        style={[
          styles.iconWrap,
          {
            borderColor: `${accent}33`,
            backgroundColor: `${accent}14`,
          },
        ]}
      >
        <Ionicons name="phone-portrait-outline" size={18} color={accent} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>System call window</Text>
        <Text style={styles.subtitle}>
          {checking
            ? "Checking overlay permission..."
            : "Allow floating call window to keep the audio call visible over other apps."}
        </Text>
      </View>

      <Pressable
        onPress={() => {
          void openOverlayPermissionSettings();
        }}
        style={styles.actionWrap}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={["rgba(118,205,182,0.98)", "rgba(56,101,89,0.92)"]}
            style={[styles.actionButton, pressed && styles.pressed]}
          >
            <Ionicons name="open-outline" size={15} color="#081B15" />
            <Text style={styles.actionText}>
              {checking ? "Wait" : "Allow"}
            </Text>
          </LinearGradient>
        )}
      </Pressable>

      {!checking ? (
        <View style={styles.noteRow}>
          <Ionicons
            name="information-circle-outline"
            size={13}
            color={TEXT_MUTED}
          />
          <Text style={styles.noteText}>
            Return to Sabi after granting permission.
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  textWrap: {
    minWidth: 0,
  },
  title: {
    color: TEXT_MAIN,
    fontSize: 15,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 5,
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  actionWrap: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 16,
    overflow: "hidden",
  },
  actionButton: {
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    marginLeft: 7,
    color: "#081B15",
    fontSize: 12,
    fontWeight: "900",
  },
  noteRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  noteText: {
    marginLeft: 6,
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});