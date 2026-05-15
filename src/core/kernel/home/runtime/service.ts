import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  bindHomeKernelRuntimeState,
  getHomeKernelState,
  patchHomeKernelState,
  setHomeKernelState,
} from "../core/store";
import type {
  HomeAccountSnapshot,
  HomeKernelState,
  HomeThemeMode,
} from "../core/types";
import {
  HOME_KERNEL_STORAGE_KEY,
  DEFAULT_CRYPTO_RATES,
  DEFAULT_DOCK_ITEMS,
  DEFAULT_FIAT_RATES,
  DEFAULT_HOME_ACCOUNT,
  DEFAULT_PINNED_MINI_APPS,
  LEGACY_HOME_BACKGROUND_KEY,
  buildHomeCards,
  cloneMiniApps,
  normalizeDockOrder,
  normalizeHomeOrder,
  normalizeHomePersistedState,
  isShareableHomeBackgroundUri,
  resolveBackgroundType,
  resolveThemeLabel,
  toPersistedHomeState,
  type HomeRuntimeStorage,
} from "./types";
import { profileKernelFacade } from "../../profile";
import {
  getAuthSessionState,
  isAuthenticatedSessionReady,
} from "../../auth/session.store";
import { getUnifiedAccountProfile } from "../../../../shared/account/unified-account-profile";

let bootPromise: Promise<HomeKernelState> | null = null;

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isGenericHomeDisplayName(value: unknown): boolean {
  const normalized = normalizeString(value).toLowerCase();
  return !normalized || normalized === "sabi user" || normalized === "sabi" || normalized === "user";
}

function normalizeUsernameText(value: unknown): string {
  return normalizeString(value).replace(/^@+/, "");
}

function extractFirstLetter(value: unknown): string {
  const raw = normalizeString(value);
  if (!raw) return "";
  const match = raw.match(/\p{L}/u);
  return match ? match[0].toUpperCase() : "";
}

function buildStableTenDigits(source: string) {
  const normalized = source.trim();
  if (!normalized) return "0000000000";
  let hash = 0n;
  for (const symbol of normalized) {
    const codePoint = symbol.codePointAt(0) ?? 0;
    hash = (hash * 131n + BigInt(codePoint)) % 10000000000n;
  }
  return hash.toString().padStart(10, "0");
}

function buildDisplaySabiId(input: {
  firstName?: string;
  lastName?: string;
  username?: string;
  userId?: string;
}) {
  const firstInitial = extractFirstLetter(input.firstName) || extractFirstLetter(input.username) || "S";
  const secondInitial = extractFirstLetter(input.lastName) || "B";
  const digits = buildStableTenDigits([
    input.userId || "",
    input.firstName || "",
    input.lastName || "",
    input.username || "",
  ].filter(Boolean).join("|"));
  return `${firstInitial}${secondInitial}${digits}`;
}

function getAuthAccountFallback() {
  const auth = getAuthSessionState();
  const currentUserId = normalizeString(auth.currentUserId);
  const phone = normalizeString(auth.phoneNumber);
  const source = currentUserId || phone;
  const suffix = buildStableTenDigits(source).slice(-6);

  return {
    userId: currentUserId || null,
    phone,
    firstName: "",
    lastName: "",
    fullName: source ? "Sabi User" : DEFAULT_HOME_ACCOUNT.fullName,
    username: source ? `user_${suffix}` : DEFAULT_HOME_ACCOUNT.username.replace(/^@+/, ""),
    avatarUri: null as string | null,
  };
}

