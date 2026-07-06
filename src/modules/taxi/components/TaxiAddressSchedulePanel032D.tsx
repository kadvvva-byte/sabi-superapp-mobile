import { Clock3, MapPin } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';
import { TAXI_MOBILE_UIUX_032D_ADDRESS_MAP_COMPONENT_SPLIT } from './TaxiMapDriverSearchPanel032D';

export type TaxiScheduleChoice032D = 'now' | 'later';

type TaxiStopPlan032D = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; locked?: boolean }>;

type TaxiAddressSchedulePanel032DProps = Readonly<{
  t: (key: CleanTaxiCopyKey031A) => string;
  styles: Record<string, any>;
  from: string;
  to: string;
  scheduleChoice: TaxiScheduleChoice032D;
  onChooseSchedule: (next: TaxiScheduleChoice032D) => void;
}>;

const taxiScheduleChoices032D: ReadonlyArray<Readonly<{ id: TaxiScheduleChoice032D; titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A }>> = [
  { id: 'now', titleKey: 'schedule.now.title', textKey: 'schedule.now.text' },
  { id: 'later', titleKey: 'schedule.later.title', textKey: 'schedule.later.text' },
];

const taxiStopPlans032D: TaxiStopPlan032D[] = [
  { titleKey: 'stops.first.title', textKey: 'stops.first.text' },
  { titleKey: 'stops.second.title', textKey: 'stops.second.text', locked: true },
];

export function TaxiAddressSchedulePanel032D({ t, styles, from, to, scheduleChoice, onChooseSchedule }: TaxiAddressSchedulePanel032DProps) {
  const addressReady032D = Boolean(from.trim() && to.trim());
  const addressQualityText032D = addressReady032D ? t('address.quality.ready') : t('address.quality.missing');

  return (
    <View style={styles.addressPlanCard031D}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('address.plan.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('address.plan.title')}</Text>
        </View>
        <Clock3 color="#fde68a" size={22} />
      </View>
      <Text style={styles.addressPlanSubtitle031D}>{t('address.plan.subtitle')}</Text>

      <View style={styles.scheduleSwitch031D}>
        {taxiScheduleChoices032D.map((choice) => (
          <Pressable
            key={choice.id}
            accessibilityRole="button"
            onPress={() => onChooseSchedule(choice.id)}
            style={[styles.scheduleButton031D, scheduleChoice === choice.id && styles.scheduleButtonActive031D]}
          >
            <Text style={[styles.scheduleButtonTitle031D, scheduleChoice === choice.id && styles.scheduleButtonTitleActive031D]}>{t(choice.titleKey)}</Text>
            <Text style={[styles.scheduleButtonText031D, scheduleChoice === choice.id && styles.scheduleButtonTextActive031D]}>{t(choice.textKey)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.stopPlanBox031D}>
        <View style={styles.stopPlanHeader031D}>
          <Text style={styles.stopPlanTitle031D}>{t('stops.title')}</Text>
          <Text style={styles.stopPlanSubtitle031D}>{t('stops.subtitle')}</Text>
        </View>
        {taxiStopPlans032D.map((stop, index) => (
          <StopPlanRow032D key={stop.titleKey} index={index + 1} title={t(stop.titleKey)} text={t(stop.textKey)} locked={stop.locked} styles={styles} />
        ))}
        <Text style={styles.stopPlanGuard031D}>{t('stops.guard')}</Text>
      </View>

      <View style={styles.addressQualityBox031D}>
        <MapPin color={addressReady032D ? '#86efac' : '#fde68a'} size={18} />
        <View style={styles.addressQualityTextBox031D}>
          <Text style={styles.addressQualityTitle031D}>{t('address.quality.title')}</Text>
          <Text style={styles.addressQualityText031D}>{addressQualityText032D}</Text>
          <Text style={styles.addressQualityGuard031D}>{t('address.quality.guard')}</Text>
        </View>
      </View>
      <Text style={{ display: 'none' }}>{TAXI_MOBILE_UIUX_032D_ADDRESS_MAP_COMPONENT_SPLIT}</Text>
    </View>
  );
}

function StopPlanRow032D({ index, title, text, locked, styles }: Readonly<{ index: number; title: string; text: string; locked?: boolean; styles: Record<string, any> }>) {
  return (
    <View style={styles.stopPlanRow031D}>
      <View style={[styles.stopPlanIndex031D, locked && styles.stopPlanIndexLocked031D]}>
        <Text style={styles.stopPlanIndexText031D}>{index}</Text>
      </View>
      <View style={styles.stopPlanTextBox031D}>
        <Text style={styles.stopPlanRowTitle031D}>{title}</Text>
        <Text style={styles.stopPlanRowText031D}>{text}</Text>
      </View>
      <Text style={styles.stopPlanState031D}>{locked ? '·' : '✓'}</Text>
    </View>
  );
}
