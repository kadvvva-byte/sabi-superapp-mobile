import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Bot,
  Coins,
  IdCard,
  MessageCircleMore,
  QrCode,
  ScanLine,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import { useI18n } from "../../src/shared/i18n";
import {
  formatCoinWalletAmount,
  formatPrimaryWalletAmount,
  useWalletFoundation,
} from "../../src/shared/wallet/wallet-foundation";
import { walletText } from "../../src/shared/wallet/wallet-i18n";

type SourceId = "sabi_wallet" | "coin_wallet";
type PaymentMethod = "id" | "qr";

type FundingSource = {
  id: SourceId;
  title: string;
  subtitle: string;
  balance: string;
  icon: React.ReactNode;
};

type TextMap = {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroText: string;
  currentRoute: string;
  currentAmount: string;
  byId: string;
  byQr: string;
  paymentMode: string;
  paymentModeHint: string;
  byIdText: string;
  byQrText: string;
  paymentSource: string;
  paymentSourceHint: string;
  sabiWallet: string;
  sabiWalletText: string;
  coinWallet: string;
  coinWalletText: string;
  recipientTitle: string;
  recipientHint: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  qrRecipientTitle: string;
  qrRecipientHint: string;
  qrRecipientLabel: string;
  qrRecipientPlaceholder: string;
  myMessengerQr: string;
  myMessengerQrText: string;
  scanMessengerQr: string;
  scanMessengerQrText: string;
  detailsTitle: string;
  detailsHint: string;
  amount: string;
  note: string;
  notePlaceholder: string;
  previewTitle: string;
  previewHint: string;
  mode: string;
  recipient: string;
  source: string;
  notSelected: string;
  noNote: string;
  shortcutsTitle: string;
  shortcutsHint: string;
  history: string;
  coinWalletShortcut: string;
  sabiWalletShortcut: string;
  askAi: string;
  securityTitle: string;
  securityHint: string;
  security1Title: string;
  security1Text: string;
  security2Title: string;
  security2Text: string;
  back: string;
  sendById: string;
  sendByQr: string;
  sendCoinById: string;
  sendCoinByQr: string;
};

function tr(
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string,
  key: string,
  fallback: string,
) {
  return walletText(t, key, fallback);
}

function normalizeSource(value: unknown): SourceId {
  return value === "coin_wallet" ? "coin_wallet" : "sabi_wallet";
}

function normalizeMethod(value: unknown): PaymentMethod {
  return value === "qr" ? "qr" : "id";
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  );
}

function InfoRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoBody}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

function Shortcut({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.shortcutCard}>
      <View style={styles.shortcutIcon}>{icon}</View>
      <Text style={styles.shortcutText}>{label}</Text>
    </Pressable>
  );
}

