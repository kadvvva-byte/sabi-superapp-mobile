import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  buildStreamRegistrationEvidenceSnapshot,
  createInitialStreamRegistrationState,
  markStreamRegistrationLocalReady,
  requestStreamRegistrationAdminHandoff,
  updateStreamRegistrationDraft,
  type StreamRegistrationBlockerCode,
  type StreamRegistrationDocumentIntent,
  type StreamRegistrationKind,
  type StreamRegistrationMonetizationIntent,
  type StreamRegistrationRuntimeState,
} from "./streamOfficialStreamerRegistrationRuntime";

type Labels = {
  readonly title: string;
  readonly subtitle: string;
  readonly draftOnly: string;
  readonly kind: string;
  readonly official: string;
  readonly business: string;
  readonly ordinary: string;
  readonly displayName: string;
  readonly legalName: string;
  readonly contact: string;
  readonly country: string;
  readonly category: string;
  readonly bio: string;
  readonly docs: string;
  readonly noDocs: string;
  readonly identityDocs: string;
  readonly businessDocs: string;
  readonly identityAndBusinessDocs: string;
  readonly monetization: string;
  readonly monetizationOff: string;
  readonly monetizationOn: string;
  readonly age: string;
  readonly rules: string;
  readonly policy: string;
  readonly localReady: string;
  readonly adminSubmit: string;
  readonly localReadyOk: string;
  readonly blocked: string;
  readonly adminBlocked: string;
  readonly evidence: string;
  readonly fakeBlocked: string;
  readonly blockers: string;
  readonly noLocalBlockers: string;
  readonly phoneQaTitle: string;
  readonly phoneQaDraft: string;
  readonly phoneQaDocs: string;
  readonly phoneQaAdmin: string;
  readonly phoneQaWallet: string;
  readonly finalGuardTitle: string;
  readonly finalGuardText: string;
  readonly placeholders: {
    readonly displayName: string;
    readonly legalName: string;
    readonly contact: string;
    readonly country: string;
    readonly category: string;
    readonly bio: string;
  };
};

const RU: Labels = {
  title: "Заявка официального стримера",
  subtitle: "Локальный черновик для будущей проверки админкой и серверной частью. Никакого фейкового бейджа или монетизации.",
  draftOnly: "Черновик",
  kind: "Тип заявки",
  official: "Официальный стример",
  business: "Бизнес-стример",
  ordinary: "Автор",
  displayName: "Имя в Stream",
  legalName: "Юридическое имя",
  contact: "Телефон или email",
  country: "Страна",
  category: "Основная категория",
  bio: "Описание / опыт",
  docs: "Документы",
  noDocs: "Нет документов",
  identityDocs: "Личность готова",
  businessDocs: "Бизнес-документы готовы",
  identityAndBusinessDocs: "Личность + бизнес-документы",
  monetization: "Монетизация",
  monetizationOff: "Не запрашивать",
  monetizationOn: "Запросить позже",
  age: "Возраст подтверждён",
  rules: "Правила Sabi Stream приняты",
  policy: "Политика контента принята",
  localReady: "Проверить локально",
  adminSubmit: "Отправить в админку",
  localReadyOk: "Локально готово к будущей передаче в админку",
  blocked: "Черновик не готов",
  adminBlocked: "Админка, сервер и провайдер ещё не подключены — отправка заблокирована",
  evidence: "Снимок проверки",
  fakeBlocked: "Фейковая отправка, одобрение, официальный бейдж и монетизация заблокированы",
  blockers: "Блокеры",
  noLocalBlockers: "Локальных блокеров нет",
  phoneQaTitle: "UI-проверка",
  phoneQaDraft: "Профиль",
  phoneQaDocs: "Документы",
  phoneQaAdmin: "Админка позже",
  phoneQaWallet: "Wallet позже",
  finalGuardTitle: "Финальный UI-guard",
  finalGuardText: "Форма готовит только локальный черновик. Одобрение, официальный бейдж и монетизация появятся только после backend/Admin/Wallet-подключения.",
  placeholders: {
    displayName: "Например: Sabi автор",
    legalName: "ФИО как в документе",
    contact: "+998... или email",
    country: "Узбекистан",
    category: "Музыка, игры, обучение...",
    bio: "Кратко опиши опыт, формат эфиров и тематику",
  },
};

