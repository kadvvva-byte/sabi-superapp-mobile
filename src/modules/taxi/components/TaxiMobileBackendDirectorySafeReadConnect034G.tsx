import { Bot, CheckCircle2, Database, LockKeyhole, RefreshCw, Route, Server, ShieldCheck, UsersRound, WifiOff } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_034G_MOBILE_BACKEND_DIRECTORY_SAFE_READ_CONNECT = 'TAXI-MOBILE-UIUX-034G-MOBILE-BACKEND-DIRECTORY-SAFE-READ-CONNECT' as const;

type TaxiBackendDirectorySafeReadStyles034G = Record<string, any>;
type TaxiBackendDirectorySafeReadStatus034G = 'locked' | 'loading' | 'ready' | 'error';
type TaxiBackendDirectoryEndpoint034G = Readonly<{ key: 'contact' | 'contract' | 'directory' | 'records' | 'permissions' | 'owner'; labelKey: CleanTaxiCopyKey031A; path: string }>;
type TaxiBackendDirectoryReadState034G = Readonly<{
  status: TaxiBackendDirectorySafeReadStatus034G;
  checkedAt?: string;
  contactOk: boolean;
  directoryOk: boolean;
  recordsOk: boolean;
  permissionsOk: boolean;
  contractOk: boolean;
  ownerOk: boolean;
  recordCount: number;
  messageKey: CleanTaxiCopyKey031A;
}>;

const taxiBackendDirectoryEndpoints034G: TaxiBackendDirectoryEndpoint034G[] = [
  { key: 'contact', labelKey: 'agent.backend.connect.readiness.contact', path: '/api/taxi/mobile/agent/contact/034c/readiness' },
  { key: 'contract', labelKey: 'agent.backend.connect.readiness.contract', path: '/api/taxi/mobile/agent/contact/034c/contract' },
  { key: 'directory', labelKey: 'agent.backend.connect.readiness.directory', path: '/api/taxi/mobile/agent/directory/034d/readiness' },
  { key: 'records', labelKey: 'agent.backend.connect.readiness.records', path: '/api/taxi/mobile/agent/directory/034d/records' },
  { key: 'permissions', labelKey: 'agent.backend.connect.readiness.permissions', path: '/api/taxi/mobile/agent/directory/034d/permissions' },
  { key: 'owner', labelKey: 'agent.backend.connect.readiness.owner', path: '/api/taxi/mobile/agent/directory/034d/owner-ai' },
];

function normalizeTaxiBackendBaseUrl034G(input: string): string {
  return input.trim().replace(/\/+$/, '');
}

function extractRecordCount034G(value: unknown): number {
  if (!value || typeof value !== 'object') return 0;
  const candidate = value as { records?: unknown; data?: unknown };
  if (Array.isArray(candidate.records)) return candidate.records.length;
  if (candidate.data && typeof candidate.data === 'object' && Array.isArray((candidate.data as { records?: unknown }).records)) return ((candidate.data as { records: unknown[] }).records).length;
  return 0;
}

async function safeReadJson034G(baseUrl: string, path: string): Promise<{ ok: boolean; status: number; body: unknown }> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'x-sabi-mobile-safe-read': 'taxi-034g',
    },
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { ok: response.ok, status: response.status, body };
}

