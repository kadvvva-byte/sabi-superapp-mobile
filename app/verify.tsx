import React, { useEffect, useMemo, useRef, useState } from "react";
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
  KeyRound,
  ShieldCheck,
  Smartphone,
} from "lucide-react-native";
import {
  pickRuntimeDictionary,
  useRuntimeLanguage,
} from "../src/shared/i18n/runtime-language";
import { requestOtpCode, verifyOtpCode } from "../src/shared/api/auth-api";
import { applyAuthenticatedSession } from "../src/core/kernel/auth/session.actions";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;
const SCREEN_TEXTS = {
  en: {
    badge: "VERIFICATION",
    title: "Verify your number",
    subtitle:
      "Enter the 6-digit code sent to your phone number to continue.",
    phoneLabel: "Verified number",
    codeLabel: "Confirmation code",
    codePlaceholder: "Enter code",
    helper:
      "The code is required to activate your account and continue to profile setup.",
    verify: "Confirm and continue",
    resend: "Resend code",
    resendIn: "Resend in",
    invalid: "Enter the full 6-digit code",
    maskedFallback: "Number not provided",
    wrongCode: "Enter 6 digits first",
    verifyErrorTitle: "Verification error",
    verifyErrorMessage: "Could not verify the code. Please try again.",
  },
  ru: {
    badge: "ВЕРИФИКАЦИЯ",
    title: "Подтверди номер",
    subtitle:
      "Введи 6-значный код, отправленный на твой номер телефона, чтобы продолжить.",
    phoneLabel: "Подтверждаемый номер",
    codeLabel: "Код подтверждения",
    codePlaceholder: "Введите код",
    helper:
      "Код нужен для активации аккаунта и перехода к заполнению профиля.",
    verify: "Подтвердить и продолжить",
    resend: "Отправить код повторно",
    resendIn: "Повторная отправка через",
    invalid: "Введи полный 6-значный код",
    maskedFallback: "Номер не передан",
    wrongCode: "Сначала введи 6 цифр",
    verifyErrorTitle: "Ошибка подтверждения",
    verifyErrorMessage: "Не удалось подтвердить код. Попробуйте еще раз.",
  },
  uz: {
    badge: "TASDIQLASH",
    title: "Raqamni tasdiqlang",
    subtitle:
      "Davom etish uchun telefon raqamingizga yuborilgan 6 xonali kodni kiriting.",
    phoneLabel: "Tasdiqlanayotgan raqam",
    codeLabel: "Tasdiqlash kodi",
    codePlaceholder: "Kodni kiriting",
    helper:
      "Kod akkauntni faollashtirish va profilni to‘ldirish bosqichiga o‘tish uchun kerak.",
    verify: "Tasdiqlash va davom etish",
    resend: "Kodni qayta yuborish",
    resendIn: "Qayta yuborish",
    invalid: "To‘liq 6 xonali kodni kiriting",
    maskedFallback: "Raqam yuborilmagan",
    wrongCode: "Avval 6 ta raqam kiriting",
    verifyErrorTitle: "Tasdiqlash xatosi",
    verifyErrorMessage: "Kod tasdiqlanmadi. Qayta urinib ko‘ring.",
  },
} as const;

type VerifiedOtpResult = {
  apiBaseUrl: string;
  accessToken: string;
  refreshToken?: string | null;
  currentUserId: string;
  profileCompleted: boolean;
  profile: {
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
  };
};

