import { useSyncExternalStore } from "react";

import { assertCoinWalletProviderExecution } from "../../../shared/wallet/wallet-coin-bridge";
import {
  CoinDepositProduct,
  CoinDepositTermMonths,
  CoinHistoryRecord,
  CoinWalletState,
  DiamondHistoryRecord,
  DiamondSource,
  RecordStatus,
  VipStatus,
} from "./coinWalletTypes";

const BUY_RATE = 100; // 1 COIN = 100 DIAMONDS
const WITHDRAW_RATE = 130; // 130 DIAMONDS = 1 COIN
const LOCKED_APR = 16;

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(dateIso: string, days: number) {
  const date = new Date(dateIso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function addMonths(dateIso: string, months: number) {
  const date = new Date(dateIso);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function createInitialState(): CoinWalletState {
  return {
    availableCoin: 0,
    frozenCoin: 0,
    reservedCoin: 0,
    pendingCoin: 0,
    interestEarnedCoin: 0,

    spendableDiamonds: 0,
    withdrawableDiamonds: 0,
    gameEligibleDiamonds: 0,
    nonWithdrawableDiamonds: 0,

    vipStatus: "standard",
    lastDiamondWithdrawAt: null,

    coinHistory: [],
    diamondHistory: [],
    deposits: [],

    creditFoundation: {
      loansEnabled: false,
      reservedForFuture: true,
      repaymentSchedulesReady: true,
      riskStatesReady: true,
      creditHistoryReady: true,
      creditLimit: 0,
      availableCredit: 0,
      riskState: "none",
    },
  };
}

let state: CoinWalletState = createInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(updater: (current: CoinWalletState) => CoinWalletState) {
  state = updater(state);
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function appendCoinRecord(current: CoinWalletState, record: CoinHistoryRecord): CoinWalletState {
  return {
    ...current,
    coinHistory: [record, ...current.coinHistory],
  };
}

function appendDiamondRecord(
  current: CoinWalletState,
  record: DiamondHistoryRecord
): CoinWalletState {
  return {
    ...current,
    diamondHistory: [record, ...current.diamondHistory],
  };
}

function ensureCoinAvailable(current: CoinWalletState, amountCoin: number) {
  if (amountCoin <= 0) {
    throw new Error("Amount must be greater than zero.");
  }
  if (current.availableCoin < amountCoin) {
    throw new Error("Not enough available COIN.");
  }
}

function ensureDiamondsAvailable(current: CoinWalletState, diamonds: number) {
  if (diamonds <= 0) {
    throw new Error("Diamonds amount must be greater than zero.");
  }
  if (current.spendableDiamonds < diamonds) {
    throw new Error("Not enough spendable diamonds.");
  }
}

export function useCoinWalletStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getCoinWalletState() {
  return state;
}

export function resetCoinWalletState() {
  setState(() => createInitialState());
}

export function setVipStatus(vipStatus: VipStatus) {
  assertCoinWalletProviderExecution("setVipStatus");
  setState((current) => ({
    ...current,
    vipStatus,
  }));
}

export function topUpCoin(amountCoin: number, sourceLabel: string) {
  assertCoinWalletProviderExecution("topUpCoin");
  setState((current) => {
    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin + amountCoin),
    };

    return appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "topup",
      title: "coin.history.topup",
      subtitle: sourceLabel,
      amountCoin,
      direction: "in",
      status: "completed",
      createdAt: nowIso(),
    });
  });
}

export function sendCoin(amountCoin: number, recipientLabel: string) {
  assertCoinWalletProviderExecution("sendCoin");
  setState((current) => {
    ensureCoinAvailable(current, amountCoin);

    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin - amountCoin),
    };

    return appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "send",
      title: "coin.history.send",
      subtitle: recipientLabel,
      amountCoin,
      direction: "out",
      status: "completed",
      createdAt: nowIso(),
    });
  });
}

export function receiveCoin(amountCoin: number, senderLabel: string) {
  assertCoinWalletProviderExecution("receiveCoin");
  setState((current) => {
    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin + amountCoin),
    };

    return appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "receive",
      title: "coin.history.receive",
      subtitle: senderLabel,
      amountCoin,
      direction: "in",
      status: "completed",
      createdAt: nowIso(),
    });
  });
}

