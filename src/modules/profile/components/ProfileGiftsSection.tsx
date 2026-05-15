import React, { memo, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useI18n } from "../../../shared/i18n";
import { renderAppIcon } from "../../shared/icon-pack/iconRegistry";

export type ProfileGiftsSectionItem = {
  key: string;
  title: string;
  count: string;
  subtitle?: string;
  onPress?: () => void;
};

export type ProfileGiftsSectionProps = {
  gifts: ProfileGiftsSectionItem[];
  totalLabel?: string;
  title?: string;
  subtitle?: string;
};

const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

function ProfileGiftsSection({
  gifts,
  totalLabel,
  title,
  subtitle,
}: ProfileGiftsSectionProps) {
  const i18n = useI18n() as I18nHookValue;

  const t = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      if (typeof i18n === "function") {
        const value = i18n(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      if (i18n && typeof i18n.t === "function") {
        const value = i18n.t(key, params);
        return typeof value === "string" && value.length ? value : key;
      }

      return key;
    },
    [i18n],
  );

  const resolvedTitle = title || t("profile.giftsSection.title");
  const resolvedSubtitle = subtitle || t("profile.giftsSection.subtitle");

  if (!gifts.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{resolvedTitle}</Text>
          <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
        </View>

        {totalLabel ? (
          <View style={styles.totalChip}>
            <Text style={styles.totalText}>{totalLabel}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {gifts.map((gift) => (
          <Pressable key={gift.key} disabled={!gift.onPress} onPress={gift.onPress}>
            {({ pressed }) => (
              <LinearGradient
                colors={[
                  "rgba(24, 60, 68, 0.94)",
                  "rgba(27, 34, 79, 0.94)",
                  "rgba(63, 31, 81, 0.92)",
                ]}
                style={[styles.card, pressed && styles.pressed]}
              >
                <View style={styles.iconWrap}>
                  {renderAppIcon("profile_gifts", {
                    color: "#FFD98D",
                    size: "md",
                  })}
                </View>

                <View style={styles.textWrap}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {gift.title}
                  </Text>

                  {gift.subtitle ? (
                    <Text style={styles.cardSubtitle} numberOfLines={2}>
                      {gift.subtitle}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.countChip}>
                  <Text style={styles.countText}>{gift.count}</Text>
                </View>
              </LinearGradient>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default memo(ProfileGiftsSection);

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    color: TEXT,
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    maxWidth: 280,
  },
  totalChip: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
  },
  totalText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "900",
  },
  row: {
    gap: 12,
    paddingRight: 8,
  },
  card: {
    width: 190,
    minHeight: 136,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    gap: 5,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: "rgba(245,251,255,0.82)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  countChip: {
    alignSelf: "flex-start",
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
});