function normalizeCode(value: string) {
  return value.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

function maskPhone(phone: string) {
  const value = phone.trim();
  if (!value) return "";

  if (value.length <= 4) return value;

  const start = value.slice(0, Math.min(4, value.length));
  const end = value.slice(-2);
  const middleLength = Math.max(0, value.length - start.length - end.length);
  return `${start}${"•".repeat(middleLength)}${end}`;
}

async function resolveVerifiedResult(
  phone: string,
  code: string,
  apiBaseUrl?: string | null,
): Promise<VerifiedOtpResult> {
  return verifyOtpCode({
    phone,
    code,
    apiBaseUrl,
  });
}

export default function VerifyScreen() {
  const language = useRuntimeLanguage();
  const texts = pickRuntimeDictionary(language, SCREEN_TEXTS);

  const params = useLocalSearchParams<{ phone?: string; apiBaseUrl?: string }>();
  const phone = typeof params.phone === "string" ? params.phone : "";
  const apiBaseUrl = typeof params.apiBaseUrl === "string" ? params.apiBaseUrl : undefined;

  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput | null>(null);

  const normalizedCode = normalizeCode(code);
  const canContinue = normalizedCode.length === CODE_LENGTH;
  const maskedPhone = useMemo(
    () => maskPhone(phone) || texts.maskedFallback,
    [phone, texts.maskedFallback],
  );

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => clearTimeout(focusTimer);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleBack = () => {
    const canGoBack =
      typeof (router as { canGoBack?: () => boolean }).canGoBack === "function"
        ? (router as { canGoBack: () => boolean }).canGoBack()
        : false;

    if (canGoBack) {
      router.back();
      return;
    }

    router.replace("/register");
  };

  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || !phone) return;

    try {
      Keyboard.dismiss();
      setCode("");
      await requestOtpCode({ phone, apiBaseUrl });
      setSecondsLeft(RESEND_SECONDS);
    } catch (error) {
      Alert.alert(
        texts.verifyErrorTitle,
        error instanceof Error && error.message ? error.message : texts.verifyErrorMessage,
      );
    }
  };

  const handleVerify = async () => {
    if (submitting) return;

    if (!canContinue) {
      Alert.alert(texts.invalid, texts.wrongCode);
      return;
    }

    try {
      setSubmitting(true);
      Keyboard.dismiss();

      const verified = await resolveVerifiedResult(phone, normalizedCode, apiBaseUrl);

      await applyAuthenticatedSession({
        apiBaseUrl: verified.apiBaseUrl,
        accessToken: verified.accessToken,
        refreshToken: verified.refreshToken ?? null,
        currentUserId: verified.currentUserId,
        phoneNumber: verified.profile.phone ?? phone ?? null,
      });

      if (verified.profileCompleted) {
        router.replace({
          pathname: "/",
          params: {
            phone: verified.profile.phone ?? phone,
            firstName: verified.profile.firstName ?? "",
            lastName: verified.profile.lastName ?? "",
            username: verified.profile.username ?? "",
            userId: verified.currentUserId,
            profileCompleted: "true",
          },
        });
        return;
      }

      router.replace({
        pathname: "/profile/complete",
        params: {
          phone: verified.profile.phone ?? phone,
          firstName: verified.profile.firstName ?? "",
          lastName: verified.profile.lastName ?? "",
          username: verified.profile.username ?? "",
          userId: verified.currentUserId,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : texts.verifyErrorMessage;

      Alert.alert(texts.verifyErrorTitle, message);
    } finally {
      setSubmitting(false);
    }
  };

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
                  <Text style={styles.headerBadgeText}>{texts.badge}</Text>
                </View>
              </View>

              <View style={styles.content}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>{texts.title}</Text>
                  <Text style={styles.subtitle}>{texts.subtitle}</Text>
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
                        <Smartphone size={16} color="#CFE2FF" />
                        <Text style={styles.infoPillText}>
                          {texts.phoneLabel}
                        </Text>
                      </View>

                      <Text style={styles.phoneValue}>{maskedPhone}</Text>
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>{texts.codeLabel}</Text>

                      <Pressable
                        onPress={handleFocusInput}
                        style={styles.codeBoxesWrap}
                      >
                        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                          const value = normalizedCode[index] ?? "";
                          const isFilled = Boolean(value);
                          const isActive =
                            index === normalizedCode.length &&
                            normalizedCode.length < CODE_LENGTH;

                          return (
                            <View
                              key={index}
                              style={[
                                styles.codeBox,
                                isFilled && styles.codeBoxFilled,
                                isActive && styles.codeBoxActive,
                              ]}
                            >
                              <Text style={styles.codeBoxText}>
                                {value || ""}
                              </Text>
                            </View>
                          );
                        })}
                      </Pressable>

                      <TextInput
                        ref={inputRef}
                        value={normalizedCode}
                        onChangeText={(value) => setCode(normalizeCode(value))}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete="sms-otp"
                        maxLength={CODE_LENGTH}
                        returnKeyType="done"
                        onSubmitEditing={handleVerify}
                        style={styles.hiddenInput}
                        placeholder={texts.codePlaceholder}
                        placeholderTextColor="transparent"
                        selectionColor="#DCEBFF"
                        autoFocus
                      />

                      <View style={styles.helperRow}>
                        <KeyRound size={16} color="#CFE2FF" />
                        <Text style={styles.helperText}>{texts.helper}</Text>
                      </View>

                      {!canContinue ? (
                        <Text style={styles.validationText}>
                          {texts.invalid}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.resendRow}>
                      <Pressable
                        onPress={handleResend}
                        disabled={secondsLeft > 0}
                        style={[
                          styles.resendButton,
                          secondsLeft > 0 && styles.resendButtonDisabled,
                        ]}
                      >
                        <Text style={styles.resendButtonText}>
                          {secondsLeft > 0
                            ? `${texts.resendIn} ${secondsLeft}s`
                            : texts.resend}
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.privacyCard}>
                      <ShieldCheck size={16} color="#CFE2FF" />
                      <Text style={styles.privacyText}>{texts.helper}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.bottomSection}>
                <Animated.View
                  style={[
                    styles.primaryButtonShadow,
                    { transform: [{ scale: buttonScale }] },
                    (!canContinue || submitting) && styles.disabledWrap,
                  ]}
                >
                  <Pressable
                    onPress={handleVerify}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={!canContinue || submitting}
                  >
                    <LinearGradient
                      colors={
                        canContinue && !submitting
                          ? ["#1D4F8D", "#143D6D", "#0D2D53"]
                          : ["#274466", "#223C59", "#1D344E"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryButton}
                    >
                      <View style={styles.primaryButtonInnerGlow} />
                      <Text style={styles.primaryButtonText}>
                        {texts.verify}
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
    gap: 10,
  },

  fieldLabel: {
    color: "#EAF2FF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  codeBoxesWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  codeBox: {
    flex: 1,
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: "rgba(7,17,32,0.46)",
    borderWidth: 1,
    borderColor: "rgba(173,209,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  codeBoxFilled: {
    borderColor: "rgba(119,226,140,0.42)",
    backgroundColor: "rgba(16,40,32,0.52)",
  },

  codeBoxActive: {
    borderColor: "rgba(159,204,255,0.48)",
    backgroundColor: "rgba(24,47,76,0.72)",
  },

  codeBoxText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
  },

  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },

  helperRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 2,
  },

  helperText: {
    flex: 1,
    color: "rgba(220,235,255,0.70)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  validationText: {
    color: "#FFCC66",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  resendRow: {
    alignItems: "flex-start",
  },

  resendButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  resendButtonDisabled: {
    opacity: 0.6,
  },

  resendButtonText: {
    color: "#EAF2FF",
    fontSize: 13,
    fontWeight: "700",
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