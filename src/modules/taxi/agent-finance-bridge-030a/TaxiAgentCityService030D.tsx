import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export const TAXI_AGENT_CITY_SERVICE_030D = 'TAXI_AGENT_CITY_SERVICE_030D_PUBLIC_AGENT_NUMBER_AND_CITY_TOPUP';

type CityServiceProps030D = Readonly<{
  baseUrl: string;
  token?: string;
  agentCityLabel?: string;
  publicAgentNumberLabel?: string;
  onNotice?: (message: string) => void;
}>;

async function postJson030D(baseUrl: string, token: string | undefined, path: string, payload: Record<string, string>) {
  if (!baseUrl.trim()) {
    throw new Error('Taxi city agent runtime base URL is locked until approved backend connection is configured.');
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

function asText030D(value: unknown): string {
  return typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value);
}

export function TaxiAgentCityService030D({ baseUrl, token, agentCityLabel, publicAgentNumberLabel, onNotice }: CityServiceProps030D) {
  const [city, setCity] = useState(agentCityLabel || '');
  const [targetAccount, setTargetAccount] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [topupComment, setTopupComment] = useState('');
  const [busy, setBusy] = useState('');
  const [status, setStatus] = useState('Ожидает подключения к серверу');

  async function run(action: string, path: string) {
    if (!baseUrl.trim()) {
      const nextStatus = 'Runtime locked: backend base URL is not configured. No network call, wallet mutation or money movement was executed.';
      setStatus(nextStatus);
      onNotice?.(nextStatus);
      return;
    }
    setBusy(action);
    try {
      const { response, parsed } = await postJson030D(baseUrl, token, path, {
        module: TAXI_AGENT_CITY_SERVICE_030D,
        city,
        targetAccount,
        topupAmount,
        topupComment,
        publicAgentNumberLabel: publicAgentNumberLabel || '',
      });
      const nextStatus = `${response.status}: ${asText030D(parsed.message || parsed.code || parsed.status || 'ответ сервера')}`;
      setStatus(nextStatus);
      onNotice?.(nextStatus);
    } catch (error) {
      const nextStatus = error instanceof Error ? error.message : String(error);
      setStatus(`Ошибка сети: ${nextStatus}`);
      onNotice?.(`Ошибка сети: ${nextStatus}`);
    } finally {
      setBusy('');
    }
  }

  return (
    <View style={{ borderRadius: 24, backgroundColor: '#07111f', padding: 16, borderWidth: 1, borderColor: '#14532d', gap: 10 }}>
      <Text style={{ color: '#86efac', fontWeight: '900', fontSize: 12 }}>{TAXI_AGENT_CITY_SERVICE_030D}</Text>
      <Text style={{ color: '#f8fafc', fontWeight: '900', fontSize: 22 }}>Городской номер агента</Text>
      <Text style={{ color: '#cbd5e1', lineHeight: 20 }}>
        После утверждения номер агента показывается водителям выбранного города. Таксисты видят, к какому агенту обращаться для пополнения баланса.
      </Text>
      <View style={{ borderRadius: 18, backgroundColor: '#052e16', padding: 12, borderWidth: 1, borderColor: '#22c55e' }}>
        <Text style={{ color: '#bbf7d0', fontWeight: '900' }}>Публичный номер для города</Text>
        <Text style={{ color: '#f0fdf4', fontWeight: '900', fontSize: 18, marginTop: 4 }}>{publicAgentNumberLabel || 'номер агента придёт с сервера'}</Text>
        <Text style={{ color: '#86efac', marginTop: 4 }}>{city || agentCityLabel || 'город агента с сервера'}</Text>
      </View>
      <TextInput value={city} onChangeText={setCity} placeholder="Город" placeholderTextColor="#64748b" style={{ color: '#e5e7eb', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 12 }} />
      <Pressable disabled={busy !== ''} onPress={() => run('publicNumber', '/api/taxi/mobile/agent/city/public-contact/request')} style={{ borderRadius: 16, padding: 13, backgroundColor: '#15803d' }}>
        <Text style={{ color: '#f0fdf4', fontWeight: '900', textAlign: 'center' }}>Обновить номер для города</Text>
      </Pressable>
      <Text style={{ color: '#f8fafc', fontWeight: '900', fontSize: 20, marginTop: 4 }}>Пополнение баланса водителя</Text>
      <Text style={{ color: '#94a3b8', lineHeight: 19 }}>
        Агент принимает заявку от водителя своего города и отправляет запрос на пополнение через сервер. Только серверный запрос; деньги не двигаются до подтверждения backend/ledger.
      </Text>
      <TextInput value={targetAccount} onChangeText={setTargetAccount} placeholder="ID / телефон / аккаунт водителя" placeholderTextColor="#64748b" style={{ color: '#e5e7eb', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 12 }} />
      <TextInput value={topupAmount} onChangeText={setTopupAmount} placeholder="Сумма" placeholderTextColor="#64748b" keyboardType="decimal-pad" style={{ color: '#e5e7eb', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 12 }} />
      <TextInput value={topupComment} onChangeText={setTopupComment} placeholder="Комментарий" placeholderTextColor="#64748b" multiline style={{ color: '#e5e7eb', minHeight: 70, borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 12 }} />
      <Pressable disabled={busy !== ''} onPress={() => run('cityTopup', '/api/taxi/mobile/agent/finance/city-account-topup/request')} style={{ borderRadius: 16, padding: 14, backgroundColor: '#059669' }}>
        <Text style={{ color: '#ecfdf5', fontWeight: '900', textAlign: 'center' }}>Отправить запрос на пополнение водителя</Text>
      </Pressable>
      <Text style={{ color: '#94a3b8' }}>{status}</Text>
    </View>
  );
}

export default TaxiAgentCityService030D;
