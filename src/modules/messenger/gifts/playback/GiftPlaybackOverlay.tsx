import React, { useEffect, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { GiftPlaybackItem } from "../types";
import { GiftAnimatedPreview } from "./GiftAnimatedPreview";
import * as GiftAudioPlayerModule from "./GiftAudioPlayer";
import { GiftPlaybackQueue } from "./GiftPlaybackQueue";
import {
  getGiftOverlayIntensity,
  getGiftPlaybackDurationMs,
} from "./GiftPlaybackRules";

type GiftAudioController = {
  play?: (gift: GiftPlaybackItem["gift"]) => void;
  stop?: () => void;
};

const GiftAudioPlayer: GiftAudioController =
  ((GiftAudioPlayerModule as unknown as { GiftAudioPlayer?: GiftAudioController })
    .GiftAudioPlayer ??
    (GiftAudioPlayerModule as unknown as { default?: GiftAudioController }).default ??
    (GiftAudioPlayerModule as unknown as GiftAudioController));

export function GiftPlaybackOverlay() {
  const [active, setActive] = useState<GiftPlaybackItem | null>(
    GiftPlaybackQueue.getActive()
  );
  const fade = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    return GiftPlaybackQueue.subscribe(setActive);
  }, []);

  useEffect(() => {
    if (!active) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    GiftAudioPlayer.play?.(active.gift);

    timeout = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        GiftAudioPlayer.stop?.();
        GiftPlaybackQueue.completeActive();
      });
    }, getGiftPlaybackDurationMs(active.gift));

    return () => {
      if (timeout) clearTimeout(timeout);
      GiftAudioPlayer.stop?.();
      fade.setValue(0);
    };
  }, [active, fade]);

  const glowStyle = useMemo(() => {
    if (!active) return styles.glowSoft;

    const intensity = getGiftOverlayIntensity(active.gift);
    if (intensity === "rich") return styles.glowRich;
    if (intensity === "medium") return styles.glowMedium;
    return styles.glowSoft;
  }, [active]);

  if (!active) return null;

  return (
    <Pressable
      style={styles.root}
      onPress={() => GiftPlaybackQueue.completeActive()}
    >
      <Animated.View style={[styles.backdrop, glowStyle, { opacity: fade }]}>
        <View style={styles.center}>
          <GiftAnimatedPreview gift={active.gift} />

          <Text style={styles.title}>{active.gift.name}</Text>

          {!!active.senderName && !!active.receiverName && (
            <Text style={styles.subtitle}>
              {active.senderName} → {active.receiverName}
            </Text>
          )}

          <Text style={styles.quantity}>× {active.quantity}</Text>
          <Text style={styles.price}>{active.totalDiamonds} 💎</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowSoft: {
    shadowColor: "#6ea8ff",
  },
  glowMedium: {
    shadowColor: "#9b7bff",
  },
  glowRich: {
    shadowColor: "#ffb347",
  },
  title: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
  },
  quantity: {
    marginTop: 10,
    color: "#FFD76A",
    fontSize: 18,
    fontWeight: "700",
  },
  price: {
    marginTop: 8,
    color: "#8FD3FF",
    fontSize: 20,
    fontWeight: "800",
  },
});