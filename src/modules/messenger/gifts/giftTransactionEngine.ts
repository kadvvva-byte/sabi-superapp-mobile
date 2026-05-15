import {
  GiftCatalogItem,
  GiftIdentityValidation,
  GiftMonthlyTransferWindow,
  GiftRevenueRecord,
  GiftRevenueStatus,
  GiftSendRequest,
  GiftSendValidationResult,
  GiftTransaction,
  GiftTransactionStatus,
  UnifiedUserIdentity,
} from "./giftTypes";
import {
  DEFAULT_GIFT_FEE_RATE_BPS,
  DEFAULT_GIFT_MONTHLY_TRANSFER_LIMIT,
  getGiftFeeCoinAmount,
  getGiftNetCoinAmount,
} from "./giftTierRules";

export type GiftBalanceSnapshot = {
  visibleBalance: number;
  activeSpendableBalance: number;
};

export type GiftSenderWalletState = {
  userId: string;
  coinBalance: number;
};

export type GiftReceiverRevenueState = {
  userId: string;
  visibleRevenueBalance: number;
  activeSpendableBalance: number;
};

export type GiftTransactionCreateParams = {
  sendRequest: GiftSendRequest;
  gift: GiftCatalogItem;

  senderWalletState: GiftSenderWalletState;
  receiverRevenueState: GiftReceiverRevenueState;

  feeRateBps?: number;
  nowIso?: string;
};

export type GiftTransactionEngineResult = {
  transaction: GiftTransaction;
  revenueRecord?: GiftRevenueRecord;
  senderWalletStateAfter: GiftSenderWalletState;
  receiverRevenueStateAfter: GiftReceiverRevenueState;
};

export type GiftIdentityValidationParams = {
  senderIdentity: UnifiedUserIdentity;
  receiverIdentity?: UnifiedUserIdentity | null;
};

