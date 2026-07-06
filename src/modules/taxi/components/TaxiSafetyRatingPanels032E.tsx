import { Clock3, MessageCircle, ShieldCheck, Star, UserRound, WalletCards } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_032E_SAFETY_RATING_COMPONENT_SPLIT = 'TAXI-MOBILE-UIUX-032E-SAFETY-RATING-COMPONENT-SPLIT';

type TaxiText032E = (key: CleanTaxiCopyKey031A) => string;
type TaxiStyles032E = Record<string, any>;
type TaxiNotice032E = (message: string) => void;
type TaxiSafetyPanelItem032E = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: 'shield' | 'chat' | 'support' }>;
type TaxiRatingHistoryItem032E = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: 'star' | 'wallet' | 'clock' }>;

const taxiSafetyPanelItems032E: TaxiSafetyPanelItem032E[] = [
  { titleKey: 'safety.panel.sos.title', textKey: 'safety.panel.sos.text', icon: 'shield' },
  { titleKey: 'safety.panel.share.title', textKey: 'safety.panel.share.text', icon: 'support' },
  { titleKey: 'safety.panel.record.title', textKey: 'safety.panel.record.text', icon: 'chat' },
];

const taxiSupportPanelItems032E: TaxiSafetyPanelItem032E[] = [
  { titleKey: 'chat.panel.title', textKey: 'chat.panel.text', icon: 'chat' },
  { titleKey: 'support.panel.title', textKey: 'support.panel.text', icon: 'support' },
  { titleKey: 'support.panel.queue.title', textKey: 'support.panel.queue.text', icon: 'shield' },
];

const taxiRatingPanelItems032E: TaxiRatingHistoryItem032E[] = [
  { titleKey: 'rating.panel.stars.title', textKey: 'rating.panel.stars.text', icon: 'star' },
  { titleKey: 'rating.panel.tips.title', textKey: 'rating.panel.tips.text', icon: 'wallet' },
  { titleKey: 'rating.panel.history.title', textKey: 'rating.panel.history.text', icon: 'clock' },
];

const taxiHistoryPanelItems032E: TaxiRatingHistoryItem032E[] = [
  { titleKey: 'tips.panel.title', textKey: 'tips.panel.text', icon: 'wallet' },
  { titleKey: 'history.panel.title', textKey: 'history.panel.text', icon: 'clock' },
  { titleKey: 'history.receipts.title', textKey: 'history.receipts.text', icon: 'star' },
];