function buildAccountSnapshot(): HomeAccountSnapshot {
  const kernelProfile = profileKernelFacade.getState();
  const kernelAccount = (kernelProfile.account ?? {}) as Record<string, unknown>;
  const authFallback = getAuthAccountFallback();

  const account = kernelAccount;
  const publicProfile = (kernelProfile.publicProfile ?? {}) as Record<string, unknown>;
  const firstName = normalizeString(account.firstName) || authFallback.firstName;
  const lastName = normalizeString(account.lastName) || authFallback.lastName;
  const accountFullName = normalizeString(account.fullName);
  const publicName = normalizeString(publicProfile.publicName);
  const usernameRaw = normalizeUsernameText(account.username) || authFallback.username;
  const fullName =
    (!isGenericHomeDisplayName(accountFullName) ? accountFullName : "") ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    (!isGenericHomeDisplayName(publicName) ? publicName : "") ||
    (!isGenericHomeDisplayName(usernameRaw) ? usernameRaw : "") ||
    authFallback.fullName;
  const username = usernameRaw ? `@${usernameRaw.replace(/^@+/, "")}` : DEFAULT_HOME_ACCOUNT.username;
  const userId = normalizeString(account.userId) || authFallback.userId || null;
  const phone =
    normalizeString(account.phone) ||
    normalizeString(kernelProfile.phoneChange?.currentPhone) ||
    authFallback.phone;
  const avatarUri = normalizeString(kernelProfile.avatarUri) || normalizeString(account.avatarUri) || authFallback.avatarUri;
  const avatarLetter =
    extractFirstLetter(firstName) ||
    extractFirstLetter(lastName) ||
    extractFirstLetter(usernameRaw) ||
    extractFirstLetter(fullName) ||
    DEFAULT_HOME_ACCOUNT.avatarLetter;
  const sabiId =
    normalizeString(account.sabiId) ||
    normalizeString(account.sabiDisplayId) ||
    buildDisplaySabiId({ firstName, lastName, username: usernameRaw, userId: userId || undefined });

  return {
    userId: userId || null,
    fullName,
    username,
    sabiId,
    phone,
    avatarUri: avatarUri || null,
    avatarLetter,
    firstName,
    lastName,
  };
}

async function tryUnifiedAccountSnapshot(): Promise<Partial<HomeAccountSnapshot>> {
  try {
    const authenticatedUserId = isAuthenticatedSessionReady()
      ? normalizeString(getAuthSessionState().currentUserId)
      : "";
    const profile = await getUnifiedAccountProfile();
    const record = profile && typeof profile === "object" ? (profile as Record<string, unknown>) : {};
    const profileUserId = normalizeString(record.userId);

    if (authenticatedUserId && profileUserId && profileUserId !== authenticatedUserId) {
      return {};
    }

    const firstName = normalizeString(record.firstName);
    const lastName = normalizeString(record.lastName);
    const usernameRaw = normalizeUsernameText(record.username);
    const fullName =
      normalizeString(record.fullName) ||
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      normalizeString(record.displayName) ||
      usernameRaw;
    const userId = profileUserId || authenticatedUserId;
    const phone = normalizeString(record.phone);
    const sabiId =
      normalizeString(record.sabiId) ||
      normalizeString(record.sabiDisplayId) ||
      (userId ? buildDisplaySabiId({ firstName, lastName, username: usernameRaw, userId }) : "");

    return {
      ...(userId ? { userId } : {}),
      ...(fullName ? { fullName } : {}),
      ...(usernameRaw ? { username: `@${usernameRaw.replace(/^@+/, "")}` } : {}),
      ...(phone ? { phone } : {}),
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(sabiId ? { sabiId } : {}),
    };
  } catch {
    return {};
  }
}


function parsePersistedHomeKernelState(raw: string | null): ReturnType<typeof normalizeHomePersistedState> {
  if (!raw) return normalizeHomePersistedState(null);

  try {
    return normalizeHomePersistedState(JSON.parse(raw));
  } catch {
    return normalizeHomePersistedState(null);
  }
}

function isPersistedStateAllowedForAccount(
  persisted: ReturnType<typeof normalizeHomePersistedState>,
  account: HomeAccountSnapshot,
) {
  const ownerUserId = normalizeString(persisted.ownerUserId);
  const accountUserId = normalizeString(account.userId);

  if (!accountUserId) {
    return !ownerUserId;
  }

  return Boolean(ownerUserId && ownerUserId === accountUserId);
}

