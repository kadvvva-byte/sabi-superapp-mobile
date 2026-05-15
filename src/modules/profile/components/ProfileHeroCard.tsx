import React, { memo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BadgeCheck } from "lucide-react-native";

import ProfileAvatarFrame from "./ProfileAvatarFrame";
import { PROFILE_THEME_TOKENS } from "../config/profileThemeTokens";
import type { ProfileFrameThemeKey } from "../config/profileFrameThemes";

export type ProfileHeroStat = {
  label: string;
  value: string;
};

export type ProfileHeroAction = {
  key: string;
  title: string;
  icon: ReactNode;
  onPress?: () => void;
};

export type ProfileHeroCardProps = {
  name: string;
  username: string;
  bio?: string;
  avatarUri?: string | null;
  avatarLetter?: string;
  verified?: boolean;
  statusText?: string;
  frameThemeKey?: ProfileFrameThemeKey;
  stats?: ProfileHeroStat[];
  actions?: ProfileHeroAction[];
  style?: StyleProp<ViewStyle>;
};

function ProfileHeroCard({
  name,
  username,
  bio,
  avatarUri = null,
  avatarLetter,
  verified = false,
  statusText,
  frameThemeKey = "defaultGlow",
  stats = [],
  actions = [],
  style,
}: ProfileHeroCardProps) {
  const safeLetter =
    avatarLetter?.trim()?.slice(0, 1)?.toUpperCase() ||
    name?.trim()?.slice(0, 1)?.toUpperCase() ||
    "S";

  return (
    <LinearGradient
      colors={[
        PROFILE_THEME_TOKENS.heroStart,
        PROFILE_THEME_TOKENS.heroMid,
        PROFILE_THEME_TOKENS.heroEnd,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <View style={styles.accentOne} />
      <View style={styles.accentTwo} />

      <View style={styles.topRow}>
        <ProfileAvatarFrame
          size={92}
          imageUri={avatarUri}
          letter={safeLetter}
          themeKey={frameThemeKey}
          verified={verified}
          showThemeBadge={false}
        />

        {statusText ? (
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.name}>{name}</Text>
        {verified ? (
          <BadgeCheck size={18} color={PROFILE_THEME_TOKENS.success} strokeWidth={2.4} />
        ) : null}
      </View>

      <Text style={styles.username}>{username}</Text>
      {bio ? <Text style={styles.bio}>{bio}</Text> : null}

      {stats.length ? (
        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {actions.length ? (
        <View style={styles.actionsRow}>
          {actions.map((action) => (
            <Pressable
              key={action.key}
              disabled={!action.onPress}
              onPress={action.onPress}
              style={styles.actionButton}
            >
              <View style={styles.actionIcon}>{action.icon}</View>
              <Text style={styles.actionText}>{action.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

export default memo(ProfileHeroCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PROFILE_THEME_TOKENS.cardBorder,
  },
  accentOne: {
    position: "absolute",
    top: -26,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 160,
    backgroundColor: "rgba(99,168,255,0.14)",
  },
  accentTwo: {
    position: "absolute",
    left: -18,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 140,
    backgroundColor: "rgba(88,213,201,0.10)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  statusPill: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: PROFILE_THEME_TOKENS.white08,
    borderWidth: 1,
    borderColor: PROFILE_THEME_TOKENS.white10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: PROFILE_THEME_TOKENS.success,
  },
  statusText: {
    color: PROFILE_THEME_TOKENS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  nameRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    color: PROFILE_THEME_TOKENS.text,
    fontSize: 30,
    fontWeight: "900",
    flexShrink: 1,
  },
  username: {
    marginTop: 4,
    color: PROFILE_THEME_TOKENS.textSoft,
    fontSize: 15,
    fontWeight: "700",
  },
  bio: {
    marginTop: 10,
    color: PROFILE_THEME_TOKENS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  statsRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    minWidth: 96,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: PROFILE_THEME_TOKENS.white06,
    borderWidth: 1,
    borderColor: PROFILE_THEME_TOKENS.white08,
    gap: 6,
  },
  statLabel: {
    color: PROFILE_THEME_TOKENS.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    color: PROFILE_THEME_TOKENS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  actionsRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: PROFILE_THEME_TOKENS.white08,
    borderWidth: 1,
    borderColor: PROFILE_THEME_TOKENS.white10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: PROFILE_THEME_TOKENS.text,
    fontSize: 13,
    fontWeight: "800",
  },
});
