import { CoinHistoryRecord, DiamondHistoryRecord } from "./coinWalletTypes";

export const COIN_PAYMENT_KINDS: CoinHistoryRecord["kind"][] = [
  "topup",
  "send",
  "receive",
  "coin_withdraw",
  "refund",
];

export const COIN_SYSTEM_KINDS: CoinHistoryRecord["kind"][] = [
  "coin_to_diamond",
  "diamond_to_coin",
  "deposit_open",
  "interest_payout",
  "deposit_matured",
  "deposit_release",
];

export const DIAMOND_FINANCIAL_KINDS: DiamondHistoryRecord["kind"][] = [
  "diamond_purchase",
  "coin_to_diamond",
  "diamond_to_coin_withdraw",
  "gift_spend_paid",
  "gift_receive_paid_income",
  "stream_spend",
  "stream_income_paid",
  "game_reward_paid",
  "game_spend",
  "ai_spend",
  "refund",
];

export const DIAMOND_NON_FINANCIAL_KINDS: DiamondHistoryRecord["kind"][] = [
  "gift_receive_free_non_income",
  "game_reward_free",
  "promo_credit",
];
