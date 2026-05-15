import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import WalletScreenShell from "../../src/modules/wallet/components/WalletScreenShell";
import { WalletHeader } from "../../src/modules/wallet/components/WalletHeader";
import WalletSectionTitle from "../../src/modules/wallet/components/WalletSectionTitle";
import WalletCompactBar from "../../src/modules/wallet/components/WalletCompactBar";
import WalletBalanceCard from "../../src/modules/wallet/components/WalletBalanceCard";
import WalletActionButton from "../../src/modules/wallet/components/WalletActionButton";
import SabiBalanceCard from "../../src/modules/wallet/components/SabiBalanceCard";
import WalletProviderStatusPanel from "../../src/modules/wallet/components/WalletProviderStatusPanel";
import { useI18n } from "../../src/shared/i18n";
import { getWalletEntryTexts } from "../../src/shared/wallet/wallet-i18n";
import { useWalletProviderMobileSync } from "../../src/shared/wallet/wallet-provider-mobile-sync";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const { t } = useI18n();
  useWalletProviderMobileSync();

  const texts = useMemo(() => getWalletEntryTexts(t), [t]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const compactBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [70, 150],
      [0, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [70, 150],
      [-10, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const balanceParallaxStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 220],
          [0, -10],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <WalletScreenShell>
      <WalletCompactBar
        top={insets.top + 8}
        animatedStyle={compactBarStyle}
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 18,
            paddingBottom: Math.max(insets.bottom + 36, 48),
          },
        ]}
      >
        <View style={styles.container}>
          <WalletHeader
            title={texts.headerTitle}
            subtitle={texts.headerSubtitle}
          />

          <View style={styles.headerToCardGap} />

          <Animated.View style={balanceParallaxStyle}>
            <WalletBalanceCard />
          </Animated.View>

          <View style={styles.cardGap} />

          <SabiBalanceCard />

          <View style={styles.cardGap} />

          <WalletProviderStatusPanel scope="wallet" compact />

          <View style={styles.sectionGap} />

          <WalletSectionTitle
            title={texts.quickActionsTitle}
            hint={texts.quickActionsHint}
          />

          <View style={styles.titleToActionsGap} />

          <View style={styles.actionsRow}>
            <WalletActionButton
              title={texts.topUp}
              primary
              onPress={() => router.push("/wallet/topup")}
              icon={<Ionicons name="add" size={18} color="#07110A" />}
            />
            <WalletActionButton
              title={texts.send}
              onPress={() => router.push("/wallet/send")}
              icon={<Ionicons name="arrow-up" size={18} color="#FFFFFF" />}
            />
            <WalletActionButton
              title={texts.receive}
              onPress={() => router.push("/wallet/receive")}
              icon={<Ionicons name="arrow-down" size={18} color="#FFFFFF" />}
            />
          </View>

          <View style={styles.actionsRow}>
            <WalletActionButton
              title={texts.qrPay}
              onPress={() => router.push("/wallet/qr-scan")}
              icon={
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={18}
                  color="#FFFFFF"
                />
              }
            />
            <WalletActionButton
              title={texts.cards}
              onPress={() => router.push("/wallet/cards")}
              icon={<Ionicons name="card-outline" size={18} color="#FFFFFF" />}
            />
            <WalletActionButton
              title={texts.crypto}
              onPress={() => router.push("/wallet/crypto")}
              icon={
                <MaterialCommunityIcons
                  name="currency-btc"
                  size={18}
                  color="#FFFFFF"
                />
              }
            />
          </View>

          <View style={styles.subSectionGap} />

          <WalletSectionTitle
            title={texts.cardsAccessTitle}
            hint={texts.cardsAccessHint}
          />

          <View style={styles.titleToActionsGap} />

          <View style={styles.cardAccessRow}>
            <Pressable
              onPress={() => router.push("/wallet/cards")}
              style={styles.accessCard}
            >
              <View style={styles.accessIconWrap}>
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              </View>

              <View style={styles.accessTextWrap}>
                <Text style={styles.accessTitle}>{texts.allCardsTitle}</Text>
                <Text style={styles.accessSubtitle}>
                  {texts.allCardsSubtitle}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/wallet/cards/local")}
              style={styles.accessCard}
            >
              <View style={styles.accessIconWrap}>
                <MaterialCommunityIcons
                  name="credit-card-chip-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.accessTextWrap}>
                <Text style={styles.accessTitle}>{texts.localCardsTitle}</Text>
                <Text style={styles.accessSubtitle}>
                  {texts.localCardsSubtitle}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Animated.ScrollView>
    </WalletScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
  },
  headerToCardGap: {
    height: 16,
  },
  cardGap: {
    height: 16,
  },
  sectionGap: {
    height: 22,
  },
  subSectionGap: {
    height: 10,
  },
  titleToActionsGap: {
    height: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardAccessRow: {
    gap: 12,
    marginBottom: 12,
  },
  accessCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  accessIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  accessTextWrap: {
    flex: 1,
    gap: 4,
  },
  accessTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  accessSubtitle: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 18,
  },
});