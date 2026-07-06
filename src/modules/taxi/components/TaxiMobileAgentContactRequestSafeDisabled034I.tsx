import { AlertTriangle, FileCheck2, LockKeyhole, RefreshCw, Send, ShieldCheck } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_034I_MOBILE_AGENT_CONTACT_REQUEST_SAFE_DISABLED_CONNECT = 'TAXI-MOBILE-UIUX-034I-MOBILE-AGENT-CONTACT-REQUEST-SAFE-DISABLED-CONNECT' as const;

type TaxiAgentContactRequestStyles034I = Record<string, any>;
type TaxiAgentContactRequestState034I = 'locked' | 'ready' | 'sending' | 'safeDisabled' | 'error';
type TaxiAgentContactRequestResult034I = Readonly<{ status: number; safeDisabled: boolean; bodyBytesLabel: string }>;

const taxiAgentContactRequestEndpoints034I = [
  '/api/taxi/mobile/agent/contact/034c/request',
  '/api/taxi/mobile/agent/directory/034d/contact-request',
] as const;

function normalizeTaxiBackendBaseUrl034I(input: string): string {
  return input.trim().replace(/\/+$/, '');
}

function stringifyBodyForSize034I(value: unknown): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return '';
  }
}

async function postSafeDisabledRequest034I(baseUrl: string, path: string): Promise<TaxiAgentContactRequestResult034I> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-sabi-mobile-safe-disabled-request': 'taxi-034i',
    },
    body: JSON.stringify({
      requestType: 'agent_contact_safe_disabled_preview_034i',
      requestedAction: 'contact_approved_agent_without_money_execution',
      amountMinor: 0,
      currency: 'LOCKED',
      countryCode: 'SAFE',
      clientStage: TAXI_MOBILE_UIUX_034I_MOBILE_AGENT_CONTACT_REQUEST_SAFE_DISABLED_CONNECT,
    }),
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const bodyText = stringifyBodyForSize034I(body);
  const safeDisabled = response.status === 409 && bodyText.toLowerCase().includes('safe');
  return { status: response.status, safeDisabled, bodyBytesLabel: `${bodyText.length} bytes` };
}

export function TaxiMobileAgentContactRequestSafeDisabled034I({
  baseUrl,
  t,
  styles,
  onNotice,
}: Readonly<{
  baseUrl: string;
  t: (key: CleanTaxiCopyKey031A) => string;
  styles: TaxiAgentContactRequestStyles034I;
  onNotice: (message: string) => void;
}>) {
  const normalizedBaseUrl = useMemo(() => normalizeTaxiBackendBaseUrl034I(baseUrl), [baseUrl]);
  const [state, setState] = useState<TaxiAgentContactRequestState034I>(normalizedBaseUrl ? 'ready' : 'locked');
  const [lastResult, setLastResult] = useState<TaxiAgentContactRequestResult034I | null>(null);

  async function runSafeDisabledRequest() {
    if (!normalizedBaseUrl) {
      setState('locked');
      onNotice(t('notice.agentRequestSafeDisabled034I'));
      return;
    }

    setState('sending');
    try {
      const [contactRequest, directoryRequest] = await Promise.all(
        taxiAgentContactRequestEndpoints034I.map((path) => postSafeDisabledRequest034I(normalizedBaseUrl, path)),
      );
      const bothSafeDisabled = contactRequest.safeDisabled && directoryRequest.safeDisabled;
      const chosen = directoryRequest.safeDisabled ? directoryRequest : contactRequest;
      setLastResult(chosen);
      setState(bothSafeDisabled ? 'safeDisabled' : 'error');
      onNotice(t(bothSafeDisabled ? 'notice.agentRequestSafeDisabled034I' : 'notice.agentRequestSafeDisabled034IError'));
    } catch {
      setLastResult(null);
      setState('error');
      onNotice(t('notice.agentRequestSafeDisabled034IError'));
    }
  }

  const statusKey: CleanTaxiCopyKey031A =
    state === 'locked' ? 'agent.request.safe.state.locked'
      : state === 'sending' ? 'agent.request.safe.state.sending'
        : state === 'safeDisabled' ? 'agent.request.safe.state.safeDisabled'
          : state === 'error' ? 'agent.request.safe.state.error'
            : 'agent.request.safe.state.ready';
  const StatusIcon = state === 'safeDisabled' ? ShieldCheck : state === 'error' ? AlertTriangle : state === 'sending' ? RefreshCw : LockKeyhole;

  return (
    <View style={styles.agentRequestSafeCard034I}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('agent.request.safe.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('agent.request.safe.title')}</Text>
        </View>
        <View style={styles.agentRequestSafeHeroIcon034I}><Send color="#bfdbfe" size={20} /></View>
      </View>
      <Text style={styles.agentRequestSafeSubtitle034I}>{t('agent.request.safe.subtitle')}</Text>

      <View style={styles.agentRequestSafeStatusBox034I}>
        <StatusIcon color={state === 'error' ? '#fecaca' : '#bfdbfe'} size={18} />
        <View style={styles.agentRequestSafeStatusTextBox034I}>
          <Text style={styles.agentRequestSafeStatusTitle034I}>{t(statusKey)}</Text>
          <Text style={styles.agentRequestSafeStatusText034I}>{normalizedBaseUrl ? t('agent.request.safe.base.ready') : t('agent.request.safe.base.locked')}</Text>
        </View>
      </View>

      <View style={styles.agentRequestSafeStepRow034I}>
        <TaxiAgentRequestSafeStep034I title={t('agent.request.safe.step.contact')} text={t('agent.request.safe.step.contact.text')} styles={styles} />
        <TaxiAgentRequestSafeStep034I title={t('agent.request.safe.step.directory')} text={t('agent.request.safe.step.directory.text')} styles={styles} />
      </View>

      <View style={styles.agentRequestSafeGate034I}>
        <FileCheck2 color="#fde68a" size={18} />
        <View style={styles.agentRequestSafeStatusTextBox034I}>
          <Text style={styles.agentRequestSafeGateTitle034I}>{t('agent.request.safe.money.title')}</Text>
          <Text style={styles.agentRequestSafeGateText034I}>{t('agent.request.safe.money.text')}</Text>
          {lastResult ? <Text style={styles.agentRequestSafeGateMeta034I}>{t('agent.request.safe.last.status')}: {lastResult.status} · {lastResult.bodyBytesLabel}</Text> : null}
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={() => { void runSafeDisabledRequest(); }} style={styles.agentRequestSafeButton034I}>
        <Send color="#dbeafe" size={16} />
        <Text style={styles.agentRequestSafeButtonText034I}>{t('agent.request.safe.action.test')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiAgentRequestSafeStep034I({ title, text, styles }: Readonly<{ title: string; text: string; styles: TaxiAgentContactRequestStyles034I }>) {
  return (
    <View style={styles.agentRequestSafeStep034I}>
      <Text style={styles.agentRequestSafeStepTitle034I}>{title}</Text>
      <Text style={styles.agentRequestSafeStepText034I}>{text}</Text>
    </View>
  );
}
