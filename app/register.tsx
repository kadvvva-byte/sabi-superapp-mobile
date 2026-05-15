import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  TextInput,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronDown,
  Lock,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react-native";

import CountryPicker from "../src/components/CountryPicker";
import { COUNTRIES } from "../src/shared/data/countries";
import { useI18n } from "../src/shared/i18n";
import { requestOtpCode } from "../src/shared/api/auth-api";

type CountryRow = (typeof COUNTRIES)[number];

export default function RegisterScreen() {
  const { t } = useI18n();

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("UZ");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const selectedCountry = useMemo(() => {
    return (
      COUNTRIES.find((item) => item.code === selectedCountryCode) ?? COUNTRIES[0]
    );
  }, [selectedCountryCode]);

  const normalizedPhone = phoneNumber.replace(/\D/g, "");
  const canContinue = normalizedPhone.length >= 6;

  const handleBack = () => {
    const canGoBack =
      typeof (router as { canGoBack?: () => boolean }).canGoBack === "function"
        ? (router as { canGoBack: () => boolean }).canGoBack()
        : false;

    if (canGoBack) {
      router.back();
      return;
    }

    router.replace("/");
  };

  const formatPhoneDigits = (digits: string) => {
    const cleaned = digits.replace(/\D/g, "").slice(0, 15);

    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    }
    if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
    }

    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    setPhoneNumber(formatPhoneDigits(digits));
  };

  const handleContinue = async () => {
    if (!canContinue || !selectedCountry?.dialCode || submitting) return;

    const fullPhone = `${selectedCountry.dialCode}${normalizedPhone}`;

    try {
      setSubmitting(true);
      Keyboard.dismiss();

      const otpResult = await requestOtpCode({
        phone: fullPhone,
      });

      router.replace({
        pathname: "/verify",
        params: {
          phone: otpResult.phone || fullPhone,
          apiBaseUrl: otpResult.apiBaseUrl,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("auth.phoneSubtitle");

      Alert.alert(
        t("auth.phoneTitle"),
        message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEditing = () => {
    if (!canContinue || submitting) return;
    void handleContinue();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.965,
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

  const handleSelectCountry = (country: CountryRow) => {
    setSelectedCountryCode(country.code);
    setCountryModalVisible(false);
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
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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
                    {t("auth.signUp")}
                  </Text>
                </View>
              </View>

              <View style={styles.content}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>{t("auth.phoneTitle")}</Text>
                  <Text style={styles.subtitle}>{t("auth.phoneSubtitle")}</Text>
                </View>

                <View style={styles.formCardShadow}>
                  <LinearGradient
                    colors={["#203754", "#182E4A", "#122843"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.formCard}
                  >
                    <View style={styles.cardInnerGlow} />

                    <Text style={styles.fieldLabel}>{t("auth.phoneTitle")}</Text>

                    <View style={styles.phoneRow}>
                      <Pressable
                        onPress={() => setCountryModalVisible(true)}
                        style={styles.countryButton}
                        hitSlop={10}
                      >
                        <Text style={styles.countryFlag}>{selectedCountry?.flag ?? "🌐"}</Text>
                        <Text style={styles.countryDialCode}>
                          {selectedCountry?.dialCode || "—"}
                        </Text>
                        <ChevronDown size={16} color="#D7E7FF" />
                      </Pressable>

                      <View style={styles.phoneInputWrap}>
                        <TextInput
                          value={phoneNumber}
                          onChangeText={handlePhoneChange}
                          keyboardType={Platform.OS === "ios" ? "number-pad" : "phone-pad"}
                          placeholder={t("auth.phonePlaceholder")}
                          placeholderTextColor="rgba(220,235,255,0.38)"
                          style={styles.phoneInput}
                          selectionColor="#DCEBFF"
                          returnKeyType="done"
                          onSubmitEditing={handleSubmitEditing}
                          blurOnSubmit={false}
                        />
                      </View>
                    </View>

                    <View style={styles.selectedCountryInfo}>
                      <Text style={styles.selectedCountryInfoText}>
                        {selectedCountry?.flag ?? "🌐"}{" "}
                        {selectedCountry?.name ?? t("auth.countryPlaceholder")} (
                        {selectedCountry?.code ?? "—"})
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <ShieldCheck size={16} color="#CFE2FF" />
                      <Text style={styles.infoText}>{t("auth.privacyNote")}</Text>
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.privacyCard}>
                  <View style={styles.privacyHeader}>
                    <View style={styles.privacyIconWrap}>
                      <Lock size={16} color="#E8F2FF" />
                    </View>
                    <Text style={styles.privacyTitle}>
                      {t("common.privacy")}
                    </Text>
                  </View>

                  <Text style={styles.privacyText}>
                    {t("auth.termsNotice")}
                  </Text>

                  <View style={styles.privacyLinksRow}>
                    <Pressable onPress={() => router.push("/terms")}>
                      <Text style={styles.privacyLink}>
                        {t("legal.termsOfService")}
                      </Text>
                    </Pressable>
                    <View style={styles.dot} />
                    <Pressable onPress={() => router.push("/privacy")}>
                      <Text style={styles.privacyLink}>
                        {t("legal.privacyPolicy")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.bottomSection}>
                <Animated.View
                  style={[
                    styles.primaryButtonShadow,
                    { transform: [{ scale: buttonScale }] },
                    (!canContinue || !selectedCountry?.dialCode || submitting) &&
                      styles.disabledWrap,
                  ]}
                >
                  <Pressable
                    onPress={() => void handleContinue()}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={!canContinue || !selectedCountry?.dialCode || submitting}
                  >
                    <LinearGradient
                      colors={
                        canContinue && selectedCountry?.dialCode && !submitting
                          ? ["#1D4F8D", "#143D6D", "#0D2D53"]
                          : ["#274466", "#223C59", "#1D344E"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryButton}
                    >
                      <View style={styles.primaryButtonInnerGlow} />
                      <Text style={styles.primaryButtonText}>
                        {t("auth.continueSecurely")}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </ScrollView>

          <CountryPicker
            visible={countryModalVisible}
            selectedCode={selectedCountryCode}
            onClose={() => setCountryModalVisible(false)}
            onSelect={handleSelectCountry}
          />
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
    top: 180,
    left: -70,
    width: 160,
    height: 160,
    borderRadius: 160,
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
  content: { flex: 1 },
  titleBlock: { marginBottom: 22 },
  title: {
    color: "#FFFFFF",
    fontSize: 35,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: "rgba(233,242,255,0.82)",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    maxWidth: 340,
  },
  formCardShadow: {
    borderRadius: 30,
    shadowColor: "#010A16",
    shadowOpacity: 0.52,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 18,
    marginBottom: 16,
  },
  formCard: {
    borderRadius: 28,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(180,215,255,0.12)",
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
  fieldLabel: {
    color: "#DCEBFF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  countryButton: {
    minWidth: 120,
    height: 58,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  countryFlag: { fontSize: 20 },
  countryDialCode: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginHorizontal: 8,
  },
  phoneInputWrap: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(7,17,32,0.46)",
    borderWidth: 1,
    borderColor: "rgba(173,209,255,0.16)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  phoneInput: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  selectedCountryInfo: { marginBottom: 14 },
  selectedCountryInfoText: {
    color: "rgba(220,235,255,0.78)",
    fontSize: 13,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  infoText: {
    flex: 1,
    color: "#E9F2FF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    marginLeft: 10,
  },
  privacyCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  privacyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  privacyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  privacyTitle: {
    color: "#F4F8FF",
    fontSize: 15,
    fontWeight: "800",
  },
  privacyText: {
    color: "rgba(220,235,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  privacyLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  privacyLink: {
    color: "#DCEBFF",
    fontSize: 14,
    fontWeight: "700",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(220,235,255,0.54)",
    marginHorizontal: 8,
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
  disabledWrap: { opacity: 0.7 },
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