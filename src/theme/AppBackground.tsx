import React, { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppearance, AppThemeMode } from "./AppearanceProvider";

const THEME_BACKGROUNDS: Record<
  AppThemeMode,
  {
    gradient: [string, string, string];
    imageOverlay: [string, string, string];
    fallback: string;
  }
> = {
  brand: {
    gradient: ["#02111F", "#0A2540", "#16A34A"],
    imageOverlay: [
      "rgba(2,17,31,0.24)",
      "rgba(10,37,64,0.18)",
      "rgba(22,163,74,0.10)",
    ],
    fallback: "#071B2D",
  },
  wallet: {
    gradient: ["#0B1020", "#1D4ED8", "#60A5FA"],
    imageOverlay: [
      "rgba(11,16,32,0.26)",
      "rgba(29,78,216,0.16)",
      "rgba(96,165,250,0.08)",
    ],
    fallback: "#0F1C3A",
  },
  ai: {
    gradient: ["#140A1F", "#6D28D9", "#C084FC"],
    imageOverlay: [
      "rgba(20,10,31,0.28)",
      "rgba(109,40,217,0.16)",
      "rgba(192,132,252,0.08)",
    ],
    fallback: "#1A102B",
  },
  messenger: {
    gradient: ["#071A16", "#0F766E", "#34D399"],
    imageOverlay: [
      "rgba(7,26,22,0.26)",
      "rgba(15,118,110,0.16)",
      "rgba(52,211,153,0.08)",
    ],
    fallback: "#0B221D",
  },
};

export default function AppBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const { themeMode, imageBackground } = useAppearance();
  const palette = THEME_BACKGROUNDS[themeMode] ?? THEME_BACKGROUNDS.brand;
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [imageBackground]);

  const gradientColors = useMemo<[string, string, string]>(() => {
    return imageBackground && !imageLoadFailed ? palette.imageOverlay : palette.gradient;
  }, [imageBackground, imageLoadFailed, palette.gradient, palette.imageOverlay]);

  return (
    <View style={[styles.container, { backgroundColor: palette.fallback }]}> 
      <View pointerEvents="none" style={styles.backgroundLayer}>
        {imageBackground && !imageLoadFailed ? (
          <Image
            source={{ uri: imageBackground }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageLoadFailed(true)}
          />
        ) : null}

        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundLayer}
          pointerEvents="none"
        />
      </View>

      <View style={styles.contentLayer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  contentLayer: {
    flex: 1,
  },
});