export function withdrawCoin(amountCoin: number, destinationLabel: string) {
  assertCoinWalletProviderExecution("withdrawCoin");
  setState((current) => {
    ensureCoinAvailable(current, amountCoin);

    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin - amountCoin),
    };

    return appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "coin_withdraw",
      title: "coin.history.withdraw",
      subtitle: destinationLabel,
      amountCoin,
      direction: "out",
      status: "processing",
      createdAt: nowIso(),
    });
  });
}

export function convertCoinToDiamonds(
  amountCoin: number,
  mode: "buy" | "convert",
  sourceLabel: string
) {
  assertCoinWalletProviderExecution("convertCoinToDiamonds");
  setState((current) => {
    ensureCoinAvailable(current, amountCoin);

    const diamonds = Math.round(amountCoin * BUY_RATE);
    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin - amountCoin),
      spendableDiamonds: current.spendableDiamonds + diamonds,
      gameEligibleDiamonds: current.gameEligibleDiamonds + diamonds,
    };

    const withCoinRecord = appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "coin_to_diamond",
      title: mode === "buy" ? "coin.history.diamondsBought" : "coin.history.coinConvertedToDiamonds",
      subtitle: sourceLabel,
      amountCoin,
      direction: "out",
      status: "completed",
      createdAt: nowIso(),
    });

    return appendDiamondRecord(withCoinRecord, {
      id: createId("diamond_history"),
      kind: mode === "buy" ? "diamond_purchase" : "coin_to_diamond",
      title: mode === "buy" ? "coin.history.diamondsPurchased" : "coin.history.coinConverted",
      subtitle: `${amountCoin.toLocaleString()} COIN → ${diamonds.toLocaleString()} Diamonds`,
      diamonds,
      status: "completed",
      source: "purchased",
      financial: true,
      createdAt: nowIso(),
    });
  });
}

function getWithdrawWindowDays(vipStatus: VipStatus) {
  return vipStatus === "vip" ? 7 : 30;
}

export function canWithdrawDiamondsNow(current: CoinWalletState = state) {
  if (current.withdrawableDiamonds < WITHDRAW_RATE) return false;
  if (!current.lastDiamondWithdrawAt) return true;

  const last = new Date(current.lastDiamondWithdrawAt);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const requiredMs = getWithdrawWindowDays(current.vipStatus) * 24 * 60 * 60 * 1000;
  return diffMs >= requiredMs;
}

export function getNextDiamondWithdrawDate(current: CoinWalletState = state) {
  if (!current.lastDiamondWithdrawAt) {
    return new Date().toISOString();
  }
  return addDays(current.lastDiamondWithdrawAt, getWithdrawWindowDays(current.vipStatus));
}

export function withdrawDiamondsToCoin(diamonds: number) {
  assertCoinWalletProviderExecution("withdrawDiamondsToCoin");
  setState((current) => {
    ensureDiamondsAvailable(current, diamonds);
    if (current.withdrawableDiamonds < diamonds) {
      throw new Error("Not enough withdrawable diamonds.");
    }
    if (!canWithdrawDiamondsNow(current)) {
      throw new Error("Withdraw window is not open yet.");
    }

    const amountCoin = Math.floor(diamonds / WITHDRAW_RATE);
    if (amountCoin <= 0) {
      throw new Error("Minimum withdraw amount is 130 Diamonds.");
    }

    const consumedDiamonds = amountCoin * WITHDRAW_RATE;

    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin + amountCoin),
      spendableDiamonds: current.spendableDiamonds - consumedDiamonds,
      withdrawableDiamonds: current.withdrawableDiamonds - consumedDiamonds,
      gameEligibleDiamonds: Math.max(0, current.gameEligibleDiamonds - consumedDiamonds),
      lastDiamondWithdrawAt: nowIso(),
    };

    const withCoinRecord = appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "diamond_to_coin",
      title: "Diamonds converted to Coin",
      subtitle: `${consumedDiamonds.toLocaleString()} Diamonds → ${amountCoin.toLocaleString()} COIN`,
      amountCoin,
      direction: "in",
      status: "completed",
      createdAt: nowIso(),
    });

    return appendDiamondRecord(withCoinRecord, {
      id: createId("diamond_history"),
      kind: "diamond_to_coin_withdraw",
      title: "coin.history.diamondWithdrawToCoin",
      subtitle: `Converted at 130 Diamonds = 1 COIN`,
      diamonds: consumedDiamonds,
      status: "completed",
      source: "earned_paid",
      financial: true,
      createdAt: nowIso(),
    });
  });
}

