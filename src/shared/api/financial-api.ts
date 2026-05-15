import { resolveSabiApiBaseUrl } from "./apiBaseUrl"

const API_BASE_URL =
  resolveSabiApiBaseUrl(undefined, { port: "4001" }).replace(/\/+$/, "")

type JsonRecord = Record<string, unknown>

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim().length > 0) {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

async function request<T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  })
  const contentType = response.headers.get("content-type") || ""
  const payload =
    contentType.includes("application/json") ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "reason" in payload
        ? String((payload as JsonRecord).reason)
        : typeof payload === "string"
          ? payload
          : `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return (typeof payload === "object" && payload && "data" in payload
    ? (payload as { data: T }).data
    : payload) as T
}

export type FinancialHistoryItem = {
  id: string
  kind: string
  status?: string
  amount: number
  currency: string
  createdAt: string
  transactionId?: string
  walletId?: string
  reference?: string
  sourceModule: string
  counterparty?: {
    walletId?: string
    userId?: string
  }
  metadata?: JsonRecord
}

export type FinancialHistoryResponse = {
  items: FinancialHistoryItem[]
  nextCursor?: string
}

export type FinancialOverviewWalletItem = {
  id: string
  type: string
  currency: string
  balance: number
  locked: boolean
  createdAt: string
}

export type FinancialOverviewResponse = {
  scope: {
    userId?: string
    walletId?: string
  }
  totals: {
    totalBalance: number
    walletCount: number
    lockedWalletCount: number
    qrCount: number
    paymentCount: number
    p2pCount: number
    walletOperationCount: number
    businessWalletCount: number
    merchantWalletCount: number
  }
  wallets: FinancialOverviewWalletItem[]
  defaultActions: string[]
}

export type FinancialItemDetailsResponse = {
  id: string
  kind: "transaction" | "payment" | "p2p" | "qr-payment" | "wallet-operation"
  status?: string
  amount?: number
  currency?: string
  createdAt?: string
  transactionId?: string
  walletId?: string
  reference?: string
  sourceModule: string
  payload: JsonRecord
}

export type FinancialDashboardResponse = {
  overview: FinancialOverviewResponse
  recentHistory: FinancialHistoryItem[]
  nextCursor?: string
  widgets: string[]
}

export async function getFinancialDashboard(input: {
  userId?: string
  walletId?: string
  historyLimit?: number
}) {
  return request<FinancialDashboardResponse>("/api/wallet/dashboard", undefined, input)
}

export async function getFinancialHistory(input: {
  userId?: string
  walletId?: string
  kind?: string
  status?: string
  cursor?: string
  limit?: number
}) {
  return request<FinancialHistoryResponse>("/api/wallet/history", undefined, input)
}

export async function getFinancialItemDetails(input: {
  kind: "transaction" | "payment" | "p2p" | "qr-payment" | "wallet-operation"
  id: string
}) {
  return request<FinancialItemDetailsResponse>(
    `/api/wallet/financial-item/${input.kind}/${input.id}`,
  )
}

export async function executeWalletP2P(input: {
  transferId: string
  fromUserId: string
  toUserId: string
  fromWalletId: string
  toWalletId: string
  amount: number
  currency?: string
  idempotencyKey: string
  reference?: string
  metadata?: JsonRecord
}) {
  return request<JsonRecord>("/api/p2p/execute-wallet-transfer", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function executeUniversalQr(input: {
  qrId: string
  actorUserId?: string
  payerWalletId?: string
  receiverWalletId?: string
  amount?: number
  currency?: string
  idempotencyKey: string
  routeOverride?: string
  metadata?: JsonRecord
}) {
  return request<JsonRecord>("/api/qr/execute", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function executePaymentToWallet(input: {
  paymentId: string
  providerPaymentId: string
  walletId: string
  userId: string
  amount: number
  currency?: string
  direction?: "capture" | "refund"
  idempotencyKey: string
  reference?: string
  metadata?: JsonRecord
}) {
  return request<JsonRecord>("/api/payments/execute-to-wallet", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export { API_BASE_URL }
