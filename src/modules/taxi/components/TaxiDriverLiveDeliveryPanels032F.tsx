import {
  Car,
  Clock3,
  MessageCircle,
  Route,
  ShieldCheck,
  Star,
  UserRound,
  WalletCards,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_032F_DRIVER_LIVE_DELIVERY_COMPONENT_SPLIT = 'TAXI-MOBILE-UIUX-032F-DRIVER-LIVE-DELIVERY-COMPONENT-SPLIT' as const;

type TaxiText032F = (key: CleanTaxiCopyKey031A) => string;
type TaxiDriverProfileArrivalItem032F = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: 'user' | 'car' | 'star' | 'clock' }>;
type TaxiLiveTripItem032F = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey?: CleanTaxiCopyKey031A; icon: 'route' | 'shield' | 'fare' | 'support' }>;
type TaxiDriverWorkspaceItem032F = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: 'shield' | 'car' | 'clock' | 'star' }>;
type TaxiDeliveryCourierItem032F = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: 'route' | 'shield' | 'clock' | 'car' }>;

const taxiDriverProfileItems032F: TaxiDriverProfileArrivalItem032F[] = [
  { titleKey: 'driver.profile.identity.title', textKey: 'driver.profile.identity.text', icon: 'user' },
  { titleKey: 'driver.profile.vehicle.title', textKey: 'driver.profile.vehicle.text', icon: 'car' },
  { titleKey: 'driver.profile.rating.title', textKey: 'driver.profile.rating.text', icon: 'star' },
];

const taxiArrivalSteps032F: TaxiDriverProfileArrivalItem032F[] = [
  { titleKey: 'arrival.step.dispatch', textKey: 'driver.profile.locked', icon: 'clock' },
  { titleKey: 'arrival.step.profile', textKey: 'driver.profile.guard', icon: 'user' },
  { titleKey: 'arrival.step.arrival', textKey: 'arrival.card.subtitle', icon: 'car' },
];

const taxiLiveTripPhases032F: ReadonlyArray<Readonly<{ titleKey: CleanTaxiCopyKey031A; locked: boolean }>> = [
  { titleKey: 'live.trip.phase.pickup', locked: true },
  { titleKey: 'live.trip.phase.ride', locked: true },
  { titleKey: 'live.trip.phase.arrival', locked: true },
  { titleKey: 'live.trip.phase.receipt', locked: true },
];

const taxiLiveTripTiles032F: TaxiLiveTripItem032F[] = [
  { titleKey: 'live.trip.route.title', textKey: 'live.trip.route.text', icon: 'route' },
  { titleKey: 'live.trip.safety.title', textKey: 'live.trip.safety.text', icon: 'shield' },
  { titleKey: 'live.trip.fare.title', textKey: 'live.trip.fare.text', icon: 'fare' },
  { titleKey: 'live.trip.support.title', textKey: 'live.trip.support.text', icon: 'support' },
];

const taxiDriverWorkspaceReadiness032F: TaxiDriverWorkspaceItem032F[] = [
  { titleKey: 'driver.workspace.balance.title', textKey: 'driver.workspace.balance.text', icon: 'shield' },
  { titleKey: 'driver.workspace.documents.title', textKey: 'driver.workspace.documents.text', icon: 'clock' },
  { titleKey: 'driver.workspace.vehicle.title', textKey: 'driver.workspace.vehicle.text', icon: 'car' },
];

const taxiDriverWorkspaceControl032F: TaxiDriverWorkspaceItem032F[] = [
  { titleKey: 'driver.workspace.orders.title', textKey: 'driver.workspace.orders.text', icon: 'clock' },
  { titleKey: 'driver.workspace.shift.title', textKey: 'driver.workspace.shift.text', icon: 'shield' },
  { titleKey: 'driver.workspace.safety.title', textKey: 'driver.workspace.safety.text', icon: 'star' },
  { titleKey: 'driver.workspace.competition.title', textKey: 'driver.workspace.competition.text', icon: 'star' },
];

