import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
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
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Gift,
  Heart,
  Images,
  Palette,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
  Video,
  X,
} from "lucide-react-native";

import { useI18n } from "@/shared/i18n";
import { profileKernelFacade } from "@/core/kernel/profile";
import { syncCurrentProfilePublicSurface, syncCurrentProfilePublicSurfaceToBackend } from "@/modules/messenger/public/publicProfileSync";
import { hydratePublicProfile, hydratePublicProfileStorage, subscribePublicProfiles } from "@/modules/messenger/public/publicProfileRuntime";
import { useProfileKernel } from "@/core/kernel/profile/bindings";

const BG_TOP = "#04120D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const CARD = "rgba(14, 28, 46, 0.86)";
const CARD_ALT = "rgba(20, 39, 58, 0.84)";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const SOFT = "#DCEAF5";
const GREEN = "#77E28C";
const TEAL = "#58D5C9";
const BLUE = "#63A8FF";
const PURPLE = "#B588FF";
const GOLD = "#FFCC66";
const PINK = "#FF8FB9";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | { t?: (key: string, params?: Record<string, unknown>) => string; language?: string };

type PublicProfileInfoDraft = {
  publicName: string;
  publicUsername: string;
  publicBio: string;
  publicSubtitle: string;
};

type PublicCard = {
  key: string;
  title: string;
  subtitle: string;
  stat: string;
  icon: React.ReactNode;
  route?: string;
  accent: [string, string];
};

type PublicRow = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
};

function normalizePublicUsername(value?: string | null) {
  return String(value ?? "").trim().replace(/^@+/, "").replace(/\s+/g, "");
}

function extractFirstLetter(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const match = raw.match(/\p{L}/u);
  return match ? match[0].toUpperCase() : "";
}

function goBackOrProfileHome() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/profile" as never);
}

function PublicIdentityCard(props: {
  title: string;
  subtitle: string;
  handle: string;
  profileId: string;
  avatarUri?: string | null;
  verified?: boolean;
  editPublicLabel: string;
  kernelLinkedLabel: string;
  onEdit: () => void;
}) {
  const letter = extractFirstLetter(props.title) || extractFirstLetter(props.handle) || "S";
return (
    <LinearGradient
      colors={[
        "rgba(24,46,70,0.98)",
        "rgba(18,28,56,0.96)",
        "rgba(10,24,34,0.94)",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.heroTop}>
        <View style={styles.avatarShell}>
          {props.avatarUri ? (
            <Image source={{ uri: props.avatarUri }} style={styles.heroAvatar} />
          ) : (
            <LinearGradient colors={["#58D5C9", "#63A8FF"]} style={styles.heroAvatarFallback}>
              <Text style={styles.heroAvatarLetter}>{letter}</Text>
            </LinearGradient>
          )}
          {props.verified ? (
            <View style={styles.verifiedBadge}>
              <BadgeCheck size={14} color={TEXT} strokeWidth={2.6} />
            </View>
          ) : null}
        </View>

        <View style={styles.heroPills}>
          <Pressable onPress={props.onEdit} style={styles.heroBadge}>
            <User size={13} color={TEXT} strokeWidth={2.4} />
            <Text style={styles.heroBadgeText}>{props.editPublicLabel}</Text>
          </Pressable>

          <View style={styles.heroBadgeSecondary}>
            <Sparkles size={13} color={TEXT} strokeWidth={2.4} />
            <Text style={styles.heroBadgeText}>{props.kernelLinkedLabel}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.heroTitle}>{props.title}</Text>
      <Text style={styles.heroHandle}>{props.handle}</Text>
      <Text style={styles.heroSubtitle}>{props.subtitle}</Text>
      <Text style={styles.heroMeta}>{props.profileId}</Text>
    </LinearGradient>
  );
}

function PublicMetricCard({ item }: { item: PublicCard }) {
  const content = (
    <LinearGradient colors={item.accent} style={styles.metricCardGradient}>
      <View style={styles.metricCardInner}>
        <View style={styles.metricIconWrap}>{item.icon}</View>
        <Text style={styles.metricTitle}>{item.title}</Text>
        <Text style={styles.metricSubtitle}>{item.subtitle}</Text>
        <Text style={styles.metricValue}>{item.stat}</Text>
      </View>
    </LinearGradient>
  );

  if (!item.route) return <View style={styles.metricCard}>{content}</View>;
  return (
    <Pressable onPress={() => router.push(item.route as never)} style={styles.metricCard}>
      {content}
    </Pressable>
  );
}

