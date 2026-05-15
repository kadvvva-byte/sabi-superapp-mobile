import { useSyncExternalStore } from "react";
import {
  getAuthSessionState,
  isAuthenticatedSessionReady,
  subscribeAuthSessionState,
  type AuthSessionState,
} from "./session.store";

export type UseAuthSessionResult = AuthSessionState & {
  authenticated: boolean;
};

export function useAuthSession(): UseAuthSessionResult {
  const state = useSyncExternalStore(
    subscribeAuthSessionState,
    getAuthSessionState,
    getAuthSessionState,
  );

  return {
    ...state,
    authenticated: isAuthenticatedSessionReady(),
  };
}