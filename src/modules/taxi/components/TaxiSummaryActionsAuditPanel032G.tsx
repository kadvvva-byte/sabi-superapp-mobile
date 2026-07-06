import { Car, MessageCircle, ShieldCheck, Star, UserRound, WalletCards } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  TAXI_MOBILE_UIUX_031A_CLEAN_I18N_BASE,
  TAXI_MOBILE_UIUX_031A_FIX1_CLEAN_I18N_25_LANGUAGES,
  TAXI_MOBILE_UIUX_031B_PREMIUM_RIDER_HOME,
  TAXI_MOBILE_UIUX_031C_ROUTE_SHEET_TARIFF_POLISH,
  TAXI_MOBILE_UIUX_031D_ADDRESS_STOP_SCHEDULE_POLISH,
  TAXI_MOBILE_UIUX_031E_PREMIUM_MAP_DRIVER_SEARCH_STATE,
  TAXI_MOBILE_UIUX_031F_SAFETY_CHAT_SUPPORT_PANEL,
  TAXI_MOBILE_UIUX_031G_RATING_TIP_HISTORY_FOUNDATION,
  TAXI_MOBILE_UIUX_031H_DRIVER_PROFILE_ARRIVAL_CARD,
  TAXI_MOBILE_UIUX_031I_DRIVER_LIVE_TRIP_SKELETON,
  TAXI_MOBILE_UIUX_031J_DRIVER_MODE_PREMIUM_WORKSPACE,
  TAXI_MOBILE_UIUX_031K_DELIVERY_COURIER_MODE_POLISH,
  TAXI_MOBILE_UIUX_032A_VISUAL_DENSITY_SCREEN_SPLIT,
  type CleanTaxiCopyKey031A,
} from '../presentation/taxiMobileCleanI18n031A';
import { TAXI_MOBILE_UIUX_032B_COMPONENT_SPLIT } from './TaxiVisualDensityPanel032B';
import { TAXI_MOBILE_UIUX_032C_ROUTE_TARIFF_COMPONENT_SPLIT } from './TaxiRouteTariffPanel032C';
import { TAXI_MOBILE_UIUX_032D_ADDRESS_MAP_COMPONENT_SPLIT } from './TaxiMapDriverSearchPanel032D';
import { TAXI_MOBILE_UIUX_032E_SAFETY_RATING_COMPONENT_SPLIT } from './TaxiSafetyRatingPanels032E';
import { TAXI_MOBILE_UIUX_032F_DRIVER_LIVE_DELIVERY_COMPONENT_SPLIT } from './TaxiDriverLiveDeliveryPanels032F';

export const TAXI_MOBILE_UIUX_032G_SUMMARY_ACTIONS_AUDIT_COMPONENT_SPLIT = 'TAXI-MOBILE-UIUX-032G-SUMMARY-ACTIONS-AUDIT-COMPONENT-SPLIT' as const;

type TaxiScreenMode032G = 'ride' | 'delivery' | 'driver' | 'agent';
type TaxiTariff032G = 'economy' | 'comfort' | 'business' | 'premium' | 'delivery';
type TaxiText032G = (key: CleanTaxiCopyKey031A) => string;
type TaxiComponentStyles032G = Record<string, any>;