export function TaxiSafetySupportPanel032E({ t, styles, onNotice }: Readonly<{ t: TaxiText032E; styles: TaxiStyles032E; onNotice: TaxiNotice032E }>) {
  return (
    <>
      <View style={styles.safetyCard}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionKicker}>{t('safety.kicker')}</Text>
            <Text style={styles.sectionTitle}>{t('safety.title')}</Text>
          </View>
          <ShieldCheck color="#86efac" size={24} />
        </View>
        <Text style={styles.bulletText}>• {t('safety.one')}</Text>
        <Text style={styles.bulletText}>• {t('safety.two')}</Text>
        <Text style={styles.bulletText}>• {t('safety.three')}</Text>
      </View>

      <View style={styles.safetyPanelCard031F}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionKicker}>{t('safety.panel.kicker')}</Text>
            <Text style={styles.sectionTitle}>{t('safety.panel.title')}</Text>
          </View>
          <ShieldCheck color="#bbf7d0" size={24} />
        </View>
        <Text style={styles.safetyPanelSubtitle031F}>{t('safety.panel.subtitle')}</Text>
        <View style={styles.safetyPanelGrid031F}>
          {taxiSafetyPanelItems032E.map((item) => (
            <SafetySupportItem032E key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
          ))}
        </View>
        <View style={styles.supportPanelCard031F}>
          <Text style={styles.supportPanelKicker031F}>{t('support.panel.title')}</Text>
          {taxiSupportPanelItems032E.map((item) => (
            <SafetySupportRow032E key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={() => onNotice(t('notice.safetyPanel'))} style={styles.privacyGuard031F}>
          <ShieldCheck color="#86efac" size={18} />
          <View style={styles.privacyGuardTextBox031F}>
            <Text style={styles.privacyGuardTitle031F}>{t('privacy.guard.title')}</Text>
            <Text style={styles.privacyGuardText031F}>{t('privacy.guard.text')}</Text>
          </View>
        </Pressable>
      </View>
    </>
  );
}

export function TaxiRatingHistoryPanel032E({ t, styles, onNotice }: Readonly<{ t: TaxiText032E; styles: TaxiStyles032E; onNotice: TaxiNotice032E }>) {
  return (
    <View style={styles.ratingHistoryCard031G}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('rating.panel.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('rating.panel.title')}</Text>
        </View>
        <Star color="#fde68a" size={24} />
      </View>
      <Text style={styles.ratingHistorySubtitle031G}>{t('rating.panel.subtitle')}</Text>
      <View style={styles.ratingHistoryGrid031G}>
        {taxiRatingPanelItems032E.map((item) => (
          <RatingHistoryTile032E key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>
      <View style={styles.historyPanelCard031G}>
        <Text style={styles.historyPanelLocal031G}>{t('rating.panel.local')}</Text>
        {taxiHistoryPanelItems032E.map((item) => (
          <RatingHistoryRow032E key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => onNotice(t('notice.ratingPanel'))} style={styles.ratingGuard031G}>
        <ShieldCheck color="#fef3c7" size={18} />
        <Text style={styles.ratingGuardText031G}>{t('rating.panel.guard')}</Text>
      </Pressable>
    </View>
  );
}

function RatingHistoryTile032E({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'star' | 'wallet' | 'clock'; styles: TaxiStyles032E }>) {
  const Icon = icon === 'star' ? Star : icon === 'wallet' ? WalletCards : Clock3;
  return (
    <View style={styles.ratingHistoryTile031G}>
      <View style={styles.ratingHistoryIcon031G}>
        <Icon color="#fde68a" size={18} />
      </View>
      <Text style={styles.ratingHistoryTileTitle031G}>{title}</Text>
      <Text style={styles.ratingHistoryTileText031G}>{text}</Text>
    </View>
  );
}

function RatingHistoryRow032E({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'star' | 'wallet' | 'clock'; styles: TaxiStyles032E }>) {
  const Icon = icon === 'star' ? Star : icon === 'wallet' ? WalletCards : Clock3;
  return (
    <View style={styles.ratingHistoryRow031G}>
      <View style={styles.ratingHistoryRowIcon031G}>
        <Icon color="#fef3c7" size={16} />
      </View>
      <View style={styles.ratingHistoryRowTextBox031G}>
        <Text style={styles.ratingHistoryRowTitle031G}>{title}</Text>
        <Text style={styles.ratingHistoryRowText031G}>{text}</Text>
      </View>
    </View>
  );
}

function SafetySupportItem032E({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'shield' | 'chat' | 'support'; styles: TaxiStyles032E }>) {
  const Icon = icon === 'shield' ? ShieldCheck : icon === 'chat' ? MessageCircle : UserRound;
  return (
    <View style={styles.safetyPanelItem031F}>
      <View style={styles.safetyPanelIcon031F}>
        <Icon color="#bbf7d0" size={18} />
      </View>
      <Text style={styles.safetyPanelItemTitle031F}>{title}</Text>
      <Text style={styles.safetyPanelItemText031F}>{text}</Text>
    </View>
  );
}

function SafetySupportRow032E({ title, text, icon, styles }: Readonly<{ title: string; text: string; icon: 'shield' | 'chat' | 'support'; styles: TaxiStyles032E }>) {
  const Icon = icon === 'shield' ? ShieldCheck : icon === 'chat' ? MessageCircle : UserRound;
  return (
    <View style={styles.supportPanelRow031F}>
      <View style={styles.supportPanelIcon031F}>
        <Icon color="#bfdbfe" size={16} />
      </View>
      <View style={styles.supportPanelTextBox031F}>
        <Text style={styles.supportPanelRowTitle031F}>{title}</Text>
        <Text style={styles.supportPanelRowText031F}>{text}</Text>
      </View>
    </View>
  );
}
