import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function CoinHistoryScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="history"
      fallbackTitle="Coin History"
      fallbackSubtitle="COIN ledger records must come from the wallet backend/provider ledger."
      bridgeRouteKind="history"
      tone="history"
    />
  );
}
