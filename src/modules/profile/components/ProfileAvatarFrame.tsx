import React, { memo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BadgeCheck } from "lucide-react-native";

import {
  getProfileFrameTheme,
  type ProfileFrameThemeKey,
} from "../config/profileFrameThemes";
import { PROFILE_THEME_TOKENS } from "../config/profileThemeTokens";

export type ProfileAvatarFrameProps = {
  size?: number;
  imageUri?: string | null;
  letter?: string;
  themeKey?: ProfileFrameThemeKey;
  verified?: boolean;
  showThemeBadge?: boolean;
  badgeLabel?: string;
  style?: StyleProp<ViewStyle>;
};

function ProfileAvatarFrame({
  size = 92,
  imageUri = null,
  letter = "S",
  themeKey = "defaultGlow",
  verified = false,
  showThemeBadge = false,
  badgeLabel,
  style,
}: ProfileAvatarFrameProps) {
  const theme = getProfileFrameTheme(themeKey);

  const ringSize = Math.max(40, size);
  const innerSize = Math.max(34, ringSize - 10);
  const badgeSize = Math.max(20, Math.floor(ringSize * 0.24));
  const themeBadgeMinWidth = Math.max(48, Math.floor(ringSize * 0.72));
  const safeLetter = String(letter ?? "")
    .trim()
    .slice(0, 1)
    .toUpperCase() || "S";

  return (
    <View
      style={[
        styles.host,
        {
          width: ringSize,
          height: ringSize,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={theme.ringColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            shadowColor: theme.glowColor,
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.image,
                {
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                },
              ] as StyleProp<ImageStyle>}
            />
          ) : (
            <View
              style={[
                styles.placeholder,
                {
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.placeholderText,
                  {
                    fontSize: Math.max(20, Math.floor(ringSize * 0.36)),
                  },
                ]}
              >
                {safeLetter}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {verified ? (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <BadgeCheck
            size={Math.max(12, Math.floor(badgeSize * 0.58))}
            color={PROFILE_THEME_TOKENS.success}
            strokeWidth={2.4}
          />
        </View>
      ) : null}

      {showThemeBadge ? (
        <LinearGradient
          colors={theme.badgeColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.themeBadge,
            {
              minWidth: themeBadgeMinWidth,
            },
          ]}
        >
          <Text style={styles.themeBadgeText}>{badgeLabel || theme.label}</Text>
        </LinearGradient>
      ) : null}
    </View>
  );
}

export default memo(ProfileAvatarFrame);

const styles = StyleSheet.create({
  host: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  inner: {
    backgroundColor: PROFILE_THEME_TOKENS.avatarInner,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  placeholder: {
    backgroundColor: PROFILE_THEME_TOKENS.avatarBase,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: PROFILE_THEME_TOKENS.avatarFallbackText,
    fontWeight: "900",
  },
  verifiedBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    backgroundColor: "rgba(7, 21, 28, 0.96)",
    borderWidth: 1,
    borderColor: PROFILE_THEME_TOKENS.white14,
    alignItems: "center",
    justifyContent: "center",
  },
  themeBadge: {
    position: "absolute",
    bottom: -14,
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: PROFILE_THEME_TOKENS.white10,
  },
  themeBadgeText: {
    color: PROFILE_THEME_TOKENS.text,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
