import {
  Check,
  ChevronDown,
  Languages,
  Mic,
  PauseCircle,
  Play,
  RefreshCw,
  Square,
  Volume2,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useI18n } from "../../../../shared/i18n";
import {
  AI_TRANSLATION_LANGUAGES,
  AI_TRANSLATION_TARGET_LANGUAGES,
  getTranslationLanguageLabel,
  getTranslationLanguageSearchText,
  type AiTranslationLanguageCode,
  type AiTranslationLanguageItem,
} from "../../translation/aiTranslationLanguages";
import { aiMobileApi } from "../aiMobileApi";
import { aiMobileErrorText, aiMobileText } from "../aiMobileI18n";
import { AI_MOBILE_COLORS } from "../aiMobileTheme";
import type { AiMobileApiError, AiMobileTranslationResult, AiMobileVoiceSession } from "../aiMobileTypes";
import {
  AiGlassCard,
  AiMobileScaffold,
  AiStatusPill,
} from "../components/AiMobileScaffold";
import { useAiMobileSnapshot } from "../useAiMobileSnapshot";
import { aiVoiceMobileBridge } from "../voice/aiVoiceMobileBridge";
import { useAiVoiceBridge } from "../voice/useAiVoiceBridge";

type LanguagePickerMode = "source" | "target";

function normalizeLanguageTag(value: string): string {
  return value.trim().toLowerCase();
}

function isProviderUnavailableError(error?: AiMobileApiError | null): boolean {
  const code = normalizeLanguageTag(error?.code || "");
  const message = normalizeLanguageTag(error?.message || "");
  const text = code + " " + message;

  return (
    code === "ai_provider_gateway_unavailable" ||
    code === "ai_gateway_timeout" ||
    text.includes("not_configured") ||
    text.includes("not configured") ||
    text.includes("provider gateway") ||
    text.includes("gateway unavailable")
  );
}

function aiVoiceTranslationErrorText(language: string, error: AiMobileApiError): string {
  if (isProviderUnavailableError(error)) {
    const lang = normalizeLanguageTag(language);

    if (lang.startsWith("uz")) {
      return "Ovozli tarjima provayderi serverda hali ulanmagan. Ishga tushirishdan oldin real kalitlar va gateway URL ulanadi. Hozir ovozli tarjima mavjud emas.";
    }

    if (lang.startsWith("ru")) {
      return "Провайдер голосового перевода пока не подключён на сервере. Перед запуском подключим реальные ключи и gateway URL. Сейчас голосовой перевод недоступен.";
    }

    return "Voice translation provider is not connected on the server yet. Real keys and gateway URL will be connected before launch. Voice translation is currently unavailable.";
  }

  return aiMobileErrorText(language, error);
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "active", "enabled", "premium", "paid", "yes", "1"].includes(normalized)) return true;
    if (["false", "inactive", "disabled", "free", "no", "0"].includes(normalized)) return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return null;
}

function recordHasTrue(record: Record<string, unknown> | null, keys: string[]): boolean {
  if (!record) return false;
  return keys.some((key) => toBoolean(record[key]) === true);
}

function hasAiPremiumAccess(snapshot: unknown): boolean {
  const root = toRecord(snapshot);
  if (!root) return false;
  if (recordHasTrue(root, ["isPremium", "premium", "premiumActive", "aiPremium", "aiPremiumActive", "hasAiPremium", "paidAiEnabled"])) return true;

  const nestedRecords = [
    toRecord(root.access),
    toRecord(root.aiAccess),
    toRecord(root.premium),
    toRecord(root.subscription),
    toRecord(root.entitlements),
    toRecord(root.features),
    toRecord(root.limits),
    toRecord(root.account),
    toRecord(root.profile),
    toRecord(root.raw),
  ];

  return nestedRecords.some((record) =>
    recordHasTrue(record, ["active", "enabled", "premium", "isPremium", "premiumActive", "aiPremium", "aiPremiumActive", "hasAiPremium", "paidAiEnabled"]),
  );
}

function premiumRequiredTitle(language: string): string {
  if (normalizeLanguageTag(language).startsWith("uz")) return "Premium kerak";
  if (normalizeLanguageTag(language).startsWith("ru")) return "Нужен Premium";
  return "Premium required";
}

