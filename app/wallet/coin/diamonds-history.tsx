import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function DiamondsHistoryScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="diamondsHistory"
      fallbackTitle="Diamond History"
      fallbackSubtitle="Diamond activity must separate financial income from free, promo, won and inventory movement records."
      tone="history"
    />
  );
}
