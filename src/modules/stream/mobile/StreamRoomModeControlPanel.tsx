import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { StreamLaunchMode } from "./streamActionRuntime";
import type { StreamBroadcastSource } from "./streamRoomRuntime";
import {
  buildStreamRoomModeEvidenceSnapshot,
  createInitialStreamRoomModeState,
  requestStreamRoomModeProviderHandoff,
  selectStreamRoomMode,
  updateStreamRoomCommentsPolicy,
  updateStreamRoomSeatPlan,
  updateStreamRoomSourceIntent,
  type StreamRoomModeBlockerCode,
  type StreamRoomModeEvidenceSnapshot,
  type StreamRoomModeState,
} from "./streamRoomModeRuntime";

type IconName = keyof typeof Ionicons.glyphMap;

type Labels = {
  readonly compactTitle: string;
  readonly compactMeta: string;
  readonly sheetTitle: string;
  readonly sheetSubtitle: string;
  readonly modes: string;
  readonly source: string;
  readonly capacity: string;
  readonly cohostSeats: string;
  readonly comments: string;
  readonly enabled: string;
  readonly disabled: string;
  readonly increase: string;
  readonly decrease: string;
  readonly providerHandoff: string;
  readonly localBlockers: string;
  readonly providerBlockers: string;
  readonly noLocalBlockers: string;
  readonly providerRequired: string;
  readonly evidence: string;
  readonly noPayments: string;
  readonly close: string;
  readonly battleTitle: string;
  readonly battleHint: string;
  readonly fakeOnAirStatus: string;
  readonly evidenceMode: string;
  readonly evidenceCategory: string;
  readonly evidenceSource: string;
  readonly evidenceBackendReady: string;
  readonly evidenceFakePaymentAllowed: string;
  readonly sources: Record<StreamBroadcastSource, string>;
  readonly modeTitles: Record<StreamLaunchMode, string>;
  readonly modeDescriptions: Record<StreamLaunchMode, string>;
  readonly blockers: Record<StreamRoomModeBlockerCode, string>;
};

const EN: Labels = {
  compactTitle: "Room modes",
  compactMeta: "ordinary / group / audio / game / video controls",
  sheetTitle: "Stream room mode control",
  sheetSubtitle: "Mode-specific room settings for direct live, group, audio, game, video, and Business Stream. No fake on-air.",
  modes: "Room modes",
  source: "Broadcast source",
  capacity: "Participant capacity",
  cohostSeats: "Co-host seats",
  comments: "Comments",
  enabled: "Enabled",
  disabled: "Disabled",
  increase: "Increase",
  decrease: "Decrease",
  providerHandoff: "Request provider handoff",
  localBlockers: "Local blockers",
  providerBlockers: "Provider blockers",
  noLocalBlockers: "No local mode blockers",
  providerRequired: "Backend / realtime / media / Admin approval required",
  evidence: "Mode evidence",
  noPayments: "No payments, gifts, or monetization in this step",
  close: "Close",
  battleTitle: "Battles",
  battleHint: "Mode contract only. No fake winner.",
  fakeOnAirStatus: "Fake on-air allowed",
  evidenceMode: "Mode",
  evidenceCategory: "Category",
  evidenceSource: "Source",
  evidenceBackendReady: "Backend union ready",
  evidenceFakePaymentAllowed: "Fake payment allowed",
  sources: {
    camera: "Camera",
    microphone: "Microphone",
    screen_share: "Screen",
    game_capture: "Game",
    video_file: "Video",
    external_rtmp: "RTMP",
  },
  modeTitles: {
    soloLive: "Ordinary live",
    groupLive: "Group live",
    audioLive: "Audio room",
    gameLive: "Game broadcast",
    cinemaLive: "Video broadcast",
    businessLive: "Business Stream",
  },
  modeDescriptions: {
    soloLive: "Direct host camera broadcast room with comments and optional battle draft.",
    groupLive: "Multi-host room with viewers, co-host seats, comments, and moderation controls.",
    audioLive: "Voice-first stage room with speakers, listeners, comments, and moderation.",
    gameLive: "Game or screen broadcast room with camera overlay, comments, and co-host support.",
    cinemaLive: "Prepared video/source broadcast room with chat and storage handoff.",
    businessLive: "Business presentation room without payments, gifts, or monetization in this phase.",
  },
  blockers: {
    camera_required_for_ordinary_live: "camera/source required for ordinary live",
    microphone_required_for_audio_live: "microphone required for audio room",
    group_capacity_required: "group capacity must be at least 2",
    cohost_seat_limit_required: "co-host seats required for this room",
    game_source_provider_required: "game capture provider required",
    video_source_provider_required: "video storage/provider required",
    screen_share_provider_required: "screen share provider required",
    rtmp_provider_required: "RTMP provider required",
    business_admin_contract_required: "Business Stream Admin contract required",
    backend_room_contract_required: "backend room contract required",
    realtime_provider_required: "realtime provider required",
    media_provider_required: "media provider required",
    admin_launch_approval_required: "Admin launch approval required",
  },
};

