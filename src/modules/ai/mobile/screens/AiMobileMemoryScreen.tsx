import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "../../../../shared/i18n";
import { aiMobileApi, getAiMobilePrivacyMode } from "../aiMobileApi";
import { aiMobileText } from "../aiMobileI18n";
import { AI_MOBILE_COLORS } from "../aiMobileTheme";
import type { AiMobilePrivacyMode } from "../aiMobileTypes";
import {
  AiComposer,
  AiGlassCard,
  AiInlineNotice,
  AiMobileScaffold,
  AiSectionTitle,
} from "../components/AiMobileScaffold";
import { useAiMobileSnapshot } from "../useAiMobileSnapshot";

function ModeButton({
  mode,
  label,
  selected,
  onPress,
}: {
  mode: AiMobilePrivacyMode;
  label: string;
  selected: boolean;
  onPress: (mode: AiMobilePrivacyMode) => void;
}) {
  return (
    <Pressable onPress={() => onPress(mode)} style={[styles.modeButton, selected && styles.modeButtonSelected]}>
      <Text style={[styles.modeButtonText, selected && styles.modeButtonTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function AiMobileMemoryScreen() {
  const { language } = useI18n();
  const { snapshot, isLoading, refresh } = useAiMobileSnapshot();
  const initialMode = useMemo(() => (snapshot ? getAiMobilePrivacyMode(snapshot) : "balanced"), [snapshot]);
  const [privacyMode, setPrivacyMode] = useState<AiMobilePrivacyMode>(initialMode);
  const [instruction, setInstruction] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const changeMode = async (mode: AiMobilePrivacyMode) => {
    if (busy) return;
    setPrivacyMode(mode);
    setBusy(true);
    const result = await aiMobileApi.setPrivacyMode(mode);
    setMessage(result.ok ? aiMobileText(language, `memory.modeSaved.${mode}`) : result.error.message);
    setBusy(false);
  };

  const addInstruction = async () => {
    const value = instruction.trim();
    if (!value || busy) return;
    setBusy(true);
    const result = await aiMobileApi.addInstruction(value);
    setMessage(result.ok ? aiMobileText(language, "memory.instructionSaved") : result.error.message);
    if (result.ok) setInstruction("");
    setBusy(false);
  };

  return (
    <AiMobileScaffold
      title={aiMobileText(language, "memory.title")}
      subtitle={aiMobileText(language, "memory.subtitle")}
      onRefresh={refresh}
      isRefreshing={isLoading}
    >
      <AiGlassCard>
        <AiSectionTitle title={aiMobileText(language, "memory.privacyMode")} />
        <View style={styles.modeRow}>
          <ModeButton
            mode="strict"
            label={aiMobileText(language, "memory.strict")}
            selected={privacyMode === "strict"}
            onPress={changeMode}
          />
          <ModeButton
            mode="balanced"
            label={aiMobileText(language, "memory.balanced")}
            selected={privacyMode === "balanced"}
            onPress={changeMode}
          />
          <ModeButton
            mode="adaptive"
            label={aiMobileText(language, "memory.adaptive")}
            selected={privacyMode === "adaptive"}
            onPress={changeMode}
          />
        </View>
      </AiGlassCard>

      <AiComposer
        value={instruction}
        onChangeText={setInstruction}
        onSubmit={addInstruction}
        placeholder={aiMobileText(language, "memory.instructionPlaceholder")}
        disabled={busy}
        multiline
      />

      {message ? <AiInlineNotice text={message} /> : null}
      <AiInlineNotice text={aiMobileText(language, "memory.noAccusation")} />
    </AiMobileScaffold>
  );
}

const styles = StyleSheet.create({
  modeRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  modeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  modeButtonSelected: {
    backgroundColor: "rgba(102,231,224,0.18)",
    borderColor: "rgba(102,231,224,0.28)",
  },
  modeButtonText: { color: AI_MOBILE_COLORS.muted, fontSize: 12, fontWeight: "900" },
  modeButtonTextSelected: { color: AI_MOBILE_COLORS.text },
});
