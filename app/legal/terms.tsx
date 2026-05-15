import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSabiTheme } from "../../src/theme/ThemeProvider";

export default function TermsScreen() {
  const theme = useSabiTheme();

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>
          LEGAL
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Terms of Use
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Core product access, safety, account responsibility, and service rules.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <SectionTitle themeColor={theme.colors.text} title="1. Account responsibility" />
          <Paragraph color={theme.colors.textSecondary}>
            Users are responsible for maintaining correct account details,
            protecting sign-in access, and using the app in accordance with
            platform policies and applicable laws.
          </Paragraph>

          <SectionTitle themeColor={theme.colors.text} title="2. Acceptable use" />
          <Paragraph color={theme.colors.textSecondary}>
            The app may not be used for fraud, abuse, unauthorized payments,
            harassment, illegal transactions, or attempts to bypass security,
            moderation, compliance, or platform controls.
          </Paragraph>

          <SectionTitle themeColor={theme.colors.text} title="3. Wallet and payment features" />
          <Paragraph color={theme.colors.textSecondary}>
            Wallet, transfer, and payment-related functions may depend on
            eligibility, verification, regional availability, compliance checks,
            and product rollout status. Access can be limited, delayed, or
            restricted when safety or policy checks require it.
          </Paragraph>

          <SectionTitle themeColor={theme.colors.text} title="4. Service changes" />
          <Paragraph color={theme.colors.textSecondary}>
            Sabi may improve, adjust, suspend, or remove features, routes,
            modules, and flows as the product evolves, including changes required
            for security, compliance, launch preparation, and technical stability.
          </Paragraph>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  themeColor,
}: {
  title: string;
  themeColor: string;
}) {
  return <Text style={[styles.sectionTitle, { color: themeColor }]}>{title}</Text>;
}

function Paragraph({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return <Text style={[styles.paragraph, { color }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
});