const RU: Labels = {
  compactTitle: "Режимы комнат",
  compactMeta: "обычный эфир / группа / аудио / игра / видео",
  sheetTitle: "Управление режимами комнаты",
  sheetSubtitle: "Настройки прямого эфира, группы, аудио, игры, видео и бизнес-трансляции. Фальшивый запуск запрещён.",
  modes: "Режимы комнат",
  source: "Источник трансляции",
  capacity: "Лимит участников",
  cohostSeats: "Места соведущих",
  comments: "Комментарии",
  enabled: "Включено",
  disabled: "Выключено",
  increase: "Увеличить",
  decrease: "Уменьшить",
  providerHandoff: "Запросить подключение сервера",
  localBlockers: "Локальные блокеры",
  providerBlockers: "Серверные блокеры",
  noLocalBlockers: "Локальных блокеров режима нет",
  providerRequired: "Нужны сервер, реальное соединение, медиа-слой и одобрение администратора",
  evidence: "Проверка режима",
  noPayments: "Без платежей, подарков и монетизации на этом шаге",
  close: "Закрыть",
  battleTitle: "Баттлы",
  battleHint: "Только подготовка режима. Фальшивого победителя нет.",
  fakeOnAirStatus: "Фальшивый эфир разрешён",
  evidenceMode: "Режим",
  evidenceCategory: "Категория",
  evidenceSource: "Источник",
  evidenceBackendReady: "Готовность к серверному объединению",
  evidenceFakePaymentAllowed: "Фальшивый платёж разрешён",
  sources: {
    camera: "Камера",
    microphone: "Микрофон",
    screen_share: "Экран",
    game_capture: "Игра",
    video_file: "Видео",
    external_rtmp: "RTMP",
  },
  modeTitles: {
    soloLive: "Обычный эфир",
    groupLive: "Групповой эфир",
    audioLive: "Аудиокомната",
    gameLive: "Игровая трансляция",
    cinemaLive: "Видеоэфир",
    businessLive: "Бизнес-трансляция",
  },
  modeDescriptions: {
    soloLive: "Прямая комната ведущего с камерой, комментариями и черновиком баттла.",
    groupLive: "Комната с несколькими ведущими, зрителями, местами соведущих и модерацией.",
    audioLive: "Голосовая сцена со спикерами, слушателями, комментариями и модерацией.",
    gameLive: "Трансляция игры или экрана с камерой поверх видео, комментариями и соведущими.",
    cinemaLive: "Комната подготовленного видео или источника с чатом и серверной передачей хранения.",
    businessLive: "Бизнес-презентация без платежей, подарков и монетизации на этом этапе.",
  },
  blockers: {
    camera_required_for_ordinary_live: "для обычного эфира нужна камера или источник",
    microphone_required_for_audio_live: "для аудиокомнаты нужен микрофон",
    group_capacity_required: "для группы нужно минимум 2 участника",
    cohost_seat_limit_required: "для этого режима нужны места соведущих",
    game_source_provider_required: "для захвата игры нужен серверный медиа-слой",
    video_source_provider_required: "для видео нужен серверный медиа-слой хранения",
    screen_share_provider_required: "для демонстрации экрана нужен серверный медиа-слой",
    rtmp_provider_required: "для RTMP нужен серверный медиа-слой",
    business_admin_contract_required: "для бизнес-трансляции нужен договор и одобрение администратора",
    backend_room_contract_required: "нужен серверный контракт комнаты",
    realtime_provider_required: "нужно реальное соединение",
    media_provider_required: "нужен медиа-слой",
    admin_launch_approval_required: "нужно одобрение администратора для запуска",
  },
};

