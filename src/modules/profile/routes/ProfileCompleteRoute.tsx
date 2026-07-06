import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  AtSign,
  BadgeCheck,
  IdCard,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { useAuthSession } from "../../../core/kernel/auth/use-auth-session";
import {
  buildSabiDisplayId,
  buildSuggestedUnifiedUsername,
  buildUnifiedUserId,
  createUnifiedUserIdSeed,
  normalizeProfileName,
  normalizeUnifiedUsername,
  saveUnifiedAccountProfile,
} from "../../../shared/account/unified-account-profile";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | {
      t?: (key: string, params?: Record<string, unknown>) => string;
    };

export default function ProfileCompleteScreen() {
  const i18n = useI18n() as I18nHookValue;
  const auth = useAuthSession();

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

  const params = useLocalSearchParams<{
    phone?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    userId?: string;
  }>();

  const phone = typeof params.phone === "string" ? params.phone : "";

  const [firstName, setFirstName] = useState(
    typeof params.firstName === "string" ? params.firstName : "",
  );
  const [lastName, setLastName] = useState(
    typeof params.lastName === "string" ? params.lastName : "",
  );
  const [username, setUsername] = useState(
    typeof params.username === "string" ? params.username : "",
  );
  const [usernameTouched, setUsernameTouched] = useState(
    typeof params.username === "string" && params.username.length > 0,
  );
  const [saving, setSaving] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const seedRef = useRef(createUnifiedUserIdSeed());

  const normalizedFirstName = normalizeProfileName(firstName);
  const normalizedLastName = normalizeProfileName(lastName);
  const normalizedUsername = normalizeUnifiedUsername(username);

  useEffect(() => {
    if (usernameTouched) return;

    setUsername(
      buildSuggestedUnifiedUsername(normalizedFirstName, normalizedLastName),
    );
  }, [normalizedFirstName, normalizedLastName, usernameTouched]);

  const generatedUserId = useMemo(() => {
    const sessionUserId =
      typeof auth.currentUserId === "string" ? auth.currentUserId.trim() : "";

    if (sessionUserId) {
      return sessionUserId;
    }

    if (typeof params.userId === "string" && params.userId.trim().length > 0) {
      return params.userId.trim();
    }

    return buildUnifiedUserId(
      normalizedFirstName,
      normalizedLastName,
      seedRef.current,
    );
  }, [auth.currentUserId, normalizedFirstName, normalizedLastName, params.userId]);

  const generatedDisplaySabiId = useMemo(
    () =>
      buildSabiDisplayId({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        username: normalizedUsername,
        userId: generatedUserId,
      }),
    [generatedUserId, normalizedFirstName, normalizedLastName, normalizedUsername],
  );

  const usernamePreview = useMemo(() => {
    if (!normalizedUsername) return "@";
    return `@${normalizedUsername}`;
  }, [normalizedUsername]);

  const isFirstNameValid = normalizedFirstName.length >= 2;
  const isLastNameValid = normalizedLastName.length >= 2;
  const isUsernameValid =
    normalizedUsername.length >= 4 &&
    /^[a-z0-9_]+$/.test(normalizedUsername);

  const canContinue =
    isFirstNameValid &&
    isLastNameValid &&
    isUsernameValid &&
    generatedUserId.length >= 8 &&
    !saving;

  const routeHome = useCallback(
    (profile: {
      phone: string;
      firstName: string;
      lastName: string;
      username: string;
      userId: string;
    }) => {
      router.replace({
        pathname: "/",
        params: {
          phone: profile.phone,
          firstName: profile.firstName,
          lastName: profile.lastName,
          username: profile.username,
          userId: profile.userId,
          profileCompleted: "true",
        },
      });
    },
    [],
  );

  const handleBack = useCallback(() => {
    const canGoBack =
      typeof (router as { canGoBack?: () => boolean }).canGoBack === "function"
        ? (router as { canGoBack: () => boolean }).canGoBack()
        : false;

    if (canGoBack) {
      router.back();
      return;
    }

    router.replace("/register");
  }, []);

  const handlePressIn = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  }, [buttonScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  }, [buttonScale]);

  const handleContinue = useCallback(async () => {
    if (!canContinue) return;

    const payload = {
      phone,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      username: normalizedUsername,
      userId: generatedUserId,
    };

    try {
      setSaving(true);
      Keyboard.dismiss();

      const savedProfile = await saveUnifiedAccountProfile(payload);

      routeHome({
        phone: savedProfile.phone,
        firstName: savedProfile.firstName,
        lastName: savedProfile.lastName,
        username: savedProfile.username,
        userId: savedProfile.userId,
      });
      return;
    } catch {
      Alert.alert(
        t("profile.completeScreen.saveErrorTitle"),
        t("profile.completeScreen.saveErrorMessage"),
      );
    } finally {
      setSaving(false);
    }
  }, [
    canContinue,
    generatedUserId,
    normalizedFirstName,
    normalizedLastName,
    normalizedUsername,
    phone,
    routeHome,
    t,
  ]);

  return (
    <LinearGradient
      colors={["#020814", "#07172D", "#0A2242", "#0C2B52"]}
      locations={[0, 0.28, 0.72, 1]}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.orbOne} />
              <View style={styles.orbTwo} />

              <View style={styles.headerRow}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                  <ArrowLeft size={18} color="#E7F1FF" />
                </Pressable>

                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {t("profile.completeScreen.badge")}
                  </Text>
                </View>
              </View>

              <View style={styles.content}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>
                    {t("profile.completeScreen.title")}
                  </Text>
                  <Text style={styles.subtitle}>
                    {t("profile.completeScreen.subtitle")}
                  </Text>
                </View>

                <View style={styles.cardShadow}>
                  <LinearGradient
                    colors={["#203754", "#182E4A", "#122843"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <View style={styles.cardInnerGlow} />

                    <View style={styles.infoTopRow}>
                      <View style={styles.infoPill}>
                        <ShieldCheck size={16} color="#CFE2FF" />
                        <Text style={styles.infoPillText}>
                          {t("profile.completeScreen.phone")}
                        </Text>
                      </View>

                      <Text style={styles.phoneValue}>{phone || "—"}</Text>
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        {t("profile.completeScreen.firstName")}
                      </Text>
                      <View
                        style={[
                          styles.inputWrap,
                          isFirstNameValid && styles.inputWrapValid,
                        ]}
                      >
                        <UserRound size={18} color="#DCEBFF" />
                        <TextInput
                          value={firstName}
                          onChangeText={setFirstName}
                          placeholder={t("profile.completeScreen.firstName")}
                          placeholderTextColor="rgba(220,235,255,0.38)"
                          style={styles.input}
                          selectionColor="#DCEBFF"
                          returnKeyType="next"
                          autoCapitalize="words"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        {t("profile.completeScreen.lastName")}
                      </Text>
                      <View
                        style={[
                          styles.inputWrap,
                          isLastNameValid && styles.inputWrapValid,
                        ]}
                      >
                        <BadgeCheck size={18} color="#DCEBFF" />
                        <TextInput
                          value={lastName}
                          onChangeText={setLastName}
                          placeholder={t("profile.completeScreen.lastName")}
                          placeholderTextColor="rgba(220,235,255,0.38)"
                          style={styles.input}
                          selectionColor="#DCEBFF"
                          returnKeyType="next"
                          autoCapitalize="words"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        {t("profile.completeScreen.username")}
                      </Text>
                      <View
                        style={[
                          styles.inputWrap,
                          isUsernameValid && styles.inputWrapValid,
                        ]}
                      >
                        <AtSign size={18} color="#DCEBFF" />
                        <TextInput
                          value={username}
                          onChangeText={(value) => {
                            setUsernameTouched(true);
                            setUsername(normalizeUnifiedUsername(value));
                          }}
                          placeholder={t("profile.completeScreen.username")}
                          placeholderTextColor="rgba(220,235,255,0.38)"
                          style={styles.input}
                          selectionColor="#DCEBFF"
                          returnKeyType="done"
                          autoCapitalize="none"
                          autoCorrect={false}
                          onSubmitEditing={handleContinue}
                        />
                      </View>

                      <View style={styles.usernamePreviewRow}>
                        <Text style={styles.usernamePreviewLabel}>
                          {t("profile.completeScreen.username")}:
                        </Text>
                        <Text style={styles.usernamePreviewValue}>
                          {usernamePreview}
                        </Text>
                      </View>

                      <Text style={styles.helperText}>
                        {t("profile.completeScreen.usernameHint")}
                      </Text>
                    </View>

                    <View style={styles.systemCard}>
                      <View style={styles.systemCardHeader}>
                        <IdCard size={16} color="#FFCC66" />
                        <Text style={styles.systemCardTitle}>
                          {t("profile.completeScreen.unifiedId")}
                        </Text>
                      </View>

                      <Text style={styles.generatedIdValue}>
                        {generatedDisplaySabiId}
                      </Text>

                      <Text style={styles.systemCardValue}>
                        {t("profile.completeScreen.unifiedIdHint")}
                      </Text>
                    </View>

                    <View style={styles.privacyCard}>
                      <ShieldCheck size={16} color="#CFE2FF" />
                      <Text style={styles.privacyText}>
                        {t("profile.completeScreen.privacy")}
                      </Text>
                    </View>

                    {!canContinue && !saving ? (
                      <Text style={styles.validationText}>
                        {t("profile.completeScreen.required")}
                      </Text>
                    ) : null}
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.bottomSection}>
                <Animated.View
                  style={[
                    styles.primaryButtonShadow,
                    { transform: [{ scale: buttonScale }] },
                    !canContinue && styles.disabledWrap,
                  ]}
                >
                  <Pressable
                    onPress={handleContinue}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={!canContinue}
                  >
                    <LinearGradient
                      colors={
                        canContinue
                          ? ["#1D4F8D", "#143D6D", "#0D2D53"]
                          : ["#274466", "#223C59", "#1D344E"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryButton}
                    >
                      <View style={styles.primaryButtonInnerGlow} />
                      <Text style={styles.primaryButtonText}>
                        {saving
                          ? t("profile.completeScreen.saving")
                          : t("common.continue")}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  orbOne: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 210,
    height: 210,
    borderRadius: 210,
    backgroundColor: "rgba(80,145,255,0.12)",
  },

  orbTwo: {
    position: "absolute",
    top: 200,
    left: -70,
    width: 170,
    height: 170,
    borderRadius: 170,
    backgroundColor: "rgba(16,103,214,0.08)",
  },

  headerRow: {
    paddingTop: 8,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerBadge: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerBadgeText: {
    color: "#DCEBFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  titleBlock: {
    marginBottom: 22,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 35,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 12,
  },

  subtitle: {
    color: "rgba(233,242,255,0.82)",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    maxWidth: 360,
  },

  cardShadow: {
    borderRadius: 30,
    shadowColor: "#010A16",
    shadowOpacity: 0.52,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 18,
    marginBottom: 8,
  },

  card: {
    borderRadius: 28,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(180,215,255,0.12)",
    gap: 14,
  },

  cardInnerGlow: {
    position: "absolute",
    top: -20,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 140,
    backgroundColor: "rgba(116,178,255,0.10)",
  },

  infoTopRow: {
    gap: 10,
  },

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  infoPillText: {
    color: "#EAF2FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  phoneValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  fieldBlock: {
    gap: 8,
  },

  fieldLabel: {
    color: "#EAF2FF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  inputWrap: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "rgba(7,17,32,0.46)",
    borderWidth: 1,
    borderColor: "rgba(173,209,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },

  inputWrapValid: {
    borderColor: "rgba(119,226,140,0.42)",
    backgroundColor: "rgba(16,40,32,0.52)",
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  usernamePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  usernamePreviewLabel: {
    color: "rgba(220,235,255,0.70)",
    fontSize: 13,
    fontWeight: "600",
  },

  usernamePreviewValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  helperText: {
    color: "rgba(220,235,255,0.70)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  systemCard: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
    gap: 8,
  },

  systemCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  systemCardTitle: {
    color: "#F7FBFF",
    fontSize: 14,
    fontWeight: "800",
  },

  generatedIdValue: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
  },

  systemCardValue: {
    color: "rgba(233,242,255,0.76)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },

  privacyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
  },

  privacyText: {
    flex: 1,
    color: "#E9F2FF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  validationText: {
    color: "#FFCC66",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  bottomSection: {
    paddingTop: 14,
    paddingBottom: Platform.OS === "web" ? 8 : 20,
  },

  primaryButtonShadow: {
    borderRadius: 22,
    shadowColor: "#031120",
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },

  disabledWrap: {
    opacity: 0.7,
  },

  primaryButton: {
    minHeight: 62,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(189,220,255,0.14)",
  },

  primaryButtonInnerGlow: {
    position: "absolute",
    top: -18,
    width: "86%",
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(196,224,255,0.12)",
  },

  primaryButtonText: {
    color: "#F7FBFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});