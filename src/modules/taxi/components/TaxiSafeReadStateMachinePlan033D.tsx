import { CheckCircle2, LockKeyhole, MessageCircle, Route, ShieldCheck, UserRound, WalletCards } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_033D_MOBILE_SAFE_READ_STATE_MACHINE_PLANNING = 'TAXI-MOBILE-UIUX-033D-MOBILE-SAFE-READ-STATE-MACHINE-PLANNING' as const;

type TaxiStateMachineIcon033D = 'idle' | 'gate' | 'safeRead' | 'agent' | 'owner' | 'locked';
type TaxiStateMachineStatus033D = 'ready' | 'owner' | 'locked';
type TaxiSafeReadState033D = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: TaxiStateMachineIcon033D; status: TaxiStateMachineStatus033D }>;
type TaxiStateMachineStyles033D = Record<string, any>;

const taxiSafeReadStateMachine033D: TaxiSafeReadState033D[] = [
  { titleKey: 'runtime.stateMachine.idle.title', textKey: 'runtime.stateMachine.idle.text', icon: 'idle', status: 'ready' },
  { titleKey: 'runtime.stateMachine.permission.title', textKey: 'runtime.stateMachine.permission.text', icon: 'gate', status: 'locked' },
  { titleKey: 'runtime.stateMachine.safeRead.title', textKey: 'runtime.stateMachine.safeRead.text', icon: 'safeRead', status: 'locked' },
  { titleKey: 'runtime.stateMachine.agent.title', textKey: 'runtime.stateMachine.agent.text', icon: 'agent', status: 'ready' },
  { titleKey: 'runtime.stateMachine.owner.title', textKey: 'runtime.stateMachine.owner.text', icon: 'owner', status: 'owner' },
  { titleKey: 'runtime.stateMachine.locked.title', textKey: 'runtime.stateMachine.locked.text', icon: 'locked', status: 'locked' },
];

export function TaxiSafeReadStateMachinePlan033D({ t, styles, onNotice }: Readonly<{ t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiStateMachineStyles033D; onNotice: () => void }>) {
  return (
    <View style={styles.stateMachineCard033D}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('runtime.stateMachine.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('runtime.stateMachine.title')}</Text>
        </View>
        <View style={styles.stateMachineIcon033D}><ShieldCheck color="#fde68a" size={20} /></View>
      </View>
      <Text style={styles.stateMachineSubtitle033D}>{t('runtime.stateMachine.subtitle')}</Text>
      <View style={styles.stateMachineTimeline033D}>
        {taxiSafeReadStateMachine033D.map((item, index) => <TaxiSafeReadStateTile033D key={item.titleKey} item={item} index={index + 1} t={t} styles={styles} />)}
      </View>
      <Pressable accessibilityRole="button" onPress={onNotice} style={styles.stateMachineGuard033D}>
        <LockKeyhole color="#fde68a" size={18} />
        <Text style={styles.stateMachineGuardText033D}>{t('runtime.stateMachine.guard')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiSafeReadStateTile033D({ item, index, t, styles }: Readonly<{ item: TaxiSafeReadState033D; index: number; t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiStateMachineStyles033D }>) {
  const Icon = item.icon === 'agent' ? WalletCards : item.icon === 'owner' ? MessageCircle : item.icon === 'safeRead' ? Route : item.icon === 'gate' ? UserRound : item.icon === 'locked' ? LockKeyhole : CheckCircle2;
  const statusKey = item.status === 'owner' ? 'runtime.stateMachine.status.owner' : item.status === 'locked' ? 'runtime.stateMachine.status.locked' : 'runtime.stateMachine.status.ready';
  return (
    <View style={styles.stateMachineTile033D}>
      <View style={styles.stateMachineNumber033D}><Text style={styles.stateMachineNumberText033D}>{index}</Text></View>
      <View style={styles.stateMachineIcon033D}><Icon color="#fde68a" size={18} /></View>
      <View style={styles.stateMachineTextBox033D}>
        <Text style={styles.stateMachineStatus033D}>{t(statusKey)}</Text>
        <Text style={styles.stateMachineTitle033D}>{t(item.titleKey)}</Text>
        <Text style={styles.stateMachineText033D}>{t(item.textKey)}</Text>
      </View>
    </View>
  );
}
