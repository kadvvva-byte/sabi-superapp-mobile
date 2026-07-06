import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSabiTheme } from "../../src/theme/ThemeProvider";
import {
  SABI_ACCOUNT_DELETION_PATH,
  SABI_ACCOUNT_DELETION_RETENTION_EXCEPTIONS,
  SABI_ACCOUNT_DELETION_URL,
  SABI_PRIVACY_POLICY_URL,
  SABI_PRIVACY_POLICY_URL_STATUS,
} from "../../src/modules/profile/data/privacy";

export default function PrivacyScreen() {
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
          Privacy Policy
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          How Sabi stores, protects, and uses account and app activity data.
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
          <SectionTitle themeColor={theme.colors.text} title="1. Data we process" />
          <Paragraph color={theme.colors.textSecondary}>
            Sabi may process account information, profile data, device metadata,
            wallet activity, security events, communication metadata, and product
            usage data needed for core app functions and safety.
          </Paragraph>

          <SectionTitle themeColor={theme.colors.text} title="2. Why we process it" />
          <Paragraph color={theme.colors.textSecondary}>
            Data is processed to provide access to the app, secure accounts,
            support wallet and messenger flows, prevent abuse and fraud, improve
            performance, and comply with platform and legal requirements.
          </Paragraph>

          <SectionTitle themeColor={theme.colors.text} title="3. Security and retention" />
          <Paragraph color={theme.colors.textSecondary}>
            Access to personal data should be restricted by internal roles and
            protected through technical and organizational security controls.
            Retention periods may depend on legal, financial, fraud-prevention,
            and operational needs.
          </Paragraph>

          <SectionTitle themeColor={theme.colors.text} title="4. User controls" />
          <Paragraph color={theme.colors.textSecondary}>
            Users may be able to update profile details, manage permissions,
            change app settings, request account deletion, and request support for
            account-related privacy issues through product support and policy flows.
          </Paragraph>

          <SectionTitle themeColor={theme.colors.text} title="5. Privacy and deletion links" />
          <Paragraph color={theme.colors.textSecondary}>
            Public Privacy Policy URL: {SABI_PRIVACY_POLICY_URL}
          </Paragraph>
          <Paragraph color={theme.colors.textSecondary}>
            Account deletion path in app: {SABI_ACCOUNT_DELETION_PATH}
          </Paragraph>
          <Paragraph color={theme.colors.textSecondary}>
            Web account deletion request URL: {SABI_ACCOUNT_DELETION_URL}
          </Paragraph>
          <Paragraph color={theme.colors.textSecondary}>
            Link status before production submission: {SABI_PRIVACY_POLICY_URL_STATUS}.
            Replace placeholder URLs with the final public company domain before
            Google Play production submission.
          </Paragraph>

          <SectionTitle themeColor={theme.colors.text} title="6. Retention exceptions" />
          <Paragraph color={theme.colors.textSecondary}>
            Some records may be retained where required for{" "}
            {SABI_ACCOUNT_DELETION_RETENTION_EXCEPTIONS.join(", ")}.
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