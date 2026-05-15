import { getAuthSessionState } from "../../../core/kernel/auth/session.store";
import { resolveSabiApiBaseUrl } from "../../../shared/api/apiBaseUrl";

export type QrResolveResponse = {
  route: "sabi_merchant_payment" | "sabi_user_transfer" | "coin_send" | "coin_receive";
  payload: {
    version?: string;
    rail: "sabi_wallet" | "coin_wallet";
    domain: string;
    payloadType: "merchant_payment" | "user_transfer" | "coin_send" | "coin_receive";
    destinationId: string;
    amount?: string;
    currency?: string;
    reference?: string;
    signature?: string;
    expiresAt?: string;
    issuer?: string;
  };
};

export type QrValidateResponse = {
  valid: boolean;
  reason?: string;
};

export type QrExecuteResponse = {
  ok: boolean;
  status: "success" | "failed";
  transactionId?: string;
  reason?: string;
};

function getApiBase(): string {
  return resolveSabiApiBaseUrl(getAuthSessionState().apiBaseUrl);
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : (data?.message as string | undefined) ??
          (data?.reason as string | undefined) ??
          "Request failed";
    throw new Error(message);
  }

  return data as T;
}

export async function resolveQr(rawPayload: string): Promise<QrResolveResponse> {
  return requestJson<QrResolveResponse>("/api/qr/resolve", {
    method: "POST",
    body: JSON.stringify({ rawPayload }),
  });
}

export async function validateQr(signature?: string, expiresAt?: string): Promise<QrValidateResponse> {
  return requestJson<QrValidateResponse>("/api/qr/validate", {
    method: "POST",
    body: JSON.stringify({
      signature,
      expiresAt,
      strictSignature: false,
    }),
  });
}

export async function executeQr(params: {
  rawPayload: string;
  actorId?: string;
  payerWalletId?: string;
  receiverWalletId?: string;
  idempotencyKey?: string;
}): Promise<QrExecuteResponse> {
  return requestJson<QrExecuteResponse>("/api/qr/execute", {
    method: "POST",
    headers: params.idempotencyKey ? { "Idempotency-Key": params.idempotencyKey } : {},
    body: JSON.stringify({
      rawPayload: params.rawPayload,
      actorId: params.actorId,
      payerWalletId: params.payerWalletId,
      receiverWalletId: params.receiverWalletId,
      idempotencyKey: params.idempotencyKey,
      strictSignature: false,
    }),
  });
}
