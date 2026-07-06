import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Navigation, UserRound } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_032D_ADDRESS_MAP_COMPONENT_SPLIT = 'TAXI-MOBILE-UIUX-032D-ADDRESS-MAP-COMPONENT-SPLIT';

type TaxiMapLayer032D = Readonly<{ titleKey: CleanTaxiCopyKey031A; locked?: boolean }>;
type TaxiDriverStep032D = Readonly<{ titleKey: CleanTaxiCopyKey031A; locked?: boolean }>;

type TaxiMapDriverSearchPanel032DProps = Readonly<{
  t: (key: CleanTaxiCopyKey031A) => string;
  styles: Record<string, any>;
}>;

const taxiPremiumMapLayers032D: TaxiMapLayer032D[] = [
  { titleKey: 'map.layer.route' },
  { titleKey: 'map.layer.safety' },
  { titleKey: 'map.layer.traffic', locked: true },
  { titleKey: 'map.layer.driver', locked: true },
];

const taxiDriverSearchSteps032D: TaxiDriverStep032D[] = [
  { titleKey: 'driver.search.step.quote', locked: true },
  { titleKey: 'driver.search.step.dispatch', locked: true },
  { titleKey: 'driver.search.step.arrival', locked: true },
];

export function TaxiMapDriverSearchPanel032D({ t, styles }: TaxiMapDriverSearchPanel032DProps) {
  return (
    <>
      <View style={styles.mapCard}>
        <LinearGradient colors={["#0f172a", "#10213a", "#0f172a"]} style={styles.mapCanvas}>
          <View style={styles.mapGridLineOne} />
          <View style={styles.mapGridLineTwo} />
          <View style={styles.routeLineGlow} />
          <View style={styles.routeLine} />
          <View style={styles.mapPointA} />
          <View style={styles.mapPointB} />
        </LinearGradient>
        <View style={styles.mapFloatingCard}>
          <View style={styles.mapHeader}>
            <View>
              <Text style={styles.mapTitle}>{t('map.title')}</Text>
              <Text style={styles.mapSubtitle}>{t('map.subtitle')}</Text>
            </View>
            <MapPin color="#fbbf24" size={22} />
          </View>
          <View style={styles.badgeRow}>
            <Badge032D styles={styles} text={t('map.badge.route')} />
            <Badge032D styles={styles} text={t('map.badge.safety')} />
            <Badge032D styles={styles} text={t('map.badge.wait')} />
          </View>
        </View>
      </View>

      <View style={styles.premiumMapStateCard031E}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionKicker}>{t('map.premium.kicker')}</Text>
            <Text style={styles.sectionTitle}>{t('map.premium.title')}</Text>
          </View>
          <View style={styles.driverSearchStatusIcon031E}>
            <Navigation color="#bae6fd" size={20} />
          </View>
        </View>
        <Text style={styles.premiumMapSubtitle031E}>{t('map.premium.subtitle')}</Text>
        <View style={styles.mapLayerGrid031E}>
          {taxiPremiumMapLayers032D.map((layer) => (
            <View key={layer.titleKey} style={[styles.mapLayerPill031E, layer.locked && styles.mapLayerPillLocked031E]}>
              <Text style={[styles.mapLayerText031E, layer.locked && styles.mapLayerTextLocked031E]}>{t(layer.titleKey)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.driverSearchCard031E}>
          <View style={styles.driverSearchHeader031E}>
            <View>
              <Text style={styles.driverSearchKicker031E}>{t('driver.search.kicker')}</Text>
              <Text style={styles.driverSearchTitle031E}>{t('driver.search.title')}</Text>
            </View>
            <Text style={styles.driverSearchLockedPill031E}>{t('driver.search.locked')}</Text>
          </View>
          <Text style={styles.driverSearchSubtitle031E}>{t('driver.search.subtitle')}</Text>
          <View style={styles.driverSearchStatusBox031E}>
            <UserRound color="#c4b5fd" size={18} />
            <View style={styles.driverSearchStatusTextBox031E}>
              <Text style={styles.driverSearchStatusTitle031E}>{t('driver.search.status.title')}</Text>
              <Text style={styles.driverSearchStatusText031E}>{t('driver.search.status.text')}</Text>
            </View>
          </View>
          <View style={styles.driverSearchStepRail031E}>
            {taxiDriverSearchSteps032D.map((step, index) => (
              <View key={step.titleKey} style={styles.driverSearchStep031E}>
                <Text style={styles.driverSearchStepIndex031E}>{index + 1}</Text>
                <Text style={styles.driverSearchStepText031E}>{t(step.titleKey)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.supplyCard031E}>
            <Text style={styles.supplyTitle031E}>{t('supply.title')}</Text>
            <Text style={styles.supplyText031E}>• {t('supply.nearby')}</Text>
            <Text style={styles.supplyText031E}>• {t('supply.balance')}</Text>
            <Text style={styles.supplyText031E}>• {t('supply.peak')}</Text>
          </View>
          <Text style={styles.driverSearchGuard031E}>{t('driver.search.guard')}</Text>
        </View>
      </View>
    </>
  );
}

function Badge032D({ text, styles }: Readonly<{ text: string; styles: Record<string, any> }>) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}
