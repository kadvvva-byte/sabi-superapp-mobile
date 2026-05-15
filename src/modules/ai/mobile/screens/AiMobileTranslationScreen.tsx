import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Clipboard,
  Crown,
  Image as ImageIcon,
  Languages,
  RefreshCw,
  Send,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
import { resolveAiPremiumEntitlement } from "../aiMobileEntitlements";
import { AI_MOBILE_COLORS, AI_MOBILE_GRADIENT } from "../aiMobileTheme";
import { useAiMobileSnapshot } from "../useAiMobileSnapshot";
import type { AiMobileApiError, AiMobileTranslationResult } from "../aiMobileTypes";

type LanguagePickerMode = "source" | "target";

type TranslationUnavailableKind = "text" | "image";

function normalizeLanguageTag(value: string): string {
  return value.trim().toLowerCase();
}

function isProviderUnavailableError(error?: AiMobileApiError | null): boolean {
  const code = normalizeLanguageTag(error?.code || "");
  const message = normalizeLanguageTag(error?.message || "");
  const text = code + " " + message;

  return (
    code === "translation_provider_not_configured" ||
    code === "ai_translation_provider_not_configured" ||
    code === "ai_provider_not_configured" ||
    code === "provider_not_configured" ||
    code === "ai_provider_gateway_unavailable" ||
    code === "ai_image_ocr_gateway_not_configured" ||
    code === "ai_image_ocr_gateway_failed" ||
    code === "ai_gateway_timeout" ||
    text.includes("not_configured") ||
    text.includes("not configured") ||
    text.includes("unconfigured") ||
    text.includes("provider gateway") ||
    text.includes("translation provider") ||
    text.includes("provider unavailable") ||
    text.includes("ocr gateway") ||
    text.includes("gateway unavailable")
  );
}

function aiProviderUnavailableText(language: string, kind: TranslationUnavailableKind): string {
  const lang = normalizeLanguageTag(language);
  const isUz = lang.startsWith("uz");
  const isRu = lang.startsWith("ru");

  if (kind === "image") {
    if (isUz) {
      return "Foto/OCR tarjima provayderi serverda hali ulanmagan. Ishga tushirishdan oldin real kalitlar va gateway URL ulanadi. Hozir foto tarjima mavjud emas.";
    }

    if (isRu) {
      return "Провайдер перевода фото/OCR пока не подключён на сервере. Перед запуском подключим реальные ключи и gateway URL. Сейчас перевод фото недоступен.";
    }

    return "Photo/OCR translation provider is not connected on the server yet. Real keys and gateway URL will be connected before launch. Photo translation is currently unavailable.";
  }

  if (isUz) {
    return "Tarjima provayderi serverda hali ulanmagan. Ishga tushirishdan oldin real kalitlar va gateway URL ulanadi. Hozir tarjima mavjud emas.";
  }

  if (isRu) {
    return "Провайдер перевода пока не подключён на сервере. Перед запуском подключим реальные ключи и gateway URL. Сейчас перевод недоступен.";
  }

  return "Translation provider is not connected on the server yet. Real keys and gateway URL will be connected before launch. Translation is currently unavailable.";
}

function aiTranslationErrorText(
  language: string,
  error: AiMobileApiError,
  kind: TranslationUnavailableKind,
): string {
  if (isProviderUnavailableError(error)) {
    return aiProviderUnavailableText(language, kind);
  }

  return aiMobileErrorText(language, error);
}

type PremiumTranslationFeature = "camera" | "photo";

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

  if (recordHasTrue(root, ["isPremium", "premium", "premiumActive", "aiPremium", "aiPremiumActive", "hasAiPremium", "paidAiEnabled"])) {
    return true;
  }

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

function premiumFeatureName(language: string, feature: PremiumTranslationFeature): string {
  const lang = normalizeLanguageTag(language);
  if (feature === "camera") {
    if (lang.startsWith("uz")) return "kamera orqali tarjima";
    if (lang.startsWith("ru")) return "перевод через камеру";
    return "camera translation";
  }

  if (lang.startsWith("uz")) return "foto/OCR tarjima";
  if (lang.startsWith("ru")) return "перевод фото/OCR";
  return "photo/OCR translation";
}

