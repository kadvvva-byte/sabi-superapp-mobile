import type { StreamRoomRuntimeState } from "./streamRoomRuntime";
import type { StreamRoomStageRuntimeState } from "./streamRoomStageRuntime";
import type { Stream113HViewerExperienceUiuxEvidence } from "./stream113hViewerExperienceUiuxRuntime";

export type Stream113IEmptyErrorStateId =
  | "empty_chat"
  | "empty_audience"
  | "empty_cohost"
  | "provider_blocked"
  | "share_cancelled"
  | "loading_return";

export type Stream113IEmptyErrorStateStatus = "premium_empty" | "needs_polish";

export type Stream113IEmptyErrorState = {
  readonly id: Stream113IEmptyErrorStateId;
  readonly title: string;
  readonly description: string;
  readonly status: Stream113IEmptyErrorStateStatus;
};

export type Stream113IEmptyErrorStatesUiuxState = {
  readonly version: "STREAM-113I";
  readonly selectedStateId: Stream113IEmptyErrorStateId;
  readonly polishedStateIds: readonly Stream113IEmptyErrorStateId[];
  readonly lastAction: string;
  readonly shareCancelledHandledLocal: boolean;
  readonly loadingReturnHandledLocal: boolean;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

export type Stream113IEmptyErrorStatesUiuxEvidence = {
  readonly version: "STREAM-113I";
  readonly selectedStateId: Stream113IEmptyErrorStateId;
  readonly premiumScore: number;
  readonly readyStates: number;
  readonly totalStates: number;
  readonly states: readonly Stream113IEmptyErrorState[];
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly activeTitle: string;
  readonly activeNarrative: string;
  readonly phoneStatus: string;
  readonly emptySurfaceTitle: string;
  readonly emptySurfaceSubtitle: string;
  readonly emptyChatCopy: string;
  readonly emptyPeopleCopy: string;
  readonly providerBoundaryCopy: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly emptyErrorUxReady: boolean;
  readonly cleanProductUiReady: boolean;
  readonly providerReady: false;
  readonly fakeLiveAllowed: false;
  readonly fakeRealtimeAllowed: false;
  readonly fakeProviderAllowed: false;
  readonly fakePaymentAllowed: false;
  readonly cinemaMixAllowed: false;
};

const STATE_ORDER: readonly Stream113IEmptyErrorStateId[] = [
  "empty_chat",
  "empty_audience",
  "empty_cohost",
  "provider_blocked",
  "share_cancelled",
  "loading_return",
];

const STATE_TITLES: Record<Stream113IEmptyErrorStateId, string> = {
  empty_chat: "Пустой чат",
  empty_audience: "Нет зрителей",
  empty_cohost: "Нет соведущего",
  provider_blocked: "Провайдер не готов",
  share_cancelled: "Поделиться отменено",
  loading_return: "Возврат / загрузка",
};

const STATE_DESCRIPTIONS: Record<Stream113IEmptyErrorStateId, string> = {
  empty_chat: "Если сообщений нет, зритель видит мягкую подсказку снизу, а не пустую мёртвую область.",
  empty_audience: "Если зрителей пока нет, экран показывает спокойное премиальное пустое состояние без служебных счётчиков.",
  empty_cohost: "Если соведущий не выбран, ведущий видит понятное следующее действие вместо сломанной сцены.",
  provider_blocked: "Граница реального времени/провайдера объясняется честно и красиво, без фейкового эфира и фейкового успеха.",
  share_cancelled: "Если системное окно «Поделиться» закрыли или отменили, пользователь возвращается в эфир без ошибки и паники.",
  loading_return: "После выхода из панели/загрузки пользователь возвращается в тот же контекст эфира без потери экрана.",
};

export function createInitialStream113IEmptyErrorStatesUiuxState(): Stream113IEmptyErrorStatesUiuxState {
  return {
    version: "STREAM-113I",
    selectedStateId: "empty_chat",
    polishedStateIds: ["provider_blocked"],
    lastAction: "113I начал приводить пустые, ошибочные и загрузочные состояния комнаты эфира к премиальному телефонному UX.",
    shareCancelledHandledLocal: false,
    loadingReturnHandledLocal: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}

export function selectStream113IEmptyErrorState(
  state: Stream113IEmptyErrorStatesUiuxState,
  selectedStateId: Stream113IEmptyErrorStateId,
): Stream113IEmptyErrorStatesUiuxState {
  return { ...state, selectedStateId, lastAction: `Открыт 113I state: ${STATE_TITLES[selectedStateId]}.` };
}

export function markStream113IEmptyErrorStatePolished(
  state: Stream113IEmptyErrorStatesUiuxState,
  stateId: Stream113IEmptyErrorStateId,
  action: string,
): Stream113IEmptyErrorStatesUiuxState {
  const polishedStateIds = state.polishedStateIds.includes(stateId)
    ? state.polishedStateIds
    : [...state.polishedStateIds, stateId];
  return {
    ...state,
    selectedStateId: stateId,
    polishedStateIds,
    lastAction: action,
    shareCancelledHandledLocal: state.shareCancelledHandledLocal || stateId === "share_cancelled",
    loadingReturnHandledLocal: state.loadingReturnHandledLocal || stateId === "loading_return",
  };
}

export function markStream113IEmptyErrorStatesAllPolished(
  state: Stream113IEmptyErrorStatesUiuxState,
  action: string,
): Stream113IEmptyErrorStatesUiuxState {
  return {
    ...state,
    selectedStateId: "loading_return",
    polishedStateIds: STATE_ORDER,
    lastAction: action,
    shareCancelledHandledLocal: true,
    loadingReturnHandledLocal: true,
  };
}

function polished(state: Stream113IEmptyErrorStatesUiuxState, stateId: Stream113IEmptyErrorStateId): boolean {
  return state.polishedStateIds.includes(stateId);
}

function stateItem(
  id: Stream113IEmptyErrorStateId,
  runtime: Stream113IEmptyErrorStatesUiuxState,
  ready: boolean,
): Stream113IEmptyErrorState {
  return {
    id,
    title: STATE_TITLES[id],
    description: STATE_DESCRIPTIONS[id],
    status: ready || polished(runtime, id) ? "premium_empty" : "needs_polish",
  };
}

function activeNarrative(
  id: Stream113IEmptyErrorStateId,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
): string {
  const viewers = room.participants.filter((participant) => participant.role === "viewer" && !participant.blocked).length;
  const cohosts = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  if (id === "empty_chat") return room.comments.length > 0 ? "Чат уже активен; пустое состояние остаётся готовым для первого входа в пустой эфир." : "Пустой чат должен приглашать к первому сообщению и не выглядеть как ошибка.";
  if (id === "empty_audience") return viewers > 0 ? `${viewers} viewers есть; пустой audience-state остаётся готовым для нового эфира.` : "Когда зрителей нет, показываем спокойную подсказку для ведущего и не ломаем видео-поле.";
  if (id === "empty_cohost") return cohosts > 0 ? `${cohosts} co-host на сцене; empty co-host подсказка сохраняется для чистого старта.` : "Пустое состояние соведущего должно объяснять, как пригласить гостя, без технических таблиц.";
  if (id === "provider_blocked") return "Провайдер/реальное время не готовы — показываем честную премиальную границу, а не фейковый эфир или фейковый успех.";
  if (id === "share_cancelled") return "Отмена системного «Поделиться» возвращает пользователя в эфир без красной ошибки и без сброса контекста.";
  return room.status === "provider_handoff_blocked" || stage.status === "broadcast_handoff_blocked" ? "Возврат из загрузки оставляет комнату в честном заблокированном состоянии." : "Любая загрузка/возврат должны сохранять выбранный контекст эфира и навигацию одной рукой.";
}

export function buildStream113IEmptyErrorStatesUiuxEvidence(
  state: Stream113IEmptyErrorStatesUiuxState,
  room: StreamRoomRuntimeState,
  stage: StreamRoomStageRuntimeState,
  viewer: Stream113HViewerExperienceUiuxEvidence,
): Stream113IEmptyErrorStatesUiuxEvidence {
  const viewers = room.participants.filter((participant) => participant.role === "viewer" && !participant.blocked).length;
  const cohosts = room.participants.filter((participant) => participant.role === "cohost" && !participant.blocked).length;
  const safeBoundaryReady = viewer.fakeLiveAllowed === false
    && viewer.fakeRealtimeAllowed === false
    && viewer.fakeProviderAllowed === false
    && viewer.fakePaymentAllowed === false
    && state.fakeLiveAllowed === false
    && state.fakeRealtimeAllowed === false
    && state.fakeProviderAllowed === false
    && state.fakePaymentAllowed === false
    && state.cinemaMixAllowed === false;

  const states: readonly Stream113IEmptyErrorState[] = [
    stateItem("empty_chat", state, room.comments.length === 0 || polished(state, "empty_chat")),
    stateItem("empty_audience", state, viewers === 0 || polished(state, "empty_audience")),
    stateItem("empty_cohost", state, cohosts === 0 || polished(state, "empty_cohost")),
    stateItem("provider_blocked", state, safeBoundaryReady),
    stateItem("share_cancelled", state, state.shareCancelledHandledLocal),
    stateItem("loading_return", state, state.loadingReturnHandledLocal),
  ];

  const readyStates = states.filter((item) => item.status === "premium_empty").length;
  const totalStates = states.length;
  const premiumScore = Math.round((readyStates / totalStates) * 100);
  const next = states.find((item) => item.status === "needs_polish");
  const active = states.find((item) => item.id === state.selectedStateId) ?? states[0];

  return {
    version: "STREAM-113I",
    selectedStateId: state.selectedStateId,
    premiumScore,
    readyStates,
    totalStates,
    states,
    heroTitle: "Пустые / ошибочные / загрузочные состояния как премиум UX",
    heroSubtitle: "Пустой чат, отсутствие зрителей/соведущего, граница провайдера, отмена «Поделиться» и возврат после загрузки должны выглядеть спокойно и дорого.",
    activeTitle: active.title,
    activeNarrative: activeNarrative(active.id, room, stage),
    phoneStatus: `${room.status} · empty-safe · ${viewer.premiumScore}% viewer UX`,
    emptySurfaceTitle: room.title || "Эфир Sabi",
    emptySurfaceSubtitle: room.comments.length > 0 ? "Чат активен, но пустое состояние готово для нового эфира" : "Чат пока пустой — начните разговор без визуального мусора",
    emptyChatCopy: room.comments.length > 0 ? "Последние сообщения остаются снизу без перекрытия видео." : "Будьте первым, кто напишет в эфир — поле чата готово.",
    emptyPeopleCopy: viewers > 0 ? `${viewers} зрителей · audience rail готов.` : "Пока никого нет. Экран остаётся чистым и понятным для ведущего.",
    providerBoundaryCopy: safeBoundaryReady ? "Провайдер/реальное время честно заблокированы: фейковый эфир, фейковый провайдер и платежи запрещены." : "Нужно вернуть честную границу провайдера без фейкового успеха.",
    primaryAction: next ? `${next.title}: ${next.description}` : "113I пустые/ошибочные/загрузочные состояния UI локально закрыты. Дальше можно делать финальную проверку визуальной согласованности.",
    secondaryAction: state.lastAction,
    emptyErrorUxReady: readyStates >= 5 && viewer.viewerExperienceReady,
    cleanProductUiReady: readyStates === totalStates && viewer.cleanProductUiReady,
    providerReady: false,
    fakeLiveAllowed: false,
    fakeRealtimeAllowed: false,
    fakeProviderAllowed: false,
    fakePaymentAllowed: false,
    cinemaMixAllowed: false,
  };
}
