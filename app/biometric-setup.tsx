import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import {
  ArrowLeft,
  ScanFace,
  Fingerprint,
  ShieldCheck,
  ChevronRight,
} from "lucide-react-native";

export default function BiometricSetupScreen() {
  const primaryScale = useRef(new Animated.Value(1)).current;
  const secondaryScale = useRef(new Animated.Value(1)).current;

  const [isChecking, setIsChecking] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [label, setLabel] = useState("Биометрия");
  const [description, setDescription] = useState(
    "Быстрый и безопасный вход в Sabi."
  );

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const hardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync();

        const available = hardware && enrolled;
        setIsSupported(available);

        const hasFace = supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        );
        const hasFingerprint = supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        );

        if (hasFace) {
          setLabel("Face ID");
          setDescription(
            "Включите Face ID для быстрого и безопасного входа в Sabi."
          );
        } else if (hasFingerprint) {
          setLabel("Отпечаток пальца");
          setDescription(
            "Включите вход по отпечатку пальца для быстрого доступа к Sabi."
          );
        } else {
          setLabel("Биометрическая защита");
          setDescription(
            "Используйте доступную биометрию устройства для безопасного входа."
          );
        }
      } catch {
        setIsSupported(false);
        setLabel("Биометрия");
        setDescription("Настройка биометрии недоступна на этом устройстве.");
      } finally {
        setIsChecking(false);
      }
    };

    checkBiometrics();
  }, []);

  const Icon = useMemo(() => {
    if (label === "Face ID") return ScanFace;
    if (label === "Отпечаток пальца") return Fingerprint;
    return ShieldCheck;
  }, [label]);

  const pressIn = (value: Animated.Value) => {
    Animated.spring(value, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const pressOut = (value: Animated.Value) => {
    Animated.spring(value, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    if (!isSupported) {
      router.push("/notification-preferences");
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Включить ${label}`,
        fallbackLabel: "Использовать код-пароль",
        cancelLabel: "Отмена",
        disableDeviceFallback: false,
      });

      if (result.success) {
        router.push("/notification-preferences");
      } else {
        router.push("/notification-preferences");
      }
    } catch {
      router.push("/notification-preferences");
    }
  };

  const handleSkip = () => {
    router.push("/notification-preferences");
  };

  return (
    <LinearGradient
      colors={["#020814", "#07172D", "#0A2242", "#0C2B52"]}
      locations={[0, 0.28, 0.72, 1]}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.orbOne} />
          <View style={styles.orbTwo} />

          <View style={styles.headerRow}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={18} color="#E7F1FF" />
            </Pressable>

            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>BIOMETRIC SETUP</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.heroWrap}>
              <View style={styles.iconGlow} />
              <View style={styles.iconShell}>
                <Icon size={38} color="#F4F8FF" />
              </View>
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.title}>{label}</Text>
              <Text style={styles.subtitle}>{description}</Text>
            </View>

            <View style={styles.cardShadow}>
              <LinearGradient
                colors={["#203754", "#182E4A", "#122843"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardInnerGlow} />

                {isChecking ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#DCEBFF" />
                    <Text style={styles.loadingText}>
                      Проверяем возможности устройства...
                    </Text>
                  </View>
                ) : isSupported ? (
                  <>
                    <View style={styles.featureRow}>
                      <View style={styles.featureIcon}>
                        <ShieldCheck size={16} color="#E8F2FF" />
                      </View>
                      <View style={styles.featureTextWrap}>
                        <Text style={styles.featureTitle}>
                          Быстрый безопасный вход
                        </Text>
                        <Text style={styles.featureText}>
                          Используйте {label.toLowerCase()} для подтверждения входа
                          и важных действий в приложении.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.featureRow}>
                      <View style={styles.featureIcon}>
                        <Icon size={16} color="#E8F2FF" />
                      </View>
                      <View style={styles.featureTextWrap}>
                        <Text style={styles.featureTitle}>
                          Доступно на устройстве
                        </Text>
                        <Text style={styles.featureText}>
                          Можно включить прямо сейчас и продолжить настройку.
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={styles.loadingWrap}>
                    <ShieldCheck size={22} color="#DCEBFF" />
                    <Text style={styles.loadingText}>
                      Биометрия недоступна или не настроена на этом устройстве.
                    </Text>
                    <Text style={styles.loadingSubtext}>
                      Вы можете продолжить без неё и включить позже в настройках.
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Animated.View
              style={[
                styles.primaryButtonShadow,
                { transform: [{ scale: primaryScale }] },
              ]}
            >
              <Pressable
                onPress={handleContinue}
                onPressIn={() => pressIn(primaryScale)}
                onPressOut={() => pressOut(primaryScale)}
              >
                <LinearGradient
                  colors={["#1D4F8D", "#143D6D", "#0D2D53"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <View style={styles.primaryButtonInnerGlow} />
                  <Text style={styles.primaryButtonText}>
                    {isSupported ? `Включить ${label}` : "Продолжить"}
                  </Text>
                  <ChevronRight size={18} color="#F7FBFF" />
                </LinearGradient>
              </Pressable>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: secondaryScale }] }}>
              <Pressable
                onPress={handleSkip}
                onPressIn={() => pressIn(secondaryScale)}
                onPressOut={() => pressOut(secondaryScale)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Не сейчас</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

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

  content: {
    flex: 1,
    justifyContent: "center",
  },

  heroWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },

  iconGlow: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 128,
    backgroundColor: "rgba(100,164,255,0.16)",
  },

  iconShell: {
    width: 94,
    height: 94,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  titleBlock: {
    marginBottom: 22,
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 35,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 12,
    textAlign: "center",
  },

  subtitle: {
    color: "rgba(233,242,255,0.82)",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 340,
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
    minHeight: 190,
    justifyContent: "center",
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

  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },

  featureTextWrap: {
    flex: 1,
  },

  featureTitle: {
    color: "#F4F8FF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  featureText: {
    color: "rgba(220,235,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 16,
  },

  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  loadingText: {
    color: "#F4F8FF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },

  loadingSubtext: {
    color: "rgba(220,235,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  bottomSection: {
    paddingTop: 10,
    gap: 12,
  },

  primaryButtonShadow: {
    borderRadius: 22,
    shadowColor: "#031120",
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },

  primaryButton: {
    minHeight: 62,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(189,220,255,0.14)",
    flexDirection: "row",
    gap: 8,
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

  secondaryButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  secondaryButtonText: {
    color: "#DCEBFF",
    fontSize: 16,
    fontWeight: "700",
  },
});