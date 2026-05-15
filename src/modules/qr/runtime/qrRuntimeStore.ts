import type { SabiQrTokenRecord } from "../contracts/universalQr.contracts";

export type SabiQrRuntimeStatus =
  | "idle"
  | "generating"
  | "ready"
  | "scanning"
  | "resolving"
  | "validating"
  | "executing"
  | "pending_review"
  | "restricted"
  | "failed";

export type SabiQrRuntimeState = {
  status: SabiQrRuntimeStatus;
  activeToken: SabiQrTokenRecord | null;
  recentTokens: SabiQrTokenRecord[];
  lastError: string | null;
  updatedAt: string;
};

export type SabiQrRuntimeListener = (state: SabiQrRuntimeState) => void;

function nowIso() {
  return new Date().toISOString();
}

let state: SabiQrRuntimeState = {
  status: "idle",
  activeToken: null,
  recentTokens: [],
  lastError: null,
  updatedAt: nowIso(),
};

const listeners = new Set<SabiQrRuntimeListener>();

function notify() {
  listeners.forEach((listener) => listener(state));
}

export function getSabiQrRuntimeState(): SabiQrRuntimeState {
  return state;
}

export function patchSabiQrRuntimeState(patch: Partial<SabiQrRuntimeState>) {
  state = {
    ...state,
    ...patch,
    updatedAt: nowIso(),
  };
  notify();
  return state;
}

export function setSabiQrRuntimeToken(token: SabiQrTokenRecord) {
  const recentTokens = [token, ...state.recentTokens.filter((item) => item.tokenId !== token.tokenId)].slice(0, 20);
  return patchSabiQrRuntimeState({
    status: "ready",
    activeToken: token,
    recentTokens,
    lastError: null,
  });
}

export function setSabiQrRuntimeError(error: string) {
  return patchSabiQrRuntimeState({
    status: "failed",
    lastError: error,
  });
}

export function subscribeSabiQrRuntime(listener: SabiQrRuntimeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