const EN: Labels = {
  title: "Official streamer application",
  subtitle: "Local draft for future Admin/backend review. No fake badge or monetization.",
  draftOnly: "Draft only",
  kind: "Application type",
  official: "Official streamer",
  business: "Business streamer",
  ordinary: "Creator",
  displayName: "Stream name",
  legalName: "Legal name",
  contact: "Phone or email",
  country: "Country",
  category: "Main category",
  bio: "Description / experience",
  docs: "Documents",
  noDocs: "No documents",
  identityDocs: "Identity ready",
  businessDocs: "Business docs ready",
  identityAndBusinessDocs: "Identity + business docs",
  monetization: "Monetization",
  monetizationOff: "Do not request",
  monetizationOn: "Request later",
  age: "Age confirmed",
  rules: "Sabi Stream rules accepted",
  policy: "Content policy accepted",
  localReady: "Check local draft",
  adminSubmit: "Submit to Admin",
  localReadyOk: "Locally ready for future Admin handoff",
  blocked: "Draft is not ready",
  adminBlocked: "Admin/backend/provider are not connected — submit is blocked",
  evidence: "Evidence snapshot",
  fakeBlocked: "Fake submit / approval / official badge / monetization are blocked",
  blockers: "Blockers",
  noLocalBlockers: "No local blockers",
  phoneQaTitle: "UI check",
  phoneQaDraft: "Profile",
  phoneQaDocs: "Documents",
  phoneQaAdmin: "Admin later",
  phoneQaWallet: "Wallet later",
  finalGuardTitle: "Final UI guard",
  finalGuardText: "This form prepares a local draft only. Approval, official badge, and monetization require backend/Admin/Wallet integration later.",
  placeholders: {
    displayName: "Example: Sabi Creator",
    legalName: "Full name as in document",
    contact: "+998... or email",
    country: "Uzbekistan",
    category: "Music, games, education...",
    bio: "Briefly describe experience, live format, and topics",
  },
};

const UZ: Labels = {
  ...EN,
  title: "Rasmiy strimer arizasi",
  subtitle: "Kelajakdagi Admin/backend tekshiruvi uchun lokal qoralama. Soxta belgi yoki monetizatsiya yo‘q.",
  kind: "Ariza turi",
  official: "Rasmiy strimer",
  business: "Biznes strimer",
  ordinary: "Muallif",
  displayName: "Stream nomi",
  legalName: "Hujjatdagi ism",
  contact: "Telefon yoki email",
  country: "Davlat",
  category: "Asosiy kategoriya",
  bio: "Tavsif / tajriba",
  docs: "Hujjatlar",
  noDocs: "Hujjat yo‘q",
  identityDocs: "Shaxs hujjati tayyor",
  businessDocs: "Biznes hujjatlar tayyor",
  identityAndBusinessDocs: "Shaxs + biznes hujjatlar",
  monetization: "Monetizatsiya",
  monetizationOff: "So‘ramaslik",
  monetizationOn: "Keyin so‘rash",
  age: "Yosh tasdiqlandi",
  rules: "Sabi Stream qoidalari qabul qilindi",
  policy: "Kontent siyosati qabul qilindi",
  localReady: "Lokal tekshirish",
  adminSubmit: "Adminga yuborish",
  localReadyOk: "Kelajakdagi admin tekshiruvi uchun lokal tayyor",
  blocked: "Qoralama tayyor emas",
  adminBlocked: "Admin, server va provayder ulanmagan — yuborish bloklangan",
  fakeBlocked: "Soxta yuborish, tasdiqlash, rasmiy belgi va monetizatsiya bloklangan",
  blockers: "Blokerlar",
  noLocalBlockers: "Lokal blokerlar yo‘q",
  phoneQaTitle: "UI tekshiruv",
  phoneQaDraft: "Profil",
  phoneQaDocs: "Hujjatlar",
  phoneQaAdmin: "Admin keyin",
  phoneQaWallet: "Wallet keyin",
  finalGuardTitle: "Yakuniy UI himoya",
  finalGuardText: "Forma faqat lokal qoralama tayyorlaydi. Tasdiqlash, rasmiy belgi va monetizatsiya backend/Admin/Wallet ulangandan keyin ishlaydi.",
};