export function TaxiMobileBackendDirectorySafeReadConnect034G({
  baseUrl,
  t,
  styles,
  onNotice,
}: Readonly<{
  baseUrl: string;
  t: (key: CleanTaxiCopyKey031A) => string;
  styles: TaxiBackendDirectorySafeReadStyles034G;
  onNotice: (message: string) => void;
}>) {
  const normalizedBaseUrl = useMemo(() => normalizeTaxiBackendBaseUrl034G(baseUrl), [baseUrl]);
  const [readState, setReadState] = useState<TaxiBackendDirectoryReadState034G>({
    status: normalizedBaseUrl ? 'loading' : 'locked',
    contactOk: false,
    directoryOk: false,
    recordsOk: false,
    permissionsOk: false,
    contractOk: false,
    ownerOk: false,
    recordCount: 0,
    messageKey: normalizedBaseUrl ? 'agent.backend.connect.state.loading' : 'agent.backend.connect.state.locked',
  });

  const loadSafeRead = useCallback(async () => {
    if (!normalizedBaseUrl) {
      setReadState({
        status: 'locked',
        contactOk: false,
        directoryOk: false,
        recordsOk: false,
        permissionsOk: false,
        contractOk: false,
        ownerOk: false,
        recordCount: 0,
        messageKey: 'agent.backend.connect.state.locked',
      });
      return;
    }

    setReadState((prev) => ({ ...prev, status: 'loading', messageKey: 'agent.backend.connect.state.loading' }));

    try {
      const [contact, contract, directory, records, permissions, owner] = await Promise.all(
        taxiBackendDirectoryEndpoints034G.map((endpoint) => safeReadJson034G(normalizedBaseUrl, endpoint.path)),
      );
      const allOk = contact.ok && contract.ok && directory.ok && records.ok && permissions.ok && owner.ok;
      setReadState({
        status: allOk ? 'ready' : 'error',
        checkedAt: new Date().toISOString(),
        contactOk: contact.ok,
        directoryOk: directory.ok,
        contractOk: contract.ok,
        recordsOk: records.ok,
        permissionsOk: permissions.ok,
        ownerOk: owner.ok,
        recordCount: extractRecordCount034G(records.body),
        messageKey: allOk ? 'agent.backend.connect.state.ready' : 'agent.backend.connect.state.error',
      });
    } catch {
      setReadState({
        status: 'error',
        checkedAt: new Date().toISOString(),
        contactOk: false,
        directoryOk: false,
        recordsOk: false,
        permissionsOk: false,
        contractOk: false,
        ownerOk: false,
        recordCount: 0,
        messageKey: 'agent.backend.connect.state.error',
      });
    }
  }, [normalizedBaseUrl]);

  useEffect(() => {
    void loadSafeRead();
  }, [loadSafeRead]);

  const statusLabel = t(readState.messageKey);
  const endpointStatuses = [readState.contactOk, readState.contractOk, readState.directoryOk, readState.recordsOk, readState.permissionsOk, readState.ownerOk];
  const readyCount = endpointStatuses.filter(Boolean).length;
  const StatusIcon = readState.status === 'ready' ? CheckCircle2 : readState.status === 'locked' ? LockKeyhole : readState.status === 'loading' ? RefreshCw : WifiOff;

  return (
    <View style={styles.backendDirectoryConnectCard034G}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('agent.backend.connect.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('agent.backend.connect.title')}</Text>
        </View>
        <View style={styles.backendDirectoryConnectHeroIcon034G}><Server color="#a7f3d0" size={20} /></View>
      </View>
      <Text style={styles.backendDirectoryConnectSubtitle034G}>{t('agent.backend.connect.subtitle')}</Text>

      <View style={styles.backendDirectoryConnectStatusBox034G}>
        <StatusIcon color="#bbf7d0" size={18} />
        <View style={styles.backendDirectoryConnectStatusTextBox034G}>
          <Text style={styles.backendDirectoryConnectStatusTitle034G}>{statusLabel}</Text>
          <Text style={styles.backendDirectoryConnectStatusText034G}>{normalizedBaseUrl ? t('agent.backend.connect.base.ready') : t('agent.backend.connect.base.locked')}</Text>
        </View>
      </View>

      <View style={styles.backendDirectoryConnectMetricRow034G}>
        <TaxiBackendDirectoryMetric034G label={t('agent.backend.connect.metric.endpoints')} value={`${readyCount}/6`} styles={styles} />
        <TaxiBackendDirectoryMetric034G label={t('agent.backend.connect.metric.records')} value={String(readState.recordCount)} styles={styles} />
        <TaxiBackendDirectoryMetric034G label={t('agent.backend.connect.metric.money')} value={t('agent.backend.connect.state.locked.short')} styles={styles} locked />
      </View>

      <View style={styles.backendDirectoryConnectGrid034G}>
        <TaxiBackendDirectoryTile034G icon="route" label={t('agent.backend.connect.readiness.contact')} ok={readState.contactOk} styles={styles} />
        <TaxiBackendDirectoryTile034G icon="shield" label={t('agent.backend.connect.readiness.contract')} ok={readState.contractOk} styles={styles} />
        <TaxiBackendDirectoryTile034G icon="users" label={t('agent.backend.connect.readiness.directory')} ok={readState.directoryOk} styles={styles} />
        <TaxiBackendDirectoryTile034G icon="database" label={t('agent.backend.connect.readiness.records')} ok={readState.recordsOk} styles={styles} />
        <TaxiBackendDirectoryTile034G icon="shield" label={t('agent.backend.connect.readiness.permissions')} ok={readState.permissionsOk} styles={styles} />
        <TaxiBackendDirectoryTile034G icon="bot" label={t('agent.backend.connect.readiness.owner')} ok={readState.ownerOk} styles={styles} wide />
      </View>

      <View style={styles.backendDirectoryConnectMoneyGate034G}>
        <LockKeyhole color="#fde68a" size={18} />
        <View style={styles.backendDirectoryConnectStatusTextBox034G}>
          <Text style={styles.backendDirectoryConnectMoneyTitle034G}>{t('agent.backend.connect.money.title')}</Text>
          <Text style={styles.backendDirectoryConnectMoneyText034G}>{t('agent.backend.connect.money.text')}</Text>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={() => { void loadSafeRead(); onNotice(t('notice.agentBackendDirectory034G')); }} style={styles.backendDirectoryConnectRefresh034G}>
        <RefreshCw color="#d1fae5" size={16} />
        <Text style={styles.backendDirectoryConnectRefreshText034G}>{t('agent.backend.connect.action.refresh')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiBackendDirectoryMetric034G({ label, value, styles, locked }: Readonly<{ label: string; value: string; styles: TaxiBackendDirectorySafeReadStyles034G; locked?: boolean }>) {
  return (
    <View style={[styles.backendDirectoryConnectMetric034G, locked && styles.backendDirectoryConnectMetricLocked034G]}>
      <Text style={styles.backendDirectoryConnectMetricLabel034G}>{label}</Text>
      <Text style={styles.backendDirectoryConnectMetricValue034G}>{value}</Text>
    </View>
  );
}

function TaxiBackendDirectoryTile034G({ icon, label, ok, styles, wide }: Readonly<{ icon: 'route' | 'users' | 'database' | 'shield' | 'bot'; label: string; ok: boolean; styles: TaxiBackendDirectorySafeReadStyles034G; wide?: boolean }>) {
  const Icon = icon === 'route' ? Route : icon === 'users' ? UsersRound : icon === 'database' ? Database : icon === 'shield' ? ShieldCheck : Bot;
  return (
    <View style={[styles.backendDirectoryConnectTile034G, wide && styles.backendDirectoryConnectTileWide034G]}>
      <View style={styles.backendDirectoryConnectTileIcon034G}><Icon color="#a7f3d0" size={16} /></View>
      <Text style={[styles.backendDirectoryConnectTileStatus034G, ok && styles.backendDirectoryConnectTileStatusReady034G]}>{ok ? '200' : 'LOCK'}</Text>
      <Text style={styles.backendDirectoryConnectTileLabel034G}>{label}</Text>
    </View>
  );
}
