import { ClipboardList, MessageCircle, Route, ShieldCheck, UserRound, WalletCards } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_033C_MOBILE_SAFE_READ_MODELS_PLANNING = 'TAXI-MOBILE-UIUX-033C-MOBILE-SAFE-READ-MODELS-PLANNING' as const;

type TaxiSafeReadIcon033C = 'driverProfile' | 'agentContact' | 'balanceEligibility' | 'quotePreview' | 'dispatchStatus' | 'complaintStatus' | 'ownerReport' | 'evidenceSummary';
type TaxiSafeReadStatus033C = 'planned' | 'locked';
type TaxiSafeReadModel033C = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: TaxiSafeReadIcon033C; status: TaxiSafeReadStatus033C }>;
type TaxiSafeReadStyles033C = Record<string, any>;

const taxiSafeReadModels033C: TaxiSafeReadModel033C[] = [
  { titleKey: 'runtime.safeRead.driverProfile.title', textKey: 'runtime.safeRead.driverProfile.text', icon: 'driverProfile', status: 'planned' },
  { titleKey: 'runtime.safeRead.agentContact.title', textKey: 'runtime.safeRead.agentContact.text', icon: 'agentContact', status: 'planned' },
  { titleKey: 'runtime.safeRead.balanceEligibility.title', textKey: 'runtime.safeRead.balanceEligibility.text', icon: 'balanceEligibility', status: 'locked' },
  { titleKey: 'runtime.safeRead.quotePreview.title', textKey: 'runtime.safeRead.quotePreview.text', icon: 'quotePreview', status: 'locked' },
  { titleKey: 'runtime.safeRead.dispatchStatus.title', textKey: 'runtime.safeRead.dispatchStatus.text', icon: 'dispatchStatus', status: 'locked' },
  { titleKey: 'runtime.safeRead.complaintStatus.title', textKey: 'runtime.safeRead.complaintStatus.text', icon: 'complaintStatus', status: 'locked' },
  { titleKey: 'runtime.safeRead.ownerReport.title', textKey: 'runtime.safeRead.ownerReport.text', icon: 'ownerReport', status: 'locked' },
  { titleKey: 'runtime.safeRead.evidenceSummary.title', textKey: 'runtime.safeRead.evidenceSummary.text', icon: 'evidenceSummary', status: 'locked' },
];

export function TaxiSafeReadModelsPlan033C({ t, styles, onNotice }: Readonly<{ t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiSafeReadStyles033C; onNotice: () => void }>) {
  return (
    <View style={styles.safeReadModelsCard033C}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('runtime.safeRead.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('runtime.safeRead.title')}</Text>
        </View>
        <View style={styles.safeReadModelsIcon033C}><ShieldCheck color="#bbf7d0" size={20} /></View>
      </View>
      <Text style={styles.safeReadModelsSubtitle033C}>{t('runtime.safeRead.subtitle')}</Text>
      <View style={styles.safeReadModelsGrid033C}>
        {taxiSafeReadModels033C.map((item) => <TaxiSafeReadModelTile033C key={item.titleKey} item={item} t={t} styles={styles} />)}
      </View>
      <Pressable accessibilityRole="button" onPress={onNotice} style={styles.safeReadModelsGuard033C}>
        <ShieldCheck color="#bbf7d0" size={18} />
        <Text style={styles.safeReadModelsGuardText033C}>{t('runtime.safeRead.guard')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiSafeReadModelTile033C({ item, t, styles }: Readonly<{ item: TaxiSafeReadModel033C; t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiSafeReadStyles033C }>) {
  const Icon = item.icon === 'agentContact' || item.icon === 'balanceEligibility' ? WalletCards : item.icon === 'ownerReport' || item.icon === 'complaintStatus' ? MessageCircle : item.icon === 'quotePreview' || item.icon === 'dispatchStatus' ? Route : item.icon === 'driverProfile' ? UserRound : ClipboardList;
  const statusKey = item.status === 'locked' ? 'runtime.safeRead.status.locked' : 'runtime.safeRead.status.planned';
  return (
    <View style={styles.safeReadModelTile033C}>
      <View style={styles.safeReadModelsIcon033C}><Icon color="#bbf7d0" size={18} /></View>
      <Text style={styles.safeReadModelStatus033C}>{t(statusKey)}</Text>
      <Text style={styles.safeReadModelTitle033C}>{t(item.titleKey)}</Text>
      <Text style={styles.safeReadModelText033C}>{t(item.textKey)}</Text>
    </View>
  );
}
