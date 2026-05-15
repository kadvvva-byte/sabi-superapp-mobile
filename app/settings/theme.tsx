import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useSabiTheme,
  useSabiThemeController,
  type AppThemeMode,
} from "../../src/theme/ThemeProvider";

const OPTIONS: Array<{
  key: AppThemeMode;
  title: string;
  subtitle: string;
}> = [
  {
    key: "dark",
    title: "Dark",
    subtitle: "Classic premium dark base",
  },
  {
    key: "ocean",
    title: "Ocean",
    subtitle: "Blue premium wallet tone",
  },
];

export default function ThemeSettingsScreen() {
  const theme = useSabiTheme();
  const { themeMode, setThemeMode } = useSabiThemeController();

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>
          APPEARANCE
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Theme
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Choose the visual mode for the app shell.
        </Text>

        <View style={styles.list}>
          {OPTIONS.map((option) => {
            const active = themeMode === option.key;

            return (
              <Pressable
                key={option.key}
                onPress={() => setThemeMode(option.key)}
                style={[
                  styles.card,
                  {
                    backgroundColor: active
                      ? theme.colors.accentSoft
                      : theme.colors.card,
                    borderColor: active
                      ? theme.colors.accent
                      : theme.colors.border,
                  },
                ]}
              >
                <View style={styles.cardTextWrap}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {option.subtitle}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: active
                        ? theme.colors.accent
                        : theme.colors.border,
                      backgroundColor: active
                        ? theme.colors.accent
                        : "transparent",
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
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
  list: {
    gap: 12,
  },
  card: {
    minHeight: 88,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
});