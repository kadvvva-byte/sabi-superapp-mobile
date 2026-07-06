import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { TaxiAgentCityService030D } from './TaxiAgentCityService030D';

export const TAXI_AGENT_FINANCE_BRIDGE_030A = 'TAXI_AGENT_FINANCE_BRIDGE_030A_MOBILE_TAXI_FOUNDATION';
export const TAXI_AGENT_APPLICATION_030B = 'TAXI_AGENT_APPLICATION_030B_MOBILE_TAXI_FINANCE';
export const TAXI_AGENT_MOBILE_UI_030D = 'TAXI_AGENT_MOBILE_UI_030D_AGENT_APPLICATION_APPROVED_MAIN_CHAT_CITY_VISIBLE';

type ReceiptDraft030A = Readonly<{
  fileName: string;
  uri?: string;
  mimeType?: string;
  label?: string;
}>;

type AgentFinanceContext030A = Readonly<{
  agentId?: string;
  agentAccountId?: string;
  firstName?: string;
  lastName?: string;
  countryLabel?: string;
  cityLabel?: string;
  balanceCurrencyLabel?: string;
  currentBalanceLabel?: string;
  adminPaymentProviderLabel?: string;
  adminPaymentAccountLabel?: string;
  adminPaymentInstructionLabel?: string;
  adminPaymentQrLabel?: string;
  publicAgentNumberLabel?: string;
  applicationStatusLabel?: string;
  allowed?: boolean;
  reason?: string;
}>;

type AgentMobileTab030D = 'apply' | 'main' | 'chat';

type Props = Readonly<{
  baseUrl: string;
  token?: string;
  onPickReceipt?: () => Promise<ReceiptDraft030A | null>;
  onNotice?: (message: string) => void;
}>;

async function postJson(baseUrl: string, token: string | undefined, path: string, payload: Record<string, string>) {
  if (!baseUrl.trim()) {
    throw new Error('Taxi agent runtime base URL is locked until approved backend connection is configured.');
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = { message: text };
  }
  return { response, parsed };
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value);
}

function readContext(parsed: Record<string, unknown>): AgentFinanceContext030A {
  return {
    agentId: asText(parsed.agentId),
    agentAccountId: asText(parsed.agentAccountId || parsed.accountId),
    firstName: asText(parsed.firstName || parsed.agentFirstName),
    lastName: asText(parsed.lastName || parsed.agentLastName),
    countryLabel: asText(parsed.countryLabel || parsed.country),
    cityLabel: asText(parsed.cityLabel || parsed.city),
    balanceCurrencyLabel: asText(parsed.balanceCurrencyLabel || parsed.currencyLabel),
    currentBalanceLabel: asText(parsed.currentBalanceLabel || parsed.balanceLabel),
    adminPaymentProviderLabel: asText(parsed.adminPaymentProviderLabel || parsed.paymentProviderLabel),
    adminPaymentAccountLabel: asText(parsed.adminPaymentAccountLabel || parsed.adminAccountLabel),
    adminPaymentInstructionLabel: asText(parsed.adminPaymentInstructionLabel || parsed.paymentInstructionLabel),
    adminPaymentQrLabel: asText(parsed.adminPaymentQrLabel || parsed.qrLabel),
    publicAgentNumberLabel: asText(parsed.publicAgentNumberLabel || parsed.agentPublicPhone || parsed.agentPhone),
    applicationStatusLabel: asText(parsed.applicationStatusLabel || parsed.applicationStatus || parsed.reviewStatus),
    allowed: parsed.allowed === true,
    reason: asText(parsed.reason || parsed.code || parsed.error || parsed.message),
  };
}

function Field030D({ label, value }: Readonly<{ label: string; value?: string }>) {
  return (
    <View style={{ flex: 1, minWidth: 130, borderRadius: 16, backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1e293b', padding: 10 }}>
      <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800' }}>{label}</Text>
      <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: '900', marginTop: 3 }}>{value || 'с сервера'}</Text>
    </View>
  );
}

