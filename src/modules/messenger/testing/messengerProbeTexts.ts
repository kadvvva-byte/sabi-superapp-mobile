import type { TranslationLanguage } from "../../../shared/i18n";

export type ProbeScope = "contacts" | "bots" | "channels" | "business";

export type MessengerProbeTexts = {
  brand: string;
  titles: Record<ProbeScope, string>;
  subtitles: Record<ProbeScope, string>;
  wait: string;
  live: string;
  realtimeContext: string;
  scope: string;
  userId: string;
  channel: string;
  events: string;
  emitProbe: string;
  emitScope: string;
  clear: string;
  missingUserWarning: string;
  feedTitle: string;
  entries: string;
  emptyTitle: string;
  emptySubtitle: string;
  missingRouteParam: string;
  socketConnect: string;
  socketDisconnect: string;
  socketConnectError: string;
  probeBlocked: string;
};

const EN_TEXTS: MessengerProbeTexts = {
  brand: "Sabi Messenger",
  titles: {
    contacts: "Contacts",
    bots: "Bots",
    channels: "Channels",
    business: "Business",
  },
  subtitles: {
    contacts: "Contacts realtime test",
    bots: "Bots realtime test",
    channels: "Channels realtime test",
    business: "Business realtime test",
  },
  wait: "WAIT",
  live: "LIVE",
  realtimeContext: "Realtime context",
  scope: "Scope",
  userId: "User ID",
  channel: "Channel",
  events: "Events",
  emitProbe: "Emit probe",
  emitScope: "Emit scope",
  clear: "Clear",
  missingUserWarning:
    "Route param `userId` is missing. Realtime join is blocked until a userId is passed.",
  feedTitle: "Event feed",
  entries: "entries",
  emptyTitle: "No realtime events yet",
  emptySubtitle: "Open this page with a valid userId and emit test events.",
  missingRouteParam: "missing route param",
  socketConnect: "socket:connect",
  socketDisconnect: "socket:disconnect",
  socketConnectError: "socket:connect_error",
  probeBlocked: "probe:blocked",
};

