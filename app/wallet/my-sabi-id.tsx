import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  AtSign,
  Bot,
  Camera,
  Check,
  ChevronDown,
  Copy,
  Palette,
  PencilLine,
  QrCode,
  ScanLine,
  Share2,
} from "lucide-react-native";

import AppContainer from "../../components/AppContainer";
import { useSabiTheme } from "../../src/theme/ThemeProvider";
import { useI18n } from "../../src/shared/i18n";


function walletText(
  t: (key: string, params?: Record<string, string | number>) => string,
  key: string,
  fallback: string,
) {
  const value = t(key);
  return typeof value === "string" && value.trim() && value !== key ? value : fallback;
}

type BannerTone = {
  id: string;
  label: string;
  colors: [string, string, string];
  accent: string;
};

type BannerStyle = {
  id: string;
  label: string;
  subtitle: string;
};

const BANNER_TONES: BannerTone[] = [
  {
    id: "sabi-blue",
    label: "Sabi Blue",
    colors: ["#2E6BFF", "#173C9A", "#0A1632"],
    accent: "#8BB6FF",
  },
  {
    id: "deep-ocean",
    label: "Deep Ocean",
    colors: ["#0F5D97", "#0D3663", "#07182E"],
    accent: "#73C9FF",
  },
  {
    id: "royal-indigo",
    label: "Royal Indigo",
    colors: ["#5A46F0", "#2B208B", "#0C1131"],
    accent: "#B1A8FF",
  },
  {
    id: "emerald-night",
    label: "Emerald Night",
    colors: ["#11856A", "#0D4E42", "#081A18"],
    accent: "#79F0CD",
  },
  {
    id: "silver-night",
    label: "Silver Night",
    colors: ["#6C7B91", "#36465C", "#101A28"],
    accent: "#E2EAF8",
  },
  {
    id: "sunset-violet",
    label: "Sunset Violet",
    colors: ["#7C44F2", "#4A239B", "#140A2D"],
    accent: "#D2B9FF",
  },
];

const BANNER_STYLES: BannerStyle[] = [
  {
    id: "classic",
    label: "Classic",
    subtitle: "Balanced premium wallet banner",
  },
  {
    id: "glow",
    label: "Glow",
    subtitle: "Brighter accent and softer shine",
  },
  {
    id: "executive",
    label: "Executive",
    subtitle: "Sharper, calmer and more formal",
  },
];

function openMySabiQr(params: { displayName: string; sabiId: string }) {
  if (!params.sabiId.trim()) {
    router.push("/profile" as never);
    return;
  }

  router.push({
    pathname: "/wallet/qr-create",
    params: {
      variant: "user",
      label: params.displayName.trim(),
      reference: params.sabiId.trim(),
    },
  });
}

function SectionHeader({
  title,
  hint,
  colors,
}: {
  title: string;
  hint: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
        {hint}
      </Text>
    </View>
  );
}

