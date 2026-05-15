import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { Gift } from "../types";
import { getGiftScaleForTier } from "./GiftPlaybackRules";

type Props = {
  gift: Gift;
};

export function GiftAnimatedPreview({ gift }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.86)).current;
  const floatY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const targetScale = getGiftScaleForTier(gift);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 12,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: targetScale,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(floatY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      loop.start();
    });

    return () => {
      loop.stop();
    };
  }, [floatY, gift, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ translateY: floatY }, { scale }],
          },
        ]}
      >
        <Image
          source={{ uri: gift.assets.icon }}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 220,
    height: 220,
    borderRadius: 28,
    backgroundColor: "rgba(15,18,26,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  image: {
    width: 168,
    height: 168,
  },
});