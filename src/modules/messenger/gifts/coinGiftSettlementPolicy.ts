import { GiftRevenueRecord } from "../../messenger/gifts/giftTypes";
import {
  buildReceiverRevenueStateFromRecords,
  GiftReceiverRevenueState,
  markRevenueRecordsReleasable,
  transferMonthlyReleasableRevenueToActiveBalance,
} from "../../messenger/gifts/giftTransactionEngine";

export type CoinGiftSettlementPolicyMode =
  | "monthly_transfer_only"
  | "manual_release_disabled"
  | "future_flexible";

export type CoinGiftSettlementPolicy = {
  policyId: string;
  title: string;
  mode: CoinGiftSettlementPolicyMode;

  receivedIncomeVisibleImmediately: true;
  spendableImmediately: false;
  transferableToActiveBalanceOncePerMonth: true;

  releaseWindowType: "monthly";
  maxTransfersPerMonth: 1;

  isEditableLater: true;
  isActive: boolean;
};

export type CoinGiftSettlementWindow = {
  receiverUserId: string;
  monthKey: string;

  isTransferAllowed: boolean;
  transferCountUsed: number;
  transferCountMax: 1;

  openedAt?: string;
  closedAt?: string;
};

export type CoinGiftSettlementSnapshot = {
  receiverUserId: string;

  visibleTotal: number;
  lockedTotal: number;
  releasableTotal: number;
  transferredTotal: number;

  activeSpendableBalance: number;
  totalRecords: number;
};

export type CoinGiftSettlementEvaluation = {
  policy: CoinGiftSettlementPolicy;
  window: CoinGiftSettlementWindow;
  receiverState: GiftReceiverRevenueState;
  refreshedRevenueRecords: GiftRevenueRecord[];
  snapshot: CoinGiftSettlementSnapshot;
};

export type CoinGiftSettlementTransferResult = {
  policy: CoinGiftSettlementPolicy;
  window: CoinGiftSettlementWindow;
  transferredNetAmount: number;
  updatedRevenueRecords: GiftRevenueRecord[];
  updatedReceiverState: GiftReceiverRevenueState;
  snapshotAfterTransfer: CoinGiftSettlementSnapshot;
};

export const DEFAULT_COIN_GIFT_SETTLEMENT_POLICY: CoinGiftSettlementPolicy = {
  policyId: "coin_gift_monthly_transfer_policy_v1",
  title: "Coin Gift Monthly Transfer Policy",
  mode: "monthly_transfer_only",
  receivedIncomeVisibleImmediately: true,
  spendableImmediately: false,
  transferableToActiveBalanceOncePerMonth: true,
  releaseWindowType: "monthly",
  maxTransfersPerMonth: 1,
  isEditableLater: true,
  isActive: true,
};

