import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Download, FileText, Image as ImageIcon, Smartphone, Video as VideoIcon, X, LucideIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "../../../../shared/i18n";
import LOCALES from "../../../../shared/i18n/locales";

type TranslationTree = Record<string, unknown>;

function isTranslationTree(value: unknown): value is TranslationTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTranslationValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isTranslationTree(acc)) return undefined;
    return acc[key];
  }, source);
}

function normalizeLocaleCode(input?: string | null) {
  return String(input ?? "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function getLocaleTree(code?: string | null): TranslationTree | null {
  const locales = LOCALES as Record<string, TranslationTree>;
  const normalized = normalizeLocaleCode(code);
  if (!normalized) return null;

  const exactEntry = Object.entries(locales).find(
    ([key]) => normalizeLocaleCode(key) === normalized,
  );
  if (exactEntry) return exactEntry[1];

  const base = normalized.split("-")[0];
  const baseEntry = Object.entries(locales).find(
    ([key]) => normalizeLocaleCode(key) === base,
  );
  return baseEntry?.[1] ?? null;
}

function getFirstLocalizedValue(locale: TranslationTree | null, keys: string[]) {
  for (const key of keys) {
    const value = getTranslationValue(locale, key);
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function hexToRgb(color: string) {
  const value = String(color || "").trim();
  if (!value.startsWith("#")) return null;
  let hex = value.slice(1);
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }
  if (hex.length !== 6) return null;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((item) => Number.isNaN(item))) return null;
  return { r, g, b };
}

function withAlpha(color: string, alpha: number) {
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  const rgb = hexToRgb(color);
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedAlpha})`;
  }

  const rgbMatch = color.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${normalizedAlpha})`;
  }

  const rgbaMatch = color.match(
    /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${normalizedAlpha})`;
  }

  return color;
}

type SaveTarget = "sabi" | "phone";

type Props = {
  visible: boolean;
  accent: string;
  kind: "image" | "video" | "media";
  onClose: () => void;
  onSave?: () => void | Promise<void>;
  onSaveToSabi?: () => void | Promise<void>;
  onSaveToPhone?: () => void | Promise<void>;
};

type SheetCopy = {
  title: string;
  subtitle: string;
  previewTitle: string;
  previewSubtitle: string;
  primaryLabel: string;
  icon: LucideIcon;
};

function buildKindCopy(kind: Props["kind"], tx: (keys: string[], fallback: string) => string): SheetCopy {
  switch (kind) {
    case "video":
      return {
        title: tx(["messenger.chat.saveVideoTitle", "chatRoom.saveVideoTitle"], "Сохранить видео"),
        subtitle: tx(["messenger.chat.saveVideoSubtitle", "chatRoom.saveVideoSubtitle"], "Сохранить это видео на устройство."),
        previewTitle: tx(["messenger.chat.videoReady", "chatRoom.videoReady"], "Видео готово"),
        previewSubtitle: tx(["messenger.chat.videoSaveNotice", "chatRoom.videoSaveNotice"], "Исходный видеофайл будет сохранён в памяти устройства."),
        primaryLabel: tx(["messenger.chat.saveVideoAction", "chatRoom.saveVideoAction"], "Сохранить видео"),
        icon: VideoIcon,
      };
    case "image":
      return {
        title: tx(["messenger.chat.savePhotoTitle", "chatRoom.savePhotoTitle"], "Сохранить фото"),
        subtitle: tx(["messenger.chat.savePhotoSubtitle", "chatRoom.savePhotoSubtitle"], "Сохранить это фото на устройство."),
        previewTitle: tx(["messenger.chat.photoReady", "chatRoom.photoReady"], "Фото готово"),
        previewSubtitle: tx(["messenger.chat.photoSaveNotice", "chatRoom.photoSaveNotice"], "Исходное фото будет сохранено в галерею или файлы устройства."),
        primaryLabel: tx(["messenger.chat.savePhotoAction", "chatRoom.savePhotoAction"], "Сохранить фото"),
        icon: ImageIcon,
      };
    default:
      return {
        title: tx(["messenger.chat.saveMediaTitle", "chatRoom.saveMediaTitle"], "Сохранить файл"),
        subtitle: tx(["messenger.chat.saveMediaSubtitle", "chatRoom.saveMediaSubtitle"], "Сохранить это вложение на устройство."),
        previewTitle: tx(["messenger.chat.mediaReady", "chatRoom.mediaReady"], "Файл готов"),
        previewSubtitle: tx(["messenger.chat.mediaSaveNotice", "chatRoom.mediaSaveNotice"], "Исходное вложение будет сохранено в память устройства."),
        primaryLabel: tx(["messenger.chat.saveMediaAction", "chatRoom.saveMediaAction"], "Сохранить файл"),
        icon: FileText,
      };
  }
}

export function SaveMediaSheet({ visible, accent, kind, onClose, onSave, onSaveToSabi, onSaveToPhone }: Props) {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const [savingTarget, setSavingTarget] = useState<SaveTarget | null>(null);

  const activeLocale = useMemo(() => getLocaleTree(language), [language]);
  const russianLocale = useMemo(() => getLocaleTree("ru"), []);
  const tx = (keys: string[], fallback: string) =>
    getFirstLocalizedValue(activeLocale, keys) ??
    getFirstLocalizedValue(russianLocale, keys) ??
    fallback;

  const copy = useMemo(() => buildKindCopy(kind, tx), [kind, language]);
  const saveToSabiLabel = tx(["messenger.chat.saveToSabiApp", "chatRoom.saveToSabiApp"], "Sabi App");
  const saveToPhoneLabel = tx(["messenger.chat.saveToPhone", "chatRoom.saveToPhone"], "Telefon");
  const saveErrorTitle = tx(["errors.saveFailed"], "Ошибка сохранения");
  const saveErrorBody = tx(["errors.saveFailedBody"], "Не удалось сохранить этот файл прямо сейчас.");

  const safeAccent = accent || "#56F3C1";
  const accentSoft = withAlpha(safeAccent, 0.18);

  const saving = savingTarget !== null;
  const hasSabiTarget = typeof onSaveToSabi === "function" && (kind === "image" || kind === "video");
  const phoneAction = onSaveToPhone ?? onSave;

  const handleSave = async (target: SaveTarget) => {
    if (savingTarget) return;

    const action = target === "sabi" ? onSaveToSabi : phoneAction;
    if (!action) return;

    try {
      setSavingTarget(target);
      await Promise.resolve(action());
      onClose();
    } catch (error) {
      Alert.alert(
        saveErrorTitle,
        error instanceof Error && error.message ? error.message : saveErrorBody,
      );
    } finally {
      setSavingTarget(null);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={saving ? undefined : onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={saving ? undefined : onClose} />
        <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <LinearGradient
            colors={[
              withAlpha(accentSoft, 0.24),
              "rgba(14,31,27,0.98)",
              "rgba(7,18,16,0.96)",
            ]}
            style={[styles.card, { borderColor: withAlpha(safeAccent, 0.14) }]}
          >
            <View style={[styles.glowTop, { backgroundColor: withAlpha(safeAccent, 0.10) }]} />
            <View style={[styles.glowBottom, { backgroundColor: withAlpha(safeAccent, 0.08) }]} />

            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>{copy.title}</Text>
                <Text style={styles.subtitle}>{copy.subtitle}</Text>
              </View>
              <Pressable
                onPress={saving ? undefined : onClose}
                style={({ pressed }) => [
                  styles.closeButtonWrap,
                  pressed && !saving ? styles.pressed : undefined,
                  saving ? styles.disabled : undefined,
                ]}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                  style={[styles.closeButton, { borderColor: withAlpha(safeAccent, 0.14) }]}
                >
                  <X size={15} strokeWidth={2.4} color="#F6FFF9" />
                </LinearGradient>
              </Pressable>
            </View>

            <View style={[styles.previewWrap, { borderColor: withAlpha(safeAccent, 0.16) }]}>
              <View
                style={[
                  styles.previewIconWrap,
                  {
                    borderColor: withAlpha(safeAccent, 0.18),
                    backgroundColor: withAlpha(safeAccent, 0.10),
                  },
                ]}
              >
                <copy.icon size={18} strokeWidth={2.3} color={safeAccent} />
              </View>
              <View style={styles.previewTextWrap}>
                <Text style={styles.previewTitle}>{copy.previewTitle}</Text>
                <Text style={styles.previewSubtitle}>{copy.previewSubtitle}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              {hasSabiTarget ? (
                <Pressable
                  onPress={saving ? undefined : () => void handleSave("sabi")}
                  style={({ pressed }) => [
                    styles.primaryWrap,
                    styles.primaryLeft,
                    pressed && !saving ? styles.pressed : undefined,
                    saving ? styles.disabled : undefined,
                  ]}
                >
                  <LinearGradient
                    colors={[accentSoft, withAlpha(safeAccent, 0.12)]}
                    style={[styles.primaryButton, { borderColor: withAlpha(safeAccent, 0.22) }]}
                  >
                    {savingTarget === "sabi" ? (
                      <ActivityIndicator size="small" color={safeAccent} />
                    ) : (
                      <ImageIcon size={16} strokeWidth={2.3} color={safeAccent} />
                    )}
                    <Text style={[styles.primaryText, { color: safeAccent }]}>
                      {savingTarget === "sabi" ? tx(["common.saving"], "Сохраняем...") : saveToSabiLabel}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ) : null}

              <Pressable
                onPress={saving || !phoneAction ? undefined : () => void handleSave("phone")}
                style={({ pressed }) => [
                  hasSabiTarget ? styles.primaryWrap : styles.primaryFullWrap,
                  hasSabiTarget ? styles.primaryRight : undefined,
                  pressed && !saving ? styles.pressed : undefined,
                  saving || !phoneAction ? styles.disabled : undefined,
                ]}
              >
                <LinearGradient
                  colors={[accentSoft, withAlpha(safeAccent, 0.12)]}
                  style={[styles.primaryButton, { borderColor: withAlpha(safeAccent, 0.22) }]}
                >
                  {savingTarget === "phone" ? (
                    <ActivityIndicator size="small" color={safeAccent} />
                  ) : (
                    <Smartphone size={16} strokeWidth={2.3} color={safeAccent} />
                  )}
                  <Text style={[styles.primaryText, { color: safeAccent }]}>
                    {savingTarget === "phone" ? tx(["common.saving"], "Сохраняем...") : hasSabiTarget ? saveToPhoneLabel : copy.primaryLabel}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(2,8,7,0.22)", justifyContent: "flex-end" },
  wrap: { paddingHorizontal: 10 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -24,
    right: -18,
    width: 150,
    height: 120,
    borderRadius: 999,
  },
  glowBottom: {
    position: "absolute",
    left: -28,
    bottom: -16,
    width: 150,
    height: 120,
    borderRadius: 999,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  headerTextWrap: { flex: 1, paddingRight: 10 },
  title: { color: "#F6FFF9", fontSize: 14, fontWeight: "900" },
  subtitle: { marginTop: 2, color: "rgba(232,255,246,0.58)", fontSize: 11, fontWeight: "700" },
  closeButtonWrap: { width: 34, height: 34, borderRadius: 12, overflow: "hidden" },
  closeButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  previewWrap: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  previewIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  previewTextWrap: { flex: 1, marginLeft: 10 },
  previewTitle: { color: "#F6FFF9", fontSize: 12, fontWeight: "900" },
  previewSubtitle: { marginTop: 3, color: "rgba(232,255,246,0.58)", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  actionRow: { flexDirection: "row", alignItems: "center" },
  secondaryWrap: { flex: 1, borderRadius: 16, overflow: "hidden", marginRight: 6 },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryText: { color: "#F6FFF9", fontSize: 12, fontWeight: "800" },
  primaryWrap: { flex: 1, borderRadius: 16, overflow: "hidden" },
  primaryFullWrap: { flex: 1, borderRadius: 16, overflow: "hidden" },
  primaryLeft: { marginRight: 6 },
  primaryRight: { marginLeft: 6 },
  primaryButton: {
    minHeight: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexDirection: "row",
  },
  primaryText: { marginLeft: 8, fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.72 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});

export default SaveMediaSheet;

