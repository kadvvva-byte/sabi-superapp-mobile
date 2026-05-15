import React, { memo, useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Check, ChevronRight, Lock } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import type { PrivacyDetailConfig } from "../data/privacy";

const BG_TOP = "#05140D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const CARD = "rgba(16, 31, 48, 0.82)";
const CARD_SOFT = "rgba(26, 44, 64, 0.82)";
const CARD_BORDER = "rgba(120, 220, 160, 0.12)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const GREEN = "#77E28C";
const TEAL = "#58D5C9";
const BLUE = "#63A8FF";
const PURPLE = "#B588FF";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

export type PrivacyDetailScreenProps = {
  config: PrivacyDetailConfig;
};

function PrivacyDetailScreen({ config }: PrivacyDetailScreenProps) {
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

  const resolveText = useCallback(
    (value?: string | null, fallbackKey?: string) => {
      if (typeof value === "string" && value.trim().length) {
        const translated = t(value);
        return translated === value ? value : translated;
      }

      if (fallbackKey) {
        return t(fallbackKey);
      }

      return "";
    },
    [t],
  );

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.fixedButtonsRow} pointerEvents="box-none">
            <Pressable onPress={() => router.replace("/profile/privacy")} style={styles.headerIconButton}>
              <ChevronRight
                size={18}
                color={TEXT}
                strokeWidth={2.4}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>
                {resolveText(config.eyebrow, "profile.privacyDetailScreen.defaults.eyebrow")}
              </Text>
              <Text style={styles.title}>{resolveText(config.title)}</Text>
              {config.subtitle ? <Text style={styles.subtitle}>{resolveText(config.subtitle)}</Text> : null}
            </View>

            {config.preview ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{resolveText(config.preview.label)}</Text>
                <View style={styles.previewCard}>
                  <Text style={styles.previewForwarded}>{t("profile.privacyDetailScreen.preview.forwardedFrom")}</Text>
                  <Text style={styles.previewSender}>{resolveText(config.preview.sender)}</Text>
                  <Text style={styles.previewMessage}>{resolveText(config.preview.message)}</Text>
                  {config.preview.footer ? <Text style={styles.previewFooter}>{resolveText(config.preview.footer)}</Text> : null}
                </View>
              </View>
            ) : null}

            {config.topToggles?.length ? (
              <View style={styles.section}>
                <View style={styles.groupCard}>
                  {config.topToggles.map((item, index) => (
                    <ToggleRow
                      key={`${item.title}-${index}`}
                      title={resolveText(item.title)}
                      description={resolveText(item.description)}
                      value={item.value}
                      locked={item.locked}
                      lockedHelper={t("profile.privacyDetailScreen.lockedHelper")}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {config.groups.map((group) => (
              <View key={group.title} style={styles.section}>
                <Text style={styles.sectionLabel}>{resolveText(group.title)}</Text>
                <View style={styles.groupCard}>
                  {group.options.map((option, index) => {
                    const selected = option.key === group.selectedKey;
                    return (
                      <Pressable key={option.key} style={[styles.choiceRow, index > 0 && styles.choiceDivider]}>
                        <View style={styles.choiceTextWrap}>
                          <Text style={styles.choiceTitle}>{resolveText(option.label)}</Text>
                          {group.description ? (
                            <Text style={styles.choiceDescription}>{resolveText(group.description)}</Text>
                          ) : null}
                        </View>

                        <View style={[styles.choiceIndicator, selected && styles.choiceIndicatorSelected]}>
                          {selected ? <Check size={14} color={GREEN} strokeWidth={2.6} /> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            {config.exceptions?.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{t("profile.privacyDetailScreen.exceptions.title")}</Text>
                <View style={styles.groupCard}>
                  {config.exceptions.map((item, index) => (
                    <Pressable key={`${item.title}-${index}`} style={[styles.routeRow, index > 0 && styles.choiceDivider]}>
                      <View style={styles.routeTextWrap}>
                        <Text style={styles.routeTitle}>{resolveText(item.title)}</Text>
                        <Text style={styles.routeValue}>{resolveText(item.value)}</Text>
                        <Text style={styles.routeDescription}>{resolveText(item.description)}</Text>
                      </View>
                      <ChevronRight size={18} color={MUTED} strokeWidth={2.4} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {config.toggleSectionTitle || config.toggles?.length ? (
              <View style={styles.section}>
                {config.toggleSectionTitle ? (
                  <Text style={styles.sectionLabel}>{resolveText(config.toggleSectionTitle)}</Text>
                ) : null}
                {config.toggles?.length ? (
                  <View style={styles.groupCard}>
                    {config.toggles.map((item, index) => (
                      <ToggleRow
                        key={`${item.title}-${index}`}
                        title={resolveText(item.title)}
                        description={resolveText(item.description)}
                        value={item.value}
                        locked={item.locked}
                        lockedHelper={t("profile.privacyDetailScreen.lockedHelper")}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {config.note ? (
              <View style={styles.noteCard}>
                <View style={styles.noteIconWrap}>
                  <Lock size={16} color={TEAL} strokeWidth={2.4} />
                </View>
                <View style={styles.noteTextWrap}>
                  <Text style={styles.noteTitle}>{t("profile.privacyDetailScreen.notes.title")}</Text>
                  <Text style={styles.noteText}>{resolveText(config.note)}</Text>
                </View>
              </View>
            ) : null}

            {config.premiumNote ? (
              <LinearGradient
                colors={["rgba(99,168,255,0.20)", "rgba(181,136,255,0.18)"]}
                style={styles.premiumCard}
              >
                <Text style={styles.premiumEyebrow}>{t("profile.privacyDetailScreen.premium.eyebrow")}</Text>
                <Text style={styles.premiumText}>{resolveText(config.premiumNote)}</Text>
                {config.premiumCtaText ? (
                  <Pressable style={styles.premiumButton}>
                    <Text style={styles.premiumButtonText}>{resolveText(config.premiumCtaText)}</Text>
                  </Pressable>
                ) : null}
              </LinearGradient>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ToggleRow({
  title,
  description,
  value,
  locked,
  lockedHelper,
}: {
  title: string;
  description: string;
  value: boolean;
  locked?: boolean;
  lockedHelper?: string;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <View style={styles.toggleTitleRow}>
          <Text style={styles.toggleTitle}>{title}</Text>
          {locked ? (
            <View style={styles.lockChip}>
              <Lock size={12} color={PURPLE} strokeWidth={2.4} />
            </View>
          ) : null}
        </View>
        <Text style={styles.toggleDescription}>{description}</Text>
        {locked && lockedHelper ? <Text style={styles.lockedHelper}>{lockedHelper}</Text> : null}
      </View>

      <Switch
        value={value}
        disabled={locked}
        thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
        trackColor={{ false: "rgba(255,255,255,0.22)", true: BLUE }}
      />
    </View>
  );
}

export default memo(PrivacyDetailScreen);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backgroundOrbTop: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(88,213,201,0.08)",
  },
  backgroundOrbBottom: {
    position: "absolute",
    left: -60,
    bottom: -100,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(99,168,255,0.08)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fixedButtonsRow: {
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  scrollContent: {
    paddingBottom: 42,
    gap: 18,
  },
  introBlock: {
    gap: 8,
    paddingTop: 6,
  },
  eyebrow: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  title: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  previewCard: {
    backgroundColor: CARD_SOFT,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 24,
    padding: 16,
    gap: 8,
  },
  previewForwarded: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  previewSender: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },
  previewMessage: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  previewFooter: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  groupCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 24,
    overflow: "hidden",
  },
  toggleRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 5,
  },
  toggleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  toggleDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  lockChip: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(181,136,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedHelper: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: "700",
  },
  choiceRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  choiceDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  choiceTextWrap: {
    flex: 1,
    gap: 4,
  },
  choiceTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  choiceDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  choiceIndicator: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceIndicatorSelected: {
    borderColor: GREEN,
    backgroundColor: "rgba(119,226,140,0.08)",
  },
  routeRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  routeTextWrap: {
    flex: 1,
    gap: 4,
  },
  routeTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  routeValue: {
    color: BLUE,
    fontSize: 12,
    fontWeight: "800",
  },
  routeDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  noteCard: {
    backgroundColor: CARD_SOFT,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  noteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "rgba(88,213,201,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  noteTextWrap: {
    flex: 1,
    gap: 5,
  },
  noteTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },
  noteText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  premiumCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(99,168,255,0.24)",
    gap: 10,
  },
  premiumEyebrow: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  premiumText: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  premiumButton: {
    alignSelf: "flex-start",
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(99,168,255,0.18)",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(99,168,255,0.30)",
  },
  premiumButtonText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "900",
  },
});