function toMonthKey(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function sumRevenueByStatus(
  records: GiftRevenueRecord[],
  receiverUserId: string,
  status: GiftRevenueRecord["status"],
): number {
  return records
    .filter(
      (record) => record.receiverUserId === receiverUserId && record.status === status,
    )
    .reduce((sum, record) => sum + record.netCoinAmount, 0);
}

function sumVisibleRevenue(
  records: GiftRevenueRecord[],
  receiverUserId: string,
): number {
  return records
    .filter((record) => record.receiverUserId === receiverUserId)
    .reduce((sum, record) => sum + record.netCoinAmount, 0);
}

export function buildCoinGiftSettlementWindow(params: {
  receiverUserId: string;
  nowIso?: string;
  transferCountUsed?: number;
  policy?: CoinGiftSettlementPolicy;
}): CoinGiftSettlementWindow {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const policy = params.policy ?? DEFAULT_COIN_GIFT_SETTLEMENT_POLICY;
  const transferCountUsed = params.transferCountUsed ?? 0;

  return {
    receiverUserId: params.receiverUserId,
    monthKey: toMonthKey(nowIso),
    isTransferAllowed:
      policy.isActive &&
      policy.transferableToActiveBalanceOncePerMonth &&
      transferCountUsed < policy.maxTransfersPerMonth,
    transferCountUsed,
    transferCountMax: 1,
    openedAt: nowIso,
    closedAt: undefined,
  };
}

export function buildCoinGiftSettlementSnapshot(params: {
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
  activeSpendableBalance?: number;
}): CoinGiftSettlementSnapshot {
  return {
    receiverUserId: params.receiverUserId,
    visibleTotal: sumVisibleRevenue(params.revenueRecords, params.receiverUserId),
    lockedTotal: sumRevenueByStatus(params.revenueRecords, params.receiverUserId, "locked"),
    releasableTotal: sumRevenueByStatus(
      params.revenueRecords,
      params.receiverUserId,
      "releasable",
    ),
    transferredTotal: sumRevenueByStatus(
      params.revenueRecords,
      params.receiverUserId,
      "transferred",
    ),
    activeSpendableBalance: params.activeSpendableBalance ?? 0,
    totalRecords: params.revenueRecords.filter(
      (record) => record.receiverUserId === params.receiverUserId,
    ).length,
  };
}

export function evaluateCoinGiftSettlement(params: {
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
  activeSpendableBalance?: number;
  nowIso?: string;
  transferCountUsed?: number;
  policy?: CoinGiftSettlementPolicy;
}): CoinGiftSettlementEvaluation {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const policy = params.policy ?? DEFAULT_COIN_GIFT_SETTLEMENT_POLICY;

  const refreshedRevenueRecords = markRevenueRecordsReleasable({
    revenueRecords: params.revenueRecords,
    nowIso,
  });

  const receiverState = buildReceiverRevenueStateFromRecords({
    receiverUserId: params.receiverUserId,
    revenueRecords: refreshedRevenueRecords,
    activeSpendableBalance: params.activeSpendableBalance ?? 0,
  });

  const window = buildCoinGiftSettlementWindow({
    receiverUserId: params.receiverUserId,
    nowIso,
    transferCountUsed: params.transferCountUsed ?? 0,
    policy,
  });

  const snapshot = buildCoinGiftSettlementSnapshot({
    receiverUserId: params.receiverUserId,
    revenueRecords: refreshedRevenueRecords,
    activeSpendableBalance: receiverState.activeSpendableBalance,
  });

  return {
    policy,
    window,
    receiverState,
    refreshedRevenueRecords,
    snapshot,
  };
}

export function transferCoinGiftSettlementOncePerMonth(params: {
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
  activeSpendableBalance?: number;
  nowIso?: string;
  transferCountUsed?: number;
  policy?: CoinGiftSettlementPolicy;
}): CoinGiftSettlementTransferResult {
  const evaluation = evaluateCoinGiftSettlement({
    receiverUserId: params.receiverUserId,
    revenueRecords: params.revenueRecords,
    activeSpendableBalance: params.activeSpendableBalance ?? 0,
    nowIso: params.nowIso,
    transferCountUsed: params.transferCountUsed ?? 0,
    policy: params.policy,
  });

  const result = transferMonthlyReleasableRevenueToActiveBalance({
    receiverState: evaluation.receiverState,
    revenueRecords: evaluation.refreshedRevenueRecords,
    transferWindow: {
      userId: evaluation.window.receiverUserId,
      monthKey: evaluation.window.monthKey,
      isTransferAllowed: evaluation.window.isTransferAllowed,
      openedAt: evaluation.window.openedAt,
      closedAt: evaluation.window.closedAt,
      transferCountUsed: evaluation.window.transferCountUsed,
      transferCountMax: evaluation.window.transferCountMax,
    },
    nowIso: params.nowIso ?? new Date().toISOString(),
  });

  const snapshotAfterTransfer = buildCoinGiftSettlementSnapshot({
    receiverUserId: params.receiverUserId,
    revenueRecords: result.updatedRevenueRecords,
    activeSpendableBalance: result.updatedReceiverState.activeSpendableBalance,
  });

  return {
    policy: evaluation.policy,
    window: evaluation.window,
    transferredNetAmount: result.transferredNetAmount,
    updatedRevenueRecords: result.updatedRevenueRecords,
    updatedReceiverState: result.updatedReceiverState,
    snapshotAfterTransfer,
  };
}

/**
 * Hard policy check for current phase:
 * gift income can be visible immediately,
 * but cannot be used directly after arrival.
 */
export function isCoinGiftIncomeSpendableImmediately(
  policy: CoinGiftSettlementPolicy = DEFAULT_COIN_GIFT_SETTLEMENT_POLICY,
): boolean {
  return policy.spendableImmediately;
}

/**
 * Hard policy check for current phase:
 * transfer to active balance is allowed only once per month.
 */
export function canTransferCoinGiftIncomeThisMonth(params: {
  transferCountUsed: number;
  policy?: CoinGiftSettlementPolicy;
}): boolean {
  const policy = params.policy ?? DEFAULT_COIN_GIFT_SETTLEMENT_POLICY;

  return (
    policy.isActive &&
    policy.transferableToActiveBalanceOncePerMonth &&
    params.transferCountUsed < policy.maxTransfersPerMonth
  );
}

/**
 * Prepared for future changes without breaking the current monthly rule.
 */
export function cloneCoinGiftSettlementPolicy(
  overrides?: Partial<CoinGiftSettlementPolicy>,
): CoinGiftSettlementPolicy {
  return {
    ...DEFAULT_COIN_GIFT_SETTLEMENT_POLICY,
    ...overrides,
  };
}