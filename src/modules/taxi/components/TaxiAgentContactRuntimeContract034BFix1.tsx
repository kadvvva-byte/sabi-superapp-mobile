import { Bot, CheckCircle2, ClipboardCheck, FileCheck2, LockKeyhole, MessageCircle, PhoneCall, ShieldCheck, UserRound } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_034B_FIX1_AGENT_CONTACT_RUNTIME_CONTRACT_SAFE_DISABLED = 'TAXI-MOBILE-UIUX-034B-FIX1-AGENT-CONTACT-RUNTIME-CONTRACT-SAFE-DISABLED' as const;

type TaxiAgentContactContractIcon034BFix1 = 'directory' | 'permission' | 'channel' | 'request' | 'proof' | 'owner' | 'runtime';
type TaxiAgentContactContractStyles034BFix1 = Record<string, any>;
type TaxiAgentContactContractTile034BFix1 = Readonly<{
  titleKey: CleanTaxiCopyKey031A;
  textKey: CleanTaxiCopyKey031A;
  statusKey: CleanTaxiCopyKey031A;
  icon: TaxiAgentContactContractIcon034BFix1;
}>;

const taxiAgentContactContractTiles034BFix1: TaxiAgentContactContractTile034BFix1[] = [
  { titleKey: 'agent.contact.contract.directory.title', textKey: 'agent.contact.contract.directory.text', statusKey: 'agent.contact.contract.status.safeRead', icon: 'directory' },
  { titleKey: 'agent.contact.contract.permission.title', textKey: 'agent.contact.contract.permission.text', statusKey: 'agent.contact.contract.status.contract', icon: 'permission' },
  { titleKey: 'agent.contact.contract.channel.title', textKey: 'agent.contact.contract.channel.text', statusKey: 'agent.contact.contract.status.contract', icon: 'channel' },
  { titleKey: 'agent.contact.contract.request.title', textKey: 'agent.contact.contract.request.text', statusKey: 'agent.contact.contract.status.locked', icon: 'request' },
  { titleKey: 'agent.contact.contract.proof.title', textKey: 'agent.contact.contract.proof.text', statusKey: 'agent.contact.contract.status.locked', icon: 'proof' },
  { titleKey: 'agent.contact.contract.owner.title', textKey: 'agent.contact.contract.owner.text', statusKey: 'agent.contact.contract.status.owner', icon: 'owner' },
  { titleKey: 'agent.contact.contract.runtime.title', textKey: 'agent.contact.contract.runtime.text', statusKey: 'agent.contact.contract.status.locked', icon: 'runtime' },
];

export function TaxiAgentContactRuntimeContract034BFix1({ t, styles, onNotice }: Readonly<{ t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiAgentContactContractStyles034BFix1; onNotice: () => void }>) {
  return (
    <View style={styles.agentContactContractCard034BFix1}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('agent.contact.contract.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('agent.contact.contract.title')}</Text>
        </View>
        <View style={styles.agentContactContractHeroIcon034BFix1}><PhoneCall color="#fed7aa" size={20} /></View>
      </View>
      <Text style={styles.agentContactContractSubtitle034BFix1}>{t('agent.contact.contract.subtitle')}</Text>
      <View style={styles.agentContactContractReadinessRow034BFix1}>
        <TaxiAgentContactContractPill034BFix1 label={t('agent.contact.contract.readiness.mobile')} value="100%" styles={styles} />
        <TaxiAgentContactContractPill034BFix1 label={t('agent.contact.contract.readiness.backend')} value={t('agent.contact.contract.status.contract')} styles={styles} />
        <TaxiAgentContactContractPill034BFix1 label={t('agent.contact.contract.readiness.execution')} value={t('agent.contact.contract.status.locked')} styles={styles} locked />
      </View>
      <View style={styles.agentContactContractGrid034BFix1}>
        {taxiAgentContactContractTiles034BFix1.map((item) => <TaxiAgentContactContractTile034BFix1 key={item.titleKey} item={item} t={t} styles={styles} />)}
      </View>
      <Pressable accessibilityRole="button" onPress={onNotice} style={styles.agentContactContractGuard034BFix1}>
        <LockKeyhole color="#fed7aa" size={18} />
        <Text style={styles.agentContactContractGuardText034BFix1}>{t('agent.contact.contract.guard')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiAgentContactContractPill034BFix1({ label, value, styles, locked }: Readonly<{ label: string; value: string; styles: TaxiAgentContactContractStyles034BFix1; locked?: boolean }>) {
  return (
    <View style={[styles.agentContactContractPill034BFix1, locked && styles.agentContactContractPillLocked034BFix1]}>
      <Text style={styles.agentContactContractPillLabel034BFix1}>{label}</Text>
      <Text style={styles.agentContactContractPillValue034BFix1}>{value}</Text>
    </View>
  );
}

function TaxiAgentContactContractTile034BFix1({ item, t, styles }: Readonly<{ item: TaxiAgentContactContractTile034BFix1; t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiAgentContactContractStyles034BFix1 }>) {
  const Icon = item.icon === 'directory' ? UserRound : item.icon === 'permission' ? ShieldCheck : item.icon === 'channel' ? MessageCircle : item.icon === 'request' ? ClipboardCheck : item.icon === 'proof' ? FileCheck2 : item.icon === 'owner' ? Bot : CheckCircle2;
  return (
    <View style={styles.agentContactContractTile034BFix1}>
      <View style={styles.agentContactContractTileIcon034BFix1}><Icon color="#fed7aa" size={17} /></View>
      <Text style={styles.agentContactContractStatus034BFix1}>{t(item.statusKey)}</Text>
      <Text style={styles.agentContactContractTileTitle034BFix1}>{t(item.titleKey)}</Text>
      <Text style={styles.agentContactContractTileText034BFix1}>{t(item.textKey)}</Text>
    </View>
  );
}
