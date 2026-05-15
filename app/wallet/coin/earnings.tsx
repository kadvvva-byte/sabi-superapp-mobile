import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function CoinEarningsScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="earnings"
      fallbackTitle="Coin Earnings"
      fallbackSubtitle="Coin earnings are displayed only after the backend ledger, income rules and monthly release schedule are connected."
      bridgeRouteKind="history"
      tone="earn"
    />
  );
}