const ZH: Labels = {
  ...EN,
  title: "官方主播申请",
  subtitle: "用于未来 Admin/backend 审核的本地草稿。不会伪造认证标识或变现状态。",
  kind: "申请类型",
  official: "官方主播",
  business: "商业主播",
  ordinary: "创作者",
  displayName: "直播名称",
  legalName: "法定姓名",
  contact: "电话或邮箱",
  country: "国家/地区",
  category: "主要分类",
  bio: "介绍 / 经验",
  docs: "文件",
  noDocs: "无文件",
  identityDocs: "身份文件已准备",
  businessDocs: "商业资料已准备",
  identityAndBusinessDocs: "身份资料 + 商业资料",
  monetization: "变现",
  monetizationOff: "暂不申请",
  monetizationOn: "稍后申请",
  age: "已确认年龄",
  rules: "已接受 Sabi Stream 规则",
  policy: "已接受内容政策",
  localReady: "本地检查",
  adminSubmit: "提交到管理后台",
  localReadyOk: "本地已准备好，等待后续管理后台审核",
  blocked: "草稿未完成",
  adminBlocked: "管理后台、服务端和服务提供方尚未连接，提交已锁定",
  fakeBlocked: "禁止伪造提交、审批、官方标识或变现状态",
  blockers: "阻塞项",
  noLocalBlockers: "没有本地阻塞项",
  phoneQaTitle: "UI 检查",
  phoneQaDraft: "资料",
  phoneQaDocs: "文件",
  phoneQaAdmin: "后台稍后",
  phoneQaWallet: "Wallet 稍后",
  finalGuardTitle: "最终 UI 保护",
  finalGuardText: "此表单仅创建本地草稿。审批、官方标识和变现功能需在 backend/Admin/Wallet 接入后启用。",
};

const KK: Labels = {
  ...EN,
  title: "Ресми стример өтінімі",
  subtitle: "Келешектегі Admin/backend тексеруі үшін жергілікті черновик. Жалған белгі немесе монетизация жоқ.",
  kind: "Өтінім түрі",
  official: "Ресми стример",
  business: "Бизнес стример",
  ordinary: "Автор",
  displayName: "Stream атауы",
  legalName: "Құжаттағы аты-жөні",
  contact: "Телефон немесе email",
  country: "Ел",
  category: "Негізгі санат",
  bio: "Сипаттама / тәжірибе",
  docs: "Құжаттар",
  noDocs: "Құжат жоқ",
  identityDocs: "Жеке құжат дайын",
  businessDocs: "Бизнес құжаттар дайын",
  identityAndBusinessDocs: "Жеке + бизнес құжаттар",
  monetization: "Монетизация",
  monetizationOff: "Сұрамау",
  monetizationOn: "Кейін сұрау",
  age: "Жас расталды",
  rules: "Sabi Stream ережелері қабылданды",
  policy: "Контент саясаты қабылданды",
  localReady: "Жергілікті тексеру",
  adminSubmit: "Админге жіберу",
  localReadyOk: "Келешектегі админ тексеруіне жергілікті дайын",
  blocked: "Черновик дайын емес",
  adminBlocked: "Админ, сервер және провайдер қосылмаған — жіберу бұғатталған",
  fakeBlocked: "Жалған жіберу, мақұлдау, ресми белгі және монетизация бұғатталған",
  blockers: "Блокерлер",
  noLocalBlockers: "Жергілікті блокерлер жоқ",
  phoneQaTitle: "UI тексеру",
  phoneQaDraft: "Профиль",
  phoneQaDocs: "Құжаттар",
  phoneQaAdmin: "Админ кейін",
  phoneQaWallet: "Wallet кейін",
  finalGuardTitle: "Финал UI қорғанысы",
  finalGuardText: "Форма тек жергілікті черновик дайындайды. Мақұлдау, ресми белгі және монетизация backend/Admin/Wallet қосылғаннан кейін ғана іске қосылады.",
};

const KY: Labels = {
  ...KK,
  title: "Расмий стример арызы",
  subtitle: "Кийинки админ жана сервер текшерүүсү үчүн локалдык черновик. Жасалма белги же монетизация жок.",
  kind: "Арыз түрү",
  country: "Өлкө",
  localReady: "Локалдык текшерүү",
  adminSubmit: "Админге жөнөтүү",
  localReadyOk: "Кийинки админ текшерүүсүнө локалдык даяр",
  adminBlocked: "Админ, сервер жана провайдер туташкан эмес — жөнөтүү бөгөттөлгөн",
  blockers: "Бөгөттөр",
  phoneQaTitle: "UI текшерүү",
  phoneQaDraft: "Профиль",
  phoneQaDocs: "Документтер",
  phoneQaAdmin: "Админ кийин",
  phoneQaWallet: "Wallet кийин",
  finalGuardTitle: "Финал UI коргоо",
  finalGuardText: "Форма локалдык черновик гана даярдайт. Бекитүү, расмий белги жана монетизация backend/Admin/Wallet туташкандан кийин иштейт.",
};