const UZ: Labels = {
  ...EN,
  compactTitle: "Xona rejimlari",
  compactMeta: "oddiy efir / guruh / audio / o‘yin / video",
  sheetTitle: "Xona rejimlarini boshqarish",
  sheetSubtitle: "Jonli efir, guruh, audio, o‘yin, video va biznes translyatsiya sozlamalari. Soxta efirga chiqish taqiqlangan.",
  modes: "Xona rejimlari",
  source: "Translyatsiya manbasi",
  capacity: "Ishtirokchi limiti",
  cohostSeats: "Boshlovchi yordamchisi joylari",
  comments: "Izohlar",
  enabled: "Yoqilgan",
  disabled: "O‘chirilgan",
  increase: "Ko‘paytirish",
  decrease: "Kamaytirish",
  providerHandoff: "Server ulanishini so‘rash",
  localBlockers: "Mahalliy bloklovchilar",
  providerBlockers: "Server bloklovchilari",
  noLocalBlockers: "Rejim uchun mahalliy bloklovchi yo‘q",
  providerRequired: "Server, real aloqa, media qatlami va administrator tasdig‘i kerak",
  evidence: "Rejim tekshiruvi",
  noPayments: "Bu bosqichda to‘lov, sovg‘a va monetizatsiya yo‘q",
  close: "Yopish",
  battleTitle: "Bellashuvlar",
  battleHint: "Faqat rejim tayyorlanadi. Soxta g‘olib yo‘q.",
  fakeOnAirStatus: "Soxta efirga ruxsat",
  evidenceMode: "Rejim",
  evidenceCategory: "Toifa",
  evidenceSource: "Manba",
  evidenceBackendReady: "Server birlashuvi tayyorligi",
  evidenceFakePaymentAllowed: "Soxta to‘lovga ruxsat",
  sources: {
    camera: "Kamera",
    microphone: "Mikrofon",
    screen_share: "Ekran",
    game_capture: "O‘yin",
    video_file: "Video",
    external_rtmp: "RTMP",
  },
  modeTitles: {
    soloLive: "Oddiy efir",
    groupLive: "Guruh efiri",
    audioLive: "Audio xona",
    gameLive: "O‘yin translyatsiyasi",
    cinemaLive: "Video efir",
    businessLive: "Biznes translyatsiya",
  },
  modeDescriptions: {
    soloLive: "Boshlovchi kamerasi, izohlar va bellashuv qoralamasi bilan jonli xona.",
    groupLive: "Bir nechta boshlovchi, tomoshabinlar, yordamchi joylari va moderatsiya uchun xona.",
    audioLive: "Spikerlar, tinglovchilar, izohlar va moderatsiya uchun ovozli sahna.",
    gameLive: "Kamera oynasi, izohlar va yordamchi boshlovchilar bilan o‘yin yoki ekran translyatsiyasi.",
    cinemaLive: "Chat va server saqlash uzatmasi bilan tayyor video yoki manba xonasi.",
    businessLive: "Bu bosqichda to‘lov, sovg‘a va monetizatsiyasiz biznes taqdimoti.",
  },
  blockers: {
    camera_required_for_ordinary_live: "oddiy efir uchun kamera yoki manba kerak",
    microphone_required_for_audio_live: "audio xona uchun mikrofon kerak",
    group_capacity_required: "guruh uchun kamida 2 ishtirokchi kerak",
    cohost_seat_limit_required: "bu rejim uchun yordamchi boshlovchi joylari kerak",
    game_source_provider_required: "o‘yin yozib olish uchun server media qatlami kerak",
    video_source_provider_required: "video uchun server media qatlami kerak",
    screen_share_provider_required: "ekran ulashish uchun server media qatlami kerak",
    rtmp_provider_required: "RTMP uchun server media qatlami kerak",
    business_admin_contract_required: "biznes translyatsiya uchun shartnoma va administrator tasdig‘i kerak",
    backend_room_contract_required: "xona uchun server shartnomasi kerak",
    realtime_provider_required: "real aloqa kerak",
    media_provider_required: "media qatlami kerak",
    admin_launch_approval_required: "ishga tushirish uchun administrator tasdig‘i kerak",
  },
};

