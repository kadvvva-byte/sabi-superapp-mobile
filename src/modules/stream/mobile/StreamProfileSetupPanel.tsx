import React, { useEffect, useMemo, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  acknowledgeStreamProfileSafetyPolicy,
  canEditStreamBusinessNameLocal,
  canPrepareStreamBusinessIdentityLocal,
  canQueueStreamProfileSetupLocalEvent,
  canRequestStreamOfficialStatusLocal,
  canReviewStreamProfileBusinessHandoffLocal,
  createInitialStreamProfileSetupState,
  markStreamProfileAvatarIntentReady,
  markStreamProfileCoverIntentReady,
  prepareStreamBusinessIdentityLocal,
  queueStreamProfileSetupLocalEvent,
  requestStreamOfficialStatusLocal,
  requestStreamProfileProviderAdminBlocked,
  reviewStreamProfileBusinessHandoff,
  reviewStreamProfileShortsHandoff,
  runStreamProfileSetupReadinessCheck,
  selectStreamProfileSetupCheck,
  setStreamProfileSetupType,
  type StreamProfileSetupType,
  updateStreamProfileSetupText,
} from "./streamProfileSetupRuntime";

type IconName = keyof typeof Ionicons.glyphMap;

const profileTypes: readonly { readonly id: StreamProfileSetupType; readonly label: string; readonly icon: IconName }[] = [
  { id: "creator", label: "Автор", icon: "person-circle-outline" },
  { id: "official_streamer", label: "Официальный", icon: "shield-checkmark-outline" },
  { id: "business_streamer", label: "Бизнес", icon: "briefcase-outline" },
];

