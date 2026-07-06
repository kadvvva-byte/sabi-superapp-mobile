import { ClipboardList, MessageCircle, Route, ShieldCheck, UserRound, WalletCards } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_033B_MOBILE_RUNTIME_CONTRACT_ADAPTERS_PLANNING = 'TAXI-MOBILE-UIUX-033B-MOBILE-RUNTIME-CONTRACT-ADAPTERS-PLANNING' as const;

type TaxiRuntimeAdapterIcon033B = 'safeRead' | 'quote' | 'dispatch' | 'agent' | 'ownerAi' | 'report' | 'privacy';
type TaxiRuntimeAdapterStatus033B = 'planned' | 'locked' | 'owner';
type TaxiRuntimeAdapterItem033B = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: TaxiRuntimeAdapterIcon033B; status: TaxiRuntimeAdapterStatus033B }>;
type TaxiRuntimeAdapterStyles033B = Record<string, any>;

const taxiRuntimeContractAdapters033B: TaxiRuntimeAdapterItem033B[] = [
  { titleKey: 'runtime.adapters.safeRead.title', textKey: 'runtime.adapters.safeRead.text', icon: 'safeRead', status: 'planned' },
  { titleKey: 'runtime.adapters.quote.title', textKey: 'runtime.adapters.quote.text', icon: 'quote', status: 'locked' },
  { titleKey: 'runtime.adapters.dispatch.title', textKey: 'runtime.adapters.dispatch.text', icon: 'dispatch', status: 'locked' },
  { titleKey: 'runtime.adapters.agent.title', textKey: 'runtime.adapters.agent.text', icon: 'agent', status: 'planned' },
  { titleKey: 'runtime.adapters.ownerAi.title', textKey: 'runtime.adapters.ownerAi.text', icon: 'ownerAi', status: 'owner' },
  { titleKey: 'runtime.adapters.report.title', textKey: 'runtime.adapters.report.text', icon: 'report', status: 'owner' },
  { titleKey: 'runtime.adapters.privacy.title', textKey: 'runtime.adapters.privacy.text', icon: 'privacy', status: 'locked' },
];

export function TaxiRuntimeContractAdapters033B({ t, styles, onNotice }: Readonly<{ t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiRuntimeAdapterStyles033B; onNotice: () => void }>) {
  return (
    <View style={styles.runtimeAdaptersCard033B}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('runtime.adapters.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('runtime.adapters.title')}</Text>
        </View>
        <View style={styles.runtimeAdaptersIcon033B}><ClipboardList color="#bae6fd" size={20} /></View>
      </View>
      <Text style={styles.runtimeAdaptersSubtitle033B}>{t('runtime.adapters.subtitle')}</Text>
      <View style={styles.runtimeAdaptersGrid033B}>
        {taxiRuntimeContractAdapters033B.map((item) => <TaxiRuntimeAdapterTile033B key={item.titleKey} item={item} t={t} styles={styles} />)}
      </View>
      <Pressable accessibilityRole="button" onPress={onNotice} style={styles.runtimeAdaptersGuard033B}>
        <ShieldCheck color="#bbf7d0" size={18} />
        <Text style={styles.runtimeAdaptersGuardText033B}>{t('runtime.adapters.guard')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiRuntimeAdapterTile033B({ item, t, styles }: Readonly<{ item: TaxiRuntimeAdapterItem033B; t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiRuntimeAdapterStyles033B }>) {
  const Icon = item.icon === 'agent' ? WalletCards : item.icon === 'ownerAi' ? UserRound : item.icon === 'report' ? MessageCircle : item.icon === 'quote' || item.icon === 'dispatch' ? Route : ShieldCheck;
  const statusKey = item.status === 'owner' ? 'runtime.adapters.status.owner' : item.status === 'locked' ? 'runtime.adapters.status.locked' : 'runtime.adapters.status.planned';
  return (
    <View style={styles.runtimeAdapterTile033B}>
      <View style={styles.runtimeAdaptersIcon033B}><Icon color="#bae6fd" size={18} /></View>
      <Text style={styles.runtimeAdapterStatus033B}>{t(statusKey)}</Text>
      <Text style={styles.runtimeAdapterTitle033B}>{t(item.titleKey)}</Text>
      <Text style={styles.runtimeAdapterText033B}>{t(item.textKey)}</Text>
    </View>
  );
}
