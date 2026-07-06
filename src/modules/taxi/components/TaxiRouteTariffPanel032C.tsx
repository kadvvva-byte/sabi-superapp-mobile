import { Car, Crown, Route, ShieldCheck } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_032C_ROUTE_TARIFF_COMPONENT_SPLIT = 'TAXI-MOBILE-UIUX-032C-ROUTE-TARIFF-COMPONENT-SPLIT' as const;

type TaxiRouteTariffStyles032C = Record<string, any>;
type TaxiRouteTariffMode032C = 'ride' | 'delivery' | 'driver' | 'agent';
type TaxiRouteTariffId032C = 'economy' | 'comfort' | 'business' | 'premium' | 'delivery';
type TaxiRouteStep032C = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; locked?: boolean }>;
type TaxiTariffPolishRow032C = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A }>;
type TaxiPremiumTariff032C = Readonly<{
  id: TaxiRouteTariffId032C;
  minutesKey: CleanTaxiCopyKey031A;
  polishKey: CleanTaxiCopyKey031A;
  tone: 'blue' | 'gold' | 'violet' | 'emerald' | 'slate';
}>;

const taxiRouteSteps032C: TaxiRouteStep032C[] = [
  { titleKey: 'route.step.address.title', textKey: 'route.step.address.text' },
  { titleKey: 'route.step.quote.title', textKey: 'route.step.quote.text', locked: true },
  { titleKey: 'route.step.driver.title', textKey: 'route.step.driver.text', locked: true },
];

const taxiTariffPolishRows032C: TaxiTariffPolishRow032C[] = [
  { titleKey: 'tariff.polish.comfort.title', textKey: 'tariff.polish.comfort.text' },
  { titleKey: 'tariff.polish.safety.title', textKey: 'tariff.polish.safety.text' },
  { titleKey: 'tariff.polish.honest.title', textKey: 'tariff.polish.honest.text' },
];

const taxiCleanTariffs032C: TaxiPremiumTariff032C[] = [
  { id: 'economy', minutesKey: 'tariff.economy.meta', polishKey: 'tariff.economy.polish', tone: 'blue' },
  { id: 'comfort', minutesKey: 'tariff.comfort.meta', polishKey: 'tariff.comfort.polish', tone: 'emerald' },
  { id: 'business', minutesKey: 'tariff.business.meta', polishKey: 'tariff.business.polish', tone: 'slate' },
  { id: 'premium', minutesKey: 'tariff.premium.meta', polishKey: 'tariff.premium.polish', tone: 'gold' },
  { id: 'delivery', minutesKey: 'tariff.delivery.meta', polishKey: 'tariff.delivery.polish', tone: 'violet' },
];

