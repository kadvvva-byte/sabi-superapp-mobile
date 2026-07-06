import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Check,
  ChevronDown,
  Globe2,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  InteractionManager,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthSession } from "../src/core/kernel/auth/use-auth-session";
import { LANGUAGES } from "../src/shared/data/languages";
import { setAppLanguage, useI18n } from "../src/shared/i18n";

const SABI_GOOGLE_REVIEW_MODE = process.env.EXPO_PUBLIC_GOOGLE_REVIEW_MODE === "1";

type LanguageRow = (typeof LANGUAGES)[number];

function normalizeCode(input?: string | null): string {
  return String(input || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function dedupeLanguages(items: LanguageRow[]): LanguageRow[] {
  const seen = new Set<string>();
  const result: LanguageRow[] = [];

  for (const item of items) {
    const code = normalizeCode(item.code);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    result.push(item);
  }

  return result;
}

function resolveSelectedLanguage(
  currentLanguage: string,
  items: LanguageRow[],
): LanguageRow | undefined {
  const normalized = normalizeCode(currentLanguage);
  const exact = items.find((item) => normalizeCode(item.code) === normalized);
  if (exact) return exact;

  const base = normalized.split("-")[0];
  return items.find((item) => normalizeCode(item.code) === base);
}

function safeText(value: string, fallback: string): string {
  const text = String(value || "").trim();
  return text.length > 0 ? text : fallback;
}

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const { language, t } = useI18n();
  const auth = useAuthSession();

  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const navigationStartedRef = useRef(false);

  const languageRows = useMemo(() => dedupeLanguages(LANGUAGES), []);
  const selectedLanguage = useMemo(
    () => resolveSelectedLanguage(language, languageRows),
    [language, languageRows],
  );

  const currentLanguageLabel = selectedLanguage?.nativeName ?? "English";

  const isAuthenticated =
    auth.isHydrated &&
    auth.status === "authenticated" &&
    Boolean(auth.apiBaseUrl) &&
    Boolean(auth.accessToken) &&
    Boolean(auth.currentUserId);

  const goTo = useCallback((path: "/home" | "/register") => {
    if (navigationStartedRef.current) return;
    navigationStartedRef.current = true;
    setNavigating(true);

    requestAnimationFrame(() => {
      InteractionManager.runAfterInteractions(() => {
        router.replace(path);
      });
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    goTo("/home");
  }, [goTo, isAuthenticated]);

  const handleContinue = useCallback(() => {
    if (SABI_GOOGLE_REVIEW_MODE) {
      goTo("/home");
      return;
    }

    if (isAuthenticated) {
      goTo("/home");
      return;
    }

    goTo("/register");
  }, [goTo, isAuthenticated]);

  const handleSelectLanguage = useCallback(async (item: LanguageRow) => {
    await setAppLanguage(item.code);
    setLanguageMenuVisible(false);
  }, []);

  const handlePressIn = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 36,
      bounciness: 3,
    }).start();
  }, [buttonScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 4,
    }).start();
  }, [buttonScale]);

  const title = safeText(t("auth.welcomeTitle"), "Sabi SuperApp");
  const subtitle = safeText(t("auth.welcomeSubtitle"), "Messenger, Wallet and AI in one app.");
  const buttonText = navigating
    ? safeText(t("common.loading"), "Loading...")
    : safeText(t("auth.getStarted"), "Continue");

  const compact = height < 720;

  return (
    <LinearGradient
      colors={["#020814", "#07172D", "#0A2242", "#0C2B52"]}
      locations={[0, 0.28, 0.72, 1]}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            compact && styles.scrollContentCompact,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.topSection}>
              <View style={styles.orbOne} />
              <View style={styles.orbTwo} />
              <View style={styles.orbThree} />

              <View style={styles.headerRow}>
                <View style={styles.brandBadge}>
                  <Sparkles size={14} color="#DCEBFF" />
                  <Text style={styles.brandBadgeText}>SABI SUPER APP</Text>
                </View>

                <Pressable
                  onPress={() => setLanguageMenuVisible(true)}
                  style={styles.languageBadge}
                  hitSlop={8}
                >
                  <Globe2 size={13} color="#D7E7FF" />
                  <Text style={styles.languageBadgeText} numberOfLines={1}>
                    {currentLanguageLabel}
                  </Text>
                  <ChevronDown size={14} color="#D7E7FF" />
                </Pressable>
              </View>

              <View style={[styles.headlineBlock, { maxWidth: width - 40 }]}>
                <Text style={[styles.title, compact && styles.titleCompact]}>
                  {title}
                </Text>
                <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
                  {subtitle}
                </Text>
              </View>

              <View style={styles.heroCardShadow}>
                <LinearGradient
                  colors={["#203754", "#182E4A", "#122843"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.heroCard, compact && styles.heroCardCompact]}
                >
                  <View style={styles.heroInnerGlow} />
                  <View style={styles.heroGlowOne} />
                  <View style={styles.heroGlowTwo} />

                  <View style={styles.heroTop}>
                    <Text style={styles.heroLabel}>{t("common.premium")}</Text>
                    <View style={styles.heroPill}>
                      <Text style={styles.heroPillText}>
                        {t("common.available")}
                      </Text>
                    </View>
                  </View>

                  <FeatureRow
                    icon={<Wallet size={20} color="#FFFFFF" />}
                    title={t("onboarding.walletTitle")}
                    text={t("onboarding.walletSubtitle")}
                    compact={compact}
                  />

                  <FeatureRow
                    icon={<MessageCircleMore size={20} color="#FFFFFF" />}
                    title={t("onboarding.messengerTitle")}
                    text={t("onboarding.messengerSubtitle")}
                    compact={compact}
                  />

                  <FeatureRow
                    icon={<ShieldCheck size={20} color="#FFFFFF" />}
                    title={t("onboarding.aiTitle")}
                    text={t("onboarding.aiSubtitle")}
                    compact={compact}
                  />
                </LinearGradient>
              </View>
            </View>

            <View style={styles.bottomSection}>
              <Animated.View
                style={[
                  styles.primaryButtonShadow,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <Pressable
                  onPress={handleContinue}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={navigating}
                  hitSlop={6}
                >
                  <LinearGradient
                    colors={["#1D4F8D", "#143D6D", "#0D2D53"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButton}
                  >
                    <View style={styles.primaryButtonInnerGlow} />
                    <Text style={styles.primaryButtonText}>{buttonText}</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              <Text style={styles.footerText}>{t("auth.termsNotice")}</Text>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={languageMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLanguageMenuVisible(false)}
        >
          <View style={styles.menuOverlay}>
            <Pressable
              style={styles.menuBackdrop}
              onPress={() => setLanguageMenuVisible(false)}
            />

            <View style={styles.menuAnchor}>
              <View style={styles.languageMenu}>
                <FlatList
                  data={languageRows}
                  keyExtractor={(item) => normalizeCode(item.code)}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={12}
                  maxToRenderPerBatch={12}
                  windowSize={5}
                  removeClippedSubviews
                  renderItem={({ item, index }) => {
                    const isSelected =
                      normalizeCode(item.code) ===
                      normalizeCode(selectedLanguage?.code);

                    return (
                      <Pressable
                        onPress={() => handleSelectLanguage(item)}
                        style={[
                          styles.languageMenuItem,
                          index !== languageRows.length - 1 &&
                            styles.languageMenuItemBorder,
                        ]}
                      >
                        <View style={styles.languageMenuTextWrap}>
                          <Text style={styles.languageMenuNative} numberOfLines={1}>
                            {item.nativeName}
                          </Text>
                          <Text style={styles.languageMenuName} numberOfLines={1}>
                            {item.englishName ??
                              item.name ??
                              item.code.toUpperCase()}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.languageMenuCheck,
                            isSelected && styles.languageMenuCheckActive,
                          ]}
                        >
                          {isSelected ? <Check size={14} color="#081120" /> : null}
                        </View>
                      </Pressable>
                    );
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

type FeatureRowProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  compact?: boolean;
};

const FeatureRow = React.memo(function FeatureRow({
  icon,
  title,
  text,
  compact,
}: FeatureRowProps) {
  return (
    <View style={[styles.featureRow, compact && styles.featureRowCompact]}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureTextWrap}>
        <Text style={styles.featureTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.featureText} numberOfLines={compact ? 1 : 2}>
          {text}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentCompact: {
    paddingBottom: 8,
  },
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  topSection: {
    paddingTop: 8,
    position: "relative",
    overflow: "hidden",
  },
  orbOne: {
    position: "absolute",
    top: -50,
    right: -34,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(80, 145, 255, 0.14)",
  },
  orbTwo: {
    position: "absolute",
    top: 125,
    left: -70,
    width: 170,
    height: 170,
    borderRadius: 170,
    backgroundColor: "rgba(16, 103, 214, 0.08)",
  },
  orbThree: {
    position: "absolute",
    top: 270,
    right: 30,
    width: 110,
    height: 110,
    borderRadius: 110,
    backgroundColor: "rgba(132, 184, 255, 0.06)",
  },
  headerRow: {
    marginTop: 2,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 3,
  },
  brandBadge: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
  },
  brandBadgeText: {
    color: "#DCEBFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  languageBadge: {
    maxWidth: 150,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(18,37,63,0.92)",
    borderWidth: 1,
    borderColor: "rgba(200,225,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#02101F",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  languageBadgeText: {
    color: "#E4F0FF",
    fontSize: 12,
    fontWeight: "700",
    marginHorizontal: 6,
    flexShrink: 1,
  },
  headlineBlock: {
    marginBottom: 22,
    zIndex: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 37,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  titleCompact: {
    fontSize: 31,
    lineHeight: 37,
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(233,242,255,0.82)",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    maxWidth: 320,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroCardShadow: {
    borderRadius: 30,
    shadowColor: "#010A16",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    transform: [{ translateY: -2 }],
  },
  heroCard: {
    borderRadius: 28,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(180,215,255,0.12)",
  },
  heroCardCompact: {
    padding: 14,
  },
  heroInnerGlow: {
    position: "absolute",
    top: 2,
    left: 18,
    right: 18,
    height: 22,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroGlowOne: {
    position: "absolute",
    top: -26,
    right: -4,
    width: 160,
    height: 160,
    borderRadius: 160,
    backgroundColor: "rgba(105, 164, 255, 0.10)",
  },
  heroGlowTwo: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 90,
    height: 90,
    borderRadius: 90,
    backgroundColor: "rgba(170, 210, 255, 0.05)",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  heroLabel: {
    color: "rgba(235,244,255,0.92)",
    fontSize: 13,
    fontWeight: "700",
  },
  heroPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  featureRowCompact: {
    marginTop: 8,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureTextWrap: {
    flex: 1,
    paddingTop: 1,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  featureText: {
    color: "rgba(236,244,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 10,
  },
  bottomSection: {
    paddingTop: 18,
  },
  primaryButtonShadow: {
    borderRadius: 24,
    marginBottom: 14,
    shadowColor: "#0B3A72",
    shadowOpacity: 0.36,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  primaryButton: {
    height: 60,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(188,221,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  primaryButtonInnerGlow: {
    position: "absolute",
    top: 2,
    left: 12,
    right: 12,
    height: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  primaryButtonText: {
    color: "#F4F8FF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  footerText: {
    color: "rgba(220,235,255,0.48)",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  menuOverlay: { flex: 1 },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  menuAnchor: {
    position: "absolute",
    top: 56,
    right: 20,
    width: 250,
    maxHeight: 360,
  },
  languageMenu: {
    maxHeight: 360,
    borderRadius: 18,
    backgroundColor: "#10233E",
    borderWidth: 1,
    borderColor: "rgba(180,215,255,0.12)",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 10,
  },
  languageMenuItem: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  languageMenuItemBorder: {},
  languageMenuTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  languageMenuNative: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  languageMenuName: {
    color: "rgba(220,235,255,0.58)",
    fontSize: 12,
    fontWeight: "600",
  },
  languageMenuCheck: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  languageMenuCheckActive: {
    backgroundColor: "#DCEBFF",
    borderColor: "#DCEBFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