const TG: Labels = {
  ...EN,
  title: "Дархости стримери расмӣ",
  subtitle: "Пешнависи маҳаллӣ барои санҷиши минбаъдаи админ ва сервер. Нишон ё монетизатсияи сохта нест.",
  kind: "Навъи дархост",
  official: "Стримери расмӣ",
  business: "Бизнес-стример",
  ordinary: "Муаллиф",
  displayName: "Номи Stream",
  legalName: "Номи ҳуқуқӣ",
  contact: "Телефон ё email",
  country: "Кишвар",
  category: "Категорияи асосӣ",
  bio: "Тавсиф / таҷриба",
  docs: "Ҳуҷҷатҳо",
  noDocs: "Ҳуҷҷат нест",
  identityDocs: "Ҳуҷҷати шахсият омода",
  businessDocs: "Ҳуҷҷатҳои бизнес омода",
  identityAndBusinessDocs: "Шахсият + ҳуҷҷатҳои бизнес",
  monetization: "Монетизатсия",
  monetizationOff: "Дархост накун",
  monetizationOn: "Баъдтар дархост кун",
  age: "Синну сол тасдиқ шуд",
  rules: "Қоидаҳои Sabi Stream қабул шуданд",
  policy: "Сиёсати контент қабул шуд",
  localReady: "Санҷиши маҳаллӣ",
  adminSubmit: "Ба админ фиристодан",
  localReadyOk: "Барои санҷиши ояндаи админ маҳаллӣ омода аст",
  blocked: "Пешнавис омода нест",
  adminBlocked: "Админ, сервер ва провайдер пайваст нестанд — фиристодан баста аст",
  fakeBlocked: "Фиристодан, тасдиқ, нишони расмӣ ва монетизатсияи сохта баста аст",
  blockers: "Блокерҳо",
  noLocalBlockers: "Блокери маҳаллӣ нест",
  phoneQaTitle: "Санҷиши UI",
  phoneQaDraft: "Профил",
  phoneQaDocs: "Ҳуҷҷатҳо",
  phoneQaAdmin: "Админ баъд",
  phoneQaWallet: "Wallet баъд",
  finalGuardTitle: "Муҳофизати ниҳоии UI",
  finalGuardText: "Форма танҳо пешнависи маҳаллӣ месозад. Тасдиқ, нишони расмӣ ва монетизатсия баъди пайвасти backend/Admin/Wallet фаъол мешаванд.",
};

const LABELS_BY_LANGUAGE: Record<string, Labels> = { en: EN, ru: RU, uz: UZ, zh: ZH, kk: KK, ky: KY, tg: TG };

const KIND_OPTIONS: readonly { readonly value: StreamRegistrationKind; readonly labelKey: keyof Pick<Labels, "official" | "business" | "ordinary"> }[] = [
  { value: "official_streamer", labelKey: "official" },
  { value: "business_streamer", labelKey: "business" },
  { value: "ordinary_creator", labelKey: "ordinary" },
];

const DOCUMENT_OPTIONS: readonly { readonly value: StreamRegistrationDocumentIntent; readonly labelKey: keyof Pick<Labels, "noDocs" | "identityDocs" | "businessDocs" | "identityAndBusinessDocs"> }[] = [
  { value: "none", labelKey: "noDocs" },
  { value: "identity_ready", labelKey: "identityDocs" },
  { value: "business_docs_ready", labelKey: "businessDocs" },
  { value: "identity_and_business_docs_ready", labelKey: "identityAndBusinessDocs" },
];

const MONETIZATION_OPTIONS: readonly { readonly value: StreamRegistrationMonetizationIntent; readonly labelKey: keyof Pick<Labels, "monetizationOff" | "monetizationOn"> }[] = [
  { value: "not_requested", labelKey: "monetizationOff" },
  { value: "requested", labelKey: "monetizationOn" },
];

