import * as Contacts from "expo-contacts";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

type SaveChatPartnerToSystemContactsArgs = {
  name: string;
  phone?: string;
  username?: string;
  company?: string;
};

type SaveChatPartnerToSystemContactsResult = {
  ok: boolean;
  contactId?: string;
};

type RequestPinnedChatShortcutArgs = {
  chatId: string;
  name: string;
  roomType?: string;
  avatarLetter?: string;
};

type RequestPinnedChatShortcutResult = boolean;

function normalizePhone(value?: string | null) {
  return String(value ?? "").trim();
}

function normalizeHandle(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function sanitizeFileName(value?: string | null) {
  const raw = String(value ?? "").trim();
  const safe = raw.replace(/[\\/:*?"<>|]+/g, "_");
  return safe || "chat-export.txt";
}

export async function saveChatPartnerToSystemContacts(
  args: SaveChatPartnerToSystemContactsArgs,
): Promise<SaveChatPartnerToSystemContactsResult> {
  const name = String(args.name ?? "").trim();
  const phone = normalizePhone(args.phone);
  const username = normalizeHandle(args.username);
  const company = String(args.company ?? "").trim();

  if (!name) {
    throw new Error("Contact name is required.");
  }

  if (!phone && !username) {
    throw new Error("Phone or username is required.");
  }

  const permission = await Contacts.requestPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("Contacts permission was not granted.");
  }

  const noteValue = username ? `Sabi Messenger ${username}` : "Sabi Messenger";

  const contactPayload: Contacts.Contact = {
    contactType: Contacts.ContactTypes.Person,
    firstName: name,
    name,
    company: company || undefined,
    phoneNumbers: phone
      ? [
          {
            number: phone,
            label: "mobile",
            isPrimary: true,
          },
        ]
      : [],
    note: noteValue,
  };

  const contactId = await Contacts.addContactAsync(contactPayload);

  return {
    ok: true,
    contactId,
  };
}

export async function shareChatExport(params: {
  fileName: string;
  content: string;
  mimeType?: string;
}) {
  const fileName =
    sanitizeFileName(params.fileName || "chat-export.txt") || "chat-export.txt";
  const mimeType = String(params.mimeType || "text/plain").trim() || "text/plain";
  const content = String(params.content ?? "");
  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

  if (!baseDir) {
    throw new Error("File system directory is unavailable.");
  }

  const targetUri = `${baseDir}${fileName}`;

  await FileSystem.writeAsStringAsync(targetUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return {
      ok: false,
      uri: targetUri,
    };
  }

  await Sharing.shareAsync(targetUri, {
    mimeType,
    dialogTitle: fileName,
    UTI: mimeType,
  });

  return {
    ok: true,
    uri: targetUri,
  };
}

export async function requestPinnedChatShortcut(
  _args: RequestPinnedChatShortcutArgs,
): Promise<RequestPinnedChatShortcutResult> {
  return false;
}