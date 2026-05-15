import {
  GiftRevenueRecord,
  GiftTransaction,
} from "../../messenger/gifts/giftTypes";
import {
  buildReceiverRevenueStateFromRecords,
  getLockedRevenueBalance,
  getReleasableRevenueBalance,
  getTransferredRevenueBalance,
  getVisibleRevenueBalance,
  GiftReceiverRevenueState,
  markRevenueRecordsReleasable,
  transferMonthlyReleasableRevenueToActiveBalance,
} from "../../messenger/gifts/giftTransactionEngine";

export type CoinGiftRevenueSourceProgram = "messenger" | "stream" | "both";

export type CoinGiftRevenueEntry = {
  id: string;

  revenueId: string;
  transactionId: string;
  receiverUserId: string;

  sourceProgram: CoinGiftRevenueSourceProgram;
  sourceType: "gift";

  giftId: string;

  grossCoinAmount: number;
  feeCoinAmount: number;
  netCoinAmount: number;

  status: GiftRevenueRecord["status"];

  receivedAt: string;
  visibleAt: string;
  lockedUntilMonthlyTransferAt?: string;
  releasableAt?: string;
  transferredAt?: string;
  withdrawnAt?: string;
};

export type CoinGiftEarningsSnapshot = {
  receiverUserId: string;

  totalVisible: number;
  totalLocked: number;
  totalReleasable: number;
  totalTransferred: number;

  entriesCount: number;
};