export function addPaidDiamondIncome(
  diamonds: number,
  title: string,
  subtitle: string,
  source: Extract<DiamondSource, "earned_paid" | "game_reward_paid">
) {
  assertCoinWalletProviderExecution("addPaidDiamondIncome");
  setState((current) => {
    const kind = source === "game_reward_paid" ? "game_reward_paid" : "gift_receive_paid_income";
    const next = {
      ...current,
      spendableDiamonds: current.spendableDiamonds + diamonds,
      withdrawableDiamonds: current.withdrawableDiamonds + diamonds,
      gameEligibleDiamonds: current.gameEligibleDiamonds + diamonds,
    };

    return appendDiamondRecord(next, {
      id: createId("diamond_history"),
      kind,
      title,
      subtitle,
      diamonds,
      status: "completed",
      source,
      financial: true,
      createdAt: nowIso(),
    });
  });
}

export function addNonIncomeDiamonds(
  diamonds: number,
  title: string,
  subtitle: string,
  source: Extract<DiamondSource, "game_reward_free" | "promo" | "bonus" | "free_non_income">
) {
  assertCoinWalletProviderExecution("addNonIncomeDiamonds");
  setState((current) => {
    const next = {
      ...current,
      spendableDiamonds: current.spendableDiamonds + diamonds,
      nonWithdrawableDiamonds: current.nonWithdrawableDiamonds + diamonds,
    };

    return appendDiamondRecord(next, {
      id: createId("diamond_history"),
      kind:
        source === "game_reward_free"
          ? "game_reward_free"
          : source === "promo"
          ? "promo_credit"
          : "gift_receive_free_non_income",
      title,
      subtitle,
      diamonds,
      status: "completed",
      source,
      financial: false,
      createdAt: nowIso(),
    });
  });
}

export function spendDiamonds(
  diamonds: number,
  title: string,
  subtitle: string,
  kind: DiamondHistoryRecord["kind"] = "gift_spend_paid"
) {
  assertCoinWalletProviderExecution("spendDiamonds");
  setState((current) => {
    ensureDiamondsAvailable(current, diamonds);

    const withdrawableReduction = Math.min(current.withdrawableDiamonds, diamonds);
    const gameEligibleReduction = Math.min(current.gameEligibleDiamonds, diamonds);
    const leftover = diamonds - withdrawableReduction;
    const nonWithdrawableReduction = Math.min(current.nonWithdrawableDiamonds, leftover);

    const next = {
      ...current,
      spendableDiamonds: current.spendableDiamonds - diamonds,
      withdrawableDiamonds: current.withdrawableDiamonds - withdrawableReduction,
      gameEligibleDiamonds: current.gameEligibleDiamonds - gameEligibleReduction,
      nonWithdrawableDiamonds: current.nonWithdrawableDiamonds - nonWithdrawableReduction,
    };

    return appendDiamondRecord(next, {
      id: createId("diamond_history"),
      kind,
      title,
      subtitle,
      diamonds,
      status: "completed",
      source: withdrawableReduction > 0 ? "earned_paid" : "purchased",
      financial: kind !== "gift_receive_free_non_income",
      createdAt: nowIso(),
    });
  });
}

