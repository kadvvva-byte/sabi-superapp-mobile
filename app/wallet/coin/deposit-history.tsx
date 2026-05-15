import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function DepositHistoryScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="depositHistory"
      fallbackTitle="Deposit History"
      fallbackSubtitle="Locked Coin deposit records appear only after backend ledger and maturity schedules are connected."
      bridgeRouteKind="history"
      tone="earn"
    />
  );
}
