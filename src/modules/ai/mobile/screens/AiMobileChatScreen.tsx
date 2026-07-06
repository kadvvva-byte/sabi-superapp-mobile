import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Briefcase,
  Camera,
  Check,
  FileText,
  Flag,
  GraduationCap,
  Image as ImageIcon,
  Menu,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
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
import { aiMobileApi, createAiMobileId, extractAssistantText } from "../aiMobileApi";
import { resolveSabiAssistantClientAction } from "../aiAssistantActionRouter";
import {
  extractSabiVoiceTranscript,
  hasSabiWakeWord,
  stripSabiWakeWord,
  type SabiHandsFreeVoiceStatus,
} from "../voice/aiSabiHandsFreeVoice";
import { aiMobileErrorText, aiMobileText } from "../aiMobileI18n";
import PlayReadyProviderNotConfiguredEvidencePanel from "../../../play-ready/mobile/PlayReadyProviderNotConfiguredEvidencePanel";
import { resolveAiPremiumEntitlement } from "../aiMobileEntitlements";
import { AI_MOBILE_COLORS, AI_MOBILE_GRADIENT } from "../aiMobileTheme";
import type {
  AiMobileAssistantMode,
  AiMobileAttachment,
  AiMobileChatMessage,
} from "../aiMobileTypes";
import { useAiMobileSnapshot } from "../useAiMobileSnapshot";
import { useAiVoiceBridge } from "../voice/useAiVoiceBridge";

type AssistantModeItem = {
  key: AiMobileAssistantMode;
  icon: React.ReactNode;
};

type PremiumFeatureKind =
  | "mode"
  | "web_search"
  | "voice"
  | "camera"
  | "photo"
  | "video"
  | "document"
  | "attachment";

const ASSISTANT_MODES: AssistantModeItem[] = [
  {
    key: "chatgpt",
    icon: <Bot size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
  },
  {
    key: "business",
    icon: <Briefcase size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
  },
  {
    key: "student",
    icon: <BookOpen size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
  },
  {
    key: "applicant",
    icon: <GraduationCap size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
  },
  {
    key: "teacher",
    icon: <Users size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />,
  },
];

function nowIso() {
  return new Date().toISOString();
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "active", "enabled", "premium", "paid", "yes", "1"].includes(normalized)) {
      return true;
    }
    if (["false", "inactive", "disabled", "free", "no", "0"].includes(normalized)) {
      return false;
    }
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

  if (
    recordHasTrue(root, [
      "isPremium",
      "premium",
      "premiumActive",
      "aiPremium",
      "aiPremiumActive",
      "hasAiPremium",
      "paidAiEnabled",
    ])
  ) {
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
    recordHasTrue(record, [
      "active",
      "enabled",
      "premium",
      "isPremium",
      "premiumActive",
      "aiPremium",
      "aiPremiumActive",
      "hasAiPremium",
      "paidAiEnabled",
    ]),
  );
}

function makeAttachment(input: Omit<AiMobileAttachment, "id">): AiMobileAttachment {
  return {
    id: createAiMobileId(`attachment_${input.kind}`),
    ...input,
  };
}

function attachmentLabel(language: string, attachment: AiMobileAttachment) {
  if (attachment.name) return attachment.name;
  if (attachment.kind === "photo") return aiMobileText(language, "chat.attachmentPhoto");
  if (attachment.kind === "video") return aiMobileText(language, "chat.attachmentVideo");
  if (attachment.kind === "audio") return aiMobileText(language, "chat.attachmentAudio");
  return aiMobileText(language, "chat.attachmentDocument");
}

function assistantModeToFoundation(mode: AiMobileAssistantMode) {
  if (mode === "business") return "business" as const;
  if (mode === "student") return "student" as const;
  if (mode === "applicant") return "abiturient" as const;
  if (mode === "teacher") return "teacher" as const;
  return "general" as const;
}

function providerHintFor(_mode: AiMobileAssistantMode, _webSearchEnabled: boolean) {
  return "yandex" as const;
}

function voiceFallbackPrompt(language: string) {
  return aiMobileText(language, "chat.providerUnavailable");
}

function providerRouteMeta(language: string, route: unknown): string | null {
  const record = toRecord(route);
  if (!record) return null;

  if (isProviderRouteUnavailable(record)) {
    return aiMobileText(language, "chat.providerUnavailable");
  }

  const label = toText(record.label) || toText(record.provider) || "AI";
  const status = toText(record.status);
  return status ? `${label} · ${status}` : label;
}

function isVisibleMessageMeta(value: string | null | undefined): value is string {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;

  return !(
    normalized.startsWith("sabi_") ||
    normalized.startsWith("sabi:") ||
    normalized.includes("sabi_app_navigation") ||
    normalized.includes("sabi_assistant_capabilities") ||
    normalized.includes("external_search") ||
    normalized.includes("external_browser") ||
    normalized.includes("providerroute") ||
    normalized.includes("provider_route") ||
    normalized.includes("client_action") ||
    normalized.includes("action_router") ||
    normalized.includes("tts") ||
    normalized.includes("voice command") ||
    normalized.includes("голосовая команда") ||
    normalized.includes("запрошен женский голос") ||
    normalized.includes("ovozli buyruq") ||
    normalized.includes("tts ovozi") ||
    normalized.includes("语音指令") ||
    normalized.includes("صوت tts")
  );
}

function appendPremiumDescription(language: string, description: string, locked: boolean) {
  if (!locked) return description;
  return `${description} · ${premiumBadgeText(language)}`;
}

function aiReportReasonLines(language: string) {
  return [
    aiMobileText(language, "chat.aiReportReason.offensive"),
    aiMobileText(language, "chat.aiReportReason.unsafe"),
    aiMobileText(language, "chat.aiReportReason.incorrect"),
    aiMobileText(language, "chat.aiReportReason.privacy"),
    aiMobileText(language, "chat.aiReportReason.financial"),
    aiMobileText(language, "chat.aiReportReason.other"),
  ]
    .map((item) => `• ${item}`)
    .join("\n");
}