const taxiDeliveryCourierReadiness032F: TaxiDeliveryCourierItem032F[] = [
  { titleKey: 'delivery.courier.parcel.title', textKey: 'delivery.courier.parcel.text', icon: 'route' },
  { titleKey: 'delivery.courier.pickup.title', textKey: 'delivery.courier.pickup.text', icon: 'clock' },
  { titleKey: 'delivery.courier.dropoff.title', textKey: 'delivery.courier.dropoff.text', icon: 'car' },
];

const taxiDeliveryCourierControl032F: TaxiDeliveryCourierItem032F[] = [
  { titleKey: 'delivery.courier.courier.title', textKey: 'delivery.courier.courier.text', icon: 'shield' },
  { titleKey: 'delivery.courier.price.title', textKey: 'delivery.courier.price.text', icon: 'clock' },
  { titleKey: 'delivery.courier.handoff.title', textKey: 'delivery.courier.handoff.text', icon: 'route' },
  { titleKey: 'delivery.courier.safety.title', textKey: 'delivery.courier.safety.text', icon: 'shield' },
];

export function TaxiDriverWorkspacePanel032F({ t, styles, onNotice }: Readonly<{ t: TaxiText032F; styles: any; onNotice: (message: string) => void }>) {
  return (
    <View style={styles.driverWorkspaceCard031J}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('driver.workspace.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('driver.workspace.title')}</Text>
        </View>
        <Text style={styles.driverWorkspaceStatus031J}>{t('driver.workspace.status')}</Text>
      </View>
      <Text style={styles.driverWorkspaceSubtitle031J}>{t('driver.workspace.subtitle')}</Text>
      <View style={styles.driverWorkspaceGrid031J}>
        {taxiDriverWorkspaceReadiness032F.map((item) => (
          <DriverWorkspaceTile032F key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>
      <View style={styles.driverWorkspaceControlCard031J}>
        <Text style={styles.driverWorkspaceControlTitle031J}>{t('driver.workspace.locked')}</Text>
        {taxiDriverWorkspaceControl032F.map((item) => (
          <DriverWorkspaceRow032F key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => onNotice(t('notice.driverWorkspace'))} style={styles.driverWorkspaceGuard031J}>
        <ShieldCheck color="#bae6fd" size={18} />
        <Text style={styles.driverWorkspaceGuardText031J}>{t('driver.workspace.guard')}</Text>
      </Pressable>
    </View>
  );
}

export function TaxiDeliveryCourierPanel032F({ t, styles, onNotice }: Readonly<{ t: TaxiText032F; styles: any; onNotice: (message: string) => void }>) {
  return (
    <View style={styles.deliveryCourierCard031K}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('delivery.courier.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('delivery.courier.title')}</Text>
        </View>
        <Text style={styles.deliveryCourierStatus031K}>{t('delivery.courier.status')}</Text>
      </View>
      <Text style={styles.deliveryCourierSubtitle031K}>{t('delivery.courier.subtitle')}</Text>
      <View style={styles.deliveryCourierGrid031K}>
        {taxiDeliveryCourierReadiness032F.map((item) => (
          <DeliveryCourierTile032F key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>
      <View style={styles.deliveryCourierControlCard031K}>
        <Text style={styles.deliveryCourierControlTitle031K}>{t('delivery.courier.locked')}</Text>
        {taxiDeliveryCourierControl032F.map((item) => (
          <DeliveryCourierRow032F key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => onNotice(t('notice.deliveryCourier'))} style={styles.deliveryCourierGuard031K}>
        <ShieldCheck color="#bbf7d0" size={18} />
        <Text style={styles.deliveryCourierGuardText031K}>{t('delivery.courier.guard')}</Text>
      </Pressable>
    </View>
  );
}

export function TaxiDriverProfileArrivalPanel032F({ t, styles, onNotice }: Readonly<{ t: TaxiText032F; styles: any; onNotice: (message: string) => void }>) {
  return (
    <View style={styles.driverProfileArrivalCard031H}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('driver.profile.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('driver.profile.title')}</Text>
        </View>
        <View style={styles.driverProfileBadge031H}>
          <UserRound color="#fef3c7" size={20} />
        </View>
      </View>
      <Text style={styles.driverProfileSubtitle031H}>{t('driver.profile.subtitle')}</Text>
      <Text style={styles.driverProfileLocked031H}>{t('driver.profile.locked')}</Text>
      <View style={styles.driverProfileGrid031H}>
        {taxiDriverProfileItems032F.map((item) => (
          <DriverProfileTile032F key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>
      <View style={styles.arrivalCard031H}>
        <Text style={styles.arrivalKicker031H}>{t('arrival.card.kicker')}</Text>
        <Text style={styles.arrivalTitle031H}>{t('arrival.card.title')}</Text>
        <Text style={styles.arrivalSubtitle031H}>{t('arrival.card.subtitle')}</Text>
        <View style={styles.arrivalStepStack031H}>
          {taxiArrivalSteps032F.map((item, index) => (
            <ArrivalStep032F key={item.titleKey} index={index + 1} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
          ))}
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => onNotice(t('notice.driverProfile'))} style={styles.driverProfileGuard031H}>
        <ShieldCheck color="#bae6fd" size={18} />
        <Text style={styles.driverProfileGuardText031H}>{t('driver.profile.guard')}</Text>
      </Pressable>
    </View>
  );
}

export function TaxiLiveTripPanel032F({ t, styles, onNotice }: Readonly<{ t: TaxiText032F; styles: any; onNotice: (message: string) => void }>) {
  return (
    <View style={styles.liveTripSkeletonCard031I}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('live.trip.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('live.trip.title')}</Text>
        </View>
        <View style={styles.liveTripBadge031I}>
          <Route color="#e0f2fe" size={20} />
        </View>
      </View>
      <Text style={styles.liveTripSubtitle031I}>{t('live.trip.subtitle')}</Text>
      <View style={styles.liveTripPhaseRail031I}>
        {taxiLiveTripPhases032F.map((phase, index) => (
          <LiveTripPhase032F key={phase.titleKey} index={index + 1} title={t(phase.titleKey)} locked={phase.locked} styles={styles} />
        ))}
      </View>
      <View style={styles.liveTripTileGrid031I}>
        {taxiLiveTripTiles032F.map((item) => (
          <LiveTripTile032F key={item.titleKey} title={t(item.titleKey)} text={item.textKey ? t(item.textKey) : ''} icon={item.icon} styles={styles} />
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => onNotice(t('notice.liveTrip'))} style={styles.liveTripGuard031I}>
        <ShieldCheck color="#bae6fd" size={18} />
        <View style={styles.liveTripGuardTextBox031I}>
          <Text style={styles.liveTripLocked031I}>{t('live.trip.locked')}</Text>
          <Text style={styles.liveTripGuardText031I}>{t('live.trip.guard')}</Text>
        </View>
      </Pressable>
    </View>
  );
}

function DeliveryCourierTile032F({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'route' | 'shield' | 'clock' | 'car'; styles: any }>) {
  const Icon = icon === 'route' ? Route : icon === 'shield' ? ShieldCheck : icon === 'clock' ? Clock3 : Car;
  return (
    <View style={styles.deliveryCourierTile031K}>
      <View style={styles.deliveryCourierTileIcon031K}>
        <Icon color="#bbf7d0" size={18} />
      </View>
      <Text style={styles.deliveryCourierTileTitle031K}>{title}</Text>
      <Text style={styles.deliveryCourierTileText031K}>{text}</Text>
    </View>
  );
}

function DeliveryCourierRow032F({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'route' | 'shield' | 'clock' | 'car'; styles: any }>) {
  const Icon = icon === 'route' ? Route : icon === 'shield' ? ShieldCheck : icon === 'clock' ? Clock3 : Car;
  return (
    <View style={styles.deliveryCourierRow031K}>
      <View style={styles.deliveryCourierRowIcon031K}>
        <Icon color="#dcfce7" size={16} />
      </View>
      <View style={styles.deliveryCourierRowTextBox031K}>
        <Text style={styles.deliveryCourierRowTitle031K}>{title}</Text>
        <Text style={styles.deliveryCourierRowText031K}>{text}</Text>
      </View>
    </View>
  );
}

function DriverWorkspaceTile032F({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'shield' | 'car' | 'clock' | 'star'; styles: any }>) {
  const Icon = icon === 'shield' ? ShieldCheck : icon === 'car' ? Car : icon === 'clock' ? Clock3 : Star;
  return (
    <View style={styles.driverWorkspaceTile031J}>
      <View style={styles.driverWorkspaceTileIcon031J}>
        <Icon color="#bae6fd" size={18} />
      </View>
      <Text style={styles.driverWorkspaceTileTitle031J}>{title}</Text>
      <Text style={styles.driverWorkspaceTileText031J}>{text}</Text>
    </View>
  );
}

function DriverWorkspaceRow032F({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'shield' | 'car' | 'clock' | 'star'; styles: any }>) {
  const Icon = icon === 'shield' ? ShieldCheck : icon === 'car' ? Car : icon === 'clock' ? Clock3 : Star;
  return (
    <View style={styles.driverWorkspaceRow031J}>
      <View style={styles.driverWorkspaceRowIcon031J}>
        <Icon color="#bfdbfe" size={17} />
      </View>
      <View style={styles.driverWorkspaceRowTextBox031J}>
        <Text style={styles.driverWorkspaceRowTitle031J}>{title}</Text>
        <Text style={styles.driverWorkspaceRowText031J}>{text}</Text>
      </View>
    </View>
  );
}

function LiveTripPhase032F({ index, title, locked, styles }: Readonly<{ index: number; title: string; locked: boolean; styles: any }>) {
  return (
    <View style={[styles.liveTripPhase031I, locked && styles.liveTripPhaseLocked031I]}>
      <Text style={styles.liveTripPhaseIndex031I}>{index}</Text>
      <Text style={styles.liveTripPhaseTitle031I}>{title}</Text>
      <Text style={styles.liveTripPhaseLock031I}>{locked ? '·' : '✓'}</Text>
    </View>
  );
}

function LiveTripTile032F({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'route' | 'shield' | 'fare' | 'support'; styles: any }>) {
  const Icon = icon === 'route' ? Route : icon === 'shield' ? ShieldCheck : icon === 'fare' ? WalletCards : MessageCircle;
  return (
    <View style={styles.liveTripTile031I}>
      <View style={styles.liveTripTileIcon031I}>
        <Icon color="#bae6fd" size={18} />
      </View>
      <Text style={styles.liveTripTileTitle031I}>{title}</Text>
      <Text style={styles.liveTripTileText031I}>{text}</Text>
    </View>
  );
}

function DriverProfileTile032F({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'user' | 'car' | 'star' | 'clock'; styles: any }>) {
  const Icon = icon === 'user' ? UserRound : icon === 'car' ? Car : icon === 'star' ? Star : Clock3;
  return (
    <View style={styles.driverProfileTile031H}>
      <View style={styles.driverProfileTileIcon031H}>
        <Icon color="#fef3c7" size={18} />
      </View>
      <Text style={styles.driverProfileTileTitle031H}>{title}</Text>
      <Text style={styles.driverProfileTileText031H}>{text}</Text>
    </View>
  );
}

function ArrivalStep032F({ index, title, text, icon, styles }: Readonly<{ index: number; title: string; text: string; icon: 'user' | 'car' | 'star' | 'clock'; styles: any }>) {
  const Icon = icon === 'user' ? UserRound : icon === 'car' ? Car : icon === 'star' ? Star : Clock3;
  return (
    <View style={styles.arrivalStepRow031H}>
      <View style={styles.arrivalStepIndex031H}>
        <Text style={styles.arrivalStepIndexText031H}>{index}</Text>
      </View>
      <View style={styles.arrivalStepIcon031H}>
        <Icon color="#dbeafe" size={16} />
      </View>
      <View style={styles.arrivalStepTextBox031H}>
        <Text style={styles.arrivalStepTitle031H}>{title}</Text>
        <Text style={styles.arrivalStepText031H}>{text}</Text>
      </View>
    </View>
  );
}