const BLOCKER_LABELS: Record<StreamRegistrationBlockerCode, keyof Labels | string> = {
  display_name_required: "Нужно имя в Stream",
  legal_name_required: "Нужно юридическое имя",
  contact_required: "Нужен контакт",
  country_required: "Нужно указать страну",
  category_required: "Нужно указать категорию",
  bio_required: "Описание должно быть минимум 20 символов",
  age_confirmation_required: "Нужно подтвердить возраст",
  rules_acceptance_required: "Нужно принять правила",
  content_policy_acceptance_required: "Нужно принять политику контента",
  identity_document_intent_required: "Нужно выбрать статус документов личности",
  business_documents_required: "Нужны бизнес-документы",
  backend_admin_not_connected: "Админка и сервер не подключены",
  provider_not_configured: "Провайдер не настроен",
  monetization_wallet_provider_not_configured: "Провайдер Wallet для монетизации не настроен",
};

function resolveLabels(language?: string | null): Labels {
  const normalized = String(language ?? "").trim().toLowerCase();
  const exact = LABELS_BY_LANGUAGE[normalized];
  if (exact) return exact;
  const base = normalized.split("-")[0];
  return LABELS_BY_LANGUAGE[base] ?? EN;
}

function blockerText(blocker: StreamRegistrationBlockerCode): string {
  return String(BLOCKER_LABELS[blocker]);
}

type FieldProps = {
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly multiline?: boolean;
  readonly onChangeText: (value: string) => void;
};

function RegistrationField({ label, value, placeholder, multiline, onChangeText }: FieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.42)"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline ? styles.textArea : null]}
      />
    </View>
  );
}

