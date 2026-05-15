import {
  CoinDepositProduct,
  CoinDepositTermMonths,
  CoinHistoryRecord,
  CoinWalletState,
  DiamondHistoryRecord,
} from "./coinWalletTypes";
import {
  canWithdrawDiamondsNow,
  getBuyRate,
  getDiamondWithdrawRate,
  getLockedDepositApr,
  getMonthlyDepositInterest,
  getNextDiamondWithdrawDate,
  getProjectedDepositInterest,
} from "./coinWalletStore";

export function selectTotalCoin(state: CoinWalletState) {
  return (
    state.availableCoin +
    state.frozenCoin +
    state.reservedCoin +
    state.pendingCoin
  );
}

export function selectTotalDiamonds(state: CoinWalletState) {
  return (
    state.spendableDiamonds +
    state.nonWithdrawableDiamonds
  );
}

export function selectRealGameEligibleDiamonds(state: CoinWalletState) {
  return state.gameEligibleDiamonds;
}

export function selectCoinQuickStats(state: CoinWalletState) {
  return [
    { id: "available", label: "Available", value: state.availableCoin },
    { id: "frozen", label: "Frozen", value: state.frozenCoin },
    { id: "interest", label: "Interest", value: state.interestEarnedCoin },
  ];
}

export function selectDiamondQuickStats(state: CoinWalletState) {
  return [
    { id: "spendable", label: "Spendable", value: state.spendableDiamonds },
    { id: "withdrawable", label: "Withdrawable", value: state.withdrawableDiamonds },
    { id: "game", label: "Game-Eligible", value: state.gameEligibleDiamonds },
  ];
}

export function selectDiamondWithdrawRuleLabel(state: CoinWalletState) {
  return state.vipStatus === "vip" ? "Every 7 days" : "Once per month";
}

export function selectNextDiamondWithdrawAt(state: CoinWalletState) {
  return getNextDiamondWithdrawDate(state);
}

export function selectCanWithdrawDiamonds(state: CoinWalletState) {
  return canWithdrawDiamondsNow(state);
}

export function selectDiamondRates() {
  return {
    buyRate: getBuyRate(),
    withdrawRate: getDiamondWithdrawRate(),
  };
}

export function selectDepositApr() {
  return getLockedDepositApr();
}

export function selectMonthlyInterestPreview(amountCoin: number) {
  return getMonthlyDepositInterest(amountCoin);
}

export function selectProjectedInterestPreview(
  amountCoin: number,
  termMonths: CoinDepositTermMonths
) {
  return getProjectedDepositInterest(amountCoin, termMonths);
}

export function selectActiveDeposits(state: CoinWalletState) {
  return state.deposits.filter((item) => item.status === "active");
}

export function selectDepositById(state: CoinWalletState, depositId: string) {
  return state.deposits.find((item) => item.id === depositId) ?? null;
}

export function selectCoinHistoryByKinds(
  state: CoinWalletState,
  kinds?: CoinHistoryRecord["kind"][]
) {
  if (!kinds?.length) return state.coinHistory;
  return state.coinHistory.filter((item) => kinds.includes(item.kind));
}

export function selectDiamondHistoryFinancial(state: CoinWalletState) {
  return state.diamondHistory.filter((item) => item.financial);
}

export function selectDiamondHistoryNonFinancial(state: CoinWalletState) {
  return state.diamondHistory.filter((item) => !item.financial);
}

export function selectDepositHistory(state: CoinWalletState) {
  return state.coinHistory.filter((item) =>
    ["deposit_open", "interest_payout", "deposit_matured", "deposit_release"].includes(item.kind)
  );
}

export function formatAmountCoin(value: number) {
  return `${value.toLocaleString()} COIN`;
}

export function formatAmountDiamonds(value: number) {
  return `${value.toLocaleString()} Diamonds`;
}

export function formatShortDate(isoDate: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function formatDateTime(isoDate: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function sortDepositsNewestFirst(deposits: CoinDepositProduct[]) {
  return [...deposits].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function sortDiamondHistoryNewestFirst(records: DiamondHistoryRecord[]) {
  return [...records].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function sortCoinHistoryNewestFirst(records: CoinHistoryRecord[]) {
  return [...records].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