function standardVoiceAccessLabel(language: string): string {
  const lang = normalizeLanguageTag(language);
  if (lang.startsWith("uz")) return "Bepul";
  if (lang.startsWith("ru")) return "Бесплатно";
  return "Free";
}

function standardVoiceNoticeText(language: string): string {
  const lang = normalizeLanguageTag(language);
  if (lang.startsWith("uz")) return "Ovozli AI tarjima standart bepul xizmat. Server provayderi ulanmagan bo‘lsa, natija lokal soxta javob bilan almashtirilmaydi.";
  if (lang.startsWith("ru")) return "Голосовой AI-перевод — стандартная бесплатная услуга. Если серверный провайдер не подключён, локальный фейковый ответ не используется.";
  return "Voice AI translation is a standard free service. If the server provider is not connected, no local fake response is used.";
}

function voiceTtsUnavailableText(language: string): string {
  const lang = normalizeLanguageTag(language);
  if (lang.startsWith("uz")) return "Ovozli javob provayderi serverda hali ulanmagan. Real TTS kalitlari ishga tushirishdan oldin serverda ulanadi.";
  if (lang.startsWith("ru")) return "Провайдер голосового ответа пока не подключён на сервере. Реальные TTS-ключи подключаются перед запуском только на сервере.";
  return "Voice response provider is not connected on the server yet. Real TTS keys will be connected on the server before launch.";
}

function normalizeTargetLanguage(code: AiTranslationLanguageCode): AiTranslationLanguageCode {
  return code === "auto" ? "ru" : code;
}

function readStatus(value: unknown): "ready" | "limited" | "not_connected" | "error" {
  return value === "ready" ||
    value === "limited" ||
    value === "not_connected" ||
    value === "error"
    ? value
    : "limited";
}