export function TaxiRouteTariffPanel032C({
  t,
  styles,
  mode,
  tariff,
  from,
  to,
  onSelectTariff,
}: Readonly<{
  t: (key: CleanTaxiCopyKey031A) => string;
  styles: TaxiRouteTariffStyles032C;
  mode: TaxiRouteTariffMode032C;
  tariff: TaxiRouteTariffId032C;
  from: string;
  to: string;
  onSelectTariff: (tariff: TaxiRouteTariffId032C) => void;
}>) {
  const activeTariffs = useMemo(() => {
    if (mode === 'delivery') return taxiCleanTariffs032C.filter((item) => item.id === 'delivery' || item.id === 'comfort');
    return taxiCleanTariffs032C.filter((item) => item.id !== 'delivery');
  }, [mode]);

  return (
    <>
      <View style={styles.routeSheetCard}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionKicker}>{t('route.sheet.kicker')}</Text>
            <Text style={styles.sectionTitle}>{t('route.sheet.title')}</Text>
          </View>
          <View style={styles.routeSheetBadge}>
            <Text style={styles.routeSheetBadgeText}>{t('route.sheet.badge')}</Text>
          </View>
        </View>
        <Text style={styles.routeSheetSubtitle}>{t('route.sheet.subtitle')}</Text>
        <View style={styles.routeSheetAddressGrid}>
          <RouteAddressMini032C label={t('route.from')} value={from.trim() || t('route.sheet.from.empty')} styles={styles} />
          <RouteAddressMini032C label={t('route.to')} value={to.trim() || t('route.sheet.to.empty')} styles={styles} />
        </View>
        <View style={styles.routeStepStack}>
          {taxiRouteSteps032C.map((step, index) => (
            <RouteStep032C key={step.titleKey} index={index + 1} title={t(step.titleKey)} text={t(step.textKey)} locked={step.locked} styles={styles} />
          ))}
        </View>
        <View style={styles.routeGuardBox}>
          <ShieldCheck color="#86efac" size={18} />
          <Text style={styles.routeGuardText}>{t('route.sheet.guard')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionKicker}>{t('tariffs.kicker')}</Text>
            <Text style={styles.sectionTitle}>{t('tariffs.title')}</Text>
          </View>
          <Text style={styles.safeHint}>{t('tariffs.safe')}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tariffRail}>
          {activeTariffs.map((item) => (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => onSelectTariff(item.id)} style={[styles.tariffCard, tariff === item.id && styles.tariffCardActive]}>
              <View style={[styles.tariffIcon, resolveTariffIconStyle032C(item.tone)]}>
                {item.id === 'premium' ? <Crown color="#fef3c7" size={18} /> : <Car color="#dbeafe" size={18} />}
              </View>
              <Text style={styles.tariffTitle}>{t(`tariff.${item.id}.title` as CleanTaxiCopyKey031A)}</Text>
              <Text style={styles.tariffSubtitle}>{t(`tariff.${item.id}.subtitle` as CleanTaxiCopyKey031A)}</Text>
              <Text style={styles.tariffMeta}>{t(item.minutesKey)}</Text>
              <Text style={styles.tariffPolishText}>{t(item.polishKey)}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.tariffCompareCard}>
          <Text style={styles.tariffCompareTitle}>{t('tariff.polish.title')}</Text>
          {taxiTariffPolishRows032C.map((row) => (
            <TariffCompareRow032C key={row.titleKey} title={t(row.titleKey)} text={t(row.textKey)} styles={styles} />
          ))}
        </View>
      </View>
    </>
  );
}

function RouteAddressMini032C({ label, value, styles }: Readonly<{ label: string; value: string; styles: TaxiRouteTariffStyles032C }>) {
  return (
    <View style={styles.routeAddressMini}>
      <Text style={styles.routeAddressLabel}>{label}</Text>
      <Text style={styles.routeAddressValue}>{value}</Text>
    </View>
  );
}

function RouteStep032C({ index, title, text, locked, styles }: Readonly<{ index: number; title: string; text: string; locked?: boolean; styles: TaxiRouteTariffStyles032C }>) {
  return (
    <View style={styles.routeStepRow}>
      <View style={[styles.routeStepIndex, locked && styles.routeStepIndexLocked]}>
        <Text style={styles.routeStepIndexText}>{locked ? '•' : index}</Text>
      </View>
      <View style={styles.routeStepCopy}>
        <Text style={styles.routeStepTitle}>{title}</Text>
        <Text style={styles.routeStepText}>{text}</Text>
      </View>
      {locked ? <Text style={styles.routeStepLocked}>Locked</Text> : <Route color="#93c5fd" size={16} />}
    </View>
  );
}

function TariffCompareRow032C({ title, text, styles }: Readonly<{ title: string; text: string; styles: TaxiRouteTariffStyles032C }>) {
  return (
    <View style={styles.tariffCompareRow}>
      <View style={styles.tariffCompareDot} />
      <View style={styles.tariffCompareCopy}>
        <Text style={styles.tariffCompareRowTitle}>{title}</Text>
        <Text style={styles.tariffCompareRowText}>{text}</Text>
      </View>
    </View>
  );
}

function resolveTariffIconStyle032C(tone: TaxiPremiumTariff032C['tone']) {
  if (tone === 'gold') return { backgroundColor: '#92400e' };
  if (tone === 'violet') return { backgroundColor: '#5b21b6' };
  if (tone === 'emerald') return { backgroundColor: '#065f46' };
  if (tone === 'slate') return { backgroundColor: '#334155' };
  return { backgroundColor: '#1d4ed8' };
}
