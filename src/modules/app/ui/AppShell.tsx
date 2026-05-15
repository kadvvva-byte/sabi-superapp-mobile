import React, { type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSabiTheme } from "../../../theme/ThemeProvider";

type Props = {
  title?: string;
  subtitle?: string;
  rightAction?: ReactNode;
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function AppShell({
  title,
  subtitle,
  rightAction,
  children,
  scrollable = true,
  style,
  contentContainerStyle,
}: Props) {
  const theme = useSabiTheme();

  const content = (
    <View style={[styles.content, contentContainerStyle]}>
      {(title || subtitle || rightAction) && (
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            {title ? (
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
            ) : null}

            {subtitle ? (
              <Text
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>

          {rightAction ? <View>{rightAction}</View> : null}
        </View>
      )}

      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
});