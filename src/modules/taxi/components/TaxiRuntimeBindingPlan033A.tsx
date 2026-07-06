import { MessageCircle, ShieldCheck, UserRound, WalletCards } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { CleanTaxiCopyKey031A } from '../presentation/taxiMobileCleanI18n031A';

export const TAXI_MOBILE_UIUX_033A_MOBILE_RUNTIME_BINDING_PLANNING = 'TAXI-MOBILE-UIUX-033A-MOBILE-RUNTIME-BINDING-PLANNING' as const;

type TaxiRuntimeBindingIcon033A = 'safeRead' | 'dispatch' | 'agent' | 'ownerAi' | 'report' | 'privacy';
type TaxiRuntimeBindingItem033A = Readonly<{ titleKey: CleanTaxiCopyKey031A; textKey: CleanTaxiCopyKey031A; icon: TaxiRuntimeBindingIcon033A }>;
type TaxiRuntimeBindingStyles033A = Record<string, any>;

const taxiRuntimeBindingItems033A: TaxiRuntimeBindingItem033A[] = [
  { titleKey: 'runtime.binding.safeRead.title', textKey: 'runtime.binding.safeRead.text', icon: 'safeRead' },
  { titleKey: 'runtime.binding.dispatch.title', textKey: 'runtime.binding.dispatch.text', icon: 'dispatch' },
  { titleKey: 'runtime.binding.agent.title', textKey: 'runtime.binding.agent.text', icon: 'agent' },
  { titleKey: 'runtime.binding.ownerAi.title', textKey: 'runtime.binding.ownerAi.text', icon: 'ownerAi' },
  { titleKey: 'runtime.binding.dailyReport.title', textKey: 'runtime.binding.dailyReport.text', icon: 'report' },
  { titleKey: 'runtime.binding.privacy.title', textKey: 'runtime.binding.privacy.text', icon: 'privacy' },
];

export function TaxiRuntimeBindingPlan033A({
  t,
  styles,
  onNotice,
}: Readonly<{
  t: (key: CleanTaxiCopyKey031A) => string;
  styles: TaxiRuntimeBindingStyles033A;
  onNotice: () => void;
}>) {
  return (
    <View style={styles.runtimeBindingCard033A}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionKicker}>{t('runtime.binding.kicker')}</Text>
          <Text style={styles.sectionTitle}>{t('runtime.binding.title')}</Text>
        </View>
        <View style={styles.runtimeBindingIcon033A}>
          <ShieldCheck color="#bae6fd" size={20} />
        </View>
      </View>
      <Text style={styles.runtimeBindingSubtitle033A}>{t('runtime.binding.subtitle')}</Text>

      <View style={styles.runtimeBindingIdentityBox033A}>
        <Text style={styles.runtimeBindingIdentityTitle033A}>{t('sabi.ai.identity.title')}</Text>
        <Text style={styles.runtimeBindingIdentityText033A}>{t('sabi.ai.identity.text')}</Text>
        <Text style={styles.runtimeBindingIdentityTitle033A}>{t('sabi.ai.agentHelp.title')}</Text>
        <Text style={styles.runtimeBindingIdentityText033A}>{t('sabi.ai.agentHelp.text')}</Text>
      </View>

      <View style={styles.runtimeBindingGrid033A}>
        {taxiRuntimeBindingItems033A.map((item) => (
          <TaxiRuntimeBindingTile033A key={item.titleKey} title={t(item.titleKey)} text={t(item.textKey)} icon={item.icon} styles={styles} />
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={onNotice} style={styles.runtimeBindingGuard033A}>
        <ShieldCheck color="#bbf7d0" size={18} />
        <Text style={styles.runtimeBindingGuardText033A}>{t('runtime.binding.guard')}</Text>
      </Pressable>
    </View>
  );
}

function TaxiRuntimeBindingTile033A({
  title,
  text,
  icon,
  styles,
}: Readonly<{ title: string; text: string; icon: TaxiRuntimeBindingIcon033A; styles: TaxiRuntimeBindingStyles033A }>) {
  const Icon = icon === 'agent' ? WalletCards : icon === 'ownerAi' ? UserRound : icon === 'report' ? MessageCircle : ShieldCheck;
  return (
    <View style={styles.runtimeBindingTile033A}>
      <View style={styles.runtimeBindingIcon033A}>
        <Icon color="#bae6fd" size={18} />
      </View>
      <Text style={styles.runtimeBindingTileTitle033A}>{title}</Text>
      <Text style={styles.runtimeBindingTileText033A}>{text}</Text>
    </View>
  );
}
