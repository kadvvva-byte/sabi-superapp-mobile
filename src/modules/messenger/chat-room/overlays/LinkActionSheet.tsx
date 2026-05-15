import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Copy, ExternalLink, Share2, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "../../../../shared/i18n";

type AsyncHandler = () => void | Promise<void>;

type Props = {
  visible: boolean;
  accent: string;
  url: string;
  onClose: () => void;
  onCopy: AsyncHandler;
  onOpen: AsyncHandler;
  onShare: AsyncHandler;
};

type ActionId = "open" | "copy" | "share";

function trimUrl(value: string) {
  return String(value ?? "").trim();
}

export function LinkActionSheet({ visible, accent, url, onClose, onCopy, onOpen, onShare }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [busyAction, setBusyAction] = useState<ActionId | null>(null);

  const tx = useCallback((key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  }, [t]);

  const normalizedUrl = useMemo(() => trimUrl(url), [url]);
  const hasUrl = normalizedUrl.length > 0;

  const texts = useMemo(() => ({
    title: tx("messenger.chat.linkTitle", "Link"),
    empty: tx("messenger.chat.linkEmpty", "No link selected"),
    open: tx("common.open", "Open"),
    copy: tx("common.copy", "Copy"),
    share: tx("common.share", "Share"),
  }), [tx]);

  const handleAction = useCallback(async (actionId: ActionId, action: AsyncHandler) => {
    if (!hasUrl || busyAction) return;
    setBusyAction(actionId);
    try {
      await action();
    } finally {
      setBusyAction(null);
    }
  }, [busyAction, hasUrl]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={busyAction ? undefined : onClose} />
        <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <LinearGradient colors={["rgba(14,31,27,0.98)", "rgba(7,18,16,0.96)"]} style={[styles.card, { borderColor: `${accent}22` }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>{texts.title}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>{hasUrl ? normalizedUrl : texts.empty}</Text>
              </View>
              <Pressable onPress={busyAction ? undefined : onClose} style={({ pressed }) => [styles.closeButton, pressed && !busyAction ? styles.pressed : undefined]}>
                <X size={15} strokeWidth={2.4} color="#F6FFF9" />
              </Pressable>
            </View>

            <Pressable disabled={!hasUrl || !!busyAction} onPress={() => handleAction("open", onOpen)} style={({ pressed }) => [styles.actionWrap, pressed && hasUrl ? styles.pressed : undefined]}>
              <LinearGradient colors={["rgba(255,255,255,0.045)", "rgba(255,255,255,0.02)"]} style={[styles.actionCard, !hasUrl && styles.actionCardDisabled]}>
                <ExternalLink size={16} strokeWidth={2.3} color={hasUrl ? accent : "rgba(246,255,249,0.36)"} />
                <Text style={[styles.actionText, !hasUrl && styles.actionTextDisabled]}>{texts.open}</Text>
                {busyAction === "open" ? <ActivityIndicator size="small" color={accent} /> : null}
              </LinearGradient>
            </Pressable>

            <Pressable disabled={!hasUrl || !!busyAction} onPress={() => handleAction("copy", onCopy)} style={({ pressed }) => [styles.actionWrap, pressed && hasUrl ? styles.pressed : undefined]}>
              <LinearGradient colors={["rgba(255,255,255,0.045)", "rgba(255,255,255,0.02)"]} style={[styles.actionCard, !hasUrl && styles.actionCardDisabled]}>
                <Copy size={16} strokeWidth={2.3} color={hasUrl ? accent : "rgba(246,255,249,0.36)"} />
                <Text style={[styles.actionText, !hasUrl && styles.actionTextDisabled]}>{texts.copy}</Text>
                {busyAction === "copy" ? <ActivityIndicator size="small" color={accent} /> : null}
              </LinearGradient>
            </Pressable>

            <Pressable disabled={!hasUrl || !!busyAction} onPress={() => handleAction("share", onShare)} style={({ pressed }) => [styles.actionWrap, pressed && hasUrl ? styles.pressed : undefined]}>
              <LinearGradient colors={["rgba(255,255,255,0.045)", "rgba(255,255,255,0.02)"]} style={[styles.actionCard, !hasUrl && styles.actionCardDisabled]}>
                <Share2 size={16} strokeWidth={2.3} color={hasUrl ? accent : "rgba(246,255,249,0.36)"} />
                <Text style={[styles.actionText, !hasUrl && styles.actionTextDisabled]}>{texts.share}</Text>
                {busyAction === "share" ? <ActivityIndicator size="small" color={accent} /> : null}
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(2,8,7,0.22)", justifyContent: "flex-end" },
  wrap: { paddingHorizontal: 10 },
  card: { borderRadius: 24, borderWidth: 1, padding: 12, shadowColor: "#000000", shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  headerTextWrap: { flex: 1, paddingRight: 10 },
  title: { color: "#F6FFF9", fontSize: 14, fontWeight: "900" },
  subtitle: { marginTop: 2, color: "rgba(232,255,246,0.58)", fontSize: 11, fontWeight: "700" },
  closeButton: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)" },
  actionWrap: { marginBottom: 8, borderRadius: 16, overflow: "hidden" },
  actionCard: { minHeight: 48, borderRadius: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  actionCardDisabled: { opacity: 0.72 },
  actionText: { flex: 1, marginLeft: 10, color: "#F6FFF9", fontSize: 12, fontWeight: "800" },
  actionTextDisabled: { color: "rgba(246,255,249,0.36)" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});

export default LinkActionSheet;

