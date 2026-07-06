import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Mic, Pause, Play, Square, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileKernelFacade } from "../../../core/kernel/profile";
import { useProfileKernel } from "../../../core/kernel/profile/bindings";
import { useI18n } from "../../../shared/i18n";

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

function formatClock(ms: number) {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const mm = `${Math.floor(safe / 60)}`.padStart(2, "0");
  const ss = `${safe % 60}`.padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function ProfileVoiceRoute() {
  const i18n = useI18n() as I18nHookValue;
  const profile = useProfileKernel();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

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

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (recording) {
        void recording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, [recording]);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t("profile.voiceScreen.alerts.permission.title"),
          t("profile.voiceScreen.alerts.permission.message"),
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const next = new Audio.Recording();
      await next.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await next.startAsync();
      setRecording(next);
    } catch {
      Alert.alert(
        t("common.error", { default: "Xato" }) as string,
        t("profile.voiceScreen.alerts.recordFailed", {
          default: "Ovoz yozib bo‘lmadi.",
        }) as string,
      );
    }
  }, [t]);

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      if (uri) {
        await profileKernelFacade.addVoiceNote({
          id: `voice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          uri,
          durationMs: typeof status.durationMillis === "number" ? status.durationMillis : 0,
          createdAt: Date.now(),
        });
      }
    } finally {
      setRecording(null);
    }
  }, [recording]);

  const playVoice = useCallback(async (id: string, uri: string) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    const { sound } = await Audio.Sound.createAsync({ uri });
    soundRef.current = sound;
    setPlayingId(id);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setPlayingId(null);
      }
    });
    await sound.playAsync();
  }, []);

  const pauseVoice = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.pauseAsync();
    setPlayingId(null);
  }, []);

  const removeVoice = useCallback(
    async (id: string) => {
      await profileKernelFacade.removeVoiceNote(id);
      if (playingId === id) setPlayingId(null);
    },
    [playingId],
  );

  return (
    <LinearGradient colors={[BG_TOP, BG_MID, BG_BOTTOM]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={18} color={TEXT} strokeWidth={2.4} />
            </Pressable>
            <Text style={styles.headerTitle}>{t("profile.voiceScreen.header.title")}</Text>
            <View style={styles.headerButtonPlaceholder} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>{t("profile.voiceScreen.card.title")}</Text>
              <Text style={styles.subtitle}>{t("profile.voiceScreen.card.subtitle")}</Text>

              <Pressable
                onPress={() => void (recording ? stopRecording() : startRecording())}
                style={styles.primaryAction}
              >
                {recording ? (
                  <Square size={16} color={TEXT} strokeWidth={2.4} />
                ) : (
                  <Mic size={16} color={TEXT} strokeWidth={2.4} />
                )}
                <Text style={styles.primaryActionText}>
                  {recording
                    ? t("profile.voiceScreen.actions.stop", { default: "To‘xtatish" })
                    : t("profile.voiceScreen.actions.record", { default: "Yozish" })}
                </Text>
              </Pressable>
            </View>

            {profile.voiceNotes.map((item) => {
              const active = playingId === item.id;
              return (
                <View key={item.id} style={styles.noteCard}>
                  <View style={styles.noteLeft}>
                    <View style={styles.noteIcon}>
                      <Mic size={16} color={TEXT} strokeWidth={2.4} />
                    </View>
                    <View style={styles.noteTextWrap}>
                      <Text style={styles.noteTitle}>
                        {t("profile.voiceScreen.item.title", { default: "Ovozli eslatma" })}
                      </Text>
                      <Text style={styles.noteSubtitle}>{formatClock(item.durationMs)}</Text>
                    </View>
                  </View>
                  <View style={styles.noteActions}>
                    <Pressable
                      onPress={() => void (active ? pauseVoice() : playVoice(item.id, item.uri))}
                      style={styles.smallButton}
                    >
                      {active ? (
                        <Pause size={16} color={TEXT} strokeWidth={2.4} />
                      ) : (
                        <Play size={16} color={TEXT} strokeWidth={2.4} />
                      )}
                    </Pressable>
                    <Pressable onPress={() => void removeVoice(item.id)} style={styles.smallButton}>
                      <Trash2 size={16} color={TEXT} strokeWidth={2.4} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },
  headerRow: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(12,28,25,0.86)",
    borderWidth: 1,
    borderColor: "rgba(121,228,162,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonPlaceholder: { width: 44, height: 44 },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: "900" },
  content: { paddingTop: 14, paddingBottom: 32, gap: 12 },
  card: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },
  title: { color: TEXT, fontSize: 24, fontWeight: "900" },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 14,
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryActionText: { color: TEXT, fontSize: 14, fontWeight: "800" },
  noteCard: {
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  noteLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  noteTextWrap: { flex: 1 },
  noteTitle: { color: TEXT, fontSize: 14, fontWeight: "800" },
  noteSubtitle: { color: MUTED, fontSize: 12, marginTop: 3 },
  noteActions: { flexDirection: "row", gap: 8 },
  smallButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
});