const PROBE_TEXTS: Partial<Record<TranslationLanguage, MessengerProbeTexts>> = {
  en: EN_TEXTS,

  ru: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Контакты",
      bots: "Боты",
      channels: "Каналы",
      business: "Бизнес",
    },
    subtitles: {
      contacts: "Тест realtime контактов",
      bots: "Тест realtime ботов",
      channels: "Тест realtime каналов",
      business: "Тест realtime бизнеса",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime контекст",
    scope: "Раздел",
    userId: "User ID",
    channel: "Канал",
    events: "События",
    emitProbe: "Отправить probe",
    emitScope: "Отправить scope",
    clear: "Очистить",
    missingUserWarning:
      "Параметр маршрута `userId` отсутствует. Realtime join блокируется, пока не передан userId.",
    feedTitle: "Лента событий",
    entries: "записей",
    emptyTitle: "Пока нет realtime-событий",
    emptySubtitle:
      "Откройте эту страницу с валидным userId и отправьте тестовые события.",
    missingRouteParam: "route param отсутствует",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  uz: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Kontaktlar",
      bots: "Botlar",
      channels: "Kanallar",
      business: "Biznes",
    },
    subtitles: {
      contacts: "Kontakt realtime testi",
      bots: "Bot realtime testi",
      channels: "Kanal realtime testi",
      business: "Biznes realtime testi",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime kontekst",
    scope: "Bo‘lim",
    userId: "User ID",
    channel: "Kanal",
    events: "Hodisalar",
    emitProbe: "Probe yuborish",
    emitScope: "Scope yuborish",
    clear: "Tozalash",
    missingUserWarning:
      "`userId` route param topilmadi. userId kelmaguncha realtime join bloklanadi.",
    feedTitle: "Hodisalar lentasi",
    entries: "yozuv",
    emptyTitle: "Hozircha realtime hodisa yo‘q",
    emptySubtitle:
      "Bu sahifani to‘g‘ri userId bilan oching va test hodisalarni yuboring.",
    missingRouteParam: "route param yo‘q",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  zh: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "联系人",
      bots: "机器人",
      channels: "频道",
      business: "商务",
    },
    subtitles: {
      contacts: "联系人实时测试",
      bots: "机器人实时测试",
      channels: "频道实时测试",
      business: "商务实时测试",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "实时上下文",
    scope: "范围",
    userId: "用户 ID",
    channel: "频道",
    events: "事件",
    emitProbe: "发送探针",
    emitScope: "发送范围事件",
    clear: "清除",
    missingUserWarning:
      "缺少路由参数 `userId`。在传入 userId 之前，Realtime join 会被阻止。",
    feedTitle: "事件流",
    entries: "条",
    emptyTitle: "暂无实时事件",
    emptySubtitle: "请使用有效的 userId 打开此页面并发送测试事件。",
    missingRouteParam: "缺少路由参数",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  ko: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "연락처",
      bots: "봇",
      channels: "채널",
      business: "비즈니스",
    },
    subtitles: {
      contacts: "연락처 실시간 테스트",
      bots: "봇 실시간 테스트",
      channels: "채널 실시간 테스트",
      business: "비즈니스 실시간 테스트",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "실시간 컨텍스트",
    scope: "범위",
    userId: "사용자 ID",
    channel: "채널",
    events: "이벤트",
    emitProbe: "프로브 전송",
    emitScope: "범위 이벤트 전송",
    clear: "지우기",
    missingUserWarning:
      "라우트 파라미터 `userId`가 없습니다. userId가 전달될 때까지 Realtime join이 차단됩니다.",
    feedTitle: "이벤트 피드",
    entries: "개",
    emptyTitle: "아직 실시간 이벤트가 없습니다",
    emptySubtitle: "유효한 userId로 이 페이지를 열고 테스트 이벤트를 보내세요.",
    missingRouteParam: "라우트 파라미터 없음",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  ja: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "連絡先",
      bots: "ボット",
      channels: "チャンネル",
      business: "ビジネス",
    },
    subtitles: {
      contacts: "連絡先リアルタイムテスト",
      bots: "ボットリアルタイムテスト",
      channels: "チャンネルリアルタイムテスト",
      business: "ビジネスリアルタイムテスト",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "リアルタイムコンテキスト",
    scope: "範囲",
    userId: "ユーザー ID",
    channel: "チャンネル",
    events: "イベント",
    emitProbe: "プローブ送信",
    emitScope: "範囲イベント送信",
    clear: "クリア",
    missingUserWarning:
      "ルートパラメータ `userId` がありません。userId が渡されるまで Realtime join はブロックされます。",
    feedTitle: "イベントフィード",
    entries: "件",
    emptyTitle: "まだリアルタイムイベントはありません",
    emptySubtitle:
      "有効な userId でこのページを開き、テストイベントを送信してください。",
    missingRouteParam: "ルートパラメータなし",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  kk: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Контактілер",
      bots: "Боттар",
      channels: "Арналар",
      business: "Бизнес",
    },
    subtitles: {
      contacts: "Контактілер realtime тесті",
      bots: "Боттар realtime тесті",
      channels: "Арналар realtime тесті",
      business: "Бизнес realtime тесті",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime контекст",
    scope: "Бөлім",
    userId: "User ID",
    channel: "Арна",
    events: "Оқиғалар",
    emitProbe: "Probe жіберу",
    emitScope: "Scope жіберу",
    clear: "Тазалау",
    missingUserWarning:
      "`userId` route param жоқ. userId берілгенше Realtime join бұғатталады.",
    feedTitle: "Оқиғалар ағыны",
    entries: "жазба",
    emptyTitle: "Қазір realtime оқиға жоқ",
    emptySubtitle:
      "Бұл бетті дұрыс userId-пен ашып, тест оқиғаларын жіберіңіз.",
    missingRouteParam: "route param жоқ",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  ky: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Байланыштар",
      bots: "Боттор",
      channels: "Каналдар",
      business: "Бизнес",
    },
    subtitles: {
      contacts: "Байланыш realtime тести",
      bots: "Бот realtime тести",
      channels: "Канал realtime тести",
      business: "Бизнес realtime тести",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime контекст",
    scope: "Бөлүм",
    userId: "User ID",
    channel: "Канал",
    events: "Окуялар",
    emitProbe: "Probe жөнөтүү",
    emitScope: "Scope жөнөтүү",
    clear: "Тазалоо",
    missingUserWarning:
      "`userId` route param жок. userId келгенче Realtime join бөгөттөлөт.",
    feedTitle: "Окуялар лентасы",
    entries: "жазуу",
    emptyTitle: "Азырынча realtime окуя жок",
    emptySubtitle:
      "Бул баракты туура userId менен ачып, тест окуяларын жөнөтүңүз.",
    missingRouteParam: "route param жок",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  tg: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Тамосҳо",
      bots: "Ботҳо",
      channels: "Каналҳо",
      business: "Бизнес",
    },
    subtitles: {
      contacts: "Санҷиши realtime тамосҳо",
      bots: "Санҷиши realtime ботҳо",
      channels: "Санҷиши realtime каналҳо",
      business: "Санҷиши realtime бизнес",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime контекст",
    scope: "Бахш",
    userId: "User ID",
    channel: "Канал",
    events: "Ҳодисаҳо",
    emitProbe: "Ирсоли probe",
    emitScope: "Ирсоли scope",
    clear: "Пок кардан",
    missingUserWarning:
      "Параметри route `userId` нест. То омадани userId, Realtime join баста мешавад.",
    feedTitle: "Ҷараёни ҳодисаҳо",
    entries: "сабт",
    emptyTitle: "Ҳоло realtime-ҳодиса нест",
    emptySubtitle:
      "Ин саҳифаро бо userId-и дуруст кушоед ва ҳодисаҳои тестиро фиристед.",
    missingRouteParam: "route param нест",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  uk: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Контакти",
      bots: "Боти",
      channels: "Канали",
      business: "Бізнес",
    },
    subtitles: {
      contacts: "Тест realtime контактів",
      bots: "Тест realtime ботів",
      channels: "Тест realtime каналів",
      business: "Тест realtime бізнесу",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime контекст",
    scope: "Розділ",
    userId: "User ID",
    channel: "Канал",
    events: "Події",
    emitProbe: "Надіслати probe",
    emitScope: "Надіслати scope",
    clear: "Очистити",
    missingUserWarning:
      "Параметр маршруту `userId` відсутній. Realtime join блокується, доки не передано userId.",
    feedTitle: "Стрічка подій",
    entries: "записів",
    emptyTitle: "Поки немає realtime-подій",
    emptySubtitle:
      "Відкрийте цю сторінку з валідним userId і надішліть тестові події.",
    missingRouteParam: "route param відсутній",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  be: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Кантакты",
      bots: "Боты",
      channels: "Каналы",
      business: "Бізнес",
    },
    subtitles: {
      contacts: "Тэст realtime кантактаў",
      bots: "Тэст realtime ботаў",
      channels: "Тэст realtime каналаў",
      business: "Тэст realtime бізнесу",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime кантэкст",
    scope: "Раздзел",
    userId: "User ID",
    channel: "Канал",
    events: "Падзеі",
    emitProbe: "Адправіць probe",
    emitScope: "Адправіць scope",
    clear: "Ачысціць",
    missingUserWarning:
      "Параметр маршруту `userId` адсутнічае. Realtime join блакуецца, пакуль не перададзены userId.",
    feedTitle: "Стужка падзей",
    entries: "запісаў",
    emptyTitle: "Пакуль няма realtime-падзей",
    emptySubtitle:
      "Адкрыйце гэту старонку з валідным userId і адпраўце тэставыя падзеі.",
    missingRouteParam: "route param адсутнічае",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  de: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Kontakte",
      bots: "Bots",
      channels: "Kanäle",
      business: "Business",
    },
    subtitles: {
      contacts: "Kontakte-Realtime-Test",
      bots: "Bots-Realtime-Test",
      channels: "Kanäle-Realtime-Test",
      business: "Business-Realtime-Test",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime-Kontext",
    scope: "Bereich",
    userId: "Benutzer-ID",
    channel: "Kanal",
    events: "Ereignisse",
    emitProbe: "Probe senden",
    emitScope: "Bereich senden",
    clear: "Leeren",
    missingUserWarning:
      "Der Routenparameter `userId` fehlt. Realtime join ist blockiert, bis eine userId übergeben wird.",
    feedTitle: "Ereignis-Feed",
    entries: "Einträge",
    emptyTitle: "Noch keine Realtime-Ereignisse",
    emptySubtitle:
      "Öffnen Sie diese Seite mit einer gültigen userId und senden Sie Testereignisse.",
    missingRouteParam: "Routenparameter fehlt",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  tr: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Kişiler",
      bots: "Botlar",
      channels: "Kanallar",
      business: "İş",
    },
    subtitles: {
      contacts: "Kişiler realtime testi",
      bots: "Botlar realtime testi",
      channels: "Kanallar realtime testi",
      business: "İş realtime testi",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime bağlamı",
    scope: "Bölüm",
    userId: "Kullanıcı ID",
    channel: "Kanal",
    events: "Olaylar",
    emitProbe: "Probe gönder",
    emitScope: "Scope gönder",
    clear: "Temizle",
    missingUserWarning:
      "`userId` rota parametresi eksik. userId gelene kadar Realtime join engellenir.",
    feedTitle: "Olay akışı",
    entries: "kayıt",
    emptyTitle: "Henüz realtime olayı yok",
    emptySubtitle:
      "Bu sayfayı geçerli bir userId ile açın ve test olayları gönderin.",
    missingRouteParam: "rota parametresi yok",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  az: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Kontaktlar",
      bots: "Botlar",
      channels: "Kanallar",
      business: "Biznes",
    },
    subtitles: {
      contacts: "Kontakt realtime testi",
      bots: "Bot realtime testi",
      channels: "Kanal realtime testi",
      business: "Biznes realtime testi",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime kontekst",
    scope: "Bölmə",
    userId: "User ID",
    channel: "Kanal",
    events: "Hadisələr",
    emitProbe: "Probe göndər",
    emitScope: "Scope göndər",
    clear: "Təmizlə",
    missingUserWarning:
      "`userId` route param yoxdur. userId gələnə qədər Realtime join bloklanır.",
    feedTitle: "Hadisələr lenti",
    entries: "yazı",
    emptyTitle: "Hələ realtime hadisə yoxdur",
    emptySubtitle:
      "Bu səhifəni düzgün userId ilə açın və test hadisələri göndərin.",
    missingRouteParam: "route param yoxdur",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  tk: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Kontaktlar",
      bots: "Botlar",
      channels: "Kanallar",
      business: "Biznes",
    },
    subtitles: {
      contacts: "Kontakt realtime synagy",
      bots: "Bot realtime synagy",
      channels: "Kanal realtime synagy",
      business: "Biznes realtime synagy",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime kontekst",
    scope: "Bölüm",
    userId: "User ID",
    channel: "Kanal",
    events: "Wakalar",
    emitProbe: "Probe ugrat",
    emitScope: "Scope ugrat",
    clear: "Arassala",
    missingUserWarning:
      "`userId` route param ýok. userId gelýänçä Realtime join bloklanýar.",
    feedTitle: "Waka lentalary",
    entries: "ýazgy",
    emptyTitle: "Häzir realtime waka ýok",
    emptySubtitle:
      "Bu sahypany dogry userId bilen açyp, test wakalaryny ugradyň.",
    missingRouteParam: "route param ýok",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  ar: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "جهات الاتصال",
      bots: "الروبوتات",
      channels: "القنوات",
      business: "الأعمال",
    },
    subtitles: {
      contacts: "اختبار الوقت الحقيقي لجهات الاتصال",
      bots: "اختبار الوقت الحقيقي للروبوتات",
      channels: "اختبار الوقت الحقيقي للقنوات",
      business: "اختبار الوقت الحقيقي للأعمال",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "سياق الوقت الحقيقي",
    scope: "القسم",
    userId: "معرّف المستخدم",
    channel: "القناة",
    events: "الأحداث",
    emitProbe: "إرسال Probe",
    emitScope: "إرسال Scope",
    clear: "مسح",
    missingUserWarning:
      "معلمة المسار `userId` مفقودة. يتم حظر Realtime join حتى يتم تمرير userId.",
    feedTitle: "تدفق الأحداث",
    entries: "سجلات",
    emptyTitle: "لا توجد أحداث آنية بعد",
    emptySubtitle:
      "افتح هذه الصفحة باستخدام userId صالح وأرسل أحداث الاختبار.",
    missingRouteParam: "معلمة المسار مفقودة",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  ur: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "رابطے",
      bots: "بوٹس",
      channels: "چینلز",
      business: "بزنس",
    },
    subtitles: {
      contacts: "رابطوں کا realtime ٹیسٹ",
      bots: "بوٹس کا realtime ٹیسٹ",
      channels: "چینلز کا realtime ٹیسٹ",
      business: "بزنس کا realtime ٹیسٹ",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime سیاق",
    scope: "حصہ",
    userId: "User ID",
    channel: "چینل",
    events: "ایونٹس",
    emitProbe: "Probe بھیجیں",
    emitScope: "Scope بھیجیں",
    clear: "صاف کریں",
    missingUserWarning:
      "`userId` route param موجود نہیں۔ userId آنے تک Realtime join بلاک رہے گا۔",
    feedTitle: "ایونٹ فیڈ",
    entries: "اندراجات",
    emptyTitle: "ابھی تک realtime ایونٹس نہیں ہیں",
    emptySubtitle:
      "اس صفحے کو درست userId کے ساتھ کھولیں اور ٹیسٹ ایونٹس بھیجیں۔",
    missingRouteParam: "route param موجود نہیں",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  ps: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "اړیکې",
      bots: "بوټونه",
      channels: "چینلونه",
      business: "سوداګري",
    },
    subtitles: {
      contacts: "د اړیکو realtime ازموینه",
      bots: "د بوټونو realtime ازموینه",
      channels: "د چینلونو realtime ازموینه",
      business: "د سوداګرۍ realtime ازموینه",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime متن",
    scope: "برخه",
    userId: "User ID",
    channel: "چینل",
    events: "پیښې",
    emitProbe: "Probe ولېږه",
    emitScope: "Scope ولېږه",
    clear: "پاکول",
    missingUserWarning:
      "د route پارامیټر `userId` نشته. تر څو userId ورنه کړل شي، Realtime join بند دی.",
    feedTitle: "د پیښو لړۍ",
    entries: "ریکارډونه",
    emptyTitle: "تر اوسه realtime پیښه نشته",
    emptySubtitle:
      "دا پاڼه د سم userId سره پرانیزئ او د ازموینې پیښې واستوئ.",
    missingRouteParam: "route param نشته",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  "fa-AF": {
    brand: "Sabi Messenger",
    titles: {
      contacts: "مخاطبین",
      bots: "بات‌ها",
      channels: "کانال‌ها",
      business: "بیزنس",
    },
    subtitles: {
      contacts: "تست realtime مخاطبین",
      bots: "تست realtime بات‌ها",
      channels: "تست realtime کانال‌ها",
      business: "تست realtime بیزنس",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "بافت realtime",
    scope: "بخش",
    userId: "User ID",
    channel: "کانال",
    events: "رویدادها",
    emitProbe: "ارسال Probe",
    emitScope: "ارسال Scope",
    clear: "پاک‌کردن",
    missingUserWarning:
      "پارامتر مسیر `userId` موجود نیست. تا وقتی userId داده نشود، Realtime join مسدود می‌ماند.",
    feedTitle: "جریان رویدادها",
    entries: "ورودی",
    emptyTitle: "فعلاً رویداد realtime وجود ندارد",
    emptySubtitle:
      "این صفحه را با userId معتبر باز کنید و رویدادهای تستی بفرستید.",
    missingRouteParam: "پارامتر مسیر موجود نیست",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  hi: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "संपर्क",
      bots: "बॉट्स",
      channels: "चैनल",
      business: "बिज़नेस",
    },
    subtitles: {
      contacts: "संपर्क realtime परीक्षण",
      bots: "बॉट realtime परीक्षण",
      channels: "चैनल realtime परीक्षण",
      business: "बिज़नेस realtime परीक्षण",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime संदर्भ",
    scope: "सेक्शन",
    userId: "User ID",
    channel: "चैनल",
    events: "इवेंट्स",
    emitProbe: "Probe भेजें",
    emitScope: "Scope भेजें",
    clear: "साफ़ करें",
    missingUserWarning:
      "`userId` route param मौजूद नहीं है। userId मिलने तक Realtime join ब्लॉक रहेगा।",
    feedTitle: "इवेंट फ़ीड",
    entries: "एंट्री",
    emptyTitle: "अभी कोई realtime इवेंट नहीं है",
    emptySubtitle:
      "इस पेज को सही userId के साथ खोलें और टेस्ट इवेंट भेजें।",
    missingRouteParam: "route param नहीं है",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  th: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "รายชื่อ",
      bots: "บอท",
      channels: "ช่อง",
      business: "ธุรกิจ",
    },
    subtitles: {
      contacts: "ทดสอบเรียลไทม์รายชื่อ",
      bots: "ทดสอบเรียลไทม์บอท",
      channels: "ทดสอบเรียลไทม์ช่อง",
      business: "ทดสอบเรียลไทม์ธุรกิจ",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "บริบทเรียลไทม์",
    scope: "ส่วน",
    userId: "รหัสผู้ใช้",
    channel: "ช่อง",
    events: "เหตุการณ์",
    emitProbe: "ส่ง Probe",
    emitScope: "ส่ง Scope",
    clear: "ล้าง",
    missingUserWarning:
      "ไม่มี route param `userId` จึงบล็อก Realtime join จนกว่าจะส่ง userId เข้ามา",
    feedTitle: "ฟีดเหตุการณ์",
    entries: "รายการ",
    emptyTitle: "ยังไม่มีเหตุการณ์เรียลไทม์",
    emptySubtitle:
      "เปิดหน้านี้ด้วย userId ที่ถูกต้องและส่งเหตุการณ์ทดสอบ",
    missingRouteParam: "ไม่มี route param",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  sw: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Mawasiliano",
      bots: "Boti",
      channels: "Vituo",
      business: "Biashara",
    },
    subtitles: {
      contacts: "Jaribio la realtime la mawasiliano",
      bots: "Jaribio la realtime la boti",
      channels: "Jaribio la realtime la vituo",
      business: "Jaribio la realtime la biashara",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Muktadha wa realtime",
    scope: "Sehemu",
    userId: "User ID",
    channel: "Kituo",
    events: "Matukio",
    emitProbe: "Tuma Probe",
    emitScope: "Tuma Scope",
    clear: "Futa",
    missingUserWarning:
      "Route param `userId` haipo. Realtime join imezuiwa hadi userId ipitishwe.",
    feedTitle: "Mtiririko wa matukio",
    entries: "ingizo",
    emptyTitle: "Bado hakuna tukio la realtime",
    emptySubtitle:
      "Fungua ukurasa huu kwa userId sahihi kisha utume matukio ya majaribio.",
    missingRouteParam: "route param haipo",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  am: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "እውቂያዎች",
      bots: "ቦቶች",
      channels: "ቻናሎች",
      business: "ቢዝነስ",
    },
    subtitles: {
      contacts: "የእውቂያ realtime ሙከራ",
      bots: "የቦት realtime ሙከራ",
      channels: "የቻናል realtime ሙከራ",
      business: "የቢዝነስ realtime ሙከራ",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime ኮንቴክስት",
    scope: "ክፍል",
    userId: "User ID",
    channel: "ቻናል",
    events: "ክስተቶች",
    emitProbe: "Probe ላክ",
    emitScope: "Scope ላክ",
    clear: "አጥፋ",
    missingUserWarning:
      "`userId` route param የለም። userId እስኪላክ ድረስ Realtime join ይታገዳል።",
    feedTitle: "የክስተት ፊድ",
    entries: "መዝገቦች",
    emptyTitle: "እስካሁን realtime ክስተት የለም",
    emptySubtitle:
      "ይህን ገጽ በትክክለኛ userId ክፈትና የሙከራ ክስተቶችን ላክ።",
    missingRouteParam: "route param የለም",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  af: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Kontakte",
      bots: "Bots",
      channels: "Kanale",
      business: "Besigheid",
    },
    subtitles: {
      contacts: "Kontakte realtime toets",
      bots: "Bots realtime toets",
      channels: "Kanale realtime toets",
      business: "Besigheid realtime toets",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime konteks",
    scope: "Afdeling",
    userId: "Gebruiker-ID",
    channel: "Kanaal",
    events: "Gebeurtenisse",
    emitProbe: "Stuur Probe",
    emitScope: "Stuur Scope",
    clear: "Maak skoon",
    missingUserWarning:
      "Die route parameter `userId` ontbreek. Realtime join word geblokkeer totdat userId gestuur word.",
    feedTitle: "Gebeurtenisvoer",
    entries: "inskrywings",
    emptyTitle: "Nog geen realtime gebeurtenisse nie",
    emptySubtitle:
      "Maak hierdie bladsy oop met 'n geldige userId en stuur toetsgebeurtenisse.",
    missingRouteParam: "route parameter ontbreek",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },

  hy: {
    brand: "Sabi Messenger",
    titles: {
      contacts: "Կոնտակտներ",
      bots: "Բոտեր",
      channels: "Ալիքներ",
      business: "Բիզնես",
    },
    subtitles: {
      contacts: "Կոնտակտների realtime թեստ",
      bots: "Բոտերի realtime թեստ",
      channels: "Ալիքների realtime թեստ",
      business: "Բիզնես realtime թեստ",
    },
    wait: "WAIT",
    live: "LIVE",
    realtimeContext: "Realtime համատեքստ",
    scope: "Բաժին",
    userId: "User ID",
    channel: "Ալիք",
    events: "Իրադարձություններ",
    emitProbe: "Ուղարկել Probe",
    emitScope: "Ուղարկել Scope",
    clear: "Մաքրել",
    missingUserWarning:
      "`userId` route param-ը բացակայում է։ userId փոխանցվելուց առաջ Realtime join-ը արգելափակված է։",
    feedTitle: "Իրադարձությունների հոսք",
    entries: "գրառում",
    emptyTitle: "Առայժմ realtime իրադարձություն չկա",
    emptySubtitle:
      "Բացեք այս էջը ճիշտ userId-ով և ուղարկեք թեստային իրադարձություններ։",
    missingRouteParam: "route param-ը բացակայում է",
    socketConnect: "socket:connect",
    socketDisconnect: "socket:disconnect",
    socketConnectError: "socket:connect_error",
    probeBlocked: "probe:blocked",
  },
};

function normalizeLanguageCode(input?: string | null): string {
  return String(input ?? "").trim().replace(/_/g, "-");
}

export function getMessengerProbeTexts(
  language?: TranslationLanguage | string | null
): MessengerProbeTexts {
  const normalized = normalizeLanguageCode(language).toLowerCase();

  if (normalized === "fa-af") {
    return PROBE_TEXTS["fa-AF"] ?? EN_TEXTS;
  }

  const direct = PROBE_TEXTS[language as TranslationLanguage];
  if (direct) return direct;

  const base = normalized.split("-")[0] as TranslationLanguage;
  return PROBE_TEXTS[base] ?? EN_TEXTS;
}