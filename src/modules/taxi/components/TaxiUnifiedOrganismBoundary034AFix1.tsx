import { Bot, Building2, Link2, LockKeyhole, ServerCog, Smartphone, WalletCards } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

// 030A/030D existing bridge is acknowledged and blocked without approved backend base URL.
export const TAXI_MOBILE_UIUX_034A_FIX1_I18N_RUNTIME_BOUNDARY_CLEANUP = 'TAXI-MOBILE-UIUX-034A-FIX1-I18N-RUNTIME-BOUNDARY-CLEANUP' as const;

type TaxiUnifiedOrganismIcon034AFix1 = 'mobile' | 'bridge' | 'backend' | 'admin' | 'wallet' | 'ai';
type TaxiUnifiedOrganismStyles034AFix1 = Record<string, any>;
type TaxiUnifiedOrganismLayer034AFix1 = Readonly<{
  titleKey: CleanTaxiCopyKey031A;
  textKey: CleanTaxiCopyKey031A;
  statusKey: CleanTaxiCopyKey031A;
  icon: TaxiUnifiedOrganismIcon034AFix1;
}>;

const taxiUnifiedOrganismLayers034AFix1: TaxiUnifiedOrganismLayer034AFix1[] = [
  { titleKey: 'organism.mobile.title', textKey: 'organism.mobile.text', statusKey: 'organism.status.clean', icon: 'mobile' },
  { titleKey: 'organism.bridge.title', textKey: 'organism.bridge.text', statusKey: 'organism.status.acknowledged', icon: 'bridge' },
  { titleKey: 'organism.backend.title', textKey: 'organism.backend.text', statusKey: 'organism.status.next', icon: 'backend' },
  { titleKey: 'organism.admin.title', textKey: 'organism.admin.text', statusKey: 'organism.status.controlled', icon: 'admin' },
  { titleKey: 'organism.wallet.title', textKey: 'organism.wallet.text', statusKey: 'organism.status.locked', icon: 'wallet' },
  { titleKey: 'organism.ai.title', textKey: 'organism.ai.text', statusKey: 'organism.status.owner', icon: 'ai' },
];

export function TaxiUnifiedOrganismBoundary034AFix1({ t, styles }: Readonly<{ t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiUnifiedOrganismStyles034AFix1 }>) {
  return (
    <View style={styles.organismCard034AFix1}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('organism.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('organism.title')}</Text>
        </View>
        <View style={styles.organismHeroIcon034AFix1}><Link2 color="#bae6fd" size={20} /></View>
      </View>
      <Text style={styles.organismSubtitle034AFix1}>{t('organism.subtitle')}</Text>
      <View style={styles.organismGrid034AFix1}>
        {taxiUnifiedOrganismLayers034AFix1.map((item) => <TaxiUnifiedOrganismLayerTile034AFix1 key={item.titleKey} item={item} t={t} styles={styles} />)}
      </View>
      <View style={styles.organismGuard034AFix1}>
        <LockKeyhole color="#bae6fd" size={18} />
        <Text style={styles.organismGuardText034AFix1}>{t('organism.guard')}</Text>
      </View>
    </View>
  );
}

function TaxiUnifiedOrganismLayerTile034AFix1({ item, t, styles }: Readonly<{ item: TaxiUnifiedOrganismLayer034AFix1; t: (key: CleanTaxiCopyKey031A) => string; styles: TaxiUnifiedOrganismStyles034AFix1 }>) {
  const Icon = item.icon === 'mobile' ? Smartphone : item.icon === 'bridge' ? Link2 : item.icon === 'backend' ? ServerCog : item.icon === 'admin' ? Building2 : item.icon === 'wallet' ? WalletCards : Bot;
  return (
    <View style={styles.organismTile034AFix1}>
      <View style={styles.organismTileIcon034AFix1}><Icon color="#bae6fd" size={17} /></View>
      <Text style={styles.organismStatus034AFix1}>{t(item.statusKey)}</Text>
      <Text style={styles.organismTileTitle034AFix1}>{t(item.titleKey)}</Text>
      <Text style={styles.organismTileText034AFix1}>{t(item.textKey)}</Text>
    </View>
  );
}
