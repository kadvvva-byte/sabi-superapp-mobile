import React from "react";
import { StyleSheet, Text } from "react-native";

import { useI18n } from "../../../../shared/i18n";
import { getAiMobileActivityItems } from "../aiMobileApi";
import { aiMobileText } from "../aiMobileI18n";
import { AI_MOBILE_COLORS } from "../aiMobileTheme";
import {
  AiEmptyState,
  AiGlassCard,
  AiMobileScaffold,
} from "../components/AiMobileScaffold";
import { useAiMobileSnapshot } from "../useAiMobileSnapshot";

export default function AiMobileActivityScreen({ kind }: { kind: "history" | "tasks" }) {
  const { language } = useI18n();
  const { snapshot, isLoading, refresh } = useAiMobileSnapshot();
  const items = snapshot ? getAiMobileActivityItems(snapshot, kind) : [];

  const title =
    kind === "history"
      ? aiMobileText(language, "activity.historyTitle")
      : aiMobileText(language, "activity.tasksTitle");
  const subtitle =
    kind === "history"
      ? aiMobileText(language, "activity.historySubtitle")
      : aiMobileText(language, "activity.tasksSubtitle");

  return (
    <AiMobileScaffold title={title} subtitle={subtitle} onRefresh={refresh} isRefreshing={isLoading}>
      {items.length === 0 ? (
        <AiEmptyState
          title={aiMobileText(language, "activity.emptyTitle")}
          text={aiMobileText(language, "activity.emptyText")}
        />
      ) : (
        items.map((item) => (
          <AiGlassCard key={item.id}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
            {item.meta || item.status ? (
              <Text style={styles.itemMeta}>{[item.status, item.meta].filter(Boolean).join(" · ")}</Text>
            ) : null}
          </AiGlassCard>
        ))
      )}
    </AiMobileScaffold>
  );
}

const styles = StyleSheet.create({
  itemTitle: { color: AI_MOBILE_COLORS.text, fontSize: 16, fontWeight: "900", marginBottom: 6 },
  itemDescription: { color: AI_MOBILE_COLORS.softText, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  itemMeta: { color: AI_MOBILE_COLORS.muted, fontSize: 11, fontWeight: "900", marginTop: 10 },
});