export type GiftRevenueTransferResult = {
  updatedRevenueRecords: GiftRevenueRecord[];
  updatedReceiverState: GiftReceiverRevenueState;
  transferredNetAmount: number;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toMonthKey(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function startOfNextMonthIso(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const next = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  return next.toISOString();
}

export function validateUnifiedGiftIdentity(
  params: GiftIdentityValidationParams,
): GiftIdentityValidation {
  const { senderIdentity, receiverIdentity } = params;

  if (
    !senderIdentity.userId ||
    !senderIdentity.messengerUserId ||
    !senderIdentity.streamUserId
  ) {
    return {
      isUnifiedIdentityValid: false,
      reason: "missing_user_id",
    };
  }

  if (senderIdentity.userId !== senderIdentity.messengerUserId) {
    return {
      isUnifiedIdentityValid: false,
      reason: "messenger_stream_id_mismatch",
    };
  }

  if (senderIdentity.userId !== senderIdentity.streamUserId) {
    return {
      isUnifiedIdentityValid: false,
      reason: "messenger_stream_id_mismatch",
    };
  }

  if (receiverIdentity) {
    if (
      !receiverIdentity.userId ||
      !receiverIdentity.messengerUserId ||
      !receiverIdentity.streamUserId
    ) {
      return {
        isUnifiedIdentityValid: false,
        reason: "missing_user_id",
      };
    }

    if (receiverIdentity.userId !== receiverIdentity.messengerUserId) {
      return {
        isUnifiedIdentityValid: false,
        reason: "messenger_stream_id_mismatch",
      };
    }

    if (receiverIdentity.userId !== receiverIdentity.streamUserId) {
      return {
        isUnifiedIdentityValid: false,
        reason: "messenger_stream_id_mismatch",
      };
    }
  }

  return {
    isUnifiedIdentityValid: true,
  };
}

export function validateGiftSendRequest(params: {
  sendRequest: GiftSendRequest;
  gift: GiftCatalogItem | null | undefined;
  senderWalletState: GiftSenderWalletState;
}): GiftSendValidationResult {
  const { sendRequest, gift, senderWalletState } = params;

  const identityValidation = validateUnifiedGiftIdentity({
    senderIdentity: sendRequest.senderIdentity,
    receiverIdentity: sendRequest.receiverIdentity ?? null,
  });

  if (!identityValidation.isUnifiedIdentityValid) {
    return {
      canSend: false,
      reason: "identity_mismatch",
    };
  }

  if (!gift) {
    return {
      canSend: false,
      reason: "gift_not_active",
    };
  }

  if (gift.lifecycle !== "active") {
    return {
      canSend: false,
      reason: "gift_not_active",
    };
  }

  if (!(gift.availableIn === "both" || gift.availableIn === sendRequest.sourceProgram)) {
    return {
      canSend: false,
      reason: "gift_not_available_in_program",
    };
  }

  if (!sendRequest.receiverUserId) {
    return {
      canSend: false,
      reason: "receiver_missing",
    };
  }

  if (senderWalletState.coinBalance < gift.priceCoin) {
    return {
      canSend: false,
      reason: "insufficient_balance",
    };
  }

  return {
    canSend: true,
  };
}

export function createGiftRevenueRecord(params: {
  transaction: GiftTransaction;
  nowIso?: string;
}): GiftRevenueRecord {
  const nowIso = params.nowIso ?? params.transaction.completedAt ?? params.transaction.createdAt;
  const releasableAt = startOfNextMonthIso(nowIso);

  return {
    revenueId: createId("gift_revenue"),
    transactionId: params.transaction.transactionId,
    receiverUserId: params.transaction.receiverUserId,
    sourceType: "gift",
    sourceGiftId: params.transaction.giftId,
    currency: "COIN",
    grossCoinAmount: params.transaction.grossCoinAmount,
    feeCoinAmount: params.transaction.feeCoinAmount,
    netCoinAmount: params.transaction.netCoinAmount,
    status: "locked",
    receivedAt: nowIso,
    visibleAt: nowIso,
    lockedUntilMonthlyTransferAt: releasableAt,
    releasableAt,
    transferredAt: undefined,
    withdrawnAt: undefined,
  };
}

export function createGiftTransaction(
  params: GiftTransactionCreateParams,
): GiftTransactionEngineResult {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const feeRateBps = params.feeRateBps ?? DEFAULT_GIFT_FEE_RATE_BPS;

  const validation = validateGiftSendRequest({
    sendRequest: params.sendRequest,
    gift: params.gift,
    senderWalletState: params.senderWalletState,
  });

  const baseTransaction: GiftTransaction = {
    transactionId: createId("gift_tx"),
    sourceProgram: params.sendRequest.sourceProgram,
    sourceRewardType: "direct_purchase",
    sourceGameType: params.sendRequest.sourceGameType ?? null,
    chatId: params.sendRequest.chatId ?? null,
    streamSessionId: params.sendRequest.streamSessionId ?? null,
    senderUserId: params.sendRequest.senderUserId,
    receiverUserId: params.sendRequest.receiverUserId,
    senderIdentityUserId: params.sendRequest.senderIdentity.userId,
    receiverIdentityUserId:
      params.sendRequest.receiverIdentity?.userId ?? params.sendRequest.receiverUserId,
    giftId: params.gift.id,
    giftTitleSnapshot: params.gift.title,
    giftShortLabelSnapshot: params.gift.shortLabel,
    giftTierSnapshot: params.gift.tier,
    giftCategorySnapshot: params.gift.category,
    rewardTierSnapshot: params.gift.rewardTier,
    currency: "COIN",
    grossCoinAmount: params.gift.priceCoin,
    feeCoinAmount: getGiftFeeCoinAmount(params.gift.priceCoin, feeRateBps),
    netCoinAmount: getGiftNetCoinAmount(params.gift.priceCoin, feeRateBps),
    feeRateBps,
    senderBalanceBefore: params.senderWalletState.coinBalance,
    senderBalanceAfter: params.senderWalletState.coinBalance,
    receiverVisibleBalanceBefore: params.receiverRevenueState.visibleRevenueBalance,
    receiverVisibleBalanceAfter: params.receiverRevenueState.visibleRevenueBalance,
    status: "created",
    createdAt: nowIso,
    processedAt: undefined,
    completedAt: undefined,
    failedAt: undefined,
    reversedAt: undefined,
    failureReason: undefined,
  };

  if (!validation.canSend) {
    const blockedStatus: GiftTransactionStatus =
      validation.reason === "identity_mismatch"
        ? "blocked_identity_mismatch"
        : validation.reason === "policy_blocked"
          ? "blocked_policy"
          : "failed";

    const failedTransaction: GiftTransaction = {
      ...baseTransaction,
      status: blockedStatus,
      failedAt: nowIso,
      failureReason: validation.reason,
    };

    return {
      transaction: failedTransaction,
      revenueRecord: undefined,
      senderWalletStateAfter: { ...params.senderWalletState },
      receiverRevenueStateAfter: { ...params.receiverRevenueState },
    };
  }

  const senderWalletStateAfter: GiftSenderWalletState = {
    ...params.senderWalletState,
    coinBalance: params.senderWalletState.coinBalance - params.gift.priceCoin,
  };

  const receiverRevenueStateAfter: GiftReceiverRevenueState = {
    ...params.receiverRevenueState,
    visibleRevenueBalance:
      params.receiverRevenueState.visibleRevenueBalance + baseTransaction.netCoinAmount,
  };

  const completedTransaction: GiftTransaction = {
    ...baseTransaction,
    senderBalanceAfter: senderWalletStateAfter.coinBalance,
    receiverVisibleBalanceAfter: receiverRevenueStateAfter.visibleRevenueBalance,
    status: "completed",
    processedAt: nowIso,
    completedAt: nowIso,
  };

  const revenueRecord = createGiftRevenueRecord({
    transaction: completedTransaction,
    nowIso,
  });

  return {
    transaction: completedTransaction,
    revenueRecord,
    senderWalletStateAfter,
    receiverRevenueStateAfter,
  };
}

export function markRevenueRecordsReleasable(params: {
  revenueRecords: GiftRevenueRecord[];
  nowIso?: string;
}): GiftRevenueRecord[] {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const nowTime = new Date(nowIso).getTime();

  return params.revenueRecords.map((record) => {
    if (record.status !== "locked") return record;
    if (!record.releasableAt) return record;

    const releasableTime = new Date(record.releasableAt).getTime();
    if (Number.isNaN(releasableTime)) return record;
    if (nowTime < releasableTime) return record;

    return {
      ...record,
      status: "releasable",
    };
  });
}

export function buildMonthlyTransferWindow(params: {
  userId: string;
  nowIso?: string;
  transferCountUsed?: number;
}): GiftMonthlyTransferWindow {
  const nowIso = params.nowIso ?? new Date().toISOString();
  const monthKey = toMonthKey(nowIso);
  const transferCountUsed = params.transferCountUsed ?? 0;

  return {
    userId: params.userId,
    monthKey,
    isTransferAllowed: transferCountUsed < DEFAULT_GIFT_MONTHLY_TRANSFER_LIMIT,
    openedAt: nowIso,
    closedAt: undefined,
    transferCountUsed,
    transferCountMax: DEFAULT_GIFT_MONTHLY_TRANSFER_LIMIT,
  };
}

export function transferMonthlyReleasableRevenueToActiveBalance(params: {
  receiverState: GiftReceiverRevenueState;
  revenueRecords: GiftRevenueRecord[];
  transferWindow: GiftMonthlyTransferWindow;
  nowIso?: string;
}): GiftRevenueTransferResult {
  const nowIso = params.nowIso ?? new Date().toISOString();

  if (!params.transferWindow.isTransferAllowed) {
    return {
      updatedRevenueRecords: params.revenueRecords,
      updatedReceiverState: params.receiverState,
      transferredNetAmount: 0,
    };
  }

  const releasableRecords = params.revenueRecords.filter(
    (record) =>
      record.receiverUserId === params.receiverState.userId && record.status === "releasable",
  );

  const transferredNetAmount = releasableRecords.reduce(
    (sum, record) => sum + record.netCoinAmount,
    0,
  );

  if (transferredNetAmount <= 0) {
    return {
      updatedRevenueRecords: params.revenueRecords,
      updatedReceiverState: params.receiverState,
      transferredNetAmount: 0,
    };
  }

  const releasableIds = new Set(releasableRecords.map((record) => record.revenueId));

  const updatedRevenueRecords = params.revenueRecords.map((record) => {
    if (!releasableIds.has(record.revenueId)) return record;

    return {
      ...record,
      status: "transferred" as GiftRevenueStatus,
      transferredAt: nowIso,
    };
  });

  const updatedReceiverState: GiftReceiverRevenueState = {
    ...params.receiverState,
    activeSpendableBalance:
      params.receiverState.activeSpendableBalance + transferredNetAmount,
  };

  return {
    updatedRevenueRecords,
    updatedReceiverState,
    transferredNetAmount,
  };
}

export function getVisibleRevenueBalance(records: GiftRevenueRecord[], receiverUserId: string): number {
  return records
    .filter((record) => record.receiverUserId === receiverUserId)
    .reduce((sum, record) => sum + record.netCoinAmount, 0);
}

export function getLockedRevenueBalance(records: GiftRevenueRecord[], receiverUserId: string): number {
  return records
    .filter(
      (record) => record.receiverUserId === receiverUserId && record.status === "locked",
    )
    .reduce((sum, record) => sum + record.netCoinAmount, 0);
}

export function getReleasableRevenueBalance(
  records: GiftRevenueRecord[],
  receiverUserId: string,
): number {
  return records
    .filter(
      (record) =>
        record.receiverUserId === receiverUserId && record.status === "releasable",
    )
    .reduce((sum, record) => sum + record.netCoinAmount, 0);
}

export function getTransferredRevenueBalance(
  records: GiftRevenueRecord[],
  receiverUserId: string,
): number {
  return records
    .filter(
      (record) =>
        record.receiverUserId === receiverUserId && record.status === "transferred",
    )
    .reduce((sum, record) => sum + record.netCoinAmount, 0);
}

export function buildReceiverRevenueStateFromRecords(params: {
  receiverUserId: string;
  revenueRecords: GiftRevenueRecord[];
  activeSpendableBalance?: number;
}): GiftReceiverRevenueState {
  const visibleRevenueBalance = getVisibleRevenueBalance(
    params.revenueRecords,
    params.receiverUserId,
  );

  return {
    userId: params.receiverUserId,
    visibleRevenueBalance,
    activeSpendableBalance: params.activeSpendableBalance ?? 0,
  };
}