export type CoinGiftMonthlyTransferSummary = {
  receiverUserId: string;
  transferredNetAmount: number;
  updatedRevenueRecords: GiftRevenueRecord[];
  updatedReceiverState: GiftReceiverRevenueState;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function inferSourceProgramFromTransaction(
  transaction?: GiftTransaction | null,
): CoinGiftRevenueSourceProgram {
  if (!transaction) return "both";

  if (transaction.sourceProgram === "messenger") return "messenger";
  if (transaction.sourceProgram === "stream") return "stream";
  return "both";
}

export function mapGiftRevenueRecordToCoinEntry(params: {
  revenueRecord: GiftRevenueRecord;
  transaction?: GiftTransaction | null;
}): CoinGiftRevenueEntry {
  return {
    id: createId("coin_gift_entry"),
    revenueId: params.revenueRecord.revenueId,
    transactionId: params.revenueRecord.transactionId,
    receiverUserId: params.revenueRecord.receiverUserId,
    sourceProgram: inferSourceProgramFromTransaction(params.transaction),
    sourceType: "gift",
    giftId: params.revenueRecord.sourceGiftId,
    grossCoinAmount: params.revenueRecord.grossCoinAmount,
    feeCoinAmount: params.revenueRecord.feeCoinAmount,
    netCoinAmount: params.revenueRecord.netCoinAmount,
    status: params.revenueRecord.status,
    receivedAt: params.revenueRecord.receivedAt,
    visibleAt: params.revenueRecord.visibleAt,
    lockedUntilMonthlyTransferAt: params.revenueRecord.lockedUntilMonthlyTransferAt,
    releasableAt: params.revenueRecord.releasableAt,
    transferredAt: params.revenueRecord.transferredAt,
    withdrawnAt: params.revenueRecord.withdrawnAt,
  };
}

export function mapGiftRevenueRecordsToCoinEntries(params: {
  revenueRecords: GiftRevenueRecord[];
  transactions?: GiftTransaction[];
}): CoinGiftRevenueEntry[] {
  const transactionMap = new Map<string, GiftTransaction>();

  (params.transactions ?? []).forEach((transaction) => {
    transactionMap.set(transaction.transactionId, transaction);
  });

  return params.revenueRecords.map((record) =>
    mapGiftRevenueRecordToCoinEntry({
      revenueRecord: record,
      transaction: transactionMap.get(record.transactionId) ?? null,
    }),
  );
}

export function getCoinGiftEntriesForUser(
  entries: CoinGiftRevenueEntry[],
  receiverUserId: string,
): CoinGiftRevenueEntry[] {
  return entries.filter((entry) => entry.receiverUserId === receiverUserId);
}

export function getCoinGiftEntriesByStatus(
  entries: CoinGiftRevenueEntry[],
  status: GiftRevenueRecord["status"],
): CoinGiftRevenueEntry[] {
  return entries.filter((entry) => entry.status === status);
}

export function buildCoinGiftEarningsSnapshot(params: {
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
}): CoinGiftEarningsSnapshot {
  return {
    receiverUserId: params.receiverUserId,
    totalVisible: getVisibleRevenueBalance(
      params.revenueRecords,
      params.receiverUserId,
    ),
    totalLocked: getLockedRevenueBalance(
      params.revenueRecords,
      params.receiverUserId,
    ),
    totalReleasable: getReleasableRevenueBalance(
      params.revenueRecords,
      params.receiverUserId,
    ),
    totalTransferred: getTransferredRevenueBalance(
      params.revenueRecords,
      params.receiverUserId,
    ),
    entriesCount: params.revenueRecords.filter(
      (record) => record.receiverUserId === params.receiverUserId,
    ).length,
  };
}

export function buildCoinGiftReceiverState(params: {
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
  activeSpendableBalance?: number;
}): GiftReceiverRevenueState {
  return buildReceiverRevenueStateFromRecords({
    receiverUserId: params.receiverUserId,
    revenueRecords: params.revenueRecords,
    activeSpendableBalance: params.activeSpendableBalance ?? 0,
  });
}

/**
 * Gift income is visible immediately but cannot be moved into active balance
 * until the monthly release window.
 */
export function refreshCoinGiftRevenueStates(params: {
  revenueRecords: GiftRevenueRecord[];
  nowIso?: string;
}): GiftRevenueRecord[] {
  return markRevenueRecordsReleasable({
    revenueRecords: params.revenueRecords,
    nowIso: params.nowIso,
  });
}

/**
 * Hard rule:
 * transfer from visible/locked gift income to active balance is allowed only once per month.
 * This bridge performs the actual movement into active spendable balance after records become releasable.
 */
export function transferCoinGiftRevenueToActiveBalance(params: {
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
  activeSpendableBalance?: number;
  nowIso?: string;
}): CoinGiftMonthlyTransferSummary {
  const nowIso = params.nowIso ?? new Date().toISOString();

  const refreshedRecords = refreshCoinGiftRevenueStates({
    revenueRecords: params.revenueRecords,
    nowIso,
  });

  const receiverState = buildCoinGiftReceiverState({
    receiverUserId: params.receiverUserId,
    revenueRecords: refreshedRecords,
    activeSpendableBalance: params.activeSpendableBalance ?? 0,
  });

  const transferWindow = {
    userId: params.receiverUserId,
    monthKey: nowIso.slice(0, 7),
    isTransferAllowed: true,
    openedAt: nowIso,
    closedAt: undefined,
    transferCountUsed: 0,
    transferCountMax: 1 as const,
  };

  const result = transferMonthlyReleasableRevenueToActiveBalance({
    receiverState,
    revenueRecords: refreshedRecords,
    transferWindow,
    nowIso,
  });

  return {
    receiverUserId: params.receiverUserId,
    transferredNetAmount: result.transferredNetAmount,
    updatedRevenueRecords: result.updatedRevenueRecords,
    updatedReceiverState: result.updatedReceiverState,
  };
}

export function sortCoinGiftEntriesNewestFirst(
  entries: CoinGiftRevenueEntry[],
): CoinGiftRevenueEntry[] {
  return [...entries].sort((a, b) => {
    const aTime = new Date(a.visibleAt).getTime();
    const bTime = new Date(b.visibleAt).getTime();
    return bTime - aTime;
  });
}

export function sumCoinGiftNetAmount(
  entries: CoinGiftRevenueEntry[],
): number {
  return entries.reduce((sum, entry) => sum + entry.netCoinAmount, 0);
}

export function sumCoinGiftGrossAmount(
  entries: CoinGiftRevenueEntry[],
): number {
  return entries.reduce((sum, entry) => sum + entry.grossCoinAmount, 0);
}

export function sumCoinGiftFeeAmount(
  entries: CoinGiftRevenueEntry[],
): number {
  return entries.reduce((sum, entry) => sum + entry.feeCoinAmount, 0);
}