function showAiReportPreview(language: string, message: AiMobileChatMessage) {
  const clippedResponse = message.text.trim().slice(0, 160);

  Alert.alert(
    aiMobileText(language, "chat.aiReportTitle"),
    [
      aiMobileText(language, "chat.aiReportDescription"),
      "",
      aiMobileText(language, "chat.aiReportReasonsTitle"),
      aiReportReasonLines(language),
      "",
      clippedResponse ? `"${clippedResponse}${message.text.length > 160 ? "…" : ""}"` : "",
      "",
      aiMobileText(language, "chat.aiReportReviewerNote"),
    ]
      .filter(Boolean)
      .join("\n"),
    [{ text: aiMobileText(language, "common.ready"), style: "default" }],
  );
}

function MessageBubble({
  message,
  language,
}: {
  message: AiMobileChatMessage;
  language: string;
}) {
  const isUser = message.role === "user";
  const canReportAiResponse = !isUser && message.role === "assistant" && message.text.trim().length > 0;

  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={styles.roleLabel}>
          {isUser ? aiMobileText(language, "chat.roleUser") : "Sabi AI"}
        </Text>

        <Text style={styles.messageText}>{message.text}</Text>

        {message.attachments?.length ? (
          <Text style={styles.attachmentMeta}>
            {aiMobileText(language, "chat.attachmentsSent")}: {message.attachments.length}
          </Text>
        ) : null}

        {message.status === "awaiting_confirmation" ? (
          <Text style={styles.confirmMeta}>
            {aiMobileText(language, "messageStatus.awaiting_confirmation")}
          </Text>
        ) : null}

        {isVisibleMessageMeta(message.meta) ? <Text style={styles.messageMeta}>{message.meta}</Text> : null}

        {message.status === "error" ? (
          <Text style={styles.messageError}>{aiMobileText(language, "messageStatus.error")}</Text>
        ) : null}

        {canReportAiResponse ? (
          <Pressable
            onPress={() => showAiReportPreview(language, message)}
            style={styles.aiReportButton}
            accessibilityRole="button"
            accessibilityLabel={aiMobileText(language, "chat.aiReportTitle")}
          >
            <Flag size={13} color={AI_MOBILE_COLORS.gold} strokeWidth={2.4} />
            <Text style={styles.aiReportButtonText}>
              {aiMobileText(language, "chat.aiReportAction")}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function buildSabiAssistantConversationHistory(messages: AiMobileChatMessage[]) {
  return messages
    .filter((message) => message.text && message.text.trim().length > 0)
    .slice(-12)
    .map((message) => ({
      role: message.role,
      text: message.text.trim().slice(0, 900),
      createdAt: message.createdAt,
    }));
}

function SheetButton({
  icon,
  title,
  description,
  active,
  locked,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  active?: boolean;
  locked?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.sheetButton, active && styles.sheetButtonActive, locked && styles.sheetButtonLocked]}
    >
      <View style={[styles.sheetIcon, active && styles.sheetIconActive, locked && styles.sheetIconLocked]}>{icon}</View>

      <View style={styles.sheetButtonTextWrap}>
        <Text style={styles.sheetButtonTitle}>{title}</Text>
        {description ? <Text style={styles.sheetButtonDescription}>{description}</Text> : null}
      </View>

      {locked ? (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>Premium</Text>
        </View>
      ) : active ? (
        <Check size={18} color={AI_MOBILE_COLORS.green} strokeWidth={2.7} />
      ) : null}
    </Pressable>
  );
}


function isPremiumMode(mode: AiMobileAssistantMode) {
  return mode !== "chatgpt";
}

function premiumStatusText(language: string, hasPremium: boolean) {
  return aiMobileText(language, hasPremium ? "premium.statusActive" : "premium.statusFreeBasic");
}

function premiumBadgeText(language: string) {
  return aiMobileText(language, "premium.badge");
}

function premiumFeatureTitle(language: string, feature: PremiumFeatureKind) {
  return aiMobileText(language, `premium.feature.${feature}`);
}

function premiumRequiredTitle(language: string) {
  return aiMobileText(language, "premium.requiredTitle");
}

function premiumRequiredMessage(language: string, feature: PremiumFeatureKind) {
  return aiMobileText(language, "premium.requiredMessage").replace("{feature}", premiumFeatureTitle(language, feature));
}

function extractVoiceTranscriptFromResponse(value: unknown): string | null {
  const visited = new Set<unknown>();
  const transcriptKeys = [
    "transcript",
    "recognizedText",
    "recognized_text",
    "text",
    "utterance",
    "speechText",
    "speech_text",
    "resultText",
    "result_text",
    "message",
  ];

  const search = (candidate: unknown, depth: number): string | null => {
    if (depth > 5 || candidate == null) return null;

    if (typeof candidate === "string") {
      const clean = candidate.trim();
      return clean ? clean : null;
    }

    const record = toRecord(candidate);
    if (!record || visited.has(record)) return null;
    visited.add(record);

    for (const key of transcriptKeys) {
      const text = toText(record[key]);
      if (text) return text;
    }

    const priorityNested = [
      record.data,
      record.result,
      record.payload,
      record.transcription,
      record.stt,
      record.speech,
      record.output,
      record.response,
      record.raw,
    ];

    for (const nested of priorityNested) {
      const text = search(nested, depth + 1);
      if (text) return text;
    }

    for (const nested of Object.values(record)) {
      const text = search(nested, depth + 1);
      if (text) return text;
    }

    return null;
  };

  return search(value, 0);
}

function assistantProviderUnavailableText(language: string) {
  return aiMobileText(language, "chat.providerUnavailable");
}

function normalizeProviderStatusText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isUnavailableProviderValue(value: unknown): boolean {
  const text = normalizeProviderStatusText(value);
  return (
    text.includes("unconfigured") ||
    text.includes("not_configured") ||
    text.includes("not configured") ||
    text.includes("provider_not_configured") ||
    text.includes("provider not configured") ||
    text.includes("provider_unavailable") ||
    text.includes("provider unavailable") ||
    text.includes("translation_provider_not_configured") ||
    text.includes("ai_provider_gateway_unavailable")
  );
}

function isProviderRouteUnavailable(route: unknown): boolean {
  const record = toRecord(route);
  if (!record) return false;

  return (
    isUnavailableProviderValue(record.status) ||
    isUnavailableProviderValue(record.state) ||
    isUnavailableProviderValue(record.code) ||
    isUnavailableProviderValue(record.reason) ||
    isUnavailableProviderValue(record.message) ||
    isUnavailableProviderValue(toRecord(record.raw)?.status) ||
    isUnavailableProviderValue(toRecord(record.raw)?.code)
  );
}

function isAssistantProviderPlaceholder(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return (
    normalized.includes("ai understood this as conversation") ||
    normalized.includes("assistant brain prepared context") ||
    normalized.includes("client-dispatch routing") ||
    normalized.includes("openai · unconfigured") ||
    normalized.includes("provider_not_configured") ||
    normalized.includes("provider not configured") ||
    normalized.includes("unconfigured")
  );
}



function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const SABI_HANDS_FREE_RECORDING_WINDOW_MS = 3600;
const SABI_HANDS_FREE_IDLE_DELAY_MS = 900;

export default function AiMobileChatScreen() {
  const { language } = useI18n();
  const insets = useSafeAreaInsets();
  const { snapshot, isLoading, refresh } = useAiMobileSnapshot();
  const voice = useAiVoiceBridge();
  const scrollRef = useRef<ScrollView | null>(null);
  const voiceRef = useRef(voice);
  const submitMessageRef = useRef<((overrideText?: string, overrideAttachments?: AiMobileAttachment[], source?: "text" | "voice" | "attachment") => Promise<void>) | null>(null);
  const handsFreeLoopActiveRef = useRef(false);
  const handsFreeCancelledRef = useRef(false);
  const liveStateRef = useRef({
    isSending: false,
    keyboardVisible: false,
    text: "",
    attachmentCount: 0,
  });

  const [text, setText] = useState("");
  const [messages, setMessages] = useState<AiMobileChatMessage[]>([]);
  const [attachments, setAttachments] = useState<AiMobileAttachment[]>([]);
  const [activeMode, setActiveMode] = useState<AiMobileAssistantMode>("chatgpt");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toolsVisible, setToolsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [handsFreeEnabled] = useState(false);
  const [handsFreeStatus, setHandsFreeStatus] = useState<SabiHandsFreeVoiceStatus>("initializing");
  const [handsFreeError, setHandsFreeError] = useState<string | null>(null);

  const aiPremiumEntitlement = useMemo(() => resolveAiPremiumEntitlement(snapshot), [snapshot]);
  const hasPremium = aiPremiumEntitlement.enabled;

  const activeModeTitle = useMemo(
    () => aiMobileText(language, `chat.mode.${activeMode}.title`),
    [activeMode, language],
  );

  const activeModeShort = useMemo(
    () => aiMobileText(language, `chat.mode.${activeMode}.short`),
    [activeMode, language],
  );

  const canSubmit = Boolean(text.trim()) || attachments.length > 0;
  const status = snapshot?.status ?? "limited";
  const voiceBusy =
    voice.state.recordingState === "requesting_permission" ||
    voice.state.recordingState === "processing";
  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  useEffect(() => {
    liveStateRef.current = {
      isSending,
      keyboardVisible,
      text,
      attachmentCount: attachments.length,
    };
  }, [attachments.length, isSending, keyboardVisible, text]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const showError = (message: string) => {
    Alert.alert(aiMobileText(language, "common.requestFailed"), message);
  };

  const formatVoiceRuntimeError = (stage: string, error: unknown) => {
    const record = toRecord(error);
    const code = toText(record?.code) || toText(record?.errorCode) || null;
    const status = typeof record?.status === "number" ? String(record.status) : null;
    const message =
      error instanceof Error
        ? error.message
        : toText(record?.message) || toText(record?.error) || String(error ?? aiMobileText(language, "common.requestFailed"));
    const suffix = [code, status ? `HTTP ${status}` : null].filter(Boolean).join(" · ");
    return suffix ? `${stage}: ${message}
${suffix}` : `${stage}: ${message}`;
  };

  const showVoiceError = (stage: string, error: unknown) => {
    const message = formatVoiceRuntimeError(stage, error);
    console.warn(`[sabi-ai-voice] ${message}`);
    Alert.alert(aiMobileText(language, "common.requestFailed"), message);
  };

  const showVoiceRawError = (stage: string, raw: unknown) => {
    let rawText = "";
    try {
      rawText = JSON.stringify(raw).slice(0, 420);
    } catch {
      rawText = String(raw ?? "").slice(0, 420);
    }

    showVoiceError(stage, {
      code: "ai_voice_response_unreadable",
      message: rawText || aiMobileText(language, "common.requestFailed"),
    });
  };

  const showPremiumRequired = (feature: PremiumFeatureKind) => {
    Alert.alert(premiumRequiredTitle(language), premiumRequiredMessage(language, feature));
  };

  const ensurePremiumAccess = (feature: PremiumFeatureKind) => {
    if (hasPremium) return true;
    showPremiumRequired(feature);
    return false;
  };

  const confirmSafetyApproval = (message: string) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(
        aiMobileText(language, "chat.safetyConfirmTitle"),
        message,
        [
          {
            text: aiMobileText(language, "chat.safetyConfirmCancel"),
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: aiMobileText(language, "chat.safetyConfirmContinue"),
            style: "default",
            onPress: () => resolve(true),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });

  const addAttachment = (attachment: AiMobileAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const pickCameraPhoto = async () => {
    if (!ensurePremiumAccess("camera")) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showError(aiMobileText(language, "chat.permissionCamera"));
      return;
    }

    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    });

    const asset = picked.canceled ? null : picked.assets?.[0];
    if (!asset?.uri) return;

    addAttachment(
      makeAttachment({
        kind: "photo",
        uri: asset.uri,
        name: asset.fileName || `sabi-ai-camera-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
        size: typeof asset.fileSize === "number" ? asset.fileSize : undefined,
      }),
    );
    setToolsVisible(false);
  };

  const pickPhoto = async () => {
    if (!ensurePremiumAccess("photo")) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showError(aiMobileText(language, "chat.permissionPhoto"));
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.92,
      allowsEditing: false,
    });

    const asset = picked.canceled ? null : picked.assets?.[0];
    if (!asset?.uri) return;

    addAttachment(
      makeAttachment({
        kind: "photo",
        uri: asset.uri,
        name: asset.fileName || `sabi-ai-photo-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
        size: typeof asset.fileSize === "number" ? asset.fileSize : undefined,
      }),
    );
    setToolsVisible(false);
  };

  const pickVideo = async () => {
    if (!ensurePremiumAccess("video")) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showError(aiMobileText(language, "chat.permissionVideo"));
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.86,
      allowsEditing: false,
    });

    const asset = picked.canceled ? null : picked.assets?.[0];
    if (!asset?.uri) return;

    addAttachment(
      makeAttachment({
        kind: "video",
        uri: asset.uri,
        name: asset.fileName || `sabi-ai-video-${Date.now()}.mp4`,
        mimeType: asset.mimeType || "video/mp4",
        size: typeof asset.fileSize === "number" ? asset.fileSize : undefined,
      }),
    );
    setToolsVisible(false);
  };

  const pickDocument = async () => {
    if (!ensurePremiumAccess("document")) return;

    const picked = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
    });

    const asset = picked.canceled ? null : picked.assets?.[0];
    if (!asset?.uri) return;

    addAttachment(
      makeAttachment({
        kind: "document",
        uri: asset.uri,
        name: asset.name || `sabi-ai-document-${Date.now()}`,
        mimeType: asset.mimeType || "application/octet-stream",
        size: typeof asset.size === "number" ? asset.size : undefined,
      }),
    );
    setToolsVisible(false);
  };

  const submitMessage = async (
    overrideText?: string,
    overrideAttachments?: AiMobileAttachment[],
    source: "text" | "voice" | "attachment" = "text",
  ) => {
    const messageText = (overrideText ?? text).trim();
    const outgoingAttachments = overrideAttachments ?? attachments;

    if (!messageText && outgoingAttachments.length === 0) return;
    if (isSending) return;

    const premiumFeature: PremiumFeatureKind | null =
      source === "voice"
        ? null
        : outgoingAttachments.length > 0
          ? "attachment"
          : webSearchEnabled
            ? "web_search"
            : isPremiumMode(activeMode)
              ? "mode"
              : null;

    if (premiumFeature && !hasPremium) {
      showPremiumRequired(premiumFeature);
      return;
    }

    setIsSending(true);

    const userMessage: AiMobileChatMessage = {
      id: createAiMobileId("ai_user_message"),
      role: "user",
      text: messageText || aiMobileText(language, "chat.attachmentsSent"),
      attachments: outgoingAttachments,
      createdAt: nowIso(),
      status: "sent",
    };

    const conversationHistory = buildSabiAssistantConversationHistory([...messages, userMessage]);

    setMessages((prev) => [...prev, userMessage]);
    setText("");

    if (!overrideAttachments) {
      setAttachments([]);
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });

    try {
      const clientAction = resolveSabiAssistantClientAction(userMessage.text, { language });

      if (clientAction) {
        const assistantMessage: AiMobileChatMessage = {
          id: createAiMobileId("ai_client_action_message"),
          role: "assistant",
          text: clientAction.assistantText,
          createdAt: nowIso(),
          status: clientAction.kind === "blocked_sensitive" ? "awaiting_confirmation" : "sent",
          meta: null,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });

        await delay(180);

        if (clientAction.kind === "navigate" && clientAction.route) {
          (router.push as unknown as (href: string) => void)(clientAction.route);
        } else if ((clientAction.kind === "web_search" || clientAction.kind === "open_url") && clientAction.url) {
          await Linking.openURL(clientAction.url);
        } else if (clientAction.kind === "blocked_sensitive" && clientAction.route) {
          (router.push as unknown as (href: string) => void)(clientAction.route);
        }

        return;
      }

      const safetyResult = await aiMobileApi.evaluateSafetyApproval({
        prompt: userMessage.text,
        source,
        requestedAutoExecute: false,
        metadata: {
          attachmentCount: outgoingAttachments.length,
          webSearchEnabled,
          assistantMode: activeMode,
          voiceCommand: source === "voice",
          premiumRequired: Boolean(premiumFeature),
          premiumActive: hasPremium,
        },
      });

      if (!safetyResult.ok) {
        throw new Error(safetyResult.error.message);
      }

      const safetyApproval = safetyResult.data;

      if (safetyApproval.blockedReason) {
        const assistantMessage: AiMobileChatMessage = {
          id: createAiMobileId("ai_blocked_message"),
          role: "assistant",
          text: safetyApproval.blockedReason,
          createdAt: nowIso(),
          status: "error",
          meta: safetyApproval.confirmationReason ?? null,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      if (safetyApproval.requiresConfirmation) {
        const approved = await confirmSafetyApproval(
          safetyApproval.confirmationReason ||
            aiMobileText(language, "chat.safetyConfirmMessage"),
        );

        if (!approved) {
          const assistantMessage: AiMobileChatMessage = {
            id: createAiMobileId("ai_cancelled_message"),
            role: "assistant",
            text: aiMobileText(language, "chat.safetyConfirmMessage"),
            createdAt: nowIso(),
            status: "awaiting_confirmation",
            meta: safetyApproval.confirmationReason ?? null,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          return;
        }
      }

      const providerResult = await aiMobileApi.resolveProviderRoute({
        kind: webSearchEnabled ? "search" : "assistant",
        mode: assistantModeToFoundation(activeMode),
        providerHint: providerHintFor(activeMode, webSearchEnabled),
      });

      const providerRoute = providerResult.ok ? providerResult.data : null;

      const result = await aiMobileApi.sendAssistantMessage({
        message: userMessage.text,
        assistantMode: activeMode,
        attachments: outgoingAttachments,
        webSearchEnabled,
        providerHint: providerHintFor(activeMode, webSearchEnabled),
        source,
        safetyPolicy: {
          requiresUserConfirmationForActions: true,
          blockAutonomousMoneyTransfer: true,
          blockAutonomousMessageSending: true,
          blockAutonomousExternalActions: true,
          promptInjectionGuard: true,
        },
        voiceOutput: {
          enabled: source === "voice",
          preferredVoiceGender: "female",
        },
        providerRoute,
        safetyApproval,
        conversationHistory,
        clientCapabilities: hasPremium
          ? [
              "attachments",
              "voice_control",
              "internet_search",
              "camera",
              "photo_library",
              "document_picker",
              "yandex_gpt_live",
              "premium_ai",
            ]
          : ["basic_text_chat", "yandex_gpt_live"],
      });

      if (!result.ok) {
        throw new Error(aiMobileErrorText(language, result.error));
      }

      const rawAssistantText =
        extractAssistantText(result.data) ||
        aiMobileText(language, "chat.emptyBackendResponse");
      const providerRouteUnavailable = isProviderRouteUnavailable(providerRoute);
      const providerUnavailable = isAssistantProviderPlaceholder(rawAssistantText);
      const assistantText = providerUnavailable
        ? assistantProviderUnavailableText(language)
        : rawAssistantText;
      const providerMeta =
        providerRoute && !providerRouteUnavailable
          ? providerRouteMeta(language, providerRoute)
          : null;

      const assistantMessage: AiMobileChatMessage = {
        id: createAiMobileId("ai_assistant_message"),
        role: "assistant",
        text: assistantText,
        createdAt: nowIso(),
        status: providerUnavailable
          ? "error"
          : safetyApproval.requiresConfirmation
            ? "awaiting_confirmation"
            : "sent",
        meta: providerMeta,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (
        !providerUnavailable &&
        source === "voice" &&
        assistantText &&
        assistantText !== aiMobileText(language, "chat.emptyBackendResponse")
      ) {
        void voice.requestTts({
          text: assistantText,
          language,
        }).then((ttsResult) => {
          if (!ttsResult.ok) {
            showVoiceError("TTS", ttsResult.error);
          }
        });
      }
    } catch (error) {
      const assistantMessage: AiMobileChatMessage = {
        id: createAiMobileId("ai_error_message"),
        role: "assistant",
        text: error instanceof Error ? error.message : aiMobileText(language, "common.requestFailed"),
        createdAt: nowIso(),
        status: "error",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }
  };

  submitMessageRef.current = submitMessage;

  useEffect(() => {
    if (!handsFreeEnabled) return;
    if (handsFreeLoopActiveRef.current) return;

    handsFreeCancelledRef.current = false;
    handsFreeLoopActiveRef.current = true;

    const runHandsFreeLoop = async () => {
      setHandsFreeStatus("initializing");
      const bridge = await voiceRef.current.bindBridge();
      if (!bridge.ok) {
        setHandsFreeStatus("unavailable");
        setHandsFreeError(bridge.error.message);
        handsFreeLoopActiveRef.current = false;
        return;
      }

      while (!handsFreeCancelledRef.current) {
        const live = liveStateRef.current;
        const bridgeState = voiceRef.current.state;
        const canListen =
          !live.isSending &&
          !live.keyboardVisible &&
          !live.text.trim() &&
          live.attachmentCount === 0 &&
          !bridgeState.isRecording &&
          bridgeState.recordingState !== "processing";

        if (!canListen) {
          setHandsFreeStatus("sleeping");
          await delay(SABI_HANDS_FREE_IDLE_DELAY_MS);
          continue;
        }

        setHandsFreeError(null);
        setHandsFreeStatus("listening");
        const started = await voiceRef.current.startRecording();
        if (!started.ok) {
          setHandsFreeStatus("unavailable");
          setHandsFreeError(started.error.message);
          await delay(1800);
          continue;
        }

        await delay(SABI_HANDS_FREE_RECORDING_WINDOW_MS);

        if (handsFreeCancelledRef.current) break;

        setHandsFreeStatus("processing");
        const stopped = await voiceRef.current.stopRecording({ includeBase64: true });
        if (!stopped.ok) {
          setHandsFreeStatus("unavailable");
          setHandsFreeError(stopped.error.message);
          await delay(1400);
          continue;
        }

        const audio = stopped.data;
        const transcription = await aiMobileApi.transcribeVoiceAudio({
          audioBase64: audio.base64 ?? null,
          audioUri: audio.uri,
          fileName: audio.fileName,
          mimeType: audio.mimeType,
          durationMillis: audio.durationMillis,
          sizeBytes: audio.sizeBytes,
          language,
          source: "sabi_hands_free_wake_word",
          listenForWakeWord: true,
          wakeWord: "sabi",
        });

        if (!transcription.ok) {
          setHandsFreeStatus("unavailable");
          setHandsFreeError(transcription.error.message);
          await delay(1800);
          continue;
        }

        const transcript = extractSabiVoiceTranscript(transcription.data);
        if (!transcript || !hasSabiWakeWord(transcript)) {
          setHandsFreeStatus("listening");
          await delay(260);
          continue;
        }

        const command = stripSabiWakeWord(transcript);
        setHandsFreeStatus("wake_detected");
        await voiceRef.current.submitTranscript(transcript, {
          language,
          source: "sabi_hands_free_wake_word",
        });

        setHandsFreeStatus("answering");
        await submitMessageRef.current?.(command, [], "voice");
        await delay(650);
      }

      handsFreeLoopActiveRef.current = false;
    };

    void runHandsFreeLoop();

    return () => {
      handsFreeCancelledRef.current = true;
      handsFreeLoopActiveRef.current = false;
      if (voiceRef.current.state.isRecording) {
        void voiceRef.current.stopRecording();
      }
    };
  }, [handsFreeEnabled, language]);

  const toggleVoice = async () => {
    if (voiceBusy || isSending) return;

    if (voice.state.isRecording) {
      const stopped = await voice.stopRecording({ includeBase64: true });
      if (!stopped.ok) {
        showVoiceError("stopRecording", stopped.error);
        return;
      }

      const audio = stopped.data;
      const base64 = typeof audio.base64 === "string" ? audio.base64.trim() : "";
      console.log(
        `[sabi-ai-voice] captured uri=${audio.uri} mime=${audio.mimeType} size=${audio.sizeBytes ?? "unknown"} base64=${base64.length}`,
      );

      if (!base64) {
        showVoiceError("audioBase64", {
          code: "ai_voice_audio_base64_missing",
          message:
            "Recorded audio was saved, but mobile could not read it as base64. STT cannot use a local phone URI on the server.",
        });
        return;
      }

      const transcription = await aiMobileApi.transcribeVoiceAudio({
        audioBase64: base64,
        audioUri: audio.uri,
        fileName: audio.fileName,
        mimeType: audio.mimeType,
        durationMillis: audio.durationMillis,
        sizeBytes: audio.sizeBytes,
        language,
        source: "sabi_ai_chat_voice",
        listenForWakeWord: false,
        wakeWord: "sabi",
      });

      if (!transcription.ok) {
        showVoiceError("STT", transcription.error);
        return;
      }

      console.log("[sabi-ai-voice] stt response", transcription.data);

      const transcript =
        extractVoiceTranscriptFromResponse(transcription.data) ||
        extractSabiVoiceTranscript(transcription.data);

      if (!transcript) {
        showVoiceRawError("STT transcript", transcription.data);
        return;
      }

      await voice.submitTranscript(transcript, {
        language,
        source: "sabi_ai_chat_voice",
      });

      await submitMessage(transcript, [], "voice");
      return;
    }

    const bindResult = await voice.bindBridge();
    if (!bindResult.ok) {
      showVoiceError("bindBridge", bindResult.error);
      return;
    }

    const result = await voice.startRecording();
    if (!result.ok) {
      showVoiceError("startRecording", result.error);
    }
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
            <Text style={styles.headerTitle}>{aiMobileText(language, "chat.title")}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Sabi AI
            </Text>
          </View>

          <Pressable onPress={() => setMenuVisible(true)} style={styles.headerButton}>
            <Menu size={21} color={AI_MOBILE_COLORS.text} strokeWidth={2.6} />
          </Pressable>
        </View>

        {status !== "ready" ? (
          <View style={styles.providerNoticeBox}>
            <ShieldCheck size={16} color={AI_MOBILE_COLORS.gold} strokeWidth={2.4} />
            <View style={styles.providerNoticeTextWrap}>
              <Text style={styles.providerNoticeTitle}>
                {aiMobileText(language, "chat.providerNotConfiguredTitle")}
              </Text>
              <Text style={styles.providerNoticeText}>
                {aiMobileText(language, "chat.providerNotConfiguredBody")}
              </Text>
              <Text style={styles.providerNoticeReviewerText}>
                {aiMobileText(language, "chat.providerNotConfiguredReviewer")}
              </Text>
            </View>
          </View>
        ) : null}

        {status !== "ready" ? (
          <View style={styles.playReadyProviderEvidenceWrap}>
            <PlayReadyProviderNotConfiguredEvidencePanel
              compact
              contextLabel="AI provider_not_configured reviewer evidence"
            />
          </View>
        ) : null}

        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
          >
            {messages.length > 0
              ? messages.map((message) => (
                  <MessageBubble key={message.id} message={message} language={language} />
                ))
              : null}

            {isSending ? (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color={AI_MOBILE_COLORS.cyan} />
                <Text style={styles.typingText}>{aiMobileText(language, "chat.thinking")}</Text>
              </View>
            ) : null}
          </ScrollView>

          {(attachments.length > 0 || webSearchEnabled) ? (
            <View style={styles.activeToolsBar}>
              {webSearchEnabled ? (
                <Pressable onPress={() => setWebSearchEnabled(false)} style={styles.activeChip}>
                  <Search size={14} color={AI_MOBILE_COLORS.gold} strokeWidth={2.4} />
                  <Text style={styles.activeChipText}>{aiMobileText(language, "chat.webSearchShort")}</Text>
                  <X size={13} color={AI_MOBILE_COLORS.muted} strokeWidth={2.5} />
                </Pressable>
              ) : null}


              {attachments.map((attachment) => (
                <Pressable key={attachment.id} onPress={() => removeAttachment(attachment.id)} style={styles.activeChip}>
                  <Paperclip size={14} color={AI_MOBILE_COLORS.cyan} strokeWidth={2.4} />
                  <Text style={styles.activeChipText} numberOfLines={1}>
                    {attachmentLabel(language, attachment)}
                  </Text>
                  <Trash2 size={13} color={AI_MOBILE_COLORS.muted} strokeWidth={2.5} />
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={[styles.composerWrap, { paddingBottom: keyboardVisible ? 10 : Math.max(insets.bottom, 10) }]}>
            <Pressable onPress={() => setToolsVisible(true)} style={styles.plusButton}>
              <Plus size={22} color={AI_MOBILE_COLORS.text} strokeWidth={2.8} />
            </Pressable>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={aiMobileText(language, "chat.placeholder")}
              placeholderTextColor={AI_MOBILE_COLORS.dim}
              selectionColor={AI_MOBILE_COLORS.cyan}
              cursorColor={AI_MOBILE_COLORS.cyan}
              multiline
              textAlignVertical="top"
              onFocus={() => {
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                });
              }}
              style={styles.input}
            />

            <Pressable
              onPress={toggleVoice}
              disabled={isSending || voiceBusy}
              style={[
                styles.voiceButton,
                voice.state.isRecording && styles.voiceButtonRecording,
                (isSending || voiceBusy) && styles.disabledButton,
              ]}
            >
              {voice.state.isRecording ? (
                <MicOff size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.7} />
              ) : (
                <Mic size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.7} />
              )}
            </Pressable>

            <Pressable
              onPress={() => submitMessage()}
              disabled={!canSubmit || isSending}
              style={[styles.sendButton, (!canSubmit || isSending) && styles.disabledButton]}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={AI_MOBILE_COLORS.text} />
              ) : (
                <Send size={18} color={AI_MOBILE_COLORS.text} strokeWidth={2.7} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <Modal visible={toolsVisible} animationType="slide" transparent onRequestClose={() => setToolsVisible(false)}>
          <View style={styles.modalBackdrop}>
            <Pressable style={styles.modalBackdropPressable} onPress={() => setToolsVisible(false)} />

            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>{aiMobileText(language, "chat.toolsSheetTitle")}</Text>
                  <Text style={styles.sheetSubtitle}>{aiMobileText(language, "chat.toolsSheetSubtitle")}</Text>
                </View>

                <Pressable onPress={() => setToolsVisible(false)} style={styles.sheetClose}>
                  <X size={20} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
                </Pressable>
              </View>

              <View style={styles.sheetList}>
                <SheetButton
                  icon={<Camera size={19} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />}
                  title={aiMobileText(language, "chat.camera")}
                  description={appendPremiumDescription(language, aiMobileText(language, "chat.cameraDescription"), !hasPremium)}
                  locked={!hasPremium}
                  onPress={pickCameraPhoto}
                />
                <SheetButton
                  icon={<ImageIcon size={19} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />}
                  title={aiMobileText(language, "chat.uploadPhoto")}
                  description={appendPremiumDescription(language, aiMobileText(language, "chat.uploadPhotoDescription"), !hasPremium)}
                  locked={!hasPremium}
                  onPress={pickPhoto}
                />
                <SheetButton
                  icon={<Video size={19} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />}
                  title={aiMobileText(language, "chat.uploadVideo")}
                  description={appendPremiumDescription(language, aiMobileText(language, "chat.uploadVideoDescription"), !hasPremium)}
                  locked={!hasPremium}
                  onPress={pickVideo}
                />
                <SheetButton
                  icon={<FileText size={19} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />}
                  title={aiMobileText(language, "chat.uploadDocument")}
                  description={appendPremiumDescription(language, aiMobileText(language, "chat.uploadDocumentDescription"), !hasPremium)}
                  locked={!hasPremium}
                  onPress={pickDocument}
                />
                <SheetButton
                  icon={<Search size={19} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />}
                  title={aiMobileText(language, "chat.webSearch")}
                  description={appendPremiumDescription(language, aiMobileText(language, "chat.webSearchDescription"), !hasPremium)}
                  active={webSearchEnabled}
                  locked={!hasPremium}
                  onPress={() => {
                    if (!ensurePremiumAccess("web_search")) return;
                    setWebSearchEnabled((prev) => !prev);
                    setToolsVisible(false);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={menuVisible} animationType="slide" transparent onRequestClose={() => setMenuVisible(false)}>
          <View style={styles.modalBackdrop}>
            <Pressable style={styles.modalBackdropPressable} onPress={() => setMenuVisible(false)} />

            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>{aiMobileText(language, "chat.assistantMenuTitle")}</Text>
                  <Text style={styles.sheetSubtitle}>{aiMobileText(language, "chat.assistantMenuSubtitle")}</Text>
                </View>

                <Pressable onPress={() => setMenuVisible(false)} style={styles.sheetClose}>
                  <X size={20} color={AI_MOBILE_COLORS.text} strokeWidth={2.5} />
                </Pressable>
              </View>

              <View style={styles.sheetList}>
                {ASSISTANT_MODES.map((item) => {
                  const locked = isPremiumMode(item.key) && !hasPremium;

                  return (
                    <SheetButton
                      key={item.key}
                      icon={item.icon}
                      title={aiMobileText(language, `chat.mode.${item.key}.title`)}
                      description={appendPremiumDescription(
                        language,
                        aiMobileText(language, `chat.mode.${item.key}.description`),
                        locked,
                      )}
                      active={activeMode === item.key}
                      locked={locked}
                      onPress={() => {
                        if (isPremiumMode(item.key) && !ensurePremiumAccess("mode")) return;
                        setActiveMode(item.key);
                        setMenuVisible(false);
                      }}
                    />
                  );
                })}
              </View>

              <View style={styles.securityBox}>
                <ShieldCheck size={18} color={hasPremium ? AI_MOBILE_COLORS.green : AI_MOBILE_COLORS.gold} strokeWidth={2.5} />
                <Text style={styles.securityText}>
                  {aiMobileText(language, "chat.securityNotice")}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <View style={[styles.statusDot, status === "ready" ? styles.statusDotReady : styles.statusDotLimited]} />
                <Text style={styles.statusText}>
                  {isLoading
                    ? aiMobileText(language, "common.loading")
                    : `Sabi AI · ${activeModeShort}`}
                </Text>
                <Pressable onPress={refresh} style={styles.refreshButton}>
                  <Text style={styles.refreshText}>{aiMobileText(language, "common.ready")}</Text>
                </Pressable>
              </View>
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
    width: 215,
    height: 215,
    borderRadius: 120,
    backgroundColor: "rgba(112,183,255,0.18)",
  },
  orbBottom: {
    position: "absolute",
    bottom: -110,
    left: -80,
    width: 245,
    height: 245,
    borderRadius: 130,
    backgroundColor: "rgba(181,140,255,0.15)",
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
  keyboardWrap: { flex: 1 },
  messages: { flex: 1 },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 10,
  },
  emptyWrap: {
    flex: 1,
    minHeight: 430,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102,231,224,0.14)",
    borderWidth: 1,
    borderColor: "rgba(102,231,224,0.22)",
    marginBottom: 18,
  },
  emptyTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.35,
    textAlign: "center",
  },
  emptyText: {
    maxWidth: 310,
    color: AI_MOBILE_COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
  freeNoticeBox: {
    maxWidth: 330,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 14,
    backgroundColor: "rgba(255,209,102,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.18)",
  },
  freeNoticeText: {
    flex: 1,
    color: AI_MOBILE_COLORS.softText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
  commandPanel: {
    width: "100%",
    borderRadius: 24,
    padding: 14,
    marginTop: 20,
    backgroundColor: "rgba(93,232,215,0.08)",
    borderWidth: 1,
    borderColor: "rgba(93,232,215,0.16)",
  },
  commandPanelTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  commandPanelText: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  commandChipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  commandChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  commandChipText: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  quickPromptWrap: {
    width: "100%",
    gap: 9,
    marginTop: 24,
  },
  quickPrompt: {
    minHeight: 44,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  quickPromptText: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  typingRow: {
    alignSelf: "flex-start",
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  typingText: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  messageRow: { width: "100%", flexDirection: "row" },
  messageRowUser: { justifyContent: "flex-end" },
  messageRowAssistant: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "88%",
    borderRadius: 23,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: "rgba(112,183,255,0.22)",
    borderColor: "rgba(112,183,255,0.28)",
  },
  assistantBubble: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  roleLabel: {
    color: AI_MOBILE_COLORS.cyan,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 6,
  },
  messageText: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  attachmentMeta: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 8,
  },
  confirmMeta: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 8,
  },
  messageMeta: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  messageError: {
    color: AI_MOBILE_COLORS.danger,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 8,
    textTransform: "uppercase",
  },
  aiReportButton: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "rgba(255,209,102,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.18)",
  },
  aiReportButtonText: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  providerNoticeBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255,209,102,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.17)",
  },
  providerNoticeTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  providerNoticeTitle: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  providerNoticeText: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 3,
  },
  providerNoticeReviewerText: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  playReadyProviderEvidenceWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  activeToolsBar: {
    maxHeight: 96,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  activeChip: {
    maxWidth: "100%",
    minHeight: 32,
    borderRadius: 13,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  recordingChip: {
    borderColor: "rgba(255,91,114,0.24)",
    backgroundColor: "rgba(255,91,114,0.10)",
  },
  activeChipText: {
    maxWidth: 230,
    color: AI_MOBILE_COLORS.softText,
    fontSize: 11,
    fontWeight: "800",
  },
  activeChipError: {
    color: AI_MOBILE_COLORS.danger,
    fontSize: 12,
    fontWeight: "900",
  },
  voiceWakeChip: {
    borderColor: "rgba(102,231,224,0.26)",
    backgroundColor: "rgba(102,231,224,0.10)",
  },
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "rgba(5,12,27,0.72)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102,231,224,0.13)",
    borderWidth: 1,
    borderColor: "rgba(102,231,224,0.22)",
    marginBottom: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 116,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 12 : 10,
    paddingBottom: Platform.OS === "ios" ? 12 : 9,
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    marginBottom: 1,
  },
  voiceButtonRecording: {
    backgroundColor: "rgba(255,91,114,0.18)",
    borderColor: "rgba(255,91,114,0.32)",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(112,183,255,0.28)",
    borderWidth: 1,
    borderColor: "rgba(112,183,255,0.35)",
    marginBottom: 1,
  },
  disabledButton: { opacity: 0.55 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  modalBackdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
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
    marginBottom: 14,
  },
  sheetTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.25,
  },
  sheetSubtitle: {
    maxWidth: 310,
    color: AI_MOBILE_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
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
  sheetList: { gap: 9 },
  sheetButton: {
    minHeight: 62,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.065)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  sheetButtonActive: {
    backgroundColor: "rgba(102,231,224,0.13)",
    borderColor: "rgba(102,231,224,0.24)",
  },
  sheetButtonLocked: {
    backgroundColor: "rgba(255,209,102,0.075)",
    borderColor: "rgba(255,209,102,0.16)",
  },
  sheetIcon: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sheetIconActive: {
    backgroundColor: "rgba(102,231,224,0.18)",
    borderColor: "rgba(102,231,224,0.26)",
  },
  sheetIconLocked: {
    backgroundColor: "rgba(255,209,102,0.10)",
    borderColor: "rgba(255,209,102,0.17)",
  },
  sheetButtonTextWrap: { flex: 1, minWidth: 0 },
  sheetButtonTitle: {
    color: AI_MOBILE_COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  sheetButtonDescription: {
    color: AI_MOBILE_COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  premiumBadge: {
    minHeight: 24,
    borderRadius: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,209,102,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.20)",
  },
  premiumBadgeText: {
    color: AI_MOBILE_COLORS.gold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.25,
    textTransform: "uppercase",
  },
  securityBox: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    backgroundColor: "rgba(102,231,135,0.09)",
    borderWidth: 1,
    borderColor: "rgba(102,231,135,0.17)",
  },
  securityText: {
    flex: 1,
    color: AI_MOBILE_COLORS.softText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotReady: { backgroundColor: AI_MOBILE_COLORS.green },
  statusDotLimited: { backgroundColor: AI_MOBILE_COLORS.gold },
  statusText: {
    flex: 1,
    color: AI_MOBILE_COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  refreshButton: {
    minHeight: 30,
    borderRadius: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  refreshText: {
    color: AI_MOBILE_COLORS.softText,
    fontSize: 10,
    fontWeight: "900",
  },
});