export function openCoinDeposit(amountCoin: number, termMonths: CoinDepositTermMonths) {
  assertCoinWalletProviderExecution("openCoinDeposit");
  setState((current) => {
    ensureCoinAvailable(current, amountCoin);

    const createdAt = nowIso();
    const deposit: CoinDepositProduct = {
      id: createId("deposit"),
      amountCoin,
      apr: LOCKED_APR,
      termMonths,
      createdAt,
      maturityDate: addMonths(createdAt, termMonths),
      status: "active",
      interestPaidCoin: 0,
      nextInterestPayoutDate: addMonths(createdAt, 1),
    };

    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin - amountCoin),
      frozenCoin: roundToTwo(current.frozenCoin + amountCoin),
      deposits: [deposit, ...current.deposits],
    };

    return appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "deposit_open",
      title: "Coin deposit opened",
      subtitle: `${termMonths}-month lock at ${LOCKED_APR}% APR`,
      amountCoin,
      direction: "out",
      status: "completed",
      createdAt,
      relatedEntityId: deposit.id,
    });
  });
}

export function payoutDepositInterest(depositId: string) {
  assertCoinWalletProviderExecution("payoutDepositInterest");
  setState((current) => {
    const deposit = current.deposits.find((item) => item.id === depositId);
    if (!deposit || deposit.status !== "active") {
      throw new Error("Active deposit not found.");
    }

    const payout = roundToTwo((deposit.amountCoin * (deposit.apr / 100)) / 12);
    const paidAt = nowIso();

    const nextDeposits = current.deposits.map((item) => {
      if (item.id !== depositId) return item;
      return {
        ...item,
        interestPaidCoin: roundToTwo(item.interestPaidCoin + payout),
        nextInterestPayoutDate: addMonths(item.nextInterestPayoutDate, 1),
      };
    });

    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin + payout),
      interestEarnedCoin: roundToTwo(current.interestEarnedCoin + payout),
      deposits: nextDeposits,
    };

    return appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "interest_payout",
      title: "coin.history.depositInterestPayout",
      subtitle: `16% APR monthly payout`,
      amountCoin: payout,
      direction: "in",
      status: "completed",
      createdAt: paidAt,
      relatedEntityId: depositId,
    });
  });
}

export function releaseDeposit(depositId: string) {
  assertCoinWalletProviderExecution("releaseDeposit");
  setState((current) => {
    const deposit = current.deposits.find((item) => item.id === depositId);
    if (!deposit) {
      throw new Error("Deposit not found.");
    }

    const now = new Date();
    const maturity = new Date(deposit.maturityDate);
    if (now < maturity) {
      throw new Error("Deposit is still locked until maturity.");
    }

    const updatedDeposits = current.deposits.map((item) => {
      if (item.id !== depositId) return item;
      return {
        ...item,
        status: "released" as const,
      };
    });

    const next = {
      ...current,
      availableCoin: roundToTwo(current.availableCoin + deposit.amountCoin),
      frozenCoin: roundToTwo(current.frozenCoin - deposit.amountCoin),
      deposits: updatedDeposits,
    };

    const withMaturity = appendCoinRecord(next, {
      id: createId("coin_history"),
      kind: "deposit_matured",
      title: "Deposit matured",
      subtitle: `Principal unlocked after ${deposit.termMonths} months`,
      amountCoin: deposit.amountCoin,
      direction: "in",
      status: "completed",
      createdAt: nowIso(),
      relatedEntityId: depositId,
    });

    return appendCoinRecord(withMaturity, {
      id: createId("coin_history"),
      kind: "deposit_release",
      title: "coin.history.depositReleased",
      subtitle: `Principal moved back to available Coin`,
      amountCoin: deposit.amountCoin,
      direction: "in",
      status: "completed",
      createdAt: nowIso(),
      relatedEntityId: depositId,
    });
  });
}

export function getBuyRate() {
  return BUY_RATE;
}

export function getDiamondWithdrawRate() {
  return WITHDRAW_RATE;
}

export function getLockedDepositApr() {
  return LOCKED_APR;
}

export function getMonthlyDepositInterest(amountCoin: number) {
  return roundToTwo((amountCoin * (LOCKED_APR / 100)) / 12);
}

export function getProjectedDepositInterest(
  amountCoin: number,
  termMonths: CoinDepositTermMonths
) {
  return roundToTwo((amountCoin * (LOCKED_APR / 100) * termMonths) / 12);
}

export function getRecordStatusLabel(status: RecordStatus) {
  return status;
}
