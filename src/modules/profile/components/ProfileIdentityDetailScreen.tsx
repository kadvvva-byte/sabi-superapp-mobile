import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Check, Palette } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";
import { profileKernelFacade } from "../../../core/kernel/profile";

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
const GOLD = "#FFCC66";

type ScreenMode = "phone" | "username" | "birthday" | "colors" | "channel";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

function splitBirthDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { day: "12", month: "06", year: "1998" };
  }

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()),
  };
}

export default function ProfileIdentityDetailScreen({
  mode,
}: {
  mode: ScreenMode;
}) {
  const i18n = useI18n() as I18nHookValue;
  const { account } = useProfileKernel();

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

  const config = useMemo(() => {
    switch (mode) {
      case "phone":
        return {
          eyebrow: t("profile.identityDetail.modes.phone.eyebrow"),
          title: t("profile.identityDetail.modes.phone.title"),
          subtitle: t("profile.identityDetail.modes.phone.subtitle"),
        };

      case "username":
        return {
          eyebrow: t("profile.identityDetail.modes.username.eyebrow"),
          title: t("profile.identityDetail.modes.username.title"),
          subtitle: t("profile.identityDetail.modes.username.subtitle"),
        };

      case "birthday":
        return {
          eyebrow: t("profile.identityDetail.modes.birthday.eyebrow"),
          title: t("profile.identityDetail.modes.birthday.title"),
          subtitle: t("profile.identityDetail.modes.birthday.subtitle"),
        };

      case "colors":
        return {
          eyebrow: t("profile.identityDetail.modes.colors.eyebrow"),
          title: t("profile.identityDetail.modes.colors.title"),
          subtitle: t("profile.identityDetail.modes.colors.subtitle"),
        };

      case "channel":
      default:
        return {
          eyebrow: t("profile.identityDetail.modes.channel.eyebrow"),
          title: t("profile.identityDetail.modes.channel.title"),
          subtitle: t("profile.identityDetail.modes.channel.subtitle"),
        };
    }
  }, [mode, t]);

  const colorPresets = useMemo(
    () => [
      {
        key: "emerald",
        label: t("profile.identityDetail.colors.presets.emerald"),
        color: GREEN,
      },
      {
        key: "teal",
        label: t("profile.identityDetail.colors.presets.teal"),
        color: TEAL,
      },
      {
        key: "blue",
        label: t("profile.identityDetail.colors.presets.blue"),
        color: BLUE,
      },
      {
        key: "purple",
        label: t("profile.identityDetail.colors.presets.purple"),
        color: PURPLE,
      },
      {
        key: "gold",
        label: t("profile.identityDetail.colors.presets.gold"),
        color: GOLD,
      },
    ],
    [t],
  );

  const accountUsername = String(account.username || "").replace(/^@/, "");
  const accountBirthday = String(account.birthday || "");
  const [phone, setPhone] = useState(String(account.phone || ""));
  const [username, setUsername] = useState(accountUsername);
  const [channel, setChannel] = useState("");
  const [selectedColor, setSelectedColor] = useState("blue");

  const initialBirth = useMemo(() => splitBirthDate(accountBirthday), [accountBirthday]);
  const [birthDay, setBirthDay] = useState(initialBirth.day);
  const [birthMonth, setBirthMonth] = useState(initialBirth.month);
  const [birthYear, setBirthYear] = useState(initialBirth.year);

  React.useEffect(() => {
    setPhone(String(account.phone || ""));
    setUsername(String(account.username || "").replace(/^@/, ""));
    const nextBirth = splitBirthDate(String(account.birthday || ""));
    setBirthDay(nextBirth.day);
    setBirthMonth(nextBirth.month);
    setBirthYear(nextBirth.year);
  }, [account.phone, account.username, account.birthday]);

  const done = useCallback(async () => {
    if (mode === "phone") {
      await profileKernelFacade.updateProfile({ phone });
      await profileKernelFacade.updateDraft({ phone });
    } else if (mode === "username") {
      const normalizedUsername = String(username || "").trim().replace(/^@+/, "");
      await profileKernelFacade.updateProfile({ username: normalizedUsername });
      await profileKernelFacade.updateDraft({ username: normalizedUsername });
      await profileKernelFacade.updatePublicProfile({ publicUsername: normalizedUsername });
    } else if (mode === "birthday") {
      const yyyy = String(birthYear || "").trim();
      const mm = String(birthMonth || "").padStart(2, "0");
      const dd = String(birthDay || "").padStart(2, "0");
      const isoBirthday = /^\d{4}$/.test(yyyy) ? `${yyyy}-${mm}-${dd}` : "";
      await profileKernelFacade.updateProfile({ birthday: isoBirthday });
    }
    router.back();
  }, [birthDay, birthMonth, birthYear, mode, phone, username]);

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <View style={styles.fixedButtonsRow}>
            <Pressable onPress={() => router.back()} style={styles.topButton}>
              <Text style={styles.topButtonText}>{t("common.back")}</Text>
            </Pressable>

            <Pressable onPress={done} style={styles.topButton}>
              <Text style={styles.topButtonText}>{t("common.done")}</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>{config.eyebrow}</Text>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.subtitle}>{config.subtitle}</Text>
            </View>

            {mode === "phone" ? (
              <>
                <FieldCard
                  label={t("profile.identityDetail.phone.fieldLabel")}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t("profile.identityDetail.phone.placeholder")}
                />

                <View style={styles.noteCard}>
                  <Text style={styles.noteTitle}>
                    {t("profile.identityDetail.phone.noteTitle")}
                  </Text>
                  <Text style={styles.noteText}>
                    {t("profile.identityDetail.phone.noteText")}
                  </Text>
                </View>
              </>
            ) : null}

            {mode === "username" ? (
              <>
                <FieldCard
                  label={t("profile.identityDetail.username.fieldLabel")}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t("profile.identityDetail.username.placeholder")}
                  prefix="@"
                />

                <View style={styles.noteCard}>
                  <Text style={styles.noteTitle}>
                    {t("profile.identityDetail.username.noteTitle")}
                  </Text>
                  <Text style={styles.noteText}>
                    {t("profile.identityDetail.username.noteText")}
                  </Text>
                </View>
              </>
            ) : null}

            {mode === "birthday" ? (
              <>
                <View style={styles.groupCard}>
                  <View style={[styles.birthRow, styles.rowBorder]}>
                    <Text style={styles.birthLabel}>
                      {t("profile.identityDetail.birthday.day")}
                    </Text>
                    <TextInput
                      value={birthDay}
                      onChangeText={setBirthDay}
                      placeholder={t("profile.identityDetail.birthday.dayPlaceholder")}
                      placeholderTextColor="rgba(255,255,255,0.26)"
                      keyboardType="number-pad"
                      style={styles.birthInput}
                      maxLength={2}
                    />
                  </View>

                  <View style={[styles.birthRow, styles.rowBorder]}>
                    <Text style={styles.birthLabel}>
                      {t("profile.identityDetail.birthday.month")}
                    </Text>
                    <TextInput
                      value={birthMonth}
                      onChangeText={setBirthMonth}
                      placeholder={t(
                        "profile.identityDetail.birthday.monthPlaceholder",
                      )}
                      placeholderTextColor="rgba(255,255,255,0.26)"
                      keyboardType="number-pad"
                      style={styles.birthInput}
                      maxLength={2}
                    />
                  </View>

                  <View style={styles.birthRow}>
                    <Text style={styles.birthLabel}>
                      {t("profile.identityDetail.birthday.year")}
                    </Text>
                    <TextInput
                      value={birthYear}
                      onChangeText={setBirthYear}
                      placeholder={t("profile.identityDetail.birthday.yearPlaceholder")}
                      placeholderTextColor="rgba(255,255,255,0.26)"
                      keyboardType="number-pad"
                      style={styles.birthInput}
                      maxLength={4}
                    />
                  </View>
                </View>

                <View style={styles.noteCard}>
                  <Text style={styles.noteTitle}>
                    {t("profile.identityDetail.birthday.noteTitle")}
                  </Text>
                  <Text style={styles.noteText}>
                    {t("profile.identityDetail.birthday.noteText")}
                  </Text>
                </View>
              </>
            ) : null}

            {mode === "colors" ? (
              <>
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <Palette size={18} color={TEAL} strokeWidth={2.4} />
                    <Text style={styles.previewTitle}>
                      {t("profile.identityDetail.colors.previewTitle")}
                    </Text>
                  </View>

                  <View style={styles.previewBadgeRow}>
                    {colorPresets.map((item) => {
                      const active = item.key === selectedColor;

                      return (
                        <Pressable
                          key={item.key}
                          onPress={() => setSelectedColor(item.key)}
                          style={[
                            styles.colorChip,
                            active && styles.colorChipActive,
                            {
                              borderColor: active
                                ? item.color
                                : "rgba(255,255,255,0.08)",
                            },
                          ]}
                        >
                          <View
                            style={[styles.colorDot, { backgroundColor: item.color }]}
                          />
                          <Text style={styles.colorChipText}>{item.label}</Text>
                          {active ? (
                            <Check size={14} color={TEXT} strokeWidth={2.4} />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.noteCard}>
                  <Text style={styles.noteTitle}>
                    {t("profile.identityDetail.colors.noteTitle")}
                  </Text>
                  <Text style={styles.noteText}>
                    {t("profile.identityDetail.colors.noteText")}
                  </Text>
                </View>
              </>
            ) : null}

            {mode === "channel" ? (
              <>
                <FieldCard
                  label={t("profile.identityDetail.channel.fieldLabel")}
                  value={channel}
                  onChangeText={setChannel}
                  placeholder={t("profile.identityDetail.channel.placeholder")}
                  prefix="@"
                />

                <View style={styles.noteCard}>
                  <Text style={styles.noteTitle}>
                    {t("profile.identityDetail.channel.noteTitle")}
                  </Text>
                  <Text style={styles.noteText}>
                    {t("profile.identityDetail.channel.noteText")}
                  </Text>
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FieldCard({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  prefix?: string;
}) {
  return (
    <View style={styles.fieldCard}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputRow}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.30)"
          style={styles.fieldInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },

  backgroundOrbTop: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(108, 255, 180, 0.10)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    bottom: -60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(99, 168, 255, 0.08)",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  fixedButtonsRow: {
    position: "absolute",
    top: 6,
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  topButton: {
    minWidth: 82,
    minHeight: 42,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121, 228, 162, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  topButtonText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  scrollContent: {
    paddingTop: 66,
    paddingBottom: 36,
    gap: 14,
  },

  introBlock: {
    paddingTop: 8,
    paddingBottom: 6,
  },

  eyebrow: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  title: {
    color: TEXT,
    fontSize: 32,
    fontWeight: "900",
  },

  subtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    fontWeight: "600",
  },

  fieldCard: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  fieldLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },

  inputRow: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  prefix: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "900",
  },

  fieldInput: {
    flex: 1,
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 8,
  },

  groupCard: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
  },

  birthRow: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  birthLabel: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  birthInput: {
    minWidth: 90,
    color: MUTED,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "800",
  },

  previewCard: {
    borderRadius: 22,
    backgroundColor: CARD_SOFT,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    gap: 14,
  },

  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  previewTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  previewBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  colorChip: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  colorChipActive: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  colorChipText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
  },

  noteCard: {
    borderRadius: 20,
    backgroundColor: "rgba(8, 16, 22, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
  },

  noteTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },

  noteText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
});