export function TaxiSummaryPanel032G({
  t,
  styles,
  tariff,
}: Readonly<{
  t: TaxiText032G;
  styles: TaxiComponentStyles032G;
  tariff: TaxiTariff032G;
}>) {
  return (
    <View style={styles.summaryPremiumCard}>
      <View style={styles.summaryHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('bottom.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('summary.title')}</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryPillText}>{t(`tariff.${tariff}.title` as CleanTaxiCopyKey031A)}</Text>
        </View>
      </View>
      <SummaryRow032G title={t('summary.price.title')} text={t('summary.price.text')} icon="star" styles={styles} />
      <SummaryRow032G title={t('summary.route.title')} text={t('summary.route.text')} icon="star" styles={styles} />
      <SummaryRow032G title={t('summary.driver.title')} text={t('summary.driver.text')} icon="user" styles={styles} />
      <SummaryRow032G title={t('summary.payment.title')} text={t('summary.payment.text')} icon="wallet" styles={styles} />
    </View>
  );
}

export function TaxiActionsPanel032G({
  t,
  styles,
  onPrepareDraft,
  onSelectMode,
}: Readonly<{
  t: TaxiText032G;
  styles: TaxiComponentStyles032G;
  onPrepareDraft: () => void;
  onSelectMode: (mode: TaxiScreenMode032G) => void;
}>) {
  return (
    <View style={styles.actionGrid}>
      <Pressable accessibilityRole="button" onPress={onPrepareDraft} style={styles.primaryAction}>
        <Text style={styles.primaryActionText}>{t('actions.prepare')}</Text>
        <Text style={styles.primaryActionSubtext}>{t('bottom.guard')}</Text>
      </Pressable>
      <ActionTile032G icon="shield" label={t('actions.sos')} styles={styles} />
      <ActionTile032G icon="chat" label={t('actions.chat')} styles={styles} />
      <ActionTile032G icon="support" label={t('actions.support')} styles={styles} />
      <ActionTile032G icon="driver" label={t('actions.driverMode')} onPress={() => onSelectMode('driver')} styles={styles} />
      <ActionTile032G icon="agent" label={t('actions.agent')} onPress={() => onSelectMode('agent')} styles={styles} />
    </View>
  );
}

export function TaxiAuditPanel032G({
  t,
  styles,
  markerText,
}: Readonly<{
  t: TaxiText032G;
  styles: TaxiComponentStyles032G;
  markerText?: string;
}>) {
  return (
    <View style={styles.auditCard}>
      <Text style={styles.auditTitle}>{t('i18n.audit.title')}</Text>
      <Text style={styles.auditText}>{t('i18n.audit.text')}</Text>
      <Text style={styles.auditMarker}>
        {markerText ?? `${TAXI_MOBILE_UIUX_031A_CLEAN_I18N_BASE} · ${TAXI_MOBILE_UIUX_031A_FIX1_CLEAN_I18N_25_LANGUAGES} · ${TAXI_MOBILE_UIUX_031B_PREMIUM_RIDER_HOME} · ${TAXI_MOBILE_UIUX_031C_ROUTE_SHEET_TARIFF_POLISH} · ${TAXI_MOBILE_UIUX_031D_ADDRESS_STOP_SCHEDULE_POLISH} · ${TAXI_MOBILE_UIUX_031E_PREMIUM_MAP_DRIVER_SEARCH_STATE} · ${TAXI_MOBILE_UIUX_031F_SAFETY_CHAT_SUPPORT_PANEL} · ${TAXI_MOBILE_UIUX_031G_RATING_TIP_HISTORY_FOUNDATION} · ${TAXI_MOBILE_UIUX_031H_DRIVER_PROFILE_ARRIVAL_CARD} · ${TAXI_MOBILE_UIUX_031I_DRIVER_LIVE_TRIP_SKELETON} · ${TAXI_MOBILE_UIUX_031J_DRIVER_MODE_PREMIUM_WORKSPACE} · ${TAXI_MOBILE_UIUX_031K_DELIVERY_COURIER_MODE_POLISH} · ${TAXI_MOBILE_UIUX_032A_VISUAL_DENSITY_SCREEN_SPLIT} · ${TAXI_MOBILE_UIUX_032B_COMPONENT_SPLIT} · ${TAXI_MOBILE_UIUX_032C_ROUTE_TARIFF_COMPONENT_SPLIT} · ${TAXI_MOBILE_UIUX_032D_ADDRESS_MAP_COMPONENT_SPLIT} · ${TAXI_MOBILE_UIUX_032E_SAFETY_RATING_COMPONENT_SPLIT} · ${TAXI_MOBILE_UIUX_032F_DRIVER_LIVE_DELIVERY_COMPONENT_SPLIT} · ${TAXI_MOBILE_UIUX_032G_SUMMARY_ACTIONS_AUDIT_COMPONENT_SPLIT}`}
      </Text>
    </View>
  );
}

function ActionTile032G({
  icon,
  label,
  onPress,
  styles,
}: Readonly<{
  icon: 'shield' | 'chat' | 'support' | 'driver' | 'agent';
  label: string;
  onPress?: () => void;
  styles: TaxiComponentStyles032G;
}>) {
  const Icon = icon === 'shield' ? ShieldCheck : icon === 'chat' ? MessageCircle : icon === 'driver' ? Car : UserRound;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.actionTile}>
      <Icon color="#dbeafe" size={18} />
      <Text style={styles.actionTileText}>{label}</Text>
    </Pressable>
  );
}

function SummaryRow032G({
  title,
  text,
  icon,
  styles,
}: Readonly<{ title: string; text: string; icon: 'star' | 'user' | 'wallet'; styles: TaxiComponentStyles032G }>) {
  const Icon = icon === 'star' ? Star : icon === 'user' ? UserRound : WalletCards;
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <Icon color="#fde68a" size={18} />
      </View>
      <View style={styles.summaryTextBox}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryText}>{text}</Text>
      </View>
    </View>
  );
}
