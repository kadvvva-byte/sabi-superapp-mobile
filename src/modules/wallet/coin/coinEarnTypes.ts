export type CoinEarnProductStatus = "active" | "matured" | "released";

export type CreditRiskState = "none" | "low" | "medium" | "high";

export interface FutureLoanFoundation {
  enabled: false;
  reservedForFuture: true;
  creditLimit: number;
  availableCredit: number;
  repaymentSchedulesReady: true;
  creditHistoryReady: true;
  riskState: CreditRiskState;
}