function Tab030D({ active, label, onPress }: Readonly<{ active: boolean; label: string; onPress: () => void }>) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, borderRadius: 16, paddingVertical: 11, paddingHorizontal: 8, backgroundColor: active ? '#22d3ee' : '#0b1220', borderWidth: 1, borderColor: active ? '#67e8f9' : '#1e293b' }}>
      <Text style={{ color: active ? '#042f2e' : '#cbd5e1', textAlign: 'center', fontWeight: '900', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

export function TaxiAgentFinanceBridge030A({ baseUrl, token, onPickReceipt, onNotice }: Props) {
  const [busy, setBusy] = useState('');
  const [tab, setTab] = useState<AgentMobileTab030D>('apply');
  const [context, setContext] = useState<AgentFinanceContext030A>({});
  const [messageText, setMessageText] = useState('');
  const [requestValue, setRequestValue] = useState('');
  const [proofReference, setProofReference] = useState('');
  const [receipt, setReceipt] = useState<ReceiptDraft030A | null>(null);
  const [lastStatus, setLastStatus] = useState('Ожидает подключения к серверу');
  const [applicationFirstName, setApplicationFirstName] = useState('');
  const [applicationLastName, setApplicationLastName] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('');
  const [applicationPhone, setApplicationPhone] = useState('');
  const [applicationCountry, setApplicationCountry] = useState('');
  const [applicationCity, setApplicationCity] = useState('');
  const [applicationAddress, setApplicationAddress] = useState('');
  const [applicationNote, setApplicationNote] = useState('');
  const [applicationDocument, setApplicationDocument] = useState<ReceiptDraft030A | null>(null);

  const agentName = useMemo(() => `${context.firstName || ''} ${context.lastName || ''}`.trim() || 'Агент', [context.firstName, context.lastName]);
  const accessText = context.allowed ? 'Доступ к главному экрану агента открыт после утверждения' : 'Главный экран агента откроется только после утверждения Owner/Admin';

  async function run(action: string, path: string, extra: Record<string, string> = {}) {
    if (!baseUrl.trim()) {
      const status = 'Runtime locked: backend base URL is not configured. No network call, wallet mutation or money movement was executed.';
      setLastStatus(status);
      onNotice?.(status);
      return;
    }
    setBusy(action);
    try {
      const { response, parsed } = await postJson(baseUrl, token, path, {
        module: 'taxi_mobile_agent_finance_bridge_030a',
        stage: TAXI_AGENT_FINANCE_BRIDGE_030A,
        uiStage: TAXI_AGENT_MOBILE_UI_030D,
        agentId: context.agentId || '',
        agentAccountId: context.agentAccountId || '',
        requestValue,
        proofReference,
        messageText,
        receiptFileName: receipt?.fileName || '',
        receiptMimeType: receipt?.mimeType || '',
        applicationStage: TAXI_AGENT_APPLICATION_030B,
        applicationFirstName,
        applicationLastName,
        applicationEmail,
        applicationPhone,
        applicationCountry,
        applicationCity,
        applicationAddress,
        applicationNote,
        applicationDocumentFileName: applicationDocument?.fileName || '',
        applicationDocumentMimeType: applicationDocument?.mimeType || '',
        agentAgreementAccepted: 'true',
        ...extra,
      });
      const nextContext = readContext(parsed);
      setContext((current) => ({ ...current, ...nextContext }));
      const status = `${response.status}: ${asText(parsed.message || parsed.code || parsed.status || 'ответ сервера')}`;
      setLastStatus(status);
      onNotice?.(status);
    } catch (error) {
      const status = error instanceof Error ? error.message : String(error);
      setLastStatus(`Ошибка сети: ${status}`);
      onNotice?.(`Ошибка сети: ${status}`);
    } finally {
      setBusy('');
    }
  }

  async function pickApplicationDocument() {
    if (!onPickReceipt) {
      setLastStatus('Нужен host picker: ImagePicker/DocumentPicker для документов заявки');
      return;
    }
    const selected = await onPickReceipt();
    setApplicationDocument(selected);
  }

  async function pickReceipt() {
    if (!onPickReceipt) {
      setLastStatus('Нужен host picker: ImagePicker/DocumentPicker подключается в mobile app shell');
      return;
    }
    const selected = await onPickReceipt();
    setReceipt(selected);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#020617' }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ borderRadius: 28, backgroundColor: '#07111f', padding: 16, borderWidth: 1, borderColor: '#1f3b57', gap: 10 }}>
        <Text style={{ color: '#67e8f9', fontWeight: '900', fontSize: 11 }}>{TAXI_AGENT_MOBILE_UI_030D}</Text>
        <Text style={{ color: '#f8fafc', fontWeight: '900', fontSize: 26 }}>Агентство такси</Text>
        <Text style={{ color: '#94a3b8', lineHeight: 20 }}>Отдельный mobile экран: заявка на агентство, главный экран после утверждения, messenger-чат с админом для пополнения баланса агента.</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tab030D active={tab === 'apply'} label="Стать агентом" onPress={() => setTab('apply')} />
          <Tab030D active={tab === 'main'} label="Главная" onPress={() => setTab('main')} />
          <Tab030D active={tab === 'chat'} label="Чат" onPress={() => setTab('chat')} />
        </View>
      </View>

      {tab === 'apply' && (
        <View style={{ borderRadius: 24, backgroundColor: '#111827', padding: 16, borderWidth: 1, borderColor: '#7c3aed' }}>
          <Text style={{ color: '#c4b5fd', fontWeight: '900', fontSize: 12 }}>Заявка на агентство</Text>
          <Text style={{ color: '#f8fafc', fontWeight: '900', fontSize: 22, marginTop: 4 }}>Стать агентом такси</Text>
          <Text style={{ color: '#94a3b8', marginTop: 6 }}>Заполни полные данные, email, государство, город и документы. После проверки Owner/Admin откроет агентские функции.</Text>
          <TextInput value={applicationFirstName} onChangeText={setApplicationFirstName} placeholder="Имя" placeholderTextColor="#64748b" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#4c1d95', borderRadius: 16, padding: 12 }} />
          <TextInput value={applicationLastName} onChangeText={setApplicationLastName} placeholder="Фамилия" placeholderTextColor="#64748b" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#4c1d95', borderRadius: 16, padding: 12 }} />
          <TextInput value={applicationEmail} onChangeText={setApplicationEmail} placeholder="Электронная почта" placeholderTextColor="#64748b" keyboardType="email-address" autoCapitalize="none" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#4c1d95', borderRadius: 16, padding: 12 }} />
          <TextInput value={applicationPhone} onChangeText={setApplicationPhone} placeholder="Телефон" placeholderTextColor="#64748b" keyboardType="phone-pad" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#4c1d95', borderRadius: 16, padding: 12 }} />
          <TextInput value={applicationCountry} onChangeText={setApplicationCountry} placeholder="Государство" placeholderTextColor="#64748b" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#4c1d95', borderRadius: 16, padding: 12 }} />
          <TextInput value={applicationCity} onChangeText={setApplicationCity} placeholder="Город" placeholderTextColor="#64748b" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#4c1d95', borderRadius: 16, padding: 12 }} />
          <TextInput value={applicationAddress} onChangeText={setApplicationAddress} placeholder="Адрес / зона работы" placeholderTextColor="#64748b" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#4c1d95', borderRadius: 16, padding: 12 }} />
          <TextInput value={applicationNote} onChangeText={setApplicationNote} placeholder="Комментарий к заявке" placeholderTextColor="#64748b" multiline style={{ marginTop: 10, minHeight: 72, color: '#e5e7eb', borderWidth: 1, borderColor: '#4c1d95', borderRadius: 16, padding: 12 }} />
          <Pressable disabled={busy !== ''} onPress={pickApplicationDocument} style={{ marginTop: 10, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#a78bfa' }}>
            <Text style={{ color: '#ddd6fe', fontWeight: '900', textAlign: 'center' }}>{applicationDocument ? `Документ выбран: ${applicationDocument.fileName}` : 'Прикрепить документ / фото / скрин заявки'}</Text>
          </Pressable>
          <Pressable disabled={busy !== ''} onPress={() => run('agentApplicationSubmit', '/api/taxi/mobile/agent/application/submit')} style={{ marginTop: 10, borderRadius: 16, padding: 14, backgroundColor: '#7c3aed' }}>
            <Text style={{ color: '#faf5ff', fontWeight: '900', textAlign: 'center' }}>Отправить заявку на проверку</Text>
          </Pressable>
        </View>
      )}

      {tab === 'main' && (
        <View style={{ gap: 12 }}>
          <View style={{ borderRadius: 24, backgroundColor: '#0b1220', padding: 16, borderWidth: 1, borderColor: context.allowed ? '#22c55e' : '#f59e0b' }}>
            <Text style={{ color: context.allowed ? '#86efac' : '#fde68a', fontWeight: '900', fontSize: 12 }}>Главный экран агента</Text>
            <Text style={{ color: '#f8fafc', fontWeight: '900', fontSize: 24, marginTop: 4 }}>{agentName}</Text>
            <Text style={{ color: '#cbd5e1', marginTop: 5 }}>{accessText}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <Field030D label="Страна" value={context.countryLabel} />
              <Field030D label="Город" value={context.cityLabel} />
              <Field030D label="Валюта" value={context.balanceCurrencyLabel} />
              <Field030D label="Баланс" value={context.currentBalanceLabel} />
              <Field030D label="Статус заявки" value={context.applicationStatusLabel || context.reason} />
              <Field030D label="Агентский счёт" value={context.agentAccountId} />
            </View>
            <Pressable disabled={busy !== ''} onPress={() => run('context', '/api/taxi/mobile/agent/finance/context')} style={{ marginTop: 12, borderRadius: 16, padding: 12, backgroundColor: '#0e7490' }}>
              <Text style={{ color: '#ecfeff', fontWeight: '900', textAlign: 'center' }}>Обновить данные агента</Text>
            </Pressable>
          </View>
          <TaxiAgentCityService030D baseUrl={baseUrl} token={token} agentCityLabel={context.cityLabel} publicAgentNumberLabel={context.publicAgentNumberLabel} onNotice={onNotice} />
        </View>
      )}

      {tab === 'chat' && (
        <View style={{ gap: 12 }}>
          <View style={{ borderRadius: 24, backgroundColor: '#0b1220', padding: 14, borderWidth: 1, borderColor: '#155e75' }}>
            <Text style={{ color: '#67e8f9', fontWeight: '900' }}>Счёт админа для пополнения</Text>
            <Text style={{ color: '#e5e7eb', marginTop: 8 }}>{context.adminPaymentProviderLabel || 'провайдер с сервера'}</Text>
            <Text style={{ color: '#f8fafc', fontWeight: '900', marginTop: 6 }}>{context.adminPaymentAccountLabel || 'реквизиты / счёт с сервера'}</Text>
            <Text style={{ color: '#cbd5e1', marginTop: 6 }}>{context.adminPaymentInstructionLabel || 'инструкция оплаты с сервера'}</Text>
            <Text style={{ color: '#93c5fd', marginTop: 6 }}>{context.adminPaymentQrLabel || 'QR / ссылка с сервера'}</Text>
            <Pressable disabled={busy !== ''} onPress={() => run('adminAccount', '/api/taxi/mobile/agent/finance/admin-account/request')} style={{ marginTop: 12, borderRadius: 16, padding: 12, backgroundColor: '#1d4ed8' }}>
              <Text style={{ color: '#eff6ff', fontWeight: '900', textAlign: 'center' }}>Получить счёт админа</Text>
            </Pressable>
          </View>
          <View style={{ borderRadius: 24, backgroundColor: '#0b1220', padding: 14, borderWidth: 1, borderColor: '#334155' }}>
            <Text style={{ color: '#e5e7eb', fontWeight: '900', fontSize: 22 }}>Чат с админом</Text>
            <Text style={{ color: '#94a3b8', marginTop: 6 }}>Отдельный messenger-like экран для связи с Owner/Admin по пополнению баланса агента.</Text>
            <TextInput value={requestValue} onChangeText={setRequestValue} placeholder="Сумма" placeholderTextColor="#64748b" keyboardType="decimal-pad" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 12 }} />
            <TextInput value={proofReference} onChangeText={setProofReference} placeholder="TxHash / номер платежа" placeholderTextColor="#64748b" style={{ marginTop: 10, color: '#e5e7eb', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 12 }} />
            <TextInput value={messageText} onChangeText={setMessageText} placeholder="Сообщение админу" placeholderTextColor="#64748b" multiline style={{ marginTop: 10, minHeight: 92, color: '#e5e7eb', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 12 }} />
            <Pressable disabled={busy !== ''} onPress={pickReceipt} style={{ marginTop: 10, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#22d3ee' }}>
              <Text style={{ color: '#bae6fd', fontWeight: '900', textAlign: 'center' }}>{receipt ? `Файл выбран: ${receipt.fileName}` : 'Прикрепить фото / скрин / файл'}</Text>
            </Pressable>
            <Pressable disabled={busy !== ''} onPress={() => run(receipt ? 'receipt' : 'chat', receipt ? '/api/taxi/mobile/agent/finance/receipt/send' : '/api/taxi/mobile/agent/finance/chat/send')} style={{ marginTop: 10, borderRadius: 16, padding: 14, backgroundColor: '#059669' }}>
              <Text style={{ color: '#ecfdf5', fontWeight: '900', textAlign: 'center' }}>Отправить админу</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={{ color: '#94a3b8' }}>{lastStatus}</Text>
    </ScrollView>
  );
}

export default TaxiAgentFinanceBridge030A;