const ZH: Labels = {
  ...EN,
  compactTitle: "房间模式",
  compactMeta: "普通直播 / 多人 / 语音 / 游戏 / 视频",
  sheetTitle: "房间模式控制",
  sheetSubtitle: "直播、多人、语音、游戏、视频和商业直播的房间设置。禁止虚假开播。",
  modes: "房间模式",
  source: "直播来源",
  capacity: "参与人数上限",
  cohostSeats: "连麦席位",
  comments: "评论",
  enabled: "已开启",
  disabled: "已关闭",
  increase: "增加",
  decrease: "减少",
  providerHandoff: "请求服务器接入",
  localBlockers: "本地阻止项",
  providerBlockers: "服务器阻止项",
  noLocalBlockers: "没有本地模式阻止项",
  providerRequired: "需要服务器、实时连接、媒体层和管理员审批",
  evidence: "模式检查",
  noPayments: "此阶段没有支付、礼物或变现",
  close: "关闭",
  battleTitle: "对战",
  battleHint: "仅准备模式，不生成虚假胜者。",
  fakeOnAirStatus: "允许虚假开播",
  evidenceMode: "模式",
  evidenceCategory: "类别",
  evidenceSource: "来源",
  evidenceBackendReady: "服务器合并就绪",
  evidenceFakePaymentAllowed: "允许虚假支付",
  sources: {
    camera: "摄像头",
    microphone: "麦克风",
    screen_share: "屏幕",
    game_capture: "游戏",
    video_file: "视频",
    external_rtmp: "RTMP",
  },
  modeTitles: {
    soloLive: "普通直播",
    groupLive: "多人直播",
    audioLive: "语音房",
    gameLive: "游戏直播",
    cinemaLive: "视频直播",
    businessLive: "商业直播",
  },
  modeDescriptions: {
    soloLive: "主播摄像头直播房，带评论和对战草稿。",
    groupLive: "多人主播、观众、连麦席位和审核控制的房间。",
    audioLive: "面向语音的舞台房，包含发言人、听众、评论和审核。",
    gameLive: "游戏或屏幕直播房，支持摄像头浮层、评论和连麦。",
    cinemaLive: "准备好的视频或来源直播房，带聊天和服务器存储交接。",
    businessLive: "商业展示房，此阶段没有支付、礼物或变现。",
  },
  blockers: {
    camera_required_for_ordinary_live: "普通直播需要摄像头或来源",
    microphone_required_for_audio_live: "语音房需要麦克风",
    group_capacity_required: "多人房至少需要 2 名参与者",
    cohost_seat_limit_required: "此模式需要连麦席位",
    game_source_provider_required: "游戏采集需要服务器媒体层",
    video_source_provider_required: "视频需要服务器媒体层",
    screen_share_provider_required: "屏幕共享需要服务器媒体层",
    rtmp_provider_required: "RTMP 需要服务器媒体层",
    business_admin_contract_required: "商业直播需要合同和管理员审批",
    backend_room_contract_required: "需要房间服务器合同",
    realtime_provider_required: "需要实时连接",
    media_provider_required: "需要媒体层",
    admin_launch_approval_required: "开播需要管理员审批",
  },
};

const LABELS_BY_LANGUAGE: Record<string, Labels> = { en: EN, ru: RU, uz: UZ, zh: ZH, kk: RU, ky: RU, tg: RU };

const MODE_ICONS: Record<StreamLaunchMode, IconName> = {
  soloLive: "radio-outline",
  groupLive: "people-outline",
  audioLive: "mic-outline",
  gameLive: "game-controller-outline",
  cinemaLive: "film-outline",
  businessLive: "briefcase-outline",
};

const SOURCE_OPTIONS: readonly { readonly value: StreamBroadcastSource; readonly icon: IconName }[] = [
  { value: "camera", icon: "camera-outline" },
  { value: "microphone", icon: "mic-outline" },
  { value: "screen_share", icon: "phone-portrait-outline" },
  { value: "game_capture", icon: "game-controller-outline" },
  { value: "video_file", icon: "film-outline" },
  { value: "external_rtmp", icon: "cloud-upload-outline" },
];

