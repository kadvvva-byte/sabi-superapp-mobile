import React from "react";

import CoinProviderNoticeScreen from "../../../src/modules/wallet/coin/CoinProviderNoticeScreen";

export default function CoinTopupScreen() {
  return (
    <CoinProviderNoticeScreen
      screenKey="topup"
      fallbackTitle="Top up Coin Wallet"
      fallbackSubtitle="COIN top up requires the real wallet backend, provider route and secure payment confirmation."
      bridgeRouteKind="topup"
      tone="coin"
    />
  );
}