export function StreamOfficialStreamerRegistrationPanel({ language }: { readonly language?: string | null }) {
  const labels = useMemo(() => resolveLabels(language), [language]);
  const [state, setState] = useState<StreamRegistrationRuntimeState>(() => createInitialStreamRegistrationState());
  const [expanded, setExpanded] = useState(false);
  const { height, width } = useWindowDimensions();
  const isCompactPhone = width < 380 || height < 720;
  const isVeryCompactPhone = width < 350 || height < 660;
  const modalMaxHeight = Math.max(420, Math.min(height - 36, 760));
  const modalScrollBottomPadding = isVeryCompactPhone ? 28 : isCompactPhone ? 34 : 44;
  const localBlockers = useMemo(() => state.blockers.filter((blocker) => blocker !== "backend_admin_not_connected" && blocker !== "provider_not_configured" && blocker !== "monetization_wallet_provider_not_configured"), [state.blockers]);
  const evidence = useMemo(() => buildStreamRegistrationEvidenceSnapshot(state), [state]);

  const updateDraft = (patch: Parameters<typeof updateStreamRegistrationDraft>[1]) => {
    setState(updateStreamRegistrationDraft(state, patch).state);
  };

  const markLocalReady = () => {
    setState(markStreamRegistrationLocalReady(state).state);
  };

  const requestAdminHandoff = () => {
    setState(requestStreamRegistrationAdminHandoff(state).state);
  };

  const isLocalReady = state.status === "local_ready";
  const isAdminBlocked = state.status === "admin_handoff_blocked";
  const qaItems = [
    { label: labels.phoneQaDraft, ready: Boolean(state.draft.displayName.trim() && state.draft.legalName.trim() && state.draft.contact.trim()) },
    { label: labels.phoneQaDocs, ready: state.draft.documentIntent !== "none" },
    { label: labels.phoneQaAdmin, ready: false },
    { label: labels.phoneQaWallet, ready: false },
  ] as const;

  return (
    <>
      <Pressable style={[styles.compactPanel, isCompactPhone ? styles.compactPanelPhone : null]} onPress={() => setExpanded(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel={labels.title}>
        <View style={styles.compactIcon}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#F2C75B" />
        </View>
        <View style={styles.compactTextBlock}>
          <Text style={styles.compactTitle} numberOfLines={1}>{labels.title} · 108R</Text>
          <Text style={styles.compactMeta} numberOfLines={1}>{isVeryCompactPhone ? evidence.status : `${evidence.status} · local ${evidence.localBlockers.length} · handoff ${evidence.handoffBlockers.length}`}</Text>
        </View>
        <View style={styles.compactBadge}>
          <Text style={styles.compactBadgeText}>{localBlockers.length}</Text>
        </View>
      </Pressable>

      <Modal visible={expanded} transparent animationType="slide" onRequestClose={() => setExpanded(false)}>
        <KeyboardAvoidingView style={styles.modalKeyboardAvoider} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={styles.modalBackdrop} onPress={() => setExpanded(false)}>
          <Pressable style={[styles.modalSheet, { maxHeight: modalMaxHeight }, isCompactPhone ? styles.modalSheetCompact : null]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>{labels.title}</Text>
                <Text style={styles.modalSubtitle}>{labels.subtitle}</Text>
              </View>
              <Pressable style={styles.modalClose} onPress={() => setExpanded(false)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Закрыть заявку официального стримера">
                <Ionicons name="close-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled overScrollMode="never" contentContainerStyle={[styles.modalScroll, { paddingBottom: modalScrollBottomPadding }]}>
              <View style={styles.panel}>
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#F2C75B" />
        </View>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>{labels.title}</Text>
          <Text style={styles.subtitle}>{labels.subtitle}</Text>
        </View>
        <View style={styles.draftBadge}>
          <Text style={styles.draftBadgeText}>{labels.draftOnly}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.kind}</Text>
        <View style={styles.optionRow}>
          {KIND_OPTIONS.map((option) => {
            const selected = state.draft.kind === option.value;
            return (
              <Pressable key={option.value} style={[styles.optionChip, isCompactPhone ? styles.optionChipCompact : null, selected ? styles.optionChipSelected : null]} onPress={() => updateDraft({ kind: option.value })} hitSlop={6} accessibilityRole="button" accessibilityState={{ selected }}>
                <Text style={[styles.optionChipText, selected ? styles.optionChipTextSelected : null]}>{labels[option.labelKey]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.fieldGrid}>
        <RegistrationField label={labels.displayName} value={state.draft.displayName} placeholder={labels.placeholders.displayName} onChangeText={(value) => updateDraft({ displayName: value })} />
        <RegistrationField label={labels.legalName} value={state.draft.legalName} placeholder={labels.placeholders.legalName} onChangeText={(value) => updateDraft({ legalName: value })} />
        <RegistrationField label={labels.contact} value={state.draft.contact} placeholder={labels.placeholders.contact} onChangeText={(value) => updateDraft({ contact: value })} />
        <RegistrationField label={labels.country} value={state.draft.country} placeholder={labels.placeholders.country} onChangeText={(value) => updateDraft({ country: value })} />
        <RegistrationField label={labels.category} value={state.draft.primaryCategory} placeholder={labels.placeholders.category} onChangeText={(value) => updateDraft({ primaryCategory: value })} />
        <RegistrationField label={labels.bio} value={state.draft.bio} placeholder={labels.placeholders.bio} multiline onChangeText={(value) => updateDraft({ bio: value })} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.docs}</Text>
        <View style={styles.optionRow}>
          {DOCUMENT_OPTIONS.map((option) => {
            const selected = state.draft.documentIntent === option.value;
            return (
              <Pressable key={option.value} style={[styles.optionChip, isCompactPhone ? styles.optionChipCompact : null, selected ? styles.optionChipSelected : null]} onPress={() => updateDraft({ documentIntent: option.value })} hitSlop={6} accessibilityRole="button" accessibilityState={{ selected }}>
                <Text style={[styles.optionChipText, selected ? styles.optionChipTextSelected : null]}>{labels[option.labelKey]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.monetization}</Text>
        <View style={styles.optionRow}>
          {MONETIZATION_OPTIONS.map((option) => {
            const selected = state.draft.monetizationIntent === option.value;
            return (
              <Pressable key={option.value} style={[styles.optionChip, isCompactPhone ? styles.optionChipCompact : null, selected ? styles.optionChipSelected : null]} onPress={() => updateDraft({ monetizationIntent: option.value })} hitSlop={6} accessibilityRole="button" accessibilityState={{ selected }}>
                <Text style={[styles.optionChipText, selected ? styles.optionChipTextSelected : null]}>{labels[option.labelKey]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.checkList}>
        <Pressable style={styles.checkRow} onPress={() => updateDraft({ ageConfirmed: !state.draft.ageConfirmed })} hitSlop={6} accessibilityRole="checkbox" accessibilityState={{ checked: state.draft.ageConfirmed }}>
          <Ionicons name={state.draft.ageConfirmed ? "checkmark-circle" : "ellipse-outline"} size={22} color={state.draft.ageConfirmed ? "#9EF2C1" : "rgba(255,255,255,0.48)"} />
          <Text style={styles.checkText}>{labels.age}</Text>
        </Pressable>
        <Pressable style={styles.checkRow} onPress={() => updateDraft({ rulesAccepted: !state.draft.rulesAccepted })} hitSlop={6} accessibilityRole="checkbox" accessibilityState={{ checked: state.draft.rulesAccepted }}>
          <Ionicons name={state.draft.rulesAccepted ? "checkmark-circle" : "ellipse-outline"} size={22} color={state.draft.rulesAccepted ? "#9EF2C1" : "rgba(255,255,255,0.48)"} />
          <Text style={styles.checkText}>{labels.rules}</Text>
        </Pressable>
        <Pressable style={styles.checkRow} onPress={() => updateDraft({ contentPolicyAccepted: !state.draft.contentPolicyAccepted })} hitSlop={6} accessibilityRole="checkbox" accessibilityState={{ checked: state.draft.contentPolicyAccepted }}>
          <Ionicons name={state.draft.contentPolicyAccepted ? "checkmark-circle" : "ellipse-outline"} size={22} color={state.draft.contentPolicyAccepted ? "#9EF2C1" : "rgba(255,255,255,0.48)"} />
          <Text style={styles.checkText}>{labels.policy}</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={[styles.primaryButton, isCompactPhone ? styles.actionButtonCompact : null]} onPress={markLocalReady} hitSlop={6} accessibilityRole="button">
          <Ionicons name="checkmark-done-outline" size={18} color="#060606" />
          <Text style={styles.primaryButtonText}>{labels.localReady}</Text>
        </Pressable>
        <Pressable style={[styles.lockedButton, isCompactPhone ? styles.actionButtonCompact : null]} onPress={requestAdminHandoff} hitSlop={6} accessibilityRole="button" accessibilityState={{ disabled: true }}>
          <Ionicons name="lock-closed-outline" size={18} color="#F2C75B" />
          <Text style={styles.lockedButtonText}>{labels.adminSubmit}</Text>
        </Pressable>
      </View>

      <View style={[styles.statusBox, isLocalReady ? styles.statusBoxReady : isAdminBlocked ? styles.statusBoxBlocked : null]}>
        <Text style={styles.statusTitle}>{isAdminBlocked ? labels.adminBlocked : isLocalReady ? labels.localReadyOk : labels.blocked}</Text>
        <Text style={styles.statusDetail}>{labels.fakeBlocked}</Text>
      </View>

      <View style={styles.verificationQaBox} pointerEvents="none">
        <Text style={styles.verificationQaTitle}>{labels.phoneQaTitle}</Text>
        <View style={styles.verificationQaRail}>
          {qaItems.map((item) => (
            <View key={item.label} style={[styles.verificationQaPill, item.ready ? styles.verificationQaPillReady : null, isCompactPhone ? styles.verificationQaPillCompact : null]}>
              <View style={[styles.verificationQaDot, item.ready ? styles.verificationQaDotReady : null]} />
              <Text style={[styles.verificationQaText, item.ready ? styles.verificationQaTextReady : null]} numberOfLines={1}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.finalGuardBox} pointerEvents="none">
        <Text style={styles.finalGuardTitle}>{labels.finalGuardTitle}</Text>
        <Text style={styles.finalGuardText}>{labels.finalGuardText}</Text>
      </View>

      <View style={styles.blockersBox}>
        <Text style={styles.blockersTitle}>{labels.blockers}</Text>
        {localBlockers.length === 0 ? (
          <Text style={styles.blockerLine}>{labels.noLocalBlockers}</Text>
        ) : (
          localBlockers.slice(0, 8).map((blocker) => (
            <Text key={blocker} style={styles.blockerLine}>• {blockerText(blocker)}</Text>
          ))
        )}
      </View>

      <View style={styles.evidenceBox}>
        <Text style={styles.evidenceTitle}>{labels.evidence}</Text>
        <Text style={styles.evidenceLine}>status: {evidence.status}</Text>
        <Text style={styles.evidenceLine}>kind: {evidence.kind}</Text>
        <Text style={styles.evidenceLine}>localBlockers: {evidence.localBlockers.length}</Text>
        <Text style={styles.evidenceLine}>handoffBlockers: {evidence.handoffBlockers.length}</Text>
      </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  compactPanel: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 282,
    minHeight: 54,
    borderRadius: 22,
    backgroundColor: "rgba(9,9,13,0.80)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.26)",
    zIndex: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compactIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(242,199,91,0.10)", alignItems: "center", justifyContent: "center" },
  compactTextBlock: { flex: 1 },
  compactTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  compactMeta: { marginTop: 3, color: "rgba(255,255,255,0.66)", fontSize: 10, fontWeight: "800" },
  compactBadge: { minWidth: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(242,199,91,0.95)", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  compactBadgeText: { color: "#07070A", fontSize: 12, fontWeight: "900" },
  compactPanelPhone: { left: 10, right: 10, top: 254, minHeight: 50, paddingHorizontal: 10 },
  modalKeyboardAvoider: { flex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.76)", justifyContent: "flex-end", padding: 12 },
  modalSheet: { borderRadius: 30, backgroundColor: "#0B0B10", borderWidth: 1, borderColor: "rgba(242,199,91,0.28)", padding: 14, gap: 12 },
  modalSheetCompact: { borderRadius: 24, padding: 10, gap: 10 },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  modalTitleBlock: { flex: 1 },
  modalTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  modalSubtitle: { marginTop: 3, color: "rgba(255,255,255,0.62)", fontSize: 11, fontWeight: "800", lineHeight: 15 },
  modalClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  modalScroll: { paddingBottom: 18 },
  panel: {
    marginTop: 0,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.28)",
    backgroundColor: "rgba(9,9,13,0.94)",
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(242,199,91,0.12)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.32)",
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  draftBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  draftBadgeText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "900",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  optionChipCompact: { paddingHorizontal: 10, paddingVertical: 7 },
  optionChipSelected: {
    borderColor: "rgba(242,199,91,0.72)",
    backgroundColor: "rgba(242,199,91,0.16)",
  },
  optionChipText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "800",
  },
  optionChipTextSelected: {
    color: "#F2C75B",
  },
  fieldGrid: {
    gap: 10,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
  },
  input: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    fontSize: 13,
    fontWeight: "700",
  },
  textArea: {
    minHeight: 84,
    lineHeight: 18,
  },
  checkList: {
    gap: 9,
  },
  checkRow: {
    minHeight: 38,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },
  checkText: {
    flex: 1,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  actionButtonCompact: { minHeight: 40, borderRadius: 16, paddingHorizontal: 12 },
  primaryButton: {
    minHeight: 44,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F2C75B",
  },
  primaryButtonText: {
    color: "#060606",
    fontSize: 12,
    fontWeight: "900",
  },
  lockedButton: {
    minHeight: 44,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(242,199,91,0.08)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.28)",
  },
  lockedButtonText: {
    color: "#F2C75B",
    fontSize: 12,
    fontWeight: "900",
  },
  statusBox: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 4,
  },
  statusBoxReady: {
    borderColor: "rgba(158,242,193,0.34)",
    backgroundColor: "rgba(158,242,193,0.08)",
  },
  statusBoxBlocked: {
    borderColor: "rgba(242,199,91,0.36)",
    backgroundColor: "rgba(242,199,91,0.08)",
  },
  statusTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  statusDetail: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  verificationQaBox: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(242,199,91,0.065)",
    borderWidth: 1,
    borderColor: "rgba(242,199,91,0.18)",
    gap: 8,
  },
  verificationQaTitle: {
    color: "#F2C75B",
    fontSize: 12,
    fontWeight: "900",
  },
  verificationQaRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  verificationQaPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  verificationQaPillCompact: { minHeight: 26, paddingHorizontal: 8 },
  verificationQaPillReady: {
    backgroundColor: "rgba(158,242,193,0.08)",
    borderColor: "rgba(158,242,193,0.28)",
  },
  verificationQaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.34)" },
  verificationQaDotReady: { backgroundColor: "#9EF2C1" },
  verificationQaText: { color: "rgba(255,255,255,0.66)", fontSize: 10, fontWeight: "900" },
  verificationQaTextReady: { color: "#B7F8D0" },
  finalGuardBox: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    gap: 5,
  },
  finalGuardTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  finalGuardText: { color: "rgba(255,255,255,0.64)", fontSize: 11, lineHeight: 16, fontWeight: "700" },
  blockersBox: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.045)",
    gap: 4,
  },
  blockersTitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "900",
  },
  blockerLine: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  evidenceBox: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.24)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 3,
  },
  evidenceTitle: {
    color: "#F2C75B",
    fontSize: 12,
    fontWeight: "900",
  },
  evidenceLine: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    fontWeight: "700",
  },
});
