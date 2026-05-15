import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AnimeTransformId, isAnimatedTransform } from "./animeTransforms";

type Props = {
  effectId: AnimeTransformId;
  visible: boolean;
};

function getBadgeText(effectId: AnimeTransformId) {
  if (effectId === "anime_hero") return "HERO MODE";
  if (effectId === "anime_manga") return "MANGA CUT";
  if (effectId === "anime_freeze") return "FREEZE SHOT";
  return "ANIME SNAP";
}

export function VideoTransformOverlay({ effectId, visible }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || !isAnimatedTransform(effectId)) {
      progress.stopAnimation();
      pulse.stopAnimation();
      flash.stopAnimation();
      shimmer.stopAnimation();
      progress.setValue(0);
      pulse.setValue(0);
      flash.setValue(0);
      shimmer.setValue(0);
      return;
    }

    const sweepLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 460,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const flashLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flash, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flash, {
          toValue: 0,
          duration: 760,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 40,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    sweepLoop.start();
    pulseLoop.start();
    flashLoop.start();
    shimmerLoop.start();

    return () => {
      sweepLoop.stop();
      pulseLoop.stop();
      flashLoop.stop();
      shimmerLoop.stop();
    };
  }, [effectId, visible, progress, pulse, flash, shimmer]);

  if (!visible || !isAnimatedTransform(effectId)) return null;

  const badgeText = getBadgeText(effectId);

  const scanTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 920],
  });

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.1],
  });

  const ringScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1.18],
  });

  const burstOpacity = progress.interpolate({
    inputRange: [0, 0.18, 0.6, 1],
    outputRange: [0.08, 0.34, 0.18, 0.08],
  });

  const badgeOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1],
  });

  const flashOpacity = flash.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0.06, 0.28, 0.08],
  });

  const mangaOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-42, 42],
  });

  const freezeScale = flash.interpolate({
    inputRange: [0, 1],
    outputRange: [1.04, 1],
  });

  const shimmerTranslateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 560],
  });

  const badgeLift = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const heroMode = effectId === "anime_hero";
  const mangaMode = effectId === "anime_manga";
  const freezeMode = effectId === "anime_freeze";
  const snapMode = effectId === "anime_snap";

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.scanline, { transform: [{ translateY: scanTranslateY }] }]}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            freezeMode ? "rgba(255,255,255,0.48)" : "rgba(255,255,255,0.38)",
            "rgba(255,255,255,0)",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View style={[styles.burstFrame, { opacity: burstOpacity }]}>
        <LinearGradient
          colors={
            heroMode
              ? ["rgba(255,226,128,0.18)", "rgba(122,175,255,0.08)"]
              : mangaMode
                ? ["rgba(255,255,255,0.16)", "rgba(0,0,0,0.04)"]
                : freezeMode
                  ? ["rgba(255,255,255,0.24)", "rgba(180,220,255,0.10)"]
                  : ["rgba(122,175,255,0.18)", "rgba(255,145,220,0.10)"]
          }
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.diagonalShine,
          {
            transform: [{ translateX: shimmerTranslateX }, { rotate: "-18deg" }],
            opacity: burstOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.28)", "rgba(255,255,255,0)"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {snapMode ? (
        <>
          <Animated.View
            style={[
              styles.snapRing,
              {
                opacity: burstOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.snapRingInner,
              {
                opacity: badgeOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
          <View style={[styles.cornerCut, styles.cornerTopLeft]} />
          <View style={[styles.cornerCut, styles.cornerTopRight]} />
          <View style={[styles.cornerCut, styles.cornerBottomLeft]} />
          <View style={[styles.cornerCut, styles.cornerBottomRight]} />
        </>
      ) : null}

      {heroMode ? (
        <>
          <Animated.View
            style={[
              styles.heroHalo,
              {
                opacity: burstOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <View style={[styles.heroRay, styles.heroRayA]} />
          <View style={[styles.heroRay, styles.heroRayB]} />
          <View style={[styles.heroRay, styles.heroRayC]} />
          <View style={[styles.heroRay, styles.heroRayD]} />
          <Animated.View style={[styles.heroFlare, { opacity: badgeOpacity, transform: [{ scale: pulseScale }] }]} />
        </>
      ) : null}

      {mangaMode ? (
        <>
          <Animated.View
            style={[
              styles.mangaBand,
              styles.mangaBandTop,
              { transform: [{ translateX: mangaOffset }] },
            ]}
          />
          <Animated.View
            style={[
              styles.mangaBand,
              styles.mangaBandBottom,
              { transform: [{ translateX: mangaOffset }] },
            ]}
          />
          <Animated.View
            style={[
              styles.mangaStreak,
              styles.mangaStreakLeft,
              { transform: [{ translateX: mangaOffset }, { rotate: "-16deg" }] },
            ]}
          />
          <Animated.View
            style={[
              styles.mangaStreak,
              styles.mangaStreakCenter,
              { transform: [{ translateX: mangaOffset }, { rotate: "-12deg" }] },
            ]}
          />
          <Animated.View
            style={[
              styles.mangaStreak,
              styles.mangaStreakRight,
              { transform: [{ translateX: mangaOffset }, { rotate: "-10deg" }] },
            ]}
          />
        </>
      ) : null}

      {freezeMode ? (
        <>
          <Animated.View
            style={[
              styles.freezeFlash,
              {
                opacity: flashOpacity,
                transform: [{ scale: freezeScale }],
              },
            ]}
          />
          <View style={[styles.freezeCorner, styles.freezeCornerTopLeft]} />
          <View style={[styles.freezeCorner, styles.freezeCornerTopRight]} />
          <View style={[styles.freezeCorner, styles.freezeCornerBottomLeft]} />
          <View style={[styles.freezeCorner, styles.freezeCornerBottomRight]} />
          <View style={styles.freezeGridVertical} />
          <View style={styles.freezeGridHorizontal} />
        </>
      ) : null}

      <Animated.View
        style={[
          styles.centerBadge,
          {
            opacity: badgeOpacity,
            transform: [{ scale: pulseScale }, { translateY: badgeLift }],
          },
        ]}
      >
        <Text style={styles.centerBadgeText}>{badgeText}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scanline: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.7,
  },
  burstFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 12,
    borderColor: "rgba(255,255,255,0.14)",
  },
  diagonalShine: {
    position: "absolute",
    top: -120,
    width: 120,
    height: "160%",
  },
  centerBadge: {
    position: "absolute",
    top: "48%",
    alignSelf: "center",
    minWidth: 138,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,18,16,0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  centerBadgeText: {
    color: "#F6FFF9",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  snapRing: {
    position: "absolute",
    left: "18%",
    top: "16%",
    width: "64%",
    height: "68%",
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.26)",
  },
  snapRingInner: {
    position: "absolute",
    left: "26%",
    top: "24%",
    width: "48%",
    height: "52%",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  cornerCut: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "rgba(255,255,255,0.28)",
  },
  cornerTopLeft: {
    left: 18,
    top: 18,
    borderLeftWidth: 3,
    borderTopWidth: 3,
  },
  cornerTopRight: {
    right: 18,
    top: 18,
    borderRightWidth: 3,
    borderTopWidth: 3,
  },
  cornerBottomLeft: {
    left: 18,
    bottom: 18,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
  },
  cornerBottomRight: {
    right: 18,
    bottom: 18,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  heroHalo: {
    position: "absolute",
    left: "14%",
    top: "12%",
    width: "72%",
    height: "76%",
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "rgba(255,232,168,0.34)",
  },
  heroRay: {
    position: "absolute",
    width: "88%",
    height: 2,
    left: "6%",
    backgroundColor: "rgba(255,236,153,0.18)",
  },
  heroRayA: {
    top: "26%",
    transform: [{ rotate: "-18deg" }],
  },
  heroRayB: {
    top: "36%",
    transform: [{ rotate: "-8deg" }],
  },
  heroRayC: {
    top: "58%",
    transform: [{ rotate: "8deg" }],
  },
  heroRayD: {
    top: "68%",
    transform: [{ rotate: "18deg" }],
  },
  heroFlare: {
    position: "absolute",
    top: "46%",
    left: "24%",
    width: "52%",
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,236,153,0.22)",
  },
  mangaBand: {
    position: "absolute",
    left: -40,
    right: -40,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  mangaBandTop: {
    top: "14%",
  },
  mangaBandBottom: {
    bottom: "14%",
  },
  mangaStreak: {
    position: "absolute",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
  },
  mangaStreakLeft: {
    top: "26%",
    left: "-10%",
    width: "64%",
  },
  mangaStreakCenter: {
    top: "42%",
    left: "-4%",
    width: "80%",
  },
  mangaStreakRight: {
    top: "58%",
    left: "8%",
    width: "76%",
  },
  freezeGridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  freezeGridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  freezeFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  freezeCorner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "rgba(255,255,255,0.34)",
  },
  freezeCornerTopLeft: {
    left: 14,
    top: 14,
    borderLeftWidth: 4,
    borderTopWidth: 4,
  },
  freezeCornerTopRight: {
    right: 14,
    top: 14,
    borderRightWidth: 4,
    borderTopWidth: 4,
  },
  freezeCornerBottomLeft: {
    left: 14,
    bottom: 14,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
  },
  freezeCornerBottomRight: {
    right: 14,
    bottom: 14,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
});