async function readLegacyImageBackground(storage: HomeRuntimeStorage): Promise<string | null | undefined> {
  try {
    const raw = await storage.getItem(LEGACY_HOME_BACKGROUND_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { type?: unknown; uri?: unknown };
    const uri = typeof parsed.uri === "string" ? parsed.uri.trim() : "";
    return parsed.type === "image" && uri ? uri : undefined;
  } catch {
    return undefined;
  }
}

async function readPersistedHomeKernelRaw(storage: HomeRuntimeStorage): Promise<string | null> {
  try {
    return await storage.getItem(HOME_KERNEL_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function hydrateHomeKernelRuntime(storage: HomeRuntimeStorage = AsyncStorage): Promise<HomeKernelState> {
  const rawPersisted = parsePersistedHomeKernelState(await readPersistedHomeKernelRaw(storage));
  const account = {
    ...buildAccountSnapshot(),
    ...(await tryUnifiedAccountSnapshot()),
  };
  const persisted = isPersistedStateAllowedForAccount(rawPersisted, account)
    ? rawPersisted
    : normalizeHomePersistedState(null);
  const pinnedMiniApps = cloneMiniApps(persisted.pinnedMiniApps ?? DEFAULT_PINNED_MINI_APPS);
  const cards = buildHomeCards(pinnedMiniApps);
  const allCardIds = cards.map((item) => item.id);
  const hiddenCardIds = (persisted.hiddenCardIds ?? []).filter((id) => allCardIds.includes(id));
  const homeOrder = normalizeHomeOrder(persisted.homeOrder, cards, hiddenCardIds);
  const dockOrder = normalizeDockOrder(persisted.dockOrder, DEFAULT_DOCK_ITEMS);
  const themeMode: HomeThemeMode = persisted.themeMode ?? "brand";
  const legacyImageBackground = !normalizeString(account.userId) && persisted.imageBackground === undefined
    ? await readLegacyImageBackground(storage)
    : undefined;
  const resolvedImageBackground = persisted.imageBackground ?? legacyImageBackground ?? null;
  const imageBackground = isShareableHomeBackgroundUri(resolvedImageBackground) ? resolvedImageBackground : null;
  const next: Partial<HomeKernelState> = {
    isReady: true,
    runtimeStatus: "ready",
    lastError: null,
    selectedFiat: persisted.selectedFiat ?? "USD",
    selectedCrypto: persisted.selectedCrypto ?? "BTC",
    hiddenCardIds,
    homeOrder,
    dockOrder,
    layoutMode: persisted.layoutMode ?? "grid",
    pinnedMiniApps,
    cards,
    dockItems: DEFAULT_DOCK_ITEMS,
    fiatRates: DEFAULT_FIAT_RATES,
    cryptoRates: DEFAULT_CRYPTO_RATES,
    themeMode,
    imageBackground,
    backgroundType: resolveBackgroundType(imageBackground, themeMode),
    themeLabel: resolveThemeLabel(themeMode),
    account,
  };
  const state = bindHomeKernelRuntimeState(next);

  void persistHomeKernelRuntime(storage);

  return state;
}

export async function persistHomeKernelRuntime(storage: HomeRuntimeStorage = AsyncStorage): Promise<boolean> {
  try {
    const current = getHomeKernelState();
    await storage.setItem(HOME_KERNEL_STORAGE_KEY, JSON.stringify(toPersistedHomeState(current)));
    return true;
  } catch {
    patchHomeKernelState({ lastError: "home_state_persist_failed" });
    return false;
  }
}

export async function refreshHomeKernelAccount() {
  const account = {
    ...buildAccountSnapshot(),
    ...(await tryUnifiedAccountSnapshot()),
  };
  return patchHomeKernelState({ account });
}

export async function bootHomeKernelRuntime(): Promise<HomeKernelState> {
  if (bootPromise) return bootPromise;
  patchHomeKernelState({ runtimeStatus: "booting", lastError: null });
  bootPromise = hydrateHomeKernelRuntime().catch((error) => {
    const message = error instanceof Error ? error.message : "home_kernel_boot_failed";
    return setHomeKernelState((current) => ({ ...current, isReady: false, runtimeStatus: "error", lastError: message }));
  }).finally(() => {
    bootPromise = null;
  });
  return bootPromise;
}