function LanguageButton({
  label,
  value,
  language,
  onPress,
}: {
  label: string;
  value: AiTranslationLanguageCode;
  language: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.languageButton}>
      <Text style={styles.languageLabel}>{label}</Text>
      <View style={styles.languageValueRow}>
        <Text style={styles.languageValue} numberOfLines={1}>
          {getTranslationLanguageLabel(value, language)}
        </Text>
        <ChevronDown size={16} color={AI_MOBILE_COLORS.muted} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

export default function AiMobileVoiceScreen() {
  const { language } = useI18n();
  const { snapshot, isLoading, refresh } = useAiMobileSnapshot();
  const bridge = useAiVoiceBridge();

  const [session, setSession] = useState<AiMobileVoiceSession | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<AiTranslationLanguageCode>("auto");
  const [targetLanguage, setTargetLanguage] = useState<AiTranslationLanguageCode>("ru");
  const [foreignText, setForeignText] = useState("");
  const [translation, setTranslation] = useState<AiMobileTranslationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [languagePicker, setLanguagePicker] = useState<LanguagePickerMode | null>(null);
  const [languageQuery, setLanguageQuery] = useState("");
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);

  // Product rule AI-39.1: standalone voice translation is a standard free service.
  // Premium remains required later for call/video-call realtime translation and paid assistants.
  const hasPremium = true;

  useEffect(() => {
    bridge.bindBridge().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bridge.state.lastTranscript?.trim()) {
      setForeignText(bridge.state.lastTranscript.trim());
    }
  }, [bridge.state.lastTranscript]);

  const sourceTitle = useMemo(
    () => getTranslationLanguageLabel(sourceLanguage, language),
    [language, sourceLanguage],
  );

  const targetTitle = useMemo(
    () => getTranslationLanguageLabel(targetLanguage, language),
    [language, targetLanguage],
  );

  const languageList = useMemo(() => {
    const baseList =
      languagePicker === "target" ? AI_TRANSLATION_TARGET_LANGUAGES : AI_TRANSLATION_LANGUAGES;

    const query = languageQuery.trim().toLowerCase();
    if (!query) return baseList;

    return baseList.filter((item) =>
      getTranslationLanguageSearchText(item, language).includes(query),
    );
  }, [language, languagePicker, languageQuery]);

  const status = bridge.state.isRecording
    ? "ready"
    : readStatus(bridge.state.status ?? snapshot?.status);

  const showError = (message: string) => {
    Alert.alert(aiMobileText(language, "common.requestFailed"), message);
  };

  const ensurePremiumAccess = (): boolean => true;

  const ensureSession = async (): Promise<AiMobileVoiceSession | null> => {
    if (!ensurePremiumAccess()) return null;

    if (session?.sessionId) return session;

    const started = await aiMobileApi.startVoiceSession();

    if (!started.ok) {
      showError(aiMobileErrorText(language, started.error));
      return null;
    }

    setSession(started.data);
    bridge.setSessionId(started.data.sessionId);
    return started.data;
  };

  const stopSession = async () => {
    if (!session?.sessionId || busy) return;

    setBusy(true);

    try {
      await bridge.interrupt();
      const result = await aiMobileApi.stopVoiceSession(session.sessionId);

      if (!result.ok) {
        showError(aiMobileErrorText(language, result.error));
        return;
      }

      setSession(null);
      bridge.setSessionId(null);
      setVoiceMessage(aiMobileText(language, "voice.sessionStopped"));
    } finally {
      setBusy(false);
    }
  };

  const translateAndSpeak = async (value?: string) => {
    if (!ensurePremiumAccess()) return;

    const text = (value ?? foreignText).trim();

    if (!text || busy) {
      if (!text) showError(aiMobileText(language, "translation.emptyText"));
      return;
    }

    setBusy(true);
    setVoiceMessage(null);

    try {
      const response = await aiMobileApi.translateText(
        text,
        targetLanguage,
        sourceLanguage === "auto" ? null : sourceLanguage,
      );

      if (!response.ok) {
        const message = aiVoiceTranslationErrorText(language, response.error);
        setVoiceMessage(message);
        showError(message);
        return;
      }

      setTranslation(response.data);

      const translatedText = response.data.translatedText?.trim();

      if (!translatedText) {
        setVoiceMessage(aiMobileText(language, "translation.noOutput"));
        return;
      }

      const activeSession = await ensureSession();
      const tts = await aiVoiceMobileBridge.requestTts({
        text: translatedText,
        sessionId: activeSession?.sessionId ?? bridge.state.activeSessionId,
        language: targetLanguage,
      });

      if (!tts.ok) {
        setVoiceMessage(aiMobileErrorText(language, tts.error));
        return;
      }

      if (!tts.data.audioUrl) {
        setVoiceMessage(voiceTtsUnavailableText(language));
        return;
      }

      const played = await aiVoiceMobileBridge.playAudioUrl(tts.data);

      if (!played.ok) {
        setVoiceMessage(aiMobileErrorText(language, played.error));
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleListening = async () => {
    if (!ensurePremiumAccess()) return;
    if (busy) return;

    if (bridge.state.isRecording) {
      setBusy(true);

      try {
        const stopped = await bridge.stopRecording();

        if (!stopped.ok) {
          showError(aiMobileErrorText(language, stopped.error));
          return;
        }

        if (foreignText.trim()) {
          await translateAndSpeak(foreignText);
          return;
        }

        if (bridge.state.lastTranscript?.trim()) {
          await translateAndSpeak(bridge.state.lastTranscript.trim());
          return;
        }

        setVoiceMessage(aiMobileText(language, "voice.audioCapturedNotice"));
      } finally {
        setBusy(false);
      }

      return;
    }

    setBusy(true);

    try {
      const activeSession = await ensureSession();
      if (!activeSession) return;

      const bindResult = await bridge.bindBridge();
      if (!bindResult.ok) {
        showError(aiMobileErrorText(language, bindResult.error));
        return;
      }

      const started = await bridge.startRecording();

      if (!started.ok) {
        showError(aiMobileErrorText(language, started.error));
        return;
      }

      setVoiceMessage(null);
    } finally {
      setBusy(false);
    }
  };

  const replayTranslation = async () => {
    if (!ensurePremiumAccess()) return;

    const text = translation?.translatedText?.trim();
    if (!text || busy) return;

    setBusy(true);

    try {
      const activeSession = await ensureSession();
      const tts = await aiVoiceMobileBridge.requestTts({
        text,
        sessionId: activeSession?.sessionId ?? bridge.state.activeSessionId,
        language: targetLanguage,
      });

      if (!tts.ok) {
        showError(aiMobileErrorText(language, tts.error));
        return;
      }

      if (!tts.data.audioUrl) {
        setVoiceMessage(voiceTtsUnavailableText(language));
        return;
      }

      const played = await aiVoiceMobileBridge.playAudioUrl(tts.data);

      if (!played.ok) {
        showError(aiMobileErrorText(language, played.error));
      }
    } finally {
      setBusy(false);
    }
  };

  const interrupt = async () => {
    if (busy) return;

    setBusy(true);

    try {
      await bridge.interrupt();
      setVoiceMessage(aiMobileText(language, "voice.log.interrupted"));
    } finally {
      setBusy(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLanguage === "auto") {
      showError(aiMobileText(language, "translation.detectCannotSwap"));
      return;
    }

    setSourceLanguage(targetLanguage);
    setTargetLanguage(normalizeTargetLanguage(sourceLanguage));
    setForeignText(translation?.translatedText || foreignText);
    setTranslation(null);
    setVoiceMessage(null);
  };

  const pickLanguage = (item: AiTranslationLanguageItem) => {
    if (languagePicker === "source") {
      setSourceLanguage(item.code);
      setLanguagePicker(null);
      setLanguageQuery("");
      setTranslation(null);
      return;
    }

    if (item.code === "auto") {
      showError(aiMobileText(language, "translation.detectCannotSwap"));
      return;
    }

    setTargetLanguage(item.code);
    setLanguagePicker(null);
    setLanguageQuery("");
    setTranslation(null);
  };

  return (
    <AiMobileScaffold
      title={aiMobileText(language, "voice.title")}
      subtitle={`${sourceTitle} → ${targetTitle}`}
      onRefresh={refresh}
      isRefreshing={isLoading}
    >
      <View style={styles.statusRow}>
        <AiStatusPill status={status} label={aiMobileText(language, `status.${status}`)} />
        {session?.sessionId ? (
          <AiStatusPill status="ready" label={aiMobileText(language, "voice.session")} />
        ) : null}
        <AiStatusPill status="ready" label={standardVoiceAccessLabel(language)} />
      </View>

      <AiGlassCard>
        <View style={styles.languageCard}>
          <LanguageButton
            label={aiMobileText(language, "translation.from")}
            value={sourceLanguage}
            language={language}
            onPress={() => setLanguagePicker("source")}
          />

          <Pressable onPress={swapLanguages} style={styles.swapButton}>
            <RefreshCw size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.6} />
          </Pressable>

          <LanguageButton
            label={aiMobileText(language, "translation.to")}
            value={targetLanguage}
            language={language}
            onPress={() => setLanguagePicker("target")}
          />
        </View>
      </AiGlassCard>

      <View style={styles.premiumNoticeBox}>
        <Check size={16} color={AI_MOBILE_COLORS.green} strokeWidth={2.5} />
        <Text style={styles.premiumNoticeText}>{standardVoiceNoticeText(language)}</Text>
      </View>

      <View style={[styles.listenCard, !hasPremium && styles.listenCardLocked]}>
        <View style={styles.listenOrb}>
          {bridge.state.isRecording ? (
            <Square size={34} color={AI_MOBILE_COLORS.danger} strokeWidth={2.7} />
          ) : (
            <Mic size={38} color={AI_MOBILE_COLORS.cyan} strokeWidth={2.7} />
          )}
        </View>

        <Text style={styles.listenState}>
          {bridge.state.isRecording
            ? aiMobileText(language, "voice.recordingNow")
            : aiMobileText(language, "voice.tapToSpeak")}
        </Text>

        <Pressable
          onPress={toggleListening}
          disabled={busy}
          style={[
            styles.primaryVoiceButton,
            bridge.state.isRecording && styles.stopVoiceButton,
            !hasPremium && styles.premiumLockedButton,
            busy && styles.disabledButton,
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={AI_MOBILE_COLORS.text} />
          ) : bridge.state.isRecording ? (
            <Square size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.6} />
          ) : (
            <Mic size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.6} />
          )}

          <Text style={styles.primaryVoiceButtonText}>
            {bridge.state.isRecording
              ? aiMobileText(language, "voice.stopRecording")
              : aiMobileText(language, "voice.startRecording")}
          </Text>
        </Pressable>

        <View style={styles.smallActions}>
          <Pressable onPress={interrupt} disabled={busy || !hasPremium} style={[styles.smallButton, !hasPremium && styles.disabledButton]}>
            <PauseCircle size={17} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
            <Text style={styles.smallButtonText}>{aiMobileText(language, "voice.interrupt")}</Text>
          </Pressable>

          <Pressable onPress={stopSession} disabled={busy || !session?.sessionId || !hasPremium} style={[styles.smallButton, !hasPremium && styles.disabledButton]}>
            <X size={17} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
            <Text style={styles.smallButtonText}>{aiMobileText(language, "voice.stop")}</Text>
          </Pressable>
        </View>
      </View>

      <AiGlassCard>
        <View style={styles.cardTitleRow}>
          <Languages size={18} color={AI_MOBILE_COLORS.cyan} strokeWidth={2.5} />
          <Text style={styles.cardTitle}>{aiMobileText(language, "translation.source")}</Text>
        </View>

        <TextInput
          value={foreignText}
          onChangeText={(value) => {
            setForeignText(value);
            setTranslation(null);
          }}
          placeholder={aiMobileText(language, "voice.transcriptPlaceholder")}
          placeholderTextColor={AI_MOBILE_COLORS.dim}
          multiline
          style={styles.textInput}
        />

        <View style={styles.inputActions}>
          <Pressable
            onPress={() => {
              setForeignText("");
              setTranslation(null);
              setVoiceMessage(null);
            }}
            disabled={busy}
            style={styles.secondaryButton}
          >
            <X size={16} color={AI_MOBILE_COLORS.muted} strokeWidth={2.5} />
            <Text style={styles.secondaryButtonText}>
              {aiMobileText(language, "common.cancel")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => translateAndSpeak()}
            disabled={busy || !foreignText.trim()}
            style={[styles.primaryButton, !hasPremium && styles.premiumLockedButton, (!foreignText.trim() || busy) && styles.disabledButton]}
          >
            {busy ? (
              <ActivityIndicator size="small" color={AI_MOBILE_COLORS.text} />
            ) : (
              <Volume2 size={16} color={AI_MOBILE_COLORS.text} strokeWidth={2.6} />
            )}
            <Text style={styles.primaryButtonText}>
              {aiMobileText(language, "translation.translate")}
            </Text>
          </Pressable>
        </View>
      </AiGlassCard>

      <AiGlassCard>
        <View style={styles.cardTitleRow}>
          <Volume2 size={18} color={AI_MOBILE_COLORS.gold} strokeWidth={2.5} />
          <Text style={styles.cardTitle}>{aiMobileText(language, "translation.result")}</Text>

          {translation?.translatedText ? (
            <Pressable onPress={replayTranslation} disabled={busy || !hasPremium} style={[styles.replayButton, !hasPremium && styles.disabledButton]}>
              <Play size={14} color={AI_MOBILE_COLORS.text} strokeWidth={2.4} />
            </Pressable>
          ) : null}
        </View>

        {busy && !translation?.translatedText ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={AI_MOBILE_COLORS.cyan} />
            <Text style={styles.loadingText}>{aiMobileText(language, "common.loading")}</Text>
          </View>
        ) : (
          <Text style={[styles.resultText, !translation?.translatedText && styles.resultPlaceholder]}>
            {translation?.translatedText || aiMobileText(language, "translation.outputPlaceholder")}
          </Text>
        )}

        {voiceMessage ? <Text style={styles.voiceMessage}>{voiceMessage}</Text> : null}
      </AiGlassCard>

      <Modal
        visible={Boolean(languagePicker)}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setLanguagePicker(null);
          setLanguageQuery("");
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropPressable}
            onPress={() => {
              setLanguagePicker(null);
              setLanguageQuery("");
            }}
          />

          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>
                  {aiMobileText(language, "translation.selectLanguage")}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {languagePicker === "source"
                    ? aiMobileText(language, "translation.from")
                    : aiMobileText(language, "translation.to")}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setLanguagePicker(null);
                  setLanguageQuery("");
                }}
                style={styles.sheetClose}
              >
                <X size={20} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
              </Pressable>
            </View>

            <TextInput
              value={languageQuery}
              onChangeText={setLanguageQuery}
              placeholder={aiMobileText(language, "translation.searchLanguage")}
              placeholderTextColor={AI_MOBILE_COLORS.dim}
              style={styles.searchInput}
            />

            <ScrollView style={styles.languageList} contentContainerStyle={styles.languageListContent}>
              {languageList.map((item) => {
                const active =
                  languagePicker === "source"
                    ? item.code === sourceLanguage
                    : item.code === targetLanguage;

                return (
                  <Pressable
                    key={`${languagePicker}_${item.code}`}
                    onPress={() => pickLanguage(item)}
                    style={[styles.languageListItem, active && styles.languageListItemActive]}
                  >
                    <Text style={styles.languageListText} numberOfLines={1}>
                      {getTranslationLanguageLabel(item.code, language)}
                    </Text>

                    <Text style={styles.languageCode}>
                      {String(item.code).toUpperCase()}
                    </Text>

                    {active ? (
                      <Check size={18} color={AI_MOBILE_COLORS.green} strokeWidth={2.7} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AiMobileScaffold>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  languageButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  languageLabel: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  languageValueRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  languageValue: {
    flex: 1,
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  swapButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102,231,224,0.13)",
    borderWidth: 1,
    borderColor: "rgba(102,231,224,0.23)",
  },
  premiumNoticeBox: {
    minHeight: 46,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(255,189,89,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,189,89,0.18)",
  },
  premiumNoticeText: {
    flex: 1,
    color: AI_MOBILE_COLORS.gold,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },
  listenCard: {
    borderRadius: 30,
    padding: 18,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  listenCardLocked: {
    borderColor: "rgba(255,189,89,0.20)",
    backgroundColor: "rgba(255,189,89,0.075)",
  },
  listenOrb: {
    width: 118,
    height: 118,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102,231,224,0.11)",
    borderWidth: 1,
    borderColor: "rgba(102,231,224,0.22)",
    marginBottom: 14,
  },
  listenState: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },
  primaryVoiceButton: {
    minHeight: 54,
    borderRadius: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "rgba(112,183,255,0.28)",
    borderWidth: 1,
    borderColor: "rgba(112,183,255,0.35)",
    alignSelf: "stretch",
  },
  stopVoiceButton: {
    backgroundColor: "rgba(255,91,114,0.17)",
    borderColor: "rgba(255,91,114,0.30)",
  },
  premiumLockedButton: {
    backgroundColor: "rgba(255,189,89,0.14)",
    borderColor: "rgba(255,189,89,0.24)",
  },
  primaryVoiceButtonText: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  smallActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    alignSelf: "stretch",
  },
  smallButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 17,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  smallButtonText: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 12,
    fontWeight: "900",
  },
  cardTitleRow: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  textInput: {
    minHeight: 116,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    color: AI_MOBILE_COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    textAlignVertical: "top",
    backgroundColor: "rgba(0,0,0,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 9,
    marginTop: 12,
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  secondaryButtonText: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  primaryButton: {
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(112,183,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(112,183,255,0.32)",
  },
  primaryButtonText: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.52,
  },
  replayButton: {
    width: 32,
    height: 32,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  loadingBox: {
    minHeight: 82,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  resultText: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "800",
  },
  resultPlaceholder: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  voiceMessage: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    marginTop: 12,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  modalBackdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: "82%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: "rgba(18,31,47,0.98)",
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 12,
  },
  sheetTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.25,
  },
  sheetSubtitle: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: 3,
  },
  sheetClose: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  searchInput: {
    minHeight: 46,
    borderRadius: 17,
    paddingHorizontal: 13,
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 10,
  },
  languageList: {
    flexGrow: 0,
  },
  languageListContent: {
    gap: 8,
    paddingBottom: 6,
  },
  languageListItem: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.065)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  languageListItemActive: {
    backgroundColor: "rgba(102,231,224,0.13)",
    borderColor: "rgba(102,231,224,0.24)",
  },
  languageListText: {
    flex: 1,
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  languageCode: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 11,
    fontWeight: "900",
  },
});