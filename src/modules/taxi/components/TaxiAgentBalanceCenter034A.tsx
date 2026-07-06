import { Bot, CheckCircle2, Clock3, FileCheck2, LockKeyhole, MessageCircle, PhoneCall, ShieldCheck, UserRound, WalletCards } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_034A_PROFESSIONAL_AGENT_BALANCE_CENTER = 'TAXI-MOBILE-UIUX-034A-PROFESSIONAL-AGENT-BALANCE-CENTER-SCREEN' as const;

type TaxiAgentCenterIcon034A = 'profile' | 'status' | 'contact' | 'request' | 'proof' | 'ai' | 'owner' | 'locked';
type TaxiAgentCenterStyles034A = Record<string, any>;
type TaxiAgentCenterTile034A = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; statusKey: CleanTaxiCopyKey031A; icon: TaxiAgentCenterIcon034A }>;

const taxiAgentBalanceCenterTiles034A: TaxiAgentCenterTile034A[] = [
  { titleKey: 'agent.center.profile.title', textKey: 'agent.center.profile.text', statusKey: 'agent.center.status.safeRead', icon: 'profile' },
  { titleKey: 'agent.center.balance.title', textKey: 'agent.center.balance.text', statusKey: 'agent.center.status.planned', icon: 'status' },
  { titleKey: 'agent.center.contact.title', textKey: 'agent.center.contact.text', statusKey: 'agent.center.status.ready', icon: 'contact' },
  { titleKey: 'agent.center.request.title', textKey: 'agent.center.request.text', statusKey: 'agent.center.status.draft', icon: 'request' },
  { titleKey: 'agent.center.proof.title', textKey: 'agent.center.proof.text', statusKey: 'agent.center.status.review', icon: 'proof' },
  { titleKey: 'agent.center.sabi.title', textKey: 'agent.center.sabi.text', statusKey: 'agent.center.status.owner', icon: 'ai' },
  { titleKey: 'agent.center.owner.title', textKey: 'agent.center.owner.text', statusKey: 'agent.center.status.private', icon: 'owner' },
  { titleKey: 'agent.center.money.title', textKey: 'agent.center.money.text', statusKey: 'agent.center.status.locked', icon: 'locked' },
];

export function TaxiAgentBalanceCenter034A({ t, styles, onNotice }: Readonly<{ t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiAgentCenterStyles034A; onNotice: () => void }>) {
  return (
    <View style={styles.agentCenterCard034A}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('agent.center.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('agent.center.title')}</Text>
        </View>
        <View style={styles.agentCenterHeroIcon034A}><WalletCards color="#d9f99d" size={21} /></View>
      </View>
      <Text style={styles.agentCenterSubtitle034A}>{t('agent.center.subtitle')}</Text>
      <View style={styles.agentCenterReadinessRow034A}>
        <TaxiAgentReadinessPill034A label={t('agent.center.readiness.ui')} value="100%" styles={styles} />
        <TaxiAgentReadinessPill034A label={t('agent.center.readiness.runtime')} value={t('agent.center.status.locked')} styles={styles} locked />
      </View>
      <View style={styles.agentCenterGrid034A}>
        {taxiAgentBalanceCenterTiles034A.map((item) => <TaxiAgentCenterTile034A key={item.titleKey} item={item} t={t} styles={styles} />)}
      </View>
      <Pressable accessibilityRole="button" onPress={onNotice} style={styles.agentCenterGuard034A}>
        <ShieldCheck color="#bef264" size={18} />
        <Text style={styles.agentCenterGuardText034A}>{t('agent.center.guard')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiAgentReadinessPill034A({ label, value, styles, locked }: Readonly<{ label: string; value: string; styles: TaxiAgentCenterStyles034A; locked?: boolean }>) {
  return (
    <View style={[styles.agentCenterReadinessPill034A, locked && styles.agentCenterReadinessPillLocked034A]}>
      <Text style={styles.agentCenterReadinessLabel034A}>{label}</Text>
      <Text style={styles.agentCenterReadinessValue034A}>{value}</Text>
    </View>
  );
}

function TaxiAgentCenterTile034A({ item, t, styles }: Readonly<{ item: TaxiAgentCenterTile034A; t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiAgentCenterStyles034A }>) {
  const Icon = item.icon === 'profile' ? UserRound : item.icon === 'status' ? CheckCircle2 : item.icon === 'contact' ? PhoneCall : item.icon === 'request' ? MessageCircle : item.icon === 'proof' ? FileCheck2 : item.icon === 'ai' ? Bot : item.icon === 'owner' ? ShieldCheck : LockKeyhole;
  return (
    <View style={styles.agentCenterTile034A}>
      <View style={styles.agentCenterTileIcon034A}><Icon color="#d9f99d" size={17} /></View>
      <Text style={styles.agentCenterStatus034A}>{t(item.statusKey)}</Text>
      <Text style={styles.agentCenterTileTitle034A}>{t(item.titleKey)}</Text>
      <Text style={styles.agentCenterTileText034A}>{t(item.textKey)}</Text>
    </View>
  );
}
