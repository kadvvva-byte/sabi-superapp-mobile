import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GIFT_MODULE_ENTRY_POINTS } from "../../messenger/gifts/giftModulePlan";
import { GiftCatalogSection } from "../../messenger/gifts/giftTypes";

type Props = {
  visible: boolean;
  accent: string;
  accentSoft?: string;
  currentCoinBalance?: number;
  creatorLabel?: string;
  onClose: () => void;
  onOpenSection?: (section: GiftCatalogSection) => void;
};

type EntryCardView = {
  id: string;
  title: string;
  subtitle: string;
  section: GiftCatalogSection;
  icon: keyof typeof Ionicons.glyphMap;
};

const SECTION_ICONS: Record<GiftCatalogSection, keyof typeof Ionicons.glyphMap> = {
  shop: "gift-outline",
  wheel_of_fortune: "sync-outline",
  fishing: "fish-outline",
  inventory: "albums-outline",
  event_gifts: "sparkles-outline",
};

function getSectionPalette(section: GiftCatalogSection) {
  switch (section) {
    case "shop":
      return {
        top: "rgba(18,184,134,0.16)",
        bottom: "rgba(9,31,24,0.88)",
        border: "rgba(18,184,134,0.22)",
        glow: "rgba(18,184,134,0.18)",
      };
    case "wheel_of_fortune":
      return {
        top: "rgba(124,68,242,0.16)",
        bottom: "rgba(27,14,45,0.90)",
        border: "rgba(124,68,242,0.22)",
        glow: "rgba(124,68,242,0.18)",
      };
    case "fishing":
      return {
        top: "rgba(47,107,255,0.16)",
        bottom: "rgba(15,28,48,0.90)",
        border: "rgba(47,107,255,0.22)",
        glow: "rgba(47,107,255,0.18)",
      };
    case "inventory":
      return {
        top: "rgba(245,158,11,0.16)",
        bottom: "rgba(38,24,10,0.90)",
        border: "rgba(245,158,11,0.22)",
        glow: "rgba(245,158,11,0.18)",
      };
    case "event_gifts":
      return {
        top: "rgba(255,92,92,0.16)",
        bottom: "rgba(38,12,12,0.92)",
        border: "rgba(255,92,92,0.22)",
        glow: "rgba(255,92,92,0.18)",
      };
    default:
      return {
        top: "rgba(255,255,255,0.06)",
        bottom: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.10)",
        glow: "rgba(255,255,255,0.08)",
      };
  }
}

