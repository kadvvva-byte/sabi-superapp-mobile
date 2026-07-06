import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
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
import { ArrowLeft, Link2, Plus, Trash2 } from "lucide-react-native";

import { useI18n } from "../../../shared/i18n";
import { profileKernelFacade } from "../../../core/kernel/profile";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";

type LocalIconProps = { size?: number; color?: string; strokeWidth?: number; style?: unknown };
const BackIcon = ArrowLeft as unknown as React.ComponentType<LocalIconProps>;
const LinkIcon = Link2 as unknown as React.ComponentType<LocalIconProps>;
const PlusIcon = Plus as unknown as React.ComponentType<LocalIconProps>;
const TrashIcon = Trash2 as unknown as React.ComponentType<LocalIconProps>;

const BG_TOP = "#04120D";
const BG_MID = "#062018";
const BG_BOTTOM = "#08261E";
const TEXT = "#F5FBFF";
const MUTED = "#A8C3D7";
const CARD = "rgba(14, 28, 46, 0.86)";
const CARD_BORDER = "rgba(120, 220, 160, 0.14)";

type I18nHookValue =
  | ((key: string, params?: Record<string, unknown>) => string)
  | { t?: (key: string, params?: Record<string, unknown>) => string };

export default function ProfileLinksScreen() {
  const i18n = useI18n() as I18nHookValue;
  const profile = useProfileKernel();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, unknown>) => {
      let value = key;
      if (typeof i18n === "function") value = i18n(key, params);
      else if (i18n && typeof i18n.t === "function") value = i18n.t(key, params);
      return typeof value === "string" && value.length && value !== key ? value : fallback ?? key;
    },
    [i18n],
  );

  const items = useMemo(() => profile.links, [profile.links]);

  const handleAdd = useCallback(async () => {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      Alert.alert(t("common.required", "Majburiy"), t("profile.linksScreen.form.urlPlaceholder", "https://your-link"));
      return;
    }
    await profileKernelFacade.addLink(cleanUrl, label.trim() || undefined);
    setLabel("");
    setUrl("");
  }, [label, t, url]);

  const handleRemove = useCallback(async (id: string) => {
    await profileKernelFacade.removeLink(id);
  }, []);

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <BackIcon size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>
            <Text style={styles.headerTitle}>{t("profile.linksScreen.header.title", "Havolalar")}</Text>
            <View style={styles.headerButtonPlaceholder} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>{t("profile.linksScreen.card.title", "Profil havolalari")}</Text>
              <Text style={styles.subtitle}>{t("profile.linksScreen.card.subtitle", "Ommaviy profilingizda ko‘rinadigan havolalarni shu yerda boshqaring.")}</Text>

              <TextInput value={label} onChangeText={setLabel} placeholder={t("profile.linksScreen.form.labelPlaceholder", "Label")} placeholderTextColor={MUTED} style={styles.input} />
              <TextInput value={url} onChangeText={setUrl} placeholder={t("profile.linksScreen.form.urlPlaceholder", "https://your-link")} placeholderTextColor={MUTED} style={styles.input} autoCapitalize="none" keyboardType="url" />

              <Pressable onPress={() => void handleAdd()} style={styles.primaryAction}>
                <PlusIcon size={15} color={TEXT} strokeWidth={2.4} />
                <Text style={styles.primaryActionText}>{t("common.add", "Qo‘shish")}</Text>
              </Pressable>
            </View>

            {items.length ? items.map((item) => (
              <View key={item.id} style={styles.linkCard}>
                <View style={styles.linkLeft}>
                  <LinkIcon size={16} color={TEXT} strokeWidth={2.4} />
                  <View style={styles.linkTextWrap}>
                    <Text style={styles.linkTitle}>{item.label || item.url}</Text>
                    <Text style={styles.linkSubtitle}>{item.url}</Text>
                  </View>
                </View>
                <Pressable onPress={() => void handleRemove(item.id)} style={styles.removeButton}>
                  <TrashIcon size={16} color={TEXT} strokeWidth={2.4} />
                </Pressable>
              </View>
            )) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{t("profile.linksScreen.empty.title", "Hali havolalar yo‘q")}</Text>
                <Text style={styles.emptyText}>{t("profile.linksScreen.empty.description", "Birinchi havolani qo‘shing.")}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 }, safeArea: { flex: 1 }, container: { flex: 1, paddingHorizontal: 16 },
  headerRow: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(12,28,25,0.86)", borderWidth: 1, borderColor: "rgba(121,228,162,0.18)", alignItems: "center", justifyContent: "center" },
  headerButtonPlaceholder: { width: 44, height: 44 }, headerTitle: { color: TEXT, fontSize: 18, fontWeight: "900" },
  content: { paddingTop: 14, paddingBottom: 32, gap: 12 },
  card: { borderRadius: 24, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, padding: 16 },
  title: { color: TEXT, fontSize: 24, fontWeight: "900" },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 20, fontWeight: "600", marginTop: 8, marginBottom: 14 },
  input: { borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", color: TEXT, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: "600", marginBottom: 10 },
  primaryAction: { minHeight: 46, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 4 },
  primaryActionText: { color: TEXT, fontSize: 14, fontWeight: "800" },
  linkCard: { borderRadius: 18, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  linkLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }, linkTextWrap: { flex: 1 },
  linkTitle: { color: TEXT, fontSize: 14, fontWeight: "800" }, linkSubtitle: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "600", marginTop: 3 },
  removeButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" },
  emptyCard: { borderRadius: 18, backgroundColor: CARD, borderWidth: 1, borderColor: CARD_BORDER, padding: 14 },
  emptyTitle: { color: TEXT, fontSize: 15, fontWeight: "800" }, emptyText: { color: MUTED, fontSize: 12, lineHeight: 18, fontWeight: "600", marginTop: 6 },
});
