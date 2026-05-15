import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function CoinEarnScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="earn"
      fallbackTitle="Coin Earn"
      fallbackSubtitle="Locked Coin deposits require backend ledger, freeze/unfreeze controls, maturity schedule and admin risk states before activation."
      bridgeRouteKind="deposit_open"
      tone="earn"
    />
  );
}