export default function WalletChatPaymentsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    source?: string;
    method?: string;
    recipientId?: string;
    recipientHandle?: string;
    qrReference?: string;
  }>();
  const { snapshot } = useWalletFoundation();

  const texts = useMemo<TextMap>(
    () => ({
      title: tr(t, "wallet.chatPayments.title", "Chat payments"),
      subtitle: tr(t, "wallet.chatPayments.subtitle", "Messenger payment route by ID or QR."),
      heroTitle: tr(t, "wallet.chatPayments.heroTitle", "Messenger payment layer"),
      heroText: tr(
        t,
        "wallet.chatPayments.heroText",
        "Chat payments must resolve real Messenger identity and wallet provider routes before confirmation.",
      ),
      currentRoute: tr(t, "wallet.chatPayments.currentRoute", "Current route"),
      currentAmount: tr(t, "wallet.chatPayments.currentAmount", "Current amount"),
      byId: tr(t, "wallet.chatPayments.byId", "By ID"),
      byQr: tr(t, "wallet.chatPayments.byQr", "By QR"),
      paymentMode: tr(t, "wallet.chatPayments.paymentMode", "Payment mode"),
      paymentModeHint: tr(t, "wallet.chatPayments.paymentModeHint", "ID or QR"),
      byIdText: tr(t, "wallet.chatPayments.byIdText", "Use internal user ID or @handle."),
      byQrText: tr(t, "wallet.chatPayments.byQrText", "Scan or generate Messenger payment QR."),
      paymentSource: tr(t, "wallet.chatPayments.paymentSource", "Payment source"),
      paymentSourceHint: tr(t, "wallet.chatPayments.paymentSourceHint", "Fiat or COIN"),
      sabiWallet: tr(t, "wallet.chatPayments.sabiWallet", "Sabi Wallet"),
      sabiWalletText: tr(t, "wallet.chatPayments.sabiWalletText", "Primary wallet balance for chat payments."),
      coinWallet: tr(t, "wallet.chatPayments.coinWallet", "Coin Wallet"),
      coinWalletText: tr(t, "wallet.chatPayments.coinWalletText", "COIN route for premium chat transfers."),
      recipientTitle: tr(t, "wallet.chatPayments.recipientTitle", "Recipient by ID"),
      recipientHint: tr(t, "wallet.chatPayments.recipientHint", "Messenger identity"),
      recipientLabel: tr(t, "wallet.chatPayments.recipientLabel", "Recipient ID / @handle"),
      recipientPlaceholder: tr(t, "wallet.chatPayments.recipientPlaceholder", "@username or user ID"),
      qrRecipientTitle: tr(t, "wallet.chatPayments.qrRecipientTitle", "QR recipient"),
      qrRecipientHint: tr(t, "wallet.chatPayments.qrRecipientHint", "Scanned result"),
      qrRecipientLabel: tr(t, "wallet.chatPayments.qrRecipientLabel", "QR recipient / reference"),
      qrRecipientPlaceholder: tr(t, "wallet.chatPayments.qrRecipientPlaceholder", "Scanned handle, ID or QR reference"),
      myMessengerQr: tr(t, "wallet.chatPayments.myMessengerQr", "My Messenger QR"),
      myMessengerQrText: tr(t, "wallet.chatPayments.myMessengerQrText", "Generate receive QR for chat."),
      scanMessengerQr: tr(t, "wallet.chatPayments.scanMessengerQr", "Scan Messenger QR"),
      scanMessengerQrText: tr(t, "wallet.chatPayments.scanMessengerQrText", "Open wallet scanner."),
      detailsTitle: tr(t, "wallet.chatPayments.detailsTitle", "Payment details"),
      detailsHint: tr(t, "wallet.chatPayments.detailsHint", "Compose"),
      amount: tr(t, "wallet.chatPayments.amount", "Amount"),
      note: tr(t, "wallet.chatPayments.note", "Note"),
      notePlaceholder: tr(t, "wallet.chatPayments.notePlaceholder", "Reason or payment note"),
      previewTitle: tr(t, "wallet.chatPayments.previewTitle", "Chat payment preview"),
      previewHint: tr(t, "wallet.chatPayments.previewHint", "Summary"),
      mode: tr(t, "wallet.chatPayments.mode", "Mode"),
      recipient: tr(t, "wallet.chatPayments.recipient", "Recipient"),
      source: tr(t, "wallet.chatPayments.source", "Source"),
      notSelected: tr(t, "wallet.chatPayments.notSelected", "Not selected"),
      noNote: tr(t, "wallet.chatPayments.noNote", "No note"),
      shortcutsTitle: tr(t, "wallet.chatPayments.shortcutsTitle", "Messenger shortcuts"),
      shortcutsHint: tr(t, "wallet.chatPayments.shortcutsHint", "Routes"),
      history: tr(t, "wallet.chatPayments.history", "History"),
      coinWalletShortcut: tr(t, "wallet.chatPayments.coinWalletShortcut", "Coin Wallet"),
      sabiWalletShortcut: tr(t, "wallet.chatPayments.sabiWalletShortcut", "Sabi Wallet"),
      askAi: tr(t, "wallet.chatPayments.askAi", "Ask AI"),
      securityTitle: tr(t, "wallet.chatPayments.securityTitle", "Messenger payment notes"),
      securityHint: tr(t, "wallet.chatPayments.securityHint", "Policy"),
      security1Title: tr(t, "wallet.chatPayments.security1Title", "Identity-linked route"),
      security1Text: tr(
        t,
        "wallet.chatPayments.security1Text",
        "The recipient must be resolved from real Messenger/user identity before money movement.",
      ),
      security2Title: tr(t, "wallet.chatPayments.security2Title", "Explicit confirmation"),
      security2Text: tr(
        t,
        "wallet.chatPayments.security2Text",
        "Chat payment is passed to Wallet confirmation and security provider before execution.",
      ),
      back: tr(t, "wallet.chatPayments.back", "Back"),
      sendById: tr(t, "wallet.chatPayments.sendById", "Send by ID"),
      sendByQr: tr(t, "wallet.chatPayments.sendByQr", "Send by QR"),
      sendCoinById: tr(t, "wallet.chatPayments.sendCoinById", "Send COIN by ID"),
      sendCoinByQr: tr(t, "wallet.chatPayments.sendCoinByQr", "Send COIN by QR"),
    }),
    [t],
  );

  const initialSource = normalizeSource(params.source);
  const initialMethod = normalizeMethod(params.method);
  const initialRecipient = String(params.recipientHandle || params.recipientId || params.qrReference || "");

  const [selectedSourceId, setSelectedSourceId] = useState<SourceId>(initialSource);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialMethod);
  const [recipientInput, setRecipientInput] = useState(initialRecipient);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const fundingSources = useMemo<FundingSource[]>(
    () => [
      {
        id: "sabi_wallet",
        title: texts.sabiWallet,
        subtitle: texts.sabiWalletText,
        balance: formatPrimaryWalletAmount(snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode),
        icon: <Wallet size={18} color="#FFFFFF" />,
      },
      {
        id: "coin_wallet",
        title: texts.coinWallet,
        subtitle: texts.coinWalletText,
        balance: formatCoinWalletAmount(snapshot.coinBalance),
        icon: <Coins size={18} color="#FFFFFF" />,
      },
    ],
    [snapshot.coinBalance, snapshot.mainBalanceUsd, snapshot.primaryCurrencyCode, texts.coinWallet, texts.coinWalletText, texts.sabiWallet, texts.sabiWalletText],
  );

  const selectedSource = fundingSources.find((item) => item.id === selectedSourceId) ?? fundingSources[0];
  const parsedAmount = Number(amount.replace(/,/g, ".") || 0);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const recipient = recipientInput.trim();
  const canSend = recipient.length >= 3 && amountValid;
  const headerTop = Math.max(insets.top, 10);
  const amountPreview = selectedSourceId === "coin_wallet"
    ? formatCoinWalletAmount(amountValid ? parsedAmount : 0)
    : formatPrimaryWalletAmount(amountValid ? parsedAmount : 0, snapshot.primaryCurrencyCode);
  const sendTitle = selectedSourceId === "coin_wallet"
    ? paymentMethod === "qr"
      ? texts.sendCoinByQr
      : texts.sendCoinById
    : paymentMethod === "qr"
      ? texts.sendByQr
      : texts.sendById;

  const handleCreateQr = () => {
    router.push({
      pathname: "/wallet/qr-create" as never,
      params: {
        variant: selectedSourceId === "coin_wallet" ? "coin" : "user",
        label: recipient || texts.myMessengerQr,
        reference: recipient || "messenger-payment",
        source: selectedSourceId,
      },
    });
  };

  const handleSend = () => {
    if (!canSend) return;

    if (selectedSourceId === "coin_wallet") {
      router.push({
        pathname: "/wallet/coin/send" as never,
        params: {
          entry: "messenger",
          method: paymentMethod,
          recipientHandle: recipient,
          amount: parsedAmount.toFixed(2),
          note: note.trim(),
        },
      });
      return;
    }

    router.push({
      pathname: "/wallet/send" as never,
      params: {
        entry: "messenger",
        method: paymentMethod,
        route: "sabi_to_sabi",
        recipientHandle: recipient,
        amount: parsedAmount.toFixed(2),
        note: note.trim(),
      },
    });
  };

  return (
    <WalletScreenShell>
      <View style={[styles.fixedHeader, { paddingTop: headerTop }]}> 
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{texts.title}</Text>
          <Text style={styles.headerSubtitle}>{texts.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <MessageCircleMore size={22} color="#EAF1FF" />
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Messenger</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{texts.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{texts.heroText}</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>{texts.currentRoute}</Text>
              <Text style={styles.heroStatValue}>{paymentMethod === "id" ? texts.byId : texts.byQr}</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>{texts.currentAmount}</Text>
              <Text style={styles.heroStatValue}>{amountPreview}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.paymentMode} hint={texts.paymentModeHint} />
          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setPaymentMethod("id")}
              style={[styles.modeCard, paymentMethod === "id" && styles.activeCard]}
            >
              <IdCard size={18} color="#FFFFFF" />
              <Text style={styles.modeTitle}>{texts.byId}</Text>
              <Text style={styles.modeText}>{texts.byIdText}</Text>
            </Pressable>
            <Pressable
              onPress={() => setPaymentMethod("qr")}
              style={[styles.modeCard, paymentMethod === "qr" && styles.activeCard]}
            >
              <QrCode size={18} color="#FFFFFF" />
              <Text style={styles.modeTitle}>{texts.byQr}</Text>
              <Text style={styles.modeText}>{texts.byQrText}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.paymentSource} hint={texts.paymentSourceHint} />
          <View style={styles.sourceGrid}>
            {fundingSources.map((source) => {
              const active = selectedSourceId === source.id;
              return (
                <Pressable
                  key={source.id}
                  onPress={() => setSelectedSourceId(source.id)}
                  style={[styles.sourceCard, active && styles.activeCard]}
                >
                  {source.icon}
                  <Text style={styles.sourceTitle}>{source.title}</Text>
                  <Text style={styles.sourceText}>{source.subtitle}</Text>
                  <Text style={styles.sourceBalance}>{source.balance}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {paymentMethod === "id" ? (
          <View style={styles.card}>
            <SectionHeader title={texts.recipientTitle} hint={texts.recipientHint} />
            <Text style={styles.fieldLabel}>{texts.recipientLabel}</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={recipientInput}
                onChangeText={setRecipientInput}
                placeholder={texts.recipientPlaceholder}
                placeholderTextColor="rgba(234,241,255,0.52)"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.qrGrid}>
              <Pressable onPress={handleCreateQr} style={styles.qrCard}>
                <QrCode size={18} color="#FFFFFF" />
                <Text style={styles.qrTitle}>{texts.myMessengerQr}</Text>
                <Text style={styles.qrText}>{texts.myMessengerQrText}</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/wallet/qr-camera" as never,
                    params: { returnTo: "/wallet/chat-payments", source: selectedSourceId, method: "qr" },
                  })
                }
                style={styles.qrCard}
              >
                <ScanLine size={18} color="#FFFFFF" />
                <Text style={styles.qrTitle}>{texts.scanMessengerQr}</Text>
                <Text style={styles.qrText}>{texts.scanMessengerQrText}</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <SectionHeader title={texts.qrRecipientTitle} hint={texts.qrRecipientHint} />
              <Text style={styles.fieldLabel}>{texts.qrRecipientLabel}</Text>
              <View style={styles.inputBox}>
                <TextInput
                  value={recipientInput}
                  onChangeText={setRecipientInput}
                  placeholder={texts.qrRecipientPlaceholder}
                  placeholderTextColor="rgba(234,241,255,0.52)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.card}>
          <SectionHeader title={texts.detailsTitle} hint={texts.detailsHint} />
          <Text style={styles.fieldLabel}>{texts.amount}</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="rgba(234,241,255,0.52)"
              style={styles.amountInput}
            />
          </View>
          <Text style={styles.fieldLabel}>{texts.note}</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={texts.notePlaceholder}
              placeholderTextColor="rgba(234,241,255,0.52)"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.previewTitle} hint={texts.previewHint} />
          <PreviewRow label={texts.mode} value={paymentMethod === "id" ? texts.byId : texts.byQr} />
          <View style={styles.divider} />
          <PreviewRow label={texts.recipient} value={recipient || texts.notSelected} />
          <View style={styles.divider} />
          <PreviewRow label={texts.source} value={selectedSource.title} />
          <View style={styles.divider} />
          <PreviewRow label={texts.amount} value={amountPreview} />
          <View style={styles.divider} />
          <PreviewRow label={texts.note} value={note.trim() || texts.noNote} />
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.shortcutsTitle} hint={texts.shortcutsHint} />
          <View style={styles.shortcutRow}>
            <Shortcut icon={<Wallet size={18} color="#FFFFFF" />} label={texts.sabiWalletShortcut} onPress={() => router.push("/wallet/payments" as never)} />
            <Shortcut icon={<Coins size={18} color="#FFFFFF" />} label={texts.coinWalletShortcut} onPress={() => router.push("/wallet/coin" as never)} />
            <Shortcut icon={<ShieldCheck size={18} color="#FFFFFF" />} label={texts.history} onPress={() => router.push("/wallet/history" as never)} />
            <Shortcut icon={<Bot size={18} color="#FFFFFF" />} label={texts.askAi} onPress={() => router.push("/ai" as never)} />
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title={texts.securityTitle} hint={texts.securityHint} />
          <InfoRow icon={<MessageCircleMore size={18} color="#EAF1FF" />} title={texts.security1Title} text={texts.security1Text} />
          <View style={styles.divider} />
          <InfoRow icon={<ShieldCheck size={18} color="#EAF1FF" />} title={texts.security2Title} text={texts.security2Text} />
        </View>

        <View style={styles.bottomActions}>
          <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{texts.back}</Text>
          </Pressable>
          <Pressable onPress={handleSend} disabled={!canSend} style={[styles.primaryButton, !canSend && styles.disabled]}>
            <Send size={18} color="#EAF1FF" />
            <Text style={styles.primaryButtonText}>{sendTitle}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 30,
    minHeight: 86,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#060F19",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,32,58,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  headerSubtitle: { color: "rgba(234,241,255,0.70)", fontSize: 12, fontWeight: "700", lineHeight: 17, marginTop: 3 },
  content: { paddingHorizontal: 20, paddingTop: 116, paddingBottom: 40 },
  heroCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    backgroundColor: "#101C31",
  },
  heroGlowA: { position: "absolute", top: -40, left: -40, width: 180, height: 150, borderRadius: 60, backgroundColor: "rgba(47,107,255,0.20)" },
  heroGlowB: { position: "absolute", right: -50, bottom: -60, width: 220, height: 160, borderRadius: 70, backgroundColor: "rgba(124,68,242,0.16)" },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 2 },
  heroIconWrap: { width: 48, height: 48, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  heroBadge: { minHeight: 32, borderRadius: 999, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  heroBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  heroTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", lineHeight: 30, marginTop: 18, zIndex: 2 },
  heroSubtitle: { color: "rgba(234,241,255,0.78)", fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 8, zIndex: 2 },
  heroStatsRow: { flexDirection: "row", gap: 10, marginTop: 16, zIndex: 2 },
  heroStatCard: { flex: 1, minHeight: 76, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.06)", padding: 12, justifyContent: "space-between" },
  heroStatLabel: { color: "rgba(234,241,255,0.62)", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  heroStatValue: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  card: { backgroundColor: "#101C31", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", borderRadius: 24, padding: 16, marginBottom: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  sectionHint: { color: "rgba(234,241,255,0.58)", fontSize: 12, fontWeight: "800" },
  modeRow: { flexDirection: "row", gap: 10 },
  modeCard: { flex: 1, minHeight: 112, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.05)", padding: 12, justifyContent: "space-between" },
  modeTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginTop: 8 },
  modeText: { color: "rgba(234,241,255,0.65)", fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 4 },
  activeCard: { borderColor: "#4F88FF", backgroundColor: "rgba(47,107,255,0.18)" },
  sourceGrid: { flexDirection: "row", gap: 10 },
  sourceCard: { flex: 1, minHeight: 142, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.05)", padding: 12 },
  sourceTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginTop: 10 },
  sourceText: { color: "rgba(234,241,255,0.65)", fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 4 },
  sourceBalance: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginTop: 10 },
  fieldLabel: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 8, marginTop: 8 },
  inputBox: { minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 14, justifyContent: "center" },
  input: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  amountInput: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  qrGrid: { flexDirection: "row", gap: 10, marginBottom: 18 },
  qrCard: { flex: 1, minHeight: 118, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "#101C31", padding: 14, justifyContent: "space-between" },
  qrTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  qrText: { color: "rgba(234,241,255,0.65)", fontSize: 11, fontWeight: "700", lineHeight: 16 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "center" },
  previewLabel: { color: "rgba(234,241,255,0.58)", fontSize: 12, fontWeight: "800" },
  previewValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", flex: 1, textAlign: "right" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 12 },
  shortcutRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shortcutCard: { width: "47.8%", minHeight: 76, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", padding: 10 },
  shortcutIcon: { marginBottom: 8 },
  shortcutText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", textAlign: "center" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoIcon: { width: 24, alignItems: "center", paddingTop: 2 },
  infoBody: { flex: 1 },
  infoTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginBottom: 4 },
  infoText: { color: "rgba(234,241,255,0.70)", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  bottomActions: { flexDirection: "row", gap: 10, marginBottom: 6 },
  secondaryButton: { flex: 1, minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: "rgba(95,142,255,0.24)", backgroundColor: "#0E1D33", alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  primaryButton: { flex: 1, minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: "#4F88FF", backgroundColor: "#2F6BFF", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 12 },
  secondaryButtonText: { color: "#EAF1FF", fontSize: 13, fontWeight: "900", textAlign: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", textAlign: "center", flexShrink: 1 },
  disabled: { opacity: 0.48 },
});
