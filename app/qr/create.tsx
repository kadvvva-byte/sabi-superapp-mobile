import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SabiPremiumQrCard from "../../src/modules/qr/components/SabiPremiumQrCard";
import { findSabiQrFunction, SABI_QR_FUNCTION_CATALOG } from "../../src/modules/qr/data/qrFunctionCatalog";
import { useSabiQrActorIdentity } from "../../src/modules/qr/runtime/qrIdentityBinding";
import { generateSabiQrToken } from "../../src/modules/qr/runtime/qrRuntime";
import { getSabiQrVisualTheme } from "../../src/modules/qr/runtime/qrVisualTheme";
import { useQrMobileTranslations } from "../../src/shared/i18n/qr-mobile-hooks";
import { isValidQrAmount, normalizeQrAmount } from "../../src/modules/qr/runtime/qrTokenPayload";
import type { SabiQrFunctionCode, SabiQrTokenRecord } from "../../src/modules/qr/contracts/universalQr.contracts";
import {
  getWalletFoundationSnapshot,
  getWalletQrCurrencyCodeForSurface,
} from "../../src/shared/wallet/wallet-foundation";

function pushQr(href: { pathname: string; params?: Record<string, string> }) {
  (router.push as unknown as (nextHref: typeof href) => void)(href);
}

function resolveActorDisplayName(actor: ReturnType<typeof useSabiQrActorIdentity>, fallback: string) {
  return actor.displayName || [actor.firstName, actor.lastName].filter(Boolean).join(" ").trim() || actor.username || fallback;
}

function normalizeVisibleAmountInput(value: string): string {
  const cleaned = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const [whole = "", ...fractionParts] = cleaned.split(".");
  const fraction = fractionParts.join("").slice(0, 8);
  return fractionParts.length > 0 ? `${whole}.${fraction}` : whole;
}

function getQrAmountInputErrorKey(value: string): string | null {
  const normalized = normalizeQrAmount(value);
  if (!normalized) return "qr.mobile.error.amountRequired";
  return isValidQrAmount(normalized) ? null : "qr.mobile.error.amountInvalid";
}

function normalizeQrImageBase64(value: string): string {
  return value.replace(/^data:image\/png;base64,/, "").trim();
}

function getQrShareFileName(definitionCode: string): string {
  return `sabi-qr-${definitionCode.replace(/[^a-z0-9_-]/gi, "-")}-${Date.now()}.png`;
}