function InfoPill({
  icon,
  label,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accent: string;
}) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon} size={13} color={accent} />
      <Text style={[styles.infoPillText, { color: accent }]}>{label}</Text>
    </View>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <View style={[styles.summaryCard, { borderColor: `${accent}22` }]}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summarySubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function StreamGiftEntrySheet({
  visible,
  accent,
  accentSoft,
  currentCoinBalance = 0,
  creatorLabel = "Creator",
  onClose,
  onOpenSection,
}: Props) {
  const entryCards = useMemo<EntryCardView[]>(
    () =>
      GIFT_MODULE_ENTRY_POINTS.filter((entry) => entry.sourceProgram === "stream").map(
        (entry) => ({
          id: entry.id,
          title: entry.title,
          subtitle: entry.description,
          section: entry.section,
          icon: SECTION_ICONS[entry.section],
        }),
      ),
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <LinearGradient
          colors={["rgba(13,24,23,0.98)", "rgba(6,14,13,0.98)"]}
          style={styles.sheet}
        >
          <View style={[styles.sheetGlow, { backgroundColor: accentSoft ?? `${accent}18` }]} />
          <View style={[styles.sheetGlowAlt, { backgroundColor: `${accent}12` }]} />

          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.eyebrow, { color: accent }]}>STREAM · GIFT CENTER</Text>
              <Text style={styles.title}>GIFT 3D PREMIUM</Text>
              <Text style={styles.subtitle}>
                Shared gift platform for Stream. Send 3D gifts, play reward games and manage won gifts from one place.
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeWrap}>
              {({ pressed }) => (
                <View style={[styles.closeButton, pressed ? styles.pressed : null]}>
                  <Ionicons name="close" size={18} color="#F6FFF9" />
                </View>
              )}
            </Pressable>
          </View>

          <LinearGradient
            colors={["rgba(28,56,52,0.92)", "rgba(12,22,20,0.88)"]}
            style={[styles.heroCard, { borderColor: `${accent}20` }]}
          >
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroLabel}>Available COIN</Text>
                <Text style={styles.heroValue}>{currentCoinBalance.toLocaleString()}</Text>
              </View>

              <View style={[styles.creatorBadge, { borderColor: `${accent}22` }]}>
                <Ionicons name="videocam-outline" size={13} color={accent} />
                <Text style={[styles.creatorBadgeText, { color: accent }]}>{creatorLabel}</Text>
              </View>
            </View>

            <View style={styles.heroPillsRow}>
              <InfoPill icon="gift-outline" label="3D Gifts Only" accent={accent} />
              <InfoPill icon="wallet-outline" label="Real-time Coin Send" accent={accent} />
              <InfoPill icon="albums-outline" label="Shared Storage" accent={accent} />
            </View>

            <Text style={styles.heroHint}>
              Stream and Messenger use one unified gift engine, one inventory and one user ID policy.
            </Text>
          </LinearGradient>

          <View style={styles.summaryRow}>
            <SummaryCard
              title="Games"
              value="2+"
              subtitle="Wheel · Fishing · more later"
              accent="#7C44F2"
            />
            <SummaryCard
              title="Entry Cost"
              value="10"
              subtitle="Base reward-game price"
              accent="#2F6BFF"
            />
            <SummaryCard
              title="Storage"
              value="30d"
              subtitle="Won gifts expire after 30 days"
              accent="#F59E0B"
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stream Entry Points</Text>
            <Text style={styles.sectionHint}>Shared with Messenger engine</Text>
          </View>

          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {entryCards.map((entry) => {
              const palette = getSectionPalette(entry.section);

              return (
                <Pressable
                  key={entry.id}
                  onPress={() => onOpenSection?.(entry.section)}
                  style={styles.cardWrap}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={[palette.top, palette.bottom]}
                      style={[
                        styles.card,
                        { borderColor: palette.border },
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <View style={[styles.cardGlow, { backgroundColor: palette.glow }]} />

                      <View style={styles.cardTopRow}>
                        <View style={[styles.iconWrap, { borderColor: palette.border }]}>
                          <Ionicons name={entry.icon} size={18} color={accent} />
                        </View>

                        <View style={styles.openPill}>
                          <Ionicons name="arrow-forward" size={14} color={accent} />
                          <Text style={[styles.openPillText, { color: accent }]}>
                            Open
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.cardTitle}>{entry.title}</Text>
                      <Text style={styles.cardSubtitle}>{entry.subtitle}</Text>

                      <View style={styles.cardMetaRow}>
                        <View style={styles.metaPill}>
                          <Ionicons name="radio-outline" size={12} color="#D7FFF0" />
                          <Text style={styles.metaPillText}>Stream Entry</Text>
                        </View>

                        <View style={styles.metaPill}>
                          <Ionicons name="link-outline" size={12} color="#D7FFF0" />
                          <Text style={styles.metaPillText}>Shared Engine</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  )}
                </Pressable>
              );
            })}

            <View style={{ height: 26 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(3,11,10,0.56)",
  },

  sheet: {
    minHeight: "82%",
    maxHeight: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(170,255,224,0.12)",
  },

  sheetGlow: {
    position: "absolute",
    top: -26,
    right: -26,
    width: 220,
    height: 180,
    borderRadius: 220,
  },
  sheetGlowAlt: {
    position: "absolute",
    left: -36,
    top: 180,
    width: 180,
    height: 180,
    borderRadius: 180,
  },

  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    color: "#F6FFF9",
    fontSize: 25,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(232,255,246,0.66)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },

  closeWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    overflow: "hidden",
  },
  closeButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    minHeight: 116,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLabel: {
    color: "rgba(232,255,246,0.60)",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroValue: {
    color: "#F6FFF9",
    fontSize: 22,
    fontWeight: "900",
  },
  creatorBadge: {
    minHeight: 28,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  creatorBadgeText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "900",
  },
  heroPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  heroHint: {
    marginTop: 10,
    color: "rgba(232,255,246,0.58)",
    fontSize: 11,
    lineHeight: 15,
  },

  infoPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  infoPillText: {
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    minHeight: 84,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
    justifyContent: "space-between",
  },
  summaryTitle: {
    color: "rgba(232,255,246,0.60)",
    fontSize: 11,
    fontWeight: "800",
  },
  summaryValue: {
    color: "#F6FFF9",
    fontSize: 20,
    fontWeight: "900",
  },
  summarySubtitle: {
    color: "rgba(232,255,246,0.52)",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#F6FFF9",
    fontSize: 15,
    fontWeight: "900",
  },
  sectionHint: {
    color: "rgba(232,255,246,0.56)",
    fontSize: 11,
    fontWeight: "800",
  },

  listContent: {
    paddingBottom: 4,
  },
  cardWrap: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    top: -18,
    right: -14,
    width: 120,
    height: 120,
    borderRadius: 120,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  openPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  openPillText: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },

  cardTitle: {
    color: "#F6FFF9",
    fontSize: 16,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: "rgba(232,255,246,0.62)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  cardMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  metaPill: {
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  metaPillText: {
    color: "#D7FFF0",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.988 }],
  },
});