function premiumRequiredMessage(language: string, feature: PremiumTranslationFeature): string {
  const lang = normalizeLanguageTag(language);
  const featureName = premiumFeatureName(language, feature);

  if (lang.startsWith("uz")) {
    return "Bu funksiya Premium uchun: " + featureName + ". Bepul rejimda faqat oddiy matnli tarjima ochiq. Real provayder kalitlari faqat serverda ulanishi kerak.";
  }

  if (lang.startsWith("ru")) {
    return "Эта функция доступна только в Premium: " + featureName + ". В бесплатном режиме открыт только базовый текстовый перевод. Реальные ключи провайдера подключаются только на сервере.";
  }

  return "This feature is Premium-only: " + featureName + ". Free mode supports only basic text translation. Real provider keys must be connected only on the server.";
}

function premiumNoticeText(language: string): string {
  const lang = normalizeLanguageTag(language);
  if (lang.startsWith("uz")) return "Bepul rejim: matn, kamera va foto/OCR tarjima standart xizmat. Real provayder kalitlari faqat serverda ulanadi.";
  if (lang.startsWith("ru")) return "Бесплатный режим: текст, камера и фото/OCR перевод — стандартные услуги. Реальные ключи провайдера подключаются только на сервере.";
  return "Free mode: text, camera and photo/OCR translation are standard services. Real provider keys are connected only on the server.";
}