export default function SabiQrCreateScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ functionCode?: string }>();
  const actor = useSabiQrActorIdentity();
  const { tq, functionTitle, valueLabel } = useQrMobileTranslations();
  const definition = useMemo(
    () => findSabiQrFunction(params.functionCode) ?? SABI_QR_FUNCTION_CATALOG[0],
    [params.functionCode],
  );
  const theme = getSabiQrVisualTheme(definition);
  const [amount, setAmount] = useState("");
  const [qrCurrencyCode, setQrCurrencyCode] = useState("");
  const [token, setToken] = useState<SabiQrTokenRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actorName = resolveActorDisplayName(actor, tq("qr.mobile.identity.namePending"));
  const actorPublicHandle = actor.username ? `@${String(actor.username).replace(/^@+/, "")}` : "";

  const lastAutoGenerateKeyRef = useRef<string | null>(null);
  const amountInputErrorKey = definition.requiresAmount ? getQrAmountInputErrorKey(amount) : null;
  const normalizedAmount = normalizeQrAmount(amount) ?? "";
  const canGenerateQr = Boolean(actor.userId) && !busy && (!definition.requiresAmount || !amountInputErrorKey);

  const onGenerate = useCallback(async () => {
    if (!actor.userId) {
      setError("qr.mobile.error.authRequired");
      setToken(null);
      return;
    }

    const nextAmountErrorKey = definition.requiresAmount ? getQrAmountInputErrorKey(amount) : null;
    if (nextAmountErrorKey) {
      setError(nextAmountErrorKey);
      setToken(null);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const nextToken = await generateSabiQrToken(definition, {
        amount: definition.requiresAmount ? normalizeQrAmount(amount) : undefined,
        currency: definition.requiresAmount ? qrCurrencyCode || undefined : undefined,
      });
      setToken(nextToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : "qr.mobile.error.createFailed";
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [actor.userId, amount, definition, qrCurrencyCode]);

  useEffect(() => {
    setToken(null);
    setError(null);
    lastAutoGenerateKeyRef.current = null;
  }, [definition.code]);

  useEffect(() => {
    let mounted = true;

    async function loadQrCurrency() {
      const snapshot = await getWalletFoundationSnapshot();
      const nextCurrency = getWalletQrCurrencyCodeForSurface(definition.surface, snapshot);

      if (mounted) {
        setQrCurrencyCode(nextCurrency);
      }
    }

    void loadQrCurrency();

    return () => {
      mounted = false;
    };
  }, [definition.surface]);

  useEffect(() => {
    if (definition.requiresAmount) return;

    if (!actor.userId) {
      setError("qr.mobile.error.authRequired");
      return;
    }

    const autoKey = `${definition.code}:${actor.userId}`;
    if (lastAutoGenerateKeyRef.current === autoKey) return;

    lastAutoGenerateKeyRef.current = autoKey;
    void onGenerate();
  }, [actor.userId, definition.code, definition.requiresAmount, onGenerate]);

  const onShareQrImage = async (base64Png: string) => {
    if (!token) return;

    try {
      const sharingAvailable = await Sharing.isAvailableAsync();
      const cacheDirectory = FileSystem.cacheDirectory;

      if (!sharingAvailable || !cacheDirectory) {
        Alert.alert(tq("qr.mobile.common.shareFailedTitle"), tq("qr.mobile.common.shareFailedText"));
        return;
      }

      const fileUri = `${cacheDirectory}${getQrShareFileName(definition.code)}`;
      await FileSystem.writeAsStringAsync(fileUri, normalizeQrImageBase64(base64Png), {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri, {
        dialogTitle: functionTitle(definition.code),
        mimeType: "image/png",
      });
    } catch {
      Alert.alert(tq("qr.mobile.common.shareFailedTitle"), tq("qr.mobile.common.shareFailedText"));
    }
  };

  const selectFunction = (code: SabiQrFunctionCode) => {
    setToken(null);
    setError(null);
    setAmount("");
    pushQr({ pathname: "/qr/create", params: { functionCode: code } });
  };

  const onChangeAmount = (value: string) => {
    setAmount(normalizeVisibleAmountInput(value));
    setToken(null);
    if (error === "qr.mobile.error.amountRequired" || error === "qr.mobile.error.amountInvalid") {
      setError(null);
    }
  };

  return (
    <LinearGradient colors={["#06122B", "#101A35", "#040914"]} style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingTop: Math.max(insets.top + 10, 20), paddingBottom: Math.max(insets.bottom + 120, 140), paddingHorizontal: 18 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.roundButton} accessibilityLabel={tq("qr.mobile.common.back")}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>{tq("qr.mobile.create.eyebrow")}</Text>
            <Text style={styles.title}>{functionTitle(definition.code)}</Text>
          </View>
        </View>

        <View style={styles.identityCard}>
          <View style={[styles.identityIcon, { backgroundColor: theme.accentSoft }]}>
            <Ionicons name="shield-checkmark" size={22} color={theme.accent} />
          </View>
          <View style={styles.identityBody}>
            <Text style={styles.identityLabel}>{tq("qr.mobile.identity.autoTitle")}</Text>
            <Text numberOfLines={1} style={styles.identityName}>{actorName}</Text>
            <Text numberOfLines={1} style={styles.identityValue}>
              {actor.userId ? tq("qr.mobile.identity.userIdValue") : tq("qr.mobile.center.loginRequired")}
            </Text>
            <Text numberOfLines={1} style={styles.identitySubValue}>
              {actorPublicHandle || tq("qr.mobile.create.userIdLocked")}
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.functionScroller}>
          {SABI_QR_FUNCTION_CATALOG.map((item) => (
            <Pressable
              key={item.code}
              onPress={() => selectFunction(item.code)}
              style={[styles.functionChip, item.code === definition.code && { backgroundColor: theme.accent, borderColor: theme.accent }]}
            >
              <Text style={[styles.functionChipText, item.code === definition.code && styles.functionChipTextActive]}>{functionTitle(item.code)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{tq("qr.mobile.create.detailsTitle")}</Text>
          <Text style={styles.lockedText}>{tq("qr.mobile.create.identityAutoFilled")}</Text>
          {definition.requiresAmount ? (
            <>
              <Field label={tq("qr.mobile.common.amount")} value={amount} onChangeText={onChangeAmount} keyboardType="decimal-pad" placeholder={tq("qr.mobile.create.amountPlaceholder")} />
              <Text style={styles.lockedText}>
                {tq("qr.mobile.create.currencyAutoFilled", { value: qrCurrencyCode })}
              </Text>
            </>
          ) : (
            <Text style={styles.lockedText}>{tq("qr.mobile.create.noManualFields")}</Text>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{valueLabel(definition.surface)}</Text>
            <Text style={styles.infoText}>{valueLabel(definition.domain)}</Text>
            <Text style={styles.infoText}>{valueLabel(definition.riskLevel)}</Text>
            {definition.requiresAmount ? (
              <Text style={styles.infoText}>{qrCurrencyCode}</Text>
            ) : null}
          </View>
        </View>

        <SabiPremiumQrCard
          definition={definition}
          token={token}
          loading={busy}
          error={error}
          emptyTitleKey={definition.requiresAmount && !normalizedAmount ? "qr.mobile.card.amountWaitingTitle" : undefined}
          emptyTextKey={definition.requiresAmount && !normalizedAmount ? "qr.mobile.card.amountWaitingText" : "qr.mobile.card.autoCreatingText"}
          onRefresh={onGenerate}
          refreshDisabled={!canGenerateQr}
          onShareQrImage={onShareQrImage}
        />
      </ScrollView>
    </LinearGradient>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="rgba(255,255,255,0.38)"
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  roundButton: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  title: { color: "#FFFFFF", fontSize: 30, lineHeight: 35, fontWeight: "900", marginTop: 3 },
  identityCard: { marginTop: 16, borderRadius: 24, padding: 14, flexDirection: "row", gap: 12, backgroundColor: "rgba(255,255,255,0.085)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  identityIcon: { width: 44, height: 44, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  identityBody: { flex: 1 },
  identityLabel: { color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: "900" },
  identityName: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginTop: 5 },
  identityValue: { color: "rgba(255,255,255,0.86)", fontSize: 12, fontWeight: "900", marginTop: 5 },
  identitySubValue: { color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: "800", marginTop: 3 },
  functionScroller: { gap: 8, paddingVertical: 16 },
  functionChip: { height: 38, paddingHorizontal: 13, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  functionChipText: { color: "rgba(255,255,255,0.76)", fontSize: 12, fontWeight: "900" },
  functionChipTextActive: { color: "#07111E" },
  formCard: { borderRadius: 28, padding: 16, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", marginBottom: 16 },
  formTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  lockedText: { color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 9 },
  fieldWrap: { marginTop: 14 },
  fieldLabel: { color: "rgba(255,255,255,0.68)", fontSize: 11, fontWeight: "900", letterSpacing: 0.8, marginBottom: 7 },
  fieldInput: { minHeight: 48, borderRadius: 17, paddingHorizontal: 14, color: "#FFFFFF", fontSize: 14, fontWeight: "800", backgroundColor: "rgba(0,0,0,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  infoText: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "900", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
});