function PublicSection({ title, rows }: { title: string; rows: PublicRow[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.groupCard}>
        {rows.map((row, index) => (
          <Pressable
            key={row.key}
            onPress={() => router.push(row.route as never)}
            style={[styles.row, index !== rows.length - 1 && styles.rowBorder]}
          >
            <View style={styles.rowIcon}>{row.icon}</View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              {!!row.description && <Text style={styles.rowDescription}>{row.description}</Text>}
            </View>
            {row.badge ? (
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>{row.badge}</Text>
              </View>
            ) : (
              <ChevronRight size={16} color={MUTED} strokeWidth={2.4} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ProfilePublicScreen() {
  const i18n = useI18n() as I18nHookValue;
  const profileKernel = useProfileKernel();
  const account = profileKernel.account;
  const publicProfile = profileKernel.publicProfile;
const counts = profileKernel.counts;

  const [editorVisible, setEditorVisible] = useState(false);
  const [publicSurfaceRevision, setPublicSurfaceRevision] = useState(0);
  const [draft, setDraft] = useState<PublicProfileInfoDraft>({
    publicName: publicProfile.publicName || "",
    publicUsername: publicProfile.publicUsername || "",
    publicBio: publicProfile.publicBio || "",
    publicSubtitle: publicProfile.publicSubtitle || "",
  });

  useEffect(() => {
    let mounted = true;

    void hydratePublicProfileStorage().then(() => {
      if (mounted) setPublicSurfaceRevision((value) => value + 1);
    });

    const unsubscribe = subscribePublicProfiles(() => {
      setPublicSurfaceRevision((value) => value + 1);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const publicSurface = useMemo(() => {
    const aliases = [
      account.userId,
      account.sabiDisplayId,
      account.username,
      account.username ? `@${String(account.username).replace(/^@+/, "")}` : "",
      account.phone,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    for (const alias of aliases) {
      const snapshot = hydratePublicProfile(alias);
      if (
        snapshot &&
        (snapshot.updatedAt > 0 ||
          snapshot.likesCount > 0 ||
          snapshot.publicGiftsCount > 0 ||
          snapshot.publicationPhotos.length > 0 ||
          snapshot.publicationVideos.length > 0)
      ) {
        return snapshot;
      }
    }

    return null;
  }, [
    account.phone,
    account.sabiDisplayId,
    account.userId,
    account.username,
    publicSurfaceRevision,
  ]);

  const publicSurfaceLikedMediaCount = useMemo(() => {
    const photos = Array.isArray(publicSurface?.publicationPhotos) ? publicSurface.publicationPhotos : [];
    const videos = Array.isArray(publicSurface?.publicationVideos) ? publicSurface.publicationVideos : [];
    return [...photos, ...videos].filter((item) => Boolean(item?.liked)).length;
  }, [publicSurface]);

  const effectiveLikesCount = Math.max(
    Number(profileKernel.likesCount || 0),
    Number(publicSurface?.likesCount || 0),
    publicSurfaceLikedMediaCount,
  );

  const effectivePublicGiftsCount = Math.max(
    Number(profileKernel.giftsCount || 0),
    Number(publicSurface?.publicGiftsCount || 0),
  );

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

  const tx = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t],
  );

  const displayFullName =
    draft.publicName.trim() ||
    account.fullName ||
    [account.firstName, account.lastName].filter(Boolean).join(" ").trim() ||
    tx("profile.publicScreen.defaults.publicName", "Sabi foydalanuvchisi");
  const displayHandle = draft.publicUsername.trim()
    ? `@${normalizePublicUsername(draft.publicUsername)}`
    : account.username
      ? `@${String(account.username).replace(/^@+/, "")}`
      : "@sabi";
  const displayBio = draft.publicBio.trim() || account.bio || tx("profile.publicScreen.fallback.bio", "Ommaviy bio hali bo‘sh.");
  const displaySubtitle = draft.publicSubtitle.trim() || account.subtitle || tx("profile.publicScreen.fallback.subtitle", "Ommaviy profil ko‘rinishi identitetingizga ulangan.");
  const displayProfileId = account.sabiDisplayId || account.userId || "SABI";
  const avatarUri = profileKernel.avatarUri ?? account.avatarUri ?? null;

  useEffect(() => {
    void syncCurrentProfilePublicSurface(profileKernel.state);
    void syncCurrentProfilePublicSurfaceToBackend(profileKernel.state);
  }, [profileKernel.state]);

  const identityCards = useMemo<PublicCard[]>(
    () => [
      {
        key: "photos",
        title: tx("profile.surface.photos.title", "Rasmlar"),
        subtitle: tx("profile.surface.photos.subtitle", "Profil rasmlarini boshqarish"),
        stat: String(counts.photoCount),
        icon: <Images size={18} color={TEAL} strokeWidth={2.4} />,
        route: "/profile/photos",
        accent: ["rgba(88,213,201,0.34)", "rgba(99,168,255,0.22)"],
      },
      {
        key: "videos",
        title: tx("profile.surface.shortVideos.title", "Qisqa videolar"),
        subtitle: tx("profile.surface.shortVideos.subtitle", "Ommaviy qisqa videolarni boshqarish"),
        stat: String(counts.shortVideoCount),
        icon: <Video size={18} color={BLUE} strokeWidth={2.4} />,
        route: "/profile/short-videos",
        accent: ["rgba(99,168,255,0.34)", "rgba(181,136,255,0.22)"],
      },
      {
        key: "likes",
        title: tx("profile.surface.likes.title", "Layklar"),
        subtitle: tx("profile.surface.likes.subtitle", "Ommaviy profil layklari"),
        stat: String(effectiveLikesCount),
        icon: <Heart size={18} color={GOLD} strokeWidth={2.4} />,
        route: "/profile/likes",
        accent: ["rgba(255,204,102,0.34)", "rgba(255,143,185,0.22)"],
      },
      {
        key: "gifts",
        title: tx("profile.giftsScreen.header.title", "Sovg‘alar"),
        subtitle: tx("profile.giftsBlock.description", "Ommaviy sovg‘a hisoblagichlari"),
        stat: String(effectivePublicGiftsCount),
        icon: <Gift size={18} color={TEAL} strokeWidth={2.4} />,
        route: "/profile/gifts",
        accent: ["rgba(88,213,201,0.34)", "rgba(255,204,102,0.20)"],
      },
    ],
    [counts.photoCount, counts.shortVideoCount, effectiveLikesCount, effectivePublicGiftsCount, tx],
  );

  const publicRows = useMemo<PublicRow[]>(
    () => [
      {
        key: "photos",
        title: tx("profile.publicScreen.rows.photos.title", "Ommaviy rasmlar"),
        description: tx("profile.publicScreen.rows.photos.description", "Ko‘rinadigan profil rasmlarini boshqaring."),
        icon: <Images size={18} color={TEAL} strokeWidth={2.4} />,
        route: "/profile/photos",
      },
      {
        key: "videos",
        title: tx("profile.publicScreen.rows.videos.title", "Ommaviy videolar"),
        description: tx("profile.publicScreen.rows.videos.description", "Ommaviy qisqa videolarni boshqaring."),
        icon: <Video size={18} color={BLUE} strokeWidth={2.4} />,
        route: "/profile/short-videos",
      },
      {
        key: "qr",
        title: tx("profile.editScreen.presentation.qr.title", "Profil QR"),
        description: tx("profile.editScreen.presentation.qr.description", "QR va ulashish qoidalari."),
        icon: <QrCode size={18} color={PURPLE} strokeWidth={2.4} />,
        route: "/profile/qr",
      },
      {
        key: "privacy",
        title: tx("profile.editScreen.safety.privacy.title", "Maxfiylik"),
        description: tx("profile.editScreen.safety.privacy.description", "Ommaviy ko‘rinish nazorati."),
        icon: <ShieldCheck size={18} color={GREEN} strokeWidth={2.4} />,
        route: "/profile/privacy",
      },
      {
        key: "colors",
        title: tx("profile.editScreen.presentation.colors.title", "Ranglar"),
        description: tx("profile.editScreen.presentation.colors.description", "Ramka va ommaviy ko‘rinish."),
        icon: <Palette size={18} color={PINK} strokeWidth={2.4} />,
        route: "/profile/colors",
      },
    ],
    [tx],
  );

  const openEditor = useCallback(() => {
    setDraft({
      publicName: publicProfile.publicName || "",
      publicUsername: publicProfile.publicUsername || "",
      publicBio: publicProfile.publicBio || "",
      publicSubtitle: publicProfile.publicSubtitle || "",
    });
    setEditorVisible(true);
  }, [publicProfile]);

  const handleSave = useCallback(async () => {
    const payload = {
      publicName: draft.publicName.trim(),
      publicUsername: normalizePublicUsername(draft.publicUsername),
      publicBio: draft.publicBio.trim(),
      publicSubtitle: draft.publicSubtitle.trim(),
    };
    try {
      const nextState = await profileKernelFacade.updatePublicProfile(payload as any);
      syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
      setEditorVisible(false);
      Alert.alert(tx("success.saved", "Saqlandi"), tx("success.profileUpdated", "Ommaviy profil yangilandi"));
    } catch {
      Alert.alert(tx("errors.somethingWentWrong", "Xato"), tx("errors.tryAgain", "Qayta urinib ko‘ring"));
    }
  }, [draft, tx]);

  const handleReset = useCallback(() => {
    setDraft({ publicName: "", publicUsername: "", publicBio: "", publicSubtitle: "" });
    void profileKernelFacade.updatePublicProfile({ publicName: "", publicUsername: "", publicBio: "", publicSubtitle: "" } as any).then((nextState: any) => {
      syncCurrentProfilePublicSurface(nextState);
    void syncCurrentProfilePublicSurfaceToBackend(nextState);
    });
  }, []);

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={goBackOrProfileHome} style={styles.headerButton}>
              <ArrowLeft size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>
            <Text style={styles.headerTitle}>{tx("profile.publicScreen.header.title", "Ommaviy profil")}</Text>
            <Pressable onPress={openEditor} style={styles.headerAction}>
              <Text style={styles.headerActionText}>{tx("common.edit", "Tahrirlash")}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.introBlock}>
              <Text style={styles.eyebrow}>{tx("profile.hub.eyebrow", "OMMAVIY IDENTITET")}</Text>
              <Text style={styles.title}>{tx("profile.publicScreen.hero.title", "Ommaviy profil qatlamingiz")}</Text>
              <Text style={styles.subtitle}>{tx("profile.publicScreen.hero.subtitle", "Boshqalarga ko‘rinadigan hamma narsa shu yerda kernelga ulangan profil holati orqali boshqariladi.")}</Text>
            </View>

            <PublicIdentityCard
              title={displayFullName}
              subtitle={displayBio || displaySubtitle}
              handle={displayHandle}
              profileId={displayProfileId}
              avatarUri={avatarUri}
              verified={account.verificationStatus === "verified"}
              editPublicLabel={tx("profile.publicScreen.hero.badges.editPublic", "Ommaviy profilni tahrirlash")}
              kernelLinkedLabel={tx("profile.publicScreen.hero.badges.kernelLinked", "Profil tizimiga ulangan")}
              onEdit={openEditor}
            />

            <Text style={styles.sectionTitle}>{tx("profile.publicScreen.sections.metrics", "Ommaviy ko‘rsatkichlar")}</Text>
            <View style={styles.metricsGrid}>
              {identityCards.map((item) => <PublicMetricCard key={item.key} item={item} />)}
            </View>

            <PublicSection title={tx("profile.publicScreen.sections.manage", "Ommaviy identitetni boshqarish")} rows={publicRows} />
          </ScrollView>
        </View>

        <Modal visible={editorVisible} animationType="slide" transparent onRequestClose={() => setEditorVisible(false)}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setEditorVisible(false)} />
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{tx("profile.publicScreen.editor.title", "Ommaviy identitetni tahrirlash")}</Text>
                <Pressable style={styles.closeButton} onPress={() => setEditorVisible(false)}>
                  <X size={18} color={TEXT} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <EditorField label={tx("profile.publicScreen.editor.name", "Ommaviy ism")} value={draft.publicName} onChangeText={(value) => setDraft((current) => ({ ...current, publicName: value }))} placeholder={tx("profile.publicScreen.editor.placeholders.name", "Sabi foydalanuvchisi")} />
                <EditorField label={tx("profile.publicScreen.editor.username", "Ommaviy foydalanuvchi nomi")} value={draft.publicUsername} onChangeText={(value) => setDraft((current) => ({ ...current, publicUsername: normalizePublicUsername(value) }))} placeholder={tx("profile.publicScreen.editor.placeholders.username", "foydalanuvchi_nomi")} prefix="@" />
                <EditorField label={tx("profile.publicScreen.editor.bio", "Ommaviy bio")} value={draft.publicBio} onChangeText={(value) => setDraft((current) => ({ ...current, publicBio: value }))} placeholder={tx("profile.publicScreen.editor.placeholders.bio", "Qisqa ommaviy bio")} multiline />
                <EditorField label={tx("profile.publicScreen.editor.subtitle", "Ommaviy taglavha")} value={draft.publicSubtitle} onChangeText={(value) => setDraft((current) => ({ ...current, publicSubtitle: value }))} placeholder={tx("profile.publicScreen.editor.placeholders.subtitle", "Profil kartalarida ko‘rinadigan taglavha")} multiline />
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable onPress={handleReset} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>{tx("common.reset", "Tiklash")}</Text>
                </Pressable>
                <Pressable onPress={handleSave} style={styles.primaryButton}>
                  <LinearGradient colors={["#63A8FF", "#58D5C9"]} style={styles.primaryButtonFill}>
                    <Text style={styles.primaryButtonText}>{tx("common.save", "Saqlash")}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

function EditorField(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <View style={styles.inputShell}>
        {props.prefix ? <Text style={styles.prefixText}>{props.prefix}</Text> : null}
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={MUTED}
          multiline={props.multiline}
          style={[styles.input, props.multiline ? styles.inputMultiline : null]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },
  headerRow: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER },
  headerTitle: { flex: 1, textAlign: "center", color: TEXT, fontSize: 18, fontWeight: "800" },
  headerAction: { minWidth: 60, alignItems: "flex-end" },
  headerActionText: { color: TEAL, fontSize: 13, fontWeight: "700" },
  scrollContent: { paddingTop: 18, paddingBottom: 28 },
  introBlock: { marginBottom: 16 },
  eyebrow: { color: GREEN, fontSize: 12, fontWeight: "800", letterSpacing: 1.2, marginBottom: 8 },
  title: { color: TEXT, fontSize: 28, fontWeight: "900", lineHeight: 32 },
  subtitle: { marginTop: 8, color: MUTED, fontSize: 14, lineHeight: 20 },
  heroCard: { padding: 18, borderRadius: 28, borderWidth: 1, borderColor: CARD_BORDER, marginBottom: 18 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  avatarShell: { position: "relative" },
  heroAvatar: { width: 96, height: 96, borderRadius: 28 },
  heroAvatarFallback: { width: 96, height: 96, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  heroAvatarLetter: { color: TEXT, fontSize: 34, fontWeight: "900" },
  verifiedBadge: { position: "absolute", right: -6, bottom: -6, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: GREEN, borderWidth: 2, borderColor: "rgba(4,18,13,0.9)" },
  heroPills: { alignItems: "flex-end", gap: 10 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  heroBadgeSecondary: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  heroBadgeText: { color: SOFT, fontSize: 12, fontWeight: "700" },
  heroTitle: { color: TEXT, fontSize: 26, fontWeight: "900", marginBottom: 6 },
  heroHandle: { color: TEAL, fontSize: 15, fontWeight: "700", marginBottom: 8 },
  heroSubtitle: { color: SOFT, fontSize: 14, lineHeight: 20 },
  heroMeta: { marginTop: 10, color: MUTED, fontSize: 12, fontWeight: "700" },
  section: { marginBottom: 18 },
  sectionTitle: { color: TEXT, fontSize: 18, fontWeight: "800", marginBottom: 12 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 20 },
  metricCard: { width: "48%" },
  metricCardGradient: { borderRadius: 24, padding: 1 },
  metricCardInner: { minHeight: 150, borderRadius: 23, backgroundColor: CARD_ALT, padding: 14 },
  metricIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 12 },
  metricTitle: { color: TEXT, fontSize: 15, fontWeight: "800" },
  metricSubtitle: { color: MUTED, fontSize: 12, lineHeight: 17, marginTop: 4 },
  metricValue: { marginTop: 14, color: TEXT, fontSize: 28, fontWeight: "900" },
  groupCard: { backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 24, overflow: "hidden" },
  row: { minHeight: 82, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: CARD_BORDER },
  rowIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  rowTextWrap: { flex: 1 },
  rowTitle: { color: TEXT, fontSize: 15, fontWeight: "800", marginBottom: 4 },
  rowDescription: { color: MUTED, fontSize: 12, lineHeight: 18 },
  badgeWrap: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: CARD_BORDER },
  badgeText: { color: SOFT, fontSize: 11, fontWeight: "700" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalSheet: { backgroundColor: "#0A1B2A", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 20, maxHeight: "86%", borderTopWidth: 1, borderColor: CARD_BORDER },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalTitle: { color: TEXT, fontSize: 18, fontWeight: "900" },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: CARD },
  modalContent: { paddingBottom: 16 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { color: SOFT, fontSize: 13, fontWeight: "700", marginBottom: 8 },
  inputShell: { minHeight: 54, borderRadius: 18, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  prefixText: { color: TEAL, fontSize: 16, fontWeight: "700", marginRight: 8 },
  input: { flex: 1, color: TEXT, fontSize: 15, paddingVertical: 14 },
  inputMultiline: { minHeight: 96, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 6 },
  secondaryButton: { flex: 1, minHeight: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER },
  secondaryButtonText: { color: SOFT, fontSize: 14, fontWeight: "800" },
  primaryButton: { flex: 1 },
  primaryButtonFill: { minHeight: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#04120D", fontSize: 14, fontWeight: "900" },
});