function normalizeTargetLanguage(code: AiTranslationLanguageCode): AiTranslationLanguageCode {
  return code === "auto" ? "ru" : code;
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

export default function AiMobileTranslationScreen() {
  const { language } = useI18n();
  const insets = useSafeAreaInsets();
  const { snapshot } = useAiMobileSnapshot();

  const [sourceLanguage, setSourceLanguage] = useState<AiTranslationLanguageCode>("auto");
  const [targetLanguage, setTargetLanguage] = useState<AiTranslationLanguageCode>("ru");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AiMobileTranslationResult | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [languagePicker, setLanguagePicker] = useState<LanguagePickerMode | null>(null);
  const [languageQuery, setLanguageQuery] = useState("");
  const [providerNotice, setProviderNotice] = useState<string | null>(null);

  // Product rule AI-39.2: Tarjimon is a standard free service.
  // Text, camera and photo/OCR still use real provider gateway only; no local fake/fallback.
  const hasPremium = true;

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

  const showError = (message: string) => {
    Alert.alert(aiMobileText(language, "common.requestFailed"), message);
  };

  const showPremiumRequired = (feature: PremiumTranslationFeature) => {
    Alert.alert(premiumRequiredTitle(language), premiumRequiredMessage(language, feature));
  };

  const ensurePremiumAccess = (feature: PremiumTranslationFeature): boolean => {
    if (hasPremium) return true;
    showPremiumRequired(feature);
    return false;
  };

  const resetResult = () => {
    setResult(null);
    setSelectedImageUri(null);
    setProviderNotice(null);
  };

  const swapLanguages = () => {
    if (sourceLanguage === "auto") {
      showError(aiMobileText(language, "translation.detectCannotSwap"));
      return;
    }

    setSourceLanguage(targetLanguage);
    setTargetLanguage(normalizeTargetLanguage(sourceLanguage));
    setInputText(result?.translatedText || inputText);
    resetResult();
  };

  const translateText = async () => {
    const value = inputText.trim();

    if (!value) {
      showError(aiMobileText(language, "translation.emptyText"));
      return;
    }

    setIsLoading(true);
    setSelectedImageUri(null);
    setProviderNotice(null);

    try {
      const response = await aiMobileApi.translateText(
        value,
        targetLanguage,
        sourceLanguage === "auto" ? null : sourceLanguage,
      );

      if (!response.ok) {
        const message = aiTranslationErrorText(language, response.error, "text");
        setProviderNotice(message);
        if (!isProviderUnavailableError(response.error)) {
          showError(message);
        }
        return;
      }

      setProviderNotice(null);
      setResult(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const translateImage = async (mode: "camera" | "photo") => {
    const permission =
      mode === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showError(
        mode === "camera"
          ? aiMobileText(language, "translation.permissionCamera")
          : aiMobileText(language, "translation.permissionPhoto"),
      );
      return;
    }

    const picked =
      mode === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.92,
            allowsEditing: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.92,
            allowsEditing: false,
          });

    const asset = picked.canceled ? null : picked.assets?.[0];
    if (!asset?.uri) return;

    setIsLoading(true);
    setSelectedImageUri(asset.uri);
    setResult(null);
    setProviderNotice(null);

    try {
      const response = await aiMobileApi.translateImage({
        imageUri: asset.uri,
        fileName: asset.fileName || `sabi-ai-translate-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
        sourceLanguage: sourceLanguage === "auto" ? null : sourceLanguage,
        targetLanguage,
        inputKind: mode,
      });

      if (!response.ok) {
        const message = aiTranslationErrorText(language, response.error, "image");
        setProviderNotice(message);
        if (!isProviderUnavailableError(response.error)) {
          showError(message);
        }
        return;
      }

      setProviderNotice(null);
      setResult(response.data);

      if (response.data.sourceText) {
        setInputText(response.data.sourceText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pickLanguage = (item: AiTranslationLanguageItem) => {
    if (languagePicker === "source") {
      setSourceLanguage(item.code);
      setLanguagePicker(null);
      setLanguageQuery("");
      resetResult();
      return;
    }

    if (item.code === "auto") {
      showError(aiMobileText(language, "translation.detectCannotSwap"));
      return;
    }

    setTargetLanguage(item.code);
    setLanguagePicker(null);
    setLanguageQuery("");
    resetResult();
  };

  return (
    <LinearGradient colors={AI_MOBILE_GRADIENT} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.orbTop} />
        <View style={styles.orbBottom} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.6} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{aiMobileText(language, "translation.title")}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {sourceTitle} → {targetTitle}
            </Text>
          </View>

          <View style={styles.aiBadge}>
            <Languages size={20} color={AI_MOBILE_COLORS.cyan} strokeWidth={2.5} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 24, 42) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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

          <View style={styles.inputCard}>
            <View style={styles.cardTitleRow}>
              <Languages size={18} color={AI_MOBILE_COLORS.cyan} strokeWidth={2.5} />
              <Text style={styles.cardTitle}>
                {aiMobileText(language, "translation.source")}
              </Text>
            </View>

            <TextInput
              value={inputText}
              onChangeText={(value) => {
                setInputText(value);
                setProviderNotice(null);
              }}
              placeholder={aiMobileText(language, "translation.inputPlaceholder")}
              placeholderTextColor={AI_MOBILE_COLORS.dim}
              multiline
              style={styles.textInput}
            />

            <View style={styles.inputActions}>
              <Pressable
                onPress={() => {
                  setInputText("");
                  resetResult();
                }}
                style={styles.secondaryButton}
              >
                <X size={16} color={AI_MOBILE_COLORS.muted} strokeWidth={2.5} />
                <Text style={styles.secondaryButtonText}>
                  {aiMobileText(language, "common.cancel")}
                </Text>
              </Pressable>

              <Pressable onPress={translateText} disabled={isLoading} style={styles.primaryButton}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={AI_MOBILE_COLORS.text} />
                ) : (
                  <Send size={16} color={AI_MOBILE_COLORS.text} strokeWidth={2.6} />
                )}
                <Text style={styles.primaryButtonText}>
                  {aiMobileText(language, "translation.translate")}
                </Text>
              </Pressable>
            </View>
          </View>

          {!hasPremium ? (
            <View style={styles.premiumNoticeBox}>
              <Crown size={16} color={AI_MOBILE_COLORS.gold} strokeWidth={2.5} />
              <Text style={styles.premiumNoticeText}>{premiumNoticeText(language)}</Text>
            </View>
          ) : null}

          <View style={styles.mediaRow}>
            <Pressable
              onPress={() => translateImage("camera")}
              disabled={isLoading}
              style={[styles.mediaButton, !hasPremium && styles.mediaButtonLocked, isLoading && styles.disabledButton]}
            >
              <Camera size={20} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
              <Text style={styles.mediaButtonText}>
                {aiMobileText(language, "translation.camera")}
              </Text>
              {!hasPremium ? (
                <View style={styles.premiumMiniBadge}>
                  <Text style={styles.premiumMiniBadgeText}>Premium</Text>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              onPress={() => translateImage("photo")}
              disabled={isLoading}
              style={[styles.mediaButton, !hasPremium && styles.mediaButtonLocked, isLoading && styles.disabledButton]}
            >
              <ImageIcon size={20} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
              <Text style={styles.mediaButtonText}>
                {aiMobileText(language, "translation.photo")}
              </Text>
              {!hasPremium ? (
                <View style={styles.premiumMiniBadge}>
                  <Text style={styles.premiumMiniBadgeText}>Premium</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          {selectedImageUri ? (
            <View style={styles.imagePreviewCard}>
              <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
            </View>
          ) : null}

          <View style={styles.resultCard}>
            <View style={styles.cardTitleRow}>
              <Clipboard size={18} color={AI_MOBILE_COLORS.gold} strokeWidth={2.5} />
              <Text style={styles.cardTitle}>{aiMobileText(language, "translation.result")}</Text>
              <Text style={styles.languageMiniText}>
                {sourceTitle} → {targetTitle}
              </Text>
            </View>

            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={AI_MOBILE_COLORS.cyan} />
                <Text style={styles.loadingText}>{aiMobileText(language, "common.loading")}</Text>
              </View>
            ) : (
              <Text style={[styles.resultText, !result?.translatedText && styles.resultPlaceholder]}>
                {result?.translatedText || aiMobileText(language, "translation.outputPlaceholder")}
              </Text>
            )}

            {providerNotice ? (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>{providerNotice}</Text>
              </View>
            ) : null}

            {result?.sourceText && result.sourceText !== inputText ? (
              <View style={styles.detectedBox}>
                <Text style={styles.detectedTitle}>
                  {aiMobileText(language, "translation.detectedText")}
                </Text>
                <Text style={styles.detectedText}>{result.sourceText}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

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

            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  orbTop: {
    position: "absolute",
    top: -90,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(112,183,255,0.18)",
  },
  orbBottom: {
    position: "absolute",
    bottom: -130,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: "rgba(102,231,224,0.11)",
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: AI_MOBILE_COLORS.border,
  },
  headerTitleWrap: { flex: 1, minWidth: 0 },
  headerTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: 1,
  },
  aiBadge: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102,231,224,0.12)",
    borderWidth: 1,
    borderColor: "rgba(102,231,224,0.22)",
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  languageCard: {
    minHeight: 78,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
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
  inputCard: {
    borderRadius: 26,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  cardTitleRow: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  textInput: {
    minHeight: 150,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 14 : 10,
    paddingBottom: 14,
    color: AI_MOBILE_COLORS.text,
    fontSize: 16,
    lineHeight: 23,
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
  mediaRow: {
    flexDirection: "row",
    gap: 10,
  },
  disabledButton: { opacity: 0.55 },
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
  mediaButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  mediaButtonLocked: {
    backgroundColor: "rgba(255,189,89,0.085)",
    borderColor: "rgba(255,189,89,0.17)",
  },
  premiumMiniBadge: {
    minHeight: 21,
    borderRadius: 10,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,189,89,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,189,89,0.25)",
  },
  premiumMiniBadgeText: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  mediaButtonText: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },
  imagePreviewCard: {
    borderRadius: 24,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  imagePreview: {
    width: "100%",
    height: 210,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  resultCard: {
    minHeight: 190,
    borderRadius: 26,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  languageMiniText: {
    marginLeft: "auto",
    color: AI_MOBILE_COLORS.muted,
    fontSize: 10,
    fontWeight: "900",
  },
  loadingBox: {
    minHeight: 112,
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
  noticeBox: {
    marginTop: 14,
    borderRadius: 18,
    padding: 11,
    backgroundColor: "rgba(255,189,89,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,189,89,0.18)",
  },
  noticeText: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
  },
  detectedBox: {
    marginTop: 14,
    borderRadius: 18,
    padding: 11,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },
  detectedTitle: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 6,
  },
  detectedText: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
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