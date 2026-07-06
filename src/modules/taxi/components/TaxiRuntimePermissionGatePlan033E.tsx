import { CheckCircle2, LockKeyhole, ShieldCheck, UserRound, WalletCards, FileCheck2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_033E_MOBILE_RUNTIME_PERMISSION_GATE_PLANNING = 'TAXI-MOBILE-UIUX-033E-MOBILE-RUNTIME-PERMISSION-GATE-PLANNING' as const;

type TaxiRuntimePermissionIcon033E = 'identity' | 'role' | 'country' | 'agent' | 'owner' | 'money';
type TaxiRuntimePermissionStatus033E = 'ready' | 'owner' | 'locked';
type TaxiRuntimePermissionGate033E = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: TaxiRuntimePermissionIcon033E; status: TaxiRuntimePermissionStatus033E }>;
type TaxiRuntimePermissionGateStyles033E = Record<string, any>;

const taxiRuntimePermissionGates033E: TaxiRuntimePermissionGate033E[] = [
  { titleKey: 'runtime.permission.identity.title', textKey: 'runtime.permission.identity.text', icon: 'identity', status: 'locked' },
  { titleKey: 'runtime.permission.role.title', textKey: 'runtime.permission.role.text', icon: 'role', status: 'locked' },
  { titleKey: 'runtime.permission.country.title', textKey: 'runtime.permission.country.text', icon: 'country', status: 'locked' },
  { titleKey: 'runtime.permission.agent.title', textKey: 'runtime.permission.agent.text', icon: 'agent', status: 'ready' },
  { titleKey: 'runtime.permission.owner.title', textKey: 'runtime.permission.owner.text', icon: 'owner', status: 'owner' },
  { titleKey: 'runtime.permission.money.title', textKey: 'runtime.permission.money.text', icon: 'money', status: 'locked' },
];

export function TaxiRuntimePermissionGatePlan033E({ t, styles, onNotice }: Readonly<{ t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiRuntimePermissionGateStyles033E; onNotice: () => void }>) {
  return (
    <View style={styles.permissionGateCard033E}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('runtime.permission.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('runtime.permission.title')}</Text>
        </View>
        <View style={styles.permissionGateIcon033E}><ShieldCheck color="#ddd6fe" size={20} /></View>
      </View>
      <Text style={styles.permissionGateSubtitle033E}>{t('runtime.permission.subtitle')}</Text>
      <View style={styles.permissionGateGrid033E}>
        {taxiRuntimePermissionGates033E.map((item) => <TaxiRuntimePermissionGateTile033E key={item.titleKey} item={item} t={t} styles={styles} />)}
      </View>
      <Pressable accessibilityRole="button" onPress={onNotice} style={styles.permissionGateGuard033E}>
        <LockKeyhole color="#ddd6fe" size={18} />
        <Text style={styles.permissionGateGuardText033E}>{t('runtime.permission.guard')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiRuntimePermissionGateTile033E({ item, t, styles }: Readonly<{ item: TaxiRuntimePermissionGate033E; t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiRuntimePermissionGateStyles033E }>) {
  const Icon = item.icon === 'agent' ? WalletCards : item.icon === 'owner' ? FileCheck2 : item.icon === 'money' ? LockKeyhole : item.icon === 'role' || item.icon === 'identity' ? UserRound : CheckCircle2;
  const statusKey = item.status === 'owner' ? 'runtime.permission.status.owner' : item.status === 'locked' ? 'runtime.permission.status.locked' : 'runtime.permission.status.ready';
  return (
    <View style={styles.permissionGateTile033E}>
      <View style={styles.permissionGateIcon033E}><Icon color="#ddd6fe" size={18} /></View>
      <Text style={styles.permissionGateStatus033E}>{t(statusKey)}</Text>
      <Text style={styles.permissionGateTitle033E}>{t(item.titleKey)}</Text>
      <Text style={styles.permissionGateText033E}>{t(item.textKey)}</Text>
    </View>
  );
}
