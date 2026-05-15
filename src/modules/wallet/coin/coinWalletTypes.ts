export type VipStatus = "standard" | "vip";

export type CoinHistoryKind =
  | "topup"
  | "send"
  | "receive"
  | "coin_withdraw"
  | "coin_to_diamond"
  | "diamond_to_coin"
  | "deposit_open"
  | "interest_payout"
  | "deposit_matured"
  | "deposit_release"
  | "refund";

export type DiamondSource =
  | "purchased"
  | "earned_paid"
  | "game_reward_paid"
  | "game_reward_free"
  | "promo"
  | "bonus"
  | "free_non_income";

export type DiamondHistoryKind =
  | "diamond_purchase"
  | "coin_to_diamond"
  | "diamond_to_coin_withdraw"
  | "gift_spend_paid"
  | "gift_receive_paid_income"
  | "gift_receive_free_non_income"
  | "stream_spend"
  | "stream_income_paid"
  | "game_reward_paid"
  | "game_reward_free"
  | "game_spend"
  | "ai_spend"
  | "promo_credit"
  | "refund";

export type RecordStatus = "completed" | "pending" | "processing" | "failed";

export interface CoinHistoryRecord {
  id: string;
  kind: CoinHistoryKind;
  title: string;
  subtitle: string;
  amountCoin: number;
  direction: "in" | "out";
  status: RecordStatus;
  createdAt: string;
  relatedEntityId?: string;
}

export interface DiamondHistoryRecord {
  id: string;
  kind: DiamondHistoryKind;
  title: string;
  subtitle: string;
  diamonds: number;
  status: RecordStatus;
  source: DiamondSource;
  financial: boolean;
  createdAt: string;
  relatedEntityId?: string;
}

export type CoinDepositTermMonths = 6 | 12;
export type CoinDepositStatus = "active" | "matured" | "released";

export interface CoinDepositProduct {
  id: string;
  amountCoin: number;
  apr: number;
  termMonths: CoinDepositTermMonths;
  createdAt: string;
  maturityDate: string;
  status: CoinDepositStatus;
  interestPaidCoin: number;
  nextInterestPayoutDate: string;
}

export interface CreditFoundationState {
  loansEnabled: boolean;
  reservedForFuture: boolean;
  repaymentSchedulesReady: boolean;
  riskStatesReady: boolean;
  creditHistoryReady: boolean;
  creditLimit: number;
  availableCredit: number;
  riskState: "none" | "low" | "medium" | "high";
}

export interface CoinWalletState {
  availableCoin: number;
  frozenCoin: number;
  reservedCoin: number;
  pendingCoin: number;
  interestEarnedCoin: number;

  spendableDiamonds: number;
  withdrawableDiamonds: number;
  gameEligibleDiamonds: number;
  nonWithdrawableDiamonds: number;

  vipStatus: VipStatus;
  lastDiamondWithdrawAt: string | null;

  coinHistory: CoinHistoryRecord[];
  diamondHistory: DiamondHistoryRecord[];
  deposits: CoinDepositProduct[];

  creditFoundation: CreditFoundationState;
}
