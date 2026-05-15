import { appStorage } from "../../../shared/storage/app-storage";

export type ChatReportReasonId =
  | "spam"
  | "harassment"
  | "fraud"
  | "violence"
  | "illegal"
  | "adult"
  | "impersonation"
  | "self_harm"
  | "other";

export type ChatReportReasonOption = {
  id: ChatReportReasonId;
  title: string;
  subtitle: string;
};

export type ChatReportItem = {
  id: string;
  chatId: string;
  chatName?: string;
  roomType?: string;
  reporterUserId?: string;
  targetUserId?: string;
  reasonId: ChatReportReasonId;
  details?: string;
  createdAt: string;
  status: "pending";
};

const STORAGE_KEY = "sabi.messenger.chat_reports";

export const CHAT_REPORT_REASONS: ChatReportReasonOption[] = [
  {
    id: "spam",
    title: "Спам",
    subtitle: "Навязчивые сообщения, реклама или массовые рассылки.",
  },
  {
    id: "harassment",
    title: "Оскорбления и травля",
    subtitle: "Унижения, угрозы, преследование или агрессивное поведение.",
  },
  {
    id: "fraud",
    title: "Мошенничество",
    subtitle: "Обман, выманивание денег, поддельные услуги или фишинг.",
  },
  {
    id: "violence",
    title: "Насилие",
    subtitle: "Угрозы причинения вреда, сцены насилия или опасное поведение.",
  },
  {
    id: "illegal",
    title: "Незаконный контент",
    subtitle: "Запрещённые товары, услуги или иная незаконная активность.",
  },
  {
    id: "adult",
    title: "Контент 18+",
    subtitle: "Нежелательный сексуальный или откровенный контент.",
  },
  {
    id: "impersonation",
    title: "Выдаёт себя за другого",
    subtitle: "Поддельный профиль, кража личности или введение в заблуждение.",
  },
  {
    id: "self_harm",
    title: "Самоповреждение",
    subtitle: "Опасные сообщения о самоповреждении или подстрекательство.",
  },
  {
    id: "other",
    title: "Другая причина",
    subtitle: "Причины нет в списке — можно описать её вручную.",
  },
];

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeParse<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function readAllReports(): Promise<ChatReportItem[]> {
  try {
    const raw = await appStorage.getString(STORAGE_KEY);
    return safeParse<ChatReportItem[]>(raw, []);
  } catch {
    return [];
  }
}

async function writeAllReports(items: ChatReportItem[]) {
  try {
    await appStorage.setString(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // не падаем, даже если storage временно недоступен
  }
}

export async function submitChatReport(input: {
  chatId: string;
  chatName?: string;
  roomType?: string;
  reporterUserId?: string;
  targetUserId?: string;
  reasonId: ChatReportReasonId;
  details?: string;
}) {
  const nextItem: ChatReportItem = {
    id: randomId("report"),
    chatId: String(input.chatId || "").trim(),
    chatName: String(input.chatName || "").trim() || undefined,
    roomType: String(input.roomType || "").trim() || undefined,
    reporterUserId: String(input.reporterUserId || "").trim() || undefined,
    targetUserId: String(input.targetUserId || "").trim() || undefined,
    reasonId: input.reasonId,
    details: String(input.details || "").trim() || undefined,
    createdAt: nowIso(),
    status: "pending",
  };

  const current = await readAllReports();
  const next = [nextItem, ...current].sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  );

  await writeAllReports(next);
  return nextItem;
}

export async function listChatReports() {
  return (await readAllReports()).sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  );
}

export async function listChatReportsByChatId(chatId: string) {
  const normalized = String(chatId || "").trim();
  return (await listChatReports()).filter((item) => item.chatId === normalized);
}

export function getChatReportReasonById(reasonId: ChatReportReasonId) {
  return CHAT_REPORT_REASONS.find((item) => item.id === reasonId) ?? null;
}

export async function clearAllChatReports() {
  await writeAllReports([]);
}