export function StreamRoomModeControlPanel({ language, mode, onModeChange }: { readonly language?: string | null; readonly mode: StreamLaunchMode; readonly onModeChange?: (mode: StreamLaunchMode) => void }) {
  const labels = LABELS_BY_LANGUAGE[(language ?? "en").toLowerCase()] ?? EN;
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<StreamRoomModeState>(() => createInitialStreamRoomModeState({ mode }));

  const evidence = useMemo<StreamRoomModeEvidenceSnapshot>(() => buildStreamRoomModeEvidenceSnapshot(state), [state]);
  const localBlockers = evidence.localBlockers;
  const providerBlockers = evidence.providerBlockers;
  const blockerCount = localBlockers.length + providerBlockers.length;

  const selectMode = (nextMode: StreamLaunchMode) => {
    const result = selectStreamRoomMode(state, nextMode);
    setState(result.state);
    onModeChange?.(nextMode);
  };

  const updateCapacity = (delta: number) => {
    const step = state.selectedMode === "audioLive" ? 500 : 100;
    setState(updateStreamRoomSeatPlan(state, { participantCapacity: state.participantCapacity + delta * step }).state);
  };

  const updateCohostSeats = (delta: number) => {
    setState(updateStreamRoomSeatPlan(state, { cohostSeatLimit: state.cohostSeatLimit + delta }).state);
  };

  const updateSource = (source: StreamBroadcastSource) => setState(updateStreamRoomSourceIntent(state, source).state);
  const toggleComments = () => setState(updateStreamRoomCommentsPolicy(state, !state.commentsEnabled).state);
  const requestProvider = () => setState(requestStreamRoomModeProviderHandoff(state).state);

  return (
    <>
      <Pressable style={styles.compactPanel} onPress={() => setOpen(true)}>
        <View style={styles.compactIcon}><Ionicons name="layers-outline" size={18} color="#8CF2FF" /></View>
        <View style={styles.compactTextBlock}>
          <Text style={styles.compactTitle}>{labels.compactTitle}</Text>
          <Text style={styles.compactMeta} numberOfLines={1}>{labels.modeTitles[state.selectedMode]} · {state.layout}</Text>
        </View>
        <View style={styles.blockerBadge}><Text style={styles.blockerBadgeText}>{blockerCount}</Text></View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.headerRow}>
              <View style={styles.headerIcon}><Ionicons name="layers-outline" size={22} color="#8CF2FF" /></View>
              <View style={styles.headerTextBlock}>
                <Text style={styles.sheetTitle}>{labels.sheetTitle}</Text>
                <Text style={styles.sheetSubtitle}>{labels.sheetSubtitle}</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)}><Ionicons name="close" size={21} color="#FFFFFF" /></Pressable>
            </View>

            <View style={styles.safetyNotice}>
              <View style={styles.safetyDot} />
              <Text style={styles.safetyText}>{labels.noPayments} · {labels.fakeOnAirStatus}: {String(evidence.fakeOnAirAllowed)}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.modes}</Text>
                <View style={styles.chipGrid}>
                  {state.capabilities.map((capability) => {
                    const active = capability.mode === state.selectedMode;
                    return (
                      <Pressable key={capability.mode} style={[styles.modeChip, active ? styles.modeChipActive : null]} onPress={() => selectMode(capability.mode)}>
                        <Ionicons name={MODE_ICONS[capability.mode]} size={15} color={active ? "#071015" : "#8CF2FF"} />
                        <Text style={[styles.modeChipTitle, active ? styles.modeChipTitleActive : null]}>{labels.modeTitles[capability.mode]}</Text>
                        <Text style={[styles.modeChipMeta, active ? styles.modeChipMetaActive : null]} numberOfLines={2}>{labels.modeDescriptions[capability.mode]}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.source}</Text>
                <View style={styles.chipGrid}>
                  {SOURCE_OPTIONS.map((item) => {
                    const active = item.value === state.requestedSource;
                    return (
                      <Pressable key={item.value} style={[styles.sourceChip, active ? styles.sourceChipActive : null]} onPress={() => updateSource(item.value)}>
                        <Ionicons name={item.icon} size={15} color={active ? "#071015" : "#DDFBFF"} />
                        <Text style={[styles.sourceChipText, active ? styles.sourceChipTextActive : null]}>{labels.sources[item.value]}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.metricsRow}>
                <ModeCounter title={labels.capacity} value={String(state.participantCapacity)} onDecrease={() => updateCapacity(-1)} onIncrease={() => updateCapacity(1)} />
                <ModeCounter title={labels.cohostSeats} value={String(state.cohostSeatLimit)} onDecrease={() => updateCohostSeats(-1)} onIncrease={() => updateCohostSeats(1)} />
              </View>

              <View style={styles.sectionRow}>
                <View style={styles.policyCard}>
                  <Text style={styles.policyTitle}>{labels.comments}</Text>
                  <Text style={styles.policyValue}>{state.commentsEnabled ? labels.enabled : labels.disabled}</Text>
                  <Pressable style={styles.smallActionButton} onPress={toggleComments}><Ionicons name="chatbubble-ellipses-outline" size={15} color="#071015" /><Text style={styles.smallActionText}>{state.commentsEnabled ? labels.disabled : labels.enabled}</Text></Pressable>
                </View>
                <View style={styles.policyCard}>
                  <Text style={styles.policyTitle}>{labels.battleTitle}</Text>
                  <Text style={styles.policyValue}>{state.battlesEnabled ? labels.enabled : labels.disabled}</Text>
                  <Text style={styles.policyHint}>{labels.battleHint}</Text>
                </View>
              </View>

              <Pressable style={styles.providerButton} onPress={requestProvider}>
                <Ionicons name="shield-checkmark-outline" size={17} color="#F2C75B" />
                <Text style={styles.providerButtonText}>{labels.providerHandoff}</Text>
              </Pressable>

              <BlockerBox title={labels.localBlockers} empty={labels.noLocalBlockers} blockers={localBlockers} blockerLabels={labels.blockers} />
              <BlockerBox title={labels.providerBlockers} empty={labels.providerRequired} blockers={providerBlockers} blockerLabels={labels.blockers} />

              <View style={styles.evidenceBox}>
                <Text style={styles.evidenceTitle}>{labels.evidence}</Text>
                <Text style={styles.evidenceLine}>{labels.evidenceMode}: {evidence.selectedMode}</Text>
                <Text style={styles.evidenceLine}>{labels.evidenceCategory}: {evidence.category}</Text>
                <Text style={styles.evidenceLine}>{labels.evidenceSource}: {labels.sources[evidence.requestedSource]}</Text>
                <Text style={styles.evidenceLine}>{labels.evidenceBackendReady}: {String(evidence.readyForBackendUnion)}</Text>
                <Text style={styles.evidenceLine}>{labels.evidenceFakePaymentAllowed}: {String(evidence.fakePaymentAllowed)}</Text>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ModeCounter({ title, value, onDecrease, onIncrease }: { readonly title: string; readonly value: string; readonly onDecrease: () => void; readonly onIncrease: () => void }) {
  return (
    <View style={styles.counterCard}>
      <Text style={styles.counterTitle}>{title}</Text>
      <Text style={styles.counterValue}>{value}</Text>
      <View style={styles.counterActions}>
        <Pressable style={styles.counterButton} onPress={onDecrease}><Ionicons name="remove" size={16} color="#071015" /></Pressable>
        <Pressable style={styles.counterButton} onPress={onIncrease}><Ionicons name="add" size={16} color="#071015" /></Pressable>
      </View>
    </View>
  );
}

function BlockerBox({ title, empty, blockers, blockerLabels }: { readonly title: string; readonly empty: string; readonly blockers: readonly StreamRoomModeBlockerCode[]; readonly blockerLabels: Record<StreamRoomModeBlockerCode, string> }) {
  return (
    <View style={styles.blockerBox}>
      <Text style={styles.blockerTitle}>{title}</Text>
      {blockers.length === 0 ? <Text style={styles.blockerLine}>{empty}</Text> : blockers.map((blocker) => <Text key={blocker} style={styles.blockerLine}>• {blockerLabels[blocker]}</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({
  compactPanel: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 216,
    minHeight: 54,
    borderRadius: 22,
    backgroundColor: "rgba(5,12,18,0.80)",
    borderWidth: 1,
    borderColor: "rgba(140,242,255,0.22)",
    zIndex: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compactIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(140,242,255,0.10)", alignItems: "center", justifyContent: "center" },
  compactTextBlock: { flex: 1 },
  compactTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  compactMeta: { marginTop: 3, color: "#BBD7DD", fontSize: 10, fontWeight: "800" },
  blockerBadge: { minWidth: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(242,199,91,0.95)", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  blockerBadgeText: { color: "#070B10", fontSize: 12, fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.74)", justifyContent: "flex-end", padding: 12 },
  sheet: { maxHeight: "90%", borderRadius: 30, backgroundColor: "#0B1016", borderWidth: 1, borderColor: "rgba(140,242,255,0.22)", padding: 14, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 20, backgroundColor: "rgba(140,242,255,0.12)", alignItems: "center", justifyContent: "center" },
  headerTextBlock: { flex: 1 },
  sheetTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  sheetSubtitle: { marginTop: 3, color: "#91A4AD", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  safetyNotice: { minHeight: 44, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  safetyDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#8CF2FF" },
  safetyText: { flex: 1, color: "rgba(255,255,255,0.70)", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  scrollContent: { gap: 12, paddingBottom: 18 },
  section: { borderRadius: 22, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, gap: 10 },
  sectionTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modeChip: { width: "48%", minHeight: 86, borderRadius: 18, padding: 10, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", gap: 5 },
  modeChipActive: { backgroundColor: "#8CF2FF", borderColor: "#8CF2FF" },
  modeChipTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  modeChipTitleActive: { color: "#071015" },
  modeChipMeta: { color: "rgba(255,255,255,0.58)", fontSize: 9, fontWeight: "800", lineHeight: 12 },
  modeChipMetaActive: { color: "rgba(7,16,21,0.72)" },
  sourceChip: { minHeight: 38, borderRadius: 16, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  sourceChipActive: { backgroundColor: "#8CF2FF", borderColor: "#8CF2FF" },
  sourceChipText: { color: "#EAF8FB", fontSize: 11, fontWeight: "900" },
  sourceChipTextActive: { color: "#070B10" },
  metricsRow: { flexDirection: "row", gap: 10 },
  counterCard: { flex: 1, minHeight: 112, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, gap: 8 },
  counterTitle: { color: "rgba(255,255,255,0.62)", fontSize: 10, fontWeight: "800" },
  counterValue: { color: "#FFFFFF", fontSize: 24, fontWeight: "900" },
  counterActions: { flexDirection: "row", gap: 8 },
  counterButton: { width: 36, height: 34, borderRadius: 14, backgroundColor: "#8CF2FF", alignItems: "center", justifyContent: "center" },
  sectionRow: { flexDirection: "row", gap: 10 },
  policyCard: { flex: 1, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 12, gap: 7 },
  policyTitle: { color: "rgba(255,255,255,0.62)", fontSize: 10, fontWeight: "800" },
  policyValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  policyHint: { color: "rgba(255,255,255,0.54)", fontSize: 10, lineHeight: 14, fontWeight: "700" },
  smallActionButton: { minHeight: 34, borderRadius: 14, backgroundColor: "#8CF2FF", paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  smallActionText: { color: "#071015", fontSize: 10, fontWeight: "900" },
  providerButton: { minHeight: 42, borderRadius: 17, backgroundColor: "rgba(242,199,91,0.08)", borderWidth: 1, borderColor: "rgba(242,199,91,0.28)", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  providerButtonText: { color: "#F2C75B", fontSize: 12, fontWeight: "900" },
  blockerBox: { borderRadius: 18, padding: 12, backgroundColor: "rgba(255,255,255,0.045)", gap: 4 },
  blockerTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  blockerLine: { color: "rgba(255,255,255,0.64)", fontSize: 11, lineHeight: 16, fontWeight: "700" },
  evidenceBox: { borderRadius: 18, padding: 12, backgroundColor: "rgba(0,0,0,0.24)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", gap: 3 },
  evidenceTitle: { color: "#8CF2FF", fontSize: 12, fontWeight: "900" },
  evidenceLine: { color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: "700" },
});