function Badge({
  label,
  colors,
  radius,
}: {
  label: string;
  colors: { cardSoft: string; border: string; text: string };
  radius: number;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function ActionButton({
  title,
  icon,
  onPress,
  colors,
  radius,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  colors: { cardSoft: string; border: string; text: string };
  radius: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          backgroundColor: colors.cardSoft,
          borderColor: colors.border,
          borderRadius: radius,
        },
      ]}
    >
      <View style={styles.actionButtonIcon}>{icon}</View>
      <Text style={[styles.actionButtonText, { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
}

function BannerPreview({
  tone,
  styleMode,
  displayName,
  sabiId,
  labels,
}: {
  tone: BannerTone;
  styleMode: BannerStyle["id"];
  displayName: string;
  sabiId: string;
  labels: {
    eyebrow: string;
    walletIdentity: string;
    secureRoute: string;
    style: string;
    theme: string;
    classic: string;
  };
}) {
  const glowOpacity =
    styleMode === "glow" ? 0.2 : styleMode === "executive" ? 0.08 : 0.14;
  const shineOpacity =
    styleMode === "glow" ? 0.09 : styleMode === "executive" ? 0.03 : 0.06;

  return (
    <View
      style={[
        styles.bannerCard,
        {
          backgroundColor: tone.colors[1],
          borderColor: "rgba(255,255,255,0.08)",
        },
      ]}
    >
      <View
        style={[
          styles.bannerGlowA,
          {
            backgroundColor: tone.colors[0],
            opacity: glowOpacity,
          },
        ]}
      />
      <View
        style={[
          styles.bannerGlowB,
          {
            backgroundColor: tone.colors[2],
            opacity: 0.95,
          },
        ]}
      />
      <View style={[styles.bannerShine, { opacity: shineOpacity }]} />

      <View style={styles.bannerTopRow}>
        <View>
          <Text style={styles.bannerEyebrow}>{labels.eyebrow}</Text>
          <Text style={styles.bannerTitle}>{displayName}</Text>
          <Text style={styles.bannerHandle}>@{sabiId}</Text>
        </View>

        <View style={styles.bannerChip}>
          <AtSign size={15} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.bannerCenterBlock}>
        <Text style={styles.bannerCenterLabel}>{labels.walletIdentity}</Text>
        <Text style={styles.bannerCenterValue}>{labels.secureRoute}</Text>
      </View>

      <View style={styles.bannerBottomRow}>
        <View>
          <Text style={styles.bannerMetaLabel}>{labels.style}</Text>
          <Text style={styles.bannerMetaValue}>
            {BANNER_STYLES.find((item) => item.id === styleMode)?.label ?? labels.classic}
          </Text>
        </View>

        <View style={styles.bannerBottomRight}>
          <Text style={styles.bannerMetaLabel}>{labels.theme}</Text>
          <Text style={styles.bannerMetaValue}>{tone.label}</Text>
        </View>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  title,
  text,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

export default function WalletMySabiIdScreen() {
  const { colors, radius } = useSabiTheme();
  const { t } = useI18n();

  const texts = useMemo(
    () => ({
      eyebrow: walletText(t, "wallet.mySabiId.eyebrow", "MYSABI ID"),
      title: walletText(t, "wallet.mySabiId.title", "Wallet Identity"),
      subtitle: walletText(t, "wallet.mySabiId.subtitle", "Verified payment identity for internal transfers, payment requests, My QR and scanner access."),
      notConfigured: walletText(t, "wallet.mySabiId.notConfigured", "Not configured"),
      pending: walletText(t, "wallet.mySabiId.pending", "Pending"),
      status: walletText(t, "wallet.mySabiId.status", "Profile identity required"),
      internalPay: walletText(t, "wallet.mySabiId.internalPay", "Internal Pay"),
      receive: walletText(t, "wallet.mySabiId.receive", "Receive"),
      identity: walletText(t, "wallet.mySabiId.identity", "Identity"),
      mainBanner: walletText(t, "wallet.mySabiId.mainBanner", "Primary banner"),
      preview: walletText(t, "wallet.mySabiId.preview", "Preview"),
      bannerAppearance: walletText(t, "wallet.mySabiId.bannerAppearance", "Banner appearance"),
      displayName: walletText(t, "wallet.mySabiId.displayName", "Display name"),
      displayNamePlaceholder: walletText(t, "wallet.mySabiId.displayNamePlaceholder", "Use verified profile name"),
      sabiId: walletText(t, "wallet.mySabiId.sabiId", "MySabi ID"),
      sabiIdPlaceholder: walletText(t, "wallet.mySabiId.sabiIdPlaceholder", "Use verified MySabi ID"),
      bannerColor: walletText(t, "wallet.mySabiId.bannerColor", "Banner color"),
      bannerStyle: walletText(t, "wallet.mySabiId.bannerStyle", "Banner style"),
      qrAccess: walletText(t, "wallet.mySabiId.qrAccess", "Identity QR access"),
      core: walletText(t, "wallet.mySabiId.core", "Core"),
      myQr: walletText(t, "wallet.mySabiId.myQr", "My QR"),
      scan: walletText(t, "wallet.mySabiId.scan", "Scan"),
      share: walletText(t, "wallet.mySabiId.share", "Share"),
      copyId: walletText(t, "wallet.mySabiId.copyId", "Copy ID"),
      askAi: walletText(t, "wallet.mySabiId.askAi", "Ask AI"),
      howWorks: walletText(t, "wallet.mySabiId.howWorks", "How this identity works"),
      flow: walletText(t, "wallet.mySabiId.flow", "Flow"),
      internalTitle: walletText(t, "wallet.mySabiId.internalTitle", "Internal wallet handle"),
      internalText: walletText(t, "wallet.mySabiId.internalText", "MySabi ID is the verified address for internal transfers, payment requests and wallet discovery."),
      qrTitle: walletText(t, "wallet.mySabiId.qrTitle", "Separate QR access"),
      qrText: walletText(t, "wallet.mySabiId.qrText", "This screen opens your own Sabi QR and the shared camera scanner using verified profile identity."),
      customizeTitle: walletText(t, "wallet.mySabiId.customizeTitle", "Identity customization"),
      customizeText: walletText(t, "wallet.mySabiId.customizeText", "Banner color and style personalize the screen without changing wallet routing logic."),
      walletIdentity: walletText(t, "wallet.mySabiId.walletIdentity", "Wallet identity"),
      secureRoute: walletText(t, "wallet.mySabiId.secureRoute", "Secure internal route"),
      style: walletText(t, "wallet.mySabiId.style", "Style"),
      theme: walletText(t, "wallet.mySabiId.theme", "Theme"),
      profileFallback: walletText(t, "wallet.mySabiId.profileFallback", "Profile"),
    }),
    [t],
  );

  const [displayName, setDisplayName] = useState("");
  const [sabiId, setSabiId] = useState("");
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [selectedToneId, setSelectedToneId] =
    useState<BannerTone["id"]>("sabi-blue");
  const [selectedStyle, setSelectedStyle] =
    useState<BannerStyle["id"]>("classic");

  const selectedTone = useMemo(
    () => BANNER_TONES.find((item) => item.id === selectedToneId) ?? BANNER_TONES[0],
    [selectedToneId]
  );

  return (
    <AppContainer>
      <ScrollView
        style={[styles.screen, { backgroundColor: "#060F19" }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>{texts.eyebrow}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{texts.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{texts.subtitle}</Text>
          </View>
        </View>

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.profileTopRow}>
            <View style={styles.profileLeft}>
              <View
                style={[
                  styles.avatarWrap,
                  {
                    borderRadius: radius.xl,
                  },
                ]}
              >
                <Text style={styles.avatarText}>
                  {displayName.trim().slice(0, 1).toUpperCase() || texts.profileFallback.slice(0, 1).toUpperCase()}
                </Text>

                <Pressable style={styles.avatarEditButton}>
                  <Camera size={13} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={styles.profileTextWrap}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {displayName.trim() || texts.notConfigured}
                </Text>
                <Text style={[styles.profileHandle, { color: colors.textSecondary }]}>
                  @{sabiId.trim() || texts.notConfigured}
                </Text>
                <Text style={[styles.profileStatus, { color: colors.accent }]}>
                  {texts.status}
                </Text>
              </View>
            </View>

            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>{texts.pending}</Text>
            </View>
          </View>

          <View style={styles.profileBadges}>
            <Badge label={texts.internalPay} colors={colors} radius={radius.lg} />
            <Badge label={texts.receive} colors={colors} radius={radius.lg} />
            <Badge label={texts.identity} colors={colors} radius={radius.lg} />
          </View>
        </View>

        <View
          style={[
            styles.bannerSection,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <SectionHeader title={texts.mainBanner} hint={texts.preview} colors={colors} />

          <BannerPreview
            tone={selectedTone}
            styleMode={selectedStyle}
            displayName={displayName.trim() || texts.notConfigured}
            sabiId={sabiId.trim() || texts.notConfigured}
            labels={{
              eyebrow: texts.eyebrow,
              walletIdentity: texts.walletIdentity,
              secureRoute: texts.secureRoute,
              style: texts.style,
              theme: texts.theme,
              classic: "Classic",
            }}
          />

          <View style={styles.bannerInfoRow}>
            <View style={styles.bannerInfoPill}>
              <AtSign size={14} color={selectedTone.accent} />
              <Text style={[styles.bannerInfoText, { color: colors.text }]}>
                @{sabiId}
              </Text>
            </View>

            <View style={styles.bannerInfoPill}>
              <Palette size={14} color={selectedTone.accent} />
              <Text style={[styles.bannerInfoText, { color: colors.text }]}>
                {selectedTone.label}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setAppearanceOpen((prev) => !prev)}
            style={[
              styles.appearanceBar,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <View style={styles.appearanceLeft}>
              <View style={styles.appearanceIconWrap}>
                <Palette size={16} color={selectedTone.accent} />
              </View>
              <View>
                <Text style={[styles.appearanceTitle, { color: colors.text }]}>
                  {texts.bannerAppearance}
                </Text>
                <Text style={[styles.appearanceSubtitle, { color: colors.textSecondary }]}>
                  {selectedTone.label} ·{" "}
                  {BANNER_STYLES.find((item) => item.id === selectedStyle)?.label ??
                    "Classic"}
                </Text>
              </View>
            </View>

            <ChevronDown
              size={18}
              color={colors.textSecondary}
              style={{
                transform: [{ rotate: appearanceOpen ? "180deg" : "0deg" }],
              }}
            />
          </Pressable>

          {appearanceOpen ? (
            <View style={styles.appearancePanel}>
              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {texts.displayName}
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.cardSoft,
                      borderColor: colors.border,
                      borderRadius: radius.lg,
                    },
                  ]}
                >
                  <PencilLine size={18} color={colors.textSecondary} />
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder={texts.displayNamePlaceholder}
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {texts.sabiId}
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.cardSoft,
                      borderColor: colors.border,
                      borderRadius: radius.lg,
                    },
                  ]}
                >
                  <AtSign size={18} color={colors.textSecondary} />
                  <TextInput
                    value={sabiId}
                    onChangeText={setSabiId}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={texts.sabiIdPlaceholder}
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {texts.bannerColor}
                </Text>

                <View style={styles.toneGrid}>
                  {BANNER_TONES.map((tone) => {
                    const active = tone.id === selectedToneId;

                    return (
                      <Pressable
                        key={tone.id}
                        onPress={() => setSelectedToneId(tone.id)}
                        style={[
                          styles.toneOption,
                          {
                            backgroundColor: colors.cardSoft,
                            borderColor: active ? colors.accent : colors.border,
                            borderRadius: radius.lg,
                          },
                        ]}
                      >
                        <View style={styles.toneSwatches}>
                          {tone.colors.map((item) => (
                            <View
                              key={item}
                              style={[styles.toneSwatch, { backgroundColor: item }]}
                            />
                          ))}
                        </View>

                        <Text style={[styles.toneLabel, { color: colors.text }]}>
                          {tone.label}
                        </Text>

                        {active ? (
                          <View style={styles.toneCheckWrap}>
                            <Check size={12} color={colors.accent} />
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {texts.bannerStyle}
                </Text>

                <View style={styles.styleList}>
                  {BANNER_STYLES.map((styleItem) => {
                    const active = styleItem.id === selectedStyle;

                    return (
                      <Pressable
                        key={styleItem.id}
                        onPress={() => setSelectedStyle(styleItem.id)}
                        style={[
                          styles.styleOption,
                          {
                            backgroundColor: active
                              ? "rgba(72,120,255,0.14)"
                              : colors.cardSoft,
                            borderColor: active ? colors.accent : colors.border,
                            borderRadius: radius.lg,
                          },
                        ]}
                      >
                        <View style={styles.styleTextWrap}>
                          <Text style={[styles.styleTitle, { color: colors.text }]}>
                            {styleItem.label}
                          </Text>
                          <Text
                            style={[
                              styles.styleSubtitle,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {styleItem.subtitle}
                          </Text>
                        </View>

                        {active ? <Check size={14} color={colors.accent} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <SectionHeader title={texts.qrAccess} hint={texts.core} colors={colors} />

          <View style={styles.actionsRow}>
            <ActionButton
              title={texts.myQr}
              icon={<QrCode size={18} color={colors.text} />}
              onPress={() =>
                openMySabiQr({
                  displayName: displayName.trim(),
                  sabiId: sabiId.trim(),
                })
              }
              colors={colors}
              radius={radius.lg}
            />
            <ActionButton
              title={texts.scan}
              icon={<ScanLine size={18} color={colors.text} />}
              onPress={() => router.push("/wallet/qr-camera")}
              colors={colors}
              radius={radius.lg}
            />
            <ActionButton
              title={texts.share}
              icon={<Share2 size={18} color={colors.text} />}
              onPress={() => {}}
              colors={colors}
              radius={radius.lg}
            />
            <ActionButton
              title={texts.copyId}
              icon={<Copy size={18} color={colors.text} />}
              onPress={() => {}}
              colors={colors}
              radius={radius.lg}
            />
            <ActionButton
              title={texts.receive}
              icon={<QrCode size={18} color={colors.text} />}
              onPress={() => router.push("/wallet/request-money")}
              colors={colors}
              radius={radius.lg}
            />
            <ActionButton
              title={texts.askAi}
              icon={<Bot size={18} color={colors.text} />}
              onPress={() => router.push("/ai" as never)}
              colors={colors}
              radius={radius.lg}
            />
          </View>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <SectionHeader title={texts.howWorks} hint={texts.flow} colors={colors} />

          <InfoRow
            icon={<AtSign size={18} color={colors.text} />}
            title={texts.internalTitle}
            text={texts.internalText}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoRow
            icon={<QrCode size={18} color={colors.text} />}
            title={texts.qrTitle}
            text={texts.qrText}
            colors={colors}
          />
          <Divider color={colors.border} />
          <InfoRow
            icon={<Palette size={18} color={colors.text} />}
            title={texts.customizeTitle}
            text={texts.customizeText}
            colors={colors}
          />
        </View>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 40,
    flexGrow: 1,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 22,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },

  profileCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  profileLeft: {
    flexDirection: "row",
    gap: 14,
    flex: 1,
  },
  avatarWrap: {
    width: 74,
    height: 74,
    backgroundColor: "#173C9A",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  avatarEditButton: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#0E1D33",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  profileStatus: {
    fontSize: 12,
    fontWeight: "800",
  },
  profileBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(72,120,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(72,120,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeText: {
    color: "#BFD5FF",
    fontSize: 12,
    fontWeight: "800",
  },
  profileBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: "700",
  },

  badge: {
    minHeight: 34,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  bannerSection: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  bannerCard: {
    minHeight: 220,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  bannerGlowA: {
    position: "absolute",
    top: -16,
    left: -14,
    width: 190,
    height: 135,
    borderRadius: 44,
  },
  bannerGlowB: {
    position: "absolute",
    right: -24,
    bottom: -30,
    width: 220,
    height: 150,
    borderRadius: 60,
  },
  bannerShine: {
    position: "absolute",
    top: -50,
    right: 44,
    width: 92,
    height: 280,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "22deg" }],
  },
  bannerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  bannerEyebrow: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
    marginBottom: 4,
  },
  bannerHandle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    fontWeight: "700",
  },
  bannerChip: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCenterBlock: {
    zIndex: 2,
  },
  bannerCenterLabel: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bannerCenterValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  bannerBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    zIndex: 2,
  },
  bannerBottomRight: {
    alignItems: "flex-end",
  },
  bannerMetaLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  bannerMetaValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  bannerInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
  },
  bannerInfoPill: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(72,120,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(72,120,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  bannerInfoText: {
    fontSize: 12,
    fontWeight: "800",
  },

  appearanceBar: {
    minHeight: 60,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appearanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  appearanceIconWrap: {
    width: 34,
    alignItems: "center",
  },
  appearanceTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  appearanceSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  appearancePanel: {
    marginTop: 14,
  },

  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  inputRow: {
    minHeight: 54,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },

  toneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  toneOption: {
    width: "48.5%",
    minHeight: 76,
    borderWidth: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  toneSwatches: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 10,
  },
  toneSwatch: {
    flex: 1,
    height: 18,
    borderRadius: 999,
  },
  toneLabel: {
    fontSize: 12,
    fontWeight: "900",
    paddingRight: 18,
  },
  toneCheckWrap: {
    position: "absolute",
    right: 10,
    bottom: 10,
  },

  styleList: {
    gap: 10,
  },
  styleOption: {
    minHeight: 64,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  styleTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  styleTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  styleSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },

  sectionCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    minWidth: 98,
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonIcon: {
    minHeight: 20,
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  infoCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 20,
    alignItems: "center",
    paddingTop: 2,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
});
