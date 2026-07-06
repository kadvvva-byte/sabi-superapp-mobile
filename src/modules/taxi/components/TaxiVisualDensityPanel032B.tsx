import { Clock3, Route, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_032B_COMPONENT_SPLIT = 'TAXI-MOBILE-UIUX-032B-COMPONENT-SPLIT' as const;

type TaxiVisualDensityIcon032B = 'route' | 'shield' | 'clock';
type TaxiVisualDensityItem032B = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: TaxiVisualDensityIcon032B }>;
type TaxiScreenSplitItem032B = CleanTaxiCopyKey031A;
type TaxiComponentStyles032B = Record<string, any>;

const taxiVisualDensityItems032B: TaxiVisualDensityItem032B[] = [
  { titleKey: 'visual.density.route.title', textKey: 'visual.density.route.text', icon: 'route' },
  { titleKey: 'visual.density.tariff.title', textKey: 'visual.density.tariff.text', icon: 'clock' },
  { titleKey: 'visual.density.safety.title', textKey: 'visual.density.safety.text', icon: 'shield' },
];

const taxiScreenSplitItems032B: TaxiScreenSplitItem032B[] = [
  'screen.split.rider',
  'screen.split.driver',
  'screen.split.delivery',
  'screen.split.agent',
];

export function TaxiVisualDensityPanel032B({
  t,
  styles,
  onNotice,
}: Readonly<{
  t: (key: CleanTaxiCopyKey031A) => string;
  styles: TaxiComponentStyles032B;
  onNotice: () => void;
}>) {
  return (
    <View style={styles.visualDensityCard032A}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('visual.density.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('visual.density.title')}</Text>
        </View>
        <Text style={styles.visualDensityBadge032A}>{t('screen.split.kicker')}</Text>
      </View>
      <Text style={styles.visualDensitySubtitle032A}>{t('visual.density.subtitle')}</Text>
      <View style={styles.visualDensityGrid032A}>
        {taxiVisualDensityItems032B.map((item) => (
          <TaxiVisualDensityTile032B key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>
      <View style={styles.screenSplitCard032A}>
        <Text style={styles.screenSplitTitle032A}>{t('screen.split.title')}</Text>
        <Text style={styles.screenSplitText032A}>{t('screen.split.subtitle')}</Text>
        <View style={styles.screenSplitRail032A}>
          {taxiScreenSplitItems032B.map((key) => (
            <Text key={key} style={styles.screenSplitPill032A}>{t(key)}</Text>
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={onNotice} style={styles.visualDensityGuard032A}>
          <ShieldCheck color="#bae6fd" size={18} />
          <Text style={styles.visualDensityGuardText032A}>{t('screen.split.guard')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TaxiVisualDensityTile032B({
  title,
  text,
  icon,
  styles,
}: Readonly<{ title: string; text: string; icon: TaxiVisualDensityIcon032B; styles: TaxiComponentStyles032B }>) {
  const Icon = icon === 'route' ? Route : icon === 'shield' ? ShieldCheck : Clock3;
  return (
    <View style={styles.visualDensityTile032A}>
      <View style={styles.visualDensityTileIcon032A}>
        <Icon color="#bae6fd" size={18} />
      </View>
      <Text style={styles.visualDensityTileTitle032A}>{title}</Text>
      <Text style={styles.visualDensityTileText032A}>{text}</Text>
    </View>
  );
}
