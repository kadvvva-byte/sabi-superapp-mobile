import type {
  MessengerKernelAuthScheme,
  MessengerKernelResolvedSessionSnapshot,
  MessengerKernelSessionSnapshot,
} from "../core/types";

export type {
  MessengerKernelAuthScheme,
  MessengerKernelResolvedSessionSnapshot,
  MessengerKernelSessionSnapshot,
};

export type MessengerKernelSessionResolver = () =>
  | Promise<MessengerKernelSessionSnapshot | null | undefined>
  | MessengerKernelSessionSnapshot
  | null
  | undefined;

export type MessengerKernelFetch = (
  input: RequestInfo | URL | string,
  init?: RequestInit,
) => Promise<Response>;

export type MessengerKernelSessionConfig = {
  resolveSession: MessengerKernelSessionResolver;
  fetchImpl?: MessengerKernelFetch;
  socketUrl?: string | null;
  socketPath?: string | null;
  authScheme?: MessengerKernelAuthScheme | null;
  query?: Record<string, unknown> | null;
  headers?: Record<string, string> | null;
};