function ProfileAction({
  icon,
  label,
  onPress,
  locked = false,
  selected = false,
  disabled = false,
}: {
  readonly icon: IconName;
  readonly label: string;
  readonly onPress: () => void;
  readonly locked?: boolean;
  readonly selected?: boolean;
  readonly disabled?: boolean;
}) {
  const blocked = locked || disabled;

  return (
    <Pressable
      style={[styles.action, selected ? styles.actionSelected : null, blocked ? styles.actionLocked : null]}
      hitSlop={7}
      accessibilityRole="button"
      onPress={() => {
        if (blocked) {
          return;
        }
        onPress();
      }}
      disabled={blocked}
      accessibilityState={{ selected, disabled: blocked }}
      accessibilityLabel={`${label}${selected ? " · локальный черновик" : ""}${blocked ? " · закрыто" : ""}`}
    >
      <Ionicons name={blocked ? "lock-closed-outline" : icon} size={14} color={selected ? "#0D0A12" : blocked ? "#8D8796" : "#F2C75B"} />
      <Text style={[styles.actionText, selected ? styles.actionTextSelected : null, blocked ? styles.actionTextLocked : null]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export function StreamProfileSetupPanel() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState(createInitialStreamProfileSetupState);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const selectedCheck = useMemo(
    () => state.checks.find((check) => check.id === state.selectedCheckId) ?? state.checks[0],
    [state.checks, state.selectedCheckId],
  );

  const blockerText = `${state.evidence.localBlockers.length} локально · ${state.evidence.providerBlockers.length} провайдер`;
  const profileSetupEventQueued = state.events.some((event) => event.kind === "profile_setup_check_run_local");
  const localProfileSetupReady = state.evidence.localBlockers.length === 0;
  const canQueueProfileSetupEvent = canQueueStreamProfileSetupLocalEvent(state, "profile_setup_check_run_local");
  const officialRequestAllowed = canRequestStreamOfficialStatusLocal(state);
  const businessIdentityAllowed = canPrepareStreamBusinessIdentityLocal(state);
  const businessNameEditable = canEditStreamBusinessNameLocal(state);
  const businessHandoffAllowed = canReviewStreamProfileBusinessHandoffLocal(state);
  const queueProfileEventLabel = profileSetupEventQueued
    ? "Событие профиля поставлено"
    : localProfileSetupReady
      ? "Поставить событие профиля"
      : "Исправь локальные блокировки";
  const queueProfileEventSummary = profileSetupEventQueued
    ? "Локальное событие поставлено · сервер и провайдер не вызывались"
    : localProfileSetupReady
      ? "Локальные проверки готовы · очередь только локальная"
      : `${state.evidence.localBlockers.length} локальных блокировок перед очередью`;
  const readinessPercent = Math.max(0, Math.min(100, state.evidence.profileCompletenessPercent));
  const profileHeroTitle = state.displayName.trim() || "Имя автора ещё не указано";
  const profileHeroHandle = state.handle.trim() || "@username";

  return (
    <KeyboardAvoidingView
      style={styles.keyboardFrame}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? Math.max(24, insets.top) : 0}
    >
    <View
      style={[styles.panel, keyboardOpen ? styles.panelKeyboardOpen : null]}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons name="person-circle-outline" size={18} color="#F2C75B" />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title} numberOfLines={1}>Настройка профиля стримера</Text>
          <Text style={styles.meta} numberOfLines={1}>{state.status} · {state.evidence.profileCompletenessPercent}% · {blockerText}</Text>
        </View>
        <Pressable style={styles.drawerButton} onPress={() => setDetailsOpen((open) => !open)} hitSlop={8} accessibilityRole="button">
          <Ionicons name={detailsOpen ? "chevron-up" : "chevron-down"} size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      {keyboardOpen ? null : (
        <>
          <View style={styles.readinessCard}>
            <View style={styles.profilePreviewAvatar}>
              <Ionicons name="person-outline" size={20} color="#F2C75B" />
            </View>
            <View style={styles.profilePreviewCopy}>
              <Text style={styles.profilePreviewTitle} numberOfLines={1}>{profileHeroTitle}</Text>
              <Text style={styles.profilePreviewMeta} numberOfLines={1}>{profileHeroHandle} · {state.category || "категория не выбрана"}</Text>
            </View>
            <View style={[styles.readinessBadge, localProfileSetupReady ? styles.readinessBadgeReady : null]}>
              <Text style={[styles.readinessBadgeText, localProfileSetupReady ? styles.readinessBadgeTextReady : null]}>{readinessPercent}%</Text>
            </View>
          </View>

          <View style={styles.readinessTrack} accessibilityLabel={`Готовность профиля ${readinessPercent}%`}>
            <View style={[styles.readinessFill, { width: `${readinessPercent}%` }]} />
          </View>
        </>
      )}

      <ScrollView
        style={[styles.bodyScroll, keyboardOpen ? styles.bodyScrollKeyboardOpen : null]}
        contentContainerStyle={[styles.bodyContent, keyboardOpen ? styles.bodyContentKeyboardOpen : null, { paddingBottom: Math.max(12, insets.bottom + (keyboardOpen ? 28 : 8)) }]}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeRowContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          overScrollMode="never"
        >
          {profileTypes.map((type) => (
            <Pressable
              key={type.id}
              style={[styles.typeChip, state.profileType === type.id ? styles.typeChipActive : null]}
              onPress={() => setState((current) => setStreamProfileSetupType(current, type.id))}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityState={{ selected: state.profileType === type.id }}
            >
              <Ionicons name={type.icon} size={13} color={state.profileType === type.id ? "#0D0A12" : "#F2C75B"} />
              <Text style={[styles.typeText, state.profileType === type.id ? styles.typeTextActive : null]} numberOfLines={1}>{type.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.inputGrid}>
          <TextInput
            value={state.displayName}
            onChangeText={(value) => setState((current) => updateStreamProfileSetupText(current, "displayName", value))}
            placeholder="Отображаемое имя"
            placeholderTextColor="#8D8796"
            style={styles.input}
            returnKeyType="next"
            maxLength={48}
          />
          <TextInput
            value={state.handle}
            onChangeText={(value) => setState((current) => updateStreamProfileSetupText(current, "handle", value))}
            placeholder="@имя"
            placeholderTextColor="#8D8796"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            returnKeyType="next"
            maxLength={32}
          />
        </View>

        <TextInput
          value={state.bio}
          onChangeText={(value) => setState((current) => updateStreamProfileSetupText(current, "bio", value))}
          placeholder="Описание автора / обещание канала"
          placeholderTextColor="#8D8796"
          style={styles.bioInput}
          multiline
          textAlignVertical="top"
          returnKeyType="done"
          maxLength={180}
        />

      {detailsOpen ? (
        <View style={styles.detailsBlock}>
          <View style={styles.inputGrid}>
            <TextInput value={state.category} onChangeText={(value) => setState((current) => updateStreamProfileSetupText(current, "category", value))} placeholder="Категория" placeholderTextColor="#8D8796" style={styles.input} returnKeyType="next" maxLength={40} />
            <TextInput
              value={businessNameEditable ? state.businessName : ""}
              onChangeText={(value) => setState((current) => updateStreamProfileSetupText(current, "businessName", value))}
              placeholder={businessNameEditable ? "Название бизнеса" : "Бизнес закрыт"}
              placeholderTextColor="#8D8796"
              style={[styles.input, !businessNameEditable ? styles.inputLocked : null]}
              editable={businessNameEditable}
              autoCorrect={false}
              returnKeyType="done"
              maxLength={56}
              accessibilityState={{ disabled: !businessNameEditable }}
            />
          </View>

          <View style={[styles.checkCard, localProfileSetupReady ? styles.checkCardReady : null]}>
            <Text style={styles.checkTitle} numberOfLines={1}>{selectedCheck.title}</Text>
            <Text style={styles.checkMeta} numberOfLines={2}>{selectedCheck.status} · {selectedCheck.blockers.join(", ") || "локально готово"}</Text>
            <Text style={styles.checkQueueMeta} numberOfLines={1}>{queueProfileEventSummary}</Text>
          </View>

          <View style={styles.actionWrap}>
            <ProfileAction icon="image-outline" label="Аватар выбран" selected={state.avatarIntentReadyLocal} onPress={() => setState(markStreamProfileAvatarIntentReady)} />
            <ProfileAction icon="images-outline" label="Обложка выбрана" selected={state.coverIntentReadyLocal} onPress={() => setState(markStreamProfileCoverIntentReady)} />
            <ProfileAction
              icon="shield-checkmark-outline"
              label={officialRequestAllowed ? "Заявка на официальный статус" : "Официальный статус закрыт"}
              selected={state.officialStatusRequestedLocal}
              disabled={!officialRequestAllowed}
              onPress={() => setState((current) => {
                if (!canRequestStreamOfficialStatusLocal(current)) {
                  return current;
                }

                return requestStreamOfficialStatusLocal(current);
              })}
            />
            <ProfileAction
              icon="briefcase-outline"
              label={businessIdentityAllowed ? "Идентичность бизнеса" : "Бизнес закрыт"}
              selected={state.businessIdentityPreparedLocal}
              disabled={!businessIdentityAllowed}
              onPress={() => setState((current) => {
                if (!canPrepareStreamBusinessIdentityLocal(current)) {
                  return current;
                }

                return prepareStreamBusinessIdentityLocal(current);
              })}
            />
            <ProfileAction icon="checkmark-done-outline" label="Правила безопасности" selected={state.safetyPolicyAcknowledgedLocal} onPress={() => setState(acknowledgeStreamProfileSafetyPolicy)} />
            <ProfileAction icon="film-outline" label="Передача шортов" selected={state.shortsHandoffReviewedLocal} onPress={() => setState(reviewStreamProfileShortsHandoff)} />
            <ProfileAction
              icon="storefront-outline"
              label={businessHandoffAllowed ? "Передача бизнеса" : "Передача бизнеса закрыта"}
              selected={state.businessStreamHandoffReviewedLocal}
              disabled={!businessHandoffAllowed}
              onPress={() => setState((current) => {
                if (!canReviewStreamProfileBusinessHandoffLocal(current)) {
                  return current;
                }

                return reviewStreamProfileBusinessHandoff(current);
              })}
            />
            <ProfileAction icon="swap-horizontal-outline" label="Выбрать проверку" onPress={() => setState(selectStreamProfileSetupCheck)} />
            <ProfileAction icon="analytics-outline" label="Запустить проверку профиля" onPress={() => setState(runStreamProfileSetupReadinessCheck)} />
            <ProfileAction
              icon="git-branch-outline"
              label={queueProfileEventLabel}
              selected={profileSetupEventQueued}
              disabled={!canQueueProfileSetupEvent}
              onPress={() => setState((current) => {
                if (!canQueueStreamProfileSetupLocalEvent(current, "profile_setup_check_run_local")) {
                  return current;
                }

                return queueStreamProfileSetupLocalEvent(current, "profile_setup_check_run_local");
              })}
            />
            <ProfileAction icon="cloud-offline-outline" label="Провайдер и админка закрыты" locked onPress={() => setState(requestStreamProfileProviderAdminBlocked)} />
          </View>
        </View>
      ) : null}

      </ScrollView>

      {keyboardOpen ? null : (
        <View style={styles.footerRow}>
          <Text style={styles.footerText} numberOfLines={2}>Без фейковой публикации профиля · без фейкового официального бейджа · монетизация пока закрыта</Text>
        </View>
      )}
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardFrame: {
    width: "100%",
  },
  panel: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.22)",
    backgroundColor: "rgba(14,12,20,0.92)",
    padding: 12,
    gap: 10,
    maxHeight: 560,
    overflow: "hidden",
  },
  panelKeyboardOpen: {
    maxHeight: 430,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,199,91,0.12)",
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  meta: {
    marginTop: 2,
    color: "#B9B1C8",
    fontSize: 11,
    fontWeight: "700",
  },
  drawerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  readinessCard: {
    minHeight: 62,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.20)",
    backgroundColor: "rgba(242,199,91,0.08)",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profilePreviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,199,91,0.12)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.20)",
  },
  profilePreviewCopy: {
    flex: 1,
    minWidth: 0,
  },
  profilePreviewTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  profilePreviewMeta: {
    marginTop: 3,
    color: "#B9B1C8",
    fontSize: 10,
    fontWeight: "800",
  },
  readinessBadge: {
    minWidth: 44,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  readinessBadgeReady: {
    backgroundColor: "#F2C75B",
    borderColor: "#F2C75B",
  },
  readinessBadgeText: {
    color: "#F2C75B",
    fontSize: 11,
    fontWeight: "900",
  },
  readinessBadgeTextReady: {
    color: "#0D0A12",
  },
  readinessTrack: {
    height: 5,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  readinessFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#F2C75B",
  },
  bodyScroll: {
    maxHeight: 380,
  },
  bodyScrollKeyboardOpen: {
    maxHeight: 340,
  },
  bodyContent: {
    gap: 10,
    paddingBottom: 4,
  },
  bodyContentKeyboardOpen: {
    gap: 8,
  },
  typeRowContent: {
    gap: 8,
    paddingRight: 4,
  },
  typeChip: {
    minWidth: 116,
    minHeight: 34,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  typeChipActive: {
    backgroundColor: "#F2C75B",
    borderColor: "#F2C75B",
  },
  typeText: {
    color: "#E9E3F2",
    fontSize: 10,
    fontWeight: "800",
  },
  typeTextActive: {
    color: "#0D0A12",
  },
  inputGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 138,
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 10,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    fontSize: 12,
    fontWeight: "700",
  },
  inputLocked: {
    color: "#8D8796",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  bioInput: {
    minHeight: 58,
    maxHeight: 92,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsBlock: {
    gap: 10,
  },
  checkCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 10,
  },
  checkCardReady: {
    borderColor: "rgba(242,199,91,0.52)",
    backgroundColor: "rgba(242,199,91,0.10)",
  },
  checkTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  checkMeta: {
    marginTop: 3,
    color: "#B9B1C8",
    fontSize: 10,
    fontWeight: "700",
  },
  checkQueueMeta: {
    marginTop: 6,
    color: "#F2C75B",
    fontSize: 10,
    fontWeight: "800",
  },
  actionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  action: {
    minHeight: 34,
    borderRadius: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    backgroundColor: "rgba(242,199,91,0.10)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.20)",
  },
  actionSelected: {
    backgroundColor: "#F2C75B",
    borderColor: "#F2C75B",
  },
  actionLocked: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  actionText: {
    color: "#F2C75B",
    fontSize: 10,
    fontWeight: "800",
  },
  actionTextSelected: {
    color: "#0D0A12",
  },
  actionTextLocked: {
    color: "#8D8796",
  },
  footerRow: {
    minHeight: 34,
    borderRadius: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  footerText: {
    color: "#B9B1C8",
    fontSize: 10,
    fontWeight: "800",
  },
});
