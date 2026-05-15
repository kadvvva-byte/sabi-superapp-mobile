import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getMessengerRealtimeDiagnosticsSnapshot,
  messengerKernelFacade,
  runMessengerRealtimeTwoDeviceCheck,
  sendMessengerRealtimeClientEvent,
  subscribeMessengerRealtimeService,
  type MessengerRealtimeJournalEntry,
  type MessengerRealtimeServiceEvent,
} from "../../../core/kernel/messenger";
import { useI18n } from "../../../shared/i18n";
import {
  getMessengerProbeTexts,
  type ProbeScope,
} from "./messengerProbeTexts";

type ProbeScreenProps = {
  scope?: ProbeScope | "messenger";
};

type FeedEntry = {
  id: string;
  eventName: string;
  at: string;
  direction: "in" | "out" | "local" | "state";
  detail: string;
};

function normalizeString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeScope(value?: string | null): ProbeScope {
  switch (value) {
    case "contacts":
    case "bots":
    case "channels":
    case "business":
      return value;
    default:
      return "contacts";
  }
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? normalizeString(value[0]) : normalizeString(value);
}

function formatClock(value?: string | null) {
  const source = normalizeString(value);
  if (!source) return "--:--:--";

  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return source;

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function eventToFeedEntry(event: MessengerRealtimeServiceEvent): FeedEntry {
  const at = event.type === "connection" ? event.at : new Date().toISOString();

  if (event.type === "connection") {
    return {
      id: `${event.type}:${event.status}:${at}`,
      eventName: `connection:${event.status}`,
      at: at ?? new Date().toISOString(),
      direction: "state",
      detail: event.error ? String(event.error) : String(event.status ?? "unknown"),
    };
  }

  if (event.type === "presence") {
    return {
      id: `presence:${event.payload.userId}:${event.payload.updatedAt}`,
      eventName: "presence:update",
      at: event.payload.updatedAt,
      direction: "in",
      detail: `${event.payload.userId} · ${event.payload.status}`,
    };
  }

  if (event.type === "typing") {
    return {
      id: `typing:${event.payload.entry.chatId}:${event.payload.entry.userId}:${event.payload.entry.updatedAt}`,
      eventName: event.payload.entry.isTyping ? "typing:start" : "typing:stop",
      at: event.payload.entry.updatedAt,
      direction: "in",
      detail: `${event.payload.entry.chatId} · ${event.payload.entry.userId}`,
    };
  }

  return {
    id: `custom:${event.eventName}:${Date.now()}`,
    eventName: event.eventName ?? event.type ?? "event",
    at: new Date().toISOString(),
    direction: "in",
    detail:
      typeof event.payload === "string"
        ? event.payload
        : JSON.stringify(event.payload ?? {}).slice(0, 160),
  };
}

function journalToFeedEntry(entry: MessengerRealtimeJournalEntry): FeedEntry {
  return {
    id: entry.id,
    eventName: entry.eventName,
    at: entry.at ?? new Date().toISOString(),
    direction: entry.direction,
    detail: [entry.chatId, entry.userId, entry.messageId].filter(Boolean).join(" · ") || "—",
  };
}

export function MessengerRealtimeProbeScreen({ scope = "contacts" }: ProbeScreenProps) {
  const routeParams = useLocalSearchParams<{
    userId?: string | string[];
    chatId?: string | string[];
    channel?: string | string[];
  }>();
  const { language } = useI18n();
  const texts = useMemo(() => getMessengerProbeTexts(language), [language]);
  const normalizedScope = normalizeScope(scope === "messenger" ? "contacts" : scope);
  const [tick, setTick] = useState(0);
  const [feed, setFeed] = useState<FeedEntry[]>([]);

  const kernelUserId = messengerKernelFacade.selectors.currentUserId();
  const userId = readParam(routeParams.userId) ?? normalizeString(kernelUserId);
  const chatId = readParam(routeParams.chatId);
  const channel =
    readParam(routeParams.channel) ??
    (userId ? `messenger:${normalizedScope}:${userId}` : `messenger:${normalizedScope}`);

  const diagnostics = useMemo(() => getMessengerRealtimeDiagnosticsSnapshot(), [tick]);
  const connection = diagnostics.connection;
  const live = Boolean(connection?.connected);

  const appendEntry = useCallback((entry: FeedEntry) => {
    setFeed((current) => [entry, ...current].slice(0, 60));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeMessengerRealtimeService((event) => {
      appendEntry(eventToFeedEntry(event));
      setTick((value) => value + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [appendEntry]);

  useEffect(() => {
    if (!userId || !channel) return;

    sendMessengerRealtimeClientEvent({
      eventName: "realtime:channel:join",
      payload: { channel, userId, scope: normalizedScope, at: new Date().toISOString() },
    });

    return () => {
      sendMessengerRealtimeClientEvent({
        eventName: "realtime:channel:leave",
        payload: { channel, userId, scope: normalizedScope, at: new Date().toISOString() },
      });
    };
  }, [channel, normalizedScope, userId]);

  const runCheck = useCallback(() => {
    const result = runMessengerRealtimeTwoDeviceCheck({ chatId, userId });
    appendEntry({
      id: `check:${Date.now()}`,
      eventName: result.ready ? "two-device:ready" : "two-device:wait",
      at: new Date().toISOString(),
      direction: "state",
      detail: result.emitted.join(" · ") || JSON.stringify(result.checks),
    });
    setTick((value) => value + 1);
  }, [appendEntry, chatId, userId]);

  const emitScope = useCallback(() => {
    if (!userId) {
      appendEntry({
        id: `blocked:${Date.now()}`,
        eventName: texts.probeBlocked,
        at: new Date().toISOString(),
        direction: "local",
        detail: texts.missingRouteParam,
      });
      return;
    }

    const eventName = `messenger:${normalizedScope}:probe`;
    const sent = sendMessengerRealtimeClientEvent({
      eventName,
      payload: {
        channel,
        chatId,
        roomId: chatId,
        userId,
        scope: normalizedScope,
        at: new Date().toISOString(),
      },
    });

    appendEntry({
      id: `emit:${Date.now()}`,
      eventName,
      at: new Date().toISOString(),
      direction: sent ? "out" : "local",
      detail: sent ? channel : "messenger_realtime_socket_not_connected",
    });
    setTick((value) => value + 1);
  }, [appendEntry, channel, chatId, normalizedScope, texts.missingRouteParam, texts.probeBlocked, userId]);

  const clearFeed = useCallback(() => {
    setFeed([]);
  }, []);

  const journalEntries = diagnostics.lastEvents.slice(0, 8).map(journalToFeedEntry);
  const visibleFeed = feed.length ? feed : journalEntries;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.brand}>{texts.brand}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{texts.titles[normalizedScope]}</Text>
            <View style={[styles.statusPill, live ? styles.statusLive : styles.statusWait]}>
              <Text style={styles.statusText}>{live ? texts.live : texts.wait}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{texts.subtitles[normalizedScope]}</Text>
        </View>

        {!userId ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>{texts.missingUserWarning}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{texts.realtimeContext}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{texts.scope}</Text>
            <Text style={styles.metaValue}>{normalizedScope}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{texts.userId}</Text>
            <Text style={styles.metaValue}>{userId ?? "—"}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{texts.channel}</Text>
            <Text style={styles.metaValue}>{channel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{texts.events}</Text>
            <Text style={styles.metaValue}>{diagnostics.inboundCount}/{diagnostics.outboundCount}/{diagnostics.localOnlyCount}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryButton} onPress={runCheck}>
            <Text style={styles.primaryButtonText}>{texts.emitProbe}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={emitScope}>
            <Text style={styles.secondaryButtonText}>{texts.emitScope}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={clearFeed}>
            <Text style={styles.secondaryButtonText}>{texts.clear}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.feedHeader}>
            <Text style={styles.sectionTitle}>{texts.feedTitle}</Text>
            <Text style={styles.feedCount}>{visibleFeed.length} {texts.entries}</Text>
          </View>

          {visibleFeed.length ? (
            visibleFeed.map((entry: FeedEntry) => (
              <View key={entry.id} style={styles.eventRow}>
                <View style={styles.eventTopRow}>
                  <Text style={styles.eventName}>{entry.eventName}</Text>
                  <Text style={styles.eventTime}>{formatClock(entry.at)}</Text>
                </View>
                <Text style={styles.eventDetail}>{entry.direction.toUpperCase()} · {entry.detail}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{texts.emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>{texts.emptySubtitle}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MessengerRealtimeProbeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#08111F" },
  container: { padding: 18, paddingBottom: 36, gap: 14 },
  headerCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: "rgba(13, 27, 51, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.18)",
  },
  brand: { color: "#7DD3FC", fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  titleRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { flex: 1, color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
  subtitle: { marginTop: 8, color: "rgba(226, 232, 240, 0.72)", fontSize: 14, fontWeight: "600" },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  statusLive: { backgroundColor: "rgba(34, 197, 94, 0.16)", borderColor: "rgba(74, 222, 128, 0.42)" },
  statusWait: { backgroundColor: "rgba(251, 191, 36, 0.13)", borderColor: "rgba(251, 191, 36, 0.38)" },
  statusText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  warningCard: { borderRadius: 20, padding: 14, backgroundColor: "rgba(251, 113, 133, 0.12)", borderWidth: 1, borderColor: "rgba(251, 113, 133, 0.28)" },
  warningText: { color: "#FFE4E6", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(15, 23, 42, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "900" },
  metaRow: { marginTop: 12, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14 },
  metaLabel: { color: "rgba(203, 213, 225, 0.68)", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  metaValue: { flex: 1, color: "#E2E8F0", fontSize: 13, fontWeight: "700", textAlign: "right" },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  primaryButton: { flexGrow: 1, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: "rgba(56, 189, 248, 0.24)", borderWidth: 1, borderColor: "rgba(125, 211, 252, 0.52)" },
  primaryButtonText: { color: "#E0F2FE", fontSize: 13, fontWeight: "900", textAlign: "center" },
  secondaryButton: { flexGrow: 1, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: "rgba(30, 41, 59, 0.92)", borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.2)" },
  secondaryButtonText: { color: "#E2E8F0", fontSize: 13, fontWeight: "900", textAlign: "center" },
  feedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 },
  feedCount: { color: "rgba(203, 213, 225, 0.64)", fontSize: 12, fontWeight: "800" },
  eventRow: { marginTop: 10, borderRadius: 16, padding: 12, backgroundColor: "rgba(2, 6, 23, 0.35)", borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.12)" },
  eventTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  eventName: { flex: 1, color: "#BAE6FD", fontSize: 13, fontWeight: "900" },
  eventTime: { color: "rgba(226, 232, 240, 0.58)", fontSize: 11, fontWeight: "800" },
  eventDetail: { marginTop: 6, color: "rgba(226, 232, 240, 0.72)", fontSize: 12, fontWeight: "700", lineHeight: 16 },
  emptyState: { alignItems: "center", paddingVertical: 28 },
  emptyTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" },
  emptySubtitle: { marginTop: 7, color: "rgba(226, 232, 240, 0.62)", fontSize: 12, fontWeight: "700", textAlign: "center" },
});







